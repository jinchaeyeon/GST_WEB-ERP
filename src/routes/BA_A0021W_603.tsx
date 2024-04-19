import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import CenterCell from "../components/Cells/CenterCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  convertDateToStr,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  numberWithCommas3,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommentsGrid from "../components/Grids/CommentsGrid";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/BA_A0021W_603_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";

const centerField = ["num"];
const numberField = [
  "meet_cnt",
  "esti_cnt",
  "cont_cnt",
  "cont_amt",
  "misu_amt",
  "quoamt",
  "amt",
  "no_amt",
  "cnt1",
  "taxamt",
  "contraamt",
  "change_contraamt",
  "fin_contraamt",
];
const dateField = ["quodt", "recdt", "strdt", "enddt"];

const BA_A0021W_603: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };
  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };
  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
  };
  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage4({
      ...event.page,
    });
  };

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SA001_603, L_CM701, L_CM700, L_sysUserMaster_001, L_BA026, L_BA076, L_BA077",
    setBizComponentData
  );
  const [usegbListData, setUsegbListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [typeListData, setTypeListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [custdivListData, setCustdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const usegbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_CM700")
      );
      const typeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_CM701")
      );
      const materialtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA001_603"
        )
      );
      const custdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA026")
      );
      const itemlvl2QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA076")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA077")
      );
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQuery(usegbQueryStr, setUsegbListData);
      fetchQuery(typeQueryStr, setTypeListData);
      fetchQuery(materialtypeQueryStr, setMaterialtypeListData);
      fetchQuery(userQueryStr, setUserListData);
      fetchQuery(custdivQueryStr, setCustdivListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("BA_A0021W_603", setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        custdiv: defaultOption.find((item: any) => item.id === "custdiv")
          .valueCode,
        itemlvl3: defaultOption.find((item: any) => item.id === "itemlvl3")
          .valueCode,
      }));
    }
  }, [customOptionData]);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [tabSelected2, setTabSelected2] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    setTabSelected2(0);
  };
  const handleSelectTab2 = (e: any) => {
    setTabSelected2(e.selected);
  };
  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "기본정보";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1 && tabSelected2 == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "상담일지";
        _export2.save(optionsGridTwo);
      }
    }
    if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 1 && tabSelected2 == 2) {
        const optionsGridThree = _export3.workbookOptions();
        optionsGridThree.sheets[0].title = "견적";
        _export3.save(optionsGridThree);
      }
    }
    if (_export4 !== null && _export4 !== undefined) {
      if (tabSelected == 1 && tabSelected2 == 3) {
        const optionsGridFour = _export4.workbookOptions();
        optionsGridFour.sheets[0].title = "계약";
        _export4.save(optionsGridFour);
      }
    }
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  interface ICustData {
    address: string;
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    yyyy: new Date(),
    custcd: "",
    custnm: "",
    custdiv: "",
    itemlvl3: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "MEETING",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "ESTIMATE",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    workType: "CONCAT",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
  let gridRef: any = useRef(null);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0021W_603_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        setFilters2((prev) => ({
          ...prev,
          custcd: rows[0].custcd,
          isSearch: true,
          pgNum: 1,
        }));
        setFilters3((prev) => ({
          ...prev,
          custcd: rows[0].custcd,
          isSearch: true,
          pgNum: 1,
        }));
        setFilters4((prev) => ({
          ...prev,
          custcd: rows[0].custcd,
          isSearch: true,
          pgNum: 1,
        }));
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

  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0021W_603_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters2.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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

  const fetchMainGrid3 = async (filters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0021W_603_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters3.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid4 = async (filters4: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0021W_603_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters4.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult4({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters4((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters2.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);

      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters3.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);

      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters4.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);

      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, permissions, customOptionData]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
      isSearch: true,
      pgNum: 1,
    }));
    setTabSelected(1);
  };
  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const origin = window.location.origin;
    window.open(
      origin +
        `/CM_A7000W?go=` +
        selectedRowData.orgdiv +
        "_" +
        selectedRowData.meetingnum
    );
  };

  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const origin = window.location.origin;
    window.open(
      origin +
        `/SA_A1001_603W?go=` +
        selectedRowData.quonum +
        "-" +
        selectedRowData.quorev
    );
  };

  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedState4(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const origin = window.location.origin;
    window.open(origin + `/SA_A1100_603W?go=` + selectedRowData.connum);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
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
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
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

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
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

  const gridSumQtyFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4.data.forEach((item) =>
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
      <TitleContainer>
        <Title>고객이력관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="BA_A0021W_603"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="조회">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년도</th>
                  <td>
                    <DatePicker
                      name="yyyy"
                      value={filters.yyyy}
                      format="yyyy"
                      onChange={filterInputChange}
                      placeholder=""
                      calendar={YearCalendar}
                    />
                  </td>
                  <th>회사코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters.custcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>회사명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="custdiv"
                        value={filters.custdiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>개발분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="itemlvl3"
                        value={filters.itemlvl3}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="고객이력관리"
            >
              <Grid
                style={{ height: "70vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    custdiv: custdivListData.find(
                      (item: any) => item.sub_code === row.custdiv
                    )?.code_name,
                    itemlvl3: itemlvl3ListData.find(
                      (item: any) => item.sub_code === row.itemlvl3
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
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          id={item.id}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : centerField.includes(item.fieldName)
                              ? CenterCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell
                              : numberField.includes(item.fieldName)
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
        <TabStripTab
          title="처리"
          disabled={mainDataResult.total == 0 ? true : false}
        >
          <TabStrip
            selected={tabSelected2}
            onSelect={handleSelectTab2}
            style={{ width: "100%" }}
          >
            <TabStripTab title="고객정보">
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>고객 기본정보</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>회사명</th>
                      <td>
                        <Input
                          name="custnm"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].custnm
                          }
                          className="readonly"
                        />
                      </td>
                      <th>개발분야</th>
                      <td>
                        <Input
                          name="itemlvl3"
                          type="text"
                          value={
                            itemlvl3ListData.find(
                              (item: any) =>
                                item.sub_code ==
                                (mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0] == undefined
                                  ? ""
                                  : mainDataResult.data.filter(
                                      (item) =>
                                        item[DATA_ITEM_KEY] ==
                                        Object.getOwnPropertyNames(
                                          selectedState
                                        )[0]
                                    )[0].itemlvl3)
                            ) == undefined
                              ? ""
                              : itemlvl3ListData.find(
                                  (item: any) =>
                                    item.sub_code ==
                                    (mainDataResult.data.filter(
                                      (item) =>
                                        item[DATA_ITEM_KEY] ==
                                        Object.getOwnPropertyNames(
                                          selectedState
                                        )[0]
                                    )[0] == undefined
                                      ? ""
                                      : mainDataResult.data.filter(
                                          (item) =>
                                            item[DATA_ITEM_KEY] ==
                                            Object.getOwnPropertyNames(
                                              selectedState
                                            )[0]
                                        )[0].itemlvl3)
                                )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                      <th>기업구분</th>
                      <td>
                        <Input
                          name="itemlvl2"
                          type="text"
                          value={
                            itemlvl2ListData.find(
                              (item: any) =>
                                item.sub_code ==
                                (mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0] == undefined
                                  ? ""
                                  : mainDataResult.data.filter(
                                      (item) =>
                                        item[DATA_ITEM_KEY] ==
                                        Object.getOwnPropertyNames(
                                          selectedState
                                        )[0]
                                    )[0].itemlvl2)
                            ) == undefined
                              ? ""
                              : itemlvl2ListData.find(
                                  (item: any) =>
                                    item.sub_code ==
                                    (mainDataResult.data.filter(
                                      (item) =>
                                        item[DATA_ITEM_KEY] ==
                                        Object.getOwnPropertyNames(
                                          selectedState
                                        )[0]
                                    )[0] == undefined
                                      ? ""
                                      : mainDataResult.data.filter(
                                          (item) =>
                                            item[DATA_ITEM_KEY] ==
                                            Object.getOwnPropertyNames(
                                              selectedState
                                            )[0]
                                        )[0].itemlvl2)
                                )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>계약금액</th>
                      <td>
                        <Input
                          name="cont_amt"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? 0
                              : numberWithCommas3(
                                  mainDataResult.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].cont_amt
                                )
                          }
                          style={{ textAlign: "right" }}
                          className="readonly"
                        />
                      </td>
                      <th>기청구액</th>
                      <td>
                        <Input
                          name="amt"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? 0
                              : numberWithCommas3(
                                  mainDataResult.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].amt
                                )
                          }
                          style={{ textAlign: "right" }}
                          className="readonly"
                        />
                      </td>
                      <th>미청구액</th>
                      <td>
                        <Input
                          name="no_amt"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? 0
                              : numberWithCommas3(
                                  mainDataResult.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].no_amt
                                )
                          }
                          style={{ textAlign: "right" }}
                          className="readonly"
                        />
                      </td>
                      <th>미수금액</th>
                      <td>
                        <Input
                          name="misu_amt"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? 0
                              : numberWithCommas3(
                                  mainDataResult.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].misu_amt
                                )
                          }
                          style={{ textAlign: "right" }}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <CommentsGrid
                  ref_key={
                    mainDataResult.data.filter(
                      (item) =>
                        item[DATA_ITEM_KEY] ==
                        Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].custcd
                  }
                  form_id={"BA_A0021W_603"}
                  table_id={"BA020T"}
                  style={{ height: "60vh" }}
                />
              </GridContainer>
            </TabStripTab>
            <TabStripTab title="상담일지">
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="고객이력관리"
                >
                  <Grid
                    style={{ height: "75vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        person: userListData.find(
                          (items: any) => items.user_id == row.person
                        )?.user_name,
                        materialtype: materialtypeListData.find(
                          (item: any) => item.sub_code === row.materialtype
                        )?.code_name,
                        type: typeListData.find(
                          (item: any) => item.sub_code === row.type
                        )?.code_name,
                        usegb: usegbListData.find(
                          (item: any) => item.sub_code === row.usegb
                        )?.code_name,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                      })),
                      mainDataState2
                    )}
                    {...mainDataState2}
                    onDataStateChange={onMainDataStateChange2}
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
                    total={mainDataResult2.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </TabStripTab>
            <TabStripTab title="견적">
              <GridContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName="고객이력관리"
                >
                  <Grid
                    style={{ height: "75vh" }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
                      })),
                      mainDataState3
                    )}
                    {...mainDataState3}
                    onDataStateChange={onMainDataStateChange3}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY3}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange3}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult3.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange3}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell3
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell3
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </TabStripTab>
            <TabStripTab title="계약">
              <GridContainer>
                <ExcelExport
                  data={mainDataResult4.data}
                  ref={(exporter) => {
                    _export4 = exporter;
                  }}
                  fileName="고객이력관리"
                >
                  <Grid
                    style={{ height: "75vh" }}
                    data={process(
                      mainDataResult4.data.map((row) => ({
                        ...row,
                        chkperson: userListData.find(
                          (items: any) => items.user_id == row.chkperson
                        )?.user_name,
                        materialtype: materialtypeListData.find(
                          (items: any) => items.sub_code == row.materialtype
                        )?.code_name,
                        [SELECTED_FIELD]: selectedState4[idGetter4(row)], //선택된 데이터
                      })),
                      mainDataState4
                    )}
                    {...mainDataState4}
                    onDataStateChange={onMainDataStateChange4}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY4}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange4}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult4.total}
                    skip={page4.skip}
                    take={page4.take}
                    pageable={true}
                    onPageChange={pageChange4}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange4}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList4"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                dateField.includes(item.fieldName)
                                  ? DateCell
                                  : numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell4
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell4
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </TabStripTab>
          </TabStrip>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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

export default BA_A0021W_603;
