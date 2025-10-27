import { ChatOpenAI } from '@langchain/openai';
import { MemorySaver } from '@langchain/langgraph';
import { HumanMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { Calculator } from '@langchain/community/tools/calculator';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

console.log('DASHSCOPE_API_KEY', process.env.DASHSCOPE_API_KEY);

// 配置通义千问API
const model = new ChatOpenAI({
  modelName: 'qwen-plus',
  temperature: 0.7,
  apiKey: process.env.DASHSCOPE_API_KEY,
  configuration: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
});

// 初始化工具集
// Calculator 数学计算
const tools = [new Calculator()];

// 初始化记忆组件
const memorySaver = new MemorySaver();

// 创建增强型ReAct智能体
// llm: 使用配置好的通义千问模型
// checkpointSaver: 使用记忆组件保存对话检查点
// tools: 集成计算器和搜索工具，增强AI的实际问题解决能力
const agent = createReactAgent({
  llm: model,
  checkpointSaver: memorySaver,
  tools: tools,
  verbose: true, // 启用详细日志输出
});

// 对话处理函数
async function chat(input, threadId = 'default') {
  try {
    const response = await agent.invoke(
      { messages: [new HumanMessage(input)] },
      {
        configurable: {
          thread_id: threadId,
          maxIterations: 3, // 限制最大工具调用次数，防止无限循环
        },
      },
    );
    return response.messages[response.messages.length - 1].content;
  } catch (error) {
    console.error('对话处理出错:', error);
    return '抱歉，处理您的请求时出现错误。';
  }
}

// 主函数：演示增强型对话系统的使用方法
async function main() {
  try {
    // 测试基础对话能力
    const response1 = await chat('你好，请介绍一下你自己');
    console.log('AI response1: ', response1);

    // 测试工具使用能力
    const response2 = await chat('x = 2; y = 3; 请问 x + y * 2 = ？');
    console.log('AI response2: ', response2);

    // 测试记忆能力
    const response3 = await chat('你能总结一下我们刚才讨论了什么吗？', 'default');
    console.log('AI response3: ', response3);
  } catch (error) {
    console.error('执行出错:', error);
  }
}

// 运行测试程序
main();
