import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useContext,
  createContext,
} from "react";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridCellProps,
  GridHeaderCellProps,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { DataResult, process, State } from "@progress/kendo-data-query";
import CopyWindow2 from "../components/Windows/BA_A0080W_Copy_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
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
  ButtonInGridInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import {
  Checkbox,
  Input,
  InputChangeEvent,
} from "@progress/kendo-react-inputs";
import YearCalendar from "../components/Calendars/YearCalendar";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import ExcelUploadButtons from "../components/Buttons/ExcelUploadButton";
import {
  chkScrollHandler,
  convertDateToStr,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  findMessage,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  UseGetValueFromSessionItem,
  UseParaPc,
  getItemQuery,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/MA_A7000W_C";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import ComboBoxCell from "../components/Cells/ComboBoxCell";

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

type TdataArr = {
  itemcd_s: string[];
  itemacnt_s: string[];
  custcd_s: string[];
  itemgrade_s: string[];
  unitwgt_s: string[];
  qtyunit_s: string[];
  qty_s: string[];
  lotnum_s: string[];
  len_s: string[];
  lenunit_s: string[];
  wgt_s: string[];
  wgtunit_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  load_place_s: string[];
  rowstatus_s: string[];
  width_s: string[];
  itemthick_s: string[];
  remark_s: string[];
  unp_s: string[];
};
let temp = 0;
let temp2 = 0;
const DATA_ITEM_KEY = "num";
const numberField = ["qty", "wgt", "len", "wonamt", "taxamt", "totamt"];
const numberField2 = ["qty", "wonamt", "taxamt", "totamt"];
const requiredfield = ["itemcd", "itemacnt", "lotnum", "qty"];
const customField = ["qtyunit", "load_place"];
const itemcdField = ["itemcd"];
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
let deletedMainRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA015, L_LOADPLACE", setBizComponentData);
  //수량단위, 적재장소
  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "qtyunit"
      ? "L_BA015"
      : field === "load_place"
      ? "L_LOADPLACE"
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

export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

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
    if (dataItem["rowstatus"] == "N") {
      setItemWindowVisible2(true);
    } else {
      alert("품목코드와 품목명은 수정이 불가합니다.");
    }
  };

  const setItemData = (data: IItemData) => {
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
          setData={setItemData}
        />
      )}
    </>
  );
};

