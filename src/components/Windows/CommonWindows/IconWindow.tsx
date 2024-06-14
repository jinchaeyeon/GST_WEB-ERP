import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { getSelectedState } from "@progress/kendo-react-treelist";
import React, { useEffect, useLayoutEffect, useState } from "react";
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
  handleKeyPressSearch,
} from "../../CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import WindowFilterContainer from "../../Containers/WindowFilterContainer";
import RequiredHeader from "../../HeaderCells/RequiredHeader";
import Window from "../WindowComponent/Window";

const DATA_ITEM_KEY = "num";

type TKendoWindow = {
  setVisible(t: boolean): void;
  reloadData(workType: string, groupCode?: string): void;
  modal?: boolean;
};

const ColumnCommandCell = (props: GridCellProps) => {
  const excelInput: any = React.useRef();
  const [imgBase64, setImgBase64] = useState<string>(); // 파일 base64
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    render,
    className = "",
  } = props;

  useEffect(() => {
    if (dataItem.icon_image != null) {
      setImgBase64("data:image/png;base64," + dataItem.icon_image);
    }
  });

  return (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative", textAlign: "center", cursor: "pointer" }}
    >
      <div style={{ textAlign: "center" }}>
        <img
          style={{ display: "block", margin: "auto", width: "80%" }}
          ref={excelInput}
          src={imgBase64}
          alt="UserImage"
        />
      </div>
    </td>
  );
};
var height = 0;
var height2 = 0;
var height3 = 0;

const KendoWindow = ({
  setVisible,
  reloadData,
  modal = false,
}: TKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 600,
    height: isMobile == true ? deviceHeight : 800,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
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
  }, []);

  const onChangePostion = (position: any) => {
    setWebHeight(
      getWindowDeviceHeight(true, position.height) - height - height2 - height3
    );
    setPosition(position);
  };
  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };
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
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    name: "",
    pgNum: 1,
    find_row_value: "",
    isSearch: true,
  });

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters = {
      para:
        "icons?page=" +
        filters.pgNum +
        "&pageSize=" +
        filters.pgSize +
        "&name=" +
        filters.name,
    };

    try {
      data = await processApi<any>("icons", parameters);
    } catch (error) {
      data = null;
    }
    let idx = 0;
    if (data.RowCount > 0) {
      const totalRowCnt = data.TotalRowCount;
      const rows = data.Rows.map((item: any) => ({
        ...item,
        num: idx++,
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  useEffect(() => {
    if (filters.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
  };

  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onConfirmClick = (props: any) => {
    const rowData = mainDataResult.data.find(
      (row: any) =>
        row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    );

    // 부모로 데이터 전달, 창 닫기
    reloadData(rowData);
    onClose();
  };

  const onRowDoubleClick = (props: any) => {
    const datas = props.dataItem;
    reloadData(datas);
    setVisible(false);
  };

  return (
    <div>
      <Window
        titles={"아이콘 등록/변경"}
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
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th>아이콘명</th>
                <td>
                  <Input
                    name="name"
                    type="text"
                    value={filters.name}
                    onChange={InputChange}
                  />
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </WindowFilterContainer>
        <GridContainer
          style={{
            overflow: "auto",
          }}
        >
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
            onRowDoubleClick={onRowDoubleClick}
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
          >
            <GridColumn
              field="icon_image"
              title="아이콘"
              width="120px"
              cell={ColumnCommandCell}
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="icon_word_text" title="아이콘명" width="120px" />
            <GridColumn field="remark" title="비고" width="200px" />
            <GridColumn
              field="category"
              title="유형분류"
              width="120px"
              headerCell={RequiredHeader}
            />
          </Grid>
        </GridContainer>
        <BottomContainer className="BottomContainer">
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={onConfirmClick}>
              확인
            </Button>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              취소
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
    </div>
  );
};

export default KendoWindow;
