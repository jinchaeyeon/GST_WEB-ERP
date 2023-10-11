import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
} from "react";
import * as ReactDOM from "react-dom";
import DetailWindow from "../components/Windows/PR_A9000W_Window";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridHeaderSelectionChangeEvent,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { gridList } from "../store/columns/PR_A9000W_C";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
  GridContainerWrap,
  ButtonInGridInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
  getGridItemChangedData,
  toDate2,
  getItemQuery,
  toDate,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  GAP,
  EDIT_FIELD,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../store/atoms";
import { useRecoilState } from "recoil";
import CenterCell from "../components/Cells/CenterCell";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import ItemsMultiWindow from "../components/Windows/CommonWindows/ItemsMultiWindow";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";

const DATA_ITEM_KEY = "num";

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
  itemnm: string;
  itemacnt: string;
  insiz: string;
  bnatur: string;
  spec: string;
  invunitnm: string;
  itemlvl1: string;
  itemlvl2: string;
  itemlvl3: string;
};
const defaultItemInfo = {
  itemcd: "",
  itemnm: "",
  itemacnt: "",
  insiz: "",
  bnatur: "",
  spec: "",
  invunitnm: "",
  itemlvl1: "",
  itemlvl2: "",
  itemlvl3: "",
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
      itemnm,
      insiz,
      itemacnt,
      bnatur,
      spec,
      invunitnm,
      itemlvl1,
      itemlvl2,
      itemlvl3,
    } = data;
    setItemInfo({
      itemcd,
      itemnm,
      insiz,
      itemacnt,
      bnatur,
      spec,
      invunitnm,
      itemlvl1,
      itemlvl2,
      itemlvl3,
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
      itemnm,
      insiz,
      itemacnt,
      bnatur,
      spec,
      invunitnm,
      itemlvl1,
      itemlvl2,
      itemlvl3,
    } = data;
    setItemInfo2({
      itemcd,
      itemnm,
      insiz,
      itemacnt,
      bnatur,
      spec,
      invunitnm,
      itemlvl1,
      itemlvl2,
      itemlvl3,
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
        />
      )}
    </>
  );
};

