import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("analysis router - Black-Scholes calculations", () => {
  it("should calculate Black-Scholes for a call option", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 21000,
      timeToExpiry: 0.25, // 3 months
      riskFreeRate: 0.03, // 3%
      volatility: 0.20, // 20%
      optionType: "call",
    });

    expect(result).toBeDefined();
    expect(result.optionPrice).toBeGreaterThan(0);
    expect(result.delta).toBeGreaterThan(0);
    expect(result.delta).toBeLessThanOrEqual(1);
    expect(result.gamma).toBeGreaterThan(0);
    expect(result.vega).toBeGreaterThan(0);
    expect(result.theta).toBeLessThan(0); // Theta is negative for long positions
  });

  it("should calculate Black-Scholes for a put option", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 19000,
      timeToExpiry: 0.5, // 6 months
      riskFreeRate: 0.03,
      volatility: 0.18,
      optionType: "put",
    });

    expect(result).toBeDefined();
    expect(result.optionPrice).toBeGreaterThan(0);
    expect(result.delta).toBeLessThan(0); // Delta is negative for puts
    expect(result.delta).toBeGreaterThanOrEqual(-1);
    expect(result.gamma).toBeGreaterThan(0);
  });

  it("should calculate payoff for a call strategy", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.calculatePayoff({
      strategyType: "call",
      strikePrice: 20000,
      premium: 500,
      quantity: 1,
      spotPriceRange: {
        min: 18000,
        max: 22000,
        step: 500,
      },
    });

    expect(result).toBeDefined();
    expect(result.payoffData).toBeDefined();
    expect(Array.isArray(result.payoffData)).toBe(true);
    expect(result.payoffData.length).toBeGreaterThan(0);
    expect(result.maxProfit).toBeDefined();
    expect(result.maxLoss).toBeDefined();
    expect(result.breakEvenPoints).toBeDefined();
  });

  it("should save analysis to history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Perform a calculation
    await caller.analysis.calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 21000,
      timeToExpiry: 0.25,
      riskFreeRate: 0.03,
      volatility: 0.20,
      optionType: "call",
    });

    // Check history
    const history = await caller.analysis.getHistory({ limit: 10 });
    
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
  });
});
