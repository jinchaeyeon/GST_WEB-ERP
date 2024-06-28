import { useContext, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import ColorRadio from "./ColorRadio";
import { ColorThemeContext } from "./ColorThemeContext";
import styles from "./TodoEdit.module.css";

export default function TodoEdit({
  todo,
  month,
  updateTodoItem,
  schedule,
  handleEditFalse,
  handleTodo,
}) {
  const { colorTheme } = useContext(ColorThemeContext);

  const [color, setColor] = useState(todo.color);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescrpition] = useState(todo.description);
  const [time, setTime] = useState(todo.time);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title === "") {
      return;
    }

    const newTodo = {
      id: todo.id,
      date: todo.date,
      color: `${color}`,
      title: `${title}`,
      description: `${description}`,
      time: `${time}`,
      idx: todo.idx,
    };

    updateTodoItem(month, newTodo);
    handleTodo(newTodo);
    handleEditFalse();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <ColorRadio color={color} handleColor={setColor} />
      <div className={styles.header}>
        <input
          type="text"
          className={styles.title}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title edit"
        />
        <input
          type="time"
          className={styles.time}
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <textarea
        className={styles.description}
        rows="5"
        placeholder="description"
        value={description}
        onChange={(e) => setDescrpition(e.target.value)}
      />
      <div className={`${styles.btnBox} ${"blue"}`}>
        <AiOutlineClose className={styles.close} onClick={handleEditFalse} />
        <button type="submit" className={styles.finishBtn}>
          OK
        </button>
      </div>
    </form>
  );
}
