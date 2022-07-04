import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridCellProps,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridDataStateChangeEvent,
} from "@progress/kendo-react-grid";
import { DataResult, getter, process, State } from "@progress/kendo-data-query";
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

import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import { chkScrollHandler } from "../CommonFunction";
import { IWindowPosition } from "../../hooks/interfaces";
import { useynRadioButtonData } from "../CommonString";

type IWindow = {
  workType: string; //구분자 "FILTER", "ROW"
  getVisible(t: boolean): void;
  getData(data: object, rowIdx: number, rowData: object): void; //data : 품목참조팝업에서 선택한 데이터 // rowIdx, rowData : 그리드 인라인 품목참조시 사용
  rowIdx?: number; // (그리드 인라인 품목참조시 사용) 참조버튼 클릭한 행 번호
  rowData?: object; // (그리드 인라인 품목참조시 사용) 참조버튼 클릭한 행 번호
  para?: Iparameters; //현재 미사용
};

const pageSize = 20;

const ItemsWindow = ({
  workType,
  getVisible,
  getData,
  rowIdx,
  rowData,
  para,
}: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 800,
  });
  const DATA_ITEM_KEY = "itemcd";
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
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainPgNum, setMainPgNum] = useState(1);

  const [filters, setFilters] = useState({
    itemcd: "",
    itemnm: "",
    insiz: "",
    bnatur: "",
    spec: "",
    itemacnt: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    custcd: "",
    custnm: "",
    dwgno: "",
    useyn: "Y",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_TEST_ITEM_POPUP",
    pageNumber: mainPgNum,
    pageSize: pageSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_bnatur": filters.bnatur,
      "@p_spec": filters.spec,
      "@p_itemacnt": filters.itemacnt,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_dwgno": filters.dwgno,
      "@p_useyn": filters.useyn,
    },
  };
  useEffect(() => {
    fetchMainGrid();
  }, [mainPgNum]);

  //그리드 조회
  const fetchMainGrid = async () => {
    let data: any;

    console.log("parameters");
    console.log(parameters);
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
    setMainDataResult(process([], {}));
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

  const CommandCell = (props: GridCellProps) => {
    const onSelectClick = () => {
      // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
      const selectedData = props.dataItem;
      getData(selectedData, rowIdx ?? -1, rowData ?? {});
      if (rowIdx !== -1 || rowIdx === undefined) onClose();
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onSelectClick}
          icon="check"
        ></Button>
      </td>
    );
  };

  const onRowDoubleClick = (props: any) => {
    const selectedData = props.dataItem;
    selectData(selectedData);
  };

  const onConfirmBtnClick = (props: any) => {
    const selectedData = mainDataResult.data.find(
      (row: any) => row.itemcd === Object.keys(selectedState)[0]
    );
    selectData(selectedData);
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    getData(selectedData, rowIdx ?? -1, rowData ?? {});
    if (rowIdx !== -1 || rowIdx === undefined) onClose();
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
      title={"품목마스터"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <TitleContainer>
        <Title></Title>
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
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
              </td>

              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>

              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
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
            <tr>
              <th>사양</th>
              <td>
                <Input
                  name="spec"
                  type="text"
                  value={filters.spec}
                  onChange={filterInputChange}
                />
              </td>

              <th>재질</th>
              <td>
                <Input
                  name="bnatur"
                  type="text"
                  value={filters.bnatur}
                  onChange={filterInputChange}
                />
              </td>

              <th>품목계정</th>
              <td>
                <Input
                  name="itenacnt"
                  type="text"
                  value={filters.itemacnt}
                  onChange={filterInputChange}
                />
              </td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>
      <GridContainer>
        <Grid
          style={{ height: "500px" }}
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
          //스크롤 조회기능
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
            field="itemcd"
            title="품목코드"
            width="200px" /*footerCell={detailTotalFooterCell}*/
          />

          <GridColumn field="itemnm" title="품목명" width="200px" />
          <GridColumn field="insiz" title="규격" width="120px" />
          <GridColumn field="model" title="MODEL" width="120px" />
          <GridColumn field="spec" title="사양" width="120px" />
          <GridColumn field="itemacntnm" title="품목계정" width="120px" />
          <GridColumn field="bnatur" title="재질" width="120px" />
          <GridColumn field="invunitnm" title="수량단위" width="120px" />
          <GridColumn field="unitwgt" title="단중" width="120px" />
          <GridColumn field="useyn" title="사용여부" width="120px" />
          <GridColumn field="wgtunitnm" title="중량단위" width="120px" />
          <GridColumn field="maker" title="메이커" width="120px" />
          <GridColumn field="remark" title="비고" width="120px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
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

export default ItemsWindow;
