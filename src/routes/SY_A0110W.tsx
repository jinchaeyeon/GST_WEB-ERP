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
  GridContainerWrap,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import {
  Input,
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters } from "../store/types";
import YearCalendar from "../components/Calendars/YearCalendar";
import {
  chkScrollHandler,
  convertDateToStr,
  setDefaultDate,
  UseBizComponent,
  UseCommonQuery,
  UseCustomOption,
  //UseMenuDefaults,
} from "../components/CommonFunction";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { IItemData, TCommonCodeData } from "../hooks/interfaces";
import {
  commonCodeDefaultValue,
  gnvWidth,
  clientWidth,
  gridMargin,
  itemgradeQuery,
  itemlvl1Query,
  itemlvl2Query,
  itemlvl3Query,
  useynRadioButtonData,
  zeroynRadioButtonData,
  pageSize,
  SELECTED_FIELD,
} from "../components/CommonString";
import NumberCell from "../components/Cells/NumberCell";
import DateCell from "../components/Cells/DateCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns";
//import {useAuth} from "../../hooks/auth";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "idx";

const SY_A0110: React.FC = () => {
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pathname: string = window.location.pathname.replace("/", "");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

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
    pgSize: pageSize,
    work_type: "list",
    orgdiv: "01",
    type: "pgm",
    ref_code: "",
    frdt: new Date(),
    todt: new Date(),
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SY_A0110W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": filters.orgdiv,
      "@p_type": filters.type,
      "@p_ref_code": filters.ref_code,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[1].Rows;

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
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (mainDataResult.total > 0) {
      const firstRowData = mainDataResult.data[0];
      setSelectedState({ [firstRowData.itemcd]: true });
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (customOptionData !== null) {
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
    if (chkScrollHandler(event, mainPgNum, pageSize))
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

  //공통코드 리스트 조회 (대분류, 중분류, 소분류, 품목등급)
  const [itemlvl1ListData, setItemlvl1ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl1Query, setItemlvl1ListData);

  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl2Query, setItemlvl2ListData);

  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl3Query, setItemlvl3ListData);

  const [itemgradeListData, setItemgradeListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemgradeQuery, setItemgradeListData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      console.log("setDefaultDate(customOptionData, )");
      console.log(setDefaultDate(customOptionData, "ymdFrdt"));
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "ymdFrdt"),
        todt: setDefaultDate(customOptionData, "ymdTodt"),
      }));
    }
  }, [customOptionData]);

  // 최초 한번만 실행
  useEffect(() => {
    if (isInitSearch === false) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters]);

  //공통코드 리스트 조회 후 그리드 데이터 세팅
  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemlvl1: itemlvl1ListData.find(
          (item: any) => item.sub_code === row.itemlvl1
        )?.code_name,
      }));

      return {
        data: [...rows],
        total: prev.total,
      };
    });
  }, [itemlvl1ListData]);

  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemlvl2: itemlvl2ListData.find(
          (item: any) => item.sub_code === row.itemlvl2
        )?.code_name,
      }));

      return {
        data: [...rows],
        total: prev.total,
      };
    });
  }, [itemlvl2ListData]);

  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemlvl3: itemlvl3ListData.find(
          (item: any) => item.sub_code === row.itemlvl3
        )?.code_name,
      }));

      return {
        data: [...rows],
        total: prev.total,
      };
    });
  }, [itemlvl3ListData]);

  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemgrade: itemgradeListData.find(
          (item: any) => item.sub_code === row.itemgrade
        )?.code_name,
      }));

      return {
        data: [...rows],
        total: prev.total,
      };
    });
  }, [itemgradeListData]);

  return (
    <>
      <TitleContainer>
        <Title>사용자 이용 현황</Title>

        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
            }}
            icon="search"
            //fillMode="outline"
            themeColor={"primary"}
          >
            조회
          </Button>
          <Button
            title="Export Excel"
            onClick={exportExcel}
            icon="download"
            fillMode="outline"
            themeColor={"primary"}
          >
            Excel
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>기간</th>
              <td className="item-box">
                <DatePicker
                  name="frdt"
                  value={filters.frdt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                />
                ~
                <DatePicker
                  name="todt"
                  value={filters.todt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                />
              </td>
              <th></th>
              <td></td>
              <th></th>
              <td></td>
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
          </GridTitleContainer>
          <Grid
            style={{ height: "650px" }}
            data={process(
              mainDataResult.data.map((row, idx) => ({
                ...row,
                idx,
                itemlvl1: itemlvl1ListData.find(
                  (item: any) => item.sub_code === row.itemlvl1
                )?.code_name,
                itemlvl2: itemlvl2ListData.find(
                  (item: any) => item.sub_code === row.itemlvl2
                )?.code_name,
                itemlvl3: itemlvl3ListData.find(
                  (item: any) => item.sub_code === row.itemlvl3
                )?.code_name,
                itemgrade: itemgradeListData.find(
                  (item: any) => item.sub_code === row.itemgrade
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
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["gvwTotal"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.id.replace("col_", "")}
                      title={item.caption}
                      width={item.width}
                      footerCell={
                        item.sortOrder === 1 ? mainTotalFooterCell : ""
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
    </>
  );
};

export default SY_A0110;
