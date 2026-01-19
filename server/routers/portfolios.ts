import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const portfoliosRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserPortfolios(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const portfolio = await db.getPortfolioById(input.id);
      if (!portfolio) {
        throw new Error("Portfolio not found");
      }
      if (portfolio.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return portfolio;
    }),

  getStrategies: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const portfolio = await db.getPortfolioById(input.portfolioId);
      if (!portfolio) {
        throw new Error("Portfolio not found");
      }
      if (portfolio.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return await db.getPortfolioStrategies(input.portfolioId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        totalValue: z.string().optional(),
        riskLevel: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.createPortfolio({
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
        totalValue: z.string().optional(),
        riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const portfolio = await db.getPortfolioById(id);
      if (!portfolio) {
        throw new Error("Portfolio not found");
      }
      if (portfolio.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      await db.updatePortfolio(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const portfolio = await db.getPortfolioById(input.id);
      if (!portfolio) {
        throw new Error("Portfolio not found");
      }
      if (portfolio.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      await db.deletePortfolio(input.id);
      return { success: true };
    }),

  addStrategy: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        strategyId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const portfolio = await db.getPortfolioById(input.portfolioId);
      if (!portfolio) {
        throw new Error("Portfolio not found");
      }
      if (portfolio.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      const strategy = await db.getStrategyById(input.strategyId);
      if (!strategy) {
        throw new Error("Strategy not found");
      }
      if (strategy.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      await db.addStrategyToPortfolio(input.portfolioId, input.strategyId);
      return { success: true };
    }),

  removeStrategy: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        strategyId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const portfolio = await db.getPortfolioById(input.portfolioId);
      if (!portfolio) {
        throw new Error("Portfolio not found");
      }
      if (portfolio.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      await db.removeStrategyFromPortfolio(input.portfolioId, input.strategyId);
      return { success: true };
    }),
});
