import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridItemChangeEvent,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
} from "../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  convertDateToStrWithTime2,
  UseBizComponent,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  //UseMenuDefaults,
  UseGetValueFromSessionItem,
  UseCustomOption,
  getGridItemChangedData,
  dateformat,
} from "../components/CommonFunction";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import TopButtons from "../components/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { gridList } from "../store/columns/CM_A1710W_C";
import DateCell from "../components/Cells/DateCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import { Button } from "@progress/kendo-react-buttons";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const dateField = ["birdt"];
const RadioField = ["bircd"];

type TdataArr = {
  rowstatus: string[];
  user_id: string[];
  user_name: string[];
  tel_no: string[];
  mobile_no: string[];
  user_ip: string[];
  birdt: string[];
  bircd: string[];
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_BIRCD", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "bircd" ? "R_BIRCD" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CM_A1710W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const pathname: string = window.location.pathname.replace("/", "");
  //커스텀 옵션 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("", setBizComponentData);

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        user_id: defaultOption.find((item: any) => item.id === "user_id")
          .valueCode,
      }));
    }
  }, [customOptionData]);
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 별 페이지 넘버
  const [mainPgNum, setMainPgNum] = useState(1);

  const [isInitSearch, setIsInitSearch] = useState(false);

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    user_id: "",
    user_name: "",
    tel_no: "",
    mobile_no: "",
    user_ip: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_CM_A1710W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_user_id": filters.user_id,
      "@p_user_name": filters.user_name,
      "@p_tel_no": filters.tel_no,
      "@p_mobile_no": filters.mobile_no,
      "@p_user_ip": filters.user_ip,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
    if (mainDataResult.total > 0) {
      const firstRowData = mainDataResult.data[0];
      setSelectedState({ [firstRowData.num]: true });
      setIfSelectFirstRow(true);
    }
  }
  }, [mainDataResult]);

  useEffect(() => {
    if (bizComponentData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
    setIfSelectFirstRow(false);
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
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (isInitSearch === false && permissions !== null) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
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
    if (field != "user_name" && field != "user_id" && field != "rowstatus") {
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

  const onSaveClick = () => {
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });
      if (dataItem.length === 0) return false;
      let dataArr: TdataArr = {
        rowstatus: [],
        user_id: [],
        user_name: [],
        tel_no: [],
        mobile_no: [],
        user_ip: [],
        birdt: [],
        bircd: [],
      };
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          user_id = "",
          user_name = "",
          tel_no = "",
          mobile_no = "",
          user_ip = "",
          birdt = "",
          bircd = "",
        } = item;
        dataArr.rowstatus.push(rowstatus);
        dataArr.user_id.push(user_id == undefined ? "" : user_id);
        dataArr.user_name.push(user_name == undefined ? "" : user_name);
        dataArr.tel_no.push(tel_no == undefined ? "" : tel_no);
        dataArr.mobile_no.push(mobile_no == undefined ? "" : mobile_no);
        dataArr.user_ip.push(user_ip == undefined ? "" : user_ip);
        dataArr.birdt.push(birdt.length == 8 ? birdt : convertDateToStr(birdt));
        dataArr.bircd.push(bircd);
      });

      setParaData((prev) => ({
        ...prev,
        rowstatus: dataArr.rowstatus.join("|"),
        user_id: dataArr.user_id.join("|"),
        user_name: dataArr.user_name.join("|"),
        tel_no: dataArr.tel_no.join("|"),
        mobile_no: dataArr.mobile_no.join("|"),
        user_ip: dataArr.user_ip.join("|"),
        birdt: dataArr.birdt.join("|"),
        bircd: dataArr.bircd.join("|"),
      }));
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "U",
    userid: userId,
    pc: pc,
    user_id: "",
    user_name: "",
    tel_no: "",
    mobile_no: "",
    user_ip: "",
    birdt: "",
    bircd: "",
    rowstatus: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A1710W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_user_id": ParaData.user_id,
      "@p_user_name": ParaData.user_name,
      "@p_tel_no": ParaData.tel_no,
      "@p_mobile_no": ParaData.mobile_no,
      "@p_user_ip": ParaData.user_ip,
      "@p_birdt": ParaData.birdt,
      "@p_bircd": ParaData.bircd,
      "@p_userid": userId,
      "@p_userpc": pc,
      "@p_rowstatus": ParaData.rowstatus,
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
        pgSize: PAGE_SIZE,
        workType: "U",
        userid: userId,
        pc: pc,
        user_id: "",
        user_name: "",
        tel_no: "",
        mobile_no: "",
        user_ip: "",
        birdt: "",
        bircd: "",
        rowstatus: "",
      });
      resetAllGrid();
      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  return (
    <>
      <TitleContainer>
        <Title>사내연락망</Title>

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
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>사번</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="user_id"
                    value={filters.user_id}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>
              <th>성명</th>
              <td>
                <Input
                  name="user_name"
                  type="text"
                  value={filters.user_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>전화번호</th>
              <td>
                <Input
                  name="tel_no"
                  type="text"
                  value={filters.tel_no}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>핸드폰번호</th>
              <td>
                <Input
                  name="mobile_no"
                  type="text"
                  value={filters.mobile_no}
                  onChange={filterInputChange}
                />
              </td>
              <th>IP</th>
              <td>
                <Input
                  name="user_ip"
                  type="text"
                  value={filters.user_ip}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "80vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                rowstatus:
                  row.rowstatus == null ||
                  row.rowstatus == "" ||
                  row.rowstatus == undefined
                    ? ""
                    : row.rowstatus,
                    birdt: row.birdt
                    ? new Date(dateformat(row.birdt))
                    : new Date(dateformat("19991231")),
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
              customOptionData.menuCustomColumnOptions["grdList"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        dateField.includes(item.fieldName)
                          ? DateCell
                          : RadioField.includes(item.fieldName)
                          ? CustomRadioCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 0 ? mainTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {gridList.map((grid: any) =>
        grid.columns.map((column: any) => (
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

export default CM_A1710W;
