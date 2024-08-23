import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridFooterCellProps,
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
  chkScrollHandler,
  getBizCom,
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch,
} from "../../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../../CommonString";
import WindowFilterContainer from "../../Containers/WindowFilterContainer";
import Window from "../WindowComponent/Window";

type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: any): void;
  modal?: boolean;
};

const DATA_ITEM_KEY = "bookcd";
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
  }, []);

  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 570) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 570,
    height: isMobile == true ? deviceHeight : 800,
  });
  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(true, position.height) - height - height2 - height3
    );
  };
  const setLoading = useSetRecoilState(isLoading);

  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
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

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };

  const processApi = useApi();
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainPgNum, setMainPgNum] = useState(1);
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //조회조건 초기값
  const [filters, setFilters] = useState({
    bookcd: "",
    booknm: "",
  });

  //팝업 조회 파라미터
  const parameters = {
    para:
      "popup-data?id=" +
      "P_BOOK" +
      "&page=" +
      mainPgNum +
      "&pageSize=" +
      PAGE_SIZE,
    bookcd: filters.bookcd,
    booknm: filters.booknm,
  };

  useEffect(() => {
    if (permissions.view) {
      fetchMainGrid();
    }
  }, [mainPgNum, permissions]);

  //요약정보 조회
  const fetchMainGrid = async () => {
    if (!permissions.view) return;
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
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (rows.length > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
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
    const bookacnt = bookacntListData.find(
      (items: any) => items.code_name == props.dataItem.bookacnt
    )?.sub_code;
    // 부모로 데이터 전달, 창 닫기
    const rowData = {
      ...props.dataItem,
      bookacnt: bookacnt,
    };
    setData(rowData);
    onClose();
  };

  const onConfirmClick = (props: any) => {
    const rowData = mainDataResult.data.find(
      (row: any) => row[DATA_ITEM_KEY] == Object.keys(selectedState)[0]
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
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
  };

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CR070",
    //사용자, 교육구분
    setBizComponentData
  );

  const [bookacntListData, setBookacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setBookacntListData(getBizCom(bizComponentData, "L_CR070"));
    }
  }, [bizComponentData]);

  return (
    <Window
      titles={"도서 팝업"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <TitleContainer className="WindowTitleContainer">
        <Title />
        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
            }}
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
              <th>도서코드</th>
              <td>
                <Input
                  name="bookcd"
                  type="text"
                  value={filters.bookcd}
                  onChange={filterInputChange}
                />
              </td>
              <th>도서명</th>
              <td>
                <Input
                  name="booknm"
                  type="text"
                  value={filters.booknm}
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
          style={{
            height: isMobile ? mobileheight : webheight,
          }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              bookacnt: bookacntListData.find(
                (item: any) => item.sub_code == row.bookacnt
              )?.code_name,
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
            field="bookcd"
            title="도서코드"
            width="150px"
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="booknm" title="도서명" width="150px" />
          <GridColumn field="bookacnt" title="도서계정" width="150px" />
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
