import Sequelize, { Model } from 'sequelize';
import fs from 'fs';
import { resolve } from 'path';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      }
    );
    // deleta o arquivo da pasta, antes de excluir do banco
    this.addHook('beforeDestroy', file => {
      const { path } = file.dataValues;
      fs.unlinkSync(
        resolve(__dirname, '..', '..', '..', 'tmp', 'uploads', path)
      );
    });
    return this;
  }
}

export default File;
