import React, { useEffect, useState, useRef } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridItemChangeEvent,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  UseBizComponent,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
  UseCustomOption,
  getGridItemChangedData,
  UseMessages,
} from "../components/CommonFunction";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../store/atoms";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { gridList } from "../store/columns/HU_A2100W_C";
import { Button } from "@progress/kendo-react-buttons";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import ComboBoxCell from "../components/Cells/ComboBoxCell";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const requiredField = ["paycd", "workgb", "stddiv", "workdiv"];
const customField = ["paycd", "workgb", "workcls", "stddiv", "workdiv"];
let deletedMainRows: object[] = [];

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
    field === "paycd"
      ? "L_HU028"
      : field === "workgb"
      ? "L_HU075"
      : field === "workcls"
      ? "L_HU076"
      : field === "stddiv"
      ? "L_HU097"
      : field === "workdiv"
      ? "L_HU078"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const HU_A2100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const pathname: string = window.location.pathname.replace("/", "");

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        stddiv: defaultOption.find((item: any) => item.id === "stddiv")
          .valueCode,
        workcls: defaultOption.find((item: any) => item.id === "workcls")
          .valueCode,
        workdiv: defaultOption.find((item: any) => item.id === "workdiv")
          .valueCode,
        workgb: defaultOption.find((item: any) => item.id === "workgb")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
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
    orgdiv: "01",
    workgb: "",
    workcls: "",
    stddiv: "",
    workdiv: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

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
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));
      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  let gridRef: any = useRef(null);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  const search = () => {
    deletedMainRows = [];
    resetAllGrid();
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
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              [EDIT_FIELD]: field,
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
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onSaveClick = () => {
    let valid = true;
    let valid2 = true;
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
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
          if (dataItem.length === 0 && deletedMainRows.length == 0)
            return false;
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
    orgdiv: "01",
    location: "01",
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
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: "01",
        location: "01",
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
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });

    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));
    setMainDataState({});
  };

  const onAddClick = () => {
    let seq = mainDataResult.total + deletedMainRows.length + 1;

    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
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

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>근무시간관리</Title>

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

      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                fillMode="outline"
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
          <Grid
            style={{ height: "80vh" }}
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
            onScroll={onMainScrollHandler}
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
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        customField.includes(item.fieldName)
                          ? CustomComboBoxCell
                          : // : centerField.includes(item.fieldName)
                            // ? CenterCell
                            undefined
                      }
                      headerCell={
                        requiredField.includes(item.fieldName)
                          ? RequiredHeader
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 0 ? mainTotalFooterCell : undefined
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

export default HU_A2100W;
