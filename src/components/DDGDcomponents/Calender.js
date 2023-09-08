import moment from "moment";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import styled from "styled-components";
import { convertDateToStr } from "../CommonFunction";
import { useApi } from "../../hooks/api";

function App(props) {
  const data =
    props.data == undefined
      ? {
          adjqty: 0,
          class: "1",
          color: "#fff2cc",
          custcd: "A000",
          custnm: "",
          dayofweek: 20,
          enddt: "20230831",
          strdt: "20230901",
          useqty: 0,
        }
      : props.data;

  const [value, onChange] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const storageKey = "__holidays";
  const [schedulerData, setSchedulerData] = useState([]);
  const processApi = useApi();
  const fetchMain = async () => {
    let datas = "";
    const Parameters = {
      procedureName: "P_CR_A1000W_Q",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": "01",
        "@p_custcd": data.custcd == undefined ? "" : data.custcd,
      },
    };
    try {
      datas = await processApi("procedure", Parameters);
    } catch (error) {
      datas = null;
    }

    if (datas.isSuccess === true) {
      const rowCount = datas.tables[0].RowCount;
      const row = datas.tables[0].Rows;

      if (rowCount > 0) {
        setSchedulerData(row);
      }
    } else {
      console.log("[오류 발생]");
      console.log(datas);
    }
  };

  useEffect(() => {
    fetchMain();
    onChange(null);
  }, [props]);

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
    props.propFunction(convertDateToStr(date));
  };
  
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 850;

  return (
    <CalendarContainer backgroundColor={data.color}>
      {isMobile ? (
        <>
          <div style={{ display: "block", width: "100%" }}>
            <img
              src={`${process.env.PUBLIC_URL}/Born.png`}
              alt=""
              width={"20px"}
              height={"20px"}
              style={{
                marginRight: "2px",
                paddingTop: "5px",
                paddingBottom: "-5px",
              }}
            />
            {data.custnm}
          </div>
          <div style={{ display: "block", width: "100%", marginTop: "3px" }}>
            <p
              style={{
                marginLeft: "15px",
                marginRight: "5px",
                display: "inline",
                fontSize: "14px",
              }}
            >
              등원 완료 :
            </p>
            <span
              class="k-icon k-i-heart k-icon-md"
              style={{
                color: "#D3D3D3",
                backgroundColor: "white",
                borderRadius: "30px",
                fontSize: "14px",
              }}
            ></span>
            <p
              style={{
                marginLeft: "15px",
                marginRight: "5px",
                display: "inline",
                fontSize: "14px",
              }}
            >
              등원 예정 :
            </p>
            <span
              class="k-icon k-i-heart k-icon-md"
              style={{
                color: data.color,
                backgroundColor: "white",
                borderRadius: "30px",
                fontSize: "14px",
              }}
            ></span>
            <p
              style={{
                marginLeft: "15px",
                marginRight: "5px",
                display: "inline",
                fontSize: "14px",
              }}
            >
              변경 신청 완료 :
            </p>
            <span
              class="k-icon k-i-heart k-icon-md"
              style={{
                color: "#F9D202",
                backgroundColor: "white",
                borderRadius: "30px",
                fontSize: "14px",
              }}
            ></span>
          </div>
        </>
      ) : (
        <div style={{ display: "inline-block", width: "100%" }}>
          <img
            src={`${process.env.PUBLIC_URL}/Born.png`}
            alt=""
            width={"20px"}
            height={"20px"}
            style={{
              marginRight: "2px",
              paddingTop: "5px",
              paddingBottom: "-5px",
            }}
          />
          {data.custnm}
          <p
            style={{
              marginLeft: "15px",
              marginRight: "5px",
              display: "inline",
            }}
          >
            등원 완료 :
          </p>
          <span
            class="k-icon k-i-heart k-icon-md"
            style={{
              color: "#D3D3D3",
              backgroundColor: "white",
              borderRadius: "30px",
            }}
          ></span>
          <p
            style={{
              marginLeft: "15px",
              marginRight: "5px",
              display: "inline",
            }}
          >
            등원 예정 :
          </p>
          <span
            class="k-icon k-i-heart k-icon-md"
            style={{
              color: data.color,
              backgroundColor: "white",
              borderRadius: "30px",
            }}
          ></span>
          <p
            style={{
              marginLeft: "15px",
              marginRight: "5px",
              display: "inline",
            }}
          >
            변경 신청 완료 :
          </p>
          <span
            class="k-icon k-i-heart k-icon-md"
            style={{
              color: "#F9D202",
              backgroundColor: "white",
              borderRadius: "30px",
            }}
          ></span>
        </div>
      )}

      <Calendar
        calendarType="US"
        locale="ko-KO"
        selected={value}
        minDate={new Date()}
        tileDisabled={({ date, view }) =>
          view === "month" && holidays.includes(moment(date).format("YYYYMMDD"))
        }
        onChange={(date) => changeDate(date)}
        tileContent={({ date, view }) => {
          if (
            schedulerData.find((x) => x.date == moment(date).format("YYYYMMDD"))
          ) {
            if (
              schedulerData.find(
                (x) =>
                  x.date == moment(date).format("YYYYMMDD") && x.finyn == "Y"
              )
            ) {
              return (
                <>
                  <div style={{ paddingTop: "30px", position: "absolute" }}>
                    {!isMobile ? (
                      <span
                        class="k-icon k-i-heart"
                        style={{ color: "#D3D3D3", fontSize: "3vw"}}
                      ></span>
                    ) : (
                      <span
                        class="k-icon k-i-heart"
                        style={{
                          color: "#D3D3D3",
                        }}
                      ></span>
                    )}
                  </div>
                </>
              );
            } else if (
              schedulerData.find(
                (x) =>
                  x.date == moment(date).format("YYYYMMDD") &&
                  x.finyn == "N" &&
                  x.appyn == "N"
              )
            ) {
              return (
                <>
                  <div style={{ paddingTop: "30px", position: "absolute" }}>
                    {!isMobile ? (
                      <span
                        class="k-icon k-i-heart"
                        style={{ color: "#F9D202", fontSize: "3vw"}}
                      ></span>
                    ) : (
                      <span
                        class="k-icon k-i-heart"
                        style={{
                          color: "#F9D202",
                        }}
                      ></span>
                    )}
                  </div>
                </>
              );
            } else {
              return (
                <>
                  <div style={{ paddingTop: "30px", position: "absolute" }}>
                    {!isMobile ? (
                      <span
                        class="k-icon k-i-heart"
                        style={{ color: data.color, fontSize: "3vw"}}
                      ></span>
                    ) : (
                      <span
                        class="k-icon k-i-heart"
                        style={{
                          color: data.color,
                        }}
                      ></span>
                    )}
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
  height: 85vh;
  background-color: ${(props) => props.backgroundColor};
  padding: 10px;
  border-radius: 3px;

  * {
    font-family: TheJamsil5Bold;
    font-size: 18px;

    @media (max-width: 850px) {
      font-size: 14px;
    }
  }

  .react-calendar__viewContainer {
    height: 95%;
  }

  .react-calendar__month-view {
    height: 95%;

    & > div{
      height: 95%;
      display: block !important;

      & > div{
        height: 100%;
      }
    }
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
    border: 1px solid grey;

    &:disabled {
      background-color: #d3d3d3;
      opacity: 0.5;
      color: #ff4d4d;
      cursor: not-allowed;
    }

    &:hover {
      background-color: ${(props) => props.backgroundColor};
    }

    &:active {
      background-color: ${(props) => props.backgroundColor};
    }
  }

  /* ~~~ day grid styles ~~~ */
  .react-calendar__month-view__days {
    display: grid !important;
    grid-template-columns: 14.2% 14.2% 14.2% 14.2% 14.2% 14.2% 14.2%;
    height: 95%;

    @media (max-width: 850px) {
      height: 95%;
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
      background-color: ${(props) => props.backgroundColor};
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