const PR_A9000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

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
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");

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
              itemnm: itemInfo.itemnm,
              itemacnt: itemInfo.itemacnt,
              insiz: itemInfo.insiz,
              bnatur: itemInfo.bnatur,
              spec: itemInfo.spec,
              qtyunit:
                qtyunitListData.find(
                  (item: any) => item.code_name === itemInfo.invunitnm
                )?.sub_code != null
                  ? qtyunitListData.find(
                      (item: any) => item.code_name === itemInfo.invunitnm
                    )?.sub_code
                  : itemInfo.invunitnm,
              itemlvl1: itemInfo.itemlvl1,
              itemlvl2: itemInfo.itemlvl2,
              itemlvl3: itemInfo.itemlvl3,
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
              itemnm: itemInfo2.itemnm,
              itemacnt: itemInfo2.itemacnt,
              insiz: itemInfo2.insiz,
              bnatur: itemInfo2.bnatur,
              spec: itemInfo2.spec,
              qtyunit:
                qtyunitListData.find(
                  (item: any) => item.code_name === itemInfo2.invunitnm
                )?.sub_code != null
                  ? qtyunitListData.find(
                      (item: any) => item.code_name === itemInfo2.invunitnm
                    )?.sub_code
                  : itemInfo2.invunitnm,
              itemlvl1: itemInfo2.itemlvl1,
              itemlvl2: itemInfo2.itemlvl2,
              itemlvl3: itemInfo2.itemlvl3,
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [tabSelected, setTabSelected] = React.useState(0);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

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
          const invunitnm = rows[0].invunit;
          const {
            itemcd,
            itemnm,
            insiz,
            itemacnt,
            bnatur,
            spec,
            itemlvl1,
            itemlvl2,
            itemlvl3,
          } = rows[0];
          setItemInfo({
            itemcd,
            itemnm,
            insiz,
            itemacnt,
            bnatur,
            spec,
            invunitnm,
            itemlvl1,
            itemlvl2,
            itemlvl3,
          });
        } else {
          const newData = mainDataResult.data.map((item: any) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
              ? {
                  ...item,
                  itemcd: item.itemcd,
                  itemnm: "",
                  insiz: "",
                  itemacnt: "",
                  bnatur: "",
                  spec: "",
                  qtyunit: "",
                  itemlvl1: "",
                  itemlvl2: "",
                  itemlvl3: "",
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
          const invunitnm = rows[0].invunit;
          const {
            itemcd,
            itemnm,
            insiz,
            itemacnt,
            bnatur,
            spec,
            itemlvl1,
            itemlvl2,
            itemlvl3,
          } = rows[0];
          setItemInfo2({
            itemcd,
            itemnm,
            insiz,
            itemacnt,
            bnatur,
            spec,
            invunitnm,
            itemlvl1,
            itemlvl2,
            itemlvl3,
          });
        } else {
          const newData = detailDataResult.data.map((item: any) =>
            item.num ==
            parseInt(Object.getOwnPropertyNames(detailSelectedState)[0])
              ? {
                  ...item,
                  itemcd: item.itemcd,
                  itemnm: "",
                  insiz: "",
                  itemacnt: "",
                  bnatur: "",
                  spec: "",
                  qtyunit: "",
                  itemlvl1: "",
                  itemlvl2: "",
                  itemlvl3: "",
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
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

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
    },
  };

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
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
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
      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDetailGrid = async () => {
    let data: any;
    setLoading(true);
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
   
      if (totalRowCnt > 0) {
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (detailFilters.find_row_value === "" && detailFilters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setDetailSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setDetailFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (
      customOptionData != null &&
      detailFilters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setDetailFilters((prev) => ({ ...prev, isSearch: false }));
      fetchDetailGrid();
    }
  }, [detailFilters, permissions]);

  let gridRef : any = useRef(null); 

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (detailFilters.find_row_value !== "" && detailDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = detailDataResult.data.findIndex(
          (item) => idGetter(item) === detailFilters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setDetailFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (detailFilters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [detailDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setDetailFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
      dataItemKey: DATA_ITEM_KEY,
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

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onDetailScrollHandler = (event: GridEvent) => {
    if (detailFilters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      detailFilters.pgNum +
      (detailFilters.scrollDirrection === "up" ? detailFilters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setDetailFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      detailFilters.pgNum -
      (detailFilters.scrollDirrection === "down" ? detailFilters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setDetailFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
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
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
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
      }
    } catch (e) {
      alert(e);
    }
    deletedMainRows = [];
    resetAllGrid();
  };

  const onDetailHeaderSelectionChange = useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: {
        [id: string]: boolean | number[];
      } = {};

      event.dataItems.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });

      setDetailSelectedState(newSelectedState);
    },
    []
  );

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
      DATA_ITEM_KEY
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
              rowstatus: item.rowstatus === "N" ? "N" : "U",
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
      setIfSelectFirstRow(false);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (editedField !== "itemcd") {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      mainDataResult.data.map((item) => {
        if (editIndex === item.num) {
          fetchItemData(item.itemcd);
        }
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
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
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
      setIfSelectFirstRow(false);
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (editedField !== "itemcd") {
      const newData = detailDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));

      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      detailDataResult.data.map((item) => {
        if (editIndex === item.num) {
          fetchItemData2(item.itemcd);
        }
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
      if(item.num > temp){
        temp = item.num
      }
  })
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
  };

  const onAddClick2 = () => {
    detailDataResult.data.map((item) => {
      if(item.num > temp2){
        temp2 = item.num
      }
  })
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp2,
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
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };

        deletedMainRows.push(newData2);
      }
    });
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));
    setMainDataState({});
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    detailDataResult.data.forEach((item: any, index: number) => {
      if (!detailSelectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };

        deletedMainRows.push(newData2);
      }
    });
    setDetailDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));
    setDetailDataState({});
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
        if(item.num > temp3){
          temp3 = item.num
        }
    })
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
    });
  };

  const addItemData = (data: IItemData[]) => {
    data.map((item) => {
      mainDataResult.data.map((item) => {
        if(item.num > temp4){
          temp4 = item.num
        }
    })
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
    })
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
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="재공기타입고">
          <GridContainerWrap>
            <FormContext.Provider
              value={{
                itemInfo,
                setItemInfo,
              }}
            >
              <GridContainer width="87.5vw">
                <GridTitleContainer>
                  <GridTitle>재공기타입출고내역</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      fillMode="outline"
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
                    onClick={onWndClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="folder-open"
                    title="품목참조"     
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
                      mode: "multiple",
                    }}
                    onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult.total}
                    onScroll={onMainScrollHandler}
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
                                  ? gridSumQtyFooterCell
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
            <GridContainer width="87.5vw">
              <GridTitleContainer>
                <GridTitle>재공기타입출고내역</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    fillMode="outline"
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
                    onClick={onWndClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="folder-open"
                    title="재공참조"
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
                    [SELECTED_FIELD]: detailSelectedState[idGetter(row)],
                  })),
                  detailDataState
                )}
                {...detailDataState}
                onDataStateChange={onDetailDataStateChange}
                onHeaderSelectionChange={onDetailHeaderSelectionChange}
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={ondetailSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detailDataResult.total}
                onScroll={onDetailScrollHandler}
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
                              ? gridSumQtyFooterCell2
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
        />
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          setData={setCopyData}
        />
      )}
      {detailWindowVisible2 && (
        <ItemsMultiWindow
          setVisible={setDetailWindowVisible2}
          setData={addItemData}
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
