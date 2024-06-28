import React, { useContext } from 'react';
import styles from './TodoDetail.module.css';
import { BsFillPencilFill, BsFillTrashFill } from 'react-icons/bs';
import { AiOutlineClose } from 'react-icons/ai';
import { ColorThemeContext } from "./ColorThemeContext";

export default function TodoDetail({
  todo,
  month,
  closeDetail,
  deleteTodoItem,
  handleEditTrue,
}) {
  const { colorTheme } = useContext(ColorThemeContext);

  const selectedColor =
    todo.color === 'pink'
      ? '#ff8f8f'
      : todo.color === 'yellow'
      ? '#fbde7e'
      : '#8cbc59';

  return (
    <div
      className={`${styles.todoBox} ${
        colorTheme === 'pink'
          ? styles.pink
          : colorTheme === 'yellow'
          ? styles.yellow
          : styles.green
      }`}
    >
      <div className={styles.header}>
        <h2 className={styles.title} style={{ backgroundColor: selectedColor }}>
          {todo.title}
        </h2>
        <p className={styles.time}>{todo.time}</p>
      </div>
      <p className={styles.description}>{todo.description}</p>
      <div className={styles.btnBox}>
        <AiOutlineClose
          className={styles.close}
          onClick={closeDetail}
          data-testid="closeDetail"
        />
        <div className={styles.itemBtnBox}>
          <BsFillPencilFill
            className={styles.edit}
            onClick={() => {
              handleEditTrue();
            }}
          />
          <BsFillTrashFill
            className={styles.delete}
            onClick={() => {
              deleteTodoItem(month, todo.id);
              closeDetail();
            }}
          />
        </div>
      </div>
    </div>
  );
}
