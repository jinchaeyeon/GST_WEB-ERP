import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridEvent,
  GridFooterCellProps,
  GridCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridHeaderSelectionChangeEvent,
  GridHeaderCellProps,
  GridDataStateChangeEvent,
} from "@progress/kendo-react-grid";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";

import {
  ButtonContainer,
  ButtonInInput,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../../CommonStyled";
import { Iparameters, TcontrolObj } from "../../../store/types";
import { chkScrollHandler, getGridItemChangedData } from "../../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";

import ColumnWindow from "./UserOptionsColumnWindow";
import DefaultWindow from "./UserOptionsDefaultWindow";
import { IWindowPosition } from "../../../hooks/interfaces";
import {
  EDIT_FIELD,
  EXPANDED_FIELD,
  pageSize,
  SELECTED_FIELD,
} from "../../CommonString";

import { CellRender, RowRender } from "../../Renderers";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  createDataTree,
  extendDataItem,
  mapTree,
  TreeList,
  TreeListColumnProps,
  TreeListDraggableRow,
  TreeListExpandChangeEvent,
  TreeListRowDragEvent,
  TreeListTextEditor,
  treeToFlat,
} from "@progress/kendo-react-treelist";
import UserEffect from "../../UserEffect";
import { Input } from "@progress/kendo-react-inputs";
import { userState } from "../../../store/atoms";

type TKendoWindow = {
  getVisible(t: boolean): void;
};

const ControlColumns: TreeListColumnProps[] = [
  {
    field: "rowstatus",
    title: " ",
    width: "40px",
  },
  {
    expandable: true,
    field: "control_name",
    title: "컨트롤명",
    width: "150px",
  },
  {
    field: "field_name",
    title: "필드명",
    width: "150px",
  },
  // {
  //   field: "parent",
  //   title: "부모 컨트롤 ",
  //   width: "150px",
  // },
  {
    field: "type",
    title: "타입 ",
    width: "150px",
  },
  {
    field: "word_id",
    title: "Word ID",
    width: "150px",
    editCell: TreeListTextEditor,
  },
  {
    field: "word_text",
    title: "텍스트",
    width: "150px",
  },
];

const subItemsField: string = "children";

// const DraggableGridRowRender = (properties: any) => {
//   const {
//     row = "",
//     props = "",
//     onDrop = "",
//     onDragStart = "",
//   } = { ...properties };
//   const additionalProps = {
//     onDragStart: (e: any) => onDragStart(e, props.dataItem),
//     onDragOver: (e: any) => {
//       e.preventDefault();
//     },
//     // onDrop: (e: any) => onDrop(e),
//     draggable: true,
//   };
//   return React.cloneElement(
//     row,
//     { ...row.props, ...additionalProps },
//     row.props.children
//   );
// };

const DraggableGridRowRender = (properties: any) => {
  const {
    row = "",
    props = "",
    onDrop = "",
    onDragStart = "",
  } = { ...properties };
  const additionalProps = {
    onDragStart: (e: any) => onDragStart(e, props.dataItem),
    onDragOver: (e: any) => {
      e.preventDefault();
    },
    onDrop: (e: any) => onDrop(e, props.dataItem),
    draggable: true,
  };
  return React.cloneElement(
    row,
    { ...row.props, ...additionalProps },
    row.props.children
  );
};

