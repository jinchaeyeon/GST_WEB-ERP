import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
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
import CheckBoxCell from "../Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../Cells/CheckBoxReadOnlyCell";
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
  getItemQuery,
  getWindowDeviceHeight,
  numberWithCommas,
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
import CopyWindow3 from "./BA_A0080W_Copy_Window";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};

export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

type TdataArr = {
  rowstatus_s: string[];
  reqseq_s: string[];
  inexpdt_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  remark_s: string[];
  finyn_s: string[];
  unp_s: string[];
  amt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  load_place_s: string[];
  unpcalmeth_s: string[];
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
  amt: number;
  attdatnum: string;
  boxmeth: string;
  contractyn: string;
  custcd: string;
  custnm: string;
  dlv_method: string;
  dptcd: string;
  finaldes: string;
  finyn: string;
  modiv: string;
  paymeth: string;
  person: string;
  pgmdiv: string;
  poregnum: string;
  project: string;
  qcmeth: string;
  qty: number;
  recdt: string;
  remark: string;
  reportyn: string;
  reqkey: string;
  reqnum: string;
  reqseq: number;
  taxamt: number;
  taxdiv: string;
  totamt: number;
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
  UseBizComponent("L_BA019,L_BA015, L_LOADPLACE", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "unpcalmeth"
      ? "L_BA019"
      : field == "qtyunit"
      ? "L_BA015"
      : field == "load_place"
      ? "L_LOADPLACE"
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
  const DATA_ITEM_KEY = "num";
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);

  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

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
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061, L_BA015",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
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
  const [CopyWindowVisible3, setCopyWindowVisible3] = useState<boolean>(false);

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
  const setCustData2 = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      rcvcustcd: data.custcd,
      rcvcustnm: data.custnm,
    }));
  };
  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    itemcd: "",
    itemnm: "",
    custcd: "",
    custnm: "",
    person: "",
    location: "",
    pursts: "",
    purnum: "",
    finyn: "N",
    doexdiv: "A",
    amtunit: "KRW",
    purdt: new Date(),
    inexpdt: new Date(),
    taxdiv: "",
    wonchgrat: 0,
    uschgrat: 0,
    custprsncd: "",
    prcterms: "",
    rcvcustcd: "",
    rcvcustnm: "",
    files: "",
    attdatnum: "",
    remark: "",
    poregnum: "",
    project: "",
    dptcd: "",
    recdt: new Date(),
    reqkey: "",
    reqnum: "",
    reqrev: 0,
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_MA_A1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_person": filters.person,
        "@p_reqnum": filters.reqnum,
        "@p_reqrev": filters.reqrev,
        "@p_finyn": "%",
        "@p_load_place": "",
        "@p_dptcd": filters.dptcd,
        "@p_appyn": "%",
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
        amt: data.amt,
        attdatnum: data.attdatnum,
        boxmeth: data.boxmeth,
        contractyn: data.contractyn,
        custcd: data.custcd,
        custnm: data.custnm,
        dlv_method: data.dlv_method,
        dptcd: data.dptcd,
        finaldes: data.finaldes,
        finyn: data.finyn,
        modiv: data.modiv,
        person: data.person,
        pgmdiv: data.pgmdiv,
        poregnum: data.poregnum,
        project: data.project,
        qcmeth: data.qcmeth,
        qty: data.qty,
        recdt: toDate(data.recdt),
        remark: data.remark,
        reportyn: data.reportyn,
        reqkey: data.reqkey,
        reqnum: data.reqnum,
        reqseq: data.reqseq,
        taxamt: data.taxamt,
        taxdiv: data.taxdiv,
        totamt: data.totamt,
        isSearch: true,
        pgNum: 1,
      }));
    }
  }, [permissions, bizComponentData, customOptionData]);

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
  const onCopyWndClick3 = () => {
    setCopyWindowVisible3(true);
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
    const rows = data.map((row: any) => {
      return {
        ...row,
        totamt: 0,
        [DATA_ITEM_KEY]: ++temp,
        rowstatus: "N",
      };
    });

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
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
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
      if (item.inexpdt == "" && valid == true) {
        alert("입고예정일을 입력해주세요");
        valid = false;
        return false;
      }
    });

    if (valid == true) {
      if (mainDataResult.data.length == 0) {
        alert("데이터가 없습니다.");
        return false;
      } else if (
        convertDateToStr(filters.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.recdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.recdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.recdt).substring(6, 8).length != 2
      ) {
        alert("날짜를 입력해주세요.");
        return false;
      } else if (
        filters.person == null ||
        filters.person == "" ||
        filters.person == undefined
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
              reqnum: filters.reqnum,
              reqrev: filters.reqrev,
              custcd: filters.custcd,
              custnm: filters.custnm,
              modiv: "",
              dptcd: filters.dptcd,
              person: filters.person,
              recdt: filters.recdt,
              finaldes: "",
              qcmeth: "",
              boxmeth: "",
              dlv_method: "",
              reportyn: "",
              contractyn: "",
              attdatnum: filters.attdatnum,
              remark: filters.remark,
              project: filters.project,
              poregnum: filters.poregnum,
            }));
          } else {
            let dataArr: TdataArr = {
              rowstatus_s: [],
              reqseq_s: [],
              inexpdt_s: [],
              itemcd_s: [],
              itemnm_s: [],
              qty_s: [],
              qtyunit_s: [],
              remark_s: [],
              finyn_s: [],
              unp_s: [],
              amt_s: [],
              wonamt_s: [],
              taxamt_s: [],
              load_place_s: [],
              unpcalmeth_s: [],
            };

            dataItem.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                reqseq = "",
                inexpdt = "",
                itemcd = "",
                itemnm = "",
                qty = "",
                qtyunit = "",
                remark = "",
                finyn = "",
                unp = "",
                amt = "",
                wonamt = "",
                taxamt = "",
                load_place = "",
                unpcalmeth = "",
              } = item;

              dataArr.rowstatus_s.push(rowstatus);
              dataArr.reqseq_s.push(
                reqseq == undefined || reqseq == "" ? 0 : reqseq
              );
              dataArr.inexpdt_s.push(
                inexpdt == "99991231" || inexpdt == undefined ? "" : inexpdt
              );
              dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
              dataArr.itemnm_s.push(itemnm == undefined ? "" : itemnm);
              dataArr.qty_s.push(qty == undefined ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
              dataArr.finyn_s.push(finyn == undefined ? "N" : finyn);
              dataArr.unp_s.push(unp == undefined ? 0 : unp);
              dataArr.amt_s.push(amt == undefined ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.load_place_s.push(
                load_place == undefined ? "" : load_place
              );
              dataArr.unpcalmeth_s.push(
                unpcalmeth == undefined ? "" : unpcalmeth
              );
            });
            deletedMainRows.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                reqseq = "",
                inexpdt = "",
                itemcd = "",
                itemnm = "",
                qty = "",
                qtyunit = "",
                remark = "",
                finyn = "",
                unp = "",
                amt = "",
                wonamt = "",
                taxamt = "",
                load_place = "",
                unpcalmeth = "",
              } = item;
              dataArr.rowstatus_s.push(rowstatus);
              dataArr.reqseq_s.push(
                reqseq == undefined || reqseq == "" ? 0 : reqseq
              );
              dataArr.inexpdt_s.push(
                inexpdt == "99991231" || inexpdt == undefined ? "" : inexpdt
              );
              dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
              dataArr.itemnm_s.push(itemnm == undefined ? "" : itemnm);
              dataArr.qty_s.push(qty == undefined ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
              dataArr.finyn_s.push(finyn == undefined ? "N" : finyn);
              dataArr.unp_s.push(unp == undefined ? 0 : unp);
              dataArr.amt_s.push(amt == undefined ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.load_place_s.push(
                load_place == undefined ? "" : load_place
              );
              dataArr.unpcalmeth_s.push(
                unpcalmeth == undefined ? "" : unpcalmeth
              );
            });
            setParaData((prev) => ({
              ...prev,
              workType: workType,
              reqnum: filters.reqnum,
              reqrev: filters.reqrev,
              custcd: filters.custcd,
              custnm: filters.custnm,
              modiv: "",
              dptcd: filters.dptcd,
              person: filters.person,
              recdt: filters.recdt,
              finaldes: "",
              qcmeth: "",
              boxmeth: "",
              dlv_method: "",
              reportyn: "",
              contractyn: "",
              attdatnum: filters.attdatnum,
              remark: filters.remark,
              project: filters.project,
              poregnum: filters.poregnum,
              rowstatus_s: dataArr.rowstatus_s.join("|"),
              reqseq_s: dataArr.reqseq_s.join("|"),
              inexpdt_s: dataArr.inexpdt_s.join("|"),
              itemcd_s: dataArr.itemcd_s.join("|"),
              itemnm_s: dataArr.itemnm_s.join("|"),
              qty_s: dataArr.qty_s.join("|"),
              qtyunit_s: dataArr.qtyunit_s.join("|"),
              remark_s: dataArr.remark_s.join("|"),
              finyn_s: dataArr.finyn_s.join("|"),
              unp_s: dataArr.unp_s.join("|"),
              amt_s: dataArr.amt_s.join("|"),
              wonamt_s: dataArr.wonamt_s.join("|"),
              taxamt_s: dataArr.taxamt_s.join("|"),
              load_place_s: dataArr.load_place_s.join("|"),
              unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
            }));
          }
        }
      }
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    reqnum: "",
    reqrev: 0,
    custcd: "",
    custnm: "",
    modiv: "",
    dptcd: "",
    person: "",
    recdt: new Date(),
    finaldes: "",
    qcmeth: "",
    boxmeth: "",
    dlv_method: "",
    paymeth: "",
    reportyn: "",
    contractyn: "",
    attdatnum: "",
    remark: "",
    project: "",
    poregnum: "",
    rowstatus_s: "",
    reqseq_s: "",
    inexpdt_s: "",
    itemcd_s: "",
    itemnm_s: "",
    qty_s: "",
    qtyunit_s: "",
    remark_s: "",
    finyn_s: "",
    unp_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    load_place_s: "",
    unpcalmeth_s: "",
    userid: userId,
    pc: pc,
    form_id: "MA_A1000W",
  });

  const para: Iparameters = {
    procedureName: "P_MA_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": ParaData.location,
      "@p_reqnum": ParaData.reqnum,
      "@p_reqrev": ParaData.reqrev,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_modiv": ParaData.modiv,
      "@p_dptcd": ParaData.dptcd,
      "@p_person": ParaData.person,
      "@p_recdt": convertDateToStr(ParaData.recdt),
      "@p_finaldes": ParaData.finaldes,
      "@p_qcmeth": ParaData.qcmeth,
      "@p_boxmeth": ParaData.boxmeth,
      "@p_dlv_method": ParaData.dlv_method,
      "@p_paymeth": ParaData.paymeth,
      "@p_reportyn": ParaData.reportyn,
      "@p_contractyn": ParaData.contractyn,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_remark": ParaData.remark,
      "@p_project": ParaData.project,
      "@p_poregnum": ParaData.poregnum,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_reqseq_s": ParaData.reqseq_s,
      "@p_inexpdt_s": ParaData.inexpdt_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_finyn_s": ParaData.finyn_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A1000W",
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
      setValues2(false);
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
        location: sessionLocation,
        reqnum: "",
        reqrev: 0,
        custcd: "",
        custnm: "",
        modiv: "",
        dptcd: "",
        person: "",
        recdt: new Date(),
        finaldes: "",
        qcmeth: "",
        boxmeth: "",
        dlv_method: "",
        paymeth: "",
        reportyn: "",
        contractyn: "",
        attdatnum: "",
        remark: "",
        project: "",
        poregnum: "",
        rowstatus_s: "",
        reqseq_s: "",
        inexpdt_s: "",
        itemcd_s: "",
        itemnm_s: "",
        qty_s: "",
        qtyunit_s: "",
        remark_s: "",
        finyn_s: "",
        unp_s: "",
        amt_s: "",
        wonamt_s: "",
        taxamt_s: "",
        load_place_s: "",
        unpcalmeth_s: "",
        userid: userId,
        pc: pc,
        form_id: "MA_A1000W",
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
      (ParaData.rowstatus_s.length != 0 || ParaData.workType != "") &&
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
    let valid = true;
    if (
      field == "itemnm" ||
      field == "insiz" ||
      field == "itemacnt" ||
      field == "amt" ||
      field == "totamt" ||
      field == "wonamt" ||
      field == "taxamt" ||
      field == "rowstatus" ||
      field == "reqkey"
    ) {
      valid = false;
      return false;
    }
    if (valid == true) {
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
                    ? Math.round(
                        item.qty * item.unp + (item.qty * item.unp) / 10
                      )
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amt: 0,
      chk: "",
      finyn: "",
      inexpdt: convertDateToStr(new Date()),
      insiz: "",
      itemacnt: "",
      itemcd: "",
      itemnm: "",
      load_place: "",
      location: "",
      orgdiv: sessionOrgdiv,
      qty: 1,
      qtyunit: "",
      remark: "",
      reqkey: "",
      reqnum: "",
      reqrev: 0,
      reqseq: 0,
      taxamt: 0,
      totamt: 0,
      unp: 0,
      unpcalmeth: "",
      wonamt: 0,
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

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
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

  return (
    <>
      <Window
        titles={workType == "N" ? "구매요청생성" : "구매요청정보"}
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
                      <th>청구번호</th>
                      <td>
                        <Input
                          name="reqkey"
                          type="text"
                          value={filters.reqkey}
                          className="readonly"
                        />
                      </td>
                      <th>청구일자</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="recdt"
                            value={filters.recdt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                            className="required"
                            placeholder=""
                          />
                        </div>
                      </td>
                      <th>청구부서</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="dptcd"
                            value={filters.dptcd}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="dptnm"
                            valueField="dptcd"
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
                      <th>프로젝트</th>
                      <td colSpan={3}>
                        <Input
                          name="project"
                          type="text"
                          value={filters.project}
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
                      <th>PO번호</th>
                      <td colSpan={3}>
                        <Input
                          name="poregnum"
                          type="text"
                          value={filters.poregnum}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={7}>
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
                          onClick={onCopyWndClick3}
                          icon="folder-open"
                          title="저장"
                          disabled={permissions.save ? false : true}
                        >
                          품목 참조
                        </Button>
                        <Button
                          onClick={onAddClick}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
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
                        itemacnt: itemacntListData.find(
                          (item: any) => item.sub_code == row.itemacnt
                        )?.code_name,
                        inexpdt: row.inexpdt
                          ? new Date(dateformat(row.inexpdt))
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
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell2}
                      cell={CheckBoxCell}
                    />
                    <GridColumn
                      field="inexpdt"
                      title="입고예정일"
                      width="120px"
                      cell={DateCell}
                      headerCell={RequiredHeader}
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn
                      field="itemcd"
                      title="품목코드"
                      width="150px"
                      cell={ColumnCommandCell}
                    />
                    <GridColumn field="itemnm" title="품목명" width="150px" />
                    <GridColumn
                      field="itemacnt"
                      title="품목계정"
                      width="120px"
                    />
                    <GridColumn field="insiz" title="규격" width="120px" />
                    <GridColumn
                      field="load_place"
                      title="창고"
                      width="120px"
                      cell={CustomComboBoxCell}
                    />
                    <GridColumn
                      field="qty"
                      title="청구수량"
                      width="100px"
                      cell={NumberCell}
                      headerCell={RequiredHeader}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="qtyunit"
                      title="수량단위"
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
                    <GridColumn field="reqkey" title="청구번호" width="150px" />
                    <GridColumn
                      field="finyn"
                      title="완료여부"
                      width="100px"
                      cell={CheckBoxReadOnlyCell}
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
            {" "}
            <FormBoxWrap className="WindowFormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th>청구번호</th>
                    <td>
                      <Input
                        name="reqkey"
                        type="text"
                        value={filters.reqkey}
                        className="readonly"
                      />
                    </td>
                    <th>청구일자</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="recdt"
                          value={filters.recdt}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          className="required"
                          placeholder=""
                        />
                      </div>
                    </td>
                    <th>청구부서</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="dptcd"
                          value={filters.dptcd}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          textField="dptnm"
                          valueField="dptcd"
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
                    <th>프로젝트</th>
                    <td colSpan={3}>
                      <Input
                        name="project"
                        type="text"
                        value={filters.project}
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
                    <th>PO번호</th>
                    <td colSpan={3}>
                      <Input
                        name="poregnum"
                        type="text"
                        value={filters.poregnum}
                        onChange={filterInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>비고</th>
                    <td colSpan={7}>
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
                      onClick={onCopyWndClick3}
                      icon="folder-open"
                      title="저장"
                      disabled={permissions.save ? false : true}
                    >
                      품목 참조
                    </Button>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
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
                      itemacnt: itemacntListData.find(
                        (item: any) => item.sub_code == row.itemacnt
                      )?.code_name,
                      inexpdt: row.inexpdt
                        ? new Date(dateformat(row.inexpdt))
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
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell2}
                    cell={CheckBoxCell}
                  />
                  <GridColumn
                    field="inexpdt"
                    title="입고예정일"
                    width="120px"
                    cell={DateCell}
                    headerCell={RequiredHeader}
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn
                    field="itemcd"
                    title="품목코드"
                    width="150px"
                    cell={ColumnCommandCell}
                  />
                  <GridColumn field="itemnm" title="품목명" width="150px" />
                  <GridColumn field="itemacnt" title="품목계정" width="120px" />
                  <GridColumn field="insiz" title="규격" width="120px" />
                  <GridColumn
                    field="load_place"
                    title="창고"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="qty"
                    title="청구수량"
                    width="100px"
                    cell={NumberCell}
                    headerCell={RequiredHeader}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="qtyunit"
                    title="수량단위"
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
                  <GridColumn field="reqkey" title="청구번호" width="150px" />
                  <GridColumn
                    field="finyn"
                    title="완료여부"
                    width="100px"
                    cell={CheckBoxReadOnlyCell}
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
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
        />
      )}
      {CopyWindowVisible3 && (
        <CopyWindow3
          setVisible={setCopyWindowVisible3}
          setData={setCopyData}
          itemacnt={""}
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
