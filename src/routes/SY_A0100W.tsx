import React, { useCallback, useEffect, useState } from "react";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridFooterCellProps,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  TitleContainer,
  ButtonContainer,
} from "../CommonStyled";
import "hammerjs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import {
  chkScrollHandler,
  convertDateToStr,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  UseGetValueFromSessionItem
} from "../components/CommonFunction";
import { IItemData } from "../hooks/interfaces";
import {
  CLIENT_WIDTH,
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
} from "../components/CommonString";
import NumberCell from "../components/Cells/NumberCell";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import TopButtons from "../components/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { TableSelectionChangeEvent } from "@progress/kendo-react-data-tools";
import { Checkbox } from "@progress/kendo-react-inputs";

const App: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        ymdFrdt: setDefaultDate(customOptionData, "ymdFrdt"),
        ymdTodt: setDefaultDate(customOptionData, "ymdTodt"),
        // cboLocation: defaultOption.find(
        //   (item: any) => item.id === "cboLocation"
        // ).valueCode,
        // radFinyn: defaultOption.find((item: any) => item.id === "radFinyn")
        //   .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_QC002,L_PR010,L_fxcode,L_dptcd_001,L_sysUserMaster_001",
    //불량유형, 공정, 설비, 부서코드, 담당자
    setBizComponentData
  );

  //공통코드 리스트 조회
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [prodmacListData, setProdmacListData] = useState([
    { fxfull: "", fxcode: "" },
  ]);
  const [prodempListData, setProdempListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      const prodmacQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_fxcode")
      );
      const prodempQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );

      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(prodmacQueryStr, setProdmacListData);
      fetchQuery(prodempQueryStr, setProdempListData);
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [dataState, setDataState] = useState<State>({
    sort: [],
    group: [
      {
        field: "group_menu_name",
      },
    ],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setDataState({});
    setTabSelected(e.selected);

    if (e.selected === 0) {
      setDataState((prev) => ({
        ...prev,
        group: [
          {
            field: "group_menu_name",
          },
        ],
      }));

      setFilters((prev) => ({
        ...prev,
        ifFetch: true,
        work_type: "ENTRY",
      }));
    } else if (e.selected === 1) {
      setDataState((prev) => ({
        ...prev,
        group: [
          {
            field: "group_menu_name",
          },
        ],
      }));

      setFilters((prev) => ({
        ...prev,
        ifFetch: true,
        work_type: "usage_log",
      }));
    } else if (e.selected === 2) {
      setDataState((prev) => ({
        ...prev,
        group: [
          {
            field: "user_id",
          },
        ],
      }));

      setFilters((prev) => ({
        ...prev,
        ifFetch: true,
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
    ifFetch: true,
    work_type: "ENTRY",
    orgdiv: "01",
    cboLocation: "01",
    yyyymm: new Date(),
  });

  const [dataFilters, setDataFilters] = useState({
    cboViewType: "A",
  });
  const [programFilters, setProgramFilters] = useState({
    is_all_menu: "False",
    user_groupping: "False",
  });

  //조회조건 파라미터
  const dataParameters: Iparameters = {
    procedureName: "web_sel_data_entry_log",
    pageNumber: 0,
    pageSize: 0,
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
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.cboLocation,
      "@p_yyyymm": convertDateToStr(filters.yyyymm),
      "@p_is_all_menu": programFilters.is_all_menu,
      "@p_user_groupping": programFilters.user_groupping,
    },
  };

  //그리드 데이터 조회
  const fetchDataGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", dataParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const useTotalRow = data.tables[1].Rows[0];
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        useTotalRow: useTotalRow,
      }));

      if (totalRowCnt > 0) {
        setMainDataResult(() => {
          return {
            data: [...rows],
            total: totalRowCnt,
          };
        });
      } else {
        resetResultData();
      }
    }
    setLoading(false);
  };

  const fetchProgramGrid = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", programParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const useTotalRow = data.tables[1].Rows[0];
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        useTotalRow: useTotalRow,
      }));

      if (totalRowCnt > 0) {
        setMainDataResult(() => {
          return {
            data: [...rows],
            total: totalRowCnt,
          };
        });
      } else {
        resetResultData();
      }
    }
    setLoading(false);
  };

  const resetResultData = () => {
    setMainDataResult(() => {
      return {
        data: [],
        total: 0,
      };
    });
  };
  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onDataStateChange = (event: GridDataStateChangeEvent) => {
    setDataState(event.dataState);
  };

  const TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
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
  const DateFooterCell = (props: GridFooterCellProps) => {
    const { field = "" } = props;
    let fieldDate = field.replace("use_cnt_", "");
    let dayTotal = 0;
    let useTotal = 0;
    let percentage = 0;

    if (fieldDate !== "tt") {
      fieldDate = Number(fieldDate) < 10 ? "0" + fieldDate : fieldDate;
    }
    mainDataResult.data.forEach((item) => {
      dayTotal = dayTotal + (item[field] ?? 0);
    });

    if (mainDataResult.data.length > 0) {
      const useTotalDataResult = mainDataResult.data[0]["useTotalRow"];

      useTotal =
        (fieldDate && useTotalDataResult ? useTotalDataResult[fieldDate] : 0) ??
        0;

      percentage = (useTotalDataResult["tt"] / useTotal) * 100;
    }

    return (
      <td colSpan={props.colSpan} style={props.style}>
        {dayTotal} <br />
        {useTotal} <br />
        {percentage}
      </td>
    );
  };

  const onExpandChange = (event: any) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;
    setDataState((prev) => ({ ...prev }));
  };

  const onSortChange = (e: any) => {
    setDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.ifFetch === true &&
      customOptionData !== null &&
      permissions !== null
    ) {
      search();
      setFilters((prev) => ({ ...prev, ifFetch: false }));
    }
  }, [filters, permissions]);

  const search = () => {
    if (tabSelected === 0) {
      fetchDataGrid();
    } else {
      fetchProgramGrid();
    }
  };

  const CusomizedGrid = () => {
    return (
      <GridContainer clientWidth={CLIENT_WIDTH} inTab={true}>
        <Grid
          style={{ height: "80vh" }}
          data={process(
            mainDataResult.data.map((row: any) => ({
              ...row,
              proccd: proccdListData.find(
                (item: any) => item.sub_code === row.proccd
              )?.code_name,
              prodmac: prodmacListData.find(
                (item: any) => item.fxcode === row.prodmac
              )?.fxfull,
              prodemp: prodempListData.find(
                (item: any) => item.user_id === row.prodemp
              )?.user_name,
              badpct: Math.round(row.badpct),
            })),
            dataState
          )}
          {...dataState}
          onDataStateChange={onDataStateChange}
          //정렬기능
          sortable={true}
          onSortChange={onSortChange}
          //스크롤 조회 기능
          fixedScroll={true}
          total={mainDataResult.total}
          //onScroll={onScrollHandler}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          //그룹기능
          groupable={true}
          onExpandChange={onExpandChange}
          expandField="expanded"
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
            width="120px"
            footerCell={tabSelected !== 2 ? TotalFooterCell : undefined}
          />
          <GridColumn
            field="menu_name"
            title="프로그램명"
            width="120px"
            footerCell={tabSelected === 2 ? TitleFooterCell : undefined}
          />
          {tabSelected !== 2 && (
            <GridColumn
              field="user_name"
              title="사용자"
              width="120px"
              footerCell={TitleFooterCell}
            />
          )}
          <GridColumn title="일자">{createColumn()}</GridColumn>
          <GridColumn
            field="use_cnt_tt"
            title="합계"
            width="120px"
            footerCell={DateFooterCell}
          />
        </Grid>
      </GridContainer>
    );
  };

  const createColumn = () => {
    const array = [];
    for (var i = 1; i <= 31; i++) {
      array.push(
        <GridColumn
          key={i}
          field={"use_cnt_" + i}
          title={i < 10 ? "0" + i : i + ""}
          width="50px"
          cell={NumberCell}
          footerCell={DateFooterCell}
        />
      );
    }
    return array;
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
      <FilterBoxWrap>
        <FilterBox>
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
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
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
