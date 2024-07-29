import {
  GroupDescriptor,
  GroupResult,
  getter,
  groupBy,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
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
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/HU_B2120W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

var height = 0;
var height2 = 0;

const HU_B2120W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-tabstrip-items-wrapper");
      height2 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height2);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2(getDeviceHeight(true) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, tabSelected, webheight, webheight2]);

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
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

  const [group, setGroup] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [group2, setGroup2] = React.useState(initialGroup);
  const [total2, setTotal2] = useState(0);
  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        dutydt: setDefaultDate(customOptionData, "dutydt"),
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        dutydt: setDefaultDate(customOptionData, "dutydt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);
  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const [collapsedState2, setCollapsedState2] = React.useState<string[]>([]);
  const [resultState2, setResultState2] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001", setBizComponentData);
  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
    }
  }, [bizComponentData]);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
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
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: "",
    dutydt: new Date(),
    prsnnum: "",
    prsnnm: "",
    dptcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q1",
    orgdiv: sessionOrgdiv,
    location: "",
    dutydt: new Date(),
    prsnnum: "",
    prsnnm: "",
    dptcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
    setFilters2((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "근무시간기록부";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "근태별현황";
        _export2.save(optionsGridTwo);
      }
    }
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters2: Iparameters = {
      procedureName: "P_HU_B2120W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dutydt": convertDateToStr(filters.dutydt).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_companyCode": companyCode,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          groupId: row.dptcd + "dptcd",
          group_category_name:
            "부서코드" +
            " : " +
            dptcdListData.find((item: any) => item.dptcd == row.dptcd)?.dptnm,
        };
      });
      const newDataState = processWithGroups(rows, group);
      setTotal(totalRowCnt);
      setResultState(newDataState);
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters2: Iparameters = {
      procedureName: "P_HU_B2120W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dutydt": convertDateToStr(filters.dutydt).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_dptcd": filters.dptcd,
        "@p_companyCode": companyCode,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          groupId: row.dptcd + "dptcd",
          group_category_name:
            "부서코드" +
            " : " +
            dptcdListData.find((item: any) => item.dptcd == row.dptcd)?.dptnm,
        };
      });
      const newDataState = processWithGroups(rows, group2);
      setTotal2(totalRowCnt);
      setResultState2(newDataState);
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
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

  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData, bizComponentData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setFilters2((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  const newData2 = setExpandedState({
    data: resultState2,
    collapsedIds: collapsedState2,
  });

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
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

  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = total2.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total2 == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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

  const onExpandChange2 = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState2, item.groupId]
          : collapsedState2.filter((groupId) => groupId != item.groupId);
        setCollapsedState2(collapsedIds);
      }
    },
    [collapsedState2]
  );

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();
    setPage(initialPageState);
    setFilters((prev: any) => ({
      ...prev,
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
    }));
    setFilters2((prev: any) => ({
      ...prev,
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
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
              <th>근태일자</th>
              <td>
                <DatePicker
                  name="dutydt"
                  value={filters.dutydt}
                  format={"yyyy-MM"}
                  onChange={filterInputChange}
                  placeholder=""
                  calendar={MonthCalendar}
                />
              </td>
              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>사용자 이름</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
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
          title="근무시간기록부"
          disabled={permissions.view ? false : true}
        >
          <GridContainer width="100%">
            <ExcelExport
              data={newData}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName={getMenuName()}
              group={group}
            >
              <Grid
                style={{
                  height: isMobile ? mobileheight : webheight,
                }}
                data={newData.map((item: { items: any[] }) => ({
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
                onSelectionChange={onSelectionChange}
                //페이지네이션
                total={total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
              >
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
        </TabStripTab>
        <TabStripTab
          title="근태별현황"
          disabled={permissions.view ? false : true}
        >
          <GridContainer width="100%">
            <ExcelExport
              data={newData2}
              ref={(exporter) => {
                _export2 = exporter;
              }}
              fileName={getMenuName()}
              group={group2}
            >
              <Grid
                style={{
                  height: isMobile ? mobileheight2 : webheight2,
                }}
                data={newData2.map((item: { items: any[] }) => ({
                  ...item,
                  items: item.items.map((row: any) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                  })),
                }))}
                //스크롤 조회 기능
                fixedScroll={true}
                //그룹기능
                group={group2}
                groupable={true}
                onExpandChange={onExpandChange2}
                expandField="expanded"
                //선택 기능
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange2}
                //페이지네이션
                total={total2}
                skip={page2.skip}
                take={page2.take}
                pageable={true}
                onPageChange={pageChange2}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList2"]
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
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
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

export default HU_B2120W;
