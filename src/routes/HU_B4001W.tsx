import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
  GridContainerWrap,
  FormBox,
  FormBoxWrap,
} from "../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions, TColumn, TGrid } from "../store/types";
import {
  convertDateToStr,
  UseBizComponent,
  UsePermissions,
  UseGetValueFromSessionItem,
  UseCustomOption,
  UseMessages,
  findMessage,
  dateformat2,
  isValidDate,
  getQueryFromBizComponent,
  convertDateToStrWithTime2,
} from "../components/CommonFunction";
import { gridList } from "../store/columns/HU_B4001W_C";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import { SELECTED_FIELD, PAGE_SIZE, COM_CODE_DEFAULT_VALUE } from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import Calendar from "../components/Calendars/Calendar";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import YearDateCell from "../components/Cells/YearDateCell";
import { bytesToBase64 } from "byte-base64";
import CenterCell from "../components/Cells/CenterCell";

const DATA_ITEM_KEY_USE = "num";
const DATA_ITEM_KEY_ADJ = "num";
const NumberField = ["cnt", "qty"];
const DateField = ["startdate"];
const YearDateField = ["yyyymm"];
const CenterField = ["insert_time"];

const HU_B4001W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter_use = getter(DATA_ITEM_KEY_USE);
  const idGetter_adj = getter(DATA_ITEM_KEY_ADJ);
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  let grdUse: any = useRef(null);
  let grdAdj: any = useRef(null);
  let useTargetRowIndex: null | number = null;
  let adjTargetRowIndex: null | number = null;

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      let prsnnum = defaultOption.find(
        (item: any) => item.id === "cboPrsnnum"
      ).valueCode;

      setFilters((prev) => ({
        ...prev,
        cboPrsnnum: prsnnum === "" || prsnnum === undefined ? userId : prsnnum,
        isSearch: true
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_HU092",
    //등록자, 조정구분
    setBizComponentData
  );

  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: ""},
  ]);

  const [adjdivListData, setAdjdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_sysUserMaster_001")
      );
      const adjdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU092")
      );

      fetchQuery(personQueryStr, setPersonListData);
      fetchQuery(adjdivQueryStr, setAdjdivListData);
    };
  });

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

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page1, setPage1] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  const pageChange1 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setUseFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage1({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setAdjFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [useDataState, setUseDataState] = useState<State>({
    sort: [],
  });

  const [adjDataState, setAdjDataState] = useState<State>({
    sort: [],
  });

  // 연차상세
  const [useDataResult, setUseDataResult] = useState<DataResult>(
    process([], useDataState)
  );

  // 연차조정
  const [adjDataResult, setAdjDataResult] = useState<DataResult>(
    process([], adjDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [subSelectedState, setSubSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 리셋
  const resetAllGrid = () => {
    setUseDataResult(process([], useDataState));
    setAdjDataResult(process([], adjDataState));
  };

  // 조회조건
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    ymdFrdt: new Date(),
    cboPrsnnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  // 연차 상세
  const [usefilters, setUseFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    ymdFrdt: new Date(),
    cboPrsnnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  // 연차 조정
  const [adjfilters, setAdjFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    ymdFrdt: new Date(),
    cboPrsnnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  // 사원정보
  const [userInfo, setUserInfo] = useState<{ [name: string]: any }>({
    prsnnum: "",
    prsnnm: "",
    regorgdt: "",
    rtrdt: "",
    totalday: 0,
    usedday: 0,
    ramainday: 0,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4001W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymmdd": convertDateToStr(filters.ymdFrdt),
        "@p_prsnnum": filters.cboPrsnnum,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const row = data.tables[0].Rows[0];

      if (totalRowCnt > 0) {
        setUserInfo({
          prsnnum: row.prsnnum,
          prsnnm: row.prsnnm,
          regorgdt: isValidDate(row.regorgdt)
            ? dateformat2(row.regorgdt)
            : null,
          rtrdt: isValidDate(row.rtrdt) ? dateformat2(row.rtrdt) : null,
          totalday: row.totalday,
          usedday: row.usedday,
          ramainday: row.ramainday,
        });
      } else {
        // 사원정보
        setUserInfo({
          prsnnum: "",
          prsnnm: "",
          regorgdt: "",
          rtrdt: "",
          totalday: 0,
          usedday: 0,
          ramainday: 0,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
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

  // 연차상세 그리드 데이터 조회
  const fetchUseGrid = async (usefilters: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4001W_Q",
      pageNumber: usefilters.pgNum,
      pageSize: usefilters.pgSize,
      parameters: {
        "@p_work_type": "USE",
        "@p_orgdiv": usefilters.orgdiv,
        "@p_yyyymmdd": convertDateToStr(filters.ymdFrdt),
        "@p_prsnnum": filters.cboPrsnnum,
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

      if (usefilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (grdUse.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.reckey === usefilters.find_row_value
          );
          useTargetRowIndex = findRowIndex;
        }
        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage1({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (grdUse.current) {
          useTargetRowIndex = 0;
        }
      }

      setUseDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
        usefilters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.num == usefilters.find_row_value);
          
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY_USE]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY_USE]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    // 필터 isSearch false처리, pgNum 세팅
    setUseFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  // 연차상세 그리드 데이터 조회
  const fetchAdjGrid = async (adjfilters: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4001W_Q",
      pageNumber: adjfilters.pgNum,
      pageSize: adjfilters.pgSize,
      parameters: {
        "@p_work_type": "ADJ",
        "@p_orgdiv": adjfilters.orgdiv,
        "@p_yyyymmdd": convertDateToStr(filters.ymdFrdt),
        "@p_prsnnum": filters.cboPrsnnum,
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

      if (adjfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (grdAdj.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.reckey === adjfilters.find_row_value
          );
          adjTargetRowIndex = findRowIndex;
        }
        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage1({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (grdAdj.current) {
          adjTargetRowIndex = 0;
        }
      }

      setAdjDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
        adjfilters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.reckey == adjfilters.find_row_value);
        if (selectedRow != undefined) {
          setSubSelectedState({ [selectedRow[DATA_ITEM_KEY_ADJ]]: true });
        } else {
          setSubSelectedState({ [rows[0][DATA_ITEM_KEY_ADJ]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    // 필터 isSearch false처리, pgNum 세팅
    setAdjFilters((prev) => ({
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
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      setUseFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      setAdjFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
      fetchUseGrid(deepCopiedFilters);
      fetchAdjGrid(deepCopiedFilters);
    }
  }, [filters]);

  // //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  // useEffect(() => {
  //   if (usefilters.isSearch) {
  //     const _ = require("lodash");
  //     const deepCopiedFilters = _.cloneDeep(usefilters);
  //     setUseFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
  //     fetchUseGrid(deepCopiedFilters);
  //   }
  // }, [usefilters]);

  // //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  // useEffect(() => {
  //   if (adjfilters.isSearch) {
  //     const _ = require("lodash");
  //     const deepCopiedFilters = _.cloneDeep(adjfilters);
  //     setAdjFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
  //     fetchAdjGrid(deepCopiedFilters);
  //   }
  // }, [adjfilters]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (useTargetRowIndex !== null && grdUse.current) {
      grdUse.current.scrollIntoView({ rowIndex: useTargetRowIndex });
      useTargetRowIndex = null;
    }
  }, [useDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (adjTargetRowIndex !== null && grdAdj.current) {
      grdUse.current.scrollIntoView({ rowIndex: adjTargetRowIndex });
      adjTargetRowIndex = null;
    }
  }, [adjDataResult]);

  //그리드 푸터
  const grdTotalFooterCell = (props: GridFooterCellProps) => {
    let dataResult: DataResult = 
      props.field === "yyyymm" 
        ? adjDataResult 
        : props.field === "qty" 
        ? adjDataResult 
        : useDataResult; 
   
    if (props.field === "yyyymm" || props.field === "startdate") {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          총 {dataResult.total}건
        </td>
      );
    }
    else if (props.field === "qty" || props.field === "cnt") {
      let sumqty = 0;
      dataResult.data.forEach((element) => {
        sumqty +=  props.field === "qty" ?  element.qty : element.cnt ;
      });

      return (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {sumqty}
        </td>
      );
    }
    else {
      return <td colSpan={props.colSpan} style={props.style}></td>;
    }
  }

  // 메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY_USE,
    });
    setSelectedState(newSelectedState);
  };

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: subSelectedState,
      dataItemKey: DATA_ITEM_KEY_ADJ,
    });
    setSubSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setUseDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubSortChange = (e: any) => {
    setAdjDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.ymdFrdt) === "") {
        throw findMessage(messagesData, "HU_B4001W_001"); //적용일은 필수 입력 항목입니다.
      }
      if (
        filters.cboPrsnnum === null ||
        filters.cboPrsnnum === "" ||
        filters.cboPrsnnum === undefined
      ) {
        throw findMessage(messagesData, "HU_B4001W_002"); //성명은 필수 입력 항목입니다.
      }
      resetAllGrid();
      setPage1(initialPageState); // 페이지 초기화
      setPage2(initialPageState); // 페이지 초기화

      setFilters((prev: any) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true
      }));
      setUseFilters((prev: any) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true
      }));
      setAdjFilters((prev: any) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true
      }));

    } catch (e) {
      alert(e);
    }
  };
  
  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  return (
    <>
      <TitleContainer>
        <Title style={{ height: "10%" }}>연차사용현황(개인)</Title>
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
        <FilterBox style={{ height: "10%" }}>
          <colgroup>
            <col width="0%" />
            <col width="15%" />
            <col width="0%" />
            <col width="15%" />
            <col width="50%" />
          </colgroup>
          <tbody>
            <tr>
              <th>기준일</th>
              <td>
                <DatePicker
                  name="ymdFrdt"
                  value={filters.ymdFrdt}
                  format="yyyy-MM-dd"
                  onChange={InputChange}
                  className="required"
                  placeholder=""
                  calendar={Calendar}
                />
              </td>
              <th> 성명</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboPrsnnum"
                    value={filters.cboPrsnnum}
                    customOptionData={customOptionData}
                    changeData={ComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                    className="required"
                  />
                )}
              </td>
              <th></th>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <GridContainer>
        <GridTitle>사원정보</GridTitle>
        <FormBoxWrap border={true}>
          <FormBox>
            <tbody>
              <tr>
                <th style={{ textAlign: "center" }}> 사번 </th>
                <th style={{ textAlign: "center" }}> 성명 </th>
                <th style={{ textAlign: "center" }}> 입사일 </th>
                <th style={{ textAlign: "center" }}> 퇴사일 </th>
                <th style={{ textAlign: "center" }}> 발생 </th>
                <th style={{ textAlign: "center" }}> 사용 </th>
                <th style={{ textAlign: "center" }}> 잔여 </th>
              </tr>
              <tr>
                <td>
                  <Input
                    name="prsnnum"
                    type="text"
                    value={userInfo.prsnnum}
                    readOnly={true}
                  />
                </td>
                <td>
                  <Input
                    name="prsnnm"
                    type="text"
                    value={userInfo.prsnnm}
                    readOnly={true}
                  />
                </td>
                <td>
                  <Input
                    name="regorgdt"
                    type="text"
                    value={userInfo.regorgdt}
                    readOnly={true}
                    style={{ textAlign: "center" }}
                  />
                </td>
                <td>
                  <Input
                    name="rtrdt"
                    type="text"
                    value={userInfo.rtrdt}
                    readOnly={true}
                    style={{ textAlign: "center" }}
                  />
                </td>
                <td>
                  <Input
                    name="totalday"
                    type="number"
                    value={userInfo.totalday}
                    readOnly={true}
                    style={{ textAlign: "center" }}
                  />
                </td>
                <td>
                  <Input
                    name="usedday"
                    type="number"
                    value={userInfo.usedday}
                    readOnly={true}
                    style={{ textAlign: "center" }}
                  />
                </td>
                <td>
                  <Input
                    name="ramainday"
                    type="number"
                    value={userInfo.ramainday}
                    readOnly={true}
                    style={{ textAlign: "center" }}
                  />
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
      </GridContainer>

      <GridContainerWrap>
        <GridContainer width={`20%`}>
          <GridTitleContainer>
            <GridTitle style={{ height: "10%" }}>연차상세</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "70vh" }}
            data={process(
              useDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedState[idGetter_use(row)],
              })),
              useDataState
            )}
            {...useDataState}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY_USE}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={useDataResult.total}
            skip={page1.skip}
            take={page1.take}
            pageable={true}
            onPageChange={pageChange1}
            //원하는 행 위치로 스크롤 기능
            ref={grdUse}
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            id="grdUse"
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdUse"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        DateField.includes(item.fieldName)
                          ? DateCell
                          : NumberField.includes(item.fieldName)
                          ? NumberCell
                          : undefined
                      }
                      footerCell={grdTotalFooterCell}
                    />
                  )
              )}
          </Grid>
        </GridContainer>

        <GridContainer width={`80%`}>
          <GridTitleContainer>
            <GridTitle style={{ height: "10%" }}>연차조정</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "70vh" }}
            data={process(
              adjDataResult.data.map((row) => ({
                ...row,
                insert_userid: personListData.find(
                  (items: any) => items.user_id == row.insert_userid
                )?.user_name,
                adjdiv: adjdivListData.find(
                  (items: any) => items.adjdiv = row.adjdiv
                )?.code_name,
                insert_time : convertDateToStrWithTime2(new Date(row.insert_time)),
                [SELECTED_FIELD]: subSelectedState[idGetter_adj(row)],
              })),
              adjDataState
            )}
            {...adjDataState}
            onSelectionChange={onSubSelectionChange}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY_ADJ}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            //스크롤 조회 기능
            fixedScroll={true}
            total={adjDataResult.total}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
            //원하는 행 위치로 스크롤 기능
            ref={grdAdj}
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onSubSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdAdj"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        NumberField.includes(item.fieldName)
                          ? NumberCell
                          : DateField.includes(item.fieldName)
                          ? DateCell
                          : YearDateField.includes(item.fieldName)
                          ? YearDateCell
                          : CenterField.includes(item.fieldName)
                          ? CenterCell
                          : undefined
                      }
                      footerCell={grdTotalFooterCell}
                    />
                  )
              )}
          </Grid>
        </GridContainer>
      </GridContainerWrap>

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

export default HU_B4001W;
