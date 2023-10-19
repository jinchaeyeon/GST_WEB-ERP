import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { gridList } from "../store/columns/SA_B1000_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";

const DATA_ITEM_KEY = "num";

const SA_B1000W_603: React.FC = () => {
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
  const processApi = useApi();
  let gridRef: any = useRef(null);
  const idGetter = getter(DATA_ITEM_KEY);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const pathname: string = window.location.pathname.replace("/", "");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  const setLoading = useSetRecoilState(isLoading);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");
      setFilters((prev) => ({
        ...prev,
        status: defaultOption.find((item: any) => item.id === "status")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    location: "01",
    project: "",
    custcd: "",
    custnm: "",
    user_name: "",
    status: "",
    smperson: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

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
  if (!permissions?.view) return;
  let data: any;
  setLoading(true);

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SA_B1000W_603_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_ref_key": filters.project,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_smperson": filters.smperson,
      "@p_status": filters.status,
      "@p_datnum": "",
      "@p_find_row_value": ""
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
  if (filters.isSearch && permissions !== null) {
    const _ = require("lodash");
    const deepCopiedFilters = _.cloneDeep(filters);
    setFilters((prev) => ({ ...prev, pgNum: 1, find_row_value: "", isSearch: false })); // 한번만 조회되도록
    fetchMainGrid(deepCopiedFilters);
  }
}, [filters]);

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    remark: "",
    remark2: "",
    remark3: "",
  });

  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  // 비즈니스 컴포넌트 조회
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const search = () => {
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true
    }));
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
    let width = applyMinWidth
      ? minWidth
      : minWidth +
        (gridCurrent - minGridWidth.current) /
          customOptionData.menuCustomColumnOptions[Name].length;

    return width;
  };
  return (
    <>
      <TitleContainer>
        <Title>영업진행관리</Title>

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
      <GridContainerWrap>
        <GridContainer width="50%">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>프로젝트번호</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>고객사</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type={"button"}
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>고객</th>
                  <td>
                    <Input
                      name="user_name"
                      type="text"
                      value={filters.user_name}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>진행상태</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="status"
                        value={filters.status}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>SM담당자</th>
                  <td>
                    <Input
                      name="smperson"
                      type="text"
                      value={filters.smperson}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer width={"100%"}>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "74vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    smperson: userListData.find(
                      (items: any) => items.user_id == row.smperson
                    )?.user_name,
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
                id="grdList"
              >
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
        </GridContainer>
        <GridContainer width={`calc(50% - ${GAP}px)`}>
          <ButtonContainer>
            <Button
              themeColor={"primary"}
              icon="folder"
              style={{ width: "25%", height: "9vh" }}
            >
              문의
            </Button>
            <Button
              themeColor={"primary"}
              icon="folder"
              style={{ width: "25%", height: "9vh" }}
            >
              컨설팅
            </Button>
            <Button
              themeColor={"primary"}
              icon="folder"
              style={{ width: "25%", height: "9vh" }}
            >
              견적
            </Button>
            <Button
              themeColor={"primary"}
              icon="folder"
              style={{ width: "25%", height: "9vh" }}
            >
              계약
            </Button>
          </ButtonContainer>
          <FormBoxWrap border={true}>
            <GridTitleContainer>
              <GridTitle>상담</GridTitle>
            </GridTitleContainer>
            <FormBox>
              <TextArea
                value={Information.remark}
                name="remark"
                rows={10}
                style={{
                  backgroundColor: "rgba(34, 137, 195, 0.25)",
                  maxHeight: "20vh",
                }}
              />
            </FormBox>
          </FormBoxWrap>
          <FormBoxWrap border={true}>
            <GridTitleContainer>
              <GridTitle>컨설팅</GridTitle>
            </GridTitleContainer>
            <FormBox>
              <TextArea
                value={Information.remark2}
                name="remark2"
                rows={10}
                style={{
                  backgroundColor: "rgba(34, 137, 195, 0.25)",
                  maxHeight: "20vh",
                }}
              />
            </FormBox>
          </FormBoxWrap>
          <FormBoxWrap border={true}>
            <GridTitleContainer>
              <GridTitle>견적</GridTitle>
            </GridTitleContainer>
            <FormBox>
              <TextArea
                value={Information.remark3}
                name="remark3"
                rows={10}
                style={{
                  backgroundColor: "rgba(34, 137, 195, 0.25)",
                  maxHeight: "20vh",
                }}
              />
            </FormBox>
          </FormBoxWrap>
        </GridContainer>
      </GridContainerWrap>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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

export default SA_B1000W_603;
