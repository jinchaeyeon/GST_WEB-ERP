import { Input, TextArea } from "@progress/kendo-react-inputs";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import ColorRadio from "./ColorRadio";
import { ColorThemeContext } from "./ColorThemeContext";
import styles from "./TodoAddModal.module.css";

export default function TodoAddModal({
  date,
  open,
  closeModal,
  schedule,
  addSchedule,
  colorList,
}) {
  const { colorTheme } = useContext(ColorThemeContext);
  const [colorData, setColorData] = useState([]);

  const [filters, setFilters] = useState({
    id: 0,
    title: "",
    start: new Date(),
    end: new Date(),
    colorID: { sub_code: 0, code_name: "없음", color: "" },
    dptcd: { text: "", value: "" },
    person: { text: "", value: "" },
    contents: "",
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

    const month = filters.start.getMonth() + "월";
    const newTodo = {
      id: `${uuidv4()}`,
      start: `${moment(filters.start).format("YYYY년 MM월 DD일")}`,
      end: `${moment(filters.end).format("YYYY년 MM월 DD일")}`,
      colorID: `${filters.colorID}`,
      title: `${filters.title}`,
      contents: `${filters.contents}`,
      person: `${filters.person}`,
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
      start: new Date(),
      end: new Date(),
      colorID: { sub_code: 0, code_name: "없음", color: "" },
      dptcd: { text: "", value: "" },
      person: { text: "", value: "" },
      contents: "",
    });
    closeModal();
  };

  useEffect(() => {
    //초기 props셋팅
    setColorData(colorList);
  }, [colorList]);

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
          colorData={colorData}
        />
        <p>제목</p>
        <Input
          name="title"
          type="text"
          value={filters.title}
          onChange={filterInputChange}
        />
        <p>시간</p>
        <CommonDateRangePicker
          value={{
            start: filters.start,
            end: filters.end,
          }}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              start: e.value.start,
              end: e.value.end,
            }))
          }
        />
        <p>내용</p>
        <TextArea
          name="contents"
          type="text"
          value={filters.contents}
          onChange={filterInputChange}
          rows={5}
        />
        <button type="submit" className={styles.addBtn}>
          SUBMIT
        </button>
      </form>
    </div>
  );
}
