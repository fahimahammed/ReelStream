import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { VideoService } from './video.service';
import catchAsync from '../../utils/catchAsync';
import { getSocketInstance } from '../../config/socket';
import { StatusCodes } from 'http-status-codes';
import { Video } from '@prisma/client';

const uploadVideo = catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw new Error("File is required!");

    const io = getSocketInstance();

    const result = await VideoService.uploadVideo(file, req.body, req.user, io);
    sendResponse<Video>(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Video uploaded successfully',
        data: result
    })
});

const getAllVideos = catchAsync(async (req: Request, res: Response) => {

    const result = await VideoService.getAllVideos(req.query);
    sendResponse<Video>(res, {
        statusCode: 200,
        success: true,
        message: 'Video retrived successfully',
        meta: result.meta,
        data: result.data
    })
});

const getVideoById = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;
    const ip = req.ip;

    const result = await VideoService.getVideoById(id, ip as string, req.user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Video retrived successfully',
        data: result
    })
});

const likeVideo = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await VideoService.likeVideo(id, req.user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result
    })
});

export const VideoController = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    likeVideo
};