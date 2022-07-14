import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridItemChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
} from "@progress/kendo-react-grid";

import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import calculateSize from "calculate-size";

import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  GridContainerWrap,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import {
  Input,
  RadioButton,
  RadioButtonChangeEvent,
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";

import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useApi } from "../hooks/api";
import {
  ordstsState,
  ordtypeState,
  departmentsState,
  usersState,
  doexdivState,
  locationState,
} from "../store/atoms";
import { Iparameters } from "../store/types";
import DepartmentsDDL from "../components/DropDownLists/DepartmentsDDL";
import DoexdivDDL from "../components/DropDownLists/DoexdivDDL";
import OrdstsDDL from "../components/DropDownLists/OrdstsDDL";
import OrdtypeDDL from "../components/DropDownLists/OrdtypeDDL";
import UsersDDL from "../components/DropDownLists/UsersDDL";
import LocationDDL from "../components/DropDownLists/LocationDDL";
import {
  chkScrollHandler,
  convertDateToStr,
  dateformat,
  UseCommonQuery,
} from "../components/CommonFunction";
import PlanWindow from "../components/Windows/PR_A1100_Window";
import CustomersWindow from "../components/Windows/CustomersWindow";
import ItemsWindow from "../components/Windows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import NameCell from "../components/Cells/NameCell";
import {
  commonCodeDefaultValue,
  departmentsQuery,
  doexdivQuery,
  finynRadioButtonData,
  itemacntQuery,
  locationQuery,
  ordstsQuery,
  qtyunitQuery,
  taxdivQuery,
  usersQuery,
} from "../components/CommonString";
import { CellRender, RowRender } from "../components/Windows/renderers2";
import DropDownCell from "../components/Cells/DropDownCell";

