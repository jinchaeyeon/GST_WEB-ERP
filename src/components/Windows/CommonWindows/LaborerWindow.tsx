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
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isFilterHideState2, isLoading } from "../../../store/atoms";
import { TPermissions } from "../../../store/types";
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
interface IPrsnnumMulti {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: IPrsnnumMulti): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};

const DATA_ITEM_KEY = "prsnnum";
var height = 0;
var height2 = 0;
var height3 = 0;

const LaborerWindow = ({ setVisible, setData, modal = false }: IWindow) => {
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
    top: isMobile == true ? 0 : (deviceHeight - 600) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 600,
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
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(true, position.height) - height - height2 - height3
    );
  };

  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_RTR",
    //사용여부,
    setBizComponentData
  );
  const initialPageState = { skip: 0, take: PAGE_SIZE };
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

  const [filters, setFilters] = useState({
    orgdiv: "",
    prsnnum: "",
    prsnnm: "",
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;

    let data: any;
    setLoading(true);
    //팝업 조회 파라미터
    const parameters = {
      para:
        "popup-data?id=" +
        "P_HU600T" +
        "&page=" +
        filters.pgNum +
        "&pageSize=" +
        PAGE_SIZE,
      prsnnum: filters.prsnnum,
      prsnnm: filters.prsnnm,
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onRowDoubleClick = (props: any) => {
    const selectedData = props.dataItem;
    selectData(selectedData);
  };

  const onConfirmBtnClick = (props: any) => {
    const selectedData = mainDataResult.data.find(
      (row: any) => row[DATA_ITEM_KEY] == Object.keys(selectedState)[0]
    );
    selectData(selectedData);
  };

  // 부모로 데이터 전달, 창 닫기 (여러 행을 추가하는 경우 Close 제외)
  const selectData = (selectedData: any) => {
    setData(selectedData);
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
      titles={"일용직 사원LIST"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <TitleContainer className="WindowTitleContainer">
        <Title></Title>
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
              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>성명</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </WindowFilterContainer>
      <GridContainer style={{ overflow: "auto" }}>
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
          //스크롤 조회기능
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
            field="prsnnum"
            title="사번"
            width="200px"
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="prsnnm" title="성명" width="200px" />
          <GridColumn field="dptnm" title="부서코드" width="130px" />
          <GridColumn field="abilnm" title="직책" width="120px" />
          <GridColumn field="postnm" title="직위" width="120px" />
          <GridColumn field="regorgdtFormat" title="입사일" width="120px" />
          <GridColumn field="rtrdtFormat" title="퇴사일" width="120px" />
        </Grid>
      </GridContainer>
      <BottomContainer className="BottomContainer">
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

export default LaborerWindow;
