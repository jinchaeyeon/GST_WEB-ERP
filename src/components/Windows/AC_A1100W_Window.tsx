import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
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
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import NumberCell from "../Cells/NumberCell";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UseMessages,
  convertDateToStr,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  numberWithCommas,
  numberWithCommas3,
  toDate,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import AC_A1100W_Indt_Window from "./AC_A1100W_Indt_Window";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: any;
  setVisible(t: boolean): void;
  setData(str: string): void;
  modal?: boolean;
  pathname: string;
};

type TdataArr = {
  rowstatus_s: string[];
  seq2_s: string[];

  coddt_s: string[];
  location_s: string[];
  position_s: string[];
  importnum_s: string[];
  tottaxamt_s: string[];
  rate_s: string[];
  wonamt_s: string[];
  annexation_s: string[];
  totwgt_s: string[];
  customs_s: string[];
  taxamt_s: string[];
  actdt_s: string[];
  acseq1_s: string[];
  purnum_s: string[];
  purseq_s: string[];
  costamt1_s: string[];
  costamt2_s: string[];
  costamt3_s: string[];
  costamt4_s: string[];
  costamt5_s: string[];
  costamt6_s: string[];
  costamt7_s: string[];
  costamt8_s: string[];
  costamt9_s: string[];
  costamt10_s: string[];
  costamt11_s: string[];
  costamt12_s: string[];
  costamt13_s: string[];
  costamt14_s: string[];
  costamt15_s: string[];
  remark3_s: string[];
  inrecdt_s: string[];
  inseq1_s: string[];
};

