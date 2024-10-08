import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isFilterHideState2, isLoading } from "../../../store/atoms";
import { TPermissions } from "../../../store/types";
import {
  UsePermissions,
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch
} from "../../CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import WindowFilterContainer from "../../Containers/WindowFilterContainer";
import Window from "../WindowComponent/Window";

type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void;
  bizComponentID: string;
  modal?: boolean;
};

let targetRowIndex: null | number = null;

let DATA_ITEM_KEY: string;
var height = 0;
var height2 = 0;
var height3 = 0;
const KendoWindow = ({
  setVisible,
  setData,
  bizComponentID,
  modal = false,
}: IKendoWindow) => {
  const [filterData, setFilterData] = useState<{
    [id: string]: string;
  }>();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
    height3 = getHeight(".BottomContainer"); //하단 버튼부분

    setMobileHeight(
      getWindowDeviceHeight(true, deviceHeight) - height - height2 - height3
    );
    setWebHeight(
      getWindowDeviceHeight(true, position.height) - height - height2 - height3
    );
  }, [filterData]);
  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(true, position.height) - height - height2 - height3
    );
  };
  const setLoading = useSetRecoilState(isLoading);

  const [title, setTitle] = useState<string>("");

  const idGetter = DATA_ITEM_KEY ? getter(DATA_ITEM_KEY) : undefined;
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };

  const processApi = useApi();
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );


  const [columnData, setColumnData] = useState<
    [
      {
        [id: string]: string;
      }
    ]
  >();

  useEffect(() => {
    if (permissions.view) {
      fetchPopupData();
    }
  }, [permissions]);

  //요약정보 조회
  const fetchPopupData = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //비즈니스컴포넌트 정보 조회 파라미터
    const parameters = {
      id: "biz-components?id=" + bizComponentID + "&data=false",
    };

    try {
      data = await processApi<any>("biz-components", parameters);
    } catch (error) {
      data = null;
    }

    //if (data !== null) {
    if (data.length > 0) {
      const queryWhere = data[0].queryWhere;
      const bizComponentItems = data[0].bizComponentItems;
      const bizComponentName = data[0].bizComponentName;

      let startIndex: number = 0;
      let endIndex: number = 0;

      // {필드명: 캡션}
      let filters: {
        [id: string]: string;
      } = {};

      // WHERE 쿼리에서 필드명 추출
      while (queryWhere.indexOf("{", endIndex) > 0) {
        startIndex = queryWhere.indexOf("{", endIndex);
        endIndex = queryWhere.indexOf("}", startIndex);

        let fieldName = queryWhere.substring(startIndex + 1, endIndex);
        let caption = bizComponentItems.find((x: any) => {
          return x.fieldName == fieldName;
        }).caption;

        filters = { ...filters, [fieldName]: caption };
      }

      DATA_ITEM_KEY = bizComponentItems[0].fieldName; // 첫번째 필드를 키값으로 사용

      setTitle(bizComponentName + " 참조 팝업");

      setFilterData(filters);

      setColumnData(bizComponentItems.filter((x: any) => x.columnWidth > 0));
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (filterData && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filterData);

      const keys = Object.getOwnPropertyNames(deepCopiedFilters);

      for (let i = 0; i < keys.length; i++) {
        deepCopiedFilters[keys[i]] = "";
      }

      setFilters(() => ({
        ...deepCopiedFilters,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
        pgSize: PAGE_SIZE,
      }));
    }
  }, [filterData, permissions]);

  //조회조건 초기값
  const [filters, setFilters] = useState<{
    [id: string]: any;
  }>();

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  let gridRef: any = useRef(null);
  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (filters && filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //요약정보 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //팝업 조회 파라미터
    const parameters = {
      para:
        "popup-data?id=" +
        bizComponentID +
        "&page=" +
        filters.pgNum +
        "&pageSize=" +
        filters.pgSize,
      ...filters,
    };

    try {
      data = await processApi<any>("popup-data", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.data.TotalRowCount;
      const rows = data.data.Rows;
      if (gridRef.current) {
        targetRowIndex = 0;
      }
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : !prev
          ? 1
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };
  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
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
      (row: any) => !!idGetter && idGetter(row) == Object.keys(selectedState)[0]
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
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  const drawFilters = (colCount: number) => {
    let rowElements: JSX.Element[] = [];

    if (filterData) {
      let filterElements = Object.getOwnPropertyNames(filterData).map(
        (field: string) => {
          return (
            <>
              <th>{filterData[field]}</th>
              <td>
                <Input
                  name={field}
                  type="text"
                  value={!filters ? "" : filters[field]}
                  onChange={filterInputChange}
                />
              </td>
            </>
          );
        }
      );

      let rowCount = filterElements.length / colCount; // 2:colCount

      for (let i = 0; i < rowCount; i++) {
        rowElements.push(
          <tr>
            {filterElements
              .filter((value, index) => {
                return index >= colCount * i && index < colCount * (i + 1);
              })
              .map((value) => {
                return value;
              })}
          </tr>
        );
      }
    }

    return rowElements;
  };

  return (
    <Window
      titles={title}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <TitleContainer className="WindowTitleContainer">
        <Title />
        <ButtonContainer>
          <Button
            onClick={() => search()}
            icon="search"
            themeColor={"primary"}
            disabled={permissions.view ? false : true}
          >
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <WindowFilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}
        >
          <tbody>
            <>
              {drawFilters(4).map((value) => {
                return value;
              })}
            </>
          </tbody>
        </FilterBox>
      </WindowFilterContainer>
      <GridContainer>
        <Grid
          style={{
            height: isMobile ? mobileheight : webheight,
          }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: !idGetter ? "" : selectedState[idGetter(row)], //선택된 데이터
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
          skip={page.skip}
          take={page.take}
          pageable={true}
          onPageChange={pageChange}
          //원하는 행 위치로 스크롤 기능
          ref={gridRef}
          rowHeight={30}
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
          {columnData &&
            columnData.length > 0 &&
            columnData
              .filter((x: any) => x.columnWidth > 0)
              .map((column: any, index) => {
                return (
                  <GridColumn
                    field={column.fieldName}
                    title={column.caption}
                    width={column.columnWidth}
                    footerCell={index == 0 ? mainTotalFooterCell : undefined}
                  />
                );
              })}
        </Grid>
      </GridContainer>
      <BottomContainer className="BottomContainer">
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
