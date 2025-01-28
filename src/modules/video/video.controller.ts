import { NextFunction, Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { VideoService } from './video.service';

const insertIntoDB = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        if (!file) throw new Error("File is required!");
        const result = await VideoService.insertIntoDB(file);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Video uploaded successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const VideoController = {
    insertIntoDB
};