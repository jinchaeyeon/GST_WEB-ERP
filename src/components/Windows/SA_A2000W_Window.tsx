import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { useRecoilState } from "recoil";
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
import {
  IAttachmentData,
  ICustData,
  IWindowPosition,
} from "../../hooks/interfaces";
import { deletedNameState, unsavedNameState } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../Cells/CheckBoxReadOnlyCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  checkIsDDLValid,
  convertDateToStr,
  dateformat,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getItemQuery,
  getUnpQuery,
  getWindowDeviceHeight,
  isValidDate,
  numberWithCommas
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsMultiWindow from "./CommonWindows/ItemsMultiWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import Window from "./WindowComponent/Window";

let deletedRows: object[] = [];
const DATA_ITEM_KEY = "ordseq";
let temp = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA061,L_BA015", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "itemacnt" ? "L_BA061" : field == "qtyunit" ? "L_BA015" : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

type TKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  workType: "U" | "N";
  ordnum?: string;
  isCopy: boolean;
  para?: Iparameters; //{};
  modal?: boolean;
};

type TDetailData = {
  rowstatus_s: string[];
  chk_s: string[];
  ordseq_s: string[];
  poregseq_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  itemacnt_s: string[];
  insiz_s: string[];
  bnatur_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  totwgt_s: string[];
  wgtunit_s: string[];
  len_s: string[];
  totlen_s: string[];
  lenunit_s: string[];
  thickness_s: string[];
  width_s: string[];
  length_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  taxamt_s: string[];
  dlramt_s: string[];
  wonamt_s: string[];
  remark_s: string[];
  pac_s: string[];
  finyn_s: string[];
  specialunp_s: string[];
  lotnum_s: string[];
  dlvdt_s: string[];
  specialamt_s: string[];
  heatno_s: string[];
  bf_qty_s: string[];
};

