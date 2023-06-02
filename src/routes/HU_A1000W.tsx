import React, { useCallback, useEffect, useState, useRef } from "react";
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
} from "../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  UseBizComponent,
  UsePermissions,
  UseParaPc,
  UseGetValueFromSessionItem,
  UseCustomOption,
  UseMessages,
  getQueryFromBizComponent,
} from "../components/CommonFunction";
import DetailWindow from "../components/Windows/HU_A1000W_Window";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import {
  SELECTED_FIELD,
  EDIT_FIELD,
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
} from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { Button } from "@progress/kendo-react-buttons";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { bytesToBase64 } from "byte-base64";

const DATA_ITEM_KEY = "prsnnum";

const HU_A1000W: React.FC = () => {

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
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
        cboDptcd: defaultOption.find((item: any) => item.id === "cboDptcd")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  // BizComponentID 세팅
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_dptcd_001", setBizComponentData);

  //공통코드 리스트 조회 ()
  const [dptcdLstsListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const departmentQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      fetchQuery(departmentQueryStr, setdptcdListData);
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
    cboDptcd: "",
    prsnnum: "",
    prsnnm: "",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
    isCopy : true,
  });

  const [UserWindowVisible, setUserWindowVisible] = useState<boolean>(false);

  // 조회조건 사용자 버튼 팝업
  const onUserWndClick = () => {
    setUserWindowVisible(true);
  };

  //사용자정보 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setUserData = (data: IUserData) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };
  
  interface IUserData {
    prsnnum: string;
    prsnnm: string;
  }

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  
  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    ordnum: "",
  });
 
  const [isCopy, setIsCopy] = useState(false);  
  const [workType, setWorkType] = useState<"N" | "U">("N");

  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
    
  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.ordnum]: true });

      setDetailFilters((prev) => ({
        ...prev,
        location: rowData.location,
        ordnum: rowData.ordnum,
      }));

      setIsCopy(false);
      setWorkType("U");
      setDetailWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onEditClick}
          icon="edit"
          size={"small"}
        ></Button>
      </td>
    );
  };  
  
  let deletedMainRows: object[] = [];
  const search = () => {
    deletedMainRows = [];
  try {
        
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

  const onAddClick = () => {
    setIsCopy(false);
    setWorkType("N");
    setDetailWindowVisible(true);
  };
  const onDeleteClick = (e: any) => {
    // if (!window.confirm(questionToDelete)) {
    //   return false;
    }
    const reloadData = (workType: string) => {
      //수정한 경우 행선택 유지, 신규건은 첫번째 행 선택
      if (workType === "U") {
        setIfSelectFirstRow(false);
      } else {
        setIfSelectFirstRow(true);
      }
  
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
      }));
      fetchDetailGrid();
    };
    
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
    const [mainDataResult, setMainDataResult] = useState<DataResult>(
      process([], mainDataState)
    );
    const [detailDataResult, setDetailDataResult] = useState<DataResult>(
      process([], detailDataState)
    );
  
    const [mainPgNum, setMainPgNum] = useState(1);
  const [detailPgNum, setDetailPgNum] = useState(1);
  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setDetailPgNum(1);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  const fetchDetailGrid = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    }
    setLoading(false);
  };

  const detailParameters: Iparameters = {
    procedureName: "P_HU_A1000W_Q",
    pageNumber: 0,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": "",
      "@p_location": "",
      "@p_dtgb": "",
      "@p_frdt": "",
      "@p_todt": "",
      "@p_ordnum": detailFilters.ordnum,
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_itemcd": "",
      "@p_itemnm": "",
      "@p_person": "",
      "@p_finyn": "",
      "@p_dptcd": "",
      "@p_ordsts": "",
      "@p_doexdiv": "",
      "@p_ordtype": "",
      "@p_poregnum": "",
    },
  };


  return (
    <>
      <TitleContainer>
        <Title>인사관리</Title>
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
        <FilterBox>
          <tbody>
            <tr>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboDptcd"
                    value={filters.cboDptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th>사용자</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrchk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

        <GridContainer>        
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>       
              <ButtonContainer>
              <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  fillMode="outline"
                  icon="file-add"
                >
                  신규등록
                </Button>  
                <Button
                  onClick={onDeleteClick}
                  icon="delete"
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  삭제
                </Button>
              </ButtonContainer> 
            </GridTitleContainer>
            <Grid>
              <GridColumn cell={CommandCell} width="55px" />
              <GridColumn field="ordnum" title="부서" width="120px" />
              <GridColumn field="custnm" title="직위" width="120px" />
              <GridColumn field="ordsts" title="사번" width="150px" />
              <GridColumn field="doexdiv" title="성명" width="150px" />
              <GridColumn field="taxdiv" title="주민번호" width="200px" />    
              <GridColumn field="location" title="입사일" width="120px" />
              <GridColumn field="dptcd" title="퇴사일" width="120px" />
              <GridColumn field="person" title="내선번호" width="150px" />
              <GridColumn field="person" title="핸드폰번호" width="150px" />
            </Grid>
        </GridContainer>
        {detailWindowVisible && (
        <DetailWindow
          getVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          ordnum={detailFilters.ordnum}
          isCopy={isCopy}
          reloadData={reloadData}
          para={detailParameters}
        />
      )}
      {UserWindowVisible && (
        <UserWindow setVisible={setUserWindowVisible} setData={setUserData} />
      )}
    </>
  );
};

export default HU_A1000W;
