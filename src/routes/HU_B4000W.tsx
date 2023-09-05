import React, { useCallback, useEffect, useRef, useState ,createContext, } from "react";
import * as ReactDOM from "react-dom";
import {
    Grid,
    GridColumn,
    GridDataStateChangeEvent,
    GridEvent,
    GridSelectionChangeEvent,
    getSelectedState,
    GridFooterCellProps,
    GridCellProps,
    GridItemChangeEvent,
  } from "@progress/kendo-react-grid";
  import { DatePicker } from "@progress/kendo-react-dateinputs";
  import { ExcelExport } from "@progress/kendo-react-excel-export";
  import { getter } from "@progress/kendo-react-common";
  import { DataResult, process, State } from "@progress/kendo-data-query";
  import {
    Title,
    FilterBox,
    GridContainer,
    GridTitle,
    TitleContainer,
    ButtonContainer,
    GridTitleContainer,
    ButtonInInput,
    GridContainerWrap,
    FormBox,
    FormBoxWrap,
  } from "../CommonStyled";
  import { Input } from "@progress/kendo-react-inputs";
  import FilterContainer from "../components/Containers/FilterContainer";
  import { useApi } from "../hooks/api";
  import { Iparameters, TPermissions,TColumn, TGrid } from "../store/types";
  import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
  import {
    chkScrollHandler,
    convertDateToStr,
    UseBizComponent,
    UsePermissions,
    UseParaPc,
    UseGetValueFromSessionItem,
    UseCustomOption,
    UseMessages,
    getQueryFromBizComponent,
    findMessage,
    toDate,
    dateformat2,
    dateformat,
    isValidDate,
  } from "../components/CommonFunction";
  import DateCell from "../components/Cells/DateCell";
  import NumberCell from "../components/Cells/NumberCell";
  import { gridList } from "../store/columns/HU_B4001W_C";

  import {
    SELECTED_FIELD,
    COM_CODE_DEFAULT_VALUE,
    PAGE_SIZE,
    GAP,
  } from "../components/CommonString";
  import TopButtons from "../components/Buttons/TopButtons";
  import { useSetRecoilState } from "recoil";
  import { isLoading } from "../store/atoms";
  import Calendar from "../components/Calendars/Calendar";
  import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
  import { bytesToBase64 } from "byte-base64";
  const HU_B4000W: React.FC = () => {

    const setLoading = useSetRecoilState(isLoading);
    const processApi = useApi();
    const userId = UseGetValueFromSessionItem("user_id");  
    const pathname: string = window.location.pathname.replace("/", ""); 
    const [permissions, setPermissions] = useState<TPermissions | null>(null);
    UsePermissions(setPermissions);
  

    const [tabSelected, setTabSelected] = React.useState(0);
    
    const handleSelectTab = (e: any) => {
      setTabSelected(e.selected);
    };

    const search = () => {
      try {    
          // resetAllGrid();
          // setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      
        } catch (e) {
        alert(e);
      }
    };
  
    //엑셀 내보내기
    let _export: ExcelExport | null | undefined;
    const exportExcel = () => {
      if (_export !== null && _export !== undefined) {
        _export.save();
      }
    };

    
    return (
      <>
        <TitleContainer>
          <Title style={{ height: "10%" }}>연차사용현황(관리자))</Title>
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
          <FilterBox style={{ height: "10%" }}>
            <colgroup>
              <col width="0%" />
              <col width="15%" />
              <col width="0%" />
              <col width="20%" />
              <col width="0%" />
              <col width="20%" />
              <col width="30%" />
            </colgroup>
            <tbody>
              <tr>
                <th>기준일</th>
                <td>
                  {/* <DatePicker
                    name="ymdFrdt"
                    value={filters.ymdFrdt}
                    format="yyyy-MM-dd"
                    onChange={InputChange}
                    className="required"
                    placeholder=""
                    calendar={Calendar}
                  /> */}
                </td>
                <th> 성명</th>
                <td>
                  {/* {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="cboPrsnnum"
                      value={filters.cboPrsnnum}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      textField="user_name"
                      valueField="user_id"
                      className="required"
                    />
                  )} */}
                </td>
                <th>재직여부</th>
                <td></td>
                <th></th>
              </tr>
            </tbody>
          </FilterBox>
        </FilterContainer>

        <GridContainer
          style={{
            height: "40vh",
          }}
        >
          <TabStrip
            selected={tabSelected}
            onSelect={handleSelectTab}
            style={{ width: "100%" }}
          >
            <TabStripTab title="연차사용현황">
              <GridContainerWrap>
                
                <GridContainer width={`25%`}>
                  <GridTitleContainer>
                    <GridTitle style={{ height: "10%" }}>
                      사용자별 연차 집계
                    </GridTitle>
                  </GridTitleContainer>
                  <Grid
                  style={{height : "70vh"}}
                  >
                  </Grid>
                </GridContainer>

                <GridContainer width={"15%"}>
                  <GridTitleContainer>
                    <GridTitle style={{ height: "10%"  }}>
                      연차상세
                    </GridTitle>
                  </GridTitleContainer>
                  <Grid
                  style={{height : "70vh"}}
                  ></Grid>
                </GridContainer>
                
                <GridContainer width={"60%"}>
                 
                 <GridContainer>
                 <GridTitleContainer>
                    <GridTitle style={{ height: "10%"  }}>
                      출퇴근부
                    </GridTitle>
                  </GridTitleContainer>
                  <Grid
                  style={{height : "20vh"}}></Grid>
                 </GridContainer>

                 <GridContainer>
                 <GridTitleContainer>
                    <GridTitle style={{ height: "10%"  }}>
                      일지상세
                    </GridTitle>
                  </GridTitleContainer>
                  <Grid
                  style={{height : "46vh"}}></Grid>
                 </GridContainer>
                
                </GridContainer>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab title="연차조정"></TabStripTab>
          </TabStrip>
        </GridContainer>
      </>
    );
  };

  export default HU_B4000W;