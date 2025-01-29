import { Video } from "@prisma/client";
import minioClient, { bucketName } from "../../utils/minioClient";
import prisma from "../../utils/prismaClient";
import { File, IVideoPayload } from "./video.interface";
import { generateVideoThumbnail } from "./video.utils";
import { JwtPayload } from "jsonwebtoken";
import redis from "../../utils/redisClient";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";


const uploadVideo = async (file: File, data: IVideoPayload, authUser: JwtPayload): Promise<Video> => {
    const { title, description } = data;

    const videoFileName = `videos/${Date.now()}_${file.originalname}`;
    const thumbnailFileName = `thumbnails/${Date.now()}_thumbnail.png`;

    try {
        const uploadedData = await minioClient.putObject(bucketName, videoFileName, file.buffer);
        console.log("Video uploaded successfully:", uploadedData);

        const thumbnailBuffer = await generateVideoThumbnail(file.buffer);
        console.log("Thumbnail generated successfully");

        await minioClient.putObject(bucketName, thumbnailFileName, thumbnailBuffer);
        console.log("Thumbnail uploaded successfully");

        const videoPublicUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${videoFileName}`;
        const thumbnailUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${thumbnailFileName}`;
        console.log("Video public URL:", videoPublicUrl);

        const result = await prisma.video.create({
            data: {
                title,
                description,
                url: videoPublicUrl,
                thumbnailUrl,
                uploadedBy: authUser.id
            }
        });

        return result;

    } catch (error) {
        console.error("Error uploading video and thumbnail:", error);
        throw new Error("Error uploading video and thumbnail");
    }
};

const getAllVideos = async (query: Record<string, unknown>) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `videos:page-${page}:limit-${limit}`;
    const cachedVideos = await redis.get(cacheKey);

    if (cachedVideos) {
        return JSON.parse(cachedVideos);
    }

    const videos = await prisma.video.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
    });

    await redis.setex(cacheKey, 60, JSON.stringify(videos));

    return videos;
};


const getVideoById = async (id: string, userIp: string) => {
    const cacheKey = `video:${id}`;
    const viewKey = `video_view:${id}:${userIp}`;

    const cachedVideo = await redis.get(cacheKey);

    const video = cachedVideo ? JSON.parse(cachedVideo) : await prisma.video.findUnique({ where: { id } });

    if (!video) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Video not found!");
    }

    const hasViewed = await redis.get(viewKey);
    if (!hasViewed) {
        await prisma.video.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
        await redis.setex(viewKey, 60, "1");
    }

    if (!cachedVideo) {
        await redis.setex(cacheKey, 60, JSON.stringify(video));
    }

    return video;
};



export const VideoService = {
    uploadVideo,
    getAllVideos,
    getVideoById
};

