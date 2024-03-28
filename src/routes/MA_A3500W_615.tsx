import { Card, CardContent, Grid, Input, Typography } from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import React, { useEffect, useState } from "react";
import "swiper/css";
import {
  AdminQuestionBox,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";

var barcode = "";

const MA_A3500W_615: React.FC = () => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

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
    scanno: "",
    str: "",
    isSearch: false,
  });

  useEffect(() => {
    if (Information.isSearch && Information.str != "") {
      setInformation((prev) => ({
        ...prev,
        scanno: prev.str,
        isSearch: false,
      })); // 한번만 조회되도록

      const newItem = {
        scanno: Information.str,
      };
      let checkData = mainDataResult.data.filter(
        (item) => item.scanno == newItem.scanno
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
      barcode = "";
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
      (item) => item.scanno == datas.scanno
    )[0];

    if (data != undefined) {
      const setdatas = checkDataResult.data.filter(
        (item) => !(item.scanno == datas.scanno)
      );
      setCheckDataResult((prev) => ({
        data: setdatas,
        total: setdatas.length,
      }));
    } else {
      setCheckDataResult((prev) => ({
        data: [...prev.data, datas],
        total: prev.total + 1,
      }));
    }
  };

  const resetAll = () => {
    setMainDataResult(process([], mainDataState));
    setCheckDataResult(process([], checkDataState));
    barcode = "";
    setInformation({
      scanno: "",
      str: "",
      isSearch: false,
    });
  };

  return (
    <>
      {isMobile ? (
        <>
          <TitleContainer style={{ marginBottom: "15px" }}>
            <Title style={{ textAlign: "center" }}>생산투입(자재불출)</Title>
            <ButtonContainer>
              <Button
                themeColor={"primary"}
                fillMode={"solid"}
                onClick={() => {
                  setMainDataResult(process([], mainDataState));
                  setCheckDataResult(process([], checkDataState));
                  setInformation({
                    scanno: "",
                    str: "",
                    isSearch: false,
                  });
                  barcode = "";
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
                }}
                icon="check"
              >
                AllCheck
              </Button>
              <Button onClick={() => {}} icon="save">
                저장
              </Button>
            </ButtonContainer>
          </TitleContainer>
          <GridContainer className="leading_PDA_container">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>
                      제품바코드
                    </th>
                    <td>
                      <Input
                        name="scanno"
                        type="text"
                        value={Information.scanno}
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
              height: "50vh",
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
                          (data) => data.scanno == item.scanno
                        )[0] != undefined
                          ? "#d6d8f9"
                          : "white",
                    }}
                  >
                    <CardContent
                      onClick={() => onCheckClick(item)}
                      style={{ textAlign: "left", padding: "8px" }}
                    >
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
                    <th style={{ width: "5%", minWidth: "80px" }}>선택중량</th>
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
                    <th style={{ width: "5%", minWidth: "80px" }}>총중량</th>
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
                  <tr>
                    <th style={{ width: "5%", minWidth: "80px" }}>판매업체</th>
                  </tr>
                  <tr>
                    <th style={{ width: "5%", minWidth: "80px" }}>투입옵션</th>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default MA_A3500W_615;
