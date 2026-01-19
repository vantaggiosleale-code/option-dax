import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export const filesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserFiles(ctx.user.id);
  }),

  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        fileData: z.string(), // base64 encoded file data
        mimeType: z.string(),
        fileType: z.enum(["report", "screenshot", "document", "other"]),
        strategyId: z.number().optional(),
        portfolioId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Decode base64 file data
      const fileBuffer = Buffer.from(input.fileData, "base64");
      const fileSize = fileBuffer.length;

      // Generate unique file key
      const fileExtension = input.fileName.split(".").pop() || "bin";
      const randomSuffix = nanoid(10);
      const fileKey = `${ctx.user.id}/files/${Date.now()}-${randomSuffix}.${fileExtension}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

      // Save metadata to database
      await db.saveUploadedFile({
        userId: ctx.user.id,
        strategyId: input.strategyId || null,
        portfolioId: input.portfolioId || null,
        fileName: input.fileName,
        fileKey,
        fileUrl: url,
        mimeType: input.mimeType,
        fileSize,
        fileType: input.fileType,
      });

      return {
        success: true,
        url,
        fileKey,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const file = await db.getFileById(input.id);
      if (!file) {
        throw new Error("File not found");
      }
      if (file.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return file;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const file = await db.getFileById(input.id);
      if (!file) {
        throw new Error("File not found");
      }
      if (file.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      
      // Note: We don't delete from S3 here to avoid orphaned references
      // In production, implement a cleanup job for unused files
      await db.deleteFile(input.id);
      
      return { success: true };
    }),
});