const MA_A7000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //FormContext 데이터 state
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");

      setFilters((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
          .valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_LOADPLACE, L_BA061,L_BA015",
    //적재장소, 품목계정
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [loadplaceListData, setLoadPlaceListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const loadplaceQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_LOADPLACE"
        )
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );

      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(loadplaceQueryStr, setLoadPlaceListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
    }
  }, [bizComponentData]);

  useEffect(() => {
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
  }, [itemInfo]);

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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [CopyWindowVisible, setCopyWindowVisible] = useState<boolean>(false);

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
    yyyymm: new Date(),
    location: "01",
    itemacnt: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    position: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_MA_A7000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyymm": convertDateToStr(filters.yyyymm).substr(0, 4),
      "@p_location": filters.location,
      "@p_itemacnt": filters.itemacnt,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_lotnum": filters.lotnum,
      "@p_position": filters.position,
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
      const rows = data.tables[0].Rows;
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchMainGrid();
    }
  }, [filters, permissions]);

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

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const onCopyWndClick = () => {
    setCopyWindowVisible(true);
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : 0
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

  const search = () => {
    deletedMainRows = [];
    try {
      if (convertDateToStr(filters.yyyymm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "MA_A7000W_001");
      } else if (
        filters.location == null ||
        filters.location == "" ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "MA_A7000W_002");
      } else {
        resetAllGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (item.chk == false) {
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      anneal: "",
      bnatur: "",
      chk: "",
      custcd: "",
      insiz: "",
      itemacnt: "",
      itemcd: "",
      itemgrade: "",
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      itemnm: "",
      itemno: "",
      itemod: "",
      itemthick: 0,
      len: 0,
      lenunit: "",
      load_place: "",
      location: "",
      lotnum: "",
      manudiv: "",
      orgdiv: "01",
      pgmdiv: "",
      position: "",
      qty: 1,
      qtyunit: "",
      remark: "",
      spec: "",
      taxamt: 0,
      thickness: 0,
      totamt: 0,
      unitwgt: 0,
      unp: 0,
      wgt: 0,
      wgtunit: "",
      width: 0,
      wonamt: 0,
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
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
      field == "qty" ||
      field == "qtyunit" ||
      field == "wgt" ||
      field == "wgtunit" ||
      field == "len" ||
      field == "lenunit" ||
      field == "load_place" ||
      field == "wonamt" ||
      field == "taxamt" ||
      (field == "lotnum" && dataItem.rowstatus == "N") ||
      (field == "itemcd" && dataItem.rowstatus == "N")
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
        totamt: item.wonamt + item.taxamt,
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

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
    position: "",
    yyyymm: "",
    itemcd_s: "",
    itemacnt_s: "",
    custcd_s: "",
    itemgrade_s: "",
    unitwgt_s: "",
    qtyunit_s: "",
    qty_s: "",
    lotnum_s: "",
    len_s: "",
    lenunit_s: "",
    wgt_s: "",
    wgtunit_s: "",
    wonamt_s: "",
    taxamt_s: "",
    load_place_s: "",
    rowstatus_s: "",
    width_s: "",
    itemthick_s: "",
    remark_s: "",
    unp_s: "",
  });

  //조회조건 파라미터
  const para: Iparameters = {
    procedureName: "P_MA_A7000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "SAVE",
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_yyyymm": ParaData.yyyymm,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_itemgrade_s": ParaData.itemgrade_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_len_s": ParaData.len_s,
      "@p_lenunit_s": ParaData.lenunit_s,
      "@p_wgt_s": ParaData.wgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_width_s": ParaData.width_s,
      "@p_itemthick_s": ParaData.itemthick_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A7000W",
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
      setParaData({
        pgSize: PAGE_SIZE,
        orgdiv: "01",
        location: "",
        position: "",
        yyyymm: "",
        itemcd_s: "",
        itemacnt_s: "",
        custcd_s: "",
        itemgrade_s: "",
        unitwgt_s: "",
        qtyunit_s: "",
        qty_s: "",
        lotnum_s: "",
        len_s: "",
        lenunit_s: "",
        wgt_s: "",
        wgtunit_s: "",
        wonamt_s: "",
        taxamt_s: "",
        load_place_s: "",
        rowstatus_s: "",
        width_s: "",
        itemthick_s: "",
        remark_s: "",
        unp_s: "",
      });
      resetAllGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

    let valid = true;
    let arr: any = [];
    dataItem.map((item: any) => {
      if (
        item.lotnum == "" ||
        item.itemcd == "" ||
        item.itemacnt == "" ||
        item.qty == 0
      ) {
        valid = false;
      }
      arr.push(item.lotnum);
    });

    const set = new Set(arr);

    if (arr.length !== set.size) {
      alert("LOT NO가 중복되었습니다.");
      return false;
    }

    if (valid == true) {
      let dataArr: TdataArr = {
        itemcd_s: [],
        itemacnt_s: [],
        custcd_s: [],
        itemgrade_s: [],
        unitwgt_s: [],
        qtyunit_s: [],
        qty_s: [],
        lotnum_s: [],
        len_s: [],
        lenunit_s: [],
        wgt_s: [],
        wgtunit_s: [],
        wonamt_s: [],
        taxamt_s: [],
        load_place_s: [],
        rowstatus_s: [],
        width_s: [],
        itemthick_s: [],
        remark_s: [],
        unp_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          itemcd = "",
          itemacnt = "",
          custcd = "",
          itemgrade = "",
          unitwgt = "",
          qtyunit = "",
          qty = "",
          lotnum = "",
          len = "",
          lenunit = "",
          wgt = "",
          wgtunit = "",
          wonamt = "",
          taxamt = "",
          load_place = "",
          rowstatus = "",
          width = "",
          itemthick = "",
          remark = "",
          unp = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.itemcd_s.push(itemcd);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.custcd_s.push(custcd);
        dataArr.itemgrade_s.push(itemgrade);
        dataArr.unitwgt_s.push(unitwgt);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.qty_s.push(qty);
        dataArr.lotnum_s.push(lotnum);
        dataArr.len_s.push(len);
        dataArr.lenunit_s.push(lenunit);
        dataArr.wgt_s.push(wgt);
        dataArr.wgtunit_s.push(wgtunit);
        dataArr.wonamt_s.push(wonamt);
        dataArr.taxamt_s.push(taxamt);
        dataArr.load_place_s.push(load_place);
        dataArr.width_s.push(width);
        dataArr.itemthick_s.push(itemthick == "" ? 0 : itemthick);
        dataArr.remark_s.push(remark);
        dataArr.unp_s.push(unp);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          itemcd = "",
          itemacnt = "",
          custcd = "",
          itemgrade = "",
          unitwgt = "",
          qtyunit = "",
          qty = "",
          lotnum = "",
          len = "",
          lenunit = "",
          wgt = "",
          wgtunit = "",
          wonamt = "",
          taxamt = "",
          load_place = "",
          rowstatus = "",
          width = "",
          itemthick = "",
          remark = "",
          unp = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.itemcd_s.push(itemcd);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.custcd_s.push(custcd);
        dataArr.itemgrade_s.push(itemgrade);
        dataArr.unitwgt_s.push(unitwgt);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.qty_s.push(qty);
        dataArr.lotnum_s.push(lotnum);
        dataArr.len_s.push(len);
        dataArr.lenunit_s.push(lenunit);
        dataArr.wgt_s.push(wgt);
        dataArr.wgtunit_s.push(wgtunit);
        dataArr.wonamt_s.push(wonamt);
        dataArr.taxamt_s.push(taxamt);
        dataArr.load_place_s.push(load_place);
        dataArr.width_s.push(width);
        dataArr.itemthick_s.push(itemthick == "" ? 0 : itemthick);
        dataArr.remark_s.push(remark);
        dataArr.unp_s.push(unp);
      });
      setParaData((prev) => ({
        ...prev,
        location: filters.location,
        position: filters.position,
        yyyymm: convertDateToStr(filters.yyyymm).substr(0, 4) + "00",
        itemcd_s: dataArr.itemcd_s.join("|"),
        itemacnt_s: dataArr.itemacnt_s.join("|"),
        custcd_s: dataArr.custcd_s.join("|"),
        itemgrade_s: dataArr.itemgrade_s.join("|"),
        unitwgt_s: dataArr.unitwgt_s.join("|"),
        qtyunit_s: dataArr.qtyunit_s.join("|"),
        qty_s: dataArr.qty_s.join("|"),
        lotnum_s: dataArr.lotnum_s.join("|"),
        len_s: dataArr.len_s.join("|"),
        lenunit_s: dataArr.lenunit_s.join("|"),
        wgt_s: dataArr.wgt_s.join("|"),
        wgtunit_s: dataArr.wgtunit_s.join("|"),
        wonamt_s: dataArr.wonamt_s.join("|"),
        taxamt_s: dataArr.taxamt_s.join("|"),
        load_place_s: dataArr.load_place_s.join("|"),
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        width_s: dataArr.width_s.join("|"),
        itemthick_s: dataArr.itemthick_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        unp_s: dataArr.unp_s.join("|"),
      }));
    } else {
      alert("필수 값을 채워주세요.");
    }
  };

  const saveExcel = (jsonArr: any[]) => {
    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      let valid = true;

      let arr: any = [];
      jsonArr.map((item: any) => {
        if (
          item.품목코드 == undefined ||
          item.수량 == undefined ||
          item.LOTNO == undefined ||
          item.품목계정 == undefined
        ) {
          valid = false;
        }
        arr.push(item.LOTNO);
      });

      const set = new Set(arr);

      if (arr.length !== set.size) {
        alert("LOT NO가 중복되었습니다.");
        return false;
      }
      if (valid == true) {
        let dataArr: TdataArr = {
          itemcd_s: [],
          itemacnt_s: [],
          custcd_s: [],
          itemgrade_s: [],
          unitwgt_s: [],
          qtyunit_s: [],
          qty_s: [],
          lotnum_s: [],
          len_s: [],
          lenunit_s: [],
          wgt_s: [],
          wgtunit_s: [],
          wonamt_s: [],
          taxamt_s: [],
          load_place_s: [],
          rowstatus_s: [],
          width_s: [],
          itemthick_s: [],
          remark_s: [],
          unp_s: [],
        };

        jsonArr.forEach((item: any, idx: number) => {
          const {
            품목코드 = "",
            품목계정 = "",
            custcd = "",
            itemgrade = "",
            unitwgt = "",
            qtyunit = "",
            수량 = "",
            LOTNO = "",
            len = "",
            lenunit = "",
            wgt = "",
            wgtunit = "",
            wonamt = "",
            taxamt = "",
            적재장소 = "",
            rowstatus = "",
            width = "",
            itemthick = "",
            remark = "",
            unp = "",
          } = item;

          const itemacnts = itemacntListData.find(
            (items: any) => items.code_name == 품목계정
          )?.sub_code;
          const load_places = loadplaceListData.find(
            (items: any) => items.code_name == 적재장소
          )?.sub_code;

          dataArr.rowstatus_s.push(rowstatus == "" ? "N" : rowstatus);
          dataArr.itemcd_s.push(품목코드);
          dataArr.itemacnt_s.push(itemacnts != undefined ? itemacnts : "");
          dataArr.custcd_s.push(custcd == "" ? "" : custcd);
          dataArr.itemgrade_s.push(itemgrade == "" ? "" : itemgrade);
          dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
          dataArr.qtyunit_s.push(qtyunit == "" ? "" : qtyunit);
          dataArr.qty_s.push(수량);
          dataArr.lotnum_s.push(LOTNO == "" ? "" : LOTNO);
          dataArr.len_s.push(len == "" ? 0 : len);
          dataArr.lenunit_s.push(lenunit == "" ? "" : lenunit);
          dataArr.wgt_s.push(wgt == "" ? 0 : wgt);
          dataArr.wgtunit_s.push(wgtunit == "" ? "" : wgtunit);
          dataArr.wonamt_s.push(wonamt == "" ? 0 : unitwgt);
          dataArr.taxamt_s.push(taxamt == "" ? 0 : unitwgt);
          dataArr.load_place_s.push(
            load_places != undefined ? load_places : ""
          );
          dataArr.width_s.push(width == "" ? 0 : width);
          dataArr.itemthick_s.push(itemthick == "" ? 0 : itemthick);
          dataArr.remark_s.push(remark == "" ? "" : remark);
          dataArr.unp_s.push(unp == "" ? 0 : unp);
        });

        setParaData((prev) => ({
          ...prev,
          location: filters.location,
          position: filters.position,
          yyyymm: convertDateToStr(filters.yyyymm).substr(0, 4) + "00",
          itemcd_s: dataArr.itemcd_s.join("|"),
          itemacnt_s: dataArr.itemacnt_s.join("|"),
          custcd_s: dataArr.custcd_s.join("|"),
          itemgrade_s: dataArr.itemgrade_s.join("|"),
          unitwgt_s: dataArr.unitwgt_s.join("|"),
          qtyunit_s: dataArr.qtyunit_s.join("|"),
          qty_s: dataArr.qty_s.join("|"),
          lotnum_s: dataArr.lotnum_s.join("|"),
          len_s: dataArr.len_s.join("|"),
          lenunit_s: dataArr.lenunit_s.join("|"),
          wgt_s: dataArr.wgt_s.join("|"),
          wgtunit_s: dataArr.wgtunit_s.join("|"),
          wonamt_s: dataArr.wonamt_s.join("|"),
          taxamt_s: dataArr.taxamt_s.join("|"),
          load_place_s: dataArr.load_place_s.join("|"),
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          width_s: dataArr.width_s.join("|"),
          itemthick_s: dataArr.itemthick_s.join("|"),
          remark_s: dataArr.remark_s.join("|"),
          unp_s: dataArr.unp_s.join("|"),
        }));
      } else {
        alert("양식이 맞지 않습니다.");
      }
    }
  };

  const setCopyData = (data: any) => {
    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0) return false;

    for (var i = 1; i < data.length; i++) {
      if (data[0].itemcd == data[i].itemcd) {
        alert("중복되는 품목이있습니다.");
        return false;
      }
    }

    try {
      data.map((item: any) => {
        mainDataResult.data.map((item) => {
          if (item.num > temp2) {
            temp2 = item.num;
          }
        });
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp2,
          anneal: "",
          bnatur: item.bnatur,
          chk: item.chk,
          custcd: item.chk,
          insiz: item.insiz,
          itemacnt: item.itemacnt,
          itemcd: item.itemcd,
          itemgrade: "",
          itemlvl1: item.itemlvl1,
          itemlvl2: item.itemlvl2,
          itemlvl3: item.itemlvl3,
          itemnm: item.itemnm,
          itemno: item.itemno,
          itemod: "",
          itemthick: item.itemthick,
          len: item.len,
          lenunit: item.lenunit,
          load_place: item.load_place,
          location: item.location,
          lotnum: "",
          manudiv: "",
          orgdiv: "01",
          pgmdiv: "",
          position: item.position,
          qty: item.qty,
          qtyunit: "",
          remark: item.remark,
          spec: item.spec,
          taxamt: item.taxamt,
          thickness: 0,
          totamt: 0,
          unitwgt: item.unitwgt,
          unp: item.unp,
          wgt: 0,
          wgtunit: item.wgtunit,
          width: item.width,
          wonamt: item.wonamt,
          rowstatus: "N",
        };
        setMainDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
      });
    } catch (e) {
      alert(e);
    }
  };

  const [values, setValues] = React.useState<boolean>(false);

  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  return (
    <>
      <TitleContainer>
        <Title>기초재고등록</Title>
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
              <th>연월</th>
              <td>
                <DatePicker
                  name="yyyymm"
                  value={filters.yyyymm}
                  format="yyyy"
                  onChange={filterInputChange}
                  calendar={YearCalendar}
                  className="required"
                  placeholder=""
                />
              </td>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput style={{ marginTop: "3px" }}>
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
              <th>품목계정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemacnt"
                    value={filters.itemacnt}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
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
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
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
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <FormContext.Provider
        value={{
          itemInfo,
          setItemInfo,
        }}
      >
        <GridContainer>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>
                요약정보
                {permissions && (
                  <ExcelUploadButtons
                    saveExcel={saveExcel}
                    permissions={permissions}
                    style={{ marginLeft: "15px" }}
                  />
                )}
                <Button
                  title="Export Excel"
                  onClick={onAttachmentsWndClick}
                  icon="file"
                  fillMode="outline"
                  themeColor={"primary"}
                  style={{ marginLeft: "10px" }}
                >
                  엑셀양식
                </Button>
              </GridTitle>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  fillMode="outline"
                  onClick={onCopyWndClick}
                  icon="folder-open"
                >
                  품목참조
                </Button>
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
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "76vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  itemacnt: itemacntListData.find(
                    (items: any) => items.sub_code === row.itemacnt
                  )?.code_name,
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
              <GridColumn
                field="chk"
                title=" "
                width="45px"
                headerCell={CustomCheckBoxCell}
                cell={CheckBoxCell}
              />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList"]
                  .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  .map(
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
                              : customField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : itemcdField.includes(item.fieldName)
                              ? ColumnCommandCell
                              : undefined
                          }
                          headerCell={
                            requiredfield.includes(item.fieldName)
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
                        ></GridColumn>
                      )
                  )}
            </Grid>
          </ExcelExport>
        </GridContainer>
      </FormContext.Provider>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          para={"MA_A7000W"}
        />
      )}
      {CopyWindowVisible && (
        <CopyWindow2
          setVisible={setCopyWindowVisible}
          setData={setCopyData}
          itemacnt={""}
        />
      )}
    </>
  );
};

export default MA_A7000W;
