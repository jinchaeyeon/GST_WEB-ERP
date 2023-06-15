import React, { useCallback, useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridCellProps,
  GridHeaderCellProps,
  GridExpandChangeEvent,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
  GridContainerWrap,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getItemQuery,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
  getQueryFromBizComponent,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import TopButtons from "../components/Buttons/TopButtons";
import { gridList } from "../store/columns/PR_A7000W_C";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import ItemsMultiWindow from "../components/Windows/CommonWindows/ItemsMultiWindow";
import { IItemData } from "../hooks/interfaces";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import YearCalendar from "../components/Calendars/YearCalendar";
import NumberCell from "../components/Cells/NumberCell";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState, sessionItemState } from "../store/atoms";
import { bytesToBase64 } from "byte-base64";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import {
  CellRender as CellRender2,
  RowRender as RowRender2,
} from "../components/Renderers/GroupRenderers";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
let deletedRows: any[] = [];

const numberField = ["qty", "plqty", "reqty", "procseq"];
const DateField = ["plandt", "finexpdt", "godt"];
const customField = ["proccd", "prodmac", "prodemp"];
const customHeaderField = ["proccd", "procseq"];

type TdataArr = {
  planno_s: string[];
  chkyn_s: string[];
  plankey_s: string[];
  prodmac_s: string[];
  prodemp_s: string[];
  gokey_s: string[];
  qty_s: string[];
  godt_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 공정,대분류,중분류,소분류,품목계정,단위,중량단위
  UseBizComponent("L_PR010,L_sysUserMaster_001,L_fxcode", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "proccd"
      ? "L_PR010"
      : field === "prodmac"
      ? "L_fxcode"
      : field === "prodemp"
      ? "L_sysUserMaster_001"
      : "";

  const fieldName =
    field === "prodemp"
      ? "user_name"
      : field === "prodmac"
      ? "fxfull"
      : undefined;

  const filedValue =
    field === "prodemp"
      ? "user_id"
      : field === "prodmac"
      ? "fxcode"
      : undefined;
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      {...props}
      textField={fieldName}
      valueField={filedValue}
    />
  ) : (
    <td></td>
  );
};

