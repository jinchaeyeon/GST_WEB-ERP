import { useEffect, useState, useCallback, useRef } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridSelectionChangeEvent,
  getSelectedState,
  GridEvent,
  GridPageChangeEvent,
} from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import { DataResult, process, State, getter } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";
import NumberCell from "../../Cells/NumberCell";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
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
import FilterContainer from "../../../components/Containers/FilterContainer";
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
  modal?: boolean;
  // para: TPara;
};

const KendoWindow = ({
  getVisible,
  setData,
  modal = false,
}: // para = { user_id: "", user_name: "" },
TKendoWindow) => {
  // 비즈니스 컴포넌트 조회
  const idGetter = getter(SUB_DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 460,
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

      setDetailDataResult((prev: any) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });
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
      pgNum: 1,
      isSearch: true,
    }));
  };

  return (
    <Window
      title={"교육기준정보"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <TitleContainer>
        <Title></Title>
        <ButtonContainer>
          <Button onClick={search} icon="search" themeColor={"primary"}>
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
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
      </FilterContainer>
      <GridContainerWrap height="calc(100% - 160px)">
        <GridContainer width="100%">
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
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef}
            rowHeight={30}
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
