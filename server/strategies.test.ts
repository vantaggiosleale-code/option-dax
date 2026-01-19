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

describe("strategies router", () => {
  it("should list user strategies", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const strategies = await caller.strategies.list();
    
    expect(Array.isArray(strategies)).toBe(true);
  });

  it("should create a new strategy", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.strategies.create({
      name: "Test Strategy",
      description: "A test option strategy",
      strategyType: "call",
      underlyingAsset: "DAX",
      strikePrice: "20000",
      quantity: 1,
      status: "active",
    });

    expect(result.success).toBe(true);
  });

  it("should reject unauthorized access to other user's strategy", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Try to access a strategy that doesn't exist or belongs to another user
    await expect(
      caller.strategies.getById({ id: 999999 })
    ).rejects.toThrow();
  });
});
