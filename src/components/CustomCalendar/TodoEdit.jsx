import { DateTimePicker } from "@progress/kendo-react-dateinputs";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { UseGetValueFromSessionItem } from "../CommonFunction";
import ColorRadio from "./ColorRadio";
import styles from "./TodoEdit.module.css";

export default function TodoEdit({
  todo,
  month,
  updateTodoItem,
  schedule,
  handleEditFalse,
  handleTodo,
  colorList,
}) {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth < 1200;
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const [filters, setFilters] = useState({
    ...todo,
    colorID: colorList.filter((item) => item.sub_code == todo.colorID)[0],
    start: new Date(todo.start),
    end: new Date(todo.end),
  });

  const filterInputChange = (e) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      colorID: e,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filters.title === "") {
      alert("제목을 입력해주세요");
      return;
    }

    const newTodo = {
      id: filters.id,
      start: `${filters.start}`,
      end: `${filters.end}`,
      colorID: `${filters.colorID.sub_code}`,
      title: `${filters.title}`,
      contents: `${filters.contents}`,
      person: `${sessionUserId}`,
      idx: filters.idx,
    };

    updateTodoItem(month, newTodo);
    handleTodo(newTodo);
    handleEditFalse();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <ColorRadio
        code={filters.colorID}
        handleCode={filterComboChange}
        colorData={colorList}
      />
      <div style={{ marginTop: "5px" }}>
        <p>제목</p>
        <Input
          name="title"
          type="text"
          value={filters.title}
          onChange={filterInputChange}
          style={{ marginTop: "5px", height: "40px" }}
        />
      </div>
      <div style={{ marginTop: "5px" }}>
        <p>시간</p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: "5px",
            height: "40px",
          }}
        >
          <DateTimePicker
            value={filters.start}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                start: e.value,
              }))
            }
            steps={{
              hour: 1,
              minute: 5,
            }}
          />
          <DateTimePicker
            value={filters.end}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                end: e.value,
              }))
            }
            steps={{
              hour: 1,
              minute: 5,
            }}
          />
        </div>
      </div>
      <div
        style={{
          marginTop: "5px",
          height: isMobile ? "200px" : `calc(100% - 210px)`,
        }}
      >
        <p>내용</p>
        <TextArea
          name="contents"
          type="text"
          value={filters.contents}
          onChange={filterInputChange}
          style={{
            marginTop: "5px",
            height: isMobile ? "170px" : `calc(100% - 30px)`,
          }}
        />
      </div>
      <div className={`${styles.btnBox} ${"blue"}`}>
        <AiOutlineClose className={styles.close} onClick={handleEditFalse} />
        <button type="submit" className={styles.finishBtn}>
          OK
        </button>
      </div>
    </form>
  );
}
