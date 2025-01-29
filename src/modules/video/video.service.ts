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
        include: {
            user: {
                select: {
                    name: true
                }
            }
        }
    });

    await redis.setex(cacheKey, 300, JSON.stringify(videos));

    return videos;
};


const getVideoById = async (id: string, userIp: string) => {
    const cacheKey = `video:${id}`;
    const viewKey = `video_view:${id}:${userIp}`;

    const cachedVideo = await redis.get(cacheKey);

    const video = cachedVideo ? JSON.parse(cachedVideo) : await prisma.video.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    name: true
                }
            }
        }
    });

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
        await redis.setex(cacheKey, 180, JSON.stringify(video));
    }

    return video;
};


const likeVideo = async (videoId: string, authUser: JwtPayload) => {
    const cacheKey = `video:${videoId}`;
    const likeKey = `video_like:${videoId}:${authUser.id}`;

    let video: Video | null = null;

    const cachedVideo = await redis.get(cacheKey);
    if (cachedVideo) {
        video = JSON.parse(cachedVideo);
    }
    else {
        video = await prisma.video.findUnique({
            where: { id: videoId },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            }
        });
        if (!video) throw new ApiError(StatusCodes.NOT_FOUND, "Video not found!");
        await redis.setex(cacheKey, 180, JSON.stringify(video));
    }

    const hasLiked =
        (await redis.exists(likeKey)) ||
        !!(await prisma.engagement.findUnique({
            where: {
                videoId_userId: {
                    videoId,
                    userId: authUser.id
                }
            }
        }));

    return prisma.$transaction(async (tx) => {
        if (hasLiked) {
            await tx.engagement.delete({
                where: { videoId_userId: { videoId, userId: authUser.id } },
            });

            const updatedVideo = await tx.video.update({
                where: { id: videoId },
                data: { likeCount: { decrement: 1 } },
                select: { likeCount: true },
            });

            await redis.del(likeKey);
            await redis.setex(cacheKey, 180, JSON.stringify({ ...video, likeCount: updatedVideo.likeCount }));

            return { message: "Video unliked successfully", videoId, likeCount: updatedVideo.likeCount };
        } else {
            await tx.engagement.create({
                data: { videoId, userId: authUser.id },
            });

            const updatedVideo = await tx.video.update({
                where: { id: videoId },
                data: { likeCount: { increment: 1 } },
                select: { likeCount: true },
            });

            await redis.setex(likeKey, 60, "1");
            await redis.setex(cacheKey, 300, JSON.stringify({ ...video, likeCount: updatedVideo.likeCount }));

            return { message: "Video liked successfully", videoId, likeCount: updatedVideo.likeCount };
        }
    });
};


export const VideoService = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    likeVideo
};

