import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
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
  getQueryFromBizComponent,
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
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import StandardWindow from "../components/Windows/CommonWindows/StandardWindow";
import { useApi } from "../hooks/api";
import { isLoading, sessionItemState } from "../store/atoms";
import { gridList } from "../store/columns/AC_A1040W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

interface IPrsnnum {
  user_id: string;
  user_name: string;
}
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let targetRowIndex: null | number = null;
const dateField = ["carddt"];
const numberField = ["amt1", "taxamt", "amt", "slipamt"];
const checkField = ["acntdiv"];

type TdataArr = {
  acntcd_s: string[];
  drcrdiv_s: string[];
  slipamt_s: string[];
  custcd_s: string[];
  custnm_s: string[];
  mngdata1_s: string[];
  mngdatanm1_s: string[];
  remark_s: string[];
  taxtype_s: string[];
  creditcd_s: string[];

  location_s: string[];
  position_s: string[];

  /* 전표해제 */
  actdt_s: string[];
  acseq1_s: string[];
  expensedt_s: string[];
  expenseseq1_s: string[];
  expenseseq2_s: string[];
};

const ColumnCommandCell = (props: any) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;

  const [popupData, setPopupData] = React.useState<any>();

  useEffect(() => {
    if (popupData) {
      dataItem["mngdata1"] = popupData.item1;
      dataItem["mngdatanm1"] = popupData.item2;

      if (onChange) {
        onChange({
          dataItem: dataItem,
          dataIndex: 0,
          field: "mngdata1",
          value: dataItem["mngdata1"],
        });

        onChange({
          dataItem: dataItem,
          dataIndex: 0,
          field: "mngdatanm1",
          value: dataItem["mngdatanm1"],
        });
      }
    }
  }, [popupData]);

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

  const [standardWindowVisible, setStandardWindowVisible] =
    useState<boolean>(false);
  const onStandardClick = () => {
    setStandardWindowVisible(true);
  };

  let defaultRendering = (
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
          name={field}
          onClick={onStandardClick}
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
      {standardWindowVisible && (
        <StandardWindow
          setVisible={setStandardWindowVisible}
          workType={"ROW_ADD"}
          setData={setPopupData}
          mngitemcd={{
            mngitemcd1: "O1",
            mngitemcd2: "",
            mngitemcd3: "",
            mngitemcd4: "",
            mngitemcd5: "",
            mngitemcd6: "",
          }}
          index={1}
          modal={true}
        />
      )}
    </>
  );
};

