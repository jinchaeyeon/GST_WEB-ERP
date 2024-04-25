import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/CR_A1001W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const CheckField = ["add1", "add2", "add3", "finyn"];

const Page: React.FC = () => {
  const DATA_ITEM_KEY = "custcd";
  const idGetter = getter(DATA_ITEM_KEY);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CR_A1001W", setCustomOptionData);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CR_A1001W", setMessagesData);

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
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
    pgSize: 100,
    workType: "Q",
    frdt: new Date(),
    group: "",
    find_row_value: "",
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CR_A1001W_Q",
      pageNumber: 1,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": "01",
        "@p_class": filters.group,
        "@p_yyyymmdd": convertDateToStr(filters.frdt),
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

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

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "등원 스케줄";
      _export.save(optionsGridOne);
    }
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

  //그리드 푸터
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CR_A1001W_001");
      } else {
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const updateItem = (item: { custcd: any }) => {
    let index = mainDataResult.data.findIndex(
      (record) => record.custcd == item.custcd
    );
    mainDataResult.data[index] = item;
    return mainDataResult.data;
  };

  let looped = 1;
  for (let i = 0; i < mainDataResult.data.length; i += looped) {
    let rowSpan = 1;
    looped = 1;
    for (let j = i + 1; j < mainDataResult.data.length; j++) {
      if (mainDataResult.data[i].class == mainDataResult.data[j].class) {
        looped++;
        rowSpan++;
      } else {
        break;
      }
    }
    // add special property for the 'Discontinued' column cells rowSpan
    mainDataResult.data[i].classCellRowSpan =
      rowSpan == 1 ? (looped == 1 ? 1 : undefined) : rowSpan;
  }

  const getItemIndex = (dataItem: any) => {
    return mainDataResult.data.findIndex(
      (record) => record.custcd == dataItem.custcd
    );
  };

  const hoverMergedCellByIndex = (index: any, hover: any) => {
    let currentIndex = index;
    let currentDataItem = mainDataResult.data[currentIndex];
    while (!currentDataItem.classCellRowSpan) {
      currentIndex--;
      currentDataItem = mainDataResult.data[currentIndex];
    }
    // add special property for the 'Discontinued' column cells hover
    currentDataItem.classClassName = hover ? "k-hover" : undefined;
    update(currentDataItem);
  };

  const updateNextItems = (index: any, count: any, hover: any) => {
    for (let i = index; i < index + count; i++) {
      const dataItem = mainDataResult.data[i];
      dataItem.className = hover ? "k-hover" : undefined;
      update(dataItem);
    }
  };
  const handleMergedHover = (dataItem: any, rowSpanNumber: any, hover: any) => {
    const index = getItemIndex(dataItem);
    updateNextItems(index, rowSpanNumber, hover);
  };

  const handleCellHover = (dataItem: any, hover: any) => {
    if (dataItem.classCellRowSpan) {
      return;
    }
    let index = getItemIndex(dataItem);
    hoverMergedCellByIndex(index, hover);
  };

  const update = (dataItem: any) => {
    const gridData = updateItem(dataItem);
    setMainDataResult((prev) => ({
      data: gridData,
      total: prev.total,
    }));
  };

  const customCellRender = (cell: any, props: any) => {
    const { dataItem, field } = props;
    if (field == "class") {
      if (dataItem.classCellRowSpan) {
        return (
          <td
            {...cell.props}
            rowSpan={dataItem.classCellRowSpan}
            className={dataItem.className || dataItem.classClassName}
            onMouseOver={() => {
              handleMergedHover(dataItem, dataItem.classCellRowSpan, true);
            }}
            onMouseOut={() => {
              handleMergedHover(dataItem, dataItem.classCellRowSpan, false);
            }}
          >
            {cell.props.children}
          </td>
        );
      } else if (dataItem.classCellRowSpan == 1) {
        return <td {...cell.props}>{cell.props.children}</td>;
      } else {
        return null;
      }
    }

    return (
      <CellRender
        originalProps={props}
        td={cell}
        enterEdit={enterEdit}
        editField={EDIT_FIELD}
      />
    );
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

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "class" && field != "custnm") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
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
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA310",
    //품목계정, 수량단위
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [classListData, setClassListData] = useState([COM_CODE_DEFAULT_VALUE]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const classQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA310")
      );

      fetchQuery(classQueryStr, setClassListData);
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const onSaveClick = async () => {};
  return (
    <>
      <TitleContainer>
        <Title>일별 출석 및 부가서비스 관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CR_A1001W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>날짜</th>
              <td>
                <div className="filter-item-wrap">
                  <Button
                    type={"button"}
                    onClick={() => {
                      const today = filters.frdt;
                      const yesterday = new Date(today);
                      yesterday.setDate(today.getDate() - 1);
                      setFilters((prev) => ({
                        ...prev,
                        frdt: yesterday,
                      }));
                    }}
                    icon="arrow-60-left"
                    fillMode="flat"
                  />
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                  />
                  <Button
                    type={"button"}
                    onClick={() => {
                      const today = filters.frdt;
                      const tomorrow = new Date(today);
                      tomorrow.setDate(today.getDate() + 1);
                      setFilters((prev) => ({
                        ...prev,
                        frdt: tomorrow,
                      }));
                    }}
                    icon="arrow-60-right"
                    fillMode="flat"
                  />
                </div>
              </td>
              <th>그룹</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="group"
                    value={filters.group}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer height="78vh">
        <GridTitleContainer>
          <GridTitle>등원 스케줄</GridTitle>
          <ButtonContainer>
            <Button
              onClick={onSaveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
              title="저장"
            ></Button>
          </ButtonContainer>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="일별 출석 및 부가서비스 관리"
        >
          <Grid
            style={{ height: "100%" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                class: classListData.find(
                  (item: any) => item.sub_code == row.class
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 subDataState
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={mainDataResult.total}
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
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]?.map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        CheckField.includes(item.fieldName)
                          ? CheckBoxCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0 ? mainTotalFooterCell : undefined
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

export default Page;
