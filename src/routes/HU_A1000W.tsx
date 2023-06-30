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
  findMessage,
  toDate
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
import { filter } from "@progress/kendo-data-query/dist/npm/transducers";
import DateCell from "../components/Cells/DateCell";

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

  const [isCopy, setIsCopy] = useState(false);
  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

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
        rtrchk: defaultOption.find((item: any) => item.id === "rtrchk")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  // BizComponentID 세팅
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001, L_HU005",
    // 부서, 직위
    setBizComponentData
  );  

  //공통코드 리스트 조회 ()
  const [dptcdLstsListData, setDptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);

  const [postcdListData, setPostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);


  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_HU005"
        )
      );
      fetchQuery(dptcdQueryStr,  setDptcdListData);
      fetchQuery(postcdQueryStr, setPostcdListData);
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

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //선택 상태
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
    work_type: "LIST",
    orgdiv: "",
    location: "",
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "", // 재직여부
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
    isCopy: true,
    find_row_value: "",
    pgSize: PAGE_SIZE,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    prsnnum: "",
  });  

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_HU_A1000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_dptcd": filters.dptcd,
      "@p_prsnnum": filters.prsnnum,
      "@p_prsnnm": filters.prsnnm,
      "@p_rtrchk": filters.rtrchk,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);  
  
  const search = () => {
    try {
      resetAllGrid();
    } catch (e) {
      alert(e);
    }
  };

  const CommandCell = (props: GridCellProps) => {
 
    const onEditClick = () => {      
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.prsnnum]: true });

      setDetailFilters((prev) => ({
        ...prev,
       prsnnum: rowData.prsnnum,
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
        ></Button>
      </td>
    );
  };

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
    
    fetchMainGrid();
  };

  // 신규등록 
  const onAddClick = () => {
    setIsCopy(false);
    setWorkType("N");
    setDetailWindowVisible(true);
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
        <Title style={{ height: "10%" }}>인사관리</Title>
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
          <tbody>
            <tr>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboDptcd"
                    value={filters.dptcd}
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
                    // onClick={onUserWndClick}
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
          <GridTitle style={{ height: "10%" }}>요약정보</GridTitle>
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
              // onClick={onDeleteClick}
              icon="delete"
              fillMode="outline"
              themeColor={"primary"}
            >
              삭제
            </Button>
          </ButtonContainer>
        </GridTitleContainer>
        <Grid
          style={{ height: "70%" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              dptcd: dptcdLstsListData.find(
                (item: any) => item.dptcd === row.dptcd
              )?.dptnm,
              postcd: postcdListData.find(
                (item: any) => item.sub_code === row.postcd
              )?.code_name,
              [SELECTED_FIELD]: selectedState[idGetter(row)],
            })),
            mainDataState
          )}
          {...mainDataState}
          //선택 기능
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
        >
          <GridColumn cell={CommandCell} width="55px" />
          <GridColumn field="dptcd" title="부서" width="120px" />
          <GridColumn field="postcd" title="직위" width="120px" />
          <GridColumn field="prsnnum" title="사번" width="150px" />
          <GridColumn field="prsnnm" title="성명" width="150px" />
          <GridColumn field="perregnum" title="주민번호" width="200px" />
          <GridColumn
            field="regorgdt"
            title="입사일"
            cell={DateCell}
            width="120px"
          />
          <GridColumn
            field="rtrdt"
            title="퇴사일"
            cell={DateCell}
            width="120px"
          />
          <GridColumn field="extnum" title="내선번호" width="150px" />
          <GridColumn field="phonenum" title="핸드폰번호" width="150px" />
        </Grid>
      </GridContainer>
      {detailWindowVisible && (
        <DetailWindow
          getVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U 
          prsnnum={detailFilters.prsnnum}
          isCopy={isCopy}
          reloadData={reloadData}
        />
      )}

    </>
  );
};

export default HU_A1000W;
