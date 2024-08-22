import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  MultiSelect,
  MultiSelectChangeEvent,
} from "@progress/kendo-react-dropdowns";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RichEditor from "../components/RichEditor";
import { TEditorHandle, TPermissions } from "../store/types";
// import AnswerWindow from "../components/Windows/CommonWindows/AnswerWindow";
// import QuestionWindow from "../components/Windows/CommonWindows/QuestionWindow";
// import TaskOrderListWindow from "../components/Windows/CommonWindows/TaskOrderListWindow";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import TopButtons from "../components/Buttons/TopButtons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import FilterContainer from "../components/Containers/FilterContainer";

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

const Exists_taskCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  let value = dataItem[field ?? ""];
  if (value === "Y" || value === true) {
    value = true;
  } else {
    value = false;
  }
  const [taskWindowVisible, setTaskWindowVisible] = useState<boolean>(false);

  const onTaskWndClick = () => {
    if (value == true) {
      setTaskWindowVisible(true);
    }
  };

  return (
    <>
      <td
        className={className}
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
        style={{ position: "relative" }}
      >
        <div style={{ textAlign: "center", marginRight: "10px" }}>
          <Checkbox checked={value} readOnly />
        </div>
        <ButtonInGridInput>
          <Button onClick={onTaskWndClick} icon="search" fillMode="flat" />
        </ButtonInGridInput>
      </td>
    </>
  );
};
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;

let index = 0;

