import { DataResult, State, process } from "@progress/kendo-data-query";
import { getter } from "@progress/kendo-react-common";
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
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UsePermissions,
  convertDateToStr,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import FileViewers from "../components/Viewer/FileViewers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_B5060W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const numberField = ["maesu", "amt", "vat"];

const AC_B5060W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_B5060W", setCustomOptionData);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);

  const [tabSelected, setTabSelected] = React.useState(0);
  const [tabSelected2, setTabSelected2] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setUrl("");
    setTabSelected(e.selected);
    setTabSelected2(0);
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        worktype: "OUT_LIST",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype: "OUT_DETAIL",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype: "OUT_ETC",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      fetchMainGrid4();
    } else if (e.selected == 2) {
      setFilters((prev) => ({
        ...prev,
        worktype: "IN_LIST",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype: "IN_DETAIL",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype: "IN_ETC",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    } else if (e.selected == 3) {
      fetchMainGrid5();
    } else if (e.selected == 4) {
      fetchMainGrid6();
    } else if (e.selected == 5) {
      fetchMainGrid7();
    }
  };
  const handleSelectTab2 = (e: any) => {
    setTabSelected2(e.selected);
  };
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        reqdt: setDefaultDate(customOptionData, "reqdt"),
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
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
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [url, setUrl] = useState<string>("");
  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
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

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "OUT_LIST",
    orgdiv: "01",
    location: "",
    frdt: new Date(),
    todt: new Date(),
    reqdt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    worktype: "OUT_DETAIL",
    pgNum: 1,
    isSearch: true,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    worktype: "OUT_ETC",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
  };

  const search = () => {
    resetAllGrid();

    if (tabSelected == 0) {
      setFilters((prev) => ({
        ...prev,
        worktype: "OUT_LIST",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype: "OUT_DETAIL",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype: "OUT_ETC",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    } else if (tabSelected == 1) {
      fetchMainGrid4();
    } else if (tabSelected == 2) {
      setFilters((prev) => ({
        ...prev,
        worktype: "IN_LIST",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype: "IN_DETAIL",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype: "IN_ETC",
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    } else if (tabSelected == 3) {
      fetchMainGrid5();
    } else if (tabSelected == 4) {
      fetchMainGrid6();
    } else if (tabSelected == 5) {
      fetchMainGrid7();
    }
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

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

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 정렬 이벤트
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 정렬 이벤트
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B5060W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_reqdt": convertDateToStr(filters.reqdt),
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_find_row_value": "",
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (tabSelected == 0) {
        setFilters2((prev) => ({
          ...prev,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          isSearch: true,
        }));
      }

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
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B5060W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_reqdt": convertDateToStr(filters.reqdt),
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_find_row_value": "",
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

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
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

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B5060W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_reqdt": convertDateToStr(filters.reqdt),
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_find_row_value": "",
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

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
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

  //그리드 데이터 조회
  const fetchMainGrid4 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=AC_B5060_02",
    };

    try {
      data = await processApi<any>("excel-view-mail", parameters);
    } catch (error) {
      data = null;
    }

    if (data.RowCount > 0) {
      const rows = data.Rows;

      const parameters2 = {
        para: "document-json?id=" + rows[0].document_id,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_fdate": convertDateToStr(filters.frdt),
        "@p_tdate": convertDateToStr(filters.todt),
      };
      try {
        data2 = await processApi<any>("excel-view", parameters2);
      } catch (error) {
        data2 = null;
      }
      if (data2 !== null) {
        const byteCharacters = atob(data2.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/pdf",
        });
        setUrl(URL.createObjectURL(blob));
      } else {
        setUrl("");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid5 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=AC_B5060_01",
    };

    try {
      data = await processApi<any>("excel-view-mail", parameters);
    } catch (error) {
      data = null;
    }

    if (data.RowCount > 0) {
      const rows = data.Rows;

      const parameters2 = {
        para: "document-json?id=" + rows[0].document_id,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_recdt": convertDateToStr(filters.reqdt),
        "@p_fdate": convertDateToStr(filters.frdt),
        "@p_tdate": convertDateToStr(filters.todt),
      };
      try {
        data2 = await processApi<any>("excel-view", parameters2);
      } catch (error) {
        data2 = null;
      }
      if (data2 !== null) {
        const byteCharacters = atob(data2.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/pdf",
        });
        setUrl(URL.createObjectURL(blob));
      } else {
        setUrl("");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid6 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=AC_B5060_03",
    };

    try {
      data = await processApi<any>("excel-view-mail", parameters);
    } catch (error) {
      data = null;
    }

    if (data.RowCount > 0) {
      const rows = data.Rows;

      const parameters2 = {
        para: "document-json?id=" + rows[0].document_id,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_fdate": convertDateToStr(filters.frdt),
        "@p_tdate": convertDateToStr(filters.todt),
      };
      try {
        data2 = await processApi<any>("excel-view", parameters2);
      } catch (error) {
        data2 = null;
      }
      if (data2 !== null) {
        const byteCharacters = atob(data2.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/pdf",
        });
        setUrl(URL.createObjectURL(blob));
      } else {
        setUrl("");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid7 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=AC_B5060_04",
    };

    try {
      data = await processApi<any>("excel-view-mail", parameters);
    } catch (error) {
      data = null;
    }

    if (data.RowCount > 0) {
      const rows = data.Rows;

      const parameters2 = {
        para: "document-json?id=" + rows[0].document_id,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_recdt": convertDateToStr(filters.reqdt),
        "@p_fdate": convertDateToStr(filters.frdt),
        "@p_tdate": convertDateToStr(filters.todt),
      };
      try {
        data2 = await processApi<any>("excel-view", parameters2);
      } catch (error) {
        data2 = null;
      }
      if (data2 !== null) {
        const byteCharacters = atob(data2.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/pdf",
        });
        setUrl(URL.createObjectURL(blob));
      } else {
        setUrl("");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

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
  //그리드 푸터
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
  //그리드 푸터
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
  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
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

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"cumaesu01"}
        title={"매입처수"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"maesu01"}
        title={"매수"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"amt01"}
        title={"공급가액"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"taxamt01"}
        title={"부가세"}
        cell={NumberCell}
        width="100px"
      />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"cumaesu02"}
        title={"매입처수"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"maesu02"}
        title={"매수"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"amt02"}
        title={"공급가액"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"taxamt02"}
        title={"부가세"}
        cell={NumberCell}
        width="100px"
      />
    );
    return array;
  };

  const createColumn3 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"cumaesu"}
        title={"매입처수"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"maesu"}
        title={"매수"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"amt"}
        title={"공급가액"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"taxamt"}
        title={"부가세"}
        cell={NumberCell}
        width="100px"
      />
    );
    return array;
  };

  return (
    <>
      <TitleContainer>
        <Title>세금계산서합계표</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_B5060W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
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
              <th>기간</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                />
              </td>
              <th>작성일</th>
              <td>
                <DatePicker
                  name="reqdt"
                  value={filters.reqdt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  placeholder=""
                />
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
        <TabStripTab title="매출처별 세금계산서">
          <GridContainer width="100%">
            <GridTitleContainer>
              <GridTitle>기본정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <Grid
                style={{ height: "30vh" }}
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
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="seqnm"
                  title="구분"
                  width="120px"
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn title="사업자등록번호 발급받은분">
                  {createColumn()}
                </GridColumn>
                <GridColumn title="주민등록번호 발급받은분">
                  {createColumn2()}
                </GridColumn>
                <GridColumn title="총합계">{createColumn3()}</GridColumn>
              </Grid>
            </ExcelExport>
          </GridContainer>
          <TabStrip
            style={{ width: "100%" }}
            selected={tabSelected2}
            onSelect={handleSelectTab2}
          >
            <TabStripTab title="전자세금계산서분">
              <GridContainer width="100%">
                <Grid
                  style={{ height: "35vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      .map(
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
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell2
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell2
                                  : undefined
                              }
                            ></GridColumn>
                          )
                      )}
                </Grid>
              </GridContainer>
            </TabStripTab>
            <TabStripTab title="전자세금계산서외">
              <GridContainer width="100%">
                <Grid
                  style={{ height: "35vh" }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState3[idGetter3(row)],
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      .map(
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
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell3
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell3
                                  : undefined
                              }
                            ></GridColumn>
                          )
                      )}
                </Grid>
              </GridContainer>
            </TabStripTab>
          </TabStrip>
        </TabStripTab>
        <TabStripTab title="매출처별세금계산서합계표">
          <GridContainer>
            {url != "" ? <FileViewers file={url} type="pdf" /> : ""}
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="매입처별 세금계산서">
          <GridContainer width="100%">
            <GridTitleContainer>
              <GridTitle>기본정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <Grid
                style={{ height: "30vh" }}
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
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="seqnm"
                  title="구분"
                  width="120px"
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn title="사업자등록번호 발급받은분">
                  {createColumn()}
                </GridColumn>
                <GridColumn title="주민등록번호 발급받은분">
                  {createColumn2()}
                </GridColumn>
                <GridColumn title="총합계">{createColumn3()}</GridColumn>
              </Grid>
            </ExcelExport>
          </GridContainer>
          <TabStrip
            style={{ width: "100%" }}
            selected={tabSelected2}
            onSelect={handleSelectTab2}
          >
            <TabStripTab title="전자세금계산서분">
              <GridContainer width="100%">
                <Grid
                  style={{ height: "35vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      .map(
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
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell2
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell2
                                  : undefined
                              }
                            ></GridColumn>
                          )
                      )}
                </Grid>
              </GridContainer>
            </TabStripTab>
            <TabStripTab title="전자세금계산서외">
              <GridContainer width="100%">
                <Grid
                  style={{ height: "35vh" }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState3[idGetter3(row)],
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      .map(
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
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell3
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell3
                                  : undefined
                              }
                            ></GridColumn>
                          )
                      )}
                </Grid>
              </GridContainer>
            </TabStripTab>
          </TabStrip>
        </TabStripTab>
        <TabStripTab title="매입처별세금계산서합계표">
          {url != "" ? <FileViewers file={url} type="pdf" /> : ""}
        </TabStripTab>
        <TabStripTab title="신용카드등수취금액">
          {url != "" ? <FileViewers file={url} type="pdf" /> : ""}
        </TabStripTab>
        <TabStripTab title="공제받지못할매입세액명세서">
          {url != "" ? <FileViewers file={url} type="pdf" /> : ""}
        </TabStripTab>
      </TabStrip>
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

export default AC_B5060W;
