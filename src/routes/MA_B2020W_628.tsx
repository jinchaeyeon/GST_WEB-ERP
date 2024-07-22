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
  useRef,
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getItemQuery,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ItemsMultiWindow from "../components/Windows/CommonWindows/ItemsMultiWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IItemData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/MA_B2020W_628_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

let temp = 0;
var height = 0;
var height2 = 0;
let deletedMainRows: object[] = [];
const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
const numberField = ["qty, hsqty", "wonamt", "taxamt", "unp"];
const numberField2 = ["qty, hsqty", "wonamt", "taxamt"];
const dateField = ["dlvdt"];
const commandField = ["itemcd"];

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
  const sessionUserId = UseGetValueFromSessionItem("user_id");
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

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
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
        ordsts: defaultOption.find((item: any) => item.id == "ordsts")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA015, L_MA035",
    //수량단위, 발주구분
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [purtypeListData, setPurtypeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setPurtypeListData(getBizCom(bizComponentData, "L_MA035"));
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
    custcd: sessionUserId,
    ordsts: "",
    itemnm: "",
    rcvcustnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

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
      "@p_find_row_value": filters.find_row_value,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.ordkey == filters.find_row_value
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
            : rows.find((row: any) => row.ordkey == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
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

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
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
      field == "ordsiz" ||
      field == "specnum" ||
      field == "specsize" ||
      field == "qtyunit" ||
      field == "rowstatus" ||
      field == "hsqty" ||
      field == "hsunit" ||
      field == "unp" ||
      field == "wonamt" ||
      field == "taxamt" ||
      field == "itemdiv" ||
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
  const [itemMultiWindowVisible, setItemMultiWindowVisible] =
    useState<boolean>(false);
  const onItemMultiWndClick = () => {
    setEditIndex(undefined);
    setItemMultiWindowVisible(true);
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
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,

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
              //onClick={onSaveClick}
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
            fileName="발주관리"
          >
            <Grid
              style={{
                height: isMobile ? mobileheight : webheight,
              }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  purtype: purtypeListData.find(
                    (item: any) => item.sub_code == row.purtype
                  )?.code_name,
                  qtyunit: qtyunitListData.find(
                    (item: any) => item.sub_code == row.qtyunit
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
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
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
        </FormContext.Provider>
      </GridContainer>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
      {itemMultiWindowVisible && (
        <ItemsMultiWindow
          setVisible={setItemMultiWindowVisible}
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

export default MA_B2020W_628;
