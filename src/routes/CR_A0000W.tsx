import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import {
  DataResult,
  State,
  process as processQuery,
} from "@progress/kendo-data-query";
import { Button as Buttons } from "@progress/kendo-react-buttons";
import {
  Calendar,
  CalendarChangeEvent,
} from "@progress/kendo-react-dateinputs";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
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
  UseParaPc,
  convertDateToStr,
  dateformat4,
  getDayOfWeeks,
} from "../components/CommonFunction";
import { GAP } from "../components/CommonString";
import Calender from "../components/DDGDcomponents/Calender";
import CardBox from "../components/DDGDcomponents/CardBox";
import SelectDateWindow from "../components/Windows/DDGD/SelectDateWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState, sessionItemState } from "../store/atoms";
import { Iparameters } from "../store/types";
interface Tsize {
  width: number;
  height: number;
}
const DATA_ITEM_KEY = "custcd";
const CR_A0000W: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const userName = loginResult ? loginResult.userName : "";
  const [cardOptionState, setCardOptionState] = useState<State>({
    sort: [],
  });
  const [schedulerState, setSchedulerState] = useState<State>({
    sort: [],
  });
  const [cardOptionData, setCardOptionData] = useState<DataResult>(
    processQuery([], cardOptionState)
  );
  const [schedulerData, setSchedulerData] = useState<DataResult>(
    processQuery([], schedulerState)
  );
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [selectedState, setSelectedState] = useState<string>("");
  const [ChangeDateVisible, setChangeDateVisible] = useState<boolean>(false);
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [slice, setSlice] = useState(false);
  const userId = loginResult ? loginResult.userId : "";
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [changeDate, setChangeDate] = useState<string>("");
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const size: Tsize = useWindowSize();
  const [adjnumber, setAdjnumber] = useState<number>(0);
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
          width: document.documentElement.clientWidth,
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
    if (sessionUserId == "") fetchSessionItem();
    // if (token && sessionUserId == "") fetchSessionItem();
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

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        setSessionItem(
          rows
            .filter((item: any) => item.class == "Session")
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
  const [date, setDate] = useState<Date | null>(null);
  const filterInputChange = async (event: CalendarChangeEvent) => {
    const dayOfWeek = event.value.getDay();
    if (!(convertDateToStr(event.value) < convertDateToStr(new Date()))) {
      if (
        !(
          convertDateToStr(event.value) >
          cardOptionData.data.filter(
            (item) => item[DATA_ITEM_KEY] == selectedState
          )[0].enddt
        )
      ) {
        // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          let datas: any = "";
          const Parameters = {
            procedureName: "P_CR_A1000W_Q",
            pageNumber: 1,
            pageSize: 100,
            parameters: {
              "@p_work_type": "CAPACITY",
              "@p_orgdiv": sessionOrgdiv,
              "@p_custcd": selectedState,
              "@p_adjdt": convertDateToStr(event.value),
            },
          };

          try {
            datas = await processApi("procedure", Parameters);
          } catch (error) {
            datas = null;
          }

          if (datas.isSuccess == true) {
            const rowCount = datas.tables[0].RowCount;
            const row = datas.tables[0].Rows[0];

            if (rowCount > 0) {
              setAdjnumber(row.cnt);
            } else {
              setAdjnumber(0);
            }
            setDate(event.value);
            setShow2(false);
            setShow(false);
          } else {
            console.log("[오류 발생]");
            console.log(datas);
          }
        }
      } else {
        setShow(true);
        setShow2(false);
      }
    } else {
      setShow2(true);
      setShow(false);
    }
  };

  const fetchMain = async (key: any) => {
    let data: any;
    const Parameters: Iparameters = {
      procedureName: "sys_sel_default_home_web",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "ATTENDANCE",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_ref_date": convertDateToStr(new Date()),
        "@p_ref_key": "",
        "@p_user_id": userId,
      },
    };
    try {
      data = await processApi<any>("procedure", Parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rowCount = data.tables[0].RowCount;
      const row = data.tables[0].Rows;
      setCardOptionData((prev) => {
        return {
          data: row,
          total: rowCount == -1 ? 0 : rowCount,
        };
      });
      if (rowCount > 0) {
        if (key != "") {
          setSelectedState(key);
        } else {
          setSelectedState(row[0][DATA_ITEM_KEY]);
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  useEffect(() => {
    fetchMain("");
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

  const fetchDetail = async () => {
    let datas: any = "";
    const Parameters = {
      procedureName: "P_CR_A1000W_Q",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": sessionOrgdiv,
        "@p_custcd": selectedState,
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
      const row = datas.tables[0].Rows.map((prev: any) => ({
        ...prev,
        rowstatus: "U",
      }));

      setSchedulerData((prev) => {
        return {
          data: row,
          total: rowCount,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(datas);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: 100,
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    custcd: "",
    membership_key: "",
    adjdt: "",
    userid: userId,
    pc: pc,
    form_id: "HOME",
  });

  const para: Iparameters = {
    procedureName: "P_CR_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_custcd": ParaData.custcd,
      "@p_membership_key": ParaData.membership_key,
      "@p_adjdt": ParaData.adjdt,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HOME",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      alert("신청이 완료되었습니다.");
      if (isMobile) {
        if (swiper) {
          swiper.slideTo(1);
        }
      } else {
        setChangeDateVisible(false);
      }
      fetchMain(selectedState);
      setParaData({
        pgSize: 100,
        workType: "",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        custcd: "",
        membership_key: "",
        adjdt: "",
        userid: userId,
        pc: pc,
        form_id: "HOME",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data.resultMessage);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onSave = async (
    pastday: string,
    currentday: string,
    show: boolean,
    show2: boolean
  ) => {
    if (show != true && show2 != true) {
      if (currentday != null) {
        const data = cardOptionData.data.filter(
          (item) => item[DATA_ITEM_KEY] == selectedState
        )[0];
        if (currentday > data.enddt) {
          setShow(true);
        } else if (currentday < convertDateToStr(new Date())) {
          setShow2(true);
        } else {
          const find_key = schedulerData.data.filter(
            (item) => item.date == pastday
          )[0].membership_key;
          if (find_key != undefined) {
            let datas: any = "";
            const Parameters = {
              procedureName: "P_CR_A1000W_Q",
              pageNumber: 1,
              pageSize: 100,
              parameters: {
                "@p_work_type": "ADJQTY",
                "@p_orgdiv": sessionOrgdiv,
                "@p_custcd": selectedState,
                "@p_adjdt": currentday,
              },
            };

            try {
              datas = await processApi("procedure", Parameters);
            } catch (error) {
              datas = null;
            }

            if (datas.isSuccess == true) {
              const rowCount = datas.tables[0].RowCount;
              const row = datas.tables[0].Rows[0];

              if (rowCount > 0) {
                if (
                  !window.confirm(
                    `잔여 변경 횟수는 ${row.adjqty}회 입니다. 변경신청 후 취소 할 수 없습니다. 신청하시겠습니까?`
                  )
                ) {
                  return false;
                }

                setParaData((prev) => ({
                  ...prev,
                  workType: "N",
                  custcd: selectedState,
                  membership_key: find_key,
                  adjdt: currentday,
                }));
              }
            } else {
              console.log("[오류 발생]");
              console.log(datas);
            }
          }
        }
      } else {
        alert("변경 등원일을 선택해주세요.");
      }
    }
  };
  useEffect(() => {
    if (swiper) {
      swiper.slideTo(2);
    }
  }, [slice]);
  useEffect(() => {
    fetchDetail();
  }, [selectedState]);
  return (
    <>
      <div style={{ fontFamily: "TheJamsil5Bold", height: "100%" }}>
        <TitleContainer style={{ display: "block" }}>
          <Title>{userName}님 안녕하세요!</Title>
        </TitleContainer>
        {!isMobile ? (
          <>
            <GridContainerWrap height={"90%"}>
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
                      src={`/PuppyFoot.png`}
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
                        code={item.custcd}
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
              <GridContainer width={`calc(75% - ${GAP}px)`} height="100%">
                <GridTitleContainer>
                  <GridTitle>
                    등원 스케줄 관리
                    <img
                      src={`/PuppyFoot.png`}
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
                    setChangeDateVisible(true);
                  }}
                />
              </GridContainer>
            </GridContainerWrap>
          </>
        ) : (
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer
                style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
              >
                <TitleContainer>
                  <Title>
                    우리집 강아지
                    <img
                      src={`/PuppyFoot.png`}
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
                          setSlice(false);
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
              <GridContainer width="100%" height="100%">
                <TitleContainer>
                  <Title>
                    <span
                      style={{
                        color:
                          cardOptionData.data.filter(
                            (item) => item[DATA_ITEM_KEY] == selectedState
                          )[0] == undefined
                            ? "black"
                            : cardOptionData.data.filter(
                                (item) => item[DATA_ITEM_KEY] == selectedState
                              )[0].color,
                      }}
                      className="k-icon k-i-arrow-60-left k-icon-lg"
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(0);
                        }
                      }}
                    ></span>
                    {cardOptionData.data.filter(
                      (item) => item[DATA_ITEM_KEY] == selectedState
                    )[0] == undefined
                      ? ""
                      : cardOptionData.data.filter(
                          (item) => item[DATA_ITEM_KEY] == selectedState
                        )[0].custnm}
                    의 스케줄 관리
                    <img
                      src={`/PuppyFoot.png`}
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
                    setSlice(true);
                  }}
                />
              </GridContainer>
            </SwiperSlide>
            {changeDate != "" || slice == true ? (
              <SwiperSlide key={2}>
                <GridContainer
                  height="100vh"
                  width="100%"
                  style={{ overflowY: "scroll" }}
                >
                  <TitleContainer>
                    <Title>
                      <span
                        style={{
                          color:
                            cardOptionData.data.filter(
                              (item) => item[DATA_ITEM_KEY] == selectedState
                            )[0] == undefined
                              ? "black"
                              : cardOptionData.data.filter(
                                  (item) => item[DATA_ITEM_KEY] == selectedState
                                )[0].color,
                        }}
                        className="k-icon k-i-arrow-60-left k-icon-lg"
                        onClick={() => {
                          if (swiper) {
                            swiper.slideTo(1);
                          }
                          setChangeDate("");
                          setSlice(false);
                        }}
                      ></span>
                      {
                        cardOptionData.data.filter(
                          (item) => item[DATA_ITEM_KEY] == selectedState
                        )[0].custnm
                      }
                      의 등원 변경신청
                      <img
                        src={`/PuppyFoot.png`}
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
                                  src={`/Born.png`}
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
                                의 등원 변경 가능 횟수
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
                            }
                            회
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
                                  src={`/Born.png`}
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
                                  src={`/Born.png`}
                                  alt=""
                                  width={"20px"}
                                  height={"20px"}
                                  style={{
                                    marginRight: "2px",
                                    marginBottom: "2px",
                                  }}
                                />
                                회원권 유효기간
                              </Typography>
                            </>
                          }
                        />
                        <CardContent style={{ display: "flex" }}>
                          <Typography
                            style={{
                              color: "black",
                              fontSize: "1.2rem",
                              fontWeight: 500,
                              fontFamily: "TheJamsil5Bold",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {dateformat4(
                              cardOptionData.data.filter(
                                (item) => item[DATA_ITEM_KEY] == selectedState
                              )[0].strdt
                            )}
                            ~
                            {dateformat4(
                              cardOptionData.data.filter(
                                (item) => item[DATA_ITEM_KEY] == selectedState
                              )[0].enddt
                            )}
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
                                  src={`/Born.png`}
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
                              width: "100%",
                            }}
                          >
                            <Calendar
                              navigation={false}
                              value={date}
                              onChange={filterInputChange}
                            />
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
                        <CardContent
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            style={{
                              color: "black",
                              fontSize: "25px",
                              fontWeight: 500,
                              fontFamily: "TheJamsil5Bold",
                            }}
                          >
                            해당 일자 잔여석
                          </Typography>
                          <Typography
                            style={{
                              color: "black",
                              fontSize: "25px",
                              fontWeight: 500,
                              fontFamily: "TheJamsil5Bold",
                            }}
                          >
                            {adjnumber}석
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    {show ? (
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <p style={{ color: "red" }}>
                          설정하신 일자가 회원권 종료일 이후입니다.
                        </p>
                        <p style={{ color: "red" }}>다시 설정해주세요.</p>
                      </Grid>
                    ) : (
                      ""
                    )}
                    {show2 ? (
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <p style={{ color: "red" }}>
                          설정하신 일자가 오늘 이전입니다.
                        </p>
                        <p style={{ color: "red" }}>다시 설정해주세요.</p>
                      </Grid>
                    ) : (
                      ""
                    )}
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <ButtonContainer>
                        <Buttons
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(1);
                            }
                            setChangeDate("");
                            setSlice(false);
                          }}
                          style={{ width: "48%", backgroundColor: "#D3D3D3" }}
                        >
                          취소
                        </Buttons>
                        <Buttons
                          themeColor={"primary"}
                          onClick={() =>
                            onSave(
                              changeDate,
                              convertDateToStr(date),
                              show,
                              show2
                            )
                          }
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
        {ChangeDateVisible && (
          <SelectDateWindow
            setVisible={setChangeDateVisible}
            data={
              cardOptionData.data.filter(
                (item) => item[DATA_ITEM_KEY] == selectedState
              )[0]
            }
            changeDate={changeDate}
            reload={(pastday, currentday, shows, shows2) => {
              onSave(pastday, currentday, shows, shows2);
            }}
            show={show}
            show2={show2}
          />
        )}
      </div>
    </>
  );
};

export default CR_A0000W;
