import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
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
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import { Iparameters } from "../../store/types";
import CheckBoxReadOnlyCell from "../Cells/CheckBoxReadOnlyCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getItemQuery,
  getQueryFromBizComponent,
  numberWithCommas,
  setDefaultDate,
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
import CopyWindow3 from "./BA_A0080W_Copy_Window";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import CopyWindow2 from "./MA_A2000W_BOM_Window";
import CopyWindow1 from "./MA_A2700W_BOM_Window";
import CopyWindow4 from "./MA_A2700W_Orders_Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};

type TdataArr = {
  rowstatus_s: string[];
  purseq_s: string[];
  ordnum_s: string[];
  ordseq_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  itemacnt_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  amtunit_s: string[];
  dlramt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  lotnum_s: string[];
  remark_s: string[];
  finyn_s: string[];
  inexpdt_s: string[];
};

type Idata = {
  amt: number;
  amtunit: string;
  appyn: string;
  attdatnum: string;
  baseamt: number;
  cnt: number;
  custcd: string;
  custnm: string;
  custprsncd: string;
  dlv_method: string;
  doexdiv: string;
  files: string;
  finyn: string;
  inamt: number;
  indt: string;
  inexpdt: string;
  inqty: number;
  inwgt: number;
  location: string;
  num: number;
  ordnum: string;
  orgdiv: string;
  paymeth: string;
  person: string;
  pgmdiv: string;
  prcterms: string;
  purdt: string;
  purnum: string;
  pursts: string;
  purtype: string;
  qty: number;
  rcvcustcd: string;
  rcvcustnm: string;
  remark: string;
  taxamt: number;
  taxdiv: string;
  totamt: number;
  uschgrat: number;
  wgt: number;
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
  let isInEdit = field === dataItem.inEdit;
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
      {render === undefined
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

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA019,L_BA015,L_BA061", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "unpcalmeth"
      ? "L_BA019"
      : field === "qtyunit"
      ? "L_BA015"
      : field === "itemacnt"
      ? "L_BA061"
      : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  modal = false,
  pathname
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 900,
  });
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const DATA_ITEM_KEY = "num";
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

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
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
        pursts: defaultOption.find((item: any) => item.id === "pursts")
          .valueCode,
        finyn: defaultOption.find((item: any) => item.id === "finyn").valueCode,
        doexdiv: defaultOption.find((item: any) => item.id === "doexdiv")
          .valueCode,
        taxdiv: defaultOption.find((item: any) => item.id === "taxdiv")
          .valueCode,
        amtunit: defaultOption.find((item: any) => item.id === "amtunit")
          .valueCode,
        purdt: setDefaultDate(customOptionData, "purdt"),
        inexpdt: setDefaultDate(customOptionData, "inexpdt"),
        custprsncd: defaultOption.find((item: any) => item.id === "custprsncd")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA015",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );

      fetchQuery(qtyunitQueryStr, setQtyunitListData);
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
            insiz: itemInfo.insiz,
            model: itemInfo.model,
            bnatur: itemInfo.bnatur,
            itemacnt: itemInfo.itemacnt,
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
            rowstatus: item.rowstatus === "N" ? "N" : "U",
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

      if (data.isSuccess === true) {
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

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
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

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
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
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_MA_A2000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(new Date()),
        "@p_todt": convertDateToStr(new Date()),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_person": filters.person,
        "@p_pursts": filters.pursts,
        "@p_purnum": filters.purnum,
        "@p_finyn": filters.finyn,
        "@p_pursiz": "",
        "@p_doexdiv": filters.doexdiv,
        "@p_purdt": convertDateToStr(filters.purdt),
        "@p_amtunit": filters.amtunit,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
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
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (workType === "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
        person: data.person,
        location: data.location,
        pursts: data.pursts,
        purnum: data.purnum,
        finyn: data.finyn,
        doexdiv: data.doexdiv,
        amtunit: data.amtunit,
        purdt: toDate(data.purdt),
        inexpdt: toDate(data.inexpdt),
        taxdiv: data.taxdiv,
        wonchgrat: data.wonchgrat,
        uschgrat: data.uschgrat,
        custprsncd: data.custprsncd,
        prcterms: data.prcterms,
        rcvcustcd: data.rcvcustcd,
        rcvcustnm: data.rcvcustnm,
        files: data.files,
        attdatnum: data.attdatnum,
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

  const setCopyData = (data: any) => {
    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0) return false;

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
        unpcalmeth: "Q",
        num: ++temp,
        rowstatus: "N",
      };
    });

    try {
      rows.map((item: any) => {
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
        총{" "}
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
        ? (sum += parseFloat(item[props.field] == "" || item[props.field] == undefined ? 0 : item[props.field]))
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
    let valid = true;
    mainDataResult.data.map((item) => {
      if (item.qty == 0 && valid == true) {
        alert("수량을 채워주세요.");
        valid = false;
        return false;
      }
    });

    if (valid == true) {
      try {
        if (mainDataResult.data.length == 0) {
          throw findMessage(messagesData, "MA_A2000W_004");
        } else if (
          convertDateToStr(filters.purdt).substring(0, 4) < "1997" ||
          convertDateToStr(filters.purdt).substring(6, 8) > "31" ||
          convertDateToStr(filters.purdt).substring(6, 8) < "01" ||
          convertDateToStr(filters.purdt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "MA_A2000W_001");
        } else if (
          filters.doexdiv == null ||
          filters.doexdiv == "" ||
          filters.doexdiv == undefined
        ) {
          throw findMessage(messagesData, "MA_A2000W_003");
        } else if (
          filters.location == null ||
          filters.location == "" ||
          filters.location == undefined
        ) {
          throw findMessage(messagesData, "MA_A2000W_002");
        } else if (
          filters.custcd == null ||
          filters.custcd == "" ||
          filters.custcd == undefined
        ) {
          throw findMessage(messagesData, "MA_A2000W_005");
        } else if (
          filters.custnm == null ||
          filters.custnm == "" ||
          filters.custnm == undefined
        ) {
          throw findMessage(messagesData, "MA_A2000W_006");
        } else if (
          filters.taxdiv == null ||
          filters.taxdiv == "" ||
          filters.taxdiv == undefined
        ) {
          throw findMessage(messagesData, "MA_A2400W_006");
        } else if (
          filters.amtunit == null ||
          filters.amtunit == "" ||
          filters.amtunit == undefined
        ) {
          throw findMessage(messagesData, "MA_A2000W_007");
        } else {
          if (valid == true) {
            const dataItem = mainDataResult.data.filter((item: any) => {
              return (
                (item.rowstatus === "N" || item.rowstatus === "U") &&
                item.rowstatus !== undefined
              );
            });

            if (dataItem.length === 0 && deletedMainRows.length == 0) {
              setParaData((prev) => ({
                ...prev,
                workType: workType,
                amtunit: filters.amtunit,
                attdatnum: filters.attdatnum,
                custcd: filters.custcd,
                custnm: filters.custnm,
                custprsncd: filters.custprsncd,
                doexdiv: filters.doexdiv,
                files: filters.files,
                inexpdt: filters.inexpdt,
                location: filters.location,
                orgdiv: "01",
                person: filters.person,
                prcterms: filters.prcterms,
                purdt: filters.purdt,
                purnum: filters.purnum,
                pursts: filters.pursts,
                rcvcustcd: filters.rcvcustcd,
                rcvcustnm: filters.rcvcustnm,
                remark: filters.remark,
                taxdiv: filters.taxdiv,
                uschgrat: filters.uschgrat,
                wonchgrat: filters.wonchgrat,
              }));
            } else {
              let dataArr: TdataArr = {
                rowstatus_s: [],
                purseq_s: [],
                ordnum_s: [],
                ordseq_s: [],
                itemcd_s: [],
                itemnm_s: [],
                itemacnt_s: [],
                qty_s: [],
                qtyunit_s: [],
                unpcalmeth_s: [],
                unp_s: [],
                amt_s: [],
                amtunit_s: [],
                dlramt_s: [],
                wonamt_s: [],
                taxamt_s: [],
                lotnum_s: [],
                remark_s: [],
                finyn_s: [],
                inexpdt_s: [],
              };

              dataItem.forEach((item: any, idx: number) => {
                const {
                  rowstatus = "",
                  purseq = "",
                  ordnum = "",
                  ordseq = "",
                  itemcd = "",
                  itemnm = "",
                  itemacnt = "",
                  qty = "",
                  qtyunit = "",
                  unpcalmeth = "",
                  unp = "",
                  amt = "",
                  amtunit = "",
                  dlramt = "",
                  wonamt = "",
                  taxamt = "",
                  lotnum = "",
                  remark = "",
                  finyn = "",
                  inexpdt = "",
                } = item;
                dataArr.rowstatus_s.push(rowstatus);
                dataArr.purseq_s.push(
                  purseq == undefined || purseq == "" ? 0 : purseq
                );
                dataArr.ordnum_s.push(ordnum == undefined ? "" : ordnum);
                dataArr.ordseq_s.push(
                  ordseq == undefined || ordseq == "" ? 0 : ordseq
                );
                dataArr.itemcd_s.push(itemcd);
                dataArr.itemnm_s.push(itemnm);
                dataArr.itemacnt_s.push(itemacnt == undefined ? "" : itemacnt);
                dataArr.qty_s.push(qty == undefined ? 0 : qty);
                dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
                dataArr.unpcalmeth_s.push(
                  unpcalmeth == undefined ? "" : unpcalmeth
                );
                dataArr.unp_s.push(unp == undefined ? 0 : unp);
                dataArr.amt_s.push(amt == undefined ? 0 : amt);
                dataArr.amtunit_s.push(amtunit == undefined ? "" : amtunit);
                dataArr.dlramt_s.push(
                  dlramt == undefined || dlramt == "" ? 0 : dlramt
                );
                dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
                dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
                dataArr.lotnum_s.push(lotnum == undefined ? "" : lotnum);
                dataArr.remark_s.push(remark == undefined ? "" : remark);
                dataArr.finyn_s.push(finyn == undefined ? "N" : finyn);
                dataArr.inexpdt_s.push(inexpdt == undefined ? "" : inexpdt);
              });
              deletedMainRows.forEach((item: any, idx: number) => {
                const {
                  rowstatus = "",
                  purseq = "",
                  ordnum = "",
                  ordseq = "",
                  itemcd = "",
                  itemnm = "",
                  itemacnt = "",
                  qty = "",
                  qtyunit = "",
                  unpcalmeth = "",
                  unp = "",
                  amt = "",
                  amtunit = "",
                  dlramt = "",
                  wonamt = "",
                  taxamt = "",
                  lotnum = "",
                  remark = "",
                  finyn = "",
                  inexpdt = "",
                } = item;
                dataArr.rowstatus_s.push(rowstatus);
                dataArr.purseq_s.push(
                  purseq == undefined || purseq == "" ? 0 : purseq
                );
                dataArr.ordnum_s.push(ordnum == undefined ? "" : ordnum);
                dataArr.ordseq_s.push(
                  ordseq == undefined || ordseq == "" ? 0 : ordseq
                );
                dataArr.itemcd_s.push(itemcd);
                dataArr.itemnm_s.push(itemnm);
                dataArr.itemacnt_s.push(itemacnt == undefined ? "" : itemacnt);
                dataArr.qty_s.push(qty == undefined ? 0 : qty);
                dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
                dataArr.unpcalmeth_s.push(
                  unpcalmeth == undefined ? "" : unpcalmeth
                );
                dataArr.unp_s.push(unp == undefined ? 0 : unp);
                dataArr.amt_s.push(amt == undefined ? 0 : amt);
                dataArr.amtunit_s.push(amtunit == undefined ? "" : amtunit);
                dataArr.dlramt_s.push(
                  dlramt == undefined || dlramt == "" ? 0 : dlramt
                );
                dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
                dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
                dataArr.lotnum_s.push(lotnum == undefined ? "" : lotnum);
                dataArr.remark_s.push(remark == undefined ? "" : remark);
                dataArr.finyn_s.push(finyn == undefined ? "N" : finyn);
                dataArr.inexpdt_s.push(inexpdt == undefined ? "" : inexpdt);
              });
              setParaData((prev) => ({
                ...prev,
                workType: workType,
                amtunit: filters.amtunit,
                attdatnum: filters.attdatnum,
                custcd: filters.custcd,
                custnm: filters.custnm,
                custprsncd: filters.custprsncd,
                doexdiv: filters.doexdiv,
                files: filters.files,
                inexpdt: filters.inexpdt,
                location: filters.location,
                orgdiv: "01",
                person: filters.person,
                prcterms: filters.prcterms,
                purdt: filters.purdt,
                purnum: filters.purnum,
                pursts: filters.pursts,
                rcvcustcd: filters.rcvcustcd,
                rcvcustnm: filters.rcvcustnm,
                remark: filters.remark,
                taxdiv: filters.taxdiv,
                uschgrat: filters.uschgrat,
                wonchgrat: filters.wonchgrat,
                rowstatus_s: dataArr.rowstatus_s.join("|"),
                purseq_s: dataArr.purseq_s.join("|"),
                ordnum_s: dataArr.ordnum_s.join("|"),
                ordseq_s: dataArr.ordseq_s.join("|"),
                itemcd_s: dataArr.itemcd_s.join("|"),
                itemnm_s: dataArr.itemnm_s.join("|"),
                itemacnt_s: dataArr.itemacnt_s.join("|"),
                qty_s: dataArr.qty_s.join("|"),
                qtyunit_s: dataArr.qtyunit_s.join("|"),
                unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
                unp_s: dataArr.unp_s.join("|"),
                amt_s: dataArr.amt_s.join("|"),
                amtunit_s: dataArr.amtunit_s.join("|"),
                dlramt_s: dataArr.dlramt_s.join("|"),
                wonamt_s: dataArr.wonamt_s.join("|"),
                taxamt_s: dataArr.taxamt_s.join("|"),
                lotnum_s: dataArr.lotnum_s.join("|"),
                remark_s: dataArr.remark_s.join("|"),
                finyn_s: dataArr.finyn_s.join("|"),
                inexpdt_s: dataArr.inexpdt_s.join("|"),
              }));
            }
          }
        }
      } catch (e) {
        alert(e);
      }
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    location: "01",
    purnum: "",
    doexdiv: "",
    purdt: new Date(),
    inexpdt: new Date(),
    custcd: "",
    custnm: "",
    custprsncd: "",
    rcvcustcd: "",
    rcvcustnm: "",
    prcterms: "",
    amtunit: "",
    baseamt: 0,
    wonchgrat: 0,
    uschgrat: 0,
    person: "admin",
    taxdiv: "A",
    remark: "",
    attdatnum: "",
    purtype: "",
    pursts: "",
    paymeth: "",
    dlv_method: "",
    rowstatus_s: "",
    purseq_s: "",
    ordnum_s: "",
    ordseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    qty_s: "",
    qtyunit_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    amtunit_s: "",
    dlramt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    lotnum_s: "",
    remark_s: "",
    finyn_s: "",
    inexpdt_s: "",
    userid: userId,
    pc: pc,
    form_id: "MA_A2000W",
  });

  const para: Iparameters = {
    procedureName: "P_MA_A2000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": "01",
      "@p_location": ParaData.location,
      "@p_purnum": ParaData.purnum,
      "@p_doexdiv": ParaData.doexdiv,
      "@p_purdt": convertDateToStr(ParaData.purdt),
      "@p_inexpdt": convertDateToStr(ParaData.inexpdt),
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_custprsncd": ParaData.custprsncd,
      "@p_rcvcustcd": ParaData.rcvcustcd,
      "@p_rcvcustnm": ParaData.rcvcustnm,
      "@p_prcterms": ParaData.prcterms,
      "@p_amtunit": ParaData.amtunit,
      "@p_baseamt": ParaData.baseamt,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_uschgrat": ParaData.uschgrat,
      "@p_person": ParaData.person,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_remark": ParaData.remark,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_purtype": ParaData.purtype,
      "@p_pursts": ParaData.pursts,
      "@p_paymeth": ParaData.paymeth,
      "@p_dlv_method": ParaData.dlv_method,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_purseq_s": ParaData.purseq_s,
      "@p_ordnum_s": ParaData.ordnum_s,
      "@p_ordseq_s": ParaData.ordseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_amtunit_s": ParaData.amtunit_s,
      "@p_dlramt_s": ParaData.dlramt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_finyn_s": ParaData.finyn_s,
      "@p_inexpdt_s": ParaData.inexpdt_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A2000W",
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
        orgdiv: "01",
        location: "01",
        purnum: "",
        doexdiv: "",
        purdt: new Date(),
        inexpdt: new Date(),
        custcd: "",
        custnm: "",
        custprsncd: "",
        rcvcustcd: "",
        rcvcustnm: "",
        prcterms: "",
        amtunit: "",
        baseamt: 0,
        wonchgrat: 0,
        uschgrat: 0,
        person: "admin",
        taxdiv: "A",
        remark: "",
        attdatnum: "",
        purtype: "",
        pursts: "",
        paymeth: "",
        dlv_method: "",
        rowstatus_s: "",
        purseq_s: "",
        ordnum_s: "",
        ordseq_s: "",
        itemcd_s: "",
        itemnm_s: "",
        itemacnt_s: "",
        qty_s: "",
        qtyunit_s: "",
        unpcalmeth_s: "",
        unp_s: "",
        amt_s: "",
        amtunit_s: "",
        dlramt_s: "",
        wonamt_s: "",
        taxamt_s: "",
        lotnum_s: "",
        remark_s: "",
        finyn_s: "",
        inexpdt_s: "",
        userid: userId,
        pc: pc,
        form_id: "MA_A2000W",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s.length != 0 || ParaData.custcd != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

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
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
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
      field == "amt" ||
      field == "totamt" ||
      field == "wonamt" ||
      field == "taxamt" ||
      field == "rowstatus" ||
      field == "ordkey"
    ) {
      valid = false;
      return false;
    }
    if (valid == true) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
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
                    ? Math.round((item.qty * item.unp) / 10)
                    : Math.round(
                        (item.qty * item.unp * filters.wonchgrat) / 10
                      ),
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
          if (editIndex === item[DATA_ITEM_KEY]) {
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
      amtunit: "",
      chk: "",
      custcd: "",
      custnm: "",
      dlramt: 0,
      doexdiv: "",
      finyn: "",
      indt: "",
      inexpdt: "",
      inqty: 0,
      insiz: "",
      itemacnt: "",
      itemcd: "",
      itemnm: "",
      location: "",
      lotnum: "",
      ordkey: "",
      ordnum: "",
      ordseq: 0,
      orgdiv: "01",
      pgmdiv: "",
      purdt: "",
      purnum: "",
      purseq: 0,
      pursts: "",
      purtype: "",
      qty: 0,
      qtyunit: "",
      rcvcustcd: "",
      rcvcustnm: "",
      remark: "",
      taxamt: 0,
      taxdiv: "",
      totamt: 0,
      unp: 0,
      unpcalmeth: "Q",
      uschgrat: 0,
      wgt: 0,
      wgtunit: "",
      wonamt: 0,
      wonchgrat: 0,
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

  return (
    <>
      <Window
        title={workType === "N" ? "자재발주생성" : "자재발주정보"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap style={{ paddingRight: "50px" }}>
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
                <th>화폐단위</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="amtunit"
                      value={filters.amtunit}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
                    />
                  )}
                </td>
              </tr>
              <tr>
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
                <th>인도조건</th>
                <td>
                  <Input
                    name="prcterms"
                    type="text"
                    value={filters.prcterms}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
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
                      onClick={onCustWndClick2}
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
        <FormContext.Provider
          value={{
            itemInfo,
            setItemInfo,
          }}
        >
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>상세정보</GridTitle>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  onClick={onCopyWndClick2}
                  icon="folder-open"
                >
                  BOM
                </Button>
                <Button
                  themeColor={"primary"}
                  onClick={onCopyWndClick}
                  icon="folder-open"
                >
                  수주BOM
                </Button>
                <Button
                  themeColor={"primary"}
                  onClick={onCopyWndClick3}
                  icon="folder-open"
                >
                  품목
                </Button>
                <Button
                  themeColor={"primary"}
                  onClick={onCopyWndClick4}
                  icon="folder-open"
                >
                  수주
                </Button>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                ></Button>
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
              style={{ height: "450px" }}
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
                field="itemcd"
                title="품목코드"
                width="150px"
                cell={ColumnCommandCell}
                footerCell={mainTotalFooterCell}
              />
              <GridColumn field="itemnm" title="품목명" width="150px" />
              <GridColumn field="insiz" title="규격" width="120px" />
              <GridColumn
                field="itemacnt"
                title="품목계정"
                width="120px"
                cell={CustomComboBoxCell}
              />
              <GridColumn
                field="qty"
                title="발주량"
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
              <GridColumn
                field="finyn"
                title="완료여부"
                width="100px"
                cell={CheckBoxReadOnlyCell}
              />
              <GridColumn field="ordkey" title="수주번호" width="150px" />
            </Grid>
          </GridContainer>
        </FormContext.Provider>
        <BottomContainer>
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
      {CopyWindowVisible && (
        <CopyWindow1 setVisible={setCopyWindowVisible} setData={setCopyData} pathname={pathname}/>
      )}
      {CopyWindowVisible2 && (
        <CopyWindow2 setVisible={setCopyWindowVisible2} setData={setCopyData} pathname={pathname}/>
      )}
      {CopyWindowVisible3 && (
        <CopyWindow3
          setVisible={setCopyWindowVisible3}
          setData={setCopyData}
          itemacnt={""}
          pathname={pathname}
        />
      )}
      {CopyWindowVisible4 && (
        <CopyWindow4 setVisible={setCopyWindowVisible4} setData={setCopyData} pathname={pathname}/>
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

export default CopyWindow;