export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

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

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      <>
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
      </>
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

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  ordnum,
  isCopy,
  para,
  modal = false,
}: TKendoWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const userId = UseGetValueFromSessionItem("user_id");
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  const pc = UseGetValueFromSessionItem("pc");
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
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

  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);

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
  const [isInitSearch, setIsInitSearch] = useState(false);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  const onClose = () => {
    temp = 0;
    if (unsavedName.length > 0) setDeletedName(unsavedName);
    getVisible(false);
  };

  const fetchUnpItem = async (custcd: string, itemcd: string) => {
    if (!permissions.view) return;
    if (custcd == "") return;
    let data: any;

    const queryStr = getUnpQuery(custcd);
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
      let unpData: any = rows.filter(
        (items: any) =>
          items.recdt <= convertDateToStr(filters.orddt) &&
          items.itemcd == itemcd
      );
      return unpData.length > 0 ? unpData[0].unp : 0;
    }
  };

  useEffect(() => {
    (async () => {
      var unp = await fetchUnpItem(filters.custcd, itemInfo.itemcd);
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] ==
        parseInt(Object.getOwnPropertyNames(selectedState)[0])
          ? {
              ...item,
              itemcd: itemInfo.itemcd,
              itemno: itemInfo.itemno,
              itemnm: itemInfo.itemnm,
              insiz: itemInfo.insiz,
              model: itemInfo.model,
              bnatur: itemInfo.bnatur,
              spec: itemInfo.spec,
              itemacnt: itemInfo.itemacnt,
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
              unp: unp,
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
    })();
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
                  itemcd: item.itemcd,
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

  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "new"
      );
      setFilters((prev) => {
        return {
          ...prev,
          doexdiv: defaultOption.find((item: any) => item.id == "doexdiv")
            ?.valueCode,
          taxdiv: defaultOption.find((item: any) => item.id == "taxdiv")
            ?.valueCode,
          location: defaultOption.find((item: any) => item.id == "location")
            ?.valueCode,
          ordtype: defaultOption.find((item: any) => item.id == "ordtype")
            ?.valueCode,
          ordsts: defaultOption.find((item: any) => item.id == "ordsts")
            ?.valueCode,
          dptcd: defaultOption.find((item: any) => item.id == "dptcd")
            ?.valueCode,
          amtunit: defaultOption.find((item: any) => item.id == "amtunit")
            ?.valueCode,
          person: defaultOption.find((item: any) => item.id == "person")
            ?.valueCode,
        };
      });
    }
  }, [customOptionData]);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SA_A2000W_Q",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "HEADER",
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": "",
      "@p_dtgb": "",
      "@p_frdt": "19990101",
      "@p_todt": "20991231",
      "@p_ordnum": ordnum,
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_itemcd": "",
      "@p_itemnm": "",
      "@p_person": "",
      "@p_finyn": "%",
      "@p_dptcd": "",
      "@p_ordsts": "",
      "@p_doexdiv": "",
      "@p_ordtype": "",
      "@p_poregnum": "",
      "@p_find_row_value": "",
    },
  };

  //요약정보 조회
  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const row = data.tables[0].Rows[0];

      setFilters((prev) => {
        return {
          ...prev,
          ordnum: isCopy != true ? row.ordnum : "",
          doexdiv: row.doexdiv,
          taxdiv: row.taxdiv,
          location: row.location,
          orddt: new Date(dateformat(row.orddt)),
          dlvdt: new Date(dateformat(row.dlvdt)),
          custnm: row.custnm,
          custcd: row.custcd,
          dptcd: row.dptcd,
          person: row.person,
          ordsts: row.ordsts,
          ordtype: row.ordtype,
          rcvcustnm: row.rcvcustnm,
          rcvcustcd: row.rcvcustcd,
          project: row.project,
          amtunit: row.amtunit,
          wonchgrat: row.wonchgrat, //0,
          uschgrat: row.uschgrat, //0,
          quokey: row.quokey,
          prcterms: row.prcterms,
          paymeth: row.paymeth,
          dlv_method: row.dlv_method,
          portnm: row.portnm,
          ship_method: row.ship_method,
          poregnum: row.poregnum,
          attdatnum: isCopy != true ? row.attdatnum : "",
          files: isCopy != true ? row.files : "",
          remark: row.remark,
          baseamt: row.baseamt == 0 ? 1 : row.baseamt,
        };
      });
      setIsInitSearch(true);
    }
  };

  //상세그리드 조회
  const fetchGrid = async () => {
    if (!permissions.view) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        baseamt: item.baseamt == 0 ? 1 : item.baseamt,
        rowstatus: isCopy != true ? "" : "N",
      }));

      setMainDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    }
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    service_id: "20190218001",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    ordnum: "",
    poregnum: "",
    project: "",
    ordtype: "",
    ordsts: "",
    taxdiv: "",
    orddt: "",
    dlvdt: "",
    dptcd: "",
    person: "",
    amtunit: "",
    portnm: "",
    finaldes: "",
    paymeth: "",
    prcterms: "",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    wonchgrat: 0,
    uschgrat: 0,
    doexdiv: "",
    remark: "",
    attdatnum: "",
    userid: userId,
    pc: pc,
    ship_method: "",
    dlv_method: "",
    hullno: "",
    rowstatus_s: "",
    chk_s: "",
    ordseq_s: "",
    poregseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    insiz_s: "",
    bnatur_s: "",
    qty_s: "",
    qtyunit_s: "",
    totwgt_s: "",
    wgtunit_s: "",
    len_s: "",
    totlen_s: "",
    lenunit_s: "",
    thickness_s: "",
    width_s: "",
    length_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    taxamt_s: "",
    dlramt_s: "",
    wonamt_s: "",
    remark_s: "",
    pac_s: "",
    finyn_s: "",
    specialunp_s: "",
    lotnum_s: "",
    dlvdt_s: "",
    specialamt_s: "",
    heatno_s: "",
    bf_qty_s: "",
    form_id: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_SA_A2000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_service_id": paraData.service_id,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_ordnum": paraData.ordnum,
      "@p_poregnum": paraData.poregnum,
      "@p_project": paraData.project,
      "@p_ordtype": paraData.ordtype,
      "@p_ordsts": paraData.ordsts,
      "@p_taxdiv": paraData.taxdiv,
      "@p_orddt": paraData.orddt,
      "@p_dlvdt": paraData.dlvdt,
      "@p_dptcd": paraData.dptcd,
      "@p_person": paraData.person,
      "@p_amtunit": paraData.amtunit,
      "@p_portnm": paraData.portnm,
      "@p_finaldes": paraData.finaldes,
      "@p_paymeth": paraData.paymeth,
      "@p_prcterms": paraData.prcterms,
      "@p_custcd": paraData.custcd,
      "@p_custnm": paraData.custnm,
      "@p_rcvcustcd": paraData.rcvcustcd,
      "@p_rcvcustnm": paraData.rcvcustnm,
      "@p_wonchgrat": paraData.wonchgrat,
      "@p_uschgrat": paraData.uschgrat,
      "@p_doexdiv": paraData.doexdiv,
      "@p_remark": paraData.remark,
      "@p_attdatnum": paraData.attdatnum,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_ship_method": paraData.ship_method,
      "@p_dlv_method": paraData.dlv_method,
      "@p_hullno": paraData.hullno,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_chk_s": paraData.chk_s,
      "@p_ordseq_s": paraData.ordseq_s,
      "@p_poregseq_s": paraData.poregseq_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_itemnm_s": paraData.itemnm_s,
      "@p_itemacnt_s": paraData.itemacnt_s,
      "@p_insiz_s": paraData.insiz_s,
      "@p_bnatur_s": paraData.bnatur_s,
      "@p_qty_s": paraData.qty_s,
      "@p_qtyunit_s": paraData.qtyunit_s,
      "@p_totwgt_s": paraData.totwgt_s,
      "@p_wgtunit_s": paraData.wgtunit_s,
      "@p_len_s": paraData.len_s,
      "@p_totlen_s": paraData.totlen_s,
      "@p_lenunit_s": paraData.lenunit_s,
      "@p_thickness_s": paraData.thickness_s,
      "@p_width_s": paraData.width_s,
      "@p_length_s": paraData.length_s,
      "@p_unpcalmeth_s": paraData.unpcalmeth_s,
      "@p_unp_s": paraData.unp_s,
      "@p_amt_s": paraData.amt_s,
      "@p_taxamt_s": paraData.taxamt_s,
      "@p_dlramt_s": paraData.dlramt_s,
      "@p_wonamt_s": paraData.wonamt_s,
      "@p_remark_s": paraData.remark_s,
      "@p_pac_s": paraData.pac_s,
      "@p_finyn_s": paraData.finyn_s,
      "@p_specialunp_s": paraData.specialunp_s,
      "@p_lotnum_s": paraData.lotnum_s,
      "@p_dlvdt_s": paraData.dlvdt_s,
      "@p_specialamt_s": paraData.specialamt_s,
      "@p_heatno_s": paraData.heatno_s,
      "@p_bf_qty_s": paraData.bf_qty_s,
      "@p_form_id": paraData.form_id,
    },
  };

  const fetchGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      deletedRows = []; //초기화
      setUnsavedName([]);
      setValues2(false);
      if (workType == "U") {
        reloadData(paraData.ordnum);
        fetchMainGrid();
        fetchGrid();
      } else {
        reloadData(data.returnString);
        getVisible(false);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const handleSubmit = () => {
    if (!permissions.save) return;
    let valid = true;
    let valid2 = true;
    let valid3 = true;
    //검증
    mainDataResult.data.map((item: any) => {
      if (!item.itemcd) {
        valid = false;
      }
      if (!item.itemnm) {
        valid = false;
      }
      if (!checkIsDDLValid(item.itemacnt)) {
        valid = false;
      }
      if (item.qty < 1) {
        valid2 = false;
      }
      if (!item.unp) {
        valid3 = false;
      }
    });
    if (
      filters.doexdiv == null ||
      filters.doexdiv == "" ||
      filters.doexdiv == undefined ||
      filters.taxdiv == null ||
      filters.taxdiv == "" ||
      filters.taxdiv == undefined ||
      filters.orddt == null ||
      filters.orddt == "" ||
      filters.orddt == undefined ||
      filters.dlvdt == null ||
      filters.dlvdt == "" ||
      filters.dlvdt == undefined ||
      filters.custcd == null ||
      filters.custcd == "" ||
      filters.custcd == undefined ||
      filters.custnm == null ||
      filters.custnm == undefined
    ) {
      valid = false;
    }

    if (!valid) {
      alert("필수값을 입력해주세요.");
      return false;
    }
    if (!valid2) {
      alert("수주량을 1 이상 입력하세요.");
      return false;
    }
    if (!valid3) {
      alert("단가를 입력하세요.");
      return false;
    }

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    let detailArr: TDetailData = {
      rowstatus_s: [],
      chk_s: [],
      ordseq_s: [],
      poregseq_s: [],
      itemcd_s: [],
      itemnm_s: [],
      itemacnt_s: [],
      insiz_s: [],
      bnatur_s: [],
      qty_s: [],
      qtyunit_s: [],
      totwgt_s: [],
      wgtunit_s: [],
      len_s: [],
      totlen_s: [],
      lenunit_s: [],
      thickness_s: [],
      width_s: [],
      length_s: [],
      unpcalmeth_s: [],
      unp_s: [],
      amt_s: [],
      taxamt_s: [],
      dlramt_s: [],
      wonamt_s: [],
      remark_s: [],
      pac_s: [],
      finyn_s: [],
      specialunp_s: [],
      lotnum_s: [],
      dlvdt_s: [],
      specialamt_s: [],
      heatno_s: [],
      bf_qty_s: [],
    };
    dataItem.forEach((item: any) => {
      const {
        rowstatus,
        chk,
        ordseq,
        poregseq,
        itemcd,
        itemnm,
        itemacnt,
        insiz,
        bnatur,
        qty,
        qtyunit,
        totwgt,
        wgtunit,
        len,
        totlen,
        lenunit,
        thickness,
        width,
        length,
        unpcalmeth,
        unp,
        amt,
        taxamt,
        dlramt,
        wonamt,
        remark,
        pac,
        finyn,
        specialunp,
        lotnum,
        dlvdt,
        specialamt,
        heatno,
        bf_qty,
      } = item;

      detailArr.rowstatus_s.push(isCopy == true ? "N" : rowstatus);
      detailArr.chk_s.push(chk == true ? "Y" : chk == false ? "N" : chk);
      detailArr.ordseq_s.push(ordseq);
      detailArr.poregseq_s.push(poregseq);
      detailArr.itemcd_s.push(itemcd);
      detailArr.itemnm_s.push(itemnm);
      detailArr.itemacnt_s.push(itemacnt);
      detailArr.insiz_s.push(insiz);
      detailArr.bnatur_s.push(bnatur);
      detailArr.qty_s.push(qty);
      detailArr.qtyunit_s.push(qtyunit);
      detailArr.totwgt_s.push(totwgt);
      detailArr.wgtunit_s.push(wgtunit);
      detailArr.len_s.push(len);
      detailArr.totlen_s.push(totlen);
      detailArr.lenunit_s.push(lenunit);
      detailArr.thickness_s.push(thickness);
      detailArr.width_s.push(width);
      detailArr.length_s.push(length);
      detailArr.unpcalmeth_s.push(unpcalmeth);
      detailArr.unp_s.push(unp);
      detailArr.amt_s.push(amt);
      detailArr.taxamt_s.push(taxamt);
      detailArr.dlramt_s.push(dlramt);
      detailArr.wonamt_s.push(wonamt);
      detailArr.remark_s.push(remark);
      detailArr.pac_s.push(pac);
      detailArr.finyn_s.push(finyn == true ? "Y" : "N");
      detailArr.specialunp_s.push(specialunp);
      detailArr.lotnum_s.push(lotnum);
      detailArr.dlvdt_s.push(
        dlvdt.length == 8 ? dlvdt : convertDateToStr(dlvdt)
      );
      detailArr.specialamt_s.push(specialamt);
      detailArr.heatno_s.push(heatno);
      detailArr.bf_qty_s.push(bf_qty);
    });

    deletedRows.forEach((item: any) => {
      const {
        rowstatus,
        chk,
        ordseq,
        poregseq,
        itemcd,
        itemnm,
        itemacnt,
        insiz,
        bnatur,
        qty,
        qtyunit,
        totwgt,
        wgtunit,
        len,
        totlen,
        lenunit,
        thickness,
        width,
        length,
        unpcalmeth,
        unp,
        amt,
        taxamt,
        dlramt,
        wonamt,
        remark,
        pac,
        finyn,
        specialunp,
        lotnum,
        dlvdt,
        specialamt,
        heatno,
        bf_qty,
      } = item;

      detailArr.rowstatus_s.push("D");
      detailArr.chk_s.push(chk == true ? "Y" : chk == false ? "N" : chk);
      detailArr.ordseq_s.push(ordseq);
      detailArr.poregseq_s.push(poregseq);
      detailArr.itemcd_s.push(itemcd);
      detailArr.itemnm_s.push(itemnm);
      detailArr.itemacnt_s.push(itemacnt);
      detailArr.insiz_s.push(insiz);
      detailArr.bnatur_s.push(bnatur);
      detailArr.qty_s.push(qty);
      detailArr.qtyunit_s.push(qtyunit);
      detailArr.totwgt_s.push(totwgt);
      detailArr.wgtunit_s.push(wgtunit);
      detailArr.len_s.push(len);
      detailArr.totlen_s.push(totlen);
      detailArr.lenunit_s.push(lenunit);
      detailArr.thickness_s.push(thickness);
      detailArr.width_s.push(width);
      detailArr.length_s.push(length);
      detailArr.unpcalmeth_s.push(unpcalmeth);
      detailArr.unp_s.push(unp);
      detailArr.amt_s.push(amt);
      detailArr.taxamt_s.push(taxamt);
      detailArr.dlramt_s.push(dlramt);
      detailArr.wonamt_s.push(wonamt);
      detailArr.remark_s.push(remark);
      detailArr.pac_s.push(pac);
      detailArr.finyn_s.push(finyn);
      detailArr.specialunp_s.push(specialunp);
      detailArr.lotnum_s.push(lotnum);
      detailArr.dlvdt_s.push(
        dlvdt.length == 8 ? dlvdt : convertDateToStr(dlvdt)
      );
      detailArr.specialamt_s.push(specialamt);
      detailArr.heatno_s.push(heatno);
      detailArr.bf_qty_s.push(bf_qty);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      location: filters.location,
      ordnum: filters.ordnum,
      poregnum: filters.poregnum,
      project: filters.project,
      ordtype: filters.ordtype,
      ordsts: filters.ordsts,
      taxdiv: filters.taxdiv,
      orddt: convertDateToStr(filters.orddt),
      dlvdt: convertDateToStr(filters.dlvdt),
      dptcd: filters.dptcd,
      person: filters.person,
      amtunit: filters.amtunit,
      portnm: filters.portnm,
      finaldes: "",
      paymeth: filters.paymeth,
      prcterms: filters.prcterms,
      custcd: filters.custcd,
      custnm: filters.custnm,
      rcvcustcd: filters.rcvcustcd,
      rcvcustnm: filters.rcvcustnm,
      wonchgrat: filters.wonchgrat,
      uschgrat: filters.uschgrat,
      doexdiv: filters.doexdiv,
      remark: filters.remark,
      attdatnum: filters.attdatnum,
      ship_method: filters.ship_method,
      dlv_method: filters.dlv_method,
      hullno: "",
      rowstatus_s: detailArr.rowstatus_s.join("|"), //"N|N",
      chk_s: detailArr.chk_s.join("|"),
      ordseq_s: detailArr.ordseq_s.join("|"),
      poregseq_s: detailArr.poregseq_s.join("|"),
      itemcd_s: detailArr.itemcd_s.join("|"),
      itemnm_s: detailArr.itemnm_s.join("|"),
      itemacnt_s: detailArr.itemacnt_s.join("|"),
      insiz_s: detailArr.insiz_s.join("|"),
      bnatur_s: detailArr.bnatur_s.join("|"),
      qty_s: detailArr.qty_s.join("|"),
      qtyunit_s: detailArr.qtyunit_s.join("|"),
      totwgt_s: detailArr.totwgt_s.join("|"),
      wgtunit_s: detailArr.wgtunit_s.join("|"),
      len_s: detailArr.len_s.join("|"),
      totlen_s: detailArr.totlen_s.join("|"),
      lenunit_s: detailArr.lenunit_s.join("|"),
      thickness_s: detailArr.thickness_s.join("|"),
      width_s: detailArr.width_s.join("|"),
      length_s: detailArr.length_s.join("|"),
      unpcalmeth_s: detailArr.unpcalmeth_s.join("|"),
      unp_s: detailArr.unp_s.join("|"),
      amt_s: detailArr.amt_s.join("|"),
      taxamt_s: detailArr.taxamt_s.join("|"),
      dlramt_s: detailArr.dlramt_s.join("|"),
      wonamt_s: detailArr.wonamt_s.join("|"),
      remark_s: detailArr.remark_s.join("|"),
      pac_s: detailArr.pac_s.join("|"),
      finyn_s: detailArr.finyn_s.join("|"),
      specialunp_s: detailArr.specialunp_s.join("|"),
      lotnum_s: detailArr.lotnum_s.join("|"),
      dlvdt_s: detailArr.dlvdt_s.join("|"),
      specialamt_s: detailArr.specialamt_s.join("|"),
      heatno_s: detailArr.heatno_s.join("|"),
      bf_qty_s: detailArr.bf_qty_s.join("|"),
    }));
  };

  useEffect(() => {
    if (permissions.save && paraData.work_type != "") {
      fetchGridSaved();
    }
  }, [paraData, permissions]);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onRcvcustWndClick = () => {
    setCustWindowVisible2(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [itemMultiWindowVisible, setItemMultiWindowVisible] =
    useState<boolean>(false);
  const setCustData = (data: ICustData) => {
    const { custcd, custnm } = data;
    setFilters((prev) => ({
      ...prev,
      custcd: custcd,
      custnm: custnm,
    }));
  };

  const setCustData2 = (data: ICustData) => {
    const { custcd, custnm } = data;
    setFilters((prev) => ({
      ...prev,
      rcvcustcd: custcd,
      rcvcustnm: custnm,
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

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_CUST", setBizComponentData);

  const [custcdListData, setCustcdListData] = useState([
    {
      custcd: "",
      custnm: "",
    },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setCustcdListData(getBizCom(bizComponentData, "L_CUST"));
    }
  }, [bizComponentData]);

  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    ordnum: "",
    doexdiv: "",
    location: "",
    orddt: new Date(),
    dlvdt: new Date(),
    ordsts: "",
    ordtype: "",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    project: "",
    dptcd: "",
    amtunit: "",
    quokey: "",
    prcterms: "",
    paymeth: "",
    dlv_method: "",
    portnm: "",
    ship_method: "",
    poregnum: "",
    files: "",
    attdatnum: "",
    uschgrat: 0,
    wonchgrat: 0,
    remark: "",
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (name == "orddt") {
      fetchUnp(filters.custcd, mainDataResult.data);
    }

    if (name == "uschgrat" && value != filters.uschgrat) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      const newData = mainDataResult.data.map((item) => {
        return {
          ...item,
          rowstatus: item.rowstatus == "N" ? "N" : "U",
          amt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          wonamt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          taxamt: Math.round(
            filters.taxdiv == "A"
              ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * item.unp * 0.1
                  : item.qty * item.unp * filters.wonchgrat * 0.1
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                  : (item.len == undefined ? 0 : item.len) *
                    item.unp *
                    filters.wonchgrat *
                    0.1
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * item.unp * 0.1
                  : item.totwgt * item.unp * filters.wonchgrat * 0.1
                : filters.amtunit == "KRW"
                ? item.amt * 0.1
                : item.amt * filters.wonchgrat * 0.1
              : 0
          ),
          totamt: Math.round(
            (item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat) +
              Math.round(
                filters.taxdiv == "A"
                  ? filters.amtunit == "KRW"
                    ? (item.qty * item.unp) / 10
                    : (item.qty * item.unp * filters.wonchgrat) / 10
                  : 0
              )
          ),
          dlramt: Math.round(
            value != 0
              ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? filters.amtunit == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * filters.wonchgrat
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) *
                      item.unp *
                      filters.wonchgrat
                  : item.unpcalmeth == "W"
                  ? filters.amtunit == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * filters.wonchgrat
                  : filters.amtunit == "KRW"
                  ? item.amt
                  : item.amt * filters.wonchgrat) * value
              : 0
          ),
        };
      });

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

    if (name == "wonchgrat" && value != filters.wonchgrat) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      const newData = mainDataResult.data.map((item) => {
        return {
          ...item,
          rowstatus: item.rowstatus == "N" ? "N" : "U",
          amt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * value
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) * item.unp * value
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * value
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * value,
          wonamt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * value
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) * item.unp * value
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * value
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * value,
          taxamt: Math.round(
            filters.taxdiv == "A"
              ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * item.unp * 0.1
                  : item.qty * item.unp * value * 0.1
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                  : (item.len == undefined ? 0 : item.len) *
                    item.unp *
                    value *
                    0.1
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * item.unp * 0.1
                  : item.totwgt * item.unp * value * 0.1
                : filters.amtunit == "KRW"
                ? item.amt * 0.1
                : item.amt * value * 0.1
              : 0
          ),
          totamt: Math.round(
            (item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * value
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) * item.unp * value
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * value
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * value) +
              Math.round(
                filters.taxdiv == "A"
                  ? filters.amtunit == "KRW"
                    ? (item.qty * item.unp) / 10
                    : (item.qty * item.unp * value) / 10
                  : 0
              )
          ),
          dlramt: Math.round(
            filters.uschgrat != 0
              ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? filters.amtunit == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * value
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) * item.unp * value
                  : item.unpcalmeth == "W"
                  ? filters.amtunit == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * value
                  : filters.amtunit == "KRW"
                  ? item.amt
                  : item.amt * value) * filters.uschgrat
              : 0
          ),
        };
      });

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

    if (name == "custcd") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custnm:
          custcdListData.find((item: any) => item.custcd == value)?.custnm ==
          undefined
            ? ""
            : custcdListData.find((item: any) => item.custcd == value)?.custnm,
      }));
      fetchUnp(value, mainDataResult.data);
    } else if (name == "custnm") {
      const custcds =
        custcdListData.find((item: any) => item.custnm == value)?.custcd ==
        undefined
          ? ""
          : custcdListData.find((item: any) => item.custnm == value)?.custcd;
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custcd: custcds == undefined ? "" : custcds,
      }));
      fetchUnp(custcds == undefined ? "" : custcds, mainDataResult.data);
    } else if (name == "rcvcustcd") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        rcvcustnm:
          custcdListData.find((item: any) => item.custcd == value)?.custnm ==
          undefined
            ? ""
            : custcdListData.find((item: any) => item.custcd == value)?.custnm,
      }));
    } else if (name == "rcvcustnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        rcvcustcd:
          custcdListData.find((item: any) => item.custnm == value)?.custcd ==
          undefined
            ? ""
            : custcdListData.find((item: any) => item.custnm == value)?.custcd,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (name == "taxdiv" && value != filters.taxdiv) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      const newData = mainDataResult.data.map((item) => {
        return {
          ...item,
          rowstatus: item.rowstatus == "N" ? "N" : "U",
          amt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          wonamt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          taxamt: Math.round(
            value == "A"
              ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * item.unp * 0.1
                  : item.qty * item.unp * filters.wonchgrat * 0.1
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                  : (item.len == undefined ? 0 : item.len) *
                    item.unp *
                    filters.wonchgrat *
                    0.1
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * item.unp * 0.1
                  : item.totwgt * item.unp * filters.wonchgrat * 0.1
                : filters.amtunit == "KRW"
                ? item.amt * 0.1
                : item.amt * filters.wonchgrat * 0.1
              : 0
          ),
          totamt: Math.round(
            (item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat) +
              Math.round(
                value == "A"
                  ? filters.amtunit == "KRW"
                    ? (item.qty * item.unp) / 10
                    : (item.qty * item.unp * filters.wonchgrat) / 10
                  : 0
              )
          ),
          dlramt: Math.round(
            filters.uschgrat != 0
              ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? filters.amtunit == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * filters.wonchgrat
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) *
                      item.unp *
                      filters.wonchgrat
                  : item.unpcalmeth == "W"
                  ? filters.amtunit == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * filters.wonchgrat
                  : filters.amtunit == "KRW"
                  ? item.amt
                  : item.amt * filters.wonchgrat) * filters.uschgrat
              : 0
          ),
        };
      });

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

    if (name == "amtunit" && value != filters.amtunit) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      const newData = mainDataResult.data.map((item) => {
        return {
          ...item,
          rowstatus: item.rowstatus == "N" ? "N" : "U",
          amt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? value == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? value == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? value == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : value == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          wonamt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? value == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? value == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? value == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : value == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          taxamt: Math.round(
            filters.taxdiv == "A"
              ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? value == "KRW"
                  ? item.qty * item.unp * 0.1
                  : item.qty * item.unp * filters.wonchgrat * 0.1
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? value == "KRW"
                  ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                  : (item.len == undefined ? 0 : item.len) *
                    item.unp *
                    filters.wonchgrat *
                    0.1
                : item.unpcalmeth == "W"
                ? value == "KRW"
                  ? item.totwgt * item.unp * 0.1
                  : item.totwgt * item.unp * filters.wonchgrat * 0.1
                : value == "KRW"
                ? item.amt * 0.1
                : item.amt * filters.wonchgrat * 0.1
              : 0
          ),
          totamt: Math.round(
            (item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? value == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? value == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? value == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : value == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat) +
              Math.round(
                filters.taxdiv == "A"
                  ? value == "KRW"
                    ? (item.qty * item.unp) / 10
                    : (item.qty * item.unp * filters.wonchgrat) / 10
                  : 0
              )
          ),
          dlramt: Math.round(
            filters.uschgrat != 0
              ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? value == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * filters.wonchgrat
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) *
                      item.unp *
                      filters.wonchgrat
                  : item.unpcalmeth == "W"
                  ? value == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * filters.wonchgrat
                  : value == "KRW"
                  ? item.amt
                  : item.amt * filters.wonchgrat) * filters.uschgrat
              : 0
          ),
        };
      });

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
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const fetchUnp = async (custcd: string, nowData: any) => {
    if (!permissions.view) return;
    if (custcd == "") return;
    let data: any;

    const queryStr = getUnpQuery(custcd);
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

      if (rows.length > 0) {
        const newData = nowData.map((item: any) => {
          let unpData: any = rows.filter(
            (items: any) =>
              items.recdt <= convertDateToStr(filters.orddt) &&
              items.itemcd == item.itemcd
          );
          return {
            ...item,
            unp: unpData.length > 0 ? unpData[0].unp : 0,
            amt:
              item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * (unpData.length > 0 ? unpData[0].unp : 0)
                  : item.qty *
                    (unpData.length > 0 ? unpData[0].unp : 0) *
                    filters.wonchgrat
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) *
                    (unpData.length > 0 ? unpData[0].unp : 0)
                  : (item.len == undefined ? 0 : item.len) *
                    (unpData.length > 0 ? unpData[0].unp : 0) *
                    filters.wonchgrat
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * (unpData.length > 0 ? unpData[0].unp : 0)
                  : item.totwgt *
                    (unpData.length > 0 ? unpData[0].unp : 0) *
                    filters.wonchgrat
                : filters.amtunit == "KRW"
                ? item.amt
                : item.amt * filters.wonchgrat,
            wonamt:
              item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * (unpData.length > 0 ? unpData[0].unp : 0)
                  : item.qty *
                    (unpData.length > 0 ? unpData[0].unp : 0) *
                    filters.wonchgrat
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) *
                    (unpData.length > 0 ? unpData[0].unp : 0)
                  : (item.len == undefined ? 0 : item.len) *
                    (unpData.length > 0 ? unpData[0].unp : 0) *
                    filters.wonchgrat
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * (unpData.length > 0 ? unpData[0].unp : 0)
                  : item.totwgt *
                    (unpData.length > 0 ? unpData[0].unp : 0) *
                    filters.wonchgrat
                : filters.amtunit == "KRW"
                ? item.amt
                : item.amt * filters.wonchgrat,
            taxamt: Math.round(
              filters.taxdiv == "A"
                ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? filters.amtunit == "KRW"
                    ? item.qty * (unpData.length > 0 ? unpData[0].unp : 0) * 0.1
                    : item.qty *
                      (unpData.length > 0 ? unpData[0].unp : 0) *
                      filters.wonchgrat *
                      0.1
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) *
                      (unpData.length > 0 ? unpData[0].unp : 0) *
                      0.1
                    : (item.len == undefined ? 0 : item.len) *
                      (unpData.length > 0 ? unpData[0].unp : 0) *
                      filters.wonchgrat *
                      0.1
                  : item.unpcalmeth == "W"
                  ? filters.amtunit == "KRW"
                    ? item.totwgt *
                      (unpData.length > 0 ? unpData[0].unp : 0) *
                      0.1
                    : item.totwgt *
                      (unpData.length > 0 ? unpData[0].unp : 0) *
                      filters.wonchgrat *
                      0.1
                  : filters.amtunit == "KRW"
                  ? item.amt * 0.1
                  : item.amt * filters.wonchgrat * 0.1
                : 0
            ),
            totamt: Math.round(
              (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * (unpData.length > 0 ? unpData[0].unp : 0)
                  : item.qty *
                    (unpData.length > 0 ? unpData[0].unp : 0) *
                    filters.wonchgrat
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) *
                    (unpData.length > 0 ? unpData[0].unp : 0)
                  : (item.len == undefined ? 0 : item.len) *
                    (unpData.length > 0 ? unpData[0].unp : 0) *
                    filters.wonchgrat
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * (unpData.length > 0 ? unpData[0].unp : 0)
                  : item.totwgt *
                    (unpData.length > 0 ? unpData[0].unp : 0) *
                    filters.wonchgrat
                : filters.amtunit == "KRW"
                ? item.amt
                : item.amt * filters.wonchgrat) +
                Math.round(
                  filters.taxdiv == "A"
                    ? filters.amtunit == "KRW"
                      ? (item.qty * (unpData.length > 0 ? unpData[0].unp : 0)) /
                        10
                      : (item.qty *
                          (unpData.length > 0 ? unpData[0].unp : 0) *
                          filters.wonchgrat) /
                        10
                    : 0
                )
            ),
            dlramt: Math.round(
              filters.uschgrat != 0
                ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * (unpData.length > 0 ? unpData[0].unp : 0)
                      : item.qty *
                        (unpData.length > 0 ? unpData[0].unp : 0) *
                        filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) *
                        (unpData.length > 0 ? unpData[0].unp : 0)
                      : (item.len == undefined ? 0 : item.len) *
                        (unpData.length > 0 ? unpData[0].unp : 0) *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * (unpData.length > 0 ? unpData[0].unp : 0)
                      : item.totwgt *
                        (unpData.length > 0 ? unpData[0].unp : 0) *
                        filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat) * filters.uschgrat
                : 0
            ),
          };
        });

        if (newData != nowData) {
          const datas = newData.map((item: any) => ({
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }));
          setTempResult((prev) => {
            return {
              data: datas,
              total: prev.total,
            };
          });
          setMainDataResult((prev) => {
            return {
              data: datas,
              total: prev.total,
            };
          });
        }
      }
    }
  };

  useEffect(() => {
    if (
      (workType != "N" || isCopy == true) &&
      isInitSearch == false &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      fetchMainGrid();
      fetchGrid();
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

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
      field != "totamt" &&
      field != "files" &&
      field != "insiz" &&
      field != "rowstatus" &&
      field != "finyn" &&
      field != "out_qty" &&
      field != "sale_qty" &&
      field != "purcustnm" &&
      field != "itemnm"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
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
      if (editedField !== "itemcd") {
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                amt:
                  item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * item.unp
                      : item.qty * item.unp * filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * item.unp
                      : (item.len == undefined ? 0 : item.len) *
                        item.unp *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * item.unp
                      : item.totwgt * item.unp * filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat,
                wonamt:
                  item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * item.unp
                      : item.qty * item.unp * filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * item.unp
                      : (item.len == undefined ? 0 : item.len) *
                        item.unp *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * item.unp
                      : item.totwgt * item.unp * filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat,
                taxamt: Math.round(
                  filters.taxdiv == "A"
                    ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                      ? filters.amtunit == "KRW"
                        ? item.qty * item.unp * 0.1
                        : item.qty * item.unp * filters.wonchgrat * 0.1
                      : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                      ? filters.amtunit == "KRW"
                        ? (item.len == undefined ? 0 : item.len) *
                          item.unp *
                          0.1
                        : (item.len == undefined ? 0 : item.len) *
                          item.unp *
                          filters.wonchgrat *
                          0.1
                      : item.unpcalmeth == "W"
                      ? filters.amtunit == "KRW"
                        ? item.totwgt * item.unp * 0.1
                        : item.totwgt * item.unp * filters.wonchgrat * 0.1
                      : filters.amtunit == "KRW"
                      ? item.amt * 0.1
                      : item.amt * filters.wonchgrat * 0.1
                    : 0
                ),
                totamt: Math.round(
                  (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * item.unp
                      : item.qty * item.unp * filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * item.unp
                      : (item.len == undefined ? 0 : item.len) *
                        item.unp *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * item.unp
                      : item.totwgt * item.unp * filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat) +
                    Math.round(
                      filters.taxdiv == "A"
                        ? filters.amtunit == "KRW"
                          ? (item.qty * item.unp) / 10
                          : (item.qty * item.unp * filters.wonchgrat) / 10
                        : 0
                    )
                ),
                dlramt: Math.round(
                  filters.uschgrat != 0
                    ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                        ? filters.amtunit == "KRW"
                          ? item.qty * item.unp
                          : item.qty * item.unp * filters.wonchgrat
                        : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                        ? filters.amtunit == "KRW"
                          ? (item.len == undefined ? 0 : item.len) * item.unp
                          : (item.len == undefined ? 0 : item.len) *
                            item.unp *
                            filters.wonchgrat
                        : item.unpcalmeth == "W"
                        ? filters.amtunit == "KRW"
                          ? item.totwgt * item.unp
                          : item.totwgt * item.unp * filters.wonchgrat
                        : filters.amtunit == "KRW"
                        ? item.amt
                        : item.amt * filters.wonchgrat) * filters.uschgrat
                    : 0
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
        mainDataResult.data.map((item: { [x: string]: any; itemcd: any }) => {
          if (editIndex == item[DATA_ITEM_KEY]) {
            fetchItemData(item.itemcd);
          }
        });
      }
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

  const addItemData = (itemDatas: IItemData[]) => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });

    itemDatas.map((item) => {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        amt: 0,
        amtunit: filters.amtunit,
        baseamt: 0,
        bf_qty: 0,
        bnatur: item.bnatur,
        chk: true,
        custcd: filters.custcd,
        custnm: filters.custnm,
        dlramt: 0,
        dlvdt: filters.dlvdt,
        dwgno: item.dwgno,
        finyn: "N",
        heatno: "",
        insiz: item.insiz,
        itemacnt: item.itemacnt,
        itemcd: item.itemcd,
        itemlvl1: item.itemlvl1,
        itemlvl2: item.itemlvl2,
        itemlvl3: item.itemlvl3,
        itemnm: item.itemnm,
        itemno: item.itemno,
        len: 0,
        length: 0,
        lenunit: "",
        location: sessionLocation,
        model: item.model,
        orddt: filters.orddt,
        ordkey: "",
        ordnum: ordnum,
        orgdiv: sessionOrgdiv,
        out_qty: 0,
        pac: "",
        poregseq: 0,
        purcustcd: "",
        purcustnm: "",
        purkey: "",
        qty: 1,
        qtyunit: item.invunit,
        rcvcustcd: filters.rcvcustcd,
        remark: item.remark,
        sale_qty: 0,
        specialunp: 0,
        specialamt: 0,
        taxamt: 0,
        thickness: 0,
        totamt: 0,
        totlen: 0,
        totwgt: 0,
        unitwgt: item.unitwgt,
        unp: 0,
        unpcalmeth: "Q",
        uschgrat: filters.uschgrat,
        wgtunit: "",
        width: 0,
        wonamt: 0,
        wonchgrat: filters.wonchgrat,
        rowstatus: "N",
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amt: 0,
      amtunit: filters.amtunit,
      baseamt: 0,
      bf_qty: 0,
      bnatur: "",
      chk: true,
      custcd: filters.custcd,
      custnm: filters.custnm,
      dlramt: 0,
      dlvdt: filters.dlvdt,
      dwgno: "",
      finyn: "N",
      heatno: "",
      insiz: "",
      itemacnt: "",
      itemcd: "",
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      itemnm: "",
      itemno: "",
      len: 0,
      length: 0,
      lenunit: "",
      location: sessionLocation,
      model: "",
      orddt: filters.orddt,
      ordkey: "",
      ordnum: ordnum,
      orgdiv: sessionOrgdiv,
      out_qty: 0,
      pac: "",
      poregseq: 0,
      purcustcd: "",
      purcustnm: "",
      purkey: "",
      qty: 1,
      qtyunit: "",
      rcvcustcd: filters.rcvcustcd,
      remark: "",
      sale_qty: 0,
      specialunp: 0,
      specialamt: 0,
      taxamt: 0,
      thickness: 0,
      totamt: 0,
      totlen: 0,
      totwgt: 0,
      unitwgt: 0,
      unp: 0,
      unpcalmeth: "Q",
      uschgrat: filters.uschgrat,
      wgtunit: "",
      width: 0,
      wonamt: 0,
      wonchgrat: filters.wonchgrat,
      rowstatus: "N",
    };
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedRows.push(newData2);
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
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onCopyClick = () => {
    if (Object.getOwnPropertyNames(selectedState)[0] == undefined) {
      alert("데이터가 없습니다.");
    } else {
      const datas = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      mainDataResult.data.map((item) => {
        if (item[DATA_ITEM_KEY] > temp) {
          temp = item[DATA_ITEM_KEY];
        }
      });

      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        amt: datas.amt,
        amtunit: datas.amtunit,
        baseamt: datas.baseamt,
        bf_qty: datas.bf_qty,
        bnatur: datas.bnatur,
        chk: datas.chk,
        custcd: datas.custcd,
        custnm: datas.custnm,
        dlramt: datas.dlramt,
        dlvdt: datas.dlvdt,
        dwgno: datas.dwgno,
        finyn: datas.finyn,
        heatno: datas.heatno,
        insiz: datas.insiz,
        itemacnt: datas.itemacnt,
        itemcd: datas.itemcd,
        itemlvl1: datas.itemlvl1,
        itemlvl2: datas.itemlvl2,
        itemlvl3: datas.itemlvl3,
        itemnm: datas.itemnm,
        itemno: datas.itemno,
        len: datas.len,
        length: datas.length,
        lenunit: datas.lenunit,
        location: datas.location,
        model: datas.model,
        orddt: datas.orddt,
        ordkey: datas.ordkey,
        ordnum: datas.ordnum,
        orgdiv: datas.orgdiv,
        out_qty: datas.out_qty,
        pac: datas.pac,
        poregseq: datas.poregseq,
        purcustcd: datas.purcustcd,
        purcustnm: datas.purcustnm,
        purkey: datas.purkey,
        qty: datas.qty,
        qtyunit: datas.qtyunit,
        rcvcustcd: datas.rcvcustcd,
        remark: datas.remark,
        sale_qty: datas.sale_qty,
        specialunp: datas.specialunp,
        specialamt: datas.specialamt,
        taxamt: datas.taxamt,
        thickness: datas.thickness,
        totamt: datas.totamt,
        totlen: datas.totlen,
        totwgt: datas.totwgt,
        unitwgt: datas.unitwgt,
        unp: datas.unp,
        unpcalmeth: datas.unpcalmeth,
        uschgrat: datas.uschgrat,
        wgtunit: datas.wgtunit,
        width: datas.width,
        wonamt: datas.wonamt,
        wonchgrat: datas.wonchgrat,
        rowstatus: "N",
      };
      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
    }
  };

  const onItemMultiWndClick = () => {
    setEditIndex(undefined);
    setItemMultiWindowVisible(true);
  };

  return (
    <Window
      titles={workType == "N" ? "수주생성" : "수주정보"}
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
                    <th>수주번호</th>
                    <td>
                      <Input
                        name="ordnum"
                        type="text"
                        value={filters.ordnum}
                        className="readonly"
                      />
                    </td>
                    <th>내수구분</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="doexdiv"
                          value={filters.doexdiv}
                          type="new"
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
                          type="new"
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
                          type="new"
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>수주일자</th>
                    <td>
                      <DatePicker
                        name="orddt"
                        value={filters.orddt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                        placeholder=""
                        className="required"
                      />
                    </td>
                    <th>납기일자</th>
                    <td>
                      <DatePicker
                        name="dlvdt"
                        value={filters.dlvdt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                        placeholder=""
                        className="required"
                      />
                    </td>
                    <th>수주상태</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="ordsts"
                          value={filters.ordsts}
                          type="new"
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                        />
                      )}
                    </td>
                    <th>수주형태</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="ordtype"
                          value={filters.ordtype}
                          type="new"
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
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
                    <th>인수처코드</th>
                    <td>
                      <Input
                        name="rcvcustcd"
                        type="text"
                        value={filters.rcvcustcd}
                        onChange={filterInputChange}
                      />
                      <ButtonInInput>
                        <Button
                          onClick={onRcvcustWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
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
                  </tr>
                  <tr>
                    <th>프로젝트</th>
                    <td>
                      <Input
                        name="project"
                        type="text"
                        value={filters.project}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>부서</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="dptcd"
                          value={filters.dptcd}
                          type="new"
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
                          type="new"
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          textField="user_name"
                          valueField="user_id"
                        />
                      )}
                    </td>
                    <th>화폐단위</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="amtunit"
                          value={filters.amtunit}
                          type="new"
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>견적번호</th>
                    <td>
                      <Input
                        name="quokey"
                        type="text"
                        value={filters.quokey}
                        className="readonly"
                      />
                    </td>
                    <th>인도조건</th>
                    <td>
                      <Input
                        name="prcterms"
                        type="text"
                        value={filters.prcterms}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>지불조건</th>
                    <td>
                      <Input
                        name="paymeth"
                        type="text"
                        value={filters.paymeth}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>납기조건</th>
                    <td>
                      <Input
                        name="dlv_method"
                        type="text"
                        value={filters.dlv_method}
                        onChange={filterInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>선적지</th>
                    <td>
                      <Input
                        name="portnm"
                        type="text"
                        value={filters.portnm}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>선적방법</th>
                    <td>
                      <Input
                        name="ship_method"
                        type="text"
                        value={filters.ship_method}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>PO번호</th>
                    <td>
                      <Input
                        name="poregnum"
                        type="text"
                        value={filters.poregnum}
                        onChange={filterInputChange}
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
                          onClick={onAttachmentsWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                  </tr>
                  <tr>
                    <th>대미환율</th>
                    <td>
                      <Input
                        name="uschgrat"
                        type="number"
                        value={filters.uschgrat}
                        onChange={filterInputChange}
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
                        onClick={onItemMultiWndClick}
                        icon="folder-open"
                        disabled={permissions.save ? false : true}
                      >
                        품목참조
                      </Button>
                      <Button
                        themeColor={"primary"}
                        onClick={onAddClick}
                        icon="plus"
                        title="행 추가"
                        disabled={permissions.save ? false : true}
                      />
                      <Button
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onDeleteClick}
                        icon="minus"
                        title="행 삭제"
                        disabled={permissions.save ? false : true}
                      />
                      <Button
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onCopyClick}
                        icon="copy"
                        title="행 복사"
                        disabled={permissions.save ? false : true}
                      />
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
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell2}
                    cell={CheckBoxCell}
                  />
                  <GridColumn field="rowstatus" title=" " width="40px" />
                  <GridColumn
                    field="itemcd"
                    title="품목코드"
                    width="160px"
                    headerCell={RequiredHeader}
                    footerCell={mainTotalFooterCell}
                    cell={ColumnCommandCell}
                    className="required"
                  />
                  <GridColumn
                    field="itemnm"
                    title="품목명"
                    width="180px"
                    headerCell={RequiredHeader}
                    className="required"
                  />
                  <GridColumn field="insiz" title="규격" width="200px" />
                  <GridColumn
                    field="itemacnt"
                    title="품목계정"
                    width="120px"
                    cell={CustomComboBoxCell}
                    headerCell={RequiredHeader}
                    className="required"
                  />
                  <GridColumn
                    field="qty"
                    title="수주량"
                    width="120px"
                    cell={NumberCell}
                    headerCell={RequiredHeader}
                    footerCell={editNumberFooterCell}
                    className="required"
                  />
                  <GridColumn
                    field="qtyunit"
                    title="단위"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="unp"
                    title="단가"
                    width="120px"
                    cell={NumberCell}
                    headerCell={RequiredHeader}
                    className="required"
                  />
                  <GridColumn
                    field="wonamt"
                    title="금액"
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
                  <GridColumn
                    field="totamt"
                    title="합계금액"
                    width="120px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn field="remark" title="비고" width="120px" />
                  <GridColumn field="purcustnm" title="발주처" width="120px" />
                  <GridColumn
                    field="out_qty"
                    title="출하수량"
                    width="120px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="sale_qty"
                    title="판매수량"
                    width="120px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="finyn"
                    title="완료여부"
                    width="120px"
                    cell={CheckBoxReadOnlyCell}
                  />
                  <GridColumn
                    field="bf_qty"
                    title="LOT수량"
                    width="120px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn field="lotnum" title="LOT NO" width="120px" />
                </Grid>
                <BottomContainer className="BottomContainer">
                  <ButtonContainer>
                    {permissions.save && (
                      <Button themeColor={"primary"} onClick={handleSubmit}>
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
                  <th>수주번호</th>
                  <td>
                    <Input
                      name="ordnum"
                      type="text"
                      value={filters.ordnum}
                      className="readonly"
                    />
                  </td>
                  <th>내수구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="doexdiv"
                        value={filters.doexdiv}
                        type="new"
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
                        type="new"
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
                        type="new"
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>수주일자</th>
                  <td>
                    <DatePicker
                      name="orddt"
                      value={filters.orddt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <th>납기일자</th>
                  <td>
                    <DatePicker
                      name="dlvdt"
                      value={filters.dlvdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <th>수주상태</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="ordsts"
                        value={filters.ordsts}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>수주형태</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="ordtype"
                        value={filters.ordtype}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
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
                  <th>인수처코드</th>
                  <td>
                    <Input
                      name="rcvcustcd"
                      type="text"
                      value={filters.rcvcustcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onRcvcustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
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
                </tr>
                <tr>
                  <th>프로젝트</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>부서</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dptcd"
                        value={filters.dptcd}
                        type="new"
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
                        type="new"
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                  <th>화폐단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="amtunit"
                        value={filters.amtunit}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>견적번호</th>
                  <td>
                    <Input
                      name="quokey"
                      type="text"
                      value={filters.quokey}
                      className="readonly"
                    />
                  </td>
                  <th>인도조건</th>
                  <td>
                    <Input
                      name="prcterms"
                      type="text"
                      value={filters.prcterms}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>지불조건</th>
                  <td>
                    <Input
                      name="paymeth"
                      type="text"
                      value={filters.paymeth}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>납기조건</th>
                  <td>
                    <Input
                      name="dlv_method"
                      type="text"
                      value={filters.dlv_method}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>선적지</th>
                  <td>
                    <Input
                      name="portnm"
                      type="text"
                      value={filters.portnm}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>선적방법</th>
                  <td>
                    <Input
                      name="ship_method"
                      type="text"
                      value={filters.ship_method}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>PO번호</th>
                  <td>
                    <Input
                      name="poregnum"
                      type="text"
                      value={filters.poregnum}
                      onChange={filterInputChange}
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
                        onClick={onAttachmentsWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                </tr>
                <tr>
                  <th>대미환율</th>
                  <td>
                    <Input
                      name="uschgrat"
                      type="number"
                      value={filters.uschgrat}
                      onChange={filterInputChange}
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
                    onClick={onItemMultiWndClick}
                    icon="folder-open"
                    disabled={permissions.save ? false : true}
                  >
                    품목참조
                  </Button>
                  <Button
                    themeColor={"primary"}
                    onClick={onAddClick}
                    icon="plus"
                    title="행 추가"
                    disabled={permissions.save ? false : true}
                  />
                  <Button
                    themeColor={"primary"}
                    fillMode="outline"
                    onClick={onDeleteClick}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  />
                  <Button
                    themeColor={"primary"}
                    fillMode="outline"
                    onClick={onCopyClick}
                    icon="copy"
                    title="행 복사"
                    disabled={permissions.save ? false : true}
                  />
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
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell2}
                  cell={CheckBoxCell}
                />
                <GridColumn field="rowstatus" title=" " width="40px" />
                <GridColumn
                  field="itemcd"
                  title="품목코드"
                  width="160px"
                  headerCell={RequiredHeader}
                  footerCell={mainTotalFooterCell}
                  cell={ColumnCommandCell}
                  className="required"
                />
                <GridColumn
                  field="itemnm"
                  title="품목명"
                  width="180px"
                  headerCell={RequiredHeader}
                  className="required"
                />
                <GridColumn field="insiz" title="규격" width="200px" />
                <GridColumn
                  field="itemacnt"
                  title="품목계정"
                  width="120px"
                  cell={CustomComboBoxCell}
                  headerCell={RequiredHeader}
                  className="required"
                />
                <GridColumn
                  field="qty"
                  title="수주량"
                  width="120px"
                  cell={NumberCell}
                  headerCell={RequiredHeader}
                  footerCell={editNumberFooterCell}
                  className="required"
                />
                <GridColumn
                  field="qtyunit"
                  title="단위"
                  width="120px"
                  cell={CustomComboBoxCell}
                />
                <GridColumn
                  field="unp"
                  title="단가"
                  width="120px"
                  cell={NumberCell}
                  headerCell={RequiredHeader}
                  className="required"
                />
                <GridColumn
                  field="wonamt"
                  title="금액"
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
                <GridColumn
                  field="totamt"
                  title="합계금액"
                  width="120px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn field="remark" title="비고" width="120px" />
                <GridColumn field="purcustnm" title="발주처" width="120px" />
                <GridColumn
                  field="out_qty"
                  title="출하수량"
                  width="120px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="sale_qty"
                  title="판매수량"
                  width="120px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn
                  field="finyn"
                  title="완료여부"
                  width="120px"
                  cell={CheckBoxReadOnlyCell}
                />
                <GridColumn
                  field="bf_qty"
                  title="LOT수량"
                  width="120px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn field="lotnum" title="LOT NO" width="120px" />
              </Grid>
            </GridContainer>
          </FormContext.Provider>
          <BottomContainer className="BottomContainer">
            <ButtonContainer>
              {permissions.save && (
                <Button themeColor={"primary"} onClick={handleSubmit}>
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
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={""} //신규 : N, 수정 : U
          setData={setCustData}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={""} //신규 : N, 수정 : U
          setData={setCustData2}
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
      {itemMultiWindowVisible && (
        <ItemsMultiWindow
          setVisible={setItemMultiWindowVisible}
          setData={addItemData}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
