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
import {
  MonthView,
  Scheduler,
  SchedulerItem,
  SchedulerItemProps,
  SchedulerViewSlot,
  SchedulerViewSlotProps,
} from "@progress/kendo-react-scheduler";
import { checkIcon } from "@progress/kendo-svg-icons";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
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
  dateformat,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { OSState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_A6000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { useRecoilState } from "recoil";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let temp = 0;
let temp2 = 0;

const dateField = ["findt", "acntdt"];
const comboField = ["position", "itemcd", "amtunit"];
const numberField = ["amt"];
const commendField = ["custcd"];
const checkField = ["btn"];

type TdataArr = {
  rowstatus_s: string[];
  location_s: string[];
  position_s: string[];
  datnum_s: string[];
  seq_s: string[];

  acntdt_s: string[];
  div_s: string[];
  itemcd_s: string[];
  amtunit_s: string[];
  amt_s: string[];
  remark1_s: string[];
  findt_s: string[];
  finperson_s: string[];
  custcd_s: string[];
  custnm_s: string[];
};

const FormContext = createContext<{
  custcd: string;
  setCustcd: (d: any) => void;
  custnm: string;
  setCustnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const FormContext2 = createContext<{
  custcd2: string;
  setCustcd2: (d: any) => void;
  custnm2: string;
  setCustnm2: (d: any) => void;
  mainDataState2: State;
  setMainDataState2: (d: any) => void;
}>({} as any);

interface ICustData {
  custcd: string;
  custnm: string;
}

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
      {render === undefined
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
  const {
    custcd2,
    custnm2,
    setCustcd2,
    setCustnm2,
    mainDataState2,
    setMainDataState2,
  } = useContext(FormContext2);
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
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setCustcd2(data.custcd);
    setCustnm2(data.custnm);
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
      {render === undefined
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
  // 사용자
  UseBizComponent("L_BA028, P_AC102, L_BA020", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "position"
      ? "L_BA028"
      : field === "itemcd"
      ? "P_AC102"
      : field === "amtunit"
      ? "L_BA020"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

const AC_A6000W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_A6000W", setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent("L_sysUserMaster_001", setBizComponentData);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  useEffect(() => {
    if (bizComponentData.length > 0) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQueryData(userQueryStr, setUserListData);
    }
  }, [bizComponentData]);

  const fetchQueryData = useCallback(
    async (queryStr: string, setListData: any) => {
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
    },
    []
  );
  //메시지 조회
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages("AC_A6000W", setMessagesData);
  const [osstate, setOSState] = useRecoilState(OSState);
  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");
  const [custcd2, setCustcd2] = useState<string>("");
  const [custnm2, setCustnm2] = useState<string>("");
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      const frdts = new Date();
      frdts.setFullYear(setDefaultDate(customOptionData, "frdt").getFullYear());
      frdts.setMonth(setDefaultDate(customOptionData, "frdt").getMonth());
      frdts.setDate(1);
      const todt = new Date();
      let lastday = new Date(
        parseInt(
          convertDateToStr(setDefaultDate(customOptionData, "frdt")).substring(
            0,
            4
          )
        ),
        parseInt(
          convertDateToStr(setDefaultDate(customOptionData, "frdt")).substring(
            4,
            6
          )
        ),
        0
      ).getDate();
      todt.setFullYear(setDefaultDate(customOptionData, "frdt").getFullYear());
      todt.setMonth(setDefaultDate(customOptionData, "frdt").getMonth());
      todt.setDate(lastday);
      setFilters((prev) => ({
        ...prev,
        frdt: frdts,
        todt: todt,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
      }));
      setFilters2((prev) => ({
        ...prev,
        frdt: frdts,
        todt: todt,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
      }));
      setFilters3((prev) => ({
        ...prev,
        frdt: frdts,
        todt: todt,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            custcd: custcd,
            custnm: custnm,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
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

  useEffect(() => {
    const newData = mainDataResult2.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState2)[0])
        ? {
            ...item,
            custcd: custcd2,
            custnm: custnm2,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [custcd2, custnm2]);

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "수금계획";
      optionsGridOne.sheets[1].title = "지출계획";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A6000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A6000W_001");
      } else {
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        setFilters3((prev) => ({
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q1",
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    location: "",
    position: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q2",
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    location: "",
    position: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "Calendar",
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    location: "",
    position: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "frdt") {
      const todt = new Date();
      let lastday = new Date(
        parseInt(convertDateToStr(value).substring(0, 4)),
        parseInt(convertDateToStr(value).substring(4, 6)),
        0
      ).getDate();
      todt.setFullYear(value.getFullYear());
      todt.setMonth(value.getMonth());
      todt.setDate(lastday);
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        todt: todt,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        [name]: value,
        todt: todt,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        [name]: value,
        todt: todt,
        isSearch: true,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      setFilters2((prev) => ({
        ...prev,
        [name]: value,
      }));
      setFilters3((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A6000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": "01",
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        btn: item.findt != "" ? false : true,
      }));

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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A6000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": "01",
        "@p_frdt": convertDateToStr(filters2.frdt),
        "@p_todt": convertDateToStr(filters2.todt),
        "@p_location": filters2.location,
        "@p_position": filters2.position,
        "@p_find_row_value": filters2.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        btn: item.findt != "" ? false : true,
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A6000W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": "01",
        "@p_frdt": convertDateToStr(filters3.frdt),
        "@p_todt": convertDateToStr(filters3.todt),
        "@p_location": filters3.location,
        "@p_position": filters3.position,
        "@p_find_row_value": filters3.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true && data.tables[0]) {
      let i = 0;
      const rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
        id: i++,
        title: row.amt,
        start: new Date(row.strtime),
        end: new Date(row.endtime),
      }));

      const datas = rows.map((item: any) => {
        const enddate = new Date(Date.parse(item.end) + 1000 * 60 * 60);

        return {
          ...item,
          end: enddate,
        };
      });

      setSchedulerDataResult(datas);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
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
    if (filters.isSearch && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, customOptionData]);

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

  const [schedulerDataResult, setSchedulerDataResult] = useState<any[]>([]);

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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
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
  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
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
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
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
    if (field != "rowstatus" && field != "findt" && field != "finperson") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "findt" && field != "finperson") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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
      setTempResult2((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
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

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
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
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  const CustomItem = (props: SchedulerItemProps) => {
    let colorCode = "";

    if (props.dataItem.div == "2") {
      colorCode = "#fff0ef";
    } else {
      colorCode = "#2289C340";
    }

    return (
      <SchedulerItem
        {...props}
        style={{
          ...props.style,
          backgroundColor: colorCode,
        }}
      />
    );
  };

  const CustomViewSlot = (props: SchedulerViewSlotProps) => {
    return (
      <SchedulerViewSlot
        {...props}
        style={{
          ...props.style,
          minHeight: 120,
        }}
      />
    );
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      acntdt: convertDateToStr(new Date()),
      amt: 0,
      amtunit: "",
      btn: "",
      custcd: "",
      custnm: "",
      datnum: convertDateToStr(new Date()),
      div: "1",
      extra_field1: "",
      extra_field2: "",
      extra_field3: "",
      findt: "",
      finperson: "",
      inputpath: "",
      itemcd: "101",
      location: filters.location,
      orgdiv: "01",
      position: filters.position,
      remark1: "",
      seq: 0,
      update_form_id: "",
      update_pc: "",
      update_time: "",
      update_userid: "",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
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
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp2,
      acntdt: convertDateToStr(new Date()),
      amt: 0,
      amtunit: "",
      btn: "",
      custcd: "",
      custnm: "",
      datnum: convertDateToStr(new Date()),
      div: "2",
      extra_field1: "",
      extra_field2: "",
      extra_field3: "",
      findt: "",
      finperson: "",
      inputpath: "",
      itemcd: "201",
      location: filters.location,
      orgdiv: "01",
      position: filters.position,
      remark1: "",
      seq: 0,
      update_form_id: "",
      update_pc: "",
      update_time: "",
      update_userid: "",
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setMainDataResult2((prev) => {
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

    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows2.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }
    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      location_s: [],
      position_s: [],
      datnum_s: [],
      seq_s: [],

      acntdt_s: [],
      div_s: [],
      itemcd_s: [],
      amtunit_s: [],
      amt_s: [],
      remark1_s: [],
      findt_s: [],
      finperson_s: [],
      custcd_s: [],
      custnm_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        location = "",
        position = "",
        datnum = "",
        seq = "",

        acntdt = "",
        div = "",
        itemcd = "",
        amtunit = "",
        amt = "",
        remark1 = "",
        findt = "",
        finperson = "",
        custcd = "",
        custnm = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.location_s.push(location);
      dataArr.position_s.push(position);
      dataArr.datnum_s.push(datnum);
      dataArr.seq_s.push(seq);
      dataArr.acntdt_s.push(acntdt);
      dataArr.div_s.push(div);
      dataArr.itemcd_s.push(itemcd);
      dataArr.amtunit_s.push(amtunit);
      dataArr.amt_s.push(amt);
      dataArr.remark1_s.push(remark1);
      dataArr.findt_s.push(findt);
      dataArr.finperson_s.push(finperson);
      dataArr.custcd_s.push(custcd);
      dataArr.custnm_s.push(custnm);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        location = "",
        position = "",
        datnum = "",
        seq = "",

        acntdt = "",
        div = "",
        itemcd = "",
        amtunit = "",
        amt = "",
        remark1 = "",
        findt = "",
        finperson = "",
        custcd = "",
        custnm = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.location_s.push(location);
      dataArr.position_s.push(position);
      dataArr.datnum_s.push(datnum);
      dataArr.seq_s.push(seq);
      dataArr.acntdt_s.push(acntdt);
      dataArr.div_s.push(div);
      dataArr.itemcd_s.push(itemcd);
      dataArr.amtunit_s.push(amtunit);
      dataArr.amt_s.push(amt);
      dataArr.remark1_s.push(remark1);
      dataArr.findt_s.push(findt);
      dataArr.finperson_s.push(finperson);
      dataArr.custcd_s.push(custcd);
      dataArr.custnm_s.push(custnm);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "N",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      location_s: dataArr.location_s.join("|"),
      position_s: dataArr.position_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      acntdt_s: dataArr.acntdt_s.join("|"),
      div_s: dataArr.div_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      amtunit_s: dataArr.amtunit_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      remark1_s: dataArr.remark1_s.join("|"),
      findt_s: dataArr.findt_s.join("|"),
      finperson_s: dataArr.finperson_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      custnm_s: dataArr.custnm_s.join("|"),
    }));
  };

  const onSaveClick2 = () => {
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows2.length === 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      location_s: [],
      position_s: [],
      datnum_s: [],
      seq_s: [],

      acntdt_s: [],
      div_s: [],
      itemcd_s: [],
      amtunit_s: [],
      amt_s: [],
      remark1_s: [],
      findt_s: [],
      finperson_s: [],
      custcd_s: [],
      custnm_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        location = "",
        position = "",
        datnum = "",
        seq = "",

        acntdt = "",
        div = "",
        itemcd = "",
        amtunit = "",
        amt = "",
        remark1 = "",
        findt = "",
        finperson = "",
        custcd = "",
        custnm = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.location_s.push(location);
      dataArr.position_s.push(position);
      dataArr.datnum_s.push(datnum);
      dataArr.seq_s.push(seq);
      dataArr.acntdt_s.push(acntdt);
      dataArr.div_s.push(div);
      dataArr.itemcd_s.push(itemcd);
      dataArr.amtunit_s.push(amtunit);
      dataArr.amt_s.push(amt);
      dataArr.remark1_s.push(remark1);
      dataArr.findt_s.push(findt);
      dataArr.finperson_s.push(finperson);
      dataArr.custcd_s.push(custcd);
      dataArr.custnm_s.push(custnm);
    });

    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        location = "",
        position = "",
        datnum = "",
        seq = "",

        acntdt = "",
        div = "",
        itemcd = "",
        amtunit = "",
        amt = "",
        remark1 = "",
        findt = "",
        finperson = "",
        custcd = "",
        custnm = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.location_s.push(location);
      dataArr.position_s.push(position);
      dataArr.datnum_s.push(datnum);
      dataArr.seq_s.push(seq);
      dataArr.acntdt_s.push(acntdt);
      dataArr.div_s.push(div);
      dataArr.itemcd_s.push(itemcd);
      dataArr.amtunit_s.push(amtunit);
      dataArr.amt_s.push(amt);
      dataArr.remark1_s.push(remark1);
      dataArr.findt_s.push(findt);
      dataArr.finperson_s.push(finperson);
      dataArr.custcd_s.push(custcd);
      dataArr.custnm_s.push(custnm);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "N",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      location_s: dataArr.location_s.join("|"),
      position_s: dataArr.position_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      acntdt_s: dataArr.acntdt_s.join("|"),
      div_s: dataArr.div_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      amtunit_s: dataArr.amtunit_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      remark1_s: dataArr.remark1_s.join("|"),
      findt_s: dataArr.findt_s.join("|"),
      finperson_s: dataArr.finperson_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      custnm_s: dataArr.custnm_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: "01",
    rowstatus_s: "",
    location_s: "",
    position_s: "",
    datnum_s: "",
    seq_s: "",
    acntdt_s: "",
    div_s: "",
    itemcd_s: "",
    amtunit_s: "",
    amt_s: "",
    remark1_s: "",
    findt_s: "",
    finperson_s: "",
    custcd_s: "",
    custnm_s: "",
    attdatnum: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A6000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_location_s": ParaData.location_s,
      "@p_position_s": ParaData.position_s,
      "@p_datnum_s": ParaData.datnum_s,
      "@p_seq_s": ParaData.seq_s,
      "@p_acntdt_s": ParaData.acntdt_s,
      "@p_div_s": ParaData.div_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_amtunit_s": ParaData.amtunit_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_remark1_s": ParaData.remark1_s,
      "@p_findt_s": ParaData.findt_s,
      "@p_finperson_s": ParaData.finperson_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_custnm_s": ParaData.custnm_s,
      "@p_form_id": "AC_A6000W",
      "@p_pc": pc,
      "@p_userid": userId,
      "@p_attdatnum": ParaData.attdatnum,
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

    if (data.isSuccess === true) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: prev.pgNum,
        isSearch: true,
      }));
      setFilters2((prev: any) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: prev.pgNum,
        isSearch: true,
      }));
      setFilters3((prev: any) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: prev.pgNum,
        isSearch: true,
      }));

      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: "01",
        rowstatus_s: "",
        location_s: "",
        position_s: "",
        datnum_s: "",
        seq_s: "",
        acntdt_s: "",
        div_s: "",
        itemcd_s: "",
        amtunit_s: "",
        amt_s: "",
        remark1_s: "",
        findt_s: "",
        finperson_s: "",
        custcd_s: "",
        custnm_s: "",
        attdatnum: "",
      });
      deletedMainRows = [];
      deletedMainRows2 = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onCopyClick = async () => {
    if (!window.confirm("전월복사를 하시겠습니까?")) {
      return false;
    }

    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A6000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "BF",
        "@p_orgdiv": "01",
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        btn: item.findt != "" ? false : true,
      }));

      mainDataResult2.data.map((item) => {
        if (item.num > temp2) {
          temp2 = item.num;
        }
      });

      rows.map((item: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp2,
          acntdt: item.acntdt,
          amt: item.amt,
          amtunit: "",
          btn: "",
          custcd: item.custcd,
          custnm: item.custnm,
          datnum: convertDateToStr(new Date()),
          div: "2",
          extra_field1: "",
          extra_field2: "",
          extra_field3: "",
          findt: "",
          finperson: "",
          inputpath: "",
          itemcd: item.itemcd,
          location: filters.location,
          orgdiv: "01",
          position: filters.position,
          remark1: item.remark1,
          seq: 0,
          update_form_id: "",
          update_pc: "",
          update_time: "",
          update_userid: "",
          rowstatus: "N",
        };

        setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
        setMainDataResult2((prev) => {
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
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const CustomCheckCell = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;

    const check = () => {
      setParaData((prev) => ({
        ...prev,
        workType: "N",
        rowstatus_s: "U",
        location_s: dataItem.location,
        position_s: dataItem.position,
        datnum_s: dataItem.datnum,
        seq_s: dataItem.seq,
        acntdt_s: convertDateToStr(dataItem.acntdt),
        div_s: dataItem.div,
        itemcd_s: dataItem.itemcd,
        amtunit_s: dataItem.amtunit,
        amt_s: dataItem.amt,
        remark1_s: dataItem.remark1,
        findt_s: convertDateToStr(new Date()),
        finperson_s: userId,
        custcd_s: dataItem.custcd,
        custnm_s: dataItem.custnm,
      }));
    };

    return (
      <td>
        {dataItem.findt == "" ? (
          <Button
            onClick={() => check()}
            style={{ width: "100%" }}
            themeColor={"primary"}
            fillMode="outline"
            svgIcon={checkIcon}
          />
        ) : (
          ""
        )}
      </td>
    );
  };

  return (
    <>
      <TitleContainer>
        <Title>자금계획</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_A6000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준일</th>
              <td>
                <DatePicker
                  name="frdt"
                  value={filters.frdt}
                  format="yyyy-MM"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={MonthCalendar}
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
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width="60%">
          <GridTitleContainer>
            <GridTitle>일정</GridTitle>
          </GridTitleContainer>
          {osstate == true ? (
            <div
              style={{
                backgroundColor: "#ccc",
                height: "81vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              현재 OS에서는 지원이 불가능합니다.
            </div>
          ) : (
            <Scheduler
              height={"81vh"}
              data={schedulerDataResult}
              date={filters.frdt}
              defaultDate={new Date()}
              item={CustomItem}
              viewSlot={CustomViewSlot}
              header={(props) => <React.Fragment />}
            >
              <MonthView itemsPerSlot={8} />
            </Scheduler>
          )}
        </GridContainer>
        <GridContainer width={`calc(40% - ${GAP}px)`}>
          <FormBoxWrap>
            <FormBox>
              <tbody>
                <tr>
                  <th style={{ width: "5%" }}>일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.frdt,
                        end: filters.todt,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) => {
                        setFilters((prev) => ({
                          ...prev,
                          frdt: e.value.start,
                          todt: e.value.end,
                        }));
                        setFilters2((prev) => ({
                          ...prev,
                          frdt: e.value.start,
                          todt: e.value.end,
                        }));
                      }}
                      className="required"
                    />
                  </td>
                  <th style={{ width: "10%" }}>
                    <Button
                      onClick={search}
                      icon="search"
                      themeColor={"primary"}
                    >
                      조회
                    </Button>
                  </th>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
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
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>수금계획</GridTitle>
                <ButtonContainer>
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
                fileName="자금계획"
              >
                <Grid
                  style={{ height: "35vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      finperson: userListData.find(
                        (items: any) => items.user_id == row.finperson
                      )?.user_name,
                      acntdt: row.acntdt
                        ? new Date(dateformat(row.acntdt))
                        : new Date(dateformat("19000101")),
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
                    customOptionData.menuCustomColumnOptions["grdList"].map(
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
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell
                                : checkField.includes(item.fieldName)
                                ? CustomCheckCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
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
            </GridContainer>
          </FormContext.Provider>
          <FormContext2.Provider
            value={{
              custcd2,
              custnm2,
              setCustcd2,
              setCustnm2,
              mainDataState2,
              setMainDataState2,
              // fetchGrid,
            }}
          >
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>지출계획</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    fillMode="outline"
                    onClick={onCopyClick}
                    icon="copy"
                  >
                    전월복사
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
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="자금계획"
              >
                <Grid
                  style={{ height: "35vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      finperson: userListData.find(
                        (items: any) => items.user_id == row.finperson
                      )?.user_name,
                      acntdt: row.acntdt
                        ? new Date(dateformat(row.acntdt))
                        : new Date(dateformat("19000101")),
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
                  onItemChange={onMainItemChange2}
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
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : numberField.includes(item.fieldName)
                                ? NumberCell
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell2
                                : checkField.includes(item.fieldName)
                                ? CustomCheckCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell2
                                : numberField.includes(item.fieldName)
                                ? editNumberFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </FormContext2.Provider>
        </GridContainer>
      </GridContainerWrap>
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

export default AC_A6000W;
