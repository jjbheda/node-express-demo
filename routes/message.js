const express = require('express');
const router = express.Router();

const chatDetail = async (conversation_id, chat_id) => {
  // 动态导入node-fetch
  const { default: fetch } = await import('node-fetch');

  const url = `https://api.coze.cn/v3/chat/message/list?conversation_id=${conversation_id}&chat_id=${chat_id}`;
  
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: "Bearer pat_3ss8PLXKFHcMNuBUmzQ8ExhecGsApUg7gFk0LfNKT93w5Yj9cqfoneMeTeZSa9iR",
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const res = await response.json();

      if (res.data) {
        const item = res.data.find(item => item.type === "answer");
        if (item) {
          resolve(item.content.trim() !== "暂无数据" ? item.content.trim() : "nothing null");
        } else {
          // 继续调用以获取更多信息
          setTimeout(() => {
            chatDetail(conversation_id, chat_id).then(resolve).catch(reject);
          }, 1000);
        }
      } else {
        setTimeout(() => {
          chatDetail(conversation_id, chat_id).then(resolve).catch(reject);
        }, 1000);
      }
    } catch (error) {
      console.error("Error in chatDetail:", error);
      reject(error);
    }
  });
};


const sendMessage = async (data) => {
  // 动态导入node-fetch
  const { default: fetch } = await import('node-fetch');

  const headers = {
    Authorization: "Bearer pat_3ss8PLXKFHcMNuBUmzQ8ExhecGsApUg7gFk0LfNKT93w5Yj9cqfoneMeTeZSa9iR",
    "Content-Type": "application/json",
  };
  const url = "https://api.coze.cn/v3/chat";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });
    const res = await response.json();

    if (res.data.status === "in_progress") {
      return chatDetail(res.data.conversation_id, res.data.id); // 等待 chatDetail 返回
    } else {
      return res; // 其他状态的处理
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

router.post('/send-message', async (req, res) => {
  const { user_id, bot_id, content } = req.body;
  
  const data = {
    bot_id: bot_id,
    user_id: user_id,
    stream: false,
    auto_save_history: true,
    additional_messages: [{
      role: "user",
      content: content,
      content_type: "text",
    }],
  };

  try {
    const result = await sendMessage(data);
    if (result) {
      res.json(result);
    } else {
      // 如果结果为空，可以设置一个超时机制或其他处理方式
      const timeout = setTimeout(() => {
        // 处理超时逻辑，比如返回一个错误响应
        res.status(500).json({ error: 'Request timed out' });
      }, 10000); // 10秒后超时

      // 此处可以继续轮询，直到获取有效结果
      // 需要在 chatDetail 中调用回调时清除超时
    }
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;
