/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "../../utils/prismaClient";
import { JwtPayload } from "jsonwebtoken";
import redis from "../../utils/redisClient";

// Arrow function for myProfileAnalytics
const myProfileAnalytics = async (authUser: JwtPayload, query: Record<string, unknown>): Promise<any> => {
    const { startDate, endDate } = query;
    const id = authUser.id;

    const cacheKey = `${id}-${startDate}-${endDate}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const whereCondition = {
        uploadedBy: id,
        createdAt: {
            gte: startDate ? new Date(startDate as string) : undefined,
            lte: endDate ? new Date(endDate as string) : undefined,
        },
    };

    // Fetching video stats and like stats
    const [videoStats, likeStats, viewsOverTime, likesOverTime, topVideos] = await Promise.all([
        prisma.video.aggregate({
            where: whereCondition,
            _sum: { viewCount: true },
            _count: { _all: true },
        }),
        prisma.engagement.count({
            where: { video: whereCondition },
        }),
        // Daily views count breakdown
        prisma.video.findMany({
            where: whereCondition,
            select: {
                createdAt: true,
                viewCount: true,
            },
        }),
        // Daily likes count breakdown
        prisma.engagement.findMany({
            where: { video: whereCondition },
            select: {
                createdAt: true,
            },
        }),
        // Top 5 videos by views or likes
        prisma.video.findMany({
            where: whereCondition,
            orderBy: {
                viewCount: 'desc',
            },
            take: 5,
            select: {
                title: true,
                viewCount: true,
                likeCount: true,
            },
        }),
    ]);

    // Aggregating views and likes over time (daily)
    const viewsPerDay = aggregateDataOverTime(viewsOverTime, 'viewCount');
    const likesPerDay = aggregateDataOverTime(likesOverTime, 'createdAt');

    const result = {
        totalViews: videoStats._sum.viewCount || 0,
        totalLikes: likeStats || 0,
        totalUploads: videoStats._count._all || 0,
        viewsOverTime: viewsPerDay,
        likesOverTime: likesPerDay,
        topVideos: topVideos,
        engagementRate: videoStats._sum.viewCount ? (likeStats / videoStats._sum.viewCount) * 100 : 0, // Likes per view ratio
    };

    await redis.setex(cacheKey, 60, JSON.stringify(result));

    return result;
};

// Arrow function for aggregateDataOverTime
const aggregateDataOverTime = (data: any[], key: string) => {
    const aggregatedData: Record<string, number> = {};
    data.forEach((item) => {
        const date = item.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!aggregatedData[date]) {
            aggregatedData[date] = 0;
        }

        // For likes, we increment by 1 for each like occurrence
        aggregatedData[date] += key === 'createdAt' ? 1 : item[key];
    });

    return Object.keys(aggregatedData).map(date => ({
        date,
        count: aggregatedData[date],
    }));
};


export const AnalyticsService = {
    myProfileAnalytics,
};