const pageSize = 20;
const PR_A1100: React.FC = () => {
  const processApi = useApi();
  const SELECTED_FIELD = "selected";

  const DATA_ITEM_KEY = "ordkey";
  const PLAN_DATA_ITEM_KEY = "plankey";
  const DETAIL_DATA_ITEM_KEY = "ordseq";

  const idGetter = getter(DATA_ITEM_KEY);
  const planIdGetter = getter(PLAN_DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  const [mainDataState, setMainDataState] = useState<State>({
    group: [
      {
        field: "ordnum",
      },
    ],
  });

  const [planDataState, setPlanDataState] = useState<State>({
    group: [
      {
        field: "planno",
      },
    ],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const [ordkey, setOrdkey] = useState("");
  const [itemcd, setItemcd] = useState("");

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.ordkey]: true });

      setOrdkey(rowData.ordkey);
      setItemcd(rowData.itemcd);

      // setDetailFilters((prev) => ({
      //   ...prev,
      //   location: rowData.location,
      //   ordnum: rowData.ordnum,
      //   ordkey: rowData.ordkey,
      // }));

      setWorkType("N");
      setPlanWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          //fillMode="outline"
          onClick={onEditClick}
          //icon="edit"
        >
          계획처리
        </Button>
      </td>
    );
  };

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [planDataResult, setPlanDataResult] = useState<DataResult>(
    process([], planDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [planWindowVisible, setPlanWindowVisible] = useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [planPgNum, setPlanPgNum] = useState(1);
  const [detailPgNum, setDetailPgNum] = useState(1);

  const [workType, setWorkType] = useState("");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [isCopy, setIsCopy] = useState(false);

  const [locationVal, setLocationVal] = useRecoilState(locationState);
  const ordstsVal = useRecoilValue(ordstsState);
  const ordtypeVal = useRecoilValue(ordtypeState);
  const departmentsVal = useRecoilValue(departmentsState);
  const usersVal = useRecoilValue(usersState);
  const doexdivVal = useRecoilValue(doexdivState);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: RadioGroupChangeEvent) => {
    const name = e.syntheticEvent.currentTarget.name;
    const value = e.value;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const initFrdt = new Date();
  initFrdt.setMonth(initFrdt.getMonth() - 1);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: pageSize,
    orgdiv: "01",
    location: "01",
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
    ordsts: "",
    remark: "",
    lotno: "",
    dptcd: "",
    person: "",
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: 10,
    orgdiv: "01",
    plankey: "",
  });

  //수주상세 조회 파라미터
  const parameters: Iparameters = {
    procedureName: "P_WEB_PR_A1100_Q",
    pageNumber: mainPgNum,
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
      "@p_ordsts": filters.ordsts,
      "@p_remark": filters.remark,
      "@p_lotno": filters.lotno,
      "@p_service_id": "",
      "@p_dptcd": filters.dptcd,
      "@p_person": filters.person,
    },
  };

  //생산계획 조회 파라미터
  const planParameters: Iparameters = {
    procedureName: "P_WEB_PR_A1100_Q",
    pageNumber: planPgNum,
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
      "@p_ordsts": filters.ordsts,
      "@p_remark": filters.remark,
      "@p_lotno": filters.lotno,
      "@p_service_id": "",
      "@p_dptcd": filters.dptcd,
      "@p_person": filters.person,
    },
  };

  //소요자재리스트 조회 파라미터
  const detailParameters: Iparameters = {
    procedureName: "P_WEB_PR_A1100_Q",
    pageNumber: detailPgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "INLIST",
      "@p_orgdiv": detailFilters.orgdiv,
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
      "@p_plankey": detailFilters.plankey,
      "@p_ordyn ": filters.ordyn,
      "@p_planyn": filters.planyn,
      "@p_ordsts": filters.ordsts,
      "@p_remark": filters.remark,
      "@p_lotno": filters.lotno,
      "@p_service_id": "",
      "@p_dptcd": filters.dptcd,
      "@p_person": filters.person,
    },
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    orgdiv: "01",
    ordnum: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_WEB_SA_A2000_S",
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
      "@p_userid": "",
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

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.result.isSuccess === true) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setMainDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  const fetchPlanGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", planParameters);
    } catch (error) {
      data = null;
    }

    if (data.result.isSuccess === true) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setPlanDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  const fetchDetailGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setDetailDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
        };
      });
    }
  };

  useEffect(() => {
    setLocationVal({ sub_code: "01", code_name: "본사" });
    fetchMainGrid();
  }, [mainPgNum]);

  useEffect(() => {
    setLocationVal({ sub_code: "01", code_name: "본사" });
    fetchPlanGrid();
  }, [planPgNum]);

  useEffect(() => {
    resetDetailGrid();
    fetchDetailGrid();
  }, [detailFilters]);

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.ordnum]: true });

        setDetailFilters((prev) => ({
          ...prev,
          location: firstRowData.location,
          ordnum: firstRowData.ordnum,
        }));

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setPlanPgNum(1);
    setDetailPgNum(1);
    setMainDataResult(process([], mainDataState));
    setPlanDataResult(process([], planDataState));
    setDetailDataResult(process([], detailDataState));
  };

  const resetDetailGrid = () => {
    setDetailPgNum(1);
    setDetailDataResult(process([], detailDataState));
  };

  //생산계획 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: PLAN_DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters((prev) => ({
      ...prev,
      plankey: selectedRowData.planno,
    }));
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, pageSize))
      setMainPgNum((prev) => prev + 1);
  };

  const onPlanScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, planPgNum, pageSize))
      setPlanPgNum((prev) => prev + 1);
  };

  const onDetailScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, pageSize))
      setDetailPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onPlanDataStateChange = (event: GridDataStateChangeEvent) => {
    setPlanDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const planTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {planDataResult.total}건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  const calculateWidth = (field: any) => {
    let maxWidth = 0;
    mainDataResult.data.forEach((item) => {
      const size = calculateSize(item[field], {
        font: "Source Sans Pro",
        fontSize: "16px",
      }); // pass the font properties based on the application
      if (size.width > maxWidth) {
        maxWidth = size.width;
      }
    });

    return maxWidth;
  };

  const onAddClick = () => {
    setIsCopy(false);
    setWorkType("N");
    setPlanWindowVisible(true);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onCopyClick = () => {
    const ordnum = Object.getOwnPropertyNames(selectedState)[0];

    const selectedRowData = mainDataResult.data.find(
      (item) => item.ordnum === ordnum
    );

    setDetailFilters((prev) => ({
      ...prev,
      location: selectedRowData.location,
      ordnum: selectedRowData.ordnum,
    }));

    setIsCopy(true);
    setWorkType("N");
    setPlanWindowVisible(true);
  };

  const onDeleteClick = (e: any) => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    const ordnum = Object.getOwnPropertyNames(selectedState)[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      ordnum: ordnum,
    }));
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.result.isSuccess === true) {
      alert("삭제가 완료되었습니다.");

      resetAllGrid();
      fetchMainGrid();
    } else {
      alert(
        "[" +
          data.result.statusCode +
          "] 처리 중 오류가 발생하였습니다. " +
          data.result.resultMessage
      );
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.ordnum = "";
    paraDataDeleted.orgdiv = "01";
  };

  const reloadData = (workType: string) => {
    //수정한 경우 행선택 유지, 신규건은 첫번째 행 선택
    if (workType === "U") {
      setIfSelectFirstRow(false);
    } else {
      setIfSelectFirstRow(true);
    }

    resetAllGrid();
    fetchMainGrid();
    // fetchDetailGrid();
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
  const getCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const getItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onPlanSortChange = (e: any) => {
    setPlanDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //공통코드 리스트 조회 (수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서)
  const [ordstsListData, setOrdstsListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [locationListData, setLocationListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [usersListData, setUsersListData] = useState([commonCodeDefaultValue]);

  const [departmentsListData, setDepartmentsListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    commonCodeDefaultValue,
  ]);

  UseCommonQuery(ordstsQuery, setOrdstsListData);
  UseCommonQuery(doexdivQuery, setDoexdivListData);
  UseCommonQuery(taxdivQuery, setTaxdivListData);
  UseCommonQuery(locationQuery, setLocationListData);
  UseCommonQuery(usersQuery, setUsersListData);
  UseCommonQuery(departmentsQuery, setDepartmentsListData);
  UseCommonQuery(itemacntQuery, setItemacntListData);
  UseCommonQuery(qtyunitQuery, setQtyunitListData);

  //공통코드 리스트 조회 후 그리드 데이터 세팅
  useEffect(() => {
    // setMainDataResult((prev) => {
    //   const rows = prev.data.map((row: any) => ({
    //     ...row,
    //     ordsts: ordstsListData.find((item: any) => item.sub_code === row.ordsts)
    //?.code_name,
    //   }));
    //   return {
    //     data: [...prev.data, ...rows],
    //     total: prev.total,
    //   };
    // });
  }, [ordstsListData]);

  const onExpandChange = (event: any) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;
    setMainDataState((prev) => ({ ...prev }));
  };

  const onPlanExpandChange = (event: any) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;
    setPlanDataState((prev) => ({ ...prev }));
  };

  const EDIT_FIELD = "inEdit";

  const enterEdit = (dataItem: any, field: string) => {
    const newData = planDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]:
        item[PLAN_DATA_ITEM_KEY] === dataItem[PLAN_DATA_ITEM_KEY]
          ? field
          : undefined,
    }));

    setPlanDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });

    //setPlanDataResult(process(newData, planDataState));
  };

  const exitEdit = () => {
    const newData = planDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setPlanDataResult((prev) => {
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

  const onPlanItemChange = (event: GridItemChangeEvent) => {
    let field = event.field || "";
    event.dataItem[field] = event.value;
    let newData = planDataResult.data.map((item) => {
      if (item[PLAN_DATA_ITEM_KEY] === event.dataItem[PLAN_DATA_ITEM_KEY]) {
        item[field] = event.value;
      }

      return item;
    });
    setPlanDataResult(process(newData, planDataState));
    //setChanges(true);
  };

  return (
    <>
      <TitleContainer>
        <Title>계획생산</Title>

        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
              fetchPlanGrid();
            }}
            icon="search"
            //fillMode="outline"
            themeColor={"primary"}
          >
            조회
          </Button>
          <Button
            title="Export Excel"
            onClick={exportExcel}
            icon="download"
            fillMode="outline"
            themeColor={"primary"}
          >
            Excel
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>수주일자</th>
              <td colSpan={3} className="item-box">
                <DatePicker
                  name="frdt"
                  defaultValue={filters.frdt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                />
                ~
                <DatePicker
                  name="todt"
                  defaultValue={filters.todt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
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

              <th>수주번호</th>
              <td>
                <Input
                  name="ordkey"
                  type="text"
                  value={filters.ordkey}
                  onChange={filterInputChange}
                />
              </td>

              {/* <th>생산게획번호</th>
<td>
  <Input
    name="planno"
    type="text"
    //value={filters.planno}
    onChange={filterInputChange}
  />
</td> */}

              <th>수주완료여부</th>
              <td>
                <RadioGroup
                  name="ordyn"
                  data={finynRadioButtonData}
                  layout={"horizontal"}
                  defaultValue={filters.ordyn}
                  onChange={filterRadioChange}
                />
              </td>

              <th>수주상태</th>
              <td>
                <OrdstsDDL />
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
                <RadioGroup
                  name="planyn"
                  data={finynRadioButtonData}
                  layout={"horizontal"}
                  defaultValue={filters.planyn}
                  onChange={filterRadioChange}
                />
              </td>

              <th>담당자</th>
              <td>
                <UsersDDL />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="처리">
          <GridContainer
            clientWidth={document.documentElement.clientWidth}
            inTab={true}
          >
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <GridTitleContainer>
                <GridTitle>수주상세자료</GridTitle>
                {/* <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    수주생성
                  </Button>
                  <Button
                    onClick={onCopyClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="copy"
                  >
                    수주복사
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    icon="delete"
                    fillMode="outline"
                    themeColor={"primary"}
                  >
                    수주삭제
                  </Button>
                </ButtonContainer> */}
              </GridTitleContainer>
              <Grid
                style={{ height: "680px" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    ordsts: ordstsListData.find(
                      (item: any) => item.sub_code === row.ordsts
                    )?.code_name,
                    doexdiv: doexdivListData.find(
                      (item: any) => item.sub_code === row.doexdiv
                    )?.code_name,
                    taxdiv: taxdivListData.find(
                      (item: any) => item.sub_code === row.taxdiv
                    )?.code_name,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
                    person: usersListData.find(
                      (item: any) => item.sub_code === row.person
                    )?.code_name,
                    dptcd: departmentsListData.find(
                      (item: any) => item.sub_code === row.dptcd
                    )?.code_name,
                    itemacnt: itemacntListData.find(
                      (item: any) => item.sub_code === row.itemacnt
                    )?.code_name,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code === row.qtyunit
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
                //onSelectionChange={onSelectionChange}
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
                //그룹기능
                groupable={true}
                onExpandChange={onExpandChange}
                expandField="expanded"
              >
                <GridColumn cell={CommandCell} width="95px" />
                <GridColumn
                  field="orddt"
                  title="수주일자"
                  cell={DateCell}
                  footerCell={mainTotalFooterCell}
                  width="100px"
                />
                <GridColumn
                  field="dlvdt"
                  title="납기일자"
                  cell={DateCell}
                  width="100px"
                  //width={calculateWidth("dlvdt")}
                />

                <GridColumn field="custnm" title="업체명" width="170px" />
                <GridColumn field="itemcd" title="품목코드" width="160px" />
                <GridColumn field="itemnm" title="품목명" width="180px" />
                <GridColumn field="insiz" title="규격" width="200px" />
                <GridColumn field="itemacnt" title="품목계정" width="120px" />
                <GridColumn
                  field="qty"
                  title="수량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="qtyunit" title="단위" width="120px" />

                <GridColumn
                  field="unp"
                  title="단가"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="wonamt"
                  title="금액"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="taxamt"
                  title="세액"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="totamt"
                  title="합계금액"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="planqty"
                  title="잔량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="remark" title="비고" width="120px" />
                <GridColumn field="purcustnm" title="발주처" width="120px" />
                <GridColumn
                  field="outqty"
                  title="출하수량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="ordkey" title="수주번호" width="120px" />
                <GridColumn field="ordsts" title="수주상태" width="100px" />
                <GridColumn field="doexdiv" title="내수구분" width="100px" />
                <GridColumn field="taxdiv" title="과세구분" width="100px" />
                <GridColumn field="bf_qty" title="LOT수량" width="120px" />
                <GridColumn field="lotnum" title="LOT NO" width="120px" />
                <GridColumn field="location" title="사업장" width="120px" />
                <GridColumn field="dptcd" title="부서" width="120px" />
                <GridColumn field="person" title="담당자" width="120px" />
                <GridColumn field="quokey" title="견적번호" width="120px" />
                <GridColumn field="remark" title="비고" width="120px" />
                <GridColumn field="finyn" title="완료여부" width="120px" />
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="리스트">
          <GridContainerWrap>
            <GridContainer
              clientWidth={document.documentElement.clientWidth - 515} //= 소요자재리스트 500 + margin 15
              inTab={true}
            >
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle>생산계획정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="plus"
                    ></Button>
                    <Button
                      onClick={onCopyClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                    ></Button>
                    <Button
                      onClick={onDeleteClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "680px" }}
                  //   data={planDataResult.data}
                  data={process(
                    planDataResult.data.map((row) => ({
                      ...row,
                      plandt: new Date(dateformat(row.plandt)),
                      finexpdt: new Date(dateformat(row.finexpdt)),
                      // ordsts: ordstsListData.find(
                      //   (item: any) => item.sub_code === row.ordsts
                      // )?.code_name,
                      // doexdiv: doexdivListData.find(
                      //   (item: any) => item.sub_code === row.doexdiv
                      // )?.code_name,
                      // taxdiv: taxdivListData.find(
                      //   (item: any) => item.sub_code === row.taxdiv
                      // )?.code_name,
                      // location: locationListData.find(
                      //   (item: any) => item.sub_code === row.location
                      // )?.code_name,
                      // person: usersListData.find(
                      //   (item: any) => item.sub_code === row.person
                      // )?.code_name,
                      // dptcd: departmentsListData.find(
                      //   (item: any) => item.sub_code === row.dptcd
                      // )?.code_name,
                      // itemacnt: itemacntListData.find(
                      //   (item: any) => item.sub_code === row.itemacnt
                      // )?.code_name,
                      // qtyunit: qtyunitListData.find(
                      //   (item: any) => item.sub_code === row.qtyunit
                      // )?.code_name,
                      [SELECTED_FIELD]: selectedState[planIdGetter(row)],
                    })),
                    {} //planDataState
                  )}
                  {...planDataState}
                  onDataStateChange={onPlanDataStateChange}
                  //선택 기능
                  dataItemKey={PLAN_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={planDataResult.total}
                  onScroll={onPlanScrollHandler}
                  //정렬기능
                  sortable={true}
                  onSortChange={onPlanSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  //그룹기능
                  groupable={true}
                  onExpandChange={onPlanExpandChange}
                  expandField="expanded"
                  //incell 수정 기능
                  onItemChange={onPlanItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="plandt"
                    title="계획일자"
                    editor="date"
                    format="{0:yyyy-MM-dd}"
                    footerCell={planTotalFooterCell}
                    width="110px"
                  />
                  <GridColumn
                    field="finexpdt"
                    title="완료예정일"
                    format="{0:yyyy-MM-dd}"
                    width="110px"
                    editor="date"
                  />

                  <GridColumn field="proccd" title="공정" width="170px" />
                  <GridColumn
                    field="procseq"
                    title="공정순서"
                    width="160px"
                    editor="numeric"
                  />
                  <GridColumn
                    field="outprocyn"
                    title="외주구분"
                    width="180px"
                    cell={NameCell}
                  />
                  <GridColumn field="itemcd" title="제공품코드" width="200px" />
                  <GridColumn
                    field="qty"
                    title="수량"
                    width="120px"
                    editor="numeric"
                  />
                  <GridColumn
                    field="procqty"
                    title="재공생산량"
                    width="120px"
                    editor="numeric"
                  />

                  <GridColumn
                    field="qtyunit"
                    title="수량단위"
                    width="120px"
                    cell={DropDownCell}
                  />
                  <GridColumn field="insiz" title="규격" width="120px" />
                  <GridColumn
                    field="prodmac"
                    title="설비"
                    width="120px"
                    cell={NameCell}
                  />
                  <GridColumn
                    field="prodemp"
                    title="작업자"
                    width="120px"
                    cell={NameCell}
                  />
                  <GridColumn
                    field="plankey"
                    title="생산계획번호"
                    width="120px"
                    cell={NameCell}
                  />
                  <GridColumn
                    field="ordkey"
                    title="수주번호"
                    width="120px"
                    editable={false}
                  />
                  <GridColumn field="poregnum" title="PO번호" width="120px" />
                  <GridColumn
                    field="purtype"
                    title="발주유형"
                    width="120px"
                    cell={NameCell}
                  />
                  <GridColumn field="itemnm" title="품목명" width="120px" />
                  <GridColumn
                    field="itemlml1"
                    title="대분류"
                    width="120px"
                    cell={NameCell}
                  />
                  <GridColumn
                    field="itemlml2"
                    title="중분류"
                    width="120px"
                    cell={NameCell}
                  />
                  <GridColumn
                    field="itemlml3"
                    title="소분류"
                    width="120px"
                    cell={NameCell}
                  />
                  <GridColumn
                    field="urgencyyn"
                    title="긴급여부"
                    width="120px"
                    cell={NameCell}
                  />
                  <GridColumn field="custnm" title="업체명" width="120px" />
                  <GridColumn field="remark" title="비고" width="120px" />
                </Grid>
              </ExcelExport>
            </GridContainer>

            <GridContainer maxWidth="500px">
              <GridTitleContainer>
                <GridTitle>소요자재리스트</GridTitle>

                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="plus"
                  ></Button>
                  <Button
                    onClick={onCopyClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                  ></Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "680px" }}
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    /* itemacnt: itemacntListData.find(
                      (item: any) => item.sub_code === row.itemacnt
                    )?.code_name,*/
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code === row.qtyunit
                    )?.code_name,
                  })),
                  detailDataState
                )}
                {...detailDataState}
                onDataStateChange={onDetailDataStateChange}
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
              >
                <GridColumn
                  field="proccd"
                  title="공정"
                  width="160px"
                  footerCell={detailTotalFooterCell}
                />
                <GridColumn
                  field="chlditemcd"
                  title="소요자재코드"
                  width="180px"
                />
                <GridColumn
                  field="chlditemnm"
                  title="소요자재명"
                  width="200px"
                />
                <GridColumn field="procqty" title="재공생산량" width="120px" />
                <GridColumn
                  field="unitqty"
                  title="소요량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="qtyunit" title="수량단위" width="120px" />
                <GridColumn field="outgb" title="자재사용구분" width="120px" />
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>

      {planWindowVisible && (
        <PlanWindow
          getVisible={setPlanWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          ordkey={ordkey}
          itemcd={itemcd}
          isCopy={isCopy}
          reloadData={reloadData}
          para={detailParameters}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          getVisible={setCustWindowVisible}
          workType={workType}
          getData={getCustData}
          para={undefined}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          getVisible={setItemWindowVisible}
          workType={"FILTER"}
          getData={getItemData}
          para={undefined}
        />
      )}
    </>
  );
};

export default PR_A1100;
