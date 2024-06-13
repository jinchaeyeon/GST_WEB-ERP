import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  Input,
  NumericTextBox,
  NumericTextBoxChangeEvent,
} from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStrWithTime2,
  convertMilliSecondsToTimeStr,
  getBizCom,
  getDeviceHeight,
  getHeight,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import { COM_CODE_DEFAULT_VALUE } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import DefectWindow from "../components/Windows/PR_A3000W_Defect_Window";
import StopWindow from "../components/Windows/PR_A3000W_Stop_Window";
import { useApi } from "../hooks/api";
import { isLoading, sessionItemState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "idx";
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const PR_A3000W: React.FC = () => {
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pc = UseGetValueFromSessionItem("pc");

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".TitleContainer");
    height2 = getHeight(".ButtonContainer");
    height3 = getHeight(".ButtonContainer2");
    height4 = getHeight(".ButtonContainer3");

    const handleWindowResize = () => {
      let deviceWidth = document.documentElement.clientWidth;
      setIsMobile(deviceWidth <= 1200);
      setMobileHeight(getDeviceHeight(false) - height - height2);
      setMobileHeight2(getDeviceHeight(false) - height - height3 - height4);
      setWebHeight(getDeviceHeight(false) - height - height4);
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [webheight]);

  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();

  const userId = UseGetValueFromSessionItem("user_id");
  const setLoading = useSetRecoilState(isLoading);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_PR010,L_sysUserMaster_001,L_fxcode", setBizComponentData);

  //공통코드 리스트 조회 (사용자구분, 직위)
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [startOrEnd, setStartOrEnd] = useState<"start" | "end">("start");
  const [stopStartOrEnd, setStopStartOrEnd] = useState<"start" | "end">(
    "start"
  );
  const [stopStartTime, setStopStartTime] = useState(null);

  useEffect(() => {
    if (bizComponentData !== null) {
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
    }
  }, [bizComponentData]);

  type TMainDataResult = {
    itemnm: string;
    proccd: string;
    qty: number;
    prodqty: number;
  };
  // 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<TMainDataResult>({
    itemnm: "",
    proccd: "",
    qty: 0,
    prodqty: 0,
  });

  const [masterDataResult, setMasterDataResult] = useState({
    strtime: "",
    rekey: "",
  });

  // 세션 아이템
  const [sessionItem] = useRecoilState(sessionItemState);

  const [isInitSearch, setIsInitSearch] = useState(true);

  const [stopWindowVisible, setStopWindowVisible] = useState<boolean>(false);
  const [defectWindowVisible, setDefectWindowVisible] =
    useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //조회조건 NumericTextBox Change 함수 => 사용자가 NumericTextBox 입력한 값을 조회 파라미터로 세팅
  const filterNumericTextBoxChange = (e: NumericTextBoxChangeEvent) => {
    const { value } = e;
    const { name } = e.target;

    if (!name) {
      console.log("NumericTextBox name이 없음");
      return;
    }

    setFiltersSaved((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFiltersSaved((prev) => ({
      ...prev,
      work_type: "ValueChanged",
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    work_type: "PLAN",
    plankey: "",
    finyn: "N",
    ordkey: "",
    prodemp: "",
    prodmac: "",
    proccd: "",
    prod: "",
    frdt: "19990101",
    todt: "20991231",
    itemcd: "",
    itemnm: "",
    worknum: "",
    service_id: "",
  });
  const [filtersSaved, setFiltersSaved] = useState({
    work_type: "",
    prodemp: userId,
    prodmac: "",
    qty: 0,
    badqty: 0,
    rekey: "",
    stopcd: "",
    serviceid: "",
    userid: userId,
    pc: pc,
    form_id: "PR_A3000W",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_PR_A3000W_Q",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code == "orgdiv"
      )?.value,
      "@p_plankey": filters.plankey,
      "@p_finyn": filters.finyn,
      "@p_ordkey": filters.ordkey,
      "@p_prodemp": filters.prodemp,
      "@p_prodmac": filters.prodmac,
      "@p_proccd": filters.proccd,
      "@p_prod": filters.prod,
      "@p_frdt": filters.frdt,
      "@p_todt": filters.todt,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_worknum": filters.worknum,
      "@p_service_id": filters.service_id,
    },
  };

  const paraSaved: Iparameters = {
    procedureName: "P_PR_A3000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": filtersSaved.work_type,
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code == "orgdiv"
      )?.value,
      "@p_location": sessionItem.find(
        (sessionItem) => sessionItem.code == "location"
      )?.value,
      "@p_prodemp": filtersSaved.prodemp,
      "@p_prodmac": filtersSaved.prodmac,
      "@p_qty": filtersSaved.qty,
      "@p_badqty": filtersSaved.badqty,
      "@p_plankey": filters.plankey,
      "@p_rekey": masterDataResult.rekey,
      "@p_stopcd": filtersSaved.stopcd,
      "@p_serviceid": filtersSaved.serviceid,
      "@p_userid": filtersSaved.userid,
      "@p_pc": filtersSaved.pc,
      "@p_form_id": filtersSaved.form_id,
    },
  };

  //조회조건 파라미터
  const parametersMaster: Iparameters = {
    procedureName: "P_PR_A3000W_Q",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "MASTER",
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code == "orgdiv"
      )?.value,
      "@p_plankey": filters.plankey,
      "@p_finyn": filters.finyn,
      "@p_ordkey": filters.ordkey,
      "@p_prodemp": filtersSaved.prodemp,
      "@p_prodmac": filtersSaved.prodmac,
      "@p_proccd": filters.proccd,
      "@p_prod": filters.prod,
      "@p_frdt": filters.frdt,
      "@p_todt": filters.todt,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_worknum": filters.worknum,
      "@p_service_id": filters.service_id,
    },
  };

  const fetchStopData = async () => {
    let data: any;

    setLoading(true);
    const queryStr =
      "SELECT COUNT(1) as cnt, max(strtime) strtime FROM PR230T WHERE orgdiv = '" +
      sessionItem.find((sessionItem) => sessionItem.code == "orgdiv")?.value +
      "' AND prodmac = '" +
      filtersSaved.prodmac +
      "' AND isnull(endtime, '') = ''";

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
      const cnt = data.tables[0].Rows[0].cnt;
      const strtime = data.tables[0].Rows[0].strtime;

      if (cnt > 0) {
        setStopStartOrEnd("end");
        setStopStartTime(strtime);
      } else {
        setStopStartOrEnd("start");
        setStopStartTime(null);
      }
    } else {
      console.log("[오류발생]");
      console.log(data);
    }
    setLoading(false);
  };

  // 데이터 조회
  const fetchMain = async () => {
    //if (!permissions?.view) return;
    if (filters.plankey == "") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        idx: idx,
      }));

      if (totalRowCnt == 1) {
        const { itemnm, proccd, qty, prodqty, badqty } = rows[0];
        setMainDataResult({ itemnm, proccd, qty, prodqty });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  // 시작정보 조회
  const fetchMaster = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", parametersMaster);
    } catch (error) {
      data = null;
    }

    setFiltersSaved((prev) => ({ ...prev, work_type: "" }));

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        idx: idx,
      }));

      if (totalRowCnt > 0) {
        const { strtime, rekey, badqty } = rows[0];
        setMasterDataResult({ strtime, rekey });
        setFiltersSaved((prev) => ({ ...prev, badqty }));
        setStartOrEnd("end");
      } else {
        // 초기화
        setMasterDataResult({ strtime: "", rekey: "" });
        setFiltersSaved((prev) => ({ ...prev, qty: 0, badqty: 0 }));
        setStartOrEnd("start");
      }
      //rows[0];
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchMainSaved = async () => {
    if (!permissions?.save) return;

    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (
        filtersSaved.work_type == "START" ||
        filtersSaved.work_type == "END"
      ) {
        // 생산작업 시
        setFiltersSaved((prev) => ({ ...prev, work_type: "" }));

        if (startOrEnd == "start") {
          // 시작 => 시작 정보 조회
          fetchMaster();
          fetchStopData();
        } else {
          // 종료 => 초기화
          setStartOrEnd("start");
          setFilters((prev) => ({ ...prev, plankey: "", prodmac: "" }));
          setMainDataResult({ itemnm: "", proccd: "", qty: 0, prodqty: 0 });
          setFiltersSaved((prev) => ({ ...prev, qty: 0, badqty: 0 }));
          setMasterDataResult((prev) => ({
            ...prev,
            strtime: "",
            rekey: "",
          }));
        }
      } else {
        // 비가동종료 => 초기화
        setFiltersSaved((prev) => ({ ...prev, work_type: "" }));
        setStopStartOrEnd("start");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
      setFiltersSaved((prev) => ({ ...prev, work_type: "" }));
    }
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (isInitSearch && permissions !== null) {
      fetchMain();
      setIsInitSearch(false);
    }
    fetchStopData();
    fetchMaster();
  }, [filters, permissions]);

  useEffect(() => {
    if (filtersSaved.work_type == "ValueChanged") {
      // 작업자, 설비 데이터 변경 시
      fetchMaster();
      fetchStopData();
    } else if (filtersSaved.work_type !== "") {
      fetchMainSaved();
    }

    const timeId = setInterval(() => {
      if (masterDataResult.strtime !== "") {
        setDuration(
          convertMilliSecondsToTimeStr(
            +new Date() - +new Date(masterDataResult.strtime)
          )
        );
      } else {
        setDuration("00:00:00");
      }
    }, 1000);

    return () => clearTimeout(timeId);
  }, [filtersSaved]);

  useEffect(() => {}, []);

  useEffect(() => {}, []);

  const search = () => {
    fetchMain();
    fetchStopData();
  };
  const onClickWork = () => {
    //검증 처리
    if (filters.plankey == "") {
      alert("작업지시번호를 확인해주세요.");
      if (swiper && isMobile) {
        swiper.slideTo(0);
      }
      return;
    }

    if (
      startOrEnd == "end" &&
      filtersSaved.qty == 0 &&
      filtersSaved.badqty == 0
    ) {
      alert("수량을 입력하세요.");
      return;
    }

    setFiltersSaved((prev) => ({
      ...prev,
      work_type: startOrEnd.toUpperCase(),
    }));
  };
  const onClickStop = () => {
    if (stopStartOrEnd == "start") {
      //비가동시작
      if (filtersSaved.prodmac == "") {
        alert("설비를 선택해주세요.");
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
        return;
      }
      setStopWindowVisible(true);
    } else {
      //비가동종료
      setFiltersSaved((prev) => ({
        ...prev,
        work_type: "StopE",
      }));
    }
  };
  const onClickDefect = () => {
    setDefectWindowVisible(true);
  };

  const [duration, setDuration] = useState("");

  return (
    <>
      <TitleContainer className="TitleContainer">
        {isMobile ? (
          <Title>생산실적</Title>
        ) : (
          <Title className="iot-title">생산실적</Title>
        )}
      </TitleContainer>
      {isMobile ? (
        <>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                        icon="arrow-right"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        다음
                      </Button>
                    </ButtonContainer>
                  </GridTitle>
                </GridTitleContainer>
                <FormBoxWrap
                  style={{ height: mobileheight, overflow: "auto" }}
                  border={true}
                >
                  <FormBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                    <tbody>
                      <tr>
                        <th>작업지시번호</th>
                        <td colSpan={3}>
                          <Input
                            name="plankey"
                            type="text"
                            value={filters.plankey}
                            onChange={filterInputChange}
                            onBlur={search}
                          />
                        </td>
                      </tr>
                      <tr>
                        {/* <th>작업일자</th>
    <td>{dateformat2(convertDateToStr(new Date()))}</td> */}
                        <th>작업자</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="prodemp"
                              value={filtersSaved.prodemp}
                              bizComponentId="L_sysUserMaster_001"
                              bizComponentData={bizComponentData}
                              changeData={filterComboBoxChange}
                              valueField="user_id"
                              textField="user_name"
                            />
                          )}
                        </td>
                        <th>설비</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="prodmac"
                              value={filtersSaved.prodmac}
                              bizComponentId="L_fxcode"
                              bizComponentData={bizComponentData}
                              changeData={filterComboBoxChange}
                              valueField="fxcode"
                              textField="fxfull"
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>공정</th>
                        <td>
                          {proccdListData
                            ? proccdListData.find(
                                (item: any) =>
                                  item.sub_code == mainDataResult.proccd
                              )?.code_name
                            : ""}
                        </td>
                        <th>계획수량</th>
                        <td>{mainDataResult.qty}</td>
                      </tr>
                      <tr>
                        <th>품목</th>
                        <td>{mainDataResult.itemnm}</td>
                        <th>누적수량</th>
                        <td>{mainDataResult.prodqty}</td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="arrow-left"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        이전
                      </Button>
                    </ButtonContainer>
                  </GridTitle>
                </GridTitleContainer>
                <FormBoxWrap
                  border={true}
                  style={{ height: mobileheight2, overflow: "auto" }}
                >
                  <FormBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                    <tbody>
                      <tr>
                        <th>생산시작시간</th>
                        <td colSpan={3}>
                          {startOrEnd == "end"
                            ? convertDateToStrWithTime2(
                                new Date(masterDataResult.strtime)
                              ) +
                              " (경과시간 : " +
                              duration +
                              ")"
                            : "00:00:00"}
                        </td>
                      </tr>
                      <tr>
                        <th>수량</th>
                        <td>
                          <NumericTextBox
                            name="qty"
                            value={filtersSaved.qty}
                            onChange={filterNumericTextBoxChange}
                          />
                        </td>
                        <th>불량수량</th>
                        <td>
                          <NumericTextBox
                            name="badqty"
                            value={filtersSaved.badqty}
                            onChange={filterNumericTextBoxChange}
                          />
                        </td>
                      </tr>
                      {stopStartOrEnd == "end" && stopStartTime ? (
                        <tr>
                          <th>비가동시작시간</th>
                          <td colSpan={3}>
                            {convertDateToStrWithTime2(new Date(stopStartTime))}
                          </td>
                        </tr>
                      ) : (
                        ""
                      )}
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <ButtonContainer
                  style={{ justifyContent: "center" }}
                  className="ButtonContainer3"
                >
                  {permissions && (
                    <>
                      <Button
                        onClick={onClickWork}
                        themeColor={"primary"}
                        disabled={
                          permissions.save && stopStartOrEnd == "start"
                            ? false
                            : true
                        }
                        className="iot-btn green"
                        style={{
                          width: "90px",
                          height: "50px",
                          fontSize: "16px",
                        }}
                      >
                        {startOrEnd == "start" ? "시작" : "종료"}
                      </Button>
                      <Button
                        onClick={onClickDefect}
                        themeColor={"primary"}
                        disabled={
                          permissions.save &&
                          startOrEnd == "end" &&
                          stopStartOrEnd == "start"
                            ? false
                            : true
                        }
                        className="iot-btn red"
                        style={{
                          width: "95px",
                          height: "50px",
                          fontSize: "16px",
                        }}
                      >
                        불량입력
                      </Button>
                      <Button
                        onClick={onClickStop}
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                        className="iot-btn gray"
                        style={{
                          width: "100px",
                          height: "50px",
                          fontSize: "16px",
                        }}
                      >
                        {stopStartOrEnd == "start"
                          ? "비가동입력"
                          : "비가동종료"}
                      </Button>
                    </>
                  )}
                </ButtonContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainer style={{ height: webheight, overflow: "auto" }}>
            <FilterContainer>
              <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                <tbody className="PR_A3000W">
                  <tr>
                    <th>작업지시번호</th>
                    <td colSpan={3}>
                      <Input
                        name="plankey"
                        type="text"
                        value={filters.plankey}
                        onChange={filterInputChange}
                        onBlur={search}
                      />
                    </td>
                  </tr>
                  <tr>
                    {/* <th>작업일자</th>
    <td>{dateformat2(convertDateToStr(new Date()))}</td> */}
                    <th>작업자</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="prodemp"
                          value={filtersSaved.prodemp}
                          bizComponentId="L_sysUserMaster_001"
                          bizComponentData={bizComponentData}
                          changeData={filterComboBoxChange}
                          valueField="user_id"
                          textField="user_name"
                        />
                      )}
                    </td>
                    <th>설비</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="prodmac"
                          value={filtersSaved.prodmac}
                          bizComponentId="L_fxcode"
                          bizComponentData={bizComponentData}
                          changeData={filterComboBoxChange}
                          valueField="fxcode"
                          textField="fxfull"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>공정</th>
                    <td>
                      {proccdListData
                        ? proccdListData.find(
                            (item: any) =>
                              item.sub_code == mainDataResult.proccd
                          )?.code_name
                        : ""}
                    </td>
                    <th>계획수량</th>
                    <td>{mainDataResult.qty}</td>
                  </tr>
                  <tr>
                    <th>품목</th>
                    <td>{mainDataResult.itemnm}</td>
                    <th>누적수량</th>
                    <td>{mainDataResult.prodqty}</td>
                  </tr>
                </tbody>
              </FilterBox>
            </FilterContainer>
            <FilterContainer>
              <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                <tbody className="PR_A3000W">
                  <tr>
                    <th>생산시작시간</th>
                    <td colSpan={3}>
                      {startOrEnd == "end"
                        ? convertDateToStrWithTime2(
                            new Date(masterDataResult.strtime)
                          ) +
                          " (경과시간 : " +
                          duration +
                          ")"
                        : "00:00:00"}
                    </td>
                  </tr>
                  <tr>
                    <th>수량</th>
                    <td>
                      <NumericTextBox
                        name="qty"
                        value={filtersSaved.qty}
                        onChange={filterNumericTextBoxChange}
                      />
                    </td>
                    <th>불량수량</th>
                    <td>
                      <NumericTextBox
                        name="badqty"
                        value={filtersSaved.badqty}
                        onChange={filterNumericTextBoxChange}
                      />
                    </td>
                  </tr>
                  {stopStartOrEnd == "end" && stopStartTime ? (
                    <tr>
                      <th>비가동시작시간</th>
                      <td colSpan={3}>
                        {convertDateToStrWithTime2(new Date(stopStartTime))}
                      </td>
                    </tr>
                  ) : (
                    ""
                  )}
                </tbody>
              </FilterBox>
            </FilterContainer>
          </GridContainer>
          <ButtonContainer className="ButtonContainer3">
            {permissions && (
              <>
                <Button
                  onClick={onClickWork}
                  icon={startOrEnd == "start" ? "play-sm" : "stop-sm"}
                  themeColor={"primary"}
                  disabled={
                    permissions.save && stopStartOrEnd == "start" ? false : true
                  }
                  className="iot-btn green"
                >
                  {startOrEnd == "start" ? "시작" : "종료"}
                </Button>
                <Button
                  onClick={onClickDefect}
                  icon="exclamation-circle"
                  themeColor={"primary"}
                  disabled={
                    permissions.save &&
                    startOrEnd == "end" &&
                    stopStartOrEnd == "start"
                      ? false
                      : true
                  }
                  className="iot-btn red"
                >
                  불량입력
                </Button>
                <Button
                  onClick={onClickStop}
                  icon="pencil"
                  themeColor={"primary"}
                  disabled={permissions.save ? false : true}
                  className="iot-btn gray"
                >
                  {stopStartOrEnd == "start" ? "비가동입력" : "비가동종료"}
                </Button>
              </>
            )}
          </ButtonContainer>
        </>
      )}

      {stopWindowVisible && (
        <StopWindow
          setVisible={setStopWindowVisible}
          data={{
            prodmac: filtersSaved.prodmac,
            prodemp: filtersSaved.prodemp,
          }}
          setData={() => {
            setStopStartOrEnd("end");
            fetchStopData();
          }}
          pathname="PR_A3000W"
        />
      )}
      {defectWindowVisible && (
        <DefectWindow
          setVisible={setDefectWindowVisible}
          rekey={masterDataResult.rekey}
          setData={(badqty) => setFiltersSaved((prev) => ({ ...prev, badqty }))}
          pathname="PR_A3000W"
        />
      )}
    </>
  );
};

export default PR_A3000W;
