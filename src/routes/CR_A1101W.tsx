import {
  Box,
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
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  FilterBox,
  GridContainer,
  GridContainerWrap,
  NumberKeypad,
  NumberKeypadCell,
  NumberKeypadRow,
} from "../CommonStyled";
import {
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  findMessage,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE } from "../components/CommonString";
import { useApi } from "../hooks/api";
import { heightstate, isLoading } from "../store/atoms";
import { Iparameters } from "../store/types";

let deviceWidth = document.documentElement.clientWidth;
let isMobile = deviceWidth <= 1200;

const CR_A1101W: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userid = UseGetValueFromSessionItem("user_id");
const pc = UseGetValueFromSessionItem("pc");
  const [inputValue, setInputValue] = useState("");
  const [count, setCount] = useState(30);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CR_A1101W", setMessagesData);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    processQuery([], mainDataState)
  );
  const [subDataResult, setSubDataResult] = useState<DataResult>(
    processQuery([], subDataState)
  );

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    // 숫자만 입력되게끔
    const regex = /^[0-9\b -]{0,13}$/;
    if (regex.test(e.target.value)) {
      setInputValue(e.target.value);
    }

    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "CHECKUSER",
    orgdiv: "",
    location: "",
    mobile_no: "",
    userid: userid,
    custcd: "",
    isSearch: true,
  });

  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    orgdiv: "",
    location: "",
    mobile_no: "",
    userid: userid,
    custcd: "",
    isSearch: true,
  });

  // 데이터 조회
  const fetchMainGrid = async (filter: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const para: Iparameters = {
      procedureName: "P_CR_A1101W_Q",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_mobile_no": filters.mobile_no,
        "@p_userid": "",
        "@p_custcd": "",
      },
    };

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt <= 0 && filters.mobile_no != "") {
        alert("사용자정보가 존재하지 않습니다.");
        return;
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));

    setLoading(false);
  };

  const fetchSubGrid = async (filter: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const para: Iparameters = {
      procedureName: "P_CR_A1101W_Q",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": subfilters.work_type,
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_mobile_no": subfilters.mobile_no,
        "@p_userid": "",
        "@p_custcd": "",
      },
    };

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setSubDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }

    setSubFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));

    setLoading(false);
  };

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (subfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setSubFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters]);

  const search = () => {
    try {
      if (filters.mobile_no == "" || filters.mobile_no == undefined) {
        throw findMessage(messagesData, "CR_A1101W_001");
      } else {
        setFilters((prev) => ({
          ...prev,
          mobile_no: filters.mobile_no,
          isSearch: true,
        }));
        setSubFilters((prev) => ({
          ...prev,
          mobile_no: filters.mobile_no,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }

    setCount(30); // 타이머 초기화
  };

  const resetInput = () => {
    // 휴대폰 번호 빈값 처리 및 조회 reset
    setInputValue("");
    setCount(30);
    setMainDataResult(processQuery([], mainDataState));
    setSubDataResult(processQuery([], subDataState));
  };

  const [paraData, setParaData] = useState({
    workType: "SAVE",
    orgdiv: orgdiv,
    location: location,
    custcd: "",
    membership_id: "",
    user: "",
    user_id: userid,
    pc: pc,
    form_id: "CR_A1101W",
  });

  const para: Iparameters = {
    procedureName: "P_CR_A1101W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_custcd": paraData.custcd,
      "@p_membership_id": paraData.membership_id,
      "@p_user": paraData.user,
      "@p_userid": paraData.user_id,
      "@p_pc": pc,
      "@p_form_id": "CR_A1101W",
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
      if (data.resultMessage != "") {
        alert(data.resultMessage);
      } else {
        alert("출석되었습니다.");
        resetInput();
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onSaveClick = async (custcd: string, custnm: string) => {
    if (!window.confirm(custnm + " 등원 하시겠습니까?")) {
      return false;
    }

    const find_key = subDataResult.data.filter(
      (item) => item.custcd == custcd
    )[0].membership_id;

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: orgdiv,
      location: location,
      custcd: custcd,
      membership_id: find_key,
      user: "",
      userid: userid,
      pc: pc,
      form_id: "CR_A1101W",
    }));
  };

  useEffect(() => {
    if (paraData != undefined && paraData.custcd != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((count) => count - 1);
    }, 1000);

    // 0이 되면 새로고침 및 다시 30초 카운트
    if (count == 0) {
      clearInterval(id);
      resetInput();
    }
    return () => clearInterval(id);
  }, [count]);

  // 키패드 숫자 입력
  const enterNumber = async (e: any) => {
    const value = e.currentTarget.innerText;
    let str = "";

    if (value == "Del") {
      // 뒤에서 한 문자씩 삭제
      str = inputValue.slice(0, -1);
    } else if (value != "") {
      // 숫자 입력
      str = inputValue + value;
    } else {
      // 삭제
      str = "";
    }

    // Input 세팅
    setInputValue(str);

    // 조회조건 세팅
    setFilters((prev) => ({
      ...prev,
      mobile_no: str,
      isSearch: false,
    }));

    // 타이머 초기화
    setCount(30);
  };

  return (
    <>
      <div style={{ fontFamily: "TheJamsil5Bold" }}>
        {isMobile ? (
          <>
            <GridContainer
              style={{
                width: "100%",
                height: deviceHeight,
                overflowY: "scroll",
              }}
            >
              <GridContainer
                style={{
                  display: "flex",
                  backgroundColor: "#f5b901",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "45vh",
                  marginTop: "10px",
                }}
              >
                <img
                  src={`/logo_ddgd.png`}
                  alt=""
                  width={"200px"}
                  height={"200px"}
                  style={{
                    borderRadius: "70%",
                    overflow: "hidden",
                    backgroundColor: "white",
                  }}
                />
              </GridContainer>
              <GridContainer>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <FilterBox
                    onKeyPress={(e) => handleKeyPressSearch(e, search)}
                  >
                    <tbody className="PR_A3000W">
                      <tr>
                        <td>
                          <Input
                            name="mobile_no"
                            type="text"
                            onChange={filterInputChange}
                            value={inputValue}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FilterBox>
                  <Button
                    onClick={search}
                    style={{
                      marginLeft: "10px",
                      backgroundColor: "#F7E8CF",
                      width: "280px",
                      height: "85px",
                      fontSize: "30px",
                    }}
                  >
                    조회
                  </Button>
                </div>
              </GridContainer>
              <GridContainer
                style={{
                  height: "38vh",
                }}
              >
                <NumberKeypad style={{ height: "100%" }}>
                  <NumberKeypadRow style={{ height: "25%" }}>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      1
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      2
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      3
                    </NumberKeypadCell>
                  </NumberKeypadRow>
                  <NumberKeypadRow style={{ height: "25%" }}>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      4
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      5
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      6
                    </NumberKeypadCell>
                  </NumberKeypadRow>
                  <NumberKeypadRow style={{ height: "25%" }}>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      7
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      8
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      9
                    </NumberKeypadCell>
                  </NumberKeypadRow>
                  <NumberKeypadRow style={{ height: "25%" }}>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      <span className={"k-icon k-i-x"}></span>
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      0
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      Del
                    </NumberKeypadCell>
                  </NumberKeypadRow>
                </NumberKeypad>
              </GridContainer>
              <GridContainer
                style={{
                  height: "15%",
                  marginTop: "50px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    fontSize: "40px",
                    marginBottom: "40px",
                    backgroundColor: "#f5b901",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  체크인독 출석체크
                </div>
              </GridContainer>
              <GridContainer
                style={{
                  height: `calc(75% - ${GAP}px)`,
                  overflowY: "scroll",
                  maxHeight: `calc(70% - ${GAP}px)`,
                  marginTop: "20px",
                }}
              >
                <Grid container spacing={2}>
                  {subDataResult.data.map((item) => (
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Card
                        style={{
                          width: "100%",
                          marginRight: "15px",
                          borderRadius: "10px",
                          backgroundColor: item.color,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onClick={() => onSaveClick(item.custcd, item.custnm)}
                      >
                        <Box
                          style={{
                            width: "30%",
                            marginLeft: "10px",
                          }}
                        >
                          <CardHeader
                            title={
                              <>
                                <Typography
                                  style={{
                                    color: "black",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    fontFamily: "TheJamsil5Bold",
                                  }}
                                >
                                  {item.class}
                                </Typography>
                              </>
                            }
                          />
                          <CardContent style={{ display: "flex" }}>
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
                              {item.custnm}
                            </Typography>
                          </CardContent>
                        </Box>
                        <Box style={{ width: "40%" }}>
                          <CardHeader
                            title={
                              <>
                                <Typography
                                  style={{
                                    color: "black",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    fontFamily: "TheJamsil5Bold",
                                  }}
                                >
                                  유효기간
                                </Typography>
                              </>
                            }
                          />
                          <CardContent style={{ display: "flex" }}>
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
                              {item.enddt}
                            </Typography>
                          </CardContent>
                        </Box>
                        <Box style={{ width: "20%" }}>
                          <CardHeader
                            title={
                              <>
                                <Typography
                                  style={{
                                    color: "black",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    fontFamily: "TheJamsil5Bold",
                                  }}
                                >
                                  잔여횟수
                                </Typography>
                              </>
                            }
                          />
                          <CardContent style={{ display: "flex" }}>
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
                              {item.useqty}회
                            </Typography>
                          </CardContent>
                        </Box>
                        <Box style={{ width: "30%" }}>
                          <CardHeader
                            title={
                              <>
                                <Typography
                                  style={{
                                    color: "black",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    fontFamily: "TheJamsil5Bold",
                                  }}
                                >
                                  포인트
                                </Typography>
                              </>
                            }
                          />
                          <CardContent style={{ display: "flex" }}>
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
                              {item.point}점
                            </Typography>
                          </CardContent>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </GridContainer>
              <GridContainer
                style={{
                  width: "100%",
                  height: "10%",
                  color: "#373737",
                  fontSize: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "30px",
                }}
              >
                <div>({count})초 뒤 새로고침 됩니다.</div>
              </GridContainer>
            </GridContainer>
          </>
        ) : (
          <GridContainerWrap>
            <GridContainer
              style={{
                width: "45%",
                height: "86vh",
              }}
            >
              <GridContainer
                style={{
                  display: "flex",
                  backgroundColor: "#f5b901",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "45vh",
                  marginTop: "10px",
                }}
              >
                <img
                  src={`/logo_ddgd.png`}
                  alt=""
                  width={"400px"}
                  height={"400px"}
                  style={{
                    borderRadius: "70%",
                    overflow: "hidden",
                    backgroundColor: "white",
                  }}
                />
              </GridContainer>
              <GridContainer>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "10px",
                    marginBottom: "10px",
                    marginLeft: "5px",
                  }}
                >
                  <FilterBox
                    onKeyPress={(e) => handleKeyPressSearch(e, search)}
                  >
                    <tbody className="PR_A3000W">
                      <tr>
                        <td>
                          <Input
                            name="mobile_no"
                            type="text"
                            onChange={filterInputChange}
                            value={inputValue}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FilterBox>
                  <Button
                    onClick={search}
                    style={{
                      marginLeft: "10px",
                      backgroundColor: "#F7E8CF",
                      width: "280px",
                      height: "85px",
                      fontSize: "30px",
                    }}
                  >
                    조회
                  </Button>
                </div>
              </GridContainer>
              <GridContainer
                style={{
                  height: "38vh",
                }}
              >
                <NumberKeypad style={{ height: "100%" }}>
                  <NumberKeypadRow style={{ height: "25%" }}>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      1
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      2
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      3
                    </NumberKeypadCell>
                  </NumberKeypadRow>
                  <NumberKeypadRow style={{ height: "25%" }}>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      4
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      5
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      6
                    </NumberKeypadCell>
                  </NumberKeypadRow>
                  <NumberKeypadRow style={{ height: "25%" }}>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      7
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      8
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      9
                    </NumberKeypadCell>
                  </NumberKeypadRow>
                  <NumberKeypadRow style={{ height: "25%" }}>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      <span className={"k-icon k-i-x"}></span>
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      0
                    </NumberKeypadCell>
                    <NumberKeypadCell
                      style={{
                        fontSize: "35px",
                        userSelect: "none",
                        backgroundColor: "#f5b901",
                      }}
                      onClick={enterNumber}
                    >
                      Del
                    </NumberKeypadCell>
                  </NumberKeypadRow>
                </NumberKeypad>
              </GridContainer>
            </GridContainer>
            <GridContainer
              style={{
                width: `calc(55% - ${GAP}px)`,
                height: "97vh",
              }}
            >
              <GridContainer
                style={{
                  height: "15%",
                  marginTop: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    fontSize: "40px",
                    marginBottom: "40px",
                    backgroundColor: "#f5b901",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  체크인독 출석체크
                </div>
              </GridContainer>
              <GridContainer
                style={{
                  height: `calc(75% - ${GAP}px)`,
                  overflowY: "scroll",
                  maxHeight: `calc(70% - ${GAP}px)`,
                }}
              >
                <Grid container spacing={2}>
                  {subDataResult.data.map((item) => (
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Card
                        style={{
                          width: "100%",
                          marginRight: "15px",
                          borderRadius: "10px",
                          backgroundColor: item.color,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onClick={() => onSaveClick(item.custcd, item.custnm)}
                      >
                        <Box
                          style={{
                            width: "30%",
                            marginLeft: "20px",
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
                                  {item.class}
                                </Typography>
                              </>
                            }
                          />
                          <CardContent style={{ display: "flex" }}>
                            <Typography
                              style={{
                                color: "black",
                                fontSize: "40px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              {item.custnm}
                            </Typography>
                          </CardContent>
                        </Box>
                        <Box style={{ width: "40%" }}>
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
                                  유효기간
                                </Typography>
                              </>
                            }
                          />
                          <CardContent style={{ display: "flex" }}>
                            <Typography
                              style={{
                                color: "black",
                                fontSize: "40px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              {item.enddt}
                            </Typography>
                          </CardContent>
                        </Box>
                        <Box style={{ width: "20%" }}>
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
                                  잔여횟수
                                </Typography>
                              </>
                            }
                          />
                          <CardContent style={{ display: "flex" }}>
                            <Typography
                              style={{
                                color: "black",
                                fontSize: "40px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              {item.useqty}회
                            </Typography>
                          </CardContent>
                        </Box>
                        <Box style={{ width: "30%" }}>
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
                                  포인트
                                </Typography>
                              </>
                            }
                          />
                          <CardContent style={{ display: "flex" }}>
                            <Typography
                              style={{
                                color: "black",
                                fontSize: "40px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              {item.point}점
                            </Typography>
                          </CardContent>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </GridContainer>
              <GridContainer
                style={{
                  width: "100%",
                  height: "10%",
                  color: "#373737",
                  fontSize: "30px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div>({count})초 뒤 새로고침 됩니다.</div>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        )}
      </div>
    </>
  );
};
export default CR_A1101W;
