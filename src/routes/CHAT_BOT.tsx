import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { Chat } from "@progress/kendo-react-conversational-ui";

const user = {
  id: 1,
  avatarUrl:
    "https://demos.telerik.com/kendo-ui/content/web/Customers/RICSU.jpg",
};

const bot = { id: 0 };
const solutions = [
  {
    type: "reply",
    value: "ERP",
    content: "중소·중견기업의 경영혁신을 위한 전사적 자원관리시스템",
  },
  {
    type: "reply",
    value: "SCM",
    content: "자재공급망관리",
  },
  {
    type: "reply",
    value: "MES",
    content: "제조실행 시스템 및 생산 시점 관리시스템",
  },
];
const initialMessages = [
  {
    author: bot,
    timestamp: new Date(),
    suggestedActions: solutions,
    text: "안녕하세요. GST ERP 챗봇입니다.",
  },
];

const CHAT_BOT: React.FC = () => {
  const [messages, setMessages] = React.useState(initialMessages);

  const addNewMessage = (event: any) => {
    let botResponse = Object.assign({}, event.message);
    botResponse.text = firstAnswer(event.message.text);
    botResponse.author = bot;
    botResponse.suggestedActions = solutions;

    setMessages([...messages, event.message]);
    setTimeout(() => {
      setMessages((oldMessages) => [...oldMessages, botResponse]);
    }, 1000);
  };
  const firstAnswer = (question: any) => {
    const content = solutions.find((solution) => question === solution.value);

    let answer = content
      ? question + "란 " + content?.content + "입니다."
      : "다시 입력해주세요.";
    return answer;
  };
  return (
    <div>
      <Chat
        user={user}
        messages={messages}
        onMessageSend={addNewMessage}
        placeholder={"Type a message..."}
        width={400}
      />
    </div>
  );
};

export default CHAT_BOT;
