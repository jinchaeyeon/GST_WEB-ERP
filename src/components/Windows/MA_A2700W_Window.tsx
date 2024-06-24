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
import {
  Input,
  InputChangeEvent,
  TextArea,
} from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInGridInput,
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
import DateCell from "../Cells/DateCell";
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
  getItemQuery,
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
import RequiredHeader from "../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CopyWindow2 from "./BA_A0080W_Copy_Window";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import CopyWindow5 from "./MA_A2700W_BOM_Window";
import CopyWindow4 from "./MA_A2700W_Orders_Window";
import CopyWindow3 from "./MA_A3400W_Inven_Window";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};

export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

type TdataArr = {
  rowstatus_s: string[];
  itemgrade_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  itemacnt_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  unitwgt_s: string[];
  wgtunit_s: string[];
  len_s: string[];
  itemthick_s: string[];
  width_s: string[];
  unpcalmeth_s: string[];
  UNPFACTOR_s: string[];
  unp_s: string[];
  amt_s: string[];
  dlramt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  maker_s: string[];
  usegb_s: string[];
  spec_s: string[];
  badcd_s: string[];
  BADTEMP_s: string[];
  poregnum_s: string[];
  lcno_s: string[];
  heatno_s: string[];
  SONGNO_s: string[];
  projectno_s: string[];
  lotnum_s: string[];
  orglot_s: string[];
  boxno_s: string[];
  PRTNO_s: string[];
  account_s: string[];
  qcnum_s: string[];
  qcseq_s: string[];
  APPNUM_s: string[];
  seq2_s: string[];
  totwgt_s: string[];
  purnum_s: string[];
  purseq_s: string[];
  ordnum_s: string[];
  ordseq_s: string[];
  remark_s: string[];
  load_place_s: string[];
  pac_s: string[];
  itemlvl1_s: string[];
  enddt_s: string[];
  extra_field1_s: string[];
};
type TItemInfo = {
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
};

const defaultItemInfo = {
  itemcd: "",
  itemno: "",
  itemnm: "",
  insiz: "",
  model: "",
  itemacnt: "",
  itemacntnm: "",
  bnatur: "",
  spec: "",
  invunit: "",
  invunitnm: "",
  unitwgt: "",
  wgtunit: "",
  wgtunitnm: "",
  maker: "",
  dwgno: "",
  remark: "",
  itemlvl1: "",
  itemlvl2: "",
  itemlvl3: "",
  extra_field1: "",
  extra_field2: "",
  extra_field7: "",
  extra_field6: "",
  extra_field8: "",
  packingsiz: "",
  unitqty: "",
  color: "",
  gubun: "",
  qcyn: "",
  outside: "",
  itemthick: "",
  itemlvl4: "",
  itemlvl5: "",
  custitemnm: "",
};

type Idata = {
  orgdiv: string;
  recdt: string;
  seq1: number;
  location: string;
  position: string;
  doexdiv: string;
  amtunit: string;
  intype: string;
  inuse: string;
  inoutdiv: string;
  indt: string;
  custcd: string;
  custnm: string;
  rcvcustcd: string;
  rcvcustnm: string;
  taxdiv: string;
  taxloca: string;
  taxtype: string;
  taxnum: string;
  taxdt: string;
  person: string;
  attdatnum: string;
  remark: string;
  baseamt: number;
  importnum: string;
  auto_transfer: string;
  pac: string;
  recnum: string;
  files: string;
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

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const { setItemInfo } = useContext(FormContext);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };

  const [itemWindowVisible2, setItemWindowVisible2] = useState<boolean>(false);

  const onItemWndClick2 = () => {
    setItemWindowVisible2(true);
  };

  const setItemData2 = (data: IItemData) => {
    const {
      itemcd,
      itemno,
      itemnm,
      insiz,
      model,
      itemacnt,
      itemacntnm,
      bnatur,
      spec,
      invunit,
      invunitnm,
      unitwgt,
      wgtunit,
      wgtunitnm,
      maker,
      dwgno,
      remark,
      itemlvl1,
      itemlvl2,
      itemlvl3,
      extra_field1,
      extra_field2,
      extra_field7,
      extra_field6,
      extra_field8,
      packingsiz,
      unitqty,
      color,
      gubun,
      qcyn,
      outside,
      itemthick,
      itemlvl4,
      itemlvl5,
      custitemnm,
    } = data;
    setItemInfo({
      itemcd,
      itemno,
      itemnm,
      insiz,
      model,
      itemacnt,
      itemacntnm,
      bnatur,
      spec,
      invunit,
      invunitnm,
      unitwgt,
      wgtunit,
      wgtunitnm,
      maker,
      dwgno,
      remark,
      itemlvl1,
      itemlvl2,
      itemlvl3,
      extra_field1,
      extra_field2,
      extra_field7,
      extra_field6,
      extra_field8,
      packingsiz,
      unitqty,
      color,
      gubun,
      qcyn,
      outside,
      itemthick,
      itemlvl4,
      itemlvl5,
      custitemnm,
    });
  };
  //BA_A0080W에만 사용
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onItemWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {itemWindowVisible2 && (
        <ItemsWindow
          setVisible={setItemWindowVisible2}
          workType={"ROW_ADD"}
          setData={setItemData2}
        />
      )}
    </>
  );
};

