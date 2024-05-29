import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
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
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  handleKeyPressSearch,
  isValidDate,
  setDefaultDate,
  toDate,
  useSysMessage,
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
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import MA_A9001W_IN_Window from "../components/Windows/MA_A9001W_IN_Window";
import MA_A9001W_Window from "../components/Windows/MA_A9001W_Window";
import { useApi } from "../hooks/api";
import { heightstate, isLoading, isMobileState, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/MA_A9001W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
let targetRowIndex: null | number = null;
const dateField = ["purdt", "actdt", "paydt"];
const centerField = ["update_time"];
const numberField = [
  "taxamt",
  "totamt",
  "qty",
  "splyamt",
  "wonamt",
  "slipamt_1",
  "slipamt_2",
  "mngamt",
  "rate",
  "amt_1",
  "amt_2",
];
const checkBoxField = ["rtxisuyn"];
const numberField2 = [
  "qty",
  "amt",
  "wonamt",
  "taxamt",
  "totamt",
  "slipamt_1",
  "slipamt_2",
  "mngamt",
  "amt_1",
  "amt_2",
];

type TdataArr = {
  reqdt_s: string[];
  seq_s: string[];
};

type TdataArr2 = {
  rowstatus_s: string[];
  paymentnum_s: string[];
  paymentseq_s: string[];
  drcrdiv_s: string[];
  acntcd_s: string[];
  amt1_s: string[];
  amt2_s: string[];
  remark_s: string[];
  taxnum_s: string[];
  acntnum_s: string[];
  notenum_s: string[];
  enddt_s: string[];
  pubbank_s: string[];
  pubdt_s: string[];
  pubperson_s: string[];
  advanceinfo_s: string[];
};
var index = 0;

const MA_A9001W: React.FC = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);

  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  var height3 = getHeight(".ButtonContainer3");
  var height4 = getHeight(".k-tabstrip-items-wrapper");

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

  const [swiper, setSwiper] = useState<SwiperCore>();

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [tabSelected, setTabSelected] = React.useState(0);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("MA_A9001W", setMessagesData);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  let gridRef: any = useRef(null);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setSubFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setSubFilters3((prev) => ({
      ...prev,
      pgNum: 1,
    }));

    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
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

    setSubFilters((prev) => ({
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

    setSubFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("MA_A9001W", setCustomOptionData);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

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
        taxtype: defaultOption.find((item: any) => item.id == "taxtype")
          ?.valueCode,
        actdiv: defaultOption.find((item: any) => item.id == "actdiv")
          ?.valueCode,
        position: defaultOption.find((item: any) => item.id == "position")
          ?.valueCode,
        exceptyn: defaultOption.find((item: any) => item.id == "exceptyn")
          ?.valueCode,
        paydiv: defaultOption.find((item: any) => item.id == "paydiv")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC013, L_AC401, L_AC406, L_sysUserMaster_001, R_Etax,R_INOUTDIV2, L_BA002, L_BA003, L_BA015, L_AC030T, L_BA061, L_AC001",
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
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [drcrdivListData, setDrcrdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setTaxtypeListData(getBizCom(bizComponentData, "L_AC013"));
      setEtaxListData(getBizCom(bizComponentData, "L_AC401"));
      setExceptynListData(getBizCom(bizComponentData, "L_AC406"));
      setPersonListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setDrcrdivListData(getBizCom(bizComponentData, "L_AC001"));
    }
  }, [bizComponentData]);

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
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

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
  const [MA_A9001WVisible, setMA_A9001WVisible] = useState<boolean>(false);
  const [workType, setWorkType] = useState<"N" | "U">("U");
  const [dataWindowVisible, setDataWindowVisible] = useState<boolean>(false);

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
        rowstatus: item.rowstatus == "N" ? "N" : "U",
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
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
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    reqdt: new Date(),
    seq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [subfilters2, setSubFilters2] = useState({
    pgSize: PAGE_SIZE,
    reqdt: new Date(),
    seq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [subfilters3, setSubFilters3] = useState({
    pgSize: PAGE_SIZE,
    reqdt: new Date(),
    seq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [infomation, setInfomation] = useState<{ [name: string]: any }>({
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
    paydt: null,
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
    rtxisuyn: false,
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

  const [ParaMaker, setParaMaker] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    seq_s: "",
    reqdt_s: "",
  });

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    location: "",
    position: "",
    custcd: "",
    custnm: "",
    indt: "",
    doexdiv: "",
    amtunit: "",
    wonchgrat: 0,
    rowstatus_s: "",
    paymentnum_s: "",
    paymentseq_s: "",
    drcrdiv_s: "",
    acntcd_s: "",
    amt1_s: "",
    amt2_s: "",
    remark_s: "",
    taxnum_s: "",
    acntnum_s: "",
    notenum_s: "",
    enddt_s: "",
    pubbank_s: "",
    pubdt_s: "",
    pubperson_s: "",
    advanceinfo_s: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
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
        "@p_company_code": companyCode,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.reqdt + "-" + row.seq == filters.find_row_value
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.reqdt + "-" + row.seq == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setSubFilters((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: selectedRow.seq,
            reqdt:
              selectedRow.reqdt != "" ? toDate(selectedRow.reqdt) : new Date(),
          }));
          setSubFilters2((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: selectedRow.seq,
            reqdt:
              selectedRow.reqdt != "" ? toDate(selectedRow.reqdt) : new Date(),
          }));
          setSubFilters3((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: selectedRow.seq,
            reqdt:
              selectedRow.reqdt != "" ? toDate(selectedRow.reqdt) : new Date(),
          }));

          setInfomation((prev) => ({
            ...prev,
            acntdiv: selectedRow.acntdiv,
            acseq1: selectedRow.acseq1,
            acseq2: selectedRow.acseq2,
            actdt:
              selectedRow.actdt != "" ? toDate(selectedRow.actdt) : new Date(),
            actkey: selectedRow.actkey,
            appnum: selectedRow.appnum,
            appyn: selectedRow.appyn,
            chk: selectedRow.chk,
            creditcd: selectedRow.creditcd,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            custregnum: selectedRow.custregnum,
            etax: selectedRow.etax,
            etxyn: selectedRow.etxyn,
            exceptyn: selectedRow.exceptyn,
            inoutdiv: selectedRow.inoutdiv,
            insert_userid: selectedRow.insert_userid,
            items: selectedRow.items,
            janamt: selectedRow.janamt,
            location: selectedRow.location,
            orgdiv: selectedRow.orgdiv,
            payactkey: selectedRow.payactkey,
            paydt: isValidDate(selectedRow.paydt)
              ? new Date(dateformat(selectedRow.paydt))
              : null,
            paymentamt: selectedRow.paymentamt,
            paymentnum: selectedRow.paymentnum,
            paymeth: selectedRow.paymeth,
            position: selectedRow.position,
            prtdiv: selectedRow.prtdiv,
            qty: selectedRow.qty,
            qtyunit: selectedRow.qtyunit,
            remark: selectedRow.remark,
            reqdt:
              selectedRow.reqdt != "" ? toDate(selectedRow.reqdt) : new Date(),
            rtelno: selectedRow.rtelno,
            rtxisuyn: selectedRow.rtxisuyn == "Y" ? true : false,
            seq: selectedRow.seq,
            splyamt: selectedRow.splyamt,
            taxamt: selectedRow.taxamt,
            taxdt:
              selectedRow.taxdt != "" ? toDate(selectedRow.taxdt) : new Date(),
            taxnum: selectedRow.taxnum,
            taxtype: selectedRow.taxtype,
            totamt: selectedRow.totamt,
            unp: selectedRow.unp,
            update_time: selectedRow.update_time,
            update_userid: selectedRow.update_userid,
            wgt: selectedRow.wgt,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setSubFilters((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: rows[0].seq,
            reqdt: rows[0].reqdt != "" ? toDate(rows[0].reqdt) : new Date(),
          }));
          setSubFilters2((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: rows[0].seq,
            reqdt: rows[0].reqdt != "" ? toDate(rows[0].reqdt) : new Date(),
          }));
          setSubFilters3((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: rows[0].seq,
            reqdt: rows[0].reqdt != "" ? toDate(rows[0].reqdt) : new Date(),
          }));

          setInfomation((prev) => ({
            ...prev,
            acntdiv: rows[0].acntdiv,
            acseq1: rows[0].acseq1,
            acseq2: rows[0].acseq2,
            actdt: rows[0].actdt != "" ? toDate(rows[0].actdt) : new Date(),
            actkey: rows[0].actkey,
            appnum: rows[0].appnum,
            appyn: rows[0].appyn,
            chk: rows[0].chk,
            creditcd: rows[0].creditcd,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            custregnum: rows[0].custregnum,
            etax: rows[0].etax,
            etxyn: rows[0].etxyn,
            exceptyn: rows[0].exceptyn,
            inoutdiv: rows[0].inoutdiv,
            insert_userid: rows[0].insert_userid,
            items: rows[0].items,
            janamt: rows[0].janamt,
            location: rows[0].location,
            orgdiv: rows[0].orgdiv,
            payactkey: rows[0].payactkey,
            paydt: isValidDate(rows[0].paydt)
              ? new Date(dateformat(rows[0].paydt))
              : null,
            paymentamt: rows[0].paymentamt,
            paymentnum: rows[0].paymentnum,
            paymeth: rows[0].paymeth,
            position: rows[0].position,
            prtdiv: rows[0].prtdiv,
            qty: rows[0].qty,
            qtyunit: rows[0].qtyunit,
            remark: rows[0].remark,
            reqdt: rows[0].reqdt != "" ? toDate(rows[0].reqdt) : new Date(),
            rtelno: rows[0].rtelno,
            rtxisuyn: rows[0].rtxisuyn == "Y" ? true : false,
            seq: rows[0].seq,
            splyamt: rows[0].splyamt,
            taxamt: rows[0].taxamt,
            taxdt: rows[0].taxdt != "" ? toDate(rows[0].taxdt) : new Date(),
            taxnum: rows[0].taxnum,
            taxtype: rows[0].taxtype,
            totamt: rows[0].totamt,
            unp: rows[0].unp,
            update_time: rows[0].update_time,
            update_userid: rows[0].update_userid,
            wgt: rows[0].wgt,
          }));
        }
      } else {
        setSubDataResult(process([], subDataState));
        setSubDataResult2(process([], subDataState2));
        setSubDataResult3(process([], subDataState3));
      }
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

  //그리드 데이터 조회
  const fetchSubGrid1 = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_MA_A9001W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL_1",
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
        "@p_reqdt": convertDateToStr(subfilters.reqdt),
        "@p_seq": subfilters.seq,
        "@p_company_code": companyCode,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedSubState({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setSubFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchSubGrid2 = async (subfilters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const subparameters2: Iparameters = {
      procedureName: "P_MA_A9001W_Q",
      pageNumber: subfilters2.pgNum,
      pageSize: subfilters2.pgSize,
      parameters: {
        "@p_work_type": "DETAIL_2",
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
        "@p_reqdt": convertDateToStr(subfilters2.reqdt),
        "@p_seq": subfilters2.seq,
        "@p_company_code": companyCode,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", subparameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setSubDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedSubState2({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setSubFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchSubGrid3 = async (subfilters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const subparameters3: Iparameters = {
      procedureName: "P_MA_A9001W_Q",
      pageNumber: subfilters3.pgNum,
      pageSize: subfilters3.pgSize,
      parameters: {
        "@p_work_type": "DETAIL_3",
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
        "@p_reqdt": convertDateToStr(subfilters3.reqdt),
        "@p_seq": subfilters3.seq,
        "@p_company_code": companyCode,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", subparameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setSubDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedSubState3({ [rows[0][DATA_ITEM_KEY4]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setSubFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
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
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (
      customOptionData != null &&
      subfilters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid1(deepCopiedFilters);
    }
  }, [subfilters, permissions]);

  useEffect(() => {
    if (
      customOptionData != null &&
      subfilters2.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters2);
      setSubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subfilters2, permissions]);

  useEffect(() => {
    if (
      customOptionData != null &&
      subfilters3.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters3);
      setSubFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid3(deepCopiedFilters);
    }
  }, [subfilters3, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    reqdt: "",
    seq: 0,
  });

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.total > 0) {
      const data = mainDataResult.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        reqdt: data.reqdt,
        seq: data.seq,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onPurDropClick = (e: any) => {
    if (!window.confirm("해제하시겠습니까?")) {
      return false;
    }

    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );
    let dataArr: TdataArr = {
      reqdt_s: [],
      seq_s: [],
    };
    if (selectRows.length == 0) {
      alert("데이터가 없습니다");
    } else {
      let valid = true;
      selectRows.map((item: any) => {
        if (item.exceptyn == "Y" && valid == true) {
          alert("직접 입력인 경우 매입 전표 해제가 불가능합니다.");
          valid = false;
          return false;
        }
      });
      selectRows.map((item: any) => {
        dataArr.reqdt_s.push(item.reqdt);
        dataArr.seq_s.push(item.seq);
      });
      setParaMaker((prev) => ({
        ...prev,
        workType: "PURDROP",
        seq_s: dataArr.seq_s.join("|"),
        reqdt_s: dataArr.reqdt_s.join("|"),
      }));
    }
  };

  const onPayDropClick = (e: any) => {
    if (!window.confirm("해제하시겠습니까?")) {
      return false;
    }

    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );
    let dataArr: TdataArr = {
      reqdt_s: [],
      seq_s: [],
    };
    if (selectRows.length == 0) {
      alert("데이터가 없습니다");
    } else {
      let valid = true;
      selectRows.map((item: any) => {
        if (item.exceptyn == "Y" && valid == true) {
          alert("직접 입력인 경우 지급 전표 해제가 불가능합니다.");
          valid = false;
          return false;
        }
      });
      selectRows.map((item: any) => {
        dataArr.reqdt_s.push(item.reqdt);
        dataArr.seq_s.push(item.seq);
      });
      setParaMaker((prev) => ({
        ...prev,
        workType: "PAYDROUP",
        seq_s: dataArr.seq_s.join("|"),
        reqdt_s: dataArr.reqdt_s.join("|"),
      }));
    }
  };

  const onPurCreateClick = (e: any) => {
    let valid = true;
    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );
    let dataArr: TdataArr = {
      reqdt_s: [],
      seq_s: [],
    };
    if (selectRows.length == 0) {
      alert("데이터가 없습니다");
    } else {
      let valid = true;
      selectRows.map((item: any) => {
        if (item.exceptyn == "Y" && valid == true) {
          alert("직접 입력인 경우 매입 전표 생성이 불가능합니다.");
          valid = false;
          return false;
        }
      });
      if (valid == true) {
        selectRows.map((item: any) => {
          dataArr.reqdt_s.push(item.reqdt);
          dataArr.seq_s.push(item.seq);
        });
        setParaMaker((prev) => ({
          ...prev,
          workType: "PURCREATE",
          seq_s: dataArr.seq_s.join("|"),
          reqdt_s: dataArr.reqdt_s.join("|"),
        }));
      }
    }
  };

  const onSaveClick = (e: any) => {
    if (workType == "N") {
      fetchTodoGridSaved3();
    } else {
      fetchTodoGridSaved();
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setSubDataResult2(process([], subDataState2));
    setSubDataResult3(process([], subDataState3));
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
      (item: any) => item.code_name == selectedRowData.taxtype
    )?.sub_code;
    const etax = etaxListData.find(
      (item: any) => item.code_name == selectedRowData.etax
    )?.sub_code;
    const exceptyn = exceptynListData.find(
      (item: any) => item.name == selectedRowData.exceptyn
    )?.code;
    const insert_userid = personListData.find(
      (item: any) => item.user_name == selectedRowData.insert_userid
    )?.user_id;
    const update_userid = personListData.find(
      (item: any) => item.user_name == selectedRowData.update_userid
    )?.user_id;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      seq: selectedRowData.seq,
      reqdt:
        selectedRowData.reqdt != ""
          ? toDate(selectedRowData.reqdt)
          : new Date(),
    }));
    setSubFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      seq: selectedRowData.seq,
      reqdt:
        selectedRowData.reqdt != ""
          ? toDate(selectedRowData.reqdt)
          : new Date(),
    }));
    setSubFilters3((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      seq: selectedRowData.seq,
      reqdt:
        selectedRowData.reqdt != ""
          ? toDate(selectedRowData.reqdt)
          : new Date(),
    }));
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
      paydt: isValidDate(selectedRowData.paydt)
        ? new Date(dateformat(selectedRowData.paydt))
        : null,
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
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedSubState(newSelectedState);
  };

  const onSubSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState2,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedSubState2(newSelectedState);
  };

  const onSubSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState3,
      dataItemKey: DATA_ITEM_KEY4,
    });

    setSelectedSubState3(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "입고자료";
        _export.save(optionsGridOne);
      } else if (tabSelected == 1) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "매입전표";
        _export.save(optionsGridOne);
      } else if (tabSelected == 2) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridFour.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "지급전표";
        _export.save(optionsGridOne);
      }
    }
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

  const setCopyData2 = (data: any) => {
    var qty = 0;
    var splyamt = 0;
    var taxamt = 0;
    var seq = 0;
    data.map((item: any) => {
      qty = qty + item.qty;
      splyamt = splyamt + item.wonamt;
      taxamt = taxamt + item.taxamt;
    });
    setInfomation({
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
      etax: "1",
      etxyn: "",
      exceptyn: "",
      inoutdiv: "1",
      insert_userid: "",
      items: data[0].itemnm + " 외 " + data.length + "건",
      janamt: 0,
      location: sessionLocation,
      orgdiv: "",
      payactkey: "",
      paydt: null,
      paymentamt: 0,
      paymentnum: "",
      paymeth: "",
      position: "",
      prtdiv: "",
      qty: qty,
      qtyunit: "",
      remark: "",
      reqdt: new Date(),
      rtelno: "",
      rtxisuyn: false,
      seq: 0,
      splyamt: splyamt,
      taxamt: taxamt,
      taxdt: new Date(),
      taxnum: "",
      taxtype: "110",
      totamt: splyamt + taxamt,
      unp: 0,
      update_time: "",
      update_userid: "",
      wgt: 0,
    });
    const rows = data.map((prev: any) => ({
      ...prev,
      num: seq++,
    }));

    setSubDataResult((prev) => {
      return {
        data: rows,
        total: data.length,
      };
    });
    setSelectedSubState({ [rows[0][DATA_ITEM_KEY2]]: true });
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

  const subTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = subDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = subDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult3.total == -1
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

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult2.data.forEach((item) =>
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

  const gridSumQtyFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult3.data.forEach((item) =>
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
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );

      resetAllGrid();
      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });

        setFilters((prev) => ({
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
        setFilters((prev) => ({
          ...prev,
          find_row_value:
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
              .reqnum +
            "-" +
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1].reqrev,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.reqdt = "";
    paraDataDeleted.seq = 0;
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };

  const onPayCreateClick = () => {
    let valid = true;
    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );
    let dataArr: TdataArr = {
      reqdt_s: [],
      seq_s: [],
    };
    if (selectRows.length == 0) {
      alert("데이터가 없습니다");
    } else {
      let valid = true;
      selectRows.map((item: any) => {
        if (item.exceptyn == "Y" && valid == true) {
          alert("직접 입력인 경우 매입 전표 생성이 불가능합니다.");
          valid = false;
          return false;
        }
      });
      if (valid == true) {
        setMA_A9001WVisible(true);
      }
    }
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

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
        throw findMessage(messagesData, "MA_A9001W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A9001W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setPage3(initialPageState); // 페이지 초기화
        setPage4(initialPageState); // 페이지 초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        if (swiper) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_MA_A9001W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": "",
      "@p_position": "",
      "@p_reqdt": paraDataDeleted.reqdt,
      "@p_seq": paraDataDeleted.seq,
      "@p_splyamt": 0,
      "@p_taxamt": 0,
      "@p_taxtype": "",
      "@p_taxdt": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_custregnum": "",
      "@p_items": "",
      "@p_qty": 0,
      "@p_qtyunit": "",
      "@p_exceptyn": "",
      "@p_remark": "",
      "@p_paydt": "",
      "@p_creditcd": "",
      "@p_acntdiv": "",
      "@p_rtxisuyn": "",
      "@p_etax": "",
      "@p_recdt_s": "",
      "@p_seq1_s": "",
      "@p_reqdt_s": "",
      "@p_seq_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A9001W",
      "@p_company_code": companyCode,
    },
  };

  const para: Iparameters = {
    procedureName: "P_MA_A9001W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": infomation.location,
      "@p_position": infomation.position,
      "@p_reqdt": convertDateToStr(infomation.reqdt),
      "@p_seq": infomation.seq,
      "@p_splyamt": infomation.splyamt,
      "@p_taxamt": infomation.taxamt,
      "@p_taxtype": infomation.taxtype,
      "@p_taxdt": convertDateToStr(infomation.taxdt),
      "@p_custcd": infomation.custcd,
      "@p_custnm": infomation.custnm,
      "@p_creditcd": infomation.creditcd,
      "@p_custregnum": infomation.custregnum,
      "@p_items": infomation.items,
      "@p_qty": infomation.qty,
      "@p_qtyunit": infomation.qtyunit,
      "@p_exceptyn": infomation.exceptyn,
      "@p_remark": infomation.remark,
      "@p_paydt": convertDateToStr(infomation.paydt),
      "@p_acntdiv": infomation.acntdiv,
      "@p_rtxisuyn":
        typeof infomation.rtxisuyn == "boolean"
          ? infomation.rtxisuyn == true
            ? "Y"
            : "N"
          : infomation.rtxisuyn,
      "@p_etax": infomation.etax,
      "@p_recdt_s": "",
      "@p_seq1_s": "",
      "@p_reqdt_s": "",
      "@p_seq_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A9001W",
      "@p_company_code": companyCode,
    },
  };

  const ParaMake: Iparameters = {
    procedureName: "P_MA_A9001W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaMaker.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": infomation.location,
      "@p_position": "",
      "@p_reqdt": "",
      "@p_seq": 0,
      "@p_splyamt": 0,
      "@p_taxamt": 0,
      "@p_taxtype": "",
      "@p_taxdt": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_custregnum": "",
      "@p_items": "",
      "@p_qty": 0,
      "@p_qtyunit": "",
      "@p_exceptyn": "",
      "@p_remark": "",
      "@p_paydt": "",
      "@p_creditcd": "",
      "@p_acntdiv": "",
      "@p_rtxisuyn": "",
      "@p_etax": "",
      "@p_recdt_s": "",
      "@p_seq1_s": "",
      "@p_reqdt_s": ParaMaker.reqdt_s,
      "@p_seq_s": ParaMaker.seq_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A9001W",
      "@p_company_code": companyCode,
    },
  };

  const paraDatas: Iparameters = {
    procedureName: "P_MA_A9001W_Sub2_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_indt": ParaData.indt,
      "@p_doexdiv": ParaData.doexdiv == undefined ? "" : ParaData.doexdiv,
      "@p_amtunit": ParaData.amtunit == undefined ? "" : ParaData.doexdiv,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_paymentnum_s": ParaData.paymentnum_s,
      "@p_paymentseq_s": ParaData.paymentseq_s,
      "@p_drcrdiv_s": ParaData.drcrdiv_s,
      "@p_acntcd_s": ParaData.acntcd_s,
      "@p_amt1_s": ParaData.amt1_s,
      "@p_amt2_s": ParaData.amt2_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_taxnum_s": ParaData.taxnum_s,
      "@p_acntnum_s": ParaData.acntnum_s,
      "@p_notenum_s": ParaData.notenum_s,
      "@p_enddt_s": ParaData.enddt_s,
      "@p_pubbank_s": ParaData.pubbank_s,
      "@p_pubdt_s": ParaData.pubdt_s,
      "@p_pubperson_s": ParaData.pubperson_s,
      "@p_advanceinfo_s": ParaData.advanceinfo_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A9001W_Sub2",
      "@p_company_code": companyCode,
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

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaMaker.workType != "") {
      fetchTodoGridMaked();
    }
  }, [ParaMaker]);

  const fetchTodoGridMaked = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", ParaMake);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setParaMaker({
        pgSize: PAGE_SIZE,
        workType: "",
        seq_s: "",
        reqdt_s: "",
      });
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
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

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
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

  const setCopyData = (data: any, filter: any) => {
    let valid = true;

    if (data.length == 0) return false;

    let dataArr: TdataArr2 = {
      rowstatus_s: [],
      paymentnum_s: [],
      paymentseq_s: [],
      drcrdiv_s: [],
      acntcd_s: [],
      amt1_s: [],
      amt2_s: [],
      remark_s: [],
      taxnum_s: [],
      acntnum_s: [],
      notenum_s: [],
      enddt_s: [],
      pubbank_s: [],
      pubdt_s: [],
      pubperson_s: [],
      advanceinfo_s: [],
    };
    data.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        paymentnum = "",
        paymentseq = "",
        drcrdiv = "",
        acntcd = "",
        amt_1 = "",
        amt_2 = "",
        remark = "",
        taxnum = "",
        acntnum = "",
        notenum = "",
        enddt = "",
        pubbank = "",
        pubdt = "",
        pubperson = "",
        advanceinfo = "",
      } = item;

      dataArr.rowstatus_s.push("N");
      dataArr.paymentnum_s.push(paymentnum);
      dataArr.paymentseq_s.push(paymentseq);
      dataArr.drcrdiv_s.push(drcrdiv);
      dataArr.acntcd_s.push(acntcd);
      dataArr.amt1_s.push(amt_1 == "" ? 0 : amt_1);
      dataArr.amt2_s.push(amt_2 == "" ? 0 : amt_2);
      dataArr.remark_s.push(remark);
      dataArr.taxnum_s.push(taxnum);
      dataArr.acntnum_s.push(acntnum);
      dataArr.notenum_s.push(notenum);
      dataArr.enddt_s.push(enddt == "99991231" ? "" : enddt);
      dataArr.pubbank_s.push(pubbank);
      dataArr.pubdt_s.push(pubdt == "99991231" ? "" : pubdt);
      dataArr.pubperson_s.push(pubperson);
      dataArr.advanceinfo_s.push(advanceinfo == "" ? 0 : advanceinfo);
    });

    const select = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    setParaData((prev) => ({
      ...prev,
      workType: "N",
      location: filter.location,
      position: filter.position,
      custcd: select.custcd,
      custnm: select.custnm,
      indt: convertDateToStr(filter.frdt),
      doexdiv: select.doexdiv,
      amtunit: select.amtunit,
      wonchgrat: 0,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      paymentnum_s: dataArr.paymentnum_s.join("|"),
      paymentseq_s: dataArr.paymentseq_s.join("|"),
      drcrdiv_s: dataArr.drcrdiv_s.join("|"),
      acntcd_s: dataArr.acntcd_s.join("|"),
      amt1_s: dataArr.amt1_s.join("|"),
      amt2_s: dataArr.amt2_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      taxnum_s: dataArr.taxnum_s.join("|"),
      acntnum_s: dataArr.acntnum_s.join("|"),
      notenum_s: dataArr.notenum_s.join("|"),
      enddt_s: dataArr.enddt_s.join("|"),
      pubbank_s: dataArr.pubbank_s.join("|"),
      pubdt_s: dataArr.pubdt_s.join("|"),
      pubperson_s: dataArr.pubperson_s.join("|"),
      advanceinfo_s: dataArr.advanceinfo_s.join("|"),
    }));
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved2();
    }
  }, [ParaData]);

  const fetchTodoGridSaved2 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", paraDatas);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved3 = async () => {
    let dataArr: TdataArr = {
      reqdt_s: [],
      seq_s: [],
    };
    subDataResult.data.forEach((item: any, idx: number) => {
      const { recdt = "", seq1 = "" } = item;

      dataArr.reqdt_s.push(recdt);
      dataArr.seq_s.push(seq1);
    });

    const para2: Iparameters = {
      procedureName: "P_MA_A9001W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": infomation.location,
        "@p_position": infomation.position,
        "@p_reqdt": convertDateToStr(infomation.reqdt),
        "@p_seq": infomation.seq,
        "@p_splyamt": infomation.splyamt,
        "@p_taxamt": infomation.taxamt,
        "@p_taxtype": infomation.taxtype,
        "@p_taxdt": convertDateToStr(infomation.taxdt),
        "@p_custcd": infomation.custcd,
        "@p_custnm": infomation.custnm,
        "@p_creditcd": infomation.creditcd,
        "@p_custregnum": infomation.custregnum,
        "@p_items": infomation.items,
        "@p_qty": infomation.qty,
        "@p_qtyunit": infomation.qtyunit,
        "@p_exceptyn": infomation.exceptyn,
        "@p_remark": infomation.remark,
        "@p_paydt": convertDateToStr(infomation.paydt),
        "@p_acntdiv": infomation.acntdiv,
        "@p_rtxisuyn":
          typeof infomation.rtxisuyn == "boolean"
            ? infomation.rtxisuyn == true
              ? "Y"
              : "N"
            : infomation.rtxisuyn,
        "@p_etax": infomation.etax,
        "@p_recdt_s": dataArr.reqdt_s.join("|"),
        "@p_seq1_s": dataArr.seq_s.join("|"),
        "@p_reqdt_s": "",
        "@p_seq_s": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "MA_A9001W",
        "@p_company_code": companyCode,
      },
    };
    let data: any;
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
  };

  const onAddClick = () => {
    setWorkType("N");
    setDataWindowVisible(true);
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
              pathname="MA_A9001W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>계산서일자</th>
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

      {isMobile ? (
        <>
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
                <GridTitleContainer className="ButtonContainer">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      flexWrap: "wrap",
                      gap: "3px",
                      flexDirection: "column",
                    }}
                  >
                    <div>
                      <Button
                        onClick={onPurCreateClick}
                        themeColor={"primary"}
                        icon="plus-outline"
                        style={{ marginRight: "4px" }}
                      >
                        매입 전표 생성
                      </Button>
                      <Button
                        onClick={onPurDropClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus-outline"
                      >
                        매입 전표 해제
                      </Button>
                    </div>
                    <div>
                      <Button
                        onClick={onPayCreateClick}
                        themeColor={"primary"}
                        icon="plus-outline"
                        style={{ marginRight: "4px" }}
                      >
                        지급 전표 생성
                      </Button>
                      <Button
                        onClick={onPayDropClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus-outline"
                      >
                        지급 전표 해제
                      </Button>
                    </div>
                    <div>
                      <Button
                        onClick={onAddClick}
                        themeColor={"primary"}
                        icon="file-add"
                        style={{ marginRight: "4px" }}
                      >
                        매입 E-TAX(전표) 생성
                      </Button>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="delete"
                      >
                        매입 E-TAX(전표) 삭제
                      </Button>
                    </div>
                  </div>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="매입 E-TAX(전표)"
                >
                  <Grid
                    style={{
                      height: deviceHeight - height,
                      width: "100%",
                    }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        taxtype: taxtypeListData.find(
                          (item: any) => item.sub_code == row.taxtype
                        )?.code_name,
                        etax: etaxListData.find(
                          (item: any) => item.sub_code == row.etax
                        )?.code_name,
                        exceptyn: exceptynListData.find(
                          (item: any) => item.code == row.exceptyn
                        )?.name,
                        insert_userid: personListData.find(
                          (item: any) => item.user_id == row.insert_userid
                        )?.user_name,
                        update_userid: personListData.find(
                          (item: any) => item.user_id == row.update_userid
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
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
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
                                    : checkBoxField.includes(item.fieldName)
                                    ? CheckBoxReadOnlyCell
                                    : centerField.includes(item.fieldName)
                                    ? CenterCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
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
            </SwiperSlide>

            <SwiperSlide key={1}>
              <GridContainer
                style={{ width: "100%", overflow: "auto" }}
              >
                <GridTitleContainer className="ButtonContainer2">
                  <ButtonContainer
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin: "0 14px 0 11px",
                    }}
                  >
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <Button
                      onClick={onSaveClick}
                      themeColor={"primary"}
                      icon="save"
                    >
                      매입 E-TAX(전표) 저장
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap>
                  <FormBox>
                    <div
                      style={{
                        height: deviceHeight - height2,
                        width: "100%",
                      }}
                    >
                      <table style={{ width: "100%" }}>
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
                                labelClassName="k-radio-label"
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
                                className="required"
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
                                  bizComponentId="L_AC013"
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
                            <th>비고</th>
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
                      </table>
                    </div>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>

            <SwiperSlide key={2}>
              <GridContainer style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "left",
                    width: "100%",
                    marginBottom: "5px",
                  }}
                  className="ButtonContainer3"
                >
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                  </ButtonContainer>
                </div>
                <TabStrip
                  style={{ width: "100%" }}
                  selected={tabSelected}
                  onSelect={handleSelectTab}
                  scrollable={isMobile}
                >
                  <TabStripTab title="입고자료">
                    <GridContainerWrap>
                      <GridContainer width="100%">
                        <ExcelExport
                          data={subDataResult.data}
                          ref={(exporter) => {
                            _export2 = exporter;
                          }}
                          fileName="매입 E-TAX(전표)"
                        >
                          <Grid
                            style={{
                              height: deviceHeight - height3 - height4,
                            }}
                            data={process(
                              subDataResult.data.map((row) => ({
                                ...row,
                                itemacnt: itemacntListData.find(
                                  (item: any) => item.sub_code == row.itemacnt
                                )?.code_name,
                                [SELECTED_FIELD]:
                                  selectedSubState[idGetter2(row)],
                              })),
                              subDataState
                            )}
                            {...subDataState}
                            onDataStateChange={onSubDataStateChange}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY2}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSubSelectionChange}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={subDataResult.total}
                            skip={page2.skip}
                            take={page2.take}
                            pageable={true}
                            onPageChange={pageChange2}
                            //정렬기능
                            sortable={true}
                            onSortChange={onSubSortChange}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList2"
                              ]
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
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? subTotalFooterCell
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell2
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </GridContainerWrap>
                  </TabStripTab>
                  <TabStripTab title="매입전표">
                    <GridContainerWrap>
                      <GridContainer width="100%">
                        <ExcelExport
                          data={subDataResult2.data}
                          ref={(exporter) => {
                            _export3 = exporter;
                          }}
                          fileName="매입 E-TAX(전표)"
                        >
                          <Grid
                            style={{
                              height: deviceHeight - height3 - height4,
                            }}
                            data={process(
                              subDataResult2.data.map((row) => ({
                                ...row,
                                taxtype: taxtypeListData.find(
                                  (item: any) => item.sub_code == row.taxtype
                                )?.code_name,
                                drcrdiv: drcrdivListData.find(
                                  (item: any) => item.sub_code == row.drcrdiv
                                )?.code_name,
                                [SELECTED_FIELD]:
                                  selectedSubState2[idGetter3(row)],
                              })),
                              subDataState2
                            )}
                            {...subDataState2}
                            onDataStateChange={onSubDataStateChange2}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY3}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSubSelectionChange2}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={subDataResult2.total}
                            skip={page3.skip}
                            take={page3.take}
                            pageable={true}
                            onPageChange={pageChange3}
                            //정렬기능
                            sortable={true}
                            onSortChange={onSubSortChange2}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList3"
                              ]
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
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? subTotalFooterCell2
                                            : numberField2.includes(
                                                item.fieldName
                                              )
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
                  </TabStripTab>
                  <TabStripTab title="지급전표">
                    <GridContainerWrap>
                      <GridContainer width="100%">
                        <ExcelExport
                          data={subDataResult3.data}
                          ref={(exporter) => {
                            _export4 = exporter;
                          }}
                          fileName="매입 E-TAX(전표)"
                        >
                          <Grid
                            style={{
                              height: deviceHeight - height3 - height4,
                            }}
                            data={process(
                              subDataResult3.data.map((row) => ({
                                ...row,
                                drcrdiv: drcrdivListData.find(
                                  (item: any) => item.sub_code == row.drcrdiv
                                )?.code_name,
                                [SELECTED_FIELD]:
                                  selectedSubState3[idGetter4(row)],
                              })),
                              subDataState3
                            )}
                            {...subDataState3}
                            onDataStateChange={onSubDataStateChange3}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY4}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSubSelectionChange3}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={subDataResult3.total}
                            skip={page4.skip}
                            take={page4.take}
                            pageable={true}
                            onPageChange={pageChange4}
                            //정렬기능
                            sortable={true}
                            onSortChange={onSubSortChange3}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList4"
                              ]
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
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? subTotalFooterCell3
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell4
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </GridContainerWrap>
                  </TabStripTab>
                </TabStrip>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onPurCreateClick}
                  themeColor={"primary"}
                  icon="plus-outline"
                >
                  매입 전표 생성
                </Button>
                <Button
                  onClick={onPurDropClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus-outline"
                >
                  매입 전표 해제
                </Button>
                <Button
                  onClick={onPayCreateClick}
                  themeColor={"primary"}
                  icon="plus-outline"
                >
                  지급 전표 생성
                </Button>
                <Button
                  onClick={onPayDropClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus-outline"
                >
                  지급 전표 해제
                </Button>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="file-add"
                >
                  매입 E-TAX(전표) 생성
                </Button>
                <Button
                  onClick={onDeleteClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                >
                  매입 E-TAX(전표) 삭제
                </Button>
                <Button
                  onClick={onSaveClick}
                  themeColor={"primary"}
                  icon="save"
                >
                  매입 E-TAX(전표) 저장
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="매입 E-TAX(전표)"
            >
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    taxtype: taxtypeListData.find(
                      (item: any) => item.sub_code == row.taxtype
                    )?.code_name,
                    etax: etaxListData.find(
                      (item: any) => item.sub_code == row.etax
                    )?.code_name,
                    exceptyn: exceptynListData.find(
                      (item: any) => item.code == row.exceptyn
                    )?.name,
                    insert_userid: personListData.find(
                      (item: any) => item.user_id == row.insert_userid
                    )?.user_name,
                    update_userid: personListData.find(
                      (item: any) => item.user_id == row.update_userid
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
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange}
                //스크롤 조회 기능
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
                                : checkBoxField.includes(item.fieldName)
                                ? CheckBoxReadOnlyCell
                                : centerField.includes(item.fieldName)
                                ? CenterCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
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
                          className="required"
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
                            bizComponentId="L_AC013"
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
                      <th>비고</th>
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
                scrollable={isMobile}
              >
                <TabStripTab title="입고자료">
                  <GridContainerWrap>
                    <GridContainer width="100%">
                      <ExcelExport
                        data={subDataResult.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName="매입 E-TAX(전표)"
                      >
                        <Grid
                          style={{ height: "42vh" }}
                          data={process(
                            subDataResult.data.map((row) => ({
                              ...row,
                              itemacnt: itemacntListData.find(
                                (item: any) => item.sub_code == row.itemacnt
                              )?.code_name,
                              [SELECTED_FIELD]:
                                selectedSubState[idGetter2(row)],
                            })),
                            subDataState
                          )}
                          {...subDataState}
                          onDataStateChange={onSubDataStateChange}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY2}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onSubSelectionChange}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={subDataResult.total}
                          skip={page2.skip}
                          take={page2.take}
                          pageable={true}
                          onPageChange={pageChange2}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSubSortChange}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                        >
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
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? subTotalFooterCell
                                          : numberField2.includes(
                                              item.fieldName
                                            )
                                          ? gridSumQtyFooterCell2
                                          : undefined
                                      }
                                    />
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </GridContainerWrap>
                </TabStripTab>
                <TabStripTab title="매입전표">
                  <GridContainerWrap>
                    <GridContainer width="100%">
                      <ExcelExport
                        data={subDataResult2.data}
                        ref={(exporter) => {
                          _export3 = exporter;
                        }}
                        fileName="매입 E-TAX(전표)"
                      >
                        <Grid
                          style={{ height: "42vh" }}
                          data={process(
                            subDataResult2.data.map((row) => ({
                              ...row,
                              taxtype: taxtypeListData.find(
                                (item: any) => item.sub_code == row.taxtype
                              )?.code_name,
                              drcrdiv: drcrdivListData.find(
                                (item: any) => item.sub_code == row.drcrdiv
                              )?.code_name,
                              [SELECTED_FIELD]:
                                selectedSubState2[idGetter3(row)],
                            })),
                            subDataState2
                          )}
                          {...subDataState2}
                          onDataStateChange={onSubDataStateChange2}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY3}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onSubSelectionChange2}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={subDataResult2.total}
                          skip={page3.skip}
                          take={page3.take}
                          pageable={true}
                          onPageChange={pageChange3}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSubSortChange2}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions["grdList3"]
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
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? subTotalFooterCell2
                                          : numberField2.includes(
                                              item.fieldName
                                            )
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
                </TabStripTab>
                <TabStripTab title="지급전표">
                  <GridContainerWrap>
                    <GridContainer width="100%">
                      <ExcelExport
                        data={subDataResult3.data}
                        ref={(exporter) => {
                          _export4 = exporter;
                        }}
                        fileName="매입 E-TAX(전표)"
                      >
                        <Grid
                          style={{ height: "42vh" }}
                          data={process(
                            subDataResult3.data.map((row) => ({
                              ...row,
                              drcrdiv: drcrdivListData.find(
                                (item: any) => item.sub_code == row.drcrdiv
                              )?.code_name,
                              [SELECTED_FIELD]:
                                selectedSubState3[idGetter4(row)],
                            })),
                            subDataState3
                          )}
                          {...subDataState3}
                          onDataStateChange={onSubDataStateChange3}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY4}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onSubSelectionChange3}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={subDataResult3.total}
                          skip={page4.skip}
                          take={page4.take}
                          pageable={true}
                          onPageChange={pageChange4}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSubSortChange3}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions["grdList4"]
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
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? subTotalFooterCell3
                                          : numberField2.includes(
                                              item.fieldName
                                            )
                                          ? gridSumQtyFooterCell4
                                          : undefined
                                      }
                                    />
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </GridContainerWrap>
                </TabStripTab>
              </TabStrip>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
          modal={true}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
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
      {MA_A9001WVisible && (
        <MA_A9001W_Window
          setVisible={setMA_A9001WVisible}
          workType={workType} //신규 : N, 수정 : U
          data={
            mainDataResult.data.filter((item: any) => item.chk == true) ==
            undefined
              ? []
              : mainDataResult.data.filter((item: any) => item.chk == true)
          }
          setData={setCopyData}
          modal={true}
          pathname="MA_A9001W"
        />
      )}
      {dataWindowVisible && (
        <MA_A9001W_IN_Window
          setVisible={setDataWindowVisible}
          setData={setCopyData2}
          modal={true}
          pathname="MA_A9001W"
        />
      )}
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

export default MA_A9001W;
