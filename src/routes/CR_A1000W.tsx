import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  MultiSelect,
  MultiSelectChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInGridInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  StatusIcon,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  convertDateToStr,
  dateformat2,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  //   DEFAULT_ATTDATNUMS,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import RichEditor from "../components/RichEditor";
import { TEditorHandle, TPermissions } from "../store/types";

let index = 0;
const DATA_ITEM_KEY = "document_id";
const QnaStateCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field = "" } = props;
  return (
    <td
      style={{ textAlign: "left" }}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <StatusIcon status={dataItem[field]} />{" "}
        {dataItem[field] === "N"
          ? "대기"
          : dataItem[field] === "R"
          ? "진행중"
          : dataItem[field] === "Y"
          ? "완료"
          : "보류"}
      </div>
    </td>
  );
};
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;

const App = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const idGetter = getter(DATA_ITEM_KEY);
  const qEditorRef = useRef<TEditorHandle>(null);
  const aEditorRef = useRef<TEditorHandle>(null);
  const location = useLocation();
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
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
        dataType: defaultOption.find((item: any) => item.id == "dataType")
          ?.valueCode,
        isPublic: defaultOption.find((item: any) => item.id == "isPublic")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".FormBoxWrap");
      height5 = getHeight(".FormBoxWrap2");
      height6 = getHeight(".ButtonContainer3");
      height7 = getHeight(".FormBoxWrap3");
      height8 = getHeight(".ButtonContainer4");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(false) - height - height3);
        setMobileHeight3(getDeviceHeight(false) - height - height8);
        setMobileHeight4(getDeviceHeight(false) - height - height6 - height7);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2(
          ((getDeviceHeight(false) -
            height -
            height3 -
            height4 -
            height5 -
            height6 -
            height7) *
            2) /
            3
        );
        setWebHeight3(
          (getDeviceHeight(false) -
            height -
            height3 -
            height4 -
            height5 -
            height6 -
            height7) /
            3
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3]);
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

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
  const filterMultiSelectChange = (event: MultiSelectChangeEvent) => {
    const values = event.value;

    setFilters((prev) => ({
      ...prev,
      status: values,
    }));
  };

  const [filters, setFilters] = useState({
    dataType: "A",
    frdt: new Date(),
    todt: new Date(),
    userName: "",
    contents: "",
    isPublic: "%",
    status: [
      { sub_code: "1", code_name: "대기" },
      { sub_code: "2", code_name: "진행중" },
      { sub_code: "4", code_name: "보류" },
    ],
    custnm: "",
    findRowValue: "",
    pgNum: 1,
    pgSize: PAGE_SIZE,
    isSearch: false, // 조회여부 초기화
  });

  // 엑셀 내보내기
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
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CR_A1000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CR_A1000W_001");
      } else {
        // 그리드 재조회
        setPage(initialPageState)
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        if (isMobile && swiper) {
          swiper.slideTo(1);
        }
      }
    } catch (e) {
      alert(e);
    }
  };
  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_CM500_603_Q, R_PUBLIC", setBizComponentData);
  //상태, 의약품상세분류

  const [statusListData, setStatusListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setStatusListData(getBizCom(bizComponentData, "L_CM500_603_Q"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [Information, setInformation] = useState({
    workType: "N",
    document_id: "",
    title: "",
    password: "",
    user_name: "",
    user_tel: "",
    is_public: "Y",
    is_lock: false,
    request_date: new Date(),
    be_finished_date: "",
    reception_date: "",
    status: "",
    attdatnum: "",
    files: "",
    answer_attdatnum: "",
    answer_document_id: "",
    answer_files: "",
  });
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    if (isMobile && swiper) {
      swiper.slideTo(1);
    }
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //임시
    setMainDataResult({
      data: [
        {
          answer_attdatnum: "",
          answer_document_id: "",
          answer_files: "",
          attdatnum: "CS2023082300002",
          be_finished_date: "",
          check_date: null,
          completion_date: "",
          contents:
            "안녕하십니까, 송준헌입니다.\r\n\r\n금일 회의에서 안내드린 PROCESS 및 DB를 공유드리오니 참고하시기 바랍니다.\r\n\r\n감사합니다.\r\n\r\n송준헌 배상",
          customer_code: "14197",
          customer_name: "(주)바이오톡스텍",
          document_id: "Q2023082300002",
          files: "230822 작업관리 RFP.pptx 등 3건",
          insert_pc: "BOOK-6BF8CJHEJB/192.168.1.3",
          insert_time: "2023-08-23T13:04:29.583",
          insert_userid: "14197",
          is_checked: "N",
          is_lock: "Y",
          is_public: "Y",
          password: "8k9kkD5fDlkeNHvp2eokvQ==",
          reception_date: "",
          reception_person: "",
          reception_type: "Q",
          request_date: "20230823",
          salt: "z8WK7Q6K5hYqlox3lKOJAa1B3jOUhXXV+BftDJhyKtw=",
          status: "N",
          title: "[BTT] 작업관리 관련 PROCESS 및 DB 공유",
          update_pc: null,
          update_time: null,
          update_userid: null,
          user_name: "송준헌",
          user_tel: "",
        },
        {
          answer_attdatnum: "",
          answer_document_id: "",
          answer_files: "",
          attdatnum: "",
          be_finished_date: "",
          check_date: null,
          completion_date: "",
          contents:
            "안녕하십니까, 바이오톡스텍 송준헌입니다.\r\n\r\n내일 개발 미팅 Agenda 공유드립니다.\r\n\r\n 1. 이전 차수 작업 현황(TO DO LIST) 확인\r\n 2. 부검 CAPACITY 협의\r\n 3. 작업관리 \r\n 4. 중도금 협의\r\n 5. CRM Kick-off 일정 협의\r\n\r\n감사합니다.\r\n\r\n송준헌 배상",
          customer_code: "14197",
          customer_name: "(주)바이오톡스텍",
          document_id: "Q2023082200011",
          files: "",
          insert_pc: "BOOK-6BF8CJHEJB/192.168.1.3",
          insert_time: "2023-08-22T18:11:11.697",
          insert_userid: "14197",
          is_checked: "N",
          is_lock: "Y",
          is_public: "Y",
          password: "DRH7eZHGZRx+ov5u+qu9bg==",
          reception_date: "20230822",
          reception_person: "2015",
          reception_type: "Q",
          request_date: "20230822",
          salt: "2MgzzuHTuTay6wG3F14qyKQ/Mzot1+PCg1ToKG10yGs=",
          status: "R",
          title: "[BTT] 20차 개발 회의 Agenda 공유 ",
          update_pc: null,
          update_time: null,
          update_userid: null,
          user_name: "송준헌",
          user_tel: "",
        },
        {
          answer_attdatnum: "",
          answer_document_id: "",
          answer_files: "",
          attdatnum: "CS2023082200003",
          be_finished_date: "",
          check_date: null,
          completion_date: "",
          contents:
            "안녕하세요\r\n\r\n첨부와 같이 매출 회계 전표 상 각 해당 건의 외화 금액이 기재가 되게끔 \r\n\r\n전표 설정을 부탁 드립니다",
          customer_code: "10141",
          customer_name: "광명잉크제조(주)",
          document_id: "Q2023082200007",
          files: "매출 회계 전표.pdf 등 2건",
          insert_pc: "박하연/192.168.10.16",
          insert_time: "2023-08-22T11:15:03.067",
          insert_userid: "10141",
          is_checked: "N",
          is_lock: "N",
          is_public: "Y",
          password: "FumDq5Th1ax/5shmDI6pMw==",
          reception_date: "20230822",
          reception_person: "2112",
          reception_type: "Q",
          request_date: "20230823",
          salt: "4qlOpP99MMqpz1c04/STBsvkiRfhgrNi3R7InwlhyGI=",
          status: "R",
          title: "매출 회계 전표 상 금액 표시",
          update_pc: null,
          update_time: null,
          update_userid: null,
          user_name: "이은혜",
          user_tel: "",
        },
      ],
      total: 3,
    });
    setSelectedState({ Q2023082300002: true });
  };

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

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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
                <FilterContainer>
                  <FilterBox
                    onKeyPress={(e) => {
                      handleKeyPressSearch(e, search);
                    }}
                  >
                    <tbody>
                      <tr>
                        <th>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="dataType"
                              value={filters.dataType}
                              customOptionData={customOptionData}
                              changeData={filterComboBoxChange}
                              className="required"
                            />
                          )}
                        </th>
                        <td>
                          <CommonDateRangePicker
                            value={{
                              start: filters.frdt,
                              end: filters.todt,
                            }}
                            onChange={(e: {
                              value: { start: any; end: any };
                            }) =>
                              setFilters((prev) => ({
                                ...prev,
                                frdt: e.value.start,
                                todt: e.value.end,
                              }))
                            }
                            className="required"
                          />
                        </td>
                        <th>공개 여부</th>
                        <td colSpan={3}>
                          {customOptionData !== null && (
                            <CustomOptionRadioGroup
                              name="isPublic"
                              customOptionData={customOptionData}
                              changeData={filterRadioChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>상태</th>
                        <td>
                          <MultiSelect
                            data={statusListData}
                            onChange={filterMultiSelectChange}
                            value={filters.status}
                            textField="code_name"
                            dataItemKey="sub_code"
                          />
                        </td>
                        <th>작성자</th>
                        <td>
                          <Input
                            name="userName"
                            type="text"
                            value={filters.userName}
                            onChange={filterInputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>제목 및 내용</th>
                        <td>
                          <Input
                            name="contents"
                            type="text"
                            value={filters.contents}
                            onChange={filterInputChange}
                          />
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
                      </tr>
                    </tbody>
                  </FilterBox>
                </FilterContainer>
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>요약정보</GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{
                        height: mobileheight,
                      }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          request_date: dateformat2(row.request_date),
                          reception_date: dateformat2(row.reception_date),
                          be_finished_date: dateformat2(row.be_finished_date),
                          completion_date: dateformat2(row.completion_date),
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
                        field="status"
                        title="상태"
                        width={80}
                        cell={QnaStateCell}
                        footerCell={mainTotalFooterCell}
                      />
                      <GridColumn
                        field="request_date"
                        title="요청일"
                        width={100}
                        cell={CenterCell}
                      />
                      <GridColumn
                        field="user_name"
                        title="작성자"
                        width={100}
                      />
                      <GridColumn field="title" title="제목" width={200} />
                      <GridColumn
                        field="reception_date"
                        title="접수일"
                        width={100}
                        cell={CenterCell}
                      />
                      <GridColumn
                        field="be_finished_date"
                        title="완료예정일"
                        width={100}
                        cell={CenterCell}
                      />
                      <GridColumn
                        field="completion_date"
                        title="처리완료일"
                        width={100}
                        cell={CenterCell}
                      />
                      <GridColumn field="contents" title="내용" width={150} />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>상세정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(2);
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
                <FormBoxWrap border style={{ height: mobileheight2 }}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>제목</th>
                        <td colSpan={3}>
                          <Input
                            name="title"
                            type="text"
                            value={Information.title}
                            className={"readonly"}
                          />
                        </td>
                        <th>작성자</th>
                        <td colSpan={3}>
                          <Input
                            name="user_name"
                            type="text"
                            value={Information.user_name}
                            className={"readonly"}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>연락처</th>
                        <td>
                          <Input
                            name="user_tel"
                            type="text"
                            value={Information.user_tel}
                            className={"readonly"}
                          />
                        </td>
                        <th>비밀번호</th>
                        <td>
                          <div className="filter-item-wrap">
                            <Input
                              name="password"
                              type="password"
                              value={Information.password}
                              className={"readonly"}
                            />
                            <ButtonInGridInput>
                              <Button
                                icon={Information.is_lock ? "lock" : "unlock"}
                                themeColor={"primary"}
                                fillMode={"flat"}
                                onClick={() =>
                                  setInformation((prev) => ({
                                    ...prev,
                                    is_lock: !prev.is_lock,
                                  }))
                                }
                              />
                            </ButtonInGridInput>
                          </div>
                        </td>
                        <th>공개 여부</th>
                        <td colSpan={3}>
                          {bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="taxdiv"
                              value={Information.is_public}
                              bizComponentId="R_PUBLIC"
                              bizComponentData={bizComponentData}
                              disabled={true}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>요청일</th>
                        <td>
                          <Input
                            name="request_date"
                            type="text"
                            value={dateformat2(
                              convertDateToStr(Information.request_date)
                            )}
                            className="readonly"
                            readOnly
                          />
                        </td>
                        <th>완료예정일</th>
                        <td>
                          <Input
                            name="be_finished_date"
                            type="text"
                            value={Information.be_finished_date}
                            className="readonly"
                          />
                        </td>
                        <th>접수일</th>
                        <td>
                          <Input
                            name="reception_date"
                            type="text"
                            value={Information.reception_date}
                            className="readonly"
                          />
                        </td>
                        <th>상태</th>
                        <td>
                          <Input
                            name="status"
                            type="text"
                            value={Information.status}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>첨부파일</th>
                        <td>
                          <div className="filter-item-wrap">
                            <Input
                              name="attachment_q"
                              value={Information.files}
                              className="readonly"
                            />
                            <ButtonInGridInput>
                              <Button
                                icon="more-horizontal"
                                fillMode={"flat"}
                              />
                            </ButtonInGridInput>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <ButtonContainer
                  style={{ justifyContent: "space-between" }}
                  className="ButtonContainer4"
                >
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="arrow-left"
                    themeColor={"primary"}
                    fillMode={"outline"}
                  >
                    이전
                  </Button>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(3);
                      }
                    }}
                    icon="arrow-right"
                    themeColor={"primary"}
                    fillMode={"outline"}
                  >
                    다음
                  </Button>
                </ButtonContainer>
                <div style={{ height: mobileheight3 }}>
                  <RichEditor id="qEditor" ref={qEditorRef} hideTools={true} />
                </div>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={3}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>답변</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(2);
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
                <div style={{ height: mobileheight4 }}>
                  <RichEditor id="aEditor" ref={aEditorRef} hideTools />
                </div>
                <FormBoxWrap border className="FormBoxWrap3">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>첨부파일</th>
                        <td>
                          <div className="filter-item-wrap">
                            <Input
                              name="attachment_a"
                              value={Information.answer_files}
                              className="readonly"
                            />
                            <ButtonInGridInput>
                              <Button
                                icon="more-horizontal"
                                fillMode={"flat"}
                              />
                            </ButtonInGridInput>
                          </div>
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
          <GridContainerWrap>
            <GridContainer width={`40%`}>
              <FilterContainer>
                <FilterBox
                  onKeyPress={(e) => {
                    handleKeyPressSearch(e, search);
                  }}
                >
                  <tbody>
                    <tr>
                      <th>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="dataType"
                            value={filters.dataType}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            className="required"
                          />
                        )}
                      </th>
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
                      <th>공개 여부</th>
                      <td colSpan={3}>
                        {customOptionData !== null && (
                          <CustomOptionRadioGroup
                            name="isPublic"
                            customOptionData={customOptionData}
                            changeData={filterRadioChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>상태</th>
                      <td>
                        <MultiSelect
                          data={statusListData}
                          onChange={filterMultiSelectChange}
                          value={filters.status}
                          textField="code_name"
                          dataItemKey="sub_code"
                        />
                      </td>
                      <th>작성자</th>
                      <td>
                        <Input
                          name="userName"
                          type="text"
                          value={filters.userName}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>제목 및 내용</th>
                      <td>
                        <Input
                          name="contents"
                          type="text"
                          value={filters.contents}
                          onChange={filterInputChange}
                        />
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
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{
                      height: webheight,
                    }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        request_date: dateformat2(row.request_date),
                        reception_date: dateformat2(row.reception_date),
                        be_finished_date: dateformat2(row.be_finished_date),
                        completion_date: dateformat2(row.completion_date),
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
                      field="status"
                      title="상태"
                      width={80}
                      cell={QnaStateCell}
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn
                      field="request_date"
                      title="요청일"
                      width={100}
                      cell={CenterCell}
                    />
                    <GridColumn field="user_name" title="작성자" width={100} />
                    <GridColumn field="title" title="제목" width={200} />
                    <GridColumn
                      field="reception_date"
                      title="접수일"
                      width={100}
                      cell={CenterCell}
                    />
                    <GridColumn
                      field="be_finished_date"
                      title="완료예정일"
                      width={100}
                      cell={CenterCell}
                    />
                    <GridColumn
                      field="completion_date"
                      title="처리완료일"
                      width={100}
                      cell={CenterCell}
                    />
                    <GridColumn field="contents" title="내용" width={150} />
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`60% - ${GAP}px`}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>상세정보</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>제목</th>
                      <td colSpan={3}>
                        <Input
                          name="title"
                          type="text"
                          value={Information.title}
                          className={"readonly"}
                        />
                      </td>
                      <th>작성자</th>
                      <td colSpan={3}>
                        <Input
                          name="user_name"
                          type="text"
                          value={Information.user_name}
                          className={"readonly"}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>연락처</th>
                      <td>
                        <Input
                          name="user_tel"
                          type="text"
                          value={Information.user_tel}
                          className={"readonly"}
                        />
                      </td>
                      <th>비밀번호</th>
                      <td>
                        <div className="filter-item-wrap">
                          <Input
                            name="password"
                            type="password"
                            value={Information.password}
                            className={"readonly"}
                          />
                          <ButtonInGridInput>
                            <Button
                              icon={Information.is_lock ? "lock" : "unlock"}
                              themeColor={"primary"}
                              fillMode={"flat"}
                              onClick={() =>
                                setInformation((prev) => ({
                                  ...prev,
                                  is_lock: !prev.is_lock,
                                }))
                              }
                            />
                          </ButtonInGridInput>
                        </div>
                      </td>
                      <th>공개 여부</th>
                      <td colSpan={3}>
                        {bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="taxdiv"
                            value={Information.is_public}
                            bizComponentId="R_PUBLIC"
                            bizComponentData={bizComponentData}
                            disabled={true}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>요청일</th>
                      <td>
                        <Input
                          name="request_date"
                          type="text"
                          value={dateformat2(
                            convertDateToStr(Information.request_date)
                          )}
                          className="readonly"
                          readOnly
                        />
                      </td>
                      <th>완료예정일</th>
                      <td>
                        <Input
                          name="be_finished_date"
                          type="text"
                          value={Information.be_finished_date}
                          className="readonly"
                        />
                      </td>
                      <th>접수일</th>
                      <td>
                        <Input
                          name="reception_date"
                          type="text"
                          value={Information.reception_date}
                          className="readonly"
                        />
                      </td>
                      <th>상태</th>
                      <td>
                        <Input
                          name="status"
                          type="text"
                          value={Information.status}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>

              <div style={{ height: webheight2 }}>
                <RichEditor id="qEditor" ref={qEditorRef} hideTools={true} />
              </div>
              <FormBoxWrap border className="FormBoxWrap2">
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: 0 }}>첨부파일</th>
                      <td style={{ width: "auto" }}>
                        <div className="filter-item-wrap">
                          <Input
                            name="attachment_q"
                            value={Information.files}
                            className="readonly"
                          />
                          <ButtonInGridInput>
                            <Button icon="more-horizontal" fillMode={"flat"} />
                          </ButtonInGridInput>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridTitleContainer className="ButtonContainer3">
                <GridTitle>답변</GridTitle>
              </GridTitleContainer>
              <div style={{ height: webheight3 }}>
                <RichEditor id="aEditor" ref={aEditorRef} hideTools />
              </div>
              <FormBoxWrap border className="FormBoxWrap3">
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: 0 }}>첨부파일</th>
                      <td style={{ width: "auto" }}>
                        <div className="filter-item-wrap">
                          <Input
                            name="attachment_a"
                            value={Information.answer_files}
                            className="readonly"
                          />
                          <ButtonInGridInput>
                            <Button icon="more-horizontal" fillMode={"flat"} />
                          </ButtonInGridInput>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
    </>
  );
};
export default App;
