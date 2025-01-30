import { Server } from 'http';
import { PrismaClient } from '@prisma/client';
import app from './app';
import env from './config/env';
import logger from './utils/logger';
import redisClient from './utils/redisClient';
import minioClient from './utils/minioClient';

const prisma = new PrismaClient();
let server: Server | null = null;

async function connectToDatabase() {
    try {
        await prisma.$connect();
        logger.info('🛢 Database connected successfully');
    } catch (err) {
        logger.error('❌ Failed to connect to the database:', err);
        process.exit(1);
    }
}

async function checkRedisConnection() {
    try {
        await redisClient.ping();
        logger.info('✅ Redis connected successfully');
    } catch (err) {
        logger.error('❌ Failed to connect to Redis:', err);
        process.exit(1);
    }
}

async function checkMinioConnection() {
    try {
        await minioClient.listBuckets();
        logger.info('✅ MinIO connected successfully');
    } catch (err) {
        logger.error('❌ Failed to connect to MinIO:', err);
        process.exit(1);
    }
}


function gracefulShutdown(signal: string) {
    logger.info(`🔄 Received ${signal}. Shutting down gracefully...`);

    if (server) {
        server.close(async () => {
            logger.info('✅ HTTP server closed.');

            await prisma.$disconnect();
            logger.info('✅ Database connection closed.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}


async function bootstrap() {
    try {
        // Connect to the database
        await connectToDatabase();

        // Check Redis connection
        await checkRedisConnection();

        // Check MinIO connection
        await checkMinioConnection();

        // Start the server
        server = app.listen(env.port, () => {
            logger.info(`Server is running on port ${env.port}`);
        });

        // Handle termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('❌ Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason) => {
            logger.error('❌ Unhandled Rejection:', reason);
            gracefulShutdown('unhandledRejection');
        });
    } catch (error) {
        logger.error('❌ Error during application bootstrap:', error);
        process.exit(1);
    }
}

// Start the application
bootstrap();
