import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { notifyOwner } from "../_core/notification";
import { riskAlerts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const alertsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserAlerts(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number().optional(),
        strategyId: z.number().optional(),
        alertType: z.string().min(1).max(100),
        severity: z.enum(["info", "warning", "critical"]),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Create alert in database
      await db.createRiskAlert({
        userId: ctx.user.id,
        portfolioId: input.portfolioId || null,
        strategyId: input.strategyId || null,
        alertType: input.alertType,
        severity: input.severity,
        message: input.message,
        isRead: 0,
        notifiedOwner: 0,
      });

      // If critical, notify owner immediately
      if (input.severity === "critical") {
        const notificationSent = await notifyOwner({
          title: `🚨 Critical Risk Alert - ${input.alertType}`,
          content: `User: ${ctx.user.name || ctx.user.email}\n\n${input.message}`,
        });

        if (notificationSent) {
          // Mark as notified in database
          const alerts = await db.getUserAlerts(ctx.user.id);
          const latestAlert = alerts[alerts.length - 1];
          if (latestAlert) {
            const dbInstance = await db.getDb();
            if (dbInstance) {
              await dbInstance
                .update(riskAlerts)
                .set({ notifiedOwner: 1 })
                .where(eq(riskAlerts.id, latestAlert.id));
            }
          }
        }
      }

      return { success: true };
    }),

  markAsRead: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const alerts = await db.getUserAlerts(ctx.user.id);
      const alert = alerts.find((a) => a.id === input.alertId);
      
      if (!alert) {
        throw new Error("Alert not found");
      }
      
      await db.markAlertAsRead(input.alertId);
      return { success: true };
    }),

  checkRiskThresholds: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        currentValue: z.number(),
        riskThreshold: z.number(), // percentage loss threshold
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

      const initialValue = parseFloat(portfolio.totalValue || "0");
      const lossPercentage = ((initialValue - input.currentValue) / initialValue) * 100;

      if (lossPercentage >= input.riskThreshold) {
        const severity: "info" | "warning" | "critical" =
          lossPercentage >= input.riskThreshold * 2 ? "critical" : "warning";

        await db.createRiskAlert({
          userId: ctx.user.id,
          portfolioId: input.portfolioId,
          strategyId: null,
          alertType: "risk_threshold",
          severity,
          message: `Portfolio "${portfolio.name}" has lost ${lossPercentage.toFixed(2)}% of its value. Current: ${input.currentValue}, Initial: ${initialValue}`,
          isRead: 0,
          notifiedOwner: severity === "critical" ? 0 : 1,
        });

        if (severity === "critical") {
          await notifyOwner({
            title: `🚨 Critical Portfolio Loss Alert`,
            content: `Portfolio "${portfolio.name}" (User: ${ctx.user.name || ctx.user.email}) has lost ${lossPercentage.toFixed(2)}% of its value.\n\nCurrent Value: ${input.currentValue}\nInitial Value: ${initialValue}`,
          });
        }

        return {
          thresholdExceeded: true,
          lossPercentage,
          severity,
        };
      }

      return {
        thresholdExceeded: false,
        lossPercentage,
      };
    }),
});
