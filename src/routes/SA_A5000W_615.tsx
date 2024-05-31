import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AdminQuestionBox,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  UseGetValueFromSessionItem,
  getHeight,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading, isMobileState } from "../store/atoms";
import { Iparameters } from "../store/types";

var index = 0;
let timestamp = 0;
var barcode = "";
let interval: any;

const SA_A5000W_615: React.FC = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  let deviceHeight = document.documentElement.clientHeight - 100;
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  var height3 = getHeight(".ButtonContainer3");
  var height4 = getHeight(".ButtonContainer4");
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  const processApi = useApi();
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const [step, setStep] = useState(0);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempDataState, setTempDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempDataResult, setTempResult] = useState<DataResult>(
    process([], tempDataState)
  );
  const [Information, setInformation] = useState({
    ordbarcode: "",
    itembarcode: "",
    str: "",
    custcd: "",
    custnm: "",
    ordnum: "",
    ordseq: 0,
    itemnm: "",
    isSearch: false,
  });

  useEffect(() => {
    if (Information.isSearch && Information.str != "") {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        ordbarcode: (isMobile ? index == 0 : step == 0)
          ? Information.str
          : prev.ordbarcode,
        itembarcode: (isMobile ? index == 1 : step == 1)
          ? Information.str
          : prev.itembarcode,
      }));
    }
  }, [Information]);

  document.addEventListener("keydown", function (evt) {
    if (!isMobile) {
      if (interval) {
        clearInterval(interval);
      }
      if (evt.code == "Enter" || evt.code == "NumpadEnter") {
        if (barcode != "") {
          setInformation((prev) => ({
            ...prev,
            str: barcode,
            isSearch: true,
          }));
          interval = setInterval(() => (barcode = ""), 50);
        }
      }
      if (
        evt.code != "ShiftLeft" &&
        evt.code != "Shift" &&
        evt.code != "Enter" &&
        evt.code != "NumpadEnter"
      ) {
        if (timestamp != evt.timeStamp) {
          barcode += evt.key;
          timestamp = evt.timeStamp;
        }
      }
    }
  });

  const resetAll = () => {
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setTempResult(process([], tempDataState));
    barcode = "";
    setInformation({
      ordbarcode: "",
      itembarcode: "",
      str: "",
      custcd: "",
      custnm: "",
      ordnum: "",
      ordseq: 0,
      itemnm: "",
      isSearch: false,
    });
    events();
    let availableWidthPx = document.getElementById("allreset");
    availableWidthPx?.blur();
  };

  const getWgt = (data: any[]) => {
    let sum = 0;
    data.map((item: any) => {
      sum += item.totwgt;
    });

    return sum;
  };

  const [filters, setFilters] = useState({
    ordbarcode: "",
    itembarcode: "",
    pgNum: 1,
    isSearch: false,
    pgSize: PAGE_SIZE,
  });

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const setCustData = (data: ICustData) => {
    setInformation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
    events();
  };

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);
  var audio = new Audio("/Correct 9.mp3");
  var audio2 = new Audio("/Notice 6.mp3");
  audio.load();
  audio2.load();
  // 볼륨 설정
  audio.volume = 1;
  audio2.volume = 1;
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //요약정보 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);

    if (isMobile ? index == 0 : step == 0) {
      //조회조건 파라미터
      const parameters: Iparameters = {
        procedureName: "P_SA_A5000W_615_Q",
        pageNumber: filters.pgNum,
        pageSize: filters.pgSize,
        parameters: {
          "@p_work_type": "ORDER",
          "@p_orgdiv": sessionOrgdiv,
          "@p_ordbarcode": filters.ordbarcode,
          "@p_itembarcode": "",
          "@p_ordseq": 0,
        },
      };

      try {
        data = await processApi<any>("procedure", parameters);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true && data.tables.length > 0) {
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows;
        setInformation((prev) => ({ ...prev, str: "", isSearch: false })); // 한번만 조회되도록

        let array: any[] = [];
        let valid = true;
        rows.map((item: any) => {
          const newItem = {
            ordnum: totalRowCnt > 0 ? item.ordnum : "",
            ordseq: totalRowCnt > 0 ? item.ordseq : 0,
            itemcd: totalRowCnt > 0 ? item.itemcd : "",
            itemnm: totalRowCnt > 0 ? item.itemnm : "",
            insiz: totalRowCnt > 0 ? item.insiz : "",
            qty: totalRowCnt > 0 ? item.qty : 0,
            outqty: totalRowCnt > 0 ? item.outqty : 0,
            totwgt: totalRowCnt > 0 ? item.totwgt : 0,
            cnt: 0,
            chk: false,
          };
          let checkData = mainDataResult.data.filter(
            (items) =>
              items.ordnum == newItem.ordnum && items.ordseq == newItem.ordseq
          )[0];

          if (checkData != undefined && valid == true) {
            setTitle("이미 존재하는 데이터입니다.");
            setOpen(true);
            valid = false;
          } else if (valid != false) {
            array.push(newItem);
          }
        });

        if (valid == true) {
          audio.play();
          array.map((items) => {
            setMainDataResult((prev) => ({
              data: [...prev.data, items],
              total: prev.total + 1,
            }));
          });
        } else {
          audio2.play();
        }
        setInformation((prev) => ({
          ...prev,
          ordbarcode: filters.ordbarcode,
          str: "",
          isSearch: false,
        })); // 한번만 조회되도록
        barcode = "";
      } else {
        audio2.play();
        setTitle(data.resultMessage);
        setOpen(true);
        setInformation((prev) => ({ ...prev, str: "", isSearch: false })); // 한번만 조회되도록
        barcode = "";
      }
    } else {
      //조회조건 파라미터
      const parameters: Iparameters = {
        procedureName: "P_SA_A5000W_615_Q",
        pageNumber: filters.pgNum,
        pageSize: filters.pgSize,
        parameters: {
          "@p_work_type": "Q",
          "@p_orgdiv": sessionOrgdiv,
          "@p_ordbarcode": Information.ordnum,
          "@p_itembarcode": filters.itembarcode,
          "@p_ordseq": Information.ordseq,
        },
      };
      try {
        data = await processApi<any>("procedure", parameters);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true && data.tables.length > 0) {
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows;
        setInformation((prev) => ({ ...prev, str: "", isSearch: false })); // 한번만 조회되도록

        let array: any[] = [];
        let valid = true;
        rows.map((item: any) => {
          const newItem = {
            itembarcode: totalRowCnt > 0 ? item.itembarcode : "",
            ordnum: totalRowCnt > 0 ? item.ordnum : "",
            ordseq: totalRowCnt > 0 ? item.ordseq : 0,
          };
          let checkData = mainDataResult2.data.filter(
            (items) => items.itembarcode == newItem.itembarcode
          )[0];

          if (checkData != undefined && valid == true) {
            setTitle("이미 존재하는 데이터입니다.");
            setOpen(true);
            valid = false;
          } else if (valid != false) {
            array.push(newItem);
          }
        });

        if (valid == true) {
          audio.play();
          const datas = mainDataResult.data.map((items) => {
            if (
              items.ordnum == Information.ordnum &&
              items.ordseq == Information.ordseq
            ) {
              return {
                ...items,
                cnt: items.cnt + array.length,
              };
            } else {
              return {
                ...items,
              };
            }
          });
          setMainDataResult((prev) => ({
            data: datas,
            total: prev.total,
          }));
          array.map((items) => {
            setMainDataResult2((prev) => ({
              data: [...prev.data, items],
              total: prev.total + 1,
            }));
            setTempResult((prev) => ({
              data: [...prev.data, items],
              total: prev.total + 1,
            }));
          });
        } else {
          audio2.play();
        }
        setInformation((prev) => ({
          ...prev,
          itembarcode: filters.itembarcode,
          str: "",
          isSearch: false,
        })); // 한번만 조회되도록
        barcode = "";
      } else {
        audio2.play();
        setTitle(data.resultMessage);
        setOpen(true);
        setInformation((prev) => ({ ...prev, str: "", isSearch: false })); // 한번만 조회되도록
        barcode = "";
      }
    }
    events();
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const onSaveClick = () => {
    let dataArr: any = {
      ordnum_s: [],
      ordseq_s: [],
      itembarcode_s: [],
    };
    if (mainDataResult2.total > 0) {
      if (Information.custcd != "") {
        mainDataResult2.data.forEach((item: any, idx: number) => {
          const { ordnum = "", ordseq = "", itembarcode = "" } = item;
          dataArr.ordnum_s.push(ordnum);
          dataArr.ordseq_s.push(ordseq);
          dataArr.itembarcode_s.push(itembarcode);
        });
        setParaData((prev) => ({
          ...prev,
          workType: "N",
          orgdiv: sessionOrgdiv,
          custcd: Information.custcd,
          ordnum_s: dataArr.ordnum_s.join("|"),
          ordseq_s: dataArr.ordseq_s.join("|"),
          itembarcode_s: dataArr.itembarcode_s.join("|"),
        }));
      } else {
        setTitle("거래처를 선택해주세요");
        setOpen(true);
      }
    } else {
      setTitle("데이터가 없습니다.");
      setOpen(true);
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    custcd: "",
    ordnum_s: "",
    ordseq_s: "",
    itembarcode_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A5000W_615_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_custcd": ParaData.custcd,
      "@p_ordnum_s": ParaData.ordnum_s,
      "@p_ordseq_s": ParaData.ordseq_s,
      "@p_itembarcode_s": ParaData.itembarcode_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A5000W_615",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      alert("저장되었습니다.");
      resetAll();
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        custcd: "",
        ordnum_s: "",
        ordseq_s: "",
        itembarcode_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      setTitle(data.resultMessage);
      setOpen(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onCheckItem = (item: any) => {
    const temp = mainDataResult2.data.filter(
      (items) => items.ordnum == item.ordnum && items.ordseq == item.ordseq
    );
    const datas = mainDataResult.data.map((items) => {
      if (items.ordnum == item.ordnum && items.ordseq == item.ordseq) {
        return {
          ...items,
          chk: true,
          cnt: temp.length,
        };
      } else {
        return {
          ...items,
          chk: false,
        };
      }
    });

    setTempResult((prev) => ({
      data: temp,
      total: temp.length,
    }));
    setMainDataResult((prev) => ({
      data: datas,
      total: prev.total,
    }));
    setInformation((prev) => ({
      ...prev,
      isSearch: false,
      ordbarcode: item.ordnum,
      itembarcode: "",
      str: "",
      ordnum: item.ordnum,
      ordseq: item.ordseq,
      itemnm: item.itemnm,
    }));
    barcode = "";
    swiper?.slideTo(1);
    setStep(1);
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (Math.abs(Information.str.length - value.length) == 1) {
      setInformation((prev) => ({
        ...prev,
        str: value,
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        str: e.value,
        isSearch: true,
      }));
    }
  };

  useEffect(() => {
    if (isMobile) {
      events();
    }
  });

  const events = () => {
    if (isMobile && index == 0) {
      setTimeout(() => {
        hiddeninput.current.focus();
      });
    }
    if (isMobile && index == 1) {
      setTimeout(() => {
        hiddeninput2.current.focus();
      });
    }
  };

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const hiddeninput = useRef<any>();
  const hiddeninput2 = useRef<any>();

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setOpen(false);
      }, 1000);
    }
  }, [open]);

  return (
    <>
      <div style={{ position: "relative" }}>
        {open ? (
          <Alert
            severity="error"
            style={{
              position: "absolute",
              zIndex: "99999",
              width: "100%",
              marginTop: "15px",
            }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                  events();
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {title}
          </Alert>
        ) : (
          ""
        )}
        {isMobile ? (
          <>
            <Swiper
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
              onActiveIndexChange={(swiper) => {
                index = swiper.activeIndex;
                events();
              }}
            >
              <SwiperSlide key={0}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <TitleContainer
                    style={{ marginBottom: "15px" }}
                    className="ButtonContainer"
                  >
                    <Title style={{ textAlign: "center" }}>판매처리</Title>
                    <ButtonContainer>
                      <Button
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => {
                          resetAll();
                          events();
                        }}
                        icon="reset"
                      >
                        ALLReset
                      </Button>
                      <Button onClick={() => onSaveClick()} icon="save">
                        저장
                      </Button>
                      <Button
                        onClick={() => {
                          if (swiper) {
                            if (mainDataResult.total > 0) {
                              swiper.slideTo(1);
                            } else {
                              setTitle("데이터가 없습니다.");
                              setOpen(true);
                            }
                          }
                        }}
                        icon="arrow-right"
                      >
                        다음
                      </Button>
                    </ButtonContainer>
                  </TitleContainer>
                  <GridContainer className="ButtonContainer2">
                    <FormBoxWrap border={true}>
                      <FormBox>
                        <tbody>
                          <tr style={{ display: "flex", flexDirection: "row" }}>
                            <th style={{ width: "5%", minWidth: "80px" }}>
                              스캔번호
                            </th>
                            <td>
                              <Input
                                name="str"
                                type="text"
                                ref={hiddeninput}
                                value={Information.str}
                                style={{ width: "100%" }}
                                onChange={InputChange}
                              />
                              <ButtonInInput>
                                <Button
                                  id="search"
                                  onClick={() => {
                                    setInformation((prev) => ({
                                      ...prev,
                                      isSearch: true,
                                    }));
                                    events();
                                  }}
                                  icon="search"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                          </tr>
                          <tr style={{ display: "flex", flexDirection: "row" }}>
                            <th style={{ width: "5%", minWidth: "80px" }}>
                              수주번호
                            </th>
                            <td>
                              <Input
                                name="ordbarcode"
                                type="text"
                                value={Information.ordbarcode}
                                style={{ width: "100%" }}
                                className="readonly"
                                disabled={true}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                  <GridContainer
                    style={{
                      height: deviceHeight - height - height2 - height3,
                      overflowY: "scroll",
                      marginBottom: "10px",
                      width: "100%",
                    }}
                  >
                    <Grid container spacing={2}>
                      {mainDataResult.data.map((item, idx) => (
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <AdminQuestionBox key={idx}>
                            <Card
                              style={{
                                width: "100%",
                                cursor: "pointer",
                                backgroundColor:
                                  item.chk == true ? "#d6d8f9" : "white",
                              }}
                            >
                              <CardContent
                                style={{ textAlign: "left", padding: "8px" }}
                                onClick={() => onCheckItem(item)}
                              >
                                <Typography
                                  gutterBottom
                                  variant="h6"
                                  component="div"
                                >
                                  {item.itemnm}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {item.insiz}
                                </Typography>
                                <p
                                  style={{
                                    fontSize: "0.875rem",
                                    fontWeight: "400",
                                    letterSpacing: "0.01071em",
                                    display: "flex",
                                  }}
                                >
                                  <p style={{ color: "blue" }}>{item.qty}</p>/
                                  <p style={{ color: "red" }}>{item.outqty}</p>(
                                  {item.cnt})
                                </p>
                              </CardContent>
                            </Card>
                          </AdminQuestionBox>
                        </Grid>
                      ))}
                    </Grid>
                  </GridContainer>
                  <GridContainer className="ButtonContainer3">
                    <FormBoxWrap border={true}>
                      <FormBox>
                        <tbody>
                          <tr style={{ display: "flex", flexDirection: "row" }}>
                            <th style={{ width: "5%", minWidth: "80px" }}>
                              스캔건수
                            </th>
                            <td>
                              <Input
                                name="total"
                                type="text"
                                style={{
                                  textAlign: "right",
                                }}
                                className="readonly"
                                value={mainDataResult.total}
                                onClick={() => events()}
                              />
                            </td>
                            <th style={{ width: "5%", minWidth: "80px" }}>
                              총중량
                            </th>
                            <td>
                              <Input
                                name="total"
                                type="text"
                                style={{
                                  textAlign: "right",
                                }}
                                className="readonly"
                                value={getWgt(mainDataResult.data)}
                                onClick={() => events()}
                              />
                            </td>
                          </tr>
                          <tr style={{ display: "flex", flexDirection: "row" }}>
                            <th style={{ width: "5%", minWidth: "80px" }}>
                              거래처
                            </th>
                            <td>
                              <Input
                                name="custnm"
                                type="text"
                                value={Information.custnm}
                                style={{ width: "100%" }}
                                className="readonly"
                                onClick={() => events()}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onCustWndClick}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                </GridContainer>
              </SwiperSlide>
              {Information.ordnum != "" ? (
                <SwiperSlide key={1}>
                  <GridContainer style={{ width: "100%", overflow: "auto" }}>
                    <TitleContainer
                      style={{ marginBottom: "15px" }}
                      className="ButtonContainer"
                    >
                      <Title style={{ textAlign: "center" }}>판매처리</Title>
                      <ButtonContainer>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(0);
                              events();
                            }
                          }}
                          icon="arrow-left"
                        >
                          이전
                        </Button>
                      </ButtonContainer>
                    </TitleContainer>
                    <GridContainer className="ButtonContainer4">
                      <FormBoxWrap border={true}>
                        <FormBox>
                          <tbody>
                            <tr
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <th style={{ width: "5%", minWidth: "80px" }}>
                                스캔번호
                              </th>
                              <td>
                                <Input
                                  name="str"
                                  type="text"
                                  ref={hiddeninput2}
                                  value={Information.str}
                                  style={{ width: "100%" }}
                                  onChange={InputChange}
                                />
                                <ButtonInInput>
                                  <Button
                                    id="search"
                                    onClick={() => {
                                      setInformation((prev) => ({
                                        ...prev,
                                        isSearch: true,
                                      }));
                                      events();
                                    }}
                                    icon="search"
                                    fillMode="flat"
                                  />
                                </ButtonInInput>
                              </td>
                            </tr>
                            <tr
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <th style={{ width: "5%", minWidth: "80px" }}>
                                제품바코드
                              </th>
                              <td>
                                <Input
                                  name="itembarcode"
                                  type="text"
                                  value={Information.itembarcode}
                                  style={{ width: "100%" }}
                                  className="readonly"
                                  disabled={true}
                                />
                              </td>
                            </tr>
                            <tr
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <th style={{ width: "5%", minWidth: "80px" }}>
                                품목명
                              </th>
                              <td>
                                <Input
                                  name="itemnm"
                                  type="text"
                                  value={Information.itemnm}
                                  style={{ width: "100%" }}
                                  className="readonly"
                                  onClick={() => events()}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </FormBox>
                      </FormBoxWrap>
                    </GridContainer>
                    <GridContainer
                      style={{
                        height: deviceHeight - height - height4,
                        overflowY: "scroll",
                        marginBottom: "10px",
                        width: "100%",
                      }}
                    >
                      <Grid container spacing={2}>
                        {tempDataResult.data.map((item, idx) => (
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <AdminQuestionBox key={idx}>
                              <Card
                                style={{
                                  width: "100%",
                                  cursor: "pointer",
                                  backgroundColor: "#d6d8f9",
                                }}
                              >
                                <CardContent
                                  style={{ textAlign: "left", padding: "8px" }}
                                >
                                  <Typography
                                    gutterBottom
                                    variant="h6"
                                    component="div"
                                    style={{
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {item.itembarcode}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </AdminQuestionBox>
                          </Grid>
                        ))}
                      </Grid>
                    </GridContainer>
                  </GridContainer>
                </SwiperSlide>
              ) : (
                ""
              )}
            </Swiper>
          </>
        ) : (
          <>
            {step == 0 ? (
              <>
                <TitleContainer style={{ marginBottom: "15px" }}>
                  <Title>판매처리</Title>
                  <ButtonContainer>
                    <Button
                      themeColor={"primary"}
                      fillMode={"solid"}
                      onClick={() => {
                        resetAll();
                      }}
                      id="allreset"
                      icon="reset"
                    >
                      ALLReset
                    </Button>
                    <Button onClick={() => onSaveClick()} icon="save">
                      저장
                    </Button>
                    <Button
                      onClick={() => {
                        if (mainDataResult.total > 0) {
                          if (Information.ordnum != "") {
                            setStep(1);
                          } else {
                            setTitle("데이터를 선택해주세요");
                            setOpen(true);
                          }
                        } else {
                          setTitle("데이터가 없습니다.");
                          setOpen(true);
                        }
                        let availableWidthPx = document.getElementById("next");
                        availableWidthPx?.blur();
                      }}
                      id="next"
                      icon="arrow-right"
                    >
                      다음
                    </Button>
                  </ButtonContainer>
                </TitleContainer>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer>
                    <GridTitle>바코드스캔</GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap border={true}>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th style={{ width: "5%", minWidth: "80px" }}>
                            수주번호
                          </th>
                          <td>
                            <Input
                              name="ordbarcode"
                              type="text"
                              value={Information.ordbarcode}
                              style={{ width: "100%" }}
                              className="readonly"
                              disabled={true}
                            />
                          </td>
                          <th style={{ width: "5%", minWidth: "80px" }}>
                            거래처
                          </th>
                          <td>
                            <Input
                              name="custnm"
                              type="text"
                              value={Information.custnm}
                              style={{ width: "100%" }}
                              className="readonly"
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <GridContainer
                    style={{
                      height: "67vh",
                      overflowY: "scroll",
                      marginBottom: "10px",
                      width: "100%",
                    }}
                  >
                    <Grid container spacing={2}>
                      {mainDataResult.data.map((item, idx) => (
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                          <AdminQuestionBox key={idx}>
                            <Card
                              style={{
                                width: "100%",
                                cursor: "pointer",
                                backgroundColor:
                                  item.chk == true ? "#d6d8f9" : "white",
                              }}
                            >
                              <CardContent
                                style={{ textAlign: "left", padding: "8px" }}
                                onClick={() => onCheckItem(item)}
                              >
                                <Typography
                                  gutterBottom
                                  variant="h6"
                                  component="div"
                                >
                                  {item.itemnm}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {item.insiz}
                                </Typography>
                                <p
                                  style={{
                                    fontSize: "0.875rem",
                                    fontWeight: "400",
                                    letterSpacing: "0.01071em",
                                    display: "flex",
                                  }}
                                >
                                  <p style={{ color: "blue" }}>{item.qty}</p>/
                                  <p style={{ color: "red" }}>{item.outqty}</p>(
                                  {item.cnt})
                                </p>
                              </CardContent>
                            </Card>
                          </AdminQuestionBox>
                        </Grid>
                      ))}
                    </Grid>
                  </GridContainer>
                  <FormBoxWrap border={true}>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th style={{ width: "5%", minWidth: "80px" }}>
                            스캔건수
                          </th>
                          <td>
                            <Input
                              name="total"
                              type="text"
                              style={{
                                textAlign: "right",
                              }}
                              className="readonly"
                              value={mainDataResult.total}
                              disabled={true}
                            />
                          </td>
                          <th style={{ width: "5%", minWidth: "80px" }}>
                            총중량
                          </th>
                          <td>
                            <Input
                              name="total"
                              type="text"
                              style={{
                                textAlign: "right",
                              }}
                              className="readonly"
                              value={getWgt(mainDataResult.data)}
                              disabled={true}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </GridContainer>
              </>
            ) : (
              <>
                <TitleContainer style={{ marginBottom: "15px" }}>
                  <Title>판매처리</Title>
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        setStep(0);
                        let availableWidthPx = document.getElementById("prev");
                        availableWidthPx?.blur();
                      }}
                      id="prev"
                      icon="arrow-left"
                    >
                      이전
                    </Button>
                  </ButtonContainer>
                </TitleContainer>
                <GridContainer>
                  <FormBoxWrap border={true}>
                    <FormBox>
                      <tbody>
                        <tr style={{ width: "100%" }}>
                          <th style={{ width: "5%", minWidth: "80px" }}>
                            제품바코드
                          </th>
                          <td>
                            <Input
                              name="itembarcode"
                              type="text"
                              value={Information.itembarcode}
                              style={{ width: "100%" }}
                              className="readonly"
                              disabled={true}
                            />
                          </td>
                          <th style={{ width: "5%", minWidth: "80px" }}>
                            품목명
                          </th>
                          <td>
                            <Input
                              name="itemnm"
                              type="text"
                              value={Information.itemnm}
                              style={{ width: "100%" }}
                              className="readonly"
                              disabled={true}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </GridContainer>
                <GridContainer
                  style={{
                    height: "80vh",
                    overflowY: "scroll",
                    marginBottom: "10px",
                    width: "100%",
                  }}
                >
                  <Grid container spacing={2}>
                    {tempDataResult.data.map((item, idx) => (
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <AdminQuestionBox key={idx}>
                          <Card
                            style={{
                              width: "100%",
                              cursor: "pointer",
                              backgroundColor: "#d6d8f9",
                            }}
                          >
                            <CardContent
                              style={{ textAlign: "left", padding: "8px" }}
                            >
                              <Typography
                                gutterBottom
                                variant="h6"
                                component="div"
                                style={{
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                }}
                              >
                                {item.itembarcode}
                              </Typography>
                            </CardContent>
                          </Card>
                        </AdminQuestionBox>
                      </Grid>
                    ))}
                  </Grid>
                </GridContainer>
              </>
            )}
          </>
        )}
      </div>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"FILTER"}
          setData={setCustData}
          modal={true}
        />
      )}
    </>
  );
};

export default SA_A5000W_615;
