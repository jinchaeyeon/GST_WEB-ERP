import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import {
  Splitter,
  SplitterOnChangeEvent,
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
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import Calendar from "../components/Calendars/Calendar";
import YearCalendar from "../components/Calendars/YearCalendar";
import CenterCell from "../components/Cells/CenterCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import YearDateCell from "../components/Cells/YearDateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/HU_B4000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY_USE = "prsnnum";
const DATA_ITEM_KEY_USE_DETAIL = "startdate";
const DATA_ITEM_KEY_COMMUTE = "dutydt";
const DATA_ITEM_KEY_JOURNARL = "num";
const DATA_ITEM_KEY_ADJ = "num";
const DateField = ["regorgdt", "rtrdt", "startdate", "recdt"];
const YearDateField = ["yyyy"];
const NumberField = ["totalday", "usedday", "ramainday", "qty"];
const requiredField = ["yyyy", "prsnnum", "adjdiv"];
const CustomComboField = ["adjdiv"];
const CommandField = ["prsnnum"];
let temp = 0;
let deletedMainRows: object[] = [];

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 조정구분
  UseBizComponent("L_HU092", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "adjdiv" ? "L_HU092" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

export const FormContext = createContext<{
  prsnnum: string;
  prsnnm: string;
  setPrsnnum: (d: any) => void;
  setPrsnnm: (d: any) => void;
  adjDataState: State;
  setAdjDataState: (d: any) => void;
}>({} as any);

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    prsnnum,
    prsnnm,
    setPrsnnum,
    setPrsnnm,
    adjDataState,
    setAdjDataState,
  } = useContext(FormContext);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm(data.prsnnm);
    setPrsnnum(data.prsnnum);
  };
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