let deletedMainRows: object[] = [];
let temp = 0;
const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA016, L_BA171, L_BA061,L_BA015", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "pac"
      ? "L_BA016"
      : field == "itemlvl1"
      ? "L_BA171"
      : field == "qtyunit"
      ? "L_BA015"
      : field == "itemacnt"
      ? "L_BA061"
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
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  const DATA_ITEM_KEY = "num";
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA015",
    //사용자, 공정
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData != null) {
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
    }
  }, [bizComponentData]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        position: defaultOption.find((item: any) => item.id == "position")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        doexdiv: defaultOption.find((item: any) => item.id == "doexdiv")
          ?.valueCode,
        taxdiv: defaultOption.find((item: any) => item.id == "taxdiv")
          ?.valueCode,
        auto_transfer: defaultOption.find(
          (item: any) => item.id == "auto_transfer"
        )?.valueCode,
        inuse: defaultOption.find((item: any) => item.id == "inuse")?.valueCode,
        amtunit: defaultOption.find((item: any) => item.id == "amtunit")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

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
  const [CopyWindowVisible2, setCopyWindowVisible2] = useState<boolean>(false);
  const [CopyWindowVisible3, setCopyWindowVisible3] = useState<boolean>(false);
  const [CopyWindowVisible4, setCopyWindowVisible4] = useState<boolean>(false);

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            chlditemcd: itemInfo.itemcd,
            chlditemnm: itemInfo.itemnm,
            itemcd: itemInfo.itemcd,
            itemno: itemInfo.itemno,
            itemnm: itemInfo.itemnm,
            itemacnt: itemInfo.itemacnt,
            insiz: itemInfo.insiz,
            model: itemInfo.model,
            bnatur: itemInfo.bnatur,
            spec: itemInfo.spec,
            //invunit
            qtyunit: itemInfo.invunit,
            invunitnm: itemInfo.invunitnm,
            unitwgt: itemInfo.unitwgt,
            wgtunit: itemInfo.wgtunit,
            wgtunitnm: itemInfo.wgtunitnm,
            maker: itemInfo.maker,
            dwgno: itemInfo.dwgno,
            remark: itemInfo.remark,
            itemlvl1: itemInfo.itemlvl1,
            itemlvl2: itemInfo.itemlvl2,
            itemlvl3: itemInfo.itemlvl3,
            extra_field1: itemInfo.extra_field1,
            extra_field2: itemInfo.extra_field2,
            extra_field7: itemInfo.extra_field7,
            extra_field6: itemInfo.extra_field6,
            extra_field8: itemInfo.extra_field8,
            packingsiz: itemInfo.packingsiz,
            unitqty: itemInfo.unitqty,
            color: itemInfo.color,
            gubun: itemInfo.gubun,
            qcyn: itemInfo.qcyn,
            outside: itemInfo.outside,
            itemthick: itemInfo.itemthick,
            itemlvl4: itemInfo.itemlvl4,
            itemlvl5: itemInfo.itemlvl5,
            custitemnm: itemInfo.custitemnm,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
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
  }, [itemInfo]);

  const fetchItemData = React.useCallback(
    async (itemcd: string) => {
      if (!permissions.view) return;
      let data: any;
      const queryStr = getItemQuery({ itemcd: itemcd, itemnm: "" });
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

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const {
            itemcd,
            itemno,
            itemnm,
            insiz,
            model,
            itemacnt,
            itemacntnm,
            bnatur,
            spec,
            invunit,
            invunitnm,
            unitwgt,
            wgtunit,
            wgtunitnm,
            maker,
            dwgno,
            remark,
            itemlvl1,
            itemlvl2,
            itemlvl3,
            extra_field1,
            extra_field2,
            extra_field7,
            extra_field6,
            extra_field8,
            packingsiz,
            unitqty,
            color,
            gubun,
            qcyn,
            outside,
            itemthick,
            itemlvl4,
            itemlvl5,
            custitemnm,
          } = rows[0];
          setItemInfo({
            itemcd,
            itemno,
            itemnm,
            insiz,
            model,
            itemacnt,
            itemacntnm,
            bnatur,
            spec,
            invunit,
            invunitnm,
            unitwgt,
            wgtunit,
            wgtunitnm,
            maker,
            dwgno,
            remark,
            itemlvl1,
            itemlvl2,
            itemlvl3,
            extra_field1,
            extra_field2,
            extra_field7,
            extra_field6,
            extra_field8,
            packingsiz,
            unitqty,
            color,
            gubun,
            qcyn,
            outside,
            itemthick,
            itemlvl4,
            itemlvl5,
            custitemnm,
          });
        } else {
          const newData = mainDataResult.data.map((item: any) =>
            item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
              ? {
                  ...item,
                  chlditemcd: item.itemcd,
                  chlditemnm: "",
                  itemcd: "",
                  itemno: "",
                  itemnm: "",
                  insiz: "",
                  model: "",
                  itemacnt: "",
                  itemacntnm: "",
                  bnatur: "",
                  spec: "",
                  invunit: "",
                  invunitnm: "",
                  unitwgt: "",
                  wgtunit: "",
                  wgtunitnm: "",
                  maker: "",
                  dwgno: "",
                  remark: "",
                  itemlvl1: "",
                  itemlvl2: "",
                  itemlvl3: "",
                  extra_field1: "",
                  extra_field2: "",
                  extra_field7: "",
                  extra_field6: "",
                  extra_field8: "",
                  packingsiz: "",
                  unitqty: "",
                  color: "",
                  gubun: "",
                  qcyn: "",
                  outside: "",
                  itemthick: "",
                  itemlvl4: "",
                  itemlvl5: "",
                  custitemnm: "",
                  [EDIT_FIELD]: undefined,
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
      }
    },
    [mainDataResult]
  );

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
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    recdt: new Date(),
    seq1: 0,
    location: sessionLocation,
    position: "",
    doexdiv: "A",
    amtunit: "KRW",
    intype: "",
    inuse: "10",
    inoutdiv: "",
    indt: new Date(),
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    userid: userId,
    pc: pc,
    taxdiv: "A",
    taxloca: "",
    taxtype: "",
    taxnum: "",
    taxdt: "",
    person: "admin",
    attdatnum: "",
    remark: "",
    baseamt: 0,
    importnum: "",
    auto_transfer: "A",
    pac: "",
    rowstatus_s: "",
    itemgrade_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    qty_s: "",
    qtyunit_s: "",
    unitwgt_s: "",
    wgtunit_s: "",
    len_s: "",
    itemthick_s: "",
    width_s: "",
    unpcalmeth_s: "",
    UNPFACTOR_s: "",
    unp_s: "",
    amt_s: "",
    dlramt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    maker_s: "",
    usegb_s: "",
    spec_s: "",
    badcd_s: "",
    BADTEMP_s: "",
    poregnum_s: "",
    lcno_s: "",
    heatno_s: "",
    SONGNO_s: "",
    projectno_s: "",
    lotnum_s: "",
    orglot_s: "",
    boxno_s: "",
    PRTNO_s: "",
    account_s: "",
    qcnum_s: "",
    qcseq_s: "",
    APPNUM_s: "",
    seq2_s: "",
    totwgt_s: "",
    purnum_s: "",
    purseq_s: "",
    ordnum_s: "",
    ordseq_s: "",
    remark_s: "",
    load_place_s: "",
    pac_s: "",
    itemlvl1_s: "",
    enddt_s: "",
    extra_field1_s: "",
    form_id: "MA_A2700W",
    serviceid: companyCode,
    reckey: "",
    files: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    const parameters: Iparameters = {
      procedureName: "P_MA_A2700W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_recdt": convertDateToStr(filters.recdt),
        "@p_seq1": filters.seq1,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_finyn": "",
        "@p_doexdiv": filters.doexdiv,
        "@p_inuse": filters.inuse,
        "@p_person": filters.person,
        "@p_lotnum": "",
        "@p_remark": filters.remark,
        "@p_pursiz": "",
        "@p_seq2_s": "",
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

  const onCopyClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const selectRow = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amt: selectRow.amt,
      amtunit: selectRow.amtunit,
      chk: selectRow.chk,
      custcd: selectRow.custcd,
      custnm: selectRow.custnm,
      enddt: selectRow.enddt,
      insiz: selectRow.insiz,
      itemacnt: selectRow.itemacnt,
      itemcd: selectRow.itemcd,
      itemlvl1: selectRow.itemlvl1,
      itemlvl2: selectRow.itemlvl2,
      itemlvl3: selectRow.itemlvl3,
      itemnm: selectRow.itemnm,
      itemno: selectRow.itemno,
      itemthick: selectRow.itemthick,
      len: selectRow.len,
      lev: selectRow.lev,
      lotnum: selectRow.lotnum,
      need_qty: selectRow.need_qty,
      needqty: selectRow.needqty,
      nowqty: selectRow.nowqty,
      ordkey: selectRow.ordkey,
      ordnum: selectRow.ordnum,
      ordseq: selectRow.ordseq,
      pac: selectRow.pac,
      poregnum: selectRow.poregnum,
      project: selectRow.project,
      qty: selectRow.qty,
      qtyunit: selectRow.qtyunit,
      rowstatus: "N",
      safeqty: selectRow.safeqty,
      selected: selectRow.selected,
      singular: selectRow.singular,
      spec: selectRow.spec,
      taxamt: selectRow.taxamt,
      taxdiv: selectRow.taxdiv,
      totwgt: selectRow.totwgt,
      unitwgt: selectRow.unitwgt,
      unp: selectRow.unp,
      wgtunit: selectRow.wgtunit,
      width: selectRow.width,
      wonamt: selectRow.wonamt,
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      itemgrade: "",
      itemcd: "",
      itemnm: "",
      itemacnt: "",
      qty: 1,
      qtyunit: "",
      unitwgt: 0,
      wgtunit: "",
      len: 0,
      itemthick: 0,
      width: 0,
      unpcalmeth: "Q",
      UNPFACTOR: 0,
      unp: 0,
      amt: 0,
      dlramt: 0,
      wonamt: 0,
      taxamt: 0,
      maker: "",
      usegb: "",
      spec: "",
      badcd: "",
      BADTEMP: "",
      poregnum: "",
      lcno: "",
      heatno: "",
      SONGNO: "",
      projectno: "",
      lotnum: "",
      orglot: "",
      boxno: "",
      PRTNO: "",
      account: "",
      qcnum: "",
      qcseq: 0,
      APPNUM: "",
      seq2: 0,
      totwgt: 0,
      purnum: "",
      purseq: 0,
      ordnum: "",
      ordseq: 0,
      remark: "",
      load_place: "",
      pac: "A",
      itemlvl1: "",
      enddt: "99991231",
      extra_field1: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
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
        orgdiv: data.orgdiv,
        recdt: toDate(data.recdt),
        seq1: data.seq1,
        location: data.location,
        position: data.position,
        doexdiv: data.doexdiv,
        amtunit: data.amtunit,
        intype: data.intype,
        inuse: data.inuse,
        inoutdiv: data.inoutdiv,
        indt: toDate(data.indt),
        custcd: data.custcd,
        custnm: data.custnm,
        rcvcustcd: data.rcvcustcd,
        rcvcustnm: data.rcvcustnm,
        taxdiv: data.taxdiv,
        taxloca: data.taxloca,
        taxtype: data.taxtype,
        taxnum: data.taxnum,
        taxdt: data.taxdt,
        person: data.person,
        attdatnum: data.attdatnum,
        remark: data.remark,
        baseamt: data.baseamt,
        importnum: data.importnum,
        auto_transfer: data.auto_transfer,
        pac: data.pac,
        reckey: data.recnum,
        files: data.files,
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

  const onCopyWndClick2 = () => {
    setCopyWindowVisible2(true);
  };

  const onCopyWndClick3 = () => {
    setCopyWindowVisible3(true);
  };
  const onCopyWndClick4 = () => {
    setCopyWindowVisible4(true);
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

  const setCopyData2 = (data: any) => {
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

    let valid = true;

    for (var i = 1; i < data.length; i++) {
      if (data[0].num == data[i].num && valid == true) {
        alert("중복되는 품목이있습니다.");
        valid = false;
        return false;
      }
    }

    for (var i = 0; i < data.length; i++) {
      data[i].num = ++temp;
    }

    try {
      data.map((item: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: item.num,
          amt: item.amt,
          before_qty: item.befor_qty,
          insiz: item.insiz,
          itemacnt: item.itemacnt,
          itemcd: item.itemcd,
          itemgrade: item.itemgrade,
          itemlvl1: item.itemlvl1,
          itemlvl2: item.itemlvl2,
          itemlvl3: item.itemlvl3,
          itemnm: item.itemnm,
          itemno: item.itemno,
          enddt: "99991231",
          itemthick: item.itemthick,
          len: item.len,
          load_place: item.load_place,
          lotnum: item.lotnum,
          nowqty: item.nowqty,
          orglot: item.orglot,
          out_qty: item.out_qty,
          pac: item.pac,
          qty: item.qty,
          qtyunit: item.qtyunit,
          rowstatus: "N",
          safeqty: item.safeqty,
          selected: item.selected,
          taxamt: item.taxamt,
          totwgt: item.totwgt,
          unp: item.unp,
          width: item.width,
          wonamt: item.wonamt,
        };
        setMainDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
        setSelectedState({ [item[DATA_ITEM_KEY]]: true });
      });
    } catch (e) {
      alert(e);
    }
  };
  const setCopyData3 = (data: any) => {
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
      data[i].enddt = "99991231";
    }

    try {
      data.map((item: any) => {
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

  const setCopyData4 = (data: any) => {
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
    }

    try {
      data.map((item: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: item.num,
          amt: item.amt,
          amtunit: item.amtunit,
          chk: item.chk,
          custcd: item.custcd,
          custnm: item.custnm,
          insiz: item.insiz,
          itemacnt: item.itemacnt,
          itemcd: item.itemcd,
          itemlvl1: item.itemlvl1,
          itemlvl2: item.itemlvl2,
          itemlvl3: item.itemlvl3,
          itemnm: item.itemnm,
          itemno: item.itemno,
          itemthick: 0,
          len: 0,
          enddt: "99991231",
          lotnum: item.lotnum,
          nowqty: 0,
          ordkey: item.ordkey,
          ordnum: item.ordnum,
          qty: item.qty,
          qtyunit: item.qtyunit,
          rowstatus: "N",
          safeqty: item.safeqty,
          taxamt: item.taxamt,
          taxdiv: item.taxdiv,
          totwgt: item.totwgt,
          unitwgt: item.unitwgt,
          unp: item.unp,
          wgtunit: item.wgtunit,
          width: item.width,
          wonamt: item.wonamt,
        };
        setMainDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
        setSelectedState({ [item[DATA_ITEM_KEY]]: true });
      });
    } catch (e) {
      alert(e);
    }
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

    let valid = true;

    for (var i = 1; i < data.length; i++) {
      if (data[0].itemcd == data[i].itemcd && valid == true) {
        alert("중복되는 품목이있습니다.");
        valid = false;
        return false;
      }
    }

    for (var i = 0; i < data.length; i++) {
      data[i].num = ++temp;
    }

    try {
      data.map((item: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: item.num,
          amt: item.amt,
          before_qty: item.befor_qty,
          insiz: item.insiz,
          itemacnt: item.itemacnt,
          itemcd: item.itemcd,
          itemgrade: item.itemgrade,
          itemlvl1: item.itemlvl1,
          itemlvl2: item.itemlvl2,
          itemlvl3: item.itemlvl3,
          itemnm: item.itemnm,
          itemno: item.itemno,
          enddt: "99991231",
          itemthick: item.itemthick,
          len: item.len,
          load_place: item.load_place,
          lotnum: item.lotnum,
          nowqty: item.nowqty,
          orglot: item.orglot,
          out_qty: item.out_qty,
          pac: item.pac,
          qty: item.qty,
          qtyunit: item.qtyunit,
          rowstatus: "N",
          safeqty: item.safeqty,
          selected: item.selected,
          taxamt: item.taxamt,
          totwgt: item.totwgt,
          unp: item.unp,
          width: item.width,
          wonamt: item.wonamt,
        };
        setMainDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
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

    try {
      mainDataResult.data.map((item) => {
        if (
          (item.itemcd == "" || item.itemnm == "" || item.qty == 0) &&
          valid == true
        ) {
          alert("필수항목(품목코드, 품목명, 수량을 채워주세요.)");
          valid = false;
          return false;
        } else if (mainDataResult.data.length == 0) {
          throw findMessage(messagesData, "MA_A2700W_001");
        } else if (
          convertDateToStr(filters.indt).substring(0, 4) < "1997" ||
          convertDateToStr(filters.indt).substring(6, 8) > "31" ||
          convertDateToStr(filters.indt).substring(6, 8) < "01" ||
          convertDateToStr(filters.indt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "MA_A2700W_002");
        } else if (
          filters.location == "" ||
          filters.location == null ||
          filters.location == undefined
        ) {
          throw findMessage(messagesData, "MA_A2700W_003");
        } else if (
          filters.inuse == "" ||
          filters.inuse == null ||
          filters.inuse == undefined
        ) {
          throw findMessage(messagesData, "MA_A2700W_004");
        } else if (
          filters.doexdiv == "" ||
          filters.doexdiv == null ||
          filters.doexdiv == undefined
        ) {
          throw findMessage(messagesData, "MA_A2700W_005");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

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
        position: filters.position,
        doexdiv: filters.doexdiv,
        amtunit: filters.amtunit,
        inuse: filters.inuse,
        inoutdiv: filters.inoutdiv,
        indt: filters.indt,
        custcd: filters.custcd,
        custnm: filters.custnm,
        rcvcustcd: filters.rcvcustcd,
        rcvcustnm: filters.rcvcustnm,
        taxdiv: filters.taxdiv,
        taxloca: filters.taxloca,
        taxtype: filters.taxtype,
        taxnum: filters.taxnum,
        taxdt: filters.taxdt,
        person: filters.person,
        attdatnum: filters.attdatnum,
        remark: filters.remark,
        baseamt: filters.baseamt,
        importnum: filters.importnum,
        auto_transfer: filters.auto_transfer,
        pac: filters.pac,
      }));
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        itemgrade_s: [],
        itemcd_s: [],
        itemnm_s: [],
        itemacnt_s: [],
        qty_s: [],
        qtyunit_s: [],
        unitwgt_s: [],
        wgtunit_s: [],
        len_s: [],
        itemthick_s: [],
        width_s: [],
        unpcalmeth_s: [],
        UNPFACTOR_s: [],
        unp_s: [],
        amt_s: [],
        dlramt_s: [],
        wonamt_s: [],
        taxamt_s: [],
        maker_s: [],
        usegb_s: [],
        spec_s: [],
        badcd_s: [],
        BADTEMP_s: [],
        poregnum_s: [],
        lcno_s: [],
        heatno_s: [],
        SONGNO_s: [],
        projectno_s: [],
        lotnum_s: [],
        orglot_s: [],
        boxno_s: [],
        PRTNO_s: [],
        account_s: [],
        qcnum_s: [],
        qcseq_s: [],
        APPNUM_s: [],
        seq2_s: [],
        totwgt_s: [],
        purnum_s: [],
        purseq_s: [],
        ordnum_s: [],
        ordseq_s: [],
        remark_s: [],
        load_place_s: [],
        pac_s: [],
        itemlvl1_s: [],
        enddt_s: [],
        extra_field1_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          itemgrade = "",
          itemcd = "",
          itemnm = "",
          itemacnt = "",
          qty = "",
          qtyunit = "",
          unitwgt = "",
          wgtunit = "",
          len = "",
          itemthick = "",
          width = "",
          unpcalmeth = "",
          UNPFACTOR = "",
          unp = "",
          amt = "",
          dlramt = "",
          wonamt = "",
          taxamt = "",
          maker = "",
          usegb = "",
          spec = "",
          badcd = "",
          BADTEMP = "",
          poregnum = "",
          lcno = "",
          heatno = "",
          SONGNO = "",
          projectno = "",
          lotnum = "",
          orglot = "",
          boxno = "",
          PRTNO = "",
          account = "",
          qcnum = "",
          qcseq = "",
          APPNUM = "",
          seq2 = "",
          totwgt = "",
          purnum = "",
          purseq = "",
          ordnum = "",
          ordseq = "",
          remark = "",
          load_place = "",
          pac = "",
          itemlvl1 = "",
          enddt = "",
          extra_field1 = "",
          indt = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.itemgrade_s.push(itemgrade);
        dataArr.itemcd_s.push(itemcd);
        dataArr.itemnm_s.push(itemnm);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.qty_s.push(qty == "" ? 0 : qty);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
        dataArr.wgtunit_s.push(wgtunit);
        dataArr.len_s.push(len == "" ? 0 : len);
        dataArr.itemthick_s.push(itemthick == "" ? 0 : itemthick);
        dataArr.width_s.push(width == "" ? 0 : width);
        dataArr.unpcalmeth_s.push(unpcalmeth == "" ? "Q" : unpcalmeth);
        dataArr.UNPFACTOR_s.push(UNPFACTOR == "" ? 0 : UNPFACTOR);
        dataArr.unp_s.push(unp);
        dataArr.amt_s.push(amt);
        dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
        dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
        dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
        dataArr.maker_s.push(maker);
        dataArr.usegb_s.push(usegb);
        dataArr.spec_s.push(spec);
        dataArr.badcd_s.push(badcd);
        dataArr.BADTEMP_s.push(BADTEMP);
        dataArr.poregnum_s.push(poregnum);
        dataArr.lcno_s.push(lcno);
        dataArr.heatno_s.push(heatno);
        dataArr.SONGNO_s.push(SONGNO);
        dataArr.projectno_s.push(projectno);
        dataArr.lotnum_s.push(lotnum);
        dataArr.orglot_s.push(orglot);
        dataArr.boxno_s.push(boxno);
        dataArr.PRTNO_s.push(PRTNO);
        dataArr.account_s.push(account);
        dataArr.qcnum_s.push(qcnum);
        dataArr.qcseq_s.push(qcseq == "" ? 0 : qcseq);
        dataArr.APPNUM_s.push(APPNUM);
        dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
        dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
        dataArr.purnum_s.push(purnum);
        dataArr.purseq_s.push(purseq == "" ? 0 : purseq);
        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
        dataArr.remark_s.push(remark);
        dataArr.load_place_s.push(load_place);
        dataArr.pac_s.push(pac);
        dataArr.itemlvl1_s.push(itemlvl1);
        dataArr.enddt_s.push(enddt == "99991231" ? "" : enddt);
        dataArr.extra_field1_s.push(extra_field1 == "" ? 0 : extra_field1);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          itemgrade = "",
          itemcd = "",
          itemnm = "",
          itemacnt = "",
          qty = "",
          qtyunit = "",
          unitwgt = "",
          wgtunit = "",
          len = "",
          itemthick = "",
          width = "",
          unpcalmeth = "",
          UNPFACTOR = "",
          unp = "",
          amt = "",
          dlramt = "",
          wonamt = "",
          taxamt = "",
          maker = "",
          usegb = "",
          spec = "",
          badcd = "",
          BADTEMP = "",
          poregnum = "",
          lcno = "",
          heatno = "",
          SONGNO = "",
          projectno = "",
          lotnum = "",
          orglot = "",
          boxno = "",
          PRTNO = "",
          account = "",
          qcnum = "",
          qcseq = "",
          APPNUM = "",
          seq2 = "",
          totwgt = "",
          purnum = "",
          purseq = "",
          ordnum = "",
          ordseq = "",
          remark = "",
          load_place = "",
          pac = "",
          itemlvl1 = "",
          enddt = "",
          extra_field1 = "",
          indt = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.itemgrade_s.push(itemgrade);
        dataArr.itemcd_s.push(itemcd);
        dataArr.itemnm_s.push(itemnm);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.qty_s.push(qty == "" ? 0 : qty);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
        dataArr.wgtunit_s.push(wgtunit);
        dataArr.len_s.push(len == "" ? 0 : len);
        dataArr.itemthick_s.push(itemthick == "" ? 0 : itemthick);
        dataArr.width_s.push(width == "" ? 0 : width);
        dataArr.unpcalmeth_s.push(unpcalmeth == "" ? 0 : unpcalmeth);
        dataArr.UNPFACTOR_s.push(UNPFACTOR == "" ? 0 : UNPFACTOR);
        dataArr.unp_s.push(unp);
        dataArr.amt_s.push(amt);
        dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
        dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
        dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
        dataArr.maker_s.push(maker);
        dataArr.usegb_s.push(usegb);
        dataArr.spec_s.push(spec);
        dataArr.badcd_s.push(badcd);
        dataArr.BADTEMP_s.push(BADTEMP);
        dataArr.poregnum_s.push(poregnum);
        dataArr.lcno_s.push(lcno);
        dataArr.heatno_s.push(heatno);
        dataArr.SONGNO_s.push(SONGNO);
        dataArr.projectno_s.push(projectno);
        dataArr.lotnum_s.push(lotnum);
        dataArr.orglot_s.push(orglot);
        dataArr.boxno_s.push(boxno);
        dataArr.PRTNO_s.push(PRTNO);
        dataArr.account_s.push(account);
        dataArr.qcnum_s.push(qcnum);
        dataArr.qcseq_s.push(qcseq == "" ? 0 : qcseq);
        dataArr.APPNUM_s.push(APPNUM);
        dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
        dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
        dataArr.purnum_s.push(purnum);
        dataArr.purseq_s.push(purseq == "" ? 0 : purseq);
        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
        dataArr.remark_s.push(remark);
        dataArr.load_place_s.push(load_place);
        dataArr.pac_s.push(pac);
        dataArr.itemlvl1_s.push(itemlvl1);
        dataArr.enddt_s.push(enddt == "99991231" ? "" : enddt);
        dataArr.extra_field1_s.push(extra_field1 == "" ? 0 : extra_field1);
      });
      setParaData((prev) => ({
        ...prev,
        workType: workType,
        recdt: filters.recdt,
        seq1: filters.seq1,
        position: filters.position,
        doexdiv: filters.doexdiv,
        amtunit: filters.amtunit,
        inuse: filters.inuse,
        inoutdiv: filters.inoutdiv,
        indt: filters.indt,
        custcd: filters.custcd,
        custnm: filters.custnm,
        rcvcustcd: filters.rcvcustcd,
        rcvcustnm: filters.rcvcustnm,
        taxdiv: filters.taxdiv,
        taxloca: filters.taxloca,
        taxtype: filters.taxtype,
        taxnum: filters.taxnum,
        taxdt: filters.taxdt,
        person: filters.person,
        attdatnum: filters.attdatnum,
        remark: filters.remark,
        baseamt: filters.baseamt,
        importnum: filters.importnum,
        auto_transfer: filters.auto_transfer,
        pac: filters.pac,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        itemgrade_s: dataArr.itemgrade_s.join("|"),
        itemcd_s: dataArr.itemcd_s.join("|"),
        itemnm_s: dataArr.itemnm_s.join("|"),
        itemacnt_s: dataArr.itemacnt_s.join("|"),
        qty_s: dataArr.qty_s.join("|"),
        qtyunit_s: dataArr.qtyunit_s.join("|"),
        unitwgt_s: dataArr.unitwgt_s.join("|"),
        wgtunit_s: dataArr.wgtunit_s.join("|"),
        len_s: dataArr.len_s.join("|"),
        itemthick_s: dataArr.itemthick_s.join("|"),
        width_s: dataArr.width_s.join("|"),
        unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
        UNPFACTOR_s: dataArr.UNPFACTOR_s.join("|"),
        unp_s: dataArr.unp_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        dlramt_s: dataArr.dlramt_s.join("|"),
        wonamt_s: dataArr.wonamt_s.join("|"),
        taxamt_s: dataArr.taxamt_s.join("|"),
        maker_s: dataArr.maker_s.join("|"),
        usegb_s: dataArr.usegb_s.join("|"),
        spec_s: dataArr.spec_s.join("|"),
        badcd_s: dataArr.badcd_s.join("|"),
        BADTEMP_s: dataArr.BADTEMP_s.join("|"),
        poregnum_s: dataArr.poregnum_s.join("|"),
        lcno_s: dataArr.lcno_s.join("|"),
        heatno_s: dataArr.heatno_s.join("|"),
        SONGNO_s: dataArr.SONGNO_s.join("|"),
        projectno_s: dataArr.projectno_s.join("|"),
        lotnum_s: dataArr.lotnum_s.join("|"),
        orglot_s: dataArr.orglot_s.join("|"),
        boxno_s: dataArr.boxno_s.join("|"),
        PRTNO_s: dataArr.PRTNO_s.join("|"),
        account_s: dataArr.account_s.join("|"),
        qcnum_s: dataArr.qcnum_s.join("|"),
        qcseq_s: dataArr.qcseq_s.join("|"),
        APPNUM_s: dataArr.APPNUM_s.join("|"),
        seq2_s: dataArr.seq2_s.join("|"),
        totwgt_s: dataArr.totwgt_s.join("|"),
        purnum_s: dataArr.purnum_s.join("|"),
        purseq_s: dataArr.purseq_s.join("|"),
        ordnum_s: dataArr.ordnum_s.join("|"),
        ordseq_s: dataArr.ordseq_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        load_place_s: dataArr.load_place_s.join("|"),
        pac_s: dataArr.pac_s.join("|"),
        itemlvl1_s: dataArr.itemlvl1_s.join("|"),
        enddt_s: dataArr.enddt_s.join("|"),
        extra_field1_s: dataArr.extra_field1_s.join("|"),
      }));
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    recdt: new Date(),
    seq1: 0,
    location: sessionLocation,
    position: "",
    doexdiv: "A",
    amtunit: "KRW",
    inuse: "10",
    inoutdiv: "",
    indt: new Date(),
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    userid: userId,
    pc: pc,
    taxdiv: "A",
    taxloca: "",
    taxtype: "",
    taxnum: "",
    taxdt: "",
    person: "admin",
    attdatnum: "",
    remark: "",
    baseamt: 0,
    importnum: "",
    auto_transfer: "A",
    pac: "",
    rowstatus_s: "",
    itemgrade_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    qty_s: "",
    qtyunit_s: "",
    unitwgt_s: "",
    wgtunit_s: "",
    len_s: "",
    itemthick_s: "",
    width_s: "",
    unpcalmeth_s: "",
    UNPFACTOR_s: "",
    unp_s: "",
    amt_s: "",
    dlramt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    maker_s: "",
    usegb_s: "",
    spec_s: "",
    badcd_s: "",
    BADTEMP_s: "",
    poregnum_s: "",
    lcno_s: "",
    heatno_s: "",
    SONGNO_s: "",
    projectno_s: "",
    lotnum_s: "",
    orglot_s: "",
    boxno_s: "",
    PRTNO_s: "",
    account_s: "",
    qcnum_s: "",
    qcseq_s: "",
    APPNUM_s: "",
    seq2_s: "",
    totwgt_s: "",
    purnum_s: "",
    purseq_s: "",
    ordnum_s: "",
    ordseq_s: "",
    remark_s: "",
    load_place_s: "",
    pac_s: "",
    itemlvl1_s: "",
    enddt_s: "",
    extra_field1_s: "",
    form_id: "MA_A2700W",
    serviceid: companyCode,
    reckey: "",
  });

  const para: Iparameters = {
    procedureName: "P_MA_A2700W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_recdt": convertDateToStr(ParaData.recdt),
      "@p_seq1": ParaData.seq1,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_doexdiv": ParaData.doexdiv,
      "@p_amtunit": ParaData.amtunit,
      "@p_inuse": ParaData.inuse,
      "@p_indt": convertDateToStr(ParaData.indt),
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_taxloca": ParaData.taxloca,
      "@p_taxtype": ParaData.taxtype,
      "@p_taxnum": ParaData.taxnum,
      "@p_taxdt": ParaData.taxdt,
      "@p_uschgrat": 0,
      "@p_person": ParaData.person,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_remark": ParaData.remark,
      "@p_baseamt": ParaData.baseamt,
      "@p_importnum": ParaData.importnum,
      "@p_auto_transfer": ParaData.auto_transfer,
      "@p_pac": ParaData.pac,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_itemgrade_s": ParaData.itemgrade_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_len_s": ParaData.len_s,
      "@p_itemthick_s": ParaData.itemthick_s,
      "@p_width_s": ParaData.width_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_UNPFACTOR_s": ParaData.UNPFACTOR_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_dlramt_s": ParaData.dlramt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_maker_s": ParaData.maker_s,
      "@p_usegb_s": ParaData.usegb_s,
      "@p_spec_s": ParaData.spec_s,
      "@p_badcd_s": ParaData.badcd_s,
      "@p_BADTEMP_s": ParaData.BADTEMP_s,
      "@p_poregnum_s": ParaData.poregnum_s,
      "@p_lcno_s": ParaData.lcno_s,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_SONGNO_s": ParaData.SONGNO_s,
      "@p_projectno_s": ParaData.projectno_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_orglot_s": ParaData.orglot_s,
      "@p_boxno_s": ParaData.boxno_s,
      "@p_PRTNO_s": ParaData.PRTNO_s,
      "@p_account_s": ParaData.account_s,
      "@p_qcnum_s": ParaData.qcnum_s,
      "@p_qcseq_s": ParaData.qcseq_s,
      "@p_APPNUM_s": ParaData.APPNUM_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_totwgt_s": ParaData.totwgt_s,
      "@p_purnum_s": ParaData.purnum_s,
      "@p_purseq_s": ParaData.purseq_s,
      "@p_ordnum_s": ParaData.ordnum_s,
      "@p_ordseq_s": ParaData.ordseq_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_pac_s": ParaData.pac_s,
      "@p_itemlvl1_s": ParaData.itemlvl1_s,
      "@p_enddt_s": ParaData.enddt_s,
      "@p_extra_field1_s": ParaData.extra_field1_s,
      "@p_form_id": "MA_A2700W",
      "@p_service_id": companyCode,
      "@p_wonchgrat": "0",
      "@p_indt_s": "",
      "@p_person_s": "",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

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
        workType: "",
        orgdiv: sessionOrgdiv,
        recdt: new Date(),
        seq1: 0,
        location: sessionLocation,
        position: "",
        doexdiv: "A",
        amtunit: "KRW",
        inuse: "10",
        inoutdiv: "",
        indt: new Date(),
        custcd: "",
        custnm: "",
        rcvcustcd: "",
        rcvcustnm: "",
        userid: userId,
        pc: pc,
        taxdiv: "A",
        taxloca: "",
        taxtype: "",
        taxnum: "",
        taxdt: "",
        person: "admin",
        attdatnum: "",
        remark: "",
        baseamt: 0,
        importnum: "",
        auto_transfer: "A",
        pac: "",
        rowstatus_s: "",
        itemgrade_s: "",
        itemcd_s: "",
        itemnm_s: "",
        itemacnt_s: "",
        qty_s: "",
        qtyunit_s: "",
        unitwgt_s: "",
        wgtunit_s: "",
        len_s: "",
        itemthick_s: "",
        width_s: "",
        unpcalmeth_s: "",
        UNPFACTOR_s: "",
        unp_s: "",
        amt_s: "",
        dlramt_s: "",
        wonamt_s: "",
        taxamt_s: "",
        maker_s: "",
        usegb_s: "",
        spec_s: "",
        badcd_s: "",
        BADTEMP_s: "",
        poregnum_s: "",
        lcno_s: "",
        heatno_s: "",
        SONGNO_s: "",
        projectno_s: "",
        lotnum_s: "",
        orglot_s: "",
        boxno_s: "",
        PRTNO_s: "",
        account_s: "",
        qcnum_s: "",
        qcseq_s: "",
        APPNUM_s: "",
        seq2_s: "",
        totwgt_s: "",
        purnum_s: "",
        purseq_s: "",
        ordnum_s: "",
        ordseq_s: "",
        remark_s: "",
        load_place_s: "",
        pac_s: "",
        itemlvl1_s: "",
        enddt_s: "",
        extra_field1_s: "",
        form_id: "MA_A2700W",
        serviceid: companyCode,
        reckey: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

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
      field != "insiz" &&
      field != "qtyunit" &&
      field != "rowstatus" &&
      field != "itemnm"
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
      setEditIndex(dataItem[DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
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
      if (editedField !== "itemcd") {
        const newData = mainDataResult.data.map(
          (item: { [x: string]: string; rowstatus: string }) =>
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
        mainDataResult.data.map((item: { [x: string]: any; itemcd: any }) => {
          if (editIndex == item[DATA_ITEM_KEY]) {
            fetchItemData(item.itemcd);
          }
        });
      }
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
        titles={workType == "N" ? "직접입고생성" : "직접입고정보"}
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
                      <th>이체구분</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="auto_transfer"
                            value={filters.auto_transfer}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>입고용도</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="inuse"
                            value={filters.inuse}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            className="required"
                          />
                        )}
                      </td>
                      <th>수입관리번호</th>
                      <td>
                        <Input
                          name="importnum"
                          type="text"
                          value={filters.importnum}
                          onChange={filterInputChange}
                        />
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
                      <th>원화환율</th>
                      <td>
                        <Input
                          name="baseamt"
                          type="number"
                          value={filters.baseamt}
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>대미환율</th>
                      <td>
                        <Input
                          name="baseamt"
                          type="number"
                          value={filters.baseamt}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={3}>
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
              <FormContext.Provider
                value={{
                  itemInfo,
                  setItemInfo,
                }}
              >
                <GridContainer>
                  <GridTitleContainer className="WindowButtonContainer">
                    <GridTitle>상세정보</GridTitle>
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
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
                          품목참조
                        </Button>
                        <Button
                          themeColor={"primary"}
                          onClick={onCopyWndClick3}
                          icon="folder-open"
                          disabled={permissions.save ? false : true}
                        >
                          수주참조
                        </Button>
                        <Button
                          themeColor={"primary"}
                          onClick={onCopyWndClick4}
                          icon="folder-open"
                          disabled={permissions.save ? false : true}
                        >
                          수주BOM
                        </Button>
                        <Button
                          themeColor={"primary"}
                          onClick={onCopyWndClick2}
                          icon="folder-open"
                          disabled={permissions.save ? false : true}
                        >
                          불량재고참조
                        </Button>
                        <Button
                          onClick={onAddClick}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          themeColor={"primary"}
                          fillMode="outline"
                          onClick={onCopyClick}
                          icon="copy"
                          title="행 복사"
                          disabled={permissions.save ? false : true}
                        ></Button>
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
                        enddt: row.enddt
                          ? new Date(dateformat(row.enddt))
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
                      field="pac"
                      title="도/사급"
                      width="150px"
                      cell={CustomComboBoxCell}
                    />
                    <GridColumn
                      field="itemcd"
                      title="품목코드"
                      width="200px"
                      headerCell={RequiredHeader}
                      footerCell={mainTotalFooterCell}
                      cell={ColumnCommandCell}
                    />
                    <GridColumn
                      field="itemnm"
                      title="품목명"
                      headerCell={RequiredHeader}
                      width="250px"
                    />
                    <GridColumn
                      field="itemlvl1"
                      title="대분류"
                      width="150px"
                      cell={CustomComboBoxCell}
                    />
                    <GridColumn
                      field="itemacnt"
                      title="품목계정"
                      width="200px"
                      cell={CustomComboBoxCell}
                    />
                    <GridColumn field="insiz" title="규격" width="200px" />
                    <GridColumn field="lotnum" title="LOT NO" width="200px" />
                    <GridColumn field="heatno" title="HEAT NO" width="200px" />
                    <GridColumn
                      field="qty"
                      title="수량"
                      width="120px"
                      headerCell={RequiredHeader}
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="qtyunit"
                      title="단위"
                      width="150px"
                      cell={CustomComboBoxCell}
                    />
                    <GridColumn
                      field="unp"
                      title="단가"
                      width="120px"
                      cell={NumberCell}
                    />
                    <GridColumn
                      field="wonamt"
                      title="원화금액"
                      width="120px"
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
                    <GridColumn field="remark" title="비고" width="300px" />
                    <GridColumn
                      field="totwgt"
                      title="전체중량"
                      width="150px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="len"
                      title="길이"
                      width="150px"
                      cell={NumberCell}
                    />
                    <GridColumn
                      field="enddt"
                      title="소비기한"
                      width="150px"
                      cell={DateCell}
                    />
                    <GridColumn
                      field="itemthick"
                      title="두께"
                      width="150px"
                      cell={NumberCell}
                    />
                    <GridColumn
                      field="width"
                      title="폭"
                      width="150px"
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
              </FormContext.Provider>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
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
                    <th>이체구분</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="auto_transfer"
                          value={filters.auto_transfer}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>입고용도</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="inuse"
                          value={filters.inuse}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          className="required"
                        />
                      )}
                    </td>
                    <th>수입관리번호</th>
                    <td>
                      <Input
                        name="importnum"
                        type="text"
                        value={filters.importnum}
                        onChange={filterInputChange}
                      />
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
                    <th>원화환율</th>
                    <td>
                      <Input
                        name="baseamt"
                        type="number"
                        value={filters.baseamt}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>대미환율</th>
                    <td>
                      <Input
                        name="baseamt"
                        type="number"
                        value={filters.baseamt}
                        onChange={filterInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>첨부파일</th>
                    <td colSpan={3}>
                      <Input
                        name="files"
                        type="text"
                        value={filters.files}
                        className="readonly"
                      />
                      <ButtonInInput style={{ top: "35px" }}>
                        <Button
                          type={"button"}
                          onClick={onAttachmentsWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>비고</th>
                    <td colSpan={7}>
                      <TextArea
                        value={filters.remark}
                        name="remark"
                        rows={4}
                        onChange={filterInputChange}
                        onResize={undefined}
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <FormContext.Provider
              value={{
                itemInfo,
                setItemInfo,
              }}
            >
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
                      품목참조
                    </Button>
                    <Button
                      themeColor={"primary"}
                      onClick={onCopyWndClick3}
                      icon="folder-open"
                      disabled={permissions.save ? false : true}
                    >
                      수주참조
                    </Button>
                    <Button
                      themeColor={"primary"}
                      onClick={onCopyWndClick4}
                      icon="folder-open"
                      disabled={permissions.save ? false : true}
                    >
                      수주BOM
                    </Button>
                    <Button
                      themeColor={"primary"}
                      onClick={onCopyWndClick2}
                      icon="folder-open"
                      disabled={permissions.save ? false : true}
                    >
                      불량재고참조
                    </Button>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onCopyClick}
                      icon="copy"
                      title="행 복사"
                      disabled={permissions.save ? false : true}
                    ></Button>
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
                      enddt: row.enddt
                        ? new Date(dateformat(row.enddt))
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
                    field="pac"
                    title="도/사급"
                    width="150px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="itemcd"
                    title="품목코드"
                    width="200px"
                    headerCell={RequiredHeader}
                    footerCell={mainTotalFooterCell}
                    cell={ColumnCommandCell}
                  />
                  <GridColumn
                    field="itemnm"
                    title="품목명"
                    headerCell={RequiredHeader}
                    width="250px"
                  />
                  <GridColumn
                    field="itemlvl1"
                    title="대분류"
                    width="150px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="itemacnt"
                    title="품목계정"
                    width="200px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn field="insiz" title="규격" width="200px" />
                  <GridColumn field="lotnum" title="LOT NO" width="200px" />
                  <GridColumn field="heatno" title="HEAT NO" width="200px" />
                  <GridColumn
                    field="qty"
                    title="수량"
                    width="120px"
                    headerCell={RequiredHeader}
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="qtyunit"
                    title="단위"
                    width="150px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="unp"
                    title="단가"
                    width="120px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="wonamt"
                    title="원화금액"
                    width="120px"
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
                  <GridColumn field="remark" title="비고" width="300px" />
                  <GridColumn
                    field="totwgt"
                    title="전체중량"
                    width="150px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="len"
                    title="길이"
                    width="150px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="enddt"
                    title="소비기한"
                    width="150px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="itemthick"
                    title="두께"
                    width="150px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="width"
                    title="폭"
                    width="150px"
                    cell={NumberCell}
                  />
                </Grid>
              </GridContainer>
            </FormContext.Provider>
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
          itemacnt={""}
          pathname={pathname}
        />
      )}
      {CopyWindowVisible2 && (
        <CopyWindow3
          setVisible={setCopyWindowVisible2}
          setData={setCopyData2}
          itemacnt={"1"}
          pathname={pathname}
        />
      )}
      {CopyWindowVisible3 && (
        <CopyWindow4
          setVisible={setCopyWindowVisible3}
          setData={setCopyData3}
          pathname={pathname}
        />
      )}
      {CopyWindowVisible4 && (
        <CopyWindow5
          setVisible={setCopyWindowVisible4}
          setData={setCopyData4}
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
