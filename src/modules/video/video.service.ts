import { Video } from "@prisma/client";
import minioClient, { bucketName } from "../../utils/minioClient";
import prisma from "../../utils/prismaClient";
import { File, IVideoPayload } from "./video.interface";
import { compressVideo } from "./video.utils";
import { JwtPayload } from "jsonwebtoken";
import redis from "../../utils/redisClient";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";


const uploadVideo = async (file: File, data: IVideoPayload, authUser: JwtPayload): Promise<Video> => {
    const { title, description } = data;

    const timestamp = Date.now();

    // const originalVideoFileName = `videos/${timestamp}_${file.originalname}`;
    const compressedVideoFileName = `videos/${timestamp}_${file.originalname}`;
    const thumbnailFileName = `thumbnails/${timestamp}_thumbnail.png`;

    try {
        const compressedBuffer = await compressVideo(file.buffer);
        await minioClient.putObject(bucketName, compressedVideoFileName, compressedBuffer);
        console.log("video uploaded")

        // const thumbnailBuffer = await generateVideoThumbnail(compressedBuffer);
        // await minioClient.putObject(bucketName, thumbnailFileName, thumbnailBuffer);
        // console.log("thumbnail uploaded")

        const videoPublicUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${compressedVideoFileName}`;
        const thumbnailUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${thumbnailFileName}`;

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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        await minioClient.removeObject(bucketName, compressedVideoFileName);
        await minioClient.removeObject(bucketName, thumbnailFileName);

        throw new ApiError(StatusCodes.FAILED_DEPENDENCY, `Error uploading video and thumbnail.`);
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

    const meta = {
        page,
        limit,
        total: await prisma.video.count()
    }

    const result = {
        meta,
        data: videos
    }

    await redis.setex(cacheKey, 300, JSON.stringify(result));

    return result;
};


const getVideoById = async (id: string, userIp: string) => {
    const cacheKey = `video:${id}`;
    const viewKey = `video_view:${id}:${userIp}`;

    const cachedVideo = await redis.get(cacheKey);
    let result;

    if (cachedVideo) {
        result = JSON.parse(cachedVideo);
    }
    else {
        const video = await prisma.video.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            }
        });

        const prevVideoId = await prisma.video.findFirst({
            where: {
                id: {
                    lt: id,
                }
            },
            select: {
                id: true
            },
            orderBy: {
                id: 'desc',
            }
        });

        const nextVideoId = await prisma.video.findFirst({
            where: {
                id: {
                    gt: id,
                }
            },
            select: {
                id: true
            },
            orderBy: {
                id: 'asc',
            }
        });

        result = {
            prev: prevVideoId,
            next: nextVideoId,
            video
        }
    }

    if (!result) {
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
        await redis.setex(cacheKey, 180, JSON.stringify(result));
    }

    return result;
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

