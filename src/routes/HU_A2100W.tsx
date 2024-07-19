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
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/HU_A2100W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const requiredField = ["paycd", "workgb", "stddiv", "workdiv"];
const customField = ["paycd", "workgb", "workcls", "stddiv", "workdiv"];
let deletedMainRows: object[] = [];
let targetRowIndex: null | number = null;

type TdataArr = {
  rowstatus_s: string[];
  workgb_s: string[];
  workcls_s: string[];
  stddiv_s: string[];
  workdiv_s: string[];
  apply_start_date_s: string[];
  work_strtime_s: string[];
  work_endtime_s: string[];
  use_yn_s: string[];
  worktime_s: string[];
  paycd_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_HU028, L_HU075,L_HU076,L_HU078,L_HU097",
    //급여지급구분, 근무형태, 근무조, 근무구분, 근태구분
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "paycd"
      ? "L_HU028"
      : field == "workgb"
      ? "L_HU075"
      : field == "workcls"
      ? "L_HU076"
      : field == "stddiv"
      ? "L_HU097"
      : field == "workdiv"
      ? "L_HU078"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};
let temp = 0;

var height = 0;
var height2 = 0;

const HU_A2100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");

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

  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
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
  const [page, setPage] = useState(initialPageState);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        stddiv: defaultOption.find((item: any) => item.id == "stddiv")
          ?.valueCode,
        workcls: defaultOption.find((item: any) => item.id == "workcls")
          ?.valueCode,
        workdiv: defaultOption.find((item: any) => item.id == "workdiv")
          ?.valueCode,
        workgb: defaultOption.find((item: any) => item.id == "workgb")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

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
    work_type: "LIST",
    orgdiv: sessionOrgdiv,
    workgb: "",
    workcls: "",
    stddiv: "",
    workdiv: "",
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
      procedureName: "P_HU_A2100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_workgb": filters.workgb,
        "@p_workcls": filters.workcls,
        "@p_stddiv": filters.stddiv,
        "@p_workdiv": filters.workdiv,
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
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.workgb +
                "-" +
                row.workcls +
                "-" +
                row.stddiv +
                "-" +
                row.workdiv +
                "-" +
                row.paycd ==
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
            : rows.find(
                (row: any) =>
                  row.workgb +
                    "-" +
                    row.workcls +
                    "-" +
                    row.stddiv +
                    "-" +
                    row.workdiv +
                    "-" +
                    row.paycd ==
                  filters.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
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
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

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
      optionsGridOne.sheets[0].title = "요약정보";
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

  const search = () => {
    deletedMainRows = [];
    resetAllGrid();
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
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
      field == "work_strtime" ||
      field == "work_endtime" ||
      (field == "paycd" && dataItem.rowstatus == "N") ||
      (field == "workgb" && dataItem.rowstatus == "N") ||
      (field == "workcls" && dataItem.rowstatus == "N") ||
      (field == "stddiv" && dataItem.rowstatus == "N") ||
      (field == "workdiv" && dataItem.rowstatus == "N")
    ) {
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

  const onSaveClick = () => {
    if (!permissions.save) return;
    let valid = true;
    let valid2 = true;
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (item.paycd == undefined || item.paycd == null || item.paycd == "") {
          valid = false;
        }
        if (
          item.workgb == undefined ||
          item.workgb == null ||
          item.workgb == ""
        ) {
          valid = false;
        }
        if (
          item.stddiv == undefined ||
          item.stddiv == null ||
          item.stddiv == ""
        ) {
          valid = false;
        }
        if (
          item.workdiv == undefined ||
          item.workdiv == null ||
          item.workdiv == ""
        ) {
          valid = false;
        }
        if (item.work_strtime != "") {
          if (
            !isNaN(item.work_strtime) == false ||
            item.work_strtime.length != 4
          ) {
            valid2 = false;
          } else {
            if (
              parseInt(item.work_strtime.substring(0, 2)) > 24 ||
              parseInt(item.work_strtime.substring(0, 2)) < 0
            ) {
              valid2 = false;
            }
            if (
              parseInt(item.work_strtime.substring(2, 4)) > 60 ||
              parseInt(item.work_strtime.substring(2, 4)) < 0
            ) {
              valid2 = false;
            }
          }
        } else if (item.work_endtime != "") {
          if (
            !isNaN(item.work_endtime) == false ||
            item.work_endtime.length != 4
          ) {
            valid2 = false;
          } else {
            if (
              parseInt(item.work_endtime.substring(0, 2)) > 24 ||
              parseInt(item.work_endtime.substring(0, 2)) < 0
            ) {
              valid2 = false;
            }
            if (
              parseInt(item.work_endtime.substring(2, 4)) > 60 ||
              parseInt(item.work_endtime.substring(2, 4)) < 0
            ) {
              valid2 = false;
            }
          }
        }
      });
      let dataArr: TdataArr = {
        rowstatus_s: [],
        workgb_s: [],
        workcls_s: [],
        stddiv_s: [],
        workdiv_s: [],
        apply_start_date_s: [],
        work_strtime_s: [],
        work_endtime_s: [],
        use_yn_s: [],
        worktime_s: [],
        paycd_s: [],
      };
      if (valid2 == true) {
        if (valid == true) {
          if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
          dataItem.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              workgb = "",
              workcls = "",
              stddiv = "",
              workdiv = "",
              apply_start_date = "",
              work_strtime = "",
              work_endtime = "",
              use_yn = "",
              worktime = "",
              paycd = "",
            } = item;
            dataArr.rowstatus_s.push(rowstatus);
            dataArr.workgb_s.push(workgb);
            dataArr.workcls_s.push(workcls);
            dataArr.stddiv_s.push(stddiv);
            dataArr.workdiv_s.push(workdiv);
            dataArr.apply_start_date_s.push(apply_start_date);
            dataArr.work_strtime_s.push(work_strtime);
            dataArr.work_endtime_s.push(work_endtime);
            dataArr.use_yn_s.push(use_yn);
            dataArr.worktime_s.push(worktime);
            dataArr.paycd_s.push(paycd);
          });
          deletedMainRows.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              workgb = "",
              workcls = "",
              stddiv = "",
              workdiv = "",
              apply_start_date = "",
              work_strtime = "",
              work_endtime = "",
              use_yn = "",
              worktime = "",
              paycd = "",
            } = item;
            dataArr.rowstatus_s.push(rowstatus);
            dataArr.workgb_s.push(workgb);
            dataArr.workcls_s.push(workcls);
            dataArr.stddiv_s.push(stddiv);
            dataArr.workdiv_s.push(workdiv);
            dataArr.apply_start_date_s.push(apply_start_date);
            dataArr.work_strtime_s.push(work_strtime);
            dataArr.work_endtime_s.push(work_endtime);
            dataArr.use_yn_s.push(use_yn);
            dataArr.worktime_s.push(worktime);
            dataArr.paycd_s.push(paycd);
          });
          setParaData((prev) => ({
            ...prev,
            rowstatus_s: dataArr.rowstatus_s.join("|"),
            workgb_s: dataArr.workgb_s.join("|"),
            workcls_s: dataArr.workcls_s.join("|"),
            stddiv_s: dataArr.stddiv_s.join("|"),
            workdiv_s: dataArr.workdiv_s.join("|"),
            apply_start_date_s: dataArr.apply_start_date_s.join("|"),
            work_strtime_s: dataArr.work_strtime_s.join("|"),
            work_endtime_s: dataArr.work_endtime_s.join("|"),
            use_yn_s: dataArr.use_yn_s.join("|"),
            worktime_s: dataArr.worktime_s.join("|"),
            paycd_s: dataArr.paycd_s.join("|"),
          }));
        } else {
          alert("필수항목을 채워주세요.");
        }
      } else {
        alert("시간 형식을 맞춰주세요.(ex. 1404 )");
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    rowstatus_s: "",
    workgb_s: "",
    workcls_s: "",
    stddiv_s: "",
    workdiv_s: "",
    apply_start_date_s: "",
    work_strtime_s: "",
    work_endtime_s: "",
    use_yn_s: "",
    worktime_s: "",
    paycd_s: "",
    userid: userId,
    pc: pc,
    form_id: "HU_A2100W",
    company_code: companyCode,
  });

  const para: Iparameters = {
    procedureName: "P_HU_A2100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_workgb_s": ParaData.workgb_s,
      "@p_workcls_s": ParaData.workcls_s,
      "@p_stddiv_s": ParaData.stddiv_s,
      "@p_workdiv_s": ParaData.workdiv_s,
      "@p_userid": userId,
      "@p_apply_start_date_s": ParaData.apply_start_date_s,
      "@p_work_strtime_s": ParaData.work_strtime_s,
      "@p_work_endtime_s": ParaData.work_endtime_s,
      "@p_use_yn_s": ParaData.use_yn_s,
      "@p_worktime_s": ParaData.worktime_s,
      "@p_paycd_s": ParaData.paycd_s,
      "@p_pc": pc,
      "@p_form_id": "HU_A2100W",
      "@p_companycode": ParaData.company_code,
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
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        rowstatus_s: "",
        workgb_s: "",
        workcls_s: "",
        stddiv_s: "",
        workdiv_s: "",
        apply_start_date_s: "",
        work_strtime_s: "",
        work_endtime_s: "",
        use_yn_s: "",
        worktime_s: "",
        paycd_s: "",
        userid: userId,
        pc: pc,
        form_id: "HU_A2100W",
        company_code: companyCode,
      });
      deletedMainRows = [];
      resetAllGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

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
      apply_start_date: "",
      orgdiv: "",
      paycd: "",
      stddiv: "",
      use_yn: "N",
      work_endtime: "",
      work_strtime: "",
      workcls: "",
      workdiv: "",
      workgb: "",
      worktime: 0,
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
              <th>근무형태</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="workgb"
                    value={filters.workgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
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
                  />
                )}
              </td>
              <th>근태구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="stddiv"
                    value={filters.stddiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>근무구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="workdiv"
                    value={filters.workdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      {isMobile ? (
        <GridContainer style={{ width: "100%", overflow: "auto" }}>
          <GridTitleContainer className="ButtonContainer">
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
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
            fileName="근무시간관리"
          >
            <Grid
              style={{ height: mobileheight }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
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
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            customField.includes(item.fieldName)
                              ? CustomComboBoxCell
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
                              : undefined
                          }
                        />
                      )
                  )}
            </Grid>
          </ExcelExport>
        </GridContainer>
      ) : (
        <GridContainer>
          <GridTitleContainer className="ButtonContainer">
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
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
            fileName="근무시간관리"
          >
            <Grid
              style={{ height: webheight }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
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
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            customField.includes(item.fieldName)
                              ? CustomComboBoxCell
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
                              : undefined
                          }
                        />
                      )
                  )}
            </Grid>
          </ExcelExport>
        </GridContainer>
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

export default HU_A2100W;