const PR_A7000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
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
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        finyn: defaultOption.find((item: any) => item.id === "finyn").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA015", setBizComponentData);

  const [qtyunitListData, setQtyunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );

      fetchQuery(qtyunitQueryStr, setQtyunitListData);
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

  const [sessionItem] = useRecoilState(sessionItemState);
  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };
  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 스테이트
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState2, setDetailDataState2] = useState<State>({
    group: [
      {
        field: "group_category_name",
      },
    ],
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  //그리드 데이터 결과값
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  //그리드 데이터 결과값
  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //선택 상태
  const [detailselectedState, setDetailselectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailselectedState2, setDetailselectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setEditIndex(undefined);
    setItemWindowVisible(true);
  };

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
    work_type: "PLAN",
    orgdiv: "01",
    location: "",
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    insiz: "",
    finyn: "",
    planno: "",
    ordnum: "",
    custcd: "",
    custnm: "",
    project: "",
    companyCode: companyCode,
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 초기값
  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "PROC",
    planno: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 초기값
  const [detailfilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "GOLIST",
    planno: "",
    godt: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_PR_A7000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code === "orgdiv"
      )?.value,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_finyn": filters.finyn,
      "@p_planno": filters.planno,
      "@p_ordnum": filters.ordnum,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_gonum_s": "",
      "@p_ordnump": "",
      "@p_pcnt": 0,
      "@p_gonum": "",
      "@p_godt": "",
      "@p_proccd": "",
      "@p_prodmac": "",
      "@p_prodemp": "",
      "@p_rcvcustcd": "",
      "@p_rcvcustnm": "",
      "@p_bnatur": "",
      "@p_project": filters.project,
    },
  };

  //조회조건 파라미터
  const detailParameters: Iparameters = {
    procedureName: "P_PR_A7000W_Q",
    pageNumber: detailfilters.pgNum,
    pageSize: detailfilters.pgSize,
    parameters: {
      "@p_work_type": detailfilters.work_type,
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code === "orgdiv"
      )?.value,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_finyn": filters.finyn,
      "@p_planno": detailfilters.planno,
      "@p_ordnum": filters.ordnum,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_gonum_s": "",
      "@p_ordnump": "",
      "@p_pcnt": 0,
      "@p_gonum": "",
      "@p_godt": "",
      "@p_proccd": "",
      "@p_prodmac": "",
      "@p_prodemp": "",
      "@p_rcvcustcd": "",
      "@p_rcvcustnm": "",
      "@p_bnatur": "",
      "@p_project": filters.project,
    },
  };

  //조회조건 파라미터
  const detailParameters2: Iparameters = {
    procedureName: "P_PR_A7000W_Q",
    pageNumber: detailfilters2.pgNum,
    pageSize: detailfilters2.pgSize,
    parameters: {
      "@p_work_type": detailfilters2.work_type,
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code === "orgdiv"
      )?.value,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_finyn": filters.finyn,
      "@p_planno": detailfilters2.planno,
      "@p_ordnum": filters.ordnum,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_gonum_s": "",
      "@p_ordnump": "",
      "@p_pcnt": 0,
      "@p_gonum": "",
      "@p_godt": detailfilters2.godt,
      "@p_proccd": "",
      "@p_prodmac": "",
      "@p_prodemp": "",
      "@p_rcvcustcd": "",
      "@p_rcvcustnm": "",
      "@p_bnatur": "",
      "@p_project": filters.project,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
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
          setDetailFilters((prev) => ({
            ...prev,
            planno: firstRowData.planno,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            planno: firstRowData.planno,
            godt: firstRowData.plandt,
            isSearch: true,
            pgNum: 1,
          }));
        }
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchDetailGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }
    console.log(data);
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
        godt: row.godt == "" ? convertDateToStr(new Date()) : row.godt,
        chk: row.chk == "Y" ? true : row.chk == "N" ? false : row.chk,
      }));

      if (totalRowCnt > 0) {
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (detailfilters.find_row_value === "" && detailfilters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setDetailselectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setDetailFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchDetailGrid2 = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
        groupId: row.gonum + "gonum",
        group_category_name: "작업지시번호" + " : " + row.gonum,
        chk: row.chk == "Y" ? true : row.chk == "N" ? false : row.chk,
      }));

      if (totalRowCnt > 0) {
        setDetailDataResult2((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (
          detailfilters2.find_row_value === "" &&
          detailfilters2.pgNum === 1
        ) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setDetailselectedState2({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setDetailFilters2((prev) => ({
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
      fetchMainGrid();
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      detailfilters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setDetailFilters((prev) => ({ ...prev, isSearch: false }));
      fetchDetailGrid();
    }
  }, [detailfilters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      detailfilters2.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setDetailFilters2((prev) => ({ ...prev, isSearch: false }));
      fetchDetailGrid2();
    }
  }, [detailfilters2, permissions]);

  //그리드 리셋
  const resetAllGrid = () => {
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState));
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      find_row_value: "",
    }));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState));

    setDetailFilters((prev) => ({
      ...prev,
      planno: selectedRowData.planno,
      pgNum: 1,
      isSearch: true,
    }));
    setDetailFilters2((prev) => ({
      ...prev,
      planno: selectedRowData.planno,
      pgNum: 1,
      isSearch: true,
    }));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setDetailselectedState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
  };
  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onDetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState2,
      dataItemKey: DATA_ITEM_KEY,
    });

    setDetailselectedState2(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
  };

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
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (detailfilters.find_row_value !== "" && detailDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = detailDataResult.data.findIndex(
          (item) => idGetter(item) === detailfilters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setDetailFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (detailfilters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [detailDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (detailfilters2.find_row_value !== "" && detailDataResult2.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = detailDataResult2.data.findIndex(
          (item) => idGetter(item) === detailfilters2.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setDetailFilters2((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (detailfilters2.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [detailDataResult2]);

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
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
      }));
    }
  };
  const onDetailScrollHandler = (event: GridEvent) => {
    if (detailfilters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      detailfilters.pgNum +
      (detailfilters.scrollDirrection === "up" ? detailfilters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setDetailFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      detailfilters.pgNum -
      (detailfilters.scrollDirrection === "down" ? detailfilters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setDetailFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onDetailScrollHandler2 = (event: GridEvent) => {
    if (detailfilters2.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      detailfilters2.pgNum +
      (detailfilters2.scrollDirrection === "up" ? detailfilters2.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setDetailFilters2((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      detailfilters2.pgNum -
      (detailfilters2.scrollDirrection === "down" ? detailfilters2.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setDetailFilters2((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
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
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

    //그리드 푸터
    const detailTotalFooterCell = (props: GridFooterCellProps) => {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          총 {detailDataResult.total}건
        </td>
      );
    };
      //그리드 푸터
  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult2.total}건
      </td>
    );
  };
  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };
  const onDetailItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      let index = 0;
      mainDataResult.data.forEach((item, num) => {
        if (item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]) {
          index = num;
        }
      });

      setEditIndex(index);
      if (field) setEditedField(field);
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit2 = (dataItem: any, field: string) => {
    const newData = detailDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : {
            ...item,
            [EDIT_FIELD]: undefined,
          }
    );

    setDetailDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit2 = () => {
    const newData = detailDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setDetailDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onAddClick = async () => {
    const data = detailDataResult.data.filter((item: any) => item.chk == true);
    const data2 = detailDataResult2.data.filter(
      (item: any) => item.chk == true
    );
    let valid = true;
    let valid2 = true;
    data.map((item) => {
      if(item.proccd == "") {
        valid = false;
      }
      data.map((item2) => {
        if(item.procseq == item2.procseq && item.num != item2.num) {
          valid2 = false;
        }
      })
    })

    if (data.length == 0) {
      alert("생산계획상세를 선택해주세요.");
    } else if (data2.length == 0) {
      alert("작업지시를 선택해주세요.");
    } else if(valid != true) {
      alert("공정을 입력해주세요.")
    } else if(valid2 != true) {
      alert("공정 순서가 중복됩니다.")
    } else {
      let dataArr: TdataArr = {
        planno_s: [],
        chkyn_s: [],
        plankey_s: [],
        prodmac_s: [],
        prodemp_s: [],
        gokey_s: [],
        qty_s: [],
        godt_s: [],
      };
      data.forEach((item: any, idx: number) => {
        const { plankey = "", prodmac = "", prodemp = "", godt = "" } = item;

        dataArr.chkyn_s.push("Y");
        dataArr.plankey_s.push(plankey);
        dataArr.prodmac_s.push(prodmac);
        dataArr.prodemp_s.push(prodemp);
        dataArr.godt_s.push(godt);
      });
      data2.forEach((item: any, idx: number) => {
        const { gonum = "" } = item;

        if (dataArr.gokey_s.includes(gonum) == false) {
          dataArr.gokey_s.push(gonum);
        }
      });

      const para: Iparameters = {
        procedureName: "P_PR_A7000W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "ADD",
          "@p_orgdiv": "01",
          "@p_location": "01",
          "@p_planno_s": dataArr.planno_s.join("|"),
          "@p_chkyn_s": dataArr.chkyn_s.join("|"),
          "@p_plankey_s": dataArr.plankey_s.join("|"),
          "@p_prodmac_s": dataArr.prodmac_s.join("|"),
          "@p_prodemp_s": dataArr.prodemp_s.join("|"),
          "@p_gokey_s": dataArr.gokey_s.join("|"),
          "@p_qty_s": dataArr.qty_s.join("|"),
          "@p_godt_s": dataArr.godt_s.join("|"),
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "PR_A7000W",
        },
      };

      let datas: any;

      try {
        datas = await processApi<any>("procedure", para);
      } catch (error) {
        datas = null;
      }
      console.log(datas);
      if (datas.isSuccess !== true) {
        console.log("[오류 발생]");
        console.log(datas);
        alert(datas.resultMessage);
      }
      resetAllGrid();
    }
  };
  
  const questionToDelete = useSysMessage("QuestionToDelete");

  const onRemoveClick = async () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    const dataItem = detailDataResult2.data.filter((item: any, index: number) => {
      return (
        item.chk == true
      );
    });
    console.log(dataItem)
    if (dataItem.length === 0) return false;
    type TRowsArr = {
      gokey_s: string[];
    };

    let rowsArr: TRowsArr = {
      gokey_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        gokey = "",
      } = item;

      rowsArr.gokey_s.push(gokey);
    });

    const para: Iparameters = {
      procedureName: "P_PR_A7000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "D",
        "@p_orgdiv": "01",
        "@p_location": "01",
        "@p_planno_s": "",
        "@p_chkyn_s": "",
        "@p_plankey_s": "",
        "@p_prodmac_s": "",
        "@p_prodemp_s": "",
        "@p_gokey_s": rowsArr.gokey_s.join("|"),
        "@p_qty_s": "",
        "@p_godt_s": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A7000W",
      },
    };
    let datas: any;

      try {
        datas = await processApi<any>("procedure", para);
      } catch (error) {
        datas = null;
      }

      if (datas.isSuccess !== true) {
        console.log("[오류 발생]");
        console.log(datas);
        alert(datas.resultMessage);
      }
      resetAllGrid();
  };

  const onSaveClick = async () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0 && deletedRows.length === 0) return false;

   

  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      deletedRows = []; //초기화
      search();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const userId = UseGetValueFromSessionItem("user_id");

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    rowstatus_s: "",
    orgdiv: sessionItem.find((sessionItem) => sessionItem.code === "orgdiv")
      ?.value,
    yyyymm_s: "",
    itemcd_s: "",
    proccd_s: "",
    lotnum_s: "",
    location_s: "",
    qty_s: "",
    totwgt_s: "",
    pgmdiv_s: "",
    userid: userId,
    pc: pc,
    form_id: pathname,
  });

  const paraSaved: Iparameters = {
    procedureName: "P_PR_A9100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_orgdiv": paraData.orgdiv,
      "@p_yyyymm_s": paraData.yyyymm_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_lotnum_s": paraData.lotnum_s,
      "@p_location_s": paraData.location_s,
      "@p_qty_s": paraData.qty_s,
      "@p_totwgt_s": paraData.totwgt_s,
      "@p_pgmdiv_s": paraData.pgmdiv_s,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_form_id": paraData.form_id,
    },
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
  }, [paraData]);

  const search = () => {
    resetAllGrid();
  };
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [editedRowData, setEditedRowData] = useState<any>({});

  const ItemBtnCell = (props: GridCellProps) => {
    const { dataIndex } = props;

    const onRowItemWndClick = () => {
      setEditIndex(dataIndex);
      setEditedRowData(props.dataItem);
      setItemWindowVisible(true);
    };

    return (
      <td className="k-command-cell required">
        <Button
          type={"button"}
          className="k-grid-save-command"
          onClick={onRowItemWndClick}
          icon="more-horizontal"
          //disabled={isInEdit ? false : true}
        />
      </td>
    );
  };
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  interface ICustData {
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
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    resetAllGrid();
    if (e.selected === 0) {
      fetchMainGrid();
    } else {
      // fetchPlanGrid();
    }
    setTabSelected(e.selected);
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = detailDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const [values3, setValues3] = React.useState<boolean>(false);
  const CustomCheckBoxCell3 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = detailDataResult2.data.map((item) => ({
        ...item,
        chk: !values3,
        [EDIT_FIELD]: props.field,
      }));
      setValues3(!values3);
      setDetailDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values3} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const CustomCheckBoxCell = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;
    if (props.rowType === "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = detailDataResult2.data.map((item) =>
        item.num == dataItem.num
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              chk: typeof item.chk == "boolean" ? !item.chk : false,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setDetailDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <td
        style={{ textAlign: "center" }}
        // aria-colindex={ariaColumnIndex}
        // data-grid-col-index={columnIndex}
      >
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const onDetailItemChange2 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detailDataResult2,
      setDetailDataResult2,
      DATA_ITEM_KEY
    );
  };

  const getGridItemChangedData = (
    event: GridItemChangeEvent,
    dataResult: any,
    setDataResult: any,
    DATA_ITEM_KEY: string
  ) => {
    let field = event.field || "";
    event.dataItem[field] = event.value;
    let newData = dataResult.data.map((item: any) => {
      if (item[DATA_ITEM_KEY] === event.dataItem[DATA_ITEM_KEY]) {
        item[field] = event.value;
      }

      return item;
    });

    if (event.value)
      newData = newData.map((item: any) => {
        const result =
          item.inEdit &&
          typeof event.value === "object" &&
          !Array.isArray(event.value) &&
          event.value !== null
            ? {
                ...item,
                [field]: item[field].sub_code ?? "",
              }
            : item;

        return result;
      });

    //return newData;

    setDataResult((prev: any) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const enterEdit3 = (dataItem: any, field: string) => {
    let valid = true;
    if (
      field == "chk" ||
      field == "proccd" ||
      field == "prodemp" ||
      field == "prodmac" ||
      field == "qty"
    ) {
      const newData = detailDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              chk: typeof item.chk == "boolean" ? item.chk : false,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setDetailDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    const newData = detailDataResult2.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setDetailDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const customCellRender3 = (td: any, props: any) => (
    <CellRender2
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender3 = (tr: any, props: any) => (
    <RowRender2
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );

  const onExpandChange = (event: GridExpandChangeEvent) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;

    setDetailDataResult2({ ...detailDataResult2 });
  };

  return (
    <>
      <TitleContainer>
        <Title>작업지시</Title>

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
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="작업지시">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>계획일자</th>
                  <td colSpan={3}>
                    <div className="filter-item-wrap">
                      <DatePicker
                        name="frdt"
                        value={filters.frdt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                        placeholder=""
                        className="required"
                      />
                      ~
                      <DatePicker
                        name="todt"
                        value={filters.todt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                        placeholder=""
                        className="required"
                      />
                    </div>
                  </td>
                  <th>업체코드</th>
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
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>생산계획번호</th>
                  <td>
                    <Input
                      name="planno"
                      type="text"
                      value={filters.planno}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>지시여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="finyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>공사명</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
                      onChange={filterInputChange}
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
                  <th>수주번호</th>
                  <td>
                    <Input
                      name="ordnum"
                      type="text"
                      value={filters.ordnum}
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
          <GridContainerWrap>
            <GridContainer width={`60%`}>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle>생산계획기본</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "35vh" }}
                  data={process(
                    mainDataResult.data.map((row, num) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
                  onSelectionChange={onMainSelectionChange}
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
                  //incell 수정 기능
                  onItemChange={onMainItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    cell={CheckBoxCell}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"].map(
                      (item: any, num: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={num}
                            field={item.fieldName}
                            title={item.caption === "" ? " " : item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : DateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(40% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>생산계획상세</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="plus"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "35vh" }}
                data={process(
                  detailDataResult.data.map((row, num) => ({
                    ...row,
                    [SELECTED_FIELD]: detailselectedState[idGetter(row)], //선택된 데이터
                  })),
                  detailDataState
                )}
                {...detailDataState}
                onDataStateChange={onDetailDataStateChange}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetailSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detailDataResult.total}
                onScroll={onDetailScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onDetailSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                //incell 수정 기능
                onItemChange={onDetailItemChange}
                cellRender={customCellRender2}
                rowRender={customRowRender2}
                editField={EDIT_FIELD}
              >
                <GridColumn
                  field="rowstatus"
                  title=" "
                  width="40px"
                  editable={false}
                />
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell2}
                  cell={CheckBoxCell}
                />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList2"].map(
                    (item: any, num: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={num}
                          field={item.fieldName}
                          title={item.caption === "" ? " " : item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : DateField.includes(item.fieldName)
                              ? DateCell
                              : customField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : undefined
                          }
                          headerCell={
                            customHeaderField.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? detailTotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </GridContainerWrap>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>작업지시</GridTitle>
              <ButtonContainer>
                  <Button
                    onClick={onRemoveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                  ></Button>
                </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "30vh" }}
              data={process(
                detailDataResult2.data.map((row, num) => ({
                  ...row,
                  qtyunit: qtyunitListData.find(
                    (items: any) => items.sub_code === row.qtyunit
                  )?.code_name,
                  [SELECTED_FIELD]: detailselectedState2[idGetter(row)], //선택된 데이터
                })),
                detailDataState2
              )}
              {...detailDataState2}
              onDataStateChange={onDetailDataStateChange2}
              //선택 기능
              dataItemKey={DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onDetailSelectionChange2}
              //스크롤 조회 기능
              fixedScroll={true}
              total={detailDataResult2.total}
              onScroll={onDetailScrollHandler2}
              //정렬기능
              sortable={true}
              onSortChange={onDetailSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              //그룹기능
              groupable={true}
              onExpandChange={onExpandChange}
              expandField="expanded"
              onItemChange={onDetailItemChange2}
              cellRender={customCellRender3}
              rowRender={customRowRender3}
              editField={EDIT_FIELD}
            >
              <GridColumn
                field="rowstatus"
                title=" "
                width="40px"
                editable={false}
              />
              <GridColumn
                field="chk"
                title=" "
                width="45px"
                headerCell={CustomCheckBoxCell3}
                cell={CustomCheckBoxCell}
              />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList3"].map(
                  (item: any, num: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={num}
                        field={item.fieldName}
                        title={item.caption === "" ? " " : item.caption}
                        width={item.width}
                        cell={
                          numberField.includes(item.fieldName)
                            ? NumberCell
                            : DateField.includes(item.fieldName)
                            ? DateCell
                            : customField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0 ? detailTotalFooterCell2 : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={editIndex === undefined ? "FILTER" : "ROW_ADD"}
          setData={setItemData}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
        />
      )}

      {/* 컨트롤 네임 불러오기 용 */}
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

export default PR_A7000W;
