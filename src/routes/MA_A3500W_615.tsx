import { Card, CardContent, Grid, Typography } from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import "swiper/css";
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
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters } from "../store/types";

var barcode = "";
let interval: any;
let timestamp = 0;

const MA_A3500W_615: React.FC = () => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
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
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("MA_A3500W_615", setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setInformation((prev) => ({
        ...prev,
        out: defaultOption.find((item: any) => item.id === "out").valueCode,
      }));
    }
  }, [customOptionData]);

  const [Information, setInformation] = useState({
    scanno: "",
    str: "",
    out: "A",
    isSearch: false,
  });
  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (!isMobile) {
      (document.activeElement as HTMLElement).blur();
    }
    events();
  };

  useEffect(() => {
    if (Information.isSearch && Information.str != "") {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        barcode: Information.str,
      }));
    }
    events();
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
    events();
  };

  const resetAll = () => {
    setMainDataResult(process([], mainDataState));
    setCheckDataResult(process([], checkDataState));
    barcode = "";
    setInformation({
      scanno: "",
      str: "",
      out: "A",
      isSearch: false,
    });
    let availableWidthPx = document.getElementById("allreset");
    availableWidthPx?.blur();
  };

  const getWgt = (data: any[]) => {
    let sum = 0;
    data.map((item: any) => {
      sum += item.wgt;
    });

    return sum;
  };

  const [filters, setFilters] = useState({
    barcode: "",
    pgNum: 1,
    isSearch: false,
    pgSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //요약정보 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_A3500W_615_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_barcode": filters.barcode,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setInformation((prev) => ({
        ...prev,
        scanno: filters.barcode,
        isSearch: false,
      })); // 한번만 조회되도록
      const newItem = {
        scanno: totalRowCnt > 0 ? rows[0].barcode : Information.str,
        wgt: totalRowCnt > 0 ? rows[0].wgt : 0,
      };
      let checkData = mainDataResult.data.filter(
        (item) => item.scanno == newItem.scanno
      )[0];
      if (checkData != undefined) {
        alert("이미 존재하는 데이터입니다.");
        setTimeout(function () {
          events();
        }, 1);
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
      setInformation((prev) => ({ ...prev, str: "", isSearch: false })); // 한번만 조회되도록
      barcode = "";
    } else {
      alert(data.resultMessage);
      setTimeout(function () {
        events();
      }, 1);
      setInformation((prev) => ({ ...prev, str: "", isSearch: false })); // 한번만 조회되도록
      console.log(data);
      barcode = "";
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
      barcode_s: [],
    };
    if (checkDataResult.total > 0) {
      checkDataResult.data.forEach((item: any, idx: number) => {
        const { scanno = "" } = item;

        dataArr.barcode_s.push(scanno);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "N",
        orgdiv: "01",
        out: Information.out,
        barcode_s: dataArr.barcode_s.join("|"),
      }));
    } else {
      alert("데이터가 없습니다.");
      setTimeout(function () {
        events();
      }, 1);
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    out: "",
    barcode_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_MA_A3500W_615_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_custcd": "",
      "@p_out": ParaData.out,
      "@p_barcode_s": ParaData.barcode_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A3500W_615",
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

    if (data.isSuccess === true) {
      alert("저장되었습니다.");
      setTimeout(function () {
        events();
      }, 1);
      resetAll();
      setParaData({
        workType: "",
        orgdiv: "01",
        out: "",
        barcode_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
      setTimeout(function () {
        events();
      }, 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  useEffect(() => {
    if (isMobile) {
      events();
    }
  },[mainDataResult.data]);
  
  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (
      e.nativeEvent.data != null &&
      Math.abs(Information.str.length - value.length) == 1
    ) {
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

  const events = () => {
    if (isMobile) {
      document.getElementById("hiddeninput")?.focus();
    }
  };

  return (
    <>
      {isMobile ? (
        <>
          <TitleContainer style={{ marginBottom: "15px" }}>
            <Title style={{ textAlign: "center" }}>생산투입</Title>
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
                  events();
                }}
                icon="check"
              >
                AllCheck
              </Button>
              <Button onClick={() => onSaveClick()} icon="save">
                저장
              </Button>
            </ButtonContainer>
          </TitleContainer>
          <GridContainer className="leading_PDA_container">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>스캔번호</th>
                    <td>
                      <Input
                        name="str"
                        type="text"
                        id="hiddeninput"
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
                      제품바코드
                    </th>
                    <td>
                      <Input
                        name="scanno"
                        type="text"
                        value={Information.scanno}
                        style={{ width: "100%" }}
                        className="readonly"
                        onClick={() => events()}
                      />
                      <ButtonInInput>
                        <Button
                          onClick={() => {
                            barcode = "";
                            setInformation((prev) => ({
                              ...prev,
                              scanno: "",
                              str: "",
                              isSearch: false,
                            }));
                            events();
                          }}
                          icon="reset"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
          <GridContainer
            style={{
              height: "45vh",
              overflowY: "scroll",
              marginBottom: "10px",
              width: "100%",
            }}
          >
            <Grid container spacing={2}>
              {mainDataResult.data.map((item, idx) => (
                <Grid key={idx} item xs={12} sm={12} md={12} lg={12} xl={12}>
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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          style={{
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                        >
                          {item.scanno}
                        </Typography>
                      </CardContent>
                    </Card>
                  </AdminQuestionBox>
                </Grid>
              ))}
            </Grid>
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
                        type="text"
                        style={{
                          textAlign: "right",
                        }}
                        className="readonly"
                        value={checkDataResult.total}
                        onClick={() => events()}
                      />
                    </td>
                    <th style={{ width: "5%", minWidth: "80px" }}>스캔건수</th>
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
                  </tr>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>선택중량</th>
                    <td>
                      <Input
                        name="chk"
                        type="text"
                        style={{
                          textAlign: "right",
                        }}
                        className="readonly"
                        value={getWgt(checkDataResult.data)}
                        onClick={() => events()}
                      />
                    </td>
                    <th style={{ width: "5%", minWidth: "80px" }}>총중량</th>
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
                    <th style={{ width: "5%", minWidth: "80px" }}>투입옵션</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          name="out"
                          customOptionData={customOptionData}
                          changeData={RadioChange}
                        />
                      )}
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
            <Title>생산투입</Title>
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
                  let availableWidthPx = document.getElementById("allcheck");
                  availableWidthPx?.blur();
                }}
                id="allcheck"
                icon="check"
              >
                AllCheck
              </Button>
              <Button onClick={() => onSaveClick()} icon="save">
                저장
              </Button>
            </ButtonContainer>
          </TitleContainer>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>바코드스캔</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th style={{ width: "5%", minWidth: "80px" }}>
                      제품바코드
                    </th>
                    <td>
                      <Input
                        name="scanno"
                        type="text"
                        id="scanno"
                        value={Information.scanno}
                        style={{ width: "100%" }}
                        className="readonly"
                        disabled={true}
                      />
                      <ButtonInInput>
                        <Button
                          onClick={() => {
                            barcode = "";
                            setInformation((prev) => ({
                              ...prev,
                              scanno: "",
                              str: "",
                              isSearch: false,
                            }));
                            let availableWidthPx =
                              document.getElementById("reset");
                            availableWidthPx?.blur();
                          }}
                          id="reset"
                          icon="reset"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th style={{ width: "5%", minWidth: "80px" }}>투입옵션</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          name="out"
                          customOptionData={customOptionData}
                          changeData={RadioChange}
                        />
                      )}
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <GridContainer
              style={{
                height: "65vh",
                overflowY: "scroll",
                width: "100%",
                marginBottom: "10px",
              }}
            >
              <Grid container spacing={2}>
                {mainDataResult.data.map((item, idx) => (
                  <Grid key={idx} item xs={12} sm={12} md={6} lg={4} xl={4}>
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
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            style={{
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                            }}
                          >
                            {item.scanno}
                          </Typography>
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
                    <th style={{ width: "5%", minWidth: "80px" }}>선택건수</th>
                    <td>
                      <Input
                        name="chk"
                        type="text"
                        style={{
                          textAlign: "right",
                        }}
                        className="readonly"
                        value={checkDataResult.total}
                        disabled={true}
                      />
                    </td>
                    <th style={{ width: "5%", minWidth: "80px" }}>스캔건수</th>
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
                    <th style={{ width: "5%", minWidth: "80px" }}>선택중량</th>
                    <td>
                      <Input
                        name="chk"
                        type="text"
                        style={{
                          textAlign: "right",
                        }}
                        className="readonly"
                        value={getWgt(checkDataResult.data)}
                        disabled={true}
                      />
                    </td>
                    <th style={{ width: "5%", minWidth: "80px" }}>총중량</th>
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
      )}
    </>
  );
};

export default MA_A3500W_615;
