import { DateTimePicker } from "@progress/kendo-react-dateinputs";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { UseGetValueFromSessionItem } from "../CommonFunction";
import ColorRadio from "./ColorRadio";
import styles from "./TodoAddModal.module.css";

export default function TodoAddModal({
  date,
  open,
  closeModal,
  schedule,
  addSchedule,
  colorList,
}) {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth < 1200;
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const [filters, setFilters] = useState({
    id: 0,
    title: "",
    start: new Date(),
    end: new Date(),
    colorID: {sub_code: 0, code_name: "없음", color: "white"},
    person: sessionUserId,
    contents: "",
  });

  useEffect(
    (prev) => {
      setFilters((prev) => ({
        ...prev,
        start: new Date(date),
        end: new Date(date),
      }));
    },
    [date]
  );

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

    const month = filters.start.getMonth() + "월";
    const newTodo = {
      id: `${uuidv4()}`,
      start: `${filters.start}`,
      end: `${filters.end}`,
      colorID: `${filters.colorID.sub_code}`,
      title: `${filters.title}`,
      contents: `${filters.contents}`,
      person: `${sessionUserId}`,
      idx: 1,
    };

    if (Object.keys(schedule).includes(`${date.getMonth()}월`)) {
      newTodo.idx = schedule[month].length + 1;
      const monthSchedule = schedule[month].concat(newTodo);
      addSchedule((prev) => ({
        ...prev,
        [month]: monthSchedule,
      }));
    } else {
      addSchedule((prev) => ({
        ...prev,
        [month]: [newTodo],
      }));
    }

    setFilters({
      id: 0,
      title: "",
      start: new Date(date),
      end: new Date(date),
      colorID: {sub_code: 0, code_name: "없음", color: "white"},
      person: sessionUserId,
      contents: "",
    });
    closeModal();
  };

  return (
    <div
      className={open ? `${styles.modal} ${styles.openModal}` : styles.modal}
    >
      <form onSubmit={handleSubmit} className={`${styles.form} ${"blue"}`}>
        <div className={styles.infoBox}>
          <h2 className={styles.info}>일정 등록하기</h2>
          <AiOutlineClose className={styles.closeBtn} onClick={closeModal} />
        </div>
        <ColorRadio
          code={filters.colorID}
          handleCode={filterComboChange}
          colorData={colorList}
        />
        <p>제목</p>
        <Input
          name="title"
          type="text"
          value={filters.title}
          onChange={filterInputChange}
        />
        <p>시간</p>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <DateTimePicker
            value={filters.start}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                start: e.value,
              }))
            }
          />
          <DateTimePicker
            value={filters.end}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                end: e.value,
              }))
            }
          />
        </div>
        <p>내용</p>
        <TextArea
          name="contents"
          type="text"
          value={filters.contents}
          onChange={filterInputChange}
          rows={isMobile ? 20 : 5}
        />
        <button type="submit" className={styles.addBtn}>
          SUBMIT
        </button>
      </form>
    </div>
  );
}
