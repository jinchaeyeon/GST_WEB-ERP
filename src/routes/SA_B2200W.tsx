import { DatePicker } from "@progress/kendo-react-dateinputs";
import { TitleContainer
       , Title
       , ButtonContainer
       , FilterBox
       , ButtonInInput
       , GridContainer
       , GridTitleContainer
       , GridTitle 
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import FilterContainer from "../components/Containers/FilterContainer";
import { Input, RadioButtonPropsContext } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Grid, GridColumn, GridDataStateChangeEvent, GridEvent, GridFooterCellProps, GridSelectionChangeEvent, getSelectedState } from "@progress/kendo-react-grid";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { COM_CODE_DEFAULT_VALUE, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { useEffect, useState } from "react";
import { UseCustomOption, chkScrollHandler, getQueryFromBizComponent, handleKeyPressSearch } from "../components/CommonFunction";
import { DataResult, State, process } from "@progress/kendo-data-query";
import React from "react";
import { TPermissions } from "../store/types";
import { getter } from "@progress/kendo-react-common";
import NumberCell from "../components/Cells/NumberCell";
import DateCell from "../components/Cells/DateCell";


const dateField = ["ymdfrdt", "ymdtodt"];
const DATA_ITEM_KEY = "num";
const numberField = [
  "qty",
  "outqty",
  "reqty",
  "saleqty",
  "unp",
  "amt",
  "wonamt",
  "taxamt",
  "dlramt",
  "wgt",
  "totwgt",
  "unitwgt",
];

const SA_B2200 : React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  const idGetter = getter(DATA_ITEM_KEY);
  //공통코드 리스트 조회 ()
  const [ordstsListData, setOrdstsListData] = useState([
      COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
      COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = React.useState([
      COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
      if (bizComponentData !== null) {
      const qtyunitQueryStr = getQueryFromBizComponent(
          bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const ordstsQueryStr = getQueryFromBizComponent(
          bizComponentData.find((item: any) => item.bizComponentId === "L_SA002")
      );
      const itemacntQueryStr = getQueryFromBizComponent(
          bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );

      }
  }, [bizComponentData]);
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
      setMainDataState(event.dataState);
    };  

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);  
  const pathname: string = window.location.pathname.replace("/", "");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //그리드 리셋
  const resetAllGrid = () => {
      setMainDataResult(process([], mainDataState));
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
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
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
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

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
  setItemWindowVisible(true);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

  const search = () => {
    resetAllGrid();
  }

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

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
    
    //조회조건 초기값
    const [filters, setFilters] = useState({
        pgSize: PAGE_SIZE,
        orgdiv: "01",
        location: "01",
        ymdFrdt: new Date(),
        ymdTodt: new Date(),
        itemcd: "",
        itemnm: "",
        cboItemacnt: "",
        poregnum: "",
        radFinyn: "%",
        cboOrdsts: "",
        custcd: "",
        custnm: "",
        project: "",
        ordnum: "",
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
    });

    return (
      <>
        <TitleContainer> 
          <Title>수주현황조회</Title>
          <ButtonContainer>
            {permissions && (
              <TopButtons
                search={search}
                exportExcel={exportExcel}
                permissions={permissions}
              />
            )}
          </ButtonContainer>
        </TitleContainer>        
        <FilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
              <th>수주일자</th>
              <td colSpan={3}>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="ymdFrdt"
                    value={filters.ymdFrdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                  />
                  ~
                  <DatePicker
                    name="ymdTodt"
                    value={filters.ymdTodt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                  />
                </div>
              </td>
              <th>품목</th>
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
              <th>품목계정</th>
              <td>
              {/* {customOptionData !== null && (
                <CustomOptionComboBox 
                  name="cboItemacnt"
                  value={filters.cboItemacnt} 
                  customOptionData={customOptionData} 
                  changeData={filterComboBoxChange}                  
                />
              )} */}
              </td>
              <th>PO번호</th>
              <td>
                <Input
                  name="poregnum"
                  type="text"
                  value={filters.poregnum}
                  onChange={filterInputChange}
                  />
              </td>
              <th>수주번호</th>
              <td>
                <Input
                  name="ordnum"
                  type="text"
                  value={filters.ordnum}
                  onChange={filterInputChange}
                  />
              </td>
              </tr>
              <tr>
              <th>완료여부</th>
              <td>
                {/* {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="radFinyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                    />
                    )} */}
              </td>
              <th>업체</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                    />
                </ButtonInInput>
              </td>
              <th>업체명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>수주상태</th>
              <td>
                {/* {customOptionData !== null && (
                  <CustomOptionComboBox
                  name="cboOrdsts"
                  value={filters.cboOrdsts}
                  customOptionData={customOptionData}
                  changeData={filterComboBoxChange}
                  />
                )} */}
              </td>
              <th>프로젝트</th>
              <td>
                <Input
                  name="project"
                  type="text"
                  value={filters.project}
                  onChange={filterInputChange}
                  />
              </td>           
              </tr>
            </tbody>
          </FilterBox> 
        </FilterContainer>
        <GridContainer>
          <GridTitle>요약정보</GridTitle>
        </GridContainer>
        <Grid 
          style={{ height: "70vh" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              ordsts: ordstsListData.find(
                (item: any) => item.sub_code === row.ordsts
              )?.code_name,
              itemacnt: itemacntListData.find(
                (item: any) => item.sub_code === row.itemacnt
              )?.code_name,
              qtyunit: qtyunitListData.find(
                (item: any) => item.sub_code === row.qtyunit
              )?.code_name,
              [SELECTED_FIELD]: selectedState[idGetter(row)],
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
          onSelectionChange={onSelectionChange}
          //스크롤 조회 기능
          fixedScroll={true}
          total={mainDataResult.total}
          onScroll={onMainScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
        >
          {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
                          : undefined
                      }
                      footerCell={
                        item.fieldName == "ordkey"
                          ? mainTotalFooterCell
                          : undefined
                      }
                      locked={item.fixed === "None" ? false : true}
                    ></GridColumn>
                  )
              )}
        </Grid>
      </>
    )
};

export default SA_B2200;
