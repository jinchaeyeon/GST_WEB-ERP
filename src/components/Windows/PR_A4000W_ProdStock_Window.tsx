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
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  PrimaryP,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IItemData, IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import NumberCell from "../Cells/NumberCell";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  getBizCom,
  handleKeyPressSearch,
  numberWithCommas,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import FilterContainer from "../Containers/FilterContainer";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  pathname: string;
  modal?: boolean;
};

const DATA_ITEM_KEY = "num";
const KEEPING_DATA_ITEM_KEY = "idx";
let temp = 0;

let targetRowIndex: null | number = null;

const ProdStockWindow = ({
  setVisible,
  setData,
  pathname,
  modal = false,
}: IWindow) => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const keepingIdGetter = getter(KEEPING_DATA_ITEM_KEY);
  const processApi = useApi();
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1400) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 880) / 2,
    width: isMobile == true ? deviceWidth : 1400,
    height: isMobile == true ? deviceHeight : 880,
  });

  const onChangePostion = (position: any) => {
    setPosition(position);
  };

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

  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        div: defaultOption.find((item: any) => item.id == "div")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR300200, L_BA015, L_PR010, L_BA171, L_BA172, L_BA173",
    // 구분, 단위, 공정, 대분류, 중분류, 소분류
    setBizComponentData
  );

  // 공통코드 리스트 조회
  const [divListData, setDivListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setDivListData(getBizCom(bizComponentData, "L_PR300200"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
    }
  }, [bizComponentData]);

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

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [keepingSelectedState, setKeepingSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setVisible(false);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    div: "",
    lotnum: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    proccd: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    // 조회조건 세팅
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  let gridRef: any = useRef(null);
  // 그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);

    // 조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A4000W_Sub1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_div": filters.div,
        "@p_lotnum": filters.lotnum,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_proccd": filters.proccd,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.rekey == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.num == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: false,
      }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  // 그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
    keepingDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const selectRows = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    const newDataItem = {
      [KEEPING_DATA_ITEM_KEY]: ++temp,
      div: selectRows.div,
      itemcd: selectRows.itemcd,
      itemnm: selectRows.itemnm,
      itemlvl1: selectRows.itemlvl1,
      itemlvl2: selectRows.itemlvl2,
      itemlvl3: selectRows.itemlvl3,
      insiz: selectRows.insiz,
      lotnum: selectRows.lotnum,
      proccd: selectRows.proccd,
      now_qty: selectRows.now_qty,
      qtyunit: selectRows.qtyunit,
    };

    setKeepingSelectedState({ [newDataItem[KEEPING_DATA_ITEM_KEY]]: true });
    setKeepingDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onRemoveKeepRow = () => {
    //삭제 안 할 데이터 newData에 push
    let newData: any[] = [];

    keepingDataResult.data.forEach((item: any) => {
      if (!keepingSelectedState[item[KEEPING_DATA_ITEM_KEY]]) {
        newData.push(item);
      }
    });

    setKeepingDataResult((prev) => {
      return {
        data: newData,
        total: prev.total - 1,
      };
    });
  };

  const onConfirmBtnClick = (props: any) => {
    setData(keepingDataResult.data);
    onClose();
  };

  // 메인 그래드 선택 이벤트
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
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const keepTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = keepingDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
  };

  return (
    <Window
      titles={"재고참조"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <TitleContainer style={{ float: "right" }}>
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
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
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
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="div"
                    value={filters.div}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="code_name"
                    valueField="code"
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>공정</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="proccd"
                    value={filters.proccd}
                    bizComponentId="L_PR010"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer height="33vh">
        <GridTitleContainer>
          <GridTitle>재고리스트</GridTitle>
          <PrimaryP>※ 더블 클릭하여 품목 Keeping</PrimaryP>
        </GridTitleContainer>
        <Grid
          style={{ height: "calc(100% - 40px)" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              div: divListData.find((item: any) => item.code == row.div)
                ?.code_name,
              proccd: proccdListData.find(
                (item: any) => item.sub_code == row.proccd
              )?.code_name,
              qtyunit: qtyunitListData.find(
                (item: any) => item.sub_code == row.qtyunit
              )?.code_name,
              itemlvl1: itemlvl1ListData.find(
                (item: any) => item.sub_code == row.itemlvl1
              )?.code_name,
              itemlvl2: itemlvl2ListData.find(
                (item: any) => item.sub_code == row.itemlvl2
              )?.code_name,
              itemlvl3: itemlvl3ListData.find(
                (item: any) => item.sub_code == row.itemlvl3
              )?.code_name,
              [SELECTED_FIELD]: selectedState[idGetter(row)], // 선택된 데이터
            })),
            mainDataState
          )}
          onDataStateChange={onMainDataStateChange}
          {...mainDataState}
          // 선택 기능
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onMainSelectionChange}
          // 스크롤 조회기능
          fixedScroll={true}
          total={mainDataResult.total}
          skip={page.skip}
          take={page.take}
          pageable={true}
          onPageChange={pageChange}
          // 정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          // 컬럼순서조정
          reorderable={true}
          // 컬럼너비조정
          resizable={true}
          onRowDoubleClick={onRowDoubleClick}
        >
          <GridColumn
            field="div"
            title="구분"
            width="100px"
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="itemcd" title="품목코드" width="120px" />
          <GridColumn field="itemnm" title="품목명" width="180px" />
          <GridColumn field="itemlvl1" title="대분류" width="100px" />
          <GridColumn field="itemlvl2" title="중분류" width="100px" />
          <GridColumn field="itemlvl3" title="소분류" width="100px" />
          <GridColumn field="insiz" title="규격" width="150px" />
          <GridColumn field="lotnum" title="LOT NO" width="150px" />
          <GridColumn field="proccd" title="공정" width="100px" />
          <GridColumn
            field="now_qty"
            title="재고량"
            width="100px"
            cell={NumberCell}
            footerCell={editNumberFooterCell}
          />
          <GridColumn field="qtyunit" title="단위" width="80px" />
        </Grid>
      </GridContainer>
      <GridContainer height="30vh">
        <GridTitleContainer>
          <GridTitle>Keeping</GridTitle>
          <PrimaryP>※ 더블 클릭하여 Keeping 해제</PrimaryP>
        </GridTitleContainer>
        <Grid
          style={{ height: "calc(100% - 40px)" }}
          data={process(
            keepingDataResult.data.map((row) => ({
              ...row,
              div: divListData.find((item: any) => item.code == row.div)
                ?.code_name,
              proccd: proccdListData.find(
                (item: any) => item.sub_code == row.proccd
              )?.code_name,
              qtyunit: qtyunitListData.find(
                (item: any) => item.sub_code == row.qtyunit
              )?.code_name,
              itemlvl1: itemlvl1ListData.find(
                (item: any) => item.sub_code == row.itemlvl1
              )?.code_name,
              itemlvl2: itemlvl2ListData.find(
                (item: any) => item.sub_code == row.itemlvl2
              )?.code_name,
              itemlvl3: itemlvl3ListData.find(
                (item: any) => item.sub_code == row.itemlvl3
              )?.code_name,
              [SELECTED_FIELD]: keepingSelectedState[keepingIdGetter(row)], // 선택된 데이터
            })),
            keepingDataState
          )}
          onDataStateChange={onKeepingDataStateChange}
          {...keepingDataState}
          // 선택 기능
          dataItemKey={KEEPING_DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onKeepingSelectionChange}
          // 스크롤 조회기능
          fixedScroll={true}
          total={keepingDataResult.total}
          // 정렬기능
          sortable={true}
          onSortChange={onKeepingSortChange}
          // 컬럼순서 조정
          reorderable={true}
          // 컬럼너비조정
          resizable={true}
          // 더블클릭
          onRowDoubleClick={onRemoveKeepRow}
        >
          <GridColumn
            field="div"
            title="구분"
            width="100px"
            footerCell={keepTotalFooterCell}
          />
          <GridColumn field="itemcd" title="품목코드" width="120px" />
          <GridColumn field="itemnm" title="품목명" width="180px" />
          <GridColumn field="itemlvl1" title="대분류" width="100px" />
          <GridColumn field="itemlvl2" title="중분류" width="100px" />
          <GridColumn field="itemlvl3" title="소분류" width="100px" />
          <GridColumn field="insiz" title="규격" width="150px" />
          <GridColumn field="lotnum" title="LOT NO" width="150px" />
          <GridColumn field="proccd" title="공정" width="100px" />
          <GridColumn
            field="now_qty"
            title="재고량"
            width="100px"
            cell={NumberCell}
          />
          <GridColumn field="qtyunit" title="단위" width="80px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            취소
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
        />
      )}
    </Window>
  );
};

export default ProdStockWindow;
