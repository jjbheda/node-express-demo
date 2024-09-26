const express = require('express');
const router = express.Router();

const sendMessage = async (data) => {
  // 动态导入node-fetch
  const { default: fetch } = await import('node-fetch');

  const headers = {
    Authorization: "Bearer pat_3ss8PLXKFHcMNuBUmzQ8ExhecGsApUg7gFk0LfNKT93w5Yj9cqfoneMeTeZSa9iR",
    "Content-Type": "application/json",
    Connection: "keep-alive",
    Accept: "*/*",
  };

  const url = "https://api.coze.cn/v3/chat"; // 替换为你的API端点

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });
    const res = await response.json();
    
    if (res.data.status === "in_progress") {
      setTimeout(() => {
        chatDetail(res.data.conversation_id, res.data.id);
      }, 1000);
    } else {
      return res; // 其他状态的处理
    }
  } catch (error) {
    console.error("Error:", error);
    throw error; // 抛出错误以供外部处理
  }
};

const chatDetail = async (conversation_id, chat_id) => {
  // 动态导入node-fetch
  const { default: fetch } = await import('node-fetch');

  const url = `https://api.coze.cn/v3/chat/message/list?conversation_id=${conversation_id}&chat_id=${chat_id}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer pat_3ss8PLXKFHcMNuBUmzQ8ExhecGsApUg7gFk0LfNKT93w5Yj9cqfoneMeTeZSa9iR",
        "Content-Type": "application/json",
      },
      method: "POST",
      mode: "cors",
    });
    const res = await response.json();
    
    if (res.data) {
      const item = res.data.filter((item) => item.type === "answer")?.[0];
      if (item) {
        console.log(item.content);
        if (item.content.trim() !== "暂无数据") {
          const path = item.content.trim();
          // 处理成功结果
        }
      } else {
        setTimeout(() => {
          chatDetail(conversation_id, chat_id);
        }, 1000);
      }
    } else {
      setTimeout(() => {
        chatDetail(conversation_id, chat_id);
      }, 1000);
    }
  } catch (error) {
    console.error("Error in chatDetail:", error);
  }
};

router.post('/send-message', async (req, res) => {
  const { user_id, bot_id, content } = req.body; // 从请求中获取数据

  const data = {
    bot_id: bot_id,
    user_id: user_id,
    stream: false,
    auto_save_history: true,
    additional_messages: [
      {
        role: "user",
        content: content,
        content_type: "text",
      },
    ],
  };

  try {
    const result = await sendMessage(data);
    res.json(result); // 返回API的响应
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
