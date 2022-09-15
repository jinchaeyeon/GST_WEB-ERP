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
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../../CommonStyled";
import { Iparameters } from "../../../store/types";
import { chkScrollHandler, getGridItemChangedData } from "../../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";

import ColumnWindow from "./UserOptionsColumnWindow";
import DefaultWindow from "./UserOptionsDefaultWindow";
import { IWindowPosition } from "../../../hooks/interfaces";
import { EDIT_FIELD, pageSize, SELECTED_FIELD } from "../../CommonString";

import { CellRender, RowRender } from "../../Renderers";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";

type TKendoWindow = {
  getVisible(t: boolean): void;
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

  const MAIN_COLUMN_DATA_ITEM_KEY = "option_id";
  const DETAIL_COLUMN_DATA_ITEM_KEY = "column_id";
  const MAIN_DEFAULT_DATA_ITEM_KEY = "option_id";
  const DETAIL_DEFAULT_DATA_ITEM_KEY = "default_id";

  const mainColumnIdGetter = getter(MAIN_COLUMN_DATA_ITEM_KEY);
  const detailColumnIdGetter = getter(DETAIL_COLUMN_DATA_ITEM_KEY);
  const mainDefaultIdGetter = getter(MAIN_DEFAULT_DATA_ITEM_KEY);
  const detailDefaultIdGetter = getter(DETAIL_DEFAULT_DATA_ITEM_KEY);

  const [mainColumnDataState, setMainColumnDataState] = useState<State>({});
  const [detailColumnDataState, setDetailColumnDataState] = useState<State>({
    sort: [],
  });
  const [mainDefaultDataState, setMainDefaultDataState] = useState<State>({});
  const [detailDefaultDataState, setDetailDefaultDataState] = useState<State>({
    sort: [],
  });

  const [mainColumnDataResult, setMainColumnDataResult] = useState<DataResult>(
    process([], mainColumnDataState)
  );
  const [detailColumnDataResult, setDetailColumnDataResult] =
    useState<DataResult>(process([], detailColumnDataState));

  const [mainDefaultDataResult, setMainDefaultDataResult] =
    useState<DataResult>(process([], mainDefaultDataState));
  const [detailDefaultDataResult, setDetailDefaultDataResult] =
    useState<DataResult>(process([], detailDefaultDataState));

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
    if (tabSelected === 0) {
      fetchMainDefault();
    } else {
      fetchMainColumn();
    }
  }, [tabSelected]);

  const pathname: string = window.location.pathname.replace("/", "");

  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "WEB_sys_sel_column_view_config",
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
  const defaultMainParameters: Iparameters = {
    procedureName: "WEB_sys_sel_default_management",
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
    procedureName: "WEB_sys_sel_column_view_config",
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
    procedureName: "WEB_sys_sel_default_management",
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
      alert(
        "[" +
          data.result.statusCode +
          "] 처리 중 오류가 발생하였습니다. " +
          data.result.resultMessage
      );
    }

    paraData.work_type = ""; //초기화
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
  }, [paraData]);

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
    dbname: "SYSTEM",
    form_id: pathname,
    component: "",
    parent_component: "",
    message_id: "",
    field_name: "",
    word_id: "",
    caption: "",
    rowstatus_s: "",
    column_visible: "",
    column_width: "",
    user_edit_yn: "",
    user_required_yn: "",
    column_type: "",
    column_className: "",
    exec_pc: "",
  });
  const [defaultParaDataDeleted, setDefaultParaDataDeleted] = useState({
    work_type: "",
    process_type: "",
    form_id: pathname,
  });

  //프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "WEB_sys_sav_column_view_config",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_dbname": paraDataDeleted.dbname,
      "@p_form_id": paraDataDeleted.form_id,
      "@p_component": paraDataDeleted.component,
      "@p_parent_component": paraDataDeleted.parent_component,
      "@p_message_id": paraDataDeleted.message_id,
      "@p_field_name": paraDataDeleted.field_name,
      "@p_word_id": paraDataDeleted.word_id,
      "@p_caption": paraDataDeleted.caption,
      "@p_rowstatus_s": paraDataDeleted.rowstatus_s,
      "@p_column_visible": paraDataDeleted.column_visible,
      "@p_column_width": paraDataDeleted.column_width,
      "@p_user_edit_yn": paraDataDeleted.user_edit_yn,
      "@p_user_required_yn": paraDataDeleted.user_required_yn,
      "@p_column_type": paraDataDeleted.column_type,
      "@p_column_className": paraDataDeleted.column_className,
      "@p_exec_pc": paraDataDeleted.exec_pc,
    },
  };
  const defaultParaDeleted: Iparameters = {
    procedureName: "WEB_sys_sav_default_management",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": defaultParaDataDeleted.work_type,
      "@p_process_type": defaultParaDataDeleted.process_type,
      "@p_form_id": defaultParaDataDeleted.form_id,
      "@p_component": "",
      "@p_parent_component": "",
      "@p_field_name": "",
      "@p_word_id": "",
      "@p_caption": "",
      "@p_biz_component_id": "",
      "@p_where_query": "",
      "@p_add_empty_row": "",
      "@p_repository_item": "",
      "@p_component_type": "",
      "@p_component_full_type": "",
      "@p_sort_seq": "",
      "@p_message_id": "",
      "@p_value_type": "",
      "@p_value": "",
      "@p_value_name": "",
      "@p_add_year": "",
      "@p_add_month": "",
      "@p_add_day": "",
      "@p_user_edit_yn": "",
      "@p_use_session": "",
      "@p_allow_session": "",
      "@p_session_item": "",
      "@p_exec_pc": "",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "DELETE") fetchToDelete(paraDeleted);
  }, [paraDataDeleted]);

  useEffect(() => {
    if (defaultParaDataDeleted.work_type === "DELETE")
      fetchToDelete(defaultParaDeleted);
  }, [defaultParaDataDeleted]);

  const fetchToDelete = async (para: any) => {
    let data: any;

    console.log("defaultParaDeleted");
    console.log(defaultParaDeleted);
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
      alert(
        "[" +
          data.result.statusCode +
          "] 처리 중 오류가 발생하였습니다. " +
          data.result.resultMessage
      );
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.parent_component = "";
    defaultParaDataDeleted.work_type = "";
    defaultParaDataDeleted.process_type = "";
  };

  const onDeleteColumnClick = () => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    const parent_component = Object.getOwnPropertyNames(
      mainColumnSelectedState
    )[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "DELETE",
      parent_component,
    }));
  };

  const onDeleteDefaultClick = () => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    const process_type = Object.getOwnPropertyNames(
      mainDefaultSelectedState
    )[0];

    setDefaultParaDataDeleted((prev) => ({
      ...prev,
      work_type: "DELETE",
      process_type,
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
