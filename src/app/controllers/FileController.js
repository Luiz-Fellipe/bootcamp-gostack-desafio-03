import File from '../models/File';

class FileController {
  async store(req, res) {
    const { filename: path, originalname: name } = req.file;

    const newFile = await File.create({
      path,
      name,
    });

    return res.json(newFile);
  }
}

export default new FileController();
