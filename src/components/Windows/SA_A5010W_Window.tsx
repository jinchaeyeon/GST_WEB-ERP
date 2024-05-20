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
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
import { IWindowPosition } from "../../hooks/interfaces";
import {
  deletedAttadatnumsState,
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getItemQuery,
  getUnpQuery,
  isValidDate,
  numberWithCommas,
  toDate,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../Renderers/Renderers";
import ItemsMultiWindow from "./BA_A0080W_Copy_Window";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";

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
  seq2_s: string[];
  itemcd_s: string[];
  itemacnt_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  dlramt_s: string[];
  unitwgt_s: string[];
  totwgt_s: string[];
  wgtunit_s: string[];
  remark_s: string[];
};
export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

let temp = 0;
let targetRowIndex: null | number = null;

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
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [itemWindowVisible2, setItemWindowVisible2] = useState<boolean>(false);
  const onItemWndClick2 = () => {
    if (dataItem["rowstatus"] == "N") {
      setItemWindowVisible2(true);
    } else {
      alert("품목코드와 품목명은 수정이 불가합니다.");
    }
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
      {value}
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

type Idata = {
  amt: number;
  amtunit: string;
  attdatnum: string;
  baseamt: number;
  busadiv: string;
  cargocd: string;
  carno: string;
  chk: string;
  custcd: string;
  custnm: string;
  custprsncd: string;
  doexdiv: string;
  dvnm: string;
  dvnum: string;
  files: string;
  finaldes: string;
  location: string;
  num: number;
  orgdiv: string;
  outdt: string;
  outkind: string;
  outtype: string;
  outuse: string;
  person: string;
  pgmdiv: string;
  portnm: string;
  project: string;
  qty: number;
  rcvcustcd: string;
  rcvcustnm: string;
  recdt: string;
  recdtfind: string;
  remark: string;
  reqnum: string;
  seq1: number;
  shipdt: string;
  taxamt: number;
  taxdiv: string;
  taxdt: string;
  taxnu: string;
  taxtype: string;
  totamt: number;
  trcost: number;
  invoiceno: string;
  position: string;
  taxnum: string;
  reckey: string;
  wonamt: number;
  uschgrat: number;
  wonchgrat: number;
};

let deletedMainRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA061,L_BA015,L_BA019", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "itemacnt"
      ? "L_BA061"
      : field == "qtyunit"
      ? "L_BA015"
      : field == "unpcalmeth"
      ? "L_BA019"
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

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 870,
  });
  const DATA_ITEM_KEY = "num";

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
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
        person: defaultOption.find((item: any) => item.id == "person2")
          ?.valueCode,
        doexdiv: defaultOption.find((item: any) => item.id == "doexdiv2")
          ?.valueCode,
        taxdiv: defaultOption.find((item: any) => item.id == "taxdiv2")
          ?.valueCode,
        amtunit: defaultOption.find((item: any) => item.id == "amtunit")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CUST",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

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

  useEffect(() => {
    (async () => {
      if (itemInfo.itemcd == "") {
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] ==
          parseInt(Object.getOwnPropertyNames(selectedState)[0])
            ? {
                ...item,
                itemcd: "",
                itemnm: "",
                itemacnt: "",
                insiz: "",
                qty: 0,
                qtyunit: "",
                unp: 0,
                unpcalmeth: "Q",
                amt: 0,
                wonamt: 0,
                taxamt: 0,
                totamt: 0,
                totwgt: 0,
                dlramt: 0,
                chk: "",
                unitwgt: 0,
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
      } else {
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
                amt:
                  item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * unp
                      : item.qty * unp * filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * unp
                      : (item.len == undefined ? 0 : item.len) *
                        unp *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * unp
                      : item.totwgt * unp * filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat,
                wonamt:
                  item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * unp
                      : item.qty * unp * filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * unp
                      : (item.len == undefined ? 0 : item.len) *
                        unp *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * unp
                      : item.totwgt * unp * filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat,
                taxamt: Math.round(
                  filters.taxdiv == "A"
                    ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                      ? filters.amtunit == "KRW"
                        ? item.qty * unp * 0.1
                        : item.qty * unp * filters.wonchgrat * 0.1
                      : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                      ? filters.amtunit == "KRW"
                        ? (item.len == undefined ? 0 : item.len) * unp * 0.1
                        : (item.len == undefined ? 0 : item.len) *
                          unp *
                          filters.wonchgrat *
                          0.1
                      : item.unpcalmeth == "W"
                      ? filters.amtunit == "KRW"
                        ? item.totwgt * unp * 0.1
                        : item.totwgt * unp * filters.wonchgrat * 0.1
                      : filters.amtunit == "KRW"
                      ? item.amt * 0.1
                      : item.amt * filters.wonchgrat * 0.1
                    : 0
                ),
                totamt: Math.round(
                  (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * unp
                      : item.qty * unp * filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * unp
                      : (item.len == undefined ? 0 : item.len) *
                        unp *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * unp
                      : item.totwgt * unp * filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat) +
                    Math.round(
                      filters.taxdiv == "A"
                        ? filters.amtunit == "KRW"
                          ? (item.qty * unp) / 10
                          : (item.qty * unp * filters.wonchgrat) / 10
                        : 0
                    )
                ),
                dlramt: Math.round(
                  filters.uschgrat != 0
                    ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                        ? filters.amtunit == "KRW"
                          ? item.qty * unp
                          : item.qty * unp * filters.wonchgrat
                        : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                        ? filters.amtunit == "KRW"
                          ? (item.len == undefined ? 0 : item.len) * unp
                          : (item.len == undefined ? 0 : item.len) *
                            unp *
                            filters.wonchgrat
                        : item.unpcalmeth == "W"
                        ? filters.amtunit == "KRW"
                          ? item.totwgt * unp
                          : item.totwgt * unp * filters.wonchgrat
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

        setMainDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      }
    })();
  }, [itemInfo]); 

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

  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [itemMultiWindowVisible, setItemMultiWindowVisible] =
    useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "outdt") {
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
  const fetchUnpItem = async (custcd: string, itemcd: string) => {
    if (custcd == "") return 0;
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
          items.recdt <= convertDateToStr(filters.outdt) &&
          items.itemcd == itemcd
      );
      return unpData.length > 0 ? unpData[0].unp : 0;
    }
  };

  const fetchUnp = async (custcd: string, nowData: any) => {
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
              items.recdt <= convertDateToStr(filters.outdt) &&
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

        if (newData !== nowData) {
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
    if (unsavedAttadatnums.length > 0)
      setDeletedAttadatnums(unsavedAttadatnums);

    setVisible(false);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
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
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    reckey: "",
    outdt: new Date(),
    shipdt: null,
    position: "",
    custcd: "",
    custnm: "",
    person: "",
    amtunit: "",
    taxnum: "",
    rcvcustcd: "",
    rcvcustnm: "",
    doexdiv: "",
    wonchgrat: 1,
    invoiceno: "",
    taxdiv: "",
    uschgrat: 0,
    files: "",
    attdatnum: "",
    remark: "",
    amt: 0,
    qty: 0,
    taxamt: 0,
    wonamt: 0,
    baseamt: 0,
    recdt: new Date(),
    seq1: 0,
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_SA_A5000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": "",
        "@p_position": "",
        "@p_dtgb": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_person": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_rcvcustcd": "",
        "@p_rcvcustnm": "",
        "@p_doexdiv": "",
        "@p_taxdiv": "",
        "@p_taxyn": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_ordkey": "",
        "@p_recdt": convertDateToStr(filters.recdt),
        "@p_seq1": filters.seq1,
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
      setMainDataResult(() => {
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
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (workType == "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        amt: data.amt,
        amtunit: data.amtunit,
        attdatnum: data.attdatnum,
        baseamt: data.baseamt,
        custcd: data.custcd,
        custnm: data.custnm,
        doexdiv: data.doexdiv,
        files: data.files,
        invoiceno: data.invoiceno,
        location: data.location,
        outdt: toDate(data.outdt),
        person: data.person,
        position: data.position,
        qty: data.qty,
        rcvcustcd: data.rcvcustcd,
        rcvcustnm: data.rcvcustnm,
        recdt: toDate(data.recdt),
        reckey: data.reckey,
        remark: data.remark,
        seq1: data.seq1,
        shipdt: isValidDate(data.shipdt)
          ? new Date(dateformat(data.shipdt))
          : null,
        taxamt: data.taxamt,
        taxdiv: data.taxdiv,
        taxnum: data.taxnum,
        uschgrat: data.uschgrat,
        wonamt: data.wonamt,
        wonchgrat: data.wonchgrat,
        isSearch: true,
        pgNum: 1,
      }));
    }
  }, []);

  let gridRef: any = useRef(null);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

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
    setItemMultiWindowVisible(true);
  };

  const setCopyData = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });

    data.map(async (item: any) => {
      var unp = await fetchUnpItem(filters.custcd, item.itemcd);
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        amt: item.amt,
        chk: true,
        dlramt: Math.round(
          filters.uschgrat != 0
            ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * unp
                  : item.qty * unp * filters.wonchgrat
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) * unp
                  : (item.len == undefined ? 0 : item.len) *
                    unp *
                    filters.wonchgrat
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * unp
                  : item.totwgt * unp * filters.wonchgrat
                : filters.amtunit == "KRW"
                ? item.amt
                : item.amt * filters.wonchgrat) * filters.uschgrat
            : 0
        ),
        insiz: item.insiz,
        itemacnt: item.itemacnt,
        itemcd: item.itemcd,
        itemnm: item.itemnm,
        ordkey: "",
        ordnum: "",
        ordseq: 0,
        orgdiv: sessionOrgdiv,
        outrecdt: "",
        outreckey: "",
        outseq1: 0,
        outseq2: 0,
        poregnum: "",
        qty: item.qty,
        qtyunit: item.invunit,
        recdt: convertDateToStr(filters.recdt),
        reckey: filters.reckey,
        remark: "",
        seq1: filters.seq1,
        seq2: 0,
        sort_seq: 0,
        taxamt: item.taxamt,
        totamt: item.totamt,
        unitwgt: item.unitwgt,
        unp: unp,
        unpcalmeth: "Q",
        uschgrat: filters.uschgrat,
        wgtunit: item.wgtunit,
        wonamt: item.wonamt,
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

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    recdt: new Date(),
    seq1: 0,
    location: sessionLocation,
    outdt: new Date(),
    shipdt: new Date(),
    doexdiv: "A",
    taxdiv: "A",
    amtunit: "",
    baseamt: 0,
    wonchgrat: 0,
    uschgrat: 0,
    person: "admin",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    remark: "",
    rowstatus_s: "",
    seq2_s: "",
    itemcd_s: "",
    itemacnt_s: "",
    qty_s: "",
    qtyunit_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    dlramt_s: "",
    unitwgt_s: "",
    totwgt_s: "",
    wgtunit_s: "",
    remark_s: "",
    userid: userId,
    pc: pc,
    files: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A5010W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_recdt": convertDateToStr(ParaData.recdt),
      "@p_seq1": ParaData.seq1,
      "@p_location": ParaData.location,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_shipdt": convertDateToStr(ParaData.shipdt),
      "@p_doexdiv": ParaData.doexdiv,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_amtunit": ParaData.amtunit,
      "@p_baseamt": ParaData.baseamt,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_uschgrat": ParaData.uschgrat,
      "@p_person": ParaData.person,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_rcvcustcd": ParaData.rcvcustcd,
      "@p_rcvcustnm": ParaData.rcvcustnm,
      "@p_remark": ParaData.remark,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_dlramt_s": ParaData.dlramt_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_totwgt_s": ParaData.totwgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_SA_A5010W",
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
      deletedMainRows = [];
      setUnsavedAttadatnums([]);
      reload(data.returnString);
      setValues2(false);
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
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: sessionOrgdiv,
        recdt: new Date(),
        seq1: 0,
        location: sessionLocation,
        outdt: new Date(),
        shipdt: new Date(),
        doexdiv: "A",
        taxdiv: "A",
        amtunit: "",
        baseamt: 0,
        wonchgrat: 0,
        uschgrat: 0,
        person: "admin",
        custcd: "",
        custnm: "",
        rcvcustcd: "",
        rcvcustnm: "",
        remark: "",
        rowstatus_s: "",
        seq2_s: "",
        itemcd_s: "",
        itemacnt_s: "",
        qty_s: "",
        qtyunit_s: "",
        unpcalmeth_s: "",
        unp_s: "",
        amt_s: "",
        wonamt_s: "",
        taxamt_s: "",
        dlramt_s: "",
        unitwgt_s: "",
        totwgt_s: "",
        wgtunit_s: "",
        remark_s: "",
        userid: userId,
        pc: pc,
        files: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    let valid = true;

    try {
      if (mainDataResult.data.length == 0) {
        throw findMessage(messagesData, "SA_A5010W_007");
      } else if (
        convertDateToStr(filters.outdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.outdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.outdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.outdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A5010W_001");
      } else if (
        filters.doexdiv == null ||
        filters.doexdiv == "" ||
        filters.doexdiv == undefined
      ) {
        throw findMessage(messagesData, "SA_A5010W_004");
      } else if (
        filters.custcd == null ||
        filters.custcd == "" ||
        filters.custcd == undefined
      ) {
        throw findMessage(messagesData, "SA_A5010W_005");
      } else if (
        filters.taxdiv == null ||
        filters.taxdiv == "" ||
        filters.taxdiv == undefined
      ) {
        throw findMessage(messagesData, "SA_A5010W_006");
      } else {
        mainDataResult.data.map((item: any) => {
          if (!item.itemcd) {
            throw findMessage(messagesData, "SA_A5010W_008");
          }
          if (item.qty < 1) {
            throw findMessage(messagesData, "SA_A5010W_009");
          }
        });

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
              location: filters.location,
              outdt: filters.outdt,
              shipdt: filters.shipdt,
              doexdiv: filters.doexdiv,
              taxdiv: filters.taxdiv,
              amtunit: filters.amtunit,
              wonchgrat: filters.wonchgrat,
              uschgrat: filters.uschgrat,
              person: filters.person,
              custcd: filters.custcd,
              custnm: filters.custnm,
              recdt: filters.recdt,
              rcvcustcd: filters.rcvcustcd,
              rcvcustnm: filters.rcvcustnm,
              remark: filters.remark,
              seq1: filters.seq1,
              userid: userId,
              pc: pc,
              form_id: "SA_A5010W",
              serviceid: companyCode,
              files: filters.files,
            }));
          } else {
            let dataArr: TdataArr = {
              rowstatus_s: [],
              seq2_s: [],
              itemcd_s: [],
              itemacnt_s: [],
              qty_s: [],
              qtyunit_s: [],
              unpcalmeth_s: [],
              unp_s: [],
              amt_s: [],
              wonamt_s: [],
              taxamt_s: [],
              dlramt_s: [],
              unitwgt_s: [],
              totwgt_s: [],
              wgtunit_s: [],
              remark_s: [],
            };

            dataItem.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                seq2 = "",
                itemcd = "",
                itemacnt = "",
                qty = "",
                qtyunit = "",
                unpcalmeth = "",
                unp = "",
                amt = "",
                wonamt = "",
                taxamt = "",
                dlramt = "",
                unitwgt = "",
                totwgt = "",
                wgtunit = "",
                remark = "",
              } = item;
              dataArr.rowstatus_s.push(rowstatus);
              dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
              dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
              dataArr.itemacnt_s.push(itemacnt == "" ? "" : itemacnt);
              dataArr.qty_s.push(qty == "" ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.unpcalmeth_s.push(
                unpcalmeth == undefined ? "Q" : unpcalmeth
              );
              dataArr.unp_s.push(unp == "" ? 0 : unp);
              dataArr.amt_s.push(amt == "" ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
              dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
              dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
              dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
            });
            deletedMainRows.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                seq2 = "",
                itemcd = "",
                itemacnt = "",
                qty = "",
                qtyunit = "",
                unpcalmeth = "",
                unp = "",
                amt = "",
                wonamt = "",
                taxamt = "",
                dlramt = "",
                unitwgt = "",
                totwgt = "",
                wgtunit = "",
                remark = "",
              } = item;
              dataArr.rowstatus_s.push(rowstatus);
              dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
              dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
              dataArr.itemacnt_s.push(itemacnt == "" ? "" : itemacnt);
              dataArr.qty_s.push(qty == "" ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.unpcalmeth_s.push(
                unpcalmeth == undefined ? "Q" : unpcalmeth
              );
              dataArr.unp_s.push(unp == "" ? 0 : unp);
              dataArr.amt_s.push(amt == "" ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
              dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
              dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
              dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
            });
            setParaData((prev) => ({
              ...prev,
              workType: workType,
              location: filters.location,
              outdt: filters.outdt,
              shipdt: filters.shipdt,
              doexdiv: filters.doexdiv,
              taxdiv: filters.taxdiv,
              amtunit: filters.amtunit,
              wonchgrat: filters.wonchgrat,
              uschgrat: filters.uschgrat,
              person: filters.person,
              custcd: filters.custcd,
              custnm: filters.custnm,
              recdt: filters.recdt,
              rcvcustcd: filters.rcvcustcd,
              rcvcustnm: filters.rcvcustnm,
              remark: filters.remark,
              seq1: filters.seq1,
              userid: userId,
              pc: pc,
              form_id: "SA_A5010W",
              serviceid: companyCode,
              files: filters.files,
              rowstatus_s: dataArr.rowstatus_s.join("|"),
              seq2_s: dataArr.seq2_s.join("|"),
              itemcd_s: dataArr.itemcd_s.join("|"),
              itemacnt_s: dataArr.itemacnt_s.join("|"),
              qty_s: dataArr.qty_s.join("|"),
              qtyunit_s: dataArr.qtyunit_s.join("|"),
              unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
              unp_s: dataArr.unp_s.join("|"),
              amt_s: dataArr.amt_s.join("|"),
              dlramt_s: dataArr.dlramt_s.join("|"),
              wonamt_s: dataArr.wonamt_s.join("|"),
              taxamt_s: dataArr.taxamt_s.join("|"),
              unitwgt_s: dataArr.unitwgt_s.join("|"),
              totwgt_s: dataArr.totwgt_s.join("|"),
              wgtunit_s: dataArr.wgtunit_s.join("|"),
              remark_s: dataArr.remark_s.join("|"),
            }));
          }
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    if (ParaData.custcd != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
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
      field != "itemnm" &&
      field != "totamt" &&
      field != "dlramt" &&
      field != "rowstatus"
    ) {
      if (!(field == "itemcd" && dataItem.rowstatus != "N")) {
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
    } else {
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };
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

  const exitEdit = async () => {
    if (tempResult.data != mainDataResult.data) {
      if (editedField !== "itemcd") {
        const itemcd = mainDataResult.data.filter(
          (item) =>
            item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        )[0];
        var unp = await fetchUnpItem(filters.custcd, itemcd.itemcd);
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                unp: unp,
                amt:
                  item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * unp
                      : item.qty * unp * filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * unp
                      : (item.len == undefined ? 0 : item.len) *
                        unp *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * unp
                      : item.totwgt * unp * filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat,
                wonamt:
                  item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * unp
                      : item.qty * unp * filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * unp
                      : (item.len == undefined ? 0 : item.len) *
                        unp *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * unp
                      : item.totwgt * unp * filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat,
                taxamt: Math.round(
                  filters.taxdiv == "A"
                    ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                      ? filters.amtunit == "KRW"
                        ? item.qty * unp * 0.1
                        : item.qty * unp * filters.wonchgrat * 0.1
                      : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                      ? filters.amtunit == "KRW"
                        ? (item.len == undefined ? 0 : item.len) * unp * 0.1
                        : (item.len == undefined ? 0 : item.len) *
                          unp *
                          filters.wonchgrat *
                          0.1
                      : item.unpcalmeth == "W"
                      ? filters.amtunit == "KRW"
                        ? item.totwgt * unp * 0.1
                        : item.totwgt * unp * filters.wonchgrat * 0.1
                      : filters.amtunit == "KRW"
                      ? item.amt * 0.1
                      : item.amt * filters.wonchgrat * 0.1
                    : 0
                ),
                totamt: Math.round(
                  (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * unp
                      : item.qty * unp * filters.wonchgrat
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * unp
                      : (item.len == undefined ? 0 : item.len) *
                        unp *
                        filters.wonchgrat
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * unp
                      : item.totwgt * unp * filters.wonchgrat
                    : filters.amtunit == "KRW"
                    ? item.amt
                    : item.amt * filters.wonchgrat) +
                    Math.round(
                      filters.taxdiv == "A"
                        ? filters.amtunit == "KRW"
                          ? (item.qty * unp) / 10
                          : (item.qty * unp * filters.wonchgrat) / 10
                        : 0
                    )
                ),
                dlramt: Math.round(
                  filters.uschgrat != 0
                    ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                        ? filters.amtunit == "KRW"
                          ? item.qty * unp
                          : item.qty * unp * filters.wonchgrat
                        : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                        ? filters.amtunit == "KRW"
                          ? (item.len == undefined ? 0 : item.len) * unp
                          : (item.len == undefined ? 0 : item.len) *
                            unp *
                            filters.wonchgrat
                        : item.unpcalmeth == "W"
                        ? filters.amtunit == "KRW"
                          ? item.totwgt * unp
                          : item.totwgt * unp * filters.wonchgrat
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amt: 0,
      chk: "",
      dlramt: 0,
      insiz: "",
      itemacnt: "",
      itemcd: "",
      itemnm: "",
      ordkey: "",
      ordnum: "",
      ordseq: 0,
      outrecdt: "",
      outreckey: "",
      outseq1: 0,
      outseq2: 0,
      poregnum: "",
      qty: 0,
      qtyunit: "",
      recdt: convertDateToStr(filters.recdt),
      reckey: "",
      remark: "",
      rowstatus: "N",
      seq1: filters.seq1,
      seq2: 0,
      sort_seq: 0,
      taxamt: 0,
      totamt: 0,
      totwgt: 0,
      unitwgt: 0,
      unp: 0,
      unpcalmeth: "Q",
      wgtunit: "",
      wonamt: 0,
    };
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
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

  return (
    <>
      <Window
        title={workType == "N" ? "직접판매처리생성" : "직접판매처리정보"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap>
          <FormBox>
            <tbody>
              <tr>
                <th>판매번호</th>
                <td>
                  <Input
                    name="reckey"
                    type="text"
                    value={filters.reckey}
                    className="readonly"
                  />
                </td>
                <th>매출일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="outdt"
                      value={filters.outdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </div>
                </td>
                <th>선적일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="shipdt"
                      value={filters.shipdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </div>
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
                <th>사업장</th>
                <td>
                  <Input
                    name="location"
                    type="text"
                    value={"본사"}
                    className="readonly"
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
                <th>미화환율</th>
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
                  />
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
                <th>계산서NO</th>
                <td>
                  <Input
                    name="taxnum"
                    type="text"
                    value={filters.taxnum}
                    className="readonly"
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
          <GridContainer height={`calc(100% - 380px)`}>
            <GridTitleContainer>
              <GridTitle>상세정보</GridTitle>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  onClick={onCopyWndClick}
                  icon="folder-open"
                >
                  일괄등록
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
              style={{ height: "100%" }}
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
              <GridColumn
                field="chk"
                title=" "
                width="45px"
                headerCell={CustomCheckBoxCell2}
                cell={CheckBoxCell}
              />
              <GridColumn field="rowstatus" title=" " width="50px" />
              <GridColumn
                field="itemcd"
                title="품목코드"
                width="150px"
                cell={ColumnCommandCell}
                headerCell={RequiredHeader}
                footerCell={mainTotalFooterCell}
              />
              <GridColumn field="itemnm" title="품목명" width="150px" />
              <GridColumn
                field="itemacnt"
                title="품목계정"
                width="150px"
                cell={CustomComboBoxCell}
              />
              <GridColumn field="insiz" title="규격" width="150px" />
              <GridColumn
                field="qty"
                title="수량"
                width="100px"
                cell={NumberCell}
                headerCell={RequiredHeader}
                footerCell={editNumberFooterCell}
              />
              <GridColumn
                field="qtyunit"
                title="수량단위"
                width="100px"
                cell={CustomComboBoxCell}
              />
              <GridColumn
                field="unpcalmeth"
                title="단가산정방법"
                width="100px"
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
                field="unitwgt"
                title="단중"
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
                field="totamt"
                title="합계금액"
                width="100px"
                cell={NumberCell}
                footerCell={editNumberFooterCell}
              />
              <GridColumn field="remark" title="비고" width="200px" />
              <GridColumn
                field="totwgt"
                title="총중량"
                width="100px"
                cell={NumberCell}
                footerCell={editNumberFooterCell}
              />
            </Grid>
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
          </GridContainer>
        </FormContext.Provider>
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
      {itemMultiWindowVisible && (
        <ItemsMultiWindow
          setVisible={setItemMultiWindowVisible}
          setData={setCopyData}
          itemacnt={""}
          pathname={pathname}
        />
      )}
    </>
  );
};

export default CopyWindow;
