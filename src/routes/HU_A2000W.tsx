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
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
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
import RadioGroupCell from "../components/Cells/RadioGroupCell";
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
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A2000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";

const dateField = ["yyyymmdd"];
const comboField = ["daygb"];
const radioField = ["workdiv"];
const numberField = ["week", "mweek"];

type TdataArr = {
  rowstatus_s: string[];
  yyyymmdd_s: string[];
  workgb_s: string[];
  workcls_s: string[];
  daygb_s: string[];
  workdiv_s: string[];
  remark_s: string[];
  week_s: string[];
  mweek_s: string[];
};

const CustomDateCell = (props: GridCellProps) => {
  const color =
    props.dataItem.dayofweek == "(일)"
      ? "red"
      : props.dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  return <DateCell color={color} {...props} />;
};

const CustomNumberCell = (props: GridCellProps) => {
  const color =
    props.dataItem.dayofweek == "(일)"
      ? "red"
      : props.dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  return <NumberCell color={color} {...props} />;
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_WORKDIV", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "workdiv" ? "R_WORKDIV" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const color =
    props.dataItem.dayofweek == "(일)"
      ? "red"
      : props.dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} color={color} {...props} />
  ) : (
    <td />
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU077", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "daygb" ? "L_HU077" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const color =
    props.dataItem.dayofweek == "(일)"
      ? "red"
      : props.dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} color={color} {...props} />
  ) : (
    <td />
  );
};

const CustomColorCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field } = props;

  const color =
    dataItem.dayofweek == "(일)"
      ? "red"
      : dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  const value = field && dataItem[field] ? dataItem[field] : "";

  return (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ color: color }}
    >
      {value}
    </td>
  );
};

