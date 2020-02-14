import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    // caminho onde as imagens ficam salvas
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),

    // formatar nome da imagem
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extName = filetypes.test(extname(file.originalname).toLowerCase());

    if (!(mimetype && extName)) {
      return cb(
        new Error(
          `Error: File upload only supports the following filetypes - ${filetypes}`
        )
      );
    }
    return cb(null, true);
  },
};
