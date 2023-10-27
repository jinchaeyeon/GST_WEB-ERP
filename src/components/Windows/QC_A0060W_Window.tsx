import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedNameState
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  setDefaultDate,
  toDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../Renderers/Renderers";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import CopyWindow2 from "./MA_A2500W_Order_Window";

type IWindow = {
  workType: "N" | "U" | "R";
  data?: Idata;
  setVisible(t: boolean): void;
  reloadData(workType: string): void;
  rev: boolean;
  modal?: boolean;
};

type TdataArr = {
  rowstatus_d: string[];
  stdseq_d: string[];
  inspeccd_d: string[];
  qc_gubun_d: string[];
  qc_sort_d: string[];
  qc_unit_d: string[];
  qc_spec_d: string[];
  qc_base_d: string[];
  qc_min_d: string[];
  qc_max_d: string[];
  qc_scope1_d: string[];
  qc_scope2_d: string[];
  chkmed_d: string[];
  cycle_d: string[];
  qty_d: string[];
  remark_d: string[];
};

type Idata = {
  attdatnum: string;
  files: string;
  insiz: string;
  itemcd: string;
  itemnm: string;
  itemno: string;
  location: string;
  mngnum: string;
  proccd: string;
  prodline: string;
  qcgb: string;
  qcyn: string;
  recdt: string;
  remark1: string;
  rev: string;
  rev_reason: string;
  stdnum: string;
  stdrev: number;
};
let deletedMainRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_QC100,L_QC120,L_QC017", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "inspeccd"
      ? "L_QC100"
      : field === "qc_gubun"
      ? "L_QC120"
      : field === "chkmed"
      ? "L_QC017"
      : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};