const DATA_ITEM_KEY = "num";
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
  setData,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 900,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //하단 버튼부분
    height3 = getHeight(".FormBoxWrap");
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
  }, []);

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

  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const [worktype, setWorkType] = useState<string>(workType);
  const Userlocation = UseGetValueFromSessionItem("location");
  const Userposition = UseGetValueFromSessionItem("position");
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002,L_BA028, L_AC250",
    //공정, 관리항목리스트
    setBizComponentData
  );

  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (worktype == "U" && data != undefined) {
      setInformation((prev) => ({
        ...prev,
        acseq1: data.acseq1,
        actdt: data.actdt == "" ? null : toDate(data.actdt),
        annexation: data.annexation,
        coddt: data.coddt == "" ? new Date() : toDate(data.coddt),
        codnum: data.codnum,
        costamt1: data.costamt1,
        costamt2: data.costamt2,
        costamt3: data.costamt3,
        costamt4: data.costamt4,
        costamt5: data.costamt5,
        costamt6: data.costamt6,
        costamt7: data.costamt7,
        costamt8: data.costamt8,
        costamt9: data.costamt9,
        costamt10: data.costamt10,
        costamt11: data.costamt11,
        costamt12: data.costamt12,
        costamt13: data.costamt13,
        costamt14: data.costamt14,
        costamt15: data.costamt15,
        customs: data.customs,
        customscustcd: data.customscustcd,
        customscustnm: data.customscustnm,
        ftayn: data.ftayn,
        importnum: data.importnum,
        itemnm: data.itemnm,
        location: data.location,
        orgdiv: data.orgdiv,
        position: data.position,
        rate: data.rate,
        recdt: data.recdt == "" ? new Date() : toDate(data.recdt),
        refundamt: data.refundamt,
        refunddt: data.refunddt == "" ? null : toDate(data.refunddt),
        remark3: data.remark3,
        seq1: data.seq1,
        taxamt: data.taxamt,
        tottaxamt: data.tottaxamt,
        totwgt: data.totwgt,
        wonamt: data.wonamt,
      }));
      setFilters((prev) => ({
        ...prev,
        orgdiv: data.orgdiv,
        location: data.location,
        recdt: data.recdt,
        seq1: data.seq1,
        isSearch: true,
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        location: Userlocation,
        position: Userposition,
      }));
    }
  }, []);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: "",
    recdt: "",
    seq1: "",
    pgNum: 1,
    isSearch: false,
  });

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_position": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_importnum": "",
        "@p_remark3": "",
        "@p_find_row_value": "",
        "@p_recdt": filters.recdt,
        "@p_seq1": filters.seq1,
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    acseq1: 0,
    actdt: null,
    annexation: 0,
    coddt: new Date(),
    codnum: "",
    costamt1: 0,
    costamt2: 0,
    costamt3: 0,
    costamt4: 0,
    costamt5: 0,
    costamt6: 0,
    costamt7: 0,
    costamt8: 0,
    costamt9: 0,
    costamt10: 0,
    costamt11: 0,
    costamt12: 0,
    costamt13: 0,
    costamt14: 0,
    costamt15: 0,
    customs: 0,
    customscustcd: "",
    customscustnm: "",
    ftayn: "",
    importnum: "",
    itemnm: "",
    location: "",
    orgdiv: sessionOrgdiv,
    position: "",
    rate: 0,
    recdt: new Date(),
    refundamt: 0,
    refunddt: null,
    remark3: "",
    seq1: 0,
    taxamt: 0,
    tottaxamt: 0,
    totwgt: 0,
    wonamt: 0,
  });

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
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
    setInformation((prev) => ({
      ...prev,
      customscustcd: data.custcd,
      customscustnm: data.custnm,
    }));
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]) {
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
    if (Object3.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

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
    if (field != "rowstatus" && field != "inkey" && field != "purnum") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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

  const [dataWindowVisible, setDataWindowVisible] = useState<boolean>(false);

  const onDataWndClick = () => {
    setDataWindowVisible(true);
  };

  const setCopyData = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    data.num = ++temp;

    setMainDataResult((prev) => {
      return {
        data: [data, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSelectedState({ [data[DATA_ITEM_KEY]]: true });
  };

  const selectData = (selectedData: any) => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    let dataArr: TdataArr = {
      rowstatus_s: [],
      seq2_s: [],
      coddt_s: [],
      location_s: [],
      position_s: [],
      importnum_s: [],
      tottaxamt_s: [],
      rate_s: [],
      wonamt_s: [],
      annexation_s: [],
      totwgt_s: [],
      customs_s: [],
      taxamt_s: [],
      actdt_s: [],
      acseq1_s: [],
      purnum_s: [],
      purseq_s: [],
      costamt1_s: [],
      costamt2_s: [],
      costamt3_s: [],
      costamt4_s: [],
      costamt5_s: [],
      costamt6_s: [],
      costamt7_s: [],
      costamt8_s: [],
      costamt9_s: [],
      costamt10_s: [],
      costamt11_s: [],
      costamt12_s: [],
      costamt13_s: [],
      costamt14_s: [],
      costamt15_s: [],
      remark3_s: [],
      inrecdt_s: [],
      inseq1_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq2 = "",
        coddt = "",
        location = "",
        position = "",
        importnum = "",
        tottaxamt = "",
        rate = "",
        wonamt = "",
        annexation = "",
        totwgt = "",
        customs = "",
        taxamt = "",
        actdt = "",
        acseq1 = "",
        purnum = "",
        purseq = "",
        costamt1 = "",
        costamt2 = "",
        costamt3 = "",
        costamt4 = "",
        costamt5 = "",
        costamt6 = "",
        costamt7 = "",
        costamt8 = "",
        costamt9 = "",
        costamt10 = "",
        costamt11 = "",
        costamt12 = "",
        costamt13 = "",
        costamt14 = "",
        costamt15 = "",
        remark3 = "",
        inrecdt = "",
        inseq1 = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq2_s.push(seq2);
      dataArr.coddt_s.push(coddt);
      dataArr.location_s.push(location);
      dataArr.position_s.push(position);
      dataArr.importnum_s.push(importnum);
      dataArr.tottaxamt_s.push(tottaxamt);
      dataArr.rate_s.push(rate);
      dataArr.wonamt_s.push(wonamt);
      dataArr.annexation_s.push(annexation);
      dataArr.totwgt_s.push(totwgt);
      dataArr.customs_s.push(customs);
      dataArr.taxamt_s.push(taxamt);
      dataArr.actdt_s.push(actdt);
      dataArr.acseq1_s.push(acseq1);
      dataArr.purnum_s.push(purnum);
      dataArr.purseq_s.push(purseq);
      dataArr.costamt1_s.push(costamt1);
      dataArr.costamt2_s.push(costamt2);
      dataArr.costamt3_s.push(costamt3);
      dataArr.costamt4_s.push(costamt4);
      dataArr.costamt5_s.push(costamt5);
      dataArr.costamt6_s.push(costamt6);
      dataArr.costamt7_s.push(costamt7);
      dataArr.costamt8_s.push(costamt8);
      dataArr.costamt9_s.push(costamt9);
      dataArr.costamt10_s.push(costamt10);
      dataArr.costamt11_s.push(costamt11);
      dataArr.costamt12_s.push(costamt12);
      dataArr.costamt13_s.push(costamt13);
      dataArr.costamt14_s.push(costamt14);
      dataArr.costamt15_s.push(costamt15);
      dataArr.remark3_s.push(remark3);
      dataArr.inrecdt_s.push(inrecdt);
      dataArr.inseq1_s.push(inseq1);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq2 = "",
        coddt = "",
        location = "",
        position = "",
        importnum = "",
        tottaxamt = "",
        rate = "",
        wonamt = "",
        annexation = "",
        totwgt = "",
        customs = "",
        taxamt = "",
        actdt = "",
        acseq1 = "",
        purnum = "",
        purseq = "",
        costamt1 = "",
        costamt2 = "",
        costamt3 = "",
        costamt4 = "",
        costamt5 = "",
        costamt6 = "",
        costamt7 = "",
        costamt8 = "",
        costamt9 = "",
        costamt10 = "",
        costamt11 = "",
        costamt12 = "",
        costamt13 = "",
        costamt14 = "",
        costamt15 = "",
        remark3 = "",
        inrecdt = "",
        inseq1 = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.seq2_s.push(seq2);
      dataArr.coddt_s.push(coddt);
      dataArr.location_s.push(location);
      dataArr.position_s.push(position);
      dataArr.importnum_s.push(importnum);
      dataArr.tottaxamt_s.push(tottaxamt);
      dataArr.rate_s.push(rate);
      dataArr.wonamt_s.push(wonamt);
      dataArr.annexation_s.push(annexation);
      dataArr.totwgt_s.push(totwgt);
      dataArr.customs_s.push(customs);
      dataArr.taxamt_s.push(taxamt);
      dataArr.actdt_s.push(actdt);
      dataArr.acseq1_s.push(acseq1);
      dataArr.purnum_s.push(purnum);
      dataArr.purseq_s.push(purseq);
      dataArr.costamt1_s.push(costamt1);
      dataArr.costamt2_s.push(costamt2);
      dataArr.costamt3_s.push(costamt3);
      dataArr.costamt4_s.push(costamt4);
      dataArr.costamt5_s.push(costamt5);
      dataArr.costamt6_s.push(costamt6);
      dataArr.costamt7_s.push(costamt7);
      dataArr.costamt8_s.push(costamt8);
      dataArr.costamt9_s.push(costamt9);
      dataArr.costamt10_s.push(costamt10);
      dataArr.costamt11_s.push(costamt11);
      dataArr.costamt12_s.push(costamt12);
      dataArr.costamt13_s.push(costamt13);
      dataArr.costamt14_s.push(costamt14);
      dataArr.costamt15_s.push(costamt15);
      dataArr.remark3_s.push(remark3);
      dataArr.inrecdt_s.push(inrecdt);
      dataArr.inseq1_s.push(inseq1);
    });

    setParaData((prev) => ({
      ...prev,
      workType: worktype,
      orgdiv: Information.orgdiv,
      recdt: convertDateToStr(Information.recdt),
      seq1: Information.seq1,
      coddt: convertDateToStr(Information.coddt),
      location: Information.location,
      position: Information.position,
      importnum: Information.importnum,
      tottaxamt: Information.tottaxamt,
      rate: Information.rate,
      wonamt: Information.wonamt,
      annexation: Information.annexation,
      customs: Information.customs,
      taxamt: Information.taxamt,
      actdt:
        Information.actdt == null ? "" : convertDateToStr(Information.actdt),
      acseq1: Information.acseq1,
      costamt1: Information.costamt1,
      costamt2: Information.costamt2,
      costamt3: Information.costamt3,
      costamt4: Information.costamt4,
      costamt5: Information.costamt5,
      costamt6: Information.costamt6,
      costamt7: Information.costamt7,
      costamt8: Information.costamt8,
      costamt9: Information.costamt9,
      costamt10: Information.costamt10,
      costamt11: Information.costamt11,
      costamt12: Information.costamt12,
      costamt13: Information.costamt13,
      costamt14: Information.costamt14,
      costamt15: Information.costamt15,
      remark3: Information.remark3,
      refunddt:
        Information.refunddt == null
          ? ""
          : convertDateToStr(Information.refunddt),
      refundamt: Information.refundamt,
      customscustcd: Information.customscustcd,
      ftayn: Information.ftayn,
      itemnm: Information.itemnm,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq2_s: dataArr.seq2_s.join("|"),
      coddt_s: dataArr.coddt_s.join("|"),
      location_s: dataArr.location_s.join("|"),
      position_s: dataArr.position_s.join("|"),
      importnum_s: dataArr.importnum_s.join("|"),
      tottaxamt_s: dataArr.tottaxamt_s.join("|"),
      rate_s: dataArr.rate_s.join("|"),
      wonamt_s: dataArr.wonamt_s.join("|"),
      annexation_s: dataArr.annexation_s.join("|"),
      totwgt_s: dataArr.totwgt_s.join("|"),
      customs_s: dataArr.customs_s.join("|"),
      taxamt_s: dataArr.taxamt_s.join("|"),
      actdt_s: dataArr.actdt_s.join("|"),
      acseq1_s: dataArr.acseq1_s.join("|"),
      purnum_s: dataArr.purnum_s.join("|"),
      purseq_s: dataArr.purseq_s.join("|"),
      costamt1_s: dataArr.costamt1_s.join("|"),
      costamt2_s: dataArr.costamt2_s.join("|"),
      costamt3_s: dataArr.costamt3_s.join("|"),
      costamt4_s: dataArr.costamt4_s.join("|"),
      costamt5_s: dataArr.costamt5_s.join("|"),
      costamt6_s: dataArr.costamt6_s.join("|"),
      costamt7_s: dataArr.costamt7_s.join("|"),
      costamt8_s: dataArr.costamt8_s.join("|"),
      costamt9_s: dataArr.costamt9_s.join("|"),
      costamt10_s: dataArr.costamt10_s.join("|"),
      costamt11_s: dataArr.costamt11_s.join("|"),
      costamt12_s: dataArr.costamt12_s.join("|"),
      costamt13_s: dataArr.costamt13_s.join("|"),
      costamt14_s: dataArr.costamt14_s.join("|"),
      costamt15_s: dataArr.costamt15_s.join("|"),
      remark3_s: dataArr.remark3_s.join("|"),
      inrecdt_s: dataArr.inrecdt_s.join("|"),
      inseq1_s: dataArr.inseq1_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    recdt: "",
    seq1: 0,
    coddt: "",
    location: "",
    position: "",
    importnum: "",
    tottaxamt: 0,
    rate: 0,
    wonamt: 0,
    annexation: 0,
    totwgt: 0,
    customs: 0,
    taxamt: 0,
    actdt: "",
    acseq1: 0,
    costamt1: 0,
    costamt2: 0,
    costamt3: 0,
    costamt4: 0,
    costamt5: 0,
    costamt6: 0,
    costamt7: 0,
    costamt8: 0,
    costamt9: 0,
    costamt10: 0,
    costamt11: 0,
    costamt12: 0,
    costamt13: 0,
    costamt14: 0,
    costamt15: 0,
    remark3: "",
    refunddt: "",
    refundamt: 0,
    customscustcd: "",
    ftayn: "",
    itemnm: "",
    rowstatus_s: "",
    seq2_s: "",
    coddt_s: "",
    location_s: "",
    position_s: "",
    importnum_s: "",
    tottaxamt_s: "",
    rate_s: "",
    wonamt_s: "",
    annexation_s: "",
    totwgt_s: "",
    customs_s: "",
    taxamt_s: "",
    actdt_s: "",
    acseq1_s: "",
    purnum_s: "",
    purseq_s: "",
    costamt1_s: "",
    costamt2_s: "",
    costamt3_s: "",
    costamt4_s: "",
    costamt5_s: "",
    costamt6_s: "",
    costamt7_s: "",
    costamt8_s: "",
    costamt9_s: "",
    costamt10_s: "",
    costamt11_s: "",
    costamt12_s: "",
    costamt13_s: "",
    costamt14_s: "",
    costamt15_s: "",
    remark3_s: "",
    inrecdt_s: "",
    inseq1_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A1100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_recdt": ParaData.recdt,
      "@p_seq1": ParaData.seq1,
      "@p_coddt": ParaData.coddt,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_importnum": ParaData.importnum,
      "@p_tottaxamt": ParaData.tottaxamt,
      "@p_rate": ParaData.rate,
      "@p_wonamt": ParaData.wonamt,
      "@p_annexation": ParaData.annexation,
      "@p_totwgt": ParaData.totwgt,
      "@p_customs": ParaData.customs,
      "@p_taxamt": ParaData.taxamt,
      "@p_actdt": ParaData.actdt,
      "@p_acseq1": ParaData.acseq1,
      "@p_costamt1": ParaData.costamt1,
      "@p_costamt2": ParaData.costamt2,
      "@p_costamt3": ParaData.costamt3,
      "@p_costamt4": ParaData.costamt4,
      "@p_costamt5": ParaData.costamt5,
      "@p_costamt6": ParaData.costamt6,
      "@p_costamt7": ParaData.costamt7,
      "@p_costamt8": ParaData.costamt8,
      "@p_costamt9": ParaData.costamt9,
      "@p_costamt10": ParaData.costamt10,
      "@p_costamt11": ParaData.costamt11,
      "@p_costamt12": ParaData.costamt12,
      "@p_costamt13": ParaData.costamt13,
      "@p_costamt14": ParaData.costamt14,
      "@p_costamt15": ParaData.costamt15,
      "@p_remark3": ParaData.remark3,
      "@p_refunddt": ParaData.refunddt,
      "@p_refundamt": ParaData.refundamt,
      "@p_customscustcd": ParaData.customscustcd,
      "@p_ftayn": ParaData.ftayn,
      "@p_itemnm": ParaData.itemnm,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_coddt_s": ParaData.coddt_s,
      "@p_location_s": ParaData.location_s,
      "@p_position_s": ParaData.position_s,
      "@p_importnum_s": ParaData.importnum_s,
      "@p_tottaxamt_s": ParaData.tottaxamt_s,
      "@p_rate_s": ParaData.rate_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_annexation_s": ParaData.annexation_s,
      "@p_totwgt_s": ParaData.totwgt_s,
      "@p_customs_s": ParaData.customs_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_actdt_s": ParaData.actdt_s,
      "@p_acseq1_s": ParaData.acseq1_s,
      "@p_purnum_s": ParaData.purnum_s,
      "@p_purseq_s": ParaData.purseq_s,
      "@p_costamt1_s": ParaData.costamt1_s,
      "@p_costamt2_s": ParaData.costamt2_s,
      "@p_costamt3_s": ParaData.costamt3_s,
      "@p_costamt4_s": ParaData.costamt4_s,
      "@p_costamt5_s": ParaData.costamt5_s,
      "@p_costamt6_s": ParaData.costamt6_s,
      "@p_costamt7_s": ParaData.costamt7_s,
      "@p_costamt8_s": ParaData.costamt8_s,
      "@p_costamt9_s": ParaData.costamt9_s,
      "@p_costamt10_s": ParaData.costamt10_s,
      "@p_costamt11_s": ParaData.costamt11_s,
      "@p_costamt12_s": ParaData.costamt12_s,
      "@p_costamt13_s": ParaData.costamt13_s,
      "@p_costamt14_s": ParaData.costamt14_s,
      "@p_costamt15_s": ParaData.costamt15_s,
      "@p_remark3_s": ParaData.remark3_s,
      "@p_inrecdt_s": ParaData.inrecdt_s,
      "@p_inseq1_s": ParaData.inseq1_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A1100W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setData(data.returnString);
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));

      deletedMainRows = [];
      if (ParaData.workType == "N") {
        setVisible(false);
      }
      setParaData({
        workType: "",
        orgdiv: "",
        recdt: "",
        seq1: 0,
        coddt: "",
        location: "",
        position: "",
        importnum: "",
        tottaxamt: 0,
        rate: 0,
        wonamt: 0,
        annexation: 0,
        totwgt: 0,
        customs: 0,
        taxamt: 0,
        actdt: "",
        acseq1: 0,
        costamt1: 0,
        costamt2: 0,
        costamt3: 0,
        costamt4: 0,
        costamt5: 0,
        costamt6: 0,
        costamt7: 0,
        costamt8: 0,
        costamt9: 0,
        costamt10: 0,
        costamt11: 0,
        costamt12: 0,
        costamt13: 0,
        costamt14: 0,
        costamt15: 0,
        remark3: "",
        refunddt: "",
        refundamt: 0,
        customscustcd: "",
        ftayn: "",
        itemnm: "",
        rowstatus_s: "",
        seq2_s: "",
        coddt_s: "",
        location_s: "",
        position_s: "",
        importnum_s: "",
        tottaxamt_s: "",
        rate_s: "",
        wonamt_s: "",
        annexation_s: "",
        totwgt_s: "",
        customs_s: "",
        taxamt_s: "",
        actdt_s: "",
        acseq1_s: "",
        purnum_s: "",
        purseq_s: "",
        costamt1_s: "",
        costamt2_s: "",
        costamt3_s: "",
        costamt4_s: "",
        costamt5_s: "",
        costamt6_s: "",
        costamt7_s: "",
        costamt8_s: "",
        costamt9_s: "",
        costamt10_s: "",
        costamt11_s: "",
        costamt12_s: "",
        costamt13_s: "",
        costamt14_s: "",
        costamt15_s: "",
        remark3_s: "",
        inrecdt_s: "",
        inseq1_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  return (
    <>
      <Window
        titles={worktype == "N" ? "수입신고생성" : "수입신고정보"}
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
                className="FormBoxWrap"
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
                      <th>관리번호</th>
                      <td>
                        <Input
                          name="codnum"
                          type="text"
                          value={
                            Information.codnum == ""
                              ? ""
                              : Information.codnum.slice(0, 8)
                          }
                          className="readonly"
                        />
                      </td>
                      <th>관리순번</th>
                      <td>
                        <Input
                          name="seq1"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(Information.seq1)}
                          className="readonly"
                        />
                      </td>
                      <th>신고일자</th>
                      <td>
                        <DatePicker
                          name="coddt"
                          value={Information.coddt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                        />
                      </td>
                      <th>신고번호</th>
                      <td>
                        <Input
                          name="importnum"
                          type="text"
                          value={Information.importnum}
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
                            value={Information.location}
                            bizComponentId="L_BA002"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            para="AC_A1100W"
                          />
                        )}
                      </td>
                      <th>사업부</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="position"
                            value={Information.position}
                            bizComponentId="L_BA028"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            para="AC_A1100W"
                          />
                        )}
                      </td>
                      <th>대표품목</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={Information.itemnm}
                          onChange={InputChange}
                        />
                      </td>
                      <th>비고</th>
                      <td>
                        <Input
                          name="remark3"
                          type="text"
                          value={Information.remark3}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>총과세액</th>
                      <td>
                        <NumericTextBox
                          name="tottaxamt"
                          value={Information.tottaxamt}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>환율</th>
                      <td>
                        <NumericTextBox
                          name="rate"
                          value={Information.rate}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>환산금액</th>
                      <td>
                        <NumericTextBox
                          name="wonamt"
                          value={Information.wonamt}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>부가가치세과표</th>
                      <td>
                        <NumericTextBox
                          name="annexation"
                          value={Information.annexation}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>총중량</th>
                      <td>
                        <NumericTextBox
                          name="totwgt"
                          value={Information.totwgt}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>관세</th>
                      <td>
                        <NumericTextBox
                          name="customs"
                          value={Information.customs}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>부가세</th>
                      <td>
                        <NumericTextBox
                          name="taxamt"
                          value={Information.taxamt}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>환급일자</th>
                      <td>
                        <DatePicker
                          name="refunddt"
                          value={Information.refunddt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>관세사코드</th>
                      <td>
                        <Input
                          name="customscustcd"
                          type="text"
                          value={Information.customscustcd}
                          onChange={InputChange}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onCustWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <th>관세사명</th>
                      <td>
                        <Input
                          name="customscustnm"
                          type="text"
                          value={Information.customscustnm}
                          onChange={InputChange}
                        />
                      </td>
                      <th>관세환급금</th>
                      <td>
                        <NumericTextBox
                          name="refundamt"
                          value={Information.refundamt}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>FTA체결확인</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="ftayn"
                            value={Information.ftayn}
                            bizComponentId="L_AC250"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            para="AC_A1100W"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>통관수수료</th>
                      <td>
                        <NumericTextBox
                          name="costamt1"
                          value={Information.costamt1}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>내륙운반비</th>
                      <td>
                        <NumericTextBox
                          name="costamt2"
                          value={Information.costamt2}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>선임비</th>
                      <td>
                        <NumericTextBox
                          name="costamt3"
                          value={Information.costamt3}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>보험,보관료</th>
                      <td>
                        <NumericTextBox
                          name="costamt4"
                          value={Information.costamt4}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>L/C Open 수수료</th>
                      <td>
                        <NumericTextBox
                          name="costamt5"
                          value={Information.costamt5}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>유산스이자</th>
                      <td>
                        <NumericTextBox
                          name="costamt6"
                          value={Information.costamt6}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>TNT</th>
                      <td>
                        <NumericTextBox
                          name="costamt7"
                          value={Information.costamt7}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>보험료</th>
                      <td>
                        <NumericTextBox
                          name="costamt8"
                          value={Information.costamt8}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>기타수입부대비1</th>
                      <td>
                        <NumericTextBox
                          name="costamt9"
                          value={Information.costamt9}
                          onChange={InputChange}
                          format="n0"
                        />
                      </td>
                      <th>기타수입부대비2</th>
                      <td>
                        <NumericTextBox
                          name="costamt10"
                          value={Information.costamt10}
                          onChange={InputChange}
                          format="n0"
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
                        onClick={onDeleteClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                      ></Button>
                      <Button
                        themeColor={"primary"}
                        onClick={onDataWndClick}
                        icon="folder-open"
                      >
                        입고참조
                      </Button>
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
                    field="purnum"
                    title="발주번호"
                    width="150px"
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="inkey" title="입고번호" width="150px" />
                  <GridColumn
                    field="tottaxamt"
                    title="총과세액"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="totwgt"
                    title="총중량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="customs"
                    title="관세"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt1"
                    title="통관수수료"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt2"
                    title="내륙운반비"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt3"
                    title="선임비"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt4"
                    title="보관,보관료"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt5"
                    title="L/C Open 수수료"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt6"
                    title="유산스이자"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt7"
                    title="TNT"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt8"
                    title="보험료"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt9"
                    title="기타수입부대비1"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="costamt10"
                    title="기타수입부대비2"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                </Grid>
                <BottomContainer className="BottomContainer">
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
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <FormBoxWrap className="FormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th>관리번호</th>
                    <td>
                      <Input
                        name="codnum"
                        type="text"
                        value={
                          Information.codnum == ""
                            ? ""
                            : Information.codnum.slice(0, 8)
                        }
                        className="readonly"
                      />
                    </td>
                    <th>관리순번</th>
                    <td>
                      <Input
                        name="seq1"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.seq1)}
                        className="readonly"
                      />
                    </td>
                    <th>신고일자</th>
                    <td>
                      <DatePicker
                        name="coddt"
                        value={Information.coddt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>신고번호</th>
                    <td>
                      <Input
                        name="importnum"
                        type="text"
                        value={Information.importnum}
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
                          value={Information.location}
                          bizComponentId="L_BA002"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A1100W"
                        />
                      )}
                    </td>
                    <th>사업부</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="position"
                          value={Information.position}
                          bizComponentId="L_BA028"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A1100W"
                        />
                      )}
                    </td>
                    <th>대표품목</th>
                    <td>
                      <Input
                        name="itemnm"
                        type="text"
                        value={Information.itemnm}
                        onChange={InputChange}
                      />
                    </td>
                    <th>비고</th>
                    <td>
                      <Input
                        name="remark3"
                        type="text"
                        value={Information.remark3}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>총과세액</th>
                    <td>
                      <NumericTextBox
                        name="tottaxamt"
                        value={Information.tottaxamt}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>환율</th>
                    <td>
                      <NumericTextBox
                        name="rate"
                        value={Information.rate}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>환산금액</th>
                    <td>
                      <NumericTextBox
                        name="wonamt"
                        value={Information.wonamt}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>부가가치세과표</th>
                    <td>
                      <NumericTextBox
                        name="annexation"
                        value={Information.annexation}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>총중량</th>
                    <td>
                      <NumericTextBox
                        name="totwgt"
                        value={Information.totwgt}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>관세</th>
                    <td>
                      <NumericTextBox
                        name="customs"
                        value={Information.customs}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>부가세</th>
                    <td>
                      <NumericTextBox
                        name="taxamt"
                        value={Information.taxamt}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>환급일자</th>
                    <td>
                      <DatePicker
                        name="refunddt"
                        value={Information.refunddt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>관세사코드</th>
                    <td>
                      <Input
                        name="customscustcd"
                        type="text"
                        value={Information.customscustcd}
                        onChange={InputChange}
                      />
                      <ButtonInInput>
                        <Button
                          onClick={onCustWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>관세사명</th>
                    <td>
                      <Input
                        name="customscustnm"
                        type="text"
                        value={Information.customscustnm}
                        onChange={InputChange}
                      />
                    </td>
                    <th>관세환급금</th>
                    <td>
                      <NumericTextBox
                        name="refundamt"
                        value={Information.refundamt}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>FTA체결확인</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="ftayn"
                          value={Information.ftayn}
                          bizComponentId="L_AC250"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A1100W"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>통관수수료</th>
                    <td>
                      <NumericTextBox
                        name="costamt1"
                        value={Information.costamt1}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>내륙운반비</th>
                    <td>
                      <NumericTextBox
                        name="costamt2"
                        value={Information.costamt2}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>선임비</th>
                    <td>
                      <NumericTextBox
                        name="costamt3"
                        value={Information.costamt3}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>보험,보관료</th>
                    <td>
                      <NumericTextBox
                        name="costamt4"
                        value={Information.costamt4}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>L/C Open 수수료</th>
                    <td>
                      <NumericTextBox
                        name="costamt5"
                        value={Information.costamt5}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>유산스이자</th>
                    <td>
                      <NumericTextBox
                        name="costamt6"
                        value={Information.costamt6}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>TNT</th>
                    <td>
                      <NumericTextBox
                        name="costamt7"
                        value={Information.costamt7}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>보험료</th>
                    <td>
                      <NumericTextBox
                        name="costamt8"
                        value={Information.costamt8}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>기타수입부대비1</th>
                    <td>
                      <NumericTextBox
                        name="costamt9"
                        value={Information.costamt9}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>기타수입부대비2</th>
                    <td>
                      <NumericTextBox
                        name="costamt10"
                        value={Information.costamt10}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <GridContainer>
              <GridTitleContainer
                className="WindowButtonContainer"
                style={{ justifyContent: "end" }}
              >
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    themeColor={"primary"}
                    onClick={onDataWndClick}
                    icon="folder-open"
                  >
                    입고참조
                  </Button>
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
                  field="purnum"
                  title="발주번호"
                  width="150px"
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn field="inkey" title="입고번호" width="150px" />
                <GridColumn
                  field="tottaxamt"
                  title="총과세액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="totwgt"
                  title="총중량"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="customs"
                  title="관세"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt1"
                  title="통관수수료"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt2"
                  title="내륙운반비"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt3"
                  title="선임비"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt4"
                  title="보관,보관료"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt5"
                  title="L/C Open 수수료"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt6"
                  title="유산스이자"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt7"
                  title="TNT"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt8"
                  title="보험료"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt9"
                  title="기타수입부대비1"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="costamt10"
                  title="기타수입부대비2"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
              </Grid>
            </GridContainer>
            <BottomContainer className="BottomContainer">
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
          </>
        )}
        {custWindowVisible && (
          <CustomersWindow
            setVisible={setCustWindowVisible}
            workType={"N"}
            setData={setCustData}
          />
        )}
        {dataWindowVisible && (
          <AC_A1100W_Indt_Window
            setVisible={setDataWindowVisible}
            setData={setCopyData}
            importnum={Information.importnum}
            pathname={pathname}
          />
        )}
      </Window>
    </>
  );
};

export default CopyWindow;
