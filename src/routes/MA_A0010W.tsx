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
  GridItemChangeEvent,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { DataResult, process, State } from "@progress/kendo-data-query";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import ExcelUploadButtons from "../components/Buttons/ExcelUploadButton";
import {
  chkScrollHandler,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  UseGetValueFromSessionItem,
  UseParaPc,
  UseCustomOption,
} from "../components/CommonFunction";
import NumberCell from "../components/Cells/NumberCell";
import { SELECTED_FIELD, EDIT_FIELD } from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/MA_A0010W_C";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";

type TdataArr = {
  row_status_s: string[];
  sub_code_s: string[];
  code_name_s: string[];
  use_yn_s: string[];
  sort_seq_s: string[];
  extra_field6_s: string[];
  numref1_s: string[];
  memo_s: string[];
};

const DATA_ITEM_KEY = "num";
const numberField = ["numref1"];
const checkboxField = ["use_yn"];
const requiredfield = ["sub_code"];
let temp = 0;
let deletedMainRows: object[] = [];
const MA_A0010W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
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
      }));
    }
  }, [customOptionData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: 25,
    sub_code: "",
    code_name: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_MA_A0010W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_sub_code": filters.sub_code,
      "@p_code_name": filters.code_name,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
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
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchMainGrid();
    }
  }, [filters, permissions]);

  let gridRef: any = useRef(null);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
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
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
    if (chkScrollHandler(event, pgNumWithGap, 25)) {
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
    if (chkScrollHandler(event, pgNumWithGap, 25, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    deletedMainRows = [];
    resetAllGrid();
  };

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
    mainDataResult.data.map((item) => {
      if(item.num > temp){
        temp = item.num
      }
  })
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      code_name: "",
      extra_field6: "",
      numref1: 0,
      sort_seq: 0,
      sub_code: "",
      use_yn: "Y",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
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
    if (field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
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

  const [ParaData, setParaData] = useState({
    pgSize: 25,
    row_status_s: "",
    sub_code_s: "",
    code_name_s: "",
    use_yn_s: "",
    sort_seq_s: "",
    extra_field6_s: "",
    numref1_s: "",
    memo_s: "",
  });

  //조회조건 파라미터
  const para: Iparameters = {
    procedureName: "P_MA_A0010W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "N",
      "@p_row_status_s": ParaData.row_status_s,
      "@p_sub_code_s": ParaData.sub_code_s,
      "@p_code_name_s": ParaData.code_name_s,
      "@p_use_yn_s": ParaData.use_yn_s,
      "@p_sort_seq_s": ParaData.sort_seq_s,
      "@p_extra_field6_s": ParaData.extra_field6_s,
      "@p_numref1_s": ParaData.numref1_s,
      "@p_memo_s": ParaData.memo_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A0010W",
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
        pgSize: 25,
        row_status_s: "",
        sub_code_s: "",
        code_name_s: "",
        use_yn_s: "",
        sort_seq_s: "",
        extra_field6_s: "",
        numref1_s: "",
        memo_s: "",
      });
      resetAllGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.row_status_s != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

    let dataArr: TdataArr = {
      row_status_s: [],
      sub_code_s: [],
      code_name_s: [],
      use_yn_s: [],
      sort_seq_s: [],
      extra_field6_s: [],
      numref1_s: [],
      memo_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        sub_code = "",
        code_name = "",
        use_yn = "",
        sort_seq = "",
        extra_field6 = "",
        numref1 = "",
        memo = "",
      } = item;

      dataArr.row_status_s.push(rowstatus);
      dataArr.sub_code_s.push(sub_code);
      dataArr.code_name_s.push(code_name);
      dataArr.use_yn_s.push(
        use_yn == true ? "Y" : use_yn == false ? "N" : use_yn
      );
      dataArr.sort_seq_s.push(sort_seq);
      dataArr.extra_field6_s.push(extra_field6);
      dataArr.numref1_s.push(numref1);
      dataArr.memo_s.push(memo == undefined ? "" : memo);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        sub_code = "",
        code_name = "",
        use_yn = "",
        sort_seq = "",
        extra_field6 = "",
        numref1 = "",
        memo = "",
      } = item;

      dataArr.row_status_s.push(rowstatus);
      dataArr.sub_code_s.push(sub_code);
      dataArr.code_name_s.push(code_name);
      dataArr.use_yn_s.push(
        use_yn == true ? "Y" : use_yn == false ? "N" : use_yn
      );
      dataArr.sort_seq_s.push(sort_seq);
      dataArr.extra_field6_s.push(extra_field6);
      dataArr.numref1_s.push(numref1);
      dataArr.memo_s.push(memo == undefined ? "" : memo);
    });
    setParaData((prev) => ({
      ...prev,
      row_status_s: dataArr.row_status_s.join("|"),
      sub_code_s: dataArr.sub_code_s.join("|"),
      code_name_s: dataArr.code_name_s.join("|"),
      use_yn_s: dataArr.use_yn_s.join("|"),
      sort_seq_s: dataArr.sort_seq_s.join("|"),
      extra_field6_s: dataArr.extra_field6_s.join("|"),
      numref1_s: dataArr.numref1_s.join("|"),
      memo_s: dataArr.memo_s.join("|"),
    }));
  };

  const saveExcel = (jsonArr: any[]) => {
    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      let valid = true;
      jsonArr.map((item: any) => {
        Object.keys(item).map((items: any) => {
          if (items != "적재장소코드" && items != "부하율") {
            valid = false;
          }
        });
      });
      if (valid == true) {
        let dataArr: TdataArr = {
          row_status_s: [],
          sub_code_s: [],
          code_name_s: [],
          use_yn_s: [],
          sort_seq_s: [],
          extra_field6_s: [],
          numref1_s: [],
          memo_s: [],
        };
        jsonArr.forEach((item: any, idx: number) => {
          const { 적재장소코드 = "", 부하율 = "", sort_seq = "" } = item;
          dataArr.row_status_s.push("N");
          dataArr.sub_code_s.push(적재장소코드);
          dataArr.code_name_s.push("");
          dataArr.use_yn_s.push("Y");
          dataArr.sort_seq_s.push(sort_seq == undefined ? 0 : sort_seq);
          dataArr.extra_field6_s.push("");
          dataArr.numref1_s.push(부하율 == "" ? 0 : 부하율);
          dataArr.memo_s.push("");
        });
        setParaData((prev) => ({
          ...prev,
          row_status_s: dataArr.row_status_s.join("|"),
          sub_code_s: dataArr.sub_code_s.join("|"),
          code_name_s: dataArr.code_name_s.join("|"),
          use_yn_s: dataArr.use_yn_s.join("|"),
          sort_seq_s: dataArr.sort_seq_s.join("|"),
          extra_field6_s: dataArr.extra_field6_s.join("|"),
          numref1_s: dataArr.numref1_s.join("|"),
          memo_s: dataArr.memo_s.join("|"),
        }));
      } else {
        alert("양식이 맞지 않습니다.");
      }
    }
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  return (
    <>
      <TitleContainer>
        <Title>적재장소마스터</Title>
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
              <th>적재장소코드</th>
              <td>
                <Input
                  name="sub_code"
                  type="text"
                  value={filters.sub_code}
                  onChange={filterInputChange}
                />
              </td>
              <th>적재장소명</th>
              <td>
                <Input
                  name="code_name"
                  type="text"
                  value={filters.code_name}
                  onChange={filterInputChange}
                />
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
            <GridTitle>
              요약정보
              {permissions && (
                <ExcelUploadButtons
                  saveExcel={saveExcel}
                  permissions={permissions}
                  style={{ marginLeft: "15px" }}
                />
              )}
              <Button
                title="Export Excel"
                onClick={onAttachmentsWndClick}
                icon="file"
                fillMode="outline"
                themeColor={"primary"}
                style={{ marginLeft: "10px" }}
              >
                엑셀양식
              </Button>
            </GridTitle>
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
              customOptionData.menuCustomColumnOptions["grdList"]
                .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                .map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          numberField.includes(item.fieldName)
                            ? NumberCell
                            : checkboxField.includes(item.fieldName)
                            ? CheckBoxCell
                            : undefined
                        }
                        headerCell={
                          requiredfield.includes(item.fieldName)
                            ? RequiredHeader
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0 ? mainTotalFooterCell : undefined
                        }
                      ></GridColumn>
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          para={"MA_A0010W"}
        />
      )}
    </>
  );
};

export default MA_A0010W;
