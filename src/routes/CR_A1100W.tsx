import React, { useEffect, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { 
  ButtonContainer, 
  FilterBox, 
  GridContainer, 
  GridTitle, 
  GridTitleContainer, 
  Title, 
  TitleContainer 
} from "../CommonStyled";
import { gridList } from "../store/columns/CR_A1100W_C";
import { useApi } from "../hooks/api";
import { 
  DataResult, 
  State,
  getter, 
  process } from "@progress/kendo-data-query";
import { useState } from "react";
import { 
  UseBizComponent, 
  UseCustomOption,
  UseGetValueFromSessionItem, 
  UseMessages, 
  UseParaPc, 
  UsePermissions, 
  convertDateToStr, 
  dateformat, 
  findMessage, 
  getGridItemChangedData, 
  handleKeyPressSearch } from "../components/CommonFunction";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import TopButtons from "../components/Buttons/TopButtons";
import { isLoading } from "../store/atoms";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { 
  Grid, 
  GridCellProps, 
  GridColumn, 
  GridDataStateChangeEvent, 
  GridFooterCellProps, 
  GridItemChangeEvent, 
  GridPageChangeEvent, 
  GridSelectionChangeEvent, 
  getSelectedState 
} from "@progress/kendo-react-grid";
import DateCell from "../components/Cells/DateCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import { CellRender, RowRender } from "../components/Renderers/Renderers";

const DATA_ITEM_KEY = "num";
let deletedMainRows: any[] = [];
let targetRowIndex: null | number = null;
const CustomComboField = ["owner", "manager", "class", "species", "gender"];
const DateField = ["recdt"];
const NumberField = ["age"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 반려인, 담당자, 반, 종, 성별
  UseBizComponent(
    "L_USERS_EX, L_USERS_IN, L_BA310, L_BA320, L_SEXCD",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal = 
    field === "owner"
      ? "L_USERS_EX"
      : field === "manager"
      ? "L_USERS_IN"
      : field === "class"
      ? "L_BA310"
      : field === "species"
      ? "L_BA320"
      : field === "gender"
      ? "L_SEXCD"
      : "";

  const fieldName =
    field === "owner" || field === "manager" || field === "gender"
      ? { valueField: "code", textField: "name"}
      : { valueField: undefined, textField: undefined };
    
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );
  
  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      valueField={fieldName.valueField}
      textField={fieldName.textField}
      {...props}
    />
  ) : (
    <td></td>
  );
};

