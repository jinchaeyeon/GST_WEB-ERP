import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import "swiper/css";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getCustDataQuery,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/SA_A7900W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let deletedMainRows: any[] = [];
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
let temp = 0;

const requiredField = ["inoutdiv", "custcd", "amtunit"];
const radioField = ["inoutdiv"];
const commandField = ["custcd"];
const comboField = ["amtunit"];
const numberField = [
  "amt",
  "wonamt",
  "taxamt",
  "baseamt",
  "saleamt",
  "collectamt",
  "nowamt",
];

const FormContext = createContext<{
  custcd: string;
  setCustcd: (d: any) => void;
  custnm: string;
  setCustnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
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
  const {
    custcd,
    custnm,
    setCustcd,
    setCustnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext);
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
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    if (dataItem.rowstatus == "N") {
      setCustWindowVisible(true);
    } else {
      alert("신규행만 수정가능합니다.");
    }
  };

  const setCustData = (data: ICustData) => {
    setCustcd(data.custcd);
    setCustnm(data.custnm);
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
      <ButtonInInput>
        <Button
          onClick={onCustWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
        />
      )}
    </>
  );
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("R_Unpaid", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "inoutdiv" ? "R_Unpaid" : "";
  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell
      bizComponentData={bizComponent}
      {...props}
      disabled={props.dataItem.rowstatus == "N" ? false : true}
    />
  ) : (
    <td />
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA020", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "amtunit" ? "L_BA020" : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};
const SA_A7900W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [tabSelected, setTabSelected] = React.useState(0);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            custcd: custcd,
            custnm: custnm,
            amt: 0,
            taxamt: 0,
            wonamt: 0,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [custcd, custnm]);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".k-tabstrip-items-wrapper");
      height3 = getHeight(".ButtonContainer");
      height4 = getHeight(".ButtonContainer2");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2(getDeviceHeight(true) - height - height2 - height4);
        setWebHeight(getDeviceHeight(true) - height - height2 - height3);
        setWebHeight2(getDeviceHeight(true) - height - height2 - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, tabSelected]);

  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
      }));
    } else {
      setFilters2((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
      }));
    }
    deletedMainRows = [];
    setTabSelected(e.selected);
  };

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        amtunit: defaultOption.find((item: any) => item.id == "amtunit")
          ?.valueCode,
        inoutdiv: defaultOption.find((item: any) => item.id == "inoutdiv")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (tabSelected == 0) {
      if (_export !== null && _export !== undefined) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "기초금액";
        _export.save(optionsGridOne);
      }
    } else {
      if (_export2 !== null && _export2 !== undefined) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "현재잔액";
        _export2.save(optionsGridTwo);
      }
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    deletedMainRows = [];
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyymm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "SA_A7900W_001");
      } else {
        resetAllGrid();
        if (tabSelected == 0) {
          setFilters((prev: any) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setFilters2((prev: any) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    yyyymm: new Date(),
    custcd: "",
    custnm: "",
    amtunit: "",
    inoutdiv: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
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
      procedureName: "P_SA_A7900W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "BASE",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 4) + "00",
        "@p_inoutdiv": filters.inoutdiv,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_amtunit": filters.amtunit,
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A7900W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "NOW",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 4) + "00",
        "@p_inoutdiv": filters.inoutdiv,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_amtunit": filters.amtunit,
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

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    }
    setFilters2((prev) => ({
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
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
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

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
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

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
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

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

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
    if (field != "rowstatus" && field != "custnm") {
      if (
        !(
          (field == "inoutdiv" && dataItem.rowstatus != "N") ||
          (field == "custcd" && dataItem.rowstatus != "N") ||
          (field == "amtunit" && dataItem.rowstatus != "N")
        )
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

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      if (editedField == "custcd") {
        mainDataResult.data.map(async (item) => {
          if (editIndex == item[DATA_ITEM_KEY]) {
            const custcd = await fetchCustInfo(item.custcd);
            if (custcd != null && custcd != undefined) {
              const newData = mainDataResult.data.map((item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
                  ? {
                      ...item,
                      custcd: custcd.custcd,
                      custnm: custcd.custnm,
                      amt: 0,
                      wonamt: 0,
                      taxamt: 0,
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
              const newData = mainDataResult.data.map((item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
                  ? {
                      ...item,
                      rowstatus: item.rowstatus == "N" ? "N" : "U",
                      custnm: "",
                      amt: 0,
                      wonamt: 0,
                      taxamt: 0,
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
            }
          }
        });
      } else if (editedField == "amt") {
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                wonamt: item.amt,
                taxamt: Math.round(item.amt * 0.1),
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

  const fetchCustInfo = async (custcd: string) => {
    if (!permissions.view) return;
    if (custcd == "") return;
    let data: any;
    let custInfo: any = null;

    const queryStr = getCustDataQuery(custcd);
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
        custInfo = {
          custcd: rows[0].custcd,
          custnm: rows[0].custnm,
          bizregnum: rows[0].bizregnum,
        };
      }
    }

    return custInfo;
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amt: 0,
      amtunit: "KRW",
      custcd: "",
      custnm: "",
      inoutdiv: "1",
      orgdiv: sessionOrgdiv,
      remark: "",
      taxamt: 0,
      wonamt: 0,
      wonchgrat: 1,
      yyyymm: convertDateToStr(filters.yyyymm).substring(0, 4) + "00",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;

    let valid = true;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    try {
      dataItem.map((item: any) => {
        if (
          item.inoutdiv == null ||
          item.inoutdiv == "" ||
          item.inoutdiv == undefined
        ) {
          throw findMessage(messagesData, "SA_A7900W_002");
        }
        if (
          item.custcd == null ||
          item.custcd == "" ||
          item.custcd == undefined
        ) {
          throw findMessage(messagesData, "SA_A7900W_002");
        }
        if (
          item.amtunit == null ||
          item.amtunit == "" ||
          item.amtunit == undefined
        ) {
          throw findMessage(messagesData, "SA_A7900W_002");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }
    if (!valid) return false;

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    if (!valid) return false;

    type TdataArr = {
      rowstatus_s: string[];
      custcd_s: string[];
      amtunit_s: string[];
      wonchgrat_s: string[];
      amt_s: string[];
      wonamt_s: string[];
      taxamt_s: string[];
      remark_s: string[];
      inoutdiv_s: string[];
    };

    let dataArr: TdataArr = {
      rowstatus_s: [],
      custcd_s: [],
      amtunit_s: [],
      wonchgrat_s: [],
      amt_s: [],
      wonamt_s: [],
      taxamt_s: [],
      remark_s: [],
      inoutdiv_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        custcd = "",
        amtunit = "",
        wonchgrat = "",
        amt = "",
        wonamt = "",
        taxamt = "",
        remark = "",
        inoutdiv = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.custcd_s.push(custcd);
      dataArr.amtunit_s.push(amtunit);
      dataArr.wonchgrat_s.push(wonchgrat);
      dataArr.amt_s.push(amt);
      dataArr.wonamt_s.push(wonamt);
      dataArr.taxamt_s.push(taxamt);
      dataArr.remark_s.push(remark);
      dataArr.inoutdiv_s.push(inoutdiv);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        custcd = "",
        amtunit = "",
        wonchgrat = "",
        amt = "",
        wonamt = "",
        taxamt = "",
        remark = "",
        inoutdiv = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.custcd_s.push(custcd);
      dataArr.amtunit_s.push(amtunit);
      dataArr.wonchgrat_s.push(wonchgrat);
      dataArr.amt_s.push(amt);
      dataArr.wonamt_s.push(wonamt);
      dataArr.taxamt_s.push(taxamt);
      dataArr.remark_s.push(remark);
      dataArr.inoutdiv_s.push(inoutdiv);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "SAVE",
      orgdiv: sessionOrgdiv,
      yyyymm: convertDateToStr(filters.yyyymm).substring(0, 4) + "00",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      amtunit_s: dataArr.amtunit_s.join("|"),
      wonchgrat_s: dataArr.wonchgrat_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      wonamt_s: dataArr.wonamt_s.join("|"),
      taxamt_s: dataArr.taxamt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      inoutdiv_s: dataArr.inoutdiv_s.join("|"),
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    yyyymm: "",
    rowstatus_s: "",
    custcd_s: "",
    amtunit_s: "",
    wonchgrat_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    remark_s: "",
    inoutdiv_s: "",
    form_id: "SA_A7900W",
    userid: sessionUserId,
    pc: pc,
  });

  const para: Iparameters = {
    procedureName: "P_SA_A7900W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_yyyymm": paraData.yyyymm,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_custcd_s": paraData.custcd_s,
      "@p_amtunit_s": paraData.amtunit_s,
      "@p_wonchgrat_s": paraData.wonchgrat_s,
      "@p_amt_s": paraData.amt_s,
      "@p_wonamt_s": paraData.wonamt_s,
      "@p_taxamt_s": paraData.taxamt_s,
      "@p_remark_s": paraData.remark_s,
      "@p_inoutdiv_s": paraData.inoutdiv_s,
      "@p_form_id": paraData.form_id,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
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
      setFilters((prev: any) => ({
        ...prev,
        pgNum: prev.pgNum,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

  const onSaveClick2 = async () => {
    if (!permissions.save) return;
    if (
      !window.confirm(
        "기준년도의 기초금액이 삭제되고 기준년도의 작년 잔액을 이월합니다. 진행하시겠습니까?"
      )
    ) {
      return false;
    }
    const dataItem = mainDataResult.data.filter((item: any) => {
      return item.rowstatus != "N";
    });

    type TdataArr = {
      rowstatus_s: string[];
      custcd_s: string[];
      amtunit_s: string[];
      wonchgrat_s: string[];
      amt_s: string[];
      wonamt_s: string[];
      taxamt_s: string[];
      remark_s: string[];
      inoutdiv_s: string[];
    };

    let dataArr: TdataArr = {
      rowstatus_s: [],
      custcd_s: [],
      amtunit_s: [],
      wonchgrat_s: [],
      amt_s: [],
      wonamt_s: [],
      taxamt_s: [],
      remark_s: [],
      inoutdiv_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        custcd = "",
        amtunit = "",
        wonchgrat = "",
        amt = "",
        wonamt = "",
        taxamt = "",
        remark = "",
        inoutdiv = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.custcd_s.push(custcd);
      dataArr.amtunit_s.push(amtunit);
      dataArr.wonchgrat_s.push(wonchgrat);
      dataArr.amt_s.push(amt);
      dataArr.wonamt_s.push(wonamt);
      dataArr.taxamt_s.push(taxamt);
      dataArr.remark_s.push(remark);
      dataArr.inoutdiv_s.push(inoutdiv);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "transfer",
      orgdiv: sessionOrgdiv,
      yyyymm: convertDateToStr(filters.yyyymm).substring(0, 4) + "00",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      amtunit_s: dataArr.amtunit_s.join("|"),
      wonchgrat_s: dataArr.wonchgrat_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      wonamt_s: dataArr.wonamt_s.join("|"),
      taxamt_s: dataArr.taxamt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      inoutdiv_s: dataArr.inoutdiv_s.join("|"),
    }));
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
              <th>기준년도</th>
              <td>
                <DatePicker
                  name="yyyymm"
                  value={filters.yyyymm}
                  format="yyyy"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={YearCalendar}
                />
              </td>
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
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="inoutdiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="기초금액"
          disabled={permissions.view ? false : true}
        >
          <GridTitleContainer className="ButtonContainer">
            <GridTitle>기초금액</GridTitle>
            <ButtonContainer style={{ justifyContent: "space-between" }}>
              <Button
                onClick={onAddClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="plus"
                title="행 삭제"
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
                onClick={onSaveClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="excel"
                disabled={permissions.save ? false : true}
              >
                잔액 이월
              </Button>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
                title="저장"
                disabled={permissions.save ? false : true}
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <FormContext.Provider
            value={{
              custcd,
              custnm,
              setCustcd,
              setCustnm,
              mainDataState,
              setMainDataState,
              // fetchGrid,
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
                style={{ height: isMobile ? mobileheight : webheight }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
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
                                : radioField.includes(item.fieldName)
                                ? CustomRadioCell
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : commandField.includes(item.fieldName)
                                ? ColumnCommandCell
                                : undefined
                            }
                            headerCell={
                              requiredField.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? editNumberFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </FormContext.Provider>
        </TabStripTab>
        <TabStripTab
          title="현재잔액"
          disabled={permissions.view ? false : true}
        >
          <GridTitleContainer className="ButtonContainer2">
            <GridTitle>현재잔액</GridTitle>
          </GridTitleContainer>
          <ExcelExport
            data={mainDataResult2.data}
            ref={(exporter) => {
              _export2 = exporter;
            }}
            fileName={getMenuName()}
          >
            <Grid
              style={{ height: isMobile ? mobileheight2 : webheight2 }}
              data={process(
                mainDataResult2.data.map((row) => ({
                  ...row,
                  [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                })),
                mainDataState2
              )}
              {...mainDataState2}
              onDataStateChange={onMainDataStateChange2}
              //선택 기능
              dataItemKey={DATA_ITEM_KEY2}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onSelectionChange2}
              //스크롤 조회 기능
              fixedScroll={true}
              total={mainDataResult2.total}
              skip={page2.skip}
              take={page2.take}
              pageable={true}
              onPageChange={pageChange2}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList2"]
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
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell2
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
            </Grid>
          </ExcelExport>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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

export default SA_A7900W;
