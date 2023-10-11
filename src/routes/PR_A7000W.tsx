import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
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
  findMessage,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import TopButtons from "../components/Buttons/TopButtons";
import { gridList } from "../store/columns/PR_A7000W_C";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { IItemData } from "../hooks/interfaces";
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
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
let deletedRows: any[] = [];

const numberField = [
  "qty",
  "plqty",
  "reqty",
  "procseq",
  "jisiqty",
  "goodqty",
  "badqty",
  "tot_jisiqty",
  "planqty",
  "prodqty",
];
const DateField = ["plandt", "finexpdt", "godt"];
const customField = ["proccd", "prodmac", "prodemp"];
const customHeaderField = ["proccd", "procseq" , "reqty"];
const checkField = ["finyn"];
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
type TdataArr2 = {
  rowstatus_s: string[];
  gonum_s: string[];
  goseq_s: string[];
  location_s: string[];
  godt_s: string[];
  prodmac_s: string[];
  prodemp_s: string[];
  qty_s: string[];
  planno_s: string[];
  planseq_s: string[];
  ordnum_s: string[];
  ordseq_s: string[];
  remark_s: string[];
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
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        proccd: defaultOption.find((item: any) => item.id === "proccd")
          .valueCode,
        prodmac: defaultOption.find((item: any) => item.id === "prodmac")
          .valueCode,
        prodemp: defaultOption.find((item: any) => item.id === "prodemp")
          .valueCode,
        finyn: defaultOption.find((item: any) => item.id === "finyn").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_fxcode, L_sysUserMaster_001, L_BA015,L_PR010,L_BA002",
    setBizComponentData
  );

  const [prodmacListData, setProdmacListData] = React.useState([
    { fxcode: "", fxfull: "" },
  ]);
  const [prodempListData, setProdempListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);
  const [qtyunitListData, setQtyunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const prodmacQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_fxcode")
      );
      const prodempQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      fetchQuery(prodmacQueryStr, setProdmacListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(prodempQueryStr, setProdempListData);
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(locationQueryStr, setLocationListData);
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
  const [mainDataState2, setMainDataState2] = useState<State>({
    group: [
      {
        field: "group_category_name",
      },
    ],
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
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
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
  const [selectedState2, setSelectedState2] = useState<{
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
    plankey: "",
    ordkey: "",
    gokey: "",
    custcd: "",
    custnm: "",
    project: "",
    proccd: "",
    prodmac: "",
    prodemp: "",
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
  const parameters2: Iparameters = {
    procedureName: "P_PR_A7000W_LIST_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code === "orgdiv"
      )?.value,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_proccd": filters.proccd,
      "@p_prodmac": filters.prodmac,
      "@p_prodemp": filters.prodemp,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_ordkey": filters.ordkey,
      "@p_plankey": filters.plankey,
      "@p_gokey": filters.gokey,
      "@p_finyn": filters.finyn,
      "@p_gonum_s": "",
      "@p_goseq_s": "",
      "@p_dwgno": "",
      "@p_project": filters.project,
      "@p_bnatur": "",
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
      if (tabSelected == 0) {
        data = await processApi<any>("procedure", parameters);
      } else {
        data = await processApi<any>("procedure", parameters2);
      }
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      if (tabSelected == 0) {
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows.map((row: any, num: number) => ({
          ...row,
        }));

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
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows.map((row: any, num: number) => ({
          ...row,
          groupId: row.gonum + "gonum",
          group_category_name: "작업지시번호" + " : " + row.gonum,
        }));

        if (totalRowCnt > 0) {
          setMainDataResult2((prev) => {
            return {
              data: [...prev.data, ...rows],
              total: totalRowCnt == -1 ? 0 : totalRowCnt,
            };
          });
          if (filters.find_row_value === "" && filters.pgNum === 1) {
            // 첫번째 행 선택하기
            const firstRowData = rows[0];
            setSelectedState2({ [firstRowData[DATA_ITEM_KEY]]: true });
          }
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

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
        godt: row.godt == "" ? convertDateToStr(new Date()) : row.godt,
        reqty : 0,
        chk: false,
      }));

      if (totalRowCnt > 0) {
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
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
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
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
    setMainDataResult2(process([], mainDataState2));
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      find_row_value: "",
    }));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    if (tabSelected == 0) {
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
    } else {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState2,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState2(newSelectedState);
      const selectedIdx = event.startRowIndex;
      const selectedRowData = event.dataItems[selectedIdx];
    }
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
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult2.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult2.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult2]);

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
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setDetailFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (detailfilters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
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
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setDetailFilters2((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (detailfilters2.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
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
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult2.total}건
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
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
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

    let valid = true;
    let valid2 = true;
    data.map((item) => {
      if (item.proccd == "") {
        valid = false;
      }
      data.map((item2) => {
        if (item.procseq == item2.procseq && item.num != item2.num) {
          valid2 = false;
        }
      });
    });

    if (data.length == 0) {
      alert("생산계획상세를 선택해주세요.");
    } else if (valid != true) {
      alert("공정을 입력해주세요.");
    } else if (valid2 != true) {
      alert("공정 순서가 중복됩니다.");
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
        const {
          plankey = "",
          prodmac = "",
          prodemp = "",
          godt = "",
          reqty = "",
        } = item;

        dataArr.chkyn_s.push("Y");
        dataArr.plankey_s.push(plankey);
        dataArr.prodmac_s.push(prodmac);
        dataArr.prodemp_s.push(prodemp);
        dataArr.godt_s.push(godt);
        dataArr.qty_s.push(reqty);
      });
      const datas2 = mainDataResult.data.filter(
        (item) =>
          item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
      )[0];
      dataArr.gokey_s.push(datas2.gokey);
      dataArr.planno_s.push(datas2.planno);

      const para: Iparameters = {
        procedureName: "P_PR_A7000W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "N",
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
    const dataItem = detailDataResult2.data.filter(
      (item: any, index: number) => {
        return item.chk == true;
      }
    );

    if (dataItem.length === 0) return false;
    type TRowsArr = {
      gokey_s: string[];
    };

    let rowsArr: TRowsArr = {
      gokey_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { gokey = "" } = item;

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
    const dataItem = detailDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0) return false;

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
    dataItem.forEach((item: any, idx: number) => {
      const {
        gokey = "",
        qty = "",
        godt = "",
        prodmac = "",
        prodemp = "",
      } = item;

      dataArr.gokey_s.push(gokey);
      dataArr.qty_s.push(qty);
      dataArr.godt_s.push(godt);
      dataArr.prodmac_s.push(prodmac);
      dataArr.prodemp_s.push(prodemp);
    });

    const para: Iparameters = {
      procedureName: "P_PR_A7000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "U",
        "@p_orgdiv": "01",
        "@p_location": "01",
        "@p_planno_s": "",
        "@p_chkyn_s": "",
        "@p_plankey_s": "",
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

    if (datas.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(datas);
      alert(datas.resultMessage);
    }
    resetAllGrid();
  };

  const onCompleteClick = async () => {
    const data = mainDataResult2.data.filter((item: any) => item.chk == true);

    if (data.length == 0) {
      alert("작업지시내역을 선택해주세요.");
    } else {
      let dataArr: TdataArr2 = {
        rowstatus_s: [],
        gonum_s: [],
        goseq_s: [],
        location_s: [],
        godt_s: [],
        prodmac_s: [],
        prodemp_s: [],
        qty_s: [],
        planno_s: [],
        planseq_s: [],
        ordnum_s: [],
        ordseq_s: [],
        remark_s: [],
      };

      data.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          gonum = "",
          goseq = "",
          location = "",
          godt = "",
          prodmac = "",
          prodemp = "",
          jisiqty = "",
          planno = "",
          planseq = "",
          ordnum = "",
          ordseq = "",
          remark = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.gonum_s.push(gonum);
        dataArr.goseq_s.push(goseq);
        dataArr.location_s.push(location);
        dataArr.godt_s.push(godt);
        dataArr.prodmac_s.push(prodmac);
        dataArr.prodemp_s.push(prodemp);
        dataArr.qty_s.push(jisiqty);
        dataArr.planno_s.push(planno);
        dataArr.planseq_s.push(planseq);
        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq);
        dataArr.remark_s.push(remark);
      });

      const para: Iparameters = {
        procedureName: "P_PR_A7000W_LIST_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "FINYN",
          "@p_orgdiv": "01",
          "@p_rowstatus_s": dataArr.rowstatus_s.join("|"),
          "@p_gonum_s": dataArr.gonum_s.join("|"),
          "@p_goseq_s": dataArr.goseq_s.join("|"),
          "@p_location_s": dataArr.location_s.join("|"),
          "@p_godt_s": dataArr.godt_s.join("|"),
          "@p_prodmac_s": dataArr.prodmac_s.join("|"),
          "@p_prodemp_s": dataArr.prodemp_s.join("|"),
          "@p_qty_s": dataArr.qty_s.join("|"),
          "@p_planno_s": dataArr.planno_s.join("|"),
          "@p_planseq_s": dataArr.planseq_s.join("|"),
          "@p_ordnum_s": dataArr.ordnum_s.join("|"),
          "@p_ordseq_s": dataArr.ordseq_s.join("|"),
          "@p_remark_s": dataArr.remark_s.join("|"),
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
    }
  };

  const userId = UseGetValueFromSessionItem("user_id");

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A7000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A7000W_001");
      } else {
        resetAllGrid();
      }
    } catch (e) {
      alert(e);
    }


  };
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

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
    setTabSelected(e.selected);
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = detailDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
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
        rowstatus: item.rowstatus === "N" ? "N" : "U",
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

  const [values4, setValues4] = React.useState<boolean>(false);
  const CustomCheckBoxCell4 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !values4,
        [EDIT_FIELD]: props.field,
      }));
      setValues4(!values4);
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values4} onClick={changeCheck}></Checkbox>
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
              chk:
                typeof item.chk == "boolean"
                  ? !item.chk
                  : item.chk == "Y"
                  ? false
                  : true,
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
      <td style={{ textAlign: "center" }}>
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const CustomCheckBoxCell5 = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;

    if (props.rowType === "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = mainDataResult2.data.map((item) =>
        item.num == dataItem.num
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? !item.chk
                  : item.chk == "Y"
                  ? false
                  : true,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <td style={{ textAlign: "center" }}>
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const CustomCheckBoxCell6 = (props: GridCellProps) => {
    if (props.rowType === "groupHeader") {
      return null;
    }

    return <CheckBoxReadOnlyCell {...props}></CheckBoxReadOnlyCell>;
  };

  const onDetailItemChange2 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detailDataResult2,
      setDetailDataResult2,
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
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
      field == "qty" ||
      field == "prodemp" ||
      field == "prodmac"
    ) {
      const newData = detailDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
               chk: typeof item.chk == "boolean" ? !item.chk : item.chk =="Y" ? false : true,
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

  const customCellRender4 = (td: any, props: any) => (
    <CellRender2
      originalProps={props}
      td={td}
      enterEdit={enterEdit4}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender4 = (tr: any, props: any) => (
    <RowRender2
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit4}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit4 = (dataItem: any, field: string) => {
    let valid = true;
    if (field == "chk") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
               chk: typeof item.chk == "boolean" ? !item.chk : item.chk =="Y" ? false : true,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit4 = () => {
    const newData = mainDataResult2.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setMainDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onExpandChange = (event: GridExpandChangeEvent) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;

    setDetailDataResult2({ ...detailDataResult2 });
  };
  const onExpandChange2 = (event: GridExpandChangeEvent) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;

    setMainDataResult2({ ...mainDataResult2 });
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
                  <td colSpan={3}>
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
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "31.8vh" }}
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
                  title="삭제"
                ></Button>
                <Button
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "26vh" }}
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
                          item.sortOrder === 0
                            ? detailTotalFooterCell2
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="작업지시내역">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>지시일자</th>
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
                  <th>수주번호</th>
                  <td>
                    <Input
                      name="ordkey"
                      type="text"
                      value={filters.ordkey}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>설비</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="prodmac"
                        value={filters.prodmac}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="fxfull"
                        valueField="fxcode"
                      />
                    )}
                  </td>
                  <th>작업지시번호</th>
                  <td>
                    <Input
                      name="gokey"
                      type="text"
                      value={filters.gokey}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
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
                  <th>공사명</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
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
                  <th>완료여부</th>
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
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>작업지시내역</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onCompleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  강제완료
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "61vh" }}
              data={process(
                mainDataResult2.data.map((row, num) => ({
                  ...row,
                  prodmac: prodmacListData.find(
                    (items: any) => items.fxcode === row.prodmac
                  )?.fxfull,
                  prodemp: prodempListData.find(
                    (items: any) => items.user_id === row.prodemp
                  )?.user_name,
                  proccd: proccdListData.find(
                    (items: any) => items.sub_code === row.proccd
                  )?.code_name,
                  location: locationListData.find(
                    (items: any) => items.sub_code === row.location
                  )?.code_name,
                  [SELECTED_FIELD]: selectedState2[idGetter(row)], //선택된 데이터
                })),
                mainDataState2
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
              onSelectionChange={onMainSelectionChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={mainDataResult2.total}
              onScroll={onMainScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              //그룹기능
              groupable={true}
              onExpandChange={onExpandChange2}
              expandField="expanded"
              onItemChange={onMainItemChange2}
              cellRender={customCellRender4}
              rowRender={customRowRender4}
              editField={EDIT_FIELD}
            >
              <GridColumn
                field="chk"
                title=" "
                width="45px"
                headerCell={CustomCheckBoxCell4}
                cell={CustomCheckBoxCell5}
              />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList4"].map(
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
                            : checkField.includes(item.fieldName)
                            ? CustomCheckBoxCell6
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

export default PR_A7000W;
