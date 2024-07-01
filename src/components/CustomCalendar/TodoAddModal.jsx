import { Button } from "@progress/kendo-react-buttons";
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
  permissions,
  person,
}) {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth < 1200;
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const [filters, setFilters] = useState({
    id: 0,
    title: "",
    start: new Date(),
    end: new Date(),
    colorID: { sub_code: 0, code_name: "없음", color: "white" },
    person: sessionUserId,
    contents: "",
  });

  useEffect(
    (prev) => {
      setFilters((prev) => ({
        ...prev,
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(date.setHours(0, 0, 0, 0)),
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
    if (!permissions.save) return;
    if (person !== sessionUserId) {
      alert("본인만 수정가능합니다.");
      return;
    }

    if (filters.title === "") {
      alert("제목을 입력해주세요");
      return;
    }
    if (filters.start > filters.end) {
      alert("시작시간이 종료시간보다 이후 입니다.");
      return;
    }
    const newTodo = {
      id: uuidv4(),
      start: filters.start,
      end: filters.end,
      colorID: filters.colorID.sub_code,
      title: filters.title,
      contents: filters.contents,
      person: sessionUserId,
      idx: 1,
      rowstatus: "N",
    };

    addSchedule(newTodo);

    setFilters({
      id: 0,
      title: "",
      start: new Date(date),
      end: new Date(date),
      colorID: { sub_code: 0, code_name: "없음", color: "white" },
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
          style={{ height: "40px", fontSize: "large" }}
        />
        <p>시간</p>
        <div style={{ display: "flex", flexDirection: "row", height: "40px" }}>
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
            size="large"
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
            size="large"
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
        <Button
          onClick={handleSubmit}
          themeColor={"primary"}
          fillMode="outline"
          disabled={permissions.save ? false : true}
          style={{ height: "50px" }}
        >
          SUBMIT
        </Button>
      </form>
    </div>
  );
}
