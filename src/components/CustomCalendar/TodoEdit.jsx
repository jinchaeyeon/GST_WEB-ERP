import { Button } from "@progress/kendo-react-buttons";
import { DateTimePicker } from "@progress/kendo-react-dateinputs";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { UseGetValueFromSessionItem } from "../CommonFunction";
import CustomersWindow from "../Windows/CommonWindows/CustomersWindow";
import ColorRadio from "./ColorRadio";
import styles from "./TodoEdit.module.css";

export default function TodoEdit({
  todo,
  updateTodoItem,
  handleEditFalse,
  handleTodo,
  colorList,
  permissions,
}) {
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
    if (filters.start > filters.end) {
      alert("시작시간이 종료시간보다 이후 입니다.");
      return;
    }
    const newTodo = {
      ...filters,
      colorID: filters.colorID.sub_code,
      person: sessionUserId,
    };

    updateTodoItem(newTodo);
    handleTodo(newTodo);
    handleEditFalse();
  };

  const [custWindowVisible, setCustWindowVisible] = useState(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const setCustData = (data) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  return (
    <>
      <div className={styles.form}>
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
            style={{ marginTop: "5px", height: "40px", fontSize: "large" }}
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
        </div>
        <div style={{ marginTop: "5px"}}>
          <p>업체</p>
          <div style={{ marginTop: "5px", display: "flex"  }}>
            <Input
              name="custnm"
              type="text"
              value={filters.custnm}
              className="readonly"
              style={{ height: "40px", fontSize: "large" }}
            />
            <Button
              onClick={onCustWndClick}
              themeColor={"primary"}
              fillMode="flat"
            >
              참조
            </Button>
          </div>
        </div>
        <div
          style={{
            marginTop: "5px",
            height: `calc(100% - 210px)`,
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
              height: `calc(100% - 30px)`,
            }}
          />
        </div>
        <div className={`${styles.btnBox} ${"blue"}`}>
          <AiOutlineClose className={styles.close} onClick={handleEditFalse} />
          <Button
            onClick={handleSubmit}
            themeColor={"primary"}
            disabled={permissions.save ? false : true}
            style={{ height: "50px", width: "80px" }}
          >
            OK
          </Button>
        </div>
      </div>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
    </>
  );
}
