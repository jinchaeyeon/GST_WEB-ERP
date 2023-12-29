import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getItemQuery,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  toDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ItemsMultiWindow from "../components/Windows/CommonWindows/ItemsMultiWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DetailWindow from "../components/Windows/PR_A9000W_Window";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/PR_A9000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";

const numberField = ["qty", "planseq", "len"];
const numberField2 = ["qty"];
const dateField = ["proddt"];
const customField = [
  "proccd",
  "itemlvl1",
  "itemlvl2",
  "itemlvl3",
  "qtyunit",
  "div",
];
const customHeaderField = ["proddt", "itemcd", "lotnum", "qty", "qtyunit"];
const customHeaderField2 = ["proddt", "itemcd", "lotnum", "qty", "div"];
const itemcdField = ["itemcd"];
let temp = 0;
let temp2 = 0;
let temp3 = 0;
let temp4 = 0;
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 공정,대분류,중분류,소분류,품목계정,단위,중량단위
  UseBizComponent(
    "L_PR010,L_BA171,L_BA172,L_BA173,L_BA015,L_PR300100",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "proccd"
      ? "L_PR010"
      : field === "itemlvl1"
      ? "L_BA171"
      : field === "itemlvl2"
      ? "L_BA172"
      : field === "itemlvl3"
      ? "L_BA173"
      : field === "qtyunit"
      ? "L_BA015"
      : field === "div"
      ? "L_PR300100"
      : "";

  const valueField = field === "div" ? "code" : undefined;
  const textField = field === "div" ? "code_name" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td></td>
  );
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
type TdataArr = {
  rowstatus_s: string[];
  renum_s: string[];
  reseq_s: string[];
  seq_s: string[];
  proddt_s: string[];
  proccd_s: string[];
  itemcd_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  lotnum_s: string[];
  remark_s: string[];
  div_s: string[];
  planno_s: string[];
  planseq_s: string[];
  len_s: string[];
  keycode_s: string[];
};
export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

export const FormContext2 = createContext<{
  itemInfo2: TItemInfo;
  setItemInfo2: (d: React.SetStateAction<TItemInfo>) => void;
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
          modal={true}
        />
      )}
    </>
  );
};

const ColumnCommandCell2 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const { setItemInfo2 } = useContext(FormContext2);
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
    setItemInfo2({
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
          modal={true}
        />
      )}
    </>
  );
};

