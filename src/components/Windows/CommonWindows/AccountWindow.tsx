import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridEvent,
  GridDataStateChangeEvent,
  getSelectedState,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { DataResult, process, State, getter } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import { Iparameters } from "../../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition, TCommonCodeData } from "../../../hooks/interfaces";
import { chkScrollHandler, UseBizComponent } from "../../CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import BizComponentRadioGroup from "../../RadioGroups/BizComponentRadioGroup";
import BizComponentComboBox from "../../ComboBoxes/BizComponentComboBox";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../../../store/atoms";
import {handleKeyPressSearch} from "../../CommonFunction";
import FilterContainer from "../../../components/Containers/FilterContainer";

type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void;
  para?: Iparameters;
};

const DATA_ITEM_KEY = "acntcd";

const KendoWindow = ({ setVisible, setData, para }: IKendoWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 800,
  });

  const setLoading = useSetRecoilState(isLoading);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA026,R_USEYN",
    //업체구분, 사용여부,
    setBizComponentData
  );

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
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

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
    setVisible(false);
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
    acntcd: "",
    acntnm: "",
  });

  //팝업 조회 파라미터
  const parameters = {
    para:
      "popup-data?id=" +
      "P_acntcd" +
      "&page=" +
      mainPgNum +
      "&pageSize=" +
      PAGE_SIZE,
    acntcd: filters.acntcd,
    acntnm: filters.acntnm,
  };

  useEffect(() => {
    fetchMainGrid();
  }, [mainPgNum]);

  //요약정보 조회
  const fetchMainGrid = async () => {
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("popup-data", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.data.TotalRowCount;
      const rows = data.data.Rows;

      if (totalRowCnt) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
      }
    } else {
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
  };

  //스크롤 핸들러 => 한번에 pageSize만큼 조회
  const onScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
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
    setData(rowData);
    onClose();
  };

  const onConfirmClick = (props: any) => {
    const rowData = mainDataResult.data.find(
      (row: any) => row.acntcd === Object.keys(selectedState)[0]
    );

    // 부모로 데이터 전달, 창 닫기
    setData(rowData);
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

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
  }
  
  return (
    <Window
      title={"계정코드"}
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
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
            <th>계정코드</th>
              <td>
                <Input
                  name="acntcd"
                  type="text"
                  value={filters.acntcd}
                  onChange={filterInputChange}
                />
              </td>
              <th>계정명</th>
              <td>
                <Input
                  name="acntnm"
                  type="text"
                  value={filters.acntnm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer height="calc(100% - 170px)">
        <Grid
          style={{ height: "100%" }}
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
            field="acntcd"
            title="계정코드"
            width="120px"
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="acntnm" title="계정명" width="250px" />
          <GridColumn field="mngitemnm1" title="관리항목명1" width="120px" />
          <GridColumn field="mngitemnm2" title="관리항목명2" width="120px" />
          <GridColumn field="mngitemnm3" title="관리항목명3" width="120px" />
          <GridColumn field="mngitemnm4" title="관리항목명4" width="120px" />
          <GridColumn field="mngitemnm5" title="관리항목명5" width="120px" />
          <GridColumn field="mngitemnm6" title="관리항목명6" width="120px" />
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
