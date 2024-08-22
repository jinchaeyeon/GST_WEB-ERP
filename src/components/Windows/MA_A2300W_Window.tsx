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
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  numberWithCommas,
  setDefaultDate,
  toDate
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../Renderers/Renderers";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import CopyWindow1 from "./MA_A2300W_Order_Window";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};

type TdataArr = {
  rowstatus_s: string[];
  seq2_s: string[];
  pac_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  insiz_s: string[];
  itemacnt_s: string[];
  lotnum_s: string[];
  serialno_s: string[];
  heatno_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  unitwgt_s: string[];
  totwgt_s: string[];
  wgtunit_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  wonamt_s: string[];
  dlramt_s: string[];
  taxamt_s: string[];
  remark_s: string[];
  load_place_s: string[];
  purnum_s: string[];
  purseq_s: string[];
};

type Idata = {
  amt: number;
  amtunit: string;
  attdatnum: string;
  baseamt: number;
  custcd: string;
  custnm: string;
  dlramt: number;
  doexdiv: string;
  files: string;
  indt: string;
  inqty: number;
  location: string;
  num: number;
  orgdiv: string;
  person: string;
  position: string;
  recdt: string;
  reckey: string;
  remark: string;
  seq1: number;
  taxamt: number;
  taxdiv: string;
  taxnum: string;
  totamt: number;
  uschgrat: number;
  wonamt: number;
  wonchgrat: number;
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
let deletedMainRows: object[] = [];
let temp = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA019,L_BA015,L_BA061,L_BA016,L_LOADPLACE",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "unpcalmeth"
      ? "L_BA019"
      : field == "qtyunit"
      ? "L_BA015"
      : field == "wgtunit"
      ? "L_BA015"
      : field == "itemacnt"
      ? "L_BA061"
      : field == "PAC"
      ? "L_BA016"
      : field == "load_place"
      ? "L_LOADPLACE"
      : "";
  const bizComponent = bizComponentData?.find(
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
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const pc = UseGetValueFromSessionItem("pc");

  const companyCode = loginResult ? loginResult.companyCode : "";
  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        position: defaultOption.find((item: any) => item.id == "position")
          ?.valueCode,
        indt: setDefaultDate(customOptionData, "indt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061, L_BA005,L_BA029,L_BA020",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
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
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
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
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
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
    temp = 0;
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    setVisible(false);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    reckey: "",
    indt: new Date(),
    person: "",
    amtunit: "",
    location: "",
    custcd: "",
    custnm: "",
    doexdiv: "",
    wonchgrat: 0,
    position: "",
    files: "",
    attdatnum: "",
    taxdiv: "",
    uschgrat: 0,
    remark: "",
    purnum: "",
    itemcd: "",
    itemnm: "",
    lotnum: "",
    taxyn: "",
    recdt: "",
    seq1: 0,
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_MA_A2300W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(new Date()),
        "@p_todt": convertDateToStr(new Date()),
        "@p_position": filters.position,
        "@p_doexdiv": filters.doexdiv,
        "@p_purnum": filters.purnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_person": filters.person,
        "@p_lotnum": filters.lotnum,
        "@p_taxyn": filters.taxyn,
        "@p_recdt": filters.recdt,
        "@p_seq1": filters.seq1,
        "@p_company_code": "",
      },
    };
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
        amtunit: data.amtunit,
        attdatnum: data.attdatnum,
        custcd: data.custcd,
        custnm: data.custnm,
        doexdiv: data.doexdiv,
        files: data.files,
        indt: toDate(data.indt),
        location: data.location,
        person: data.person,
        position: data.position,
        recdt: data.recdt,
        reckey: data.reckey,
        remark: data.remark,
        seq1: data.seq1,
        taxdiv: data.taxdiv,
        wonchgrat: data.wonchgrat,
        uschgrat: data.uschgrat,
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

    if (mainDataResult.total > 0) {
      mainDataResult.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });
    }

    const rows = data.map((row: any) => {
      return {
        ...row,
        totamt: 0,
        num: ++temp,
        rowstatus: "N",
      };
    });

    if (filters.custcd == "") {
      setFilters((item: any) => ({
        ...item,
        custcd: rows[0].custcd,
        custnm: rows[0].custnm,
        doexdiv: "A",
        taxdiv: "A",
        amtunit: "KRW",
      }));
    }

    try {
      rows.map((item: any) => {
        setMainDataResult((prev) => {
          return {
            data: [item, ...prev.data],
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
      <td colSpan={props.colSpan} style={props.style} {...props}>
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

    if (valid == true) {
      if (mainDataResult.data.length == 0) {
        alert("데이터가 없습니다.");
        return false;
      } else if (
        convertDateToStr(filters.indt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.indt).substring(6, 8) > "31" ||
        convertDateToStr(filters.indt).substring(6, 8) < "01" ||
        convertDateToStr(filters.indt).substring(6, 8).length != 2
      ) {
        alert("날짜를 선택해주세요.");
        return false;
      } else if (
        filters.person == null ||
        filters.person == "" ||
        filters.person == undefined
      ) {
        alert("필수값을 입력해주세요.");
        return false;
      } else if (
        filters.location == null ||
        filters.location == "" ||
        filters.location == undefined
      ) {
        alert("필수값을 입력해주세요.");
        return false;
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
              recdt: filters.recdt,
              seq1: filters.seq1,
              indt: filters.indt,
              custcd: filters.custcd,
              custnm: filters.custnm,
              person: filters.person,
              remark: filters.remark,
              doexdiv: filters.doexdiv,
              taxdiv: filters.taxdiv,
              location: filters.location,
              position: filters.position,
              amtunit: filters.amtunit,
              baseamt: 0,
              wonchgrat: filters.wonchgrat,
              uschgrat: filters.uschgrat,
              attdatnum: filters.attdatnum,
              files: filters.files,
            }));
          } else {
            let dataArr: TdataArr = {
              rowstatus_s: [],
              seq2_s: [],
              pac_s: [],
              itemcd_s: [],
              itemnm_s: [],
              insiz_s: [],
              itemacnt_s: [],
              lotnum_s: [],
              serialno_s: [],
              heatno_s: [],
              qty_s: [],
              qtyunit_s: [],
              unitwgt_s: [],
              totwgt_s: [],
              wgtunit_s: [],
              unpcalmeth_s: [],
              unp_s: [],
              amt_s: [],
              wonamt_s: [],
              dlramt_s: [],
              taxamt_s: [],
              remark_s: [],
              load_place_s: [],
              purnum_s: [],
              purseq_s: [],
            };
            dataItem.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                seq2 = "",
                PAC = "",
                itemcd = "",
                itemnm = "",
                insiz = "",
                itemacnt = "",
                lotnum = "",
                serialno = "",
                heatno = "",
                qty = "",
                qtyunit = "",
                unitwgt = "",
                totwgt = "",
                wgtunit = "",
                unpcalmeth = "",
                unp = "",
                amt = "",
                wonamt = "",
                dlramt = "",
                taxamt = "",
                remark = "",
                load_place = "",
                purnum = "",
                purseq = "",
              } = item;
              const itemacnts =
                itemacntListData.find((item: any) => item.code_name == itemacnt)
                  ?.sub_code == undefined
                  ? ""
                  : itemacntListData.find(
                      (item: any) => item.code_name == itemacnt
                    )?.sub_code;
              dataArr.rowstatus_s.push(rowstatus);
              dataArr.seq2_s.push(seq2 == undefined || seq2 == "" ? 0 : seq2);
              dataArr.pac_s.push(PAC == undefined ? "" : PAC);
              dataArr.itemcd_s.push(itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.insiz_s.push(insiz == undefined ? "" : insiz);
              dataArr.itemacnt_s.push(itemacnts == undefined ? "" : itemacnts);
              dataArr.lotnum_s.push(lotnum == undefined ? "" : lotnum);
              dataArr.serialno_s.push(serialno == undefined ? "" : serialno);
              dataArr.heatno_s.push(heatno == undefined ? "" : heatno);
              dataArr.qty_s.push(qty == undefined ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.unitwgt_s.push(unitwgt == undefined ? 0 : unitwgt);
              dataArr.totwgt_s.push(totwgt == undefined ? 0 : totwgt);
              dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
              dataArr.unpcalmeth_s.push(
                unpcalmeth == undefined ? "" : unpcalmeth
              );
              dataArr.unp_s.push(unp == undefined ? 0 : unp);
              dataArr.amt_s.push(amt == undefined ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.dlramt_s.push(
                dlramt == undefined || dlramt == "" ? 0 : dlramt
              );
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
              dataArr.load_place_s.push(
                load_place == undefined ? "" : load_place
              );
              dataArr.purnum_s.push(purnum == undefined ? "" : purnum);
              dataArr.purseq_s.push(
                purseq == undefined || purseq == "" ? 0 : purseq
              );
            });
            deletedMainRows.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                seq2 = "",
                PAC = "",
                itemcd = "",
                itemnm = "",
                insiz = "",
                itemacnt = "",
                lotnum = "",
                serialno = "",
                heatno = "",
                qty = "",
                qtyunit = "",
                unitwgt = "",
                totwgt = "",
                wgtunit = "",
                unpcalmeth = "",
                unp = "",
                amt = "",
                wonamt = "",
                dlramt = "",
                taxamt = "",
                remark = "",
                load_place = "",
                purnum = "",
                purseq = "",
              } = item;
              dataArr.rowstatus_s.push(rowstatus);
              dataArr.seq2_s.push(seq2 == undefined || seq2 == "" ? 0 : seq2);
              dataArr.pac_s.push(PAC == undefined ? "" : PAC);
              dataArr.itemcd_s.push(itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.insiz_s.push(insiz == undefined ? "" : insiz);
              dataArr.itemacnt_s.push(itemacnt == undefined ? "" : itemacnt);
              dataArr.lotnum_s.push(lotnum == undefined ? "" : lotnum);
              dataArr.serialno_s.push(serialno == undefined ? "" : serialno);
              dataArr.heatno_s.push(heatno == undefined ? "" : heatno);
              dataArr.qty_s.push(qty == undefined ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.unitwgt_s.push(unitwgt == undefined ? 0 : unitwgt);
              dataArr.totwgt_s.push(totwgt == undefined ? 0 : totwgt);
              dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
              dataArr.unpcalmeth_s.push(
                unpcalmeth == undefined ? "" : unpcalmeth
              );
              dataArr.unp_s.push(unp == undefined ? 0 : unp);
              dataArr.amt_s.push(amt == undefined ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.dlramt_s.push(
                dlramt == undefined || dlramt == "" ? 0 : dlramt
              );
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
              dataArr.load_place_s.push(
                load_place == undefined ? "" : load_place
              );
              dataArr.purnum_s.push(purnum == undefined ? "" : purnum);
              dataArr.purseq_s.push(
                purseq == undefined || purseq == "" ? 0 : purseq
              );
            });
            setParaData((prev) => ({
              ...prev,
              workType: workType,
              recdt: filters.recdt,
              seq1: filters.seq1,
              indt: filters.indt,
              custcd: filters.custcd,
              custnm: filters.custnm,
              person: filters.person,
              remark: filters.remark,
              doexdiv: filters.doexdiv,
              taxdiv: filters.taxdiv,
              location: filters.location,
              position: filters.position,
              amtunit: filters.amtunit,
              baseamt: 0,
              wonchgrat: filters.wonchgrat,
              uschgrat: filters.uschgrat,
              attdatnum: filters.attdatnum,
              files: filters.files,
              rowstatus_s: dataArr.rowstatus_s.join("|"),
              seq2_s: dataArr.seq2_s.join("|"),
              pac_s: dataArr.pac_s.join("|"),
              itemcd_s: dataArr.itemcd_s.join("|"),
              itemnm_s: dataArr.itemnm_s.join("|"),
              insiz_s: dataArr.insiz_s.join("|"),
              itemacnt_s: dataArr.itemacnt_s.join("|"),
              lotnum_s: dataArr.lotnum_s.join("|"),
              serialno_s: dataArr.serialno_s.join("|"),
              heatno_s: dataArr.heatno_s.join("|"),
              qty_s: dataArr.qty_s.join("|"),
              qtyunit_s: dataArr.qtyunit_s.join("|"),
              unitwgt_s: dataArr.unitwgt_s.join("|"),
              totwgt_s: dataArr.totwgt_s.join("|"),
              wgtunit_s: dataArr.wgtunit_s.join("|"),
              unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
              unp_s: dataArr.unp_s.join("|"),
              amt_s: dataArr.amt_s.join("|"),
              wonamt_s: dataArr.wonamt_s.join("|"),
              dlramt_s: dataArr.dlramt_s.join("|"),
              taxamt_s: dataArr.taxamt_s.join("|"),
              remark_s: dataArr.remark_s.join("|"),
              load_place_s: dataArr.load_place_s.join("|"),
              purnum_s: dataArr.purnum_s.join("|"),
              purseq_s: dataArr.purseq_s.join("|"),
            }));
          }
        }
      }
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    recdt: "",
    seq1: 0,
    indt: new Date(),
    custcd: "",
    custnm: "",
    person: "",
    remark: "",
    doexdiv: "",
    taxdiv: "",
    location: "",
    position: "",
    amtunit: "",
    baseamt: 0,
    wonchgrat: 0,
    uschgrat: 0,
    attdatnum: "",
    files: "",
    rowstatus_s: "",
    seq2_s: "",
    pac_s: "",
    itemcd_s: "",
    itemnm_s: "",
    insiz_s: "",
    itemacnt_s: "",
    lotnum_s: "",
    serialno_s: "",
    heatno_s: "",
    qty_s: "",
    qtyunit_s: "",
    unitwgt_s: "",
    totwgt_s: "",
    wgtunit_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    wonamt_s: "",
    dlramt_s: "",
    taxamt_s: "",
    remark_s: "",
    load_place_s: "",
    purnum_s: "",
    purseq_s: "",
    userid: userId,
    pc: pc,
    form_id: "MA_A2300W",
  });

  const para: Iparameters = {
    procedureName: "P_MA_A2300W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_recdt": ParaData.recdt,
      "@p_seq1": ParaData.seq1,
      "@p_indt": convertDateToStr(ParaData.indt),
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_person": ParaData.person,
      "@p_remark": ParaData.remark,
      "@p_doexdiv": ParaData.doexdiv,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_amtunit": ParaData.amtunit,
      "@p_baseamt": ParaData.baseamt,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_uschgrat": ParaData.uschgrat,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_pac_s": ParaData.pac_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_insiz_s": ParaData.insiz_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_serialno_s": ParaData.serialno_s,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_totwgt_s": ParaData.totwgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_dlramt_s": ParaData.dlramt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_purnum_s": ParaData.purnum_s,
      "@p_purseq_s": ParaData.purseq_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A2300W",
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
        recdt: "",
        seq1: 0,
        indt: new Date(),
        custcd: "",
        custnm: "",
        person: "",
        remark: "",
        doexdiv: "",
        taxdiv: "",
        location: "",
        position: "",
        amtunit: "",
        baseamt: 0,
        wonchgrat: 0,
        uschgrat: 0,
        attdatnum: "",
        files: "",
        rowstatus_s: "",
        seq2_s: "",
        pac_s: "",
        itemcd_s: "",
        itemnm_s: "",
        insiz_s: "",
        itemacnt_s: "",
        lotnum_s: "",
        serialno_s: "",
        heatno_s: "",
        qty_s: "",
        qtyunit_s: "",
        unitwgt_s: "",
        totwgt_s: "",
        wgtunit_s: "",
        unpcalmeth_s: "",
        unp_s: "",
        amt_s: "",
        wonamt_s: "",
        dlramt_s: "",
        taxamt_s: "",
        remark_s: "",
        load_place_s: "",
        purnum_s: "",
        purseq_s: "",
        userid: userId,
        pc: pc,
        form_id: "MA_A2300W",
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
      (ParaData.rowstatus_s.length != 0 || ParaData.person != "") &&
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
      field != "itemnm" &&
      field != "itemcd" &&
      field != "insiz" &&
      field != "amt" &&
      field != "totamt" &&
      field != "wonamt" &&
      field != "taxamt" &&
      field != "rowstatus" &&
      field != "ordkey"
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

      setTempResult((prev: { total: any }) => {
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
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item: any) =>
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
              taxamt:
                filters.amtunit == "KRW"
                  ? (item.qty * item.unp) / 10
                  : (item.qty * item.unp * filters.wonchgrat) / 10,
              totamt:
                filters.amtunit == "KRW"
                  ? Math.round(item.qty * item.unp + (item.qty * item.unp) / 10)
                  : Math.round(
                      item.qty * item.unp * filters.wonchgrat +
                        (item.qty * item.unp * filters.wonchgrat) / 10
                    ),
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
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
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
        titles={workType == "N" ? "자재입고생성" : "자재입고정보"}
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
                      <th>입고번호</th>
                      <td>
                        <Input
                          name="reckey"
                          type="text"
                          value={filters.reckey}
                          className="readonly"
                        />
                      </td>
                      <th>입고일자</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="indt"
                            value={filters.indt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                            className="required"
                            placeholder=""
                          />
                        </div>
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
                            className="required"
                          />
                        )}
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
                          className="readonly"
                        />
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
                      <th>원화환율</th>
                      <td>
                        <Input
                          name="wonchgrat"
                          type="number"
                          value={filters.wonchgrat}
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
                    </tr>
                    <tr>
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
                      <th>대미환율</th>
                      <td>
                        <Input
                          name="uschgrat"
                          type="number"
                          value={filters.uschgrat}
                          onChange={filterInputChange}
                        />
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
                        onClick={onCopyWndClick}
                        icon="folder-open"
                        disabled={permissions.save ? false : true}
                      >
                        발주
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
                    field="PAC"
                    title="도/사급"
                    width="150px"
                    cell={CustomComboBoxCell}
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="itemcd" title="품목코드" width="150px" />
                  <GridColumn field="itemnm" title="품목명" width="150px" />
                  <GridColumn field="insiz" title="규격" width="120px" />
                  <GridColumn
                    field="itemacnt"
                    title="품목계정"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn field="lotnum" title="LOT NO" width="120px" />
                  <GridColumn
                    field="load_place"
                    title="적재장소"
                    width="100px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="qty"
                    title="수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                    headerCell={RequiredHeader}
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
                    field="totwgt"
                    title="총중량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="wgtunit"
                    title="중량단위"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="unpcalmeth"
                    title="단가산정방법"
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
                    field="dlramt"
                    title="달러금액"
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
                  <GridColumn field="remark" title="비고" width="280px" />
                  <GridColumn field="purkey" title="발주번호" width="150px" />
                  <GridColumn field="reckey" title="입고번호" width="150px" />
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
            {" "}
            <FormBoxWrap className="WindowFormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th>입고번호</th>
                    <td>
                      <Input
                        name="reckey"
                        type="text"
                        value={filters.reckey}
                        className="readonly"
                      />
                    </td>
                    <th>입고일자</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="indt"
                          value={filters.indt}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          className="required"
                          placeholder=""
                        />
                      </div>
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
                          className="required"
                        />
                      )}
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
                        className="readonly"
                      />
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
                    <th>원화환율</th>
                    <td>
                      <Input
                        name="wonchgrat"
                        type="number"
                        value={filters.wonchgrat}
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
                  </tr>
                  <tr>
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
                    <th>대미환율</th>
                    <td>
                      <Input
                        name="uschgrat"
                        type="number"
                        value={filters.uschgrat}
                        onChange={filterInputChange}
                      />
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
                    onClick={onCopyWndClick}
                    icon="folder-open"
                    disabled={permissions.save ? false : true}
                  >
                    발주
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
                  field="PAC"
                  title="도/사급"
                  width="150px"
                  cell={CustomComboBoxCell}
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn field="itemcd" title="품목코드" width="150px" />
                <GridColumn field="itemnm" title="품목명" width="150px" />
                <GridColumn field="insiz" title="규격" width="120px" />
                <GridColumn
                  field="itemacnt"
                  title="품목계정"
                  width="120px"
                  cell={CustomComboBoxCell}
                />
                <GridColumn field="lotnum" title="LOT NO" width="120px" />
                <GridColumn
                  field="load_place"
                  title="적재장소"
                  width="100px"
                  cell={CustomComboBoxCell}
                />
                <GridColumn
                  field="qty"
                  title="수량"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                  headerCell={RequiredHeader}
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
                  field="totwgt"
                  title="총중량"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="wgtunit"
                  title="중량단위"
                  width="120px"
                  cell={CustomComboBoxCell}
                />
                <GridColumn
                  field="unpcalmeth"
                  title="단가산정방법"
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
                  field="dlramt"
                  title="달러금액"
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
                <GridColumn field="remark" title="비고" width="280px" />
                <GridColumn field="purkey" title="발주번호" width="150px" />
                <GridColumn field="reckey" title="입고번호" width="150px" />
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
      {CopyWindowVisible && (
        <CopyWindow1
          setVisible={setCopyWindowVisible}
          setData={setCopyData}
          custcd={filters.custcd == undefined ? "" : filters.custcd}
          custnm={filters.custnm == undefined ? "" : filters.custnm}
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
