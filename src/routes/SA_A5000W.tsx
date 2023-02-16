import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridHeaderSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import calculateSize from "calculate-size";
import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
  to_date2
} from "../components/CommonFunction";
import DetailWindow from "../components/Windows/SA_A5000W_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import ComboBoxCell from "../components/Cells/ComboBoxCell";

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";

const SA_A5000: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

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
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).valueCode,
        cboPerson: defaultOption.find((item: any) => item.id === "cboPerson")
          .valueCode,
        cboDoexdiv: defaultOption.find((item: any) => item.id === "cboDoexdiv")
          .valueCode,
        dtgb: defaultOption.find((item: any) => item.id === "dtgb").valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
        taxdiv: defaultOption.find((item: any) => item.id === "taxdiv")
          .valueCode,
        taxyn: defaultOption.find((item: any) => item.id === "taxyn").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SA002,L_BA005,L_BA029,L_BA002,L_sysUserMaster_001,L_dptcd_001,L_BA061,L_BA015,L_finyn",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
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
  const [finynListData, setFinynListData] = useState([{ code: "", name: "" }]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const ordstsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA002")
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA029")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      const usersQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const departmentQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const finynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_finyn")
      );

      fetchQuery(ordstsQueryStr, setOrdstsListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
      fetchQuery(taxdivQueryStr, setTaxdivListData);
      fetchQuery(locationQueryStr, setLocationListData);
      fetchQuery(usersQueryStr, setUsersListData);
      fetchQuery(departmentQueryStr, setDepartmentsListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(finynQueryStr, setFinynListData);
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
  const [isInitSearch, setIsInitSearch] = useState(false);

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.num]: true });

      setDetailFilters((prev) => ({
        ...prev,
        seq1: rowData.seq1,
        recdt: to_date2(rowData.recdt),
      }));

      setIsCopy(false);
      setWorkType("U");
      setDetailWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onEditClick}
          icon="edit"
        ></Button>
      </td>
    );
  };

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
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

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [detailPgNum, setDetailPgNum] = useState(1);

  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [isCopy, setIsCopy] = useState(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
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
    orgdiv: "01",
    cboLocation: "",
    position: "",
    dtgb: "A",
    frdt: new Date(),
    todt: new Date(),
    cboPerson: "",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    cboDoexdiv: "",
    taxdiv: "",
    taxyn: "N",
    itemcd: "",
    itemnm: "",
    ordkey: "",
    recdt: new Date(),
    seq1: 0,
    company_code: "2207A046",
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    recdt: new Date(),
    seq1: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SA_A5000W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.cboLocation,
      "@p_position": filters.position,
      "@p_dtgb": filters.dtgb,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_person": filters.cboPerson,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_rcvcustcd": filters.rcvcustcd,
      "@p_rcvcustnm": filters.rcvcustnm,
      "@p_doexdiv": filters.cboDoexdiv,
      "@p_taxdiv": filters.taxdiv,
      "@p_taxyn": filters.taxyn,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_ordkey": filters.ordkey,
      "@p_recdt": convertDateToStr(filters.recdt),
      "@p_seq1": filters.seq1,
      "@p_company_code": filters.company_code,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_SA_A5000W_Q",
    pageNumber: detailPgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.cboLocation,
      "@p_position": filters.position,
      "@p_dtgb": filters.dtgb,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_person": filters.cboPerson,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_rcvcustcd": filters.rcvcustcd,
      "@p_rcvcustnm": filters.rcvcustnm,
      "@p_doexdiv": filters.cboDoexdiv,
      "@p_taxdiv": filters.taxdiv,
      "@p_taxyn": filters.taxyn,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_ordkey": filters.ordkey,
      "@p_recdt": convertDateToStr(detailFilters.recdt),
      "@p_seq1": detailFilters.seq1,
      "@p_company_code": filters.company_code,
    },
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    recdt: "",
    seq1: 0,
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_SA_A5000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": filters.orgdiv,
      "@p_recdt": paraDataDeleted.recdt,
      "@p_seq1": paraDataDeleted.seq1,
      "@p_location": "",
      "@p_position": "",
      "@p_outdt": "",
      "@p_shipdt": "",
      "@p_doexdiv": "",
      "@p_taxdiv": "",
      "@p_amtunit": "",
      "@p_baseamt": 0,
      "@p_wonchgrat": 0,
      "@p_uschgrat": 0,
      "@p_person": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_rcvcustcd": "",
      "@p_rcvcustnm": "",
      "@p_attdatnum": "",
      "@p_remark": "",
      "@p_rowstatus_s": "",
      "@p_seq2_s": "",
      "@p_itemcd_s": "",
      "@p_itemacnt_s": "",
      "@p_qty_s": "",
      "@p_qtyunit_s": "",
      "@p_unpcalmeth_s": "",
      "@p_unp_s": "",
      "@p_amt_s": "",
      "@p_wonamt_s": "",
      "@p_taxamt_s": "",
      "@p_dlramt_s": "",
      "@p_unitwgt_s": "",
      "@p_totwgt_s": "",
      "@p_wgtunit_s":"",
      "@p_remark_s": "",
      "@p_poregnum_s": "",
      "@p_ordnum_s":"",
      "@p_ordseq_s": "",
      "@p_outrecdt_s": "",
      "@p_outseq1_s": "",
      "@p_outseq2_s": "",
      "@p_sort_seq_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_SA_A2300W",
      "@p_company_code": "2207A046"
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
    console.log(data)
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;
      resetAllGrid();

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchDetailGrid = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setDetailDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData !== null &&
      isInitSearch === false &&
      permissions !== null
    ) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  useEffect(() => {
    resetDetailGrid();
    if (customOptionData !== null && mainDataResult.total > 0) {
      fetchDetailGrid();
    }
  }, [detailFilters]);

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.num]: true });

        setDetailFilters((prev) => ({
          ...prev,
          seq1: firstRowData.seq1,
          recdt: to_date2(firstRowData.recdt),
        }));

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setDetailPgNum(1);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  const resetDetailGrid = () => {
    setDetailPgNum(1);
    setDetailDataResult(process([], detailDataState));
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
      seq1: selectedRowData.seq1,
      recdt: to_date2(selectedRowData.recdt),
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
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  const onDetailScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, PAGE_SIZE))
      setDetailPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
    );
    var parts = sum.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
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

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  const onAddClick = () => {
    setIsCopy(false);
    setWorkType("N");
    setDetailWindowVisible(true);
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
      seq1: selectedRowData.seq1,
      recdt: to_date2(selectedRowData.recdt),
    }));

    setIsCopy(true);
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onDeleteClick = (e: any) => {
    const data = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      recdt: data.recdt,
      seq1: data.seq1,
    }));
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.recdt = "";
    paraDataDeleted.seq1=0;
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
    fetchDetailGrid();
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A5000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A5000W_001");
      } else if (
        filters.dtgb == null ||
        filters.dtgb == "" ||
        filters.dtgb == undefined
      ) {
        throw findMessage(messagesData, "SA_A5000W_002");
      } else {
        resetAllGrid();
        fetchMainGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  const setCopyData = (data: any, filter: any, deletedMainRows: any) => {
    let valid = true;

    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    // if (dataItem.length === 0) return false;
    // setParaData((prev) => ({
    //   ...prev,
    //   amtunit: filter.amtunit,
    //   attdatnum: filter.attdatnum,
    //   custcd: filter.custcd,
    //   custnm: filter.custnm,
    //   carno: filter.carno,
    //   cargocd: filter.cargocd,
    //   trcost: parseInt(filter.trcost),
    //   doexdiv: filter.doexdiv,
    //   dvnm: filter.dvnm,
    //   dvnum: filter.dvnum,
    //   finaldes: filter.finaldes,
    //   custprsncd: filter.custprsncd,
    //   location: "01",
    //   orgdiv: "01",
    //   outdt: filter.outdt,
    //   outtype: filter.outtype,
    //   person: filter.person,
    //   rcvcustcd: filter.rcvcustcd,
    //   rcvcustnm: filter.rcvcustnm,
    //   recdt: filter.recdt,
    //   remark: filter.remark,
    //   seq1: filter.seq1,
    //   shipdt: filter.shipdt,
    //   wonchgrat: filter.wonchgrat,
    //   userid: userId,
    //   pc: pc,
    //   form_id: "SA_A2300W",
    //   serviceid: "2207A046",
    //   files: filter.files,
    // }));

    // let dataArr: TdataArr = {
    //   rowstatus: [],
    //   seq2: [],
    //   ordnum: [],
    //   ordseq: [],
    //   portcd: [],
    //   portnm: [],
    //   prcterms: [],
    //   poregnum: [],
    //   itemcd: [],
    //   itemnm: [],
    //   itemacnt: [],
    //   qty: [],
    //   qtyunit: [],
    //   unp: [],
    //   amt: [],
    //   dlramt: [],
    //   wonamt: [],
    //   taxamt: [],
    //   lotnum: [],
    //   remark_s: [],
    //   inrecdt: [],
    //   reqnum: [],
    //   reqseq: [],
    //   serialno: [],
    //   outlot: [],
    //   unitqty: [],
    // };

    // dataItem.forEach((item: any, idx: number) => {
    //   const {
    //     amt = "",
    //     itemacnt = "",
    //     itemcd = "",
    //     itemnm = "",
    //     lotnum = "",
    //     ordnum = "",
    //     ordseq = "",
    //     poregnum = "",
    //     rowstatus = "",
    //     seq2 = "",
    //     taxamt = "",
    //     unp = "",
    //     qty = "",
    //     qtyunit = "",
    //     wonamt = "",
    //     dlramt = "",
    //     unitqty = "",
    //     reqseq = "",
    //     remark = "",
    //   } = item;
    //   dataArr.rowstatus.push(rowstatus);
    //   dataArr.seq2.push(seq2 == "" ? 0 : seq2);
    //   dataArr.ordnum.push(ordnum == undefined ? "" : ordnum);
    //   dataArr.ordseq.push(ordseq == "" ? 0 : ordseq);
    //   dataArr.portcd.push("");
    //   dataArr.portnm.push("");
    //   dataArr.prcterms.push("");
    //   dataArr.poregnum.push(poregnum == undefined ? "" : poregnum);
    //   dataArr.itemcd.push(itemcd);
    //   dataArr.itemnm.push(itemnm);
    //   dataArr.itemacnt.push(itemacnt == undefined ? "" : itemacnt);
    //   dataArr.qty.push(qty == "" ? 0 : qty);
    //   dataArr.qtyunit.push(qtyunit == undefined ? "" : qtyunit);
    //   dataArr.unp.push(unp == "" ? 0 : unp);
    //   dataArr.amt.push(amt == "" ? 0 : amt);
    //   dataArr.dlramt.push(dlramt == "" ? 0 : dlramt);
    //   dataArr.wonamt.push(wonamt == "" ? 0 : wonamt);
    //   dataArr.taxamt.push(taxamt == "" ? 0 : taxamt);
    //   dataArr.lotnum.push(lotnum == undefined ? "" : lotnum);
    //   dataArr.remark_s.push(remark == undefined ? "" : remark);
    //   dataArr.inrecdt.push("");
    //   dataArr.reqnum.push("");
    //   dataArr.reqseq.push(reqseq == "" ? 0 : reqseq);
    //   dataArr.outlot.push("");
    //   dataArr.serialno.push("");
    //   dataArr.unitqty.push(unitqty == "" ? 0 : unitqty);
    // });
    // deletedMainRows.forEach((item: any, idx: number) => {
    //   const {
    //     amt = "",
    //     itemacnt = "",
    //     itemcd = "",
    //     itemnm = "",
    //     lotnum = "",
    //     ordnum = "",
    //     ordseq = "",
    //     poregnum = "",
    //     rowstatus = "",
    //     seq2 = "",
    //     taxamt = "",
    //     unp = "",
    //     qty = "",
    //     qtyunit = "",
    //     wonamt = "",
    //     dlramt = "",
    //     unitqty = "",
    //     reqseq = "",
    //     remark = "",
    //   } = item;
    //   dataArr.rowstatus.push(rowstatus);
    //   dataArr.seq2.push(seq2 == "" ? 0 : seq2);
    //   dataArr.ordnum.push(ordnum == undefined ? "" : ordnum);
    //   dataArr.ordseq.push(ordseq == "" ? 0 : ordseq);
    //   dataArr.portcd.push("");
    //   dataArr.portnm.push("");
    //   dataArr.prcterms.push("");
    //   dataArr.poregnum.push(poregnum == undefined ? "" : poregnum);
    //   dataArr.itemcd.push(itemcd);
    //   dataArr.itemnm.push(itemnm);
    //   dataArr.itemacnt.push(itemacnt == undefined ? "" : itemacnt);
    //   dataArr.qty.push(qty == "" ? 0 : qty);
    //   dataArr.qtyunit.push(qtyunit == undefined ? "" : qtyunit);
    //   dataArr.unp.push(unp == "" ? 0 : unp);
    //   dataArr.amt.push(amt == "" ? 0 : amt);
    //   dataArr.dlramt.push(dlramt == "" ? 0 : dlramt);
    //   dataArr.wonamt.push(wonamt == "" ? 0 : wonamt);
    //   dataArr.taxamt.push(taxamt == "" ? 0 : taxamt);
    //   dataArr.lotnum.push(lotnum == undefined ? "" : lotnum);
    //   dataArr.remark_s.push(remark == undefined ? "" : remark);
    //   dataArr.inrecdt.push("");
    //   dataArr.reqnum.push("");
    //   dataArr.reqseq.push(reqseq == "" ? 0 : reqseq);
    //   dataArr.outlot.push("");
    //   dataArr.serialno.push("");
    //   dataArr.unitqty.push(unitqty == "" ? 0 : unitqty);
    // });
    // setParaData((prev) => ({
    //   ...prev,
    //   workType: workType,
    //   rowstatus: dataArr.rowstatus.join("|"),
    //   seq2: dataArr.seq2.join("|"),
    //   ordnum: dataArr.ordnum.join("|"),
    //   ordseq: dataArr.ordseq.join("|"),
    //   portcd: dataArr.portcd.join("|"),
    //   portnm: dataArr.portnm.join("|"),
    //   prcterms: dataArr.prcterms.join("|"),
    //   poregnum: dataArr.poregnum.join("|"),
    //   itemcd: dataArr.itemcd.join("|"),
    //   itemnm: dataArr.itemnm.join("|"),
    //   itemacnt: dataArr.itemacnt.join("|"),
    //   qty: dataArr.qty.join("|"),
    //   qtyunit: dataArr.qtyunit.join("|"),
    //   unp: dataArr.unp.join("|"),
    //   amt: dataArr.amt.join("|"),
    //   dlramt: dataArr.dlramt.join("|"),
    //   wonamt: dataArr.wonamt.join("|"),
    //   taxamt: dataArr.taxamt.join("|"),
    //   lotnum: dataArr.lotnum.join("|"),
    //   remark_s: dataArr.remark_s.join("|"),
    //   inrecdt: dataArr.inrecdt.join("|"),
    //   reqnum: dataArr.reqnum.join("|"),
    //   reqseq: dataArr.reqseq.join("|"),
    //   serialno: dataArr.serialno.join("|"),
    //   outlot: dataArr.outlot.join("|"),
    //   unitqty: dataArr.unitqty.join("|"),
    // }));
  };

  const onDetailHeaderSelectionChange = useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: {
        [id: string]: boolean | number[];
      } = {};

      event.dataItems.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });

      setDetailSelectedState(newSelectedState);
    },
    []
  );

  return (
    <>
      <TitleContainer>
        <Title>판매처리</Title>

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
      <FilterBoxWrap>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>일자구분</th>
              <td colSpan={5}>
                <div className="filter-item-wrap">
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="dtgb"
                      value={filters.dtgb}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
                      textField="name"
                      valueField="code"
                    />
                  )}
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                  />
                  ~
                  <DatePicker
                    name="todt"
                    value={filters.todt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                  />
                </div>
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
              <th>계산서여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="taxyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>

            <tr>
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
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>사업부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="position"
                    value={filters.position}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>업체코드</th>
              <td>
                <div className="filter-item-wrap">
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
                </div>
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
              <th></th>
              <td></td>
            </tr>
            <tr>
              <th>수주번호</th>
              <td>
                <Input
                  name="ordkey"
                  type="text"
                  value={filters.ordkey}
                  onChange={filterInputChange}
                />
              </td>
              <th>내수구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboDoexdiv"
                    value={filters.cboDoexdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>과세구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="taxdiv"
                    value={filters.taxdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>인수처코드</th>
              <td>
                <div className="filter-item-wrap">
                  <Input
                    name="rcvcustcd"
                    type="text"
                    value={filters.rcvcustcd}
                    onChange={filterInputChange}
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onCustWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </div>
              </td>
              <th>인수처명</th>
              <td>
                <Input
                  name="rcvcustnm"
                  type="text"
                  value={filters.rcvcustnm}
                  onChange={filterInputChange}
                />
              </td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
            <ButtonContainer>
            <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                판매처리생성
              </Button>
            <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                판매처리삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "36vh" }}
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
                  (item: any) => item.user_id === row.person
                )?.user_name,
                dptcd: departmentsListData.find(
                  (item: any) => item.dptcd === row.dptcd
                )?.dptnm,
                finyn: finynListData.find(
                  (item: any) => item.code === row.finyn
                )?.name,
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
            onSelectionChange={onSelectionChange}
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
          >
            <GridColumn cell={CommandCell} width="60px" />
            <GridColumn
              field="outdt"
              title="매출일자"
              cell={DateCell}
              width="150px"
            />
            <GridColumn
              field="shipdt"
              title="선적일자"
              cell={DateCell}
              width="150px"
            />
            <GridColumn field="person" title="담당자" width="150px" />
            <GridColumn field="custcd" title="업체코드" width="200px" />
            <GridColumn field="custnm" title="업체명" width="250px" />
            <GridColumn
              field="qty"
              title="수량"
              width="150px"
              footerCell={gridSumQtyFooterCell}
              cell={NumberCell}
            />
            <GridColumn
              field="amt"
              title="금액"
              width="150px"
              footerCell={gridSumQtyFooterCell}
              cell={NumberCell}
            />
            <GridColumn
              field="wonamt"
              title="원화금액"
              width="150px"
              footerCell={gridSumQtyFooterCell}
              cell={NumberCell}
            />
            <GridColumn
              field="taxamt"
              title="세액"
              width="150px"
              footerCell={gridSumQtyFooterCell}
              cell={NumberCell}
            />
            <GridColumn
              field="totamt"
              title="합계금액"
              width="150px"
              footerCell={gridSumQtyFooterCell}
              cell={NumberCell}
            />
            <GridColumn field="taxnum" title="계산서NO" width="250px" />
            <GridColumn field="reckey" title="판매번호" width="250px" />
          </Grid>
        </ExcelExport>
      </GridContainer>

      <GridContainer>
        <GridTitleContainer>
          <GridTitle>상세정보</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: "34vh" }}
          data={process(
            detailDataResult.data.map((row) => ({
              ...row,
              itemacnt: itemacntListData.find(
                (item: any) => item.sub_code === row.itemacnt
              )?.code_name,
              qtyunit: qtyunitListData.find(
                (item: any) => item.sub_code === row.qtyunit
              )?.code_name,
            })),
            detailDataState
          )}
          {...detailDataState}
          onDataStateChange={onDetailDataStateChange}
          onHeaderSelectionChange={onDetailHeaderSelectionChange}
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
            field="sort_seq"
            title="정렬순서"
            width="80px"
            footerCell={detailTotalFooterCell}
            cell={NumberCell}
          />
          <GridColumn field="itemcd" title="품목코드" width="250px" />
          <GridColumn field="itemnm" title="품목명" width="200px" />
          <GridColumn field="itemacnt" title="품목계정" width="150px" />
          <GridColumn field="insiz" title="규격" width="200px" />
          <GridColumn
            field="qty"
            title="수량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn field="qty" title="수량단위" width="150px" />
          <GridColumn field="unpcalmeth" title="단가산정방법" width="150px" />
          <GridColumn
            field="unp"
            title="단가"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="amt"
            title="금액"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="wonamt"
            title="원화금액"
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
            field="dlramt"
            title="달러금액"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="unitwgt"
            title="단량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="totwgt"
            title="총중량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn field="wgtunit" title="중량단위" width="120px" />
          <GridColumn field="remark" title="비고" width="400px" />
          <GridColumn field="poregnum" title="PO사업자" width="250px" />
          <GridColumn field="ordkey" title="수주번호" width="250px" />
          <GridColumn field="outreckey" title="출하번호" width="250px" />
          <GridColumn field="reckey" title="판매번호" width="250px" />
        </Grid>
      </GridContainer>
      {detailWindowVisible && (
        <DetailWindow
        setVisible={setDetailWindowVisible}
        workType={workType} //신규 : N, 수정 : U
        setData={setCopyData}
        data={
          mainDataResult.data.filter(
            (item: any) =>
              item.num == Object.getOwnPropertyNames(selectedState)[0]
          )[0] == undefined
            ? ""
            : mainDataResult.data.filter(
                (item: any) =>
                  item.num == Object.getOwnPropertyNames(selectedState)[0]
              )[0]
        }
      />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
        />
      )}
    </>
  );
};

export default SA_A5000;
