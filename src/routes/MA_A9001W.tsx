import React, { useCallback, useEffect, useState, useRef } from "react";
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
  GridHeaderSelectionChangeEvent,
  GridHeaderCellProps,
} from "@progress/kendo-react-grid";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { gridList } from "../store/columns/MA_A9001W_C";
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
  FormBoxWrap,
  FormBox,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
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
  useSysMessage,
  getGridItemChangedData,
  toDate,
} from "../components/CommonFunction";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import CenterCell from "../components/Cells/CenterCell";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";
const dateField = ["purdt", "actdt", "paydt"];
const centerField = ["update_time"];
const numberField = ["taxamt", "totamt", "qty", "splyamt"];
const checkBoxField = ["rtxisuyn"];
const numberField2 = ["amt", "wonamt", "taxamt", "totamt"];
type TdataArr = {
  rowstatus_s: string[];
  recdt_s: string[];
  seq1_s: string[];
  seq2_s: string[];
  itemcd_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  lotnum_s: string[];
  remark_s: string[];
  itemacnt_s: string[];
  person_s: string[];
  custprsncd_s: string[];
  load_place_s: string[];
  orglot_s: string[];
  heatno_s: string[];
};

const MA_A9001W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [tabSelected, setTabSelected] = React.useState(0);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  let gridRef: any = useRef(null);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {

    }
  }, [tabSelected]);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

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
        taxtype: defaultOption.find((item: any) => item.id === "taxtype")
          .valueCode,
        actdiv: defaultOption.find((item: any) => item.id === "actdiv")
          .valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
        exceptyn: defaultOption.find((item: any) => item.id === "exceptyn")
          .valueCode,
        paydiv: defaultOption.find((item: any) => item.id === "paydiv")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC014, L_AC401, L_AC406, L_sysUserMaster_001, R_Etax,R_INOUTDIV2, L_BA002, L_BA003, L_BA015, L_AC030T",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [taxtypeListData, setTaxtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [etaxListData, setEtaxListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [exceptynListData, setExceptynListData] = useState([
    { code: "", name: "" },
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  // const [purstsListData, setPurstsListData] = useState([
  //   COM_CODE_DEFAULT_VALUE,
  // ]);
  // const [ordstsListData, setOrdstsListData] = useState([
  //   COM_CODE_DEFAULT_VALUE,
  // ]);
  // const [doexdivListData, setDoexdivListData] = useState([
  //   COM_CODE_DEFAULT_VALUE,
  // ]);
  // const [taxdivListData, setTaxdivListData] = useState([
  //   COM_CODE_DEFAULT_VALUE,
  // ]);
  // const [locationListData, setLocationListData] = useState([
  //   COM_CODE_DEFAULT_VALUE,
  // ]);
  // const [departmentsListData, setDepartmentsListData] = useState([
  //   { dptcd: "", dptnm: "" },
  // ]);
  // const [itemacntListData, setItemacntListData] = useState([
  //   COM_CODE_DEFAULT_VALUE,
  // ]);
  // const [qtyunitListData, setQtyunitListData] = useState([
  //   COM_CODE_DEFAULT_VALUE,
  // ]);
  // const [finynListData, setFinynListData] = useState([{ code: "", name: "" }]);
  // const [outpgmListData, setOutpgmListData] = useState([
  //   COM_CODE_DEFAULT_VALUE,
  // ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const taxtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC014")
      );
      const etaxQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC401")
      );
      const exceptynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC406")
      );
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      // const outpgmQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find((item: any) => item.bizComponentId === "L_SYS012")
      // );
      // const purstsQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find((item: any) => item.bizComponentId === "L_MA036")
      // );
      // const ordstsQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find((item: any) => item.bizComponentId === "L_SA002")
      // );
      // const doexdivQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      // );
      // const taxdivQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find((item: any) => item.bizComponentId === "L_BA029")
      // );
      // const locationQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      // );
      // const departmentQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find(
      //     (item: any) => item.bizComponentId === "L_dptcd_001"
      //   )
      // );
      // const itemacntQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      // );
      // const qtyunitQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      // );
      // const finynQueryStr = getQueryFromBizComponent(
      //   bizComponentData.find((item: any) => item.bizComponentId === "L_finyn")
      // );
      fetchQuery(taxtypeQueryStr, setTaxtypeListData);
      fetchQuery(etaxQueryStr, setEtaxListData);
      fetchQuery(exceptynQueryStr, setExceptynListData);
      fetchQuery(personQueryStr, setPersonListData);
      // fetchQuery(outpgmQueryStr, setOutpgmListData);
      // fetchQuery(purstsQueryStr, setPurstsListData);
      // fetchQuery(ordstsQueryStr, setOrdstsListData);
      // fetchQuery(doexdivQueryStr, setDoexdivListData);
      // fetchQuery(taxdivQueryStr, setTaxdivListData);
      // fetchQuery(locationQueryStr, setLocationListData);
      // fetchQuery(departmentQueryStr, setDepartmentsListData);
      // fetchQuery(itemacntQueryStr, setItemacntListData);
      // fetchQuery(qtyunitQueryStr, setQtyunitListData);
      // fetchQuery(finynQueryStr, setFinynListData);
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
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [subDataState2, setSubDataState2] = useState<State>({
    sort: [],
  });
  const [subDataState3, setSubDataState3] = useState<State>({
    sort: [],
  });
  const [isInitSearch2, setIsInitSearch2] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataTotal, setMainDataTotal] = useState<number>(0);

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [subDataResult2, setSubDataResult2] = useState<DataResult>(
    process([], subDataState2)
  );
  const [subDataResult3, setSubDataResult3] = useState<DataResult>(
    process([], subDataState3)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState, setSelectedSubState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState2, setSelectedSubState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState3, setSelectedSubState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [subPgNum1, setSubPgNum1] = useState(1);
  const [subPgNum2, setSubPgNum2] = useState(1);
  const [subPgNum3, setSubPgNum3] = useState(1);

  const [workType, setWorkType] = useState<"N" | "U">("N");

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
  };
  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      setInfomation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
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

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
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

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = subDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setSubDataResult((prev) => {
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    position: "",
    taxtype: "",
    exceptyn: "",
    actdiv: "",
    paydiv: "",
    reqdt: new Date(),
    seq: 0,
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [infomation, setInfomation] = useState({
    pgSize: PAGE_SIZE,
    acntdiv: "",
    acseq1: 0,
    acseq2: 0,
    actdt: new Date(),
    actkey: "",
    appnum: "",
    appyn: "",
    chk: "",
    creditcd: "",
    custcd: "",
    custnm: "",
    custregnum: "",
    etax: "",
    etxyn: "",
    exceptyn: "",
    inoutdiv: "",
    insert_userid: "",
    items: "",
    janamt: 0,
    location: "",
    orgdiv: "",
    payactkey: "",
    paydt: new Date(),
    paymentamt: 0,
    paymentnum: "",
    paymeth: "",
    position: "",
    prtdiv: "",
    qty: 0,
    qtyunit: "",
    remark: "",
    reqdt: new Date(),
    rtelno: "",
    rtxisuyn: "",
    seq: 0,
    splyamt: 0,
    taxamt: 0,
    taxdt: new Date(),
    taxnum: "",
    taxtype: "",
    totamt: 0,
    unp: 0,
    update_time: "",
    update_userid: "",
    wgt: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_MA_A9001W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_position": filters.position,
      "@p_taxtype": filters.taxtype,
      "@p_exceptyn": filters.exceptyn,
      "@p_actdiv": filters.actdiv,
      "@p_paydiv": filters.paydiv,
      "@p_reqdt": convertDateToStr(filters.reqdt),
      "@p_seq": filters.seq,
      "@p_company_code": "2207A046",
      "@p_find_row_value": filters.find_row_value,
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
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) setMainDataTotal(totalRowCnt);
      setMainDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowCnt,
        };
      });

      if (
        filters.find_row_value === "" &&
        filters.pgNum === 1 &&
        totalRowCnt > 0
      ) {
        // 첫번째 행 선택하기
        const firstRowData = rows[0];
        setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

        setInfomation((prev) => ({
          ...prev,
          acntdiv: firstRowData.acntdiv,
          acseq1: firstRowData.acseq1,
          acseq2: firstRowData.acseq2,
          actdt:
            firstRowData.actdt != "" ? toDate(firstRowData.actdt) : new Date(),
          actkey: firstRowData.actkey,
          appnum: firstRowData.appnum,
          appyn: firstRowData.appyn,
          chk: firstRowData.chk,
          creditcd: firstRowData.creditcd,
          custcd: firstRowData.custcd,
          custnm: firstRowData.custnm,
          custregnum: firstRowData.custregnum,
          etax: firstRowData.etax,
          etxyn: firstRowData.etxyn,
          exceptyn: firstRowData.exceptyn,
          inoutdiv: firstRowData.inoutdiv,
          insert_userid: firstRowData.insert_userid,
          items: firstRowData.items,
          janamt: firstRowData.janamt,
          location: firstRowData.location,
          orgdiv: firstRowData.orgdiv,
          payactkey: firstRowData.payactkey,
          paydt:
            firstRowData.paydt != "" ? toDate(firstRowData.paydt) : new Date(),
          paymentamt: firstRowData.paymentamt,
          paymentnum: firstRowData.paymentnum,
          paymeth: firstRowData.paymeth,
          position: firstRowData.position,
          prtdiv: firstRowData.prtdiv,
          qty: firstRowData.qty,
          qtyunit: firstRowData.qtyunit,
          remark: firstRowData.remark,
          reqdt:
            firstRowData.reqdt != "" ? toDate(firstRowData.reqdt) : new Date(),
          rtelno: firstRowData.rtelno,
          rtxisuyn: firstRowData.rtxisuyn,
          seq: firstRowData.seq,
          splyamt: firstRowData.splyamt,
          taxamt: firstRowData.taxamt,
          taxdt:
            firstRowData.taxdt != "" ? toDate(firstRowData.taxdt) : new Date(),
          taxnum: firstRowData.taxnum,
          taxtype: firstRowData.taxtype,
          totamt: firstRowData.totamt,
          unp: firstRowData.unp,
          update_time: firstRowData.update_time,
          update_userid: firstRowData.update_userid,
          wgt: firstRowData.wgt,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
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
      setFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록

      if (isInitSearch2 == false) {
        fetchMainGrid();
      } else if (filters.find_row_value !== "") {
        // 그룹코드로 조회 시 리셋 후 조회
        resetAllGrid();
        fetchMainGrid();
      } else {
        // 일반 조회
        fetchMainGrid();
      }
      setIsInitSearch2(true);
    }
  }, [filters, permissions]);

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

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    recdt: "",
    seq1: "",
    seq2: "",
  });

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );

    let dataArr: TdataArr = {
      rowstatus_s: [],
      recdt_s: [],
      seq1_s: [],
      seq2_s: [],
      itemcd_s: [],
      qty_s: [],
      qtyunit_s: [],
      lotnum_s: [],
      remark_s: [],
      itemacnt_s: [],
      person_s: [],
      custprsncd_s: [],
      load_place_s: [],
      orglot_s: [],
      heatno_s: [],
    };

    selectRows.forEach((item: any, idx: number) => {
      const { recdt = "", seq1 = "", seq2 = "" } = item;
      dataArr.recdt_s.push(recdt);
      dataArr.seq1_s.push(seq1);
      dataArr.seq2_s.push(seq2);
    });

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      recdt: dataArr.recdt_s.join("|"),
      seq1: dataArr.seq1_s.join("|"),
      seq2: dataArr.seq2_s.join("|"),
    }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataTotal(1);
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setSubDataResult2(process([], subDataState2));
    setSubDataResult2(process([], subDataState3));
  };
  const resetSubGrid = () => {
    setSubDataResult(process([], subDataState));
    setSubDataResult2(process([], subDataState2));
    setSubDataResult2(process([], subDataState3));
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

    const taxtype = taxtypeListData.find(
      (item: any) => item.code_name === selectedRowData.taxtype
    )?.sub_code;
    const etax = etaxListData.find(
      (item: any) => item.code_name === selectedRowData.etax
    )?.sub_code;
    const exceptyn = exceptynListData.find(
      (item: any) => item.name === selectedRowData.exceptyn
    )?.code;
    const insert_userid = personListData.find(
      (item: any) => item.user_name === selectedRowData.insert_userid
    )?.user_id;
    const update_userid = personListData.find(
      (item: any) => item.user_name === selectedRowData.update_userid
    )?.user_id;

    setInfomation((prev) => ({
      ...prev,
      acntdiv: selectedRowData.acntdiv,
      acseq1: selectedRowData.acseq1,
      acseq2: selectedRowData.acseq2,
      actdt:
        selectedRowData.actdt != ""
          ? toDate(selectedRowData.actdt)
          : new Date(),
      actkey: selectedRowData.actkey,
      appnum: selectedRowData.appnum,
      appyn: selectedRowData.appyn,
      chk: selectedRowData.chk,
      creditcd: selectedRowData.creditcd,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      custregnum: selectedRowData.custregnum,
      etax: etax == undefined ? "" : etax,
      etxyn: selectedRowData.etxyn,
      exceptyn: exceptyn == undefined ? "" : exceptyn,
      inoutdiv: selectedRowData.inoutdiv,
      insert_userid: insert_userid == undefined ? "" : insert_userid,
      items: selectedRowData.items,
      janamt: selectedRowData.janamt,
      location: selectedRowData.location,
      orgdiv: selectedRowData.orgdiv,
      payactkey: selectedRowData.payactkey,
      paydt:
        selectedRowData.paydt != ""
          ? toDate(selectedRowData.paydt)
          : new Date(),
      paymentamt: selectedRowData.paymentamt,
      paymentnum: selectedRowData.paymentnum,
      paymeth: selectedRowData.paymeth,
      position: selectedRowData.position,
      prtdiv: selectedRowData.prtdiv,
      qty: selectedRowData.qty,
      qtyunit: selectedRowData.qtyunit,
      remark: selectedRowData.remark,
      reqdt:
        selectedRowData.reqdt != ""
          ? toDate(selectedRowData.reqdt)
          : new Date(),
      rtelno: selectedRowData.rtelno,
      rtxisuyn: selectedRowData.rtxisuyn,
      seq: selectedRowData.seq,
      splyamt: selectedRowData.splyamt,
      taxamt: selectedRowData.taxamt,
      taxdt:
        selectedRowData.taxdt != ""
          ? toDate(selectedRowData.taxdt)
          : new Date(),
      taxnum: selectedRowData.taxnum,
      taxtype: taxtype == undefined ? "" : taxtype,
      totamt: selectedRowData.totamt,
      unp: selectedRowData.unp,
      update_time: selectedRowData.update_time,
      update_userid: update_userid == undefined ? "" : update_userid,
      wgt: selectedRowData.wgt,
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
  const onSubScrollHandler1 = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum1, PAGE_SIZE))
      setSubPgNum1((prev) => prev + 1);
  };
  const onSubScrollHandler2 = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum2, PAGE_SIZE))
      setSubPgNum2((prev) => prev + 1);
  };
  const onSubScrollHandler3 = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum3, PAGE_SIZE))
      setSubPgNum3((prev) => prev + 1);
  };
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };
  const onSubDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setSubDataState2(event.dataState);
  };
  const onSubDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setSubDataState3(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataTotal.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = subDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = subDataResult3.total.toString().split(".");
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
    subDataResult.data.forEach((item) =>
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
 
  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      setIsInitSearch2(false); // 한번만 조회되도록
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.recdt = "";
    paraDataDeleted.seq1 = "";
    paraDataDeleted.seq2 = "";
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    const data = subDataResult2.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedSubState2)[0]
    )[0];
    const newDatas = subDataResult.data.map((item) =>
      data.lotnum == item.lotnum
        ? {
            ...item,
            now_qty: item.now_qty + data.doqty,
          }
        : {
            ...item,
          }
    );

    setSubDataResult((prev) => {
      return {
        data: newDatas,
        total: prev.total,
      };
    });

    subDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedSubState2[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      }
    });

    setSubDataResult2((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setSubDataState2({});
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

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData2 = (data: ICustData) => {
    setInfomation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange2 = (e: any) => {
    setSubDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange3 = (e: any) => {
    setSubDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A2400W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A2400W_001");
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          scrollDirrection: "down",
          isSearch: true,
          pgGap: 0,
        }));
        setInfomation((prev) => ({
          ...prev,
          pgNum: 1,
          scrollDirrection: "down",
          isSearch: true,
          pgGap: 0,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSearch2 = () => {
    resetSubGrid();
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    location: "01",
    outdt: new Date(),
    dptcd: "",
    person: "admin",
    rowstatus_s: "",
    recdt_s: "",
    seq1_s: "",
    seq2_s: "",
    itemcd_s: "",
    qty_s: "",
    qtyunit_s: "",
    lotnum_s: "",
    remark_s: "",
    itemacnt_s: "",
    person_s: "",
    custprsncd_s: "",
    load_place_s: "",
    orglot_s: "",
    heatno_s: "",
  });

  const setCopyData = () => {
    let valid = true;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      recdt_s: [],
      seq1_s: [],
      seq2_s: [],
      itemcd_s: [],
      qty_s: [],
      qtyunit_s: [],
      lotnum_s: [],
      remark_s: [],
      itemacnt_s: [],
      person_s: [],
      custprsncd_s: [],
      load_place_s: [],
      orglot_s: [],
      heatno_s: [],
    };

    subDataResult2.data.forEach((item: any, idx: number) => {
      const {
        itemacnt = "",
        itemcd = "",
        rowstatus = "",
        lotnum = "",
        doqty = "",
        seq1 = "",
        seq2 = "",
        qtyunit = "",
        person = "",
        remark = "",
        custprsncd = "",
        load_place = "",
        heatno = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push("");
      dataArr.seq1_s.push(seq1 == undefined ? 0 : seq1);
      dataArr.seq2_s.push(seq2 == undefined ? 0 : seq2);
      dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
      dataArr.qty_s.push(doqty == "" ? 0 : doqty);
      dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
      dataArr.lotnum_s.push(lotnum == undefined ? "" : lotnum);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
      dataArr.itemacnt_s.push(itemacnt == undefined ? "" : itemacnt);
      dataArr.person_s.push(person == undefined ? "" : person);
      dataArr.custprsncd_s.push(custprsncd == undefined ? "" : custprsncd);
      dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
      dataArr.heatno_s.push(heatno == undefined ? "" : heatno);
    });
    setParaData((prev) => ({
      ...prev,
      workType: workType,
      location: filters.location,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      recdt_s: dataArr.recdt_s.join("|"),
      seq1_s: dataArr.seq1_s.join("|"),
      seq2_s: dataArr.seq2_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      qty_s: dataArr.qty_s.join("|"),
      qtyunit_s: dataArr.qtyunit_s.join("|"),
      lotnum_s: dataArr.lotnum_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      itemacnt_s: dataArr.itemacnt_s.join("|"),
      person_s: dataArr.person_s.join("|"),
      custprsncd_s: dataArr.custprsncd_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
      orglot_s: dataArr.orglot_s.join("|"),
      heatno_s: dataArr.heatno_s.join("|"),
    }));
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_MA_A3500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_location": ParaData.location,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_dptcd": ParaData.dptcd,
      "@p_person": ParaData.person,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_recdt_s": paraDataDeleted.recdt,
      "@p_seq1_s": paraDataDeleted.seq1,
      "@p_seq2_s": paraDataDeleted.seq2,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_person_s": ParaData.person_s,
      "@p_custprsncd_s": ParaData.custprsncd_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_orglot_s": ParaData.orglot_s,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A3500W",
    },
  };

  const para: Iparameters = {
    procedureName: "P_MA_A3500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": "01",
      "@p_location": ParaData.location,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_dptcd": ParaData.dptcd,
      "@p_person": ParaData.person,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_recdt_s": ParaData.recdt_s,
      "@p_seq1_s": ParaData.seq1_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_person_s": ParaData.person_s,
      "@p_custprsncd_s": ParaData.custprsncd_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_orglot_s": ParaData.orglot_s,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A3500W",
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
      resetAllGrid();
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s.length != 0) {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      DATA_ITEM_KEY
    );
  };

  const onItemChange = (event: GridItemChangeEvent) => {
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

  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "doqty" || field == "chk") {
      const newData = subDataResult.data.map((item) =>
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

      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              chk: typeof item.chk == "boolean" ? item.chk : false,
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
    }
  };

  const exitEdit = () => {
    const newData = subDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setSubDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit3 = () => {
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
  return (
    <>
      <TitleContainer>
        <Title>매입 E-TAX(전표)</Title>

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
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>계산서일자</th>
              <td colSpan={3}>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                  />
                  ~
                  <DatePicker
                    name="todt"
                    value={filters.todt}
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
                  />
                )}
              </td>
              <th>계산서유형</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="taxtype"
                    value={filters.taxtype}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>회계전표발행여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="actdiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
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
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="exceptyn"
                    value={filters.exceptyn}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    valueField="code"
                    textField="name"
                  />
                )}
              </td>
              <th>지급전표발행여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="paydiv"
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
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
            <Button
              onClick={onDeleteClick2}
              fillMode="outline"
              themeColor={"primary"}
              icon="delete"
            >
              삭제
            </Button>
          </GridTitleContainer>
          <Grid
            style={{ height: "25vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                taxtype: taxtypeListData.find(
                  (item: any) => item.sub_code === row.taxtype
                )?.code_name,
                etax: etaxListData.find(
                  (item: any) => item.sub_code === row.etax
                )?.code_name,
                exceptyn: exceptynListData.find(
                  (item: any) => item.code === row.exceptyn
                )?.name,
                insert_userid: personListData.find(
                  (item: any) => item.user_id === row.insert_userid
                )?.user_name,
                update_userid: personListData.find(
                  (item: any) => item.user_id === row.update_userid
                )?.user_name,
                rtxisuyn: row.rtxisuyn == "Y" ? true : false,
                [SELECTED_FIELD]: selectedState[idGetter(row)],
                chk: row.chk == "" ? false : row.chk,
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
              mode: "multiple",
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
            onItemChange={onItemChange}
            cellRender={customCellRender3}
            rowRender={customRowRender3}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell}
              cell={CheckBoxCell}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
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
                          : checkBoxField.includes(item.fieldName)
                          ? CheckBoxReadOnlyCell
                          : centerField.includes(item.fieldName)
                          ? CenterCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 0
                          ? mainTotalFooterCell
                          : numberField2.includes(item.fieldName)
                          ? gridSumQtyFooterCell
                          : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      <GridContainerWrap>
        <GridContainer width="45%">
          <FormBoxWrap>
            <FormBox>
              <tbody>
                <tr>
                  <th>계산서번호</th>
                  <td>
                    <Input
                      name="taxnum"
                      type="text"
                      value={infomation.taxnum}
                      className="readonly"
                    />
                  </td>
                  <th>TAX구분</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="etax"
                        value={infomation.etax}
                        bizComponentId="R_Etax"
                        bizComponentData={bizComponentData}
                        changeData={RadioChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>매입매출구분</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="inoutdiv"
                        value={infomation.inoutdiv}
                        bizComponentId="R_INOUTDIV2"
                        bizComponentData={bizComponentData}
                        className="readonly"
                      />
                    )}
                  </td>
                  <th></th>
                  <td>
                    <Checkbox
                      name="rtxisuyn"
                      label={"역발행여부"}
                      value={infomation.rtxisuyn}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>사업장</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="location"
                        value={infomation.location}
                        bizComponentId="L_BA002"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    )}
                  </td>
                  <th>사업부</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="position"
                        value={infomation.position}
                        bizComponentId="L_BA003"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>계산서일자</th>
                  <td>
                    <DatePicker
                      name="taxdt"
                      value={infomation.taxdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                    />
                  </td>
                  <th>결재구분</th>
                  <td>
                    <Input
                      name="acntdiv"
                      type="text"
                      value={infomation.acntdiv}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={infomation.custcd}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick2}
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
                      value={infomation.custnm}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>지급예정일</th>
                  <td>
                    <DatePicker
                      name="paydt"
                      value={infomation.paydt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                    />
                  </td>
                  <th>사업자번호</th>
                  <td>
                    <Input
                      name="custregnum"
                      type="text"
                      value={infomation.custregnum}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>수량</th>
                  <td>
                    <Input
                      name="qty"
                      type="number"
                      value={infomation.qty}
                      onChange={InputChange}
                    />
                  </td>
                  <th>수량단위</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="qtyunit"
                        value={infomation.qtyunit}
                        bizComponentId="L_BA015"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>계산서유형</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="taxtype"
                        value={infomation.taxtype}
                        bizComponentId="L_AC014"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    )}
                  </td>
                  <th>공급가액</th>
                  <td>
                    <Input
                      name="splyamt"
                      type="number"
                      value={infomation.splyamt}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>신용카드</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="creditcd"
                        value={infomation.creditcd}
                        bizComponentId="L_AC030T"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField="Column1"
                        valueField="creditcd"
                      />
                    )}
                  </td>
                  <th>부가세액</th>
                  <td>
                    <Input
                      name="taxamt"
                      type="number"
                      value={infomation.taxamt}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>거래품목</th>
                  <td>
                    <Input
                      name="items"
                      type="text"
                      value={infomation.items}
                      onChange={InputChange}
                    />
                  </td>
                  <th>합계금액</th>
                  <td>
                    <Input
                      name="totamt"
                      type="number"
                      value={infomation.totamt}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>합계금액</th>
                  <td colSpan={3}>
                    <TextArea
                      value={infomation.remark}
                      name="remark"
                      rows={3}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </GridContainer>
        <GridContainer width={`calc(55% - ${GAP}px)`}>
          <TabStrip
            style={{ width: "100%" }}
            selected={tabSelected}
            onSelect={handleSelectTab}
          >
            <TabStripTab title="입고자료">
              <GridContainerWrap>
                  <GridContainer>
                    {/* <Grid
                      style={{ height: "34vh" }}
                      data={process(
                        BOMDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedBOMState[idGetter(row)],
                        })),
                        BOMDataState
                      )}
                      {...BOMDataState}
                      onDataStateChange={onBOMDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "multiple",
                      }}
                      onSelectionChange={onBOMSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={BOMDataResult.total}
                      onScroll={onBOMScrollHandler}
                      //정렬기능
                      sortable={true}
                      onSortChange={onBOMSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        field="itemcd"
                        title="품목코드"
                        width="150px"
                        footerCell={BOMTotalFooterCell}
                      />
                      <GridColumn field="itemnm" title="품목명" width="150px" />
                      <GridColumn field="insiz" title="규격" width="120px" />
                    </Grid> */}
                  </GridContainer>
              </GridContainerWrap>
            </TabStripTab>
          </TabStrip>
        </GridContainer>
      </GridContainerWrap>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
        />
      )}
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

export default MA_A9001W;
