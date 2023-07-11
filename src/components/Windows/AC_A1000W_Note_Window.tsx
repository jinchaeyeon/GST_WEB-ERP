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
  ButtonInInput,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import FilterContainer from "../Containers/FilterContainer";
import {
  chkScrollHandler,
  convertDateToStr,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
} from "../CommonFunction";
import { IWindowPosition } from "../../hooks/interfaces";
import { PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";

type IWindow = {
  workType: "FILTER" | "ROW_ADD" | "ROWS_ADD";
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
};

const AC_A1000W_Note_Window = ({
  workType,
  setVisible,
  setData,
}: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1000,
    height: 800,
  });
  const DATA_ITEM_KEY = "notenum";
  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const pathname: string = window.location.pathname.replace("/", "");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        notediv: defaultOption.find((item: any) => item.id === "notediv")
          .valueCode,
      }));
    }
  }, [customOptionData]);

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
    notenum: "",
    notediv: "",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_AC_A0020W_P_Q",
    pageNumber: mainPgNum,
    pageSize: PAGE_SIZE,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": "01",
      "@p_notenum": filters.notenum,
      "@p_notediv": filters.notediv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
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
          total: totalRowCnt,
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
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  return (
    <Window
      title={"기준정보팝업"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={true}
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
              <th>어음구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="notediv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>만기일자</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any; }; }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                  className="required"
                />
                </td>
            </tr>
            <tr>
              <th>어음번호</th>
              <td>
                <Input
                  name="notenum"
                  type="text"
                  value={filters.notenum}
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
                <ButtonInInput>
                  <Button
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>업체명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
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
            field="notenum"
            title="어음번호"
            width="150px"
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="enddt" title="만기일자" cell={DateCell} width="120px" />
          <GridColumn field="bankcd" title="지급은행" width="120px" />
          <GridColumn field="custnm" title="업체명" width="180px" />
          <GridColumn field="pubamt" title="발행금액" cell={NumberCell} width="100px" />
          <GridColumn field="pubperson" title="발행인" width="120px" />
          <GridColumn field="pubbank" title="발행은행명" width="120px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
        />
      )}
    </Window>
  );
};

export default AC_A1000W_Note_Window;
