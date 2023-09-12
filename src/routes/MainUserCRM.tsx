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
import { useRecoilState, useSetRecoilState } from "recoil";
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
  toDate2,
} from "../components/CommonFunction";
import { GAP } from "../components/CommonString";
import Calender from "../components/DDGDcomponents/Calender";
import CardBox from "../components/DDGDcomponents/CardBox";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState, sessionItemState } from "../store/atoms";
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
  const fetchMain = async (key: any) => {
    let data: any;
    const Parameters: Iparameters = {
      procedureName: "sys_sel_default_home_web",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "ATTENDANCE",
        "@p_orgdiv": "01",
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

    if (data.isSuccess === true) {
      const rowCount = data.tables[0].RowCount;
      const row = data.tables[0].Rows;
      setCardOptionData((prev) => {
        return {
          data: row,
          total: rowCount == -1 ? 0 : rowCount,
        };
      });
      if (rowCount > 0) {
        if(key != "") {
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
    orgdiv: "01",
    location: "01",
    custcd: "",
    membership_key: "",
    adjdt: "",
    userid: userId,
    pc: pc,
    form_id: "HOME"
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

    if (data.isSuccess === true) {
      alert("신청이 완료되었습니다.");
      if(isMobile) {
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
        orgdiv: "01",
        location: "01",
        custcd: "",
        membership_key: "",
        adjdt: "",
        userid: userId,
        pc: pc,
        form_id: "HOME"
      });
    } else {
      console.log("[오류 발생]");
      console.log(data.resultMessage);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onSave = (pastday: string, currentday: string) => {
    if (currentday != null) {
      const find_key = schedulerData.data.filter((item) => item.date == pastday)[0].membership_key;
      const number = cardOptionData.data.filter((item) => item[DATA_ITEM_KEY] == selectedState)[0].adjqty;
      if(find_key != undefined) {
        alert(`잔여 변경 횟수는 ${number}회 입니다.`);
        if (!window.confirm("변경신청 후 취소 할 수 없습니다. 신청하시겠습니까?")) {
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
      alert("변경 등원일을 선택해주세요.");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [selectedState])
  return (
    <>
      <TitleContainer>
        <Title>{userName}님 안녕하세요!</Title>
      </TitleContainer>
      <GridContainerWrap height={"90%"}>
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
                  setChangeDateVisible(true);
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
              <GridContainer
                height="100vh"
                width="100%"
                style={{ overflowY: "scroll" }}
              >
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
              <div style={{ width: "100%", height: "100%" }}>
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
                    if (swiper) {
                      swiper.slideTo(2);
                    }
                  }}
                />
              </div>
            </SwiperSlide>
            {changeDate != "" ? (
              <SwiperSlide key={2}>
                <GridContainer
                  height="100vh"
                  width="100%"
                  style={{ overflowY: "scroll" }}
                >
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
                          style={{ width: "48%", backgroundColor: "#D3D3D3" }}
                        >
                          취소
                        </Buttons>
                        <Buttons
                          themeColor={"primary"}
                          onClick={() =>
                            onSave(changeDate, convertDateToStr(date.date))
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
      </GridContainerWrap>
      {ChangeDateVisible && (
        <SelectDateWindow
          setVisible={setChangeDateVisible}
          data={
            cardOptionData.data.filter(
              (item) => item[DATA_ITEM_KEY] == selectedState
            )[0]
          }
          changeDate={changeDate}
          reload={(pastday, currentday) => onSave(pastday, currentday)}
        />
      )}
    </>
  );
};

export default Main;
