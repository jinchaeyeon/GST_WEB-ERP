import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { Chat } from "@progress/kendo-react-conversational-ui";
import { bytesToBase64 } from "byte-base64";
import { useApi } from "../hooks/api";

interface IData {
  question: string;
  parent_question: string;
  answer: string;
}

interface IQnaData {
  value: string;
  parent: string;
  type: string;
  content: string;
}

const user = {
  id: 1,
  avatarUrl:
    "https://demos.telerik.com/kendo-ui/content/web/Customers/RICSU.jpg",
};

const bot = { id: 0 };
// const solutions = [
//   {
//     type: "reply",
//     value: "ERP",
//     content: "중소·중견기업의 경영혁신을 위한 전사적 자원관리시스템",
//   },
//   {
//     type: "reply",
//     value: "SCM",
//     content: "자재공급망관리",
//   },
//   // {
//   //   type: "reply",
//   //   value: "MES",
//   //   content: "제조실행 시스템 및 생산 시점 관리시스템",
//   // },
// ];
const initialMessages = [
  {
    author: bot,
    timestamp: new Date(),
    suggestedActions: [],
    text: "안녕하세요. GST ERP 챗봇입니다.",
  },
];

const CHAT_BOT: React.FC = () => {
  const processApi = useApi();
  const [messages, setMessages] = useState(initialMessages);
  const [qnaData, setQnaData] = useState<IQnaData[]>([]);

  const addNewMessage = (event: any) => {
    let botResponse = Object.assign({}, event.message);
    botResponse.text = firstAnswer(event.message.text);
    botResponse.author = bot;

    const suggestedActions = qnaData.filter(
      (item) => item.parent === event.message.text
    );
    botResponse.suggestedActions = suggestedActions;

    setMessages([...messages, event.message]);
    setTimeout(() => {
      setMessages((oldMessages) => [...oldMessages, botResponse]);
    }, 1000);
  };
  const firstAnswer = (question: any) => {
    const content: IQnaData = qnaData.find(
      (solution) => question === solution.value
    )!;

    let answer = content ? content?.content : "다시 입력해주세요.";
    return answer;
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    // if (!permissions?.view) return;
    let data: any;

    const queryStr =
      "SELECT question, parent_question, answer FROM TEST_QNA_CHAT_BOT";
    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows: IQnaData[] = data.tables[0].Rows.map(
        (row: IData, idx: number) => ({
          ...row,
          type: "reply",
          parent: row.parent_question,
          value: row.question,
          content: row.answer,
          idx: idx,
        })
      );

      if (totalRowCnt > 0) {
        setQnaData(rows);

        const firstActions = rows.filter((item) => item.parent === "");

        setMessages((prev: any) => [
          {
            ...prev[0],
            suggestedActions: firstActions,
          },
        ]);
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  useEffect(() => {
    fetchMainGrid();
  }, []);

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
