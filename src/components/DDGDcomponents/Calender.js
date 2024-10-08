import FavoriteIcon from "@mui/icons-material/Favorite";
import { process } from "@progress/kendo-data-query";
import moment from "moment";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import styled from "styled-components";
import { useApi } from "../../hooks/api";
import {
  UseGetValueFromSessionItem,
  convertDateToStr,
} from "../CommonFunction";
function App(props) {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
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
        "@p_orgdiv": sessionOrgdiv,
        "@p_custcd": data.custcd == undefined ? "" : data.custcd,
        "@p_adjdt": "",
      },
    };
    try {
      datas = await processApi("procedure", Parameters);
    } catch (error) {
      datas = null;
    }

    if (datas.isSuccess == true) {
      const rowCount = datas.tables[0].RowCount;
      const row = datas.tables[0].Rows;

      setSchedulerData(row);
    } else {
      console.log("[오류 발생]");
      console.log(datas);
    }
  };

  const [mainDataState, setMainDataState] = useState({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState(
    process([], mainDataState)
  );
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState({
    work_type: "holiday",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    resource_type: "",
    yyyymm: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data;

    //조회조건 파라미터
    const parameters = {
      procedureName: "P_PS_A0060W_301_Q",
      pageNumber: 1,
      pageSize: 10000,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_resource_type": filters.resource_type,
        "@p_yyyymm": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };
  useEffect(() => {
    fetchMain();
    fetchMainGrid();
    onChange(null);
  }, [props]);
  return (
    <CalendarContainer backgroundColor={data.color} isMobile={isMobile}>
      {isMobile ? (
        <>
          <div style={{ display: "block", width: "100%" }}>
            <img
              src={`/Born.png`}
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
            <FavoriteIcon
              sx={{
                color: "#D3D3D3",
                backgroundColor: "white",
                borderRadius: "30px",
                fontSize: "14px",
                marginBottom: "-5px",
              }}
            />
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
            <FavoriteIcon
              sx={{
                color: data.color,
                backgroundColor: "white",
                borderRadius: "30px",
                marginBottom: "-5px",
                fontSize: "14px",
              }}
            />
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
            <FavoriteIcon
              sx={{
                color: "#f5b901",
                backgroundColor: "white",
                borderRadius: "30px",
                marginBottom: "-5px",
                fontSize: "14px",
              }}
            />
          </div>
        </>
      ) : (
        <div style={{ display: "inline-block", width: "100%" }}>
          <img
            src={`/Born.png`}
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
          <FavoriteIcon
            sx={{
              color: "#D3D3D3",
              backgroundColor: "white",
              borderRadius: "30px",
              marginBottom: "-5px",
            }}
          />
          <p
            style={{
              marginLeft: "15px",
              marginRight: "5px",
              display: "inline",
            }}
          >
            등원 예정 :
          </p>
          <FavoriteIcon
            sx={{
              color: data.color,
              backgroundColor: "white",
              borderRadius: "30px",
              marginBottom: "-5px",
            }}
          />
          <p
            style={{
              marginLeft: "15px",
              marginRight: "5px",
              display: "inline",
            }}
          >
            변경 신청 완료 :
          </p>
          <FavoriteIcon
            sx={{
              color: "#f5b901",
              backgroundColor: "white",
              borderRadius: "30px",
              marginBottom: "-5px",
            }}
          />
        </div>
      )}

      <Calendar
        className={"DDGDCalendar"}
        calendarType="US"
        locale="ko-KO"
        selected={value}
        tileDisabled={({ date, view }) =>
          view == "month" &&
          mainDataResult.data.find(
            (x) => x.date == moment(date).format("YYYYMMDD")
          )
        }
        tileClassName={({ date, view }) =>
          view == "month" &&
          !mainDataResult.data.find(
            (x) => x.date == moment(date).format("YYYYMMDD")
          ) &&
          !schedulerData.find(
            (x) =>
              x.date == moment(date).format("YYYYMMDD") &&
              x.finyn == "N" &&
              x.appyn == "Y" &&
              x.planyn == "Y"
          )
            ? "no"
            : "yes"
        }
        onChange={(date) => props.propFunction(convertDateToStr(date))}
        tileContent={({ date, view }) => {
          if (
            schedulerData.find((x) => x.date == moment(date).format("YYYYMMDD"))
          ) {
            if (
              !mainDataResult.data.find(
                (x) => x.date == moment(date).format("YYYYMMDD")
              )
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
                        <>
                          <FavoriteIcon
                            sx={{
                              color: "#D3D3D3",
                              fontSize: "3vw",
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <FavoriteIcon
                            sx={{
                              color: "#D3D3D3",
                            }}
                          />
                        </>
                      )}
                    </div>
                  </>
                );
              } else {
                if (
                  schedulerData.find(
                    (x) =>
                      x.date == moment(date).format("YYYYMMDD") &&
                      x.appyn == "N"
                  )
                ) {
                  return (
                    <>
                      <div style={{ paddingTop: "30px", position: "absolute" }}>
                        {!isMobile ? (
                          <>
                            <FavoriteIcon
                              sx={{
                                color: "#f5b901",
                                fontSize: "3vw",
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <FavoriteIcon
                              sx={{
                                color: "#f5b901",
                              }}
                            />
                          </>
                        )}
                      </div>
                    </>
                  );
                } else {
                  if (
                    schedulerData.find(
                      (x) =>
                        x.date == moment(date).format("YYYYMMDD") &&
                        x.planyn == "Y"
                    )
                  ) {
                    return (
                      <>
                        <div
                          style={{ paddingTop: "30px", position: "absolute" }}
                        >
                          {!isMobile ? (
                            <>
                              <FavoriteIcon
                                sx={{
                                  color: data.color,
                                  fontSize: "3vw",
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <FavoriteIcon
                                sx={{
                                  color: data.color,
                                }}
                              />
                            </>
                          )}
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <div style={{ bottom: "10px", position: "absolute" }}>
                          {
                            schedulerData.filter(
                              (item) =>
                                item.date == moment(date).format("YYYYMMDD")
                            )[0].capqty
                          }
                        </div>
                      </>
                    );
                  }
                }
              }
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
  height: ${(props) =>
    props.isMobile ? "100vh !important;" : "calc(100% - 40px) !important;"}
  background-color: ${(props) => props.backgroundColor};
  padding: 10px;
  border-radius: 3px;

  @media (max-width: 1200px) {
    height: 100%;
  }

  .no {
    background-color: #d3d3d3;
    opacity: 0.5;
    color: black;
    cursor: not-allowed !important;
    pointer-events: none;
  }

  * {
    font-family: TheJamsil5Bold;
    font-size: 18px;

    @media (max-width: 1200px) {
      font-size: 14px;
    }
  }

  .react-calendar__viewContainer {
    height: 95%;
  }

  .react-calendar__month-view {
    height: 95%;

    & > div {
      height: 95%;
      display: block !important;

      & > div {
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
      cursor: not-allowed !important;
      pointer-events: none;
    }

    &:hover {
      cursor: pointer;
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

    @media (max-width: 1200px) {
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
      cursor: pointer;
    }
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