const HU_B4000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter_use = getter(DATA_ITEM_KEY_USE);
  const idGetter_use_detail = getter(DATA_ITEM_KEY_USE_DETAIL);
  const idGetter_commute = getter(DATA_ITEM_KEY_COMMUTE);
  const idGetter_journal = getter(DATA_ITEM_KEY_JOURNARL);
  const idGetter_adj = getter(DATA_ITEM_KEY_ADJ);
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const userId = UseGetValueFromSessionItem("user_id");

  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  //FormContext받은 데이터 state
  const [prsnnm, setPrsnnm] = useState<string>("");
  const [prsnnum, setPrsnnum] = useState<string>("");

  let grdUserAdj: any = useRef(null);
  let userAdjRowIndex: null | number = null;

  let grdAdjDetail: any = useRef(null);
  let adjDetailRowIndex: null | number = null;

  let grdCommuteRef: any = useRef(null);
  let commuteRowIndex: null | number = null;

  let grdJournalRef: any = useRef(null);
  let journalRowIndex: null | number = null;

  let grdAdjRef: any = useRef(null);
  let adjRowIndex: null | number = null;

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_B4000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_B4000W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        ymdFrdt: setDefaultDate(customOptionData, "ymdFrdt"),
        cboPrsnnum: defaultOption.find((item: any) => item.id === "cboPrsnnum")
          .valueCode,
        radRtryn: defaultOption.find((item: any) => item.id === "radRtryn")
          .valueCode,
      }));
      setAdjFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        prsnnum_adj: defaultOption.find(
          (item: any) => item.id === "prsnnum_adj"
        ).valueCode,
        adjdiv: defaultOption.find((item: any) => item.id === "adjdiv")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_HU250T",
    //등록자
    setBizComponentData
  );

  const [personListData, setPersonListData] = useState([
    { prsnnum: "", prsnnm: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU250T")
      );

      fetchQuery(personQueryStr, setPersonListData);
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
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (tabSelected == 0) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 1) {
      setAdjFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (tabSelected == 0) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 1) {
      if (name == "prsnnum_adj") {
        setAdjFilters((prev) => ({
          ...prev,
          cboPrsnnum: value,
        }));
      } else if (name == "adjdiv") {
        setAdjFilters((prev) => ({
          ...prev,
          adjnm: value,
        }));
      } else {
        setAdjFilters((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 사용자별 연차집계
  const [userAdjDataState, setUserAdjDataState] = useState<State>({
    sort: [],
  });

  const [userAdjDataResult, setUserAdjDataResult] = useState<DataResult>(
    process([], userAdjDataState)
  );

  // 연차상세
  const [adjDetailDataState, setAdjDetailDataState] = useState<State>({
    sort: [],
  });

  const [adjDetailDataResult, setAdjDetailDataResult] = useState<DataResult>(
    process([], adjDetailDataState)
  );

  // 출퇴근부
  const [commuteDataState, setCommuteDataState] = useState<State>({
    sort: [],
  });

  const [commuteDataResult, setCommuteDataResult] = useState<DataResult>(
    process([], commuteDataState)
  );

  // 일지상세
  const [journalDataState, setJournalDataState] = useState<State>({
    sort: [],
  });

  const [journalDataResult, setJournalDataResult] = useState<DataResult>(
    process([], journalDataState)
  );

  // 연차조정
  const [adjDataState, setAdjDataState] = useState<State>({
    sort: [],
  });

  const [adjDataResult, setAdjDataResult] = useState<DataResult>(
    process([], adjDataState)
  );

  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  const [selectedUserAdjState, setSelectedUserAdjState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedAdjDetailState, setSelectedAdjDetailState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedCommuteState, setSelectedCommutelState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedJournalState, setSelectedJournalState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedAdjState, setSelectedAdjState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    ymdFrdt: new Date(),
    cboPrsnnum: "",
    radRtryn: "%",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL1",
    prsnnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters2, setSubFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL2",
    prsnnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters3, setSubFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL3",
    prsnnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  // 연차조정
  const [adjfilters, setAdjFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "ADJ",
    orgdiv: "01",
    cboPrsnnum: "",
    yyyy: new Date(),
    adjnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST1",
        "@p_orgdiv": orgdiv,
        "@p_yyyymmdd": convertDateToStr(filters.ymdFrdt),
        "@p_prsnnum": filters.cboPrsnnum,
        "@p_rtrchk": filters.radRtryn,
        "@p_yyyy": "",
        "@p_adjnm": "",
        "@p_company_code": companyCode,
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
        if (grdUserAdj.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.itemcd === filters.find_row_value
          );
          userAdjRowIndex = findRowIndex;
        }
        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (grdUserAdj.current) {
          userAdjRowIndex = 0;
        }
      }

      setUserAdjDataResult((prev) => {
        return {
          data: [...data.tables[0].Rows],
          total: totalRowCnt === -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.prsnnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedUserAdjState({ [selectedRow[DATA_ITEM_KEY_USE]]: true });

          setSubFilters((prev) => ({
            ...prev,
            prsnnum: selectedRow.prsnnum,
            isSearch: true,
          }));
          setSubFilters2((prev) => ({
            ...prev,
            prsnnum: selectedRow.prsnnum,
            isSearch: true,
          }));
          setSubFilters3((prev) => ({
            ...prev,
            prsnnum: selectedRow.prsnnum,
            isSearch: true,
          }));
        } else {
          setSelectedUserAdjState({ [rows[0][DATA_ITEM_KEY_USE]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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

  //그리드 데이터 조회
  const fetchSubGrid = async (subfilters: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4000W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymmdd": convertDateToStr(filters.ymdFrdt),
        "@p_prsnnum": subfilters.prsnnum,
        "@p_rtrchk": filters.radRtryn,
        "@p_yyyy": "",
        "@p_adjnm": "",
        "@p_company_code": companyCode,
        "@p_find_row_value": subfilters.find_row_value,
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

      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (grdAdjDetail.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.startdate == filters.find_row_value
          );
          adjDetailRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (grdAdjDetail.current) {
          adjDetailRowIndex = 0;
        }
      }

      setAdjDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt === -1 ? 0 : totalRowCnt,
        };
      });

      // 상세정보는 find_row_value가 없기 때문에 첫번재 행 선택 고정
      if (totalRowCnt > 0) {
        setSelectedAdjDetailState({
          [rows[0][DATA_ITEM_KEY_USE_DETAIL]]: true,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));

    setLoading(false);
  };

  const fetchSubGrid2 = async (subfilters2: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4000W_Q",
      pageNumber: subfilters2.pgNum,
      pageSize: subfilters2.pgSize,
      parameters: {
        "@p_work_type": subfilters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymmdd": convertDateToStr(filters.ymdFrdt),
        "@p_prsnnum": subfilters2.prsnnum,
        "@p_rtrchk": filters.radRtryn,
        "@p_yyyy": "",
        "@p_adjnm": "",
        "@p_company_code": companyCode,
        "@p_find_row_value": subfilters2.find_row_value,
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

      if (subfilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (grdCommuteRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.yyyymm == filters.find_row_value
          );
          commuteRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage3({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (grdCommuteRef.current) {
          commuteRowIndex = 0;
        }
      }

      setCommuteDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt === -1 ? 0 : totalRowCnt,
        };
      });

      // 상세정보는 find_row_value가 없기 때문에 첫번재 행 선택 고정
      if (totalRowCnt > 0) {
        setSelectedCommutelState({ [rows[0][DATA_ITEM_KEY_COMMUTE]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));

    setLoading(false);
  };

  const fetchSubGrid3 = async (subfilters3: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4000W_Q",
      pageNumber: subfilters3.pgNum,
      pageSize: subfilters3.pgSize,
      parameters: {
        "@p_work_type": subfilters3.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymmdd": convertDateToStr(filters.ymdFrdt),
        "@p_prsnnum": subfilters3.prsnnum,
        "@p_rtrchk": filters.radRtryn,
        "@p_yyyy": "",
        "@p_adjnm": "",
        "@p_company_code": companyCode,
        "@p_find_row_value": subfilters3.find_row_value,
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

      if (subfilters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (grdJournalRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.recdt == filters.find_row_value
          );
          journalRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage4({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (grdJournalRef.current) {
          journalRowIndex = 0;
        }
      }

      setJournalDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt === -1 ? 0 : totalRowCnt,
        };
      });

      // 상세정보는 find_row_value가 없기 때문에 첫번재 행 선택 고정
      if (totalRowCnt > 0) {
        setSelectedJournalState({ [rows[0][DATA_ITEM_KEY_JOURNARL]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));

    setLoading(false);
  };

  const fetchAdjGrid = async (adjfilters: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4000W_Q",
      pageNumber: adjfilters.pgNum,
      pageSize: adjfilters.pgSize,
      parameters: {
        "@p_work_type": adjfilters.workType,
        "@p_orgdiv": orgdiv,
        "@p_yyyymmdd": "",
        "@p_prsnnum": adjfilters.cboPrsnnum,
        "@p_rtrchk": "",
        "@p_yyyy": adjfilters.yyyy,
        "@p_adjnm": adjfilters.adjnm,
        "@p_company_code": companyCode,
        "@p_find_row_value": adjfilters.find_row_value,
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
        if (grdAdjRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.yyyy + "-" + row.prsnnum + "-" + row.seq ===
              adjfilters.find_row_value
          );
          adjRowIndex = findRowIndex;
        }
        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage5({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (grdUserAdj.current) {
          userAdjRowIndex = 0;
        }
      }

      setAdjDataResult((prev) => {
        return {
          data: [...data.tables[0].Rows],
          total: totalRowCnt === -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          adjfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.yyyy + "-" + row.prsnnum + "-" + row.seq ==
                  adjfilters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedAdjState({ [selectedRow[DATA_ITEM_KEY_ADJ]]: true });
        } else {
          setSelectedAdjState({ [rows[0][DATA_ITEM_KEY_ADJ]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    // 필터 isSearch false처리, pgNum 세팅
    setAdjFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));

    setLoading(false);
  };

  // 조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (subfilters.isSearch && subfilters.prsnnum) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters]);

  useEffect(() => {
    if (subfilters2.isSearch && subfilters2.prsnnum) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters2);
      setSubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subfilters2]);

  useEffect(() => {
    if (subfilters3.isSearch && subfilters3.prsnnum) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters3);
      setSubFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid3(deepCopiedFilters);
    }
  }, [subfilters3]);

  useEffect(() => {
    if (adjfilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(adjfilters);
      setAdjFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchAdjGrid(deepCopiedFilters);
    }
  }, [adjfilters, permissions]);

  // 사용자별 연차 집계 페이지 변경
  const userAdjPageChange = (event: GridPageChangeEvent) => {
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
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setSubFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
    setSubFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
    setSubFilters3((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
  };

  const userAdjDetailPageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setSubFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const commutePageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setSubFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const journalPageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setSubFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const adjPageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setAdjFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setUserAdjDataResult(process([], userAdjDataState));
    setAdjDetailDataResult(process([], adjDetailDataState));
    setCommuteDataResult(process([], commuteDataState));
    setJournalDataResult(process([], journalDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const resetAllGrid2 = () => {
    setAdjDataResult(process([], adjDataState));
    setAdjFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const onUserAdjSortChange = (e: any) => {
    setUserAdjDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onAdjDetailSortChange = (e: any) => {
    setAdjDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onCommuteSortChange = (e: any) => {
    setCommuteDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onJournalSortChange = (e: any) => {
    setJournalDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onAdjSortChange = (e: any) => {
    setAdjDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = userAdjDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = adjDetailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = commuteDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = journalDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const AdjTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = adjDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  // 사용자별 연차집계 수량
  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    userAdjDataResult.data.forEach((item) =>
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

  // 연차조정 수량
  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    adjDataResult.data.forEach((item) =>
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedUserAdjState,
      dataItemKey: DATA_ITEM_KEY_USE,
    });
    setSelectedUserAdjState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setSubFilters((prev) => ({
      ...prev,
      prsnnum: selectedRowData.prsnnum,
      pgNum: 1,
      isSearch: true,
    }));

    setSubFilters2((prev) => ({
      ...prev,
      prsnnum: selectedRowData.prsnnum,
      pgNum: 1,
      isSearch: true,
    }));

    setSubFilters3((prev) => ({
      ...prev,
      prsnnum: selectedRowData.prsnnum,
      pgNum: 1,
      isSearch: true,
    }));
  };

  const onAdjDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedAdjDetailState,
      dataItemKey: DATA_ITEM_KEY_USE_DETAIL,
    });
    setSelectedAdjDetailState(newSelectedState);
  };

  const onCommuteSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedCommuteState,
      dataItemKey: DATA_ITEM_KEY_COMMUTE,
    });
    setSelectedCommutelState(newSelectedState);
  };

  const onJournalSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedJournalState,
      dataItemKey: DATA_ITEM_KEY_JOURNARL,
    });
    setSelectedJournalState(newSelectedState);
  };

  const onAdjSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedAdjState,
      dataItemKey: DATA_ITEM_KEY_ADJ,
    });
    setSelectedAdjState(newSelectedState);
  };

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    if (e.selected == 1) {
      setAdjFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    }
    setTabSelected(e.selected);
  };

  const search = () => {
    if (tabSelected == 0) {
      try {
        if (
          convertDateToStr(filters.ymdFrdt).substring(0, 4) < "1997" ||
          convertDateToStr(filters.ymdFrdt).substring(6, 8) > "31" ||
          convertDateToStr(filters.ymdFrdt).substring(6, 8) < "01" ||
          convertDateToStr(filters.ymdFrdt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "HU_B4000W_001");
        } else {
          resetAllGrid();
          setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
          setPage(initialPageState); // 페이지 초기화
          setPage2(initialPageState);
          setPage3(initialPageState);
          setPage4(initialPageState);
        }
      } catch (e) {
        alert(e);
      }
    } else if (tabSelected == 1) {
      deletedMainRows = [];
      try {
        if (convertDateToStr(adjfilters.yyyy).substring(0, 4) < "1997") {
          throw findMessage(messagesData, "HU_B4000W_001");
        } else {
          resetAllGrid2();
          setAdjFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
          setPage5(initialPageState); // 페이지 초기화
        }
      } catch (e) {
        alert(e);
      }
    }
  };

  //엑셀 내보내기
  let _export: any;;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const onUserAdjDataStateChange = (event: GridDataStateChangeEvent) => {
    setUserAdjDataState(event.dataState);
  };

  const onAdjDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setAdjDetailDataState(event.dataState);
  };

  const onCommuteDataStateChange = (event: GridDataStateChangeEvent) => {
    setCommuteDataState(event.dataState);
  };

  const onJournalDataStateChange = (event: GridDataStateChangeEvent) => {
    setJournalDataState(event.dataState);
  };

  const conAdjDataStateChage = (event: GridDataStateChangeEvent) => {
    setAdjDataState(event.dataState);
  };

  const onAddClick = () => {
    adjDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY_ADJ]: ++temp,
      rowstatus: "N",
      yyyy: convertDateToStr(new Date()).substring(0, 4),
      prsnnum: "",
      prsnm: "",
      adjdiv: "",
      qty: 0,
      remark: "",
      recdt: convertDateToStr(new Date()),
      insert_userid: "",
    };
    setAdjDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSelectedAdjState({ [newDataItem[DATA_ITEM_KEY_ADJ]]: true });
  };

  const onDeleteClick = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    adjDataResult.data.forEach((item: any, index: number) => {
      if (!selectedAdjState[item[DATA_ITEM_KEY_ADJ]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = adjDataResult.data[Math.min(...Object2)];
    } else {
      data = adjDataResult.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setAdjDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedAdjState({
      [data != undefined ? data[DATA_ITEM_KEY_ADJ] : newData[0]]: true,
    });
  };

  // 저장 파라미터 초기값
  const [paraSaved, setParaSaved] = useState({
    workType: "",
    orgdiv: orgdiv,
    rowstatus_s: "",
    yyyy_s: "",
    seq_s: "",
    prsnnum_s: "",
    recdt_s: "",
    qty_s: "",
    remark_s: "",
    adjdiv_s: "",
    userid: userId,
    pc: pc,
    form_id: "HU_B4000W",
  });

  type TdataArr = {
    rowstatus_s: string[];
    yyyy_s: string[];
    seq_s: string[];
    prsnnum_s: string[];
    recdt_s: string[];
    qty_s: string[];
    remark_s: string[];
    adjdiv_s: string[];
  };

  const onSaveClick = () => {
    let valid = true;
    try {
      const dataItem = adjDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (item.yyyy == undefined || item.yyyy == null || item.yyyy == "") {
          valid = false;
        }
        if (
          item.prsnnum == undefined ||
          item.prsnnum == null ||
          item.prsnnum == ""
        ) {
          valid = false;
        }
        if (
          item.adjdiv == undefined ||
          item.adjdiv == null ||
          item.adjdiv == ""
        ) {
          valid = false;
        }
      });

      if (valid == true) {
        if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
        let dataArr: TdataArr = {
          rowstatus_s: [],
          yyyy_s: [],
          seq_s: [],
          prsnnum_s: [],
          recdt_s: [],
          qty_s: [],
          remark_s: [],
          adjdiv_s: [],
        };

        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            yyyy = "",
            seq = "",
            prsnnum = "",
            recdt = "",
            qty = "",
            remark = "",
            adjdiv = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.yyyy_s.push(yyyy);
          dataArr.seq_s.push(seq);
          dataArr.prsnnum_s.push(prsnnum);
          dataArr.recdt_s.push(recdt);
          dataArr.qty_s.push(qty);
          dataArr.remark_s.push(remark);
          dataArr.adjdiv_s.push(adjdiv);
        });

        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            yyyy = "",
            seq = "",
            prsnnum = "",
            recdt = "",
            qty = "",
            remark = "",
            adjdiv = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.yyyy_s.push(yyyy);
          dataArr.seq_s.push(seq);
          dataArr.prsnnum_s.push(prsnnum);
          dataArr.recdt_s.push(recdt);
          dataArr.qty_s.push(qty);
          dataArr.remark_s.push(remark);
          dataArr.adjdiv_s.push(adjdiv);
        });

        setParaSaved((prev) => ({
          ...prev,
          workType: "N",
          orgdiv: orgdiv,
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          yyyy_s: dataArr.yyyy_s.join("|"),
          seq_s: dataArr.seq_s.join("|"),
          prsnnum_s: dataArr.prsnnum_s.join("|"),
          recdt_s: dataArr.recdt_s.join("|"),
          qty_s: dataArr.qty_s.join("|"),
          remark_s: dataArr.remark_s.join("|"),
          adjdiv_s: dataArr.adjdiv_s.join("|"),
          userid: userId,
          pc: pc,
          form_id: "HU_B4000W",
        }));
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    if (paraSaved.rowstatus_s != "" || paraSaved.workType == "D") {
      fetchTodoGridSaved();
    }
  }, [paraSaved]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    const para: Iparameters = {
      procedureName: "P_HU_B4000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraSaved.workType,
        "@p_orgdiv": paraSaved.orgdiv,
        "@p_rowstatus_s": paraSaved.rowstatus_s,
        "@p_yyyy_s": paraSaved.yyyy_s,
        "@p_seq_s": paraSaved.seq_s,
        "@p_prsnnum_s": paraSaved.prsnnum_s,
        "@p_recdt_s": paraSaved.recdt_s,
        "@p_qty_s": paraSaved.qty_s,
        "@p_remark_s": paraSaved.remark_s,
        "@p_adjdiv_s": paraSaved.adjdiv_s,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "HU_B4000W",
      },
    };

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        adjDataResult.data.length == 0 && adjfilters.pgNum > 0;

      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
        setAdjFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setAdjFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString.split("|")[0],
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (
      field == "yyyy" ||
      (field == "prsnnum" && dataItem.rowstatus == "N") ||
      field == "adjdiv" ||
      field == "qty" ||
      field == "remark" ||
      field == "recdt"
    ) {
      const newData = adjDataResult.data.map((item) =>
        item[DATA_ITEM_KEY_ADJ] === dataItem[DATA_ITEM_KEY_ADJ]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setAdjDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: adjDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != adjDataResult.data) {
      const newData = adjDataResult.data.map((item) =>
        item[DATA_ITEM_KEY_ADJ] ==
        Object.getOwnPropertyNames(selectedAdjState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setAdjDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = adjDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setAdjDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setAdjDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      adjDataResult,
      setAdjDataResult,
      DATA_ITEM_KEY_ADJ
    );
  };

  //FormContext 데이터 set
  useEffect(() => {
    const newData = adjDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedAdjState)[0])
        ? {
            ...item,
            prsnm: prsnnm,
            prsnnum: prsnnum,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setAdjDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [prsnnm, prsnnum]);

  // 1일 ~ 31일 반복문으로 컬럼 추가
  const createDateColumn = () => {
    const array = [];
    for (var i = 1; i <= 31; i++) {
      const num = i < 10 ? "0" + i : i + "";
      array.push(
        <GridColumn
          key={i}
          field={"dt_" + num}
          title={num}
          width="45px"
          cell={CenterCell}
        />
      );
    }
    return array;
  };

  const [horizontalPanes, setHorizontalPanes] = React.useState<Array<any>>([
    { size: "35%", min: "20%" },
    {},
    { size: "50%", min: "20%" },
  ]);

  const onHorizontalChange = (event: SplitterOnChangeEvent) => {
    setHorizontalPanes(event.newState);
  };

  return (
    <>
      <TitleContainer>
        <Title>연차사용현황(관리자)</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_B4000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="연차사용현황">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준일</th>
                  <td>
                    <DatePicker
                      name="ymdFrdt"
                      value={filters.ymdFrdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      className="required"
                      placeholder=""
                      calendar={Calendar}
                    />
                  </td>
                  <th>성명</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="cboPrsnnum"
                        value={filters.cboPrsnnum}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        textField="prsnnm"
                        valueField="prsnnum"
                      />
                    )}
                  </td>
                  <th>재직여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="radRtryn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainerWrap>
            <Splitter panes={horizontalPanes} onChange={onHorizontalChange}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>사용자별 연차 집계</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "72vh" }}
                  data={process(
                    userAdjDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedUserAdjState[idGetter_use(row)],
                    })),
                    userAdjDataState
                  )}
                  {...userAdjDataState}
                  onDataStateChange={onUserAdjDataStateChange}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY_USE}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={userAdjDataResult.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={userAdjPageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={grdUserAdj}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onUserAdjSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdUserAdj"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : NumberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : NumberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>연차상세</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "72vh" }}
                  data={process(
                    adjDetailDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]:
                        selectedAdjDetailState[idGetter_use_detail(row)],
                    })),
                    adjDetailDataState
                  )}
                  {...adjDetailDataState}
                  onDataStateChange={onAdjDetailDataStateChange}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY_USE_DETAIL}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onAdjDetailSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={adjDetailDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={userAdjDetailPageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={grdAdjDetail}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onAdjDetailSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions[
                      "grdAdjDetail"
                    ].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : NumberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? subTotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle>출퇴근부</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "40vh" }}
                    data={process(
                      commuteDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]:
                          selectedCommuteState[idGetter_commute(row)],
                      })),
                      commuteDataState
                    )}
                    {...commuteDataState}
                    onDataStateChange={onCommuteDataStateChange}
                    // 선택 기능
                    dataItemKey={DATA_ITEM_KEY_COMMUTE}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onCommuteSelectionChange}
                    // 스크롤 조회 기능
                    fixedScroll={true}
                    total={commuteDataResult.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={commutePageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={grdCommuteRef}
                    rowHeight={30}
                    // 정렬기능
                    sortable={true}
                    onSortChange={onCommuteSortChange}
                    // 컬럼순서조정
                    reorderable={true}
                    // 컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="dutydt"
                      title="년월"
                      width="100px"
                      cell={CenterCell}
                      footerCell={subTotalFooterCell2}
                    />
                    <GridColumn>{createDateColumn()}</GridColumn>
                  </Grid>
                </GridContainer>

                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle>일지상세</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "28vh" }}
                    data={process(
                      journalDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]:
                          selectedJournalState[idGetter_journal(row)], //선택된 데이터
                      })),
                      journalDataState
                    )}
                    {...journalDataState}
                    onDataStateChange={onJournalDataStateChange}
                    //선택기능
                    dataItemKey={DATA_ITEM_KEY_JOURNARL}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onJournalSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={journalDataResult.total}
                    skip={page4.skip}
                    take={page4.take}
                    pageable={true}
                    onPageChange={journalPageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={grdJournalRef}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onJournalSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions[
                        "grdJournalList"
                      ].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                DateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? subTotalFooterCell3
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>
              </GridContainer>
            </Splitter>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="연차조정">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년도</th>
                  <td>
                    <DatePicker
                      name="yyyy"
                      value={adjfilters.yyyy}
                      format="yyyy"
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                      calendar={YearCalendar}
                    />
                  </td>
                  <th>사용자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="prsnnum_adj"
                        value={adjfilters.cboPrsnnum}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        textField="prsnnm"
                        valueField="prsnnum"
                      />
                    )}
                  </td>
                  <th>조정구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="adjdiv"
                        value={adjfilters.adjnm}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <FormContext.Provider
              value={{
                prsnnum,
                prsnnm,
                setPrsnnum,
                setPrsnnm,
                adjDataState,
                setAdjDataState,
              }}
            >
              <GridTitleContainer>
                <GridTitle>연차조정</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "72vh" }}
                data={process(
                  adjDataResult.data.map((row) => ({
                    ...row,
                    yyyy: row.yyyy
                      ? new Date(dateformat(row.yyyy).substring(0, 4))
                      : new Date(),
                    recdt: row.recdt
                      ? new Date(dateformat(row.recdt))
                      : new Date(),
                    insert_userid: personListData.find(
                      (items: any) => items.prsnnum == row.insert_userid
                    )?.prsnnm,
                    rowstatus:
                      row.rowstatus == null ||
                      row.rowstatus == "" ||
                      row.rowstatus == undefined
                        ? ""
                        : row.rowstatus,
                    [SELECTED_FIELD]: selectedAdjState[idGetter_adj(row)],
                  })),
                  adjDataState
                )}
                {...adjDataState}
                onDataStateChange={conAdjDataStateChage}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY_ADJ}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onAdjSelectionChange}
                // 스크롤 조회 기능
                fixedScroll={true}
                total={adjDataResult.total}
                skip={page5.skip}
                take={page5.take}
                pageable={true}
                onPageChange={adjPageChange}
                // 원하는 행 위치로 스크롤 기능
                ref={grdAdjRef}
                rowHeight={30}
                // 정렬기능
                sortable={true}
                onSortChange={onAdjSortChange}
                // 컬럼순서너비조정
                resizable={true}
                // incell 수정 기능
                onItemChange={onMainItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdAdjList"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          id={item.id}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          className={
                            requiredField.includes(item.fieldName)
                              ? "required"
                              : undefined
                          }
                          headerCell={
                            requiredField.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          cell={
                            YearDateField.includes(item.fieldName)
                              ? YearDateCell
                              : DateField.includes(item.fieldName)
                              ? DateCell
                              : CustomComboField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : CommandField.includes(item.fieldName)
                              ? ColumnCommandCell
                              : NumberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? AdjTotalFooterCell
                              : NumberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </FormContext.Provider>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
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

export default HU_B4000W;
