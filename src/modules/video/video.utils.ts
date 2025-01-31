import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import ffmpegPath from 'ffmpeg-static';
import { promisify } from 'util';
import { tmpdir } from 'os';

const unlinkAsync = promisify(fs.unlink);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

if (!ffmpegPath) {
    throw new Error('FFmpeg binary not found. Please ensure ffmpeg-static is installed correctly.');
}

ffmpeg.setFfmpegPath(ffmpegPath);

export const generateVideoThumbnail = (videoBuffer: Buffer): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const tempVideoPath = path.join(__dirname, 'temp_video.mp4');
        const tempThumbnailPath = path.join(__dirname, 'temp_thumbnail.png');

        fs.writeFileSync(tempVideoPath, videoBuffer);

        // Generate the thumbnail using ffmpeg
        ffmpeg(tempVideoPath)
            .screenshots({
                count: 1,
                folder: __dirname,
                filename: 'temp_thumbnail.png',
                size: '1080x1920',
            })
            .on('end', () => {
                const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);

                // Clean up temporary files
                fs.unlinkSync(tempVideoPath);
                fs.unlinkSync(tempThumbnailPath);

                resolve(thumbnailBuffer);
            })
            .on('error', (err) => {
                fs.unlinkSync(tempVideoPath);
                reject(new Error('Error generating thumbnail: ' + err.message));
            });
    });
};

export const compressVideo = async (
    videoBuffer: Buffer,
    progressUpdate: (chunkSize: number) => void
): Promise<Buffer> => {

    const tempInputPath = path.join(tmpdir(), `input_${Date.now()}.mp4`);
    const tempOutputPath = path.join(tmpdir(), `output_${Date.now()}.mp4`);

    try {
        await writeFileAsync(tempInputPath, videoBuffer);

        await new Promise<void>((resolve, reject) => {
            ffmpeg(tempInputPath)
                .outputOptions([
                    '-preset fast',  // ⚡ Faster encoding
                    '-crf 28',       // 🎯 Balance between quality & compression
                    '-b:v 1M',       // 📉 Bitrate control for smaller size
                    '-movflags +faststart' // 📲 Helps for streaming
                ])
                .output(tempOutputPath)
                .on('progress', (progress) => {
                    progressUpdate(progress.targetSize)
                })
                .on('end', () => resolve())
                .on('error', reject)
                .run();
        });

        const compressedBuffer = await readFileAsync(tempOutputPath);

        // Cleanup temporary files
        await unlinkAsync(tempInputPath);
        await unlinkAsync(tempOutputPath);

        return compressedBuffer;
    } catch (error) {
        await unlinkAsync(tempInputPath).catch(() => { });
        throw new Error('Error compressing video: ' + error);
    }
};

// import ffmpeg from 'fluent-ffmpeg';
// import path from 'path';
// import fs from 'fs';
// import ffmpegPath from 'ffmpeg-static';
// import ffprobePath from 'ffprobe-static';
// import ffprobeStatic from 'ffprobe-static';
// import { promisify } from 'util';
// import { tmpdir } from 'os';

// // Promisify file operations
// const unlinkAsync = promisify(fs.unlink);
// const readFileAsync = promisify(fs.readFile);
// const writeFileAsync = promisify(fs.writeFile);

// // Check if the paths are available
// if (!ffmpegPath || !ffprobePath) {
//     throw new Error('FFmpeg or FFprobe binary not found. Please ensure ffmpeg-static and ffprobe-static are installed correctly.');
// }

// // Set the path for ffmpeg and ffprobe
// ffmpeg.setFfmpegPath(ffmpegPath);
// ffmpeg.setFfprobePath(ffprobePath.path); // Explicitly set the path to ffprobe

// // Function to generate video thumbnail
// // export const generateVideoThumbnail = (videoBuffer: Buffer): Promise<Buffer> => {
// //     return new Promise((resolve, reject) => {
// //         const tempVideoPath = path.join(__dirname, 'temp_video.mp4');
// //         const tempThumbnailPath = path.join(__dirname, 'temp_thumbnail.png');

// //         fs.writeFileSync(tempVideoPath, videoBuffer);

// //         // Generate the thumbnail using ffmpeg
// //         ffmpeg(tempVideoPath)
// //             .screenshots({
// //                 count: 1,
// //                 folder: __dirname,
// //                 filename: 'temp_thumbnail.png',
// //                 size: '1080x1920',
// //             })
// //             .on('end', () => {
// //                 const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);

// //                 // Clean up temporary files
// //                 fs.unlinkSync(tempVideoPath);
// //                 fs.unlinkSync(tempThumbnailPath);

// //                 resolve(thumbnailBuffer);
// //             })
// //             .on('error', (err) => {
// //                 console.log(err, "1")
// //                 fs.unlinkSync(tempVideoPath);
// //                 reject(new Error('Error generating thumbnail: ' + err.message));
// //             });
// //     });
// // };

// export const generateVideoThumbnail = (videoBuffer: Buffer): Promise<Buffer> => {
//     return new Promise((resolve, reject) => {
//         const tempVideoPath = path.join(__dirname, 'temp_video.mp4');
//         const tempThumbnailPath = path.join(__dirname, 'temp_thumbnail.png');

//         fs.writeFileSync(tempVideoPath, videoBuffer);

//         // Manually set ffmpeg and ffprobe paths
//         ffmpeg.setFfmpegPath(ffprobeStatic.path);
//         ffmpeg.setFfprobePath(ffprobeStatic.path);

//         // Generate the thumbnail using ffmpeg
//         ffmpeg(tempVideoPath)
//             .screenshots({
//                 count: 1,
//                 folder: __dirname,
//                 filename: 'temp_thumbnail.png',
//                 size: '1080x1920',
//             })
//             .on('end', () => {
//                 const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);

//                 // Clean up temporary files
//                 fs.unlinkSync(tempVideoPath);
//                 fs.unlinkSync(tempThumbnailPath);

//                 resolve(thumbnailBuffer);
//             })
//             .on('error', (err) => {
//                 console.log(err, "1")
//                 fs.unlinkSync(tempVideoPath);
//                 reject(new Error('Error generating thumbnail: ' + err.message));
//             });
//     });
// };

// // Function to compress video
// export const compressVideo = async (videoBuffer: Buffer): Promise<Buffer> => {
//     const tempInputPath = path.join(tmpdir(), `input_${Date.now()}.mp4`);
//     const tempOutputPath = path.join(tmpdir(), `output_${Date.now()}.mp4`);

//     try {
//         await writeFileAsync(tempInputPath, videoBuffer);

//         await new Promise<void>((resolve, reject) => {
//             ffmpeg(tempInputPath)
//                 .outputOptions([
//                     '-preset fast',  // ⚡ Faster encoding
//                     '-crf 28',       // 🎯 Balance between quality & compression
//                     '-b:v 1M',       // 📉 Bitrate control for smaller size
//                     '-movflags +faststart' // 📲 Helps for streaming
//                 ])
//                 .output(tempOutputPath)
//                 .on('end', () => resolve())
//                 .on('error', reject)
//                 .run();
//         });

//         const compressedBuffer = await readFileAsync(tempOutputPath);

//         // Cleanup temporary files
//         await unlinkAsync(tempInputPath);
//         await unlinkAsync(tempOutputPath);

//         return compressedBuffer;
//     } catch (error) {
//         console.log(error)
//         await unlinkAsync(tempInputPath).catch(() => { });
//         throw new Error('Error compressing video: ' + error);
//     }
// };
