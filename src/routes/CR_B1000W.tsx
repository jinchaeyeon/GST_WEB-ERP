import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
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
import { useEffect, useLayoutEffect, useState } from "react";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
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
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import DateCell from "../components/Cells/DateCell";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
var height = 0;
var height2 = 0;
var height3 = 0;
let index = 0;

const App = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages(setMessagesData);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height3);
        setMobileHeight2(getDeviceHeight(true) - height2 - height3);
        setWebHeight(getDeviceHeight(true) - height - height3);
        setWebHeight2(getDeviceHeight(true) - height2 - height3);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

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
  // 엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    frdt: new Date(),
    todt: new Date(),
    receiptNumber: "",
    projectNumber: "",
    title: "",
    name: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "Researching_002");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "Researching_002");
      } else if (
        filters.receiptNumber == "" ||
        filters.receiptNumber == undefined ||
        filters.receiptNumber == null
      ) {
        throw findMessage(messagesData, "Researching_001");
      } else if (
        filters.projectNumber == "" ||
        filters.projectNumber == undefined ||
        filters.projectNumber == null
      ) {
        throw findMessage(messagesData, "Researching_001");
      } else if (
        filters.title == "" ||
        filters.title == undefined ||
        filters.title == null
      ) {
        throw findMessage(messagesData, "Researching_001");
      } else if (
        filters.name == "" ||
        filters.name == undefined ||
        filters.name == null
      ) {
        throw findMessage(messagesData, "Researching_001");
      } else {
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          findRowValue: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    const rows = [
      {
        num: 0,
        receiptNumber: "R20230801-1",
        projectNumber: "P20230714-1",
        title: "연구실험1차",
        recdt: "20230801",
        person: "사람1",
        status: "완료",
        detail: "",
        research_yn: "Y",
        description: "이상 무",
      },
      {
        num: 1,
        receiptNumber: "R20230801-2",
        projectNumber: "P20230714-1",
        title: "연구실험2차",
        recdt: "20230801",
        person: "사람1",
        status: "진행중",
        detail: "2차",
        research_yn: "N",
        description: "",
      },
      {
        num: 2,
        receiptNumber: "R20230811-1",
        projectNumber: "P20230805-1",
        title: "시약투약",
        recdt: "20230811",
        person: "사람2",
        status: "보류",
        detail: "시약 배송문제",
        research_yn: "N",
        description: "시약 배송 \n기다리는중",
      },
      {
        num: 3,
        receiptNumber: "R20230824-1",
        projectNumber: "P20230824-1",
        title: "임상실험",
        recdt: "20230824",
        person: "사람3",
        status: "예정",
        detail: "",
        research_yn: "N",
        description: "임\n상\n실\n험\n예\n정",
      },
    ];

    setMainDataResult((prev) => {
      return {
        data: rows,
        total: 4,
      };
    });
    setSelectedState({ "0": true });
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

  const idGetter = getter(DATA_ITEM_KEY);

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
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
              <th>접수번호</th>
              <td>
                <Input
                  name="receiptNumber"
                  type="text"
                  value={filters.receiptNumber}
                  onChange={filterInputChange}
                />
              </td>
              <th>프로젝트 번호</th>
              <td>
                <Input
                  name="projectNumber"
                  type="text"
                  value={filters.projectNumber}
                  onChange={filterInputChange}
                />
              </td>
              <th>담당자</th>
              <td>
                <Input
                  name="name"
                  type="text"
                  value={filters.name}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>신청명</th>
              <td colSpan={3}>
                <Input
                  name="title"
                  type="text"
                  value={filters.title}
                  onChange={filterInputChange}
                />
              </td>
              <th>등록일</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                  className="required"
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      {isMobile ? (
        <>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>연구실험 진행현황</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-right"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      다음
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: mobileheight }}
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
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="receiptNumber"
                      title="접수번호"
                      width="150px"
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn
                      field="projectNumber"
                      title="프로젝트번호"
                      width="150px"
                    />
                    <GridColumn field="title" title="신청명" width="350px" />
                    <GridColumn
                      field="recdt"
                      title="등록일"
                      width="150px"
                      cell={DateCell}
                    />
                    <GridColumn field="person" title="담당자" width="120px" />
                    <GridColumn field="status" title="상태" width="120px" />
                    <GridColumn field="detail" title="상세정보" width="150px" />
                    <GridColumn
                      field="research_yn"
                      title="설문조사여부"
                      width="150px"
                      cell={CheckBoxReadOnlyCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>Description</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
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
                  </ButtonContainer>
                </GridTitleContainer>
                <TextArea
                  value={
                    mainDataResult.data.filter(
                      (item) =>
                        item[DATA_ITEM_KEY] ==
                        Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].description
                  }
                  name="description"
                  rows={37}
                  style={{ height: mobileheight2 }}
                  onChange={filterInputChange}
                />
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width="65%">
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>연구실험 진행현황</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: webheight }}
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
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="receiptNumber"
                    title="접수번호"
                    width="150px"
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn
                    field="projectNumber"
                    title="프로젝트번호"
                    width="150px"
                  />
                  <GridColumn field="title" title="신청명" width="350px" />
                  <GridColumn
                    field="recdt"
                    title="등록일"
                    width="150px"
                    cell={DateCell}
                  />
                  <GridColumn field="person" title="담당자" width="120px" />
                  <GridColumn field="status" title="상태" width="120px" />
                  <GridColumn field="detail" title="상세정보" width="150px" />
                  <GridColumn
                    field="research_yn"
                    title="설문조사여부"
                    width="150px"
                    cell={CheckBoxReadOnlyCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(35% - ${GAP}px)`}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>Description</GridTitle>
              </GridTitleContainer>
              <TextArea
                value={
                  mainDataResult.data.filter(
                    (item) =>
                      item[DATA_ITEM_KEY] ==
                      Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined
                    ? ""
                    : mainDataResult.data.filter(
                        (item) =>
                          item[DATA_ITEM_KEY] ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0].description
                }
                name="description"
                rows={37}
                style={{ height: webheight2 }}
                onChange={filterInputChange}
              />
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
    </>
  );
};
export default App;
