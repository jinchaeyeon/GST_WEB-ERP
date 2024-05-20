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
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  checkIsDDLValid,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getCodeFromValue,
  getGridItemChangedData,
  getHeight,
  handleKeyPressSearch
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/GroupRenderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import PlanWindow from "../components/Windows/PR_A1100W_Window";
import { useApi } from "../hooks/api";
import { heightstate, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/PR_A1100W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

// 그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const PLAN_DATA_ITEM_KEY = "num";
const MATERIAL_DATA_ITEM_KEY = "num";

const numberField = [
  "safeqty",
  "stockqty",
  "stockwgt",
  "unp",
  "baseqty",
  "basewgt",
  "inqty",
  "inwgt",
  "outqty",
  "outwgt",
  "amt",
  "bnatur_insiz",
  "procqty",
  "qty",
  "planqty",
  "baseamt",
  "wonchgrat",
  "uschgrat",
  "unp",
  "wonamt",
  "taxamt",
  "amt",
  "dlramt",
  "procseq",
  "unitqty",
  "bf_qty",
];
const numberField2 = [
  "safeqty",
  "outqty",
  "amt",
  "qty",
  "planqty",
  "baseamt",
  "wonamt",
  "taxamt",
  "amt",
  "dlramt",
  "bf_qty",
  "procqty",
  "unitqty",
];
const dateField = ["finexpdt", "plandt", "orddt", "dlvdt", "outdt", "indt"];
const lookupField = ["outprocyn", "proccd", "qtyunit", "outgb"];

let deletedPlanRows: object[] = [];
let deletedMaterialRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_PR010,L_BA011,L_BA015,L_BA041", setBizComponentData);
  // 공정,외주구분,수량단위,자재사용구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "proccd"
      ? "L_PR010"
      : field == "outprocyn"
      ? "L_BA011"
      : field == "qtyunit"
      ? "L_BA015"
      : field == "outgb"
      ? "L_BA041"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};
let temp = 0;
let temp2 = 0;
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;

const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

