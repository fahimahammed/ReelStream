import express from 'express';
import { VideoController } from './video.controller';
import upload from '../../middlewares/upload';
import { parseBody } from '../../middlewares/parseBody';
import { auth } from '../../middlewares/auth';

const router = express.Router();

router.get("/", VideoController.getAllVideos);
router.get("/:id", VideoController.getVideoById);

router.post(
    '/',
    auth,
    upload.single('video'),
    parseBody,
    VideoController.uploadVideo
);


export const videoRoutes = router;