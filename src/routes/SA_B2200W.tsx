import { DatePicker } from "@progress/kendo-react-dateinputs";
import { TitleContainer, Title, ButtonContainer, FilterBox, ButtonInInput, GridContainer, GridTitleContainer, GridTitle } from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import FilterContainer from "../components/Containers/FilterContainer";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Grid, GridColumn, GridDataStateChangeEvent } from "@progress/kendo-react-grid";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { COM_CODE_DEFAULT_VALUE, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { useEffect, useState } from "react";
import { getQueryFromBizComponent, handleKeyPressSearch } from "../components/CommonFunction";
import { DataResult, State, process } from "@progress/kendo-data-query";
import React from "react";


const dateField = ["orddt", "dlvdt"];
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
    const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
    const [bizComponentData, setBizComponentData] = useState<any>(null);
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

    //그리드 리셋
    const resetAllGrid = () => {
        setMainDataResult(process([], mainDataState));
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    };

    const onItemWndClick = () => {
    setItemWindowVisible(true);
    };
    
    const [mainDataState, setMainDataState] = useState<State>({
        sort: [],
    });
    
    const [mainDataResult, setMainDataResult] = useState<DataResult>(
        process([], mainDataState)
        );    
    
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
              
            </ButtonContainer>
          </TitleContainer>
          <FilterContainer>

            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, "")}>
              <tbody>
                <tr>
                  <th>수주일자</th>
                  <td colSpan={3}>
                    <div className="filter-item-wrap">
                        <DatePicker
                        name="ymdFrdt"
                        value={filters.ymdFrdt}
                        format="yyyy-MM-dd"
                        //onChange={}
                        className="required"
                        placeholder=""
                      />
                      ~
                      <DatePicker
                        name="ymdTodt"
                        value={filters.ymdTodt}
                        format="yyyy-MM-dd"
                        //onChange={filterInputChange}
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
                      //onChange={filterInputChange}
                    />
                    <ButtonInInput>
                        <Button
                        //onClick={onItemWndClick}
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
                      //onChange={filterInputChange}
                    />
                  </td>
                  <th>품목계정</th>
                  <td>      
                  </td>
                  <th>PO번호</th>
                  <td>
                    <Input
                      name="poregnum"
                      type="text"
                      value={filters.poregnum}
                      //onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>완료여부</th>
                  <td>
                  </td>
                  <th>수주상태</th>
                  <td>
                  </td>
                  <th>업체</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters.custcd}
                      //onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        //onClick={onCustWndClick}
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
                      //onChange={filterInputChange}
                    />
                  </td>
                  <th>프로젝트</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
                      //onChange={filterInputChange}
                    />
                  </td>
                  <th>수주번호</th>
                  <td>
                    <Input
                      name="ordnum"
                      type="text"
                      value={filters.ordnum}
                      //onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
            
          </FilterContainer>
    
          <GridContainer>
            
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
                <Grid style={{ height: "70vh" }}
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
                        )?.code_name
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
                    //onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult.total}
                    //onScroll={onMainScrollHandler}
                    //정렬기능
                    sortable={true}
                    //onSortChange={onMainSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                />
              </GridTitleContainer>
          </GridContainer>
        </>
      );
};

export default SA_B2200;
