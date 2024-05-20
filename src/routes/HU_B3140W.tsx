import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  setExpandedState,
  setGroupIds,
} from "@progress/kendo-react-data-tools";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import YearCalendar from "../components/Calendars/YearCalendar";
import MonthDateCell from "../components/Cells/MonthDateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getBizCom,
  getHeight,
  getQueryFromBizComponent,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import { useApi } from "../hooks/api";
import { heightstate, isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/HU_B3140W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";

const NumberField = [
  "payamt01",
  "payamt02",
  "payamt03",
  "payamt04",
  "payamt05",
  "payamt06",
  "payamt07",
  "payamt08",
  "payamt09",
  "payamt10",
  "payamt11",
  "payamt12",
];

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

const HU_B3140W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  let isMobile = deviceWidth <= 1200;

  var height = getHeight(".k-tabstrip-items-wrapper");

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [group, setGroup] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);

  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  //상단 필터 state
  const [multi, setMulti] = useState<boolean>(true);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_B3140W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_B3140W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      const DATE = new Date();
      const DATE2 = new Date();
      //현재년도 1월, 12월 set
      DATE.setMonth(0);
      DATE2.setMonth(11);
      setFilters((prev) => ({
        ...prev,
        fryyyymm: DATE,
        toyyyymm: DATE2,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        rtrdt: defaultOption.find((item: any) => item.id == "rtrdt")?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_HU005,L_dptcd_001, L_HU032",
    //직위, 부서, 급상여구분
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [dptcdListData, setDptcdListData] = React.useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setPostcdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [paytypeListData, setPaytypeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setPaytypeListData(getBizCom(bizComponentData, "L_HU032"));
      setPostcdListData(getBizCom(bizComponentData, "L_HU005"));
      setDptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
    }
  }, [bizComponentData]);

  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);
  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [mainDataState5, setMainDataState5] = useState<State>({
    sort: [],
  });
  const [mainDataState6, setMainDataState6] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [mainDataResult5, setMainDataResult5] = useState<DataResult>(
    process([], mainDataState5)
  );
  const [mainDataResult6, setMainDataResult6] = useState<DataResult>(
    process([], mainDataState5)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState5, setSelectedState5] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState6, setSelectedState6] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };

  const [tabSelected, setTabSelected] = React.useState(0);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: "",
    payyyyy: new Date(),
    fryyyymm: new Date(),
    toyyyymm: new Date(),
    prsnnum: "",
    prsnnm: "",
    dptcd: "",
    rtrdt: "N",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B3140W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "INDIMONTH",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_payyyyy": convertDateToStr(filters.payyyyy).substring(0, 4),
        "@p_fryyyymm": convertDateToStr(filters.fryyyymm).substring(0, 6),
        "@p_toyyyymm": convertDateToStr(filters.toyyyymm).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_rtrdt": filters.rtrdt,
        "@p_company_code": companyCode,
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
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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
  const fetchMainGrid2 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters2: Iparameters = {
      procedureName: "P_HU_B3140W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "INDIDETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_payyyyy": convertDateToStr(filters.payyyyy).substring(0, 4),
        "@p_fryyyymm": convertDateToStr(filters.fryyyymm).substring(0, 6),
        "@p_toyyyymm": convertDateToStr(filters.toyyyymm).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_rtrdt": filters.rtrdt,
        "@p_company_code": companyCode,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          groupId: row.prsnnum + "prsnnum",
          group_category_name: "성명" + " : " + row.prsnnm,
        };
      });
      const newDataState = processWithGroups(rows, group);
      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal(totalRowCnt);
      setResultState(newDataState);
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY]]: true });
      }
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

  const fetchMainGrid3 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters3: Iparameters = {
      procedureName: "P_HU_B3140W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "MONTH_1",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_payyyyy": convertDateToStr(filters.payyyyy).substring(0, 4),
        "@p_fryyyymm": convertDateToStr(filters.fryyyymm).substring(0, 6),
        "@p_toyyyymm": convertDateToStr(filters.toyyyymm).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_rtrdt": filters.rtrdt,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const fetchMainGrid4 = async (detailFilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters4: Iparameters = {
      procedureName: "P_HU_B3140W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "MONTH_2",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_payyyyy": convertDateToStr(filters.payyyyy).substring(0, 4),
        "@p_fryyyymm": convertDateToStr(filters.fryyyymm).substring(0, 6),
        "@p_toyyyymm": convertDateToStr(filters.toyyyymm).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_rtrdt": filters.rtrdt,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid5 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters5: Iparameters = {
      procedureName: "P_HU_B3140W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "PAYDETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_payyyyy": convertDateToStr(filters.payyyyy).substring(0, 4),
        "@p_fryyyymm": convertDateToStr(filters.fryyyymm).substring(0, 6),
        "@p_toyyyymm": convertDateToStr(filters.toyyyymm).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_rtrdt": filters.rtrdt,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters5);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState5({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const fetchMainGrid6 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters6: Iparameters = {
      procedureName: "P_HU_B3140W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "BONDETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_payyyyy": convertDateToStr(filters.payyyyy).substring(0, 4),
        "@p_fryyyymm": convertDateToStr(filters.fryyyymm).substring(0, 6),
        "@p_toyyyymm": convertDateToStr(filters.toyyyymm).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_rtrdt": filters.rtrdt,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters6);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setMainDataResult6((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState6({ [rows[0][DATA_ITEM_KEY]]: true });
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

  useEffect(() => {
    if (filters.isSearch && permissions !== null && bizComponentData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      if (tabSelected == 0) {
        fetchMainGrid(deepCopiedFilters);
      } else if (tabSelected == 1) {
        fetchMainGrid2(deepCopiedFilters);
      } else if (tabSelected == 2) {
        fetchMainGrid3(deepCopiedFilters);
        setFilters2((prev) => ({
          ...prev,
          isSearch: true,
        }));
      } else if (tabSelected == 3) {
        fetchMainGrid5(deepCopiedFilters);
      } else if (tabSelected == 4) {
        fetchMainGrid6(deepCopiedFilters);
      }
    }
  }, [filters, permissions, bizComponentData]);

  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters2, permissions, bizComponentData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    if (tabSelected == 0) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState(newSelectedState);
    } else if (tabSelected == 1) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState2,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState2(newSelectedState);
    } else if (tabSelected == 2) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState3,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState3(newSelectedState);
    } else if (tabSelected == 3) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState5,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState5(newSelectedState);
    } else {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState6,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState6(newSelectedState);
    }
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const ondetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState4(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  let _export6: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "개인별월내역(합계)";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "개인별월내역(분리)";
        _export2.save(optionsGridTwo);
      }
    }
    if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        optionsGridThree.sheets[1] = optionsGridFour.sheets[0];
        optionsGridThree.sheets[0].title = "월별급여내역";
        optionsGridThree.sheets[1].title = "월별상여내역";
        _export3.save(optionsGridThree);
      }
    }
    if (_export5 !== null && _export5 !== undefined) {
      if (tabSelected == 3) {
        const optionsGridFive = _export5.workbookOptions();
        optionsGridFive.sheets[0].title = "급여상세내역";
        _export5.save(optionsGridFive);
      }
    }
    if (_export6 !== null && _export6 !== undefined) {
      if (tabSelected == 4) {
        const optionsGridSix = _export6.workbookOptions();
        optionsGridSix.sheets[0].title = "상여상세내역";
        _export6.save(optionsGridSix);
      }
    }
  };

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
  };
  const onMainDataStateChange6 = (event: GridDataStateChangeEvent) => {
    setMainDataState6(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult4.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult5.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult6.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
  };

  const onExpandChange = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState, item.groupId]
          : collapsedState.filter((groupId) => groupId != item.groupId);
        setCollapsedState(collapsedIds);
      }
    },
    [collapsedState]
  );

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();
    setPage(initialPageState);
    setFilters((prev: any) => ({
      ...prev,
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
    }));
    if (e.selected == 0) {
      setMulti(true);
    } else if (e.selected == 1) {
      setMulti(true);
    } else if (e.selected == 2) {
      setMulti(true);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 3) {
      setMulti(false);
    } else {
      setMulti(false);
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.payyyyy).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_B3140W_001");
      } else {
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        if (tabSelected == 2) {
          setFilters2((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult3.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell4 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult4.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");

    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell5 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult5.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell6 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult6.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"Amt1"}
        title={"기본급"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"Amt2"}
        title={"제수당"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"totpayamt"}
        title={"급여합계"}
        width="130px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"INC"}
        title={"소득세"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"LOC"}
        title={"주민세"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"HIR"}
        title={"고용보험"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"MED"}
        title={"건강보험"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"ANU"}
        title={"국민연금"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"Ediv"}
        title={"기타공제"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"totded"}
        title={"공제합계"}
        width="130px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn3 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"Amt1"}
        title={"기본급"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"Amt2"}
        title={"제수당"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"totpayamt"}
        title={"급여합계"}
        width="130px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn4 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"INC"}
        title={"소득세"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"LOC"}
        title={"주민세"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"HIR"}
        title={"고용보험"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"MED"}
        title={"건강보험"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"ANU"}
        title={"국민연금"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"Ediv"}
        title={"기타공제"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"totded"}
        title={"공제합계"}
        width="130px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn5 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"Amt1"}
        title={"기본급"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field={"Amt2"}
        title={"제수당"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field={"totpayamt"}
        title={"급여합계"}
        width="130px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    return array;
  };

  const createColumn6 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"INC"}
        title={"소득세"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field={"LOC"}
        title={"주민세"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field={"HIR"}
        title={"고용보험"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field={"MED"}
        title={"건강보험"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field={"ANU"}
        title={"국민연금"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field={"Ediv"}
        title={"기타공제"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field={"totded"}
        title={"공제합계"}
        width="130px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    return array;
  };

  const createColumn7 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"Amt1"}
        title={"기본급"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field={"Amt2"}
        title={"제수당"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field={"totpayamt"}
        title={"급여합계"}
        width="130px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    return array;
  };

  const createColumn8 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"INC"}
        title={"소득세"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field={"LOC"}
        title={"주민세"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field={"HIR"}
        title={"고용보험"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field={"MED"}
        title={"건강보험"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field={"ANU"}
        title={"국민연금"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field={"Ediv"}
        title={"기타공제"}
        width="120px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field={"totded"}
        title={"공제합계"}
        width="130px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    return array;
  };

  return (
    <>
      <TitleContainer>
        <Title>급상여분석정보</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_B3140W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준년도</th>
              {multi == true ? (
                <td>
                  <DatePicker
                    name="payyyyy"
                    value={filters.payyyyy}
                    format="yyyy"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                    calendar={YearCalendar}
                  />
                </td>
              ) : (
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="fryyyymm"
                      value={filters.fryyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                    <DatePicker
                      name="toyyyymm"
                      value={filters.toyyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </div>
                </td>
              )}

              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>사용자 이름</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrdt"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="개인별월내역(합계)">
          <GridContainer width="100%">
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="급상여분석정보"
            >
              <Grid
                style={{ height: isMobile ? deviceHeight - height : "72vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    postcd: postcdListData.find(
                      (item: any) => item.sub_code == row.postcd
                    )?.code_name,
                    dptcd: dptcdListData.find(
                      (item: any) => item.dptcd == row.dptcd
                    )?.dptnm,
                    paytype: paytypeListData.find(
                      (item: any) => item.sub_code == row.paytype
                    )?.code_name,
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
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"]
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
                            cell={
                              NumberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 1
                                ? mainTotalFooterCell
                                : NumberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="개인별월내역(분리)">
          <GridContainer width="100%">
            <ExcelExport
              data={newData}
              ref={(exporter) => {
                _export2 = exporter;
              }}
              group={group}
              fileName="급상여분석정보"
            >
              <Grid
                style={{ height: isMobile ? deviceHeight - height : "72vh" }}
                data={newData.map((item: { items: any[] }) => ({
                  ...item,
                  items: item.items.map((row: any) => ({
                    ...row,
                    postcd: postcdListData.find(
                      (item: any) => item.sub_code == row.postcd
                    )?.code_name,
                    dptcd: dptcdListData.find(
                      (item: any) => item.dptcd == row.dptcd
                    )?.dptnm,
                    paytype: paytypeListData.find(
                      (item: any) => item.sub_code == row.paytype
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState2[idGetter(row)], //선택된 데이터
                  })),
                }))}
                //스크롤 조회 기능
                fixedScroll={true}
                //그룹기능
                group={group}
                groupable={true}
                onExpandChange={onExpandChange}
                expandField="expanded"
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange}
                //페이지네이션
                total={total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
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
                            cell={
                              NumberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 1
                                ? mainTotalFooterCell2
                                : NumberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        {isMobile ? (
          <TabStripTab title="월별급여내역">
            <GridContainer width="100%">
              <ExcelExport
                data={mainDataResult3.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="급상여분석정보"
              >
                <Grid
                  style={{ height: deviceHeight - height }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState3[idGetter(row)],
                    })),
                    mainDataState3
                  )}
                  {...mainDataState3}
                  onDataStateChange={onMainDataStateChange3}
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
                  total={mainDataResult3.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange3}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="payyrmm"
                    title="년월"
                    width="130px"
                    cell={MonthDateCell}
                    footerCell={mainTotalFooterCell3}
                  />
                  <GridColumn
                    field="cnt"
                    title="인원(명)"
                    width="130px"
                    cell={NumberCell}
                  />
                  <GridColumn title="총급여액">{createColumn()}</GridColumn>
                  <GridColumn title="총공제액">{createColumn2()}</GridColumn>
                  <GridColumn
                    field="rlpayamt"
                    title="실수령액"
                    width="130px"
                    cell={NumberCell}
                    footerCell={gridSumQtyFooterCell3}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
          </TabStripTab>
        ) : (
          <TabStripTab title="월별급상여내역">
            <GridContainer width="100%">
              <GridTitleContainer>
                <GridTitle>급여내역</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult3.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="급상여분석정보"
              >
                <Grid
                  style={{ height: "32.5vh" }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState3[idGetter(row)],
                    })),
                    mainDataState3
                  )}
                  {...mainDataState3}
                  onDataStateChange={onMainDataStateChange3}
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
                  total={mainDataResult3.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange3}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="payyrmm"
                    title="년월"
                    width="130px"
                    cell={MonthDateCell}
                    footerCell={mainTotalFooterCell3}
                  />
                  <GridColumn
                    field="cnt"
                    title="인원(명)"
                    width="130px"
                    cell={NumberCell}
                  />
                  <GridColumn title="총급여액">{createColumn()}</GridColumn>
                  <GridColumn title="총공제액">{createColumn2()}</GridColumn>
                  <GridColumn
                    field="rlpayamt"
                    title="실수령액"
                    width="130px"
                    cell={NumberCell}
                    footerCell={gridSumQtyFooterCell3}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width="100%">
              <GridTitleContainer>
                <GridTitle>상여내역</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult4.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName="급상여분석정보"
              >
                <Grid
                  style={{ height: "30vh" }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState4[idGetter(row)],
                    })),
                    mainDataState4
                  )}
                  {...mainDataState4}
                  onDataStateChange={onMainDataStateChange4}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult4.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange4}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="payyrmm"
                    title="년월"
                    width="130px"
                    cell={MonthDateCell}
                    footerCell={mainTotalFooterCell4}
                  />
                  <GridColumn
                    field="cnt"
                    title="인원(명)"
                    width="130px"
                    cell={NumberCell}
                  />
                  <GridColumn title="총급여액">{createColumn3()}</GridColumn>
                  <GridColumn title="총공제액">{createColumn4()}</GridColumn>
                  <GridColumn
                    field="rlpayamt"
                    title="실수령액"
                    width="130px"
                    cell={NumberCell}
                    footerCell={gridSumQtyFooterCell4}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
          </TabStripTab>
        )}
        {isMobile ? (
          <TabStripTab title="월별상여내역">
            <GridContainer width="100%">
              <ExcelExport
                data={mainDataResult4.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName="급상여분석정보"
              >
                <Grid
                  style={{ height: deviceHeight - height }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState4[idGetter(row)],
                    })),
                    mainDataState4
                  )}
                  {...mainDataState4}
                  onDataStateChange={onMainDataStateChange4}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult4.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange4}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="payyrmm"
                    title="년월"
                    width="130px"
                    cell={MonthDateCell}
                    footerCell={mainTotalFooterCell4}
                  />
                  <GridColumn
                    field="cnt"
                    title="인원(명)"
                    width="130px"
                    cell={NumberCell}
                  />
                  <GridColumn title="총급여액">{createColumn3()}</GridColumn>
                  <GridColumn title="총공제액">{createColumn4()}</GridColumn>
                  <GridColumn
                    field="rlpayamt"
                    title="실수령액"
                    width="130px"
                    cell={NumberCell}
                    footerCell={gridSumQtyFooterCell4}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
          </TabStripTab>
        ) : null}
        <TabStripTab title="급여상세내역">
          <GridContainer width="100%">
            <ExcelExport
              data={mainDataResult5.data}
              ref={(exporter) => {
                _export5 = exporter;
              }}
              fileName="급상여분석정보"
            >
              <Grid
                style={{ height: isMobile ? deviceHeight - height : "72vh" }}
                data={process(
                  mainDataResult5.data.map((row) => ({
                    ...row,
                    dptcd: dptcdListData.find(
                      (item: any) => item.dptcd == row.dptcd
                    )?.dptnm,
                    [SELECTED_FIELD]: selectedState5[idGetter(row)],
                  })),
                  mainDataState5
                )}
                {...mainDataState5}
                onDataStateChange={onMainDataStateChange5}
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
                total={mainDataResult5.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange5}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn field="dptcd" title="부서" width="130px" />
                <GridColumn
                  field="prsnnm"
                  title="성명"
                  width="130px"
                  footerCell={mainTotalFooterCell5}
                />
                <GridColumn title="총급여액">{createColumn5()}</GridColumn>
                <GridColumn title="총공제액">{createColumn6()}</GridColumn>
                <GridColumn
                  field="rlpayamt"
                  title="실수령액"
                  width="130px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell5}
                />
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="상여상세내역">
          <GridContainer width="100%">
            <ExcelExport
              data={mainDataResult6.data}
              ref={(exporter) => {
                _export6 = exporter;
              }}
              fileName="급상여분석정보"
            >
              <Grid
                style={{ height: isMobile ? deviceHeight - height : "72vh" }}
                data={process(
                  mainDataResult6.data.map((row) => ({
                    ...row,
                    dptcd: dptcdListData.find(
                      (item: any) => item.dptcd == row.dptcd
                    )?.dptnm,
                    [SELECTED_FIELD]: selectedState6[idGetter(row)],
                  })),
                  mainDataState6
                )}
                {...mainDataState6}
                onDataStateChange={onMainDataStateChange6}
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
                total={mainDataResult6.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange6}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn field="dptcd" title="부서" width="130px" />
                <GridColumn
                  field="prsnnm"
                  title="성명"
                  width="130px"
                  footerCell={mainTotalFooterCell6}
                />
                <GridColumn title="총급여액">{createColumn7()}</GridColumn>
                <GridColumn title="총공제액">{createColumn8()}</GridColumn>
                <GridColumn
                  field="rlpayamt"
                  title="실수령액"
                  width="130px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell6}
                />
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
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

export default HU_B3140W;
