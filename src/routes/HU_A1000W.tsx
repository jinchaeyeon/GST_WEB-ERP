import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
} from "@progress/kendo-react-grid";
import {
  Input,
  InputChangeEvent,
  TextArea,
} from "@progress/kendo-react-inputs";
import {
  Step,
  Stepper,
  TabStrip,
  TabStripTab,
} from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";

import {
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  chkScrollHandler,
  toDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A1000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

let targetRowIndex: null | number = null;

const DATA_ITEM_KEY = "prsnnum";
const dateField = ["regorgdt", "rtrdt"];
const comboField = ["postcd"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU005", setBizComponentData);

  const field = props.field ?? "";

  const bizComponentIdVal =
    field === "postcd"
      ? "L_HU005"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );
  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const HU_A1000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  let grdList: any = useRef(null);

  const [isCopy, setIsCopy] = useState(false);
  const [workType, setWorkType] = useState<"N" | "U">("N");

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    work_type: "LIST",
    orgdiv: "",
    location: "",
    dptcd: "",
    dptnm: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "", // 재직여부

    find_row_value: "",
    pgNum: 1,
    isSearch: true,

    pgGap: 0,
    scrollDirrection: "down",
    pgSize: PAGE_SIZE,
  });

  // 요약정보
  const [grdListDataState, setGrdListDataState] = useState<State>({
    sort: [],
  });

  const [grdListDataResult, setGrdListDataResult] = useState<DataResult>(
    process([], grdListDataState)
  );

  const [selectedGrdListState, setSelectedGrdListState] = useState<{
    [id: string]: boolean | number[];
  }>({});

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

  // 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

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

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data: any;
    setLoading(true);

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
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (grdList.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.quonum + "-" + row.quorev == filters.find_row_value
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
        if (grdList.current) {
          targetRowIndex = 0;
        }
      }

      setGrdListDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.quonum + "-" + row.quorev == filters.find_row_value
              );
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
    // 필터 isSearch false처리, pgNum 세팅
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
    setGrdListDataResult(process([], grdListDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const search = () => {
    try {
      resetAllGrid();
    } catch (e) {
      alert(e);
    }
  };

  const reloadData = (workType: string) => {
    // //수정한 경우 행선택 유지, 신규건은 첫번째 행 선택
    // if (workType === "U") {
    //   setIfSelectFirstRow(false);
    // } else {
    //   setIfSelectFirstRow(true);
    // }
    // resetAllGrid();
    // setFilters((prev) => ({
    //   ...prev,
    //   find_row_value: "",
    //   scrollDirrection: "down",
    //   pgNum: 1,
    //   isSearch: true,
    //   pgGap: 0,
    // }));
    // fetchDetailGrid();
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
          style={{ height: "77vh" }}
          data={process(
            grdListDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: selectedGrdListState[idGetter(row)],
            })),
            grdListDataState
          )}
          {...grdListDataState}
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
          total={grdListDataResult.total}
          skip={page.skip}
          take={page.take}
          pageable={true}
          onPageChange={pageChange}
          onScroll={onMainScrollHandler}
          // //원하는 행 위치로 스크롤 기능
          ref={grdList}
          //정렬기능
          sortable={true}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          id="grdList"
        >
          {customOptionData !== null &&
            customOptionData.menuCustomColumnOptions["grdList"].map(
              (item: any, idx: number) =>
                item.sortOrder !== -1 && (
                  <GridColumn
                    key={idx}
                    id={item.id}
                    field={item.fieldName}
                    title={item.caption}
                    width={item.width}
                    cell={
                         dateField.includes(item.fieldName)
                        ? DateCell
                        : comboField.includes(item.fieldName)
                        ? CustomComboBoxCell
                        : undefined
                    }
                    //footerCell={grdTotalFooterCell}
                  />
                )
            )}
        </Grid>
      </GridContainer>
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
      {/* {detailWindowVisible && (
        <DetailWindow
          getVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U 
          prsnnum={detailFilters.prsnnum}
          isCopy={isCopy}
          reloadData={reloadData}
        />
      )} */}
    </>
  );
};

export default HU_A1000W;
