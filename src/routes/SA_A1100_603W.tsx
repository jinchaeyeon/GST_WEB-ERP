import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
  } from "react";
  import * as ReactDOM from "react-dom";
  import { Button } from "@progress/kendo-react-buttons";
  import {
    Grid,
    GridColumn,
    GridEvent,
    GridSelectionChangeEvent,
    getSelectedState,
    GridPageChangeEvent,
    GridRowDoubleClickEvent,
  } from "@progress/kendo-react-grid";
  import { DatePicker } from "@progress/kendo-react-dateinputs";
  import { ExcelExport } from "@progress/kendo-react-excel-export";
  import { getter } from "@progress/kendo-react-common";
  import { DataResult, process, State } from "@progress/kendo-data-query";
  import {
    ButtonInInput,
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
  import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
  import {
    chkScrollHandler,
    convertDateToStr,
    UsePermissions,
    UseGetValueFromSessionItem,
    UseCustomOption,
    setDefaultDate,
  } from "../components/CommonFunction";
  import DateCell from "../components/Cells/DateCell";
  import NumberCell from "../components/Cells/NumberCell";
  import { gridList } from "../store/columns/SA_A1100_603W_C";
  
  import {
    SELECTED_FIELD,
    PAGE_SIZE,
  } from "../components/CommonString";
  import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
  import TopButtons from "../components/Buttons/TopButtons";
  import { useSetRecoilState } from "recoil";
  import { isLoading } from "../store/atoms";
  import Calendar from "../components/Calendars/Calendar";
  import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
  import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
  import { bytesToBase64 } from "byte-base64";
  
  const DATA_ITEM_KEY_LIST = "quokey";
  const DateField = ["materialindt", "recdt" ];
  const NumberField = ["wonamt", "taxamt","totamt", "ordamt", "saleamt","collamt","janamt"];
  
  const SA_A1100_603W : React.FC = () => {

    const setLoading = useSetRecoilState(isLoading);
    const idGetter_list = getter(DATA_ITEM_KEY_LIST);
    const processApi = useApi();
    const userId = UseGetValueFromSessionItem("user_id");
    const pathname: string = window.location.pathname.replace("/", "");
    const [permissions, setPermissions] = useState<TPermissions | null>(null);
    
    UsePermissions(setPermissions);
  
    let grdList: any = useRef(null);
    let grdListRowIndex: null | number = null;
  
    let grdDetail: any = useRef(null);
    let grdDetailRowIndex: null | number = null;
    
    let grdComment: any = useRef(null);
    let grdCommentRowIndex: null | number = null;
    
    let grdSale: any = useRef(null);
    let grdSaleRowIndex: null | number = null;
    
    let grdmeet: any = useRef(null);
    let grdmeetRowIndex: null | number = null;

    const initialPageState = { skip: 0, take: PAGE_SIZE };
    const [page, setPage] = useState(initialPageState);
    

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

    // 조회조건
    const [filters, setFilters] = useState<{ [name: string]: any }>({
      orgdiv: "01",
      location: "01",
      quokey: "",
      custcd : "",
      custnm : "", 
      testnum : "",
      finyn : "", 
      
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
  
      pgGap: 0,
      scrollDirrection: "down",
      pgSize: PAGE_SIZE,
    });
  
    //
    const [subFilters, setSubFilters] = useState<{ [name: string]: any }>({
      workType: "",
      quonum :"",
      quorev: 0,
  
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
  
      pgGap: 0,
      scrollDirrection: "down",
      pgSize: PAGE_SIZE,
    });
    
    const [Information, setInformation] = useState<{ [name: string]: any }>({
       project : "",
       paymeth : "",
       materialnm : "",
       totamt :0,
       quorev : 0,
       rev_reason : "", 
       ordamt : 0,
       saleamt : 0,
       collamt : 0,
       janamt : 0,
      });
      
    
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});


    // 요약정보 
    const [grdListDataState, setGrdListDataState] = useState<State>({
      sort: [],
    });  

    const [grdListDataResult, setGrdListDataResult] = useState<DataResult>(
      process([], grdListDataState)
    );      

    const [selectedGrdListState, setSelectedGrdListState] = useState<{
      [id: string]: boolean | number[];
    }>({});
    
    // 상세정보
    const [grdDetailDataState, setGrdDetailDataState] = useState<State>({
        sort: [],
    });  

    const [grdDetailDataResult, setGrdDetailDataResult] = useState<DataResult>(
        process([], grdDetailDataState)
    );      

    const [selectedGrdDetailState, setSelectedGrdDetailState] = useState<{
        [id: string]: boolean | number[];
    }>({});

    // 코멘트
    const [grdCommentDataState, setGrdCommentDataState] = useState<State>({
        sort: [],
    });  

    const [grdCommentDataResult, setGrdCommentDataResult] = useState<DataResult>(
        process([], grdCommentDataState)
    );      

    const [selectedGrdCommentState, setSelectedGrdCommentState] = useState<{
        [id: string]: boolean | number[];
    }>({});


   // 거래내역
   const [grdSaleDataState, setGrdSaleDataState] = useState<State>({
    sort: [],
    });  

    const [grdSaleDataResult, setGrdSaleDataResult] = useState<DataResult>(
        process([], grdSaleDataState)
    );      

    const [selectedGrdSaleState, setSelectedGrdSaleState] = useState<{
        [id: string]: boolean | number[];
    }>({});

   // 회의록
   const [grdMeetDataState, setGrdMeetDataState] = useState<State>({
    sort: [],
    });  

    const [grdMeetDataResult, setGrdMeetDataResult] = useState<DataResult>(
        process([], grdMeetDataState)
    );     

    const [selectedGrdMeetState, setSelectedGrdMeetState] = useState<{
        [id: string]: boolean | number[];
    }>({});


    const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false); 
    
    const onCustWndClick = () => {
        setCustWindowVisible(true);
      };
    
     const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
        const selectedRowData = event.dataItem;
        setSelectedState({ [selectedRowData[DATA_ITEM_KEY_LIST]]: true });
        setGrdDetailDataResult(process([], grdDetailDataState));
        setGrdCommentDataResult(process([], grdCommentDataState));
        setGrdSaleDataResult(process([], grdSaleDataState));
        setGrdMeetDataResult(process([], grdMeetDataState));
       
        setSubFilters((prev) => ({
          ...prev,
          workType : "DETAIL",
          quonum: selectedRowData.quonum,
          quorev: selectedRowData.quorev,

          pgNum: 1,
          isSearch: true,
        }));

        setTabSelected(1);
      };

    //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
    const InputChange = (e: any) => {
      const { value, name } = e.target;
  
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    //커스텀 옵션 조회
    const [customOptionData, setCustomOptionData] = React.useState<any>(null);
    UseCustomOption(pathname, setCustomOptionData);
  
    //customOptionData 조회 후 디폴트 값 세팅
    useEffect(() => {
      if (customOptionData !== null) {
        const defaultOption = customOptionData.menuCustomDefaultOptions.query;

        setFilters((prev) => ({
          ...prev,
        }));
      }
    }, [customOptionData]);
  
    //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
    useEffect(() => {
      if (filters.isSearch) {
        const _ = require("lodash");
        const deepCopiedFilters = _.cloneDeep(filters);
        setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
        fetchMainGrid(deepCopiedFilters);
      }
    }, [filters]);

   //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
   useEffect(() => {   
    if (subFilters.isSearch && permissions !== null) {        
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters);
      
      setSubFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록     
      fetchSubGrid(deepCopiedFilters);
    }    
   }, [subFilters, permissions]);

  
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    useEffect(() => {
      if (grdListRowIndex !== null && grdList.current) {
        grdList.current.scrollIntoView({ rowIndex: grdListRowIndex });
        grdListRowIndex = null;
      }
    }, [grdListDataResult]);
  
    //그리드 리셋
    const resetAllGrid = () => {

      setGrdListDataResult(process([], grdListDataState));
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));    
    };
  
    //그리드 데이터 조회
    const fetchMainGrid = async (filters: any) => {
      let data: any;
  
      setLoading(true);
  
      //조회프로시저  파라미터
      const parameters: Iparameters = {
        procedureName: "P_SA_A1100_603W_Q",
        pageNumber: filters.pgNum,
        pageSize: filters.pgSize,
        parameters: {
          "@p_work_type": "LIST",
          "@p_orgdiv": filters.orgdiv,
          "@p_location": filters.location,
          "@p_quokey": filters.quokey,
          "@p_custcd": filters.custcd,
          "@p_custnm": filters.custnm,
          "@p_testnum": filters.testnum,
          "@p_finyn": filters.finyn,
          "@p_quonum": "",
          "@p_quorev": 0,
          "@p_quoseq": 0,
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
  
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (grdList.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.itemcd === filters.find_row_value
            );
            grdListRowIndex = findRowIndex;
          }
          // find_row_value 데이터가 존재하는 페이지로 설정
          setPage({
            skip: PAGE_SIZE * (data.pageNumber - 1),
            take: PAGE_SIZE,
          });
        } else {
          // 첫번째 행으로 스크롤 이동
          if (grdList.current) {
            grdListRowIndex = 0;
          }
        }
  
        setGrdListDataResult((prev) => {
          return {
            data: [...data.tables[0].Rows],
            total: totalRowCnt === -1 ? 0 : totalRowCnt,
          };
        });
  
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find((row: any) => row.quokey == filters.find_row_value);
  
          if (selectedRow != undefined) {
            setSelectedGrdListState({ [selectedRow[DATA_ITEM_KEY_LIST]]: true });         

          } else {
            setSelectedGrdListState({ [rows[0][DATA_ITEM_KEY_LIST]]: true });
          }
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
  
    //그리드 데이터 조회
    const fetchSubGrid = async (subFilters: any) => {
      let data: any;  
      setLoading(true);

    //조회프로시저  파라미터
     const parameters1: Iparameters = {
    procedureName: "P_SA_A1100_603W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
                    "@p_work_type": "DETAIL",
                    "@p_orgdiv": filters.orgdiv,
                    "@p_location": filters.location,
                    "@p_quokey": "",
                    "@p_custcd": "",
                    "@p_custnm": "",
                    "@p_testnum": "",
                    "@p_finyn": "",
                    "@p_quonum": subFilters.quonum,
                    "@p_quorev": subFilters.quorev,
                    "@p_quoseq": 0,
                    "@p_find_row_value": subFilters.find_row_value,
                },
     };
      try {
        data = await processApi<any>("procedure", parameters1);
      } catch (error) {
        data = null;
      }
      
      if (data.isSuccess === true) {  
        if(data.tables[0].Row > 0)
        {
            setInformation({
                            project : data.tables[0].Rows[0].project,
                            paymeth : data.tables[0].Rows[0].paymeth,
                            materialnm : data.tables[0].Rows[0].materialnm,
                            totamt : data.tables[0].Rows[0].totamt,
                            quorev : data.tables[0].Rows[0].quorev,
                            rev_reason : data.tables[0].Rows[0].rev_reason,
                        });
        }

        setGrdDetailDataResult((prev) => {
            return {
                    data: [...data.tables[1].Rows],
                    total: data.tables[1].TotalRowCount === -1 ? 0 : data.tables[1].TotalRowCount,
                };
            });
       
      }else {
        console.log("[오류 발생]");
        console.log(data);
        alert("[" + data.statusCode + "] " + data.resultMessage);
      }

         //조회프로시저  파라미터
         const parameters2: Iparameters = {
        procedureName: "P_SA_A1100_603W_Q",
        pageNumber: filters.pgNum,
        pageSize: filters.pgSize,
        parameters: {
                        "@p_work_type": "COMMENT",
                        "@p_orgdiv": filters.orgdiv,
                        "@p_location": filters.location,
                        "@p_quokey": "",
                        "@p_custcd": "",
                        "@p_custnm": "",
                        "@p_testnum": "",
                        "@p_finyn": "",
                        "@p_quonum": subFilters.quonum,
                        "@p_quorev": subFilters.quorev,
                        "@p_quoseq": 0,
                        "@p_find_row_value": subFilters.find_row_value,
                    },
         };
          try {
            data = await processApi<any>("procedure", parameters2);
          } catch (error) {
            data = null;
          }
          
          if (data.isSuccess === true) {  
    
            setGrdCommentDataResult((prev) => {
                return {
                        data: [...data.tables[0].Rows],
                        total: data.tables[0].TotalRowCount === -1 ? 0 : data.tables[0].TotalRowCount,
                    };
                  });
            
          }else {
            console.log("[오류 발생]");
            console.log(data);
            alert("[" + data.statusCode + "] " + data.resultMessage);
          }

    //조회프로시저  파라미터
     const parameters3: Iparameters = {
    procedureName: "P_SA_A1100_603W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
                    "@p_work_type": "SALE",
                    "@p_orgdiv": filters.orgdiv,
                    "@p_location": filters.location,
                    "@p_quokey": "",
                    "@p_custcd": "",
                    "@p_custnm": "",
                    "@p_testnum": "",
                    "@p_finyn": "",
                    "@p_quonum": subFilters.quonum,
                    "@p_quorev": subFilters.quorev,
                    "@p_quoseq": 0,
                    "@p_find_row_value": subFilters.find_row_value,
                },
     };
      try {
        data = await processApi<any>("procedure", parameters3);
      } catch (error) {
        data = null;
      }
      
      if (data.isSuccess === true) {  

        if(data.tables[0].Row > 0)
        {
            setInformation({
                            ordamt : data.tables[0].Rows[0].ordamt,
                            saleamt : data.tables[0].Rows[0].saleamt,
                            collamt :data.tables[0].Rows[0].collamt,
                            janamt : data.tables[0].Rows[0].janamt,
                        });
        }

        setGrdSaleDataResult((prev) => {
            return {
                    data: [...data.tables[1].Rows],
                    total: data.tables[1].TotalRowCount === -1 ? 0 : data.tables[1].TotalRowCount,
              };
          });
        
      }else {
        console.log("[오류 발생]");
        console.log(data);
        alert("[" + data.statusCode + "] " + data.resultMessage);
      }