const CR_A1100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  // 반, 종, 성별
  UseBizComponent(
    "L_BA310, L_BA320, L_SEXCD",
    setBizComponentData
  );

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

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    orgdiv: "01",
    location: "01",
    recdt: new Date(),
    custcd: "",
    custnm: "",
    class: "",
    owner: "",
    species: "",
    manager: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CR_A1100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_recdt": convertDateToStr(filters.recdt),
        "@p_class": filters.class,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_owner": filters.owner,
        "@p_manager": filters.manager,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch(e) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if ( filters.find_row_value !== "" ) {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.membership_id == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        //find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        //첫번째 행으로 스크롤 이동
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
            : rows.find((row: any) => row.num == filters.find_row_value);
        
            if(selectedRow != undefined) {
              setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
            } else {
              setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
            }
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
    if (filters.isSearch && permissions !== null && bizComponentData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData]);

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

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

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
  };
  
  const search = () => {
    try {
      if (filters.orgdiv == "" ||
          filters.orgdiv == null ||
          filters.orgdiv == undefined
      ) {
        throw findMessage(messagesData, "CR_A1100W_001")
      } else if (
        convertDateToStr(filters.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.recdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.recdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.recdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CR_A1100W_002")
      } else {
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        deletedMainRows = [];
      }
    } catch (e) {
      alert(e);
    }
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev: any) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  //저장 파라미터 초기 값
  const [paraDataSaved, setParaDataSaved] = useState({
    workType: "",
    orgdiv: "01",
    location: "01",
    rowstatus: "",
    membership_id: "",
    seq: "",
    custcd: "",
    recdt: "",
    userid: userId,
    pc: pc,
    form_id: "CR_A1100W",
  });

  const onRemoveClick = async () => {
    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(item);
      } else {
        const deletedData = {
          ...item,
          rowstatus: "D",
        };
        Object.push(index);
        deletedMainRows.push(deletedData);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev: { total: number}) => ({
      data: newData,
      total: prev.total-  Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  type TdataArr = {
    rowstatus: string[];
    membership_id: string[];
    seq: string[];
    custcd: string[];
    recdt: string[];
  };

  const onSaveClick = async () => {
    let valid = true;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstauts === "N" || item.rowstauts === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

    try {
      dataItem.map((item: any) => {
        if (
          item.recdt.substring(0, 4) < "1997" ||
          item.recdt.substring(6, 8) > "31" ||
          item.recdt.substring(6, 8) < "01" ||
          item.recdt.substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "CR_A1100W_002");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    let dataArr: TdataArr = {
      rowstatus: [],
      membership_id: [],
      seq: [],
      custcd: [],
      recdt: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        membership_id = "",
        seq = "",
        custcd = "",
        recdt = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.membership_id.push(membership_id);
      dataArr.seq.push(seq);
      dataArr.custcd.push(custcd);
      dataArr.recdt.push(recdt);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        membership_id = "",
        seq = "",
        custcd = "",
        recdt = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.membership_id.push(membership_id);
      dataArr.seq.push(seq);
      dataArr.custcd.push(custcd);
      dataArr.recdt.push(recdt);
    });

    setParaDataSaved((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: "01",
      location: "01",
      rowstatus: dataArr.rowstatus.join("|"),
      membership_id: dataArr.membership_id.join("|"),
      seq: dataArr.seq.join("|"),
      custcd: dataArr.custcd.join("|"),
      recdt: dataArr.recdt.join("|"),
      useid: userId,
      pc: pc,
      form_id: "CR_A1100W",
    }));
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", paraDataSaved);
    } catch (error) {
      data = null;
    }
    
    if (data.isSuccess === true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 0 && filters.pgNum > 0;
      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraDataSaved != undefined && paraDataSaved.recdt != "") {
      fetchTodoGridSaved();
    }
  }, [paraDataSaved])

  const minGridWidth = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);

  React.useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      window.addEventListener("resize", handleResize);

      //가장 작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"].map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );
      minGridWidth.current += 10;
      setGridCurrent(grid.current.offsetWidth);
    }
  }, [customOptionData]);

  const handleResize = () => {
    if (grid.current.offsetWidth < minGridWidth.current && !applyMinWidth) {
      setApplyMinWidth(true);
    } else if (grid.current.offsetWidth > minGridWidth.current) {
      setGridCurrent(grid.current.offsetWidth);
      setApplyMinWidth(false);
    }
  };

  const setWidth = (Name: string, minWidth: number | undefined) => {
    if (minWidth == undefined) {
      minWidth = 0;
    }
    if (grid.current && Name == "grdList") {
      let width = applyMinWidth
        ? minWidth
        : minWidth +
          (gridCurrent - minGridWidth.current) /
            customOptionData.menuCustomColumnOptions[Name].length;

      return width;
    } 
  };

  const enterEdit = (dataItem: any, field: string) => {
    let valid = false;

    if (field == "rowstatus" ||
        field == "custcd" ||
        field == "custnm" ||
        field == "class" ||
        field == "owner" ||
        field == "species" ||
        field == "gender"||
        field == "age" ||
        field == "tel_no" ||
        field == "gubun" ||
        field == "minus" ||
        field == "manager"
    ) {
      valid = true;
    }

    if (valid == false) {
      const newData = mainDataResult.data.map((item: { [x: string]: any}) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
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
      setMainDataResult((prev: { total: any }) => {
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
      const newData = mainDataResult.data.map((item) => 
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
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
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
  
  return (
    <>
      <TitleContainer>
        <Title>출석관리</Title>
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
              <th>회사구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                  name="orgdiv"
                  value={filters.orgdiv}
                  customOptionData={customOptionData}
                  changeData={filterComboBoxChange}
                  className="required"
                />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>출석일자</th>
              <td>
                <DatePicker
                  name="recdt"
                  value={filters.recdt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                />
              </td>
              <th>반</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="class"
                    value={filters.class}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>반려견ID</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
                />
              </td>
              <th>반려견명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>반려인</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="owner"
                    value={filters.owner}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    valueField="code"
                    textField="name"
                  />
                )}
              </td>
              <th>담당자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="query"
                    name="manager"
                    value={filters.manager}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    valueField="code"
                    textField="name"
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
            <GridTitle>출석 리스트</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onRemoveClick}
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
            style={{height: "73vh"}}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                recdt: row.recdt  
                  ? new Date(dateformat(row.recdt))
                  : new Date(),
                rowstatus:
                    row.rowstatus == null ||
                    row.rowstatus == "" ||
                    row.rowstatus == undefined
                      ? ""
                      : row.rowstatus,
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
            //incell 수정 기능
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
            id="grdList"
          >
            <GridColumn
                field="rowstatus"
                title=" "
                width="30px"
                editable={false}
              />
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
                    cell={
                      DateField.includes(item.fieldName)
                        ? DateCell
                        : CustomComboField.includes(item.fieldName)
                        ? CustomComboBoxCell
                        : NumberField.includes(item.fieldName)
                        ? NumberCell
                        : undefined
                    }
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
      {/* 컨트롤 네임 불러오기 용 */}
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
export default CR_A1100W;
