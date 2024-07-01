import { useEffect, useState } from "react";
import styles from "./Calendar.module.css";
import CalendarBox from "./CalendarBox";
import Schedule from "./Schedule";
import TodoAddModal from "./TodoAddModal";

let deletedRow = [];

export default function Calendar(props) {
  const [colorList, setColorList] = useState([]);
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
  const deleteTodoItem = (id) => {
    deletedRow.push(schedule.filter((todo) => todo.id == id)[0]);
    const newList = schedule.filter((todo) => todo.id !== id);
    setSchedule(newList);
    props.reload(deletedRow, newList);
  };
  const updateTodoItem = (newTodo) => {
    const items = schedule.filter((todo) => todo.id == newTodo.id);
    const newList = schedule.filter((todo) => todo.id !== newTodo.id).concat({
      ...newTodo,
      rowstatus: items[0].rowstatus == "N" ? "N" : "U"
    });
    setSchedule(newList);
    props.reload(deletedRow, newList);
  };

  const addTodoItem = (newTodo) => {
    const newList = schedule.concat({
      ...newTodo,
      rowstatus: "N"
    });
    setSchedule(newList);
    props.reload(deletedRow, newList);
  };

  useEffect(() => {
    //초기 props셋팅
    setColorList(props.colorData);
    setSchedule(props.schedulerDataResult);
    setIsList(true);
  }, [props]);

  return (
    <div className={styles.box}>
      <CalendarBox
        date={date}
        handleDate={setDate}
        schedule={schedule}
        closeDetail={closeDetail}
        colorList={colorList}
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
        colorList={colorList}
        permissions={props.permissions}
      />
      <TodoAddModal
        open={modal}
        date={date}
        closeModal={closeModal}
        schedule={schedule}
        addSchedule={addTodoItem}
        colorList={colorList}
        permissions={props.permissions}
        person={props.person}
      />
    </div>
  );
}
