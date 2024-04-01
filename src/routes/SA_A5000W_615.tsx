import { Card, CardContent, Grid, Typography } from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
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
  UseParaPc,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { Iparameters } from "../store/types";

var barcode = "";
var barcode2 = false;

const SA_A5000W_615: React.FC = () => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
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
  const [Information, setInformation] = useState({
    ordbarcode: "",
    itembarcode: "",
    str: "",
    str2: "",
    custcd: "",
    custnm: "",
    isSearch: false,
  });

  useEffect(() => {
    if (Information.isSearch && Information.str != "") {
      if (Information.str2 != "") {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          itembarcode: Information.str2,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          ordbarcode: Information.str,
        }));
      }
    }
  }, [Information]);

  useEffect(() => {
    document.addEventListener("keydown", function (evt) {
      if (evt.code == "Enter") {
        if (barcode != "") {
          if (barcode2 == false) {
            setInformation((prev) => ({
              ...prev,
              str: barcode,
              isSearch: true,
            }));
          } else {
            setInformation((prev) => ({
              ...prev,
              str2: barcode,
              isSearch: true,
            }));
          }
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
      (item) =>
        item.ordbarcode == datas.ordbarcode &&
        item.itembarcode == datas.itembarcode
    )[0];

    if (data != undefined) {
      const setdatas = checkDataResult.data.filter(
        (item) =>
          !(
            item.ordbarcode == datas.ordbarcode &&
            item.itembarcode == datas.itembarcode
          )
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
    barcode2 = false;
    setInformation({
      ordbarcode: "",
      itembarcode: "",
      str: "",
      str2: "",
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

    if (filters.itembarcode == "") {
      setInformation((prev) => ({
        ...prev,
        ordbarcode: filters.ordbarcode,
        isSearch: false,
      })); // 한번만 조회되도록
      barcode = "";
      barcode2 = true;
    } else {
      //조회조건 파라미터
      const parameters: Iparameters = {
        procedureName: "P_SA_A5000W_615_Q",
        pageNumber: filters.pgNum,
        pageSize: filters.pgSize,
        parameters: {
          "@p_work_type": "Q",
          "@p_ordbarcode": filters.ordbarcode,
          "@p_itembarcode": filters.itembarcode,
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

        const newItem = {
          ordbarcode: totalRowCnt > 0 ? rows[0].ordbarcode : Information.str,
          itembarcode: totalRowCnt > 0 ? rows[0].itembarcode : Information.str2,
          wgt: totalRowCnt > 0 ? rows[0].wgt : 0,
        };
        let checkData = mainDataResult.data.filter(
          (item) =>
            item.ordbarcode == newItem.ordbarcode &&
            item.itembarcode == newItem.itembarcode
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
        setInformation((prev) => ({
          ...prev,
          ordbarcode: "",
          itembarcode: "",
          str: "",
          str2: "",
          isSearch: false,
        })); // 한번만 조회되도록
        setFilters((prev) => ({
          ...prev,
          ordbarcode: "",
          itembarcode: "",
          isSearch: false,
        })); // 한번만 조회되도록
        barcode = "";
        barcode2 = false;
      } else {
        alert(data.resultMessage);
        barcode = "";
        barcode2 = false;
        console.log(data);
      }
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

  const onSaveClick = () => {
    let dataArr: any = {
      ordbarcode_s: [],
      itembarcode_s: [],
    };
    if (checkDataResult.total > 0) {
      if (Information.custcd != "") {
        checkDataResult.data.forEach((item: any, idx: number) => {
          const { ordbarcode = "", itembarcode = "" } = item;

          dataArr.ordbarcode_s.push(ordbarcode);
          dataArr.itembarcode_s.push(itembarcode);
        });

        setParaData((prev) => ({
          ...prev,
          workType: "N",
          orgdiv: "01",
          custcd: Information.custcd,
          ordbarcode_s: dataArr.ordbarcode_s.join("|"),
          itembarcode_s: dataArr.itembarcode_s.join("|"),
        }));
      } else {
        alert("거래처를 선택해주세요.");
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    custcd: "",
    ordbarcode_s: "",
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
      "@p_ordbarcode_s": ParaData.ordbarcode_s,
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

    if (data.isSuccess === true) {
      alert("저장되었습니다.");
      resetAll();
      setParaData({
        workType: "",
        orgdiv: "01",
        custcd: "",
        ordbarcode_s: "",
        itembarcode_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);
  return (
    <>
      {isMobile ? (
        <>
          <TitleContainer style={{ marginBottom: "15px" }}>
            <Title style={{ textAlign: "center" }}>판매처리</Title>
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
              <Button onClick={() => onSaveClick()} icon="save">
                저장
              </Button>
            </ButtonContainer>
          </TitleContainer>
          <GridContainer className="leading_PDA_container">
            <FormBoxWrap border={true}>
              <GridTitleContainer>
                <GridTitle></GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={() => {
                      barcode = "";
                      barcode2 = false;
                      setInformation((prev) => ({
                        ...prev,
                        ordbarcode: "",
                        itembarcode: "",
                        str: "",
                        str2: "",
                        isSearch: false,
                      }));
                    }}
                    icon="reset"
                    fillMode="flat"
                  />
                </ButtonContainer>
              </GridTitleContainer>
              <FormBox>
                <tbody>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>수주번호</th>
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
                  <tr style={{ display: "flex", flexDirection: "row" }}>
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
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <AdminQuestionBox key={idx}>
                    <Card
                      style={{
                        width: "100%",
                        cursor: "pointer",
                        backgroundColor:
                          checkDataResult.data.filter(
                            (data) =>
                              data.ordbarcode == item.ordbarcode &&
                              data.itembarcode == item.itembarcode
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
                          {item.ordbarcode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.itembarcode}
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
                    <th style={{ width: "5%", minWidth: "80px" }}>거래처</th>
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
          </GridContainer>
        </>
      ) : (
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
                    <th style={{ width: "5%", minWidth: "80px" }}>수주번호</th>
                    <td>
                      <Input
                        name="ordbarcode"
                        type="text"
                        value={Information.ordbarcode}
                        style={{ width: "100%" }}
                        className="readonly"
                        disabled={true}
                      />
                      <ButtonInInput>
                        <Button
                          onClick={() => {
                            barcode = "";
                            barcode2 = false;
                            setInformation((prev) => ({
                              ...prev,
                              ordbarcode: "",
                              itembarcode: "",
                              str: "",
                              str2: "",
                              isSearch: false,
                            }));
                          }}
                          icon="reset"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
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
                    <th style={{ width: "5%", minWidth: "80px" }}>거래처</th>
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
                            checkDataResult.data.filter(
                              (data) =>
                                data.ordbarcode == item.ordbarcode &&
                                data.itembarcode == item.itembarcode
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
                            {item.ordbarcode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.itembarcode}
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

export default SA_A5000W_615;
