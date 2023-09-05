import * as React from "react";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { 
  BottomContainer, 
  ButtonContainer, 
  GridContainer, 
  GridContainerWrap, 
  GridTitle, 
  GridTitleContainer 
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { 
  Grid, 
  GridCellProps, 
  GridColumn, 
  GridDataStateChangeEvent, 
  GridEvent, 
  GridFooterCellProps, 
  GridHeaderCellProps, 
  GridItemChangeEvent, 
  GridSelectionChangeEvent, 
  GridToolbar, 
  getSelectedState 
} from "@progress/kendo-react-grid";
import { IItemData, IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import { 
  UseBizComponent, 
  UseCustomOption, 
  UseGetValueFromSessionItem, 
  UseMessages, 
  UseParaPc, 
  chkScrollHandler, 
  convertDateToStr, 
  getGridItemChangedData 
} from "../CommonFunction";
import { EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import StockWindow from "../Windows/PR_A4000W_ProdStock_Window";
import CheckBoxCell from "../Cells/CheckBoxCell";
import { Checkbox } from "@progress/kendo-react-inputs";

let temp = 0;
const DATA_ITEM_KEY = "num";
const BAD_DATA_ITEM_KEY = "num";

const idGetter = getter(DATA_ITEM_KEY);
const idGetter1 = getter(BAD_DATA_ITEM_KEY);
let deletedMainRows: object[] = [];
let deletedMainRows1: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_PR300200, L_BA015, L_QC002",
    // 구분, 단위, 불량유형
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal = 
    field === "div"
      ? "L_PR300200"
      : field === "qtyunit"
      ? "L_BA015"
      : field === "badcd" 
      ? "L_QC002"
      : "";

    const fieldName = field === "div"
                        ? "code_name"
                        : undefined;
    const fieldValue = field === "div"
                        ? "code"
                        : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent} 
      textField={fieldName}
      valueField={fieldValue}
      {...props} />
  ) : (
    <td />
  );
};

type TKendoWindow = {
  getVisible(t: boolean): void;
  rekey?: string;
  reloadData(saveyn: string): void;   // 저장 유무
};

type TInData = {
  rowstatus: string[],
  div: string[],
  itemcd: string[],
  itemnm: string[],
  insiz: string[],
  qty: string[],
  qtyunit: string[],
  lotnum: string[],
  remark: string[],
  keyfield: string[],
  proccd: string[],
};

type TBadData = {
  rowstatus: string[],
  keyfield: string[],
  baddt: string[],
  badcd: string[],
  qty: string[],
  remark: string[],
};

