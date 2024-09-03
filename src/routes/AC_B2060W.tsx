import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CenterCell from "../components/Cells/CenterCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  setDefaultDate,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import AC_B2060W_INCOME_PRINT from "../components/Prints/AC_B2060W_INCOME_PRINT";
import AC_B2060W_MONTH_PRINT from "../components/Prints/AC_B2060W_MONTH_PRINT";
import AC_B2060W_SUM_PRINT from "../components/Prints/AC_B2060W_SUM_PRINT";
import Window from "../components/Windows/WindowComponent/Window";
import { useApi } from "../hooks/api";
import { IWindowPosition } from "../hooks/interfaces";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/AC_B2060W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY4 = "acntgrpcd";
const numberField = ["slipamt_1", "slipamt_2"];

type TdataArr = {
  reportgb_s: string[];
  acntses_s: string[];
  yyyymm_s: string[];
  seq_s: string[];
  acntgrpcd_s: string[];
  acntgrpnm_s: string[];
  grpchr_s: string[];
  p_border_s: string[];
  p_line_s: string[];
  p_color_s: string[];
  costamt1_s: string[];
  costamt2_s: string[];
  costamt3_s: string[];
  costamt4_s: string[];
  costamt5_s: string[];
  costamt6_s: string[];
  costamt7_s: string[];
  costamt8_s: string[];
  costamt9_s: string[];
  costamt10_s: string[];
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;

var index = 0;

const AC_B2060W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [tabSelected, setTabSelected] = useState(0);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionCustcd = UseGetValueFromSessionItem("custcd");
  const [loginResult] = useRecoilState(loginResultState);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const companyCode = loginResult ? loginResult.companyCode : "";
  let deviceHeightWindow = document.documentElement.clientHeight;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeightWindow - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeightWindow : 800,
  });
  const onChangePostion = (position: any) => {
    setPosition(position);
  };
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewVisible2, setPreviewVisible2] = useState<boolean>(false);
  const [previewVisible3, setPreviewVisible3] = useState<boolean>(false);
  const [bizComponentData, setBizComponentData] = useState<any>(null);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        workType: "TAB1_1",
        reportgb: "01",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 1) {
      setFilters((prev) => ({
        ...prev,
        workType: "TAB2",
        reportgb: "04",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 2) {
      setFilters((prev) => ({
        ...prev,
        workType: "TAB3",
        reportgb: "05",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 3) {
      setFilters((prev) => ({
        ...prev,
        workType: "TAB4",
        reportgb: "06",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 4) {
      setFilters((prev) => ({
        ...prev,
        workType: "TAB5",
        reportgb: "03",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 5) {
      setFilters((prev) => ({
        ...prev,
        workType: "TAB6",
        isSearch: true,
        pgNum: 1,
      }));
    }
  };

  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [swiper, setSwiper] = useState<SwiperCore>();

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".k-tabstrip-items-wrapper");
      height4 = getHeight(".ButtonContainer2");
      height5 = getHeight(".ButtonContainer3");
      height6 = getHeight(".ButtonContainer4");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(
          getDeviceHeight(true) - height - height2 - height3 - height4
        );
        setMobileHeight2(getDeviceHeight(true) - height - height2 - height5);
        setMobileHeight3(getDeviceHeight(true) - height - height2 - height6);
        setWebHeight(
          getDeviceHeight(true) - height - height2 - height3 - height4
        );
        setWebHeight2((getDeviceHeight(true) - height - height2) / 2 - height5);
        setWebHeight3((getDeviceHeight(true) - height - height2) / 2 - height6);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3, tabSelected]);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    workType: "TAB1_1",
    orgdiv: sessionOrgdiv,
    stddt: new Date(),
    acntdt: new Date(),
    acseq1: "",
    reportgb: "01",
    acntgrpcd: "",
    position: "",
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    pgSize: PAGE_SIZE,
    isSearch: false,
  });

  const [subFilters, setSubFilters] = useState({
    workType: "FIN1",
    orgdiv: sessionOrgdiv,
    stddt: new Date(),
    acntdt: new Date(),
    acseq1: "",
    reportgb: "01",
    acntgrpcd: "",
    position: "",
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [subFilters2, setSubFilters2] = useState({
    workType: "TOT1",
    orgdiv: sessionOrgdiv,
    stddt: new Date(),
    acntdt: new Date(),
    acseq1: "",
    reportgb: "01",
    acntgrpcd: "",
    position: "",
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    workType: "AC068T",
    orgdiv: sessionOrgdiv,
    stddt: new Date(),
    acntdt: new Date(),
    acseq1: "",
    reportgb: "01",
    acntgrpcd: "",
    position: "",
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    pgSize: PAGE_SIZE,
    isSearch: false,
  });

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };
  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };
  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [detailDataState2, setDetailDataState2] = useState<State>({
    sort: [],
  });
  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [codeName1, setCodeName1] = useState<string>("제13 (당)기");
  const [codeName2, setCodeName2] = useState<string>("제12 (전)기");

  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY2);
  const idGetter4 = getter(DATA_ITEM_KEY4);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        stddt: setDefaultDate(customOptionData, "stddt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const search = () => {
    resetAllGrid();
    try {
      if (
        convertDateToStr(filters.stddt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.stddt).substring(6, 8) > "31" ||
        convertDateToStr(filters.stddt).substring(6, 8) < "01" ||
        convertDateToStr(filters.stddt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B2060W_001");
      } else {
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
      if (tabSelected == 0 && isMobile && swiper) {
        swiper.slideTo(0);
      }
    } catch (e) {
      alert(e);
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  let _export6: any;
  const exportExcel = () => {};

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSubFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSubFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onPrintWndClick = () => {
    if (!permissions.print) return;

    if (mainDataResult.total > 0) {
      window.scrollTo(0, 0);
      if (tabSelected == 0) {
        setPreviewVisible(true);
      } else if (
        tabSelected == 1 ||
        tabSelected == 2 ||
        tabSelected == 3 ||
        tabSelected == 4
      ) {
        setPreviewVisible2(true);
      } else if (tabSelected == 5) {
        setPreviewVisible3(true);
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onLinkClick = () => {
    window.location.href = "https://erp.gsti.co.kr/AC_A9000W";
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B2060W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_stddt": convertDateToStr(filters.stddt).substring(0, 6),
        "@p_acntdt": "",
        "@p_acseq1": "",
        "@p_reportgb": filters.reportgb,
        "@p_acntgrpcd": filters.acntgrpcd,
        "@p_position": "",
        "@p_company_code": filters.companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        if (tabSelected == 0) {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setSubFilters((prev) => ({
            ...prev,
            acntgrpcd: rows[0].acntcd,
            isSearch: true,
            pgNum: 1,
          }));
          setSubFilters2((prev) => ({
            ...prev,
            acntgrpcd: rows[0].acntcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY4]]: true });
        }
      }
      if (
        tabSelected == 1 ||
        tabSelected == 2 ||
        tabSelected == 3 ||
        tabSelected == 4
      ) {
        const rowCount = data.tables[1].RowCount;
        const rowCount2 = data.tables[2].RowCount;
        const row = data.tables[1].Rows[0];
        const row2 = data.tables[2].Rows[0];
        if (rowCount > 0 && rowCount2 == 0) {
          setCodeName2("제00기 (전)기");
        } else if (rowCount > 0 && rowCount2 > 0) {
          setCodeName1(row.code_name + " (당)기");
          setCodeName2(row2.code_name + " (전)기");
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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
  //그리드 데이터 조회
  const fetchSubGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B2060W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_stddt": convertDateToStr(filters.stddt).substring(0, 6),
        "@p_acntdt": "",
        "@p_acseq1": "",
        "@p_reportgb": "01",
        "@p_acntgrpcd": filters.acntgrpcd,
        "@p_position": "",
        "@p_company_code": filters.companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      if (filters.workType == "FIN1") {
        setDetailDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          setDetailSelectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      } else if (filters.workType == "TOT1") {
        setDetailDataResult2((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          setDetailSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setSubFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const onConfirmClick = (workType: string) => {
    saveData(workType);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      // bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subFilters.isSearch &&
      permissions.view &&
      // bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters);
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subFilters, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subFilters2.isSearch &&
      permissions.view &&
      // bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters2);
      setSubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subFilters2, permissions, bizComponentData, customOptionData]);

  const [ParaData, setParaData] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    reportgb_s: "",
    acntses_s: "",
    yyyymm_s: "",
    seq_s: "",
    acntgrpcd_s: "",
    acntgrpnm_s: "",
    grpchr_s: "",
    p_border_s: "",
    p_line_s: "",
    p_color_s: "",
    costamt1_s: "",
    costamt2_s: "",
    costamt3_s: "",
    costamt4_s: "",
    costamt5_s: "",
    costamt6_s: "",
    costamt7_s: "",
    costamt8_s: "",
    costamt9_s: "",
    costamt10_s: "",
    userid: userId,
    pc: pc,
    form_id: "AC_B2060W",
  });

  const saveData = async (workType: string) => {
    if (!permissions.save) return;

    // 데이터 로드 로직
    let data: any;
    try {
      const parameters: Iparameters = {
        procedureName: "P_AC_B2060W_Q",
        pageNumber: filters2.pgNum,
        pageSize: filters2.pgSize,
        parameters: {
          "@p_work_type": filters2.workType,
          "@p_orgdiv": filters2.orgdiv,
          "@p_stddt": convertDateToStr(filters2.stddt).substring(0, 6),
          "@p_acntdt": "",
          "@p_acseq1": "",
          "@p_reportgb": "01",
          "@p_acntgrpcd": filters2.acntgrpcd,
          "@p_position": "",
          "@p_company_code": filters2.companyCode,
        },
      };
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      console.log("[오류 발생]", error);
      return;
    }

    if (data && data.isSuccess) {
      const dataItem = data.tables[0].Rows;

      let dataArr: TdataArr = {
        reportgb_s: [],
        acntses_s: [],
        yyyymm_s: [],
        seq_s: [],
        acntgrpcd_s: [],
        acntgrpnm_s: [],
        grpchr_s: [],
        p_border_s: [],
        p_line_s: [],
        p_color_s: [],
        costamt1_s: [],
        costamt2_s: [],
        costamt3_s: [],
        costamt4_s: [],
        costamt5_s: [],
        costamt6_s: [],
        costamt7_s: [],
        costamt8_s: [],
        costamt9_s: [],
        costamt10_s: [],
      };

      dataItem.forEach((item: any) => {
        const {
          reportgb,
          acntses,
          yyyymm,
          seq,
          acntgrpcd,
          acntgrpnm,
          grpchr,
          p_border,
          p_line,
          p_color,
          costamt1,
          costamt2,
          costamt3,
          costamt4,
          costamt5,
          costamt6,
          costamt7,
          costamt8,
          costamt9,
          costamt10,
        } = item;

        dataArr.reportgb_s.push(reportgb);
        dataArr.acntses_s.push(acntses);
        dataArr.yyyymm_s.push(yyyymm);
        dataArr.seq_s.push(seq);
        dataArr.acntgrpcd_s.push(acntgrpcd);
        dataArr.acntgrpnm_s.push(acntgrpnm);
        dataArr.grpchr_s.push(grpchr);
        dataArr.p_border_s.push(p_border);
        dataArr.p_line_s.push(p_line);
        dataArr.p_color_s.push(p_color);
        dataArr.costamt1_s.push(costamt1);
        dataArr.costamt2_s.push(costamt2);
        dataArr.costamt3_s.push(costamt3);
        dataArr.costamt4_s.push(costamt4);
        dataArr.costamt5_s.push(costamt5);
        dataArr.costamt6_s.push(costamt6);
        dataArr.costamt7_s.push(costamt7);
        dataArr.costamt8_s.push(costamt8);
        dataArr.costamt9_s.push(costamt9);
        dataArr.costamt10_s.push(costamt10);
      });

      setParaData((prev) => ({
        ...prev,
        workType: workType,
        reportgb_s: dataArr.reportgb_s.join("|"),
        acntses_s: dataArr.acntses_s.join("|"),
        yyyymm_s: dataArr.yyyymm_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        acntgrpcd_s: dataArr.acntgrpcd_s.join("|"),
        acntgrpnm_s: dataArr.acntgrpnm_s.join("|"),
        grpchr_s: dataArr.grpchr_s.join("|"),
        p_border_s: dataArr.p_border_s.join("|"),
        p_line_s: dataArr.p_line_s.join("|"),
        p_color_s: dataArr.p_color_s.join("|"),
        costamt1_s: dataArr.costamt1_s.join("|"),
        costamt2_s: dataArr.costamt2_s.join("|"),
        costamt3_s: dataArr.costamt3_s.join("|"),
        costamt4_s: dataArr.costamt4_s.join("|"),
        costamt5_s: dataArr.costamt5_s.join("|"),
        costamt6_s: dataArr.costamt6_s.join("|"),
        costamt7_s: dataArr.costamt7_s.join("|"),
        costamt8_s: dataArr.costamt8_s.join("|"),
        costamt9_s: dataArr.costamt9_s.join("|"),
        costamt10_s: dataArr.costamt10_s.join("|"),
      }));
    } else {
      console.log("[오류 발생]", data?.resultMessage);
    }
  };

  const para: Iparameters = {
    procedureName: "P_AC_B2060W_S",
    pageNumber: 0,
    pageSize: ParaData.pgSize,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_reportgb_s": ParaData.reportgb_s,
      "@p_acntses_s": ParaData.acntses_s,
      "@p_yyyymm_s": ParaData.yyyymm_s,
      "@p_seq_s": ParaData.seq_s,
      "@p_acntgrpcd_s": ParaData.acntgrpcd_s,
      "@p_acntgrpnm_s": ParaData.acntgrpnm_s,
      "@p_grpchr_s": ParaData.grpchr_s,
      "@p_p_border_s": ParaData.p_border_s,
      "@p_p_line_s": ParaData.p_line_s,
      "@p_p_color_s": ParaData.p_color_s,
      "@p_costamt1_s": ParaData.costamt1_s,
      "@p_costamt2_s": ParaData.costamt2_s,
      "@p_costamt3_s": ParaData.costamt3_s,
      "@p_costamt4_s": ParaData.costamt4_s,
      "@p_costamt5_s": ParaData.costamt5_s,
      "@p_costamt6_s": ParaData.costamt6_s,
      "@p_costamt7_s": ParaData.costamt7_s,
      "@p_costamt8_s": ParaData.costamt8_s,
      "@p_costamt9_s": ParaData.costamt9_s,
      "@p_costamt10_s": ParaData.costamt10_s,
      "@p_userid": ParaData.userid,
      "@p_pc": ParaData.pc,
      "@p_form_id": ParaData.form_id,
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      if (ParaData.workType == "N") {
        alert("확정이 완료되었습니다.");
      } else if (ParaData.workType == "D") {
        alert("확정이 해제되었습니다.");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.statusCode == "ERR0008") {
        alert("이미 확정된 데이터 입니다.");
      } else {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setSubFilters((prev) => ({
      ...prev,
      acntgrpcd: selectedRowData.acntcd,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setSubFilters2((prev) => ({
      ...prev,
      acntgrpcd: selectedRowData.acntcd,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    if (isMobile && swiper) {
      swiper.slideTo(1);
    }
  };
  const onSelectionChange1 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedState(newSelectedState);
  };
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setDetailSelectedState(newSelectedState);
  };
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setDetailSelectedState2(newSelectedState);
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };
  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        <div style={{ textAlign: "center", letterSpacing: "0.5em" }}>
          {"[합계]"}
        </div>
      </td>
    );
  };
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = detailDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {detailDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>회계월</th>
              <td>
                <DatePicker
                  name="stddt"
                  value={filters.stddt}
                  format="yyyy-MM"
                  onChange={filterInputChange}
                  placeholder=""
                  calendar={MonthCalendar}
                  className="required"
                />
              </td>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <ButtonContainer className="ButtonContainer">
        <Button
          onClick={onLinkClick}
          fillMode="outline"
          themeColor={"primary"}
          icon="paste-plain-text"
          disabled={permissions.view && tabSelected == 0 ? false : true}
          title={"결산자동전표 이동"}
        ></Button>
        <Button
          fillMode="solid"
          themeColor={"primary"}
          icon="check-outline"
          disabled={permissions.view && tabSelected == 0 ? false : true}
          onClick={() => onConfirmClick("N")}
        >
          확정
        </Button>
        <Button
          fillMode="outline"
          themeColor={"primary"}
          icon="close-circle"
          disabled={permissions.view && tabSelected == 0 ? false : true}
          onClick={() => onConfirmClick("D")}
        >
          확정해제
        </Button>
      </ButtonContainer>
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
            <TabStrip
              style={{ width: tabSelected == 5 || isMobile ? "100%" : "50%" }}
              selected={tabSelected}
              onSelect={handleSelectTab}
              scrollable={isMobile}
            >
              <TabStripTab
                title="합계잔액시산표"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>합계잔액시산표</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onPrintWndClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="print"
                        disabled={permissions.print ? false : true}
                      >
                        출력
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
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
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn title="차변" width={150}>
                        <GridColumn
                          id="col_drbalamt"
                          field="drbalamt"
                          title="잔액"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                        <GridColumn
                          id="col_drtotamt"
                          field="drtotamt"
                          title="누계"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                        <GridColumn
                          id="col_drmonamt"
                          field="drmonamt"
                          title="월계"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                      </GridColumn>
                      <GridColumn
                        id="col_acntnm"
                        field="acntnm"
                        title="계정명"
                        width="100px"
                        cell={CenterCell}
                        footerCell={mainTotalFooterCell}
                      />
                      <GridColumn title="대변" width={150}>
                        <GridColumn
                          id="col_crmonamt"
                          field="crmonamt"
                          title="월계"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                        <GridColumn
                          id="col_crtotamt"
                          field="crtotamt"
                          title="누계"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                        <GridColumn
                          id="col_crbalamt"
                          field="crbalamt"
                          title="잔액"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="손익계산서"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>손익계산서</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onPrintWndClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="print"
                        disabled={permissions.print ? false : true}
                      >
                        출력
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        id="col_subject"
                        field="subject"
                        title="과목"
                        width="100px"
                        cell={CenterCell}
                      />
                      <GridColumn title={codeName1} width={100}>
                        <GridColumn
                          id="col_thisyear1"
                          field="thisyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_thisyear2"
                          field="thisyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                      <GridColumn title={codeName2} width={100}>
                        <GridColumn
                          id="col_lastyear1"
                          field="lastyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_lastyear2"
                          field="lastyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="제조원가명세서"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>제조원가명세서</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onPrintWndClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="print"
                        disabled={permissions.print ? false : true}
                      >
                        출력
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        id="col_subject"
                        field="subject"
                        title="과목"
                        width="100px"
                        cell={CenterCell}
                      />
                      <GridColumn title={codeName1} width={100}>
                        <GridColumn
                          id="col_thisyear1"
                          field="thisyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_thisyear2"
                          field="thisyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                      <GridColumn title={codeName2} width={100}>
                        <GridColumn
                          id="col_lastyear1"
                          field="lastyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_lastyear2"
                          field="lastyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="이익잉여금처분계산서"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>이익잉여금처분계산서</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onPrintWndClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="print"
                        disabled={permissions.print ? false : true}
                      >
                        출력
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        id="col_subject"
                        field="subject"
                        title="과목"
                        width="100px"
                        cell={CenterCell}
                      />
                      <GridColumn title={codeName1} width={100}>
                        <GridColumn
                          id="col_thisyear1"
                          field="thisyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_thisyear2"
                          field="thisyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                      <GridColumn title={codeName2} width={100}>
                        <GridColumn
                          id="col_lastyear1"
                          field="lastyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_lastyear2"
                          field="lastyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="재무상태표"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>재무상태표</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onPrintWndClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="print"
                        disabled={permissions.print ? false : true}
                      >
                        출력
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        id="col_subject"
                        field="subject"
                        title="과목"
                        width="100px"
                        cell={CenterCell}
                      />
                      <GridColumn title={codeName1} width={100}>
                        <GridColumn
                          id="col_thisyear1"
                          field="thisyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_thisyear2"
                          field="thisyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                      <GridColumn title={codeName2} width={100}>
                        <GridColumn
                          id="col_lastyear1"
                          field="lastyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_lastyear2"
                          field="lastyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="월차손익분석표"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer3">
                    <GridTitle>월차손익분석표</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onPrintWndClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="print"
                        disabled={permissions.print ? false : true}
                      >
                        출력
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList4"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  id={item.id}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
            </TabStrip>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer3">
                <GridTitle>
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-left"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(0);
                      }
                    }}
                  ></Button>
                  재무제표 상세
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-right"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(2);
                      }
                    }}
                  ></Button>
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: mobileheight2 }}
                  data={process(
                    detailDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState[idGetter2(row)],
                    })),
                    detailDataState
                  )}
                  {...detailDataState}
                  onDataStateChange={onDetailDataStateChange}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={2}>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer4">
                <GridTitle>
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-left"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(1);
                      }
                    }}
                  ></Button>
                  전표 상세정보
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: mobileheight3 }}
                  data={process(
                    detailDataResult2.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState2[idGetter3(row)],
                    })),
                    detailDataState2
                  )}
                  {...detailDataState2}
                  onDataStateChange={onDetailDataStateChange2}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange3}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult2.total}
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef3}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList3"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell3
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainerWrap>
            <TabStrip
              style={{ width: tabSelected == 5 || isMobile ? "100%" : "50%" }}
              selected={tabSelected}
              onSelect={handleSelectTab}
              scrollable={isMobile}
            >
              <TabStripTab
                title="합계잔액시산표"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>합계잔액시산표</GridTitle>
                    <Button
                      onClick={onPrintWndClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="print"
                      disabled={permissions.print ? false : true}
                    >
                      출력
                    </Button>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
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
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn title="차변" width={150}>
                        <GridColumn
                          id="col_drbalamt"
                          field="drbalamt"
                          title="잔액"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                        <GridColumn
                          id="col_drtotamt"
                          field="drtotamt"
                          title="누계"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                        <GridColumn
                          id="col_drmonamt"
                          field="drmonamt"
                          title="월계"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                      </GridColumn>
                      <GridColumn
                        id="col_acntnm"
                        field="acntnm"
                        title="계정명"
                        width="100px"
                        cell={CenterCell}
                        footerCell={mainTotalFooterCell}
                      />
                      <GridColumn title="대변" width={150}>
                        <GridColumn
                          id="col_crmonamt"
                          field="crmonamt"
                          title="월계"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                        <GridColumn
                          id="col_crtotamt"
                          field="crtotamt"
                          title="누계"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                        <GridColumn
                          id="col_crbalamt"
                          field="crbalamt"
                          title="잔액"
                          width="50px"
                          cell={NumberCell}
                          footerCell={gridSumQtyFooterCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="손익계산서"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>손익계산서</GridTitle>
                    <Button
                      onClick={onPrintWndClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="print"
                      disabled={permissions.print ? false : true}
                    >
                      출력
                    </Button>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        id="col_subject"
                        field="subject"
                        title="과목"
                        width="100px"
                        cell={CenterCell}
                      />
                      <GridColumn title={codeName1} width={100}>
                        <GridColumn
                          id="col_thisyear1"
                          field="thisyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_thisyear2"
                          field="thisyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                      <GridColumn title={codeName2} width={100}>
                        <GridColumn
                          id="col_lastyear1"
                          field="lastyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_lastyear2"
                          field="lastyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="제조원가명세서"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>제조원가명세서</GridTitle>
                    <Button
                      onClick={onPrintWndClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="print"
                      disabled={permissions.print ? false : true}
                    >
                      출력
                    </Button>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        id="col_subject"
                        field="subject"
                        title="과목"
                        width="100px"
                        cell={CenterCell}
                      />
                      <GridColumn title={codeName1} width={100}>
                        <GridColumn
                          id="col_thisyear1"
                          field="thisyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_thisyear2"
                          field="thisyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                      <GridColumn title={codeName2} width={100}>
                        <GridColumn
                          id="col_lastyear1"
                          field="lastyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_lastyear2"
                          field="lastyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="이익잉여금처분계산서"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>이익잉여금처분계산서</GridTitle>
                    <Button
                      onClick={onPrintWndClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="print"
                      disabled={permissions.print ? false : true}
                    >
                      출력
                    </Button>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        id="col_subject"
                        field="subject"
                        title="과목"
                        width="100px"
                        cell={CenterCell}
                      />
                      <GridColumn title={codeName1} width={100}>
                        <GridColumn
                          id="col_thisyear1"
                          field="thisyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_thisyear2"
                          field="thisyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                      <GridColumn title={codeName2} width={100}>
                        <GridColumn
                          id="col_lastyear1"
                          field="lastyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_lastyear2"
                          field="lastyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="재무상태표"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>재무상태표</GridTitle>
                    <Button
                      onClick={onPrintWndClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="print"
                      disabled={permissions.print ? false : true}
                    >
                      출력
                    </Button>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        id="col_subject"
                        field="subject"
                        title="과목"
                        width="100px"
                        cell={CenterCell}
                      />
                      <GridColumn title={codeName1} width={100}>
                        <GridColumn
                          id="col_thisyear1"
                          field="thisyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_thisyear2"
                          field="thisyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                      <GridColumn title={codeName2} width={100}>
                        <GridColumn
                          id="col_lastyear1"
                          field="lastyear1"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                        <GridColumn
                          id="col_lastyear2"
                          field="lastyear2"
                          width="50px"
                          title="금액"
                          cell={NumberCell}
                        />
                      </GridColumn>
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="월차손익분석표"
                disabled={permissions.view ? false : true}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer3">
                    <GridTitle>월차손익분석표</GridTitle>
                    <Button
                      onClick={onPrintWndClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="print"
                      disabled={permissions.print ? false : true}
                    >
                      출력
                    </Button>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: isMobile ? mobileheight : webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter4(row)],
                        })),
                        mainDataState
                      )}
                      {...mainDataState}
                      onDataStateChange={onMainDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange1}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList4"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  id={item.id}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </TabStripTab>
            </TabStrip>
            <GridContainer
              width={`calc(50% - ${GAP}px)`}
              style={{
                display: tabSelected === 5 || isMobile ? "none" : "block",
              }}
            >
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>재무제표 상세</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight2 }}
                    data={process(
                      detailDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: detailSelectedState[idGetter2(row)],
                      })),
                      detailDataState
                    )}
                    {...detailDataState}
                    onDataStateChange={onDetailDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange2}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
                                id={item.id}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer4">
                  <GridTitle>전표 상세정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight3 }}
                    data={process(
                      detailDataResult2.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: detailSelectedState2[idGetter3(row)],
                      })),
                      detailDataState2
                    )}
                    {...detailDataState2}
                    onDataStateChange={onDetailDataStateChange2}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange3}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult2.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef3}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
                                id={item.id}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell3
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}

      {previewVisible && (
        <Window
          titles={"미리보기"}
          Close={() => {
            setPreviewVisible((prev) => !prev);
          }}
          positions={position}
          modals={true}
          onChangePostion={onChangePostion}
        >
          <AC_B2060W_SUM_PRINT
            para={mainDataResult.data}
            stddt={filters.stddt}
          />
        </Window>
      )}
      {previewVisible2 && (
        <Window
          titles={"미리보기"}
          Close={() => {
            setPreviewVisible2((prev) => !prev);
          }}
          positions={position}
          modals={true}
          onChangePostion={onChangePostion}
        >
          <AC_B2060W_INCOME_PRINT
            para={mainDataResult.data}
            stddt={filters.stddt}
            workType={filters.workType}
            reportgb={filters.reportgb}
          />
        </Window>
      )}
      {previewVisible3 && (
        <Window
          titles={"미리보기"}
          Close={() => {
            setPreviewVisible3((prev) => !prev);
          }}
          positions={position}
          modals={true}
          onChangePostion={onChangePostion}
        >
          <AC_B2060W_MONTH_PRINT
            para={mainDataResult.data}
            stddt={filters.stddt}
          />
        </Window>
      )}
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
    </>
  );
};
export default AC_B2060W;
