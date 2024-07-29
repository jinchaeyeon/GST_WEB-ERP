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
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input,
  InputChangeEvent,
} from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import NumberFloatCell from "../components/Cells/NumberFloatCell";
import {
  GetPropertyValueByName,
  ThreeNumberceil,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getItemQuery,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
  toDate
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
import MA_B2020W_628_PRINT from "../components/Prints/MA_B2020W_628_PRINT";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ItemWindow_FNF from "../components/Windows/CommonWindows/ItemsWindow_FNF";
import Window from "../components/Windows/WindowComponent/Window";
import { useApi } from "../hooks/api";
import { IItemData, IWindowPosition } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/MA_B2020W_628_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { useHistory } from "react-router-dom";

let valid = false;
let valid2 = false;
let temp = 0;
var height = 0;
var height2 = 0;
let deletedMainRows: object[] = [];
const DATA_ITEM_KEY = "num";
const numberField = ["wonamt", "taxamt", "unp"];
const numberField2 = ["qty", "hsqty"];
const numberField3 = ["wonamt", "taxamt"];
const dateField = ["dlvdt"];
const commandField = ["itemcd"];
const requiredField = ["dlvdt", "itemcd", "qty"];
const floatfield = ["qty", "hsqty", "bnatur_insiz"];

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
  bnatur_insiz: number;
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
  origin: string;
  hscode: string;
  numref1: number;
  numref2: number;
  itemtype: string;
  pac: string;
  taxdiv: string;
  unpcalmeth: string;
};

const defaultItemInfo = {
  itemcd: "",
  itemno: "",
  itemnm: "",
  insiz: "",
  model: "",
  itemacnt: "",
  itemacntnm: "",
  bnatur_insiz: 0,
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
  origin: "",
  hscode: "",
  numref1: 0,
  numref2: 0,
  itemtype: "",
  pac: "",
  taxdiv: "",
  unpcalmeth: "",
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
    valid = true;
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
      bnatur_insiz,
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
      origin,
      hscode,
      numref1,
      numref2,
      itemtype,
      pac,
      taxdiv,
      unpcalmeth,
    } = data;
    setItemInfo({
      itemcd,
      itemno,
      itemnm,
      insiz,
      model,
      itemacnt,
      itemacntnm,
      bnatur_insiz,
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
      origin,
      hscode,
      numref1,
      itemtype,
      numref2,
      pac,
      taxdiv,
      unpcalmeth,
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
        <ItemWindow_FNF
          Close={() => {
            setItemWindowVisible2((prev) => !prev);
            valid = false;
            valid2 = false;
          }}
          workType={"ROW_ADD"}
          setData={setItemData2}
        />
      )}
    </>
  );
};

