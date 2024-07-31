import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
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
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import ExcelUploadButton from "../components/Buttons/ExcelUploadButton";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import InputMaskCell from "../components/Cells/InputMaskCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  convertDateToStr,
  dateformat,
  findMessage,
  getCustDataQuery,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AC_A1010W_Window from "../components/Windows/AC_A1010W_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
var height = 0;
var height2 = 0;
let temp = 0;
let deletedMainRows: object[] = [];

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
    setCustWindowVisible(true);
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
          modal={true}
        />
      )}
    </>
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_AC019, L_AC030T", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "acntcd" ? "L_AC019" : field == "creditcd" ? "L_AC030T" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const textField =
    field == "creditcd"
      ? "creditnum"
      : field == "acntcd"
      ? "acntnm"
      : "code_name";
  const valueField =
    field == "creditcd"
      ? "creditcd"
      : field == "acntcd"
      ? "acntcd"
      : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td />
  );
};

const CustomInputCell = (props: GridCellProps) => {
  const field = props.field ?? "";

  const mask =
    field == "creditnum"
      ? "0000-0000-0000-0000"
      : field == "bizregnum"
      ? "000-00-00000"
      : "";

  return <InputMaskCell mask={mask} {...props} />;
};

const AC_A1010W: React.FC = () => {
  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [DetailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
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
  let gridRef: any = useRef(null);
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
        isSearch: true,
      }));
    }
  }, [customOptionData]);
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

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

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

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    yyyymm: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyymm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "AC_A1010W_001");
      } else {
        resetAllGrid(); // 데이터 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1010W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymm": convertDateToStr(filters.yyyymm),
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        chk: item.chk == "Y" ? true : false,
      }));

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
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
      //bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setValues2(false);
    deletedMainRows = [];
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

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

  const [values2, setValues2] = useState<boolean>(false);
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

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field="recdt"
        title="승인일자"
        width="120px"
        cell={DateCell}
        footerCell={mainTotalFooterCell}
      />
    );
    array.push(<GridColumn field="banknm" title="카드사" width="120px" />);
    array.push(
      <GridColumn
        field="creditnum"
        title="카드번호"
        width="150px"
        cell={CustomInputCell}
      />
    );
    array.push(
      <GridColumn
        field="bizregnum"
        title="가맹점사업자번호"
        width="150px"
        cell={CustomInputCell}
      />
    );
    array.push(<GridColumn field="custnm" title="가맹점명" width="120px" />);
    array.push(
      <GridColumn
        field="splyamt"
        title="공급가액"
        width="100px"
        cell={NumberCell}
        footerCell={editNumberFooterCell}
      />
    );
    array.push(
      <GridColumn
        field="taxamt"
        title="세액"
        width="100px"
        cell={NumberCell}
        footerCell={editNumberFooterCell}
      />
    );
    array.push(
      <GridColumn
        field="svcamt"
        title="봉사료"
        width="100px"
        cell={NumberCell}
        footerCell={editNumberFooterCell}
      />
    );
    array.push(
      <GridColumn
        field="totamt"
        title="합계금액"
        width="100px"
        cell={NumberCell}
        footerCell={editNumberFooterCell}
      />
    );
    array.push(
      <GridColumn field="bizdivnm" title="가맹점유형" width="120px" />
    );
    array.push(<GridColumn field="compclassnm" title="업태" width="120px" />);
    array.push(<GridColumn field="comptype" title="업종" width="120px" />);
    array.push(<GridColumn field="dedynnm" title="공제여부" width="120px" />);
    array.push(<GridColumn field="remark" title="비고" width="200px" />);
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="creditcd"
        title="신용카드"
        width="120px"
        cell={CustomComboBoxCell}
      />
    );
    array.push(
      <GridColumn
        field="custcd"
        title="업체코드"
        width="120px"
        cell={ColumnCommandCell}
      />
    );
    array.push(<GridColumn field="regcustnm" title="업체명" width="150px" />);
    array.push(
      <GridColumn
        field="acntcd"
        title="계정과목"
        width="120px"
        cell={CustomComboBoxCell}
      />
    );
    array.push(
      <GridColumn
        field="taxyn"
        title="부가세여부"
        width="120px"
        cell={CheckBoxCell}
      />
    );
    array.push(<GridColumn field="remark2" title="적요" width="200px" />);
    return array;
  };

  const createColumn3 = () => {
    const array = [];
    array.push(<GridColumn field="expackey" title="전표번호" width="150px" />);
    return array;
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
      field != "rowstatus" &&
      ((dataItem.rowstatus != "N" && field == "creditcd") ||
        field == "custcd" ||
        field == "acntcd" ||
        field == "taxyn" ||
        field == "remark2" ||
        field == "chk" ||
        (dataItem.rowstatus == "N" &&
          field != "expackey" &&
          field != "regcustnm"))
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
                      regcustnm: custcd.custnm,
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
                      regcustnm: "",
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
      } else {
        const newData = mainDataResult.data.map(
          (item: { [x: string]: string; rowstatus: string }) =>
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
        };
      }
    }

    return custInfo;
  };

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            custcd: custcd,
            regcustnm: custnm,
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      ackey: "",
      acntcd: "",
      banknm: "",
      bizdivnm: "",
      bizregnum: "",
      chk: "N",
      compclass: "",
      compclassnm: "",
      comptype: "",
      creditcd: "",
      creditnum: "",
      custcd: "",
      custnm: "",
      dedyn: "",
      dedynnm: "",
      expackey: "",
      form_id: "AC_A1010W",
      recdt: convertDateToStr(new Date()),
      regcustnm: "",
      remark: "",
      remark2: "",
      seq: 0,
      splyamt: 0,
      svcamt: 0,
      taxamt: 0,
      taxyn: "N",
      totamt: 0,
      yyyymm: convertDateToStr(filters.yyyymm).substring(0, 6),
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

  const onRemoveClick = (e: any) => {
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

  const onSaveClick = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    let dataArr: any = {
      seq_s: [],
      rowstatus_s: [],
      recdt_s: [],
      banknm_s: [],
      creditnum_s: [],
      bizregnum_s: [],
      custnm_s: [],
      splyamt_s: [],
      taxamt_s: [],
      svcamt_s: [],
      totamt_s: [],
      bizdivnm_s: [],
      compclassnm_s: [],
      comptype_s: [],
      dedynnm_s: [],
      remark_s: [],

      creditcd_s: [],
      custcd_s: [],
      compclass_s: [],
      acntcd_s: [],
      dedyn_s: [],
      taxyn_s: [],
      remark2_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        seq = "",
        rowstatus = "",
        recdt = "",
        banknm = "",
        creditnum = "",
        bizregnum = "",
        custnm = "",
        splyamt = "",
        taxamt = "",
        svcamt = "",
        totamt = "",
        bizdivnm = "",
        compclassnm = "",
        comptype = "",
        dedynnm = "",
        remark = "",

        creditcd = "",
        custcd = "",
        compclass = "",
        acntcd = "",
        dedyn = "",
        taxyn = "",
        remark2 = "",
      } = item;

      dataArr.seq_s.push(seq);
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push(
        recdt == "99991231" || recdt == undefined ? "" : recdt
      );
      dataArr.banknm_s.push(banknm);
      dataArr.creditnum_s.push(creditnum);
      dataArr.bizregnum_s.push(bizregnum);
      dataArr.custnm_s.push(custnm);
      dataArr.splyamt_s.push(splyamt);
      dataArr.taxamt_s.push(taxamt);
      dataArr.svcamt_s.push(svcamt);
      dataArr.totamt_s.push(totamt);
      dataArr.bizdivnm_s.push(bizdivnm);
      dataArr.compclassnm_s.push(compclassnm);
      dataArr.comptype_s.push(comptype);
      dataArr.dedynnm_s.push(dedynnm);
      dataArr.remark_s.push(remark);
      dataArr.creditcd_s.push(creditcd);
      dataArr.custcd_s.push(custcd);
      dataArr.compclass_s.push(compclass);
      dataArr.acntcd_s.push(acntcd);
      dataArr.dedyn_s.push(dedyn);
      dataArr.taxyn_s.push(taxyn == true ? "Y" : taxyn == false ? "N" : taxyn);
      dataArr.remark2_s.push(remark2);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        seq = "",
        rowstatus = "",
        recdt = "",
        banknm = "",
        creditnum = "",
        bizregnum = "",
        custnm = "",
        splyamt = "",
        taxamt = "",
        svcamt = "",
        totamt = "",
        bizdivnm = "",
        compclassnm = "",
        comptype = "",
        dedynnm = "",
        remark = "",

        creditcd = "",
        custcd = "",
        compclass = "",
        acntcd = "",
        dedyn = "",
        taxyn = "",
        remark2 = "",
      } = item;

      dataArr.seq_s.push(seq);
      dataArr.rowstatus_s.push("D");
      dataArr.recdt_s.push(
        recdt == "99991231" || recdt == undefined ? "" : recdt
      );
      dataArr.banknm_s.push(banknm);
      dataArr.creditnum_s.push(creditnum);
      dataArr.bizregnum_s.push(bizregnum);
      dataArr.custnm_s.push(custnm);
      dataArr.splyamt_s.push(splyamt);
      dataArr.taxamt_s.push(taxamt);
      dataArr.svcamt_s.push(svcamt);
      dataArr.totamt_s.push(totamt);
      dataArr.bizdivnm_s.push(bizdivnm);
      dataArr.compclassnm_s.push(compclassnm);
      dataArr.comptype_s.push(comptype);
      dataArr.dedynnm_s.push(dedynnm);
      dataArr.remark_s.push(remark);
      dataArr.creditcd_s.push(creditcd);
      dataArr.custcd_s.push(custcd);
      dataArr.compclass_s.push(compclass);
      dataArr.acntcd_s.push(acntcd);
      dataArr.dedyn_s.push(dedyn);
      dataArr.taxyn_s.push(taxyn == true ? "Y" : taxyn == false ? "N" : taxyn);
      dataArr.remark2_s.push(remark2);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      yyyymm: convertDateToStr(filters.yyyymm).substring(0, 6),
      seq: dataArr.seq_s.join("|"),
      rowstatus: dataArr.rowstatus_s.join("|"),
      recdt: dataArr.recdt_s.join("|"),
      banknm: dataArr.banknm_s.join("|"),
      creditnum: dataArr.creditnum_s.join("|"),
      bizregnum: dataArr.bizregnum_s.join("|"),
      custnm: dataArr.custnm_s.join("|"),
      splyamt: dataArr.splyamt_s.join("|"),
      taxamt: dataArr.taxamt_s.join("|"),
      svcamt: dataArr.svcamt_s.join("|"),
      totamt: dataArr.totamt_s.join("|"),
      bizdivnm: dataArr.bizdivnm_s.join("|"),
      compclassnm: dataArr.compclassnm_s.join("|"),
      comptype: dataArr.comptype_s.join("|"),
      dedynnm: dataArr.dedynnm_s.join("|"),
      remark: dataArr.remark_s.join("|"),

      creditcd: dataArr.creditcd_s.join("|"),
      custcd: dataArr.custcd_s.join("|"),
      compclass: dataArr.compclass_s.join("|"),
      acntcd: dataArr.acntcd_s.join("|"),
      dedyn: dataArr.dedyn_s.join("|"),
      taxyn: dataArr.taxyn_s.join("|"),
      remark2: dataArr.remark2_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    location: "",
    yyyymm: "",
    seq: "",
    rowstatus: "",
    recdt: "",
    banknm: "",
    creditnum: "",
    bizregnum: "",
    custnm: "",
    splyamt: "",
    taxamt: "",
    svcamt: "",
    totamt: "",
    bizdivnm: "",
    compclassnm: "",
    comptype: "",
    dedynnm: "",
    remark: "",

    creditcd: "",
    custcd: "",
    compclass: "",
    acntcd: "",
    dedyn: "",
    taxyn: "",
    remark2: "",
    userid: userId,
    pc: pc,
    form_id: "AC_A1010W",
  });

  //조회조건 파라미터
  const para: Iparameters = {
    procedureName: "P_AC_A1010W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_yyyymm": ParaData.yyyymm,
      "@p_seq_s": ParaData.seq,
      "@p_rowstatus_s": ParaData.rowstatus,
      "@p_recdt_s": ParaData.recdt,
      "@p_banknm_s": ParaData.banknm,
      "@p_creditnum_s": ParaData.creditnum,
      "@p_bizregnum_s": ParaData.bizregnum,
      "@p_custnm_s": ParaData.custnm,
      "@p_splyamt_s": ParaData.splyamt,
      "@p_taxamt_s": ParaData.taxamt,
      "@p_svcamt_s": ParaData.svcamt,
      "@p_totamt_s": ParaData.totamt,
      "@p_bizdivnm_s": ParaData.bizdivnm,
      "@p_compclassnm_s": ParaData.compclassnm,
      "@p_comptype_s": ParaData.comptype,
      "@p_dedynnm_s": ParaData.dedynnm,
      "@p_remark_s": ParaData.remark,

      "@p_creditcd_s": ParaData.creditcd,
      "@p_custcd_s": ParaData.custcd,
      "@p_compclass_s": ParaData.compclass,
      "@p_acntcd_s": ParaData.acntcd,
      "@p_dedyn_s": ParaData.dedyn,
      "@p_taxyn_s": ParaData.taxyn,
      "@p_remark2_s": ParaData.remark2,
      "@p_userid": ParaData.userid,
      "@p_pc": ParaData.pc,
      "@p_form_id": ParaData.form_id,
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save && ParaData.workType != "D") return;
    if (!permissions.delete && ParaData.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 0 && filters.pgNum > 0;
      resetAllGrid();
      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        if (ParaData.workType == "AUTO") {
          alert("정상적으로 셋팅되었습니다.");
        }
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
      setParaData({
        workType: "",
        orgdiv: "",
        location: "",
        yyyymm: "",
        seq: "",
        rowstatus: "",
        recdt: "",
        banknm: "",
        creditnum: "",
        bizregnum: "",
        custnm: "",
        splyamt: "",
        taxamt: "",
        svcamt: "",
        totamt: "",
        bizdivnm: "",
        compclassnm: "",
        comptype: "",
        dedynnm: "",
        remark: "",

        creditcd: "",
        custcd: "",
        compclass: "",
        acntcd: "",
        dedyn: "",
        taxyn: "",
        remark2: "",
        userid: userId,
        pc: pc,
        form_id: "AC_A1010W",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onDeleteClick = (e: any) => {
    if (!permissions.delete) return;
    if (
      !window.confirm(
        `${convertDateToStr(filters.yyyymm).substring(
          0,
          4
        )} 년도 ${convertDateToStr(filters.yyyymm).substring(
          4,
          6
        )} 월의 데이터를 삭제하시겠습니까?`
      )
    ) {
      return false;
    }
    if (mainDataResult.total > 0) {
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: filters.orgdiv,
        yyyymm: convertDateToStr(filters.yyyymm).substring(0, 6),
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  useEffect(() => {
    if (
      ParaData.workType != "" &&
      permissions.save &&
      ParaData.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
    if (ParaData.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const onSetting = () => {
    setParaData((prev) => ({
      ...prev,
      workType: "AUTO",
      orgdiv: filters.orgdiv,
      yyyymm: convertDateToStr(filters.yyyymm).substring(0, 6),
    }));
  };

  const onSLIP = () => {
    if (!permissions.save) return;
    if (!window.confirm(`전표를 등록하시겠습니까?`)) {
      return false;
    }
    const dataItem = mainDataResult.data.filter(
      (item: any) => item.chk == true || item.chk == "Y"
    );

    if (dataItem.length == 0) {
      alert("선택한 데이터가 없습니다.");
      return false;
    }

    let dataArr: any = {
      seq_s: [],
      rowstatus_s: [],
      recdt_s: [],
      banknm_s: [],
      creditnum_s: [],
      bizregnum_s: [],
      custnm_s: [],
      splyamt_s: [],
      taxamt_s: [],
      svcamt_s: [],
      totamt_s: [],
      bizdivnm_s: [],
      compclassnm_s: [],
      comptype_s: [],
      dedynnm_s: [],
      remark_s: [],

      creditcd_s: [],
      custcd_s: [],
      compclass_s: [],
      acntcd_s: [],
      dedyn_s: [],
      taxyn_s: [],
      remark2_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        seq = "",
        rowstatus = "",
        recdt = "",
        banknm = "",
        creditnum = "",
        bizregnum = "",
        custnm = "",
        splyamt = "",
        taxamt = "",
        svcamt = "",
        totamt = "",
        bizdivnm = "",
        compclassnm = "",
        comptype = "",
        dedynnm = "",
        remark = "",

        creditcd = "",
        custcd = "",
        compclass = "",
        acntcd = "",
        dedyn = "",
        taxyn = "",
        remark2 = "",
      } = item;

      dataArr.seq_s.push(seq);
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push(
        recdt == "99991231" || recdt == undefined ? "" : recdt
      );
      dataArr.banknm_s.push(banknm);
      dataArr.creditnum_s.push(creditnum);
      dataArr.bizregnum_s.push(bizregnum);
      dataArr.custnm_s.push(custnm);
      dataArr.splyamt_s.push(splyamt);
      dataArr.taxamt_s.push(taxamt);
      dataArr.svcamt_s.push(svcamt);
      dataArr.totamt_s.push(totamt);
      dataArr.bizdivnm_s.push(bizdivnm);
      dataArr.compclassnm_s.push(compclassnm);
      dataArr.comptype_s.push(comptype);
      dataArr.dedynnm_s.push(dedynnm);
      dataArr.remark_s.push(remark);
      dataArr.creditcd_s.push(creditcd);
      dataArr.custcd_s.push(custcd);
      dataArr.compclass_s.push(compclass);
      dataArr.acntcd_s.push(acntcd);
      dataArr.dedyn_s.push(dedyn);
      dataArr.taxyn_s.push(taxyn == true ? "Y" : taxyn == false ? "N" : taxyn);
      dataArr.remark2_s.push(remark2);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "SLIP",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      yyyymm: convertDateToStr(filters.yyyymm).substring(0, 6),
      seq: dataArr.seq_s.join("|"),
      rowstatus: dataArr.rowstatus_s.join("|"),
      recdt: dataArr.recdt_s.join("|"),
      banknm: dataArr.banknm_s.join("|"),
      creditnum: dataArr.creditnum_s.join("|"),
      bizregnum: dataArr.bizregnum_s.join("|"),
      custnm: dataArr.custnm_s.join("|"),
      splyamt: dataArr.splyamt_s.join("|"),
      taxamt: dataArr.taxamt_s.join("|"),
      svcamt: dataArr.svcamt_s.join("|"),
      totamt: dataArr.totamt_s.join("|"),
      bizdivnm: dataArr.bizdivnm_s.join("|"),
      compclassnm: dataArr.compclassnm_s.join("|"),
      comptype: dataArr.comptype_s.join("|"),
      dedynnm: dataArr.dedynnm_s.join("|"),
      remark: dataArr.remark_s.join("|"),

      creditcd: dataArr.creditcd_s.join("|"),
      custcd: dataArr.custcd_s.join("|"),
      compclass: dataArr.compclass_s.join("|"),
      acntcd: dataArr.acntcd_s.join("|"),
      dedyn: dataArr.dedyn_s.join("|"),
      taxyn: dataArr.taxyn_s.join("|"),
      remark2: dataArr.remark2_s.join("|"),
    }));
  };

  const onDrop = () => {
    if (!permissions.save) return;
    if (!window.confirm(`전표를 해제하시겠습니까?`)) {
      return false;
    }
    const dataItem = mainDataResult.data.filter(
      (item: any) => item.chk == true || item.chk == "Y"
    );

    if (dataItem.length == 0) {
      alert("선택한 데이터가 없습니다.");
      return false;
    }

    let dataArr: any = {
      seq_s: [],
      rowstatus_s: [],
      recdt_s: [],
      banknm_s: [],
      creditnum_s: [],
      bizregnum_s: [],
      custnm_s: [],
      splyamt_s: [],
      taxamt_s: [],
      svcamt_s: [],
      totamt_s: [],
      bizdivnm_s: [],
      compclassnm_s: [],
      comptype_s: [],
      dedynnm_s: [],
      remark_s: [],

      creditcd_s: [],
      custcd_s: [],
      compclass_s: [],
      acntcd_s: [],
      dedyn_s: [],
      taxyn_s: [],
      remark2_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        seq = "",
        rowstatus = "",
        recdt = "",
        banknm = "",
        creditnum = "",
        bizregnum = "",
        custnm = "",
        splyamt = "",
        taxamt = "",
        svcamt = "",
        totamt = "",
        bizdivnm = "",
        compclassnm = "",
        comptype = "",
        dedynnm = "",
        remark = "",

        creditcd = "",
        custcd = "",
        compclass = "",
        acntcd = "",
        dedyn = "",
        taxyn = "",
        remark2 = "",
      } = item;

      dataArr.seq_s.push(seq);
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push(
        recdt == "99991231" || recdt == undefined ? "" : recdt
      );
      dataArr.banknm_s.push(banknm);
      dataArr.creditnum_s.push(creditnum);
      dataArr.bizregnum_s.push(bizregnum);
      dataArr.custnm_s.push(custnm);
      dataArr.splyamt_s.push(splyamt);
      dataArr.taxamt_s.push(taxamt);
      dataArr.svcamt_s.push(svcamt);
      dataArr.totamt_s.push(totamt);
      dataArr.bizdivnm_s.push(bizdivnm);
      dataArr.compclassnm_s.push(compclassnm);
      dataArr.comptype_s.push(comptype);
      dataArr.dedynnm_s.push(dedynnm);
      dataArr.remark_s.push(remark);
      dataArr.creditcd_s.push(creditcd);
      dataArr.custcd_s.push(custcd);
      dataArr.compclass_s.push(compclass);
      dataArr.acntcd_s.push(acntcd);
      dataArr.dedyn_s.push(dedyn);
      dataArr.taxyn_s.push(taxyn == true ? "Y" : taxyn == false ? "N" : taxyn);
      dataArr.remark2_s.push(remark2);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "DROP",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      yyyymm: convertDateToStr(filters.yyyymm).substring(0, 6),
      seq: dataArr.seq_s.join("|"),
      rowstatus: dataArr.rowstatus_s.join("|"),
      recdt: dataArr.recdt_s.join("|"),
      banknm: dataArr.banknm_s.join("|"),
      creditnum: dataArr.creditnum_s.join("|"),
      bizregnum: dataArr.bizregnum_s.join("|"),
      custnm: dataArr.custnm_s.join("|"),
      splyamt: dataArr.splyamt_s.join("|"),
      taxamt: dataArr.taxamt_s.join("|"),
      svcamt: dataArr.svcamt_s.join("|"),
      totamt: dataArr.totamt_s.join("|"),
      bizdivnm: dataArr.bizdivnm_s.join("|"),
      compclassnm: dataArr.compclassnm_s.join("|"),
      comptype: dataArr.comptype_s.join("|"),
      dedynnm: dataArr.dedynnm_s.join("|"),
      remark: dataArr.remark_s.join("|"),

      creditcd: dataArr.creditcd_s.join("|"),
      custcd: dataArr.custcd_s.join("|"),
      compclass: dataArr.compclass_s.join("|"),
      acntcd: dataArr.acntcd_s.join("|"),
      dedyn: dataArr.dedyn_s.join("|"),
      taxyn: dataArr.taxyn_s.join("|"),
      remark2: dataArr.remark2_s.join("|"),
    }));
  };

  const onCust = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult.data.filter(
      (item: any) => item.taxyn == true || item.taxyn == "Y"
    );

    if (dataItem.length == 0) {
      alert("선택한 데이터가 없습니다.");
      return false;
    }

    let dataArr: any = {
      seq_s: [],
      rowstatus_s: [],
      recdt_s: [],
      banknm_s: [],
      creditnum_s: [],
      bizregnum_s: [],
      custnm_s: [],
      splyamt_s: [],
      taxamt_s: [],
      svcamt_s: [],
      totamt_s: [],
      bizdivnm_s: [],
      compclassnm_s: [],
      comptype_s: [],
      dedynnm_s: [],
      remark_s: [],

      creditcd_s: [],
      custcd_s: [],
      compclass_s: [],
      acntcd_s: [],
      dedyn_s: [],
      taxyn_s: [],
      remark2_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        seq = "",
        rowstatus = "",
        recdt = "",
        banknm = "",
        creditnum = "",
        bizregnum = "",
        custnm = "",
        splyamt = "",
        taxamt = "",
        svcamt = "",
        totamt = "",
        bizdivnm = "",
        compclassnm = "",
        comptype = "",
        dedynnm = "",
        remark = "",

        creditcd = "",
        custcd = "",
        compclass = "",
        acntcd = "",
        dedyn = "",
        taxyn = "",
        remark2 = "",
      } = item;

      dataArr.seq_s.push(seq);
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push(
        recdt == "99991231" || recdt == undefined ? "" : recdt
      );
      dataArr.banknm_s.push(banknm);
      dataArr.creditnum_s.push(creditnum);
      dataArr.bizregnum_s.push(bizregnum);
      dataArr.custnm_s.push(custnm);
      dataArr.splyamt_s.push(splyamt);
      dataArr.taxamt_s.push(taxamt);
      dataArr.svcamt_s.push(svcamt);
      dataArr.totamt_s.push(totamt);
      dataArr.bizdivnm_s.push(bizdivnm);
      dataArr.compclassnm_s.push(compclassnm);
      dataArr.comptype_s.push(comptype);
      dataArr.dedynnm_s.push(dedynnm);
      dataArr.remark_s.push(remark);
      dataArr.creditcd_s.push(creditcd);
      dataArr.custcd_s.push(custcd);
      dataArr.compclass_s.push(compclass);
      dataArr.acntcd_s.push(acntcd);
      dataArr.dedyn_s.push(dedyn);
      dataArr.taxyn_s.push(taxyn == true ? "Y" : taxyn == false ? "N" : taxyn);
      dataArr.remark2_s.push(remark2);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "CUST",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      yyyymm: convertDateToStr(filters.yyyymm).substring(0, 6),
      seq: dataArr.seq_s.join("|"),
      rowstatus: dataArr.rowstatus_s.join("|"),
      recdt: dataArr.recdt_s.join("|"),
      banknm: dataArr.banknm_s.join("|"),
      creditnum: dataArr.creditnum_s.join("|"),
      bizregnum: dataArr.bizregnum_s.join("|"),
      custnm: dataArr.custnm_s.join("|"),
      splyamt: dataArr.splyamt_s.join("|"),
      taxamt: dataArr.taxamt_s.join("|"),
      svcamt: dataArr.svcamt_s.join("|"),
      totamt: dataArr.totamt_s.join("|"),
      bizdivnm: dataArr.bizdivnm_s.join("|"),
      compclassnm: dataArr.compclassnm_s.join("|"),
      comptype: dataArr.comptype_s.join("|"),
      dedynnm: dataArr.dedynnm_s.join("|"),
      remark: dataArr.remark_s.join("|"),

      creditcd: dataArr.creditcd_s.join("|"),
      custcd: dataArr.custcd_s.join("|"),
      compclass: dataArr.compclass_s.join("|"),
      acntcd: dataArr.acntcd_s.join("|"),
      dedyn: dataArr.dedyn_s.join("|"),
      taxyn: dataArr.taxyn_s.join("|"),
      remark2: dataArr.remark2_s.join("|"),
    }));
  };

  const saveExcel = (jsonArr: any[]) => {};

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
              <th>기준년월</th>
              <td>
                <DatePicker
                  name="yyyymm"
                  value={filters.yyyymm}
                  format="yyyy-MM"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={MonthCalendar}
                />
              </td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>요약정보</GridTitle>
          <ButtonContainer>
            <Button
              onClick={onAddClick}
              themeColor={"primary"}
              icon="plus"
              title="행 추가"
              disabled={permissions.save ? false : true}
            ></Button>
            <Button
              onClick={onRemoveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="minus"
              title="행 삭제"
              disabled={permissions.save ? false : true}
            ></Button>
            <Button
              onClick={onDeleteClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="delete"
              disabled={permissions.save ? false : true}
            >
              삭제
            </Button>
            <Button
              onClick={onSaveClick}
              themeColor={"primary"}
              icon="save"
              disabled={permissions.save ? false : true}
            >
              저장
            </Button>
            <ExcelUploadButton
              saveExcel={saveExcel}
              permissions={{
                view: true,
                save: true,
                delete: true,
                print: true,
              }}
              style={{}}
            />
            <Button
              //onClick={onExcelAttachmentsWndClick}
              icon="file"
              fillMode="outline"
              themeColor={"primary"}
              disabled={permissions.view ? false : true}
            >
              엑셀양식
            </Button>
            <Button
              onClick={() => setDetailWindowVisible(true)}
              icon="track-changes-enable"
              fillMode="outline"
              themeColor={"primary"}
              disabled={permissions.save ? false : true}
            >
              계정기준
            </Button>
            <Button
              onClick={onSetting}
              icon="table"
              fillMode="outline"
              themeColor={"primary"}
              disabled={permissions.save ? false : true}
            >
              셋팅
            </Button>
            <Button
              onClick={onCust}
              icon="file-add"
              fillMode="outline"
              themeColor={"primary"}
              disabled={permissions.save ? false : true}
            >
              업체
            </Button>
            <Button
              onClick={onSLIP}
              icon="check"
              fillMode="outline"
              themeColor={"primary"}
              disabled={permissions.save ? false : true}
            >
              확정
            </Button>
            <Button
              onClick={onDrop}
              icon="close"
              fillMode="outline"
              themeColor={"primary"}
              disabled={permissions.save ? false : true}
            >
              해제
            </Button>
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
                  recdt: row.recdt
                    ? new Date(dateformat(row.recdt))
                    : new Date(dateformat("99991231")),
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
              <GridColumn
                field="chk"
                title=" "
                width="45px"
                headerCell={CustomCheckBoxCell2}
                cell={CheckBoxCell}
              />
              <GridColumn title="신용카드 사용내역">
                {createColumn()}
              </GridColumn>
              <GridColumn title="입력 정보">{createColumn2()}</GridColumn>
              <GridColumn title="전표">{createColumn3()}</GridColumn>
            </Grid>
          </ExcelExport>
        </FormContext.Provider>
      </GridContainer>
      {DetailWindowVisible && (
        <AC_A1010W_Window setVisible={setDetailWindowVisible} modal={true} />
      )}
    </>
  );
};

export default AC_A1010W;
