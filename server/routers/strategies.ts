import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const strategiesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserStrategies(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const strategy = await db.getStrategyById(input.id);
      if (!strategy) {
        throw new Error("Strategy not found");
      }
      if (strategy.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return strategy;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        strategyType: z.string().min(1).max(100),
        underlyingAsset: z.string().default("DAX"),
        strikePrice: z.string().optional(),
        expirationDate: z.date().optional(),
        premium: z.string().optional(),
        quantity: z.number().int().positive().default(1),
        status: z.enum(["active", "closed", "expired"]).default("active"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.createStrategy({
        ...input,
        userId: ctx.user.id,
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        strategyType: z.string().min(1).max(100).optional(),
        underlyingAsset: z.string().optional(),
        strikePrice: z.string().optional(),
        expirationDate: z.date().optional(),
        premium: z.string().optional(),
        quantity: z.number().int().positive().optional(),
        status: z.enum(["active", "closed", "expired"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const strategy = await db.getStrategyById(id);
      if (!strategy) {
        throw new Error("Strategy not found");
      }
      if (strategy.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      await db.updateStrategy(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const strategy = await db.getStrategyById(input.id);
      if (!strategy) {
        throw new Error("Strategy not found");
      }
      if (strategy.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      await db.deleteStrategy(input.id);
      return { success: true };
    }),
});
