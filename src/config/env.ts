import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

export default {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    bycrypt_salt_rounds: process.env.SALT_ROUND,
    jwt: {
        secret: process.env.JWT_SECRET,
        expires_in: process.env.EXPIRES_IN,
        refresh_secret: process.env.REFRESH_SECRET,
        refresh_expires_in: process.env.REFRESH_EXPIRES_IN,
    },
    minio: {
        endpoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: process.env.MINIO_PORT || 9000,
        use_ssl: process.env.MINIO_USE_SSL === 'true',
        access_key: process.env.MINIO_ACCESS_KEY || "minioadmin",
        secret_key: process.env.MINIO_SECRET_KEY || "minioadmin",
        public_url: process.env.MINIO_PUBLIC_URL
    },
    redis_url: process.env.REDIS_URL || 'redis://localhost:6379'
};
