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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
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
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
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
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/MA_B7200W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY6 = "num";

const dateField = ["indt", "outdt", "proddt"];
const numberField = [
  "before_qty",
  "in_qty",
  "out_qty",
  "now_qty",
  "safeqty",
  "qty",
];

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let targetRowIndex5: null | number = null;
let targetRowIndex6: null | number = null;

const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];
const initialGroup2: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

const MA_B7200W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const processApi = useApi();
  const [group, setGroup] = React.useState(initialGroup);
  const [group2, setGroup2] = React.useState(initialGroup2);

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("MA_B7200W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("MA_B7200W", setCustomOptionData);

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
        itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
          .valueCode,
        proccd: defaultOption.find((item: any) => item.id === "proccd")
          .valueCode,
        stockyn: defaultOption.find((item: any) => item.id === "stockyn")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_BA015,L_sysUserMaster_001,L_PR010",
    //품목계정, 수량단위, 사용자, 공정
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
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

    if (data.isSuccess === true) {
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

  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  const [detailDataState3, setDetailDataState3] = useState<State>({
    sort: [],
  });
  const [detailDataState4, setDetailDataState4] = useState<State>({
    sort: [],
  });

  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );

  const [resultState2, setResultState2] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );

  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  const [detailDataResult3, setDetailDataResult3] = useState<DataResult>(
    process([], detailDataState3)
  );

  const [detailDataResult4, setDetailDataResult4] = useState<DataResult>(
    process([], detailDataState4)
  );

  const [total, setTotal] = useState(0);
  const [total2, setTotal2] = useState(0);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState3, setDetailSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState4, setDetailSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [tabSelected, setTabSelected] = React.useState(0);

  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);
  const [collapsedState2, setCollapsedState2] = React.useState<string[]>([]);

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
    workType: "LIST1",
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    insiz: "",
    lotnum: "",
    proccd: "",
    orglot: "",
    stockyn: "",
    gubun: "I",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST2",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL1_IN",
    itemcd: "",
    itemacnt: "",
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL1_IN",
    itemcd: "",
    proccd: "",
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters3, setDetailFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL2_IN",
    itemcd: "",
    itemacnt: "",
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters4, setDetailFilters4] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL2_IN",
    itemcd: "",
    proccd: "",
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);
  let gridRef6: any = useRef(null);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2(initialPageState);
    setPage3(initialPageState);
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

    setDetailFilters4((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage5(initialPageState);
    setPage6(initialPageState);
    setFilters2((prev) => ({
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

    setDetailFilters3((prev) => ({
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

    setDetailFilters4((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage6({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_B7200W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters.lotnum,
        "@p_proccd": filters.proccd,
        "@p_orglot": filters.orglot,
        "@p_stockyn": filters.stockyn,
        "@p_gubun": filters.gubun,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          groupId: row.itemacnt + "itemacnt",
          group_category_name:
            "품목계정" +
            " : " +
            itemacntListData.find((item: any) => item.sub_code == row.itemacnt)
              ?.code_name,
        };
      });

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.itemacnt === filters.find_row_value
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
      const newDataState = processWithGroups(rows, group);
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal(totalRowCnt);
      setResultState(newDataState);

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.itemacnt == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setDetailFilters((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            itemacnt: selectedRow.itemacnt,
            lotnum: selectedRow.lotnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            itemacnt: selectedRow.itemacnt,
            lotnum: selectedRow.lotnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setDetailFilters((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            itemacnt: rows[0].itemacnt,
            lotnum: rows[0].lotnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            itemacnt: rows[0].itemacnt,
            lotnum: rows[0].lotnum,
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

  const fetchDetailGrid = async (detailfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    //조회조건 파라미터
    const detailparameters: Iparameters = {
      procedureName: "P_MA_B7200W_Q",
      pageNumber: detailfilters.pgNum,
      pageSize: detailfilters.pgSize,
      parameters: {
        "@p_work_type": detailfilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": detailfilters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt":
          detailfilters.itemacnt == undefined ? "" : detailfilters.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_lotnum": detailfilters.lotnum,
        "@p_proccd": filters.proccd,
        "@p_orglot": filters.orglot,
        "@p_stockyn": filters.stockyn,
        "@p_gubun": filters.gubun,
      },
    };
    try {
      data = await processApi<any>("procedure", detailparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
      }));

      setDetailDataResult((prev) => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setDetailSelectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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

  const fetchDetailGrid2 = async (detailfilters2: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    const detailparameters2: Iparameters = {
      procedureName: "P_MA_B7200W_Q",
      pageNumber: detailfilters2.pgNum,
      pageSize: detailfilters2.pgSize,
      parameters: {
        "@p_work_type": "DETAIL1_OUT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": detailfilters2.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt":
          detailfilters2.itemacnt == undefined ? "" : detailfilters2.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_lotnum": detailfilters2.lotnum,
        "@p_proccd": filters.proccd,
        "@p_orglot": filters.orglot,
        "@p_stockyn": filters.stockyn,
        "@p_gubun": filters.gubun,
      },
    };
    try {
      data = await processApi<any>("procedure", detailparameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
      }));

      setDetailDataResult2((prev) => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setDetailSelectedState2({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_MA_B7200W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "LIST2",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters.lotnum,
        "@p_proccd": filters.proccd,
        "@p_orglot": filters.orglot,
        "@p_stockyn": filters.stockyn,
        "@p_gubun": filters.gubun,
      },
    };
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
          groupId: row.proccd + "itemacnt",
          group_category_name:
            "공정" +
            " : " +
            proccdListData.find((item: any) => item.sub_code === row.proccd)
              ?.code_name,
          qtyunit: qtyunitListData.find(
            (item: any) => item.sub_code === row.qtyunit
          )?.code_name,
        };
      });

      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef4.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.proccd === filters2.find_row_value
          );
          targetRowIndex4 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
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

      const newDataState = processWithGroups(rows, group2);
      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal2(totalRowCnt);
      setResultState2(newDataState);

      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.proccd == filters2.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY4]]: true });

          setDetailFilters3((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            proccd: selectedRow.proccd,
            lotnum: selectedRow.lotnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters4((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            proccd: selectedRow.proccd,
            lotnum: selectedRow.lotnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY4]]: true });

          setDetailFilters3((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            proccd: rows[0].proccd,
            lotnum: rows[0].lotnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters4((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            proccd: rows[0].proccd,
            lotnum: rows[0].lotnum,
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

  const fetchDetailGrid3 = async (detailfilters3: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    //조회조건 파라미터
    const detailparameters3: Iparameters = {
      procedureName: "P_MA_B7200W_Q",
      pageNumber: detailfilters3.pgNum,
      pageSize: detailfilters3.pgSize,
      parameters: {
        "@p_work_type": detailfilters3.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": detailfilters3.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": detailfilters3.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_lotnum": detailfilters3.lotnum,
        "@p_proccd": filters.proccd,
        "@p_orglot": filters.orglot,
        "@p_stockyn": filters.stockyn,
        "@p_gubun": filters.gubun,
      },
    };
    try {
      data = await processApi<any>("procedure", detailparameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
      }));
      setDetailDataResult3((prev) => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setDetailSelectedState3({ [rows[0][DATA_ITEM_KEY5]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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

  const fetchDetailGrid4 = async (detailfilters4: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    const detailparameters4: Iparameters = {
      procedureName: "P_MA_B7200W_Q",
      pageNumber: detailfilters4.pgNum,
      pageSize: detailfilters4.pgSize,
      parameters: {
        "@p_work_type": "DETAIL2_OUT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": detailfilters4.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_lotnum": detailfilters4.lotnum,
        "@p_proccd": detailfilters4.proccd,
        "@p_orglot": filters.orglot,
        "@p_stockyn": filters.stockyn,
        "@p_gubun": filters.gubun,
      },
    };
    try {
      data = await processApi<any>("procedure", detailparameters4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
      }));
      setDetailDataResult4((prev) => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setDetailSelectedState4({ [rows[0][DATA_ITEM_KEY6]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setDetailFilters4((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  // 조회 버튼 => 리셋 후 조회
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_B7200W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_B7200W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) !=
        convertDateToStr(filters.frdt).substring(0, 4)
      ) {
        throw findMessage(messagesData, "MA_B7200W_002");
      } else {
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setPage3(initialPageState); // 페이지 초기화
        setPage4(initialPageState); // 페이지 초기화
        setPage5(initialPageState); // 페이지 초기화
        setPage6(initialPageState); // 페이지 초기화
        resetAllGrid(); // 데이터 초기화
        if (tabSelected == 0) {
          setFilters((prev) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        } else {
          setFilters2((prev) => ({
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
  useEffect(() => {
    if (filters.isSearch && permissions !== null && bizComponentData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
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
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, bizComponentData]);

  useEffect(() => {
    if (permissions !== null && detailfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailfilters, permissions]);

  useEffect(() => {
    if (permissions !== null && detailfilters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailfilters2, permissions]);

  useEffect(() => {
    if (permissions !== null && detailfilters3.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters3);
      setDetailFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid3(deepCopiedFilters);
    }
  }, [detailfilters3, permissions]);

  useEffect(() => {
    if (permissions !== null && detailfilters4.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters4);
      setDetailFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid4(deepCopiedFilters);
    }
  }, [detailfilters4, permissions]);

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
    if (targetRowIndex5 !== null && gridRef5.current) {
      gridRef5.current.scrollIntoView({ rowIndex: targetRowIndex5 });
      targetRowIndex5 = null;
    }
  }, [detailDataResult3]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex6 !== null && gridRef6.current) {
      gridRef6.current.scrollIntoView({ rowIndex: targetRowIndex6 });
      targetRowIndex6 = null;
    }
  }, [detailDataResult4]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [resultState]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [resultState2]);

  //그리드 리셋
  const resetAllGrid = () => {
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState2));
    setDetailDataResult3(process([], detailDataState3));
    setDetailDataResult4(process([], detailDataState4));
  };

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

    setDetailFilters((prev: any) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      itemacnt: selectedRowData.itemacnt,
      lotnum: selectedRowData.lotnum,
      isSearch: true,
      pgNum: 1,
    }));
    setDetailFilters2((prev: any) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      itemacnt: selectedRowData.itemacnt,
      lotnum: selectedRowData.lotnum,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setDetailSelectedState(newSelectedState);
  };

  const onDetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState2,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setDetailSelectedState2(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters3((prev: any) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      proccd: selectedRowData.proccd,
      lotnum: selectedRowData.lotnum,
      isSearch: true,
      pgNum: 1,
    }));
    setDetailFilters4((prev: any) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      proccd: selectedRowData.proccd,
      lotnum: selectedRowData.lotnum,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onDetailSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState3,
      dataItemKey: DATA_ITEM_KEY5,
    });
    setDetailSelectedState3(newSelectedState);
  };

  const onDetailSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState4,
      dataItemKey: DATA_ITEM_KEY6,
    });
    setDetailSelectedState4(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
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

  const onDetailDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setDetailDataState4(event.dataState);
  };

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  const newData2 = setExpandedState({
    data: resultState2,
    collapsedIds: collapsedState2,
  });

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
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

  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = total2.toString().split(".");
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

  const detailTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = detailDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult4.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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
    detailDataResult.data.forEach((item) =>
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
    detailDataResult2.data.forEach((item) =>
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

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);

    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    }
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

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange3 = (e: any) => {
    setDetailDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange4 = (e: any) => {
    setDetailDataState4((prev) => ({ ...prev, sort: e.sort }));
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"inqty"}
        title={"입고수량"}
        width="100px"
        footerCell={gridSumQtyFooterCell4}
        cell={NumberCell}
      />
    );
    array.push(
      <GridColumn
        field={"outqty"}
        title={"출고수량"}
        width="100px"
        footerCell={gridSumQtyFooterCell4}
        cell={NumberCell}
      />
    );
    return array;
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

  const onExpandChange2 = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState2, item.groupId]
          : collapsedState2.filter((groupId) => groupId != item.groupId);
        setCollapsedState2(collapsedIds);
      }
    },
    [collapsedState2]
  );

  return (
    <>
      <TitleContainer>
        <Title>기간재고조회</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="MA_B7200W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준일자</th>
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
              <th>수주LOT</th>
              <td>
                <Input
                  name="orglot"
                  type="text"
                  value={filters.orglot}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>품목계정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemacnt"
                    value={filters.itemacnt}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
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
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>재고수량</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="stockyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%", height: "78vh" }}
      >
        <TabStripTab title="재고현황">
          <GridContainerWrap>
            <GridContainer width={`65%`}>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle>품목별기간재고</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "65vh" }}
                  data={newData.map((item: { items: any[] }) => ({
                    ...item,
                    items: item.items.map((row: any) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                  }))}
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
                  total={total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
                  rowHeight={30}
                  //그룹기능
                  group={group}
                  groupable={true}
                  onExpandChange={onExpandChange}
                  expandField="expanded"
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
            <GridContainer width={`calc(35% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>입고상세내역</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "30.1vh" }}
                  data={process(
                    detailDataResult.data.map((row) => ({
                      ...row,
                      qtyunit: qtyunitListData.find(
                        (item: any) => item.sub_code === row.qtyunit
                      )?.code_name,
                      person: personListData.find(
                        (item: any) => item.user_id === row.person
                      )?.user_name,
                      [SELECTED_FIELD]: detailselectedState[idGetter2(row)],
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
                  onSelectionChange={onDetailSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
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
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? detailTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>출고상세내역</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "30.1vh" }}
                  data={process(
                    detailDataResult2.data.map((row) => ({
                      ...row,
                      qtyunit: qtyunitListData.find(
                        (item: any) => item.sub_code === row.qtyunit
                      )?.code_name,
                      person: personListData.find(
                        (item: any) => item.user_id === row.person
                      )?.user_name,
                      [SELECTED_FIELD]: detailselectedState2[idGetter3(row)],
                    })),
                    detailDataState2
                  )}
                  {...detailDataState2}
                  onDataStateChange={onDetailDataStateChange2}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onDetailSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult2.total}
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
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
                    customOptionData.menuCustomColumnOptions["grdList3"].map(
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
                                : dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? detailTotalFooterCell2
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell3
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="공정별 재공현황">
          <GridContainerWrap>
            <GridContainer width={`65%`}>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle>제공품재고</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "65vh" }}
                  data={newData2.map((item: { items: any[] }) => ({
                    ...item,
                    items: item.items.map((row: any) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState2[idGetter4(row)], //선택된 데이터
                    })),
                  }))}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  //그룹기능
                  group={group2}
                  groupable={true}
                  onExpandChange={onExpandChange2}
                  expandField="expanded"
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY4}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange2}
                  //페이지네이션
                  total={total2}
                  skip={page4.skip}
                  take={page4.take}
                  pageable={true}
                  onPageChange={pageChange4}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef4}
                  rowHeight={30}
                >
                  <GridColumn
                    field="itemcd"
                    title="품목코드"
                    width="150px"
                    footerCell={mainTotalFooterCell2}
                  />
                  <GridColumn field="itemnm" title="품목명" width="150px" />
                  <GridColumn field="insiz" title="규격" width="120px" />
                  <GridColumn field="qtyunit" title="단위" width="120px" />
                  <GridColumn
                    field="before_qty"
                    title="기간이전재고"
                    width="100px"
                    cell={NumberCell}
                    footerCell={gridSumQtyFooterCell4}
                  />
                  <GridColumn title="기간내재고">{createColumn()}</GridColumn>
                  <GridColumn
                    field="stockqty"
                    title="재고수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={gridSumQtyFooterCell4}
                  />
                  <GridColumn field="lotnum" title="LOT NO" width="150px" />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(35% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>입고상세내역</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "30.1vh" }}
                  data={process(
                    detailDataResult3.data.map((row) => ({
                      ...row,
                      qtyunit: qtyunitListData.find(
                        (item: any) => item.sub_code === row.qtyunit
                      )?.code_name,
                      person: personListData.find(
                        (item: any) => item.user_id === row.person
                      )?.user_name,
                      [SELECTED_FIELD]: detailselectedState3[idGetter5(row)],
                    })),
                    detailDataState3
                  )}
                  {...detailDataState3}
                  onDataStateChange={onDetailDataStateChange3}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY5}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onDetailSelectionChange3}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult3.total}
                  skip={page5.skip}
                  take={page5.take}
                  pageable={true}
                  onPageChange={pageChange5}
                  ref={gridRef5}
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
                    customOptionData.menuCustomColumnOptions["grdList4"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? detailTotalFooterCell3
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>출고상세내역</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "30.1vh" }}
                  data={process(
                    detailDataResult4.data.map((row) => ({
                      ...row,
                      qtyunit: qtyunitListData.find(
                        (item: any) => item.sub_code === row.qtyunit
                      )?.code_name,
                      person: personListData.find(
                        (item: any) => item.user_id === row.person
                      )?.user_name,
                      [SELECTED_FIELD]: detailselectedState4[idGetter6(row)],
                    })),
                    detailDataState4
                  )}
                  {...detailDataState4}
                  onDataStateChange={onDetailDataStateChange4}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY6}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onDetailSelectionChange4}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult4.total}
                  skip={page6.skip}
                  take={page6.take}
                  pageable={true}
                  onPageChange={pageChange6}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef6}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange4}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList5"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? detailTotalFooterCell4
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
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

export default MA_B7200W;
