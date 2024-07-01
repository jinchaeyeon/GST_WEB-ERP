import { Button } from "@progress/kendo-react-buttons";
import { convertDateToStrWithTime3 } from "../CommonFunction";
import styles from "./TodoItem.module.css";

export default function TodoItem({
  todo,
  deleteTodoItem,
  handleTodo,
  handleEditTrue,
  colorList,
  permissions
}) {
  return (
    <div className={styles.todoBox} data-testid="todoItem">
      <div
        className={styles.titleBox}
        onClick={() => {
          handleTodo(todo);
        }}
      >
        <div
          className={styles.color}
          style={{
            backgroundColor: colorList.filter(
              (item) => item.sub_code == parseInt(todo.colorID)
            )[0]?.color,
          }}
        ></div>
        <p
          className={styles.title}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginRight: "10px",
          }}
        >
          <div>{todo.title}</div>
          <div>{convertDateToStrWithTime3(todo.start)}</div>
        </p>
      </div>
      <div className={`${styles.btnBox} ${"blue"}`}>
        <Button
          onClick={() => {
            handleTodo(todo);
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
          }}
          themeColor={"primary"}
          fillMode="outline"
          icon="delete"
          disabled={permissions.save ? false : true}
        ></Button>
      </div>
    </div>
  );
}
