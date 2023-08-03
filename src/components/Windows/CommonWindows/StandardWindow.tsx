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
import { chkScrollHandler, UseBizComponent } from "../../CommonFunction";
import { IWindowPosition } from "../../../hooks/interfaces";
import { PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import BizComponentRadioGroup from "../../RadioGroups/BizComponentRadioGroup";
import FilterContainer from "../../../components/Containers/FilterContainer";
interface IMng {
  mngitemcd1: string;
  mngitemcd2: string;
  mngitemcd3: string;
  mngitemcd4: string;
  mngitemcd5: string;
  mngitemcd6: string;
}

type IWindow = {
  workType: "FILTER" | "ROW_ADD" | "ROWS_ADD";
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  mngitemcd: IMng;
  index: number;
};

const StandardWindow = ({ workType, setVisible, setData, mngitemcd, index }: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 800,
    height: 800,
  });
  const DATA_ITEM_KEY = "item1";
  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  useEffect(() => {
    let mng = "";
    if(index == 1){
      mng = mngitemcd.mngitemcd1;
    } else if(index == 2){
      mng = mngitemcd.mngitemcd2;
    }
    else if(index == 3){
      mng = mngitemcd.mngitemcd3;
    }
    else if(index == 4){
      mng = mngitemcd.mngitemcd4;
    }
    else if(index == 5){
      mng = mngitemcd.mngitemcd5;
    }
    else if(index == 6){
      mng = mngitemcd.mngitemcd6;
    }
    setFilters((prev) => ({
      ...prev,
      mngitemcd: mng,
    }))
  }, [])

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_USEYN",
    //사용여부,
    setBizComponentData
  );

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
  const [isInitSearch, setIsInitSearch] = useState(false);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainPgNum, setMainPgNum] = useState(1);

  const [filters, setFilters] = useState({
    mngitemcd: "",
    sub_code: "",
    code_name: "",
    div: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_AC_A0020W_POP_Q",
    pageNumber: mainPgNum,
    pageSize: PAGE_SIZE,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": "01",
      "@p_mngitemcd": filters.mngitemcd,
      "@p_sub_code": filters.sub_code,
      "@p_code_name": filters.code_name,
      "@p_div": filters.div,
    },
  };
  useEffect(() => {
    fetchMainGrid();
  }, [mainPgNum]);
  useEffect(() => {
    if (isInitSearch === false) {
      fetchMainGrid();
    }
  }, [filters]);
  //그리드 조회
  const fetchMainGrid = async () => {
    let data: any;

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
          data: [...prev.data, ...rows],
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setIsInitSearch(true);
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], {}));
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

  const CommandCell = (props: GridCellProps) => {
    const onSelectClick = () => {
      // 부모로 데이터 전달, 창 닫기
      const selectedData = props.dataItem;
      setData(selectedData);
      if (workType === "ROW_ADD") onClose();
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

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    setData(selectedData);
    if (workType === "ROW_ADD") onClose();
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

  return (
    <Window
      title={"기준정보팝업"}
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
      <FilterContainer>
        <FilterBox>
          <tbody>
            <tr>
              <th>코드</th>
              <td>
                <Input
                  name="sub_code"
                  type="text"
                  value={filters.sub_code}
                  onChange={filterInputChange}
                />
              </td>

              <th>예적금코드명</th>
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
            field="item1"
            title="코드"
            width="150px"
            footerCell={mainTotalFooterCell}
          />

          <GridColumn field="item2" title="예적금코드명" width="400px" />
          <GridColumn field="item3" title="계좌번호" width="250px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default StandardWindow;
