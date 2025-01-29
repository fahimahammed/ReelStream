import prisma from "../../utils/prismaClient";
import { JwtPayload } from "jsonwebtoken";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const myProfileAnalytics = async (authUser: JwtPayload, query: Record<string, unknown>): Promise<any> => {
    const { startDate, endDate } = query;
    const id = authUser.id;

    const whereCondition = {
        uploadedBy: id,
        createdAt: {
            gte: startDate ? new Date(startDate as string) : undefined,
            lte: endDate ? new Date(endDate as string) : undefined,
        },
    };

    const [videoStats, likeStats] = await Promise.all([
        prisma.video.aggregate({
            where: whereCondition,
            _sum: { viewCount: true },
            _count: { _all: true },
        }),
        prisma.engagement.count({
            where: { video: whereCondition },
        }),
    ]);

    return {
        totalViews: videoStats._sum.viewCount || 0,
        totalLikes: likeStats || 0,
        totalUploads: videoStats._count._all || 0,
    };
};

export const AnalyticsService = {
    myProfileAnalytics
};

