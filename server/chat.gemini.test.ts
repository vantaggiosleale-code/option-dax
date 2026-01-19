import { describe, expect, it } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("Gemini API Integration", () => {
  it("should successfully call Gemini API with the provided key", async () => {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Hello' if you can read this." },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]?.message?.content).toBeDefined();
    expect(typeof response.choices[0]?.message?.content).toBe("string");
    expect(response.choices[0]?.message?.content.length).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for API call
});
