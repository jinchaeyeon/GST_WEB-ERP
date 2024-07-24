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
import NumberCell from "../../Cells/NumberCell";
import BizComponentComboBox from "../../ComboBoxes/BizComponentComboBox";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UsePermissions,
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch,
} from "../../CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import WindowFilterContainer from "../../Containers/WindowFilterContainer";
import BizComponentRadioGroup from "../../RadioGroups/BizComponentRadioGroup";
import Window from "../WindowComponent/Window";
type IWindow = {
  workType: "FILTER" | "ROW_ADD" | "ROWS_ADD";
  Close(): void;
  setData(data: object): void; // 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  yn?: boolean;
};

const DATA_ITEM_KEY = "itemcd";
let targetRowIndex: null | number = null;
var height = 0;
var height2 = 0;
var height3 = 0;

const ItemWindow_FNF = ({
  workType,
  Close,
  setData,
  modal = false,
  yn = false,
}: IWindow) => {
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
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });
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
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(true, position.height) - height - height2 - height3
    );
  };

  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const setLoading = useSetRecoilState(isLoading);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA067, R_ITEMTREAT_628, L_BA061",
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

  const filterComboChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setisFilterHideStates2(true);
    Close();
  };

  const processApi = useApi();

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionCustcd = UseGetValueFromSessionItem("custcd");
  const [filters, setFilters] = useState({
    itemcd: "",
    itemnm: "",
    itemdiv: "",
    spec: "",
    specsize: "",
    gubun: "2",
    itemsts: "",
    itemacnt: "",
    orgdiv: sessionOrgdiv,
    custcd: sessionCustcd,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

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

  let gridRef: any = useRef(null);
  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (filters.isSearch && permissions.view && bizComponentData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData]);

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //팝업 조회 파라미터
    const parameters = {
      para:
        "popup-data?id=" +
        "P_ITEMCD_W_628" +
        "&page=" +
        filters.pgNum +
        "&pageSize=" +
        filters.pgSize,
      itemcd: filters.itemcd,
      itemnm: filters.itemnm,
      itemdiv: filters.itemdiv,
      spec: filters.spec,
      specsize: filters.specsize == "" ? 0 : filters.specsize,
      gubun: filters.gubun,
      itemsts: filters.itemsts,
      itemacnt: filters.itemacnt,
      orgdiv: filters.orgdiv,
      custcd: filters.custcd,
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
    const selectedData = props.dataItem;
    selectData(selectedData);
  };

  // 부모로 데이터 전달, 창 닫기 (여러 행을 추가하는 경우 Close 제외)
  const selectData = (selectedData: any) => {
    setData(selectedData);
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
      find_row_value: "",
      isSearch: true,
    }));
  };

  return (
    <Window
      titles={"품목마스터"}
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
              <th>품목구분</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentRadioGroup
                    name="gubun"
                    value={filters.gubun}
                    bizComponentId="R_ITEMTREAT_628"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
              </td>

              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>품목계정</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="itemacnt"
                    value={filters.itemacnt}
                    bizComponentId="L_BA061"
                    bizComponentData={bizComponentData}
                    changeData={filterComboChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>규격</th>
              <td>
                <Input
                  name="specsize"
                  type="number"
                  value={filters.specsize}
                  onChange={filterInputChange}
                />
              </td>
              <th>상태구분</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="itemsts"
                    value={filters.itemsts}
                    bizComponentId="L_BA067"
                    bizComponentData={bizComponentData}
                    changeData={filterComboChange}
                  />
                )}
              </td>
              <th>형태</th>
              <td>
                <Input
                  name="itemdiv"
                  type="text"
                  value={filters.itemdiv}
                  onChange={filterInputChange}
                />
              </td>
              <th>사이즈</th>
              <td>
                <Input
                  name="spec"
                  type="text"
                  value={filters.spec}
                  onChange={filterInputChange}
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
          //스크롤 조회기능
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
          <GridColumn
            field="itemcd"
            title="품목코드"
            width="150px"
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="itemnm" title="품목명" width="150px" />
          <GridColumn field="itemtypenm" title="형태" width="120px" />
          <GridColumn field="spec" title="사이즈" width="150px" />
          <GridColumn
            field="bnatur_insiz"
            title="규격"
            width="100px"
            cell={NumberCell}
          />
          <GridColumn field="itemacntnm" title="계정" width="120px" />
          <GridColumn
            field="unitwgt"
            title="단위중량"
            width="100px"
            cell={NumberCell}
          />
          <GridColumn
            field="numref1"
            title="변환계수"
            width="100px"
            cell={NumberCell}
          />
        </Grid>
      </GridContainer>
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

export default ItemWindow_FNF;
