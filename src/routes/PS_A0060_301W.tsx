import { 
  Grid, 
  GridCellProps, 
  GridColumn, 
  GridDataStateChangeEvent, 
  GridFooterCellProps, 
  GridItemChangeEvent, 
  GridPageChangeEvent, 
  GridSelectionChangeEvent, 
  getSelectedState 
} from "@progress/kendo-react-grid";
import { 
  ButtonContainer, 
  FilterBox, 
  GridContainer, 
  GridTitle, 
  GridTitleContainer, 
  Title, 
  TitleContainer 
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { 
  UseBizComponent, 
  UseCustomOption, 
  UseGetValueFromSessionItem, 
  UseMessages, 
  UseParaPc, 
  UsePermissions, 
  convertDateToStr, 
  findMessage, 
  handleKeyPressSearch, 
  setDefaultDate,
  dateformat,
  getGridItemChangedData,
  toDate,
 } from "../components/CommonFunction";
import TopButtons from "../components/Buttons/TopButtons";
import { ExcelExport, ExcelExportColumn } from "@progress/kendo-react-excel-export";
import { useEffect, useRef, useState } from "react";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { gridList } from "../store/columns/PS_A0060_301W_C";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import { useApi } from "../hooks/api";
import { getter } from "@progress/kendo-react-common";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import React from "react";
import DateCell from "../components/Cells/DateCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";

const DATA_ITEM_KEY = "num";
let deletedMainRows: any[] = [];
let temp = 0;
const DateField = ["date"];
const CustomComboField = ["orgdiv", "location"];
let targetRowIndex: null | number = null;

const CustomcomboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 회사구분, 사업장
  UseBizComponent("L_BA001, L_BA002", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "orgdiv" 
      ? "L_BA001" 
    : field === "location" 
      ? "L_BA002"
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

const PS_A0060_301W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        orgdiv: defaultOption.find((item: any) => item.id === "orgdiv")
          .valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
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
      isSearch: true,
    }));

    setPage({
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "holiday",
    orgdiv: "01",
    location: "01",
    resource_type: "holiday",
    yyyymm: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef : any = useRef(null); 

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PS_A0060_301W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_resource_type": filters.resource_type,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
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
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.datnum == filters.find_row_value
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
              : rows.find((row: any) => row.datnum == filters.find_row_value);

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      }
    } else {
      console.log("[에러발생]");
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

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch && 
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
  };

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  
  // 엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };
  
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  
  const search = () => {
    try {
      if (filters.orgdiv == "" ||
          filters.orgdiv == null ||
          filters.orgdiv == undefined
        ) {
          throw findMessage(messagesData, "PS_A0060_301W_002")
        }
      else if (filters.location == "" ||
          filters.location == null ||
          filters.location == undefined
        ) {
          throw findMessage(messagesData, "PS_A0060_301W_003")
        }
      else if (convertDateToStr(filters.yyyymm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "PS_A0060_301W_004")
      }
      else {
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        deletedMainRows = [];
      }
    } catch (e) {
      alert(e);
    }
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) 
      {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      orgdiv: filters.orgdiv,
      location: filters.location,
      date: convertDateToStr(new Date()),
      description: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onRemoveClick = async () => {
    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) =>{
      if (!selectedState[item[DATA_ITEM_KEY]]){
        newData.push(item); //선택된 데이터
        Object2.push(index);
      } else {
        const deletedData = {
          ...item,
          rowstatus: "D",
        };
        Object.push(index);
        deletedMainRows.push(deletedData);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    //newData 생성
    setMainDataResult((prev: { total: number }) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  //저장 파라미터 초기 값
  const [paraDataSaved, setParaDataSaved] = useState({
    workType: "save",
    resource_type: "holiday",
    row_status: "",
    orgdiv: "01",
    datnum: "",
    location: "01",
    code: "",
    type: "",
    date: "",
    apply_date: "",
    description: "",
    id: userId,
    pc: pc,
    form_id: "PS_A0060_301W",
  });

  const para: Iparameters = {
    procedureName: "P_PS_A0060_301W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "save",
      "@p_resource_type": "holiday",
      "@p_row_status": paraDataSaved.row_status,
      "@p_orgdiv": paraDataSaved.orgdiv,
      "@p_datnum": paraDataSaved.datnum,
      "@p_location": paraDataSaved.location,
      "@p_code": paraDataSaved.code,
      "@p_type": paraDataSaved.type,
      "@p_date": paraDataSaved.date,
      "@p_apply_date": paraDataSaved.apply_date,
      "@p_description": paraDataSaved.description,
      "@p_id": paraDataSaved.id,
      "@p_pc": paraDataSaved.pc,
      "@p_form_id": paraDataSaved.form_id,
    },
  };

  type TdataArr = {
    rowstatus: string[];
    orgdiv: string[];
    datnum: string[];
    location: string[];
    code: string[];
    type: string[];
    date: string[];
    apply_date: string[];
    description: string[];
  };

  const onSaveClick = async () => {
    let valid = true;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
    
    try {
      dataItem.map((item: any) => {
        if (
          item.date.substring(0, 4) < "1997" ||
          item.date.substring(6, 8) > "31" ||
          item.date.substring(6, 8) < "01" ||
          item.date.substring(4, 6).length != 2
        ) {
          throw findMessage(messagesData, "PS_A0060_301W_001");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    let dataArr: TdataArr = {
      rowstatus: [],
      orgdiv: [],
      datnum: [],
      location: [],
      code: [],
      type: [],
      date: [],
      apply_date: [],
      description: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        orgdiv = "",
        datnum = "",
        location = "",
        code = "",
        type = "",
        date = "",
        apply_date = "",
        description = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.orgdiv.push(orgdiv);
      dataArr.datnum.push(datnum);
      dataArr.location.push(location);
      dataArr.code.push(code);
      dataArr.type.push(type);
      dataArr.date.push(date);
      dataArr.apply_date.push(apply_date);
      dataArr.description.push(description);
    });

    deletedMainRows.forEach((item: any) => {
      const {
        rowstatus = "",
        orgdiv = "",
        datnum = "",
        location = "",
        code = "",
        type = "",
        date = "",
        apply_date = "",
        description = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.orgdiv.push(orgdiv);
      dataArr.datnum.push(datnum);
      dataArr.location.push(location);
      dataArr.code.push(code);
      dataArr.type.push(type);
      dataArr.date.push(date);
      dataArr.apply_date.push(apply_date);
      dataArr.description.push(description);
    });

    setParaDataSaved((prev) => ({
      ...prev,
      workType: "save",
      resource_type: "holiday",
      row_status: dataArr.rowstatus.join("|"),
      orgdiv: dataArr.orgdiv.join("|"),
      datnum: dataArr.datnum.join("|"),
      location: dataArr.location.join("|"),
      code: dataArr.code.join("|"),
      type: dataArr.type.join("|"),
      date: dataArr.date.join("|"),
      apply_date: dataArr.apply_date.join("|"),
      description: dataArr.description.join("|"),
      id: userId,
      pc: pc,
      form_id: "PS_A0060_301W",
    }));
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
      const isLastDataDeleted =
        mainDataResult.data.length == 0 && filters.pgNum > 0;
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
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraDataSaved != undefined && paraDataSaved.orgdiv != "") {
      fetchTodoGridSaved();
    }
  }, [paraDataSaved])

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev: any) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
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
          total: prev.total
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

  const onSetSaturdayClick = () => {
    // 기준년월의 토요일만 행추가
    let date = toDate(convertDateToStr(filters.yyyymm).substring(0, 6) + "01");
    var tempDate = toDate(convertDateToStr(filters.yyyymm).substring(0, 6) + "01");
    
    while ( (tempDate.getFullYear() == date.getFullYear()) &&
             (tempDate.getMonth() + 1 == date.getMonth() + 1 ))
    {
      if (tempDate.getDay() == 6) {
        mainDataResult.data.map((item) => {
          if (item.num > temp) 
          {
            temp = item.num;
          }
        });

        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          orgdiv: filters.orgdiv,
          location: filters.location,
          date: convertDateToStr(tempDate),
          description: "토요일",
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
        setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true});
      };
      tempDate.setDate(tempDate.getDate() + 1);
    };
  };

  const onSetSundayClick = () => {
    // 기준년월의 일요일만 행추가
    let date = toDate(convertDateToStr(filters.yyyymm).substring(0, 6) + "01");
    var tempDate = toDate(convertDateToStr(filters.yyyymm).substring(0, 6) + "01");
    
    while ( (tempDate.getFullYear() == date.getFullYear()) &&
             (tempDate.getMonth() + 1 == date.getMonth() + 1 ))
    {
      if (tempDate.getDay() == 0) {
        mainDataResult.data.map((item) => {
          if (item.num > temp) 
          {
            temp = item.num;
          }
        });

        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          orgdiv: filters.orgdiv,
          location: filters.location,
          date: convertDateToStr(tempDate),
          description: "일요일",
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
        setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true});
      };
      tempDate.setDate(tempDate.getDate() + 1);
    };
  };

  // 공휴일 API
  const [holidays, setHolidays] = useState([]);
  const storageKey = "__holidays";

  useEffect(() => {
    if (holidays.length == 0) {
      const storageHolidays = localStorage.getItem(storageKey);
      if (storageHolidays) {
        /** localStorage에 저장되어 있다면 그 값을 사용 */
        const newHolidays = JSON.parse(storageHolidays);
        setHolidays(newHolidays);
      } else {
        /** localStorage에 값이 없다면 Google Calendar API 호출 */
        const calendarId =
          "ko.south_korea.official%23holiday%40group.v.calendar.google.com";
        const apiKey = "AIzaSyBiSKNEJO9AafkvjzG7lQ7nCwAA2541tWI";
        const startDate = new Date("2023-01-01").toISOString();
        const endDate = new Date("2070-12-31").toISOString();
        fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&orderBy=startTime&singleEvents=true&timeMin=${startDate}&timeMax=${endDate}`
        ).then((response) => {
          response.json().then((result) => {
            const newHolidays = result.items.map((item: any) =>
              convertDateToStr(new Date(item.start.date))
            );
            setHolidays(newHolidays);
            localStorage.setItem(storageKey, JSON.stringify(newHolidays));
          });
        });
      }
    }
  }, []);

  const onHolidayClick = () => {
    // 기준년월에 해당하는 공휴일만 불러오기
    let tempDate = convertDateToStr(filters.yyyymm).substring(0, 6);
    const holidayList: any[] = [];
    if (holidays.length > 0) 
    {
      // 해당 월의 공휴일만 holidayList push
      holidays.forEach((item: any) => {
        if (item.substring(0,6) == tempDate) {
          holidayList.push(item);
        }
      });
      
      // holidayList의 길이 만큼 행 추가
      holidayList.forEach((item) => {
        mainDataResult.data.map((item) => {
          if (item.num > temp) 
          {
            temp = item.num;
          }
        });
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          orgdiv: filters.orgdiv,
          location: filters.location,
          date: item,
          description: "공휴일",
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
        setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true});
      })
    };
  };

  const minGridWidth = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);
  React.useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      window.addEventListener("resize", handleResize);

      //가장작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"].map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );
      minGridWidth.current += 30;
      setGridCurrent(grid.current.clientWidth);
      setApplyMinWidth(grid.current.clientWidth < minGridWidth.current);
    }
  }, [customOptionData]);

  const handleResize = () => {
    if (grid.current.clientWidth < minGridWidth.current && !applyMinWidth) {
      setApplyMinWidth(true);
    } else if (grid.current.clientWidth > minGridWidth.current) {
      setGridCurrent(grid.current.clientWidth);
      setApplyMinWidth(false);
    }
  };

  const setWidth = (Name: string, minWidth: number | undefined) => {
    if (minWidth == undefined) {
      minWidth = 0;
    }
    if (grid.current && Name == "grdList") {
      let width = applyMinWidth
        ? minWidth
        : minWidth +
          (gridCurrent - minGridWidth.current) /
            customOptionData.menuCustomColumnOptions[Name].length;

      return width;
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>휴일관리</Title>
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
              <th>회사구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="orgdiv"
                    value={filters.orgdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
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
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>휴일 리스트</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onSetSaturdayClick}
                themeColor={"primary"}
                icon="calendar"
              >
                토요일 자동 생성
              </Button>
              <Button
                onClick={onSetSundayClick}
                themeColor={"primary"}
                icon="calendar"
              >
                일요일 자동 생성
              </Button>
              <Button
                onClick={onHolidayClick}
                themeColor={"primary"}
                icon="calendar"
              >
                공휴일 자동 생성
              </Button>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
              <Button
                onClick={onRemoveClick}
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
            style={{ height: "78vh"}}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                date: row.date
                  ? new Date(dateformat(row.date))
                  : new Date(),
                rowstatus:
                  row.rowstatus == null ||
                  row.rowstatus == "" ||
                  row.rowstatus == undefined
                    ? ""
                    : row.rowstatus,
                [SELECTED_FIELD]: selectedState[idGetter(row)], // 선택된 데이터
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
            onSelectionChange={onMainSelectionChange}
            // 스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef}
            rowHeight={30}
            // 정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            // 컬럼순서조정
            reorderable={true}
            // 컬럼너비조정
            resizable={true}
            //incell 수정 기능
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
            id="grdList"
          >
            <GridColumn
              field="rowstatus"
              title=" "
              width="30px"
              editable={false}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
              (item: any, idx: number) => 
                item.sortOrder !== -1 && (
                  <GridColumn
                    key={idx}
                    id={item.id}
                    field={item.fieldName}
                    title={item.caption}
                    width={setWidth("grdList", item.width)}
                    cell={
                      DateField.includes(item.fieldName)
                        ? DateCell
                        : CustomComboField.includes(item.fieldName)
                        ? CustomcomboBoxCell
                        : undefined
                    }
                    footerCell={
                      item.sortOrder === 0
                        ? mainTotalFooterCell
                        : undefined
                    }
                  />
                )
            )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {/* 컨트롤 네임 불러오기 용 */}
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
export default PS_A0060_301W;