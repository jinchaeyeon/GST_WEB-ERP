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
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { Iparameters } from "../store/types";

var barcode = "";

const MA_A3500W_615: React.FC = () => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
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
    custcd: "",
    custnm: "",
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
  };

  useEffect(() => {
    if (Information.isSearch && Information.str != "") {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        barcode: Information.str,
      }));
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
      out: "A",
      custcd: "",
      custnm: "",
      isSearch: false,
    });
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
  };

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
    } else {
      console.log(data);
    }
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
              height: "50vh",
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
                      />
                    </td>
                  </tr>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>판매업체</th>
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
                          }}
                          icon="reset"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th style={{ width: "5%", minWidth: "80px" }}>판매업체</th>
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
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
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
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
        </>
      )}
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

export default MA_A3500W_615;
