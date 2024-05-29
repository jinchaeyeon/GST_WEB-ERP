import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Input,
  NumericTextBox,
  NumericTextBoxChangeEvent,
  TextArea,
} from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
  UsePermissions,
  convertDateToStrWithTime2,
  convertMilliSecondsToTimeStr,
  getHeight,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import DefectWindow from "../components/Windows/PR_A2000W_Defective_Window";
import RemoveWindow from "../components/Windows/PR_A2000W_Del_Window";
import InLotWindow from "../components/Windows/PR_A2000W_InLot_Window";
import PlanWindow from "../components/Windows/PR_A2000W_Plan_Window";
import StopWindow from "../components/Windows/PR_A2000W_Stop_Window";
import { useApi } from "../hooks/api";
import { heightstate, isLoading, isMobileState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";

const PR_A2000W: React.FC = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
const pc = UseGetValueFromSessionItem("pc");

  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const setLoading = useSetRecoilState(isLoading);
  const [startOrEnd, setStartOrEnd] = useState<"start" | "end">("start");
  const [stopStartOrEnd, setStopStartOrEnd] = useState<"start" | "end">(
    "start"
  );
  const [stopStartTime, setStopStartTime] = useState(null);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_A2000W", setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        prodemp: userId,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [planWindowVisible, setPlanWindowVisible] = useState<boolean>(false);
  const [inLotWinVisible, setInLotWindowVisible] = useState<boolean>(false);
  const [stopWindowVisible, setStopWindowVisible] = useState<boolean>(false);
  const [defectWindowVisible, setDefectWindowVisible] =
    useState<boolean>(false);
  const [removeWindowVisible, setRemoveWindowVisible] =
    useState<boolean>(false);

  const onPlanWndClick = () => {
    setPlanWindowVisible(true);
  };

  const onInLotWndClick = () => {
    setInLotWindowVisible(true);
  };

  const onDefectWndClick = () => {
    setDefectWindowVisible(true);
  };

  const onRemoveWndClick = () => {
    if (filters.plankey == "") {
      alert("조회할 생산계획번호가 없습니다.");
      return;
    }

    setRemoveWindowVisible(true);
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  interface IPlanData {
    plankey: string;
    planno: string;
    planseq: number;
    gonum: string;
    goseq: number;
    proccd: string;
    qty: number;
  }

  const setPlanData = (data: IPlanData) => {
    setFilters((prev) => ({
      ...prev,
      plankey: data.plankey,
      planno: data.planno,
      planseq: data.planseq,
      gonum: data.gonum,
      goseq: data.goseq,
      proccd: data.proccd,
      planqty: data.qty,
      isSearch: true,
    }));
  };

  const setInLotData = (data: any) => {
    setParaSaved((prev) => ({
      ...prev,
      gubun_s: data.gubun,
      initemcd_s: data.initemcd,
      initemnm_s: data.initemnm,
      inlotnum_s: data.inlotnum,
      inqty_s: data.now_qty,
      qtyunit_s: data.qtyunit,
      proccd: data.proccd,
      isSave: false,
    }));
  };

  const setStopData = (workType: string | undefined) => {
    if (workType == "end") {
      setStopStartOrEnd(workType);
      fetchStopData();
    }
  };

  // 팝업에서 저장 했을 경우 생산실적 재조회
  const reloadData = (saveyn: string | undefined) => {
    if ((saveyn = "Y")) {
      setFilters((prev) => ({ ...prev, isSearch: true }));
    }
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    // 작업자, 설비가 변경될 경우 생산실적 진행됐는지 확인
    if ((name == "prodmac" || name == "prodemp") && value !== "") {
      setFilters((prev) => ({
        ...prev,
        work_type: "WORK",
        [name]: value,
        isSearch: true,
      }));
    } else if (name !== "proccd") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 NumericTextBox Change 함수 => 사용자가 NumericTextBox 입력한 값을 조회 파라미터로 세팅
  const filterNumericTextBoxChange = (e: NumericTextBoxChangeEvent) => {
    const { value } = e;
    const { name } = e.target;

    if (!name) {
      console.log("NumericTextBox name이 없음");
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [filters, setFilters] = useState({
    work_type: "",
    prodemp: userId,
    prodmac: "",
    plankey: "",
    planno: "",
    planseq: 0,
    planqty: 0,
    rekey: "",
    gonum: "",
    goseq: 0,
    proccd: "",
    qty: 0,
    badqty: 0,
    remark: "",
    isSearch: true,
  });

  const [paraSaved, setParaSaved] = useState({
    work_type: "",
    prodemp: userId,
    prodmac: "",
    proccd: "",
    plankey: "",
    planno: "",
    planseq: 0,
    planqty: 0,
    rekey: "",
    renum: "",
    reseq: 0,
    qty: 0,
    badqty: 0,
    remark: "",
    gubun_s: "",
    initemcd_s: "",
    initemnm_s: "",
    inlotnum_s: "",
    inqty_s: 0,
    qtyunit_s: "",
    proccd_s: "",
    renum_s: "",
    reseq_s: "",
    stopnum: "",
    stopcd: "",
    userid: userId,
    pc: pc,
    form_id: "PR_A2000W",
    isSave: true,
  });

  const [masterDataResult, setMasterDataResult] = useState({
    strtime: "",
    renum: "",
    reseq: 0,
  });

  const fetchWorkData = async (filters: any) => {
    // 진행 중인 생산 확인
    let data: any;
    if (filters.plankey == "") return;

    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_PR_A2000W_Q",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "WORK",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_proccd": "",
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_gonum": filters.gonum,
        "@p_goseq": filters.goseq,
        "@p_planno": "",
        "@p_planseq": 0,
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_finyn": "",
        "@p_renum": "",
        "@p_reseq": 0,
        "@p_find_row_value": "",
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setMasterDataResult((prev) => ({
          ...prev,
          strtime: rows[0].strtime,
          renum: rows[0].renum,
          reseq: rows[0].reseq,
        }));
        // 불량수량 세팅
        setFilters((prev) => ({
          ...prev,
          badqty: rows[0].badqty,
          isSearch: false,
        }));
        setStartOrEnd("end");
      } else {
        // 컨트롤 초기화
        resetAllControl("TIME");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchStopData = async () => {
    // 비가동 정보
    let data: any;
    if (filters.prodmac == "") return;

    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_PR_A2000W_Q",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "STOP",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_proccd": "",
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_gonum": filters.gonum,
        "@p_goseq": filters.goseq,
        "@p_planno": "",
        "@p_planseq": 0,
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_finyn": "",
        "@p_renum": "",
        "@p_reseq": 0,
        "@p_find_row_value": "",
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

      if (totalRowCnt > 0) {
        setStopStartOrEnd("end");
        setStopStartTime(rows[0].strtime);
        setParaSaved((prev) => ({
          ...prev,
          stopnum: rows[0].stopnum,
          isSave: false,
        }));
      } else {
        setStopStartOrEnd("start");
        setStopStartTime(null);
      }
    } else {
      console.log("[에러 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (customOptionData != null && filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchWorkData(deepCopiedFilters);
      fetchStopData();
    }
  }, [filters]);

  useEffect(() => {
    if (masterDataResult.strtime !== "") {
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
    }
  }, [masterDataResult]);

  const resetAllControl = (type: string) => {
    if (type == "END") {
      // 생산 종료 했을 경우 전체 초기화
      setFilters((prev) => ({
        ...prev,
        plankey: "",
        planno: "",
        planseq: 0,
        qty: 0,
        badqty: 0,
        prodmac: "",
        isSearch: true,
      }));
      setMasterDataResult((prev) => ({
        ...prev,
        renum: "",
        reseq: 0,
      }));
      setParaSaved((prev) => ({
        ...prev,
        work_type: "",
        initemcd_s: "",
        initemnm_s: "",
        inlotnum_s: "",
        qty: 0,
      }));
    } else if (type == "TIME") {
      // 진행 중인 실적 없을 경우 시간 초기화
      setMasterDataResult((prev) => ({
        ...prev,
        strtime: "",
        renum: "",
        reseq: 0,
      }));

      setDuration("00:00:00");
      setStartOrEnd("start");
    }
  };

  const fetchTodoSave = async () => {
    //if (!permissions?.save) return;
    let data: any;

    const parameters = {
      procedureName: "P_PR_A2000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraSaved.work_type,
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_renum": masterDataResult.renum,
        "@p_reseq": masterDataResult.reseq,
        "@p_gonum": filters.gonum,
        "@p_goseq": filters.goseq,
        "@p_planno": filters.planno,
        "@p_planseq": filters.planseq,
        "@p_prodmac": filters.prodmac,
        "@p_prodemp": filters.prodemp,
        "@p_proccd": filters.proccd,
        "@p_qty": filters.qty,
        "@p_badqty": filters.badqty,
        "@p_remark": filters.remark,
        "@p_gubun_s": paraSaved.gubun_s,
        "@p_initemcd_s": paraSaved.initemcd_s,
        "@p_inlotnum_s": paraSaved.inlotnum_s,
        "@p_inqty_s": paraSaved.inqty_s,
        "@p_qtyunit_s": paraSaved.qtyunit_s,
        "@p_proccd_s": paraSaved.proccd_s,
        "@p_renum_s": "",
        "@p_reseq_s": "",
        "@p_rowstatus_s": "",
        "@p_badnum_s": "",
        "@p_badseq_s": "",
        "@p_baddt_s": "",
        "@p_badcd_s": "",
        "@p_qty_s": "",
        "@p_remark_s": "",
        "@p_stopnum": paraSaved.stopnum,
        "@p_stopcd": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A2000W",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (data.statusCode !== "MSG0000" && data.resultMessage !== "") {
        alert(data.resultMessage);
        return;
      }

      if (paraSaved.work_type == "START" || paraSaved.work_type == "END") {
        if (startOrEnd == "start") {
          //시작 => 시작 정보 조회
          setFilters((prev) => ({
            ...prev,
            find_row_value: "",
            isSearch: true,
          }));
        } else {
          //종료 => 초기화
          setStartOrEnd("start");
          resetAllControl("END");
        }
      } else {
        // 비가동종료 => 초기화
        setStopStartOrEnd("start");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
      alert(data.resultMessage);
      setParaSaved((prev) => ({ ...prev, work_type: "", isSave: false }));
    }
  };

  useEffect(() => {
    if (paraSaved.work_type !== "" && paraSaved.isSave) {
      fetchTodoSave();
    }
  }, [paraSaved]);

  const onClickWork = () => {
    if (startOrEnd == "end" && filters.qty == 0 && paraSaved.badqty == 0) {
      alert("수량을 입력하세요.");
      return;
    }

    setParaSaved((prev) => ({
      ...prev,
      work_type: startOrEnd.toUpperCase(),
      isSave: true,
    }));
  };

  const onClickStop = () => {
    if (stopStartOrEnd == "start") {
      //비가동시작
      if (filters.prodmac == "") {
        alert("설비를 선택해주세요.");
        return;
      }
      setStopWindowVisible(true);
    } else {
      //비가동종료
      setParaSaved((prev) => ({
        ...prev,
        work_type: "StopE",
        isSave: true,
      }));
    }
  };

  const [duration, setDuration] = useState("");

  return (
    <>
      <TitleContainer>
        <Title className="iot-title">생산실적(투입)</Title>
        <ButtonContainer>
          <Button
            onClick={onPlanWndClick}
            themeColor={"primary"}
            icon="folder-open"
          >
            생산계획참조
          </Button>
          <Button
            onClick={onRemoveWndClick}
            themeColor={"primary"}
            icon="delete"
            fillMode={"outline"}
          >
            생산실적삭제
          </Button>
        </ButtonContainer>
      </TitleContainer>
      {isMobile ? (
        <Swiper
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onActiveIndexChange={(swiper) => {
            index = swiper.activeIndex;
          }}
        >
          <SwiperSlide key={0}>
            <GridContainer
              style={{ width: "100%", overflow: "auto" }}
            >
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper) {
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
              <FilterBox>
                <tbody>
                  <tr>
                    <th>생산계획번호</th>
                    <td colSpan={3}>
                      <Input
                        name="plankey"
                        type="text"
                        value={filters.plankey}
                        onChange={undefined}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>작업자</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="prodemp"
                          value={filters.prodemp}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          textField="user_name"
                          valueField="user_id"
                          className="required"
                        />
                      )}
                    </td>
                    <th>설비</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="prodmac"
                          value={filters.prodmac}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          textField="fxfull"
                          valueField="fxcode"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>공정</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="proccd"
                          value={filters.proccd}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          className="readonly"
                        />
                      )}
                    </td>
                    <th>계획수량</th>
                    <td>
                      <Input
                        name="planqty"
                        type="number"
                        value={filters.planqty}
                        readOnly={true}
                      />
                    </td>
                  </tr>
                </tbody>
              </FilterBox>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer style={{ width: "100%" }}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "left" }}>
                    <Button
                      onClick={() => {
                        if (swiper) {
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
              <GridContainer
                style={{ height: deviceHeight - height, overflow: "auto" }}
              >
                <FilterBox style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <th>시작시간</th>
                      <td colSpan={3}>
                        {startOrEnd == "end"
                          ? masterDataResult.strtime +
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
                          value={filters.qty}
                          onChange={filterNumericTextBoxChange}
                        />
                      </td>
                      <th>불량</th>
                      <td>
                        <Input
                          name="badqty"
                          type="number"
                          value={filters.badqty}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    {paraSaved.inlotnum_s !== "" ? (
                      <tr>
                        <th>투입LOT</th>
                        <td>
                          <Input
                            name="inlotnum"
                            type="text"
                            value={paraSaved.inlotnum_s}
                            className="readonly"
                          />
                        </td>
                        <th>소재 품목명</th>
                        <td>
                          <Input
                            name="initemnm"
                            type="text"
                            value={paraSaved.initemnm_s}
                            className="readonly"
                          />
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}
                    <tr>
                      <th>비고</th>
                      <td colSpan={3}>
                        <TextArea
                          value={filters.remark}
                          name="remark"
                          rows={5}
                          onChange={filterInputChange}
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

                {permissions && (
                  <>
                    <ButtonContainer>
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
                          width: "110px",
                          height: "50px",
                          fontSize: "16px",
                        }}
                      >
                        {startOrEnd == "start" ? "시작" : "종료"}
                      </Button>
                      <Button
                        onClick={onDefectWndClick}
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
                          width: "110px",
                          height: "50px",
                          fontSize: "16px",
                        }}
                      >
                        불량입력
                      </Button>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        onClick={onInLotWndClick}
                        themeColor={"primary"}
                        disabled={
                          permissions.save &&
                          startOrEnd == "end" &&
                          stopStartOrEnd == "start"
                            ? false
                            : true
                        }
                        className="iot-btn"
                        style={{
                          width: "110px",
                          height: "50px",
                          fontSize: "16px",
                        }}
                      >
                        투입 LOT 선택
                      </Button>
                      <Button
                        onClick={onClickStop}
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                        className="iot-btn gray"
                        style={{
                          width: "110px",
                          height: "50px",
                          fontSize: "16px",
                        }}
                      >
                        {stopStartOrEnd == "start"
                          ? "비가동입력"
                          : "비가동종료"}
                      </Button>
                    </ButtonContainer>
                  </>
                )}
              </GridContainer>
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <FilterContainer>
            <FilterBox>
              <tbody className="PR_A3000W">
                <tr>
                  <th>생산계획번호</th>
                  <td colSpan={3}>
                    <Input
                      name="plankey"
                      type="text"
                      value={filters.plankey}
                      onChange={undefined}
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th>작업자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="prodemp"
                        value={filters.prodemp}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                        className="required"
                      />
                    )}
                  </td>
                  <th>설비</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="prodmac"
                        value={filters.prodmac}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="fxfull"
                        valueField="fxcode"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>공정</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="proccd"
                        value={filters.proccd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        className="readonly"
                      />
                    )}
                  </td>
                  <th>계획수량</th>
                  <td>
                    <Input
                      name="planqty"
                      type="number"
                      value={filters.planqty}
                      readOnly={true}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <Title>처리영역</Title>
            <FilterContainer>
              <FilterBox>
                <tbody className="PR_A3000W">
                  <tr>
                    <th>시작시간</th>
                    <td colSpan={3}>
                      {startOrEnd == "end"
                        ? masterDataResult.strtime +
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
                        value={filters.qty}
                        onChange={filterNumericTextBoxChange}
                      />
                    </td>
                    <th>불량</th>
                    <td>
                      <Input
                        name="badqty"
                        type="number"
                        value={filters.badqty}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  {paraSaved.inlotnum_s !== "" ? (
                    <tr>
                      <th>투입LOT</th>
                      <td>
                        <Input
                          name="inlotnum"
                          type="text"
                          value={paraSaved.inlotnum_s}
                          className="readonly"
                        />
                      </td>
                      <th>소재 품목명</th>
                      <td>
                        <Input
                          name="initemnm"
                          type="text"
                          value={paraSaved.initemnm_s}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  ) : (
                    ""
                  )}
                  <tr>
                    <th>비고</th>
                    <td colSpan={3}>
                      <TextArea
                        value={filters.remark}
                        name="remark"
                        rows={10}
                        onChange={filterInputChange}
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
          <ButtonContainer>
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
                  onClick={onDefectWndClick}
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
                  onClick={onInLotWndClick}
                  icon="sort-desc-sm"
                  themeColor={"primary"}
                  disabled={
                    permissions.save &&
                    startOrEnd == "end" &&
                    stopStartOrEnd == "start"
                      ? false
                      : true
                  }
                  className="iot-btn"
                >
                  투입 LOT 선택
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
      {planWindowVisible && (
        <PlanWindow
          setVisible={setPlanWindowVisible}
          setData={setPlanData}
          modal={true}
          pathname="PR_A2000W"
        />
      )}
      {inLotWinVisible && (
        <InLotWindow
          setVisible={setInLotWindowVisible}
          plankey={filters.plankey}
          setData={setInLotData}
          modal={true}
          pathname="PR_A2000W"
        />
      )}
      {stopWindowVisible && (
        <StopWindow
          setVisible={setStopWindowVisible}
          data={{
            prodemp: filters.prodemp,
            prodmac: filters.prodmac,
          }}
          setData={setStopData}
          modal={true}
          pathname="PR_A2000W"
        />
      )}
      {defectWindowVisible && (
        <DefectWindow
          setVisible={setDefectWindowVisible}
          rekey={{
            renum: masterDataResult.renum,
            reseq: masterDataResult.reseq,
          }}
          reloadData={reloadData}
          modal={true}
        />
      )}
      {removeWindowVisible && (
        <RemoveWindow
          setVisible={setRemoveWindowVisible}
          gokey={{
            gonum: filters.gonum,
            goseq: filters.goseq,
          }}
          reloadData={reloadData}
          modal={true}
        />
      )}
    </>
  );
};

export default PR_A2000W;
