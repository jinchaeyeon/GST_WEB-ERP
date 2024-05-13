import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/QC_B0200W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY2 = "num";
const DETAIL_DATA_ITEM_KEY3 = "num";

const centerField = [
  "pgmdiv",
  "qcdt",
  "qctime",
  "qcno",
  "qcperson",
  "qcdecision",
  "qcresult1",
  "검사일자",
  "차수",
  "측정소요시간",
];
const numberField = ["qcvalue1", "qty", "stdrev", "외경"];
const dateField = ["proddt"];

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;

const QC_B0200W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DETAIL_DATA_ITEM_KEY);
  const idGetter3 = getter(DETAIL_DATA_ITEM_KEY2);
  const idGetter4 = getter(DETAIL_DATA_ITEM_KEY3);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
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
    setDetailFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    setDetailFilters3((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    setPage3(initialPageState);
    setPage4(initialPageState);

    setDetailFilters((prev) => ({
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

    setDetailFilters2((prev) => ({
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

    setDetailFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("QC_B0200W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("QC_B0200W", setCustomOptionData);

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
        proccd: defaultOption.find((item: any) => item.id == "proccd")
          ?.valueCode,
        prodemp: defaultOption.find((item: any) => item.id == "prodemp")
          ?.valueCode,
        pgmdiv: defaultOption.find((item: any) => item.id == "pgmdiv")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_PR010, L_QC100,L_QC003",
    //사용자, 공정
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [inspeccdListData, setInspeccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [divListData, setDivListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_PR010")
      );
      const inspeccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_QC100")
      );
      const divQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_QC003")
      );
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );
      fetchQuery(divQueryStr, setDivListData);
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(inspeccdQueryStr, setInspeccdListData);
      fetchQuery(personQueryStr, setPersonListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState2, setDetailDataState2] = useState<State>({
    sort: [],
  });
  const [detailDataState3, setDetailDataState3] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );
  const [detailDataResult3, setDetailDataResult3] = useState<DataResult>(
    process([], detailDataState3)
  );

  const [tabSelected, setTabSelected] = React.useState(0);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState3, setDetailSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

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
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    prodemp: "",
    proccd: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    rekey: "",
    plankey: "",
    pgmdiv: "",
    stdnum: "",
    stdrev: 0,
    renum: "",
    reseq: 0,
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    renum: "",
    reseq: 0,
    stdnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters3, setDetailFilters3] = useState({
    pgSize: PAGE_SIZE,
    renum: "",
    reseq: 0,
    stdnum: "",
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
      procedureName: "P_QC_B0200W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_proccd": filters.proccd,
        "@p_lotnum": filters.lotnum,
        "@p_prodemp": filters.prodemp,
        "@p_rekey": filters.rekey,
        "@p_plankey": filters.plankey,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_stdnum": filters.stdnum,
        "@p_stdrev": filters.stdrev,
        "@p_renum": filters.renum,
        "@p_reseq": filters.reseq,
        "@p_companyCode": filters.companyCode,
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
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const fetchDetailGrid = async (detailFilters: any) => {
    let data: any;
    setLoading(true);

    const detailParameters: Iparameters = {
      procedureName: "P_QC_B0200W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "Object",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_proccd": filters.proccd,
        "@p_lotnum": filters.lotnum,
        "@p_prodemp": filters.prodemp,
        "@p_rekey": filters.rekey,
        "@p_plankey": filters.plankey,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_stdnum": filters.stdnum,
        "@p_stdrev": filters.stdrev,
        "@p_renum": filters.renum,
        "@p_reseq": filters.reseq,
        "@p_companyCode": filters.companyCode,
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (detailFilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row[DETAIL_DATA_ITEM_KEY] == detailFilters.find_row_value
          );
          targetRowIndex2 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef2.current) {
          targetRowIndex2 = 0;
        }
      }

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          detailFilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row[DETAIL_DATA_ITEM_KEY] == detailFilters.find_row_value
              );

        if (selectedRow != undefined) {
          setDetailSelectedState({ [selectedRow[DETAIL_DATA_ITEM_KEY]]: true });
          setDetailFilters2((prev) => ({
            ...prev,
            renum: selectedRow.renum,
            reseq: selectedRow.reseq,
            stdnum: selectedRow.stdnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters3((prev) => ({
            ...prev,
            renum: selectedRow.renum,
            reseq: selectedRow.reseq,
            stdnum: selectedRow.stdnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setDetailSelectedState({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
          setDetailFilters2((prev) => ({
            ...prev,
            renum: rows[0].renum,
            reseq: rows[0].reseq,
            stdnum: rows[0].stdnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters3((prev) => ({
            ...prev,
            renum: rows[0].renum,
            reseq: rows[0].reseq,
            stdnum: rows[0].stdnum,
            isSearch: true,
            pgNum: 1,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDetailGrid2 = async (detailFilters2: any) => {
    let data: any;
    setLoading(true);

    const detailParameters2: Iparameters = {
      procedureName: "P_QC_B0200W_Q",
      pageNumber: detailFilters2.pgNum,
      pageSize: detailFilters2.pgSize,
      parameters: {
        "@p_work_type": "StdDetail",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_proccd": filters.proccd,
        "@p_lotnum": filters.lotnum,
        "@p_prodemp": filters.prodemp,
        "@p_rekey": filters.rekey,
        "@p_plankey": filters.plankey,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_stdnum": detailFilters2.stdnum,
        "@p_stdrev": filters.stdrev,
        "@p_renum": detailFilters2.renum,
        "@p_reseq": detailFilters2.reseq,
        "@p_companyCode": filters.companyCode,
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (detailFilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row[DETAIL_DATA_ITEM_KEY2] == detailFilters2.find_row_value
          );
          targetRowIndex3 = findRowIndex;
        }
        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage3({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef3.current) {
          targetRowIndex3 = 0;
        }
      }

      setDetailDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          detailFilters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row[DETAIL_DATA_ITEM_KEY2] == detailFilters2.find_row_value
              );

        if (selectedRow != undefined) {
          setDetailSelectedState2({
            [selectedRow[DETAIL_DATA_ITEM_KEY2]]: true,
          });
        } else {
          setDetailSelectedState2({ [rows[0][DETAIL_DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDetailGrid3 = async (detailFilters3: any) => {
    let data: any;
    setLoading(true);

    const detailParameters3: Iparameters = {
      procedureName: "P_QC_B0200W_Q",
      pageNumber: detailFilters3.pgNum,
      pageSize: detailFilters3.pgSize,
      parameters: {
        "@p_work_type": "QcDetail",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_proccd": filters.proccd,
        "@p_lotnum": filters.lotnum,
        "@p_prodemp": filters.prodemp,
        "@p_rekey": filters.rekey,
        "@p_plankey": filters.plankey,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_stdnum": detailFilters3.stdnum,
        "@p_stdrev": filters.stdrev,
        "@p_renum": detailFilters3.renum,
        "@p_reseq": detailFilters3.reseq,
        "@p_companyCode": filters.companyCode,
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt2 = data.tables[0].TotalRowCount;
      const rows2 = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (detailFilters3.find_row_value !== "") {
        if (gridRef4.current) {
          const findRowIndex = rows2.findIndex(
            (row: any) =>
              row[DETAIL_DATA_ITEM_KEY3] == detailFilters3.find_row_value
          );
          targetRowIndex4 = findRowIndex;
        }
        setPage4({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef4.current) {
          targetRowIndex4 = 0;
        }
      }
      setDetailDataResult3((prev) => {
        return {
          data: rows2,
          total: totalRowCnt2,
        };
      });

      if (totalRowCnt2 > 0) {
        const selectedRow =
          detailFilters3.find_row_value == ""
            ? rows2[0]
            : rows2.find(
                (row: any) =>
                  row[DETAIL_DATA_ITEM_KEY3] == detailFilters3.find_row_value
              );

        if (selectedRow != undefined) {
          setDetailSelectedState3({
            [selectedRow[DETAIL_DATA_ITEM_KEY3]]: true,
          });
        } else {
          setDetailSelectedState3({ [rows2[0][DETAIL_DATA_ITEM_KEY3]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters3((prev) => ({
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
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailFilters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailFilters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters3);
      setDetailFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid3(deepCopiedFilters);
    }
  }, [detailFilters3]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [detailDataResult2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [detailDataResult3]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState2));
    setDetailDataResult3(process([], detailDataState3));
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

  const ondetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters2((prev) => ({
      ...prev,
      renum: selectedRowData.renum,
      reseq: selectedRowData.reseq,
      stdnum: selectedRowData.stdnum,
      isSearch: true,
      pgNum: 1,
    }));
    setDetailFilters3((prev) => ({
      ...prev,
      renum: selectedRowData.renum,
      reseq: selectedRowData.reseq,
      stdnum: selectedRowData.stdnum,
      isSearch: true,
      pgNum: 1,
    }));
  };
  const ondetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState2,
      dataItemKey: DETAIL_DATA_ITEM_KEY2,
    });
    setDetailSelectedState2(newSelectedState);
  };

  const ondetailSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState3,
      dataItemKey: DETAIL_DATA_ITEM_KEY3,
    });
    setDetailSelectedState3(newSelectedState);
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
        optionsGridOne.sheets[0].title = "검사내역";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        optionsGridTwo.sheets[1] = optionsGridThree.sheets[0];
        optionsGridTwo.sheets[2] = optionsGridFour.sheets[0];
        optionsGridTwo.sheets[0].title = "검사대상";
        optionsGridTwo.sheets[1].title = "검사항목";
        optionsGridTwo.sheets[2].title = "검사상세정보";
        _export2.save(optionsGridTwo);
      }
    }
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
  const onDetailDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setDetailDataState3(event.dataState);
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      setDetailFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
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

  const detailTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = detailDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

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

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange3 = (e: any) => {
    setDetailDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_B0200W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_B0200W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState);
        setPage3(initialPageState);
        setPage4(initialPageState);
        if (tabSelected == 0) {
          setFilters((prev: any) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        } else {
          setDetailFilters((prev: any) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>검사실적현황</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="QC_B0200W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>검사일자</th>
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
                  className="required"
                />
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd"
                    value={filters.proccd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
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
                  />
                )}
              </td>
              <th>생산계획번호</th>
              <td>
                <Input
                  name="plankey"
                  type="text"
                  value={filters.plankey}
                  onChange={filterInputChange}
                />
              </td>
            </tr>

            <tr>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>프로그램구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="pgmdiv"
                    value={filters.pgmdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>생산실적번호</th>
              <td>
                <Input
                  name="rekey"
                  type="text"
                  value={filters.rekey}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        style={{ width: "100%", height: "79.3vh" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="전체">
          <GridContainer width="100%">
            <GridTitleContainer>
              <GridTitle>검사내역</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="검사실적현황"
            >
              <Grid
                style={{ height: "68vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    proccd: proccdListData.find(
                      (items: any) => items.sub_code == row.proccd
                    )?.code_name,
                    qcperson: personListData.find(
                      (items: any) => items.user_id == row.qcperson
                    )?.user_name,
                    prodemp: personListData.find(
                      (items: any) => items.user_id == row.prodemp
                    )?.user_name,
                    inspeccd: inspeccdListData.find(
                      (items: any) => items.sub_code == row.inspeccd
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
                  customOptionData.menuCustomColumnOptions["grdList"]?.map(
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
                              : centerField.includes(item.fieldName)
                              ? CenterCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="대상별">
          <GridContainer width="100$">
            <GridTitleContainer>
              <GridTitle>검사대상</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={detailDataResult.data}
              ref={(exporter) => {
                _export2 = exporter;
              }}
              fileName="검사실적현황"
            >
              <Grid
                style={{ height: "32vh" }}
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    proccd: proccdListData.find(
                      (items: any) => items.sub_code == row.proccd
                    )?.code_name,
                    person: personListData.find(
                      (item: any) => item.user_id == row.person
                    )?.user_name,
                    prodemp: personListData.find(
                      (items: any) => items.user_id == row.prodemp
                    )?.user_name,
                    div: divListData.find(
                      (items: any) => items.sub_code == row.div
                    )?.code_name,
                    [SELECTED_FIELD]: detailSelectedState[idGetter2(row)],
                  })),
                  detailDataState
                )}
                {...detailDataState}
                onDataStateChange={onDetailDataStateChange}
                dataItemKey={DETAIL_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={ondetailSelectionChange}
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
                  customOptionData.menuCustomColumnOptions["grdList2"]?.map(
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
                              : centerField.includes(item.fieldName)
                              ? CenterCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? detailTotalFooterCell
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
          <GridContainerWrap>
            <GridContainer width={`20%`}>
              <GridTitleContainer>
                <GridTitle>검사항목</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult2.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="검사실적현황"
              >
                <Grid
                  style={{ height: "31.5vh" }}
                  data={process(
                    detailDataResult2.data.map((row) => ({
                      ...row,
                      inspeccd: inspeccdListData.find(
                        (items: any) => items.sub_code == row.inspeccd
                      )?.code_name,
                      [SELECTED_FIELD]: detailSelectedState2[idGetter3(row)],
                    })),
                    detailDataState2
                  )}
                  {...detailDataState2}
                  onDataStateChange={onDetailDataStateChange2}
                  dataItemKey={DETAIL_DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange2}
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
                    customOptionData.menuCustomColumnOptions["grdList3"]?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            footerCell={
                              item.sortOrder == 0
                                ? detailTotalFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(80% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>검사상세정보</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult3.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName="검사실적현황"
              >
                <Grid
                  style={{ height: "31.5vh" }}
                  data={process(
                    detailDataResult3.data.map((row) => ({
                      ...row,
                      inspeccd: inspeccdListData.find(
                        (items: any) => items.sub_code == row.inspeccd
                      )?.code_name,
                      [SELECTED_FIELD]: detailSelectedState3[idGetter4(row)],
                    })),
                    detailDataState3
                  )}
                  {...detailDataState3}
                  onDataStateChange={onDetailDataStateChange3}
                  dataItemKey={DETAIL_DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange3}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult3.total}
                  skip={page4.skip}
                  take={page4.take}
                  pageable={true}
                  onPageChange={pageChange4}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef4}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange3}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList4"]?.map(
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
                                : centerField.includes(item.fieldName)
                                ? CenterCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? detailTotalFooterCell3
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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

export default QC_B0200W;
