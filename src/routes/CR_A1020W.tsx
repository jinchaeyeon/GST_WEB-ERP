import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
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
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import {
  convertDateToStr,
  dateformat2,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  setDefaultDate,
  toDate,
  UseCustomOption,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import {
  //   DEFAULT_ATTDATNUMS,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RichEditor from "../components/RichEditor";
import { loginResultState } from "../store/atoms";
import { TEditorHandle, TPermissions } from "../store/types";
const DATA_ITEM_KEY = "document_id";
const DATA_ITEM_KEY2 = "custcd";
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
let index = 0;

const App = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
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
  const [webheight4, setWebHeight4] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".FormBoxWrap");
      height5 = getHeight(".FormBoxWrap2");
      height6 = getHeight(".ButtonContainer3");
      height7 = getHeight(".ButtonContainer4");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3 - height4);
        setMobileHeight3(getDeviceHeight(true) - height - height6);
        setMobileHeight4(getDeviceHeight(true) - height - height7);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2(
          getDeviceHeight(true) - height - height3 - height4 - height5
        );
        setWebHeight3((getDeviceHeight(true) - height - height6 - height7) / 2);
        setWebHeight4((getDeviceHeight(true) - height - height6 - height7) / 2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3]);

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [loginResult] = useRecoilState(loginResultState);
  const isAdmin = loginResult && loginResult.role === "ADMIN";
  const editorRef = useRef<TEditorHandle>(null);

  const idGetter = getter(DATA_ITEM_KEY);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult3State, setMainDataResult3State] = useState<State>({
    sort: [],
  });
  const [mainDataResult2State, setMainDataResult2State] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [Information, setInformation] = useState({
    work_type: "N",
    document_id: "",
    title: "",
    notice_date: new Date(),
    contents: "",
    attdatnum: "",
    files: "",
  });

  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataResult3State)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataResult2State)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    frdt: new Date(),
    todt: new Date(),
    contents: "",
    find_row_value: "",
    pgNum: 1,
    pgSize: PAGE_SIZE,
    isSearch: true, // 조회여부 초기값
  });

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

    setInformation((prev) => ({
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
        throw findMessage(messagesData, "CR_A1020W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CR_A1020W_001");
      } else {
        // 그리드 재조회
        setPage(initialPageState);
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        // if (isMobile && swiper) {
        //   swiper.slideTo(1);
        // }
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataResult3StateChange = (event: GridDataStateChangeEvent) => {
    setMainDataResult3State(event.dataState);
  };
  const onMainDataResult2StateChange = (event: GridDataStateChangeEvent) => {
    setMainDataResult2State(event.dataState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataResult3State((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataResult2State((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //임시
    setMainDataResult((prev) => {
      return {
        data: [
          {
            attdatnum: "CS2023082200005",
            contents: "안녕하십니까, 지에스티 김용호",
            document_id: "N2023082200001",
            files: "GST230822000001 주간보고서 송부_바이오톡스텍.pdf",
            insert_pc: "14Z990-GP50ML/192.168.0.22",
            insert_time: "2023-08-22T16:48:42.61",
            insert_user_id: "2119",
            insert_userid: "2119",
            notice_date: "20230822",
            title: "8월 3주 주간보고서",
            update_pc: null,
            update_time: null,
            update_user_id: null,
            update_userid: null,
          },
          {
            attdatnum: "CS2023081100007",
            contents: "안녕하십니까, 지에스티 김용호",
            document_id: "N2023081100001",
            files: "GST230811000001 주간보고서 송부_바이오톡스텍.hwp",
            insert_pc: "14Z990-GP50ML/192.168.0.22",
            insert_time: "2023-08-11T16:26:29.387",
            insert_user_id: "2119",
            insert_userid: "2119",
            notice_date: "20230811",
            title: "8월 2주 주간보고서",
            update_pc: null,
            update_time: null,
            update_user_id: null,
            update_userid: null,
          },
          {
            attdatnum: "CS2023080900027",
            contents: "안녕하십니까 지에스티 서지연 ",
            document_id: "N2023080900001",
            files: "프로그램 수정사항_0809.xlsx",
            insert_pc: "GST-SEOJIYEON/10.10.10.32",
            insert_time: "2023-08-09T11:52:56.61",
            insert_user_id: "2015",
            insert_userid: "2015",
            notice_date: "20230809",
            title: "08.09 프로그램 수정사항",
            update_pc: "GST-SEOJIYEON/10.10.10.32",
            update_time: "2023-08-09T11:53:11.6",
            update_user_id: "2015",
            update_userid: "2015",
          },
          {
            attdatnum: "",
            contents: "﻿(주)지에스티이(가) 예약된",
            document_id: "N2023080800002",
            files: "",
            insert_pc: "GST-SEOJIYEON/10.10.10.32",
            insert_time: "2023-08-08T16:50:39.197",
            insert_user_id: "2015",
            insert_userid: "2015",
            notice_date: "20230808",
            title: "Zoom 링크 ",
            update_pc: null,
            update_time: null,
            update_user_id: null,
            update_userid: null,
          },
          {
            attdatnum: "CS2023080800007",
            contents: "안녕하십니까 지에스티 서지연 ",
            document_id: "N2023080800001",
            files: "프로그램 수정사항.xlsx",
            insert_pc: "GST-SEOJIYEON/10.10.10.32",
            insert_time: "2023-08-08T10:56:58.66",
            insert_user_id: "2015",
            insert_userid: "2015",
            notice_date: "20230808",
            title: "프로그램 수정사항",
            update_pc: "GST-SEOJIYEON/10.10.10.32",
            update_time: "2023-08-08T10:58:15.953",
            update_user_id: "2015",
            update_userid: "2015",
          },
        ],
        total: 5,
      };
    });
    setSelectedState({ N2023082200001: true });
  };

  const fetchDetail = async () => {
    const rows = [
      { customer_code: "14197", customer_name: "(주)바이오톡스텍" },
    ];

    setMainDataResult2({
      data: rows,
      total: 1,
    });

    const row = {
      attdatnum: "CS2023082200005",
      contents: "안녕하십니까, 지에스티 김용호",
      document_id: "N2023082200001",
      files: "GST230822000001 주간보고서 송부_바이오톡스텍.pdf",
      insert_pc: "14Z990-GP50ML/192.168.0.22",
      insert_time: "2023-08-22T16:48:42.61",
      insert_user_id: "2119",
      insert_userid: "2119",
      notice_date: "20230822",
      title: "8월 3주 주간보고서",
      update_pc: null,
      update_time: null,
      update_user_id: null,
      update_userid: null,
    };
    setInformation((prev) => ({
      ...row,
      work_type: "U",
      notice_date: toDate(row.notice_date),
    }));
  };

  //그리드 데이터 조회
  const fetchMainGrid3 = async () => {
    //임시
    setMainDataResult3((prev) => {
      return {
        data: [
          {
            customer_code: "42296",
            customer_name: "(유)범진금속",
          },
          { customer_code: "14181", customer_name: "(재)충남테크노파크" },
          { customer_code: "91005", customer_name: "(주)경림HTC" },
          {
            customer_code: "910483",
            customer_name: "(주)글로벌스탠다드테크놀로지",
          },
          { customer_code: "14191", customer_name: "(주)나스테크" },
          { customer_code: "910351", customer_name: "(주)남부식품" },
          { customer_code: "910470", customer_name: "(주)넥스트젠" },
          { customer_code: "14188", customer_name: "(주)다담푸드" },
          { customer_code: "14140", customer_name: "(주)다스코" },
          { customer_code: "910469", customer_name: "(주)다정" },
          { customer_code: "10913", customer_name: "(주)대광모티브" },
          { customer_code: "10010", customer_name: "(주)대동신관" },
          { customer_code: "10155", customer_name: "(주)대동테크" },
          { customer_code: "10213", customer_name: "(주)대호특수강" },
          { customer_code: "910384", customer_name: "(주)덕명" },
          { customer_code: "10922", customer_name: "(주)런텍" },
          { customer_code: "10047", customer_name: "(주)마산푸드" },
          { customer_code: "910382", customer_name: "(주)메가플러스 동진" },
          { customer_code: "10521", customer_name: "(주)보광화스너" },
          { customer_code: "910381", customer_name: "(주)부영정밀" },
          { customer_code: "10622", customer_name: "(주)부흥정밀" },
          { customer_code: "14134", customer_name: "(주)삼양스틸" },
          { customer_code: "10006", customer_name: "(주)새마" },
          { customer_code: "10149", customer_name: "(주)성원기업사천공장" },
          { customer_code: "910385", customer_name: "(주)성일엔케어" },
        ],
        total: 25,
      };
    });
    // setLoading(false);
  };

  const print = () => {
    const iframe = document.getElementById("editor")!.querySelector("iframe");

    if (iframe) {
      const iframeWindow: any = iframe.contentWindow;
      iframe.focus();
      iframeWindow.print();
    }

    return false;
  };

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

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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
          <Button
            onClick={print}
            fillMode="outline"
            themeColor={"primary"}
            icon="print"
          >
            출력
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>공지일자</th>
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
              <th>제목 및 내용</th>
              <td colSpan={3}>
                <Input
                  name="contents"
                  type="text"
                  value={filters.contents}
                  onChange={filterInputChange}
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
                  <GridTitle>요약정보</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: mobileheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)],
                      notice_date: dateformat2(row.notice_date),
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
                    field="notice_date"
                    title="공지일자"
                    width={110}
                    cell={CenterCell}
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="title" title="제목" />
                </Grid>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>상세정보</GridTitle>
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
                    {isAdmin ? (
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
                    ) : (
                      ""
                    )}
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap border className="FormBoxWrap">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>공지일자</th>
                        <td>
                          {isAdmin ? (
                            <DatePicker
                              name="notice_date"
                              value={Information.notice_date}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              className={"required"}
                              placeholder=""
                            />
                          ) : (
                            <Input
                              name="notice_date"
                              type="text"
                              value={dateformat2(
                                convertDateToStr(Information.notice_date)
                              )}
                              onChange={InputChange}
                              className={!isAdmin ? "readonly" : "required"}
                              readOnly={!isAdmin}
                            />
                          )}
                        </td>
                        <th>제목</th>
                        <td>
                          <Input
                            name="title"
                            type="text"
                            value={Information.title}
                            onChange={InputChange}
                            className={!isAdmin ? "readonly" : "required"}
                            readOnly={!isAdmin}
                          />
                        </td>
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
                <div style={{ height: mobileheight2 }}>
                  <RichEditor
                    id="editor"
                    ref={editorRef}
                    hideTools={!isAdmin}
                    className={"notice-editor"}
                  />
                </div>
              </GridContainer>
            </SwiperSlide>
            {isAdmin ? (
              <>
                {" "}
                <SwiperSlide key={2}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer3">
                      <GridTitle>참조 업체</GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
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
                        <div>
                          <Button
                            themeColor={"primary"}
                            icon="refresh"
                            fillMode={"flat"}
                            onClick={() =>
                              setMainDataResult2(
                                process([], mainDataResult2State)
                              )
                            }
                          ></Button>
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
                        </div>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <Grid
                      style={{ height: mobileheight3 }}
                      data={process(
                        // 적어도 한개의 행은 나오도록 처리 (그리드 행이 있어야 드롭 가능)
                        mainDataResult2.data.length === 0
                          ? [{}]
                          : mainDataResult2.data.map((row) => ({
                              ...row,
                            })),
                        mainDataResult2State
                      )}
                      {...mainDataResult2State}
                      onDataStateChange={onMainDataResult2StateChange}
                      dataItemKey={DATA_ITEM_KEY2}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn field="work_type" title=" " width={50} />
                      <GridColumn
                        field="customer_name"
                        title="업체명"
                        footerCell={mainTotalFooterCell2}
                      />
                    </Grid>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={3}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer4">
                      <GridTitle>전체 업체</GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
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
                        <div>
                          <Button
                            themeColor={"primary"}
                            fillMode={"outline"}
                            icon="filter-add-expression"
                          >
                            전체 추가
                          </Button>
                          <Button
                            onClick={fetchMainGrid3}
                            themeColor={"primary"}
                            icon="refresh"
                            fillMode={"flat"}
                          ></Button>
                        </div>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <Grid
                      style={{ height: mobileheight4 }}
                      data={process(
                        mainDataResult3.data.map((row) => ({
                          ...row,
                          // [SELECTED_FIELD]: selectedState[idGetter(row)],
                        })),
                        mainDataResult3State
                      )}
                      {...mainDataResult3State}
                      onDataStateChange={onMainDataResult3StateChange}
                      dataItemKey={DATA_ITEM_KEY2}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange3}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //필터기능
                      filterable={true}
                    >
                      <GridColumn
                        field="customer_name"
                        title="업체명"
                        footerCell={mainTotalFooterCell3}
                      />
                    </Grid>
                  </GridContainer>
                </SwiperSlide>
              </>
            ) : (
              ""
            )}
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={isAdmin ? "25%" : `30%`}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: webheight }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState[idGetter(row)],
                    notice_date: dateformat2(row.notice_date),
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
                  field="notice_date"
                  title="공지일자"
                  width={110}
                  cell={CenterCell}
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn field="title" title="제목" />
              </Grid>
            </GridContainer>
            <GridContainer
              width={isAdmin ? `calc(45% - ${GAP}px)` : `calc(70% - ${GAP}px)`}
            >
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>상세정보</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>공지일자</th>
                      <td>
                        {isAdmin ? (
                          <DatePicker
                            name="notice_date"
                            value={Information.notice_date}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            className={"required"}
                            placeholder=""
                          />
                        ) : (
                          <Input
                            name="notice_date"
                            type="text"
                            value={dateformat2(
                              convertDateToStr(Information.notice_date)
                            )}
                            onChange={InputChange}
                            className={!isAdmin ? "readonly" : "required"}
                            readOnly={!isAdmin}
                          />
                        )}
                      </td>
                      <th>제목</th>
                      <td>
                        <Input
                          name="title"
                          type="text"
                          value={Information.title}
                          onChange={InputChange}
                          className={!isAdmin ? "readonly" : "required"}
                          readOnly={!isAdmin}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <div style={{ height: webheight2 }}>
                <RichEditor
                  id="editor"
                  ref={editorRef}
                  hideTools={!isAdmin}
                  className={"notice-editor"}
                />
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
            </GridContainer>
            {isAdmin && (
              <GridContainer width="30%">
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer3">
                    <GridTitle>참조 업체</GridTitle>
                    {isAdmin && (
                      <ButtonContainer>
                        <Button
                          themeColor={"primary"}
                          icon="refresh"
                          fillMode={"flat"}
                          onClick={() =>
                            setMainDataResult2(
                              process([], mainDataResult2State)
                            )
                          }
                        ></Button>
                      </ButtonContainer>
                    )}
                  </GridTitleContainer>
                  <Grid
                    style={{ height: webheight3 }}
                    data={process(
                      // 적어도 한개의 행은 나오도록 처리 (그리드 행이 있어야 드롭 가능)
                      mainDataResult2.data.length === 0
                        ? [{}]
                        : mainDataResult2.data.map((row) => ({
                            ...row,
                          })),
                      mainDataResult2State
                    )}
                    {...mainDataResult2State}
                    onDataStateChange={onMainDataResult2StateChange}
                    dataItemKey={DATA_ITEM_KEY2}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn field="work_type" title=" " width={50} />
                    <GridColumn
                      field="customer_name"
                      title="업체명"
                      footerCell={mainTotalFooterCell2}
                    />
                  </Grid>
                </GridContainer>
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>전체 업체</GridTitle>

                    <ButtonContainer>
                      <Button
                        themeColor={"primary"}
                        fillMode={"outline"}
                        icon="filter-add-expression"
                      >
                        전체 추가
                      </Button>
                      <Button
                        onClick={fetchMainGrid3}
                        themeColor={"primary"}
                        icon="refresh"
                        fillMode={"flat"}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: webheight4 }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        // [SELECTED_FIELD]: selectedState[idGetter(row)],
                      })),
                      mainDataResult3State
                    )}
                    {...mainDataResult3State}
                    onDataStateChange={onMainDataResult3StateChange}
                    dataItemKey={DATA_ITEM_KEY2}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange3}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    //필터기능
                    filterable={true}
                  >
                    <GridColumn
                      field="customer_name"
                      title="업체명"
                      footerCell={mainTotalFooterCell3}
                    />
                  </Grid>
                </GridContainer>
              </GridContainer>
            )}
          </GridContainerWrap>
        </>
      )}
    </>
  );
};
export default App;
