import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
import * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
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
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  dateformat,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  numberWithCommas,
  toDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import CopyWindow2 from "./QC_A6050W_Orders_Window";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: any;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_QC061, L_QC062, L_sysUserMaster_001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "person"
      ? "L_sysUserMaster_001"
      : field == "extra_field5"
      ? "L_QC061"
      : field == "proccd"
      ? "L_QC062"
      : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const textField = field == "person" ? "user_name" : "code_name";
  const valueField = field == "person" ? "user_id" : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td />
  );
};

let deletedMainRows: object[] = [];
let temp = 0;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  modal = false,
}: IWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 870) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 870,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분
      height3 = getHeight(".WindowFormBoxWrap");
      height4 = getHeight(".WindowButtonContainer");

      setMobileHeight(getWindowDeviceHeight(false, deviceHeight) - height);
      setMobileHeight2(
        getWindowDeviceHeight(false, deviceHeight) - height - height2 - height4
      );
      setWebHeight(
        getWindowDeviceHeight(false, position.height) -
          height -
          height2 -
          height3 -
          height4
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) -
        height -
        height2 -
        height3 -
        height4
    );
  };
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_YESNOALL, L_BA002",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
    }
  }, [bizComponentData]);

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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [CopyWindowVisible, setCopyWindowVisible] = useState<boolean>(false);

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

  const onClose = () => {
    temp = 0;
    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
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

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      extra_field1: data.custcd,
      custnm: data.custnm,
    }));
  };

  const processApi = useApi();

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    extra_field1: "",
    custnm: "",
    extra_field2: "",
    person: "",
    qcnum: "",
    qcdt: new Date(),
    remark: "",
    orgdiv: sessionOrgdiv,
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    const parameters: Iparameters = {
      procedureName: "P_QC_A6050W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.extra_field1,
        "@p_custnm": filters.custnm,
        "@p_poregnum": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_person": filters.person,
        "@p_ordkey": "",
        "@p_qcnum": filters.qcnum,
        "@p_find_row_value": "",
      },
    };
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
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

  useEffect(() => {
    if (
      filters.isSearch &&
      workType != "N" &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
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
  }, [filters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      workType == "U" &&
      data != undefined &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      setFilters((prev) => ({
        ...prev,
        extra_field1: data.extra_field1,
        custnm: data.custnm,
        extra_field2: data.extra_field2,
        orgdiv: data.orgdiv,
        person: data.person,
        qcnum: data.qcnum,
        qcdt: toDate(data.qcdt),
        remark: data.remark,
        isSearch: true,
        pgNum: 1,
      }));
    }
  }, [permissions, bizComponentData, customOptionData]);

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

  const onCopyWndClick = () => {
    setCopyWindowVisible(true);
  };

  const setCopyData = (data: any) => {
    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0) return false;

    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    for (var i = 0; i < data.length; i++) {
      data[i].num = ++temp;
      data[i].rowstatus = "N";
    }

    try {
      data.map((item: any) => {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, item],
            total: prev.total + 1,
          };
        });
        setSelectedState({ [item[DATA_ITEM_KEY]]: true });
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
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    if (!permissions.save) return;

    if (
      convertDateToStr(filters.qcdt).substring(0, 4) < "1997" ||
      convertDateToStr(filters.qcdt).substring(6, 8) > "31" ||
      convertDateToStr(filters.qcdt).substring(6, 8) < "01" ||
      convertDateToStr(filters.qcdt).substring(6, 8).length != 2
    ) {
      alert("날짜를 선택해주세요.");
      return false;
    } else if (
      filters.extra_field1 == "" ||
      filters.extra_field1 == null ||
      filters.extra_field1 == undefined
    ) {
      alert("업체를 선택해주세요.");
      return false;
    }

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows.length == 0) {
      setParaData((prev: any) => ({
        ...prev,
        pgSize: PAGE_SIZE,
        workType: workType,
        qcnum: filters.qcnum,
        qcdt: convertDateToStr(filters.qcdt),
        custcd: filters.extra_field1,
        person: filters.person,
        remark: filters.remark,
        title: filters.extra_field2,
      }));
    } else {
      let dataArr: any = {
        rowstatus_s: [],
        inrecdt_s: [],
        inseq1_s: [],
        inseq2_s: [],
        indt_s: [],
        custnm_s: [],
        extra_field5_s: [],
        itemcd_s: [],
        itemnm_s: [],
        person_s: [],
        extra_field6_s: [],
        amt_s: [],
        wonamt_s: [],
        taxamt_s: [],
        qty_s: [],
        extra_field7_s: [],
        proccd_s: [],
        poregnum_s: [],
        ordnum_s: [],
        ordseq_s: [],
      };
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          recdt = "",
          seq1 = "",
          seq2 = "",
          indt = "",
          custnm = "",
          extra_field5 = "",
          itemcd = "",
          itemnm = "",
          person = "",
          extra_field6 = "",
          amt = "",
          wonamt = "",
          taxamt = "",
          qty = "",
          extra_field7 = "",
          proccd = "",
          poregnum = "",
          ordnum = "",
          ordseq = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.inrecdt_s.push(
          recdt == "99991231" || recdt == undefined ? "" : recdt
        );
        dataArr.inseq1_s.push(seq1 == "" ? 0 : seq1);
        dataArr.inseq2_s.push(seq2 == "" ? 0 : seq2);
        dataArr.indt_s.push(
          indt == "99991231" || indt == undefined ? "" : indt
        );
        dataArr.custnm_s.push(custnm);
        dataArr.extra_field5_s.push(extra_field5);
        dataArr.itemcd_s.push(itemcd);
        dataArr.itemnm_s.push(itemnm);
        dataArr.person_s.push(person);
        dataArr.extra_field6_s.push(extra_field6);
        dataArr.amt_s.push(amt == "" ? 0 : amt);
        dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
        dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
        dataArr.qty_s.push(qty == "" ? 0 : qty);
        dataArr.extra_field7_s.push(extra_field7);
        dataArr.proccd_s.push(proccd);
        dataArr.poregnum_s.push(poregnum);
        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
      });

      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          recdt = "",
          seq1 = "",
          seq2 = "",
          indt = "",
          custnm = "",
          extra_field5 = "",
          itemcd = "",
          itemnm = "",
          person = "",
          extra_field6 = "",
          amt = "",
          wonamt = "",
          taxamt = "",
          qty = "",
          extra_field7 = "",
          proccd = "",
          poregnum = "",
          ordnum = "",
          ordseq = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.inrecdt_s.push(
          recdt == "99991231" || recdt == undefined ? "" : recdt
        );
        dataArr.inseq1_s.push(seq1 == "" ? 0 : seq1);
        dataArr.inseq2_s.push(seq2 == "" ? 0 : seq2);
        dataArr.indt_s.push(
          indt == "99991231" || indt == undefined ? "" : indt
        );
        dataArr.custnm_s.push(custnm);
        dataArr.extra_field5_s.push(extra_field5);
        dataArr.itemcd_s.push(itemcd);
        dataArr.itemnm_s.push(itemnm);
        dataArr.person_s.push(person);
        dataArr.extra_field6_s.push(extra_field6);
        dataArr.amt_s.push(amt == "" ? 0 : amt);
        dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
        dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
        dataArr.qty_s.push(qty == "" ? 0 : qty);
        dataArr.extra_field7_s.push(extra_field7);
        dataArr.proccd_s.push(proccd);
        dataArr.poregnum_s.push(poregnum);
        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
      });
      setParaData((prev: any) => ({
        ...prev,
        workType: workType,
        qcnum: filters.qcnum,
        qcdt: convertDateToStr(filters.qcdt),
        custcd: filters.extra_field1,
        person: filters.person,
        remark: filters.remark,
        title: filters.extra_field2,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        inrecdt_s: dataArr.inrecdt_s.join("|"),
        inseq1_s: dataArr.inseq1_s.join("|"),
        inseq2_s: dataArr.inseq2_s.join("|"),
        indt_s: dataArr.indt_s.join("|"),
        custnm_s: dataArr.custnm_s.join("|"),
        extra_field5_s: dataArr.extra_field5_s.join("|"),
        itemcd_s: dataArr.itemcd_s.join("|"),
        itemnm_s: dataArr.itemnm_s.join("|"),
        person_s: dataArr.person_s.join("|"),
        extra_field6_s: dataArr.extra_field6_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        wonamt_s: dataArr.wonamt_s.join("|"),
        taxamt_s: dataArr.taxamt_s.join("|"),
        qty_s: dataArr.qty_s.join("|"),
        extra_field7_s: dataArr.extra_field7_s.join("|"),
        proccd_s: dataArr.proccd_s.join("|"),
        poregnum_s: dataArr.poregnum_s.join("|"),
        ordnum_s: dataArr.ordnum_s.join("|"),
        ordseq_s: dataArr.ordseq_s.join("|"),
      }));
    }
  };

  const [ParaData, setParaData] = useState<any>({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    qcnum: "",
    qcdt: "",
    custcd: "",
    person: "",
    remark: "",
    title: "",
    rowstatus_s: "",
    inrecdt_s: "",
    inseq1_s: "",
    inseq2_s: "",
    indt_s: "",
    custnm_s: "",
    extra_field5_s: "",
    itemcd_s: "",
    itemnm_s: "",
    person_s: "",
    extra_field6_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    qty_s: "",
    extra_field7_s: "",
    proccd_s: "",
    poregnum_s: "",
    ordnum_s: "",
    ordseq_s: "",
    userid: userId,
    pc: pc,
    form_id: "QC_A6050W",
  });

  const para: Iparameters = {
    procedureName: "P_QC_A6050W_S",
    pageNumber: 0,
    pageSize: ParaData.pgSize,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_qcnum": ParaData.qcnum,
      "@p_qcdt": ParaData.qcdt,
      "@p_custcd": ParaData.custcd,
      "@p_person": ParaData.person,
      "@p_remark": ParaData.remark,
      "@p_title": ParaData.title,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_inrecdt_s": ParaData.inrecdt_s,
      "@p_inseq1_s": ParaData.inseq1_s,
      "@p_inseq2_s": ParaData.inseq2_s,
      "@p_indt_s": ParaData.indt_s,
      "@p_custnm_s": ParaData.custnm_s,
      "@p_extra_field5_s": ParaData.extra_field5_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_person_s": ParaData.person_s,
      "@p_extra_field6_s": ParaData.extra_field6_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_extra_field7_s": ParaData.extra_field7_s,
      "@p_proccd_s": ParaData.proccd_s,
      "@p_poregnum_s": ParaData.poregnum_s,
      "@p_ordnum_s": ParaData.ordnum_s,
      "@p_ordseq_s": ParaData.ordseq_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "QC_A6050W",
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      deletedMainRows = [];
      reload(data.returnString);
      if (workType == "N") {
        setVisible(false);
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
      }
      setParaData({
        pgSize: PAGE_SIZE,
        orgdiv: sessionOrgdiv,
        workType: "",
        qcnum: "",
        qcdt: "",
        custcd: "",
        person: "",
        remark: "",
        title: "",
        rowstatus_s: "",
        inrecdt_s: "",
        inseq1_s: "",
        inseq2_s: "",
        indt_s: "",
        custnm_s: "",
        extra_field5_s: "",
        itemcd_s: "",
        itemnm_s: "",
        person_s: "",
        extra_field6_s: "",
        amt_s: "",
        wonamt_s: "",
        taxamt_s: "",
        qty_s: "",
        extra_field7_s: "",
        proccd_s: "",
        poregnum_s: "",
        ordnum_s: "",
        ordseq_s: "",
        userid: userId,
        pc: pc,
        form_id: "QC_A6050W",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object3) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
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
    if (
      field != "custnm" &&
      field != "itemnm" &&
      field != "rowstatus" &&
      field != "itemcd" &&
      field != "ordnum" &&
      field != "ordseq"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
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
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              taxamt: Math.round(item.amt * 0.1),
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

  return (
    <>
      <Window
        titles={workType == "N" ? "검사비 생성" : "검사비 정보"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
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
              <FormBoxWrap
                className="WindowFormBoxWrap"
                style={{ height: mobileheight }}
              >
                <ButtonContainer style={{ justifyContent: "end" }}>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="chevron-right"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                </ButtonContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>검사관리번호</th>
                      <td>
                        <Input
                          name="qcnum"
                          type="text"
                          value={filters.qcnum}
                          className="readonly"
                        />
                      </td>
                      <th>검사비 청구일</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="qcdt"
                            value={filters.qcdt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                            className="required"
                            placeholder=""
                          />
                        </div>
                      </td>
                      <th>업체코드</th>
                      <td>
                        <Input
                          name="extra_field1"
                          type="text"
                          value={filters.extra_field1}
                          onChange={filterInputChange}
                          className="required"
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
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>제목</th>
                      <td colSpan={5}>
                        <Input
                          name="extra_field2"
                          type="text"
                          value={filters.extra_field2}
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>품질담당자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="person"
                            value={filters.person}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="user_name"
                            valueField="user_id"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={7}>
                        <TextArea
                          value={filters.remark}
                          name="remark"
                          rows={4}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer">
                  <GridTitle>상세정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="chevron-left"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                    <div>
                      <Button
                        themeColor={"primary"}
                        onClick={onCopyWndClick}
                        icon="folder-open"
                        disabled={permissions.save ? false : true}
                      >
                        수주참조
                      </Button>
                      <Button
                        onClick={onDeleteClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: mobileheight2 }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      itemacnt: itemacntListData.find(
                        (items: any) => items.sub_code == row.itemacnt
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
                      invunit: qtyunitListData.find(
                        (item: any) => item.sub_code == row.invunit
                      )?.code_name,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      indt: row.indt
                        ? new Date(dateformat(row.indt))
                        : new Date(dateformat("99991231")),
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
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="indt"
                    title="검사일자"
                    width="120px"
                    cell={DateCell}
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="custnm" title="고객사" width="150px" />
                  <GridColumn
                    field="extra_field5"
                    title="검사항목"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="proccd"
                    title="검사내역"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn field="itemcd" title="품목코드" width="120px" />
                  <GridColumn field="itemnm" title="품목명" width="150px" />
                  <GridColumn
                    field="person"
                    title="검사담당자"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="extra_field6"
                    title="검사관"
                    width="120px"
                  />
                  <GridColumn
                    field="qty"
                    title="수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="amt"
                    title="금액"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="taxamt"
                    title="세액"
                    width="120px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn field="poregnum" title="PO번호" width="150px" />
                  <GridColumn field="ordnum" title="수주번호" width="150px" />
                  <GridColumn
                    field="ordseq"
                    title="수주순번"
                    width="100px"
                    cell={NumberCell}
                  />
                </Grid>
                <BottomContainer className="BottomContainer">
                  <ButtonContainer>
                    {permissions.save && (
                      <Button themeColor={"primary"} onClick={selectData}>
                        저장
                      </Button>
                    )}
                    <Button
                      themeColor={"primary"}
                      fillMode={"outline"}
                      onClick={onClose}
                    >
                      닫기
                    </Button>
                  </ButtonContainer>
                </BottomContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <FormBoxWrap className="WindowFormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th>검사관리번호</th>
                    <td>
                      <Input
                        name="qcnum"
                        type="text"
                        value={filters.qcnum}
                        className="readonly"
                      />
                    </td>
                    <th>출고일자</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="qcdt"
                          value={filters.qcdt}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          className="required"
                          placeholder=""
                        />
                      </div>
                    </td>
                    <th>업체코드</th>
                    <td>
                      <Input
                        name="extra_field1"
                        type="text"
                        value={filters.extra_field1}
                        onChange={filterInputChange}
                        className="required"
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
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>제목</th>
                    <td colSpan={5}>
                      {" "}
                      <Input
                        name="extra_field2"
                        type="text"
                        value={filters.extra_field2}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>품질담당자</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="person"
                          value={filters.person}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          textField="user_name"
                          valueField="user_id"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>비고</th>
                    <td colSpan={7}>
                      <TextArea
                        value={filters.remark}
                        name="remark"
                        rows={4}
                        onChange={filterInputChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <GridContainer>
              <GridTitleContainer className="WindowButtonContainer">
                <GridTitle>상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onCopyWndClick}
                    icon="folder-open"
                    disabled={permissions.save ? false : true}
                  >
                    수주참조
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: webheight }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    itemacnt: itemacntListData.find(
                      (items: any) => items.sub_code == row.itemacnt
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
                    invunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.invunit
                    )?.code_name,
                    rowstatus:
                      row.rowstatus == null ||
                      row.rowstatus == "" ||
                      row.rowstatus == undefined
                        ? ""
                        : row.rowstatus,
                    indt: row.indt
                      ? new Date(dateformat(row.indt))
                      : new Date(dateformat("99991231")),
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
                <GridColumn field="rowstatus" title=" " width="50px" />
                <GridColumn
                  field="indt"
                  title="검사일자"
                  width="120px"
                  cell={DateCell}
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn field="custnm" title="고객사" width="150px" />
                <GridColumn
                  field="extra_field5"
                  title="검사항목"
                  width="120px"
                  cell={CustomComboBoxCell}
                />
                <GridColumn
                  field="proccd"
                  title="검사내역"
                  width="120px"
                  cell={CustomComboBoxCell}
                />
                <GridColumn field="itemcd" title="품목코드" width="120px" />
                <GridColumn field="itemnm" title="품목명" width="150px" />
                <GridColumn
                  field="person"
                  title="검사담당자"
                  width="120px"
                  cell={CustomComboBoxCell}
                />
                <GridColumn field="extra_field6" title="검사관" width="120px" />
                <GridColumn
                  field="qty"
                  title="수량"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="amt"
                  title="금액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="taxamt"
                  title="세액"
                  width="120px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn field="poregnum" title="PO번호" width="150px" />
                <GridColumn field="ordnum" title="수주번호" width="150px" />
                <GridColumn
                  field="ordseq"
                  title="수주순번"
                  width="100px"
                  cell={NumberCell}
                />
              </Grid>
            </GridContainer>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                {permissions.save && (
                  <Button themeColor={"primary"} onClick={selectData}>
                    저장
                  </Button>
                )}
                <Button
                  themeColor={"primary"}
                  fillMode={"outline"}
                  onClick={onClose}
                >
                  닫기
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </>
        )}
      </Window>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {CopyWindowVisible && (
        <CopyWindow2 setVisible={setCopyWindowVisible} setData={setCopyData} />
      )}
    </>
  );
};

export default CopyWindow;