//조회프로시저  파라미터
const parameters4: Iparameters = {
    procedureName: "P_SA_A1100_603W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
                    "@p_work_type": "MEETING",
                    "@p_orgdiv": filters.orgdiv,
                    "@p_location": filters.location,
                    "@p_quokey": "",
                    "@p_custcd": "",
                    "@p_custnm": "",
                    "@p_testnum": "",
                    "@p_finyn": "",
                    "@p_quonum": subFilters.quonum,
                    "@p_quorev": subFilters.quorev,
                    "@p_quoseq": 0,
                    "@p_find_row_value": subFilters.find_row_value,
                },
     };
      try {
        data = await processApi<any>("procedure", parameters4);
      } catch (error) {
        data = null;
      }
      
      if (data.isSuccess === true) {  

        setGrdMeetDataResult((prev) => {
            return {
                    data: [...data.tables[0].Rows],
                    total: data.tables[0].TotalRowCount === -1 ? 0 : data.tables[0].TotalRowCount,
              };
          });        
      }else {
        console.log("[오류 발생]");
        console.log(data);
        alert("[" + data.statusCode + "] " + data.resultMessage);
      }      

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
  
    // 요약정보 페이지 변경 
    const grdListPageChange = (event: GridPageChangeEvent) => {
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
  
    //메인 그리드 선택 이벤트 => 디테일 그리드 조회
    const onSelectionChange = (event: GridSelectionChangeEvent) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedGrdListState,
        dataItemKey: DATA_ITEM_KEY_LIST,
      });
        
      setGrdListDataState(newSelectedState);

      const selectedIdx = event.startRowIndex;
      const selectedRowData = event.dataItems[selectedIdx];
      setPage(initialPageState);
  
    //   setSubFilters((prev) => ({
    //     ...prev,
    //     quonum: selectedRowData.quonum,
    //     quorev: selectedRowData.quorev,
    //     pgNum: 1,
    //     isSearch: true,
    //   }));
  
    };
  
    const [tabSelected, setTabSelected] = React.useState(0);
    const handleSelectTab = (e: any) => {
      setTabSelected(e.selected);
    };
  
    const search = () => {
      try {
        resetAllGrid();
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
          <Title style={{ height: "10%" }}>계약관리</Title>
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
            <tbody>
              <tr>
                <th>견적번호</th>
                <td>
                  <Input
                    name="quoekey"
                    type="text"
                    value={filters.quoekey}
                    onChange={InputChange}
                  />
                </td>
                <th> 고객사</th>
                <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={InputChange}
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
                <th>시험번호</th>
                <td>
                  <Input
                    name="testnum"
                    type="text"
                    value={filters.testnum}
                    onChange={InputChange}
                  />
                </td>
                <th>진행상태</th>
                <td></td>
              </tr>
            </tbody>
          </FilterBox>
        </FilterContainer>

        <GridContainer
          style={{
            height: "40vh",
          }}
        >
          <TabStrip
            selected={tabSelected}
            onSelect={handleSelectTab}
            style={{ width: "100%" }}
          >
            <TabStripTab title="요약정보">
              <GridContainerWrap>
                <GridContainer>
                  <Grid
                    style={{ height: "77vh" }}
                    data={process(
                      grdListDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]:
                          selectedGrdListState[idGetter_list(row)],
                      })),
                      grdListDataState
                    )}
                    {...grdListDataState}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY_LIST}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange}
                    onRowDoubleClick={onRowDoubleClick}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={grdListDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={grdListPageChange}
                    onScroll={onMainScrollHandler}
                    // //원하는 행 위치로 스크롤 기능
                    ref={grdList}
                    //정렬기능
                    sortable={true}
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
                              width={item.width}
                              cell={
                                DateField.includes(item.fieldName)
                                  ? DateCell
                                  : NumberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              //footerCell={grdTotalFooterCell}
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>
              </GridContainerWrap>
            </TabStripTab>
           
            <TabStripTab title="상세정보">
              <GridContainerWrap>
                        
                <GridContainer width={"33%"}>
                  <GridTitle>계약내용</GridTitle>
                  <FormBoxWrap border={true}>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th style={{ textAlign: "right" }}>계약명 </th>
                          <td>
                            <Input
                              name="prsnnum"
                              type="text"
                              value={Information.project}
                              readOnly={true}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th style={{ textAlign: "right" }}> 지급조건 </th>
                          <td>
                            <Input
                              name="prsnnum"
                              type="text"
                              value={Information.paymeth}
                              readOnly={true}
                            />
                          </td>
                        </tr>

                        <tr>
                          <th style={{ textAlign: "right" }}> 시험물질명 </th>
                          <td>
                            <Input
                              name="prsnnum"
                              type="text"
                              value={Information.materialnm}
                              readOnly={true}
                            />
                          </td>
                        </tr>

                        <tr>
                          <th style={{ textAlign: "right" }}> 합계금액 </th>
                          <td>
                            <Input
                              name="prsnnum"
                              type="text"
                              value={Information.totamt}
                              readOnly={true}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <GridContainer>
                    <GridTitle>시험리스트</GridTitle>
                    <Grid
                     style={{ height: "52vh" }}
                    data={process(
                      grdDetailDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]:
                          selectedGrdDetailState[idGetter_list(row)],
                      })),
                      grdDetailDataState
                    )}
                    {...grdDetailDataState}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY_LIST}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    // onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={grdDetailDataResult.total}
                    // skip={page.skip}
                    // take={page.take}
                    // pageable={true}
                    // onPageChange={grdDetailPageChange}
                    onScroll={onMainScrollHandler}
                    // //원하는 행 위치로 스크롤 기능
                    ref={grdDetail}
                    //정렬기능
                    sortable={true}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    id="grdDetail"
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdDetail"].map(
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
                              //footerCell={grdTotalFooterCell}
                            />
                          )
                      )}
                  </Grid>
                  </GridContainer>
                </GridContainer>
                <GridContainer width={"33%"}>
                <GridContainer>
                <GridTitle>계약에 대한 코멘트</GridTitle>
                <Grid
                     style={{ height: "30vh" }}
                    data={process(
                      grdCommentDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]:
                          selectedGrdCommentState[idGetter_list(row)],
                      })),
                      grdCommentDataState
                    )}
                    {...grdCommentDataState}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY_LIST}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    // onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={grdCommentDataResult.total}
                    // skip={page.skip}
                    // take={page.take}
                    // pageable={true}
                    // onPageChange={grdDetailPageChange}
                    onScroll={onMainScrollHandler}
                    // //원하는 행 위치로 스크롤 기능
                    ref={grdComment}
                    //정렬기능
                    sortable={true}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    id="grdComment"
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdComment"].map(
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
                                  : undefined
                              }
                              //footerCell={grdTotalFooterCell}
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>
                <GridContainer>
                    <GridTitle>기존거래내역</GridTitle>
                    <FormBoxWrap border={true}>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th style={{ textAlign: "center" }}>거래금액</th>
                          <th style={{ textAlign: "center" }}>수금금액</th>
                          <th style={{ textAlign: "center" }}>수주금액</th>
                          <th style={{ textAlign: "center" }}>미수잔액</th>
                          </tr> 
                          <tr>
                          <td>
                            <Input
                              name="saleamt"
                              type="text"
                              value={Information.saleamt}
                              readOnly={true}
                            />
                           </td>
                           <td>
                            <Input
                              name="collamt"
                              type="text"
                              value={Information.collamt}
                              readOnly={true}
                            />
                           </td>
                           <td>
                            <Input
                              name="ordamt"
                              type="text"
                              value={Information.ordamt}
                              readOnly={true}
                            />
                           </td>
                           <td>
                            <Input
                              name="janamt"
                              type="text"
                              value={Information.janamt}
                              readOnly={true}
                            />
                           </td>                           
                           </tr>      
                          
                                        
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <Grid
                     style={{ height: "32vh" }}
                    data={process(
                      grdSaleDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]:
                          selectedGrdSaleState[idGetter_list(row)],
                      })),
                      grdSaleDataState
                    )}
                    {...grdSaleDataState}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY_LIST}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    // onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={grdSaleDataResult.total}
                    // skip={page.skip}
                    // take={page.take}
                    // pageable={true}
                    // onPageChange={grdDetailPageChange}
                    onScroll={onMainScrollHandler}
                    // //원하는 행 위치로 스크롤 기능
                    ref={grdSale}
                    //정렬기능
                    sortable={true}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    id="grdSale"
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdSale"].map(
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
                              //footerCell={grdTotalFooterCell}
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>
                </GridContainer>
                <GridContainer width={"33%"}>
                <GridTitle>회의록 리스트</GridTitle>
                <Grid
                     style={{ height: "75vh" }}
                    data={process(
                      grdMeetDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]:
                          selectedGrdMeetState[idGetter_list(row)],
                      })),
                      grdMeetDataState
                    )}
                    {...grdMeetDataState}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY_LIST}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    // onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={grdMeetDataResult.total}
                    // skip={page.skip}
                    // take={page.take}
                    // pageable={true}
                    // onPageChange={grdDetailPageChange}
                    onScroll={onMainScrollHandler}
                    // //원하는 행 위치로 스크롤 기능
                    ref={grdmeet}
                    //정렬기능
                    sortable={true}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    id="grdmeet"
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdmeet"].map(
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
                                  : undefined
                              }
                              //footerCell={grdTotalFooterCell}
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>              
              
              </GridContainerWrap>
            </TabStripTab>
          </TabStrip>
          {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
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
  
  export default SA_A1100_603W;
  