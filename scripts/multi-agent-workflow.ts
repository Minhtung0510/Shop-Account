/**
 * Multi-Agent Workflow: Coder + Reviewer
 * 
 * Chạy: npx ts-node scripts/multi-agent-workflow.ts
 * Cần: export CURSOR_API_KEY="cursor_..."
 */

import { Agent, CursorAgentError } from "@cursor/sdk";

async function main() {
  console.log("🚀 Bắt đầu workflow: Coder + Reviewer\n");

  // === AGENT 1: CODER ===
  console.log("📝 [CODER] Đang viết code...");

  let coderResult = "";
  
  await using coder = Agent.create({
    apiKey: process.env.CURSOR_API_KEY!,
    model: { id: "composer-2" },
    local: { cwd: process.cwd() },
  });

  const coderRun = await coder.send(
    `Bạn là 1 senior developer. 
Hãy viết 1 function TypeScript đơn giản:
- Function tính tổng 2 số
- Có JSDoc comment
- Có type annotation đầy đủ
Chỉ trả về code, không giải thích.`
  );

  for await (const event of coderRun.stream()) {
    if (event.type === "assistant") {
      for (const block of event.message.content) {
        if (block.type === "text") {
          process.stdout.write(block.text);
          coderResult += block.text;
        }
      }
    }
  }

  const coderFinal = await coderRun.wait();
  console.log("\n\n✅ [CODER] Hoàn thành!\n");

  // === AGENT 2: REVIEWER ===
  console.log("🔍 [REVIEWER] Đang review code...");

  await using reviewer = Agent.create({
    apiKey: process.env.CURSOR_API_KEY!,
    model: { id: "composer-2" },
    local: { cwd: process.cwd() },
  });

  const reviewerRun = await reviewer.send(
    `Bạn là 1 senior code reviewer.
Hãy review đoạn code sau và chỉ ra:
1. Bug (nếu có)
2. Style issues (nếu có)
3. Suggestions cải thiện

Code cần review:
\`\`\`typescript
${coderResult}
\`\`\``

  );

  let reviewResult = "";
  
  for await (const event of reviewerRun.stream()) {
    if (event.type === "assistant") {
      for (const block of event.message.content) {
        if (block.type === "text") {
          process.stdout.write(block.text);
          reviewResult += block.text;
        }
      }
    }
  }

  await reviewerRun.wait();
  console.log("\n\n✅ [REVIEWER] Hoàn thành!\n");

  // === KẾT QUẢ ===
  console.log("=".repeat(50));
  console.log("📊 WORKFLOW RESULT");
  console.log("=".repeat(50));
  console.log("\nCode đã viết:\n", coderResult);
  console.log("\nReview:", reviewResult);
}

// Error handling
main().catch((err) => {
  if (err instanceof CursorAgentError) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
  throw err;
});
