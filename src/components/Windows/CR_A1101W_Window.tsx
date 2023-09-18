import { useCallback, useEffect, useState } from "react";
import { 
  UseGetValueFromSessionItem, 
  UseParaPc, 
  dateformat2, 
  dateformat4,
  getDayOfWeeks,
  toDate, 
} from "../CommonFunction";
import { IWindowPosition } from "../../hooks/interfaces";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { FormBoxWrap, GridContainer, GridContainerWrap, GridTitle, GridTitleContainer, Title, TitleContainer } from "../../CommonStyled";
import { Grid } from "@mui/material";
import {
  DataResult,
  State,
  process as processQuery,
} from "@progress/kendo-data-query";
import CardBox from "../DDGDcomponents/CardBox";
import { Iparameters } from "../../store/types";
import { useApi } from "../../hooks/api";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, sessionItemState } from "../../store/atoms";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import SwiperCore from "swiper";
import Calender from "../DDGDcomponents/Calender";
import { GAP } from "../CommonString";

interface Tsize {
  width: number;
  height: number;
}

const DATA_ITEM_KEY = "custcd";

type TKendoWindow = {
  setVisible(t: boolean): void;
  user_id: string;
  modal?: boolean;
};

const KendoWindow = ({
  setVisible,
  user_id,
  modal = false
}: TKendoWindow) => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  
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
  const [selectedState, setSelectedState] = useState<string>("");

  const [date, setDate] = useState<{ [name: string]: any }>({ date: null });

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true? deviceWidth : 1800,
    height: 850,
  });

  const size: Tsize = useWindowSize();
  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }, []); 
    return windowSize;
  }

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };

  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    setVisible(false);
  };

  const fetchMainData = async () => {
    let data: any;
    const parameter: Iparameters = {
      procedureName: "P_CR_A1101W_Q",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "CUSTLIST",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_mobile_no": "",
        "@p_userid": user_id,
        "@p_custcd": "",
      },
    };

    setLoading(true);
    try {
      data = await processApi("procedure", parameter);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setCardOptionData((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0 ) {
        setSelectedState(rows[0][DATA_ITEM_KEY]);
      }

    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchDetail = async () => {
    let data: any;
    const parameter: Iparameters = {
      procedureName: "P_CR_A1101W_Q",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "PLANLIST",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_mobile_no": "",
        "@p_userid": user_id,
        "@p_custcd": selectedState,
      },
    };

    setLoading(true);
    try {
      data = await processApi("procedure", parameter);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((prev: any) => ({
        ...prev,
        rowstatus: "U",
      }));

      setSchedulerData((prev) => {
        return {
          data: rows,
          total: totalRowCnt,
        };
      });

    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMainData();
  }, []);

  useEffect(() => {
    fetchDetail();
  }, [selectedState]);

  // 저장 파라미터 초기 값
  const [paraSaved, setParaSavedData] = useState({
    pgSize: 100,
    workType: "",
    orgdiv: orgdiv,
    location: location,
    custcd: "",
    membership_key: "",
    user: "",
    date: "",
    userid: userId,
    pc: pc,
    form_id: "CR_A1101W_Sub1"
  });

  const para: Iparameters = {
    procedureName: "P_CR_A1101W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraSaved.workType,
      "@p_orgdiv": paraSaved.orgdiv,
      "@p_location": paraSaved.location,
      "@p_custcd": paraSaved.custcd,
      "@p_membership_key": paraSaved.membership_key,
      "@p_user": paraSaved.user,
      "@p_date": paraSaved.date,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CR_A1101W_Sub1",
    },
  };

  // 출석일자 선택
  const onAttentionClick = async (date: string) => {
    if (date != null && date != "") {
      if (
        !window.confirm("선택하신 출석일자 " + dateformat2(date) + "가 맞습니까?"
        )
      ) {
        return false;
      }

      const find_key = schedulerData.data.filter(
        (item) => item.date == date
      )[0].membership_key;

      setParaSavedData((prev) => ({
        ...prev,
        workType: "N",
        orgdiv: orgdiv,
        location: location,
        custcd: selectedState,
        membership_key: find_key,
        user: user_id,
        date: date,
        userid: userId,
        pc: pc,
        form_id: "CR_A1101W_Sub1"
      }));

    } else {
      alert("출석일자를 선택해주세요.");
      return;
    }
    setLoading(false);
  };

  const fetchTodoGridSaved = async () => {
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("출석되었습니다.");
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraSaved != undefined && paraSaved.date != ""){
      fetchTodoGridSaved();
    }
  }, [paraSaved])

  return (
    <Window
      title={"출석체크"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <GridContainerWrap height={isMobile ? "" : "100%"}>
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
                      Click={() => setSelectedState(item[DATA_ITEM_KEY])}
                    />
                  </Grid>
                ))}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(75% - ${GAP}px)`} height="100%">
              <GridTitleContainer>
                <GridTitle>
                  등원 내역
                  <img
                    src={`${process.env.PUBLIC_URL}/PuppyFoot.png`}
                    alt=""
                    width={"30px"}
                    height={"30px"}
                    style={{ marginLeft: "5px", marginBottom: "-3px" }}
                  />
                  {"  "} 일자를 선택해주세요!
                </GridTitle>
              </GridTitleContainer>
              <Calender
                data={
                  cardOptionData.data.filter(
                    (item) => item[DATA_ITEM_KEY] == selectedState
                  )[0]
                }
                propFunction={(date: string) => {
                  onAttentionClick(date);
                }}
              />
            </GridContainer>
          </>
        ) : (
          <>
            <Swiper
              className="mySwiper"
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
            >
              <SwiperSlide key={0}>
                <GridContainer
                  width="100%"
                  style={{ height: "100vh", overflowY: "scroll" }}
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
                          Click={() => {
                            setSelectedState(item[DATA_ITEM_KEY]);
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
                    {cardOptionData.data.filter(
                      (item) => item[DATA_ITEM_KEY] == selectedState
                    )[0] == undefined
                      ? ""
                      : cardOptionData.data.filter(
                          (item) => item[DATA_ITEM_KEY] == selectedState
                        )[0].custnm}
                    의 등원내역
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
                      onAttentionClick(date);
                    }}
                  />
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          </>
        )}
      </GridContainerWrap>
    </Window>
  );
};

export default KendoWindow;