const MA_B2020W_628: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionCustcd = UseGetValueFromSessionItem("custcd");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const sessionpc = UseGetValueFromSessionItem("pc");
  const sessionuserId = UseGetValueFromSessionItem("user_id");
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setWebHeight(getDeviceHeight(true) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);
  const history = useHistory();
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      if (queryParams.has("go")) {
        history.replace({}, "");
        setFilters((prev) => ({
          ...prev,
          frdt: toDate(queryParams.get("go") as string),
          todt: toDate(queryParams.get("go") as string),
          ordsts: defaultOption.find((item: any) => item.id == "ordsts")
            ?.valueCode,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          ordsts: defaultOption.find((item: any) => item.id == "ordsts")
            ?.valueCode,
          isSearch: true,
        }));
      }
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA066,L_BA061, L_BA015, L_SA004, L_BA065_628",
    //수량단위, 발주구분
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [ordstsListData, setOrdstsListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [originListData, setoriginListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemtypeListData, setitemtypeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setOrdstsListData(getBizCom(bizComponentData, "L_SA004"));
      setoriginListData(getBizCom(bizComponentData, "L_BA065_628"));
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setitemtypeListData(getBizCom(bizComponentData, "L_BA066"));
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

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  let deviceHeight = document.documentElement.clientHeight;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });
  const onChangePostion = (position: any) => {
    setPosition(position);
  };
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    custcd: sessionCustcd,
    ordsts: "",
    itemnm: "",
    rcvcustnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_B2020W_628_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_ordsts": filters.ordsts,
        "@p_itemnm": filters.itemnm,
        "@p_rcvcustnm": filters.rcvcustnm,
        "@p_itemcd": "",
        "@p_today": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
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

  //그리드 리셋
  const resetAllGrid = () => {
    valid2 = false;
    deletedMainRows = [];
    setValues(false);
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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

  // 소수점 셋째 자리에서 반올림하여 소수점 둘째 자리까지 표현
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
        {ThreeNumberceil(sum).toFixed(2)}
      </td>
    );
  };

  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
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
        {ThreeNumberceil(sum)}
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

  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur_insiz: number;
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
    origin: string;
    hscode: string;
    numref1: number;
    numref2: number;
    itemtype: string;
    taxdiv: string;
    unpcalmeth: string;
    pac: string;
  }

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = async (item: IItemData) => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });

    var unp = await fetchUnpItem(filters.custcd, item.itemcd);
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      dlvdt: convertDateToStr(new Date()),
      edityn: "신규",
      hsqty: 0,
      hscode: item.hscode,
      itemacnt: item.itemacnt,
      itemcd: item.itemcd,
      itemtype: item.itemtype,
      itemnm: item.itemnm,
      ordnum: "",
      ordseq: 0,
      spec: item.spec,
      ordsts: "1",
      orgdiv: sessionOrgdiv,
      qty: 0,
      qtyunit: item.invunit,
      rcvcustnm: "",
      remark: "",
      origin: item.origin,
      bnatur_insiz: item.bnatur_insiz,
      taxamt: 0,
      taxdiv: item.taxdiv,
      numref1: item.numref1,
      numref2: item.numref2,
      unp: unp,
      unpcalmeth: item.unpcalmeth,
      unpstd: "",
      wonamt: 0,
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_B2020W_628_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_B2020W_628_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
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
      field == "ordsts" ||
      field == "itemnm" ||
      field == "spec" ||
      field == "origin" ||
      field == "bnatur_insiz" ||
      field == "qtyunit" ||
      field == "rowstatus" ||
      field == "hsqty" ||
      field == "hscode" ||
      field == "unp" ||
      field == "wonamt" ||
      field == "taxamt" ||
      field == "itemtype" ||
      field == "edityn" ||
      field == "itemacnt"
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
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                wonamt: item.qty * item.unp,
                hsqty: item.numref1 == 0 ? 0 : item.qty / item.numref1,
                taxamt:
                  item.qty && item.unp != 0
                    ? item.taxdiv == "A"
                      ? item.unpcalmeth == "2"
                        ? Math.ceil(
                            item.qty * item.unp - (item.qty * item.unp) / 1.1
                          )
                        : Math.ceil(item.qty * item.unp * 0.1)
                      : 0
                    : 0,
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
        if (valid == false) {
          mainDataResult.data.map((item: { [x: string]: any; itemcd: any }) => {
            if (editIndex == item[DATA_ITEM_KEY]) {
              fetchItemData(item.itemcd);
            }
          });
        }
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

  useEffect(() => {
    (async () => {
      if (valid2 == false) {
        var unp = await fetchUnpItem(filters.custcd, itemInfo.itemcd);
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
                bnatur_insiz: itemInfo.bnatur_insiz,
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
                origin: itemInfo.origin,
                hscode: itemInfo.hscode,
                unp: unp,
                qty: 0,
                wonamt: 0,
                numref1: itemInfo.numref1,
                numref2: itemInfo.numref2,
                itemtype: itemInfo.itemtype,
                taxamt: 0,
                pac: itemInfo.pac,
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
        if (valid == true) {
          valid2 = true;
        }
      } else {
        mainDataResult.data.map((item) => {
          if (item[DATA_ITEM_KEY] > temp) {
            temp = item[DATA_ITEM_KEY];
          }
        });

        var unp = await fetchUnpItem(filters.custcd, itemInfo.itemcd);
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          dlvdt: convertDateToStr(new Date()),
          edityn: "신규",
          hsqty: 0,
          hscode: itemInfo.hscode,
          itemacnt: itemInfo.itemacnt,
          itemcd: itemInfo.itemcd,
          itemtype: itemInfo.itemtype,
          itemnm: itemInfo.itemnm,
          ordnum: "",
          ordseq: 0,
          spec: itemInfo.spec,
          ordsts: "1",
          orgdiv: sessionOrgdiv,
          qty: 0,
          qtyunit: itemInfo.invunit,
          rcvcustnm: "",
          remark: "",
          origin: itemInfo.origin,
          bnatur_insiz: itemInfo.bnatur_insiz,
          taxamt: 0,
          taxdiv: itemInfo.taxdiv,
          numref1: itemInfo.numref1,
          numref2: itemInfo.numref2,
          unp: unp,
          unpcalmeth: itemInfo.unpcalmeth,
          unpstd: "",
          wonamt: 0,
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
    })();
  }, [itemInfo]);

  const fetchUnpItem = async (custcd: string, itemcd: string) => {
    if (!permissions.view) return;
    if (custcd == "") return;
    let data: any;
    const datas =
      mainDataResult.total > 0
        ? mainDataResult.data.filter(
            (item: any) =>
              item[DATA_ITEM_KEY] ==
              Object.getOwnPropertyNames(selectedState)[0]
          )[0].dlvdt
        : convertDateToStr(new Date());
    const parameters: Iparameters = {
      procedureName: "P_MA_B2020W_628_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "UNP",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_ordsts": filters.ordsts,
        "@p_itemnm": filters.itemnm,
        "@p_rcvcustnm": filters.rcvcustnm,
        "@p_itemcd": itemcd,
        "@p_today": datas,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      return rows[0].salunp;
    }
  };

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
            bnatur_insiz,
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
            origin,
            hscode,
            numref1,
            numref2,
            itemtype,
            pac,
            taxdiv,
            unpcalmeth,
          } = rows[0];
          setItemInfo({
            itemcd,
            itemno,
            itemnm,
            insiz,
            model,
            itemacnt,
            itemacntnm,
            bnatur_insiz,
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
            origin,
            hscode,
            numref1,
            itemtype,
            numref2,
            pac,
            taxdiv,
            unpcalmeth,
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
                  bnatur_insiz: 0,
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
                  origin: "",
                  hscode: "",
                  unp: 0,
                  numref1: 0,
                  numref2: 0,
                  wonamt: 0,
                  itemtype: "",
                  taxamt: 0,
                  pac: "",
                  taxdiv: "",
                  unpcalmeth: "",
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

  const onItemMultiWndClick = () => {
    setEditIndex(undefined);
    setItemWindowVisible(true);
    valid = true;
    valid2 = true;
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amtunit: "KRW",
      dlvdt: convertDateToStr(new Date()),
      edityn: "신규",
      hsqty: 0,
      hscode: "",
      itemacnt: "",
      itemcd: "",
      itemtype: "",
      itemnm: "",
      ordnum: "",
      ordseq: 0,
      spec: "",
      ordsts: "1",
      orgdiv: sessionOrgdiv,
      qty: 0,
      qtyunit: "",
      rcvcustnm: "",
      remark: "",
      origin: "",
      bnatur_insiz: 0,
      taxamt: 0,
      taxdiv: "",
      numref1: 0,
      numref2: 0,
      unp: 0,
      unpcalmeth: "",
      unpstd: "",
      wonamt: 0,
      orddt: convertDateToStr(new Date()),
      ordspec: "",
      pac: "",
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

  const onCopyClick = () => {
    if (mainDataResult.total > 0) {
      mainDataResult.data.map((item) => {
        if (item[DATA_ITEM_KEY] > temp) {
          temp = item[DATA_ITEM_KEY];
        }
      });
      const data = mainDataResult.data.filter(
        (item: any) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        amtunit: data.amtunit,
        dlvdt: convertDateToStr(new Date()),
        edityn: "신규",
        hsqty: data.hsqty,
        hscode: data.hscode,
        itemacnt: data.itemacnt,
        itemcd: data.itemcd,
        itemtype: data.itemtype,
        itemnm: data.itemnm,
        ordnum: data.ordnum,
        ordseq: data.ordseq,
        spec: data.spec,
        ordsts: data.ordsts,
        orgdiv: data.orgdiv,
        qty: data.qty,
        qtyunit: data.qtyunit,
        rcvcustnm: data.rcvcustnm,
        remark: data.remark,
        origin: data.origin,
        bnatur_insiz: data.bnatur_insiz,
        taxamt: data.taxamt,
        taxdiv: data.taxdiv,
        numref1: data.numref1,
        numref2: data.numref2,
        unp: data.unp,
        unpcalmeth: data.unpcalmeth,
        unpstd: data.unpstd,
        wonamt: data.wonamt,
        orddt: data.orddt,
        ordspec: data.ordspec,
        pac: data.pac,
        rowstatus: "N",
      };
      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    let valid = true;
    let valid2 = true;
    let valid3 = true;
    let valid4 = true;
    let valid5 = true;
    let valid6 = true;
    let valid7 = true;
    let date = convertDateToStr(new Date());
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    dataItem.map((item: any) => {
      if (
        item.dlvdt.substring(0, 4) < "1997" ||
        item.dlvdt.substring(6, 8) > "31" ||
        item.dlvdt.substring(6, 8) < "01" ||
        item.dlvdt.substring(6, 8).length != 2
      ) {
        valid = false;
      } else {
        if (item.dlvdt < date) {
          valid3 = false;
        }
        if (item.dlvdt == date && new Date().getHours() > 12) {
          valid4 = false;
        }
        if (date != null ? parseInt(date) - parseInt(item.dlvdt) > 90 : false) {
          valid5 = false;
        }
        if (
          new Date().getDay() == 5 &&
          toDate(item.dlvdt).getDay() == 6 &&
          new Date().getHours() > 17
        ) {
          valid6 = false;
        }
      }

      if (item.ordsts != "1") {
        valid2 = false;
      }

      if (item.qty < item.numref2) {
        valid7 = false;
      }
    });

    if (valid != true) {
      alert("필수값을 입력해주세요.");
      return false;
    }
    if (valid2 != true) {
      alert(
        "처리 상태가 '등록'이 아닌 건이 포함되어 있어 수정사항 저장이 불가능합니다."
      );
      return false;
    }
    if (valid3 != true) {
      alert("본사출고일이 현재 날짜보다 이전입니다.");
      return false;
    }
    if (valid4 != true) {
      alert(
        "본사출고일이 당일입니다. \n당일건은 12시 이전에만 등록 가능합니다."
      );
      return false;
    }
    if (valid5 != true) {
      alert(
        "본사출고일이 현재 날짜보다 90일 이후 입니다. \n본사출고일은 현재 날짜 이후로 90일까지 입력가능합니다."
      );
      return false;
    }
    if (valid6 != true) {
      alert(
        "토요 발주건은 금요일 5시 이전에만 등록 가능합니다. \n이후 발주건에 대해서는 본사로 전화주시기 바랍니다."
      );
      return false;
    }
    if (valid7 != true) {
      alert("최저주문수량보다 수량이 적습니다.");
      return false;
    }
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    let dataArr: any = {
      rowstatus_s: [],
      dlvdt_s: [],
      itemcd_s: [],
      itemnm_s: [],
      ordsiz_s: [],
      qty_s: [],
      qtyunit_s: [],
      boxqty_s: [],
      hscode_s: [],
      rcvcustnm_s: [],
      remark_s: [],
      pac_s: [],
      unp_s: [],
      wonamt_s: [],
      taxamt_s: [],
      ordsts_s: [],
      ordnum_s: [],
      ordseq_s: [],
      ordspec_s: [],
      orddt_s: [],
      amtunit_s: [],
      itemacnt_s: [],
      taxdiv_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        dlvdt = "",
        itemcd = "",
        itemnm = "",
        spec = "",
        qty = "",
        qtyunit = "",
        hsqty = "",
        hscode = "",
        rcvcustnm = "",
        remark = "",
        pac = "",
        unp = "",
        wonamt = "",
        taxamt = "",
        ordsts = "",
        ordnum = "",
        ordseq = "",
        ordspec = "",
        orddt = "",
        amtunit = "",
        itemacnt = "",
        taxdiv = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.dlvdt_s.push(dlvdt == "99991231" ? "" : dlvdt);
      dataArr.itemcd_s.push(itemcd);
      dataArr.itemnm_s.push(itemnm);
      dataArr.ordsiz_s.push(spec);
      dataArr.qty_s.push(qty == "" ? 0 : qty);
      dataArr.qtyunit_s.push(qtyunit);
      dataArr.boxqty_s.push(hsqty == "" ? 0 : hsqty);
      dataArr.hscode_s.push(hscode);
      dataArr.rcvcustnm_s.push(rcvcustnm);
      dataArr.remark_s.push(remark);
      dataArr.pac_s.push(pac);
      dataArr.unp_s.push(unp);
      dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
      dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
      dataArr.ordsts_s.push(ordsts);
      dataArr.ordnum_s.push(ordnum);
      dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
      dataArr.ordspec_s.push(ordspec);
      dataArr.orddt_s.push(orddt == "99991231" ? "" : dlvdt);
      dataArr.amtunit_s.push(amtunit);
      dataArr.itemacnt_s.push(itemacnt);
      dataArr.taxdiv_s.push(taxdiv);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        dlvdt = "",
        itemcd = "",
        itemnm = "",
        spec = "",
        qty = "",
        qtyunit = "",
        hsqty = "",
        hscode = "",
        rcvcustnm = "",
        remark = "",
        pac = "",
        unp = "",
        wonamt = "",
        taxamt = "",
        ordsts = "",
        ordnum = "",
        ordseq = "",
        ordspec = "",
        orddt = "",
        amtunit = "",
        itemacnt = "",
        taxdiv = "",
      } = item;

      dataArr.rowstatus_s.push("D");
      dataArr.dlvdt_s.push(dlvdt == "99991231" ? "" : dlvdt);
      dataArr.itemcd_s.push(itemcd);
      dataArr.itemnm_s.push(itemnm);
      dataArr.ordsiz_s.push(spec);
      dataArr.qty_s.push(qty == "" ? 0 : qty);
      dataArr.qtyunit_s.push(qtyunit);
      dataArr.boxqty_s.push(hsqty == "" ? 0 : hsqty);
      dataArr.hscode_s.push(hscode);
      dataArr.rcvcustnm_s.push(rcvcustnm);
      dataArr.remark_s.push(remark);
      dataArr.pac_s.push(pac);
      dataArr.unp_s.push(unp);
      dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
      dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
      dataArr.ordsts_s.push(ordsts);
      dataArr.ordnum_s.push(ordnum);
      dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
      dataArr.ordspec_s.push(ordspec);
      dataArr.orddt_s.push(orddt == "99991231" ? "" : dlvdt);
      dataArr.amtunit_s.push(amtunit);
      dataArr.itemacnt_s.push(itemacnt);
      dataArr.taxdiv_s.push(taxdiv);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      custcd: sessionCustcd,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      dlvdt_s: dataArr.dlvdt_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      itemnm_s: dataArr.itemnm_s.join("|"),
      ordsiz_s: dataArr.ordsiz_s.join("|"),
      qty_s: dataArr.qty_s.join("|"),
      qtyunit_s: dataArr.qtyunit_s.join("|"),
      boxqty_s: dataArr.boxqty_s.join("|"),
      hscode_s: dataArr.hscode_s.join("|"),
      rcvcustnm_s: dataArr.rcvcustnm_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      pac_s: dataArr.pac_s.join("|"),
      unp_s: dataArr.unp_s.join("|"),
      wonamt_s: dataArr.wonamt_s.join("|"),
      taxamt_s: dataArr.taxamt_s.join("|"),
      ordsts_s: dataArr.ordsts_s.join("|"),
      ordnum_s: dataArr.ordnum_s.join("|"),
      ordseq_s: dataArr.ordseq_s.join("|"),
      ordspec_s: dataArr.ordspec_s.join("|"),
      orddt_s: dataArr.orddt_s.join("|"),
      amtunit_s: dataArr.amtunit_s.join("|"),
      itemacnt_s: dataArr.itemacnt_s.join("|"),
      taxdiv_s: dataArr.taxdiv_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    custcd: sessionCustcd,
    rowstatus_s: "",
    dlvdt_s: "",
    itemcd_s: "",
    itemnm_s: "",
    ordsiz_s: "",
    qty_s: "",
    qtyunit_s: "",
    boxqty_s: "",
    hscode_s: "",
    rcvcustnm_s: "",
    remark_s: "",
    pac_s: "",
    unp_s: "",
    wonamt_s: "",
    taxamt_s: "",
    ordsts_s: "",
    ordnum_s: "",
    ordseq_s: "",
    ordspec_s: "",
    orddt_s: "",
    amtunit_s: "",
    itemacnt_s: "",
    taxdiv_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_MA_B2020W_628_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_custcd": ParaData.custcd,
      "@p_form_id": "MA_B2020W_628",
      "@p_userid": sessionuserId,
      "@p_pc": sessionpc,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_dlvdt_s": ParaData.dlvdt_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_ordsiz_s": ParaData.ordsiz_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_boxqty_s": ParaData.boxqty_s,
      "@p_hscode_s": ParaData.hscode_s,
      "@p_rcvcustnm_s": ParaData.rcvcustnm_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_pac_s": ParaData.pac_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_ordsts_s": ParaData.ordsts_s,
      "@p_ordnum_s": ParaData.ordnum_s,
      "@p_ordseq_s": ParaData.ordseq_s,
      "@p_ordspec_s": ParaData.ordspec_s,
      "@p_orddt_s": ParaData.orddt_s,
      "@p_amtunit_s": ParaData.amtunit_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_taxdiv_s": ParaData.taxdiv_s,
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
      setValues(false);
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        custcd: sessionCustcd,
        rowstatus_s: "",
        dlvdt_s: "",
        itemcd_s: "",
        itemnm_s: "",
        ordsiz_s: "",
        qty_s: "",
        qtyunit_s: "",
        boxqty_s: "",
        hscode_s: "",
        rcvcustnm_s: "",
        remark_s: "",
        pac_s: "",
        unp_s: "",
        wonamt_s: "",
        taxamt_s: "",
        ordsts_s: "",
        ordnum_s: "",
        ordseq_s: "",
        ordspec_s: "",
        orddt_s: "",
        amtunit_s: "",
        itemacnt_s: "",
        taxdiv_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };
  const [previewVisible, setPreviewVisible] = React.useState<boolean>(false);

  const onPrintWndClick = () => {
    if (!permissions.print) return;
    if (mainDataResult.total > 0) {
      window.scrollTo(0, 0);
      setPreviewVisible((prev) => !prev);
    } else {
      alert("데이터가 없습니다.");
    }
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

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
              <th>본사출고일</th>
              <td>
              <div style={{ display: "flex", gap: "10px" }}>
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                  />
                  <DatePicker
                    name="todt"
                    value={filters.todt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                  />
                </div>
              </td>
              <th>처리상태</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="ordsts"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
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
              <th>납품처명</th>
              <td>
                <Input
                  name="rcvcustnm"
                  type="text"
                  value={filters.rcvcustnm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>요약정보</GridTitle>
          <ButtonContainer>
            <Button
              onClick={onPrintWndClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="print"
              disabled={permissions.print ? false : true}
            >
              출력
            </Button>
            <Button
              themeColor={"primary"}
              onClick={onItemMultiWndClick}
              icon="folder-open"
              disabled={permissions.save ? false : true}
            >
              품목참조
            </Button>
            <Button
              onClick={onAddClick}
              themeColor={"primary"}
              icon="plus"
              title="행 추가"
              disabled={permissions.save ? false : true}
            ></Button>
            <Button
              onClick={onCopyClick}
              fillMode="outline"
              themeColor={"primary"}
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
            <Button
              onClick={onSaveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
              title="행 저장"
              disabled={permissions.save ? false : true}
            ></Button>
          </ButtonContainer>
        </GridTitleContainer>
        <FormContext.Provider
          value={{
            itemInfo,
            setItemInfo,
          }}
        >
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
            fileName={getMenuName()}
          >
            <Grid
              style={{
                height: isMobile ? mobileheight : webheight,
              }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  ordsts: ordstsListData.find(
                    (item: any) => item.sub_code == row.ordsts
                  )?.code_name,
                  qtyunit: qtyunitListData.find(
                    (item: any) => item.sub_code == row.qtyunit
                  )?.code_name,
                  origin: originListData.find(
                    (item: any) => item.sub_code == row.origin
                  )?.code_name,
                  itemacnt: itemacntListData.find(
                    (items: any) => items.sub_code == row.itemacnt
                  )?.code_name,
                  itemtype: itemtypeListData.find(
                    (item: any) => item.sub_code == row.itemtype
                  )?.code_name,
                  dlvdt: row.dlvdt
                    ? new Date(dateformat(row.dlvdt))
                    : new Date(dateformat("99991231")),
                  edityn: row.edityn == "N" ? "" : row.edityn,
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
              <GridColumn field="num" title="#" width="40px" />
              <GridColumn
                field="chk"
                title=" "
                width="45px"
                headerCell={CustomCheckBoxCell}
                cell={CheckBoxCell}
              />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList"]
                  ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  ?.map(
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
                              : commandField.includes(item.fieldName)
                              ? ColumnCommandCell
                              : floatfield.includes(item.fieldName)
                              ? NumberFloatCell
                              : CenterCell
                          }
                          headerCell={
                            requiredField.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : numberField2.includes(item.fieldName)
                              ? editNumberFooterCell
                              : numberField3.includes(item.fieldName)
                              ? editNumberFooterCell2
                              : undefined
                          }
                        ></GridColumn>
                      )
                  )}
            </Grid>
          </ExcelExport>
        </FormContext.Provider>
      </GridContainer>
      {itemWindowVisible && (
        <ItemWindow_FNF
          Close={() => {
            setItemWindowVisible((prev) => !prev);
            valid = false;
            valid2 = false;
          }}
          workType={"FILTER"}
          setData={setItemData}
        />
      )}
      {previewVisible && (
        <Window
          titles={"미리보기"}
          Close={() => {
            setPreviewVisible((prev) => !prev);
          }}
          positions={position}
          modals={true}
          onChangePostion={onChangePostion}
        >
          <MA_B2020W_628_PRINT data={filters} />
        </Window>
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

export default MA_B2020W_628;
