import { Card, CardContent, Grid } from "@mui/material";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AdminQuestionBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  ScrollableContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  convertDateToStr,
  dateformat2,
  getQueryFromBizComponent,
} from "../components/CommonFunction";
import CurrentTime from "../components/DDGDcomponents/CurrentTime";
import { useApi } from "../hooks/api";
import { loginResultState, sessionItemState } from "../store/atoms";
import { Iparameters } from "../store/types";
import {
  COM_CODE_DEFAULT_VALUE,
  SELECTED_FIELD,
} from "../components/CommonString";
import {
  Grid as GridKendo,
  GridDataStateChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridColumn,
} from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";

const DATA_ITEM_KEY = "num";

const Main: React.FC = () => {
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const userName = loginResult ? loginResult.userName : "";
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const userId = loginResult ? loginResult.userId : "";
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA310",
    //품목계정, 수량단위
    setBizComponentData
  );
  //공통코드 리스트 조회 ()
  const [classListData, setClassListData] = useState([COM_CODE_DEFAULT_VALUE]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const classQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA310")
      );

      fetchQuery(classQueryStr, setClassListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [cardOptionState, setCardOptionState] = useState<State>({
    sort: [],
  });
  const [questionDataState, setQuestionDataState] = useState<State>({
    sort: [],
  });
  const [noticeDataState, setNoticeDataState] = useState<State>({
    sort: [],
  });
  const [cardOptionData, setCardOptionData] = useState<DataResult>(
    process([], cardOptionState)
  );
  const [questionDataResult, setQuestionDataResult] = useState<DataResult>(
    process([], questionDataState)
  );
  const [noticeDataResult, setNoticeDataResult] = useState<DataResult>(
    process([], noticeDataState)
  );

  const [adjcnt, setAdjcnt] = useState(0);
  const [addcnt, setAddcnt] = useState(0);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };
  useEffect(() => {
    if (sessionUserId === "") fetchSessionItem();
    // if (token && sessionUserId === "") fetchSessionItem();
  }, [sessionUserId]);

  let sessionOrgdiv = sessionItem.find(
    (sessionItem) => sessionItem.code === "orgdiv"
  )!.value;
  let sessionLocation = sessionItem.find(
    (sessionItem) => sessionItem.code === "location"
  )!.value;

  if (sessionOrgdiv === "") sessionOrgdiv = "01";
  if (sessionLocation === "") sessionLocation = "01";

  useEffect(() => {
    if (sessionItem) {
    }
  }, []);

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
  const [filters, setFilters] = useState<any>({
    pgSize: 100,
    workType: "Q",
    frdt: new Date(),
    find_row_value: "",
  });
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };
  const fetchMain = async () => {
    let data: any;
    const Parameters: Iparameters = {
      procedureName: "sys_sel_default_home_web",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "MANAGER",
        "@p_orgdiv": "01",
        "@p_location": "01",
        "@p_user_id": userId,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_ref_date": convertDateToStr(filters.frdt),
        "@p_ref_key": "",
      },
    };
    try {
      data = await processApi<any>("procedure", Parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rowCount = data.tables[0].RowCount;
      const row = data.tables[0].Rows.map((items: any) => ({
        ...items,
        class: classListData.find((item: any) => item.sub_code == items.class)
          ?.code_name,
      }));
      const row2 = data.tables[1].Rows;
      const row3 = data.tables[2].Rows;
      const rowCount4 = data.tables[3].RowCount;
      const row4 = data.tables[3].Rows;
      const rowCount5 = data.tables[4].RowCount;
      const row5 = data.tables[4].Rows;

      setCardOptionData((prev) => {
        return {
          data: row,
          total: rowCount == -1 ? 0 : rowCount,
        };
      });
      setAdjcnt(row2[0].adjcnt);
      setAddcnt(row3[0].addcnt);
      setQuestionDataResult((prev) => {
        return {
          data: row4,
          total: rowCount4 == -1 ? 0 : rowCount4,
        };
      });
      setNoticeDataResult((prev) => {
        return {
          data: row5,
          total: rowCount5 == -1 ? 0 : rowCount5,
        };
      });
      if (rowCount5 > 0) {
        setSelectedState({ [row5[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };
  useEffect(() => {
    fetchMain();
  }, [filters]);

  const onNoticeDataStateChange = (event: GridDataStateChangeEvent) => {
    setNoticeDataState(event.dataState);
  };

  const onNoticeSortChange = (e: any) => {
    setNoticeDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  return (
    <>
      <TitleContainer>
        <Title>{userName}님, 좋은 하루되세요</Title>
      </TitleContainer>
      <GridContainerWrap height={"90%"}>
        {!isMobile ? (
          <>
            <GridContainer width="20%" height="100%">
              <Card
                style={{
                  width: "100%",
                  marginRight: "15px",
                  borderRadius: "10px",
                  backgroundColor: "#f9D202",
                  height: "15vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <CardContent
                  style={{
                    fontSize: "1.3rem",
                    width: "95%",
                    height: "85%",
                    borderRadius: "10px",
                    backgroundColor: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CurrentTime />
                </CardContent>
              </Card>
              <FormBoxWrap>
                <FormBox>
                  <tbody>
                    <tr>
                      <th className="home">
                        <GridTitle style={{ marginBottom: "0px" }}>
                          등원예정 :
                        </GridTitle>
                      </th>
                      <td>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Button
                            type={"button"}
                            onClick={() => {
                              const today = filters.frdt;
                              const yesterday = new Date(today);
                              yesterday.setDate(today.getDate() - 1);
                              setFilters((prev: any) => ({
                                ...prev,
                                frdt: yesterday,
                              }));
                            }}
                            icon="arrow-60-left"
                            fillMode="flat"
                          />

                          <DatePicker
                            name="frdt"
                            value={filters.frdt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                          />
                          <Button
                            type={"button"}
                            onClick={() => {
                              const today = filters.frdt;
                              const tomorrow = new Date(today);
                              tomorrow.setDate(today.getDate() + 1);
                              setFilters((prev: any) => ({
                                ...prev,
                                frdt: tomorrow,
                              }));
                            }}
                            icon="arrow-60-right"
                            fillMode="flat"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer
                height="34vh"
                style={{
                  overflowY: "scroll",
                  marginBottom: "20px",
                  border: "3px solid #f9d202",
                  borderRadius: "10px",
                }}
              >
                <GridContainer style={{ margin: "10px" }}>
                  <Grid container spacing={2}>
                    {cardOptionData.total == 0 ? (
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Card
                          style={{
                            width: "100%",
                            marginRight: "15px",
                            borderRadius: "10px",
                            backgroundColor: "#f9D202",
                          }}
                        >
                          <CardContent
                            style={{
                              fontSize: "1.2rem",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            X
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : (
                      cardOptionData.data.map((item: any) => (
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <Card
                            style={{
                              width: "100%",
                              marginRight: "15px",
                              borderRadius: "10px",
                              backgroundColor: "#f9D202",
                            }}
                          >
                            <CardContent
                              style={{
                                fontSize: "1.2rem",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <div style={{ float: "left" }}>{item.class}</div>
                              <div style={{ float: "right" }}>
                                {item.cnt}마리
                              </div>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </GridContainer>
              </GridContainer>
              <GridTitleContainer>
                <GridTitle>변경권 신청 확인</GridTitle>
              </GridTitleContainer>
              <Card
                style={{
                  width: "100%",
                  marginRight: "15px",
                  borderRadius: "10px",
                  backgroundColor: "#f9D202",
                  marginBottom: "30px",
                  height: "10vh",
                }}
              >
                <CardContent
                  style={{
                    fontSize: "1.2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ float: "left" }}>승인대기</div>
                  <div style={{ float: "right" }}>{adjcnt}건</div>
                </CardContent>
              </Card>
              <GridTitleContainer>
                <GridTitle>부가서비스 신청 확인</GridTitle>
              </GridTitleContainer>
              <Card
                style={{
                  width: "100%",
                  marginRight: "15px",
                  borderRadius: "10px",
                  backgroundColor: "#f9D202",
                  height: "10vh",
                }}
              >
                <CardContent
                  style={{
                    fontSize: "1.2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ float: "left" }}>승인대기</div>
                  <div style={{ float: "right" }}>{addcnt}건</div>
                </CardContent>
              </Card>
            </GridContainer>
            <GridContainer width="30%" height="87vh">
              <GridTitleContainer>
                <GridTitle>회원권 연장 확인</GridTitle>
              </GridTitleContainer>
              <ScrollableContainer>
                <div className="scroll-wrapper">
                  {questionDataResult.data.map((item, idx) => (
                    <AdminQuestionBox key={idx}>
                      <div className={`status`}>{item.custnm}</div>
                      <div>
                        <p className="title">회원권명 : {item.gubunnm}</p>
                        <p className="customer">잔량 : {item.janqty}</p>
                      </div>
                      <div className="date">
                        <p>{dateformat2(item.strdt)}</p>
                        <p
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          {" "}
                          ~{" "}
                        </p>
                        <p>{dateformat2(item.enddt)}</p>
                      </div>
                    </AdminQuestionBox>
                  ))}
                </div>
              </ScrollableContainer>
            </GridContainer>
            <GridContainer width="25%" height="100%">
              미지정
            </GridContainer>
            <GridContainer width="25%" height="100%">
              <GridContainer height="55vh">미지정</GridContainer>
              <GridContainer height="35vh">
                <GridTitleContainer>
                  <GridTitle>시스템 업데이트 공지사항</GridTitle>
                </GridTitleContainer>
                <GridKendo
                  style={{ height: "90%" }}
                  data={process(
                    noticeDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)],
                    })),
                    noticeDataState
                  )}
                  {...noticeDataState}
                  onDataStateChange={onNoticeDataStateChange}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={noticeDataResult.total}
                  //정렬기능
                  sortable={true}
                  onSortChange={onNoticeSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn field="contents" title="내용" />
                </GridKendo>
              </GridContainer>
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
              <GridContainer width="100%">
                <Card
                  style={{
                    width: "100%",
                    marginRight: "15px",
                    borderRadius: "10px",
                    backgroundColor: "#f9D202",
                    height: "15vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <CardContent
                    style={{
                      fontSize: "1.3rem",
                      width: "95%",
                      height: "85%",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CurrentTime />
                  </CardContent>
                </Card>
                <GridTitleContainer>
                  <GridTitle>등원예정</GridTitle>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      type={"button"}
                      onClick={() => {
                        const today = filters.frdt;
                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        setFilters((prev: any) => ({
                          ...prev,
                          frdt: yesterday,
                        }));
                      }}
                      icon="arrow-60-left"
                      fillMode="flat"
                    />
                    <div style={{ width: `calc(100% - 60px)` }}>
                      <DatePicker
                        name="frdt"
                        value={filters.frdt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                      />
                    </div>
                    <Button
                      type={"button"}
                      onClick={() => {
                        const today = filters.frdt;
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        setFilters((prev: any) => ({
                          ...prev,
                          frdt: tomorrow,
                        }));
                      }}
                      icon="arrow-60-right"
                      fillMode="flat"
                    />
                  </div>
                  <GridContainer
                    height="34vh"
                    style={{
                      overflowY: "scroll",
                      marginBottom: "20px",
                      border: "3px solid #f9d202",
                      borderRadius: "10px",
                    }}
                  >
                    <GridContainer style={{ margin: "10px" }}>
                      <Grid container spacing={2}>
                        {cardOptionData.total == 0 ? (
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Card
                              style={{
                                width: "100%",
                                marginRight: "15px",
                                borderRadius: "10px",
                                backgroundColor: "#f9D202",
                              }}
                            >
                              <CardContent
                                style={{
                                  fontSize: "1.2rem",
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                X
                              </CardContent>
                            </Card>
                          </Grid>
                        ) : (
                          cardOptionData.data.map((item: any) => (
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                              <Card
                                style={{
                                  width: "100%",
                                  marginRight: "15px",
                                  borderRadius: "10px",
                                  backgroundColor: "#f9D202",
                                }}
                              >
                                <CardContent
                                  style={{
                                    fontSize: "1.2rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div style={{ float: "left" }}>
                                    {item.class}
                                  </div>
                                  <div style={{ float: "right" }}>
                                    {item.cnt}마리
                                  </div>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))
                        )}
                      </Grid>
                    </GridContainer>
                  </GridContainer>
                  <GridTitleContainer>
                    <GridTitle>변경권 신청 확인</GridTitle>
                  </GridTitleContainer>
                  <Card
                    style={{
                      width: "100%",
                      marginRight: "15px",
                      borderRadius: "10px",
                      backgroundColor: "#f9D202",
                      marginBottom: "30px",
                      height: "10vh",
                    }}
                  >
                    <CardContent
                      style={{
                        fontSize: "1.2rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "white",
                        height: "75%",
                      }}
                    >
                      <div style={{ float: "left" }}>승인대기</div>
                      <div style={{ float: "right" }}>{adjcnt}건</div>
                    </CardContent>
                  </Card>
                  <GridTitleContainer>
                    <GridTitle>부가서비스 신청 확인</GridTitle>
                  </GridTitleContainer>
                  <Card
                    style={{
                      width: "100%",
                      marginRight: "15px",
                      borderRadius: "10px",
                      backgroundColor: "#f9D202",
                      marginBottom: "20px",
                      height: "10vh",
                    }}
                  >
                    <CardContent
                      style={{
                        fontSize: "1.2rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "white",
                        height: "75%",
                      }}
                    >
                      <div style={{ float: "left" }}>승인대기</div>
                      <div style={{ float: "right" }}>{addcnt}건</div>
                    </CardContent>
                  </Card>
                </GridTitleContainer>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer width="100%">
                <GridTitleContainer>
                  <GridTitle>회원권 연장 확인</GridTitle>
                </GridTitleContainer>
                <ScrollableContainer>
                  <div className="scroll-wrapper">
                    {questionDataResult.data.map((item, idx) => (
                      <AdminQuestionBox key={idx}>
                        <div className={`status`}>{item.custnm}</div>
                        <div>
                          <p className="title">회원권명 : {item.gubunnm}</p>
                          <p className="customer">잔량 : {item.janqty}</p>
                        </div>
                        <div className="date">
                          <p>{dateformat2(item.strdt)}</p>
                          <p> ~ </p>
                          <p>{dateformat2(item.enddt)}</p>
                        </div>
                      </AdminQuestionBox>
                    ))}
                  </div>
                </ScrollableContainer>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer width="100%">미지정</GridContainer>
            </SwiperSlide>
            <SwiperSlide key={3}>
              <GridContainer width="100%">
                <GridContainer>미지정</GridContainer>
                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle>시스템 업데이트 공지사항</GridTitle>
                  </GridTitleContainer>
                  <GridKendo
                    style={{ minHeight: "30vh" }}
                    data={process(
                      noticeDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState[idGetter(row)],
                      })),
                      noticeDataState
                    )}
                    {...noticeDataState}
                    onDataStateChange={onNoticeDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={noticeDataResult.total}
                    //정렬기능
                    sortable={true}
                    onSortChange={onNoticeSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn field="contents" title="내용" />
                  </GridKendo>
                </GridContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        )}
      </GridContainerWrap>
    </>
  );
};

export default Main;
