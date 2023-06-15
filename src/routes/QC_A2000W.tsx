import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
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
  GridCellProps,
  GridItemChangeEvent,
  GridHeaderCellProps,
  GridHeaderSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { gridList } from "../store/columns/QC_A2000W_C";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { IAttachmentData } from "../hooks/interfaces";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
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
  GridContainerWrap,
  ButtonInGridInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import {
  Input,
  InputChangeEvent,
  Checkbox,
} from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
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
  UseParaPc,
  UseGetValueFromSessionItem,
  getGridItemChangedData,
} from "../components/CommonFunction";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import {
  isLoading,
  deletedAttadatnumsState,
  unsavedAttadatnumsState,
} from "../store/atoms";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import { useRecoilState } from "recoil";

let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];

export const FormContext = createContext<{
  attdatnum: string;
  files: string;
  setAttdatnum: (d: any) => void;
  setFiles: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

const DATA_ITEM_KEY = "num";

const dateField = ["proddt", "qcdt"];
const numberField = [
  "qty",
  "qcqty",
  "badqty",
  "qc_sort",
  "qcvalue1",
  "goodqty",
];
const customField = ["files"];
const customField2 = ["badcd"];

type TdataArr = {
  rowstatus_s: string[];
  qcdt_s: string[];
  person_s: string[];
  purnum_s: string[];
  purseq_s: string[];
  remark_s: string[];
  attdatnum_s: string[];
  qcqty_s: string[];
  qcnum_s: string[];
};

type TdataArr2 = {
  rowstatus_s: string[];
  purnum_s: string[];
  purseq_s: string[];
  qcnum_s: string[];
  badnum_s: string[];
  badcd_s: string[];
  badseq_s: string[];
  badqty_s: string[];
};
type TdataArr3 = {
  rowstatus_s: string[];
  qcdt_s: string[];
  person_s: string[];
  purnum_s: string[];
  purseq_s: string[];
  remark_s: string[];
  attdatnum_s: string[];
  qcqty_s: string[];
  qcnum_s: string[];
  badnum_s: string[];
  badcd_s: string[];
  badseq_s: string[];
  badqty_s: string[];
};

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
    attdatnum,
    files,
    setAttdatnum,
    setFiles,
    mainDataState,
    setMainDataState,
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

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_QC002 ", setBizComponentData);
  //불량유형
  const field = props.field ?? "";
  const bizComponentIdVal = field === "badcd" ? "L_QC002" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const QC_A2000: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [deletedAttadatnums, setDeletedAttadatnums] = useRecoilState(
    deletedAttadatnumsState
  );
  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  //FormContext 데이터 state
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
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        proccd: defaultOption.find((item: any) => item.id === "proccd")
          .valueCode,
        gubun: defaultOption.find((item: any) => item.id === "gubun").valueCode,
        finyn: defaultOption.find((item: any) => item.id === "finyn").valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        qcdiv: defaultOption.find((item: any) => item.id === "qcdiv").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_PR010",
    //사용자, 공정
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQuery(proccdQueryStr, setProccdListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState2, setDetailDataState2] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );

  const [tabSelected, setTabSelected] = React.useState(0);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [detailPgNum2, setDetailPgNum2] = useState(1);

  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    insiz: "",
    proccd: "",
    lotnum: "",
    gubun: "",
    finyn: "",
    qcnum: "",
    qcdiv: "",
    custcd: "",
    custnm: "",
    purnum: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    qcnum: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_QC_A2000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_proccd": filters.proccd,
      "@p_lotnum": filters.lotnum,
      "@p_gubun": filters.gubun,
      "@p_finyn": filters.finyn,
      "@p_qcnum": filters.qcnum,
      "@p_qcdiv": filters.qcdiv,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_purnum": filters.purnum,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_QC_A2000W_Q",
    pageNumber: detailFilters.pgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "QCLIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_proccd": filters.proccd,
      "@p_lotnum": filters.lotnum,
      "@p_gubun": filters.gubun,
      "@p_finyn": filters.finyn,
      "@p_qcnum": filters.qcnum,
      "@p_qcdiv": filters.qcdiv,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_purnum": filters.purnum,
    },
  };

  const detailParameters2: Iparameters = {
    procedureName: "P_QC_A2000W_Q",
    pageNumber: detailPgNum2,
    pageSize: detailFilters2.pgSize,
    parameters: {
      "@p_work_type": "BADLIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_proccd": filters.proccd,
      "@p_lotnum": filters.lotnum,
      "@p_gubun": filters.gubun,
      "@p_finyn": filters.finyn,
      "@p_qcnum": detailFilters2.qcnum,
      "@p_qcdiv": filters.qcdiv,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_purnum": filters.purnum,
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

          setDetailFilters2((prev) => ({
            ...prev,
            qcnum: firstRowData.qcnum,
          }));
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDetailGrid = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (detailFilters.find_row_value === "" && detailFilters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setDetailSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
          setDetailFilters2((prev) => ({
            ...prev,
            qcnum: firstRowData.qcnum,
          }));
        }
      }
    }
    setDetailFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDetailGrid2 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (totalRowCnt > 0)
        setDetailDataResult2((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
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
    if (
      customOptionData != null &&
      detailFilters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setDetailFilters((prev) => ({ ...prev, isSearch: false }));
      fetchDetailGrid();
    }
  }, [detailFilters, permissions]);

  useEffect(() => {
    resetDetailGrid2();
    if (customOptionData !== null) {
      fetchDetailGrid2();
    }
  }, [detailFilters2]);

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
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (detailFilters.find_row_value !== "" && detailDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = detailDataResult.data.findIndex(
          (item) => idGetter(item) === detailFilters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setDetailFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (detailFilters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [detailDataResult]);

  useEffect(() => {
    if (ifSelectFirstRow) {
      if (detailDataResult2.total > 0) {
        const firstRowData = detailDataResult2.data[0];
        setDetailSelectedState2({ [firstRowData.num]: true });
      }
    }
  }, [detailDataResult2]);

  //그리드 리셋
  const resetAllGrid = () => {
    setDetailPgNum2(1);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState2));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setDetailFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const resetDetailGrid2 = () => {
    setDetailPgNum2(1);
    setDetailDataResult2(process([], detailDataState2));
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

  const ondetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setIfSelectFirstRow(true);
    setDetailFilters2((prev) => ({
      ...prev,
      qcnum: selectedRowData.qcnum,
    }));
  };
  const ondetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState2,
      dataItemKey: DATA_ITEM_KEY,
    });
    setDetailSelectedState2(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
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

  const onDetailScrollHandler = (event: GridEvent) => {
    if (detailFilters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      detailFilters.pgNum +
      (detailFilters.scrollDirrection === "up" ? detailFilters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setDetailFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      detailFilters.pgNum -
      (detailFilters.scrollDirrection === "down" ? detailFilters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setDetailFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onDetailScrollHandler2 = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum2, PAGE_SIZE))
      setDetailPgNum2((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();
    fetchDetailGrid2();
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

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
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

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult2.data.forEach((item) =>
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

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const onAddClick = () => {
    let seq = detailDataResult2.total + deletedMainRows2.length + 1;

    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      badcd: "",
      baddt: convertDateToStr(new Date()),
      badnum: "",
      badseq: "",
      orgdiv: "01",
      qty: 1,
      rowstatus: "N",
    };
    setDetailSelectedState2({ [newDataItem.num]: true });
    setIfSelectFirstRow(false);
    setDetailDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];

    detailDataResult.data.forEach((item: any, index: number) => {
      if (!detailSelectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        setDeletedAttadatnums((prev) => [...prev, item.attdatnum]);
        deletedMainRows.push(newData2);
      }
    });
    setDetailDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setDetailDataState({});
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];

    detailDataResult2.data.forEach((item: any, index: number) => {
      if (!detailSelectedState2[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows2.push(newData2);
      }
    });
    setDetailDataResult2((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setDetailDataState2({});
  };

  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }
  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    deletedMainRows = [];
    deletedMainRows2 = [];
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A2000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A2000W_001");
      }
    } catch (e) {
      alert(e);
    }
    resetAllGrid();
    fetchDetailGrid2();
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "QC_U",
    orgdiv: "01",
    location: "01",
    rowstatus_s: "",
    qcdt_s: "",
    person_s: "",
    purnum_s: "",
    purseq_s: "",
    remark_s: "",
    attdatnum_s: "",
    qcqty_s: "",
    qcnum_s: "",
    badnum_s: "",
    badcd_s: "",
    badseq_s: "",
    badqty_s: "",
    userid: userId,
    pc: pc,
  });

  const para: Iparameters = {
    procedureName: "P_QC_A2000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_qcdt_s": ParaData.qcdt_s,
      "@p_person_s": ParaData.person_s,
      "@p_purnum_s": ParaData.purnum_s,
      "@p_purseq_s": ParaData.purseq_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_attdatnum_s": ParaData.attdatnum_s,
      "@p_qcqty_s": ParaData.qcqty_s,
      "@p_qcnum_s": ParaData.qcnum_s,
      "@p_badnum_s": ParaData.badnum_s,
      "@p_badcd_s": ParaData.badcd_s,
      "@p_badseq_s": ParaData.badseq_s,
      "@p_badqty_s": ParaData.badqty_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_QC_A2000W",
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

    if (data.isSuccess === true) {
      setSelectedState({});
      setUnsavedAttadatnums([]);
      setDeletedAttadatnums([]);
      resetAllGrid();
      fetchDetailGrid2();
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.purnum_s != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onDetailHeaderSelectionChange = useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: {
        [id: string]: boolean | number[];
      } = {};

      event.dataItems.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });

      setDetailSelectedState(newSelectedState);
    },
    []
  );

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setDetailDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setDetailDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      detailDataResult2,
      setDetailDataResult2,
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };
  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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
  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "files" || field == "remark") {
      const newData = detailDataResult.data.map((item) =>
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

      setIfSelectFirstRow(false);
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = detailDataResult2.data.map((item) =>
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

      setIfSelectFirstRow(false);
      setDetailDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit3 = (dataItem: any, field: string) => {
    if (
      field == "doqty" ||
      field == "remark" ||
      field == " files" ||
      field == "chk"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              chk: typeof item.chk == "boolean" ? item.chk : false,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setIfSelectFirstRow(false);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = detailDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setIfSelectFirstRow(false);
    setDetailDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit2 = () => {
    const newData = detailDataResult2.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setIfSelectFirstRow(false);
    setDetailDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit3 = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setIfSelectFirstRow(false);
    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"doqty"}
        title={"검사수량"}
        width="100px"
        cell={NumberCell}
        footerCell={mainTotalFooterCell}
      />
    );
    array.push(<GridColumn field={"remark"} title={"비고"} width="200px" />);
    array.push(
      <GridColumn
        field={"files"}
        title={"첨부파일"}
        width="350px"
        cell={ColumnCommandCell}
      />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(<GridColumn field={"gubun"} title={"구분"} width="100px" />);
    array.push(
      <GridColumn field={"purkey"} title={"발주번호"} width="150px" />
    );
    array.push(
      <GridColumn
        field={"purdt"}
        title={"발주일자"}
        width="130px"
        cell={DateCell}
      />
    );
    array.push(<GridColumn field={"custnm"} title={"업체명"} width="150px" />);
    array.push(
      <GridColumn field={"itemcd"} title={"품목코드"} width="150px" />
    );
    array.push(<GridColumn field={"itemnm"} title={"품목명"} width="150px" />);
    array.push(<GridColumn field={"insiz"} title={"규격"} width="150px" />);
    array.push(<GridColumn field={"proccd"} title={"공정"} width="100px" />);
    array.push(
      <GridColumn
        field={"qty"}
        title={"발주량"}
        width="100px"
        footerCell={gridSumQtyFooterCell}
        cell={NumberCell}
      />
    );
    array.push(
      <GridColumn
        field={"inqty"}
        title={"입고수량"}
        width="100px"
        footerCell={gridSumQtyFooterCell}
        cell={NumberCell}
      />
    );
    array.push(
      <GridColumn
        field={"qcqty"}
        title={"검사수량"}
        width="100px"
        footerCell={gridSumQtyFooterCell}
        cell={NumberCell}
      />
    );
    array.push(
      <GridColumn
        field={"janqty"}
        title={"잔여량"}
        width="100px"
        footerCell={gridSumQtyFooterCell}
        cell={NumberCell}
      />
    );
    return array;
  };

  const onSaveClick = () => {
    let dataArr: TdataArr = {
      rowstatus_s: [],
      qcdt_s: [],
      person_s: [],
      purnum_s: [],
      purseq_s: [],
      remark_s: [],
      attdatnum_s: [],
      qcqty_s: [],
      qcnum_s: [],
    };

    detailDataResult.data.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        qcdt = "",
        person = "",
        purnum = "",
        purseq = "",
        remark = "",
        attdatnum = "",
        qcqty = "",
        qcnum = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.qcdt_s.push(qcdt == "" ? "" : qcdt);
      dataArr.person_s.push(person == undefined ? "" : person);
      dataArr.purnum_s.push(purnum == "" ? "" : purnum);
      dataArr.purseq_s.push(purseq == "" ? 0 : purseq);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
      dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      dataArr.qcqty_s.push(qcqty == "" ? 0 : qcqty);
      dataArr.qcnum_s.push(qcnum == undefined ? "" : qcnum);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        qcdt = "",
        person = "",
        purnum = "",
        purseq = "",
        remark = "",
        attdatnum = "",
        qcqty = "",
        qcnum = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.qcdt_s.push(qcdt == "" ? "" : qcdt);
      dataArr.person_s.push(person == undefined ? "" : person);
      dataArr.purnum_s.push(purnum == "" ? "" : purnum);
      dataArr.purseq_s.push(purseq == "" ? 0 : purseq);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
      dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      dataArr.qcqty_s.push(qcqty == "" ? 0 : qcqty);
      dataArr.qcnum_s.push(qcnum == undefined ? "" : qcnum);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "QC_U",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      qcdt_s: dataArr.qcdt_s.join("|"),
      person_s: dataArr.person_s.join("|"),
      purnum_s: dataArr.purnum_s.join("|"),
      purseq_s: dataArr.purseq_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      attdatnum_s: dataArr.attdatnum_s.join("|"),
      qcqty_s: dataArr.qcqty_s.join("|"),
      qcnum_s: dataArr.qcnum_s.join("|"),
    }));
  };

  const onSaveClick2 = () => {
    const datas = detailDataResult.data.filter(
      (item: any) =>
        item.num == Object.getOwnPropertyNames(detailSelectedState)[0]
    )[0];
    let dataArr: TdataArr2 = {
      rowstatus_s: [],
      purnum_s: [],
      purseq_s: [],
      qcnum_s: [],
      badnum_s: [],
      badcd_s: [],
      badseq_s: [],
      badqty_s: [],
    };

    detailDataResult2.data.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        badnum = "",
        badcd = "",
        badseq = "",
        qty = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.purnum_s.push(datas.purnum == "" ? "" : datas.purnum);
      dataArr.purseq_s.push(datas.purseq == "" ? 0 : datas.purseq);
      dataArr.qcnum_s.push(datas.qcnum == undefined ? "" : datas.qcnum);
      dataArr.badnum_s.push(badnum == undefined ? "" : badnum);
      dataArr.badcd_s.push(badcd == undefined ? "" : badcd);
      dataArr.badseq_s.push(badseq == "" ? 0 : badseq);
      dataArr.badqty_s.push(qty == "" ? 0 : qty);
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        badnum = "",
        badcd = "",
        badseq = "",
        qty = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.purnum_s.push(datas.purnum == "" ? "" : datas.purnum);
      dataArr.purseq_s.push(datas.purseq == "" ? 0 : datas.purseq);
      dataArr.qcnum_s.push(datas.qcnum == undefined ? "" : datas.qcnum);
      dataArr.badnum_s.push(badnum == undefined ? "" : badnum);
      dataArr.badcd_s.push(badcd == undefined ? "" : badcd);
      dataArr.badseq_s.push(badseq == "" ? 0 : badseq);
      dataArr.badqty_s.push(qty == "" ? 0 : qty);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "BAD_U",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      purnum_s: dataArr.purnum_s.join("|"),
      purseq_s: dataArr.purseq_s.join("|"),
      qcnum_s: dataArr.qcnum_s.join("|"),
      badnum_s: dataArr.badnum_s.join("|"),
      badcd_s: dataArr.badcd_s.join("|"),
      badseq_s: dataArr.badseq_s.join("|"),
      badqty_s: dataArr.badqty_s.join("|"),
    }));
  };

  const onSaveClick3 = () => {
    const datas = Object.getOwnPropertyNames(selectedState).map((item) => {
      return mainDataResult.data.filter((items: any) => items.num == item)[0];
    });

    let valid = true;

    datas.map((item) => {
      if (item.doqty == 0) {
        valid = false;
        return false;
      }
    });
    if (valid == true) {
      let dataArr: TdataArr3 = {
        rowstatus_s: [],
        qcdt_s: [],
        person_s: [],
        purnum_s: [],
        purseq_s: [],
        remark_s: [],
        attdatnum_s: [],
        qcqty_s: [],
        qcnum_s: [],
        badnum_s: [],
        badcd_s: [],
        badseq_s: [],
        badqty_s: [],
      };

      datas.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          purnum = "",
          purseq = "",
          remark = "",
          attdatnum = "",
          qcqty = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.qcdt_s.push("");
        dataArr.person_s.push("");
        dataArr.purnum_s.push(purnum == undefined ? "" : purnum);
        dataArr.purseq_s.push(purseq == "" ? 0 : purseq);
        dataArr.remark_s.push(remark == undefined ? "" : remark);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
        dataArr.qcqty_s.push(qcqty == "" ? 0 : qcqty);
        dataArr.qcnum_s.push("");
      });

      setParaData((prev) => ({
        ...prev,
        workType: "N",
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        qcdt_s: dataArr.qcdt_s.join("|"),
        person_s: dataArr.person_s.join("|"),
        purnum_s: dataArr.purnum_s.join("|"),
        purseq_s: dataArr.purseq_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
        qcqty_s: dataArr.qcqty_s.join("|"),
        qcnum_s: dataArr.qcnum_s.join("|"),
        badnum_s: dataArr.badnum_s.join("|"),
        badcd_s: dataArr.badcd_s.join("|"),
        badseq_s: dataArr.badseq_s.join("|"),
        badqty_s: dataArr.badqty_s.join("|"),
      }));
    } else {
      alert("검사수량을 입력해주세요.");
    }
  };

  //FormContext에서 데이터 받아 set
  useEffect(() => {
    const items = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    const datas = mainDataResult.data.map((item: any) =>
      item.num == items.num
        ? {
            ...item,
            attdatnum: attdatnum,
            files: files,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : { ...item }
    );
    setUnsavedAttadatnums((prev) => [...prev, attdatnum]);
    setMainDataResult((prev) => {
      return {
        data: datas,
        total: prev.total,
      };
    });
  }, [attdatnum, files]);

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  return (
    <>
      <TitleContainer>
        <Title>수입검사</Title>

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
              <th>발주일자</th>
              <td colSpan={3}>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                  />
                  ~
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
              <th>발주번호</th>
              <td>
                <Input
                  name="purnum"
                  type="text"
                  value={filters.purnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>발주구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="gubun"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>

            <tr>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>검사완료</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="finyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd"
                    value={filters.proccd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>업체코드</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
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
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>검사구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="qcdiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="발주정보">
          <GridContainerWrap>
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
              <GridContainer width="87.5vw">
                <GridTitleContainer>
                  <GridTitle>발주상세정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onSaveClick3}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                >
                  <Grid
                    style={{ height: "68vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        proccd: proccdListData.find(
                          (items: any) => items.sub_code === row.proccd
                        )?.code_name,
                        rowstatus:
                          row.rowstatus == null ||
                          row.rowstatus == "" ||
                          row.rowstatus == undefined
                            ? ""
                            : row.rowstatus,
                        chk: row.chk == "" ? false : row.chk,
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
                      mode: "multiple",
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
                    onItemChange={onMainItemChange3}
                    cellRender={customCellRender3}
                    rowRender={customRowRender3}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="50px" />
                    <GridColumn
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell}
                      cell={CheckBoxCell}
                    />
                    <GridColumn title="검사입력정보">
                      {createColumn()}
                    </GridColumn>
                    <GridColumn title="발주상세정보">
                      {createColumn2()}
                    </GridColumn>
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </FormContext.Provider>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="검사내역">
          <GridContainerWrap>
            <GridContainer style={{ width: "70vw" }}>
              <GridTitleContainer>
                <GridTitle>검사상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "65vh" }}
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    proccd: proccdListData.find(
                      (items: any) => items.sub_code === row.proccd
                    )?.code_name,
                    person: personListData.find(
                      (item: any) => item.user_id === row.person
                    )?.user_name,
                    rowstatus:
                      row.rowstatus == null ||
                      row.rowstatus == "" ||
                      row.rowstatus == undefined
                        ? ""
                        : row.rowstatus,
                    [SELECTED_FIELD]: detailSelectedState[idGetter(row)],
                  })),
                  detailDataState
                )}
                {...detailDataState}
                onDataStateChange={onDetailDataStateChange}
                onHeaderSelectionChange={onDetailHeaderSelectionChange}
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={ondetailSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detailDataResult.total}
                onScroll={onDetailScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onDetailSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onItemChange={onMainItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : dateField.includes(item.fieldName)
                              ? DateCell
                              : customField.includes(item.fieldName)
                              ? ColumnCommandCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? detailTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>불량상세정보</GridTitle>
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
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "65vh" }}
                data={process(
                  detailDataResult2.data.map((row) => ({
                    ...row,
                    rowstatus:
                      row.rowstatus == null ||
                      row.rowstatus == "" ||
                      row.rowstatus == undefined
                        ? ""
                        : row.rowstatus,
                    [SELECTED_FIELD]: detailSelectedState2[idGetter(row)],
                  })),
                  detailDataState2
                )}
                {...detailDataState2}
                onDataStateChange={onDetailDataStateChange2}
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={ondetailSelectionChange2}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detailDataResult2.total}
                onScroll={onDetailScrollHandler2}
                //정렬기능
                sortable={true}
                onSortChange={onDetailSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onItemChange={onMainItemChange2}
                cellRender={customCellRender2}
                rowRender={customRowRender2}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList2"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : customField2.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? detailTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell3
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"Q"}
          setData={setCustData}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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

export default QC_A2000;
