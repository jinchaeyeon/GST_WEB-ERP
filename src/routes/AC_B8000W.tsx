import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import React, { useEffect, useRef, useState } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import ReactToPrint from "react-to-print";
import { Buffer } from "buffer";
import { useSetRecoilState } from "recoil";
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
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";
import FileViewers from "../components/Viewer/FileViewers";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  Grid,
  GridDataStateChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY6 = "num";

const AC_B8000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
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

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange5 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters5((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange6 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters6((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage6({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);
  let gridRef6: any = useRef(null);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const processApi = useApi();
  const [tabSelected, setTabSelected] = React.useState(0);
  const pathname: string = window.location.pathname.replace("/", "");
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        worktype:
          defaultOption.find((item: any) => item.id === "worktype").valueCode ==
          "A"
            ? "ETAX"
            : "",
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype:
          defaultOption.find((item: any) => item.id === "worktype").valueCode ==
          "A"
            ? "ETAX2"
            : "",
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype:
          defaultOption.find((item: any) => item.id === "worktype").valueCode ==
          "A"
            ? "ETAX3"
            : "",
      }));
      setFilters4((prev) => ({
        ...prev,
        worktype:
          defaultOption.find((item: any) => item.id === "worktype").valueCode ==
          "A"
            ? "ETAX4"
            : "",
      }));
      setFilters5((prev) => ({
        ...prev,
        worktype:
          defaultOption.find((item: any) => item.id === "worktype").valueCode ==
          "A"
            ? "ETAX5"
            : "",
      }));
      setFilters6((prev) => ({
        ...prev,
        worktype:
          defaultOption.find((item: any) => item.id === "worktype").valueCode ==
          "A"
            ? "ETAX6"
            : "",
      }));
    }
  }, [customOptionData]);

  //조회조건 초기값
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: "",
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX2",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: "",
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX3",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: "",
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  //조회조건 초기값
  const [filters4, setFilters4] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX4",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: "",
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  //조회조건 초기값
  const [filters5, setFilters5] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX5",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: "",
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  //조회조건 초기값
  const [filters6, setFilters6] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX6",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: "",
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters5((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters6((prev) => ({
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
    process([], mainDataState6)
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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": filters.taxyy,
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": filters.taxyy,
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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
  const fetchMainGrid3 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": filters.taxyy,
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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
  const fetchMainGrid4 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": filters.taxyy,
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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

      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
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

  //그리드 데이터 조회
  const fetchMainGrid5 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": filters.taxyy,
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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

      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters5((prev) => ({
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
  const fetchMainGrid6 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": filters.taxyy,
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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

      setMainDataResult6((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState6({ [rows[0][DATA_ITEM_KEY6]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters6((prev) => ({
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
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      if (tabSelected == 0) {
        fetchMainGrid(deepCopiedFilters);
      }
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
      if (tabSelected == 0) {
        fetchMainGrid2(deepCopiedFilters);
      }
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
      if (tabSelected == 0) {
        fetchMainGrid3(deepCopiedFilters);
      }
    }
  }, [filters3]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters4.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      if (tabSelected == 0) {
        fetchMainGrid4(deepCopiedFilters);
      }
    }
  }, [filters4]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters5.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters5);
      setFilters5((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      if (tabSelected == 0) {
        fetchMainGrid5(deepCopiedFilters);
      }
    }
  }, [filters5]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters6.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters6);
      setFilters6((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      if (tabSelected == 0) {
        fetchMainGrid6(deepCopiedFilters);
      }
    }
  }, [filters6]);

  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const search = () => {
    try {
      if (tabSelected == 0) {
        setFilters((prev) => ({
          ...prev,
          worktype: "ETAX",
          taxyy: "",
          gisu: "",
          chasu: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          worktype: "ETAX2",
          taxyy: "",
          gisu: "",
          chasu: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          worktype: "ETAX3",
          taxyy: "",
          gisu: "",
          chasu: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          worktype: "ETAX4",
          taxyy: "",
          gisu: "",
          chasu: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          worktype: "ETAX5",
          taxyy: "",
          gisu: "",
          chasu: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters6((prev) => ({
          ...prev,
          worktype: "ETAX6",
          taxyy: "",
          gisu: "",
          chasu: "",
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        worktype: "ETAX",
        taxyy: "",
        gisu: "",
        chasu: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype: "ETAX2",
        taxyy: "",
        gisu: "",
        chasu: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype: "ETAX3",
        taxyy: "",
        gisu: "",
        chasu: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        worktype: "ETAX4",
        taxyy: "",
        gisu: "",
        chasu: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters5((prev) => ({
        ...prev,
        worktype: "ETAX5",
        taxyy: "",
        gisu: "",
        chasu: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters6((prev) => ({
        ...prev,
        worktype: "ETAX6",
        taxyy: "",
        gisu: "",
        chasu: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
    }
    setTabSelected(e.selected);
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
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
  };
  const onMainDataStateChange6 = (event: GridDataStateChangeEvent) => {
    setMainDataState6(event.dataState);
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

  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
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

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
  };

  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });

    setSelectedState4(newSelectedState);
  };

  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY5,
    });

    setSelectedState5(newSelectedState);
  };

  const onSelectionChange6 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState6,
      dataItemKey: DATA_ITEM_KEY6,
    });

    setSelectedState6(newSelectedState);
  };

  return (
    <>
      <TitleContainer>
        <Title>홈택스관리</Title>

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
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="세금계산서 홈택스">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>처리일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.fdate,
                        end: filters.tdate,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) => {
                        setFilters((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters2((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters3((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters4((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters5((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters6((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                      }}
                    />
                  </td>
                  <th>본사</th>
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
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridTitleContainer>
                <GridTitle>매출표제일반(개인 제외)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
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
              ></Grid>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>매입표제일반(개인 제외)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
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
                //원하는 행 위치로 스크롤 기능
                ref={gridRef2}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              ></Grid>
            </GridContainer>
          </GridContainerWrap>
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridTitleContainer>
                <GridTitle>매출합계일반(개인 포함)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
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
                //원하는 행 위치로 스크롤 기능
                ref={gridRef3}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange3}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              ></Grid>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>매입합계일반(개인 포함)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult4.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState4[idGetter4(row)],
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
                //원하는 행 위치로 스크롤 기능
                ref={gridRef4}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange4}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              ></Grid>
            </GridContainer>
          </GridContainerWrap>
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridTitleContainer>
                <GridTitle>매출합계ETAX(개인 포함)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult5.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState5[idGetter5(row)],
                  })),
                  mainDataState5
                )}
                {...mainDataState5}
                onDataStateChange={onMainDataStateChange5}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY5}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange5}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult5.total}
                skip={page5.skip}
                take={page5.take}
                pageable={true}
                onPageChange={pageChange5}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef5}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange5}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              ></Grid>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>매입합계ETAX(개인 포함)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult6.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState6[idGetter6(row)],
                  })),
                  mainDataState6
                )}
                {...mainDataState6}
                onDataStateChange={onMainDataStateChange6}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY6}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange6}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult6.total}
                skip={page6.skip}
                take={page6.take}
                pageable={true}
                onPageChange={pageChange6}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef6}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange6}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              ></Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="신용카드 홈택스"></TabStripTab>
        <TabStripTab title="계산서 홈택스"></TabStripTab>
        <TabStripTab title="수출실적 홈택스"></TabStripTab>
      </TabStrip>
    </>
  );
};

export default AC_B8000W;
