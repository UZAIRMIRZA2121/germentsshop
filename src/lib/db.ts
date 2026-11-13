import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

// On Vercel and serverless AWS Lambda platforms, the root application directory is read-only.
// We copy the seeded SQLite database to /tmp so that write operations (register, new orders, etc.)
// succeed without throwing EROFS (Read-only file system).
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    const tmpDbPath = "/tmp/dev.db";
    const candidatePaths = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(process.cwd(), ".next", "server", "prisma", "dev.db"),
    ];

    let sourcePath = "";
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        sourcePath = p;
        break;
      }
    }

    if (!fs.existsSync(tmpDbPath) && sourcePath) {
      fs.copyFileSync(sourcePath, tmpDbPath);
      console.log(`[Vercel DB] Successfully copied SQLite database to ${tmpDbPath}`);
    }

    // Only redirect if using standard SQLite file path
    const currentUrl = process.env.DATABASE_URL || "file:./dev.db";
    if (currentUrl.startsWith("file:") && !currentUrl.includes("/tmp/")) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    }
  } catch (err) {
    console.warn("[Vercel DB] SQLite init warning:", err);
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