const DetailWindow = ({
  getVisible,
  rekey,
  reloadData
}: TKendoWindow) => {
  const setLoading = useSetRecoilState(isLoading);
  const pathname: string = window.location.pathname.replace("/", "");
  const [pc, setPc] = useState("");
  const processApi = useApi();
  const [isInitSearch, setIsInitSearch] = useState(false);
  UseParaPc(setPc);
  const [stockWindowVisible, setStockWindowVisible] = useState<boolean>(false);

  // 메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1400,
    height: 700,
  });

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
    getVisible(false);
  };

  //그리드 데이터 스테이트
  const [inDataState, setInDataState] = useState<State>({
    sort: [],
  });

  const [badDataState, setBadDataState] = useState<State>({
    sort: [],
  });

  const [inDataResult, setInDataResult] = useState<DataResult>(
    process([], inDataState)
  );

  const [badDataResult, setBadDataResult] = useState<DataResult>(
    process([], badDataState)
  );

  //선택 상태
  const [inselectedState, setInSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //선택 상태
  const [badselectedState, setBadSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    rekey: rekey,
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  // 그리드 데이터 조회
  const fetchInGrid = async () => {
    let data: any;
    setLoading(true);
    
  const inparameters: Iparameters = {
    procedureName: "P_PR_A4000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "PRODDETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": "",
      "@p_todt": "",
      "@p_prodemp": "",
      "@p_prodmac": "",
      "@p_itemcd": "",
      "@p_itemnm": "",
      "@p_insiz": "",
      "@p_lotnum": "",
      "@p_rekey": filters.rekey,
      "@p_plankey": "",
      "@p_gokey": "",
      "@p_proccd": "",
      "@p_yyyymm": "",
      "@p_ordnum": "",
      "@p_dptcd": "",
      "@p_location": "",
      "@p_itemacnt": "",
    },
  };

    try {
      data = await processApi<any>("procedure", inparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (totalRowCnt > 0) {
        setInDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  }

  const fetchBadGrid = async () => {
    let data: any;
    setLoading(true);

    const badparameters: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "PRODDETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_lotnum": "",
        "@p_rekey": filters.rekey,
        "@p_plankey": "",
        "@p_gokey": "",
        "@p_proccd": "",
        "@p_yyyymm": "",
        "@p_ordnum": "",
        "@p_dptcd": "",
        "@p_location": "",
        "@p_itemacnt": "",
      },
    };

    try {
      data = await processApi<any>("procedure", badparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[1].Rows;
      if (totalRowCnt > 0) {
        setBadDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

   // 조회 최초 한번만 실행
   useEffect(() => {
    if (
      filters.isSearch
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchInGrid();
      fetchBadGrid();
    }
  }, [filters]);

  const resetAllGrid = () => {
    setBadDataResult(process([], badDataState));
    setInDataResult(process([], inDataState))
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }))
  };

  //스크롤 핸들러
  const onInScrollHandler = (event: GridEvent) => {
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

  const onInDataStateChange = (event: GridDataStateChangeEvent) => {
    setInDataState(event.dataState);
  };

  const onBadDataStateChange = (event: GridDataStateChangeEvent) => {
    setBadDataState(event.dataState);
  };

  const onInSortChange = (e: any) => {
    setInDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onBadSortChange = (e: any) => {
    setBadDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 선택 이벤트
  const onInSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: inselectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setInSelectedState(newSelectedState);
  };

  const onBadSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: badselectedState,
      dataItemKey: BAD_DATA_ITEM_KEY,
    });
    setBadSelectedState(newSelectedState);
  };

  //그리드 데이터 변경 되었을 때
  useEffect(() => {
      if (inDataResult.total > 0 && isInitSearch === false ) {
        const firstRowData = inDataResult.data[0];
        setInSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

        setFilters((prev) => ({
          ...prev,
          rekey: firstRowData.rekey,
        }));

        setIsInitSearch(true);
      }
  }, [inDataResult]);

  useEffect(() => {
    if (badDataResult.total > 0 && isInitSearch === false) {
      const firstRowData = badDataResult.data[0];
      setBadSelectedState({ [firstRowData[BAD_DATA_ITEM_KEY]]: true });

      setFilters((prev) => ({
        ...prev,
        rekey: firstRowData.rekey,
      }));

      setIsInitSearch(true);
    }
  }, [badDataResult]);

  // 그리드 푸터
  const inTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {inDataResult.total}건
      </td>
    );
  };

  const badTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {badDataResult.total}건
      </td>
    );
  };

  const gridsumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    inDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
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

  const gridsumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    badDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
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

  const enterEdit = (dataItem: any, field: string | undefined) => {
    if ( field == "qty" || field == "remark" || field == "baddt" || field == "chk") {
      const newData = inDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              chk: item.chk === "Y",
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setInDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = (item: any) => {
    const newData = inDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setInDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const enterEdit1 = (dataItem: any, field: string | undefined) => {
    const newData = badDataResult.data.map((item) =>
      item[BAD_DATA_ITEM_KEY] === dataItem[BAD_DATA_ITEM_KEY]
        ? {
            ...item,
            chk: item.chk === "Y",
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : { ...item, [EDIT_FIELD]: undefined }
    );

    setBadDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit1 = (item: any) => {
    const newData = badDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setBadDataResult((prev) => {
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

  const customCellRender1 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit1}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender1 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit1}
      editField={EDIT_FIELD}
    />
  );

  const onInItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      inDataResult,
      setInDataResult,
      DATA_ITEM_KEY
    );
  };

  const onBadItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      badDataResult,
      setBadDataResult,
      BAD_DATA_ITEM_KEY
    );
  };

  const onInRemoveClick = async () => {
    let newData: any[] = [];

    //삭제 안 할 데이터 newData에 push
    inDataResult.data.forEach((item: any, index: number) => {
      if (item.chk == false) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });

    setInDataResult((prev) => ({
      ...prev,
      data: newData,
      total: newData.length,
    }));

    setInDataState({});
  };

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = inDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setInDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const [values1, setValues1] = React.useState<boolean>(false);
  const CustomCheckBoxCell1 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = badDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues1(!values1);
      setInDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values1} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const onBadAddClick = () => {
    // 불량내역 행 추가
    badDataResult.data.map((item) => {
      if(item.num > temp) {
        temp = item.num
      }
    })

    const newDataItem = {
      [BAD_DATA_ITEM_KEY]: ++temp,
      baddt: convertDateToStr(new Date()),
      badcd: "",
      qty: 0,
      remark: "",
      rowstatus: "N"
    };

    setBadDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onBadRemoveClick = async () => {
    let newData: any[] = [];

    //삭제 안 할 데이터 newData에 push
    badDataResult.data.forEach((item: any, index: number) => {
      if (item.chk == false) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows1.push(newData2);
      }
    });

    setBadDataResult((prev) => ({
      ...prev,
      data: newData,
      total: newData.length,
    }));

    setBadDataState({});
  };
  
  const userId = UseGetValueFromSessionItem("user_id");

  const onSaveClick = async () => {
    const dataItem = inDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    const dataItem1 = badDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    // 삭제 행 존재할 경우 push
    if (deletedMainRows.length > 0) 
    {
      deletedMainRows.map((row: any) => {
        dataItem.push(row);
      });
    }

    if (deletedMainRows1.length > 0) 
    {
      deletedMainRows1.map((row: any) => {
        dataItem1.push(row);
      });
    }
    
    if (dataItem.length === 0 && dataItem1.length === 0) return false;

    let inArr: TInData = {
      rowstatus: [],
      div: [],
      itemcd: [],
      itemnm: [],
      insiz: [],
      qty: [],
      qtyunit: [],
      lotnum: [],
      remark: [],
      keyfield: [],
      proccd: [],
    };

    let badArr: TBadData = {
      rowstatus: [],
      keyfield: [],
      baddt: [],
      badcd: [],
      qty: [],
      remark: [],
    };

    if (dataItem.length > 0) 
    {
      dataItem.forEach((item: any) => {
        const {
          rowstatus, div, itemcd, itemnm, insiz, qty, qtyunit, lotnum, remark, keyfield, proccd
        } = item;
  
        inArr.rowstatus.push(rowstatus);
        inArr.div.push(div);
        inArr.itemcd.push(itemcd);
        inArr.itemnm.push(itemnm);
        inArr.insiz.push(insiz);
        inArr.qty.push(qty);
        inArr.qtyunit.push(qtyunit);
        inArr.lotnum.push(lotnum);
        inArr.remark.push(remark);
        inArr.keyfield.push(keyfield);
        inArr.proccd.push(proccd);
      });

      // 프로시저 파라미터
      const inparaSaved: Iparameters = {
        procedureName: "P_PR_A4000W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "INITEM",
          "@p_orgdiv": "01",
          "@p_rowstatus": inArr.rowstatus.join("|"),
          "@p_rekey": rekey,
          "@p_location": "01",
          "@p_prodemp": "",
          "@p_prodmac": "",
          "@p_qty": inArr.qty.join("|"),
          "@p_qtyunit": inArr.qtyunit.join("|"),
          "@p_lotnum": inArr.lotnum.join("|"),
          "@p_strtime": "",
          "@p_endtime": "",
          "@p_remark": inArr.remark.join("|"),
          "@p_prodemp1": "",
          "@p_prodemp2": "",
          "@p_keyfield": inArr.keyfield.join("|"),
          "@p_div": inArr.div.join("|"),
          "@p_itemcd": inArr.itemcd.join("|"),
          "@p_proccd": inArr.proccd.join("|"),
          "@p_baddt": "",
          "@p_badcd": "",
          "@p_proddt": "",
          "@p_custdiv": "",
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "PR_A4000W",
        },
      };
      let data: any;
  
      try {
        data = await processApi<any>("procedure", inparaSaved);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess !== true) {
        console.log("[오류 발생]");
        console.log(data);
        alert(data.resultMessage);
      }
    }

    if (dataItem1.length > 0) 
    {
      dataItem1.forEach((item: any) => {
        const { rowstatus, keyfield, baddt, badcd, qty, remark} = item;
        badArr.rowstatus.push(rowstatus);
        badArr.keyfield.push(keyfield);
        badArr.baddt.push(baddt);
        badArr.badcd.push(badcd);
        badArr.qty.push(qty);
        badArr.remark.push(remark);
      });

      // 프로시저 파라미터
      const badparaSaved: Iparameters = {
        procedureName: "P_PR_A4000W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "BAD",
          "@p_orgdiv": "01",
          "@p_rowstatus": badArr.rowstatus.join("|"),
          "@p_rekey": rekey,
          "@p_location": "01",
          "@p_prodemp": "",
          "@p_prodmac": "",
          "@p_qty": badArr.qty.join("|"),
          "@p_qtyunit": "",
          "@p_lotnum": "",
          "@p_strtime": "",
          "@p_endtime": "",
          "@p_remark": badArr.remark.join("|"),
          "@p_prodemp1": "",
          "@p_prodemp2": "",
          "@p_keyfield": badArr.keyfield.join("|"),
          "@p_div": "",
          "@p_itemcd": "",
          "@p_proccd": "",
          "@p_baddt": badArr.baddt.join("|"),
          "@p_badcd": badArr.badcd.join("|"),
          "@p_proddt": "",
          "@p_custdiv": "",
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "PR_A4000W",
        },
      };

      let data: any;
  
      try {
        data = await processApi<any>("procedure", badparaSaved);
      } catch (error) {
        data = null;
      }
  
      if (data.isSuccess !== true) {
        console.log("[오류 발생]");
        console.log(data);
        alert(data.resultMessage);
      }
    }
    
    resetAllGrid();
    deletedMainRows.length = 0;
    reloadData("Y");
  };

  const onStockWndClick = () => {
    setStockWindowVisible(true);
  };

  const setCopyData = (data: IItemData[]) => {
    inDataResult.data.map((item) => {
      if(item.num > temp){
        temp = item.num
      }
    });

    const newData = data.map((item, num) => ({
      ...item,
      num: ++temp,
      rowstatus: "N",
      qty: 0,
      badqty: 0,
    }));

    setInDataResult((prev) => {
      return {
        data: [...newData, ...prev.data],
        total: prev.total + data.length,
      };
    });
  };
  
  return (
    <Window
      title={"상세정보등록"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={true}
    >
      <GridContainerWrap>
        <GridContainer width = {`50%`} >
          <GridTitleContainer>
            <GridTitle>투입이력</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "53vh" }}
            data={process(
              inDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: inselectedState[idGetter(row)],
              })),
              inDataState
            )}
            {...inDataState}
            onDataStateChange={onInDataStateChange}
            // 선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single"
            }}
            onSelectionChange={onInSelectionChange}
            // 스크롤 조회 기능
            fixedScroll={true}
            total={inDataResult.total}
            onScroll={onInScrollHandler}
            // 정렬기능
            sortable={true}
            onSortChange={onInSortChange}
            // 컬럼순서조정
            reorderable={true}
            // 컬럼너비조정
            resizable={true}
            // incell 수정 기능
            onItemChange={onInItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridToolbar>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onInRemoveClick}
                title="행 삭제"
                icon="minus"
              ></Button>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onStockWndClick}
                icon="folder-open"
              >
                재고참조
              </Button>
            </GridToolbar>
            <GridColumn field="rowstatus" title=" " width="40px" />
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell}
              cell={CheckBoxCell}
            />
            <GridColumn 
              field="div" 
              title="구분" 
              width="100px"
              cell={CustomComboBoxCell}
              footerCell={inTotalFooterCell}
            />
            <GridColumn field="itemcd" title="품목코드" width="150px" />
            <GridColumn field="itemnm" title="품목명" width="180px" />
            <GridColumn field="insiz" title="규격" width="150px" />
            <GridColumn 
              field="qty"
              title="사용량"
              width="100px"
              cell={NumberCell}
              footerCell={gridsumQtyFooterCell}
            />
            <GridColumn 
              field="qtyunit" 
              title="단위" 
              width="80px" 
              cell={CustomComboBoxCell}
            />
            <GridColumn field="lotnum" title="LOT NO" width="120px" />
            <GridColumn field="remark" title="비고" width="200px" />
          </Grid>
        </GridContainer>
        <GridContainer width = {`calc(50% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>불량내역</GridTitle>
          </GridTitleContainer>
          <Grid
            style = {{ height: "53vh"}}
            data={process(
              badDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: badselectedState[idGetter1(row)], // 선택된 데이터
              })),
              badDataState
            )}
            onDataStateChange={onBadDataStateChange}
            {...badDataState}
            // 선택 기능
            dataItemKey={BAD_DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onBadSelectionChange}
            // 스크롤 조회기능
            fixedScroll={true}
            total={badDataResult.total}
            onScroll={onInScrollHandler}
            // 정렬기능
            sortable={true}
            onSortChange={onBadSortChange}
            // 컬럼순서조정
            reorderable={true}
            // 컬럼너비조정
            resizable={true}
            // incell 수정 기능
            onItemChange={onBadItemChange}
            cellRender={customCellRender1}
            rowRender={customRowRender1}
            editField={EDIT_FIELD}
          > 
            <GridToolbar>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onBadAddClick}
                title="행 추가"
                icon="plus"
              ></Button>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onBadRemoveClick}
                title="행 삭제"
                icon="minus"
              ></Button>
            </GridToolbar>
            <GridColumn field="rowstatus" title=" " width="40px" />
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell1}
              cell={CheckBoxCell}
            />
            <GridColumn 
              field="baddt" 
              title="불량일자" 
              width="120px"
              cell={DateCell}
              footerCell={badTotalFooterCell}
            />
            <GridColumn 
              field="badcd" 
              title="불량유형" 
              width="120px" 
              cell={CustomComboBoxCell}
            />
            <GridColumn 
              field="qty"
              title="불량수량"
              width="100px"
              cell={NumberCell}
              footerCell={gridsumQtyFooterCell2}
            />
            <GridColumn field="remark" title="비고" width="180px" />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      <BottomContainer>
        <ButtonContainer>
          <Button 
            onClick={onSaveClick} 
            themeColor={"primary"} 
            icon = "save">
            저장
          </Button>
          <Button
            onClick={onClose}
            themeColor={"primary"}
          >
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
      
    {stockWindowVisible && (
      <StockWindow
        setVisible={setStockWindowVisible}
        setData={setCopyData}
      />
    )}
    </Window>
  )
}

export default DetailWindow;