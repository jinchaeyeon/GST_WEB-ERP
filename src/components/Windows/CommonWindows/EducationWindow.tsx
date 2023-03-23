import { useEffect, useState, useCallback, useRef } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridSelectionChangeEvent,
  getSelectedState,
  GridEvent,
} from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import { DataResult, process, State, getter } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";
import NumberCell from "../../Cells/NumberCell";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  FilterBoxWrap,
  FilterBox,
  GridTitleContainer,
  GridTitle,
  GridContainerWrap,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  SELECTED_FIELD,
} from "../../CommonString";
import { Input } from "@progress/kendo-react-inputs";
import { Form, FormElement, FormRenderProps } from "@progress/kendo-react-form";
import { Iparameters } from "../../../store/types";
import {
  UseBizComponent,
  UseMessages,
  handleKeyPressSearch,
  UseParaPc,
  getQueryFromBizComponent,
  chkScrollHandler,
  convertDateToStr,
} from "../../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../../hooks/interfaces";
import { EDIT_FIELD, FORM_DATA_INDEX, PAGE_SIZE } from "../../CommonString";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../../../store/atoms";
const SUB_DATA_ITEM_KEY = "edunum";

// Create React.Context to pass props to the Form Field components from the main component
export const FormGridEditContext = React.createContext<{
  onEdit: (dataItem: any, isNew: boolean) => void;
  onSave: () => void;
  editIndex: number | undefined;
  parentField: string;
}>({} as any);

type TPara = {
  user_id: string;
  user_name: string;
};
type TKendoWindow = {
  getVisible(isVisible: boolean): void;
  setData(data: object): void;
  // para: TPara;
};

const KendoWindow = ({
  getVisible,
  setData,
}: // para = { user_id: "", user_name: "" },
TKendoWindow) => {
  // 비즈니스 컴포넌트 조회
  const idGetter = getter(SUB_DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 460,
    height: 700,
  });

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
  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  let gridRef: any = useRef(null);
  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (filters.find_row_value !== "" && detailDataResult.total > 0) {
      const ROW_HEIGHT = 35.56;
      const idx = detailDataResult.data.findIndex(
        (item) => idGetter(item) === filters.find_row_value
      );

      const scrollHeight = ROW_HEIGHT * idx;
      gridRef.vs.container.scroll(0, scrollHeight);

      //초기화
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        tab: 0,
      }));
    }
    // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
    // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
    else if (filters.scrollDirrection === "up") {
      gridRef.vs.container.scroll(0, 20);
    }
  }, [detailDataResult]);

  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
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
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onRowDoubleClick = (props: any) => {
    const selectRow = detailDataResult.data.filter(
      (item: any) => item.edunum == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    setData(selectRow);
    onClose();
  };

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    edunum: "",
    title: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const parameters = {
    para:
      "popup-data?id=" +
      "P_ED100T" +
      "&page=" +
      filters.pgNum +
      "&pageSize=" +
      PAGE_SIZE,
    edunum: filters.edunum,
    title: filters.title,
  };

  //그리드 데이터 조회
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
        setDetailDataResult((prev: any) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[SUB_DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  useEffect(() => {
    if (filters.isSearch) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters]);

  const resetAllGrid = () => {
    setDetailDataResult(process([], {}));
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const search = () => {
    resetAllGrid();

    setFilters((prev: any) => ({
      ...prev,
      find_row_value: "",
      scrollDirrection: "down",
      pgNum: 1,
      isSearch: true,
      pgGap: 0,
    }))
  }
  return (
    <Window
      title={"교육기준정보"}
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
            onClick={search}
            icon="search"
            themeColor={"primary"}
          >
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>교육번호</th>
              <td>
                <Input
                  name="edunum"
                  type="text"
                  value={filters.edunum}
                  onChange={filterInputChange}
                />
              </td>
              <th>제목</th>
              <td>
                <Input
                  name="title"
                  type="text"
                  value={filters.title}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>
      <GridContainerWrap height="calc(100% - 160px)">
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>용어목록</GridTitle>
          </GridTitleContainer>
          <Grid
            data={detailDataResult.data.map((item: any) => ({
              ...item,
              [SELECTED_FIELD]: selectedState[idGetter(item)],
            }))}
            total={detailDataResult.total}
            dataItemKey={FORM_DATA_INDEX}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "multiple",
            }}
            onSelectionChange={onSubDataSelectionChange}
            fixedScroll={true}
            onScroll={onMainScrollHandler}
            onRowDoubleClick={onRowDoubleClick}
            style={{ height: `calc(100% - 40px)` }}
          >
            <GridColumn field="edunum" title="교육번호" width="200px" />
            <GridColumn field="title" title="제목" width="200px" />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
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

export default KendoWindow;