const KendoWindow = ({ getVisible }: TKendoWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 800,
  });

  const [columnWindowVisible, setColumnWindowVisible] =
    useState<boolean>(false);

  const [defaultWindowVisible, setDefaultWindowVisible] =
    useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setWordFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const CONTROL_DATA_ITEM_KEY = "control_name";
  const WORD_DATA_ITEM_KEY = "word_id";
  const MAIN_COLUMN_DATA_ITEM_KEY = "option_id";
  const DETAIL_COLUMN_DATA_ITEM_KEY = "column_id";
  const MAIN_DEFAULT_DATA_ITEM_KEY = "option_id";
  const DETAIL_DEFAULT_DATA_ITEM_KEY = "default_id";

  const ControlIdGetter = getter(CONTROL_DATA_ITEM_KEY);
  const wordIdGetter = getter(CONTROL_DATA_ITEM_KEY);
  const mainColumnIdGetter = getter(MAIN_COLUMN_DATA_ITEM_KEY);
  const detailColumnIdGetter = getter(DETAIL_COLUMN_DATA_ITEM_KEY);
  const mainDefaultIdGetter = getter(MAIN_DEFAULT_DATA_ITEM_KEY);
  const detailDefaultIdGetter = getter(DETAIL_DEFAULT_DATA_ITEM_KEY);

  const [mainColumnDataState, setMainColumnDataState] = useState<State>({});
  const [wordDataState, setWordDataState] = useState<State>({});
  const [ControlDataState, setControlDataState] = useState<State>({});
  const [detailColumnDataState, setDetailColumnDataState] = useState<State>({
    sort: [],
  });
  const [mainDefaultDataState, setMainDefaultDataState] = useState<State>({});
  const [detailDefaultDataState, setDetailDefaultDataState] = useState<State>({
    sort: [],
  });

  const [controlDataResult, setcontrolDataResult] = useState<any>([]);
  const [wordDataResult, setWordDataResult] = useState<DataResult>(
    process([], mainColumnDataState)
  );
  const [mainColumnDataResult, setMainColumnDataResult] = useState<DataResult>(
    process([], mainColumnDataState)
  );
  const [detailColumnDataResult, setDetailColumnDataResult] =
    useState<DataResult>(process([], detailColumnDataState));

  const [mainDefaultDataResult, setMainDefaultDataResult] =
    useState<DataResult>(process([], mainDefaultDataState));
  const [detailDefaultDataResult, setDetailDefaultDataResult] =
    useState<DataResult>(process([], detailDefaultDataState));

  const [ControlSelectedState, setControlSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [wordSelectedState, setWordSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [mainColumnSelectedState, setMainColumnSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailColumnSelectedState, setDetailColumnSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [mainDefaultSelectedState, setMainDefaultSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailDefaultSelectedState, setDetailDefaultSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [ControlPgNum, setControlPgNum] = useState(1);
  const [wordPgNum, setWordPgNum] = useState(1);
  const [mainColumnPgNum, setMainColumnPgNum] = useState(1);
  const [detailColumnPgNum, setDetailColumnPgNum] = useState(1);
  const [mainDefaultPgNum, setMainDefaultPgNum] = useState(1);
  const [detailDefaultPgNum, setDetailDefaultPgNum] = useState(1);

  const [columnWindowWorkType, setColumnWindowWorkType] = useState("");
  const [defaultWindowWorkType, setDefaultWindowWorkType] = useState("");

  const [parentComponent, setParentComponent] = useState("");
  const [processType, setProcessType] = useState("");

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

  const processApi = useApi();

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };
  useEffect(() => {
    // if (tabSelected === 0) {
    fetchControl();
    fetchWord();
    // } else if (tabSelected === 1) {
    fetchMainDefault();
    // } else {
    fetchMainColumn();
    // }
  }, [tabSelected]);

  const pathname: string = window.location.pathname.replace("/", "");

  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "web_sel_column_view_config",
    pageNumber: 1,
    pageSize: 20,
    parameters: {
      "@p_work_type": "LIST",
      "@p_dbname": "",
      "@p_form_id": pathname,
      "@p_lang_id": "",
      "@p_parent_component": "",
      "@p_message": "",
    },
  };

  //조회조건 초기값
  const [wordFilters, setWordFilters] = useState({
    pgSize: pageSize,
    work_type: "LIST",
    word_id: "",
    word_text: "",
  });

  const wordParameters: Iparameters = {
    procedureName: "sel_word_info",
    pageNumber: wordPgNum,
    pageSize: wordFilters.pgSize,
    parameters: {
      "@p_work_type": "default",
      "@p_culture_name": "",
      "@p_word_id": wordFilters.word_id,
      "@p_word_text": wordFilters.word_text,
      "@p_default_text": "",
      "@p_remarks": "",
      "@p_find_row_value": "",
      "@p_is_match": "",
      "@p_dc_code": "",
    },
  };
  const defaultMainParameters: Iparameters = {
    procedureName: "web_sel_default_management",
    pageNumber: 1,
    pageSize: 20,
    parameters: {
      "@p_work_type": "LIST",
      "@p_form_id": pathname,
      "@p_lang_id": "",
      "@p_process_type": "",
      "@p_message": "",
    },
  };

  const [columnDetailInitialVal, setColumnDetailInitialVal] = useState({
    dbname: "",
    parent_component: "",
  });
  const [defaultDetailInitialVal, setDefaultDetailInitialVal] = useState({
    process_type: "",
  });

  const columnDetailParameters: Iparameters = {
    procedureName: "web_sel_column_view_config",
    pageNumber: 1,
    pageSize: 20,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_dbname": columnDetailInitialVal.dbname,
      "@p_form_id": pathname.replace("/", ""),
      "@p_lang_id": "",
      "@p_parent_component": columnDetailInitialVal.parent_component,
      "@p_message": "",
    },
  };

  const defaultDetailParameters: Iparameters = {
    procedureName: "web_sel_default_management",
    pageNumber: 1,
    pageSize: 20,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_form_id": pathname,
      "@p_lang_id": "",
      "@p_process_type": defaultDetailInitialVal.process_type,
      "@p_message": "",
    },
  };

  //메인 컬럼 그리드 선택시 디테일 그리드 조회
  useEffect(() => {
    fetchDetailColumn();
  }, [columnDetailInitialVal]);

  useEffect(() => {
    fetchDetailDefault();
  }, [defaultDetailInitialVal]);

  //첫번째 행 선택
  useEffect(() => {
    if (mainColumnDataResult.total > 0) {
      const firstRowData = mainColumnDataResult.data[0];
      setMainColumnSelectedState({
        [firstRowData[MAIN_COLUMN_DATA_ITEM_KEY]]: true,
      });

      setColumnDetailInitialVal((prev) => ({
        ...prev,
        dbname: "SYSTEM",
        parent_component: firstRowData.option_id,
      }));
    }
  }, [mainColumnDataResult]);

  useEffect(() => {
    if (mainDefaultDataResult.total > 0) {
      const firstRowData = mainDefaultDataResult.data[0];
      setMainDefaultSelectedState({
        [firstRowData[MAIN_DEFAULT_DATA_ITEM_KEY]]: true,
      });

      setDefaultDetailInitialVal((prev) => ({
        ...prev,
        process_type: firstRowData.option_id,
      }));
    }
  }, [mainDefaultDataResult]);

  //요약정보 조회
  const fetchControl = async () => {
    let data: any;

    const queryStr =
      "SELECT form_id, control_name, field_name, parent, type, A.word_id, ISNULL(B.word_text,'') word_text " +
      "FROM appDesignInfo A LEFT OUTER JOIN brpWordInfo B ON A.word_id = B.word_id AND culture_name = 'ko-KR' " +
      "WHERE form_id = '" +
      pathname +
      "'";

    const query = {
      query: "query?query=" + encodeURIComponent(queryStr),
    };

    try {
      data = await processApi<any>("platform-query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.control_name,
          (i: any) => i.parent,
          subItemsField
        );

        setcontrolDataResult([...dataTree]);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  //요약정보 조회
  const fetchWord = async () => {
    let data: any;
    try {
      data = await processApi<any>("platform-procedure", wordParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setWordDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });

      //setWordDataResult(process(rows, wordDataState));
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  const fetchControlSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("platform-procedure", wordControlSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("저장이 완료되었습니다.");
      fetchControl();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  //요약정보 조회
  const fetchMainColumn = async () => {
    let data: any;
    try {
      data = await processApi<any>("platform-procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;

      setMainColumnDataResult(process(rows, mainColumnDataState));
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  const fetchMainDefault = async () => {
    let data: any;
    try {
      data = await processApi<any>("platform-procedure", defaultMainParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;

      setMainDefaultDataResult(process(rows, mainDefaultDataState));
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  //상세그리드 조회
  const fetchDetailColumn = async () => {
    let data: any;

    try {
      data = await processApi<any>(
        "platform-procedure",
        columnDetailParameters
      );
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowsCnt = data.tables[0].Rows.length;
      const rows = data.tables[0].Rows;

      setDetailColumnDataResult(() => {
        return {
          data: [...rows],
          total: totalRowsCnt,
        };
      });
    }
  };
  const fetchDetailDefault = async () => {
    let data: any;

    try {
      data = await processApi<any>(
        "platform-procedure",
        defaultDetailParameters
      );
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowsCnt = data.tables[0].Rows.length;
      const rows = data.tables[0].Rows;

      setDetailDefaultDataResult(() => {
        return {
          data: [...rows],
          total: totalRowsCnt,
        };
      });
    }
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    service_id: "20190218001",
    orgdiv: "01",
    location: "01",
    ordnum: "",
    poregnum: "",
    project: "",
    ordtype: "",
    ordsts: "",
    taxdiv: "",
    orddt: "",
    dlvdt: "",
    dptcd: "",
    person: "",
    amtunit: "",
    portnm: "",
    finaldes: "",
    paymeth: "",
    prcterms: "",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    wonchgrat: 0,
    uschgrat: 0,
    doexdiv: "",
    remark: "",
    attdatnum: "",
    userid: "admin",
    pc: "WEB TEST",
    ship_method: "",
    dlv_method: "",
    hullno: "",
    rowstatus_s: "",
    chk_s: "",
    ordseq_s: "",
    poregseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    insiz_s: "",
    bnatur_s: "",
    qty_s: "",
    qtyunit_s: "",
    totwgt_s: "",
    wgtunit_s: "",
    len_s: "",
    totlen_s: "",
    lenunit_s: "",
    thickness_s: "",
    width_s: "",
    length_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    taxamt_s: "",
    dlramt_s: "",
    wonamt_s: "",
    remark_s: "",
    pac_s: "",
    finyn_s: "",
    specialunp_s: "",
    lotnum_s: "",
    dlvdt_s: "",
    specialamt_s: "",
    heatno_s: "",
    bf_qty_s: "",
    form_id: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_WEB_SA_A2000_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_service_id": paraData.service_id,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_ordnum": paraData.ordnum,
      "@p_poregnum": paraData.poregnum,
      "@p_project": paraData.project,
      "@p_ordtype": paraData.ordtype,
      "@p_ordsts": paraData.ordsts,
      "@p_taxdiv": paraData.taxdiv,
      "@p_orddt": paraData.orddt,
      "@p_dlvdt": paraData.dlvdt,
      "@p_dptcd": paraData.dptcd,
      "@p_person": paraData.person,
      "@p_amtunit": paraData.amtunit,
      "@p_portnm": paraData.portnm,
      "@p_finaldes": paraData.finaldes,
      "@p_paymeth": paraData.paymeth,
      "@p_prcterms": paraData.prcterms,
      "@p_custcd": paraData.custcd,
      "@p_custnm": paraData.custnm,
      "@p_rcvcustcd": paraData.rcvcustcd,
      "@p_rcvcustnm": paraData.rcvcustnm,
      "@p_wonchgrat": paraData.wonchgrat,
      "@p_uschgrat": paraData.uschgrat,
      "@p_doexdiv": paraData.doexdiv,
      "@p_remark": paraData.remark,
      "@p_attdatnum": paraData.attdatnum,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_ship_method": paraData.ship_method,
      "@p_dlv_method": paraData.dlv_method,
      "@p_hullno": paraData.hullno,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_chk_s": paraData.chk_s,
      "@p_ordseq_s": paraData.ordseq_s,
      "@p_poregseq_s": paraData.poregseq_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_itemnm_s": paraData.itemnm_s,
      "@p_itemacnt_s": paraData.itemacnt_s,
      "@p_insiz_s": paraData.insiz_s,
      "@p_bnatur_s": paraData.bnatur_s,
      "@p_qty_s": paraData.qty_s,
      "@p_qtyunit_s": paraData.qtyunit_s,
      "@p_totwgt_s": paraData.totwgt_s,
      "@p_wgtunit_s": paraData.wgtunit_s,
      "@p_len_s": paraData.len_s,
      "@p_totlen_s": paraData.totlen_s,
      "@p_lenunit_s": paraData.lenunit_s,
      "@p_thickness_s": paraData.thickness_s,
      "@p_width_s": paraData.width_s,
      "@p_length_s": paraData.length_s,
      "@p_unpcalmeth_s": paraData.unpcalmeth_s,
      "@p_unp_s": paraData.unp_s,
      "@p_amt_s": paraData.amt_s,
      "@p_taxamt_s": paraData.taxamt_s,
      "@p_dlramt_s": paraData.dlramt_s,
      "@p_wonamt_s": paraData.wonamt_s,
      "@p_remark_s": paraData.remark_s,
      "@p_pac_s": paraData.pac_s,
      "@p_finyn_s": paraData.finyn_s,
      "@p_specialunp_s": paraData.specialunp_s,
      "@p_lotnum_s": paraData.lotnum_s,
      "@p_dlvdt_s": paraData.dlvdt_s,
      "@p_specialamt_s": paraData.specialamt_s,
      "@p_heatno_s": paraData.heatno_s,
      "@p_bf_qty_s": paraData.bf_qty_s,
      "@p_form_id": paraData.form_id,
    },
  };

  //프로시저 파라미터 초기값
  const [wordControlData, setControlParaData] = useState({
    work_type: "",
    form_id: pathname,
    control_name: "",
    field_name: "",
    parent: "",
    type: "",
    full_type: "",
    bc_id: "",
    word_id: "",
    id: "",
    pc: "",
  });

  //프로시저 파라미터
  const wordControlSaved: Iparameters = {
    procedureName: "sav_form_design_info",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": wordControlData.work_type,
      "@p_form_id": wordControlData.form_id,
      "@p_control_name": wordControlData.control_name,
      "@p_field_name": wordControlData.field_name,
      "@p_parent": wordControlData.parent,
      "@p_type": wordControlData.type,
      "@p_full_type": wordControlData.full_type,
      "@p_bc_id": wordControlData.bc_id,
      "@p_word_id": wordControlData.word_id,
      "@p_id": wordControlData.id,
      "@p_pc": wordControlData.pc,
    },
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainColumnDataResult(process([], mainColumnDataState));
    setDetailColumnDataResult(process([], detailColumnDataState));
  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("저장이 완료되었습니다.");
      if ("U" === "U") {
        resetAllGrid();

        // reloadData("U");
        fetchMainColumn();
        fetchDetailColumn();
      } else {
        getVisible(false);
        //   reloadData("N");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.result.statusCode + "] " + data.result.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
  }, [paraData]);

  useEffect(() => {
    if (wordControlData.work_type !== "") fetchControlSaved();
  }, [wordControlData]);

  const onControlScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, ControlPgNum, pageSize))
      setControlPgNum((prev) => prev + 1);
  };
  const onWordScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, wordPgNum, pageSize))
      setWordPgNum((prev) => prev + 1);
  };

  useEffect(() => {
    fetchWord();
  }, [wordPgNum]);

  const onMainColumnScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainColumnPgNum, pageSize))
      setMainColumnPgNum((prev) => prev + 1);
  };

  const onDetailColumnScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailColumnPgNum, pageSize))
      setDetailColumnPgNum((prev) => prev + 1);
  };
  const onMainDefaultScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainDefaultPgNum, pageSize))
      setMainDefaultPgNum((prev) => prev + 1);
  };

  const onDetailDefaultScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailDefaultPgNum, pageSize))
      setDetailDefaultPgNum((prev) => prev + 1);
  };

  const onControlDataStateChange = (event: GridDataStateChangeEvent) => {
    setControlDataState(event.dataState);
  };
  const onWordDataStateChange = (event: GridDataStateChangeEvent) => {
    setWordDataState(event.dataState);
  };

  const onMainColumnDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainColumnDataState(event.dataState);
  };

  const onDetailColumnDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailColumnDataState(event.dataState);
  };
  const onMainDefaultDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDefaultDataState(event.dataState);
  };

  const onDetailDefaultDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDefaultDataState(event.dataState);
  };

  const onControlSortChange = (e: any) => {
    setControlDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onWordSortChange = (e: any) => {
    setWordDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainColumnSortChange = (e: any) => {
    setMainColumnDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailColumnSortChange = (e: any) => {
    setDetailColumnDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainDefaultSortChange = (e: any) => {
    setMainDefaultDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailDefaultSortChange = (e: any) => {
    setDetailDefaultDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainColumnSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: mainColumnSelectedState,
      dataItemKey: MAIN_COLUMN_DATA_ITEM_KEY,
    });
    setMainColumnSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setColumnDetailInitialVal((prev) => ({
      ...prev,
      dbname: "SYSTEM", //selectedRowData.dbname,
      parent_component: selectedRowData.option_id,
    }));
  };

  const onControlSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: ControlSelectedState,
      dataItemKey: CONTROL_DATA_ITEM_KEY,
    });
    setDetailColumnSelectedState(newSelectedState);
  };
  const onWordSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: wordSelectedState,
      dataItemKey: WORD_DATA_ITEM_KEY,
    });
    setDetailColumnSelectedState(newSelectedState);
  };
  const onDetailColumnSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailColumnSelectedState,
      dataItemKey: DETAIL_COLUMN_DATA_ITEM_KEY,
    });
    setDetailColumnSelectedState(newSelectedState);
  };
  const onMainDefaultSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: mainDefaultSelectedState,
      dataItemKey: MAIN_DEFAULT_DATA_ITEM_KEY,
    });
    setMainDefaultSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDefaultDetailInitialVal((prev) => ({
      ...prev,
      process_type: selectedRowData.option_id,
    }));
  };

  const onDetailDefaultSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailDefaultSelectedState,
      dataItemKey: DETAIL_COLUMN_DATA_ITEM_KEY,
    });
    setDetailDefaultSelectedState(newSelectedState);
  };

  const onDetailColumnItemChange = (event: GridItemChangeEvent) => {
    // const newData = getGridItemChangedData(event);

    getGridItemChangedData(
      event,
      detailColumnDataResult,
      setDetailColumnDataResult,
      DETAIL_COLUMN_DATA_ITEM_KEY
    );
  };
  const onDetailDefaultItemChange = (event: GridItemChangeEvent) => {
    // const newData = getGridItemChangedData(event);

    getGridItemChangedData(
      event,
      detailDefaultDataResult,
      setDetailDefaultDataResult,
      DETAIL_COLUMN_DATA_ITEM_KEY
    );
  };

  const detailColumnEnterEdit = (dataItem: any, field: string) => {
    const newData = detailColumnDataResult.data.map((item) =>
      item[DETAIL_COLUMN_DATA_ITEM_KEY] ===
      dataItem[DETAIL_COLUMN_DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : { ...item, [EDIT_FIELD]: undefined }
    );

    setDetailColumnDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const detailColumnExitEdit = () => {
    const newData = detailColumnDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setDetailColumnDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };
  const detailDefaultEnterEdit = (dataItem: any, field: string) => {
    const newData = detailDefaultDataResult.data.map((item) =>
      item[DETAIL_COLUMN_DATA_ITEM_KEY] ===
      dataItem[DETAIL_COLUMN_DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : { ...item, [EDIT_FIELD]: undefined }
    );

    setDetailDefaultDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const detailDefaultExitEdit = () => {
    const newData = detailDefaultDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setDetailDefaultDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const detailColumnCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={detailColumnEnterEdit}
      editField={EDIT_FIELD}
    />
  );

  const detailColumnRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={detailColumnExitEdit}
      editField={EDIT_FIELD}
    />
  );
  const detailDefaultCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={detailDefaultEnterEdit}
      editField={EDIT_FIELD}
    />
  );

  const detailDefaultRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={detailDefaultExitEdit}
      editField={EDIT_FIELD}
    />
  );

  const onCreateColumnClick = () => {
    setColumnWindowWorkType("N");
    setColumnWindowVisible(true);
  };

  const onCreateDefaultClick = () => {
    setDefaultWindowWorkType("N");
    setDefaultWindowVisible(true);
  };

  const onSaveControl = () => {
    type TdataArr = {
      control_name: string[];
      field_name: string[];
      parent: string[];
      type: string[];
      full_type: string[];
      bc_id: string[];
      word_id: string[];
    };

    let dataArr: TdataArr = {
      control_name: [],
      field_name: [],
      parent: [],
      type: [],
      full_type: [],
      bc_id: [],
      word_id: [],
    };

    const flatData: any = treeToFlat(
      controlDataResult,
      "control_name",
      subItemsField
    );
    flatData.forEach((item: any) => delete item[subItemsField]);

    flatData.forEach((item: any) => {
      const {
        control_name,
        field_name,
        parent,
        type,
        full_type,
        bc_id,
        word_id,
      } = item;

      dataArr.control_name.push(control_name);
      dataArr.field_name.push(field_name);
      dataArr.parent.push(parent);
      dataArr.type.push(type);
      dataArr.full_type.push(full_type);
      dataArr.bc_id.push(bc_id);
      dataArr.word_id.push(word_id);
    });

    setControlParaData((prev) => ({
      ...prev,
      work_type: "save",
      control_name: dataArr.control_name.join("|"),
      field_name: dataArr.field_name.join("|"),
      parent: dataArr.parent.join("|"),
      type: dataArr.type.join("|"),
      full_type: dataArr.full_type.join("|"),
      bc_id: dataArr.bc_id.join("|"),
      word_id: dataArr.word_id.join("|"),
    }));
  };

  type TDataInfo = {
    DATA_ITEM_KEY: string;
    selectedState: {
      [id: string]: boolean | number[];
    };
    dataResult: DataResult;
    setDataResult: (p: any) => any;
  };
  type TArrowBtnClick = {
    direction: string;
    dataInfo: TDataInfo;
  };

  const arrowBtnClickPara = {
    DATA_ITEM_KEY: DETAIL_COLUMN_DATA_ITEM_KEY,
    selectedState: detailColumnSelectedState,
    dataResult: detailColumnDataResult,
    setDataResult: setDetailColumnDataResult,
  };

  const onArrowsBtnClick = (para: TArrowBtnClick) => {
    const { direction, dataInfo } = para;
    const { DATA_ITEM_KEY, selectedState, dataResult, setDataResult } =
      dataInfo;
    const selectedField = Object.getOwnPropertyNames(selectedState)[0];

    const rowData = dataResult.data.find(
      (row) => row[DATA_ITEM_KEY] === selectedField
    );

    const rowIndex = dataResult.data.findIndex(
      (row) => row[DATA_ITEM_KEY] === selectedField
    );

    if (rowIndex === -1) {
      alert("이동시킬 행을 선택해주세요.");
      return false;
    }

    const newData = dataResult.data.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    newData.splice(rowIndex, 1);
    newData.splice(rowIndex + (direction === "UP" ? -1 : 1), 0, rowData);

    setDataResult((prev: any) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  //프로시저 파라미터 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    option_id: "",
    form_id: pathname,
  });
  const [defaultParaDataDeleted, setDefaultParaDataDeleted] = useState({
    work_type: "",
    option_id: "",
    form_id: pathname,
  });

  //프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "sav_custom_option",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_form_id": paraDataDeleted.form_id,
      "@p_type": "Column",
      "@p_company_code": "",
      "@p_option_id": paraDataDeleted.option_id,
      "@p_option_name": "",
      "@p_subject_word_id": "",
      "@p_remarks": "",
      "@p_row_status": "",

      /* sysCustomOptionDefault */
      "@p_default_id": "",
      "@p_caption": "",
      "@p_word_id": "",
      "@p_sort_order": "",
      "@p_value_type": "",
      "@p_value": "",
      "@p_bc_id": "",
      "@p_where_query": "",
      "@p_add_year": "",
      "@p_add_month": "",
      "@p_add_day": "",
      "@p_session_item": "",
      "@p_user_editable": "",
      /* sysCustomOptionColumn */
      "@p_column_id": "",
      "@p_width": 0,
      "@p_fixed": "",

      "@p_pc": "",
    },
  };
  const defaultParaDeleted: Iparameters = {
    procedureName: "sav_custom_option",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": defaultParaDataDeleted.work_type,
      "@p_form_id": defaultParaDataDeleted.form_id,
      "@p_type": "Default",
      "@p_company_code": "",
      "@p_option_id": defaultParaDataDeleted.option_id,
      "@p_option_name": "",
      "@p_subject_word_id": "",
      "@p_remarks": "",
      "@p_row_status": "",

      /* sysCustomOptionDefault */
      "@p_default_id": "",
      "@p_caption": "",
      "@p_word_id": "",
      "@p_sort_order": "",
      "@p_value_type": "",
      "@p_value": "",
      "@p_bc_id": "",
      "@p_where_query": "",
      "@p_add_year": "",
      "@p_add_month": "",
      "@p_add_day": "",
      "@p_session_item": "",
      "@p_user_editable": "",
      /* sysCustomOptionColumn */
      "@p_column_id": "",
      "@p_width": 0,
      "@p_fixed": "",

      "@p_pc": "",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete(paraDeleted);
  }, [paraDataDeleted]);

  useEffect(() => {
    if (defaultParaDataDeleted.work_type === "D")
      fetchToDelete(defaultParaDeleted);
  }, [defaultParaDataDeleted]);

  const fetchToDelete = async (para: any) => {
    let data: any;

    console.log("para");
    console.log(para);
    try {
      data = await processApi<any>("platform-procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("삭제가 완료되었습니다.");

      resetAllGrid();
      fetchMainColumn();
      fetchMainDefault();
    } else {
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.option_id = "";
    defaultParaDataDeleted.work_type = "";
    defaultParaDataDeleted.option_id = "";
  };

  const onDeleteColumnClick = () => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    const option_id = Object.getOwnPropertyNames(mainColumnSelectedState)[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      option_id,
    }));
  };

  const onDeleteDefaultClick = () => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    const option_id = Object.getOwnPropertyNames(mainDefaultSelectedState)[0];

    setDefaultParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      option_id,
    }));
  };

  const ColumnCommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      // 요약정보 행 클릭
      const rowData = props.dataItem;
      setMainColumnSelectedState({
        [rowData[MAIN_COLUMN_DATA_ITEM_KEY]]: true,
      });

      // 컬럼 팝업 창 오픈 (수정용)
      setParentComponent(rowData[MAIN_COLUMN_DATA_ITEM_KEY]);
      setColumnWindowWorkType("U");
      setColumnWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <CommandCellBtn onClick={onEditClick} />
      </td>
    );
  };

  const DefaultCommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      // 요약정보 행 클릭
      const rowData = props.dataItem;
      setMainColumnSelectedState({
        [rowData[MAIN_DEFAULT_DATA_ITEM_KEY]]: true,
      });

      // 컬럼 팝업 창 오픈 (수정용)
      setProcessType(rowData[MAIN_DEFAULT_DATA_ITEM_KEY]);
      setDefaultWindowWorkType("U");
      setDefaultWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <CommandCellBtn onClick={onEditClick} />
      </td>
    );
  };

  const ArrowsCell = (props: GridCellProps) => {
    const onClick = (item: any) => {
      console.log("item");
      console.log(item);
      const { dataIndex, dataItem } = item;

      const newData = detailColumnDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));

      newData.splice(dataIndex, 1);
      newData.splice(dataIndex + 1, 0, dataItem);

      setDetailColumnDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <td className="k-command-cell">
        <CommandCellBtn onClick={() => onClick(props)} />
      </td>
    );
  };

  type TCommandCellBtn = {
    onClick: () => void;
  };
  const CommandCellBtn = (props: TCommandCellBtn) => {
    return (
      <Button
        className="k-grid-edit-command"
        themeColor={"primary"}
        fillMode="outline"
        onClick={props.onClick}
        icon="edit"
      ></Button>
    );
  };

  const reloadData = () => {
    fetchMainColumn();
    fetchMainDefault();
    fetchDetailColumn();
    fetchDetailDefault();
  };

  const onGetControlClick = () => {
    const root = document.getElementById("root");
    if (root === null) {
      alert("오류가 발생하였습니다. 새로고침 후 다시 시도해주세요.");
      return false;
    }

    //let ControlList: Array<TcontrolObj>; //차이점?..
    let ControlList: TcontrolObj[] = [];

    // 1) 최상위 메뉴
    const topElementObj: TcontrolObj = {
      rowstatus: "N",
      form_id: pathname,
      control_name: pathname,
      field_name: "",
      parent: "",
      type: "",
      word_id: "",
      word_text: "",
    };
    ControlList.push(topElementObj);

    // 2) Text 그룹
    const textGroupObj: TcontrolObj = {
      rowstatus: "N",
      form_id: pathname,
      control_name: "Texts",
      field_name: "",
      parent: pathname,
      type: "TextGroup",
      word_id: "",
      word_text: "",
    };
    ControlList.push(textGroupObj);

    // 3) Text 그룹 하위 요소
    // [data-control-name] 리스트 (Label, Title 등)
    const controlNameObjArr = [...root.querySelectorAll("[data-control-name]")];
    const controlNameList = controlNameObjArr.map(
      (item: any) => item.dataset.controlName
    );
    controlNameList.forEach((item) => {
      if (item === "") return;
      const controlObj: TcontrolObj = {
        rowstatus: "N",
        form_id: pathname,
        control_name: item,
        field_name: "",
        parent: "Texts",
        type: item.includes("lbl")
          ? "Label"
          : item.includes("grt")
          ? "GridTitle"
          : "",
        word_id: "",
        word_text: "",
      };
      ControlList.push(controlObj);
    });

    // 2) Text 그룹
    const gridGroupObj: TcontrolObj = {
      rowstatus: "N",
      form_id: pathname,
      control_name: "Grids",
      field_name: "",
      parent: pathname,
      type: "GridGroup",
      word_id: "",
      word_text: "",
    };
    ControlList.push(gridGroupObj);

    // 2) Grid 그룹
    const columnArr: any = [...root.querySelectorAll("[data-grid-name]")];
    const gridNameArr: string[] = [];
    columnArr.forEach((item: any) => {
      if (!gridNameArr.includes(item.dataset.gridName)) {
        gridNameArr.push(item.dataset.gridName);
      }
    });
    gridNameArr.forEach((item: string) => {
      const controlObj: TcontrolObj = {
        rowstatus: "N",
        form_id: pathname,
        control_name: item,
        field_name: "",
        parent: "Grids",
        type: "Grid",
        word_id: "",
        word_text: "",
      };
      ControlList.push(controlObj);
    });

    // 3) Grid 그룹 하위요소
    // [data-grid-name] 리스트 (Column)
    columnArr.forEach((item: any) => {
      const controlObj: TcontrolObj = {
        rowstatus: "N",
        form_id: pathname,
        control_name: item.id,
        field_name: item.dataset.field,
        parent: item.dataset.gridName,
        type: "Column",
        word_id: "",
        word_text: "",
      };
      ControlList.push(controlObj);
    });

    // 기존소스의 word_id 참조
    const flatData: any = treeToFlat(
      controlDataResult,
      "control_name",
      subItemsField
    );
    flatData.forEach((item: any) => delete item[subItemsField]);

    ControlList.forEach((item) => {
      const sameControlData = flatData.find(
        (orgItem: any) => item.control_name === orgItem.control_name
      );

      if (sameControlData) {
        item.word_id = sameControlData.word_id;
        item.word_text = sameControlData.word_text;
      }
    });

    const dataTree: any = createDataTree(
      ControlList,
      (i: any) => i.control_name,
      (i: any) => i.parent,
      subItemsField
    );

    setcontrolDataResult([...dataTree]);
  };

  const [ControlExpanded, setControlExpanded] = React.useState<string[]>([
    pathname,
  ]);

  const onControlExpandChange = (e: TreeListExpandChangeEvent) => {
    setControlExpanded(
      e.value
        ? ControlExpanded.filter(
            (id) => id !== e.dataItem[CONTROL_DATA_ITEM_KEY]
          )
        : [...ControlExpanded, e.dataItem[CONTROL_DATA_ITEM_KEY]]
    );
  };

  const ControlCallback = (item: any) =>
    ControlExpanded.includes(item[CONTROL_DATA_ITEM_KEY])
      ? extendDataItem(item, subItemsField, { expanded: true })
      : item;

  const [wordDragDataItem, setWordDragDataItem] = useState<any>(null);
  const [controlDragDataItem, setControlDragDataItem] = useState<any>(null);

  const wordRowRender = (row: any, props: any) => {
    return (
      <DraggableGridRowRender
        props={props}
        row={row}
        onDrop={handleWordDrop}
        onDragStart={handleWordDragStart}
      />
    );
  };

  const controlRowRender = (tr: any, props: any) => (
    <DraggableGridRowRender
      props={props}
      row={tr}
      onDrop={handleControlDrop}
      onDragStart={handleControlDragStart}
    />
  );

  const handleWordDragStart = (e: any, dataItem: any) => {
    setWordDragDataItem(dataItem);
  };
  const handleControlDragStart = (e: any, dataItem: any) => {
    setWordDragDataItem(dataItem);
    setControlDragDataItem(dataItem);
  };

  // 컨트롤 데이터 word_id 업데이트
  const handleControlDrop = (e: any, dataItem: any) => {
    if (wordDragDataItem === null) {
      return false;
    }

    const { control_name = "" } = dataItem;

    const flatData: any = treeToFlat(
      controlDataResult,
      "control_name",
      subItemsField
    );

    flatData.forEach((item: any) => delete item[subItemsField]);

    const newData = flatData.map((item: any) =>
      item[CONTROL_DATA_ITEM_KEY] === control_name
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            word_id: wordDragDataItem.word_id,
            word_text: wordDragDataItem.word_text,
          }
        : item
    );

    const dataTree: any = createDataTree(
      newData,
      (i: any) => i.control_name,
      (i: any) => i.parent,
      subItemsField
    );

    setcontrolDataResult([...dataTree]);
    setWordDragDataItem(null);
  };

  // 컨트롤 데이터 word_id 삭제
  const handleWordDrop = (e: any, dataItem: any) => {
    if (controlDragDataItem === null) {
      return false;
    }

    const control_name = controlDragDataItem[CONTROL_DATA_ITEM_KEY];

    const flatData: any = treeToFlat(
      controlDataResult,
      "control_name",
      subItemsField
    );

    flatData.forEach((item: any) => delete item[subItemsField]);

    const newData = flatData.map((item: any) =>
      item[CONTROL_DATA_ITEM_KEY] === control_name
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            word_id: "",
            word_text: "",
          }
        : item
    );

    const dataTree: any = createDataTree(
      newData,
      (i: any) => i.control_name,
      (i: any) => i.parent,
      subItemsField
    );

    setcontrolDataResult([...dataTree]);
    setWordDragDataItem(null);
  };

  return (
    <Window
      title={"사용자 옵션 설정"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="컨트롤정보">
          <GridContainerWrap>
            <GridContainer clientWidth={1330 - 415}>
              <GridTitleContainer>
                <GridTitle>컨트롤리스트</GridTitle>

                <ButtonContainer>
                  <Button
                    onClick={onGetControlClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    가져오기
                  </Button>
                  <Button
                    onClick={onSaveControl}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    저장
                  </Button>
                  {/* 
                  <Button
                    onClick={onDeleteDefaultClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                  >
                    삭제
                  </Button> */}
                </ButtonContainer>
              </GridTitleContainer>
              <TreeList
                style={{ height: "600px", overflow: "auto", width: "100%" }}
                data={mapTree(
                  controlDataResult,
                  subItemsField,
                  ControlCallback
                )}
                // {process(
                //   controlDataResult.data.map((row) => ({
                //     ...row,
                //     [SELECTED_FIELD]:
                //       ControlSelectedState[ControlIdGetter(row)],
                //   })),
                //   ControlDataState
                // )}
                //{...ControlDataState}
                //onDataStateChange={onControlDataStateChange}

                expandField={EXPANDED_FIELD}
                subItemsField={subItemsField}
                onExpandChange={onControlExpandChange}
                //선택 기능
                dataItemKey={CONTROL_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                columns={ControlColumns}
                rowRender={controlRowRender}

                // row={TreeListDraggableRow}
                // onRowDrop={onRowDrop}
              ></TreeList>
            </GridContainer>

            <GridContainer maxWidth="400px" inTab={true}>
              <GridTitleContainer>
                <GridTitle>[참조] 용어정보</GridTitle>

                <div style={{ gap: "2px", display: "flex" }}>
                  <Input
                    name="word_id"
                    type="text"
                    style={{ width: "110px" }}
                    placeholder="Word ID"
                    value={wordFilters.word_id}
                    onChange={filterInputChange}
                  />
                  <Input
                    name="word_text"
                    type="text"
                    style={{ width: "110px" }}
                    placeholder="텍스트"
                    value={wordFilters.word_text}
                    onChange={filterInputChange}
                  />

                  <Button
                    onClick={() => {
                      setWordPgNum(1);
                      setWordDataResult(process([], wordDataState));
                      fetchWord();
                    }}
                    icon="search"
                    // fillMode="flat"
                  />
                </div>
              </GridTitleContainer>
              <Grid
                style={{ height: "600px" }}
                data={process(
                  wordDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: wordSelectedState[wordIdGetter(row)],
                  })),
                  wordDataState
                )}
                {...wordDataState}
                onDataStateChange={onWordDataStateChange}
                //선택 기능
                dataItemKey={DETAIL_DEFAULT_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "multiple",
                }}
                onSelectionChange={onWordSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={wordDataResult.total}
                onScroll={onWordScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onWordSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                rowRender={wordRowRender}
              >
                <GridColumn field="word_id" title="Word ID" />
                <GridColumn field="word_text" title="텍스트" />
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="기본값">
          <GridContainerWrap>
            <GridContainer maxWidth="300px">
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onCreateDefaultClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onDeleteDefaultClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                  >
                    삭제
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "600px" }}
                data={process(
                  mainDefaultDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]:
                      mainDefaultSelectedState[mainDefaultIdGetter(row)],
                  })),
                  mainDefaultDataState
                )}
                {...mainDefaultDataState}
                onDataStateChange={onMainDefaultDataStateChange}
                //선택 기능
                dataItemKey={MAIN_DEFAULT_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "multiple",
                }}
                onSelectionChange={onMainDefaultSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDefaultDataResult.total}
                onScroll={onMainDefaultScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onMainDefaultSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn cell={DefaultCommandCell} width="55px" />
                <GridColumn field="option_id" title="타입ID" />
                <GridColumn field="option_name" title="설명" />
              </Grid>
            </GridContainer>

            <GridContainer
              clientWidth={1330 - 315} //= 요약정보 200 + margin 15
              inTab={true}
            >
              <GridTitleContainer>
                <GridTitle>상세정보</GridTitle>

                <ButtonContainer>
                  <Button
                    //onClick={onSaveMtrClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "600px" }}
                data={process(
                  detailDefaultDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]:
                      detailDefaultSelectedState[detailDefaultIdGetter(row)],
                  })),
                  detailDefaultDataState
                )}
                {...detailDefaultDataState}
                onDataStateChange={onDetailDefaultDataStateChange}
                //선택 기능
                dataItemKey={DETAIL_DEFAULT_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "multiple",
                }}
                onSelectionChange={onDetailDefaultSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detailDefaultDataResult.total}
                onScroll={onDetailDefaultScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onDetailDefaultSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                //incell 수정 기능
                onItemChange={onDetailDefaultItemChange}
                cellRender={detailDefaultCellRender}
                rowRender={detailDefaultRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn
                  field="rowstatus"
                  title=" "
                  width="40px"
                  editable={false}
                />
                <GridColumn
                  field="caption"
                  title="항목"
                  width=""
                  editable={false}
                />
                <GridColumn field="value" title="기본값" width="" />
                <GridColumn
                  field="add_year"
                  title="연 추가"
                  width=""
                  editor={"numeric"}
                />
                <GridColumn
                  field="add_month"
                  title="월 추가"
                  width=""
                  editor={"numeric"}
                />
                <GridColumn
                  field="add_day"
                  title="일 추가"
                  width=""
                  editor={"numeric"}
                />
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="컬럼">
          <GridContainerWrap>
            <GridContainer maxWidth="300px">
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>

                <ButtonContainer>
                  <Button
                    onClick={onCreateColumnClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onDeleteColumnClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                  >
                    삭제
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "600px" }}
                data={process(
                  mainColumnDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]:
                      mainColumnSelectedState[mainColumnIdGetter(row)],
                  })),
                  mainColumnDataState
                )}
                {...mainColumnDataState}
                onDataStateChange={onMainColumnDataStateChange}
                //선택 기능
                dataItemKey={MAIN_COLUMN_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "multiple",
                }}
                onSelectionChange={onMainColumnSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainColumnDataResult.total}
                onScroll={onMainColumnScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onMainColumnSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn cell={ColumnCommandCell} width="55px" />
                <GridColumn field="option_name" title="영역" />
              </Grid>
            </GridContainer>

            <GridContainer
              clientWidth={1330 - 315} //= 요약정보 200 + margin 15
              inTab={true}
            >
              <GridTitleContainer>
                <GridTitle>상세정보</GridTitle>

                <ButtonContainer>
                  <Button
                    onClick={() =>
                      onArrowsBtnClick({
                        direction: "UP",
                        dataInfo: arrowBtnClickPara,
                      })
                    }
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="chevron-up"
                  ></Button>
                  <Button
                    onClick={() =>
                      onArrowsBtnClick({
                        direction: "DOWN",
                        dataInfo: arrowBtnClickPara,
                      })
                    }
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="chevron-down"
                  ></Button>

                  <Button
                    //onClick={onSaveMtrClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "600px" }}
                data={process(
                  detailColumnDataResult.data.map((row) => ({
                    ...row,
                    sort_order: row.sort_order === -1 ? "N" : "Y",
                    [SELECTED_FIELD]:
                      detailColumnSelectedState[detailColumnIdGetter(row)],
                  })),
                  detailColumnDataState
                )}
                {...detailColumnDataState}
                onDataStateChange={onDetailColumnDataStateChange}
                //선택 기능
                dataItemKey={DETAIL_COLUMN_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "multiple",
                }}
                onSelectionChange={onDetailColumnSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detailColumnDataResult.total}
                onScroll={onDetailColumnScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onDetailColumnSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                //incell 수정 기능
                onItemChange={onDetailColumnItemChange}
                cellRender={detailColumnCellRender}
                rowRender={detailColumnRowRender}
                editField={EDIT_FIELD}
              >
                {/* <GridColumn cell={ArrowsCell} width="55px" /> */}

                <GridColumn
                  field="rowstatus"
                  title=" "
                  width="40px"
                  editable={false}
                />
                <GridColumn field="caption" title="컬럼" editable={false} />
                <GridColumn field="sort_order" title="컬럼 보이기" />
                <GridColumn field="width" title="너비" editor={"numeric"} />
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>

      {columnWindowVisible && (
        <ColumnWindow
          getVisible={setColumnWindowVisible}
          workType={columnWindowWorkType}
          parentComponent={parentComponent}
          reloadData={reloadData}
        />
      )}

      {defaultWindowVisible && (
        <DefaultWindow
          getVisible={setDefaultWindowVisible}
          workType={defaultWindowWorkType}
          option_id={processType}
          reloadData={reloadData}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
