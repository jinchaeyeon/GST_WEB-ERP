import Calendar from "react-calendar";
import styled from "styled-components";
import React, { useState } from "react";
import moment from "moment";

let height = window.innerHeight;

function App(props) {
  const [value, onChange] = useState(new Date());
  const day = moment(value).format("YYYY-MM-DD");
  const currDate = new Date();
  const currDateTime = moment(currDate).format("MM-DD");
  const mark = ["2023-09-02", "2023-09-04", "2023-09-11"];

  return (
    <CalendarContainer
      backgroundColor={props.color}
    >
      <Calendar
        calendarType="US"
        locale="ko-KO"
        formatDay={(locale, date) => moment(date).format("DD")}
        tileContent={({ date, view }) => {
          if (mark.find((x) => x === moment(date).format("YYYY-MM-DD"))) {
            return (
              <>
                <div style={{ paddingTop: "50px", position: "absolute" }}>
                  <div className="heart"></div>
                </div>
              </>
            );
          }
        }}
      />
    </CalendarContainer>
  );
}

export default App;

const CalendarContainer = styled.div`
  /* ~~~ container styles ~~~ */
  margin: auto;
  height: calc(100% - 20px);
  margin-top: 20px;
  background-color: #fff2cc;
  padding: 10px;
  border-radius: 3px;

  * {
    font-family: TheJamsil5Bold;
    font-size: 18px;
  }

  /* ~~~ navigation styles ~~~ */
  .react-calendar__navigation {
    display: flex;

    .react-calendar__navigation__label {
      font-weight: bold;
    }

    .react-calendar__navigation__arrow {
      flex-grow: 0.333;
    }
  }

  /* ~~~ label styles ~~~ */
  .react-calendar__month-view__weekdays {
    text-align: center;
    margin-bottom: 10px;
    margin-top: 10px;
  }

  /* ~~~ button styles ~~~ */
  button {
    margin: 3px;
    background-color: white;
    border: 0;
    border-radius: 3px;
    color: black;
    padding: 5px 0;
    position: relative;

    &:hover {
      background-color: #f9d202;
    }

    &:active {
      background-color: #f9d202;
    }
  }

  /* ~~~ day grid styles ~~~ */
  .react-calendar__month-view__days {
    display: grid !important;
    grid-template-columns: 14.2% 14.2% 14.2% 14.2% 14.2% 14.2% 14.2%;
    height: ${height - 250}px;

    .heart {
      width: 30px !important;
      height: 30px !important;
      position: relative !important;
      background: ${(props) => props.backgroundColor} !important;
      transform: rotate(45deg) !important;
      display: flex !important;
      justify-content: center !important;
    }
    .heart::before,
    .heart::after {
      content: "" !important;
      width: 30px !important;
      height: 30px !important;
      position: absolute !important;
      border-radius: 50% !important;
      background: ${(props) => props.backgroundColor} !important;
    }
    .heart::before {
      left: -50% !important;
    }
    .heart::after {
      top: -50% !important;
    }

    .react-calendar__tile {
      max-width: initial !important;
      display: flex;
      justify-content: center;
    }
    .react-calendar__tile {
      max-width: initial !important;
      display: flex;
      align-content: center;
      justify-content: center;
    }

    .react-calendar__tile--range {
      box-shadow: 0 0 6px 2px grey;
      background-color: #f9bb02;
    }
  }

  /* ~~~ neighboring month & weekend styles ~~~ */
  .react-calendar__month-view__days__day--neighboringMonth {
    opacity: 0.5;
    display: flex;
    justify-content: center;
    background-color: #d3d3d3;
  }
  .react-calendar__month-view__days__day--weekend {
    color: #ff4d4d;
    display: flex;
    justify-content: center;
  }

  /* ~~~ other view styles ~~~ */
  .react-calendar__year-view__months,
  .react-calendar__decade-view__years,
  .react-calendar__century-view__decades {
    display: grid !important;
    grid-template-columns: 20% 20% 20% 20% 20%;

    &.react-calendar__year-view__months {
      grid-template-columns: 33.3% 33.3% 33.3%;
    }

    .react-calendar__tile {
      max-width: initial !important;
    }
  }
`;
