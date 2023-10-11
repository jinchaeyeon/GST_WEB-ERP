import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  getter,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import {
  getSelectedState,
  setExpandedState,
  setGroupIds,
} from "@progress/kendo-react-data-tools";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import "hammerjs";
import React, { useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  handleKeyPressSearch,
  setDefaultDate,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import {
  PAGE_SIZE,
  SELECTED_FIELD
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

let targetRowIndex: null | number = null;
const DATA_ITEM_KEY = "num";

const initialGroup: GroupDescriptor[] = [{ field: "group_menu_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

const App: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [usedUserCnt, setUsedUserCnt] = useState(0);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [group, setGroup] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPageState);
  let gridRef: any = useRef(null);
  const idGetter = getter(DATA_ITEM_KEY);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

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
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev) => ({ ...prev, pgNum: 1 }));
  };
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");
      setDataFilters((prev) => ({
        ...prev,
        cboViewType: defaultOption.find(
          (item: any) => item.id === "cboViewType"
        ).valueCode,
      }));
      setFilters((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).valueCode,
      }));
    }
  }, [customOptionData]);

  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);
  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [tabSelected, setTabSelected] = React.useState(0);

  const handleSelectTab = (e: any) => {
    resetAllGrid();
    setTabSelected(e.selected);

    if (e.selected === 0) {
      setGroup([
        {
          field: "group_menu_name",
        },
      ]);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        work_type: "ENTRY",
      }));
    } else if (e.selected === 1) {
      setGroup([
        {
          field: "group_menu_name",
        },
      ]);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        work_type: "usage_log",
      }));
    } else if (e.selected === 2) {
      setGroup([
        {
          field: "user_id",
        },
      ]);
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        work_type: "usergroup",
      }));
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

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (name === "cboViewType") {
      setDataFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  //조회조건 CheckBox Change 함수 => 체크박스 값을 조회 파라미터로 세팅
  const programFilterChecBoxChange = (e: any) => {
    const { value, name } = e.target;
    setProgramFilters((prev) => ({
      ...prev,
      [name]: value ? "Y" : "N",
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgNum: 1,
    work_type: "ENTRY",
    orgdiv: "01",
    cboLocation: "01",
    yyyymm: new Date(),
    find_row_value: "",
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [dataFilters, setDataFilters] = useState({
    cboViewType: "A",
  });
  const [programFilters, setProgramFilters] = useState({
    is_all_menu: "False",
    user_groupping: "False",
  });

  //그리드 데이터 조회
  const fetchDataGrid = async (
    filters: any,
    dataFilters: any,
    programFilters: any
  ) => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const dataParameters: Iparameters = {
      procedureName: "sys_sel_data_entry_log_web",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyymm": convertDateToStr(filters.yyyymm),
        "@p_menu_group": "",
        "@p_menu_id": "",
        "@p_user_id": userId,
        "@p_viewType": dataFilters.cboViewType,
      },
    };

    const programParameters: Iparameters = {
      procedureName: "P_SY_A0100W_Q2",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyymm": convertDateToStr(filters.yyyymm),
        "@p_is_all_menu": programFilters.is_all_menu,
        "@p_user_groupping": programFilters.user_groupping,
      },
    };

    const userParameters: Iparameters = {
      procedureName: "P_SY_A0100W_Q2",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
        "@p_is_all_menu": programFilters.is_all_menu,
        "@p_user_groupping": programFilters.user_groupping,
      },
    };

    try {
      data = await processApi<any>(
        "procedure",
        tabSelected === 0
          ? dataParameters
          : tabSelected === 1
          ? programParameters
          : userParameters
      );
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const usedUserCnt = data.returnString;
      const useTotalRow = data.tables[1].Rows;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        useTotalRow,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex =
            tabSelected == 0 || tabSelected == 1
              ? rows.findIndex(
                  (row: any) => row.form_id == filters.find_row_value
                )
              : rows.findIndex(
                  (row: any) => row.user_id == filters.find_row_value
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

      // 실사용자수
      if (usedUserCnt !== "") setUsedUserCnt(usedUserCnt);

      const newDataState = processWithGroups(rows, group);
      setTotal(totalRowCnt);
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setResultState(newDataState);

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : tabSelected == 0 || tabSelected == 1
            ? rows.find((row: any) => row.form_id == filters.find_row_value)
            : rows.find((row: any) => row.user_id == filters.find_row_value);

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

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const TotalFooterCell = (props: GridFooterCellProps) => {
    var parts = total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const TitleFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        합계
        <br />
        사용자 계<br />
        사용률(%)
      </td>
    );
  };
  const UsedUserFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        기준사용자 {usedUserCnt}명
      </td>
    );
  };

  const DateFooterCell = (props: GridFooterCellProps) => {
    if (props.field != undefined && newData[0] != undefined) {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          {newData[0].items[0].useTotalRow[0]["tt"]} <br />
          {newData[0].items[0].useTotalRow[1]["tt"]} <br />
          {newData[0].items[0].useTotalRow[2]["tt"]} <br />
        </td>
      );
    } else {
      return <td></td>;
    }
  };

  const onExpandChange = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState, item.groupId]
          : collapsedState.filter((groupId) => groupId != item.groupId);
        setCollapsedState(collapsedIds);
      }
    },
    [collapsedState]
  );

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [resultState]);

  useEffect(() => {
    if (filters.isSearch && permissions !== null && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      const _2 = require("lodash");
      const deepCopiedFilters2 = _2.cloneDeep(dataFilters);

      const _3 = require("lodash");
      const deepCopiedFilters3 = _3.cloneDeep(programFilters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchDataGrid(deepCopiedFilters, deepCopiedFilters2, deepCopiedFilters3);
    }
  }, [filters, permissions, dataFilters, programFilters]);

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const CusomizedGrid = () => {
    return (
      <GridContainer width="100%" inTab={true}>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <Grid
            style={{ height: "75vh" }}
            data={newData.map((item) => ({
              ...item,
              items: item.items.map((row: any) => ({
                ...row,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
            }))}
            //스크롤 조회 기능
            fixedScroll={true}
            //그룹기능
            group={group}
            groupable={true}
            onExpandChange={onExpandChange}
            expandField="expanded"
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onMainSelectionChange}
            //페이지네이션
            total={total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef}
            rowHeight={30}
          >
            {tabSelected === 2 && (
              <GridColumn
                field="user_name"
                title="사용자"
                width="120px"
                footerCell={TotalFooterCell}
              />
            )}
            <GridColumn
              field="form_id"
              title="프로그램ID"
              width="140px"
              footerCell={
                tabSelected !== 2 ? TotalFooterCell : UsedUserFooterCell
              }
            />
            <GridColumn
              field="menu_name"
              title="프로그램명"
              width="140px"
              footerCell={
                tabSelected === 2 ? TitleFooterCell : UsedUserFooterCell
              }
            />
            {tabSelected !== 2 && (
              <GridColumn
                field="user_name"
                title="사용자"
                width="120px"
                footerCell={TitleFooterCell}
              />
            )}
            <GridColumn title="일자">{createDateColumn()}</GridColumn>
            <GridColumn
              field={tabSelected === 0 ? "data_cnt_tt" : "use_cnt_tt"}
              title="합계"
              width="120px"
              footerCell={DateFooterCell}
            />
          </Grid>
        </ExcelExport>
      </GridContainer>
    );
  };

  const createDateColumn = () => {
    const array = [];
    for (var i = 1; i <= 31; i++) {
      const num = i < 10 ? "0" + i : i + "";
      array.push(
        <GridColumn
          key={i}
          field={tabSelected === 0 ? "data_cnt_" + num : "use_cnt_" + num}
          title={num}
          width="70px"
          cell={NumberCell}
          footerCell={gridSumQtyFooterCell}
        />
      );
    }
    return array;
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    const title =
      props.field != undefined
        ? tabSelected == 0
          ? props.field.replace("data_cnt_", "")
          : props.field.replace("use_cnt_", "")
        : "";

    if (props.field != undefined && newData[0] != undefined) {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          {newData[0].items[0].useTotalRow[0][title]} <br />
          {newData[0].items[0].useTotalRow[1][title]} <br />
          {newData[0].items[0].useTotalRow[2][title]} <br />
        </td>
      );
    } else {
      return <td></td>;
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyymm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "SY_A0100W_001");
      } else if (
        filters.cboLocation == "" ||
        filters.cboLocation == null ||
        filters.cboLocation == undefined
      ) {
        throw findMessage(messagesData, "SY_A0100W_002");
      } else if (
        tabSelected == 0 &&
        (dataFilters.cboViewType == "" ||
          dataFilters.cboViewType == null ||
          dataFilters.cboViewType == undefined)
      ) {
        throw findMessage(messagesData, "SY_A0100W_003");
      } else {
        resetAllGrid();
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>데이터등록현황</Title>

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
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
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
                  calendar={MonthCalendar}
                  onChange={filterInputChange}
                  placeholder=""
                  className="required"
                />
              </td>
              {tabSelected === 0 && (
                <>
                  <th>조회타입</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="cboViewType"
                        value={dataFilters.cboViewType}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="name"
                        valueField="code"
                        className="required"
                      />
                    )}
                  </td>
                </>
              )}
              {tabSelected === 1 && (
                <>
                  <th>전체메뉴</th>
                  <td>
                    <Checkbox
                      name="is_all_menu"
                      value={programFilters.is_all_menu === "Y" ? true : false}
                      onChange={programFilterChecBoxChange}
                    />
                  </td>
                  <th>사용자그룹</th>
                  <td>
                    <Checkbox
                      name="user_groupping"
                      value={
                        programFilters.user_groupping === "Y" ? true : false
                      }
                      onChange={programFilterChecBoxChange}
                    />
                  </td>
                </>
              )}
              {tabSelected === 2 && (
                <>
                  <th></th>
                  <td></td>
                  <th></th>
                  <td></td>
                </>
              )}
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="데이터 등록 현황">
          <CusomizedGrid></CusomizedGrid>
        </TabStripTab>
        <TabStripTab title="프로그램 접속 현황">
          <CusomizedGrid></CusomizedGrid>
        </TabStripTab>
        <TabStripTab title="사용자별 프로그램 접속 현황">
          <CusomizedGrid></CusomizedGrid>
        </TabStripTab>
      </TabStrip>
    </>
  );
};

export default App;
