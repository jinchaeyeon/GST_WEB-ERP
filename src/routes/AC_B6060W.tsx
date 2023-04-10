import React, { useCallback, useEffect, useState, useRef } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
} from "@progress/kendo-react-grid";
import { gridList } from "../store/columns/AC_B5080W_C";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import YearCalendar from "../components/Calendars/YearCalendar";
import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  TitleContainer,
  ButtonContainer,
} from "../CommonStyled";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  convertDateToStr,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import TopButtons from "../components/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import DateCell from "../components/Cells/DateCell";
import CenterCell from "../components/Cells/CenterCell";

const DATA_ITEM_KEY = "num";

const AC_B6060W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA015,L_BA029,L_BA005,L_BA020, L_sysUserMaster_001, L_AC014,L_BA003, L_AC006",
    //수량단위, 과세구분, 내수구분, 화폐단위, 사용자, 계산서유형, 입고유형, 전표입력경로
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxtypeListData, setTaxtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [amtunitListData, setAmtunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);
  const [inkindListData, setInkindListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [inputpathListData, setInputpathListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA029")
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      );
      const amtunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA020")
      );
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const taxtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC014")
      );
      const inkindQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA003")
      );
      const inputpathQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC006")
      );
      fetchQuery(userQueryStr, setUserListData);
      fetchQuery(amtunitQueryStr, setAmtunitListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(taxdivQueryStr, setTaxdivListData);
      fetchQuery(taxtypeQueryStr, setTaxtypeListData);
      fetchQuery(inkindQueryStr, setInkindListData);
      fetchQuery(inputpathQueryStr, setInputpathListData);
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

  const [tabSelected, setTabSelected] = React.useState(0);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (tabSelected == 0 && name == "frdt") {
      var todts = new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
      );
      todts.setMonth(value.getMonth() + 3);
      setFilters((prev) => ({
        ...prev,
        frdt: value,
        todt: todts,
      }));
    }
    else if (tabSelected == 1 && name == "frdt") {
      var todts = new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
      );
      todts.setMonth(value.getMonth() + 3);
      setFilters((prev) => ({
        ...prev,
        frdt: value,
        todt: todts,
      }));
    } else if (tabSelected == 2 && name == "frdt") {
      var todts = new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
      );
      todts.setMonth(value.getMonth() + 6);
      setFilters((prev) => ({
        ...prev,
        frdt: value,
        todt: todts,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    yyyymmdd: new Date(),
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
    tab: 0,
  });

  const [dates, setDates] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) +
      "년" +
      convertDateToStr(filters.frdt).substring(4, 6) +
      "월"
  );
  const [dates2, setDates2] = useState<string>(
    convertDateToStr(
      new Date(
        filters.frdt.getFullYear(),
        filters.frdt.getMonth() + 1,
        filters.frdt.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 1,
          filters.frdt.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates3, setDates3] = useState<string>(
    convertDateToStr(
      new Date(
        filters.frdt.getFullYear(),
        filters.frdt.getMonth() + 2,
        filters.frdt.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 2,
          filters.frdt.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates4, setDates4] = useState<string>(
    convertDateToStr(
      new Date(
        filters.frdt.getFullYear(),
        filters.frdt.getMonth() + 3,
        filters.frdt.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 3,
          filters.frdt.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates5, setDates5] = useState<string>(
    convertDateToStr(
      new Date(
        filters.frdt.getFullYear(),
        filters.frdt.getMonth() + 4,
        filters.frdt.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 4,
          filters.frdt.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates6, setDates6] = useState<string>(
    convertDateToStr(
      new Date(
        filters.frdt.getFullYear(),
        filters.frdt.getMonth() + 5,
        filters.frdt.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 5,
          filters.frdt.getDate()
        )
      ).substring(4, 6) +
      "월"
  );

  const [dates7, setDates7] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 01월"
  );
  const [dates8, setDates8] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 02월"
  );
  const [dates9, setDates9] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 03월"
  );
  const [dates10, setDates10] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 04월"
  );
  const [dates11, setDates11] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 05월"
  );
  const [dates12, setDates12] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 06월"
  );
  const [dates13, setDates13] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 07월"
  );
  const [dates14, setDates14] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 08월"
  );
  const [dates15, setDates15] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 09월"
  );
  const [dates16, setDates16] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 10월"
  );
  const [dates17, setDates17] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 11월"
  );
  const [dates18, setDates18] = useState<string>(
    convertDateToStr(filters.frdt).substring(0, 4) + "년 12월"
  );
  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_AC_B6060W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "PERIOD",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": "01",
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_yyyymmdd": "",
      "@p_company_code": "",
    },
  };

  const parameters2: Iparameters = {
    procedureName: "P_AC_B6060W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "QUARTER",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": "01",
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_yyyymmdd": "",
      "@p_company_code": "",
    },
  };

  const parameters3: Iparameters = {
    procedureName: "P_AC_B6060W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "HALF",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": "01",
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_yyyymmdd": "",
      "@p_company_code": "",
    },
  };

  const parameters4: Iparameters = {
    procedureName: "P_AC_B6060W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "YEAR",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": "01",
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_yyyymmdd": "",
      "@p_company_code": "",
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        acntdt: item.acntdt == "이월" ? new Date() : item.acntdt,
      }));

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult2((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState2({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
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

  const fetchMainGrid3 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult3((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState3({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
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

  const fetchMainGrid4 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult4((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState4({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      if (tabSelected == 0) {
        fetchMainGrid();
      } else if (tabSelected == 1) {
        fetchMainGrid2();
      } else if (tabSelected == 2) {
        fetchMainGrid3();
      } else if (tabSelected == 3) {
        fetchMainGrid4();
      }
    }
  }, [filters, permissions]);

  let gridRef: any = useRef(null);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 0,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult2.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult2.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 1,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult2]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult3.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult3.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 2,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult3]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult4.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult4.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 3,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult4]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    if (tabSelected === 0) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState(newSelectedState);
    } else if (tabSelected === 1) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState2,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState2(newSelectedState);
    } else if (tabSelected === 2) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState3,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState3(newSelectedState);
    } else if (tabSelected === 3) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState4,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState4(newSelectedState);
    }
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
    }
  };

  const onMainScrollHandler2 = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 1,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 1,
      }));
    }
  };

  const onMainScrollHandler3 = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 2,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 2,
      }));
    }
  };

  const onMainScrollHandler4 = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 3,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 3,
      }));
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
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 정렬 이벤트
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

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();

    if (e.selected == 0) {
      var todts = new Date(
        filters.frdt.getFullYear(),
        filters.frdt.getMonth(),
        filters.frdt.getDate()
      );
      todts.setMonth(filters.frdt.getMonth() + 3);
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 0,
        todt: todts,
      }));
    } else if (e.selected == 1) {
      var todts = new Date(
        filters.frdt.getFullYear(),
        filters.frdt.getMonth(),
        filters.frdt.getDate()
      );
      todts.setMonth(filters.frdt.getMonth() + 3);
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 1,
        todt: todts,
      }));
    } else if (e.selected == 2) {
      var todts = new Date(
        filters.frdt.getFullYear(),
        filters.frdt.getMonth(),
        filters.frdt.getDate()
      );
      todts.setMonth(filters.frdt.getMonth() + 6);
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 2,
        todt: todts,
      }));
    } else if (e.selected == 3) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 3,
      }));
    }
  };

  const search = () => {
    resetAllGrid();
    setDates(
      convertDateToStr(filters.frdt).substring(0, 4) +
        "년" +
        convertDateToStr(filters.frdt).substring(4, 6) +
        "월"
    );
    setDates2(
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 1,
          filters.frdt.getDate()
        )
      ).substring(0, 4) +
        "년" +
        convertDateToStr(
          new Date(
            filters.frdt.getFullYear(),
            filters.frdt.getMonth() + 1,
            filters.frdt.getDate()
          )
        ).substring(4, 6) +
        "월"
    );
    setDates3(
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 2,
          filters.frdt.getDate()
        )
      ).substring(0, 4) +
        "년" +
        convertDateToStr(
          new Date(
            filters.frdt.getFullYear(),
            filters.frdt.getMonth() + 2,
            filters.frdt.getDate()
          )
        ).substring(4, 6) +
        "월"
    );
    setDates4(
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 3,
          filters.frdt.getDate()
        )
      ).substring(0, 4) +
        "년" +
        convertDateToStr(
          new Date(
            filters.frdt.getFullYear(),
            filters.frdt.getMonth() + 3,
            filters.frdt.getDate()
          )
        ).substring(4, 6) +
        "월"
    );
    setDates5(
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 4,
          filters.frdt.getDate()
        )
      ).substring(0, 4) +
        "년" +
        convertDateToStr(
          new Date(
            filters.frdt.getFullYear(),
            filters.frdt.getMonth() + 4,
            filters.frdt.getDate()
          )
        ).substring(4, 6) +
        "월"
    );
    setDates6(
      convertDateToStr(
        new Date(
          filters.frdt.getFullYear(),
          filters.frdt.getMonth() + 5,
          filters.frdt.getDate()
        )
      ).substring(0, 4) +
        "년" +
        convertDateToStr(
          new Date(
            filters.frdt.getFullYear(),
            filters.frdt.getMonth() + 5,
            filters.frdt.getDate()
          )
        ).substring(4, 6) +
        "월"
    );
    setDates7(convertDateToStr(filters.frdt).substring(0, 4) + "년 01월");
    if (tabSelected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 0,
      }));
    } else if (tabSelected == 1) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 1,
      }));
    } else if (tabSelected == 2) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 2,
      }));
    } else if (tabSelected == 3) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 3,
      }));
    }
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseInt(sum).toString().split(".");
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

    var parts = parseInt(sum).toString().split(".");
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

    var parts = parseInt(sum).toString().split(".");
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

    var parts = parseInt(sum).toString().split(".");

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
      <GridColumn title="수금" width="350px">
        {createColumn2()}
      </GridColumn>
    );
    array.push(
      <GridColumn title="지출" width="350px">
        {createColumn3()}
      </GridColumn>
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn field={"plancollectremark"} title={"내역"} width="250px" />
    );
    array.push(
      <GridColumn
        field={"plancollectamt"}
        title={"금액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };
  const createColumn3 = () => {
    const array = [];
    array.push(
      <GridColumn field={"planexpenremark"} title={"내역"} width="250px" />
    );
    array.push(
      <GridColumn
        field={"planexpenamt"}
        title={"금액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const createColumn4 = () => {
    const array = [];
    array.push(
      <GridColumn title="수금" width="350px">
        {createColumn5()}
      </GridColumn>
    );
    array.push(
      <GridColumn title="지출" width="350px">
        {createColumn6()}
      </GridColumn>
    );
    return array;
  };

  const createColumn5 = () => {
    const array = [];
    array.push(
      <GridColumn field={"execcollectremark"} title={"내역"} width="250px" />
    );
    array.push(
      <GridColumn
        field={"execcollectamt"}
        title={"금액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };
  const createColumn6 = () => {
    const array = [];
    array.push(
      <GridColumn field={"execexpenremark"} title={"내역"} width="250px" />
    );
    array.push(
      <GridColumn
        field={"execexpenamt"}
        title={"금액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const createColumn7 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt1"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt1"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"janamt1"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    return array;
  };

  const createColumn8 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt2"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt2"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"janamt2"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    return array;
  };

  const createColumn9 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt3"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt3"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"janamt3"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    return array;
  };

  const createColumn10 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt1"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt1"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"janamt1"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn11 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt2"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt2"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"janamt2"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn12 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt3"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt3"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"janamt3"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn13 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt4"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt4"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"janamt4"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn14 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt5"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt5"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"janamt5"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn15 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt6"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt6"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field={"janamt6"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn16 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt1"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt1"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt1"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn17 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt2"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt2"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt2"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn18 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt3"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt3"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt3"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn19 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt4"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt4"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt4"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn20 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt5"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt5"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt5"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn21 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt6"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt6"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt6"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn22 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt7"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt7"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt7"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn23 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt8"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt8"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt8"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn24 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt9"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt9"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt9"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn25 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt10"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt10"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt10"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn26 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt11"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt11"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt11"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn27 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"collectamt12"}
        title={"수금"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"expenamt12"}
        title={"지출"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field={"janamt12"}
        title={"잔액"}
        width="170px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  return (
    <>
      <TitleContainer>
        <Title>집행현황</Title>
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
      <FilterBoxWrap>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준일자</th>
              {tabSelected == 0 ? (
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="frdt"
                      value={filters.frdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                    ~
                    <DatePicker
                      name="todt"
                      value={filters.todt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </div>
                </td>
              ) : tabSelected == 3 ? (
                <td>
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
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
                      name="frdt"
                      value={filters.frdt}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                    ~
                    <DatePicker
                      name="todt"
                      value={filters.todt}
                      format="yyyy-MM"
                      className="readonly"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </div>
                </td>
              )}
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="기간별">
          <GridContainer width="87vw">
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <Grid
                style={{ height: "73vh" }}
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
                onScroll={onMainScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="acntdt"
                  title="일자"
                  width="120px"
                  footerCell={mainTotalFooterCell}
                  cell={DateCell}
                />
                <GridColumn title="계획">{createColumn()}</GridColumn>
                <GridColumn title="집행">{createColumn4()}</GridColumn>
                <GridColumn
                  field="janamt"
                  title="잔량"
                  width="120px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell}
                />
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="분기별">
          <GridContainer width="87vw">
            <Grid
              style={{ height: "73vh" }}
              data={process(
                mainDataResult2.data.map((row) => ({
                  ...row,
                  [SELECTED_FIELD]: selectedState[idGetter(row)],
                })),
                mainDataState
              )}
              {...mainDataState2}
              onDataStateChange={onMainDataStateChange2}
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
              total={mainDataResult2.total}
              onScroll={onMainScrollHandler2}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn
                field="dd"
                title="일자"
                width="120px"
                locked={true}
                footerCell={mainTotalFooterCell2}
              />
              <GridColumn title={dates}>{createColumn7()}</GridColumn>
              <GridColumn title={dates2}>{createColumn8()}</GridColumn>
              <GridColumn title={dates3}>{createColumn9()}</GridColumn>
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="반기별">
          <GridContainer width="87vw">
            <Grid
              style={{ height: "73vh" }}
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
              onScroll={onMainScrollHandler3}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange3}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn
                field="dd"
                title="일자"
                width="120px"
                locked={true}
                footerCell={mainTotalFooterCell3}
              />
              <GridColumn title={dates}>{createColumn10()}</GridColumn>
              <GridColumn title={dates2}>{createColumn11()}</GridColumn>
              <GridColumn title={dates3}>{createColumn12()}</GridColumn>
              <GridColumn title={dates4}>{createColumn13()}</GridColumn>
              <GridColumn title={dates5}>{createColumn14()}</GridColumn>
              <GridColumn title={dates6}>{createColumn15()}</GridColumn>
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="연간">
          <GridContainer width="87vw">
            <Grid
              style={{ height: "73vh" }}
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
              onSelectionChange={onSelectionChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={mainDataResult4.total}
              onScroll={onMainScrollHandler4}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange4}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn
                field="dd"
                title="일자"
                width="120px"
                locked={true}
                footerCell={mainTotalFooterCell4}
              />
              <GridColumn title={dates7}>{createColumn16()}</GridColumn>
              <GridColumn title={dates8}>{createColumn17()}</GridColumn>
              <GridColumn title={dates9}>{createColumn18()}</GridColumn>
              <GridColumn title={dates10}>{createColumn19()}</GridColumn>
              <GridColumn title={dates11}>{createColumn20()}</GridColumn>
              <GridColumn title={dates12}>{createColumn21()}</GridColumn>
              <GridColumn title={dates13}>{createColumn22()}</GridColumn>
              <GridColumn title={dates14}>{createColumn23()}</GridColumn>
              <GridColumn title={dates15}>{createColumn24()}</GridColumn>
              <GridColumn title={dates16}>{createColumn25()}</GridColumn>
              <GridColumn title={dates17}>{createColumn26()}</GridColumn>
              <GridColumn title={dates18}>{createColumn27()}</GridColumn>
            </Grid>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
      {gridList.map((grid: any) =>
        grid.columns.map((column: any) => (
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

export default AC_B6060W;
