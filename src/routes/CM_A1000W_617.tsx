import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getHeight,
  handleKeyPressSearch,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { heightstate, isLoading, isMobileState } from "../store/atoms";
import { gridList } from "../store/columns/CM_A1000W_617_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
const dateField = ["recdt"];

const CM_A1000W_617: React.FC = () => {
    const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const pc = UseGetValueFromSessionItem("pc");
  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A1000W_617", setMessagesData);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A1000W_617", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        recdt: setDefaultDate(customOptionData, "recdt"),
      }));
    }
  }, [customOptionData]);
  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.recdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.recdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.recdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A1000W_617_001");
      } else {
        setPage(initialPageState); // 페이지 초기화
        resetAllGrid(); // 데이터 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const resetAllGrid = () => {
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
    setMainDataResult(process([], mainDataState));
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));
    setPage({
      ...event.page,
    });
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (name == "custcd") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "new"
      );

      setInformation((prev) => ({
        ...prev,
        custcd: value,
        custnm:
          value == ""
            ? ""
            : defaultOption
                .find((item: any) => item.id == "custnm")
                .Rows.filter((item: any) => item.custcd == value)[0] !=
              undefined
            ? defaultOption
                .find((item: any) => item.id == "custnm")
                .Rows.filter((item: any) => item.custcd == value)[0].custcd
            : "",
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (name == "custnm") {
      setInformation((prev) => ({
        ...prev,
        custcd: value,
        custnm: value,
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    recdt: new Date(),
    title: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [information, setInformation] = useState({
    datnum: "",
    recdt: new Date(),
    custcd: "",
    custnm: "",
    title: "",
    contents: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_CM_A1000W_617_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_recdt": convertDateToStr(filters.recdt),
        "@p_title": filters.title,
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
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.key_id == filters.find_row_value
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
        setWorkType("U");
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.key_id == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setInformation({
            datnum: selectedRow.datnum,
            recdt: toDate(selectedRow.recdt),
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            title: selectedRow.title,
            contents: selectedRow.contents,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setInformation({
            datnum: rows[0].datnum,
            recdt: toDate(rows[0].recdt),
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            title: rows[0].title,
            contents: rows[0].contents,
          });
        }
      } else {
        setWorkType("N");
        setInformation({
          datnum: "",
          recdt: new Date(),
          custcd: "",
          custnm: "",
          title: "",
          contents: "",
        });
      }
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

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
    setWorkType("U");
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setInformation({
      datnum: selectedRowData.datnum,
      recdt: toDate(selectedRowData.recdt),
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      title: selectedRowData.title,
      contents: selectedRowData.contents,
    });
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const setCustData = (data: ICustData) => {
    setInformation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custcd,
    }));
  };

  const onAddClick = () => {
    setWorkType("N");
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );

    setInformation((prev) => ({
      ...prev,
      datnum: "",
      recdt: new Date(),
      custcd:
        defaultOption.find((item: any) => item.id == "custnm")?.valueCode ==
        "08116"
          ? ""
          : defaultOption.find((item: any) => item.id == "custnm")?.valueCode,
      custnm:
        defaultOption.find((item: any) => item.id == "custnm")?.valueCode ==
        "08116"
          ? ""
          : defaultOption.find((item: any) => item.id == "custnm")?.valueCode,
      title: "",
      contents: "",
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSaveClick = () => {
    if (information.title == "") {
      alert("제목을 입력해주세요.");
    } else {
      setParaData((prev) => ({
        ...prev,
        workType: workType,
        orgdiv: sessionOrgdiv,
        recdt: convertDateToStr(information.recdt),
        datnum: information.datnum,
        custcd: information.custcd,
        title: information.title,
        contents: information.contents,
      }));
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    recdt: "",
    datnum: "",
    custcd: "",
    title: "",
    contents: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A1000W_617_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_datnum": paraData.datnum,
      "@p_recdt": paraData.recdt,
      "@p_custcd": paraData.custcd,
      "@p_title": paraData.title,
      "@p_contents": paraData.contents,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A1000W_617",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      resetAllGrid();
      setWorkType("N");
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        find_row_value: data.returnString,
      }));
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        recdt: "",
        datnum: "",
        custcd: "",
        title: "",
        contents: "",
      });
      if (swiper && isMobile) {
        swiper.slideTo(0);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.data.length != 0) {
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        datnum: information.datnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };
  const [isVisibleDetail, setIsVisableDetail] = useState(false);
  return (
    <>
      {isMobile ? (
        <>
          <TitleContainer style={{ textAlign: "center" }}>
            <Title>업무일지</Title>
            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  exportExcel={exportExcel}
                  permissions={permissions}
                  pathname="CM_A1000W_617"
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>작성일</th>
                  <td>
                    <DatePicker
                      name="recdt"
                      value={filters.recdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </td>
                  <th>제목/내용</th>
                  <td>
                    <Input
                      name="title"
                      type="text"
                      value={filters.title}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>

          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer">
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="file-add"
                    >
                      신규
                    </Button>
                    <Button
                      onClick={onDeleteClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                    >
                      삭제
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="업무일지"
                >
                  <Grid
                    style={{
                      height: deviceHeight - height,
                    }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
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
                  >
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
                                  dateField.includes(item.fieldName)
                                    ? DateCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : undefined
                                }
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <ButtonContainer
                  className="ButtonContainer2"
                  style={{ justifyContent: "space-between" }}
                >
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(0);
                      }
                    }}
                    icon="arrow-left"
                    themeColor={"primary"}
                    fillMode={"outline"}
                  >
                    이전
                  </Button>
                  <Button
                    onClick={onSaveClick}
                    themeColor={"primary"}
                    fillMode="outline"
                    icon="save"
                  >
                    저장
                  </Button>
                </ButtonContainer>
                <FormBoxWrap
                  style={{
                    height: deviceHeight - height2,
                    overflow: "auto",
                  }}
                  border={true}
                >
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>작성일</th>
                        <td>
                          <DatePicker
                            name="recdt"
                            value={information.recdt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            className="required"
                            placeholder=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>업체코드</th>
                        <td>
                          <Input
                            name="custcd"
                            type="text"
                            value={information.custcd}
                            onChange={InputChange}
                          />
                          <ButtonInInput>
                            <Button
                              onClick={onCustWndClick}
                              icon="more-horizontal"
                              fillMode="flat"
                            />
                          </ButtonInInput>
                        </td>
                      </tr>
                      <tr>
                        <th>업체명</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="custnm"
                              value={information.custnm}
                              type="new"
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              valueField="custcd"
                              textField="custnm"
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>제목</th>
                        <td>
                          <Input
                            name="title"
                            type="text"
                            value={information.title}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>내용</th>
                        <td>
                          <TextArea
                            value={information.contents}
                            name="contents"
                            rows={10}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <TitleContainer>
            <Title>업무일지</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  exportExcel={exportExcel}
                  permissions={permissions}
                  pathname="CM_A1000W_617"
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>작성일</th>
                  <td>
                    <DatePicker
                      name="recdt"
                      value={filters.recdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </td>
                  <th>제목/내용</th>
                  <td>
                    <Input
                      name="title"
                      type="text"
                      value={filters.title}
                      onChange={filterInputChange}
                    />
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
                  icon="file-add"
                >
                  신규
                </Button>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                >
                  삭제
                </Button>
                <Button
                  onClick={onSaveClick}
                  themeColor={"primary"}
                  fillMode="outline"
                  icon="save"
                >
                  저장
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="업무일지"
            >
              <Grid
                style={{ height: "35vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
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
              >
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
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : undefined
                            }
                          ></GridColumn>
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th style={{ width: "5%" }}>작성일</th>
                  <td>
                    <DatePicker
                      name="recdt"
                      value={information.recdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      className="required"
                      placeholder=""
                    />
                  </td>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={information.custcd}
                      onChange={InputChange}
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
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="custnm"
                        value={information.custnm}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        valueField="custcd"
                        textField="custnm"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>제목</th>
                  <td colSpan={5}>
                    <Input
                      name="title"
                      type="text"
                      value={information.title}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                </tr>
                <tr>
                  <th>내용</th>
                  <td colSpan={5}>
                    <TextArea
                      value={information.contents}
                      name="contents"
                      onChange={InputChange}
                      style={{ height: "30vh" }}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
          modal={true}
        />
      )}
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

export default CM_A1000W_617;
