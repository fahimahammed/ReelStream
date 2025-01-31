import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const prisma = new PrismaClient({
    log: [
        {
            level: 'query', // Logs the SQL query being executed
            emit: 'event',  // Emits events to be captured by listeners
        },
        {
            level: 'info',  // Logs informational messages
            emit: 'event',
        },
        {
            level: 'warn',  // Logs warnings
            emit: 'event',
        },
        {
            level: 'error', // Logs errors
            emit: 'event',
        },
    ],
});


prisma.$on('query', (event) => {
    console.log({ event })
    logger.debug({
        query: event.query,
        parameters: event.params,
        duration: event.duration.toFixed(2),
    });
});

prisma.$on('info', (event) => {
    logger.info(event.message);
});

prisma.$on('warn', (event) => {
    logger.warn(event.message);
});

prisma.$on('error', (event) => {
    logger.error(event.message);
});

export default prisma;
