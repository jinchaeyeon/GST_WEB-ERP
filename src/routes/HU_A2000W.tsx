import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A2000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";

const dateField = ["yyyymmdd"];
const comboField = ["daygb"];
const radioField = ["workdiv"];
const numberField = ["week", "mweek"];

const CustomDateCell = (props: GridCellProps) => {
  const color =
    props.dataItem.dayofweek == "(일)"
      ? "red"
      : props.dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  return <DateCell color={color} {...props} />;
};

const CustomNumberCell = (props: GridCellProps) => {
  const color =
    props.dataItem.dayofweek == "(일)"
      ? "red"
      : props.dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  return <NumberCell color={color} {...props} />;
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_WORKDIV", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "workdiv" ? "R_WORKDIV" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  const color =
    props.dataItem.dayofweek == "(일)"
      ? "red"
      : props.dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} color={color} {...props} />
  ) : (
    <td />
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU077", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "daygb" ? "L_HU077" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  const color =
    props.dataItem.dayofweek == "(일)"
      ? "red"
      : props.dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} color={color} {...props} />
  ) : (
    <td />
  );
};

const CustomColorCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field } = props;

  const color =
    dataItem.dayofweek == "(일)"
      ? "red"
      : dataItem.dayofweek == "(토)"
      ? "blue"
      : "black";

  const value = field && dataItem[field] ? dataItem[field] : "";

  return (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ color: color }}
    >
      {value}
    </td>
  );
};

const HU_A2000W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption("HU_A2000W", setCustomOptionData);
  //메시지 조회
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages("HU_A2000W", setMessagesData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_HU076, L_HU075",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  const [workgbListData, setWorkgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [workclsListData, setWorkclsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const workgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU075")
      );
      const workclsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU076")
      );

      fetchQuery(workgbQueryStr, setWorkgbListData);
      fetchQuery(workclsQueryStr, setWorkclsListData);
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

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        stddt: setDefaultDate(customOptionData, "stddt"),
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        workgb: defaultOption.find((item: any) => item.id === "workgb")
          .valueCode,
        workcls: defaultOption.find((item: any) => item.id === "workcls")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.stddt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.stddt).substring(6, 8) > "31" ||
        convertDateToStr(filters.stddt).substring(6, 8) < "01" ||
        convertDateToStr(filters.stddt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_A2000W_001");
      } else if (
        filters.location == "" ||
        filters.location == undefined ||
        filters.location == null
      ) {
        throw findMessage(messagesData, "HU_A2000W_002");
      } else if (
        filters.workgb == "" ||
        filters.workgb == undefined ||
        filters.workgb == null
      ) {
        throw findMessage(messagesData, "HU_A2000W_003");
      } else if (
        filters.workcls == "" ||
        filters.workcls == undefined ||
        filters.workcls == null
      ) {
        throw findMessage(messagesData, "HU_A2000W_004");
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: "01",
    location: "01",
    stddt: new Date(),
    workgb: "",
    workcls: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
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
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A2000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": "01",
        "@p_stddt": convertDateToStr(filters.stddt).substring(0, 6),
        "@p_location": filters.location,
        "@p_workgb": filters.workgb,
        "@p_workcls": filters.workcls,
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
    if (filters.isSearch && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, customOptionData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
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
    if (field == "daygb" || field == "workdiv" || field == "remark") {
      const newData = mainDataResult.data.map((item) =>
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
      setMainDataResult((prev) => {
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
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
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
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>워크캘린더</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A2000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준년월</th>
              <td>
                <DatePicker
                  name="stddt"
                  value={filters.stddt}
                  format="yyyy-MM"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={MonthCalendar}
                />
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>근무형태</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="workgb"
                    value={filters.workgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>근무조</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="workcls"
                    value={filters.workcls}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
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
            <GridTitle>요약정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "80vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                workgb: workgbListData.find(
                  (item: any) => item.sub_code === row.workgb
                )?.code_name,
                workcls: workclsListData.find(
                  (item: any) => item.sub_code === row.workcls
                )?.code_name,
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
            onSelectionChange={onSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
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
            <GridColumn
              field="rowstatus"
              title=" "
              width="50px"
              editable={false}
            />
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
                        comboField.includes(item.fieldName)
                          ? CustomComboBoxCell
                          : dateField.includes(item.fieldName)
                          ? CustomDateCell
                          : numberField.includes(item.fieldName)
                          ? CustomNumberCell
                          : radioField.includes(item.fieldName)
                          ? CustomRadioCell
                          : CustomColorCell
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

export default HU_A2000W;
