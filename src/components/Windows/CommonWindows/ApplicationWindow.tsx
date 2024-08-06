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
import { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isLoading } from "../../../store/atoms";
import { TPermissions } from "../../../store/types";
import {
  UsePermissions,
  getHeight,
  getWindowDeviceHeight,
} from "../../CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import Window from "../WindowComponent/Window";

type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void;
  modal?: boolean;
};

const DATA_ITEM_KEY = "sub_code";
const DATA_ITEM_KEY2 = "sub_code";
var height = 0;
var height2 = 0;
var height3 = 0;
const KendoWindow = ({ setVisible, setData, modal = false }: IKendoWindow) => {
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
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".WindowButtonContainer"); //하단 버튼부분
    height3 = getHeight(".BottomContainer"); //하단 버튼부분

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height3 - height2
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height3 - height2
    );
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height3
    );
  };
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });

  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const onClose = () => {
    setVisible(false);
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  //조회조건 초기값
  const [filters, setFilters] = useState({
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [filters2, setFilters2] = useState({
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    // //팝업 조회 파라미터
    // const parameters = {
    //   para:
    //     "popup-data?id=" +
    //     "P_CR130" +
    //     "&page=" +
    //     filters.pgNum +
    //     "&pageSize=" +
    //     PAGE_SIZE,
    // };
    // try {
    //   data = await processApi<any>("popup-data", parameters);
    // } catch (error) {
    //   data = null;
    // }

    // if (data !== null) {
    //   const totalRowCnt = data.data.TotalRowCount;
    //   const rows = data.data.Rows;

    //   setMainDataResult((prev) => {
    //     return {
    //       data: rows,
    //       total: totalRowCnt == -1 ? 0 : totalRowCnt,
    //     };
    //   });
    //   if (totalRowCnt > 0) {
    //     const selectedRow = rows[0];
    //     setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
    //   }
    // } else {
    //   console.log(data);
    // }
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid2 = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    // //팝업 조회 파라미터
    // const parameters = {
    //   para:
    //     "popup-data?id=" +
    //     "P_CR131" +
    //     "&page=" +
    //     filters.pgNum +
    //     "&pageSize=" +
    //     PAGE_SIZE,
    // };
    // try {
    //   data = await processApi<any>("popup-data", parameters);
    // } catch (error) {
    //   data = null;
    // }

    // if (data !== null) {
    //   const totalRowCnt = data.data.TotalRowCount;
    //   const rows = data.data.Rows;

    //   setMainDataResult2((prev) => {
    //     return {
    //       data: rows,
    //       total: totalRowCnt == -1 ? 0 : totalRowCnt,
    //     };
    //   });
    //   if (totalRowCnt > 0) {
    //     const selectedRow = rows[0];
    //     setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
    //   }
    // } else {
    //   console.log(data);
    // }
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (filters2.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions]);

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
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
  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };
  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onRowDoubleClick = (props: any) => {
    // 부모로 데이터 전달, 창 닫기
    const rowData = props.dataItem;
    setData(rowData);
    onClose();
  };

  const onRowDoubleClick2 = (props: any) => {
    // 부모로 데이터 전달, 창 닫기
    const rowData = props.dataItem;
    setData(rowData);
    onClose();
  };

  return (
    <Window
      titles={"신청 분야 조회"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <GridContainerWrap>
        <GridContainer width="50%">
          <GridTitleContainer className="WindowButtonContainer">
            <GridTitle>성과물활용유형</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{
              height: isMobile ? mobileheight : webheight,
            }}
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
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onRowDoubleClick={onRowDoubleClick}
          >
            <GridColumn
              field="code_name"
              title="분류명"
              width="120px"
              footerCell={mainTotalFooterCell}
            />
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(50% - ${GAP}px)`}>
          <GridTitleContainer className="WindowButtonContainer">
            <GridTitle>산업분류</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{
              height: isMobile ? mobileheight : webheight,
            }}
            data={process(
              mainDataResult2.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
              })),
              mainDataState2
            )}
            onDataStateChange={onMainDataStateChange2}
            {...mainDataState2}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onMainSelectionChange2}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult2.total}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange2}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onRowDoubleClick={onRowDoubleClick2}
          >
            <GridColumn
              field="code_name"
              title="분류명"
              width="120px"
              footerCell={mainTotalFooterCell2}
            />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      <BottomContainer className="BottomContainer">
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
