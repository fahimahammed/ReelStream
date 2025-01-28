import express from 'express';
import { VideoController } from './video.controller';
import upload from '../../middlewares/upload';

const router = express.Router();

router.post(
    '/',
    upload.single('video'),
    VideoController.insertIntoDB
);


export const videoRoutes = router;