import { Card, CardContent, Grid, Input, Typography } from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import React, { useEffect, useState } from "react";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AdminQuestionBox,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { UsePermissions } from "../components/CommonFunction";
import { TPermissions } from "../store/types";

var barcode = "";

const MA_A2300_615_PDAW: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [state, setState] = useState("1");
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [slice, setSlice] = useState(false);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [checkDataState, setCheckDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [checkDataResult, setCheckDataResult] = useState<DataResult>(
    process([], checkDataState)
  );
  const [Information, setInformation] = useState({
    heatno: "",
    str: "",
    isSearch: false,
  });
  useEffect(() => {
    if (state == "1") {
      if (Information.isSearch && Information.str != "") {
        if (Information.heatno == "") {
          setInformation((prev) => ({
            ...prev,
            heatno: prev.str,
            isSearch: false,
          })); // 한번만 조회되도록
        } else {
          const newItem = {
            heatno: Information.heatno,
            scanno: Information.str,
          };

          let checkData = mainDataResult.data.filter(
            (item) =>
              item.heatno == newItem.heatno && item.scanno == newItem.scanno
          )[0];

          if (checkData != undefined) {
            alert("이미 존재하는 데이터입니다.");
          } else {
            setMainDataResult((prev) => ({
              data: [...prev.data, newItem],
              total: prev.total + 1,
            }));
            setCheckDataResult((prev) => ({
              data: [...prev.data, newItem],
              total: prev.total + 1,
            }));
          }
          setInformation((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
        }
        barcode = "";
      }
    } else {
      if (Information.isSearch && Information.str != "") {
        if (Information.heatno == "") {
          setInformation((prev) => ({
            ...prev,
            heatno: prev.str,
            isSearch: false,
          })); // 한번만 조회되도록
        } else {
          const newItem = {
            heatno: Information.heatno,
            scanno: Information.str,
          };
          let checkData = mainDataResult.data.filter(
            (item) =>
              item.heatno == newItem.heatno && item.scanno == newItem.scanno
          )[0];

          if (checkData != undefined) {
            alert("이미 존재하는 데이터입니다.");
          } else {
            setMainDataResult((prev) => ({
              data: [...prev.data, newItem],
              total: prev.total + 1,
            }));
            setCheckDataResult((prev) => ({
              data: [...prev.data, newItem],
              total: prev.total + 1,
            }));
          }
          setInformation((prev) => ({ ...prev, heatno: "", isSearch: false })); // 한번만 조회되도록
        }
        barcode = "";
      }
    }
  }, [Information]);

  useEffect(() => {
    document.addEventListener("keydown", function (evt) {
      if (evt.code == "Enter") {
        if (barcode != "") {
          setInformation((prev) => ({
            ...prev,
            str: barcode,
            isSearch: true,
          }));
        }
      } else if (
        evt.code != "ShiftLeft" &&
        evt.code != "Shift" &&
        evt.code != "Enter"
      ) {
        barcode += evt.key;
      }
    });
  }, []);

  const onCheckClick = (datas: any) => {
    const data = checkDataResult.data.filter(
      (item) => item.heatno == datas.heatno && item.scanno == datas.scanno
    )[0];

    if (data != undefined) {
      const setdatas = checkDataResult.data.filter(
        (item) => !(item.heatno == datas.heatno && item.scanno == datas.scanno)
      );
      setCheckDataResult((prev) => ({
        data: setdatas,
        total: setdatas.length,
      }));
      if (setdatas.length == 0) {
        setSlice(false);
      } else {
        setSlice(true);
      }
    } else {
      setCheckDataResult((prev) => ({
        data: [...prev.data, datas],
        total: prev.total + 1,
      }));
      setSlice(true);
    }
  };

  const onClick1 = () => {
    setInformation((prev) => ({
      ...prev,
      heatno: "",
      str: "",
      isSearch: false,
    })); // 한번만 조회되도록

    barcode = "";
    setState("1");

    let availableWidthPx = document.getElementById("button1");
    if (availableWidthPx) {
      availableWidthPx.blur();
    }
  };

  const onClick2 = () => {
    setInformation((prev) => ({
      ...prev,
      heatno: "",
      str: "",
      isSearch: false,
    })); // 한번만 조회되도록
    barcode = "";
    setState("2");
    let availableWidthPx = document.getElementById("button2");
    if (availableWidthPx) {
      availableWidthPx.blur();
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>원료육입고</Title>
        <ButtonContainer>
          <Button
            themeColor={"primary"}
            fillMode={"solid"}
            onClick={() => {
              setMainDataResult(process([], mainDataState));
              setCheckDataResult(process([], checkDataState));
              setInformation({
                heatno: "",
                str: "",
                isSearch: false,
              });
              setState("1");
              barcode = "";
              setSlice(false);
            }}
            icon="reset"
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              if (
                Object.entries(checkDataResult.data).toString() ===
                Object.entries(mainDataResult.data).toString()
              ) {
                setCheckDataResult((prev) => ({
                  data: [],
                  total: 0,
                }));
              } else {
                setCheckDataResult((prev) => ({
                  data: mainDataResult.data,
                  total: mainDataResult.total,
                }));
              }
              if (mainDataResult.total > 0) {
                setSlice(true);
              } else {
                setSlice(false);
              }
            }}
            icon="check"
          >
            AllCheck
          </Button>
          <Button
            onClick={() => {
              if (swiper) {
                if (checkDataResult.total > 0) {
                  swiper.slideTo(1);
                  setSlice(true);
                } else {
                  alert("데이터를 선택해주세요");
                }
              }
            }}
            icon="arrow-right"
          >
            다음
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <Swiper
        className="leading_PDA_Swiper"
        onSwiper={(swiper) => {
          setSwiper(swiper);
        }}
      >
        <SwiperSlide key={0} className="leading_PDA">
          <GridContainer className="leading_PDA_container">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>이력번호</th>
                    <td>
                      <Input
                        name="heatno"
                        type="text"
                        value={Information.heatno}
                        style={{ width: "100%" }}
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
              height: "60vh",
              overflowY: "scroll",
              marginBottom: "10px",
              width: "100%",
            }}
          >
            {mainDataResult.data.map((item, idx) => (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <AdminQuestionBox key={idx}>
                  <Card
                    style={{
                      width: "100%",
                      cursor: "pointer",
                      backgroundColor:
                        checkDataResult.data.filter(
                          (data) =>
                            data.heatno == item.heatno &&
                            data.scanno == item.scanno
                        )[0] != undefined
                          ? "#d6d8f9"
                          : "white",
                    }}
                  >
                    <CardContent
                      onClick={() => onCheckClick(item)}
                      style={{ textAlign: "left", padding: "8px" }}
                    >
                      <Typography gutterBottom variant="h6" component="div">
                        {item.heatno}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.scanno}
                      </Typography>
                    </CardContent>
                  </Card>
                </AdminQuestionBox>
              </Grid>
            ))}
          </GridContainer>
          <GridContainer className="leading_PDA_container">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>선택건수</th>
                    <td>
                      <Input
                        name="chk"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={checkDataResult.total}
                      />
                    </td>
                    <th style={{ width: "5%", minWidth: "80px" }}>스캔건수</th>
                    <td>
                      <Input
                        name="total"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={mainDataResult.total}
                      />
                    </td>
                  </tr>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th colSpan={2}>
                      <Button
                        id={"button1"}
                        themeColor={"primary"}
                        fillMode={state == "1" ? "solid" : "outline"}
                        onClick={() => onClick1()}
                        style={{ width: "100%" }}
                      >
                        이력번호
                      </Button>
                    </th>
                    <td colSpan={2}>
                      <Button
                        id={"button2"}
                        themeColor={"primary"}
                        fillMode={state == "2" ? "solid" : "outline"}
                        onClick={() => onClick2()}
                        style={{ width: "100%" }}
                      >
                        제품바코드
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
        </SwiperSlide>
        {slice == true ? <SwiperSlide key={1}></SwiperSlide> : ""}
      </Swiper>
    </>
  );
};

export default MA_A2300_615_PDAW;
