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


module.exports = router;
