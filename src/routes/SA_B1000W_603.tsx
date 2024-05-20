import Grid from "@mui/material/Grid";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { MultiSelectChangeEvent } from "@progress/kendo-react-dropdowns";
import { MultiSelect } from "@progress/kendo-react-dropdowns/dist/npm/MultiSelect/MultiSelect";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  Grid as GridKendo,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  AdminQuestionBox,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  ScrollableContainerBox,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  dateformat2,
  getBizCom,
  
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/SA_B1000_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";

const SA_B1000W_603: React.FC = () => {
  const [state, setState] = useState("0");
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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_B1000W_603", setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const setLoading = useSetRecoilState(isLoading);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    project: "",
    custcd: "",
    custnm: "",
    status: [],
    smperson: "",
    smpersonnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    ref_key: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters2, setSubFilters2] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    ref_key: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters3, setSubFilters3] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    ref_key: "",
    pgNum: 1,
    isSearch: true,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "smpersonnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        smperson: value == "" ? "" : prev.smperson,
      }));
    } else if (name == "custnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custcd: value == "" ? "" : prev.custcd,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filterMultiSelectChange = (event: MultiSelectChangeEvent) => {
    const values = event.value;
    const name = event.target.props.name ?? "";

    setFilters((prev) => ({
      ...prev,
      [name]: values,
    }));
  };

  function getName(data: { sub_code: string }[]) {
    let str = "";
    data.map((item: { sub_code: string }) => (str += item.sub_code + "|"));
    return data.length > 0 ? str.slice(0, -1) : str;
  }

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const status =
      filters.status.length == 0
        ? "1|2|3|4"
        : filters.status.length == 1
        ? filters.status[0].sub_code
        : getName(filters.status);
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
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_status_s": status,
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
      const rows = data.tables[0].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        setState(rows[0].progress_status);
        setSubFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          ref_key: rows[0].ref_key,
          isSearch: true,
        }));
        setSubFilters2((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          ref_key: rows[0].ref_key,
          isSearch: true,
        }));
        setSubFilters3((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          ref_key: rows[0].ref_key,
          isSearch: true,
        }));
      } else {
        setSubDataResult(process([], subDataState));
        setSubDataResult2(process([], subDataState2));
        setSubDataResult3(process([], subDataState3));
        setState("0");
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
  const fetchSubGrid = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_B1000W_603_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": "COUNSEL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_ref_key": subfilters.ref_key,
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_smperson": "",
        "@p_smpersonnm": "",
        "@p_status_s": "",
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
      const rows = data.tables[0].Rows;

      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters((prev) => ({
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
  const fetchSubGrid2 = async (subfilters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_B1000W_603_Q",
      pageNumber: subfilters2.pgNum,
      pageSize: subfilters2.pgSize,
      parameters: {
        "@p_work_type": "CONSULT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_ref_key": subfilters2.ref_key,
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_smperson": "",
        "@p_smpersonnm": "",
        "@p_status_s": "",
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
      const rows = data.tables[0].Rows;

      setSubDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters2((prev) => ({
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
  const fetchSubGrid3 = async (subfilters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_B1000W_603_Q",
      pageNumber: subfilters3.pgNum,
      pageSize: subfilters3.pgSize,
      parameters: {
        "@p_work_type": "QUOTATION",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_ref_key": subfilters3.ref_key,
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_smperson": "",
        "@p_smpersonnm": "",
        "@p_status_s": "",
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
      const rows = data.tables[0].Rows;

      setSubDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters3((prev) => ({
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
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subfilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters]);

  useEffect(() => {
    if (subfilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters2);
      setSubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subfilters2]);

  useEffect(() => {
    if (subfilters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters3);
      setSubFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid3(deepCopiedFilters);
    }
  }, [subfilters3]);

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  interface ICustData {
    address: string;
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
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SA011_603, L_CM500_603, L_SA001_603, L_sysUserMaster_001,L_CM501_603",
    setBizComponentData
  );
  const [statusListData2, setStatusListData2] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [meditypeListData, setMeditypeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [statusListData, setStatusListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setStatusListData2(getBizCom(bizComponentData, "L_SA011_603"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setMaterialtypeListData(getBizCom(bizComponentData, "L_SA001_603"));
      setMeditypeListData(getBizCom(bizComponentData, "L_CM501_603"));
      setStatusListData(getBizCom(bizComponentData, "L_CM500_603"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [subDataState2, setSubDataState2] = useState<State>({
    sort: [],
  });

  const [subDataState3, setSubDataState3] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [subDataResult2, setSubDataResult2] = useState<DataResult>(
    process([], subDataState2)
  );

  const [subDataResult3, setSubDataResult3] = useState<DataResult>(
    process([], subDataState3)
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
        총
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

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setState(selectedRowData.progress_status);
    setSubFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      ref_key: selectedRowData.ref_key,
      isSearch: true,
    }));
    setSubFilters2((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      ref_key: selectedRowData.ref_key,
      isSearch: true,
    }));
    setSubFilters3((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      ref_key: selectedRowData.ref_key,
      isSearch: true,
    }));
  };

  const search = () => {
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  const onLinkChange = (dataItem: any) => {
    const origin = window.location.origin;
    window.open(
      origin + `/CM_A7000W?go=` + dataItem.orgdiv + "_" + dataItem.meetingnum
    );
  };

  const onLinkChange2 = (dataItem: any) => {
    const origin = window.location.origin;
    window.open(origin + `/CM_A5000W?go=` + dataItem.document_id);
  };

  const onLinkChange3 = (dataItem: any) => {
    const origin = window.location.origin;
    window.open(
      origin +
        `/SA_A1001_603W?go=` +
        dataItem.quokey.split("-")[0] +
        "-" +
        dataItem.quokey.split("-")[1]
    );
  };

  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  interface IPrsnnum {
    user_id: string;
    user_name: string;
  }

  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        smpersonnm: data.user_name,
        smperson: data.user_id,
      };
    });
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
              pathname="SA_B1000W_603"
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
                </tr>
                <tr>
                  <th>상태</th>
                  <td>
                    <MultiSelect
                      name="status"
                      data={statusListData2}
                      onChange={filterMultiSelectChange}
                      value={filters.status}
                      textField="code_name"
                      dataItemKey="sub_code"
                    />
                  </td>
                  <th>영업담당자</th>
                  <td>
                    <Input
                      name="smpersonnm"
                      type="text"
                      value={filters.smpersonnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onPrsnnumWndClick}
                      />
                    </ButtonInInput>
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer width={"100%"}>
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="영업진행관리"
            >
              <GridKendo
                style={{ height: "76.5vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    smperson: userListData.find(
                      (items: any) => items.user_id == row.smperson
                    )?.user_name,
                    materialtype: materialtypeListData.find(
                      (items: any) => items.sub_code == row.materialtype
                    )?.code_name,
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
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
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
              </GridKendo>
            </ExcelExport>
          </GridContainer>
        </GridContainer>
        <GridContainer width={`calc(50% - ${GAP}px)`}>
          <ButtonContainer>
            <Button
              themeColor={"primary"}
              fillMode={state == "1" ? "solid" : "outline"}
              icon="folder"
              style={{ width: "25%", height: "4vh" }}
            >
              문의
            </Button>
            <Button
              themeColor={"primary"}
              icon="folder"
              fillMode={state == "2" ? "solid" : "outline"}
              style={{ width: "25%", height: "4vh" }}
            >
              컨설팅
            </Button>
            <Button
              themeColor={"primary"}
              icon="folder"
              fillMode={state == "3" ? "solid" : "outline"}
              style={{ width: "25%", height: "4vh" }}
            >
              견적
            </Button>
            <Button
              themeColor={"primary"}
              icon="folder"
              fillMode={state == "4" ? "solid" : "outline"}
              style={{ width: "25%", height: "4vh" }}
            >
              계약
            </Button>
          </ButtonContainer>
          <FormBoxWrap border={true}>
            <GridContainer width={"100%"} height="25.4vh">
              <GridTitleContainer>
                <GridTitle>상담</GridTitle>
              </GridTitleContainer>
              <ScrollableContainerBox>
                <div className="scroll-wrapper">
                  <Grid container spacing={2}>
                    {subDataResult.data.map((item, idx) => (
                      <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                        <AdminQuestionBox
                          key={idx}
                          onClick={() => onLinkChange(item)}
                        >
                          <div style={{ display: "flex", marginBottom: "5px" }}>
                            <div
                              style={{
                                backgroundColor: "#2289c3",
                                color: "white",
                                width: "100px",
                                height: "32px",
                                borderRadius: "5px",
                                padding: "5px",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "10px",
                                fontWeight: 700,
                              }}
                            >
                              <p>{dateformat2(item.recdt)}</p>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: 400,
                              }}
                            >
                              <p>
                                {
                                  userListData.find(
                                    (items: any) => items.user_id == item.person
                                  )?.user_name
                                }
                              </p>
                            </div>
                          </div>
                          <div style={{ width: "100%" }}>
                            <p style={{ fontSize: "16px", fontWeight: 500 }}>
                              {item.title}
                            </p>
                          </div>
                        </AdminQuestionBox>
                      </Grid>
                    ))}
                  </Grid>
                </div>
              </ScrollableContainerBox>
            </GridContainer>
          </FormBoxWrap>
          <FormBoxWrap border={true}>
            <GridContainer width={"100%"} height="25.4vh">
              <GridTitleContainer>
                <GridTitle>컨설팅</GridTitle>
              </GridTitleContainer>
              <ScrollableContainerBox>
                <div className="scroll-wrapper">
                  <Grid container spacing={2}>
                    {subDataResult2.data.map((item, idx) => (
                      <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                        <AdminQuestionBox
                          key={idx}
                          onClick={() => onLinkChange2(item)}
                        >
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "#2289c3",
                                color: "white",
                                width: "100px",
                                height: "32px",
                                borderRadius: "5px",
                                padding: "5px",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "10px",
                                fontWeight: 700,
                              }}
                            >
                              <p>
                                {
                                  statusListData.find(
                                    (items: any) =>
                                      items.sub_code == item.require_type
                                  )?.code_name
                                }
                              </p>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <p style={{ fontSize: "14px", fontWeight: 400 }}>
                                {
                                  userListData.find(
                                    (items: any) =>
                                      items.user_id == item.user_id
                                  )?.user_name
                                }
                                /
                                {
                                  meditypeListData.find(
                                    (items: any) =>
                                      items.sub_code == item.medicine_type
                                  )?.code_name
                                }
                              </p>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              fontSize: "14px",
                              fontWeight: 400,
                              width: "100%",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                marginRight: "5px",
                                fontSize: "12px",
                                fontWeight: 400,
                              }}
                            >
                              <p>{dateformat2(item.completion_date)}</p>
                            </div>
                          </div>
                          <div>
                            <p
                              style={{
                                fontSize: "16px",
                                fontWeight: 500,
                                marginRight: "5px",
                              }}
                            >
                              {item.title}
                            </p>
                          </div>
                        </AdminQuestionBox>
                      </Grid>
                    ))}
                  </Grid>
                </div>
              </ScrollableContainerBox>
            </GridContainer>
          </FormBoxWrap>

          <FormBoxWrap border={true}>
            <GridContainer width={"100%"} height="25.4vh">
              <GridTitleContainer>
                <GridTitle>견적</GridTitle>
              </GridTitleContainer>
              <ScrollableContainerBox>
                <Grid container spacing={2}>
                  {subDataResult3.data.map((item, idx) => (
                    <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                      <AdminQuestionBox
                        key={idx}
                        onClick={() => onLinkChange3(item)}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: 400,
                              marginBottom: "5px",
                            }}
                          >
                            {item.itemcd}
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "16px",
                              fontWeight: 600,
                            }}
                          >
                            {item.itemnm}
                          </p>
                        </div>
                      </AdminQuestionBox>
                    </Grid>
                  ))}
                </Grid>
              </ScrollableContainerBox>
            </GridContainer>
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
      {PrsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType="N"
          setData={setPrsnnumData}
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
