import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsFillPencilFill, BsFillTrashFill } from "react-icons/bs";
import { convertDateToStrWithTime2 } from "../CommonFunction";
import styles from "./TodoDetail.module.css";

export default function TodoDetail({
  todo,
  month,
  closeDetail,
  deleteTodoItem,
  handleEditTrue,
  colorList,
}) {
  const [filters, setFilters] = useState({
    ...todo,
    colorID: colorList.filter((item) => item.sub_code == todo.colorID)[0],
    start: convertDateToStrWithTime2(new Date(todo.start)),
    end: convertDateToStrWithTime2(new Date(todo.end)),
  });
  console.log(filters);
  return (
    <div className={`${styles.todoBox} ${"blue"}`}>
      <div className={styles.header}>
        <h2
          className={styles.title}
          style={{
            backgroundColor: colorList.filter(
              (item) => item.sub_code == parseInt(todo.colorID)
            )[0]?.color,
          }}
        >
          {filters.title}
        </h2>
        <p className={styles.time}>
          {filters.start} ~ {filters.end}
        </p>
      </div>
      <p className={styles.description}>{filters.contents}</p>
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
