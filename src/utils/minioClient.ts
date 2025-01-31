// import { Client } from 'minio';
// import env from '../config/env';

// const minioClient = new Client({
//     endPoint: env.minio.endpoint,
//     port: Number(env.minio.port),
//     useSSL: env.minio.use_ssl,
//     accessKey: env.minio.access_key,
//     secretKey: env.minio.secret_key,
// });

// export const bucketName = 'reels';

// (async () => {
//     const exists = await minioClient.bucketExists(bucketName).catch(() => false);
//     if (!exists) {
//         await minioClient.makeBucket(bucketName, 'us-east-1');
//         console.log(`Bucket "${bucketName}" created.`);
//     }
// })();

// export default minioClient;


import { Client } from 'minio';
import env from '../config/env';
import logger from './logger';

const minioClient = new Client({
    endPoint: env.minio.endpoint,
    port: Number(env.minio.port),
    useSSL: env.minio.use_ssl,
    accessKey: env.minio.access_key,
    secretKey: env.minio.secret_key,
});

export const bucketName = 'reels';

(async () => {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            logger.info(`Bucket "${bucketName}" created.`);
        }

        // Define public access policy
        const publicPolicy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: "*",
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${bucketName}/*`]
                }
            ]
        };

        // Apply the policy to the bucket
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(publicPolicy));
        logger.info(`Bucket "${bucketName}" is now public.`);
    } catch (error) {
        logger.error("Error setting up the bucket:", error);
    }
})();

export default minioClient;