const PR_A1100W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".k-tabstrip-items-wrapper");
  var height1 = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [group, setGroup] = React.useState(initialGroup);
  const [group2, setGroup2] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [total2, setTotal2] = useState(0);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
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

    setMaterialFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
    setPage3(initialPageState);
    setFilters((prev) => ({
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

    setMaterialFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const idGetter = getter(DATA_ITEM_KEY);
  const planIdGetter = getter(PLAN_DATA_ITEM_KEY);
  const materialIdGetter = getter(MATERIAL_DATA_ITEM_KEY);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("PR_A1100W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_A1100W", setCustomOptionData);

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    deletedMaterialRows = [];
    deletedPlanRows = [];
    resetAllGrid();
    setValues(false);
    setValues2(false);
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setTabSelected(e.selected);
  };

  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );

  const [resultState2, setResultState2] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [planDataState, setPlanDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setMaterialDataState] = useState<State>({
    sort: [],
  });

  const [ordkey, setOrdkey] = useState("");
  const [itemcd, setItemcd] = useState("");

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;

      setOrdkey(rowData.ordkey);
      setItemcd(rowData.itemcd);

      setWorkType("N");
      setPlanWindowVisible(true);
    };

    return (
      <>
        {props.rowType == "groupHeader" ? null : (
          <td className="k-command-cell">
            <Button
              className="k-grid-edit-command"
              themeColor={"primary"}
              onClick={onEditClick}
            >
              계획처리
            </Button>
          </td>
        )}
      </>
    );
  };
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [planDataResult, setPlanDataResult] = useState<DataResult>(
    process([], planDataState)
  );

  const [materialDataResult, setMaterialDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [planSelectedState, setPlanSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [materialSelectedState, setMaterialSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [planWindowVisible, setPlanWindowVisible] = useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);
  const [collapsedState2, setCollapsedState2] = React.useState<string[]>([]);
  const [workType, setWorkType] = useState("");

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

  const initFrdt = new Date();
  initFrdt.setMonth(initFrdt.getMonth() - 3);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dtgb: "A",
    frdt: initFrdt,
    todt: new Date(),
    custcd: "",
    custnm: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    poregnum: "",
    ordnum: "",
    ordseq: "",
    ordkey: "",
    plankey: "",
    ordyn: "%",
    planyn: "N",
    cboOrdsts: "",
    remark: "",
    lotno: "",
    dptcd: "",
    cboPerson: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [materialFilters, setMaterialFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    plankey: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    ordnum: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_SA_A2000W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_service_id": "",
      "@p_orgdiv": paraDataDeleted.orgdiv,
      "@p_location": "",
      "@p_ordnum": paraDataDeleted.ordnum,
      "@p_poregnum": "",
      "@p_project": "",
      "@p_ordtype": "",
      "@p_ordsts": "",
      "@p_taxdiv": "",
      "@p_orddt": "",
      "@p_dlvdt": "",
      "@p_dptcd": "",
      "@p_person": "",
      "@p_amtunit": "",
      "@p_portnm": "",
      "@p_finaldes": "",
      "@p_paymeth": "",
      "@p_prcterms": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_rcvcustcd": "",
      "@p_rcvcustnm": "",
      "@p_wonchgrat": "0",
      "@p_uschgrat": "0",
      "@p_doexdiv": "",
      "@p_remark": "",
      "@p_attdatnum": "",
      "@p_userid": userId,
      "@p_pc": "",
      "@p_ship_method": "",
      "@p_dlv_method": "",
      "@p_hullno": "",
      "@p_rowstatus_s": "",
      "@p_chk_s": "",
      "@p_ordseq_s": "",
      "@p_poregseq_s": "",
      "@p_itemcd_s": "",
      "@p_itemnm_s": "",
      "@p_itemacnt_s": "",
      "@p_insiz_s": "",
      "@p_bnatur_s": "",
      "@p_qty_s": "",
      "@p_qtyunit_s": "",
      "@p_totwgt_s": "",
      "@p_wgtunit_s": "",
      "@p_len_s": "",
      "@p_totlen_s": "",
      "@p_lenunit_s": "",
      "@p_thickness_s": "",
      "@p_width_s": "",
      "@p_length_s": "",
      "@p_unpcalmeth_s": "",
      "@p_unp_s": "",
      "@p_amt_s": "",
      "@p_taxamt_s": "",
      "@p_dlramt_s": "",
      "@p_wonamt_s": "",
      "@p_remark_s": "",
      "@p_pac_s": "",
      "@p_finyn_s": "",
      "@p_specialunp_s": "",
      "@p_lotnum_s": "",
      "@p_dlvdt_s": "",
      "@p_specialamt_s": "",
      "@p_heatno_s": "",
      "@p_bf_qty_s": "",
      "@p_form_id": "",
    },
  };

  //계획 저장 파라미터 초기값
  const [paraDataPlanSaved, setParaDataPlanSaved] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    //ordnum: "",
    location: sessionLocation,
    planqty: 0,
    rowstatus_s: "",
    ordnum_s: "",
    ordseq_s: "",
    orddt_s: "",
    dlvdt_s: "",
    ordsts_s: "",
    project_s: "",
    poregnum_s: "",
    amtunit_s: "",
    baseamt_s: "",
    wonchgrat_s: "",
    uschgrat_s: "",
    attdatnum_s: "",
    remark_s: "",
    custcd_s: "",
    custnm_s: "",
    dptcd_s: "",
    person_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    insiz_s: "",
    qty_s: "",
    bf_qty_s: "",
    unp_s: "",
    wonamt_s: "",
    taxamt_s: "",
    amt_s: "",
    dlramt_s: "",
    bnatur_s: "",
    planno_s: "",
    planseq_s: "",
    seq_s: "",
    unitqty_s: "",
    qtyunit_s: "",
    outgb_s: "",
    procqty_s: "",
    chlditemcd_s: "",
    qtyunit_s2: "",
    proccd_s2: "",
    plandt_s: "",
    finexpdt_s: "",
    prodmac_s: "",
    prodemp_s: "",
    proccd_s: "",
    procseq_s: "",
    outprocyn_s: "",
    lotnum_s: "",
    ordyn_s: "",
    userid: userId,
    pc: pc,
    purtype: "",
    urgencyyn: "",
    service_id: "",
    form_id: "PR_A1100W",
  });

  //계획 저장 파라미터
  const paraPlanSaved: Iparameters = {
    procedureName: "P_PR_A1100W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraDataPlanSaved.work_type,
      "@p_orgdiv": paraDataPlanSaved.orgdiv,
      "@p_location": paraDataPlanSaved.location,
      "@p_planqty": paraDataPlanSaved.planqty,
      "@p_rowstatus_s": paraDataPlanSaved.rowstatus_s,
      "@p_ordnum_s": paraDataPlanSaved.ordnum_s,
      "@p_ordseq_s": paraDataPlanSaved.ordseq_s,
      "@p_orddt_s": paraDataPlanSaved.orddt_s,
      "@p_dlvdt_s": paraDataPlanSaved.dlvdt_s,
      "@p_ordsts_s": paraDataPlanSaved.ordsts_s,
      "@p_project_s": paraDataPlanSaved.project_s,
      "@p_poregnum_s": paraDataPlanSaved.poregnum_s,
      "@p_amtunit_s": paraDataPlanSaved.amtunit_s,
      "@p_baseamt_s": paraDataPlanSaved.baseamt_s,
      "@p_wonchgrat_s": paraDataPlanSaved.wonchgrat_s,
      "@p_uschgrat_s": paraDataPlanSaved.uschgrat_s,
      "@p_attdatnum_s": paraDataPlanSaved.attdatnum_s,
      "@p_remark_s": paraDataPlanSaved.remark_s,
      "@p_custcd_s": paraDataPlanSaved.custcd_s,
      "@p_custnm_s": paraDataPlanSaved.custnm_s,
      "@p_dptcd_s": paraDataPlanSaved.dptcd_s,
      "@p_person_s": paraDataPlanSaved.person_s,
      "@p_itemcd_s": paraDataPlanSaved.itemcd_s,
      "@p_itemnm_s": paraDataPlanSaved.itemnm_s,
      "@p_itemacnt_s": paraDataPlanSaved.itemacnt_s,
      "@p_insiz_s": paraDataPlanSaved.insiz_s,
      "@p_qty_s": paraDataPlanSaved.qty_s,
      "@p_bf_qty_s": paraDataPlanSaved.bf_qty_s,
      "@p_unp_s": paraDataPlanSaved.unp_s,
      "@p_wonamt_s": paraDataPlanSaved.wonamt_s,
      "@p_taxamt_s": paraDataPlanSaved.taxamt_s,
      "@p_amt_s": paraDataPlanSaved.amt_s,
      "@p_dlramt_s": paraDataPlanSaved.dlramt_s,
      "@p_bnatur_s": paraDataPlanSaved.bnatur_s,
      "@p_planno_s": paraDataPlanSaved.planno_s,
      "@p_planseq_s": paraDataPlanSaved.planseq_s,
      "@p_seq_s": paraDataPlanSaved.seq_s,
      "@p_unitqty_s": paraDataPlanSaved.unitqty_s,
      "@p_qtyunit_s": paraDataPlanSaved.qtyunit_s,
      "@p_outgb_s": paraDataPlanSaved.outgb_s,
      "@p_procqty_s": paraDataPlanSaved.procqty_s,
      "@p_chlditemcd_s": paraDataPlanSaved.chlditemcd_s,
      "@p_qtyunit_s2": paraDataPlanSaved.qtyunit_s2,
      "@p_proccd_s2": paraDataPlanSaved.proccd_s2,
      "@p_plandt_s": paraDataPlanSaved.plandt_s,
      "@p_finexpdt_s": paraDataPlanSaved.finexpdt_s,
      "@p_prodmac_s": paraDataPlanSaved.prodmac_s,
      "@p_prodemp_s": paraDataPlanSaved.prodemp_s,
      "@p_proccd_s": paraDataPlanSaved.proccd_s,
      "@p_procseq_s": paraDataPlanSaved.procseq_s,
      "@p_outprocyn_s": paraDataPlanSaved.outprocyn_s,
      "@p_lotnum_s": paraDataPlanSaved.lotnum_s,
      "@p_ordyn_s": paraDataPlanSaved.ordyn_s,
      "@p_userid": paraDataPlanSaved.userid,
      "@p_pc": paraDataPlanSaved.pc,
      "@p_purtype": paraDataPlanSaved.purtype,
      "@p_urgencyyn": paraDataPlanSaved.urgencyyn,
      "@p_service_id": paraDataPlanSaved.service_id,
      "@p_form_id": paraDataPlanSaved.form_id,
    },
  };
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    //수주상세 조회 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A1100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_poregnum": filters.poregnum,
        "@p_ordnum": filters.ordnum,
        "@p_ordseq": filters.ordseq,
        "@p_ordkey": filters.ordkey,
        "@p_plankey": filters.plankey,
        "@p_ordyn ": filters.ordyn,
        "@p_planyn": filters.planyn,
        "@p_ordsts": filters.cboOrdsts,
        "@p_remark": filters.remark,
        "@p_lotno": filters.lotno,
        "@p_service_id": "",
        "@p_dptcd": filters.dptcd,
        "@p_person": filters.cboPerson,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    setLoading(true);
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
          groupId: row.ordnum + "ordnum",
          group_category_name: "수주번호" + " : " + row.ordnum,
        };
      });
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.ordnum + "-" + row.ordseq == filters.find_row_value
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
            : rows.find(
                (row: any) =>
                  row.ordnum + "-" + row.ordseq == filters.find_row_value
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

  const fetchPlanGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //생산계획 조회 파라미터
    const planParameters: Iparameters = {
      procedureName: "P_PR_A1100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "PLAN",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_poregnum": filters.poregnum,
        "@p_ordnum": filters.ordnum,
        "@p_ordseq": filters.ordseq,
        "@p_ordkey": filters.ordkey,
        "@p_plankey": filters.plankey,
        "@p_ordyn": filters.ordyn,
        "@p_planyn": filters.planyn,
        "@p_ordsts": filters.cboOrdsts,
        "@p_remark": filters.remark,
        "@p_lotno": filters.lotno,
        "@p_service_id": "",
        "@p_dptcd": filters.dptcd,
        "@p_person": filters.cboPerson,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", planParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        groupId: row.planno + "planno",
        group_category_name: "생산계획번호" + " : " + row.planno,
      }));
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.planno + "-" + row.planseq == filters.find_row_value
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
      const newDataState = processWithGroups(rows, group2);
      setPlanDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal2(totalRowCnt);
      setResultState2(newDataState);
      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.planno + "-" + row.planseq == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setPlanSelectedState({ [selectedRow[PLAN_DATA_ITEM_KEY]]: true });
          setMaterialFilters((prev) => ({
            ...prev,
            plankey: selectedRow.planno,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setPlanSelectedState({
            [rows[0][PLAN_DATA_ITEM_KEY]]: true,
          });
          setMaterialFilters((prev) => ({
            ...prev,
            plankey: rows[0].planno,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setMaterialDataResult(process([], detailDataState));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setMaterialFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMaterialGrid = async (materialFilters: any) => {
    let data: any;

    //소요자재리스트 조회 파라미터
    const detailParameters: Iparameters = {
      procedureName: "P_PR_A1100W_Q",
      pageNumber: materialFilters.pgNum,
      pageSize: materialFilters.pgSize,
      parameters: {
        "@p_work_type": "INLIST",
        "@p_orgdiv": materialFilters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_poregnum": filters.poregnum,
        "@p_ordnum": filters.ordnum,
        "@p_ordseq": filters.ordseq,
        "@p_ordkey": filters.ordkey,
        "@p_plankey": materialFilters.plankey,
        "@p_ordyn ": filters.ordyn,
        "@p_planyn": filters.planyn,
        "@p_ordsts": filters.cboOrdsts,
        "@p_remark": filters.remark,
        "@p_lotno": filters.lotno,
        "@p_service_id": "",
        "@p_dptcd": filters.dptcd,
        "@p_person": filters.cboPerson,
        "@p_find_row_value": materialFilters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));
      if (materialFilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.seq == materialFilters.find_row_value
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
      setMaterialDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          materialFilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.seq == materialFilters.find_row_value
              );

        if (selectedRow != undefined) {
          setMaterialSelectedState({
            [selectedRow[MATERIAL_DATA_ITEM_KEY]]: true,
          });
        } else {
          setMaterialSelectedState({ [rows[0][MATERIAL_DATA_ITEM_KEY]]: true });
        }
      } else {
        setMaterialDataResult(process([], detailDataState));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setMaterialFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
  };

  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      if (tabSelected == 0) {
        fetchMainGrid(deepCopiedFilters);
      } else {
        fetchPlanGrid(deepCopiedFilters);
      }
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (materialFilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(materialFilters);
      setMaterialFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMaterialGrid(deepCopiedFilters);
    }
  }, [materialFilters, permissions]);

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  useEffect(() => {
    if (paraDataPlanSaved.work_type !== "") fetchToSavePlan();
  }, [paraDataPlanSaved]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [resultState]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [resultState2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [materialDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setPlanDataResult(process([], planDataState));
    setMaterialDataResult(process([], detailDataState));
  };

  //생산계획 그리드 선택 이벤트 => 디테일 그리드 조회

  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onPlanSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: planSelectedState,
      dataItemKey: PLAN_DATA_ITEM_KEY,
    });
    setPlanSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setMaterialFilters((prev) => ({
      ...prev,
      plankey: selectedRowData.planno,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onMaterialSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: materialSelectedState,
      dataItemKey: MATERIAL_DATA_ITEM_KEY,
    });
    setMaterialSelectedState(newSelectedState);
  };

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  const newData2 = setExpandedState({
    data: resultState2,
    collapsedIds: collapsedState2,
  });

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "수주상세자료";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridTwo.sheets[1] = optionsGridThree.sheets[0];
        optionsGridTwo.sheets[0].title = "생산계획정보";
        optionsGridTwo.sheets[1].title = "소요자재리스트";
        _export2.save(optionsGridTwo);
      }
    }
  };

  const onMaterialDataStateChange = (event: GridDataStateChangeEvent) => {
    setMaterialDataState(event.dataState);
  };

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
    planDataResult.data.forEach((item) =>
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

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    materialDataResult.data.forEach((item) =>
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

  const planTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = total2.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total2 == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = materialDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {materialDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onPlanAddClick = () => {
    const data = planDataResult.data.filter(
      (item) =>
        item[PLAN_DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(planSelectedState)[0]
    )[0];

    if (data == undefined) {
      alert("생산계획정보가 없습니다.");
    } else {
      planDataResult.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });

      const newDataItem = {
        [PLAN_DATA_ITEM_KEY]: ++temp,
        chk: "",
        custnm: data.custnm,
        finexpdt: data.finexpdt,
        groupId: data.groupId,
        group_category_name: data.group_category_name,
        insiz: data.insiz,
        itemcd: data.itemcd,
        itemlvl1: data.itemlvl1,
        itemlvl2: data.itemlvl2,
        itemlvl3: data.itemlvl3,
        itemnm: data.itemnm,
        itemno: data.itemno,
        orddt: "",
        ordkey: "",
        ordnum: data.ordnum,
        ordseq: data.ordseq,
        outprocyn: data.outprocyn,
        plandt: data.plandt,
        plankey: "",
        planno: data.planno,
        planseq: 0,
        poregnum: "",
        prntitemcd: data.prntitemcd,
        proccd: data.proccd,
        procqty: data.procqty,
        procseq: data.procseq,
        prodemp: data.prodemp,
        prodmac: data.prodmac,
        purtype: "",
        qty: data.qty,
        qtyunit: data.qtyunit,
        remark: data.remark,
        transfertYN: "",
        urgencyyn: "",
        rowstatus: "N",
      };

      setPage2((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setPlanDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setTempResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      const newResult = [newDataItem, ...planDataResult.data];
      setTotal2(total2 + 1);
      const newDataState = processWithGroups(newResult, group2);
      setResultState2(newDataState);
      setPlanSelectedState({ [newDataItem[PLAN_DATA_ITEM_KEY]]: true });
    }
  };

  const onMtrAddClick = () => {
    const data = planDataResult.data.filter(
      (item) =>
        item[PLAN_DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(planSelectedState)[0]
    )[0];

    if (data == undefined) {
      alert("생산계획정보가 없습니다.");
    } else if (data.rowstauts == "N") {
      alert("해당 행을 저장한 후에 다시 시도해주세요.");
    } else {
      materialDataResult.data.map((item) => {
        if (item.num > temp2) {
          temp2 = item.num;
        }
      });

      const newDataItem = {
        [MATERIAL_DATA_ITEM_KEY]: ++temp2,
        chlditemcd: "",
        chlditemnm: "",
        outgb: "",
        planno: data.planno,
        planseq: data.planseq,
        proccd: "",
        procqty: 1,
        qtyunit: "",
        seq: 0,
        unitqty: 1,
        rowstatus: "N",
      };

      setMaterialDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setPage3((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setMaterialSelectedState({ [newDataItem[MATERIAL_DATA_ITEM_KEY]]: true });
    }
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onRemovePlanClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    planDataResult.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus_s = "D";
          deletedPlanRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = planDataResult.data[Math.min(...Object2)];
    } else {
      data = planDataResult.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setPlanDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    const newDataState = processWithGroups(newData, group);
    setResultState2(newDataState);
    setTotal2(total2 - Object.length);
    if (Object.length > 0) {
      setPlanSelectedState({
        [data != undefined ? data[PLAN_DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onRemoveMaterialClick = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    materialDataResult.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus_s = "D";
          deletedMaterialRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = materialDataResult.data[Math.min(...Object2)];
    } else {
      data = materialDataResult.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMaterialDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setMaterialSelectedState({
        [data != undefined ? data[MATERIAL_DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      alert(findMessage(messagesData, "PR_A1100W_001"));

      resetAllGrid();
    } else {
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.ordnum = "";
    paraDataDeleted.orgdiv = sessionOrgdiv;
  };

  const onSavePlanClick = () => {
    const dataItem: { [name: string]: any } = planDataResult.data.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length == 0 && deletedPlanRows.length == 0) return false;

    //검증
    let valid = true;
    try {
      dataItem.forEach((item: any) => {
        planDataResult.data.forEach((chkItem: any) => {
          if (
            (item.proccd == chkItem.proccd ||
              item.procseq == chkItem.procseq) &&
            item[PLAN_DATA_ITEM_KEY] !== chkItem[PLAN_DATA_ITEM_KEY] &&
            item.planno == chkItem.planno
          ) {
            throw findMessage(messagesData, "PR_A1100W_003");
          }
        });

        if (!checkIsDDLValid(item.proccd)) {
          throw findMessage(messagesData, "PR_A1100W_004");
        }

        if (item.procseq < 0) {
          throw findMessage(messagesData, "PR_A1100W_005");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    type TPlanData = {
      rowstatus_s: string[];
      ordnum_s: string[];
      ordseq_s: string[];
      remark_s: string[];
      itemcd_s: string[];
      qty_s: string[];
      planno_s: string[];
      planseq_s: string[];
      qtyunit_s: string[];
      procqty_s: string[];
      plandt_s: string[];
      finexpdt_s: string[];
      prodmac_s: string[];
      prodemp_s: string[];
      proccd_s: string[];
      procseq_s: string[];
      outprocyn_s: string[];
      //lotnum_s: string[];
    };

    let planArr: TPlanData = {
      rowstatus_s: [],
      ordnum_s: [],
      ordseq_s: [],
      remark_s: [],
      itemcd_s: [],
      qty_s: [],
      planno_s: [],
      planseq_s: [],
      qtyunit_s: [],
      procqty_s: [],
      plandt_s: [],
      finexpdt_s: [],
      prodmac_s: [],
      prodemp_s: [],
      proccd_s: [],
      procseq_s: [],
      outprocyn_s: [],
      //lotnum_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus,
        ordnum,
        ordseq,
        remark,
        itemcd,
        qty,
        planno,
        planseq,
        qtyunit,
        procqty,
        plandt,
        finexpdt,
        prodmac,
        prodemp,
        proccd,
        procseq,
        outprocyn,
        //lotnum,
      } = item;

      planArr.rowstatus_s.push(rowstatus);
      planArr.ordnum_s.push(ordnum);
      planArr.ordseq_s.push(ordseq);
      planArr.remark_s.push(remark);
      planArr.itemcd_s.push(itemcd);
      planArr.qty_s.push(qty);
      planArr.planno_s.push(planno);
      planArr.planseq_s.push(planseq);
      planArr.qtyunit_s.push(getCodeFromValue(qtyunit));
      planArr.procqty_s.push(procqty);
      planArr.plandt_s.push(plandt);
      planArr.finexpdt_s.push(finexpdt);
      planArr.prodmac_s.push(prodmac);
      planArr.prodemp_s.push(prodemp);
      planArr.proccd_s.push(getCodeFromValue(proccd));
      planArr.procseq_s.push(procseq);
      planArr.outprocyn_s.push(outprocyn);
      //planArr.lotnum_s.push(lotnum);
    });

    deletedPlanRows.forEach((item: any) => {
      const {
        ordnum,
        ordseq,
        remark,
        itemcd,
        qty,
        planno,
        planseq,
        qtyunit,
        procqty,
        plandt,
        finexpdt,
        prodmac,
        prodemp,
        proccd,
        procseq,
        outprocyn,
      } = item;

      planArr.rowstatus_s.push("D");
      planArr.ordnum_s.push(ordnum);
      planArr.ordseq_s.push(ordseq);
      planArr.remark_s.push(remark);
      planArr.itemcd_s.push(itemcd);
      planArr.qty_s.push(qty);
      planArr.planno_s.push(planno);
      planArr.planseq_s.push(planseq);
      planArr.qtyunit_s.push(qtyunit);
      planArr.procqty_s.push(procqty);
      planArr.plandt_s.push(plandt);
      planArr.finexpdt_s.push(finexpdt);
      planArr.prodmac_s.push(prodmac);
      planArr.prodemp_s.push(prodemp);
      planArr.proccd_s.push(proccd);
      planArr.procseq_s.push(procseq);
      planArr.outprocyn_s.push(outprocyn);
    });

    setParaDataPlanSaved((prev) => ({
      ...prev,
      work_type: "PLAN",
      rowstatus_s: planArr.rowstatus_s.join("|"),
      ordnum_s: planArr.ordnum_s.join("|"),
      ordseq_s: planArr.ordseq_s.join("|"),
      remark_s: planArr.remark_s.join("|"),
      itemcd_s: planArr.itemcd_s.join("|"),
      qty_s: planArr.qty_s.join("|"),
      planno_s: planArr.planno_s.join("|"),
      planseq_s: planArr.planseq_s.join("|"),
      qtyunit_s: planArr.qtyunit_s.join("|"),
      procqty_s: planArr.procqty_s.join("|"),
      plandt_s: planArr.plandt_s.join("|"),
      finexpdt_s: planArr.finexpdt_s.join("|"),
      prodmac_s: planArr.prodmac_s.join("|"),
      prodemp_s: planArr.prodemp_s.join("|"),
      proccd_s: planArr.proccd_s.join("|"),
      procseq_s: planArr.procseq_s.join("|"),
      outprocyn_s: planArr.outprocyn_s.join("|"),
      //lotnum_s: planArr.lotnum_s.join("|"),
    }));
  };

  const onSaveMtrClick = () => {
    const dataItem: { [name: string]: any } = materialDataResult.data.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length == 0 && deletedMaterialRows.length == 0) return false;

    type TMaterialArr = {
      rowstatus_s: string[];
      planno_s: string[];
      planseq_s: string[];
      seq_s: string[];
      unitqty_s: string[];
      outgb_s: string[];
      procqty_s: string[];
      chlditemcd_s: string[];
      qtyunit_s2: string[];
      proccd_s2: string[];
    };

    let materialArr: TMaterialArr = {
      rowstatus_s: [],
      planno_s: [],
      planseq_s: [],
      seq_s: [],
      unitqty_s: [],
      outgb_s: [],
      procqty_s: [],
      chlditemcd_s: [],
      qtyunit_s2: [],
      proccd_s2: [],
    };

    dataItem.forEach((item: any) => {
      const {
        rowstatus,
        planno,
        planseq,
        seq,
        unitqty,
        outgb,
        procqty,
        chlditemcd,
        qtyunit,
        proccd,
      } = item;

      materialArr.rowstatus_s.push(rowstatus);
      materialArr.planno_s.push(planno);
      materialArr.planseq_s.push(planseq);
      materialArr.seq_s.push(seq);
      materialArr.unitqty_s.push(unitqty);
      materialArr.outgb_s.push(getCodeFromValue(outgb));
      materialArr.procqty_s.push(procqty);
      materialArr.chlditemcd_s.push(chlditemcd);
      materialArr.qtyunit_s2.push(getCodeFromValue(qtyunit));
      materialArr.proccd_s2.push(getCodeFromValue(proccd));
      //planArr.lotnum_s.push(lotnum);
    });

    deletedMaterialRows.forEach((item: any) => {
      const {
        planno,
        planseq,
        seq,
        unitqty,
        outgb,
        procqty,
        chlditemcd,
        qtyunit,
        proccd,
      } = item;

      materialArr.rowstatus_s.push("D");
      materialArr.planno_s.push(planno);
      materialArr.planseq_s.push(planseq);
      materialArr.seq_s.push(seq);
      materialArr.unitqty_s.push(unitqty);
      materialArr.outgb_s.push(outgb);
      materialArr.procqty_s.push(procqty);
      materialArr.chlditemcd_s.push(chlditemcd);
      materialArr.qtyunit_s2.push(qtyunit);
      materialArr.proccd_s2.push(proccd);
    });

    setParaDataPlanSaved((prev) => ({
      ...prev,
      work_type: "INLIST",
      rowstatus_s: materialArr.rowstatus_s.join("|"),
      planno_s: materialArr.planno_s.join("|"),
      planseq_s: materialArr.planseq_s.join("|"),
      seq_s: materialArr.seq_s.join("|"),
      unitqty_s: materialArr.unitqty_s.join("|"),
      outgb_s: materialArr.outgb_s.join("|"),
      procqty_s: materialArr.procqty_s.join("|"),
      chlditemcd_s: materialArr.chlditemcd_s.join("|"),
      qtyunit_s2: materialArr.qtyunit_s2.join("|"),
      proccd_s2: materialArr.proccd_s2.join("|"),
    }));
  };

  const fetchToSavePlan = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraPlanSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setValues(false);
      setValues2(false);
      if (paraDataPlanSaved.work_type == "INLIST") {
        const isLastDataDeleted =
          materialDataResult.data.length == 0 && materialFilters.pgNum > 0;

        if (isLastDataDeleted) {
          setPage3({
            skip:
              materialFilters.pgNum == 1 || materialFilters.pgNum == 0
                ? 0
                : PAGE_SIZE * (materialFilters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setMaterialFilters((prev: any) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted
              ? prev.pgNum != 1
                ? prev.pgNum - 1
                : prev.pgNum
              : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setMaterialFilters((prev: any) => ({
            ...prev,
            find_row_value: data.returnString,
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
      } else {
        const isLastDataDeleted =
          planDataResult.data.length == 0 && filters.pgNum > 0;
        resetAllGrid();
        if (isLastDataDeleted) {
          setPage2({
            skip:
              filters.pgNum == 1 || filters.pgNum == 0
                ? 0
                : PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted
              ? prev.pgNum != 1
                ? prev.pgNum - 1
                : prev.pgNum
              : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: data.returnString,
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
      }
      deletedPlanRows = [];
      deletedMaterialRows = [];
    } else {
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.ordnum = "";
    paraDataDeleted.orgdiv = sessionOrgdiv;
  };

  interface ICustData {
    address: string;
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

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMaterialSortChange = (e: any) => {
    setMaterialDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_fxcode, L_sysUserMaster_001,L_BA020,L_BA007, L_SA002,L_BA005,L_BA029,L_BA002,L_sysUserMaster_002,L_dptcd_001,L_BA061,L_BA015,L_BA002_426,L_BA171,L_BA172,L_BA173,R_FINYN",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 발주형태, 대분류,중분류,소분류,수주완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회
  const [ordstsListData, setOrdstsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [usersListData, setUsersListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [departmentsListData, setDepartmentsListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [purtypeListData, setPurtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [ordtypeListData, setOrdtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [amtunitListData, setAmtunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [prodmacListData, setProdmacListData] = React.useState([
    { fxcode: "", fxfull: "" },
  ]);
  const [prodempListData, setProdempListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setAmtunitListData(getBizCom(bizComponentData, "L_BA020"));
      setOrdtypeListData(getBizCom(bizComponentData, "L_BA007"));
      setOrdstsListData(getBizCom(bizComponentData, "L_SA002"));
      setDoexdivListData(getBizCom(bizComponentData, "L_BA005"));
      setTaxdivListData(getBizCom(bizComponentData, "L_BA029"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
      setUsersListData(getBizCom(bizComponentData, "L_sysUserMaster_002"));
      setDepartmentsListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setPurtypeListData(getBizCom(bizComponentData, "L_BA002_426"));
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
      setProdmacListData(getBizCom(bizComponentData, "L_fxcode"));
      setProdempListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);

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

  const enterEdit = (dataItem: any, field: string) => {
    if (
      field != "planno" &&
      field != "prntitemcd" &&
      field != "ordnum" &&
      field != "ordseq" &&
      field != "itemcd" &&
      field != "itemnm" &&
      field != "itemlvl1" &&
      field != "itemlvl2" &&
      field != "itemlvl3" &&
      field != "custnm" &&
      field != "orddt" &&
      field != "ordkey" &&
      field != "plankey" &&
      field != "poregnum" &&
      field != "planseq" &&
      field != "purtype" &&
      field != "transfertYN" &&
      field != "urgencyyn" &&
      field != "rowstatus"
    ) {
      const newData = planDataResult.data.map((item) =>
        item[PLAN_DATA_ITEM_KEY] == dataItem[PLAN_DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setPlanDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      const newDataState = processWithGroups(newData, group);
      setResultState2(newDataState);
    } else {
      setTempResult((prev) => {
        return {
          data: planDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != planDataResult.data) {
      const newData = planDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[PLAN_DATA_ITEM_KEY] ==
          Object.getOwnPropertyNames(planSelectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setPlanDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      const newDataState = processWithGroups(newData, group);
      setResultState2(newDataState);
    } else {
      const newData = planDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setPlanDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      const newDataState = processWithGroups(newData, group);
      setResultState2(newDataState);
    }
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

  const materialEnterEdit = (dataItem: any, field: string) => {
    if (
      field != "rowstatus" &&
      field != "planno" &&
      field != "planseq" &&
      field != "chlditemnm" &&
      field != "proccd"
    ) {
      const newData = materialDataResult.data.map((item) =>
        item[MATERIAL_DATA_ITEM_KEY] == dataItem[MATERIAL_DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setMaterialDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: materialDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const materialExitEdit = () => {
    if (tempResult2.data != materialDataResult.data) {
      const newData = materialDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[MATERIAL_DATA_ITEM_KEY] ==
          Object.getOwnPropertyNames(materialSelectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMaterialDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = materialDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMaterialDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const materialCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={materialEnterEdit}
      editField={EDIT_FIELD}
    />
  );

  const materialRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={materialExitEdit}
      editField={EDIT_FIELD}
    />
  );

  const onPlanItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      planDataResult,
      setPlanDataResult,
      PLAN_DATA_ITEM_KEY
    );
  };

  const onMaterialItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      materialDataResult,
      setMaterialDataResult,
      MATERIAL_DATA_ITEM_KEY
    );
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A1100W_007");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A1100W_007");
      } else {
        resetAllGrid();
        setValues(false);
        setValues2(false);
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          find_row_value: "",
          pgNum: 1,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = planDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setPlanDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      const newDataState = processWithGroups(newData, group);
      setResultState2(newDataState);
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = materialDataResult.data.map((item) => ({
        ...item,
        chk: !values,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMaterialDataResult((prev) => {
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

  const CustomCheckBoxCell3 = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;
    if (props.rowType == "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = planDataResult.data.map((item) =>
        item[PLAN_DATA_ITEM_KEY] == dataItem[PLAN_DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
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
      const newDataState = processWithGroups(newData, group);
      setResultState2(newDataState);
      setPlanDataResult((prev) => {
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
  return (
    <>
      <TitleContainer>
        <Title>계획생산</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="PR_A1100W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>수주일자</th>
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
              <th>수주번호</th>
              <td>
                <Input
                  name="ordkey"
                  type="text"
                  value={filters.ordkey}
                  onChange={filterInputChange}
                />
              </td>
              <th>수주완료여부</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentRadioGroup
                    name="ordyn"
                    value={filters.ordyn}
                    bizComponentId="R_FINYN"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>수주상태</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboOrdsts"
                    value={filters.cboOrdsts}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
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
            </tr>
            <tr>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>

              <th>PO번호</th>
              <td>
                <Input
                  name="poregnum"
                  type="text"
                  value={filters.poregnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>LOT번호</th>
              <td>
                <Input
                  name="lotno"
                  type="text"
                  value={filters.lotno}
                  onChange={filterInputChange}
                />
              </td>

              <th>계획여부</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentRadioGroup
                    name="planyn"
                    value={filters.planyn}
                    bizComponentId="R_FINYN"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>

              <th>담당자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboPerson"
                    value={filters.cboPerson}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="처리">
          <GridContainer style={{ width: "100%", overflow: "auto" }}>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>수주상세자료</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={newData}
              ref={(exporter) => {
                _export = exporter;
              }}
              group={group}
              fileName="계획생산"
            >
              <Grid
                style={{
                  height: isMobile
                    ? deviceHeight - height - height1 - 30
                    : "64vh",
                }}
                data={newData.map((item: { items: any[] }) => ({
                  ...item,
                  items: item.items.map((row: any) => ({
                    ...row,
                    ordsts: ordstsListData.find(
                      (item: any) => item.sub_code == row.ordsts
                    )?.code_name,
                    doexdiv: doexdivListData.find(
                      (item: any) => item.sub_code == row.doexdiv
                    )?.code_name,
                    taxdiv: taxdivListData.find(
                      (item: any) => item.sub_code == row.taxdiv
                    )?.code_name,
                    location: locationListData.find(
                      (item: any) => item.sub_code == row.location
                    )?.code_name,
                    person: usersListData.find(
                      (item: any) => item.user_id == row.person
                    )?.user_name,
                    dptcd: departmentsListData.find(
                      (item: any) => item.dptcd == row.dptcd
                    )?.dptnm,
                    itemacnt: itemacntListData.find(
                      (item: any) => item.sub_code == row.itemacnt
                    )?.code_name,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.qtyunit
                    )?.code_name,
                    outdt: row.outdt ? row.outdt : "",
                    indt: row.indt ? row.indt : "",
                    plandt: row.plandt ? row.plandt : "",
                    itemlvl1: itemlvl1ListData.find(
                      (item: any) => item.sub_code == row.itemlvl1
                    )?.code_name,
                    itemlvl2: itemlvl2ListData.find(
                      (item: any) => item.sub_code == row.itemlvl2
                    )?.code_name,
                    itemlvl3: itemlvl3ListData.find(
                      (item: any) => item.sub_code == row.itemlvl3
                    )?.code_name,
                    ordtype: ordtypeListData.find(
                      (item: any) => item.sub_code == row.ordtype
                    )?.code_name,
                    amtunit: amtunitListData.find(
                      (item: any) => item.sub_code == row.amtunit
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                  })),
                }))}
                //스크롤 조회 기능
                fixedScroll={true}
                //그룹기능
                group={group}
                groupable={true}
                onExpandChange={onExpandChange}
                expandField="expanded"
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onMainSelectionChange}
                //페이지네이션
                total={total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
              >
                <GridColumn cell={CommandCell} width="95px" />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"]
                    ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    ?.map(
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
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : numberField2.includes(item.fieldName)
                                ? gridSumQtyFooterCell
                                : undefined
                            }
                          ></GridColumn>
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="리스트">
          {isMobile ? (
            <Swiper
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
              onActiveIndexChange={(swiper) => {
                index = swiper.activeIndex;
              }}
            >
              <SwiperSlide key={0}>
                <GridContainer style={{ width: "100%" }}>
                  <ExcelExport
                    data={planDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                  >
                    <GridTitleContainer className="ButtonContainer2">
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        <GridTitle>생산계획정보</GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                      <ButtonContainer>
                        <Button
                          onClick={onPlanAddClick}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                        ></Button>
                        <Button
                          onClick={onRemovePlanClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                        ></Button>
                        <Button
                          onClick={onSavePlanClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={newData2}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      group={group2}
                      fileName="계획생산"
                    >
                      <Grid
                        style={{ height: deviceHeight - height - height2 - 30 }}
                        data={newData2.map((item: { items: any[] }) => ({
                          ...item,
                          items: item.items.map((row: any) => ({
                            ...row,
                            plandt: row.plandt
                              ? new Date(dateformat(row.plandt))
                              : new Date(dateformat("99991231")),
                            finexpdt: row.finexpdt
                              ? new Date(dateformat(row.finexpdt))
                              : new Date(dateformat("99991231")),
                            qtyunit: qtyunitListData.find(
                              (item: any) => item.sub_code == row.qtyunit
                            )?.code_name,
                            purtype: purtypeListData.find(
                              (item: any) => item.sub_code == row.purtype
                            )?.code_name,
                            itemlvl1: itemlvl1ListData.find(
                              (item: any) => item.sub_code == row.itemlvl1
                            )?.code_name,
                            itemlvl2: itemlvl2ListData.find(
                              (item: any) => item.sub_code == row.itemlvl2
                            )?.code_name,
                            itemlvl3: itemlvl3ListData.find(
                              (item: any) => item.sub_code == row.itemlvl3
                            )?.code_name,
                            prodmac: prodmacListData.find(
                              (items: any) => items.fxcode == row.prodmac
                            )?.fxfull,
                            prodemp: prodempListData.find(
                              (items: any) => items.user_id == row.prodemp
                            )?.user_name,
                            [SELECTED_FIELD]:
                              planSelectedState[planIdGetter(row)], //선택된 데이터
                          })),
                        }))}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        //선택 기능
                        dataItemKey={PLAN_DATA_ITEM_KEY}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onPlanSelectionChange}
                        //그룹기능
                        group={group2}
                        groupable={true}
                        onExpandChange={onExpandChange2}
                        expandField="expanded"
                        //페이지네이션
                        total={total2}
                        skip={page2.skip}
                        take={page2.take}
                        pageable={true}
                        onPageChange={pageChange2}
                        //원하는 행 위치로 스크롤 기능
                        ref={gridRef2}
                        rowHeight={30}
                        //incell 수정 기능
                        onItemChange={onPlanItemChange}
                        cellRender={customCellRender}
                        rowRender={customRowRender}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn
                          field="chk"
                          title=" "
                          width="45px"
                          headerCell={CustomCheckBoxCell2}
                          cell={CustomCheckBoxCell3}
                        />
                        <GridColumn
                          field="rowstatus"
                          title=" "
                          width="50px"
                          editable={false}
                        />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList2"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                                        : lookupField.includes(item.fieldName)
                                        ? CustomComboBoxCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? planTotalFooterCell
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell2
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer2">
                    <ButtonContainer style={{ justifyContent: "left" }}>
                      <Button
                        onClick={() => {
                          if (swiper) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="chevron-left"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                      <GridTitle>소요자재리스트</GridTitle>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        onClick={onMtrAddClick}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                      ></Button>
                      <Button
                        onClick={onRemoveMaterialClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                      ></Button>
                      <Button
                        onClick={onSaveMtrClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={materialDataResult.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="계획생산"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height2 - 30 }}
                      data={process(
                        materialDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]:
                            materialSelectedState[materialIdGetter(row)],
                        })),
                        detailDataState
                      )}
                      {...detailDataState}
                      onDataStateChange={onMaterialDataStateChange}
                      //선택 기능
                      dataItemKey={MATERIAL_DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onMaterialSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={materialDataResult.total}
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
                      ref={gridRef3}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMaterialSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //incell 수정 기능
                      onItemChange={onMaterialItemChange}
                      cellRender={materialCellRender}
                      rowRender={materialRowRender}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn
                        field="chk"
                        title=" "
                        width="45px"
                        headerCell={CustomCheckBoxCell}
                        cell={CheckBoxCell}
                      />
                      <GridColumn
                        field="rowstatus"
                        title=" "
                        width="50px"
                        editable={false}
                      />

                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList3"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
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
                                      : lookupField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? detailTotalFooterCell
                                      : numberField2.includes(item.fieldName)
                                      ? gridSumQtyFooterCell3
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="65%">
                  <ExcelExport
                    data={planDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                  >
                    <GridTitleContainer>
                      <GridTitle>생산계획정보</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onPlanAddClick}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                        ></Button>
                        <Button
                          onClick={onRemovePlanClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                        ></Button>
                        <Button
                          onClick={onSavePlanClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={newData2}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      group={group2}
                      fileName="계획생산"
                    >
                      <Grid
                        style={{ height: "64vh" }}
                        data={newData2.map((item: { items: any[] }) => ({
                          ...item,
                          items: item.items.map((row: any) => ({
                            ...row,
                            plandt: row.plandt
                              ? new Date(dateformat(row.plandt))
                              : new Date(dateformat("99991231")),
                            finexpdt: row.finexpdt
                              ? new Date(dateformat(row.finexpdt))
                              : new Date(dateformat("99991231")),
                            qtyunit: qtyunitListData.find(
                              (item: any) => item.sub_code == row.qtyunit
                            )?.code_name,
                            purtype: purtypeListData.find(
                              (item: any) => item.sub_code == row.purtype
                            )?.code_name,
                            itemlvl1: itemlvl1ListData.find(
                              (item: any) => item.sub_code == row.itemlvl1
                            )?.code_name,
                            itemlvl2: itemlvl2ListData.find(
                              (item: any) => item.sub_code == row.itemlvl2
                            )?.code_name,
                            itemlvl3: itemlvl3ListData.find(
                              (item: any) => item.sub_code == row.itemlvl3
                            )?.code_name,
                            prodmac: prodmacListData.find(
                              (items: any) => items.fxcode == row.prodmac
                            )?.fxfull,
                            prodemp: prodempListData.find(
                              (items: any) => items.user_id == row.prodemp
                            )?.user_name,
                            [SELECTED_FIELD]:
                              planSelectedState[planIdGetter(row)], //선택된 데이터
                          })),
                        }))}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        //선택 기능
                        dataItemKey={PLAN_DATA_ITEM_KEY}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onPlanSelectionChange}
                        //그룹기능
                        group={group2}
                        groupable={true}
                        onExpandChange={onExpandChange2}
                        expandField="expanded"
                        //페이지네이션
                        total={total2}
                        skip={page2.skip}
                        take={page2.take}
                        pageable={true}
                        onPageChange={pageChange2}
                        //원하는 행 위치로 스크롤 기능
                        ref={gridRef2}
                        rowHeight={30}
                        //incell 수정 기능
                        onItemChange={onPlanItemChange}
                        cellRender={customCellRender}
                        rowRender={customRowRender}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn
                          field="chk"
                          title=" "
                          width="45px"
                          headerCell={CustomCheckBoxCell2}
                          cell={CustomCheckBoxCell3}
                        />
                        <GridColumn
                          field="rowstatus"
                          title=" "
                          width="50px"
                          editable={false}
                        />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList2"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                                        : lookupField.includes(item.fieldName)
                                        ? CustomComboBoxCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? planTotalFooterCell
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell2
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </ExcelExport>
                </GridContainer>

                <GridContainer width={`calc(35% - ${GAP}px)`}>
                  <GridTitleContainer>
                    <GridTitle>소요자재리스트</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onMtrAddClick}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                      ></Button>
                      <Button
                        onClick={onRemoveMaterialClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                      ></Button>
                      <Button
                        onClick={onSaveMtrClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={materialDataResult.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="계획생산"
                  >
                    <Grid
                      style={{ height: "64vh" }}
                      data={process(
                        materialDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]:
                            materialSelectedState[materialIdGetter(row)],
                        })),
                        detailDataState
                      )}
                      {...detailDataState}
                      onDataStateChange={onMaterialDataStateChange}
                      //선택 기능
                      dataItemKey={MATERIAL_DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onMaterialSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={materialDataResult.total}
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
                      ref={gridRef3}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMaterialSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //incell 수정 기능
                      onItemChange={onMaterialItemChange}
                      cellRender={materialCellRender}
                      rowRender={materialRowRender}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn
                        field="chk"
                        title=" "
                        width="45px"
                        headerCell={CustomCheckBoxCell}
                        cell={CheckBoxCell}
                      />
                      <GridColumn
                        field="rowstatus"
                        title=" "
                        width="50px"
                        editable={false}
                      />

                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList3"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
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
                                      : lookupField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? detailTotalFooterCell
                                      : numberField2.includes(item.fieldName)
                                      ? gridSumQtyFooterCell3
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {planWindowVisible && (
        <PlanWindow
          getVisible={setPlanWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          reloadData={(str) => {
            setTabSelected(1);
            setFilters((prev) => ({
              ...prev,
              find_row_value: str,
              isSearch: true,
            }));
          }}
          ordkey={ordkey}
          itemcd={itemcd}
          modal={true}
          pathname="PR_A1100W"
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
          modal={true}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
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

export default PR_A1100W;
