import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridCellProps,
  GridFilterChangeEvent,
  GridEvent,
  GridDataStateChangeEvent,
  getSelectedState,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import {
  CompositeFilterDescriptor,
  DataResult,
  process,
  State,
  filterBy,
  getter,
} from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";

import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  FilterBoxWrap,
  GridContainer,
  Title,
  TitleContainer,
} from "../../CommonStyled";

import {
  Input,
  RadioButton,
  RadioButtonChangeEvent,
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";
import DropDownList from "../DropDownLists/CommonDropDownList";

import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition, TCommonCodeData } from "../../hooks/interfaces";
import { chkScrollHandler } from "../CommonFunction";
import { custdivQuery, useynRadioButtonData } from "../CommonString";

type IKendoWindow = {
  getVisible(t: boolean): void;
  getData(data: object): void;
  workType: string;
  para?: Iparameters;
};

const pageSize = 20;

const KendoWindow = ({ getVisible, workType, getData, para }: IKendoWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 800,
  });

  const DATA_ITEM_KEY = "custcd";
  const SELECTED_FIELD = "selected";

  const idGetter = getter(DATA_ITEM_KEY);
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

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: RadioGroupChangeEvent) => {
    const name = e.syntheticEvent.currentTarget.name;
    const value = e.value;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 DropDownList Change 함수 => 사용자가 선택한 드롭다운리스트 값을 조회 파라미터로 세팅
  const filterDropDownListChange = (name: string, data: TCommonCodeData) => {
    setFilters((prev) => ({
      ...prev,
      [name]: data.sub_code,
    }));
  };

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    getVisible(false);
  };

  const processApi = useApi();
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainPgNum, setMainPgNum] = useState(1);
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //조회조건 초기값
  const [filters, setFilters] = useState({
    custcd: "",
    custnm: "",
    custdiv: "",
    useyn: "%",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_TEST_CUST_POPUP",
    pageNumber: mainPgNum,
    pageSize: pageSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_custdiv": filters.custdiv,
      "@p_useyn": filters.useyn,
    },
  };
  useEffect(() => {
    fetchMainGrid();
  }, [mainPgNum]);

  //요약정보 조회
  const fetchMainGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setMainDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
        };
      });
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
  };

  //스크롤 핸들러 => 한번에 pageSize만큼 조회
  const onScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, pageSize))
      setMainPgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onRowDoubleClick = (props: any) => {
    // 부모로 데이터 전달, 창 닫기
    const rowData = props.dataItem;
    getData(rowData);
    onClose();
  };

  const onConfirmClick = (props: any) => {
    const rowData = mainDataResult.data.find(
      (row: any) => row.custcd === Object.keys(selectedState)[0]
    );

    // 부모로 데이터 전달, 창 닫기
    getData(rowData);
    onClose();
  };

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  return (
    <Window
      title={"업체마스터"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <TitleContainer>
        <Title />
        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
            }}
            icon="search"
            themeColor={"primary"}
          >
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>업체명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>

              <th>업체코드</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
                />
              </td>
              <th>업체구분</th>
              <td>
                <DropDownList
                  name="custdiv"
                  queryStr={custdivQuery}
                  changeData={filterDropDownListChange}
                />
              </td>
              <th>사용여부</th>
              <td>
                <RadioGroup
                  name="useyn"
                  data={useynRadioButtonData}
                  layout={"horizontal"}
                  defaultValue={filters.useyn}
                  onChange={filterRadioChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>
      <GridContainer>
        <Grid
          style={{ height: "550px" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
            })),
            mainDataState
          )}
          onDataStateChange={onMainDataStateChange}
          {...mainDataState}
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
          onScroll={onScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          //더블클릭
          onRowDoubleClick={onRowDoubleClick}
        >
          <GridColumn
            field="custcd"
            title="업체코드"
            width="140px" /*footerCell={detailTotalFooterCell}*/
          />

          <GridColumn field="custnm" title="업체명" width="200px" />
          <GridColumn field="custabbr" title="업체약어" width="120px" />
          <GridColumn field="bizregnum" title="사업자등록번호" width="140px" />
          <GridColumn field="custdivnm" title="업체구분" width="120px" />
          <GridColumn field="useyn" title="사용유무" width="120px" />
          <GridColumn field="compclass" title="업태" width="120px" />
          <GridColumn field="ceonm" title="대표자명" width="120px" />
          <GridColumn field="remark" title="비고" width="300px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmClick}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
