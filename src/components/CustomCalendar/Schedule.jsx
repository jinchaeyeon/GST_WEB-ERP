import React, { useContext, useState } from 'react';
import moment from 'moment';
import { AiOutlinePlus } from 'react-icons/ai';
import styles from './Schedule.module.css';
import TodoItem from './TodoItem';
import TodoDetail from './TodoDetail';
import TodoEdit from './TodoEdit';
import { ColorThemeContext } from "./ColorThemeContext";

export default function Schedule({
  date,
  openModal,
  schedule,
  deleteTodoItem,
  isList,
  selectedTodo,
  handleTodo,
  closeDetail,
  updateTodoItem,
}) {
  const { colorTheme } = useContext(ColorThemeContext);

  const [isEdit, setIsEdit] = useState(false);
  const handleEditTrue = () => {
    setIsEdit(true);
  };
  const handleEditFalse = () => {
    setIsEdit(false);
  };
  // 해당 날짜의 일정 리스트 만들기
  const month = date.getMonth() + '월';
  const scheduleList = Object.keys(schedule).includes(`${date.getMonth()}월`)
    ? schedule[month]
        .filter((todo) => todo.date === moment(date).format('YYYY년 MM월 DD일'))
        .sort((a, b) => a.idx - b.idx)
    : [];

  return (
    <div
      className={`${styles.container} ${
        colorTheme === 'pink'
          ? styles.pink
          : colorTheme === 'yellow'
          ? styles.yellow
          : styles.green
      }`}
    >
      <div className={styles.header}>
        <p className={styles.title}>Schedule</p>
        <div className={styles.dateBox}>
          <p className={styles.date}>
            {moment(date).format('YYYY년 MM월 DD일')}
          </p>
          <button
            className={styles.addBtn}
            onClick={openModal}
            aria-label="addBtn"
          >
            <AiOutlinePlus />
          </button>
        </div>
      </div>
      <div className={styles.scheduleBox}>
        {/* 해당 date에 맞는 데이터를 골라 map으로 돌며 item 생성. */}
        {isList &&
          scheduleList.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              month={month}
              deleteTodoItem={deleteTodoItem}
              handleTodo={handleTodo}
              handleEditTrue={handleEditTrue}
            />
          ))}
        {!isList && !isEdit && (
          <TodoDetail
            todo={selectedTodo}
            month={month}
            closeDetail={closeDetail}
            deleteTodoItem={deleteTodoItem}
            handleEditTrue={handleEditTrue}
          />
        )}
        {!isList && isEdit && (
          <TodoEdit
            todo={selectedTodo}
            month={month}
            updateTodoItem={updateTodoItem}
            schedule={schedule}
            handleEditFalse={handleEditFalse}
            handleTodo={handleTodo}
          />
        )}
      </div>
    </div>
  );
}
