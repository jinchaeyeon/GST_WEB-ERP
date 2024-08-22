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
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IItemData, IWindowPosition } from "../../../hooks/interfaces";
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
import BizComponentRadioGroup from "../../RadioGroups/BizComponentRadioGroup";
import Window from "../WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: IItemData[]): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};
const DATA_ITEM_KEY = "itemcd";
const KEEPING_DATA_ITEM_KEY = "idx";
let targetRowIndex: null | number = null;
let temp = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
const ItemsMultiWindow = ({ setVisible, setData, modal = false }: IWindow) => {
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
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 900,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
    height3 = getHeight(".BottomContainer"); //하단 버튼부분
    height4 = getHeight(".WindowButtonContainer");
    height5 = getHeight(".WindowButtonContainer2");
    setMobileHeight(
      getWindowDeviceHeight(true, deviceHeight) - height - height2 - height3
    );
    setWebHeight(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height4
    );
    setMobileHeight2(
      getWindowDeviceHeight(true, deviceHeight) - height - height2 - height3
    );
    setWebHeight2(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height5
    );
  }, []);
  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height4
    );
    setWebHeight2(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height5
    );
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const keepingIdGetter = getter(KEEPING_DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [keepingSelectedState, setKeepingSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

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

  const onClose = () => {
    temp = 0;
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

  const [filters, setFilters] = useState({
    itemcd: "",
    itemnm: "",
    insiz: "",
    bnatur: "",
    spec: "",
    itemacnt: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    custcd: "",
    custnm: "",
    dwgno: "",
    useyn: "%",
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
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  let gridRef: any = useRef(null);

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
        "P_ITEMCD" +
        "&page=" +
        filters.pgNum +
        "&pageSize=" +
        filters.pgSize,
      itemcd: filters.itemcd,
      itemnm: filters.itemnm,
      insiz: filters.insiz,
      useyn:
        filters.useyn == "Y" ? "Y" : filters.useyn == "N" ? "N" : "",
    };
    try {
      data = await processApi<any>("popup-data", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.data.TotalRowCount;
      const rows = data.data.Rows.map((item: any) => ({
        ...item,
        idx: temp++,
      }));

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
    setMainDataResult(process([], {}));
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
    keepingDataResult.data.map((item) => {
      if (item[KEEPING_DATA_ITEM_KEY] > temp) {
        temp = item[KEEPING_DATA_ITEM_KEY];
      }
    });

    const newDataItem = {
      [KEEPING_DATA_ITEM_KEY]: ++temp,
      bnatur: selectedData.bnatur,
      color: selectedData.color,
      custitemnm: selectedData.custitemnm,
      dwgno: selectedData.dwgno,
      extra_field1: selectedData.extra_field1,
      extra_field2: selectedData.extra_field2,
      extra_field6: selectedData.extra_field6,
      extra_field7: selectedData.extra_field7,
      extra_field8: selectedData.extra_field8,
      gubun: selectedData.gubun,
      insiz: selectedData.insiz,
      invunit: selectedData.invunit,
      invunitnm: selectedData.invunitnm,
      itemacnt: selectedData.itemacnt,
      itemacntnm: selectedData.itemacntnm,
      itemcd: selectedData.itemcd,
      itemlvl1: selectedData.itemlvl1,
      itemlvl1nm: selectedData.itemlvl1nm,
      itemlvl2: selectedData.itemlvl2,
      itemlvl2nm: selectedData.itemlvl2nm,
      itemlvl3: selectedData.itemlvl3,
      itemlvl3nm: selectedData.itemlvl3nm,
      itemlvl4: selectedData.itemlvl4,
      itemlvl5: selectedData.itemlvl5,
      itemnm: selectedData.itemnm,
      itemno: selectedData.itemno,
      itemthick: selectedData.itemthick,
      load_place_601: selectedData.load_place_601,
      maker: selectedData.maker,
      model: selectedData.model,
      outside: selectedData.outside,
      packingsiz: selectedData.packingsiz,
      prodline: selectedData.prodline,
      qcyn: selectedData.qcyn,
      remark: selectedData.remark,
      spec: selectedData.spec,
      unitqty: selectedData.unitqty,
      unitwgt: selectedData.unitwgt,
      useyn: selectedData.useyn,
      wgtunit: selectedData.wgtunit,
      wgtunitnm: selectedData.wgtunitnm,
      rowstatus: "N",
    };

    setKeepingSelectedState({ [newDataItem[KEEPING_DATA_ITEM_KEY]]: true });

    setKeepingDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
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

  const onConfirmBtnClick = (props: any) => {
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
  //그리드 푸터
  const keepingTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = keepingDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
      find_row_value: "",
      isSearch: true,
    }));
  };

  return (
    <Window
      titles={"품목참조(멀티)"}
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

              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용여부</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentRadioGroup
                    name="useyn"
                    value={filters.useyn}
                    bizComponentId="R_USEYN"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
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
        <GridTitleContainer className="WindowButtonContainer">
          <GridTitle>품목리스트</GridTitle>
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
          <GridColumn field="insiz" title="규격" width="120px" />
          <GridColumn field="model" title="MODEL" width="120px" />
          <GridColumn field="spec" title="사양" width="120px" />
          <GridColumn field="itemacntnm" title="품목계정" width="120px" />
          <GridColumn field="bnatur" title="재질" width="120px" />
          <GridColumn field="invunitnm" title="수량단위" width="120px" />
          <GridColumn field="unitwgt" title="단중" width="120px" />
          <GridColumn field="useyn" title="사용여부" width="120px" />
          <GridColumn field="wgtunitnm" title="중량단위" width="120px" />
          <GridColumn field="maker" title="메이커" width="120px" />
          <GridColumn field="remark" title="비고" width="120px" />
        </Grid>
      </GridContainer>
      <GridContainer
        style={{
          overflow: "auto",
        }}
      >
        <GridTitleContainer className="WindowButtonContainer2">
          <GridTitle>Keeping</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{
            height: isMobile ? mobileheight2 : webheight2,
          }}
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
            field="itemcd"
            title="품목코드"
            width="150px"
            footerCell={keepingTotalFooterCell}
          />
          <GridColumn field="itemnm" title="품목명" width="150px" />
          <GridColumn field="insiz" title="규격" width="120px" />
          <GridColumn field="model" title="MODEL" width="120px" />
          <GridColumn field="spec" title="사양" width="120px" />
          <GridColumn field="itemacntnm" title="품목계정" width="120px" />
          <GridColumn field="bnatur" title="재질" width="120px" />
          <GridColumn field="invunitnm" title="수량단위" width="120px" />
          <GridColumn field="unitwgt" title="단중" width="120px" />
          <GridColumn field="useyn" title="사용여부" width="120px" />
          <GridColumn field="wgtunitnm" title="중량단위" width="120px" />
          <GridColumn field="maker" title="메이커" width="120px" />
          <GridColumn field="remark" title="비고" width="120px" />
        </Grid>
      </GridContainer>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            취소
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default ItemsMultiWindow;