const DATA_ITEM_KEY = "document_id";
const App = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  //메시지 조회
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages(setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const idGetter = getter(DATA_ITEM_KEY);
  let gridRef: any = useRef(null);
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
  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_CM500_603_Q, L_CR_A1010", setBizComponentData);
  //상태, 의약품상세분류

  const [dateTypeListData, setDateTypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [statusListData, setStatusListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setDateTypeListData(getBizCom(bizComponentData, "L_CR_A1010"));
      setStatusListData(getBizCom(bizComponentData, "L_CM500_603_Q"));
    }
  }, [bizComponentData]);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
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

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(false) - height - height3 - height4);
        setMobileHeight3(getDeviceHeight(false) - height - height6 - height5);
        setWebHeight(getDeviceHeight(false) - height - height2);
        setWebHeight2(
          (getDeviceHeight(false) -
            height -
            height3 -
            height4 -
            height5 -
            height6) /
            2
        );
        setWebHeight3(
          (getDeviceHeight(false) -
            height -
            height3 -
            height4 -
            height5 -
            height6) /
            2
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

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
        workperson: defaultOption.find((item: any) => item.id == "workperson")
          ?.valueCode,
        receptionist: defaultOption.find(
          (item: any) => item.id == "receptionist"
        )?.valueCode,
        reception_person: defaultOption.find(
          (item: any) => item.id == "reception_person"
        )?.valueCode,
        reception_type: defaultOption.find(
          (item: any) => item.id == "reception_type"
        )?.valueCode,
        value_code3: defaultOption.find((item: any) => item.id == "value_code3")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [isVisibleDetail, setIsVisableDetail] = useState(true);
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
        setPage(initialPageState);
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

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name = "" } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterComboBoxChange = (e: any) => {
    const { value } = e.target;
    const name = e.target.props.name ?? "";

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterMultiSelectChange = (event: MultiSelectChangeEvent) => {
    const values = event.value;
    const name = event.target.props.name ?? "";

    setFilters((prev) => ({
      ...prev,
      [name]: values,
    }));
  };

  // 엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (isVisibleDetail) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
    }
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
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const [filters, setFilters] = useState({
    workType: "list",
    dateType: [
      { sub_code: "A", code_name: "요청일" },
      { sub_code: "D", code_name: "미처리 건 항상" },
    ],
    frdt: new Date(),
    todt: new Date(),
    workperson: "",
    receptionist: sessionUserId,
    custnm: "",
    user_name: "",
    reception_person: "",
    reception_type: "",
    value_code3: "",
    contents: "",
    status: [
      { sub_code: "Wait", code_name: "대기", code: "N" },
      { sub_code: "Progress", code_name: "진행중", code: "R" },
      { sub_code: "Hold", code_name: "보류", code: "H" },
    ],
    find_row_value: "",
    pgSize: PAGE_SIZE,
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    setMainDataResult((prev) => {
      return {
        data: [
          {
            answer_attdatnum: "",
            answer_document_id: "A2023082100002",
            answer_files: "",
            attdatnum: "",
            be_finished_date: "20230825",
            check_date: null,
            completion_date: "",
            contents:
              "안녕하세요. 부흥정밀 관리부 정미란사원입니다.\r\n\r\n일근태관련해서 요새 좀 문의 드리는 일이 많은 것 같네요;;ㅎㅎ\r\n일근태업로드하고 일근태에서 수정시에 전 프로그램에서처럼 오류가 있으면 색깔을 다르게 표시한다던가 그런 게 있었으면 좋겠습니다.\r\n현재 전 프로그램과 같이 쓰고있는데 불편한 게 아직 좀 있더라구요...\r\n그리고 시간 수정하고서 저장을 누르는 게 초기화 상태가 되는 걸 방지하기 위해서 누르는 건데 \r\n보다가 시간 수정하고 다시 한 번 누르게 되면 다시 초기화가 되더라구요...\r\n그것도 좀 확인해서 수정 좀 부탁드릴게요.\r\n마지막으로 야간 출근 시에 12시 전에 퇴근하시는 분들은 왜 조퇴로 표시가 되는 게 아니라 -로 표시가 되는 지 그것도 확인 후 수정 부탁드립니다.\r\n\r\n",
            customer_code: "10622",
            customer_name: "(주)부흥정밀",
            document_id: "Q2023082100003",
            exists_task: "Y",
            files: "",
            finished_count: 0,
            insert_pc: "이은주/192.168.0.41",
            insert_time: "2023-08-21T09:19:16.213",
            insert_user_id: "10622",
            insert_userid: "10622",
            is_checked: "N",
            is_finish: "N",
            is_lock: "Y",
            is_public: "N",
            module_type: "",
            password: "HdySyI0X/S+WOchh3LJGfw==",
            reception_attach_exists: "N",
            reception_attach_files: "",
            reception_attach_number: "",
            reception_date: "20230821",
            reception_person: "2064",
            reception_time: 0,
            reception_type: "Q",
            ref_number: "2023082100000047",
            request_date: "20230821",
            salt: "m8FtLKPX9rouTo4YR9YYGY2ELtf8XMVIN4c+VyHnE/I=",
            status: "R",
            title: "일근태관련 수정건",
            total_count: 1,
            update_pc: null,
            update_time: null,
            update_user_id: null,
            update_userid: null,
            user_id: "10622",
            user_name: "정미란",
            user_tel: "",
            value_code3: "",
          },
          {
            answer_attdatnum: "",
            answer_document_id: "A2023081800002",
            answer_files: "",
            attdatnum: "",
            be_finished_date: "20230825",
            check_date: null,
            completion_date: "",
            contents:
              "안녕하세요 부흥정밀 관리부 정미란사원입니다.\r\n\r\n일근태 작성 시, 근태구분에 예비군으로 체크하면 실근무일수도 1로 변하게 될 뿐만아니라 조퇴시간이 16시간으로 변경됩니다.\r\n\r\n확인 후, 기본시간에만 8시간으로 적용되게끔 수정바랍니다.\r\n\r\n감사합니다.",
            customer_code: "10622",
            customer_name: "(주)부흥정밀",
            document_id: "Q2023081800001",
            exists_task: "Y",
            files: "",
            finished_count: 0,
            insert_pc: "이은주/192.168.0.41",
            insert_time: "2023-08-18T09:18:43.713",
            insert_user_id: "10622",
            insert_userid: "10622",
            is_checked: "N",
            is_finish: "N",
            is_lock: "Y",
            is_public: "N",
            module_type: "",
            password: "L1h42DE2t+PhI6NHkMdetg==",
            reception_attach_exists: "N",
            reception_attach_files: "",
            reception_attach_number: "",
            reception_date: "20230818",
            reception_person: "2064",
            reception_time: 0,
            reception_type: "Q",
            ref_number: "2023081800000071",
            request_date: "20230818",
            salt: "dQkRwnzmedRRCsAZ0fRpP94aBT2HPo90YVTxCM0N9vI=",
            status: "R",
            title: "일근태 수정건",
            total_count: 1,
            update_pc: null,
            update_time: null,
            update_user_id: null,
            update_userid: null,
            user_id: "10622",
            user_name: "정미란",
            user_tel: "",
            value_code3: "",
          },
          {
            answer_attdatnum: "",
            answer_document_id: "A2023080900007",
            answer_files: "",
            attdatnum: "CS2023071800001",
            be_finished_date: "20230818",
            check_date: null,
            completion_date: "",
            contents:
              "구매관리에 '재고관리' 추가 요청드립니다.(조금전 통화한 건입니다.)\r\n\r\n구매내역에서 자동으로 가지고 오는게 아니라, 저희가 수기로 입력을 해서 기록할 수 있는 양식으로 부탁드립니다.\r\n첨부했으니 가능여부 확인 부탁드립니다.",
            customer_code: "10164",
            customer_name: "일신테크(주)",
            document_id: "Q2023071800006",
            exists_task: "N",
            files: "재고관리요청.xlsx",
            finished_count: null,
            insert_pc: "DESKTOP-EIR8JCC/192.168.10.240",
            insert_time: "2023-07-18T13:39:39.493",
            insert_user_id: "10164",
            insert_userid: "10164",
            is_checked: "N",
            is_finish: "N",
            is_lock: "N",
            is_public: "Y",
            module_type: "",
            password: "5OR1b/b4JdGMlp+BdUmEWA==",
            reception_attach_exists: "N",
            reception_attach_files: "",
            reception_attach_number: "",
            reception_date: "20230719",
            reception_person: "2112",
            reception_time: 0,
            reception_type: "Q",
            ref_number: "2023071900000004",
            request_date: "20230718",
            salt: "gGgziXN86NKRtSN5SVCCWhsOETecteDgPNs5m1PqTRM=",
            status: "H",
            title: "재고관리",
            total_count: null,
            update_pc: null,
            update_time: null,
            update_user_id: null,
            update_userid: null,
            user_id: "10164",
            user_name: "노혜진",
            user_tel: "051-831-7432",
            value_code3: "",
          },
        ],
        total: 3,
      };
    });
    setSelectedState({ Q2023082100003: true });
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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

  const docEditorRef = useRef<TEditorHandle>(null);
  const docEditorRef2 = useRef<TEditorHandle>(null);

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
                    onKeyPress={(e) => handleKeyPressSearch(e, search)}
                  >
                    <tbody>
                      <tr>
                        <th>기간</th>
                        <td>
                          <MultiSelect
                            name="dateType"
                            data={dateTypeListData}
                            onChange={filterMultiSelectChange}
                            value={filters.dateType}
                            textField="code_name"
                            dataItemKey="sub_code"
                          />
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
                      </tr>
                      <tr>
                        <th>처리담당자</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="workperson"
                              value={filters.workperson}
                              customOptionData={customOptionData}
                              changeData={filterComboBoxChange}
                              textField="user_name"
                              valueField="user_id"
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>접수담당자</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="receptionist"
                              value={filters.receptionist}
                              customOptionData={customOptionData}
                              changeData={filterComboBoxChange}
                              textField="user_name"
                              valueField="user_id"
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
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
                      <tr>
                        <th>작성자</th>
                        <td>
                          <Input
                            name="user_name"
                            type="text"
                            value={filters.user_name}
                            onChange={filterInputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>접수자</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="reception_person"
                              value={filters.reception_person}
                              customOptionData={customOptionData}
                              changeData={filterComboBoxChange}
                              textField="user_name"
                              valueField="user_id"
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>접수 구분</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="reception_type"
                              value={filters.reception_type}
                              customOptionData={customOptionData}
                              changeData={filterComboBoxChange}
                            />
                          )}
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
                      </tr>
                      <tr>
                        <th>Value 구분</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="value_code3"
                              value={filters.value_code3}
                              customOptionData={customOptionData}
                              changeData={filterComboBoxChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>상태</th>
                        <td>
                          <MultiSelect
                            name="status"
                            data={statusListData}
                            onChange={filterMultiSelectChange}
                            value={filters.status}
                            textField="code_name"
                            dataItemKey="sub_code"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FilterBox>
                </FilterContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>업무지시 정보</GridTitle>
                </GridTitleContainer>
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
                  <GridColumn field="rowstatus" title=" " width="45px" />
                  <GridColumn
                    field="reception_type"
                    title="접수구분"
                    width={100}
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn
                    field="status"
                    title="상태"
                    width={120}
                    cell={QnaStateCell}
                  />
                  <GridColumn
                    field="exists_task"
                    title="지시여부"
                    width={120}
                    cell={Exists_taskCell}
                  />
                  <GridColumn
                    field="is_finish"
                    title="완료여부"
                    width={80}
                    cell={CheckBoxReadOnlyCell}
                  />
                  <GridColumn
                    field="request_date"
                    title="요청일"
                    width={120}
                    cell={DateCell}
                  />
                  <GridColumn field="user_name" title="작성자" width={120} />
                  <GridColumn field="user_tel" title="연락처" width={120} />
                  <GridColumn
                    field="customer_code"
                    title="업체코드"
                    width={120}
                  />
                  <GridColumn
                    field="customer_name"
                    title="업체명"
                    width={150}
                  />
                  <GridColumn
                    field="reception_person"
                    title="접수자"
                    width={120}
                  />
                  <GridColumn
                    field="reception_time"
                    title="접수소요시간"
                    width={100}
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="reception_date"
                    title="접수일"
                    width={120}
                    cell={DateCell}
                  />
                  <GridColumn field="title" title="제목" width={300} />
                  <GridColumn
                    field="value_code3"
                    title="Value구분"
                    width={120}
                  />
                  <GridColumn
                    field="be_finished_date"
                    title="완료예정일"
                    width={120}
                    cell={DateCell}
                  />
                  <GridColumn
                    field="completion_date"
                    title="처리완료일"
                    width={120}
                    cell={DateCell}
                  />
                  <GridColumn
                    field="reception_attach_number"
                    title="접수자료첨부"
                    width={120}
                  />
                  <GridColumn
                    field="document_id"
                    title="문서번호"
                    width={200}
                  />
                  <GridColumn
                    field="answer_document_id"
                    title="답변문서번호"
                    width={200}
                  />
                  <GridColumn
                    field="ref_number"
                    title="접수일지번호"
                    width={200}
                  />
                </Grid>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>문의 내용</GridTitle>
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
                    <div>
                      <Button
                        icon={"pencil"}
                        themeColor={"primary"}
                        fillMode={"outline"}
                        disabled={
                          mainDataResult.data.filter(
                            (item) =>
                              item[DATA_ITEM_KEY] ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] == undefined
                            ? true
                            : mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].reception_type == "Q"
                            ? true
                            : false
                        }
                      >
                        수정
                      </Button>
                      <Button
                        icon={"file-word"}
                        name="meeting"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        다운로드
                      </Button>
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
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <div style={{ height: mobileheight2 }}>
                  <RichEditor id="docEditor" ref={docEditorRef} hideTools />
                </div>
                <FormBoxWrap border={true} className="FormBoxWrap">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>첨부파일</th>
                        <td>
                          <Input
                            name="answer_files"
                            type="text"
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
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].files
                            }
                            className="readonly"
                          />
                          <ButtonInGridInput>
                            <Button icon="more-horizontal" fillMode="flat" />
                          </ButtonInGridInput>
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>답변내용</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
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
                      icon={"pencil"}
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      수정
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <div style={{ height: mobileheight3 }}>
                  <RichEditor id="docEditor2" ref={docEditorRef2} hideTools />
                </div>

                <FormBoxWrap border={true} className="FormBoxWrap2">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>첨부파일</th>
                        <td>
                          <Input
                            name="answer_files"
                            type="text"
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
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].answer_files
                            }
                            className="readonly"
                          />
                          <ButtonInGridInput>
                            <Button icon="more-horizontal" fillMode="flat" />
                          </ButtonInGridInput>
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
            <GridContainer width={`15%`}>
              <GridTitleContainer>
                <GridTitle>조회조건</GridTitle>
              </GridTitleContainer>
              <FilterContainer>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
                      <th>기간</th>
                      <td>
                        <MultiSelect
                          name="dateType"
                          data={dateTypeListData}
                          onChange={filterMultiSelectChange}
                          value={filters.dateType}
                          textField="code_name"
                          dataItemKey="sub_code"
                        />
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
                    <tr>
                      <th>처리담당자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="workperson"
                            value={filters.workperson}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="user_name"
                            valueField="user_id"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>접수담당자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="receptionist"
                            value={filters.receptionist}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="user_name"
                            valueField="user_id"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
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
                    <tr>
                      <th>작성자</th>
                      <td>
                        <Input
                          name="user_name"
                          type="text"
                          value={filters.user_name}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>접수자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="reception_person"
                            value={filters.reception_person}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="user_name"
                            valueField="user_id"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>접수 구분</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="reception_type"
                            value={filters.reception_type}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
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
                    </tr>
                    <tr>
                      <th>Value 구분</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="value_code3"
                            value={filters.value_code3}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>상태</th>
                      <td>
                        <MultiSelect
                          name="status"
                          data={statusListData}
                          onChange={filterMultiSelectChange}
                          value={filters.status}
                          textField="code_name"
                          dataItemKey="sub_code"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
            </GridContainer>
            {isVisibleDetail && (
              <GridContainer width={`calc(40% - ${GAP}px)`}>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>업무지시 정보</GridTitle>
                </GridTitleContainer>
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
                  <GridColumn field="rowstatus" title=" " width="45px" />
                  <GridColumn
                    field="reception_type"
                    title="접수구분"
                    width={100}
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn
                    field="status"
                    title="상태"
                    width={120}
                    cell={QnaStateCell}
                  />
                  <GridColumn
                    field="exists_task"
                    title="지시여부"
                    width={120}
                    cell={Exists_taskCell}
                  />
                  <GridColumn
                    field="is_finish"
                    title="완료여부"
                    width={80}
                    cell={CheckBoxReadOnlyCell}
                  />
                  <GridColumn
                    field="request_date"
                    title="요청일"
                    width={120}
                    cell={DateCell}
                  />
                  <GridColumn field="user_name" title="작성자" width={120} />
                  <GridColumn field="user_tel" title="연락처" width={120} />
                  <GridColumn
                    field="customer_code"
                    title="업체코드"
                    width={120}
                  />
                  <GridColumn
                    field="customer_name"
                    title="업체명"
                    width={150}
                  />
                  <GridColumn
                    field="reception_person"
                    title="접수자"
                    width={120}
                  />
                  <GridColumn
                    field="reception_time"
                    title="접수소요시간"
                    width={100}
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="reception_date"
                    title="접수일"
                    width={120}
                    cell={DateCell}
                  />
                  <GridColumn field="title" title="제목" width={300} />
                  <GridColumn
                    field="value_code3"
                    title="Value구분"
                    width={120}
                  />
                  <GridColumn
                    field="be_finished_date"
                    title="완료예정일"
                    width={120}
                    cell={DateCell}
                  />
                  <GridColumn
                    field="completion_date"
                    title="처리완료일"
                    width={120}
                    cell={DateCell}
                  />
                  <GridColumn
                    field="reception_attach_number"
                    title="접수자료첨부"
                    width={120}
                  />
                  <GridColumn
                    field="document_id"
                    title="문서번호"
                    width={200}
                  />
                  <GridColumn
                    field="answer_document_id"
                    title="답변문서번호"
                    width={200}
                  />
                  <GridColumn
                    field="ref_number"
                    title="접수일지번호"
                    width={200}
                  />
                </Grid>
              </GridContainer>
            )}
            <GridContainer
              width={
                isVisibleDetail
                  ? `calc(45% - ${GAP}px)`
                  : `calc(85% - ${GAP}px)`
              }
            >
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>
                    <Button
                      themeColor={"primary"}
                      fillMode={"flat"}
                      icon={isVisibleDetail ? "chevron-left" : "chevron-right"}
                      onClick={() => setIsVisableDetail((prev) => !prev)}
                    ></Button>
                    문의 내용
                  </GridTitle>
                  <ButtonContainer>
                    <Button
                      icon={"pencil"}
                      themeColor={"primary"}
                      fillMode={"outline"}
                      disabled={
                        mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? true
                          : mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].reception_type == "Q"
                          ? true
                          : false
                      }
                    >
                      수정
                    </Button>
                    <Button
                      icon={"file-word"}
                      name="meeting"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      다운로드
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <div style={{ height: webheight2 }}>
                  <RichEditor id="docEditor" ref={docEditorRef} hideTools />
                </div>
                <FormBoxWrap border={true} className="FormBoxWrap">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th style={{ width: "5%" }}>첨부파일</th>
                        <td>
                          <Input
                            name="answer_files"
                            type="text"
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
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].files
                            }
                            className="readonly"
                          />
                          <ButtonInGridInput>
                            <Button icon="more-horizontal" fillMode="flat" />
                          </ButtonInGridInput>
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>답변내용</GridTitle>
                  <ButtonContainer>
                    <Button
                      icon={"pencil"}
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      수정
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <div style={{ height: webheight3 }}>
                  <RichEditor id="docEditor2" ref={docEditorRef2} hideTools />
                </div>

                <FormBoxWrap border={true} className="FormBoxWrap2">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th style={{ width: "5%" }}>첨부파일</th>
                        <td>
                          <Input
                            name="answer_files"
                            type="text"
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
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].answer_files
                            }
                            className="readonly"
                          />
                          <ButtonInGridInput>
                            <Button icon="more-horizontal" fillMode="flat" />
                          </ButtonInGridInput>
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
    </>
  );
};
export default App;
