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
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
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
import CopyWindow2 from "./MA_A2400W_Plan_Window";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};
let temp = 0;

type TdataArr = {
  rowstatus_s: string[];
  purseq_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  insiz_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  unitwgt_s: string[];
  wgt_s: string[];
  wgtunit_s: string[];
  proccd_s: string[];
  planno_s: string[];
  planseq_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  remark_s: string[];
};

type Idata = {
  amt: number;
  amtunit: string;
  attdatnum: string;
  baseamt: number;
  custcd: string;
  custnm: string;
  custprsncd: string;
  doexdiv: string;
  files: string;
  inexpdt: string;
  location: string;
  num: number;
  orgdiv: string;
  person: string;
  purdt: string;
  purnum: string;
  purqty: number;
  pursts: string;
  remark: string;
  taxamt: number;
  taxdiv: string;
  totamt: number;
  uschgrat: number;
  wonamt: number;
  wonchgrat: number;
};
let deletedMainRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA019,L_BA015", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "unpcalmeth" ? "L_BA019" : field == "qtyunit" ? "L_BA015" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

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
  pathname,
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
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 900,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

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
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = loginResult ? loginResult.userId : "";
  const pc = UseGetValueFromSessionItem("pc");
  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  // 삭제할 첨부파일 리스트를 담는 함수

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

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
        doexdiv: defaultOption.find((item: any) => item.id == "doexdiv")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        custprsncd: defaultOption.find((item: any) => item.id == "custprsncd")
          ?.valueCode,
        taxdiv: defaultOption.find((item: any) => item.id == "taxdiv")
          ?.valueCode,
        pursts: defaultOption.find((item: any) => item.id == "pursts")
          ?.valueCode,
        amtunit: defaultOption.find((item: any) => item.id == "amtunit")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR010",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
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

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
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
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    amt: 0,
    amtunit: "",
    attdatnum: "",
    baseamt: 0,
    custcd: "",
    custnm: "",
    custprsncd: "",
    doexdiv: "",
    files: "",
    inexpdt: null,
    location: sessionLocation,
    num: 0,
    orgdiv: sessionOrgdiv,
    person: "",
    purdt: new Date(),
    purnum: "",
    purqty: 0,
    pursts: "",
    remark: "",
    taxamt: 0,
    taxdiv: "A",
    totamt: 0,
    uschgrat: 0,
    wonamt: 0,
    wonchgrat: 0,
    userid: userId,
    pc: pc,
    form_id: "MA_A2400W",
    serviceid: companyCode,
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_MA_A2400W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_purnum": filters.purnum,
        "@p_purseq": 0,
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_person": "",
        "@p_pursts": "",
        "@p_finyn": "",
        "@p_company_code": companyCode,
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
        custprsncd: data.custprsncd,
        taxdiv: data.taxdiv,
        pursts: data.pursts,
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    if (!permissions.save) return;
    let valid = true;
    mainDataResult.data.map((item) => {
      if (item.qty == 0 && valid == true) {
        alert("수량을 채워주세요.");
        valid = false;
        return false;
      }
    });

    try {
      if (mainDataResult.data.length == 0) {
        throw findMessage(messagesData, "MA_A2400W_003");
      } else if (
        convertDateToStr(filters.purdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.purdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.purdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.purdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A2400W_001");
      } else if (
        filters.doexdiv == null ||
        filters.doexdiv == "" ||
        filters.doexdiv == undefined
      ) {
        throw findMessage(messagesData, "MA_A2400W_004");
      } else if (
        filters.location == null ||
        filters.location == "" ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "MA_A2400W_002");
      } else if (
        filters.custcd == null ||
        filters.custcd == "" ||
        filters.custcd == undefined
      ) {
        throw findMessage(messagesData, "MA_A2400W_005");
      } else if (
        filters.taxdiv == null ||
        filters.taxdiv == "" ||
        filters.taxdiv == undefined
      ) {
        throw findMessage(messagesData, "MA_A2400W_006");
      } else if (
        filters.pursts == null ||
        filters.pursts == "" ||
        filters.pursts == undefined
      ) {
        throw findMessage(messagesData, "MA_A2400W_007");
      } else {
        if (valid == true) {
          const dataItem = mainDataResult.data.filter((item: any) => {
            return (
              (item.rowstatus == "N" || item.rowstatus == "U") &&
              item.rowstatus !== undefined
            );
          });

          if (dataItem.length == 0 && deletedMainRows.length == 0) {
            setParaData((prev) => ({
              ...prev,
              workType: workType,
              amt: filters.amt,
              amtunit: filters.amtunit,
              attdatnum: filters.attdatnum,
              baseamt: filters.baseamt,
              custcd: filters.custcd,
              custnm: filters.custnm,
              custprsncd: filters.custprsncd,
              doexdiv: filters.doexdiv,
              files: filters.files,
              inexpdt: filters.inexpdt,
              location: sessionLocation,
              orgdiv: sessionOrgdiv,
              person: filters.person,
              purdt: filters.purdt,
              pursts: filters.pursts,
              purnum: filters.purnum,
              remark: filters.remark,
              taxdiv: filters.taxdiv,
              uschgrat: filters.uschgrat,
              wonchgrat: filters.wonchgrat,
              userid: userId,
              pc: pc,
              form_id: "MA_A2400W",
              serviceid: companyCode,
            }));
          } else {
            let dataArr: TdataArr = {
              rowstatus_s: [],
              purseq_s: [],
              itemcd_s: [],
              itemnm_s: [],
              insiz_s: [],
              qty_s: [],
              qtyunit_s: [],
              unitwgt_s: [],
              wgt_s: [],
              wgtunit_s: [],
              proccd_s: [],
              planno_s: [],
              planseq_s: [],
              unpcalmeth_s: [],
              unp_s: [],
              amt_s: [],
              wonamt_s: [],
              taxamt_s: [],
              remark_s: [],
            };

            dataItem.forEach((item: any, idx: number) => {
              const {
                amt = "",
                itemcd = "",
                itemnm = "",
                rowstatus = "",
                taxamt = "",
                unp = "",
                qty = "",
                qtyunit = "",
                wonamt = "",
                remark = "",
                purseq = "",
                insiz = "",
                unitwgt = "",
                wgt = "",
                wgtunit = "",
                proccd = "",
                planno = "",
                planseq = "",
                unpcalmeth = "",
              } = item;
              dataArr.rowstatus_s.push(rowstatus);
              dataArr.purseq_s.push(purseq == "" ? 0 : purseq);
              dataArr.itemcd_s.push(itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.insiz_s.push(insiz == undefined ? "" : insiz);
              dataArr.qty_s.push(qty == "" ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
              dataArr.wgt_s.push(wgt == "" ? 0 : wgt);
              dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
              dataArr.proccd_s.push(proccd == undefined ? "" : proccd);
              dataArr.planno_s.push(planno == undefined ? "" : planno);
              dataArr.planseq_s.push(planseq == "" ? 0 : planseq);
              dataArr.unpcalmeth_s.push(unpcalmeth == "" ? 0 : unpcalmeth);
              dataArr.unp_s.push(unp == "" ? 0 : unp);
              dataArr.amt_s.push(amt == "" ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
            });
            deletedMainRows.forEach((item: any, idx: number) => {
              const {
                amt = "",
                itemcd = "",
                itemnm = "",
                rowstatus = "",
                taxamt = "",
                unp = "",
                qty = "",
                qtyunit = "",
                wonamt = "",
                remark = "",
                purseq = "",
                insiz = "",
                unitwgt = "",
                wgt = "",
                wgtunit = "",
                proccd = "",
                planno = "",
                planseq = "",
                unpcalmeth = "",
              } = item;
              dataArr.rowstatus_s.push(rowstatus);
              dataArr.purseq_s.push(purseq == "" ? 0 : purseq);
              dataArr.itemcd_s.push(itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.insiz_s.push(insiz == undefined ? "" : insiz);
              dataArr.qty_s.push(qty == "" ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
              dataArr.wgt_s.push(wgt == "" ? 0 : wgt);
              dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
              dataArr.proccd_s.push(proccd == undefined ? "" : proccd);
              dataArr.planno_s.push(planno == undefined ? "" : planno);
              dataArr.planseq_s.push(planseq == "" ? 0 : planseq);
              dataArr.unpcalmeth_s.push(unpcalmeth == "" ? 0 : unpcalmeth);
              dataArr.unp_s.push(unp == "" ? 0 : unp);
              dataArr.amt_s.push(amt == "" ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
            });
            setParaData((prev) => ({
              ...prev,
              workType: workType,
              amt: filters.amt,
              amtunit: filters.amtunit,
              attdatnum: filters.attdatnum,
              baseamt: filters.baseamt,
              custcd: filters.custcd,
              custnm: filters.custnm,
              custprsncd: filters.custprsncd,
              doexdiv: filters.doexdiv,
              files: filters.files,
              inexpdt: filters.inexpdt,
              location: sessionLocation,
              orgdiv: sessionOrgdiv,
              person: filters.person,
              purdt: filters.purdt,
              pursts: filters.pursts,
              purnum: filters.purnum,
              remark: filters.remark,
              taxdiv: filters.taxdiv,
              uschgrat: filters.uschgrat,
              wonchgrat: filters.wonchgrat,
              userid: userId,
              pc: pc,
              form_id: "MA_A2400W",
              serviceid: companyCode,
              rowstatus_s: dataArr.rowstatus_s.join("|"),
              purseq_s: dataArr.purseq_s.join("|"),
              itemcd_s: dataArr.itemcd_s.join("|"),
              itemnm_s: dataArr.itemnm_s.join("|"),
              insiz_s: dataArr.insiz_s.join("|"),
              qty_s: dataArr.qty_s.join("|"),
              qtyunit_s: dataArr.qtyunit_s.join("|"),
              unitwgt_s: dataArr.unitwgt_s.join("|"),
              wgt_s: dataArr.wgt_s.join("|"),
              wgtunit_s: dataArr.wgtunit_s.join("|"),
              proccd_s: dataArr.proccd_s.join("|"),
              planno_s: dataArr.planno_s.join("|"),
              planseq_s: dataArr.planseq_s.join("|"),
              unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
              unp_s: dataArr.unp_s.join("|"),
              amt_s: dataArr.amt_s.join("|"),
              wonamt_s: dataArr.wonamt_s.join("|"),
              taxamt_s: dataArr.taxamt_s.join("|"),
              remark_s: dataArr.remark_s.join("|"),
            }));
          }
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    purnum: "",
    purdt: new Date(),
    pursts: "",
    inexpdt: new Date(),
    custcd: "",
    custnm: "",
    custprsncd: "",
    person: "admin",
    doexdiv: "A",
    taxdiv: "A",
    amtunit: "",
    baseamt: 0,
    wonchgrat: 0,
    uschgrat: 0,
    attdatnum: "",
    remark: "",
    rowstatus_s: "",
    purseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    insiz_s: "",
    qty_s: "",
    qtyunit_s: "",
    unitwgt_s: "",
    wgt_s: "",
    wgtunit_s: "",
    proccd_s: "",
    planno_s: "",
    planseq_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    remark_s: "",
    form_id: "MA_A2400W",
    serviceid: companyCode,
  });

  const para: Iparameters = {
    procedureName: "P_MA_A2400W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_purnum": ParaData.purnum,
      "@p_purdt": convertDateToStr(ParaData.purdt),
      "@p_pursts": ParaData.pursts,
      "@p_inexpdt": convertDateToStr(ParaData.inexpdt),
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_custprsncd": ParaData.custprsncd,
      "@p_person": ParaData.person,
      "@p_doexdiv": ParaData.doexdiv,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_amtunit": ParaData.amtunit,
      "@p_baseamt": ParaData.baseamt,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_uschgrat": ParaData.uschgrat,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_remark": ParaData.remark,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_purseq_s": ParaData.purseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_insiz_s": ParaData.insiz_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_wgt_s": ParaData.wgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_proccd_s": ParaData.proccd_s,
      "@p_planno_s": ParaData.planno_s,
      "@p_planseq_s": ParaData.planseq_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A2400W",
      "@p_company_code": companyCode,
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
      setUnsavedName([]);
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
        workType: "N",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        purnum: "",
        purdt: new Date(),
        pursts: "",
        inexpdt: new Date(),
        custcd: "",
        custnm: "",
        custprsncd: "",
        person: "admin",
        doexdiv: "A",
        taxdiv: "A",
        amtunit: "",
        baseamt: 0,
        wonchgrat: 0,
        uschgrat: 0,
        attdatnum: "",
        remark: "",
        rowstatus_s: "",
        purseq_s: "",
        itemcd_s: "",
        itemnm_s: "",
        insiz_s: "",
        qty_s: "",
        qtyunit_s: "",
        unitwgt_s: "",
        wgt_s: "",
        wgtunit_s: "",
        proccd_s: "",
        planno_s: "",
        planseq_s: "",
        unpcalmeth_s: "",
        unp_s: "",
        amt_s: "",
        wonamt_s: "",
        taxamt_s: "",
        remark_s: "",
        form_id: "MA_A2400W",
        serviceid: companyCode,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      (ParaData.rowstatus_s.length != 0 || ParaData.workType == "U") &&
      permissions.save
    ) {
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
      field != "proccd" &&
      field != "itemcd" &&
      field != "itemnm" &&
      field != "insiz" &&
      field != "totamt" &&
      field != "rowstatus"
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
        titles={workType == "N" ? "외주발주생성" : "외주발주정보"}
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
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="purdt"
                            value={filters.purdt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                            className="required"
                            placeholder=""
                          />
                        </div>
                      </td>
                      <th>입고예정일</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="inexpdt"
                            value={filters.inexpdt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                            placeholder=""
                          />
                        </div>
                      </td>
                      <th>내수구분</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="doexdiv"
                            value={filters.doexdiv}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            className="required"
                          />
                        )}
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
                          onChange={filterInputChange}
                          className="required"
                        />
                      </td>
                      <th>업체담당자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="custprsncd"
                            value={filters.custprsncd}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="prsnnm"
                            valueField="custprsncd"
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
                            className="required"
                          />
                        )}
                      </td>
                      <th>발주상태</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="pursts"
                            value={filters.pursts}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            className="required"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
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
                            className="required"
                          />
                        )}
                      </td>
                      <th>화폐단위</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="amtunit"
                            value={filters.amtunit}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                      <th>첨부파일</th>
                      <td colSpan={5}>
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
                      <th>원화환율</th>
                      <td>
                        <Input
                          name="wonchgrat"
                          type="number"
                          value={filters.wonchgrat}
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>대미환율</th>
                      <td>
                        <Input
                          name="uschgrat"
                          type="number"
                          value={filters.uschgrat}
                          onChange={filterInputChange}
                        />
                      </td>
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
                        onClick={onCopyWndClick}
                        icon="folder-open"
                        disabled={permissions.save ? false : true}
                      >
                        계획참조
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
                      enddt:
                        workType == "U" && isValidDate(row.enddt)
                          ? new Date(dateformat(row.enddt))
                          : new Date(),
                      proccd: proccdListData.find(
                        (item: any) => item.sub_code == row.proccd
                      )?.code_name,
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
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="proccd"
                    title="공정"
                    width="150px"
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="itemcd" title="품목코드" width="150px" />
                  <GridColumn field="itemnm" title="품목명" width="150px" />
                  <GridColumn field="insiz" title="규격" width="120px" />
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
                    field="unitwgt"
                    title="단량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="wgt"
                    title="발주중량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn field="wgtunit" title="중량단위" width="100px" />
                  <GridColumn
                    field="unpcalmeth"
                    title="계산방법"
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
                  <GridColumn field="remark" title="비고" width="300px" />
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
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="purdt"
                          value={filters.purdt}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          className="required"
                          placeholder=""
                        />
                      </div>
                    </td>
                    <th>입고예정일</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="inexpdt"
                          value={filters.inexpdt}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          placeholder=""
                        />
                      </div>
                    </td>
                    <th>내수구분</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="doexdiv"
                          value={filters.doexdiv}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          className="required"
                        />
                      )}
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
                        onChange={filterInputChange}
                        className="required"
                      />
                    </td>
                    <th>업체담당자</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="custprsncd"
                          value={filters.custprsncd}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          textField="prsnnm"
                          valueField="custprsncd"
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
                          className="required"
                        />
                      )}
                    </td>
                    <th>발주상태</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="pursts"
                          value={filters.pursts}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          className="required"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
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
                          className="required"
                        />
                      )}
                    </td>
                    <th>화폐단위</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="amtunit"
                          value={filters.amtunit}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                        />
                      )}
                    </td>
                    <th>첨부파일</th>
                    <td colSpan={5}>
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
                    <th>원화환율</th>
                    <td>
                      <Input
                        name="wonchgrat"
                        type="number"
                        value={filters.wonchgrat}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>대미환율</th>
                    <td>
                      <Input
                        name="uschgrat"
                        type="number"
                        value={filters.uschgrat}
                        onChange={filterInputChange}
                      />
                    </td>
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
                    onClick={onCopyWndClick}
                    icon="folder-open"
                    disabled={permissions.save ? false : true}
                  >
                    계획참조
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
                    enddt:
                      workType == "U" && isValidDate(row.enddt)
                        ? new Date(dateformat(row.enddt))
                        : new Date(),
                    proccd: proccdListData.find(
                      (item: any) => item.sub_code == row.proccd
                    )?.code_name,
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
                <GridColumn field="rowstatus" title=" " width="50px" />
                <GridColumn
                  field="proccd"
                  title="공정"
                  width="150px"
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn field="itemcd" title="품목코드" width="150px" />
                <GridColumn field="itemnm" title="품목명" width="150px" />
                <GridColumn field="insiz" title="규격" width="120px" />
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
                  field="unitwgt"
                  title="단량"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="wgt"
                  title="발주중량"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn field="wgtunit" title="중량단위" width="100px" />
                <GridColumn
                  field="unpcalmeth"
                  title="계산방법"
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
                <GridColumn field="remark" title="비고" width="300px" />
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
        <CopyWindow2
          setVisible={setCopyWindowVisible}
          setData={setCopyData}
          pathname={pathname}
        />
      )}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
    </>
  );
};

export default CopyWindow;
