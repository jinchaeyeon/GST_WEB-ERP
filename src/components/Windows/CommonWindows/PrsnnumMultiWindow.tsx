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
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isFilterHideState2, isLoading } from "../../../store/atoms";
import { Iparameters, TPermissions } from "../../../store/types";
import {
  UseBizComponent,
  UsePermissions,
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch,
} from "../../CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import WindowFilterContainer from "../../Containers/WindowFilterContainer";
import Window from "../WindowComponent/Window";
type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void;
  workType: string;
  para?: Iparameters;
  modal?: boolean;
};

const DATA_ITEM_KEY = "user_id";
const KEEPING_DATA_ITEM_KEY = "idx";
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
const KendoWindow = ({
  setVisible,
  workType,
  setData,
  para,
  modal = false,
}: IKendoWindow) => {
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
    left: isMobile == true ? 0 : (deviceWidth - 600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 600,
    height: isMobile == true ? deviceHeight : 900,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
    height3 = getHeight(".BottomContainer"); //하단 버튼부분
    height4 = getHeight(".WindowButtonContainer");

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height2 - height3 - height4
    );
    setMobileHeight2(
      getWindowDeviceHeight(false, deviceHeight) -
        height -
        height2 -
        height3 -
        height4
    );
    setWebHeight(
      (getWindowDeviceHeight(false, position.height) -
        height -
        height2 -
        height3) /
        2
    );
    setWebHeight2(
      (getWindowDeviceHeight(false, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height4
    );
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      (getWindowDeviceHeight(false, position.height) -
        height -
        height2 -
        height3) /
        2
    );
    setWebHeight2(
      (getWindowDeviceHeight(false, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height4
    );
  };

  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);

  const setLoading = useSetRecoilState(isLoading);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA026,R_USEYN",
    //업체구분, 사용여부,
    setBizComponentData
  );
  const initialPageState = { skip: 0, take: PAGE_SIZE };
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
  const [page, setPage] = useState(initialPageState);
  const idGetter = getter(DATA_ITEM_KEY);
  const keepingIdGetter = getter(KEEPING_DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [keepingSelectedState, setKeepingSelectedState] = useState<{
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

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };

  const processApi = useApi();
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [keepingDataState, setKeepingDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [keepingDataResult, setKeepingDataResult] = useState<DataResult>(
    process([], keepingDataState)
  );
  //조회조건 초기값
  const [filters, setFilters] = useState({
    dptcd: "",
    orgdiv: "",
    rtrchk: "Y",
    user_id: "",
    user_name: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //요약정보 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //팝업 조회 파라미터
    const parameters = {
      para:
        "popup-data?id=" +
        "P_USERS" +
        "&page=" +
        filters.pgNum +
        "&pageSize=" +
        PAGE_SIZE,
      dptcd: filters.dptcd,
      orgdiv: filters.orgdiv,
      rtrchk: filters.rtrchk,
      user_id: filters.user_id,
      user_name: filters.user_name,
    };
    try {
      data = await processApi<any>("popup-data", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.data.TotalRowCount;
      const rows = data.data.Rows;
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
      console.log("[오류 발생]");
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
    if (filters.isSearch && permissions.view && bizComponentData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onKeepingDataStateChange = (event: GridDataStateChangeEvent) => {
    setKeepingDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onKeepingSortChange = (e: any) => {
    setKeepingDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onRowDoubleClick = (props: any) => {
    const selectedData = props.dataItem;
    setKeepingSelectedState({ [keepingDataResult.data.length + 1]: true });

    setKeepingDataResult((prev) => {
      return {
        data: [
          ...prev.data,
          ...[{ ...selectedData, idx: keepingDataResult.data.length + 1 }],
        ],
        total: prev.total + 1,
      };
    });
  };

  const onRemoveKeepingRow = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    keepingDataResult.data.forEach((item: any, index: number) => {
      if (!keepingSelectedState[item[KEEPING_DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = keepingDataResult.data[Math.min(...Object2)];
    } else {
      data = keepingDataResult.data[Math.min(...Object) - 1];
    }
    setKeepingDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setKeepingSelectedState({
      [data != undefined ? data[KEEPING_DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onConfirmClick = (props: any) => {
    setData(keepingDataResult.data);
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

  const onKeepingSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: keepingSelectedState,
      dataItemKey: KEEPING_DATA_ITEM_KEY,
    });

    setKeepingSelectedState(newSelectedState);
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
  const keepingTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = keepingDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {keepingDataResult.total == -1
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
      isSearch: true,
    }));
  };

  return (
    <Window
      titles={"사용자리스트"}
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
              <th>사용자 ID</th>
              <td>
                <Input
                  name="user_id"
                  type="text"
                  value={filters.user_id}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자 이름</th>
              <td>
                <Input
                  name="user_name"
                  type="text"
                  value={filters.user_name}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </WindowFilterContainer>
      <GridContainer style={{ width: "100%" }}>
        <Grid
          style={{ height: isMobile ? mobileheight : webheight }}
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
          //더블클릭
          onRowDoubleClick={onRowDoubleClick}
        >
          <GridColumn
            field="user_id"
            title="사용자 ID"
            width="250px"
            footerCell={mainTotalFooterCell}
          />

          <GridColumn field="user_name" title="사용자 이름" width="250px" />
        </Grid>
      </GridContainer>
      <GridContainer style={{ width: "100%" }}>
        <GridTitleContainer className="WindowButtonContainer">
          <GridTitle>Keeping</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: isMobile ? mobileheight2 : webheight2 }}
          data={process(
            keepingDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: keepingSelectedState[keepingIdGetter(row)], //선택된 데이터
            })),
            keepingDataState
          )}
          onDataStateChange={onKeepingDataStateChange}
          {...keepingDataState}
          //선택 기능
          dataItemKey={KEEPING_DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onKeepingSelectionChange}
          //스크롤 조회기능
          fixedScroll={true}
          total={keepingDataResult.total}
          //onScroll={onScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onKeepingSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          //더블클릭
          onRowDoubleClick={onRemoveKeepingRow}
        >
          <GridColumn
            field="user_id"
            title="사용자 ID"
            width="250px"
            footerCell={keepingTotalFooterCell}
          />

          <GridColumn field="user_name" title="사용자 이름" width="250px" />
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
