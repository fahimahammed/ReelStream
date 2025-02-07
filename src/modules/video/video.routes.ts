import express from 'express';
import { VideoController } from './video.controller';
import upload from '../../middlewares/upload';
import { parseBody } from '../../middlewares/parseBody';
import { auth } from '../../middlewares/auth';
import { authOptional } from '../../middlewares/authOptional';

const router = express.Router();

router.get("/", VideoController.getAllVideos);
router.get(
    "/:id",
    authOptional,
    VideoController.getVideoById
);


router.post(
    '/upload',
    auth,
    upload.single('video'),
    parseBody,
    VideoController.uploadVideo
);

router.post(
    "/:id",
    auth,
    VideoController.likeVideo
);


export const videoRoutes = router;