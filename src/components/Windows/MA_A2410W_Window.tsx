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
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import {
  IAttachmentData,
  ICustData,
  IWindowPosition,
} from "../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  isValidDate,
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
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import PlanWindow from "./MA_A2410W_Plan_Window";
import StockWindow from "./MA_A2410W_Stock_Window";
import Window from "./WindowComponent/Window";

type TKendoWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};

const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

type Idata = {
  purnum: string;
  purdt: string;
  inexpdt: string;
  amt: number;
  amtunit: string;
  attdatnum: string;
  baseamt: number;
  chk: string;
  custcd: string;
  custnm: string;
  doexdiv: string;
  files: string;
  location: string;
  num: number;
  orgdiv: string;
  person: string;
  qty: number;
  remark: string;
  reqnum: string;
  taxamt: number;
  totamt: number;
  wonamt: number;
  uschgrat: number;
  wonchgrat: number;
  taxdiv: string;
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA015,L_BA019,L_PR010", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "qtyunit"
      ? "L_BA015"
      : field == "wgtunit"
      ? "L_BA015"
      : field == "proccd"
      ? "L_PR010"
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

const DetailWindow = ({
  workType,
  data,
  setVisible,
  reload,
  modal = false,
  pathname,
}: TKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);
  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const pc = UseGetValueFromSessionItem("pc");
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const processApi = useApi();

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA005, L_BA029, L_BA020",
    //내수구분, 과세구분, 화폐단위
    setBizComponentData
  );

  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [amtunitListData, setAmtunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setDoexdivListData(getBizCom(bizComponentData, "L_BA005"));
      setTaxdivListData(getBizCom(bizComponentData, "L_BA029"));
      setAmtunitListData(getBizCom(bizComponentData, "L_BA020"));
    }
  }, [bizComponentData]);

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 800,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();

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

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);
    setVisible(false);
  };

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
  const [planWindowVisible, setPlanWindowVisible] = useState<boolean>(false);
  const [stockWindowVisible, setStockWindowVisible] = useState<boolean>(false);
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

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const onPlanWndClick = () => {
    if (workType == "U") {
      alert("상세정보 추가 등록이 불가능합니다. 신규로 등록해주세요.");
      return;
    }
    setPlanWindowVisible(true);
  };

  const onStockWndClick = () => {
    if (workType == "U") {
      alert("상세정보 추가 등록이 불가능합니다. 신규로 등록해주세요.");
      return;
    }
    setStockWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
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

  const setPlanData = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    data.map((item: any) => {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        amt: item.amt == undefined ? "0" : item.amt,
        chk: item.chk,
        insiz: item.insiz,
        itemacnt: item.itemacnt,
        itemcd: item.itemcd,
        itemnm: item.itemnm,
        ordkey: item.ordkey,
        ordnum: item.ordnum,
        ordseq: item.ordseq == undefined ? "0" : item.ordseq,
        orgdiv: orgdiv,
        qty: item.janqty,
        qtyunit: item.qtyunit,
        remark: "",
        taxamt: item.taxamt == undefined ? "0" : item.taxamt,
        totamt: item.totamt == undefined ? "0" : item.totamt,
        unitwgt: item.unitwgt == undefined ? "0" : item.unitwgt,
        wgt: item.wgt == undefined ? "0" : item.wgt,
        unp: item.unp == undefined ? "0" : item.unp,
        wgtunit: item.wgtunit,
        wonamt: item.wonamt == undefined ? "0" : item.wonamt,
        rowstatus: "N",
        planno: item.planno,
        planseq: item.planseq == undefined ? "0" : item.planseq,
        plankey: item.plankey,
        purnum: item.purnum,
        purseq: item.purseq == undefined ? "0" : item.purseq,
        dlramt: item.dlramt == undefined ? "0" : item.dlramt,
      };

      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });

      if (filters.custcd == "") {
        setFilters((prev) => ({
          ...prev,
          custcd: data[0].custcd,
          custnm: data[0].custnm,
        }));
      }
      if (filters.amtunit == "") {
        setFilters((prev) => ({
          ...prev,
          amtunit: data[0].amtunit,
        }));
      }
      if (filters.doexdiv == "") {
        setFilters((prev) => ({
          ...prev,
          doexdiv: data[0].doexdiv,
        }));
      }
      if (filters.taxdiv == "") {
        setFilters((prev) => ({
          ...prev,
          taxdiv: data[0].taxdiv,
        }));
      }
    });
  };

  const setStockData = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    data.map((item: any) => {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        rowstatus: "N",
        itemcd: item.itemcd,
        itemnm: item.itemnm,
        itemacnt: item.itemacnt,
        insiz: item.insiz,
        lotnum: item.lotnum,
        qty: item.now_qty,
        qtyunit: item.qtyunit,
        unp: item.unp == undefined ? "0" : item.unp,
        wonamt: item.wonamt == undefined ? "0" : item.wonamt,
        amt: item.amt == undefined ? "0" : item.amt,
        taxamt: item.taxamt == undefined ? "0" : item.taxamt,
        totamt: item.totamt == undefined ? "0" : item.totamt,
        dlramt: item.dlramt == undefined ? "0" : item.dlramt,
        ordseq: item.ordseq == undefined ? "0" : item.ordseq,
        planseq: item.planseq == undefined ? "0" : item.planseq,
        purseq: item.purseq == undefined ? "0" : item.purseq,
        wgt: item.wgt == undefined ? "0" : item.wgt,
        unitwgt: item.unitwgt == undefined ? "0" : item.unitwgt,
      };

      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
    });
  };

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    amt: 0,
    amtunit: "KRW",
    attdatnum: "",
    baseamt: 0,
    custcd: "",
    custnm: "",
    custprsncd: "",
    doexdiv: "A",
    files: "",
    inexpdt: new Date(),
    location: sessionLocation,
    num: 0,
    orgdiv: sessionOrgdiv,
    person: "",
    purdt: new Date(),
    purnum: "",
    purqty: 0,
    remark: "",
    taxamt: 0,
    taxdiv: "A",
    totamt: 0,
    uschgrat: 0,
    wonamt: 0,
    wonchgrat: 0,
    userid: userId,
    pc: pc,
    form_id: "MA_A2410W",
    pgNum: 1,
    isSearch: false,
  });

  // 그리드 데이터  조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_MA_A2410W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_person": "",
        "@p_ordnum": "",
        "@p_planno": "",
        "@p_finyn": "",
        "@p_purnum": filters.purnum,
        "@p_find_row_value": "",
      },
    };

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
    if (filters.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (workType == "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        purnum: data.purnum,
        purdt: toDate(data.purdt),
        inexpdt: isValidDate(data.inexpdt)
          ? new Date(dateformat(data.inexpdt))
          : null,
        person: data.person,
        doexdiv: data.doexdiv,
        location: data.location,
        custcd: data.custcd,
        custnm: data.custnm,
        taxdiv: data.taxdiv,
        amtunit: data.amtunit,
        files: data.files,
        attdatnum: data.attdatnum,
        wonchgrat: data.wonchgrat,
        uschgrat: data.uschgrat,
        remark: data.remark,
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

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

  const onDeleteClick = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

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
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  type TRowsArr = {
    rowstatus: string[];
    purseq: string[];
    proccd: string[];
    planno: string[];
    planseq: string[];
    ordnum: string[];
    ordseq: string[];
    itemcd: string[];
    itemnm: string[];
    qty: string[];
    qtyunit: string[];
    unitwgt: string[];
    wgt: string[];
    wgtunit: string[];
    unp: string[];
    amt: string[];
    wonamt: string[];
    taxamt: string[];
    dlramt: string[];
    remark: string[];
    lotnum: string[];
    div: string[];
  };

  // 저장 파라미터 초기값
  const [paraSaved, setParaSaved] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: orgdiv,
    location: location,
    outdiv: "A",
    purnum: "",
    purdt: "",
    inexpdt: "",
    person: "",
    custcd: "",
    custnm: "",
    custprsncd: "",
    doexdiv: "",
    taxdiv: "",
    amtunit: "",
    wonchgrat: 0,
    uschgrat: 0,
    baseamt: 0,
    attdatnum: "",
    remark: "",
    rowstatus_s: "",
    purseq_s: "",
    proccd_s: "",
    planno_s: "",
    planseq_s: "",
    ordnum_s: "",
    ordseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    qty_s: "",
    qtyunit_s: "",
    unitwgt_s: "",
    wgt_s: "",
    wgtunit_s: "",
    unp_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    dlramt_s: "",
    remark_s: "",
    lotnum_s: "",
    div_s: "",
    userId: userId,
    pc: pc,
    form_id: "MA_A2410W",
  });

  const onSaveClick = () => {
    let valid = true;
    for (var i = 0; i < mainDataResult.data.length; i++) {
      if (mainDataResult.data[i].unp == 0 && valid == true) {
        alert("단가를 채워주세요.");
        valid = false;
        return false;
      }
    }

    try {
      if (mainDataResult.data.length == 0) {
        throw findMessage(messagesData, "MA_A2410W_003");
      } else if (
        filters.custcd == null ||
        filters.custcd == "" ||
        filters.custcd == undefined
      ) {
        throw findMessage(messagesData, "MA_A2410W_004");
      } else {
        if (valid == true) {
          const dataItem = mainDataResult.data.filter((item: any) => {
            return (
              (item.rowstatus == "N" || item.rowstatus == "U") &&
              item.rowstatus !== undefined
            );
          });

          setParaSaved((prev) => ({
            ...prev,
            workType: workType,
            outdiv: "A",
            purnum: filters.purnum,
            purdt: convertDateToStr(filters.purdt),
            inexpdt: convertDateToStr(filters.inexpdt),
            person: filters.person,
            custcd: filters.custcd,
            custnm: filters.custnm,
            custprsncd: "",
            doexdiv: filters.doexdiv,
            taxdiv: filters.taxdiv,
            amtunit: filters.amtunit,
            wonchgrat: filters.wonchgrat,
            uschgrat: filters.uschgrat,
            baseamt: filters.baseamt,
            attdatnum: filters.attdatnum,
            files: filters.files,
            remark: filters.remark,
          }));

          if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

          let rowsArr: TRowsArr = {
            rowstatus: [],
            purseq: [],
            proccd: [],
            planno: [],
            planseq: [],
            ordnum: [],
            ordseq: [],
            itemcd: [],
            itemnm: [],
            qty: [],
            qtyunit: [],
            unitwgt: [],
            wgt: [],
            wgtunit: [],
            unp: [],
            amt: [],
            wonamt: [],
            taxamt: [],
            dlramt: [],
            remark: [],
            lotnum: [],
            div: [],
          };

          dataItem.forEach((item: any) => {
            const {
              rowstatus,
              purseq,
              proccd,
              planno,
              planseq,
              ordnum,
              ordseq,
              itemcd,
              itemnm,
              qty,
              qtyunit,
              unitwgt,
              wgt,
              wgtunit,
              unp,
              amt,
              wonamt,
              taxamt,
              dlramt,
              remark,
              lotnum,
              div,
            } = item;

            rowsArr.rowstatus.push(rowstatus);
            rowsArr.purseq.push(purseq);
            rowsArr.proccd.push(proccd);
            rowsArr.planno.push(planno);
            rowsArr.planseq.push(planseq);
            rowsArr.ordnum.push(ordnum);
            rowsArr.ordseq.push(ordseq);
            rowsArr.itemcd.push(itemcd);
            rowsArr.itemnm.push(itemnm);
            rowsArr.qty.push(qty);
            rowsArr.qtyunit.push(qtyunit);
            rowsArr.unitwgt.push(unitwgt);
            rowsArr.wgt.push(wgt);
            rowsArr.wgtunit.push(wgtunit);
            rowsArr.unp.push(unp);
            rowsArr.amt.push(amt);
            rowsArr.wonamt.push(wonamt);
            rowsArr.taxamt.push(taxamt);
            rowsArr.dlramt.push(dlramt);
            rowsArr.remark.push(remark);
            rowsArr.lotnum.push(lotnum);
            rowsArr.div.push(div);
          });

          deletedMainRows.forEach((item: any) => {
            const {
              rowstatus,
              purseq,
              proccd,
              planno,
              planseq,
              ordnum,
              ordseq,
              itemcd,
              itemnm,
              qty,
              qtyunit,
              unitwgt,
              wgt,
              wgtunit,
              unp,
              amt,
              wonamt,
              taxamt,
              dlramt,
              remark,
              lotnum,
              div,
            } = item;

            rowsArr.rowstatus.push(rowstatus);
            rowsArr.purseq.push(purseq);
            rowsArr.proccd.push(proccd);
            rowsArr.planno.push(planno);
            rowsArr.planseq.push(planseq);
            rowsArr.ordnum.push(ordnum);
            rowsArr.ordseq.push(ordseq);
            rowsArr.itemcd.push(itemcd);
            rowsArr.itemnm.push(itemnm);
            rowsArr.qty.push(qty);
            rowsArr.qtyunit.push(qtyunit);
            rowsArr.unitwgt.push(unitwgt);
            rowsArr.wgt.push(wgt);
            rowsArr.wgtunit.push(wgtunit);
            rowsArr.unp.push(unp);
            rowsArr.amt.push(amt);
            rowsArr.wonamt.push(wonamt);
            rowsArr.taxamt.push(taxamt);
            rowsArr.dlramt.push(dlramt);
            rowsArr.remark.push(remark);
            rowsArr.lotnum.push(lotnum);
            rowsArr.div.push(div);
          });

          setParaSaved((prev) => ({
            ...prev,
            workType: workType,
            rowstatus_s: rowsArr.rowstatus.join("|"),
            purseq_s: rowsArr.purseq.join("|"),
            proccd_s: rowsArr.proccd.join("|"),
            planno_s: rowsArr.planno.join("|"),
            planseq_s: rowsArr.planseq.join("|"),
            ordnum_s: rowsArr.ordnum.join("|"),
            ordseq_s: rowsArr.ordseq.join("|"),
            itemcd_s: rowsArr.itemcd.join("|"),
            itemnm_s: rowsArr.itemnm.join("|"),
            qty_s: rowsArr.qty.join("|"),
            qtyunit_s: rowsArr.qtyunit.join("|"),
            unitwgt_s: rowsArr.unitwgt.join("|"),
            wgt_s: rowsArr.wgt.join("|"),
            wgtunit_s: rowsArr.wgtunit.join("|"),
            unp_s: rowsArr.unp.join("|"),
            amt_s: rowsArr.amt.join("|"),
            wonamt_s: rowsArr.wonamt.join("|"),
            taxamt_s: rowsArr.taxamt.join("|"),
            dlramt_s: rowsArr.dlramt.join("|"),
            remark_s: rowsArr.remark.join("|"),
            lotnum_s: rowsArr.lotnum.join("|"),
            div_s: rowsArr.div.join("|"),
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_MA_A2410W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraSaved.workType,
        "@p_orgdiv": paraSaved.orgdiv,
        "@p_location": paraSaved.location,
        "@p_outdiv": paraSaved.outdiv,
        "@p_purnum": paraSaved.purnum,
        "@p_purdt": paraSaved.purdt,
        "@p_inexpdt": paraSaved.inexpdt,
        "@p_person": paraSaved.person,
        "@p_custcd": paraSaved.custcd,
        "@p_custnm": paraSaved.custnm,
        "@p_custprsncd": "",
        "@p_doexdiv": paraSaved.doexdiv,
        "@p_taxdiv": paraSaved.taxdiv,
        "@p_amtunit": paraSaved.amtunit,
        "@p_wonchgrat": paraSaved.wonchgrat,
        "@p_uschgrat": paraSaved.uschgrat,
        "@p_baseamt": paraSaved.baseamt,
        "@p_attdatnum": paraSaved.attdatnum,
        "@p_remark": paraSaved.remark,
        "@p_rowstatus_s": paraSaved.rowstatus_s,
        "@p_purseq_s": paraSaved.purseq_s,
        "@p_proccd_s": paraSaved.proccd_s,
        "@p_planno_s": paraSaved.planno_s,
        "@p_planseq_s": paraSaved.planseq_s,
        "@p_ordnum_s": paraSaved.ordnum_s,
        "@p_ordseq_s": paraSaved.ordseq_s,
        "@p_itemcd_s": paraSaved.itemcd_s,
        "@p_itemnm_s": paraSaved.itemnm_s,
        "@p_qty_s": paraSaved.qty_s,
        "@p_qtyunit_s": paraSaved.qtyunit_s,
        "@p_unitwgt_s": paraSaved.unitwgt_s,
        "@p_wgt_s": paraSaved.wgt_s,
        "@p_wgtunit_s": paraSaved.wgtunit_s,
        "@p_unp_s": paraSaved.unp_s,
        "@p_amt_s": paraSaved.amt_s,
        "@p_wonamt_s": paraSaved.wonamt_s,
        "@p_taxamt_s": paraSaved.taxamt_s,
        "@p_dlramt_s": paraSaved.dlramt_s,
        "@p_remark_s": paraSaved.remark_s,
        "@p_lotnum_s": paraSaved.lotnum_s,
        "@p_div_s": paraSaved.div_s,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "MA_A2410W",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      deletedMainRows = [];
      setUnsavedName([]);
      reload(data.returnString);
      if (workType == "N") {
        onClose();
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (paraSaved.custcd != "") {
      fetchTodoGridSaved();
    }
  }, [paraSaved]);

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
      field != "insiz" &&
      field != "itemcd" &&
      field != "itemnm" &&
      field != "totamt" &&
      field != "rowstatus" &&
      field != "proccd" &&
      field != "planno" &&
      field != "ordnum" &&
      field != "amt" &&
      field != "wonamt" &&
      field != "taxamt" &&
      field != "qty"
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
              amt:
                filters.amtunit == "KRW"
                  ? item.qty * item.unp
                  : item.qty * item.unp * filters.wonchgrat,
              wonamt:
                filters.amtunit == "KRW"
                  ? item.qty * item.unp
                  : item.qty * item.unp * filters.wonchgrat,
              taxamt: Math.round(
                filters.taxdiv == "A"
                  ? filters.amtunit == "KRW"
                    ? item.qty * item.unp * 0.1
                    : item.qty * item.unp * filters.wonchgrat * 0.1
                  : 0
              ),
              totamt: Math.round(
                (filters.amtunit == "KRW"
                  ? item.qty * item.unp
                  : item.qty * item.unp * filters.wonchgrat) +
                  Math.round(
                    filters.taxdiv == "A"
                      ? filters.amtunit == "KRW"
                        ? (item.qty * item.unp) / 10
                        : (item.qty * item.unp * filters.wonchgrat) / 10
                      : 0
                  )
              ),
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
        amt:
          filters.amtunit == "KRW"
            ? item.qty * item.unp
            : item.qty * item.unp * filters.wonchgrat,
        wonamt:
          filters.amtunit == "KRW"
            ? item.qty * item.unp
            : item.qty * item.unp * filters.wonchgrat,
        taxamt: Math.round(
          filters.taxdiv == "A"
            ? filters.amtunit == "KRW"
              ? item.qty * item.unp * 0.1
              : item.qty * item.unp * filters.wonchgrat * 0.1
            : 0
        ),
        totamt: Math.round(
          filters.amtunit == "KRW"
            ? item.qty * item.unp
            : item.qty * item.unp * filters.wonchgrat
        ),
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
        titles={workType == "N" ? "외주처리생성" : "외주처리정보"}
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
                      <th>발주번호</th>
                      <td>
                        <Input
                          name="purnum"
                          type="text"
                          value={filters.purnum}
                          className="readonly"
                        />
                      </td>
                      <th>발주일자</th>
                      <td>
                        <DatePicker
                          name="purdt"
                          value={filters.purdt}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          className="required"
                          placeholder=""
                        />
                      </td>
                      <th>담당자</th>
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
                      <th>내수구분</th>
                      <td>
                        <Input
                          name="doexdiv"
                          type="text"
                          value={
                            doexdivListData.find(
                              (item: any) => item.sub_code == filters.doexdiv
                            )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                      <th>화폐단위</th>
                      <td>
                        <Input
                          name="amtunit"
                          type="text"
                          value={
                            amtunitListData.find(
                              (item: any) => item.sub_code == filters.amtunit
                            )?.code_name
                          }
                          className="readonly"
                        />
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
                      <th>입고예정일</th>
                      <td>
                        <DatePicker
                          name="inexpdt"
                          value={filters.inexpdt}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          placeholder=""
                        />
                      </td>
                      <th>과세구분</th>
                      <td>
                        <Input
                          name="taxdiv"
                          type="text"
                          value={
                            taxdivListData.find(
                              (item: any) => item.sub_code == filters.taxdiv
                            )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                      <th>첨부파일</th>
                      <td>
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
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={9}>
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
                        onClick={onPlanWndClick}
                        icon="folder-open"
                      >
                        계획참조
                      </Button>
                      <Button
                        themeColor={"primary"}
                        onClick={onStockWndClick}
                        icon="folder-open"
                      >
                        재고참조
                      </Button>
                      <Button
                        onClick={onDeleteClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                      ></Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: mobileheight2 }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                    field="proccd"
                    title="공정"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="planno"
                    title="생산계획번호"
                    width="120px"
                  />
                  <GridColumn field="itemcd" title="품목코드" width="120px" />
                  <GridColumn field="itemnm" title="품목명" width="150px" />
                  <GridColumn field="insiz" title="규격" width="150px" />
                  <GridColumn
                    field="qty"
                    title="수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="qtyunit"
                    title="수량단위"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="unp"
                    title="단가"
                    width="100px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="amt"
                    title="금액"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="wonamt"
                    title="원화금액"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="taxamt"
                    title="세액"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="totamt"
                    title="합계금액"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn field="remark" title="비고" width="150px" />
                  <GridColumn field="ordnum" title="수주번호" width="100px" />
                </Grid>
                <BottomContainer className="BottomContainer">
                  <ButtonContainer>
                    <Button themeColor={"primary"} onClick={onSaveClick}>
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
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <FormBoxWrap className="WindowFormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th>발주번호</th>
                    <td>
                      <Input
                        name="purnum"
                        type="text"
                        value={filters.purnum}
                        className="readonly"
                      />
                    </td>
                    <th>발주일자</th>
                    <td>
                      <DatePicker
                        name="purdt"
                        value={filters.purdt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                        className="required"
                        placeholder=""
                      />
                    </td>
                    <th>담당자</th>
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
                    <th>내수구분</th>
                    <td>
                      <Input
                        name="doexdiv"
                        type="text"
                        value={
                          doexdivListData.find(
                            (item: any) => item.sub_code == filters.doexdiv
                          )?.code_name
                        }
                        className="readonly"
                      />
                    </td>
                    <th>화폐단위</th>
                    <td>
                      <Input
                        name="amtunit"
                        type="text"
                        value={
                          amtunitListData.find(
                            (item: any) => item.sub_code == filters.amtunit
                          )?.code_name
                        }
                        className="readonly"
                      />
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
                    <th>입고예정일</th>
                    <td>
                      <DatePicker
                        name="inexpdt"
                        value={filters.inexpdt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                        placeholder=""
                      />
                    </td>
                    <th>과세구분</th>
                    <td>
                      <Input
                        name="taxdiv"
                        type="text"
                        value={
                          taxdivListData.find(
                            (item: any) => item.sub_code == filters.taxdiv
                          )?.code_name
                        }
                        className="readonly"
                      />
                    </td>
                    <th>첨부파일</th>
                    <td>
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
                  </tr>
                  <tr>
                    <th>비고</th>
                    <td colSpan={9}>
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
              <GridTitleContainer className="WindowButtonContainer">
                <GridTitle>상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onPlanWndClick}
                    icon="folder-open"
                  >
                    계획참조
                  </Button>
                  <Button
                    themeColor={"primary"}
                    onClick={onStockWndClick}
                    icon="folder-open"
                  >
                    재고참조
                  </Button>
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
                style={{ height: webheight }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
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
                  field="proccd"
                  title="공정"
                  width="120px"
                  footerCell={mainTotalFooterCell}
                  cell={CustomComboBoxCell}
                />
                <GridColumn field="planno" title="생산계획번호" width="120px" />
                <GridColumn field="itemcd" title="품목코드" width="120px" />
                <GridColumn field="itemnm" title="품목명" width="150px" />
                <GridColumn field="insiz" title="규격" width="150px" />
                <GridColumn
                  field="qty"
                  title="수량"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="qtyunit"
                  title="수량단위"
                  width="120px"
                  cell={CustomComboBoxCell}
                />
                <GridColumn
                  field="unp"
                  title="단가"
                  width="100px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="amt"
                  title="금액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="wonamt"
                  title="원화금액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="taxamt"
                  title="세액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="totamt"
                  title="합계금액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn field="remark" title="비고" width="150px" />
                <GridColumn field="ordnum" title="수주번호" width="100px" />
              </Grid>
            </GridContainer>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                <Button themeColor={"primary"} onClick={onSaveClick}>
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
          </>
        )}
      </Window>
      {planWindowVisible && (
        <PlanWindow
          setVisible={setPlanWindowVisible}
          setData={setPlanData}
          pathname={pathname}
        />
      )}
      {stockWindowVisible && (
        <StockWindow
          setVisible={setStockWindowVisible}
          setData={setStockData}
          pathname={pathname}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"FILTER"}
          setData={setCustData}
        />
      )}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
        />
      )}
    </>
  );
};

export default DetailWindow;
