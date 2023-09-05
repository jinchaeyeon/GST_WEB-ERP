import { useEffect, useState, useCallback } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { IWindowPosition } from "../../hooks/interfaces";
import { useSetRecoilState } from "recoil";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { isLoading } from "../../store/atoms";
import { useApi } from "../../hooks/api";
import { 
  UseBizComponent, 
  UseCustomOption, 
  UseMessages, 
  chkScrollHandler, 
  getQueryFromBizComponent, 
  handleKeyPressSearch
} from "../CommonFunction";
import { COM_CODE_DEFAULT_VALUE, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { bytesToBase64 } from "byte-base64";
import { Iparameters } from "../../store/types";
import { 
  Grid, 
  GridColumn, 
  GridDataStateChangeEvent, 
  GridEvent, 
  GridFooterCellProps, 
  GridSelectionChangeEvent, 
  getSelectedState 
} from "@progress/kendo-react-grid";
import { 
  BottomContainer,
  ButtonContainer, 
  ButtonInInput, 
  FilterBox, 
  GridContainer, 
  GridTitle, 
  GridTitleContainer, 
  PrimaryP, 
  TitleContainer 
} from "../../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import FilterContainer from "../Containers/FilterContainer";
import { Input } from "@progress/kendo-react-inputs";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import NumberCell from "../Cells/NumberCell";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
};

const DATA_ITEM_KEY = "num";
const KEEPING_DATA_ITEM_KEY = "idx";
let temp = 0;

const ProdStockWindow = ({ setVisible, setData}: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1400,
    height: 880,
  });

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const keepingIdGetter = getter(KEEPING_DATA_ITEM_KEY);
  const processApi = useApi();
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [keepingSelectedState, setKeepingSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //메시지 조회
  const pathname: string = window.location.pathname.replace("/", "");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

   //customOptionData 조회 후 디폴트 값 세팅
   useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        div: defaultOption.find((item: any) => item.id === "div").valueCode,
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
  const [divListData, setDivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
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
      const divQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR300200")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA171")
      );
      const itemlvl2QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA172")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA173")
      );

      fetchQuery(divQueryStr, setDivListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

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

  const [isInitSearch, setIsInitSearch] = useState(false);

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
    const { value, name} = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top});
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
    setVisible(false);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: "01",
    location: "01",
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

  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    // 조회조건 세팅
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  // 그리드 데이터 조회
  const fetchMainGrid = async () => {
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
      }
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    };
    
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
  
      if (totalRowCnt > 0) 
      {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        setSelectedState({[rows[0][DATA_ITEM_KEY]]: true});
      }
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData !== null && isInitSearch === false) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters]);

  // 그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }))
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
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
        temp = item.num
      }
    });

    const selectRows = mainDataResult.data.filter(
      (item: any) => 
        item.num == Object.getOwnPropertyNames(selectedState)[0]
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

    setKeepingSelectedState({[newDataItem[KEEPING_DATA_ITEM_KEY]]: true});
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
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const keepTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {keepingDataResult.total}건
      </td>
    );
  }

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
    );
    
    if (sum != undefined) {
      var parts = sum.toString().split(".");
      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    keepingDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
    );

    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right"}}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
  };
  
  return (
    <Window
      title={"재고참조"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <TitleContainer style={{ float: "right"}}>
        <ButtonContainer>
          <Button
            onClick={search}
            icon="search"
            themeColor={"primary"}
          >
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e)=> handleKeyPressSearch(e, search)}>
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
      <GridContainer height={`calc(80% - 40%)`}>
        <GridTitleContainer>
          <GridTitle>재고리스트</GridTitle>
          <PrimaryP>※ 더블 클릭하여 품목 Keeping</PrimaryP>
        </GridTitleContainer>
        <Grid
          style={{ height: "250px"}}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              div: divListData.find(
                (item: any) => item.code === row.div
              )?.code_name,
              proccd: proccdListData.find(
                (item: any) => item.sub_code === row.proccd
              )?.code_name,
              qtyunit: qtyunitListData.find(
                (item: any) => item.sub_code === row.qtyunit
              )?.code_name,
              itemlvl1 : itemlvl1ListData.find(
                (item: any) => item.sub_code === row.itemlvl1
              )?.code_name,
              itemlvl2 : itemlvl2ListData.find(
                (item: any) => item.sub_code === row.itemlvl2
              )?.code_name,
              itemlvl3 : itemlvl3ListData.find(
                (item: any) => item.sub_code === row.itemlvl3
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
          onScroll={onMainScrollHandler}
          // 정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          // 컬럼순서조정
          reorderable={true}
          // 컬럼너비조정
          resizable={true}
          onRowDoubleClick={onRowDoubleClick}
        >
          <GridColumn field="div" title="구분" width="100px"/>
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
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>Keeping</GridTitle>
          <PrimaryP>※ 더블 클릭하여 Keeping 해제</PrimaryP>
        </GridTitleContainer>
        <Grid
          style={{ height: "250px"}}
          data={process(
            keepingDataResult.data.map((row) => ({
              ...row,
              div: divListData.find(
                (item: any) => item.code === row.div
              )?.code_name,
              proccd: proccdListData.find(
                (item: any) => item.sub_code === row.proccd
              )?.code_name,
              qtyunit: qtyunitListData.find(
                (item: any) => item.sub_code === row.qtyunit
              )?.code_name,
              itemlvl1 : itemlvl1ListData.find(
                (item: any) => item.sub_code === row.itemlvl1
              )?.code_name,
              itemlvl2 : itemlvl2ListData.find(
                (item: any) => item.sub_code === row.itemlvl2
              )?.code_name,
              itemlvl3 : itemlvl3ListData.find(
                (item: any) => item.sub_code === row.itemlvl3
              )?.code_name,
              [SELECTED_FIELD]: keepingSelectedState[keepingIdGetter(row)],   // 선택된 데이터
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
            footerCell={gridSumQtyFooterCell2}
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
  )
};

export default ProdStockWindow;