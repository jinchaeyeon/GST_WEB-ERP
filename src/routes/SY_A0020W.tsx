import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import YearCalendar from "../components/Calendars/YearCalendar";
import MonthDateCell from "../components/Cells/MonthDateCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import YearDateCell from "../components/Cells/YearDateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat7,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  toDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/SY_A0020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
var height = 0;
let targetRowIndex: null | number = null;
const dateField = ["yyyymm"];
const customField = ["closeyn"];
const requireField = ["closeyn", "yyyymm"];
let deletedMainRows: object[] = [];
let temp = 0;

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("R_YESNO", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "closeyn" ? "R_YESNO" : "";
  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const SY_A0020: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);

  UseMessages(setMessagesData);

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height);
        setWebHeight(getDeviceHeight(true) - height);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_sysUserMaster_001,L_AC061", setBizComponentData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && bizComponentData != null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      const frdt = acntsesListData.find(
        (item: any) =>
          item.sub_code ==
          defaultOption.find((item: any) => item.id == "acntses")?.valueCode
      )?.extra_field1;

      const todt = acntsesListData.find(
        (item: any) =>
          item.sub_code ==
          defaultOption.find((item: any) => item.id == "acntses")?.valueCode
      )?.extra_field2;

      setFilters((prev) => ({
        ...prev,
        pgmdiv: defaultOption.find((item: any) => item.id == "pgmdiv")
          ?.valueCode,
        acntses: defaultOption.find((item: any) => item.id == "acntses")
          ?.valueCode,
        ymgb: defaultOption.find((item: any) => item.id == "ymgb")?.valueCode,
        frdt: frdt == undefined ? new Date() : toDate(frdt),
        todt: todt == undefined ? new Date() : toDate(todt),
        isSearch: true,
      }));
    }
  }, [customOptionData, bizComponentData]);
  const [acntsesListData, setAcntsesListData] = useState([
    { sub_code: "", code_name: "", extra_field1: "", extra_field2: "" },
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setAcntsesListData(getBizCom(bizComponentData, "L_AC061"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);
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

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
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

    if (name == "acntses") {
      const frdt = acntsesListData.find(
        (item: any) => item.sub_code == value
      )?.extra_field1;

      const todt = acntsesListData.find(
        (item: any) => item.sub_code == value
      )?.extra_field2;
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        frdt: frdt == undefined ? new Date() : toDate(frdt),
        todt: todt == undefined ? new Date() : toDate(todt),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("UserID");
  const pc = UseGetValueFromSessionItem("pc");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    frdt: new Date(),
    todt: new Date(),
    pgmdiv: "",
    acntses: "",
    ymgb: "",
    yyyy: new Date(),
    find_row_value: "",
    orgdiv: sessionOrgdiv,
    pgNum: 1,
    isSearch: false,
  });

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0020W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_ymgb": filters.ymgb,
        "@p_acntses": filters.acntses,
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
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.pgmkey == filters.find_row_value
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
            : rows.find((row: any) => row.pgmkey == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
  };
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);
  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "마감자료";
      _export.save(optionsGridOne);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  const search = () => {
    try {
      if (
        filters.pgmdiv == null ||
        filters.pgmdiv == undefined ||
        filters.pgmdiv == ""
      ) {
        throw findMessage(messagesData, "SY_A0020W_001");
      } else if (
        filters.acntses == null ||
        filters.acntses == undefined ||
        filters.acntses == ""
      ) {
        throw findMessage(messagesData, "SY_A0020W_001");
      } else if (
        filters.ymgb == null ||
        filters.ymgb == undefined ||
        filters.ymgb == ""
      ) {
        throw findMessage(messagesData, "SY_A0020W_001");
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
          find_row_value: "",
        }));
      }
    } catch (e) {
      alert(e);
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
    if (field == "closeyn") {
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

  const onAddClick = () => {
    if (
      filters.pgmdiv != "" &&
      filters.pgmdiv != undefined &&
      filters.pgmdiv != null
    ) {
      if (filters.ymgb == "1") {
        mainDataResult.data.map((item) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });

        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          closeyn: "N",
          insert_pc: "",
          insert_time: "",
          insert_userid: "",
          number: 0,
          orgdiv: sessionOrgdiv,
          pgmdiv: filters.pgmdiv,
          pgmkey: "",
          update_pc: "",
          update_time: "",
          update_userid: "",
          ymgb: filters.ymgb,
          yyyymm: convertDateToStr(filters.frdt),
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
      } else {
        for (var i = 1; i <= 12; i++) {
          mainDataResult.data.map((item) => {
            if (item.num > temp) {
              temp = item.num;
            }
          });

          const newDataItem = {
            [DATA_ITEM_KEY]: ++temp,
            closeyn: "N",
            insert_pc: "",
            insert_time: "",
            insert_userid: "",
            number: 0,
            orgdiv: sessionOrgdiv,
            pgmdiv: filters.pgmdiv,
            pgmkey: "",
            update_pc: "",
            update_time: "",
            update_userid: "",
            ymgb: filters.ymgb,
            yyyymm:
              convertDateToStr(filters.frdt).substring(0, 4) +
              (i < 10 ? "0" + i : i) +
              "01",
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
        }
      }
    } else {
      alert("모듈구분은 필수 값 입니다.");
    }
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

  const onSaveClick = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    let valid = true;

    dataItem.map((item) => {
      if (
        item.closeyn == "" ||
        item.closeyn == undefined ||
        item.closeyn == null
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수값을 채워주세요.");
      return false;
    }
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    let dataArr: any = {
      rowstatus_s: [],
      pgmdiv_s: [],
      ymgb_s: [],
      yyyymm_s: [],
      closeyn_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        pgmdiv = "",
        ymgb = "",
        yyyymm = "",
        closeyn = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.pgmdiv_s.push(pgmdiv);
      dataArr.ymgb_s.push(ymgb);
      dataArr.yyyymm_s.push(
        filters.ymgb == "1" ? yyyymm.substring(0, 4) : yyyymm.substring(0, 6)
      );
      dataArr.closeyn_s.push(closeyn);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        pgmdiv = "",
        ymgb = "",
        yyyymm = "",
        closeyn = "",
      } = item;

      dataArr.rowstatus_s.push("D");
      dataArr.pgmdiv_s.push(pgmdiv);
      dataArr.ymgb_s.push(ymgb);
      dataArr.yyyymm_s.push(
        filters.ymgb == "1" ? yyyymm.substring(0, 4) : yyyymm.substring(0, 6)
      );
      dataArr.closeyn_s.push(closeyn);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "DETAIL",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      yyyy: convertDateToStr(filters.frdt).substring(0, 4),
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      pgmdiv_s: dataArr.pgmdiv_s.join("|"),
      ymgb_s: dataArr.ymgb_s.join("|"),
      yyyymm_s: dataArr.yyyymm_s.join("|"),
      closeyn_s: dataArr.closeyn_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    yyyy: "",
    acntses: "",
    rowstatus_s: "",
    pgmdiv_s: "",
    ymgb_s: "",
    yyyymm_s: "",
    closeyn_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_SY_A0020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_yyyy": ParaData.yyyy,
      "@p_acntses": ParaData.acntses,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_pgmdiv_s": ParaData.pgmdiv_s,
      "@p_ymgb_s": ParaData.ymgb_s,
      "@p_yyyymm_s": ParaData.yyyymm_s,
      "@p_closeyn_s": ParaData.closeyn_s,
      "@p_service_id": companyCode,
      "@p_userid": userId,
      "@p_pc": pc,
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
      resetAllGrid();
      deletedMainRows = [];
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        yyyy: "",
        acntses: "",
        rowstatus_s: "",
        pgmdiv_s: "",
        ymgb_s: "",
        yyyymm_s: "",
        closeyn_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType !== "" && permissions.save) fetchTodoGridSaved();
  }, [ParaData, permissions]);

  const onAllchange = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      closeyn: item.closeyn == "Y" ? "N" : "Y",
      rowstatus: item.rowstatus == "N" ? "N" : "U",
    }));

    setMainDataResult((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setTempResult((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onALLSAVE = () => {
    if (!permissions.save) return;

    setParaData({
      workType: "ALL",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      acntses: filters.acntses,
      yyyy: convertDateToStr(filters.frdt).substring(0, 4),
      rowstatus_s: "",
      pgmdiv_s: "",
      ymgb_s: "",
      yyyymm_s: "",
      closeyn_s: "",
    });
  };

  const onSTOCKClick = () => {
    if (!permissions.save) return;

    setParaData({
      workType: "STOCK_N",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      acntses: "",
      yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
      rowstatus_s: "",
      pgmdiv_s: "",
      ymgb_s: "",
      yyyymm_s: "",
      closeyn_s: "",
    });
  };

  const onPRSTOCKClick = () => {
    if (!permissions.save) return;

    setParaData({
      workType: "PRSTOCK_N",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      acntses: "",
      yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
      rowstatus_s: "",
      pgmdiv_s: "",
      ymgb_s: "",
      yyyymm_s: "",
      closeyn_s: "",
    });
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
              <th>모듈구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="pgmdiv"
                    value={filters.pgmdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>회기</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="acntses"
                    value={filters.acntses}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>기간</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  className="readonly"
                  disabled={true}
                />
              </td>
            </tr>
            <tr>
              <th>마감구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="ymgb"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>기준년도</th>
              <td>
                <DatePicker
                  name="yyyy"
                  value={filters.yyyy}
                  format="yyyy"
                  onChange={filterInputChange}
                  placeholder=""
                  calendar={YearCalendar}
                />
              </td>
              <td>
                <Button
                  onClick={onSTOCKClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.save ? false : true}
                >
                  기초재고등록
                </Button>
              </td>
              <td>
                <Button
                  onClick={onPRSTOCKClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.save ? false : true}
                >
                  기초재공등록
                </Button>
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>마감자료</GridTitle>
          <ButtonContainer>
            <Button
              onClick={onALLSAVE}
              fillMode="outline"
              themeColor={"primary"}
              icon="check"
              disabled={permissions.save ? false : true}
            >
              마감일괄등록
            </Button>
            <Button
              onClick={onAllchange}
              fillMode="outline"
              themeColor={"primary"}
              icon="foreground-color"
              disabled={permissions.save ? false : true}
            >
              일괄설정
            </Button>
            <Button
              onClick={onAddClick}
              themeColor={"primary"}
              icon="plus"
              title="행 추가"
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
              title="저장"
              disabled={permissions.save ? false : true}
            ></Button>
          </ButtonContainer>
        </GridTitleContainer>
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
                insert_userid: userListData.find(
                  (item: any) => item.user_id == row.insert_userid
                )?.user_name,
                insert_time:
                  row.insert_time != undefined
                    ? dateformat7(row.insert_time)
                    : "",
                update_userid: userListData.find(
                  (item: any) => item.user_id == row.update_userid
                )?.user_name,
                update_time:
                  row.update_time != undefined
                    ? dateformat7(row.update_time)
                    : "",
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
            onSelectionChange={onMainSelectionChange}
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
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]
                ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                ?.map(
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
                            ? filters.ymgb == "1"
                              ? YearDateCell
                              : MonthDateCell
                            : customField.includes(item.fieldName)
                            ? CustomRadioCell
                            : undefined
                        }
                        headerCell={
                          requireField.includes(item.fieldName)
                            ? RequiredHeader
                            : undefined
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

export default SY_A0020;
