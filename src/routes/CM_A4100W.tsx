import React, {
  useCallback,
  useEffect,
  useState,
  useContext,
  createContext,
  useRef,
} from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { Checkbox, CheckboxChangeEvent } from "@progress/kendo-react-inputs";
import { IAttachmentData } from "../hooks/interfaces";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { gridList } from "../store/columns/CM_A4100W_C";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
  FormBoxWrap,
  FormBox,
  GridContainerWrap,
  ButtonInGridInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  UseParaPc,
  UseGetValueFromSessionItem,
  useSysMessage,
  toDate,
} from "../components/CommonFunction";
import EducationWindow from "../components/Windows/CommonWindows/EducationWindow";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  GAP,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  isLoading,
  deletedAttadatnumsState,
  unsavedAttadatnumsState,
} from "../store/atoms";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import { TextArea } from "@progress/kendo-react-inputs";

const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];

const NumberField = ["edtime", "cnt"];
const CheckField = ["finyn"];
const DateField = ["recdt"];
const CustomComboField = ["person"];
const filesField = ["files"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자
  UseBizComponent("L_sysUserMaster_001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "person" ? "L_sysUserMaster_001" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      {...props}
      textField={"user_name"}
      valueField={"user_id"}
    />
  ) : (
    <td></td>
  );
};

export const FormContext = createContext<{
  attdatnum: string;
  files: string;
  setAttdatnum: (d: any) => void;
  setFiles: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
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
  const { setAttdatnum, setFiles } = useContext(FormContext);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum(data.attdatnum);
    setFiles(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          onClick={onAttWndClick2}
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
        />
      )}
    </>
  );
};