const AC_A1040W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_A1040W", setCustomOptionData);

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
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        position: defaultOption.find((item: any) => item.id == "position")
          ?.valueCode,
        appsts: defaultOption.find((item: any) => item.id == "appsts")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        acntdiv: defaultOption.find((item: any) => item.id == "acntdiv")
          ?.valueCode,
      }));
      setFilters2((prev) => ({
        ...prev,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001, L_BA002, L_HU005, L_AC038, L_AC401, L_AC065, L_BA028, L_AC014",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [positionListData, setPositionListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [usekindListData, setusekindListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [etaxListData, setetaxListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [taxdivListData, settaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxtypeListData, setTaxtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA002")
      );
      const positionQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA028")
      );
      const taxtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_AC014")
      );
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU005")
      );
      const usekindQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_AC038")
      );
      const etaxQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_AC401")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_AC065")
      );
      fetchQuery(positionQueryStr, setPositionListData);
      fetchQuery(usekindQueryStr, setusekindListData);
      fetchQuery(postcdQueryStr, setpostcdListData);
      fetchQuery(locationQueryStr, setLocationListData);
      fetchQuery(dptcdQueryStr, setdptcdListData);
      fetchQuery(taxtypeQueryStr, setTaxtypeListData);
      fetchQuery(etaxQueryStr, setetaxListData);
      fetchQuery(taxdivQueryStr, settaxdivListData);
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_A1040W", setMessagesData);
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "요약정보";
      optionsGridOne.sheets[1].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: "",
    position: "",
    frdt: new Date(),
    todt: new Date(),
    prsnnum: "",
    prsnnm: "",
    dptcd: "",
    appsts: "",
    acntdiv: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [information, setInformation] = useState({
    actdt: new Date(),
  });
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A1040W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A1040W_001");
      } else if (
        filters.location == "" ||
        filters.location == null ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "AC_A1040W_002");
      } else {
        setPage(initialPageState); // 페이지 초기화
        resetAllGrid(); // 데이터 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        setFilters2((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
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

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };
  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.user_id,
      prsnnm: data.user_name,
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
  const [tempState2, setTempState2] = useState<State>({
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
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1040W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_appsts": filters.appsts,
        "@p_acntdiv": filters.acntdiv,
        "@p_position": filters.position,
        "@p_dtgb": "A",
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
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        acntdiv:
          item.acntdiv == "N" ? false : item.acntdiv == "Y" ? true : false,
      }));
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.expensedt + "-" + row.expenseseq1 + "-" + row.expenseseq2 ==
              filters.find_row_value
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.expensedt +
                    "-" +
                    row.expenseseq1 +
                    "-" +
                    row.expenseseq2 ==
                  filters.find_row_value
              );
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1040W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_appsts": filters.appsts,
        "@p_acntdiv": filters.acntdiv,
        "@p_position": filters.position,
        "@p_dtgb": "A",
        "@p_find_row_value": "",
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
      }));

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
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
    if (filters.isSearch && customOptionData !== null) {
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  //그리드 푸터
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
  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
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
  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
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
  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chk") {
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field == "chk" || field == "remark") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev: { total: any }) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                chk:
                  typeof item.chk == "boolean"
                    ? item.chk
                    : item.chk == "Y"
                    ? true
                    : false,
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

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      let sum = 0;
      let location = "";
      let position = "";
      const datas = mainDataResult.data.map((item) => {
        if (item.chk == true) {
          sum += item.amt;
          location = item.location;
          position = item.position;
        }
      });
      const newData = mainDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
            ? {
                ...item,
                chk:
                  typeof item.chk == "boolean"
                    ? item.chk
                    : item.chk == "Y"
                    ? true
                    : false,
                slipamt:
                  datas != undefined
                    ? (typeof item.chk == "boolean" && item.chk == true) ||
                      item.chk == "Y"
                      ? sum
                      : 0
                    : 0,
                location:
                  datas != undefined
                    ? (typeof item.chk == "boolean" && item.chk == true) ||
                      item.chk == "Y"
                      ? location
                      : ""
                    : "",
                position:
                  datas != undefined
                    ? (typeof item.chk == "boolean" && item.chk == true) ||
                      item.chk == "Y"
                      ? position
                      : ""
                    : "",
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
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onAddClick = () => {
    if (mainDataResult.total > 0) {
      const datas2 = mainDataResult.data.filter((item) => item.chk == true);
      if (datas2.length > 0) {
        const datas = mainDataResult2.data.filter((item) => item.chk == true);
        if (datas.length == 1) {
          let valid = true;

          datas2.map((item) => {
            if (item.acntdiv != false) {
              valid = false;
            }
          });

          if (valid != true) {
            alert("전표처리가 된 건이 있습니다");
          } else {
            let dataArr: TdataArr = {
              acntcd_s: [],
              drcrdiv_s: [],
              slipamt_s: [],
              custcd_s: [],
              custnm_s: [],
              mngdata1_s: [],
              mngdatanm1_s: [],
              remark_s: [],
              taxtype_s: [],
              creditcd_s: [],

              location_s: [],
              position_s: [],

              actdt_s: [],
              acseq1_s: [],
              expensedt_s: [],
              expenseseq1_s: [],
              expenseseq2_s: [],
            };

            datas2.forEach((item: any, idx: number) => {
              const {
                acntcd = "",
                amt1 = "",
                rcvcustcd = "",
                rcvcustnm = "",
                taxtype = "",
                creditcd = "",
                location = "",
                position = "",
                remark = "",
                expensedt = "",
                expenseseq1 = "",
                expenseseq2 = "",
              } = item;
              dataArr.acntcd_s.push(acntcd);
              dataArr.drcrdiv_s.push("1");
              dataArr.slipamt_s.push(amt1);
              dataArr.custcd_s.push(rcvcustcd);
              dataArr.custnm_s.push(rcvcustnm);
              dataArr.mngdata1_s.push("");
              dataArr.mngdatanm1_s.push("");
              dataArr.remark_s.push(remark);
              dataArr.taxtype_s.push(taxtype);
              dataArr.creditcd_s.push(creditcd);
              dataArr.location_s.push(location);
              dataArr.position_s.push(position);
              dataArr.expensedt_s.push(expensedt);
              dataArr.expenseseq1_s.push(expenseseq1);
              dataArr.expenseseq2_s.push(expenseseq2);
            });

            datas.forEach((item: any, idx: number) => {
              const {
                acntcd = "",
                slipamt = "",
                mngdata1 = "",
                mngdatanm1 = "",
                location = "",
                position = "",
                remark = "",
              } = item;
              dataArr.acntcd_s.push(acntcd);
              dataArr.drcrdiv_s.push("2");
              dataArr.slipamt_s.push(slipamt);
              dataArr.custcd_s.push("");
              dataArr.custnm_s.push("");
              dataArr.mngdata1_s.push(mngdata1);
              dataArr.mngdatanm1_s.push(mngdatanm1);
              dataArr.remark_s.push(remark);
              dataArr.taxtype_s.push("");
              dataArr.creditcd_s.push("");
              dataArr.location_s.push(location);
              dataArr.position_s.push(position);
              dataArr.expensedt_s.push("");
              dataArr.expenseseq1_s.push("0");
              dataArr.expenseseq2_s.push("0");
            });

            setParaData((prev) => ({
              ...prev,
              workType: "N",
              orgdiv: sessionOrgdiv,
              location: filters.location,
              actdt: convertDateToStr(information.actdt),
              acntcd_s: dataArr.acntcd_s.join("|"),
              drcrdiv_s: dataArr.drcrdiv_s.join("|"),
              slipamt_s: dataArr.slipamt_s.join("|"),
              custcd_s: dataArr.custcd_s.join("|"),
              custnm_s: dataArr.custnm_s.join("|"),
              mngdata1_s: dataArr.mngdata1_s.join("|"),
              mngdatanm1_s: dataArr.mngdatanm1_s.join("|"),
              remark_s: dataArr.remark_s.join("|"),
              taxtype_s: dataArr.taxtype_s.join("|"),
              creditcd_s: dataArr.creditcd_s.join("|"),
              location_s: dataArr.location_s.join("|"),
              position_s: dataArr.position_s.join("|"),
              actdt_s: "",
              acseq1_s: "",
              expensedt_s: dataArr.expensedt_s.join("|"),
              expenseseq1_s: dataArr.expenseseq1_s.join("|"),
              expenseseq2_s: dataArr.expenseseq2_s.join("|"),
            }));
          }
        } else if (datas.length == 0) {
          alert("기본정보의 반영유무를 체크해주세요.");
        } else {
          alert("한 건만 선택해주세요");
        }
      } else {
        alert("선택된 건이 없습니다.");
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: "",
    actdt: "",
    acntcd_s: "",
    drcrdiv_s: "",
    slipamt_s: "",
    custcd_s: "",
    custnm_s: "",
    mngdata1_s: "",
    mngdatanm1_s: "",
    remark_s: "",
    taxtype_s: "",
    creditcd_s: "",
    location_s: "",
    position_s: "",
    actdt_s: "",
    acseq1_s: "",
    expensedt_s: "",
    expenseseq1_s: "",
    expenseseq2_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A1040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_actdt": ParaData.actdt,
      "@p_acntcd_s": ParaData.acntcd_s,
      "@p_drcrdiv_s": ParaData.drcrdiv_s,
      "@p_slipamt_s": ParaData.slipamt_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_custnm_s": ParaData.custnm_s,
      "@p_mngdata1_s": ParaData.mngdata1_s,
      "@p_mngdatanm1_s": ParaData.mngdatanm1_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_taxtype_s": ParaData.taxtype_s,
      "@p_creditcd_s": ParaData.creditcd_s,
      "@p_location_s": ParaData.location_s,
      "@p_position_s": ParaData.position_s,
      "@p_actdt_s": ParaData.actdt_s,
      "@p_acseq1_s": ParaData.acseq1_s,
      "@p_expensedt_s": ParaData.expensedt_s,
      "@p_expenseseq1_s": ParaData.expenseseq1_s,
      "@p_expenseseq2_s": ParaData.expenseseq2_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A1040W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      resetAllGrid();
      setPage(initialPageState);
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        location: "",
        actdt: "",
        acntcd_s: "",
        drcrdiv_s: "",
        slipamt_s: "",
        custcd_s: "",
        custnm_s: "",
        mngdata1_s: "",
        mngdatanm1_s: "",
        remark_s: "",
        taxtype_s: "",
        creditcd_s: "",
        location_s: "",
        position_s: "",
        actdt_s: "",
        acseq1_s: "",
        expensedt_s: "",
        expenseseq1_s: "",
        expenseseq2_s: "",
      });
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters2((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onDeleteClick = () => {
    if (mainDataResult.total > 0) {
      const datas = mainDataResult.data.filter((item) => item.chk == true);
      if (datas.length > 0) {
        let valid = true;

        datas.map((item) => {
          if (item.acntdiv != true) {
            valid = false;
          }
        });

        if (valid != true) {
          alert("전표처리가 안된 건이 있습니다");
        } else {
          let dataArr: TdataArr = {
            acntcd_s: [],
            drcrdiv_s: [],
            slipamt_s: [],
            custcd_s: [],
            custnm_s: [],
            mngdata1_s: [],
            mngdatanm1_s: [],
            remark_s: [],
            taxtype_s: [],
            creditcd_s: [],

            location_s: [],
            position_s: [],

            actdt_s: [],
            acseq1_s: [],
            expensedt_s: [],
            expenseseq1_s: [],
            expenseseq2_s: [],
          };

          datas.forEach((item: any, idx: number) => {
            const {
              actdt = "",
              acseq1 = "",
              expensedt = "",
              expenseseq1 = "",
              expenseseq2 = "",
            } = item;
            dataArr.actdt_s.push(actdt);
            dataArr.acseq1_s.push(acseq1);
            dataArr.expensedt_s.push(expensedt);
            dataArr.expenseseq1_s.push(expenseseq1);
            dataArr.expenseseq2_s.push(expenseseq2);
          });

          setParaData((prev) => ({
            ...prev,
            workType: "DROP",
            orgdiv: sessionOrgdiv,
            location: filters.location,
            actdt: convertDateToStr(information.actdt),
            acntcd_s: "",
            drcrdiv_s: "",
            slipamt_s: "",
            custcd_s: "",
            custnm_s: "",
            mngdata1_s: "",
            mngdatanm1_s: "",
            remark_s: "",
            taxtype_s: "",
            creditcd_s: "",
            location_s: "",
            position_s: "",
            actdt_s: dataArr.actdt_s.join("|"),
            acseq1_s: dataArr.acseq1_s.join("|"),
            expensedt_s: dataArr.expensedt_s.join("|"),
            expenseseq1_s: dataArr.expenseseq1_s.join("|"),
            expenseseq2_s: dataArr.expenseseq2_s.join("|"),
          }));
        }
      } else {
        alert("선택된 건이 없습니다.");
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };
  return (
    <>
      <TitleContainer>
        <Title>지출결의서-자동전표</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_A1040W"
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
              <th>결재상태</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="appsts"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>요청자 번호</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onPrsnnumWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>요청자 명</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>비용부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    valueField="dptcd"
                    textField="dptnm"
                  />
                )}
              </td>
              <th>전표처리구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="acntdiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>요약정보</GridTitle>
          <ButtonContainer>
            <Button onClick={onAddClick} themeColor={"primary"} icon="file-add">
              확정
            </Button>
            <Button
              onClick={onDeleteClick}
              icon="delete"
              fillMode="outline"
              themeColor={"primary"}
            >
              해제
            </Button>
          </ButtonContainer>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="지출결의서-자동전표"
        >
          <Grid
            style={{ height: "38vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                location: locationListData.find(
                  (item: any) => item.sub_code == row.location
                )?.code_name,
                position: positionListData.find(
                  (item: any) => item.sub_code == row.position
                )?.code_name,
                taxtype: taxtypeListData.find(
                  (item: any) => item.sub_code == row.taxtype
                )?.code_name,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd == row.dptcd
                )?.dptnm,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code == row.postcd
                )?.code_name,
                usekind: usekindListData.find(
                  (item: any) => item.sub_code == row.usekind
                )?.code_name,
                etax: etaxListData.find(
                  (item: any) => item.sub_code == row.etax
                )?.code_name,
                taxdiv: taxdivListData.find(
                  (item: any) => item.sub_code == row.taxdiv
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
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell}
              cell={CheckBoxCell}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        dateField.includes(item.fieldName)
                          ? DateCell
                          : numberField.includes(item.fieldName)
                          ? NumberCell
                          : checkField.includes(item.fieldName)
                          ? CheckBoxReadOnlyCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0
                          ? mainTotalFooterCell
                          : numberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell
                          : undefined
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>기본정보</GridTitle>
        </GridTitleContainer>
        <FormBoxWrap>
          <FormBox>
            <tbody>
              <tr>
                <th>처리일자</th>
                <td>
                  <DatePicker
                    name="actdt"
                    value={information.actdt}
                    format="yyyy-MM-dd"
                    onChange={InputChange}
                    className="required"
                    placeholder=""
                  />
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <ExcelExport
          data={mainDataResult2.data}
          ref={(exporter) => {
            _export2 = exporter;
          }}
          fileName="지출결의서-자동전표"
        >
          <Grid
            style={{ height: "25vh" }}
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
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange2}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange2}
            cellRender={customCellRender2}
            rowRender={customRowRender2}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="chk"
              title="반영유무"
              width="45px"
              cell={CheckBoxCell}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList2"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : item.fieldName == "mngdata1"
                          ? ColumnCommandCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0
                          ? mainTotalFooterCell2
                          : numberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell2
                          : undefined
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {prsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"N"}
          setData={setPrsnnumData}
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

export default AC_A1040W;
