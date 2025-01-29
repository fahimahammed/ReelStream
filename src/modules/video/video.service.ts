import { Video } from "@prisma/client";
import minioClient, { bucketName } from "../../utils/minioClient";
import prisma from "../../utils/prismaClient";
import { File, IVideoPayload } from "./video.interface";
import { generateVideoThumbnail } from "./video.utils";
import { JwtPayload } from "jsonwebtoken";


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

export const VideoService = {
    uploadVideo,
};

