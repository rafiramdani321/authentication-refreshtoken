import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { cleanTokenLogger } from "../lib/logger/logger";

cron.schedule("*/10 * * * *", async () => {
  try {
    console.log("[CRON] Running cleanup for email verification tokens...");

    const now = new Date();
    const expiredTokens = await prisma.tokenVerification.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    });
    cleanTokenLogger.info({
      event: "expired_token_marked",
      message: `Marked ${expiredTokens.count} token(s) as EXPIRED`,
      timestamp: new Date().toISOString(),
    });

    const cleanupThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30m
    const deleted = await prisma.tokenVerification.deleteMany({
      where: {
        status: { in: ["EXPIRED", "USED"] },
        expiresAt: { lt: cleanupThreshold },
      },
    });
    cleanTokenLogger.info({
      event: "expired_token_deleted",
      message: `Deleted ${deleted.count} expired/used token(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    cleanTokenLogger.error({
      event: "clean_tokens_failed",
      error: error.message || error,
      timestamp: new Date().toISOString(),
    });
    console.log(error);
  }
});
