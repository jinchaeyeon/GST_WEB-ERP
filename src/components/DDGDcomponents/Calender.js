import moment from "moment";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import styled from "styled-components";
import { convertDateToStr } from "../CommonFunction";

let height = window.innerHeight;

function App(props) {
  const [value, onChange] = useState(new Date());
  const day = moment(new Date()).format("YYYYMMDD");
  const [checked, setChecked] = React.useState(false);
  const [holidays, setHolidays] = useState([]);
  const storageKey = "__holidays";
  const mark = ["20230901", "20230904", "20230908"];
  useEffect(() => {
    if (holidays.length == 0) {
      const storageHolidays = localStorage.getItem(storageKey);
      if (storageHolidays) {
        /** localStorage에 저장되어 있다면 그 값을 사용 */
        const newHolidays = JSON.parse(storageHolidays);
        setHolidays(newHolidays);
      } else {
        /** localStorage에 값이 없다면 Google Calendar API 호출 */
        const calendarId =
          "ko.south_korea.official%23holiday%40group.v.calendar.google.com";
        const apiKey = "AIzaSyAByXhstT-FdBVgDTO-cqhHk-IBBjDSwAY";
        const startDate = new Date("2000-01-01").toISOString();
        const endDate = new Date("2070-12-31").toISOString();
        fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&orderBy=startTime&singleEvents=true&timeMin=${startDate}&timeMax=${endDate}`
        ).then((response) => {
          response.json().then((result) => {
            const newHolidays = result.items.map((item) =>
              convertDateToStr(new Date(item.start.date))
            );
            setHolidays(newHolidays);
            localStorage.setItem(storageKey, JSON.stringify(newHolidays));
          });
        });
      }
    }
  }, []);

  const changeDate = (date) => {
    console.log(moment(date).format("YYYYMMDD"));
  };

  const handleToggleSwitch = () => {
    setChecked(!checked);
  };

  return (
    <CalendarContainer backgroundColor={props.color}>
      <div style={{ display: "inline-block", width: "100%"}}>
        <img
          src={`${process.env.PUBLIC_URL}/Born.png`}
          alt=""
          width={"20px"}
          height={"20px"}
          style={{ marginRight: "2px", paddingTop: "5px", paddingBottom: "-5px"}}
        />
        강아지 이름
        <p style={{ marginLeft: "30px", display: "inline" }}>등원 완료 :</p>
        <span
          class="k-icon k-i-heart k-icon-md"
          style={{ color: "#D3D3D3", backgroundColor: "white" }}
        ></span>
        <p style={{ marginLeft: "30px", display: "inline" }}>등원 예정 :</p>
        <span
          class="k-icon k-i-heart k-icon-md"
          style={{ color: props.color, backgroundColor: "white" }}
        ></span>
        <div style={{ float: "right" }}>
          <button
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
            onClick={handleToggleSwitch}
            style={{ width: "200px" }}
          >
            변경 버튼 - 현재 상태 : {checked == true ? "가능" : "불가능"}
          </button>
        </div>
      </div>
      <Calendar
        calendarType="US"
        locale="ko-KO"
        selected={value}
        minDate={checked ? new Date() : undefined}
        tileDisabled={({ date }) =>
          holidays.includes(moment(date).format("YYYYMMDD"))
        }
        onChange={(date) => changeDate(date)}
        formatDay={(locale, date) => moment(date).format("DD")}
        tileContent={({ date, view }) => {
          if (mark.find((x) => x === moment(date).format("YYYYMMDD"))) {
            if (moment(date).format("YYYYMMDD") < day) {
              return (
                <>
                  <div style={{ paddingTop: "30px", position: "absolute" }}>
                    <span
                      class="k-icon k-i-heart k-icon-xl"
                      style={{ color: "#D3D3D3" }}
                    ></span>
                  </div>
                </>
              );
            } else {
              return (
                <>
                  <div style={{ paddingTop: "30px", position: "absolute" }}>
                    <span
                      class="k-icon k-i-heart k-icon-xl"
                      style={{ color: props.color }}
                    ></span>
                  </div>
                </>
              );
            }
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
  height: 100%;
  background-color: ${(props) => props.backgroundColor};
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

    &:disabled {
      background-color: #d3d3d3;
      opacity: 0.5;
      color: #ff4d4d;
    }

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
    height: ${height - 280}px;

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
  .react-calendar__month-view__days__day--weekend {
    color: #ff4d4d;
    display: flex;
    justify-content: center;
    background-color: #d3d3d3;
    cursor: not-allowed;
    opacity: 0.5;
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