const HU_A2000W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption("HU_A2000W", setCustomOptionData);
  //메시지 조회
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages("HU_A2000W", setMessagesData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_HU076, L_HU075",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  const [workgbListData, setWorkgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [workclsListData, setWorkclsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const workgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU075")
      );
      const workclsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU076")
      );

      fetchQuery(workgbQueryStr, setWorkgbListData);
      fetchQuery(workclsQueryStr, setWorkclsListData);
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

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
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

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        stddt: setDefaultDate(customOptionData, "stddt"),
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        workgb: defaultOption.find((item: any) => item.id == "workgb")
          ?.valueCode,
        workcls: defaultOption.find((item: any) => item.id == "workcls")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.stddt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.stddt).substring(6, 8) > "31" ||
        convertDateToStr(filters.stddt).substring(6, 8) < "01" ||
        convertDateToStr(filters.stddt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_A2000W_001");
      } else if (
        filters.location == "" ||
        filters.location == undefined ||
        filters.location == null
      ) {
        throw findMessage(messagesData, "HU_A2000W_002");
      } else if (
        filters.workgb == "" ||
        filters.workgb == undefined ||
        filters.workgb == null
      ) {
        throw findMessage(messagesData, "HU_A2000W_003");
      } else if (
        filters.workcls == "" ||
        filters.workcls == undefined ||
        filters.workcls == null
      ) {
        throw findMessage(messagesData, "HU_A2000W_004");
      } else {
        resetAllGrid();
        setFilters((prev) => ({
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
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    stddt: new Date(),
    workgb: "",
    workcls: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A2000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_stddt": convertDateToStr(filters.stddt).substring(0, 6),
        "@p_location": filters.location,
        "@p_workgb": filters.workgb,
        "@p_workcls": filters.workcls,
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, customOptionData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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
    if (field == "daygb" || field == "workdiv" || field == "remark") {
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

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
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

  function getdays(day: Date) {
    const WEEKDAY = ["(일)", "(월)", "(화)", "(수)", "(목)", "(금)", "(토)"];
    let week = WEEKDAY[day.getDay()];

    return week;
  }

  const getYearWeek = (date: Date) => {
    const onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  };

  const getWeek = (date: Date) => {
    const currentDate = date.getDate();
    const firstDay = new Date(date.setDate(1)).getDay();

    return Math.ceil((currentDate + firstDay) / 7);
  };

  const onAddClick = async () => {
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A2000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_stddt": convertDateToStr(filters.stddt).substring(0, 6),
        "@p_location": filters.location,
        "@p_workgb": filters.workgb,
        "@p_workcls": filters.workcls,
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

      if (totalRowCnt > 0) {
        alert(
          `${convertDateToStr(filters.stddt).substring(
            0,
            4
          )}년 ${convertDateToStr(filters.stddt).substring(
            4,
            6
          )}월의 데이터는 이미 존재합니다.`
        );
      } else {
        resetAllGrid();
        let now = new Date(
          parseInt(convertDateToStr(filters.stddt).substring(0, 4)),
          parseInt(convertDateToStr(filters.stddt).substring(4, 6)) - 1,
          1
        );
        let oneMonthFast = new Date(now.setMonth(now.getMonth() + 1));
        let lastday = new Date(
          parseInt(convertDateToStr(oneMonthFast).substring(0, 4)),
          parseInt(convertDateToStr(oneMonthFast).substring(4, 6)) - 1,
          0
        ).getDate();

        for (var i = 1; i <= lastday; i++) {
          const newDataItem = {
            [DATA_ITEM_KEY]: i,
            daygb: "",
            dayofweek: getdays(
              new Date(
                parseInt(convertDateToStr(filters.stddt).substring(0, 4)),
                parseInt(convertDateToStr(filters.stddt).substring(4, 6)) - 1,
                i
              )
            ),
            location: filters.location,
            mweek: getWeek(
              new Date(
                parseInt(convertDateToStr(filters.stddt).substring(0, 4)),
                parseInt(convertDateToStr(filters.stddt).substring(4, 6)) - 1,
                i
              )
            ),
            orgdiv: filters.orgdiv,
            remark:
              getdays(
                new Date(
                  parseInt(convertDateToStr(filters.stddt).substring(0, 4)),
                  parseInt(convertDateToStr(filters.stddt).substring(4, 6)) - 1,
                  i
                )
              ) == "(토)" ||
              getdays(
                new Date(
                  parseInt(convertDateToStr(filters.stddt).substring(0, 4)),
                  parseInt(convertDateToStr(filters.stddt).substring(4, 6)) - 1,
                  i
                )
              ) == "(일)"
                ? "휴무"
                : "",
            week: getYearWeek(
              new Date(
                parseInt(convertDateToStr(filters.stddt).substring(0, 4)),
                parseInt(convertDateToStr(filters.stddt).substring(4, 6)) - 1,
                i
              )
            ),
            workcls: filters.workcls,
            workdiv:
              getdays(
                new Date(
                  parseInt(convertDateToStr(filters.stddt).substring(0, 4)),
                  parseInt(convertDateToStr(filters.stddt).substring(4, 6)) - 1,
                  i
                )
              ) == "(토)" ||
              getdays(
                new Date(
                  parseInt(convertDateToStr(filters.stddt).substring(0, 4)),
                  parseInt(convertDateToStr(filters.stddt).substring(4, 6)) - 1,
                  i
                )
              ) == "(일)"
                ? "A03"
                : "A01",
            workgb: filters.workgb,
            yyyymmdd: convertDateToStr(
              new Date(
                parseInt(convertDateToStr(filters.stddt).substring(0, 4)),
                parseInt(convertDateToStr(filters.stddt).substring(4, 6)) - 1,
                i
              )
            ),
            rowstatus: "N",
          };

          setMainDataResult((prev) => {
            return {
              data: [...prev.data, newDataItem],
              total: prev.total + 1,
            };
          });
          setPage((prev) => ({
            ...prev,
            skip: 0,
            take: prev.take + 1,
          }));
          setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      yyyymmdd_s: [],
      workgb_s: [],
      workcls_s: [],
      daygb_s: [],
      workdiv_s: [],
      remark_s: [],
      week_s: [],
      mweek_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        yyyymmdd = "",
        workgb = "",
        workcls = "",
        daygb = "",
        workdiv = "",
        remark = "",
        week = "",
        mweek = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.yyyymmdd_s.push(yyyymmdd);
      dataArr.workgb_s.push(workgb);
      dataArr.workcls_s.push(workcls);
      dataArr.daygb_s.push(daygb);
      dataArr.workdiv_s.push(workdiv);
      dataArr.remark_s.push(remark);
      dataArr.week_s.push(week);
      dataArr.mweek_s.push(mweek);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      yyyymmdd_s: dataArr.yyyymmdd_s.join("|"),
      workgb_s: dataArr.workgb_s.join("|"),
      workcls_s: dataArr.workcls_s.join("|"),
      daygb_s: dataArr.daygb_s.join("|"),
      workdiv_s: dataArr.workdiv_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      week_s: dataArr.week_s.join("|"),
      mweek_s: dataArr.mweek_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: filters.orgdiv,
    location: filters.location,
    stddt: convertDateToStr(filters.stddt).substring(0, 6),
    workgb: filters.workgb,
    workcls: filters.workcls,
    rowstatus_s: "",
    yyyymmdd_s: "",
    workgb_s: "",
    workcls_s: "",
    daygb_s: "",
    workdiv_s: "",
    remark_s: "",
    week_s: "",
    mweek_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A2000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_stddt": ParaData.stddt,
      "@p_workgb": ParaData.workgb,
      "@p_workcls": ParaData.workcls,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_yyyymmdd_s": ParaData.yyyymmdd_s,
      "@p_workgb_s": ParaData.workgb_s,
      "@p_workcls_s": ParaData.workcls_s,
      "@p_daygb_s": ParaData.daygb_s,
      "@p_workdiv_s": ParaData.workdiv_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_week_s": ParaData.week_s,
      "@p_mweek_s": ParaData.mweek_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A2000W",
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
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: filters.orgdiv,
        location: filters.location,
        stddt: convertDateToStr(filters.stddt).substring(0, 6),
        workgb: filters.workgb,
        workcls: filters.workcls,
        rowstatus_s: "",
        yyyymmdd_s: "",
        workgb_s: "",
        workcls_s: "",
        daygb_s: "",
        workdiv_s: "",
        remark_s: "",
        week_s: "",
        mweek_s: "",
      });

      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
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
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onDeleteClick = () => {
    if (
      !window.confirm(
        `[${convertDateToStr(filters.stddt).substring(
          0,
          4
        )}년 ${convertDateToStr(filters.stddt).substring(
          4,
          6
        )}월]의 데이터를 삭제하시겠습니까?`
      )
    ) {
      return false;
    }

    if (mainDataResult.total == 0) {
      alert("데이터가 없습니다.");
    } else {
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: filters.orgdiv,
        location: filters.location,
        stddt: convertDateToStr(filters.stddt).substring(0, 6),
        workgb: filters.workgb,
        workcls: filters.workcls,
      }));
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>워크캘린더</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A2000W"
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
                  name="stddt"
                  value={filters.stddt}
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
                    className="required"
                  />
                )}
              </td>
              <th>근무형태</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="workgb"
                    value={filters.workgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>근무조</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="workcls"
                    value={filters.workcls}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
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
              생성
            </Button>
            <Button
              onClick={onDeleteClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="delete"
            >
              삭제
            </Button>
            <Button
              onClick={onSaveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
            >
              저장
            </Button>
          </ButtonContainer>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="워크캘린더"
        >
          <Grid
            style={{ height: "80vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                workgb: workgbListData.find(
                  (item: any) => item.sub_code == row.workgb
                )?.code_name,
                workcls: workclsListData.find(
                  (item: any) => item.sub_code == row.workcls
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
            <GridColumn
              field="rowstatus"
              title=" "
              width="50px"
              editable={false}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        comboField.includes(item.fieldName)
                          ? CustomComboBoxCell
                          : dateField.includes(item.fieldName)
                          ? CustomDateCell
                          : numberField.includes(item.fieldName)
                          ? CustomNumberCell
                          : radioField.includes(item.fieldName)
                          ? CustomRadioCell
                          : CustomColorCell
                      }
                      footerCell={
                        item.sortOrder == 0 ? mainTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
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

export default HU_A2000W;
