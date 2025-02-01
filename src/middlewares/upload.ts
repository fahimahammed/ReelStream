import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

const maxSize = 50 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (fileExt !== '.mp4') {
        return cb(new Error('Only .mp4 files are allowed!'));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize },
});

export default upload;
