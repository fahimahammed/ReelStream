import { Client } from 'minio';
import env from '../config/env';

const minioClient = new Client({
    endPoint: env.minio.endpoint,
    port: Number(env.minio.port),
    useSSL: env.minio.use_ssl,
    accessKey: env.minio.access_key,
    secretKey: env.minio.secret_key,
});

export const bucketName = 'reels';

(async () => {
    const exists = await minioClient.bucketExists(bucketName).catch(() => false);
    if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1');
        console.log(`Bucket "${bucketName}" created.`);
    }
})();

export default minioClient;
