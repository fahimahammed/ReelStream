// import minioClient, { bucketName } from "../../utils/minioClient";
// import { generateVideoThumbnail } from "./video.utils";

// // Define the type for the file parameter to ensure better type safety
// interface File {
//     originalname: string;
//     buffer: Buffer;
//     mimetype: string;
// }

// const insertIntoDB = async (file: File): Promise<void> => {
//     // Set unique file names for the video and thumbnail
//     const videoFileName = `videos/${Date.now()}_${file.originalname}`;
//     const thumbnailFileName = `thumbnails/${Date.now()}_thumbnail.png`;

//     console.log({ file, videoFileName, thumbnailFileName });
//     try {
//         // Upload the video file to Minio
//         const uploadeddata = await minioClient.putObject(bucketName, videoFileName, file.buffer);

//         // Generate and upload the thumbnail
//         const thumbnailBuffer = await generateVideoThumbnail(file.buffer);
//         console.log({ thumbnailBuffer })
//         //await minioClient.putObject(bucketName, thumbnailFileName, thumbnailBuffer);

//         // Construct the public URL for the video
//         const videoPublicUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${videoFileName}`;

//         console.log('Video and thumbnail uploaded successfully', videoPublicUrl);
//         console.log({ uploadeddata })
//     } catch (error) {
//         console.error('Error uploading video and thumbnail:', error);
//         throw new Error('Error uploading video and thumbnail');
//     }
// };

// export const VideoService = {
//     insertIntoDB,
// };

import minioClient, { bucketName } from "../../utils/minioClient";
import { generateVideoThumbnail } from "./video.utils";

// Define the type for the file parameter to ensure better type safety
interface File {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
}

const insertIntoDB = async (file: File): Promise<void> => {
    // Set unique file names for the video and thumbnail
    const videoFileName = `videos/${Date.now()}_${file.originalname}`;
    const thumbnailFileName = `thumbnails/${Date.now()}_thumbnail.png`;

    console.log({ file, videoFileName, thumbnailFileName });
    try {
        // Upload the video file to Minio
        const uploadedData = await minioClient.putObject(bucketName, videoFileName, file.buffer);
        console.log("Video uploaded successfully:", uploadedData);

        // Generate the thumbnail buffer
        const thumbnailBuffer = await generateVideoThumbnail(file.buffer);
        console.log("Thumbnail generated successfully");

        // Upload the thumbnail to Minio
        await minioClient.putObject(bucketName, thumbnailFileName, thumbnailBuffer);
        console.log("Thumbnail uploaded successfully");

        // Construct the public URL for the video
        const videoPublicUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${videoFileName}`;
        console.log("Video public URL:", videoPublicUrl);

        // Optionally, you can return or save these URLs to a database for further use
    } catch (error) {
        console.error("Error uploading video and thumbnail:", error);
        throw new Error("Error uploading video and thumbnail");
    }
};

export const VideoService = {
    insertIntoDB,
};

