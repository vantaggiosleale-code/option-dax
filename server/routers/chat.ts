import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

const TRADING_SYSTEM_PROMPT = `You are an expert financial analyst specializing in options trading on the DAX index. 
You provide clear, actionable insights about:
- Black-Scholes option pricing and Greeks (Delta, Gamma, Vega, Theta, Rho)
- Option strategies (calls, puts, spreads, straddles, strangles)
- Risk management and portfolio analysis
- Market volatility and its impact on options
- Trading recommendations based on market conditions

Always provide specific, data-driven advice. When discussing strategies, explain both potential profits and risks.
Use professional financial terminology but explain complex concepts clearly.`;

export const chatRouter = router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant", "system"]),
              content: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const messages = [
        { role: "system" as const, content: TRADING_SYSTEM_PROMPT },
        ...(input.conversationHistory || []),
        { role: "user" as const, content: input.message },
      ];

      const response = await invokeLLM({
        messages,
      });

      const assistantMessage = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

      return {
        message: assistantMessage,
        timestamp: new Date().toISOString(),
      };
    }),

  analyzeStrategy: protectedProcedure
    .input(
      z.object({
        strategyType: z.string(),
        strikePrice: z.number(),
        spotPrice: z.number(),
        volatility: z.number(),
        timeToExpiry: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Analyze this ${input.strategyType} option strategy:
- Strike Price: ${input.strikePrice}
- Current Spot Price: ${input.spotPrice}
- Volatility: ${(input.volatility * 100).toFixed(2)}%
- Time to Expiry: ${input.timeToExpiry} years

Provide:
1. Risk assessment (high/medium/low)
2. Potential profit/loss scenarios
3. Key factors to monitor
4. Recommended actions`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: TRADING_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });

      const analysis = response.choices[0]?.message?.content || "Unable to analyze strategy.";

      return {
        analysis,
        timestamp: new Date().toISOString(),
      };
    }),
});
