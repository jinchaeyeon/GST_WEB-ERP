import React, { useCallback, useEffect, useRef, useState ,createContext, } from "react";
import * as ReactDOM from "react-dom";
import {
    Grid,
    GridColumn,
    GridEvent,
    GridFooterCellProps,
    GridCellProps,
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
  import { Iparameters, TPermissions,TColumn, TGrid } from "../store/types";
  import {
    chkScrollHandler,
    convertDateToStr,
    UseBizComponent,
    UsePermissions,
    UseGetValueFromSessionItem,
    UseCustomOption,
    UseMessages,
    findMessage,
    dateformat2,
    isValidDate,
  } from "../components/CommonFunction";
  import { gridList } from "../store/columns/HU_B4001W_C";
  import DateCell from "../components/Cells/DateCell";
  import NumberCell from "../components/Cells/NumberCell";
  import ComboBoxCell from "../components/Cells/ComboBoxCell";

  import {
    SELECTED_FIELD,
    PAGE_SIZE,
  } from "../components/CommonString";
  import TopButtons from "../components/Buttons/TopButtons";
  import { useSetRecoilState } from "recoil";
  import { isLoading } from "../store/atoms";
  import Calendar from "../components/Calendars/Calendar";
  import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";

  const DATA_ITEM_KEY_USE = "reckey";  
  const DATA_ITEM_KEY_ADJ = "reckey";  
  const NumberField = ["cnt","qty"];
  const DateField = ["startdate"];  
  const ComboField = ["adjdiv", "insert_userid"];

  const CustomComboBoxCell = (props: GridCellProps) => {    
    const [bizComponentData, setBizComponentData] = useState([]);
    
    // 조정구분, 사용자 
    UseBizComponent("L_HU092,L_sysUserMaster_001", setBizComponentData);  
  
    const field = props.field ?? "";
    const bizComponentIdVal =
      field === "adjdiv" ? "L_HU092" : field === "insert_userid" ? "L_sysUserMaster_001" : "";
  
    const bizComponent = bizComponentData.find(
      (item: any) => item.bizComponentId === bizComponentIdVal
    );
  
    return bizComponent ? (
      <ComboBoxCell
        bizComponent={bizComponent}
        {...props}
      />
    ) : (
      <td></td>
    );
  };

const HU_B4001W: React.FC = () => {
  let grdUse: any = useRef(null);
  let grdAdj: any = useRef(null);

  const setLoading = useSetRecoilState(isLoading);
  const idGetter_use = getter(DATA_ITEM_KEY_USE);
  const idGetter_adj = getter(DATA_ITEM_KEY_ADJ);

  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  // 조회조건
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    orgdiv: "01",
    ymdFrdt: new Date(),
    cboPrsnnum: "",

    find_row_value: "",
    pgNum: 1,
    isSearch: true,

    pgGap: 0,
    scrollDirrection: "down",
    pgSize: PAGE_SIZE,
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

  // 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
  useEffect(() => {
    if (grdUse.current) {
      grdUse.current.scrollIntoView({ rowIndex: 0 });
    }
  }, [useDataResult]);

  useEffect(() => {
    if (grdAdj.current) {
      grdAdj.current.scrollIntoView({ rowIndex: 0 });
    }
  }, [adjDataResult]);

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

  //그리드 리셋
  const resetAllGrid = () => {
    setUseDataResult(process([], useDataState));
    setAdjDataResult(process([], adjDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;

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

    setLoading(true);

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      let totalRowCnt = data.tables[0].TotalRowCount;
      let row = data.tables[0].Rows[0];

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
      }

      //연차상세      
      setUseDataResult((prev) => {
        return {
          data: [...data.tables[1].Rows],
          total: totalRowCnt === -1 ? 0 : totalRowCnt,
        };
      });

      totalRowCnt = data.tables[1].TotalRowCount;
      
      if (totalRowCnt > 0) {
        setSelectedState({ [data.tables[1].Rows[0][DATA_ITEM_KEY_USE]]: true });
      }
      
      // 연차조정    
      setAdjDataResult((prev) => {
        return {
          data: [...data.tables[2].Rows],
          total:
            data.tables[2].TotalRowCount === -1
              ? 0
              : data.tables[2].TotalRowCount,
        };
      });

      totalRowCnt = data.tables[2].TotalRowCount;
      if(totalRowCnt > 0)
      {
        setSelectedState({ [data.tables[2].Rows[0][DATA_ITEM_KEY_ADJ]]: true });
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

  //그리드 푸터
  const grdTotalFooterCell = (props: GridFooterCellProps) => {
    let dataResult;

    if (props.field === "yyyymm" || props.field === "startdate") {
      
      dataResult = props.field === "yyyymm" ? adjDataResult : useDataResult;
      
      return (
        <td colSpan={props.colSpan} style={props.style}>
          총 {dataResult.total}건
        </td>
      );
    }
    else if(props.field === "qty") {
       let sumqty = 0;
      adjDataResult.data.forEach((element) => {
        sumqty += element.qty;
      });

      return (
        <td colSpan={props.colSpan} style={props.style}>
          {sumqty}
        </td>
      );
    }
    else 
    {let sumqty = 0;
        useDataResult.data.forEach((element) => {
          sumqty += element.cnt;
        });
  
        return (
          <td colSpan={props.colSpan} style={props.style}>
            {sumqty}
          </td>
        );

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

  const search = () => {
    try {
      if (convertDateToStr(filters.ymdFrdt) === "") {
        throw findMessage(messagesData, "HU_B4001W_001"); //적용일은 필수 입력 항목입니다.
        return;
      }
      if (
        filters.cboPrsnnum === null ||
        filters.cboPrsnnum === "" ||
        filters.cboPrsnnum === undefined
      ) {
        throw findMessage(messagesData, "HU_B4001W_002"); //성명은 필수 입력 항목입니다.
        return;
      }
      resetAllGrid();
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
                <th style={{textAlign :"center"}}> 사번 </th>
                <th style={{textAlign :"center"}}> 성명 </th>
                <th style={{textAlign :"center"}}> 입사일 </th>
                <th style={{textAlign :"center"}}> 퇴사일 </th>
                <th style={{textAlign :"center"}}> 발생 </th>
                <th style={{textAlign :"center"}}> 사용 </th>
                <th style={{textAlign :"center"}}> 잔여 </th>
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
            //스크롤 조회 기능
            fixedScroll={true}
            total={useDataResult.total}
            onScroll={onMainScrollHandler}
            // //원하는 행 위치로 스크롤 기능
            ref={grdUse}
            //정렬기능
            sortable={true}
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
                [SELECTED_FIELD]: selectedState[idGetter_adj(row)],
              })),
              adjDataState
            )}
            {...adjDataState}
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
            onScroll={onMainScrollHandler}
            //원하는 행 위치로 스크롤 기능
            ref={grdAdj}
            //정렬기능
            sortable={true}
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
                      //  : ComboField.includes(item.fieldName)
                      //  ? CustomComboBoxCell
                       : undefined
                     }
                      footerCell={
                        (item.fieldName === "yyyymm" || item.fieldName === "qty")
                          ? grdTotalFooterCell
                          : undefined
                      }
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