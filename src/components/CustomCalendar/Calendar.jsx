import { useContext, useEffect, useState } from "react";
import styles from "./Calendar.module.css";
import CalendarBox from "./CalendarBox";
import { ColorThemeContext } from "./ColorThemeContext";
import Schedule from "./Schedule";
import TodoAddModal from "./TodoAddModal";

export default function Calendar() {
  const [date, setDate] = useState(new Date());
  const [modal, setModal] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [isList, setIsList] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState({});
  const handleTodo = (todo) => {
    setSelectedTodo(todo);
    setIsList(false);
  };
  const closeDetail = () => {
    setIsList(true);
  };
  const openModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
  };
  const deleteTodoItem = (month, id) => {
    const newList = schedule[month].filter((todo) => todo.id !== id);
    setSchedule((prev) => ({
      ...prev,
      [month]: newList,
    }));
  };
  const updateTodoItem = (month, newTodo) => {
    const newList = schedule[month]
      .filter((todo) => todo.id !== newTodo.id)
      .concat(newTodo);
    setSchedule((prev) => ({
      ...prev,
      [month]: newList,
    }));
  };

  const [color, setColor] = useState("pink");
  const { colorTheme, changeColorTheme } = useContext(ColorThemeContext);
  useEffect(() => {
    changeColorTheme(color);
  }, [color, changeColorTheme]);

  return (
    <div className={styles.box}>
      <CalendarBox
        date={date}
        handleDate={setDate}
        schedule={schedule}
        closeDetail={closeDetail}
      />
      <Schedule
        date={date}
        openModal={openModal}
        schedule={schedule}
        deleteTodoItem={deleteTodoItem}
        isList={isList}
        selectedTodo={selectedTodo}
        handleTodo={handleTodo}
        closeDetail={closeDetail}
        updateTodoItem={updateTodoItem}
      />
      <TodoAddModal
        open={modal}
        date={date}
        closeModal={closeModal}
        schedule={schedule}
        addSchedule={setSchedule}
      />
    </div>
  );
}
