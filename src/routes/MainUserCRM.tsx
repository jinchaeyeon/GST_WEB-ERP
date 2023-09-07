import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import {
  DataResult,
  State,
  process as processQuery,
} from "@progress/kendo-data-query";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  UseGetValueFromSessionItem,
  convertDateToStr,
  dateformat4,
  getDayOfWeeks,
  toDate2,
} from "../components/CommonFunction";
import { GAP } from "../components/CommonString";
import Calender from "../components/DDGDcomponents/Calender";
import CardBox from "../components/DDGDcomponents/CardBox";
import { useApi } from "../hooks/api";
import { loginResultState, sessionItemState } from "../store/atoms";
import { Iparameters } from "../store/types";
import "swiper/css";
import SwiperCore from "swiper";
import SelectDateWindow from "../components/Windows/DDGD/SelectDateWindow";
import { Button as Buttons } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
interface Tsize {
  width: number;
  height: number;
}

const DATA_ITEM_KEY = "custcd";
const Main: React.FC = () => {
  const processApi = useApi();
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const userName = loginResult ? loginResult.userName : "";
  const [cardOptionState, setCardOptionState] = useState<State>({
    sort: [],
  });
  const [cardOptionData, setCardOptionData] = useState<DataResult>(
    processQuery([], cardOptionState)
  );
  const [selectedState, setSelectedState] = useState<string>("");
  const [ChangeDateVisible, setChangeDateVisible] = useState<boolean>(false);
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const userId = loginResult ? loginResult.userId : "";
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const [changeDate, setChangeDate] = useState<string>("");
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 850;
  const size: Tsize = useWindowSize();
  function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      // Add event listener
      window.addEventListener("resize", handleResize);
      // Call handler right away so state gets updated with initial window size
      handleResize();
      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
  }
  useEffect(() => {
    if (sessionUserId === "") fetchSessionItem();
    // if (token && sessionUserId === "") fetchSessionItem();
  }, [sessionUserId]);

  const fetchSessionItem = useCallback(async () => {
    let data;
    try {
      const para: Iparameters = {
        procedureName: "sys_biz_configuration",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_user_id": userId,
        },
      };

      data = await processApi<any>("procedure", para);

      if (data.isSuccess === true) {
        const rows = data.tables[0].Rows;
        setSessionItem(
          rows
            .filter((item: any) => item.class === "Session")
            .map((item: any) => ({
              code: item.code,
              value: item.value,
            }))
        );
      }
    } catch (e: any) {
      console.log("menus error", e);
    }
  }, []);
  const [date, setDate] = useState<{ [name: string]: any }>({ date: null });
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setDate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const fetchMain = async () => {
    let data: any;
    const Parameters: Iparameters = {
      procedureName: "sys_sel_default_home_web",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "ATTENDANCE",
        "@p_orgdiv": "01",
        "@p_location": "",
        "@p_user_id": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_ref_date": convertDateToStr(new Date()),
        "@p_ref_key": "",
      },
    };
    try {
      data = await processApi<any>("procedure", Parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rowCount = data.tables[0].RowCount;
      const row = data.tables[0].Rows;

      if (rowCount > 0) {
        setCardOptionData((prev) => {
          return {
            data: row,
            total: rowCount == -1 ? 0 : rowCount,
          };
        });

        setSelectedState(row[0][DATA_ITEM_KEY]);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  useEffect(() => {
    fetchMain();
  }, []);

  const changeColor = (code: string) => {
    const newData = cardOptionData.data.map((item) =>
      item[DATA_ITEM_KEY] == selectedState
        ? {
            ...item,
            color: code,
          }
        : {
            ...item,
          }
    );

    setCardOptionData((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const fetchDetail = async (date: string) => {
    let datas: any = "";
    const Parameters = {
      procedureName: "P_CR_A1000W_Q",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": "01",
        "@p_custcd": selectedState,
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
        let ok = 0;
        let valid = true;
        row.map((item: any) => {
          if (valid == true) {
            if (item.date == date && item.finyn == "Y") {
              alert("이미 등원 완료된 일자입니다.");
              setChangeDate("");
              valid = false;
            } else if (
              item.date == date &&
              item.finyn == "N" &&
              item.appyn == "N"
            ) {
              alert("이미 변경신청이 완료된 일자입니다.");
              setChangeDate("");
              valid = false;
            } else if (item.date == date) {
              ok++;
            }
          }
        });

        if (ok == 0 && valid == true) {
          alert("해당 일자에는 등원예정이 없습니다.");
          setChangeDate("");
        } else if (valid == true) {
          if (!isMobile) {
            setChangeDateVisible(true);
          } else {
            if (swiper) {
              swiper.slideTo(2);
            }
          }
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(datas);
    }
  };

  const onSave = () => {
    if (date != null) {
    } else {
      alert("변경 등원일을 선택해주세요.");
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>{userName}님 안녕하세요!</Title>
      </TitleContainer>
      <GridContainerWrap height={"87vh"}>
        {!isMobile ? (
          <>
            <GridContainer
              width="25%"
              height="100%"
              style={{
                overflowY: "scroll",
                maxHeight: window.innerHeight - 100,
              }}
            >
              <GridTitleContainer>
                <GridTitle>
                  우리집 강아지
                  <img
                    src={`${process.env.PUBLIC_URL}/PuppyFoot.png`}
                    alt=""
                    width={"30px"}
                    height={"30px"}
                    style={{ marginLeft: "5px", marginBottom: "-3px" }}
                  />
                </GridTitle>
              </GridTitleContainer>
              <Grid container spacing={2}>
                {cardOptionData.data.map((item) => (
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <CardBox
                      name={item.custnm}
                      class={item.class}
                      date={`${dateformat4(item.strdt)} ~ ${dateformat4(
                        item.enddt
                      )}`}
                      attendance={item.useqty}
                      change={item.adjqty}
                      backgroundColor={item.color}
                      day={getDayOfWeeks(item.dayofweek)}
                      fontsize={size.width < 600 ? "1.8rem" : "3.3rem"}
                      propFunction={(code: string) => changeColor(code)}
                      Click={() => setSelectedState(item[DATA_ITEM_KEY])}
                    />
                  </Grid>
                ))}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(75% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>
                  등원 스케줄 관리
                  <img
                    src={`${process.env.PUBLIC_URL}/PuppyFoot.png`}
                    alt=""
                    width={"30px"}
                    height={"30px"}
                    style={{ marginLeft: "5px", marginBottom: "-3px" }}
                  />
                </GridTitle>
              </GridTitleContainer>
              <Calender
                data={
                  cardOptionData.data.filter(
                    (item) => item[DATA_ITEM_KEY] == selectedState
                  )[0]
                }
                propFunction={(date: string) => {
                  setChangeDate(date);
                  fetchDetail(date);
                }}
              />
            </GridContainer>
          </>
        ) : (
          <Swiper
            className="mySwiper"
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer height="100%" width="100%">
                <TitleContainer>
                  <Title>
                    우리집 강아지
                    <img
                      src={`${process.env.PUBLIC_URL}/PuppyFoot.png`}
                      alt=""
                      width={"30px"}
                      height={"30px"}
                      style={{ marginLeft: "5px", marginBottom: "-3px" }}
                    />
                  </Title>
                </TitleContainer>
                <Grid container spacing={2}>
                  {cardOptionData.data.map((item) => (
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <CardBox
                        name={item.custnm}
                        class={item.class}
                        date={`${dateformat4(item.strdt)} ~ ${dateformat4(
                          item.enddt
                        )}`}
                        attendance={item.useqty}
                        change={item.adjqty}
                        backgroundColor={item.color}
                        day={getDayOfWeeks(item.dayofweek)}
                        fontsize={size.width < 600 ? "1.8rem" : "3.3rem"}
                        propFunction={(code: string) => changeColor(code)}
                        Click={() => {
                          setSelectedState(item[DATA_ITEM_KEY]);
                          setChangeDate("");
                          if (swiper) {
                            swiper.slideTo(1);
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <div style={{width: "100%", height: "100%"}}>
                <TitleContainer>
                  <Title>
                    {cardOptionData.data.filter(
                      (item) => item[DATA_ITEM_KEY] == selectedState
                    )[0] == undefined
                      ? ""
                      : cardOptionData.data.filter(
                          (item) => item[DATA_ITEM_KEY] == selectedState
                        )[0].custnm}
                    의 스케줄 관리
                    <img
                      src={`${process.env.PUBLIC_URL}/PuppyFoot.png`}
                      alt=""
                      width={"30px"}
                      height={"30px"}
                      style={{ marginLeft: "5px", marginBottom: "-3px" }}
                    />
                  </Title>
                </TitleContainer>
                <Calender
                  data={
                    cardOptionData.data.filter(
                      (item) => item[DATA_ITEM_KEY] == selectedState
                    )[0]
                  }
                  propFunction={(date: string) => {
                    setChangeDate(date);
                    fetchDetail(date);
                  }}
                />
                </div>
            </SwiperSlide>
            {changeDate != "" ? (
              <SwiperSlide key={2}>
                <GridContainer height="100%" width="100%">
                  <TitleContainer>
                    <Title>
                      {
                        cardOptionData.data.filter(
                          (item) => item[DATA_ITEM_KEY] == selectedState
                        )[0].custnm
                      }
                      의 등원 변경신청
                      <img
                        src={`${process.env.PUBLIC_URL}/PuppyFoot.png`}
                        alt=""
                        width={"30px"}
                        height={"30px"}
                        style={{ marginLeft: "5px", marginBottom: "-3px" }}
                      />
                    </Title>
                  </TitleContainer>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Card
                        style={{
                          width: "100%",
                          marginRight: "15px",
                          borderRadius: "10px",
                          backgroundColor: "white",
                        }}
                      >
                        <CardHeader
                          title={
                            <>
                              <Typography
                                style={{
                                  color: "black",
                                  fontSize: "20px",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  fontFamily: "TheJamsil5Bold",
                                }}
                              >
                                <img
                                  src={`${process.env.PUBLIC_URL}/Born.png`}
                                  alt=""
                                  width={"20px"}
                                  height={"20px"}
                                  style={{
                                    marginRight: "2px",
                                    marginBottom: "2px",
                                  }}
                                />
                                {
                                  cardOptionData.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] == selectedState
                                  )[0].custnm
                                }
                                의 등원 변경 남은 횟수
                              </Typography>
                            </>
                          }
                        />
                        <CardContent style={{ display: "flex" }}>
                          <Typography
                            style={{
                              color: "black",
                              fontSize: "25px",
                              fontWeight: 500,
                              fontFamily: "TheJamsil5Bold",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {
                              cardOptionData.data.filter(
                                (item) => item[DATA_ITEM_KEY] == selectedState
                              )[0].adjqty
                            }회
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Card
                        style={{
                          width: "100%",
                          marginRight: "15px",
                          borderRadius: "10px",
                          backgroundColor: "white",
                        }}
                      >
                        <CardHeader
                          title={
                            <>
                              <Typography
                                style={{
                                  color: "black",
                                  fontSize: "20px",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  fontFamily: "TheJamsil5Bold",
                                }}
                              >
                                <img
                                  src={`${process.env.PUBLIC_URL}/Born.png`}
                                  alt=""
                                  width={"20px"}
                                  height={"20px"}
                                  style={{
                                    marginRight: "2px",
                                    marginBottom: "2px",
                                  }}
                                />
                               선택 등원일
                              </Typography>
                            </>
                          }
                        />
                        <CardContent style={{ display: "flex" }}>
                          <Typography
                            style={{
                              color: "black",
                              fontSize: "25px",
                              fontWeight: 500,
                              fontFamily: "TheJamsil5Bold",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {dateformat4(changeDate)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Card
                        style={{
                          width: "100%",
                          marginRight: "15px",
                          borderRadius: "10px",
                          backgroundColor: cardOptionData.data.filter(
                            (item) => item[DATA_ITEM_KEY] == selectedState
                          )[0].color,
                        }}
                      >
                        <CardHeader
                          title={
                            <>
                              <Typography
                                style={{
                                  color: "black",
                                  fontSize: "20px",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  fontFamily: "TheJamsil5Bold",
                                }}
                              >
                                <img
                                  src={`${process.env.PUBLIC_URL}/Born.png`}
                                  alt=""
                                  width={"20px"}
                                  height={"20px"}
                                  style={{
                                    marginRight: "2px",
                                    marginBottom: "2px",
                                  }}
                                />
                                변경 등원일
                              </Typography>
                            </>
                          }
                        />
                        <CardContent style={{ display: "flex" }}>
                          <Typography
                            style={{
                              color: "#8f918d",
                              fontSize: "25px",
                              fontWeight: 500,
                              fontFamily: "TheJamsil5Bold",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <DatePicker
                              name="date"
                              value={date.date}
                              format="yyyy-MM-dd"
                              onChange={filterInputChange}
                              className="required"
                              placeholder=""
                              size={"large"}
                            />
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <ButtonContainer>
                        <Buttons
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(1);
                            }
                            setChangeDate("");
                          }}
                          style={{ width: "48%", backgroundColor: "#D3D3D3"}}
                        >
                          취소
                        </Buttons>
                        <Buttons
                          themeColor={"primary"}
                          onClick={onSave}
                          style={{ width: "48%" }}
                        >
                          변경신청
                        </Buttons>
                      </ButtonContainer>
                    </Grid>
                  </Grid>
                </GridContainer>
              </SwiperSlide>
            ) : (
              ""
            )}
          </Swiper>
        )}
      </GridContainerWrap>
      {ChangeDateVisible && (
        <SelectDateWindow
          setVisible={setChangeDateVisible}
          data={cardOptionData.data.filter((item) => item[DATA_ITEM_KEY] == selectedState)[0]}
          changeDate={changeDate}
          reload={() => fetchMain()}
        />
      )}
    </>
  );
};

export default Main;
