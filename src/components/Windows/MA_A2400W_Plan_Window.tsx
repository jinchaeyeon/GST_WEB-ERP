import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
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
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading, loginResultState } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  convertDateToStr,
  dateformat,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  isValidDate,
  setDefaultDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import FilterContainer from "../Containers/FilterContainer";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import ItemsWindow from "./CommonWindows/ItemsWindow";
type IWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};

const topHeight = 140.13;
const bottomHeight = 55;
const leftOverHeight = (topHeight + bottomHeight) / 2;
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let temp = 0;
const CopyWindow = ({
  setVisible,
  setData,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 900,
  });
  const DATA_ITEM_KEY = "num";
  const DATA_ITEM_KEY2 = "num";
  const DATA_ITEM_KEY3 = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const setLoading = useSetRecoilState(isLoading);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

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
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        proccd: defaultOption.find((item: any) => item.id == "proccd")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA005,L_BA029, L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_YESNOALL,L_sysUserMaster_001,L_PR010",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA015")
      );
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA005")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA029")
      );

      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_PR010")
      );

      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(personQueryStr, setPersonListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
      fetchQuery(taxdivQueryStr, setTaxdivListData);
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
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [subselectedState, setSubSelectedState] = useState<{
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
  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    setVisible(false);
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

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const processApi = useApi();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    insiz: "",
    dwgno: "",
    planno: "",
    planseq: 0,
    proccd: "",
    ordnum: "",
    finyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    planno: "",
    planseq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage2(initialPageState);

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

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult]);

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (detailFilters.isSearch) {
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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_A2400W_Sub1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": "01",
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_dwgno": filters.dwgno,
        "@p_planno": filters.planno,
        "@p_planseq": filters.planseq,
        "@p_proccd": filters.proccd,
        "@p_ordnum": filters.ordnum,
        "@p_finyn": filters.finyn,
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
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          rowstatus: "N",
          qty: row.qty == null ? 1 : row.qty,
          qtyunit: row.qtyunit == null ? "001" : row.qtyunit,
          unitwgt: row.unitwgt == null ? 0 : row.unitwgt,
          wgt: row.wgt == null ? 0 : row.wgt,
          wgtunit: row.wgtunit == null ? "" : row.wgtunit,
          unpcalmeth: row.unpcalmeth == null ? "Q" : row.unpcalmeth,
          amt: row.amt == null ? 0 : row.amt,
          unp: row.unp == null ? 0 : row.unp,
          wonamt: row.wonamt == null ? 0 : row.wonamt,
          taxamt: row.taxamt == null ? 0 : row.taxamt,
          totamt: row.totamt == null ? 0 : row.totamt,
          jangqty: row.jangqty == null ? 0 : row.jangqty,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        setDetailFilters((prev) => ({
          ...prev,
          planno: selectedRow.planno,
          planseq: selectedRow.planseq,
          isSearch: true,
          pgNum: 1,
        }));
      }
    } else {
      console.log(data);
    }
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
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const detailParameters: Iparameters = {
      procedureName: "P_MA_A2400W_Sub1_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "PRLIST",
        "@p_orgdiv": "01",
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_dwgno": filters.dwgno,
        "@p_planno": detailFilters.planno,
        "@p_planseq": detailFilters.planseq,
        "@p_proccd": filters.proccd,
        "@p_ordnum": filters.ordnum,
        "@p_finyn": filters.finyn,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setDetailSelectedState({ [selectedRow[DATA_ITEM_KEY2]]: true });
      }
    } else {
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

    setDetailFilters((prev) => ({
      ...prev,
      planno: selectedRowData.planno,
      planseq: selectedRowData.planseq,
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

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: subselectedState,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSubSelectedState(newSelectedState);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult.total == -1
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    setData(subDataResult.data);
    onClose();
  };

  const onRowDoubleClick = () => {
    subDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const selectRow = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (selectRow != undefined) {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        chk: selectRow.chk,
        doqty: selectRow.doqty,
        dwgno: selectRow.dwgno,
        insiz: selectRow.insiz,
        itemcd: selectRow.itemcd,
        itemnm: selectRow.itemnm,
        jangqty: selectRow.jangqty,
        ordkey: selectRow.ordkey,
        ordnum: selectRow.ordnum,
        ordseq: selectRow.ordseq,
        orgdiv: "01",
        plandt: selectRow.plandt,
        plankey: selectRow.plankey,
        planno: selectRow.planno,
        planqty: selectRow.planqty,
        planseq: selectRow.planseq,
        proccd: selectRow.proccd,
        procseq: selectRow.procseq,
        purqty: selectRow.purqty,
        rowstatus: "N",
        remark: selectRow.remark,
        qty: selectRow.qty,
        qtyunit: selectRow.qtyunit,
        unitwgt: selectRow.unitwgt,
        wgt: selectRow.wgt,
        wgtunit: selectRow.wgtunit,
        unpcalmeth: selectRow.unpcalmeth,
        amt: selectRow.amt,
        unp: selectRow.unp,
        wonamt: selectRow.wonamt,
        taxamt: selectRow.taxamt,
        totamt: selectRow.totamt,
      };
      setSubDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setSubSelectedState({ [newDataItem[DATA_ITEM_KEY3]]: true });
    }
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    subDataResult.data.forEach((item: any, index: number) => {
      if (!subselectedState[item[DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = subDataResult.data[Math.min(...Object2)];
    } else {
      data = subDataResult.data[Math.min(...Object) - 1];
    }
    setSubDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSubSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
    });
  };

  return (
    <>
      <Window
        title={"계획참조"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <TitleContainer style={{ float: "right" }}>
          <ButtonContainer>
            <Button
              onClick={() => search()}
              icon="search"
              themeColor={"primary"}
            >
              조회
            </Button>
          </ButtonContainer>
        </TitleContainer>
        <FilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th>입고일자</th>
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
                <th>규격</th>
                <td>
                  <Input
                    name="insiz"
                    type="text"
                    value={filters.insiz}
                    onChange={filterInputChange}
                  />
                </td>
                <th>계획번호</th>
                <td>
                  <Input
                    name="planno"
                    type="text"
                    value={filters.planno}
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
                <th>도면번호</th>
                <td>
                  <Input
                    name="dwgno"
                    type="text"
                    value={filters.dwgno}
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
              </tr>
            </tbody>
          </FilterBox>
        </FilterContainer>
        <GridContainer height={`calc(50% - ${leftOverHeight}px)`}>
          <GridContainerWrap height={"85%"}>
            <GridContainer width={`65%`}>
              <GridTitleContainer>
                <GridTitle>상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onRowDoubleClick}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "calc(100% - 5px)" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    person: personListData.find(
                      (item: any) => item.user_id == row.person
                    )?.user_name,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.qtyunit
                    )?.code_name,
                    proccd: proccdListData.find(
                      (item: any) => item.sub_code == row.proccd
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)],
                  })),
                  mainDataState
                )}
                onDataStateChange={onMainDataStateChange}
                {...mainDataState}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange}
                //스크롤 조회기능
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
                <GridColumn
                  field="plandt"
                  title="계획일자"
                  cell={DateCell}
                  width="100px"
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn field="proccd" title="공정" width="150px" />
                <GridColumn
                  field="procseq"
                  title="공정순서"
                  width="100px"
                  cell={NumberCell}
                />
                <GridColumn field="itemcd" title="품목코드" width="200px" />
                <GridColumn field="itemnm" title="품목명" width="200px" />
                <GridColumn field="insiz" title="규격" width="200px" />
                <GridColumn field="dwgno" title="도면번호" width="200px" />
                <GridColumn
                  field="planqty"
                  title="계획수량"
                  width="120px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell}
                />
                <GridColumn
                  field="purqty"
                  title="발주량"
                  width="120px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell}
                />
                <GridColumn
                  field="janqty"
                  title="잔량"
                  width="120px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell}
                />
                <GridColumn
                  field="doqty"
                  title="처리량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="remark" title="비고" width="300px" />
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(35% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>공정그리드</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "calc(100% - 5px)" }}
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.qtyunit
                    )?.code_name,
                    itemacnt: itemacntListData.find(
                      (item: any) => item.sub_code == row.itemacnt
                    )?.code_name,
                    proccd: proccdListData.find(
                      (item: any) => item.sub_code == row.proccd
                    )?.code_name,
                    [SELECTED_FIELD]: detailselectedState[idGetter2(row)], //선택된 데이터
                  })),
                  detailDataState
                )}
                onDataStateChange={onDetailDataStateChange}
                {...detailDataState}
                //선택 subDataState
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetailSelectionChange}
                //스크롤 조회기능
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
                //더블클릭
              >
                <GridColumn
                  field="proccd"
                  title="공정"
                  width="150px"
                  footerCell={detailTotalFooterCell}
                />
                <GridColumn
                  field="procseq"
                  title="공정순서"
                  width="100px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="procqty"
                  title="양품수량"
                  width="100px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell2}
                />
                <GridColumn
                  field="badqty"
                  title="불량수량"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell2}
                  width="100px"
                />
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </GridContainer>
        <GridContainer height={`calc(50% - ${leftOverHeight}px)`}>
          <GridTitleContainer>
            <GridTitleContainer>
              <GridTitle>Keeping</GridTitle>
            </GridTitleContainer>
            <ButtonContainer>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                title="행 삭제"
                icon="minus"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "calc(100% - 40px)" }}
            data={process(
              subDataResult.data.map((row) => ({
                ...row,
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code == row.qtyunit
                )?.code_name,
                itemacnt: itemacntListData.find(
                  (item: any) => item.sub_code == row.itemacnt
                )?.code_name,
                doexdiv: doexdivListData.find(
                  (item: any) => item.sub_code == row.doexdiv
                )?.code_name,
                taxdiv: taxdivListData.find(
                  (item: any) => item.sub_code == row.taxdiv
                )?.code_name,
                reqdt: isValidDate(row.reqdt)
                  ? new Date(dateformat(row.reqdt))
                  : new Date(),
                proccd: proccdListData.find(
                  (item: any) => item.sub_code == row.proccd
                )?.code_name,
                [SELECTED_FIELD]: subselectedState[idGetter3(row)], //선택된 데이터
              })),
              subDataState
            )}
            onDataStateChange={onSubDataStateChange}
            {...subDataState}
            //선택 subDataState
            dataItemKey={DATA_ITEM_KEY3}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={subDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onSubSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            <GridColumn
              field="proccd"
              title="공정"
              width="150px"
              footerCell={subTotalFooterCell}
            />
            <GridColumn
              field="procseq"
              title="공정순서"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn field="itemcd" title="품목코드" width="200px" />
            <GridColumn field="itemnm" title="품목명" width="200px" />
            <GridColumn field="insiz" title="규격" width="200px" />
            <GridColumn field="dwgno" title="도면번호" width="200px" />
            <GridColumn
              field="doqty"
              title="처리량"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn field="plankey" title="생산계획번호" width="200px" />
            <GridColumn field="ordnum" title="수주번호" width="200px" />
          </Grid>
        </GridContainer>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              확인
            </Button>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
        />
      )}
    </>
  );
};

export default CopyWindow;
