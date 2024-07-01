import { Button } from "@progress/kendo-react-buttons";
import { useState } from "react";
import { convertDateToStrWithTime2 } from "../CommonFunction";
import styles from "./TodoDetail.module.css";

export default function TodoDetail({
  todo,
  closeDetail,
  deleteTodoItem,
  handleEditTrue,
  colorList,
  permissions,
}) {
  const [filters, setFilters] = useState({
    ...todo,
    colorID: colorList.filter((item) => item.sub_code == todo.colorID)[0],
    start: convertDateToStrWithTime2(new Date(todo.start)),
    end: convertDateToStrWithTime2(new Date(todo.end)),
  });

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
        <Button
          onClick={closeDetail}
          themeColor={"primary"}
          fillMode="outline"
          icon="close"
        ></Button>
        <div className={styles.itemBtnBox}>
          <Button
            onClick={() => {
              handleEditTrue();
            }}
            themeColor={"primary"}
            fillMode="outline"
            icon="edit"
            disabled={permissions.save ? false : true}
          ></Button>
          <Button
            onClick={() => {
              if (
                !window.confirm(
                  "일정계획을 삭제 하시겠습니까? (확인 후 우측 상단의 저장 버튼을 클릭해주세요.)"
                )
              ) {
                return false;
              }

              deleteTodoItem(todo.id);
              closeDetail();
            }}
            themeColor={"primary"}
            fillMode="outline"
            icon="delete"
            disabled={permissions.save ? false : true}
          ></Button>
        </div>
      </div>
    </div>
  );
}
