import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { VideoService } from './video.service';
import catchAsync from '../../utils/catchAsync';

const uploadVideo = catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw new Error("File is required!");

    console.log("user: ", req.user);

    const result = await VideoService.uploadVideo(file, req.body, req.user);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Video uploaded successfully',
        data: result
    })
});

const getAllVideos = catchAsync(async (req: Request, res: Response) => {

    const result = await VideoService.getAllVideos(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Video retrived successfully',
        data: result
    })
});

export const VideoController = {
    uploadVideo,
    getAllVideos
};