import { DataResult, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
} from "@progress/kendo-react-grid";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  convertDateToStr,
  getBizCom,
  getDeviceHeight,
  getHeight,
  GetPropertyValueByName,
  handleKeyPressSearch,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_A9000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import DateCell from "../components/Cells/DateCell";
import { getter } from "@progress/kendo-react-common";

const DATA_ITEM_KEY = "num";

const requiredField: string[] = ["mngitemcd"];
const checkBoxField: string[] = ["rtrchk"];
const numberField: string[] = [
  "baseamt",
  "inamt",
  "chainamt",
  "outamt",
  "chaoutamt",
  "inoutamt",
  "adjustamt",
];
const readOnlyField: string[] = ["mngdatanm", "mngitemnm"];
const DateField = [""];

let targetRowIndex: null | number = null;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;

const AC_A9000W: React.FC = () => {
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const location = UseGetValueFromSessionItem("location");
  const setLoading = useSetRecoilState(isLoading);
  const initialPageState = { skip: 0, take: PAGE_SIZE };

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [webheight5, setWebHeight5] = useState(0);
  const [webheight6, setWebHeight6] = useState(0);
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".ButtonContainer4");
      height5 = getHeight(".ButtonContainer5");
      height6 = getHeight(".ButtonContainer6");
      height7 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height7);

        setWebHeight((getDeviceHeight(true) - height7) / 2 - height);
        setWebHeight2((getDeviceHeight(true) - height7) / 2 - height2);
        setWebHeight3((getDeviceHeight(true) - height7) / 3 - height3);
        setWebHeight4((getDeviceHeight(true) - height7) / 3 - height4);
        setWebHeight5((getDeviceHeight(true) - height7) / 3 - height5);
        setWebHeight6((getDeviceHeight(true) - height7) / 2 - height6);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });

  UsePermissions(setPermissions);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        stddt: setDefaultDate(customOptionData, "stddt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const idGetter = getter(DATA_ITEM_KEY);

  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
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
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_AC510", setBizComponentData);

  const [acntcdListData, setAcntcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setAcntcdListData(getBizCom(bizComponentData, "L_AC510"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    work_type: "ALL_LIST",
    orgdiv: orgdiv,
    location: location,
    stddt: new Date(),
    find_row_value: "",
    pgSize: PAGE_SIZE,
    pgNum: 1,
    isSearch: false,
  });

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A9000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_stddt": convertDateToStr(filters.stddt).substring(0, 6),
        "@p_find_row_value": filters.find_row_value,
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
      console.log(rows);
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.semiannualgb + "-" + row.prsnnum == filters.find_row_value
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
            : rows.find(
                (row: any) =>
                  row.semiannualgb + "-" + row.prsnnum == filters.find_row_value
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

  let gridRef: any = useRef(null);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      //   enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      //   exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
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

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>결산자동전표</Title>
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
              <th>기준년월</th>
              <td>
                <DatePicker
                  name="stddt"
                  value={filters.stddt}
                  format="yyyy-MM"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={MonthCalendar}
                />
              </td>
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="drcrdiv"
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
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>결산LIST</GridTitle>
          <ButtonContainer>
            <Button
              // onClick={onDeleteClick}
              icon="refresh"
              fillMode="outline"
              themeColor={"primary"}
              disabled={permissions.delete ? false : true}
            >
              기초/입고금액 재집계
            </Button>
            <Button
              // onClick={onAddClick}
              themeColor={"primary"}
              icon="file-add"
              disabled={permissions.save ? false : true}
            >
              전표생성
            </Button>
            <Button
              // onClick={onDeleteClick}
              icon="delete"
              fillMode="outline"
              themeColor={"primary"}
              disabled={permissions.delete ? false : true}
            >
              전표해제
            </Button>
          </ButtonContainer>
        </GridTitleContainer>
        <Grid
          style={{ height: webheight }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              acntcd: acntcdListData.find(
                (items: any) => items.sub_code == row.acntcd
              )?.code_name,
              [SELECTED_FIELD]: selectedState[idGetter(row)],
            })),
            mainDataState
          )}
          {...mainDataState}
          onDataStateChange={onMainDataStateChange}
        >
          <GridColumn field="rowstatus" title=" " width="30px" />
          {customOptionData !== null &&
            customOptionData.menuCustomColumnOptions["grdList"]
              ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
              ?.map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        DateField.includes(item.fieldName)
                          ? DateCell
                          : numberField.includes(item.fieldName)
                          ? NumberCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0
                          ? mainTotalFooterCell
                          : numberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell
                          : undefined
                      }
                    />
                  )
              )}
          <GridColumn title="전표번호" width={130}>
            <GridColumn
              id="col_actdt"
              field="actdt"
              title="일자"
              width="80px"
              cell={DateCell}
            />
            <GridColumn
              id="col_acseq1"
              field="acseq1"
              title="순번"
              width="50px"
            />
          </GridColumn>
          <GridColumn title="전표번호2" width={130}>
            <GridColumn
              id="col_tactdt"
              field="tactdt"
              title="일자"
              width="80px"
              cell={DateCell}
            />
            <GridColumn
              id="col_tacseq1"
              field="tacseq1"
              title="순번"
              width="50px"
            />
          </GridColumn>
          <GridColumn title="전표번호3" width={130}>
            <GridColumn
              id="col_sactdt"
              field="sactdt"
              title="일자"
              width="80px"
              cell={DateCell}
            />
            <GridColumn
              id="col_sacseq1"
              field="sacseq1"
              title="순번"
              width="50px"
            />
          </GridColumn>
        </Grid>
      </GridContainer>
      <GridContainerWrap>
        <GridContainer width="33%">
          <GridTitleContainer className="ButtonContainer2">
            <GridTitle>노무비 & 제조경비</GridTitle>
          </GridTitleContainer>
          <Grid style={{ height: webheight2 }}></Grid>
        </GridContainer>
        <GridContainer width={`calc(33% - ${GAP}px)`}>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer3">
              <GridTitle>매출액</GridTitle>
            </GridTitleContainer>
            <Grid style={{ height: webheight3 }}>
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList3"]
                  ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  ?.map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            checkBoxField.includes(item.fieldName)
                              ? CheckBoxCell
                              : numberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
            </Grid>
          </GridContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer4">
              <GridTitle>영업외수익</GridTitle>
            </GridTitleContainer>
            <Grid style={{ height: webheight4 }}>
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList4"]
                  ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  ?.map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            checkBoxField.includes(item.fieldName)
                              ? CheckBoxCell
                              : numberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
            </Grid>
          </GridContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer5">
              <GridTitle>영업외비용</GridTitle>
            </GridTitleContainer>
            <Grid style={{ height: webheight5 }}>
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList5"]
                  ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  ?.map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            checkBoxField.includes(item.fieldName)
                              ? CheckBoxCell
                              : numberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
            </Grid>
          </GridContainer>
        </GridContainer>
        <GridContainer width={`calc(33% - ${GAP}px)`}>
          <GridTitleContainer className="ButtonContainer6">
            <GridTitle>판매비&일반관리비</GridTitle>
          </GridTitleContainer>
          <Grid style={{ height: webheight6 }}>
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList6"]
                ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                ?.map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          checkBoxField.includes(item.fieldName)
                            ? CheckBoxCell
                            : numberField.includes(item.fieldName)
                            ? NumberCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder == 0
                            ? mainTotalFooterCell
                            : numberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell
                            : undefined
                        }
                      />
                    )
                )}
          </Grid>
        </GridContainer>
      </GridContainerWrap>
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
    </>
  );
};
export default AC_A9000W;
