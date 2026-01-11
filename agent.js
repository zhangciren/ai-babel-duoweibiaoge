import { ChatOllama } from "@langchain/ollama";
import { StateGraph, START, END } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { formulaInvoker } from './formula.js';


const SYSTEM_PROMPT = `
你是一个专业的飞书/Excel 公式生成助手。
你只能使用以下算子生成公式，严禁使用其他函数:
1. Add(a, b) - 加法
2. Subtract(a, b) - 减法
3. Multiply(a, b) - 乘法
4. Divide(a, b) - 除法

上下文变量:
- person.age（用户年龄）
- person.salary（用户薪资）

规则:
- 直接输出公式，不要包含 Markdown 格式或解释。
- 必须嵌套使用，例如：Multiply(Add(1, 2), 3)
`;

// 引入我们在第三节写的 parse 函数（假设已导出）
// import { parse } from "./compiler";

// 为了演示完整性，这里模拟 parse 的验证行为
function mockParseValidator(formula) {
  try {
    // 真实场景调用: parse(tokenize(formula));
    // 模拟检查: 如果包含不支持的函数 'Sum' 则报错
    if (formula.includes("Sum")) {
      throw new Error("SyntaxError: Unknown function 'Sum'. Did you mean 'Add'?");
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

// 1. 初始化模型
const model = new ChatOllama({
  model: "qwen3:0.6b",
  temperature: 0, // 设为 0 保证输出确定性
});

// 2. 定义图的状态（State）
// 我们需要存储消息历史，以便 AI 知道之前的错误是什么
const graphState = {
  messages: {
    value: (x, y) => x.concat(y), // Reducer: 追加消息
    default: () => [],
  },
};

// 3. 定义节点（Nodes）
// 节点 A: 生成器
async function generatorNode(state) {
  const { messages } = state;
  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    ...messages
  ]);
  return { messages: [response] };
}

// 节点 B: 校验器（工具节点）
// 这是实现“字节级”工程质量的关键: 用编译器教 AI 改错
function validatorNode(state) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  const formula = lastMessage.content.trim();

  console.log(`\n🤖 AI 尝试生成: ${formula}`);

  const check = mockParseValidator(formula);

  if (check.valid) {
    console.log("✅ 校验通过");
    // 返回特殊标记，用于条件边判断
    return { messages: [new AIMessage("VALID")] };
  } else {
    console.log(`❌ 校验失败: ${check.error}`);
    // 将编译器的报错信息反馈给 AI
    return {
      messages: [
        new HumanMessage(`Error: ${check.error}. Please fix the formula based on the allowed operators.`)
      ]
    };
  }
}

// 4. 定义边（Edges）
// 决定下一步走哪里
function shouldContinue(state) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];

  // 如果校验器返回 VALID，则结束
  if (lastMessage.content === "VALID") {
    return END;
  }

  // 否则，带着错误信息回到生成器重试
  return "generator";
}

// 5. 组装图
const workflow = new StateGraph({ channels: graphState })
  .addNode("generator", generatorNode)
  .addNode("validator", validatorNode)
  .addEdge(START, "generator")
  .addEdge("generator", "validator")
  .addConditionalEdges("validator", shouldContinue)
  .compile();


  // --- 运行测试 ---
async function runDemo() {
  const userInput = "请帮我计算：薪资加上 500 后，再除以年龄";
  console.log(`用户输入：${userInput}`);

  // 启动图执行
  const result = await workflow.invoke({
    messages: [new HumanMessage(userInput)],
  });

  // 获取最终成功的公式（倒数第二条消息，因为最后一条是 VALID 标记）
  const finalMessages = result.messages;
  const finalFormula = finalMessages[finalMessages.length - 2].content;

  console.log(`\n✨ 最终生成的可执行公式：${finalFormula}`);
  // 这里可以调用 interpret(parse(tokenize(finalFormula))) 执行计算
  const res = formulaInvoker(finalFormula, {
    person: { age: 2, salary: 5000 },
  });
  console.log(`最终的计算结果：${res}`);
}

runDemo();