const CM_A4100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);
  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  //FormContext의 데이터 state
  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");

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
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001,L_CM050",
    //사용자, 교육구분
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [edudivListData, setEdudivListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const edudivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_CM050")
      );
      fetchQuery(personQueryStr, setPersonListData);
      fetchQuery(edudivQueryStr, setEdudivListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [subPgNum, setSubPgNum] = useState(1);
  const [tabSelected, setTabSelected] = React.useState(0);

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [educationWindowVisible, setEducationWindowVisible] =
    useState<boolean>(false);

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

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      if (name == "finyn") {
        if (value == false || value == "N") {
          setInfomation((prev) => ({
            ...prev,
            [name]: "N",
          }));
        } else {
          setInfomation((prev) => ({
            ...prev,
            [name]: "Y",
          }));
        }
      } else {
        setInfomation((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [infomation, setInfomation] = useState({
    pgSize: PAGE_SIZE,
    workType: "U",
    edunum: "",
    edudiv: "",
    person: "",
    title: "",
    edtime: 0,
    recdt: new Date(),
    contents: "",
    files: "",
    attdatnum: "",
    finyn: false,
    row_status_s: "",
    seq_s: "",
    person_s: "",
    remark_s: "",
    attdatnum_s: "",
    datnum: "",
    eduname: "",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: "01",
    datnum: "",
    frdt: new Date(),
    todt: new Date(),
    title: "",
    person: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
    tab: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_CM_A4100W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_datnum": "",
      "@p_frdt": filters.frdt,
      "@p_todt": filters.todt,
      "@p_title": filters.title,
      "@p_person": filters.person,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const parameters2: Iparameters = {
    procedureName: "P_CM_A4100W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_datnum": "",
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_title": filters.title,
      "@p_person": filters.person,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    datnum: "",
  });

  //조회조건 파라미터
  const subparameters: Iparameters = {
    procedureName: "P_CM_A4100W_Q",
    pageNumber: subPgNum,
    pageSize: subfilters.pgSize,
    parameters: {
      "@p_work_type": subfilters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_datnum": subfilters.datnum,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_title": filters.title,
      "@p_person": filters.person,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
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
          const persons = personListData.find(
            (item: any) => item.user_id == firstRowData.person
          )?.user_name;

          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            edunum: firstRowData.edunum,
            edudiv: firstRowData.edudiv,
            person: persons == undefined ? "" : persons,
            title: firstRowData.title,
            edtime: firstRowData.edtime,
            recdt: toDate(firstRowData.recdt),
            contents: firstRowData.contents,
            files: firstRowData.files,
            attdatnum: firstRowData.attdatnum,
            finyn: firstRowData.finyn == "Y" ? true : false,
            row_status_s:
              firstRowData.row_status_s == undefined
                ? ""
                : firstRowData.row_status_s,
            seq_s: firstRowData.seq_s == undefined ? "" : firstRowData.seq_s,
            person_s:
              firstRowData.person_s == undefined ? "" : firstRowData.person_s,
            remark_s:
              firstRowData.remark_s == undefined ? "" : firstRowData.remark_s,
            attdatnum_s:
              firstRowData.attdatnum_s == undefined
                ? ""
                : firstRowData.attdatnum_s,
            datnum: firstRowData.datnum,
            eduname: firstRowData.eduname,
          });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
      tab: 0,
    }));
    setLoading(false);
  };

  const fetchMainGrid2 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult2((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState2({ [firstRowData[DATA_ITEM_KEY]]: true });
          const persons = personListData.find(
            (item: any) => item.user_id == firstRowData.person
          )?.user_name;

          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            edunum: firstRowData.edunum,
            edudiv: firstRowData.edudiv,
            person: persons == undefined ? "" : persons,
            title: firstRowData.title,
            edtime: firstRowData.edtime,
            recdt: toDate(firstRowData.recdt),
            contents: firstRowData.contents,
            files: firstRowData.files,
            attdatnum: firstRowData.attdatnum,
            finyn: firstRowData.finyn == "Y" ? true : false,
            row_status_s:
              firstRowData.row_status_s == undefined
                ? ""
                : firstRowData.row_status_s,
            seq_s: firstRowData.seq_s == undefined ? "" : firstRowData.seq_s,
            person_s:
              firstRowData.person_s == undefined ? "" : firstRowData.person_s,
            remark_s:
              firstRowData.remark_s == undefined ? "" : firstRowData.remark_s,
            attdatnum_s:
              firstRowData.attdatnum_s == undefined
                ? ""
                : firstRowData.attdatnum_s,
            datnum: firstRowData.datnum,
            eduname: firstRowData.eduname,
          });

          setsubFilters((prev) => ({
            ...prev,
            datnum: firstRowData.datnum,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
      tab: 1,
    }));
    setLoading(false);
  };

  const fetchSubGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setSubDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && filters.tab == 1) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid2();
    } else if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    fetchSubGrid();
  }, [subPgNum]);

  let gridRef: any = useRef(null);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 0,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult2.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult2.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 1,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult2]);

  useEffect(() => {
    setSubPgNum(1);
    setSubDataResult(process([], subDataState));
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subfilters]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subPgNum]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  //체크박스 유무
  const [yn, setyn] = useState(true);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    if (tabSelected === 0) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState(newSelectedState);

      const selectedIdx = event.startRowIndex;
      const selectedRowData = event.dataItems[selectedIdx];
      setyn(selectedRowData.finyn == "Y" ? true : false);
      setInfomation({
        pgSize: PAGE_SIZE,
        workType: "U",
        edunum: selectedRowData.edunum,
        edudiv: selectedRowData.edudiv,
        person: selectedRowData.person,
        title: selectedRowData.title,
        edtime: selectedRowData.edtime,
        recdt: toDate(selectedRowData.recdt),
        contents: selectedRowData.contents,
        files: selectedRowData.files,
        attdatnum: selectedRowData.attdatnum,
        finyn: selectedRowData.finyn == "Y" ? true : false,
        row_status_s:
          selectedRowData.row_status_s == undefined
            ? ""
            : selectedRowData.row_status_s,
        seq_s: selectedRowData.seq_s == undefined ? "" : selectedRowData.seq_s,
        person_s:
          selectedRowData.person_s == undefined ? "" : selectedRowData.person_s,
        remark_s:
          selectedRowData.remark_s == undefined ? "" : selectedRowData.remark_s,
        attdatnum_s:
          selectedRowData.attdatnum_s == undefined
            ? ""
            : selectedRowData.attdatnum_s,
        datnum: "",
        eduname: "",
      });
    } else {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState2,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState2(newSelectedState);

      const selectedIdx = event.startRowIndex;
      const selectedRowData = event.dataItems[selectedIdx];

      setInfomation({
        pgSize: PAGE_SIZE,
        workType: "U",
        edunum: selectedRowData.edunum,
        edudiv: selectedRowData.edudiv,
        person: selectedRowData.person,
        title: selectedRowData.title,
        edtime: selectedRowData.edtime,
        recdt: toDate(selectedRowData.recdt),
        contents: selectedRowData.contents,
        files: selectedRowData.files,
        attdatnum: selectedRowData.attdatnum,
        finyn: selectedRowData.finyn == "Y" ? true : false,
        row_status_s:
          selectedRowData.row_status_s == undefined
            ? ""
            : selectedRowData.row_status_s,
        seq_s: selectedRowData.seq_s == undefined ? "" : selectedRowData.seq_s,
        person_s:
          selectedRowData.person_s == undefined ? "" : selectedRowData.person_s,
        remark_s:
          selectedRowData.remark_s == undefined ? "" : selectedRowData.remark_s,
        attdatnum_s:
          selectedRowData.attdatnum_s == undefined
            ? ""
            : selectedRowData.attdatnum_s,
        eduname: selectedRowData.eduname,
        datnum: selectedRowData.datnum,
      });
      setsubFilters((prev) => ({
        ...prev,
        datnum: selectedRowData.datnum,
      }));
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

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
        tab: 0,
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
        tab: 0,
      }));
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler2 = (event: GridEvent) => {
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
        tab: 1,
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
        tab: 1,
      }));
    }
  };

  const onSubScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onAddClick2 = () => {
    if (tabSelected == 0) {
      setInfomation({
        pgSize: PAGE_SIZE,
        workType: "N",
        edunum: "",
        edudiv: "",
        person: "",
        title: "",
        edtime: 0,
        recdt: new Date(),
        contents: "",
        files: "",
        attdatnum: "",
        finyn: true,
        row_status_s: "",
        seq_s: "",
        person_s: "",
        remark_s: "",
        attdatnum_s: "",
        datnum: "",
        eduname: "",
      });
    } else {
      setInfomation({
        pgSize: PAGE_SIZE,
        workType: "",
        edunum: "",
        edudiv: "",
        person: "",
        title: "",
        edtime: 0,
        recdt: new Date(),
        contents: "",
        files: "",
        attdatnum: "",
        finyn: false,
        row_status_s: "",
        seq_s: "",
        person_s: "",
        remark_s: "",
        attdatnum_s: "",
        datnum: "",
        eduname: "",
      });
    }
    setSubPgNum(1);
    setSubDataResult(process([], subDataState));
  };

  const onAddClick = () => {
    let seq = 1;

    if (subDataResult.total > 0) {
      subDataResult.data.forEach((item) => {
        if (item[DATA_ITEM_KEY] > seq) {
          seq = item[DATA_ITEM_KEY];
        }
      });
      seq++;
    }

    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      attdatnum: "",
      datnum: "",
      datnum1: "",
      files: "",
      orgdiv: "01",
      person: "",
      remark: "",
      seq: 0,
      rowstatus: "N",
    };

    setSelectedsubDataState({ [newDataItem.num]: true });
    setSubDataResult((prev) => {
      return {
        data: [...prev.data, newDataItem],
        total: prev.total + 1,
      };
    });
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const onEducationWndClick = () => {
    setEducationWindowVisible(true);
  };

  const handleSelectTab = (e: any) => {
    if (unsavedAttadatnums.length > 0)
      setDeletedAttadatnums(unsavedAttadatnums);
    setTabSelected(e.selected);
    resetAllGrid();
    if (e.selected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 0,
      }));
    } else {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 1,
      }));
    }
  };
  interface IEducationData {
    edunum: string;
    title: string;
  }

  type TdataArr = {
    row_status_s: string[];
    seq_s: string[];
    person_s: string[];
    remark_s: string[];
    attdatnum_s: string[];
  };

  const setEdunum = () => {
    setInfomation((prev) => ({
      ...prev,
      edunum: "",
      eduname: "",
    }));
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    if (!infomation.attdatnum) {
      setUnsavedAttadatnums([data.attdatnum]);
    }

    setInfomation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const getEducationData = (data: IEducationData) => {
    setInfomation((prev) => {
      return {
        ...prev,
        edunum: data.edunum,
        eduname: data.title,
      };
    });
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    deletedMainRows = [];
    resetAllGrid();
    if (tabSelected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 0,
      }));
    } else {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 1,
      }));
    }
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = subDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = subDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setSubDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
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

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    edunum: "",
    datnum: "",
    attdatnum: "",
  });

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (tabSelected == 0) {
      const selectRow = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      if (
        personListData.find((item: any) => item.user_id == selectRow.person)
          ?.user_name == undefined
      ) {
        alert("담당자를 선택해주세요.");
      } else {
        setParaDataDeleted((prev) => ({
          ...prev,
          work_type: "D",
          edunum: selectRow.edunum,
          datnum: "",
          attdatnum: selectRow.attdatnum,
        }));
      }
    } else {
      const selectRow = mainDataResult2.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState2)[0]
      )[0];

      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D1",
        edunum: selectRow.edunum,
        datnum: selectRow.datnum,
        attdatnum: selectRow.attdatnum,
      }));
    }
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_CM_A4100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_edunum": paraDataDeleted.edunum,
      "@p_recdt": convertDateToStr(infomation.recdt),
      "@p_person": personListData.find(
        (item: any) => item.user_name === infomation.person
      )?.user_id,
      "@p_finyn": infomation.finyn === true ? "Y" : "N",
      "@p_title": infomation.title,
      "@p_contents": infomation.contents,
      "@p_edudiv": infomation.edudiv == undefined ? "" : infomation.edudiv,
      "@p_edtime": infomation.edtime == undefined ? 0 : infomation.edtime,
      "@p_attdatnum": infomation.attdatnum,
      "@p_datnum": paraDataDeleted.datnum,
      "@p_row_status_s": infomation.row_status_s,
      "@p_seq_s": infomation.seq_s,
      "@p_person_s": infomation.person_s,
      "@p_remark_s": infomation.remark_s,
      "@p_attdatnum_s": infomation.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A4100W",
    },
  };

  const infopara: Iparameters = {
    procedureName: "P_CM_A4100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": "01",
      "@p_edunum": infomation.edunum,
      "@p_recdt": convertDateToStr(infomation.recdt),
      "@p_person": personListData.find(
        (item: any) => item.user_name === infomation.person
      )?.user_id,
      "@p_finyn":
        infomation.workType == "N1"
          ? ""
          : infomation.finyn === true
          ? "Y"
          : "N",
      "@p_title": infomation.title,
      "@p_contents": infomation.contents,
      "@p_edudiv": infomation.edudiv == undefined ? "" : infomation.edudiv,
      "@p_edtime": infomation.edtime == undefined ? 0 : infomation.edtime,
      "@p_attdatnum": infomation.attdatnum,
      "@p_datnum": infomation.datnum == undefined ? "" : infomation.datnum,
      "@p_row_status_s": infomation.row_status_s,
      "@p_seq_s": infomation.seq_s,
      "@p_person_s": infomation.person_s,
      "@p_remark_s": infomation.remark_s,
      "@p_attdatnum_s": infomation.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A4100W",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D" || paraDataDeleted.work_type === "D1")
      fetchToDelete();
  }, [paraDataDeleted]);

  useEffect(() => {
    if (
      infomation.row_status_s != "" ||
      infomation.workType == "N1" ||
      infomation.workType == "U1"
    )
      fetchTodoGridSaved();
  }, [infomation]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setMainDataResult2(process([], mainDataState2));
      setSubPgNum(1);
      setSubDataResult(process([], subDataState));

      setInfomation((prev) => ({
        ...prev,
        workType: "U",
        row_status_s: "",
      }));
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 1,
      }));
      fetchSubGrid();
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const onSaveClick2 = async () => {
    let valid = true;
    try {
      if (!infomation.person) {
        throw findMessage(messagesData, "CM_A4100W_001");
      } else if (!infomation.edunum) {
        throw findMessage(messagesData, "CM_A4100W_004");
      } else if (
        convertDateToStr(infomation.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(infomation.recdt).substring(6, 8) > "31" ||
        convertDateToStr(infomation.recdt).substring(6, 8) < "01" ||
        convertDateToStr(infomation.recdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A4100W_003");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const dataItem = subDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (infomation.workType == "" && dataItem.length === 0) {
      setInfomation((prev) => ({
        ...prev,
        workType: "N1",
      }));
    }
    if (infomation.workType == "U" && dataItem.length === 0) {
      setInfomation((prev) => ({
        ...prev,
        workType: "U1",
      }));
    }
    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
    let dataArr: TdataArr = {
      row_status_s: [],
      seq_s: [],
      person_s: [],
      remark_s: [],
      attdatnum_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        seq = "",
        rowstatus = "",
        person = "",
        remark = "",
        attdatnum = "",
      } = item;
      dataArr.row_status_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.person_s.push(person);
      dataArr.remark_s.push(remark);
      dataArr.attdatnum_s.push(attdatnum);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        seq = "",
        rowstatus = "",
        person = "",
        remark = "",
        attdatnum = "",
      } = item;

      dataArr.row_status_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.person_s.push(person);
      dataArr.remark_s.push(remark);
      dataArr.attdatnum_s.push(attdatnum);
    });
    if (infomation.workType == "") {
      setInfomation((prev) => ({
        ...prev,
        workType: "N1",
        edunum: infomation.edunum,
        edudiv: infomation.edudiv,
        person: infomation.person,
        title: infomation.title,
        edtime: infomation.edtime,
        recdt: infomation.recdt,
        contents: infomation.contents,
        files: infomation.files,
        attdatnum: infomation.attdatnum,
        finyn: infomation.finyn,
        row_status_s: dataArr.row_status_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        person_s: dataArr.person_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
      }));
    } else {
      setInfomation((prev) => ({
        ...prev,
        workType: "U1",
        edunum: infomation.edunum,
        edudiv: infomation.edudiv,
        person: infomation.person,
        title: infomation.title,
        edtime: infomation.edtime,
        recdt: infomation.recdt,
        contents: infomation.contents,
        files: infomation.files,
        attdatnum: infomation.attdatnum,
        finyn: infomation.finyn,
        row_status_s: dataArr.row_status_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        person_s: dataArr.person_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
      }));
    }
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      if (tabSelected == 0) {
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          scrollDirrection: "down",
          pgNum: 1,
          isSearch: true,
          pgGap: 0,
          tab: 0,
        }));
      } else {
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          scrollDirrection: "down",
          pgNum: 1,
          isSearch: true,
          pgGap: 0,
          tab: 1,
        }));
      }
      // 첨부파일 삭제
      if (paraDataDeleted.attdatnum)
        setDeletedAttadatnums([paraDataDeleted.attdatnum]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      edunum: "",
      datnum: "",
      attdatnum: "",
    }));
  };

  const onSaveClick = async () => {
    fetchSaved();
  };

  const fetchSaved = async () => {
    let data: any;

    let valid = true;
    try {
      if (!infomation.person) {
        throw findMessage(messagesData, "CM_A4100W_001");
      } else if (!infomation.title) {
        throw findMessage(messagesData, "CM_A4100W_002");
      } else if (
        convertDateToStr(infomation.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(infomation.recdt).substring(6, 8) > "31" ||
        convertDateToStr(infomation.recdt).substring(6, 8) < "01" ||
        convertDateToStr(infomation.recdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A4100W_003");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setMainDataResult(process([], mainDataState));

      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 0,
      }));
      deletedMainRows = [];
      setUnsavedAttadatnums([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const CheckChange = (event: CheckboxChangeEvent) => {
    setyn(event.value);
    setInfomation((prev) => ({
      ...prev,
      finyn: event.value,
    }));
  };

  //FormContext 데이터 변경 시 set
  useEffect(() => {
    const items = subDataResult.data.filter(
      (item: any) =>
        item.num == Object.getOwnPropertyNames(selectedsubDataState)[0]
    )[0];
    const datas = subDataResult.data.map((item: any) =>
      item.num == items.num
        ? {
            ...item,
            attdatnum: attdatnum,
            files: files,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : { ...item }
    );

    setSubDataResult((prev) => {
      return {
        data: datas,
        total: prev.total,
      };
    });
  }, [attdatnum, files]);

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];

    subDataResult.data.forEach((item: any, index: number) => {
      if (!selectedsubDataState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });
    setSubDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setSelectedsubDataState({});
  };

  return (
    <>
      <TitleContainer>
        <Title>교육관리</Title>

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
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="교육기준정보">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>제목/내용</th>
                  <td>
                    <Input
                      name="title"
                      type="text"
                      value={filters.title}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={filters.person}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer width="87vw">
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    icon="delete"
                    fillMode="outline"
                    themeColor={"primary"}
                  >
                    삭제
                  </Button>
                  <Button
                    onClick={onSaveClick}
                    icon="save"
                    fillMode="outline"
                    themeColor={"primary"}
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "55vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    person: personListData.find(
                      (item: any) => item.user_id === row.person
                    )?.user_name,
                    edudiv: edudivListData.find(
                      (item: any) => item.sub_code === row.edudiv
                    )?.code_name,
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
                onScroll={onMainScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
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
                            CheckField.includes(item.fieldName)
                              ? CheckBoxCell
                              : NumberField.includes(item.fieldName)
                              ? NumberCell
                              : DateField.includes(item.fieldName)
                              ? DateCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <FormBoxWrap style={{ height: "15vh" }}>
            <FormBox>
              <tbody>
                <tr>
                  <th>교육번호</th>
                  <td>
                    <Input
                      name="edunum"
                      type="text"
                      value={infomation.edunum}
                      className="readonly"
                    />
                  </td>
                  <th>
                    <Checkbox
                      value={yn}
                      onChange={CheckChange}
                      label={"필수여부"}
                      style={{ marginLeft: "30px" }}
                    />
                  </th>
                  <td></td>
                  <th>교육구분</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="edudiv"
                        value={infomation.edudiv}
                        bizComponentId="L_CM050"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>담당자</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="person"
                        value={infomation.person}
                        bizComponentId="L_sysUserMaster_001"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField="user_name"
                        valueField="user_name"
                        className="required"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>제목</th>
                  <td>
                    <Input
                      name="title"
                      type="ext"
                      value={infomation.title}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>교육시간</th>
                  <td>
                    <Input
                      name="edtime"
                      type="number"
                      value={infomation.edtime}
                      onChange={InputChange}
                      style={{ textAlign: "right" }}
                    />
                  </td>
                  <th>일자</th>
                  <td>
                    <DatePicker
                      name="recdt"
                      value={infomation.recdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      className="required"
                      placeholder=""
                    />
                  </td>
                  <th>첨부파일</th>
                  <td>
                    <Input name="files" type="text" value={infomation.files} />
                    <ButtonInInput>
                      <Button
                        type={"button"}
                        onClick={onAttachmentsWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                </tr>
                <tr>
                  <th>내용</th>
                  <td colSpan={9}>
                    <TextArea
                      value={infomation.contents}
                      name="contents"
                      rows={2}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </TabStripTab>
        <TabStripTab title="교육참여/진행관리">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>교육일자</th>
                  <td>
                    <div className="filter-item-wrap">
                      <DatePicker
                        name="frdt"
                        value={filters.frdt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                        className="required"
                        placeholder=""
                      />
                      <DatePicker
                        name="todt"
                        value={filters.todt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                        className="required"
                        placeholder=""
                      />
                    </div>
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
                  <th>교육자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={filters.person}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainerWrap style={{ width: "87vw" }}>
            <GridContainer width="35%">
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "71vh" }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
                    person: personListData.find(
                      (item: any) => item.user_id === row.person
                    )?.user_name,
                    [SELECTED_FIELD]: selectedState2[idGetter(row)],
                  })),
                  mainDataState2
                )}
                {...mainDataState2}
                onDataStateChange={onMainDataStateChange2}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "multiple",
                }}
                onSelectionChange={onSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult2.total}
                onScroll={onMainScrollHandler2}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList2"].map(
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
                              ? mainTotalFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(65% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    icon="delete"
                    fillMode="outline"
                    themeColor={"primary"}
                  >
                    삭제
                  </Button>
                  <Button
                    onClick={onSaveClick2}
                    icon="save"
                    fillMode="outline"
                    themeColor={"primary"}
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap style={{ height: "20vh" }} border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>교육진행번호</th>
                      <td>
                        <Input
                          name="datnum"
                          type="text"
                          value={infomation.datnum}
                          className="readonly"
                        />
                      </td>
                      <th>일자</th>
                      <td>
                        <DatePicker
                          name="recdt"
                          value={infomation.recdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          className="required"
                          placeholder=""
                        />
                      </td>
                      <th>교육자</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="person"
                            value={infomation.person}
                            bizComponentId="L_sysUserMaster_001"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            textField="user_name"
                            valueField="user_name"
                            className="required"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>제목</th>
                      <td>
                        <Input
                          name="title"
                          type="ext"
                          value={infomation.title}
                          onChange={InputChange}
                        />
                      </td>
                      <th>교육번호</th>
                      <td>
                        <Input
                          name="edunum"
                          type="text"
                          value={infomation.edunum}
                          className="required"
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onEducationWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                          <Button
                            type={"button"}
                            onClick={setEdunum}
                            icon="x"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <th>교육명</th>
                      <td>
                        <Input
                          name="eduname"
                          type="text"
                          value={infomation.eduname}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>내용</th>
                      <td colSpan={9}>
                        <TextArea
                          value={infomation.contents}
                          name="contents"
                          rows={2}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={9}>
                        <Input
                          name="files"
                          type="text"
                          value={infomation.files}
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onAttachmentsWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormContext.Provider
                value={{
                  attdatnum,
                  files,
                  setAttdatnum,
                  setFiles,
                  mainDataState,
                  setMainDataState,
                  // fetchGrid,
                }}
              >
                <GridTitleContainer>
                  <GridTitle>상세정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="plus"
                    ></Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "46vh" }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedsubDataState[idGetter(row)],
                    })),
                    subDataState
                  )}
                  {...subDataState}
                  onDataStateChange={onSubDataStateChange}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "multiple",
                  }}
                  onSelectionChange={onSubDataSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subDataResult.total}
                  onScroll={onSubScrollHandler}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubDataSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onSubItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList3"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              CustomComboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : filesField.includes(item.fieldName)
                                ? ColumnCommandCell
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
              </FormContext.Provider>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={infomation.attdatnum}
        />
      )}
      {educationWindowVisible && (
        <EducationWindow
          getVisible={setEducationWindowVisible}
          setData={getEducationData}
        />
      )}
      {gridList.map((grid: any) =>
        grid.columns.map((column: any) => (
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

export default CM_A4100W;
