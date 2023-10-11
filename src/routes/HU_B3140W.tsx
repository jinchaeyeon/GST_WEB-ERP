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
import { gridList } from "../store/columns/HU_B3140W_C";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
  FilterBox,
  GridContainer,
  TitleContainer,
  ButtonContainer,
  ButtonInInput,
  GridTitleContainer,
  GridTitle,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  rowsOfDataResult,
  rowsWithSelectedDataResult,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../store/atoms";
import YearCalendar from "../components/Calendars/YearCalendar";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import MonthDateCell from "../components/Cells/MonthDateCell";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";

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

const HU_B3140W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  //상단 필터 state
  const [multi, setMulti] = useState<boolean>(true);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");
      const DATE = new Date();
      const DATE2 = new Date();
      //현재년도 1월, 12월 set
      DATE.setMonth(0);
      DATE2.setMonth(11);
      setFilters((prev) => ({
        ...prev,
        fryyyymm: DATE,
        toyyyymm: DATE2,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        rtrdt: defaultOption.find((item: any) => item.id === "rtrdt").valueCode,
        dptcd: defaultOption.find((item: any) => item.id === "dptcd").valueCode,
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
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );
      const paytypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU032")
      );

      fetchQuery(paytypeQueryStr, setPaytypeListData);
      fetchQuery(postcdQueryStr, setPostcdListData);
      fetchQuery(dptcdQueryStr, setDptcdListData);
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
    group: [
      {
        field: "group_category_name",
      },
    ],
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

  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  const [tabSelected, setTabSelected] = React.useState(0);
  const [mainDataTotal2, setMainDataTotal2] = useState<number>(0);

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
    orgdiv: "01",
    location: "",
    payyyyy: new Date(),
    fryyyymm: new Date(),
    toyyyymm: new Date(),
    prsnnum: "",
    prsnnm: "",
    dptcd: "",
    rtrdt: "N",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
    tab: 0,
  });

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

  const parameters4: Iparameters = {
    procedureName: "P_HU_B3140W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
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
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
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
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          groupId: row.prsnnum + "prsnnum",
          group_category_name: "성명" + " : " + row.prsnnm,
          postcd: postcdListData.find(
            (item: any) => item.sub_code === row.postcd
          )?.code_name,
          dptcd: dptcdListData.find((item: any) => item.dptcd === row.dptcd)
            ?.dptnm,
          paytype: paytypeListData.find(
            (item: any) => item.sub_code === row.paytype
          )?.code_name,
        };
      });
      if (totalRowCnt > 0) {
        setMainDataTotal2(totalRowCnt);
        setMainDataResult2((prev) =>
          process([...rowsOfDataResult(prev), ...rows], mainDataState2)
        );

        // 그룹코드로 조회한 경우, 조회된 페이지넘버로 세팅
        if (filters.pgNum !== data.pageNumber) {
          setFilters((prev) => ({ ...prev, pgNum: data.pageNumber }));
        }

        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState2({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
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
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState3({ [firstRowData[DATA_ITEM_KEY]]: true });
        }

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
                total: totalRowCnt == -1 ? 0 : totalRowCnt,
              };
            });
            if (filters.find_row_value === "" && filters.pgNum === 1) {
              // 첫번째 행 선택하기
              const firstRowData = rows[0];
              setSelectedState4({ [firstRowData[DATA_ITEM_KEY]]: true });
            }
          }
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

  const fetchMainGrid5 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters5);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult5((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState5({ [firstRowData[DATA_ITEM_KEY]]: true });
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

  const fetchMainGrid6 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters6);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult6((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState6({ [firstRowData[DATA_ITEM_KEY]]: true });
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

  const onExpandChange2 = (event: any) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;

    setMainDataResult2({ ...mainDataResult2 });
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
        fetchMainGrid5();
      } else {
        fetchMainGrid6();
      }
    }
  }, [filters, permissions]);

  let gridRef : any = useRef(null); 

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
        gridRef.container.scroll(0, scrollHeight);

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
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    setMainDataResult2((prev) =>
      process(
        rowsWithSelectedDataResult(prev, selectedState2, DATA_ITEM_KEY),
        mainDataState2
      )
    );
  }, [selectedState2]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult3.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult3.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

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
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult3]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult5.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult5.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

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
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult5]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult6.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult6.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 4,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult6]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
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

      const newSelectedState2 = getSelectedState({
        event,
        selectedState: selectedState4,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState4(newSelectedState2);
    } else if (tabSelected === 3) {
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

  const onMainScrollHandler5 = (event: GridEvent) => {
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

  const onMainScrollHandler6 = (event: GridEvent) => {
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
        tab: 4,
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
        tab: 4,
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

  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
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

  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();

    if (e.selected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 0,
      }));
      setMulti(true);
    } else if (e.selected == 1) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 1,
      }));
      setMulti(true);
    } else if (e.selected == 2) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 2,
      }));
      setMulti(true);
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
      setMulti(false);
    } else {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 4,
      }));
      setMulti(false);
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.payyyyy).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_B3140W_001");
      } else {
        resetAllGrid();

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
        } else {
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: "",
            scrollDirrection: "down",
            pgNum: 1,
            isSearch: true,
            pgGap: 0,
            tab: 4,
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const setPrsnnumData = (data: IPrsnnum) => {
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
    rowsOfDataResult(mainDataResult2).forEach((item) =>
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

  const gridSumQtyFooterCell5 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult5.data.forEach((item) =>
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

  const gridSumQtyFooterCell6 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult6.data.forEach((item) =>
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
                    onClick={onPrsnnumWndClick}
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
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="개인별월내역(합계)">
          <GridContainer width="87vw">
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <Grid
                style={{ height: "72vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    postcd: postcdListData.find(
                      (item: any) => item.sub_code === row.postcd
                    )?.code_name,
                    dptcd: dptcdListData.find(
                      (item: any) => item.dptcd === row.dptcd
                    )?.dptnm,
                    paytype: paytypeListData.find(
                      (item: any) => item.sub_code === row.paytype
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
                onScroll={onMainScrollHandler}
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
                            NumberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 1
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
          <GridContainer width="87vw">
            <Grid
              style={{ height: "72vh" }}
              data={mainDataResult2}
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
              total={mainDataTotal2}
              onScroll={onMainScrollHandler2}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              groupable={true}
              onExpandChange={onExpandChange2}
              expandField="expanded"
            >
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList2"].map(
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
                          item.sortOrder === 1
                            ? mainTotalFooterCell2
                            : NumberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell2
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="월별급상여내역">
          <GridContainer width="87vw">
            <GridTitleContainer>
              <GridTitle>급여내역</GridTitle>
            </GridTitleContainer>
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
          </GridContainer>
          <GridContainer width="87vw">
            <GridTitleContainer>
              <GridTitle>상여내역</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "32.5vh" }}
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
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="급여상세내역">
          <GridContainer width="87vw">
            <Grid
              style={{ height: "72vh" }}
              data={process(
                mainDataResult5.data.map((row) => ({
                  ...row,
                  dptcd: dptcdListData.find(
                    (item: any) => item.dptcd === row.dptcd
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
              onScroll={onMainScrollHandler5}
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
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="상여상세내역">
          <GridContainer width="87vw">
            <Grid
              style={{ height: "72vh" }}
              data={process(
                mainDataResult6.data.map((row) => ({
                  ...row,
                  dptcd: dptcdListData.find(
                    (item: any) => item.dptcd === row.dptcd
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
              onScroll={onMainScrollHandler6}
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
          </GridContainer>
        </TabStripTab>
      </TabStrip>
      {prsnnumWindowVisible && (
        <UserWindow
          setVisible={setPrsnnumWindowVisible}
          setData={setPrsnnumData}
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