let temp = 0;
let temp2 = 0;
const CopyWindow = ({
  workType,
  data,
  setVisible,
  reloadData,
  rev,
  modal = false,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 900,
  });
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const DATA_ITEM_KEY = "num";
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const companyCode = loginResult ? loginResult.companyCode : "";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const pathname: string = window.location.pathname.replace("/", "");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U" && workType != "R") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "new"
      );
      setFilters((prev) => ({
        ...prev,
        proccd: defaultOption.find((item: any) => item.id === "proccd")
          .valueCode,
        qcgb: defaultOption.find((item: any) => item.id === "qcgb").valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        recdt: setDefaultDate(customOptionData, "recdt"),
      }));
    }
  }, [customOptionData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [CopyWindowVisible, setCopyWindowVisible] = useState<boolean>(false);

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

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
    if (unsavedName.length > 0) setDeletedName(unsavedName);
    setVisible(false);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
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

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    mngnum: "",
    stdrev: 0,
    recdt: new Date(),
    location: "",
    itemcd: "",
    itemnm: "",
    qcgb: "",
    proccd: "",
    attdatnum: "",
    files: "",
    rev_reason: "",
    remark: "",
    stdnum: "",
    rev: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_QC_A0060W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": "01",
        "@p_location": filters.location,
        "@p_mngnum": filters.mngnum,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_proccd": filters.proccd,
        "@p_stdnum": filters.stdnum,
        "@p_stdrev": filters.stdrev,
        "@p_qcgb": filters.qcgb,
        "@p_rev": filters.rev,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) =>
        workType == "R"
          ? {
              ...row,
              rowstatus: row.rowstatus === undefined ? "N" : row.rowstatus,
            }
          : {
              ...row,
            }
      );
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (workType != "N" && filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (workType !== "N" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        mngnum: data.mngnum,
        stdrev: data.stdrev,
        recdt: toDate(data.recdt),
        location: data.location,
        itemcd: data.itemcd,
        itemnm: data.itemnm,
        qcgb: data.qcgb,
        proccd: data.proccd,
        attdatnum: workType == "R" ? "" : data.attdatnum,
        files: workType == "R" ? "" : data.files,
        rev_reason: data.rev_reason,
        remark: data.remark1,
        stdnum: data.stdnum,
        rev: data.rev,
        isSearch: true,
        pgNum: 1,
      }));
    }
  }, []);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const setCopyData = (data: any) => {
    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0) return false;

    mainDataResult.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    for (var i = 0; i < data.length; i++) {
      data[i].num = ++temp2;
    }

    setFilters((prev) => ({
      ...prev,
      custcd: data[0].custcd,
      custnm: data[0].custnm,
    }));
    try {
      data.map((item: any) => {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, item],
            total: prev.total + 1,
          };
        });
      });
    } catch (e) {
      alert(e);
    }
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    let valid = true;

    for (var i = 0; i < mainDataResult.data.length; i++) {
      for (var j = i + 1; j < mainDataResult.data.length; j++) {
        if (
          mainDataResult.data[i].qc_sort == mainDataResult.data[j].qc_sort &&
          valid == true
        ) {
          alert("검사순번이 겹칩니다. 수정해주세요.");
          valid = false;
          return false;
        }
      }
    }

    try {
      if (mainDataResult.data.length == 0) {
        throw findMessage(messagesData, "QC_A0060W_005");
      } else if (
        convertDateToStr(filters.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.recdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.recdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.recdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A0060W_001");
      } else if (
        filters.itemnm == null ||
        filters.itemnm == "" ||
        filters.itemnm == undefined
      ) {
        throw findMessage(messagesData, "QC_A0060W_002");
      } else if (
        filters.location == null ||
        filters.location == "" ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "QC_A0060W_003");
      } else if (
        filters.proccd == null ||
        filters.proccd == "" ||
        filters.proccd == undefined
      ) {
        throw findMessage(messagesData, "QC_A0060W_004");
      } else if (
        mainDataResult.data.filter((item) => item.inspeccd == "").length > 0
      ) {
        throw findMessage(messagesData, "QC_A0060W_006");
      } else if (
        mainDataResult.data.filter((item) => item.qc_gubun == "").length > 0
      ) {
        throw findMessage(messagesData, "QC_A0060W_007");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length > 0) {
      let dataArr: TdataArr = {
        rowstatus_d: [],
        stdseq_d: [],
        inspeccd_d: [],
        qc_gubun_d: [],
        qc_sort_d: [],
        qc_unit_d: [],
        qc_spec_d: [],
        qc_base_d: [],
        qc_min_d: [],
        qc_max_d: [],
        qc_scope1_d: [],
        qc_scope2_d: [],
        chkmed_d: [],
        cycle_d: [],
        qty_d: [],
        remark_d: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          stdseq = "",
          inspeccd = "",
          qc_gubun = "",
          qc_sort = "",
          qc_unit = "",
          qc_spec = "",
          qc_base = "",
          qc_min = "",
          qc_max = "",
          qc_scope1 = "",
          qc_scope2 = "",
          chkmed = "",
          cycle = "",
          qty = "",
          remark = "",
        } = item;

        dataArr.rowstatus_d.push(workType == "R" ? "N" : rowstatus);
        dataArr.stdseq_d.push(stdseq);
        dataArr.inspeccd_d.push(inspeccd);
        dataArr.qc_gubun_d.push(qc_gubun);
        dataArr.qc_sort_d.push(qc_sort);
        dataArr.qc_unit_d.push(qc_unit);
        dataArr.qc_spec_d.push(qc_spec);
        dataArr.qc_base_d.push(qc_base);
        dataArr.qc_min_d.push(qc_min);
        dataArr.qc_max_d.push(qc_max);
        dataArr.qc_scope1_d.push(qc_scope1);
        dataArr.qc_scope2_d.push(qc_scope2);
        dataArr.chkmed_d.push(chkmed);
        dataArr.cycle_d.push(cycle);
        dataArr.qty_d.push(qty);
        dataArr.remark_d.push(remark);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          stdseq = "",
          inspeccd = "",
          qc_gubun = "",
          qc_sort = "",
          qc_unit = "",
          qc_spec = "",
          qc_base = "",
          qc_min = "",
          qc_max = "",
          qc_scope1 = "",
          qc_scope2 = "",
          chkmed = "",
          cycle = "",
          qty = "",
          remark = "",
        } = item;

        dataArr.rowstatus_d.push(workType == "R" ? "N" : rowstatus);
        dataArr.stdseq_d.push(stdseq);
        dataArr.inspeccd_d.push(inspeccd);
        dataArr.qc_gubun_d.push(qc_gubun);
        dataArr.qc_sort_d.push(qc_sort);
        dataArr.qc_unit_d.push(qc_unit);
        dataArr.qc_spec_d.push(qc_spec);
        dataArr.qc_base_d.push(qc_base);
        dataArr.qc_min_d.push(qc_min);
        dataArr.qc_max_d.push(qc_max);
        dataArr.qc_scope1_d.push(qc_scope1);
        dataArr.qc_scope2_d.push(qc_scope2);
        dataArr.chkmed_d.push(chkmed);
        dataArr.cycle_d.push(cycle);
        dataArr.qty_d.push(qty);
        dataArr.remark_d.push(remark);
      });

      setParaData((prev) => ({
        ...prev,
        workType: workType == "R" ? "REV" : workType,
        dptcd: "",
        stdnum: filters.stdnum,
        stdrev: filters.stdrev,
        qcgb: filters.qcgb,
        itemcd: filters.itemcd,
        proccd: filters.proccd,
        recdt: filters.recdt,
        attdatnum: filters.attdatnum,
        remark1: filters.remark,
        mngnum: filters.mngnum,
        rev_reason: filters.rev_reason,
        userid: userId,
        pc: pc,
        form_id: "MA_A2400W",
        serviceid: companyCode,
        rowstatus_d: dataArr.rowstatus_d.join("|"),
        stdseq_d: dataArr.stdseq_d.join("|"),
        inspeccd_d: dataArr.inspeccd_d.join("|"),
        qc_gubun_d: dataArr.qc_gubun_d.join("|"),
        qc_sort_d: dataArr.qc_sort_d.join("|"),
        qc_unit_d: dataArr.qc_unit_d.join("|"),
        qc_spec_d: dataArr.qc_spec_d.join("|"),
        qc_base_d: dataArr.qc_base_d.join("|"),
        qc_min_d: dataArr.qc_min_d.join("|"),
        qc_max_d: dataArr.qc_max_d.join("|"),
        qc_scope1_d: dataArr.qc_scope1_d.join("|"),
        qc_scope2_d: dataArr.qc_scope2_d.join("|"),
        chkmed_d: dataArr.chkmed_d.join("|"),
        cycle_d: dataArr.cycle_d.join("|"),
        qty_d: dataArr.qty_d.join("|"),
        remark_d: dataArr.remark_d.join("|"),
      }));
    } else {
      setParaData((prev) => ({
        ...prev,
        workType: workType == "R" ? "REV" : workType,
        dptcd: "",
        stdnum: filters.stdnum,
        stdrev: filters.stdrev,
        qcgb: filters.qcgb,
        itemcd: filters.itemcd,
        proccd: filters.proccd,
        recdt: filters.recdt,
        attdatnum: filters.attdatnum,
        remark1: filters.remark,
        mngnum: filters.mngnum,
        rev_reason: filters.rev_reason,
        userid: userId,
        pc: pc,
        form_id: "MA_A2400W",
        serviceid: companyCode,
      }));
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: "01",
    location: "01",
    dptcd: "",
    stdnum: "",
    stdrev: 0,
    qcgb: "",
    itemcd: "",
    proccd: "",
    recdt: new Date(),
    attdatnum: "",
    remark1: "",
    mngnum: "",
    rev_reason: "",
    rowstatus_d: "",
    stdseq_d: "",
    inspeccd_d: "",
    qc_gubun_d: "",
    qc_sort_d: "",
    qc_unit_d: "",
    qc_spec_d: "",
    qc_base_d: "",
    qc_min_d: "",
    qc_max_d: "",
    qc_scope1_d: "",
    qc_scope2_d: "",
    chkmed_d: "",
    cycle_d: "",
    qty_d: "",
    remark_d: "",
  });

  const para: Iparameters = {
    procedureName: "P_QC_A0060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_dptcd": ParaData.dptcd,
      "@p_stdnum": ParaData.stdnum,
      "@p_stdrev": ParaData.stdrev,
      "@p_qcgb": ParaData.qcgb,
      "@p_itemcd": ParaData.itemcd,
      "@p_proccd": ParaData.proccd,
      "@p_recdt": convertDateToStr(ParaData.recdt),
      "@p_attdatnum": ParaData.attdatnum,
      "@p_remark1": ParaData.remark1,
      "@p_mngnum": ParaData.mngnum,
      "@p_rev_reason": ParaData.rev_reason,
      "@p_rowstatus_d": ParaData.rowstatus_d,
      "@p_stdseq_d": ParaData.stdseq_d,
      "@p_inspeccd_d": ParaData.inspeccd_d,
      "@p_qc_gubun_d": ParaData.qc_gubun_d,
      "@p_qc_sort_d": ParaData.qc_sort_d,
      "@p_qc_unit_d": ParaData.qc_unit_d,
      "@p_qc_spec_d": ParaData.qc_spec_d,
      "@p_qc_base_d": ParaData.qc_base_d,
      "@p_qc_min_d": ParaData.qc_min_d,
      "@p_qc_max_d": ParaData.qc_max_d,
      "@p_qc_scope1_d": ParaData.qc_scope1_d,
      "@p_qc_scope2_d": ParaData.qc_scope2_d,
      "@p_chkmed_d": ParaData.chkmed_d,
      "@p_cycle_d": ParaData.cycle_d,
      "@p_qty_d": ParaData.qty_d,
      "@p_remark_d": ParaData.remark_d,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_QC_A0060W",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      deletedMainRows = []; //초기화
      if (workType == "U") {
        reloadData(data.returnString);
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
        }));
      } else {
        reloadData(data.returnString);
        setVisible(false);
      }
      setUnsavedName([]);
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: "01",
        location: "01",
        dptcd: "",
        stdnum: "",
        stdrev: 0,
        qcgb: "",
        itemcd: "",
        proccd: "",
        recdt: new Date(),
        attdatnum: "",
        remark1: "",
        mngnum: "",
        rev_reason: "",
        rowstatus_d: "",
        stdseq_d: "",
        inspeccd_d: "",
        qc_gubun_d: "",
        qc_sort_d: "",
        qc_unit_d: "",
        qc_spec_d: "",
        qc_base_d: "",
        qc_min_d: "",
        qc_max_d: "",
        qc_scope1_d: "",
        qc_scope2_d: "",
        chkmed_d: "",
        cycle_d: "",
        qty_d: "",
        remark_d: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
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

  const enterEdit = (dataItem: any, field: string) => {
    let valid = true;
    const datas = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    if (field != "rowstatus" && field != "qc_min" && field != "qc_max") {
      if (field == "qc_base") {
        if (datas.qc_gubun == "11" || datas.qc_gubun == "") {
          valid = false;
        }
      } else if (field == "qc_scope1") {
        if (
          datas.qc_gubun == "02" ||
          datas.qc_gubun == "03" ||
          datas.qc_gubun == "10" ||
          datas.qc_gubun == "11" ||
          datas.qc_gubun == ""
        ) {
          valid = false;
        }
      } else if (field == "qc_scope2") {
        if (
          datas.qc_gubun == "01" ||
          datas.qc_gubun == "04" ||
          datas.qc_gubun == "05" ||
          datas.qc_gubun == "06" ||
          datas.qc_gubun == "02" ||
          datas.qc_gubun == "03" ||
          datas.qc_gubun == "10" ||
          datas.qc_gubun == "11" ||
          datas.qc_gubun == ""
        ) {
          valid = false;
        }
      } else if (field == "qc_spec") {
        if (
          datas.qc_gubun == "01" ||
          datas.qc_gubun == "04" ||
          datas.qc_gubun == "05" ||
          datas.qc_gubun == "06" ||
          datas.qc_gubun == "02" ||
          datas.qc_gubun == "03" ||
          datas.qc_gubun == "10" ||
          datas.qc_gubun == "" ||
          datas.qc_gubun == "07" ||
          datas.qc_gubun == "08" ||
          datas.qc_gubun == "09"
        ) {
          valid = false;
        }
      }

      if (valid == true) {
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
            ? {
                ...item,
                [EDIT_FIELD]: field,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setTempResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setMainDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        setTempResult((prev) => {
          return {
            data: mainDataResult.data,
            total: prev.total,
          };
        });
      }
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              qc_scope1:
                item.qc_gubun == "02" ||
                item.qc_gubun == "03" ||
                item.qc_gubun == "10"
                  ? 0
                  : item.qc_scope1,
              qc_scope2:
                item.qc_gubun == "01" ||
                item.qc_gubun == "02" ||
                item.qc_gubun == "03" ||
                item.qc_gubun == "04" ||
                item.qc_gubun == "05" ||
                item.qc_gubun == "06" ||
                item.qc_gubun == "10"
                  ? 0
                  : item.qc_scope2,
              qc_min:
                item.qc_gubun == "01"
                  ? item.qc_base - item.qc_scope1
                  : item.qc_gubun == "03"
                  ? item.qc_base
                  : item.qc_gubun == "04"
                  ? item.qc_base
                  : item.qc_gubun == "05"
                  ? item.qc_base - item.qc_scope1
                  : item.qc_gubun == "06"
                  ? item.qc_base
                  : item.qc_gubun == "07"
                  ? item.qc_base - item.qc_scope1
                  : item.qc_gubun == "08"
                  ? item.qc_base - item.qc_scope1
                  : item.qc_gubun == "09"
                  ? item.qc_base + item.qc_scope1
                  : 0,
              qc_max:
                item.qc_gubun == "01"
                  ? item.qc_base + item.qc_scope1
                  : item.qc_gubun == "02"
                  ? item.qc_base
                  : item.qc_gubun == "04"
                  ? item.qc_base + item.qc_scope1
                  : item.qc_gubun == "05"
                  ? item.qc_base
                  : item.qc_gubun == "06"
                  ? item.qc_scope1
                  : item.qc_gubun == "07"
                  ? item.qc_base + item.qc_scope2
                  : item.qc_gubun == "08"
                  ? item.qc_base - item.qc_scope2
                  : item.qc_gubun == "09"
                  ? item.qc_base + item.qc_scope2
                  : 0,
              qc_spec:
                item.qc_gubun == "01"
                  ? `${item.qc_base - item.qc_scope1}${item.qc_unit} - ${
                      item.qc_base + item.qc_scope1
                    }${item.qc_unit}`
                  : item.qc_gubun == "02"
                  ? `${item.qc_base}${item.qc_unit} 이하`
                  : item.qc_gubun == "03"
                  ? `${item.qc_base}${item.qc_unit} 이상`
                  : item.qc_gubun == "04"
                  ? `${item.qc_base}${item.qc_unit} - ${
                      item.qc_base + item.qc_scope1
                    }${item.qc_unit}`
                  : item.qc_gubun == "05"
                  ? `${item.qc_base - item.qc_scope1}${item.qc_unit} - ${
                      item.qc_base
                    }${item.qc_unit}`
                  : item.qc_gubun == "06"
                  ? `${item.qc_base}${item.qc_unit} - ${item.qc_scope1}${item.qc_unit}`
                  : item.qc_gubun == "07"
                  ? `${item.qc_base - item.qc_scope1}${item.qc_unit} - ${
                      item.qc_base + item.qc_scope2
                    }${item.qc_unit}`
                  : item.qc_gubun == "08"
                  ? `${item.qc_base - item.qc_scope1}${item.qc_unit} - ${
                      item.qc_base - item.qc_scope2
                    }${item.qc_unit}`
                  : item.qc_gubun == "09"
                  ? `${item.qc_base + item.qc_scope1}${item.qc_unit} - ${
                      item.qc_base + item.qc_scope2
                    }${item.qc_unit}`
                  : item.qc_gubun == "10"
                  ? `${item.qc_base}${item.qc_unit} 고정`
                  : item.qc_spec,
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_QC003",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qcgbListData, setQcgbListData] = useState([COM_CODE_DEFAULT_VALUE]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const qcgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_QC003")
      );

      fetchQuery(qcgbQueryStr, setQcgbListData);
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

  const onAddClick = () => {
    let stdnums = data == undefined ? "" : data.stdnum;
    let stdrevs = data == undefined ? "" : data.stdrev;

    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      rowstatus: "N",
      chkmed: "",
      cycle: "",
      inspeccd: "",
      qc_base: 0,
      qc_gubun: "",
      qc_min: 0,
      qc_max: 0,
      qc_scope1: 0,
      qc_scope2: 0,
      qc_sort: 0,
      qc_spec: "",
      qc_unit: "",
      qty: 0,
      remark: "",
      stdnum: stdnums,
      stdrev: stdrevs,
      stdseq: 0,
    };
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  return (
    <>
      <Window
        title={workType === "N" ? "검사표준서생성" : "검사표준서정보"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap style={{ paddingRight: "50px" }}>
          <FormBox>
            <tbody>
              <tr>
                <th>관리번호</th>
                <td>
                  <Input
                    name="mngnum"
                    type="text"
                    value={filters.mngnum}
                    onChange={filterInputChange}
                  />
                </td>
                <th>Rev</th>
                <td>
                  <Input
                    name="stdrev"
                    type="text"
                    value={filters.stdrev}
                    className="readonly"
                  />
                </td>
                <th>작성일</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="recdt"
                      value={filters.recdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </div>
                </td>
                <th>사업장</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="location"
                      value={filters.location}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
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
                    className="readonly"
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
                    className="readonly"
                  />
                </td>
                <th>검사구분</th>
                {workType == "N" ? (
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="qcgb"
                        value={filters.qcgb}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                ) : (
                  <td>
                    <Input
                      name="qcgb"
                      type="text"
                      value={
                        qcgbListData.find(
                          (item: any) => item.sub_code === filters.qcgb
                        )?.code_name
                      }
                      className="readonly"
                    />
                  </td>
                )}
                <th>공정</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="proccd"
                      value={filters.proccd}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>첨부파일</th>
                <td colSpan={3}>
                  <Input
                    name="files"
                    type="text"
                    value={filters.files}
                    className="readonly"
                  />
                  <ButtonInInput>
                    <Button
                      type={"button"}
                      onClick={onAttachmentsWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>리비전사유</th>
                <td colSpan={3}>
                  <Input
                    name="rev_reason"
                    type="text"
                    value={filters.rev_reason}
                    onChange={rev == false ? undefined : filterInputChange}
                    className={rev == false ? "readonly" : ""}
                  />
                </td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={7}>
                  <TextArea
                    value={filters.remark}
                    name="remark"
                    rows={2}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "510px" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                rowstatus:
                  row.rowstatus == null ||
                  row.rowstatus == "" ||
                  row.rowstatus == undefined
                    ? ""
                    : row.rowstatus,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 subDataState
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
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="rowstatus"
              title=" "
              width="50px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field="qc_sort"
              title="검사순번"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="inspeccd"
              title="검사항목"
              width="150px"
              cell={CustomComboBoxCell}
              headerCell={RequiredHeader}
            />
            <GridColumn
              field="qc_gubun"
              title="측정구분"
              width="150px"
              cell={CustomComboBoxCell}
              headerCell={RequiredHeader}
            />
            <GridColumn
              field="qc_base"
              title="측정기준값"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="qc_scope1"
              title="범위계산1"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="qc_scope2"
              title="범위계산2"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="qc_min"
              title="하한값"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="qc_max"
              title="상한값"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn field="qc_spec" title="측정기준명" width="150px" />
            <GridColumn field="qc_unit" title="측정단위" width="150px" />
            <GridColumn
              field="chkmed"
              title="측정기"
              width="150px"
              cell={CustomComboBoxCell}
            />
            <GridColumn field="cycle" title="주기" width="100px" />
            <GridColumn field="remark" title="비고" width="250px" />
          </Grid>
        </GridContainer>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              저장
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
      {CopyWindowVisible && (
        <CopyWindow2 setVisible={setCopyWindowVisible} setData={setCopyData} />
      )}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
        />
      )}
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
