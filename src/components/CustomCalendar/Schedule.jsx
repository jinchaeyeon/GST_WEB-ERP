import { Button } from "@progress/kendo-react-buttons";
import moment from "moment";
import { useState } from "react";
import { getDateRange } from "../CommonFunction";
import styles from "./Schedule.module.css";
import TodoDetail from "./TodoDetail";
import TodoEdit from "./TodoEdit";
import TodoItem from "./TodoItem";

export default function Schedule({
  date,
  openModal,
  schedule,
  deleteTodoItem,
  isList,
  setIsList,
  isEdit,
  setIsEdit,
  selectedTodo,
  handleTodo,
  closeDetail,
  updateTodoItem,
  colorList,
  permissions,
}) {
  const handleEditTrue = () => {
    setIsEdit(true);
  };
  const handleEditFalse = () => {
    setIsEdit(false);
    setIsList(true);
  };

  // 해당 날짜의 일정 리스트 만들기
  const scheduleList = schedule
    .filter((todo) =>
      getDateRange(todo.start, todo.end).includes(
        moment(date).format("YYYYMMDD")
      )
    )
    .sort((a, b) => a.idx - b.idx);

  return (
    <div className={`${styles.container} ${"blue"}`}>
      <div className={styles.header}>
        <div style={{display: "flex", alignItems: "center"}}>
          <p className={styles.title}>Schedule</p>
          <div className={styles.dateBox}>
            <p className={styles.date}>
              {moment(date).format("YYYY년 MM월 DD일")}
            </p>
          </div>
        </div>
        {isList && (
          <Button
            onClick={openModal}
            themeColor={"primary"}
            fillMode="outline"
            icon="plus"
            disabled={permissions.save ? false : true}
          ></Button>
        )}
      </div>
      <div className={styles.scheduleBox}>
        {/* 해당 date에 맞는 데이터를 골라 map으로 돌며 item 생성. */}
        {isList &&
          scheduleList.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              deleteTodoItem={deleteTodoItem}
              handleTodo={handleTodo}
              handleEditTrue={handleEditTrue}
              colorList={colorList}
              permissions={permissions}
            />
          ))}

        {!isList && !isEdit && (
          <TodoDetail
            todo={selectedTodo}
            closeDetail={closeDetail}
            deleteTodoItem={deleteTodoItem}
            handleEditTrue={handleEditTrue}
            colorList={colorList}
            permissions={permissions}
          />
        )}
        {!isList && isEdit && (
          <TodoEdit
            todo={selectedTodo}
            updateTodoItem={updateTodoItem}
            schedule={schedule}
            handleEditFalse={handleEditFalse}
            handleTodo={handleTodo}
            colorList={colorList}
            permissions={permissions}
          />
        )}
      </div>
    </div>
  );
}
