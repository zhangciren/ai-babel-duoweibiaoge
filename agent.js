import { ChatOllama } from "@langchain/ollama";

const llm = new ChatOllama({
  model: "qwen3:0.6b",
  temperature: 0,
});

async function invoke() {
    const res = await llm.invoke("生成公式");
    console.log(res);
}

invoke();