const PR_A9000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [editIndex2, setEditIndex2] = useState<number | undefined>();
  const [editedField2, setEditedField2] = useState("");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("PR_A9000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_A9000W", setCustomOptionData);

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

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        proccd: defaultOption.find((item: any) => item.id === "proccd")
          .valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  const [itemInfo2, setItemInfo2] = useState<TItemInfo>(defaultItemInfo);

  useEffect(() => {
    if (bizComponentData != null) {
      const newData = mainDataResult.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
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
    }
  }, [itemInfo]);

  useEffect(() => {
    if (bizComponentData != null) {
      const newData = detailDataResult.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(detailSelectedState)[0])
          ? {
              ...item,
              itemcd: itemInfo2.itemcd,
              itemno: itemInfo2.itemno,
              itemnm: itemInfo2.itemnm,
              insiz: itemInfo2.insiz,
              model: itemInfo2.model,
              bnatur: itemInfo2.bnatur,
              spec: itemInfo2.spec,
              //invunit
              qtyunit: itemInfo2.invunit,
              invunitnm: itemInfo2.invunitnm,
              unitwgt: itemInfo2.unitwgt,
              wgtunit: itemInfo2.wgtunit,
              wgtunitnm: itemInfo2.wgtunitnm,
              maker: itemInfo2.maker,
              dwgno: itemInfo2.dwgno,
              remark: itemInfo2.remark,
              itemlvl1: itemInfo2.itemlvl1,
              itemlvl2: itemInfo2.itemlvl2,
              itemlvl3: itemInfo2.itemlvl3,
              extra_field1: itemInfo2.extra_field1,
              extra_field2: itemInfo2.extra_field2,
              extra_field7: itemInfo2.extra_field7,
              extra_field6: itemInfo2.extra_field6,
              extra_field8: itemInfo2.extra_field8,
              packingsiz: itemInfo2.packingsiz,
              unitqty: itemInfo2.unitqty,
              color: itemInfo2.color,
              gubun: itemInfo2.gubun,
              qcyn: itemInfo2.qcyn,
              outside: itemInfo2.outside,
              itemthick: itemInfo2.itemthick,
              itemlvl4: itemInfo2.itemlvl4,
              itemlvl5: itemInfo2.itemlvl5,
              custitemnm: itemInfo2.custitemnm,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  }, [itemInfo2]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tabSelected, setTabSelected] = React.useState(0);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

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
            item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
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

  const fetchItemData2 = React.useCallback(
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
          setItemInfo2({
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
          const newData = detailDataResult.data.map((item: any) =>
            item.num ==
            parseInt(Object.getOwnPropertyNames(detailSelectedState)[0])
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
          setDetailDataResult((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [detailDataResult]
  );

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    proccd: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
       //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A9000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "ProdIn",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_proccd": filters.proccd,
        "@p_lotnum": filters.lotnum,
        "@p_find_row_Value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.renum + "-" + row.reseq == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.renum + "-" + row.reseq == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  const fetchDetailGrid = async (detailFilters: any) => {
    let data: any;
    setLoading(true);
    const detailParameters: Iparameters = {
      procedureName: "P_PR_A9000W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "ProdOut",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_proccd": filters.proccd,
        "@p_lotnum": filters.lotnum,
        "@p_find_row_value": detailFilters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
      }));

      if (detailFilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.keyfield == detailFilters.find_row_value
          );
          targetRowIndex2 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef2.current) {
          targetRowIndex2 = 0;
        }
      }

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          detailFilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.keyfield == detailFilters.find_row_value
              );

        if (selectedRow != undefined) {
          setDetailSelectedState({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setDetailSelectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailFilters, permissions]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
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

  const ondetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setDetailSelectedState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const handleSelectTab = (e: any) => {
    deletedMainRows = [];
    setTabSelected(e.selected);
    resetAllGrid();
    setPage(initialPageState);
    setPage2(initialPageState);
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    } else {
      setDetailFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    }
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

  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
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

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

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

  const onItemWndClick = () => {
    setItemWindowVisible(true);
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

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A9000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A9000W_001");
      } else {
        deletedMainRows = [];
        resetAllGrid();
        if (tabSelected == 0) {
          setFilters((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            find_row_value: "",
          }));
        } else {
          setDetailFilters((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            find_row_value: "",
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };
  const onDetailItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
      DATA_ITEM_KEY2
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (
      field != "itemnm" &&
      field != "insiz" &&
      !(field == "lotnum" && dataItem.rowstatus != "N") &&
      field != "rowstatus" &&
      field != "itemlvl1" &&
      field != "itemlvl2" &&
      field != "itemlvl3"
    ) {
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
        mainDataResult.data.map((item) => {
          if (editIndex === item[DATA_ITEM_KEY]) {
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (
      !(field == "div" && dataItem.rowstatus != "N") &&
      !(field == "lotnum" && dataItem.rowstatus != "N") &&
      field != "itemnm" &&
      field != "insiz" &&
      field != "rowstatus" &&
      field != "remark" &&
      field != "itemlvl1" &&
      field != "itemlvl2" &&
      field != "itemlvl3"
    ) {
      const newData = detailDataResult.data.map((item) =>
        item[DATA_ITEM_KEY2] === dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setEditIndex2(dataItem[DATA_ITEM_KEY2]);
      if (field) {
        setEditedField2(field);
      }
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: detailDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != detailDataResult.data) {
      if (editedField2 !== "itemcd") {
        const newData = detailDataResult.data.map((item) =>
          item[DATA_ITEM_KEY2] ==
          Object.getOwnPropertyNames(detailSelectedState)[0]
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
        setTempResult2((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setDetailDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        detailDataResult.data.map((item) => {
          if (editIndex2 === item[DATA_ITEM_KEY2]) {
            fetchItemData2(item.itemcd);
          }
        });
      }
    } else {
      const newData = detailDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
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

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      bnatur: "",
      custnm: "",
      insiz: "",
      itemacnt: "",
      itemcd: "",
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      itemnm: "",
      keycode: "",
      location: filters.location,
      lotnum: "",
      orgdiv: "01",
      orglot: "",
      pgmdiv: "",
      planno: "",
      planseq: 0,
      proccd: "",
      procseq: "",
      proddt: new Date(),
      prodemp: "",
      prodmac: "",
      qty: 0,
      qtyunit: "",
      remark: "",
      renum: "",
      reseq: "",
      spec: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onAddClick2 = () => {
    detailDataResult.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      div: "",
      insiz: "",
      itemcd: "",
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      itemnm: "",
      keycode: "",
      keyseq: 0,
      len: 0,
      location: filters.location,
      lotnum: "",
      orgdiv: "01",
      orglot: "",
      pgmdiv: "",
      planno: "",
      planseq: 0,
      proccd: "",
      procseq: "",
      proddt: new Date(),
      qty: 0,
      qtyunit: "",
      remark: "",
      renum: "",
      reseq: "",
      rowstatus: "N",
    };

    setDetailDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage2((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setDetailSelectedState({ [newDataItem[DATA_ITEM_KEY2]]: true });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
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
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    detailDataResult.data.forEach((item: any, index: number) => {
      if (!detailSelectedState[item[DATA_ITEM_KEY2]]) {
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
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = detailDataResult.data[Math.min(...Object2)];
    } else {
      data = detailDataResult.data[Math.min(...Object) - 1];
    }

    //newData 생성
    setDetailDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setDetailSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onSaveClick = async () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    let valid = true;

    dataItem.map((item) => {
      if (item.itemcd == "") {
        valid = false;
      } else if (item.lotnum == "") {
        valid = false;
      } else if (item.qty == 0) {
        valid = false;
      } else if (item.qtyunit == "") {
        valid = false;
      }
    });

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

    if (valid != true) {
      alert("필수값을 입력해주세요.");
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        renum_s: [],
        reseq_s: [],
        seq_s: [],
        proddt_s: [],
        proccd_s: [],
        itemcd_s: [],
        qty_s: [],
        qtyunit_s: [],
        lotnum_s: [],
        remark_s: [],
        div_s: [],
        planno_s: [],
        planseq_s: [],
        len_s: [],
        keycode_s: [],
      };
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          renum = "",
          reseq = "",
          seq = "",
          proddt = "",
          proccd = "",
          itemcd = "",
          qty = "",
          qtyunit = "",
          lotnum = "",
          remark = "",
          div = "",
          planno = "",
          planseq = "",
          len = "",
          keycode = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.renum_s.push(renum);
        dataArr.reseq_s.push(reseq);
        dataArr.seq_s.push(seq);
        dataArr.proddt_s.push(
          proddt.length == 8 ? proddt : convertDateToStr(proddt)
        );
        dataArr.proccd_s.push(proccd);
        dataArr.itemcd_s.push(itemcd);
        dataArr.qty_s.push(qty);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.lotnum_s.push(lotnum);
        dataArr.remark_s.push(remark);
        dataArr.div_s.push(div);
        dataArr.planno_s.push(planno);
        dataArr.planseq_s.push(planseq);
        dataArr.len_s.push(len);
        dataArr.keycode_s.push(keycode);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          renum = "",
          reseq = "",
          seq = "",
          proddt = "",
          proccd = "",
          itemcd = "",
          qty = "",
          qtyunit = "",
          lotnum = "",
          remark = "",
          div = "",
          planno = "",
          planseq = "",
          len = "",
          keycode = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.renum_s.push(renum);
        dataArr.reseq_s.push(reseq);
        dataArr.seq_s.push(seq);
        dataArr.proddt_s.push(
          proddt.length == 8 ? proddt : convertDateToStr(proddt)
        );
        dataArr.proccd_s.push(proccd);
        dataArr.itemcd_s.push(itemcd);
        dataArr.qty_s.push(qty);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.lotnum_s.push(lotnum);
        dataArr.remark_s.push(remark);
        dataArr.div_s.push(div);
        dataArr.planno_s.push(planno);
        dataArr.planseq_s.push(planseq);
        dataArr.len_s.push(len);
        dataArr.keycode_s.push(keycode);
      });
      const para: Iparameters = {
        procedureName: "P_PR_A9000W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "ProdIn",
          "@p_rowstatus_s": dataArr.rowstatus_s.join("|"),
          "@p_orgdiv": "01",
          "@p_renum_s": dataArr.renum_s.join("|"),
          "@p_reseq_s": dataArr.reseq_s.join("|"),
          "@p_seq_s": dataArr.seq_s.join("|"),
          "@p_location": filters.location,
          "@p_proddt_s": dataArr.proddt_s.join("|"),
          "@p_proccd_s": dataArr.proccd_s.join("|"),
          "@p_itemcd_s": dataArr.itemcd_s.join("|"),
          "@p_qty_s": dataArr.qty_s.join("|"),
          "@p_qtyunit_s": dataArr.qtyunit_s.join("|"),
          "@p_lotnum_s": dataArr.lotnum_s.join("|"),
          "@p_remark_s": dataArr.remark_s.join("|"),
          "@p_div_s": dataArr.div_s.join("|"),
          "@p_planno_s": dataArr.planno_s.join("|"),
          "@p_planseq_s": dataArr.planseq_s.join("|"),
          "@p_len_s": dataArr.len_s.join("|"),
          "@p_keycode_s": dataArr.keycode_s.join("|"),
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "PR_A9000W",
          "@p_companyCode": companyCode,
        },
      };

      let datas: any;

      try {
        datas = await processApi<any>("procedure", para);
      } catch (error) {
        datas = null;
      }

      if (datas.isSuccess !== true) {
        console.log("[오류 발생]");
        console.log(datas);
        alert(datas.resultMessage);
      } else {
        deletedMainRows = [];
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          find_row_value: datas.returnString,
        }));
      }
    }
  };

  const onSaveClick2 = async () => {
    const dataItem = detailDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    let valid = true;

    dataItem.map((item) => {
      if (item.itemcd == "") {
        valid = false;
      } else if (item.div == "") {
        valid = false;
      } else if (item.lotnum == "") {
        valid = false;
      } else if (item.qty == 0) {
        valid = false;
      }
    });

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

    if (valid != true) {
      alert("필수값을 입력해주세요.");
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        renum_s: [],
        reseq_s: [],
        seq_s: [],
        proddt_s: [],
        proccd_s: [],
        itemcd_s: [],
        qty_s: [],
        qtyunit_s: [],
        lotnum_s: [],
        remark_s: [],
        div_s: [],
        planno_s: [],
        planseq_s: [],
        len_s: [],
        keycode_s: [],
      };
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          renum = "",
          reseq = "",
          seq = "",
          proddt = "",
          proccd = "",
          itemcd = "",
          qty = "",
          qtyunit = "",
          lotnum = "",
          remark = "",
          div = "",
          planno = "",
          planseq = "",
          len = "",
          keycode = "",
          keyseq = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.renum_s.push(renum);
        dataArr.reseq_s.push(reseq == "" ? 0 : reseq);
        dataArr.seq_s.push(keyseq);
        dataArr.proddt_s.push(
          proddt.length == 8 ? proddt : convertDateToStr(proddt)
        );
        dataArr.proccd_s.push(proccd);
        dataArr.itemcd_s.push(itemcd);
        dataArr.qty_s.push(qty);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.lotnum_s.push(lotnum);
        dataArr.remark_s.push(remark == null ? "" : remark);
        dataArr.div_s.push(div);
        dataArr.planno_s.push(planno);
        dataArr.planseq_s.push(planseq);
        dataArr.len_s.push(len);
        dataArr.keycode_s.push(keycode);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          renum = "",
          reseq = "",
          seq = "",
          proddt = "",
          proccd = "",
          itemcd = "",
          qty = "",
          qtyunit = "",
          lotnum = "",
          remark = "",
          div = "",
          planno = "",
          planseq = "",
          len = "",
          keycode = "",
          keyseq = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.renum_s.push(renum);
        dataArr.reseq_s.push(reseq == "" ? 0 : reseq);
        dataArr.seq_s.push(keyseq);
        dataArr.proddt_s.push(
          proddt.length == 8 ? proddt : convertDateToStr(proddt)
        );
        dataArr.proccd_s.push(proccd);
        dataArr.itemcd_s.push(itemcd);
        dataArr.qty_s.push(qty);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.lotnum_s.push(lotnum);
        dataArr.remark_s.push(remark == null ? "" : remark);
        dataArr.div_s.push(div);
        dataArr.planno_s.push(planno);
        dataArr.planseq_s.push(planseq);
        dataArr.len_s.push(len);
        dataArr.keycode_s.push(keycode);
      });
      const para: Iparameters = {
        procedureName: "P_PR_A9000W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "ProdOut",
          "@p_rowstatus_s": dataArr.rowstatus_s.join("|"),
          "@p_orgdiv": "01",
          "@p_renum_s": dataArr.renum_s.join("|"),
          "@p_reseq_s": dataArr.reseq_s.join("|"),
          "@p_seq_s": dataArr.seq_s.join("|"),
          "@p_location": filters.location,
          "@p_proddt_s": dataArr.proddt_s.join("|"),
          "@p_proccd_s": dataArr.proccd_s.join("|"),
          "@p_itemcd_s": dataArr.itemcd_s.join("|"),
          "@p_qty_s": dataArr.qty_s.join("|"),
          "@p_qtyunit_s": dataArr.qtyunit_s.join("|"),
          "@p_lotnum_s": dataArr.lotnum_s.join("|"),
          "@p_remark_s": dataArr.remark_s.join("|"),
          "@p_div_s": dataArr.div_s.join("|"),
          "@p_planno_s": dataArr.planno_s.join("|"),
          "@p_planseq_s": dataArr.planseq_s.join("|"),
          "@p_len_s": dataArr.len_s.join("|"),
          "@p_keycode_s": dataArr.keycode_s.join("|"),
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "PR_A9000W",
          "@p_companyCode": companyCode,
        },
      };

      let datas: any;

      try {
        datas = await processApi<any>("procedure", para);
      } catch (error) {
        datas = null;
      }

      if (datas.isSuccess !== true) {
        console.log("[오류 발생]");
        console.log(datas);
        alert(datas.resultMessage);
      } else {
        deletedMainRows = [];
        resetAllGrid();
        setDetailFilters((prev) => ({
          ...prev,
          isSearch: true,
          find_row_value: datas.returnString,
        }));
      }
    }
  };

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [detailWindowVisible2, setDetailWindowVisible2] =
    useState<boolean>(false);

  const onWndClick = () => {
    setDetailWindowVisible(true);
  };
  const onWndClick2 = () => {
    setDetailWindowVisible2(true);
  };
  const setCopyData = (data: any) => {
    data.map((item: any) => {
      detailDataResult.data.map((item) => {
        if (item.num > temp3) {
          temp3 = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp3,
        div: item.div,
        insiz: item.insiz,
        itemcd: item.itemcd,
        itemlvl1: item.itemlvl1,
        itemlvl2: item.itemlvl2,
        itemlvl3: item.itemlvl3,
        itemnm: item.itemnm,
        keycode: "",
        keyseq: 0,
        len: 0,
        location: filters.location,
        lotnum: item.lotnum,
        orgdiv: "01",
        orglot: item.orglot,
        pgmdiv: "",
        planno: item.planno,
        planseq: item.planseq,
        proccd: item.proccd,
        procseq: "",
        proddt: new Date(),
        qty: item.stockqty,
        qtyunit: item.qtyunit,
        remark: "",
        renum: "",
        reseq: "",
        rowstatus: "N",
      };

      setDetailDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setPage2((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setDetailSelectedState({ [newDataItem[DATA_ITEM_KEY2]]: true });
    });
  };

  const addItemData = (data: IItemData[]) => {
    data.map((item) => {
      mainDataResult.data.map((item) => {
        if (item.num > temp4) {
          temp4 = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp4,
        bnatur: item.bnatur,
        custnm: item.custitemnm,
        insiz: item.insiz,
        itemacnt: item.itemacnt,
        itemcd: item.itemcd,
        itemlvl1: item.itemlvl1,
        itemlvl2: item.itemlvl2,
        itemlvl3: item.itemlvl3,
        itemnm: item.itemnm,
        keycode: "",
        location: filters.location,
        lotnum: "",
        orgdiv: "01",
        orglot: "",
        pgmdiv: "",
        planno: "",
        planseq: 0,
        proccd: "",
        procseq: "",
        proddt: new Date(),
        prodemp: "",
        prodmac: "",
        qty: 0,
        qtyunit: "",
        remark: "",
        renum: "",
        reseq: "",
        spec: "",
        rowstatus: "N",
      };

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + data.length,
        };
      });
      setPage((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>재공품 기타입출고</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="PR_A9000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>일자</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                  className="required"
                />
              </td>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd"
                    value={filters.proccd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>

            <tr>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
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
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="재공기타입고">
          <GridContainerWrap>
            <FormContext.Provider
              value={{
                itemInfo,
                setItemInfo,
              }}
            >
              <GridContainer width="100%">
                <GridTitleContainer>
                  <GridTitle>재공기타입출고내역</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onWndClick2}
                      themeColor={"primary"}
                      icon="folder-open"
                    >
                      품목참조
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
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                >
                  <Grid
                    style={{ height: "66vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        proddt:
                          row.proddt.length == 8
                            ? toDate(row.proddt)
                            : row.proddt,
                        [SELECTED_FIELD]: selectedState[idGetter(row)],
                      })),
                      mainDataState
                    )}
                    {...mainDataState}
                    onDataStateChange={onMainDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
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
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : customField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : itemcdField.includes(item.fieldName)
                                  ? ColumnCommandCell
                                  : undefined
                              }
                              headerCell={
                                customHeaderField.includes(item.fieldName)
                                  ? RequiredHeader
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell
                                  : numberField2.includes(item.fieldName)
                                  ? editNumberFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </FormContext.Provider>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="재공기타출고">
          <FormContext2.Provider
            value={{
              itemInfo2,
              setItemInfo2,
            }}
          >
            <GridContainer width="100%">
              <GridTitleContainer>
                <GridTitle>재공기타입출고내역</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onWndClick}
                    themeColor={"primary"}
                    icon="folder-open"
                  >
                    재공참조
                  </Button>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "66vh" }}
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    proddt:
                      row.proddt.length == 8 ? toDate(row.proddt) : row.proddt,
                    [SELECTED_FIELD]: detailSelectedState[idGetter2(row)],
                  })),
                  detailDataState
                )}
                {...detailDataState}
                onDataStateChange={onDetailDataStateChange}
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={ondetailSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detailDataResult.total}
                skip={page2.skip}
                take={page2.take}
                pageable={true}
                onPageChange={pageChange2}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef2}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onDetailSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onItemChange={onDetailItemChange}
                cellRender={customCellRender2}
                rowRender={customRowRender2}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList2"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : dateField.includes(item.fieldName)
                              ? DateCell
                              : customField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : itemcdField.includes(item.fieldName)
                              ? ColumnCommandCell2
                              : undefined
                          }
                          headerCell={
                            customHeaderField2.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? detailTotalFooterCell
                              : numberField2.includes(item.fieldName)
                              ? editNumberFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </FormContext2.Provider>
        </TabStripTab>
      </TabStrip>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          setData={setCopyData}
          modal={true}
          pathname="PR_A9000W"
        />
      )}
      {detailWindowVisible2 && (
        <ItemsMultiWindow
          setVisible={setDetailWindowVisible2}
          setData={addItemData}
          modal={true}
        />
      )}
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
    </>
  );
};

export default PR_A9000W;
