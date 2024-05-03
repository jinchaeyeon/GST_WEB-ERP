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
import {
  Checkbox,
  Input,
  InputChangeEvent,
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
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
  getCustDataQuery,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  isValidDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/PR_A0060W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "fxcode";
const SUB_DATA_ITEM_KEY = "fxseq";
let deletedMainRows: any[] = [];
let temp = 0;
const DateField = ["recdt", "makedt", "indt", "fxdt"];
const NumberField = ["uph", "cnt", "IOT_TER_ID", "fxcost"];
const CheckField = ["useyn"];
const commandField = ["files"];
const customField = ["custcd"];
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

export const FormContext = createContext<{
  custcd: string;
  custnm: string;
  setCustcd: (d: any) => void;
  setCustnm: (d: any) => void;
}>({} as any);

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
  const { setCustcd, setCustnm } = useContext(FormContext);
  let isInEdit = field == dataItem.inEdit;
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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setCustcd(data.custcd);
    setCustnm(data.custnm);
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
          onClick={onCustWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"ROW_ADD"}
          setData={setCustData}
          modal={true}
        />
      )}
    </>
  );
};

export const FormContext2 = createContext<{
  attdatnum: string;
  files: string;
  setAttdatnum: (d: any) => void;
  setFiles: (d: any) => void;
  subDataState: State;
  setSubDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

const ColumnCommandCell2 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const { setAttdatnum, setFiles } = useContext(FormContext2);
  let isInEdit = field == dataItem.inEdit;
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
      {value}
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
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
          modal={true}
        />
      )}
    </>
  );
};

const PR_A0060: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("PR_A0060W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_A0060W", setCustomOptionData);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        raduseyn: defaultOption.find((item: any) => item.id == "raduseyn")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        fxdiv: defaultOption.find((item: any) => item.id == "fxdiv")?.valueCode,
        proccd: defaultOption.find((item: any) => item.id == "proccd")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_sysUserMaster_004",
    //부서, 사용자
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_004"
        )
      );

      fetchQuery(dptcdQueryStr, setdptcdListData);
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [tabSelected, setTabSelected] = React.useState(0);
  const [workType, setWorkType] = useState<string>("U");

  useEffect(() => {
    const newData = subDataResult.data.map((item) =>
      item[SUB_DATA_ITEM_KEY] ==
      Object.getOwnPropertyNames(selectedsubDataState)[0]
        ? {
            ...item,
            custcd: custcd,
            custnm: custnm,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
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
  }, [custcd, custnm]);

  const fetchCustInfo = async (custcd: string) => {
    if (custcd == "") return;
    let data: any;
    let custInfo: null | { custcd: string; custnm: string } = null;

    const queryStr = getCustDataQuery(custcd);
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      if (rows.length > 0) {
        custInfo = {
          custcd: rows[0].custcd,
          custnm: rows[0].custnm,
        };
      }
    }

    return custInfo;
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
    if (value != null) {
      if (name == "useyn") {
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

  const [infomation, setInfomation] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    fxcode: "",
    fxdiv: "",
    location: "",
    recdt: new Date(),
    fxnum: "",
    fxnm: "",
    fxno: "",
    spec: "",
    dptcd: "",
    person: "",
    place: "",
    makedt: null,
    maker: "",
    indt: null,
    custcd: "",
    kind: "",
    amt: 0,
    uph: 0,
    classnm1: "",
    classnm2: "",
    classnm3: "",
    remark: "",
    useyn: "Y",
    attdatnum: "",
    proccd: "",
    IOT_TER_ID: 0,
    iotserialno: "",
    attdatnum_img: null,
    custnm: "",
    cnt: 0,
    files: "",
    availabletime: 0,
    viewyn: "",
    insert_form_id: "PR_A0060W",
    update_form_id: "",
    rowstatus_s: "N",
    fxseq_s: 0,
    fxdt_s: new Date(),
    custcd_s: "", //한글
    custnm_s: "",
    errtext_s: "",
    protext_s: "",
    fxcost_s: 0,
    remark1_s: "",
    attdatnum_s: "",
    stdtime_s: 0,
    errcode_s: "",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    fxcode: "",
    fxnum: "",
    fxnm: "",
    fxno: "",
    raduseyn: "Y",
    custcd: "",
    custnm: "",
    maker: "",
    kind: "",
    classnm1: "",
    classnm2: "",
    classnm3: "",
    custdiv: "",
    position: "",
    location: sessionLocation,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "HISTORY",
    orgdiv: sessionOrgdiv,
    fxcode: infomation.fxcode,
    fxnum: "",
    fxnm: "",
    fxno: "",
    useyn: "%",
    custcd: "",
    custnm: "",
    maker: "",
    kind: "",
    classnm1: "",
    classnm2: "",
    classnm3: "",
    position: "",
    location: sessionLocation,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A0060W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_fxcode": filters.fxcode,
        "@p_fxnum": filters.fxnum,
        "@p_fxnm": filters.fxnm,
        "@p_fxno": filters.fxno,
        "@p_useyn": filters.raduseyn,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_maker": filters.maker,
        "@p_kind": filters.kind,
        "@p_classnm1": filters.classnm1,
        "@p_classnm2": filters.classnm2,
        "@p_classnm3": filters.classnm3,
        "@p_position": filters.position,
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
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
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
      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        // find_row_value 행 선택, find_row_value 없는 경우 첫번째 행 선택
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setsubFilters((prev) => ({
            ...prev,
            workType: "HISTORY",
            fxcode: selectedRow.fxcode,
            pgNum: 1,
            isSearch: true,
          }));
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            orgdiv: selectedRow.orgdiv,
            fxcode: selectedRow.fxcode,
            fxdiv: selectedRow.fxdiv,
            location: selectedRow.location,
            recdt:
              selectedRow.recdt == ""
                ? new Date()
                : new Date(dateformat(selectedRow.recdt)),
            fxnum: selectedRow.fxnum,
            fxnm: selectedRow.fxnm,
            fxno: selectedRow.fxno,
            spec: selectedRow.spec,
            dptcd: selectedRow.dptcd,
            person: selectedRow.person,
            place: selectedRow.place,
            makedt: isValidDate(selectedRow.makedt)
              ? new Date(dateformat(selectedRow.makedt))
              : null,
            indt: isValidDate(selectedRow.indt)
              ? new Date(dateformat(selectedRow.indt))
              : null,
            custcd: selectedRow.custcd,
            kind: selectedRow.kind,
            amt: selectedRow.amt,
            uph: selectedRow.uph,
            classnm1: selectedRow.classnm1,
            classnm2: selectedRow.classnm2,
            classnm3: selectedRow.classnm3,
            remark: selectedRow.remark,
            useyn: selectedRow.useyn == "Y" ? "Y" : "N",
            attdatnum: selectedRow.attdatnum,
            proccd: selectedRow.proccd,
            IOT_TER_ID: selectedRow.IOT_TER_ID,
            iotserialno: selectedRow.iotserialno,
            attdatnum_img: selectedRow.attdatnum_img,
            custnm: selectedRow.custnm,
            cnt: selectedRow.cnt,
            files: selectedRow.files,
            availabletime: selectedRow.availabletime,
            viewyn: selectedRow.viewyn == "Y" ? "Y" : "N",
            insert_form_id: "PR_A0060W",
            update_form_id: "",
            rowstatus_s: selectedRow.rowstatus_s,
            fxseq_s: selectedRow.fxseq_s,
            fxdt_s:
              selectedRow.fxdt_s == ""
                ? new Date()
                : new Date(dateformat(selectedRow.fxdt_s)),
            custcd_s: selectedRow.custcd_s,
            custnm_s: selectedRow.custnm_s,
            errtext_s: selectedRow.errtext_s,
            protext_s: selectedRow.protext_s,
            fxcost_s: selectedRow.fxcost_s,
            remark1_s: selectedRow.remark1_s,
            attdatnum_s: selectedRow.attdatnum_s,
            stdtime_s: selectedRow.stdtime_s,
            errcode_s: selectedRow.errcode_s,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setsubFilters((prev) => ({
            ...prev,
            workType: "HISTORY",
            fxcode: rows[0].fxcode,
            pgNum: 1,
            isSearch: true,
          }));
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            orgdiv: rows[0].orgdiv,
            fxcode: rows[0].fxcode,
            fxdiv: rows[0].fxdiv,
            location: rows[0].location,
            recdt:
              rows[0].recdt == ""
                ? new Date()
                : new Date(dateformat(rows[0].recdt)),
            fxnum: rows[0].fxnum,
            fxnm: rows[0].fxnm,
            fxno: rows[0].fxno,
            spec: rows[0].spec,
            dptcd: rows[0].dptcd,
            person: rows[0].person,
            place: rows[0].place,
            makedt: isValidDate(rows[0].makedt)
              ? new Date(dateformat(rows[0].makedt))
              : null,
            indt: isValidDate(rows[0].indt)
              ? new Date(dateformat(rows[0].indt))
              : null,
            custcd: rows[0].custcd,
            kind: rows[0].kind,
            amt: rows[0].amt,
            uph: rows[0].uph,
            classnm1: rows[0].classnm1,
            classnm2: rows[0].classnm2,
            classnm3: rows[0].classnm3,
            remark: rows[0].remark,
            useyn: rows[0].useyn == "Y" ? "Y" : "N",
            attdatnum: rows[0].attdatnum,
            proccd: rows[0].proccd,
            IOT_TER_ID: rows[0].IOT_TER_ID,
            iotserialno: rows[0].iotserialno,
            attdatnum_img: rows[0].attdatnum_img,
            custnm: rows[0].custnm,
            cnt: rows[0].cnt,
            files: rows[0].files,
            availabletime: rows[0].availabletime,
            viewyn: rows[0].viewyn == "Y" ? "Y" : "N",
            insert_form_id: "PR_A0060W",
            update_form_id: "",
            rowstatus_s: rows[0].rowstatus_s,
            fxseq_s: rows[0].fxseq_s,
            fxdt_s:
              rows[0].fxdt_s == ""
                ? new Date()
                : new Date(dateformat(rows[0].fxdt_s)),
            custcd_s: rows[0].custcd_s,
            custnm_s: rows[0].custnm_s,
            errtext_s: rows[0].errtext_s,
            protext_s: rows[0].protext_s,
            fxcost_s: rows[0].fxcost_s,
            remark1_s: rows[0].remark1_s,
            attdatnum_s: rows[0].attdatnum_s,
            stdtime_s: rows[0].stdtime_s,
            errcode_s: rows[0].errcode_s,
          });
        }
      } else {
        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "N",
          itemcd: "자동생성",
          itemnm: "",
          insiz: "",
          itemacnt: "제품",
          useyn: "Y",
          custcd: "",
          custnm: "",
          itemcd_s: "",
          spec: "",
          location: sessionLocation,
          remark: "",
          bnatur: "",
          itemlvl1: "",
          itemlvl2: "",
          itemlvl3: "",
          itemlvl4: "",
          bomyn: "",
          attdatnum: "",
          row_values: null,
          safeqty: 0,
          unitwgt: 0,
          invunit: "",
          dwgno: "",
          maker: "",
          qcyn: "N",
          attdatnum_img: null,
          attdatnum_img2: null,
          snp: 0,
          person: "",
          extra_field2: "",
          purleadtime: 0,
          len: 0,
          purqty: 0,
          boxqty: 0,
          pac: "",
          bnatur_insiz: 0,
          itemno: "",
          itemgroup: "",
          lenunit: "",
          hscode: "",
          wgtunit: "",
          custitemnm: "",
          unitqty: 0,
          procday: "",
          files: "",
          auto: "Y",
        });
        setSubDataResult({
          data: [],
          total: 0,
        });
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

  const fetchSubGrid = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_PR_A0060W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": subfilters.orgdiv,
        "@p_location": subfilters.location,
        "@p_fxcode": subfilters.fxcode,
        "@p_fxnum": subfilters.fxnum,
        "@p_fxnm": subfilters.fxnm,
        "@p_fxno": subfilters.fxno,
        "@p_useyn": subfilters.useyn,
        "@p_custcd": subfilters.custcd,
        "@p_custnm": subfilters.custnm,
        "@p_maker": subfilters.maker,
        "@p_kind": subfilters.kind,
        "@p_classnm1": subfilters.classnm1,
        "@p_classnm2": subfilters.classnm2,
        "@p_classnm3": subfilters.classnm3,
        "@p_position": subfilters.position,
        "@p_find_row_value": subfilters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.fxcode + "|" + row.fxseq == subfilters.find_row_value
          );
          targetRowIndex2 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef2.current) {
          targetRowIndex2 = 0;
        }
      }
      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.fxcode + "|" + row.fxseq == subfilters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });
        } else {
          setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setsubFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
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
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (subfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);

      setsubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [subDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    deletedMainRows = [];
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "U",
      orgdiv: selectedRowData.orgdiv,
      fxcode: selectedRowData.fxcode,
      fxdiv: selectedRowData.fxdiv,
      location: selectedRowData.location,
      recdt:
        selectedRowData.recdt == ""
          ? new Date()
          : new Date(dateformat(selectedRowData.recdt)),
      fxnum: selectedRowData.fxnum,
      fxnm: selectedRowData.fxnm,
      fxno: selectedRowData.fxno,
      spec: selectedRowData.spec,
      dptcd: selectedRowData.dptcd,
      person: selectedRowData.person,
      place: selectedRowData.place,
      makedt: isValidDate(selectedRowData.makedt)
        ? new Date(dateformat(selectedRowData.makedt))
        : null,
      maker: selectedRowData.maker,
      indt: isValidDate(selectedRowData.indt)
        ? new Date(dateformat(selectedRowData.indt))
        : null,
      custcd: selectedRowData.custcd,
      kind: selectedRowData.kind,
      amt: selectedRowData.amt,
      uph: selectedRowData.uph,
      classnm1: selectedRowData.classnm1,
      classnm2: selectedRowData.classnm2,
      classnm3: selectedRowData.classnm3,
      remark: selectedRowData.remark,
      useyn: selectedRowData.useyn == "Y" ? "Y" : "N",
      attdatnum: selectedRowData.attdatnum,
      proccd: selectedRowData.proccd,
      IOT_TER_ID: selectedRowData.IOT_TER_ID,
      iotserialno: selectedRowData.iotserialno,
      attdatnum_img: selectedRowData.attdatnum_img,
      custnm: selectedRowData.custnm,
      cnt: selectedRowData.cnt,
      files: selectedRowData.files,
      availabletime: selectedRowData.availabletime,
      viewyn: selectedRowData.viewyn == "Y" ? "Y" : "N",
      insert_form_id: "PR_A0060W",
      update_form_id: "",
      rowstatus_s: selectedRowData.rowstatus_s,
      fxseq_s: selectedRowData.fxseq_s,
      fxdt_s:
        selectedRowData.fxdt_s == ""
          ? new Date()
          : new Date(dateformat(selectedRowData.fxdt_s)),
      custcd_s: selectedRowData.custcd_s,
      custnm_s: selectedRowData.custnm_s,
      errtext_s: selectedRowData.errtext_s,
      protext_s: selectedRowData.protext_s,
      fxcost_s: selectedRowData.fxcost_s,
      remark1_s: selectedRowData.remark1_s,
      attdatnum_s: selectedRowData.attdatnum_s,
      stdtime_s: selectedRowData.stdtime_s,
      errcode_s: selectedRowData.errcode_s,
    });

    setsubFilters((prev) => ({
      ...prev,
      workType: "HISTORY",
      fxcode: selectedRowData.fxcode,
      isSearch: true,
      pgNum: 1,
      find_row_value: "",
    }));
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });

    setSelectedsubDataState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      } else if (tabSelected == 1) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "설비이력관리";
        _export.save(optionsGridOne);
      }
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult.data.forEach((item) =>
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

  const onAddClick2 = () => {
    setWorkType("N");
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "N",
      orgdiv: sessionOrgdiv,
      fxcode: "",
      fxdiv: "",
      location: "",
      recdt: new Date(),
      fxnum: "",
      fxnm: "",
      fxno: "",
      spec: "",
      dptcd: "",
      person: "",
      place: "",
      makedt: null,
      maker: "",
      indt: null,
      custcd: "",
      kind: "",
      amt: 0,
      uph: 0,
      classnm1: "",
      classnm2: "",
      classnm3: "",
      remark: "",
      useyn: "Y",
      attdatnum: "",
      proccd: "",
      IOT_TER_ID: 0,
      iotserialno: "",
      attdatnum_img: null,
      custnm: "",
      cnt: 0,
      files: "",
      availabletime: 0,
      viewyn: "",
      insert_form_id: "PR_A0060W",
      update_form_id: "",
      rowstatus_s: "U",
      fxseq_s: 0,
      fxdt_s: new Date(),
      custcd_s: "", //한글
      custnm_s: "",
      errtext_s: "",
      protext_s: "",
      fxcost_s: 0,
      remark1_s: "",
      attdatnum_s: "",
      stdtime_s: 0,
      errcode_s: "",
    });
  };

  const onAddClick = () => {
    subDataResult.data.map((item) => {
      if (item.fxseq > temp) {
        temp = item.fxseq;
      }
    });
    const newDataItem = {
      [SUB_DATA_ITEM_KEY]: ++temp,
      rowstatus: "N",
      fxdt: convertDateToStr(new Date()),
      custcd: "",
      custnm: "",
      errtext: "",
      protext: "",
      fxcost: "",
      remark1: "",
      attdatnum: "",
      stdtime: "",
      errcode: "",
    };
    setSelectedsubDataState({ [newDataItem[SUB_DATA_ITEM_KEY]]: true });

    setSubDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage2((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };

  const handleSelectTab = (e: any) => {
    if (unsavedName.length > 0) {
      alert("저장 후 다시 시도해주세요.");
    } else {
      setTabSelected(e.selected);
    }
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    if (!infomation.attdatnum) {
      setUnsavedAttadatnums((prev) => [...prev, data.attdatnum]);
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

  type TdataArr = {
    rowstatus: string[];
    fxseq_s: number[];
    fxdt_s: string[];
    custcd_s: string[];
    custnm_s: string[];
    errtext_s: string[];
    protext_s: string[];
    fxcost_s: string[];
    remark1_s: string[];
    attdatnum_s: string[];
    stdtime_s: number[];
    errcode_s: string[];
  };

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const setCustData2 = (data: ICustData) => {
    setInfomation((prev) => ({
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

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    resetAllGrid(); // 데이터 초기화
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      SUB_DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    let valid = true;
    if (dataItem.rowstatus != "N" && field == "recdt") {
      valid = false;
    }

    if (field != "rowstatus" && valid == true) {
      const newData = subDataResult.data.map((item) =>
        item[SUB_DATA_ITEM_KEY] == dataItem[SUB_DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setEditIndex(dataItem[SUB_DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: subDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != subDataResult.data) {
      if (editedField !== "custcd") {
        const newData = subDataResult.data.map(
          (item: { [x: string]: string; rowstatus: string }) =>
            item[SUB_DATA_ITEM_KEY] ==
            Object.getOwnPropertyNames(selectedsubDataState)[0]
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
        setTempResult((prev: { total: any }) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setSubDataResult((prev: { total: any }) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        subDataResult.data.map(async (item) => {
          if (editIndex == item[SUB_DATA_ITEM_KEY]) {
            const custcd = await fetchCustInfo(item.custcd);
            if (custcd != null && custcd != undefined) {
              const newData = subDataResult.data.map((item) =>
                item[SUB_DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedsubDataState)[0]
                  ? {
                      ...item,
                      custcd: custcd.custcd,
                      custnm: custcd.custnm,
                      rowstatus: item.rowstatus == "N" ? "N" : "U",
                      [EDIT_FIELD]: undefined,
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
          }
        });
      }
    } else {
      const newData = subDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev: { total: any }) => {
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

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    fxcode: "",
    attdatnum: "",
  });

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    subDataResult.data.forEach((item: any, index: number) => {
      if (!selectedsubDataState[item[SUB_DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = subDataResult.data[Math.min(...Object2)];
    } else {
      data = subDataResult.data[Math.min(...Object) - 1];
    }
    setSubDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSelectedsubDataState({
      [data != undefined ? data[SUB_DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.data.length != 0) {
      const items = Object.getOwnPropertyNames(selectedState)[0];
      mainDataResult.data.forEach((item: any, index: number) => {
        if (items == item.fxcode && (item.useyn == "N" || item.useyn == "")) {
          setParaDataDeleted((prev) => ({
            ...prev,
            work_type: "D",
            fxcode: items,
            attdatnum: "",
          }));
        } else if (items == item.fxcode && item.useyn == "Y") {
          alert(findMessage(messagesData, "PR_A0060W_005"));
        }
      });
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const [paraData, setParaData] = useState({
    workType: "HISTORY",
    orgdiv: sessionOrgdiv,
    fxcode: infomation.fxcode,
    fxdiv: infomation.fxdiv,
    location: infomation.location,
    recdt: infomation.recdt,
    fxnum: infomation.fxnum,
    fxnm: infomation.fxnm,
    fxno: infomation.fxno,
    spec: infomation.spec,
    dptcd: infomation.dptcd,
    person: infomation.person,
    place: infomation.place,
    makedt: infomation.makedt == null ? "" : infomation.makedt,
    maker: infomation.maker == null ? "" : infomation.maker,
    indt: infomation.indt == null ? "" : infomation.indt,
    custcd: infomation.custcd,
    kind: infomation.kind,
    amt: infomation.amt,
    uph: infomation.uph,
    classnm1: infomation.classnm1,
    classnm2: infomation.classnm2,
    classnm3: infomation.classnm3,
    remark: infomation.remark,
    useyn: infomation.useyn,
    attdatnum: infomation.attdatnum,
    proccd: infomation.proccd,
    IOT_TER_ID: infomation.IOT_TER_ID,
    iotserialno: infomation.iotserialno,
    attdatnum_img:
      infomation.attdatnum_img == null ? "" : infomation.attdatnum_img,
    custnm: infomation.custnm,
    cnt: infomation.cnt,
    files: infomation.files,
    availabletime: infomation.availabletime,
    viewyn: infomation.viewyn,
    insert_form_id: "PR_A0060W",
    update_form_id: infomation.update_form_id,
    rowstatus_s: "",
    fxseq_s: "",
    fxdt_s: "",
    custcd_s: "",
    custnm_s: "",
    errtext_s: "",
    protext_s: "",
    fxcost_s: "0",
    remark1_s: "",
    attdatnum_s: "",
    stdtime_s: "",
    errcode_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_PR_A0060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": paraData.location,
      "@p_fxcode": paraData.fxcode,
      "@p_recdt": convertDateToStr(paraData.recdt),
      "@p_fxnum": paraData.fxnum,
      "@p_fxnm": paraData.fxnm,
      "@p_fxno": paraData.fxno,
      "@p_spec": paraData.spec,
      "@p_dptcd":
        dptcdListData.find((item: any) => item.dptnm == paraData.dptcd)
          ?.dptcd == undefined
          ? ""
          : dptcdListData.find((item: any) => item.dptnm == paraData.dptcd)
              ?.dptcd,
      "@p_person":
        personListData.find((item: any) => item.user_name == paraData.person)
          ?.user_id == undefined
          ? ""
          : personListData.find(
              (item: any) => item.user_name == paraData.person
            )?.user_id,
      "@p_place": paraData.place,
      "@p_makedt": isValidDate(paraData.makedt)
        ? convertDateToStr(paraData.makedt)
        : paraData.makedt,
      "@p_maker": paraData.maker == null ? "" : paraData.maker,
      "@p_indt": isValidDate(paraData.indt)
        ? convertDateToStr(paraData.indt)
        : paraData.indt,
      "@p_custcd": paraData.custcd,
      "@p_amt": paraData.amt,
      "@p_remark": paraData.remark,
      "@p_attdatnum_img": null,
      "@p_viewyn": paraData.viewyn,
      "@p_useyn": paraData.useyn,
      "@p_attdatnum": paraData.attdatnum,
      "@p_kind": paraData.kind,
      "@p_uph": paraData.uph,
      "@p_IOT_TER_ID": paraData.IOT_TER_ID,
      "@p_iotserialno": paraData.iotserialno,
      "@p_classnm1": paraData.classnm1,
      "@p_classnm2": paraData.classnm2,
      "@p_classnm3": paraData.classnm3,
      "@p_fxdiv": paraData.fxdiv,
      "@p_proccd": paraData.proccd,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_pgmdiv": "F",
      "@p_position": "",
      "@p_form_id": "PR_A0060W",
      "@p_availabletime": 2,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_fxseq_s": paraData.fxseq_s,
      "@p_fxdt_s": paraData.fxdt_s,
      "@p_custcd_s": paraData.custcd_s,
      "@p_custnm_s": paraData.custnm_s,
      "@p_errtext_s": paraData.errtext_s,
      "@p_protext_s": paraData.protext_s,
      "@p_fxcost_s": paraData.fxcost_s,
      "@p_remark1_s": paraData.remark1_s,
      "@p_attdatnum_s": paraData.attdatnum_s,
      "@p_stdtime_s": paraData.stdtime_s,
      "@p_company_code": companyCode,
    },
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_PR_A0060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": infomation.location,
      "@p_fxcode": paraDataDeleted.fxcode,
      "@p_recdt": isValidDate(infomation.recdt)
        ? convertDateToStr(infomation.recdt)
        : infomation.recdt,
      "@p_fxnum": infomation.fxnum,
      "@p_fxnm": infomation.fxnm,
      "@p_fxno": infomation.fxno,
      "@p_spec": infomation.spec,
      "@p_dptcd":
        dptcdListData.find((item: any) => item.dptnm == infomation.dptcd)
          ?.dptcd == undefined
          ? ""
          : dptcdListData.find((item: any) => item.dptnm == infomation.dptcd)
              ?.dptcd,
      "@p_person":
        personListData.find((item: any) => item.user_name == infomation.person)
          ?.user_id == undefined
          ? ""
          : personListData.find(
              (item: any) => item.user_name == infomation.person
            )?.user_id,
      "@p_place": infomation.place,
      "@p_makedt":
        infomation.makedt == null ? "" : convertDateToStr(infomation.makedt),
      "@p_maker": infomation.maker == null ? "" : infomation.maker,
      "@p_indt":
        infomation.indt == null ? "" : convertDateToStr(infomation.indt),
      "@p_custcd": infomation.custcd,
      "@p_amt": infomation.amt,
      "@p_remark": infomation.remark,
      "@p_attdatnum_img": null,
      "@p_viewyn": infomation.viewyn,
      "@p_useyn": infomation.useyn,
      "@p_attdatnum": infomation.attdatnum,
      "@p_kind": infomation.kind,
      "@p_uph": infomation.uph,
      "@p_IOT_TER_ID": infomation.IOT_TER_ID,
      "@p_iotserialno": infomation.iotserialno,
      "@p_classnm1": infomation.classnm1,
      "@p_classnm2": infomation.classnm2,
      "@p_classnm3": infomation.classnm3,
      "@p_fxdiv": infomation.fxdiv,
      "@p_proccd": infomation.proccd,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_pgmdiv": "F",
      "@p_position": "",
      "@p_form_id": "PR_A0060W",
      "@p_availabletime": 2,
      "@p_rowstatus_s": "",
      "@p_fxseq_s": "",
      "@p_fxdt_s": "",
      "@p_custcd_s": "",
      "@p_custnm_s": "",
      "@p_errtext_s": "",
      "@p_protext_s": "",
      "@p_fxcost_s": "",
      "@p_remark1_s": "",
      "@p_attdatnum_s": "",
      "@p_stdtime_s": "",
      "@p_company_code": companyCode,
    },
  };

  const infopara: Iparameters = {
    procedureName: "P_PR_A0060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": infomation.location,
      "@p_fxcode": infomation.fxcode,
      "@p_recdt": isValidDate(infomation.recdt)
        ? convertDateToStr(infomation.recdt)
        : infomation.recdt,
      "@p_fxnum": infomation.fxnum,
      "@p_fxnm": infomation.fxnm,
      "@p_fxno": infomation.fxno,
      "@p_spec": infomation.spec,
      "@p_dptcd":
        dptcdListData.find((item: any) => item.dptnm == infomation.dptcd)
          ?.dptcd == undefined
          ? ""
          : dptcdListData.find((item: any) => item.dptnm == infomation.dptcd)
              ?.dptcd,
      "@p_person":
        personListData.find((item: any) => item.user_name == infomation.person)
          ?.user_id == undefined
          ? ""
          : personListData.find(
              (item: any) => item.user_name == infomation.person
            )?.user_id,
      "@p_place": infomation.place,
      "@p_makedt":
        infomation.makedt == null ? "" : convertDateToStr(infomation.makedt),
      "@p_maker": infomation.maker == null ? "" : infomation.maker,
      "@p_indt":
        infomation.indt == null ? "" : convertDateToStr(infomation.indt),
      "@p_custcd": infomation.custcd,
      "@p_amt": infomation.amt,
      "@p_remark": infomation.remark,
      "@p_attdatnum_img": null,
      "@p_viewyn": infomation.viewyn,
      "@p_useyn": infomation.useyn,
      "@p_attdatnum": infomation.attdatnum,
      "@p_kind": infomation.kind,
      "@p_uph": infomation.uph,
      "@p_IOT_TER_ID": infomation.IOT_TER_ID,
      "@p_iotserialno": infomation.iotserialno,
      "@p_classnm1": infomation.classnm1,
      "@p_classnm2": infomation.classnm2,
      "@p_classnm3": infomation.classnm3,
      "@p_fxdiv": infomation.fxdiv,
      "@p_proccd": infomation.proccd,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_pgmdiv": "F",
      "@p_position": "",
      "@p_form_id": "PR_A0060W",
      "@p_availabletime": 2,
      "@p_rowstatus_s": "",
      "@p_fxseq_s": "",
      "@p_fxdt_s": "",
      "@p_custcd_s": "",
      "@p_custnm_s": "",
      "@p_errtext_s": "",
      "@p_protext_s": "",
      "@p_fxcost_s": "",
      "@p_remark1_s": "",
      "@p_attdatnum_s": "",
      "@p_stdtime_s": "",
      "@p_company_code": companyCode,
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  const onSaveClick = async () => {
    let valid = true;

    subDataResult.data.map((item: any) => {
      subDataResult.data.map((items: any) => {
        if (item.fxdt == items.fxdt && item.num != items.num) {
          valid = false;
        }
      });
    });

    try {
      if (valid != true) {
        throw findMessage(messagesData, "PR_A0060W_004");
      } else {
        const dataItem = subDataResult.data.filter((item: any) => {
          return (
            (item.rowstatus == "N" || item.rowstatus == "U") &&
            item.rowstatus !== undefined
          );
        });

        if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
        let dataArr: TdataArr = {
          rowstatus: [],
          fxseq_s: [],
          fxdt_s: [],
          custcd_s: [],
          custnm_s: [],
          errtext_s: [],
          protext_s: [],
          fxcost_s: [],
          remark1_s: [],
          attdatnum_s: [],
          stdtime_s: [],
          errcode_s: [],
        };
        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            fxdt = "",
            fxseq = "",
            custcd = "",
            custnm = "",
            errtext = "",
            protext = "",
            fxcost = "",
            remark1 = "",
            attdatnum = "",
          } = item;

          dataArr.rowstatus.push(rowstatus);
          dataArr.fxseq_s.push(fxseq);
          dataArr.fxdt_s.push(fxdt);
          dataArr.custcd_s.push(custcd);
          dataArr.custnm_s.push(custnm);
          dataArr.errtext_s.push(errtext);
          dataArr.protext_s.push(protext);
          dataArr.fxcost_s.push(fxcost == "" ? 0 : fxcost);
          dataArr.remark1_s.push(remark1);
          dataArr.attdatnum_s.push(attdatnum);
          dataArr.stdtime_s.push(0);
          dataArr.errcode_s.push("");
        });
        deletedMainRows.forEach(async (item: any, idx: number) => {
          const {
            rowstatus = "",
            fxdt = "",
            fxseq = "",
            custcd = "",
            custnm = "",
            errtext = "",
            protext = "",
            fxcost = "",
            remark1 = "",
            attdatnum = "",
          } = item;

          dataArr.rowstatus.push("D");
          dataArr.fxseq_s.push(fxseq);
          dataArr.fxdt_s.push(fxdt);
          dataArr.custcd_s.push(custcd);
          dataArr.custnm_s.push(custnm);
          dataArr.errtext_s.push(errtext);
          dataArr.protext_s.push(protext);
          dataArr.fxcost_s.push(fxcost == "" ? 0 : fxcost);
          dataArr.remark1_s.push(remark1);
          dataArr.attdatnum_s.push(attdatnum);
          dataArr.stdtime_s.push(0);
          dataArr.errcode_s.push("");
        });

        setParaData((prev) => ({
          ...prev,
          workType: "U",
          fxcode: infomation.fxcode,
          fxdiv: infomation.fxdiv,
          location: infomation.location,
          recdt: infomation.recdt,
          fxnum: infomation.fxnum,
          fxnm: infomation.fxnm,
          fxno: infomation.fxno,
          spec: infomation.spec,
          dptcd: infomation.dptcd,
          person: infomation.person,
          place: infomation.place,
          makedt: infomation.makedt == null ? "" : infomation.makedt,
          maker: infomation.maker == null ? "" : infomation.maker,
          indt: infomation.indt == null ? "" : infomation.indt,
          custcd: infomation.custcd,
          kind: infomation.kind,
          amt: infomation.amt,
          uph: infomation.uph,
          classnm1: infomation.classnm1,
          classnm2: infomation.classnm2,
          classnm3: infomation.classnm3,
          remark: infomation.remark,
          useyn: infomation.useyn,
          attdatnum: infomation.attdatnum,
          proccd: infomation.proccd,
          IOT_TER_ID: infomation.IOT_TER_ID,
          iotserialno: infomation.iotserialno,
          attdatnum_img:
            infomation.attdatnum_img == null ? "" : infomation.attdatnum_img,
          custnm: infomation.custnm,
          cnt: infomation.cnt,
          files: infomation.files,
          availabletime: infomation.availabletime,
          viewyn: infomation.viewyn,
          insert_form_id: "PR_A0060W",
          update_form_id: infomation.update_form_id,
          rowstatus_s: dataArr.rowstatus.join("|"),
          fxseq_s: dataArr.fxseq_s.join("|"),
          fxdt_s: dataArr.fxdt_s.join("|"),
          custcd_s: dataArr.custcd_s.join("|"),
          custnm_s: dataArr.custnm_s.join("|"),
          errtext_s: dataArr.errtext_s.join("|"),
          protext_s: dataArr.protext_s.join("|"),
          fxcost_s: dataArr.fxcost_s.join("|"),
          remark1_s: dataArr.remark1_s.join("|"),
          attdatnum_s: dataArr.attdatnum_s.join("|"),
          stdtime_s: dataArr.stdtime_s.join("|"),
          errcode_s: dataArr.errcode_s.join("|"),
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      // 마지막 페이지의 1개 남은 데이터 삭제 시, 앞 페이지 조회하고, 그 외는 페이지 유지
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 1;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );
      let array: any[] = [];
      array.push(infomation.attdatnum);
      subDataResult.data.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      resetAllGrid();

      if (isLastDataDeleted) {
        setPage({
          skip: PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
      }

      setFilters((prev) => ({
        ...prev,
        find_row_value:
          mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
          undefined
            ? ""
            : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1][
                DATA_ITEM_KEY
              ],
        pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
        isSearch: true,
      }));
      setUnsavedName([]);
      setUnsavedAttadatnums([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.fxcode = "";
  };

  const onSaveClick2 = async () => {
    fetchSaved();
  };

  const fetchSaved = async () => {
    let data: any;

    let valid = true;
    try {
      if (!infomation.fxnum) {
        throw findMessage(messagesData, "PR_A0060W_001");
      }

      if (!infomation.fxnm) {
        throw findMessage(messagesData, "PR_A0060W_002");
      }

      if (convertDateToStr(infomation.recdt).length != 8) {
        throw findMessage(messagesData, "PR_A0060W_003");
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

    if (data.isSuccess == true) {
      const { returnString } = data;
      setFilters((prev) => ({
        ...prev,
        find_row_value: returnString,
        pgNum: 1,
        isSearch: true,
      }));

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
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
      let array: any[] = [];

      deletedMainRows.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);

      setsubFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage({
      ...event.page,
    });

    setPage2(initialPageState);
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setsubFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");

  useEffect(() => {
    const datas = subDataResult.data.filter(
      (item) =>
        item[SUB_DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(selectedsubDataState)[0]
    )[0];
    if (datas != undefined) {
      if (datas.attdatnum == "") {
        setUnsavedAttadatnums((prev) => [...prev, attdatnum]);
      }
    }

    const newData = subDataResult.data.map((item) =>
      item[SUB_DATA_ITEM_KEY] ==
      parseInt(Object.getOwnPropertyNames(selectedsubDataState)[0])
        ? {
            ...item,
            attdatnum: attdatnum,
            files: files,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );

    setSubDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum, files]);

  return (
    <>
      <TitleContainer>
        <Title>설비관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="PR_A0060W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>설비번호</th>
              <td>
                <Input
                  name="fxnum"
                  type="text"
                  value={filters.fxnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비명</th>
              <td>
                <Input
                  name="fxnm"
                  type="text"
                  value={filters.fxnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비호기</th>
              <td>
                <Input
                  name="fxno"
                  type="text"
                  value={filters.fxno}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비종류</th>
              <td>
                <Input
                  name="kind"
                  type="text"
                  value={filters.kind}
                  onChange={filterInputChange}
                />
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
              <th>제조사</th>
              <td>
                <Input
                  name="maker"
                  type="text"
                  value={filters.maker}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="raduseyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
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
              <th>이더넷</th>
              <td>
                <Input
                  name="classnm1"
                  type="text"
                  value={filters.classnm1}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류2</th>
              <td>
                <Input
                  name="classnm2"
                  type="text"
                  value={filters.classnm2}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류3</th>
              <td>
                <Input
                  name="classnm3"
                  type="text"
                  value={filters.classnm3}
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
              onClick={onAddClick2}
              themeColor={"primary"}
              icon="file-add"
            >
              생성
            </Button>
            <Button
              onClick={onDeleteClick2}
              fillMode="outline"
              themeColor={"primary"}
              icon="delete"
            >
              삭제
            </Button>
            <Button
              onClick={onSaveClick2}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
              disabled={tabSelected == 1 ? true : false}
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
          fileName="설비관리"
        >
          <Grid
            style={{ height: "27vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd == row.dptcd
                )?.dptnm,
                person: personListData.find(
                  (item: any) => item.user_id == row.person
                )?.user_name,
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
              customOptionData.menuCustomColumnOptions["grdList"]?.map(
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
                          : CheckField.includes(item.fieldName)
                          ? CheckBoxCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0
                          ? mainTotalFooterCell
                          : NumberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell
                          : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="설비정보">
          <FormBoxWrap style={{ height: isMobile ? "100%" : "33vh" }}>
            <FormBox>
              <tbody>
                <tr>
                  <th>설비코드</th>
                  <td>
                    <Input
                      name="fxcode"
                      type="text"
                      value={infomation.fxcode}
                      className="readonly"
                    />
                  </td>
                  <th>설비번호</th>
                  <td>
                    <Input
                      name="fxnum"
                      type="text"
                      value={infomation.fxnum}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>설비명</th>
                  <td colSpan={3}>
                    <Input
                      name="fxnm"
                      type="text"
                      value={infomation.fxnm}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>설비호기</th>
                  <td>
                    <Input
                      name="fxno"
                      type="text"
                      value={infomation.fxno}
                      onChange={InputChange}
                    />
                  </td>
                  <th>사용여부</th>
                  <td>
                    <Checkbox
                      name="useyn"
                      value={infomation.useyn == "Y" ? true : false}
                      onChange={InputChange}
                      style={{ float: "left" }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>설비구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="fxdiv"
                        value={infomation.fxdiv}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>소속공정</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="proccd"
                        value={infomation.proccd}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>사양</th>
                  <td colSpan={3}>
                    <Input
                      name="spec"
                      value={infomation.spec}
                      onChange={InputChange}
                    />
                  </td>
                  <th>구입일자</th>
                  <td>
                    <DatePicker
                      name="indt"
                      value={infomation.indt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                    />
                  </td>
                  <th>구입금액</th>
                  <td>
                    <Input
                      name="amt"
                      type="number"
                      value={infomation.amt}
                      onChange={InputChange}
                      style={{ textAlign: "right" }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>입력일자</th>
                  <td>
                    <DatePicker
                      name="recdt"
                      value={infomation.recdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <th>IOT설비번호</th>
                  <td>
                    <Input
                      name="IOT_TER_ID"
                      type="number"
                      value={infomation.IOT_TER_ID}
                      onChange={InputChange}
                      style={{ textAlign: "right" }}
                    />
                  </td>
                  <th>설비종류</th>
                  <td>
                    <Input
                      name="kind"
                      type="text"
                      value={infomation.kind}
                      onChange={InputChange}
                    />
                  </td>
                  <th>장소</th>
                  <td>
                    <Input
                      name="place"
                      type="text"
                      value={infomation.place}
                      onChange={InputChange}
                    />
                  </td>
                  <th>제조일자</th>
                  <td>
                    <DatePicker
                      name="makedt"
                      value={infomation.makedt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                    />
                  </td>
                  <th>제조사</th>
                  <td>
                    <Input
                      name="maker"
                      type="text"
                      value={infomation.maker}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>담당부서</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dptcd"
                        value={infomation.dptcd}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        textField="dptnm"
                        valueField="dptcd"
                      />
                    )}
                  </td>
                  <th>책임자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={infomation.person}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={infomation.custcd}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick2}
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
                      value={infomation.custnm}
                      className="readonly"
                    />
                  </td>
                  <th>가용시간</th>
                  <td>
                    <Input
                      name="availabletime"
                      type="number"
                      value={infomation.availabletime}
                      onChange={InputChange}
                      style={{ textAlign: "right" }}
                    />
                  </td>
                  <th>시간당생산수량</th>
                  <td>
                    <Input
                      name="uph"
                      type="number"
                      value={infomation.uph}
                      onChange={InputChange}
                      style={{ textAlign: "right" }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>첨부파일</th>
                  <td colSpan={3}>
                    <Input
                      name="files"
                      type="text"
                      value={infomation.files}
                      className="readonly"
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
                  <th>분류1</th>
                  <td>
                    <Input
                      name="classnm1"
                      type="text"
                      value={infomation.classnm1}
                      onChange={InputChange}
                    />
                  </td>
                  <th>분류2</th>
                  <td>
                    <Input
                      name="classnm2"
                      type="text"
                      value={infomation.classnm2}
                      onChange={InputChange}
                    />
                  </td>
                  <th>분류3</th>
                  <td>
                    <Input
                      name="classnm3"
                      type="text"
                      value={infomation.classnm3}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>비고</th>
                  <td colSpan={11}>
                    <TextArea
                      value={infomation.remark}
                      name="remark"
                      rows={4}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </TabStripTab>
        <TabStripTab title="설비이력관리">
          <FormContext.Provider
            value={{
              custcd,
              custnm,
              setCustcd,
              setCustnm,
            }}
          >
            <FormContext2.Provider
              value={{
                attdatnum,
                files,
                setAttdatnum,
                setFiles,
                subDataState,
                setSubDataState,
                // fetchGrid,
              }}
            >
              <GridContainer style={{ height: isMobile ? "45vh" : "36vh" }}>
                <GridTitleContainer>
                  <GridTitle>설비이력관리</GridTitle>
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
                <ExcelExport
                  data={subDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="설비관리"
                >
                  <Grid
                    style={{ height: "33vh" }}
                    data={process(
                      subDataResult.data.map((row) => ({
                        ...row,
                        fxdt: row.fxdt
                          ? new Date(dateformat(row.fxdt))
                          : new Date(dateformat("99991231")),
                        rowstatus:
                          row.rowstatus == null ||
                          row.rowstatus == "" ||
                          row.rowstatus == undefined
                            ? ""
                            : row.rowstatus,
                        [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                      })),
                      subDataState
                    )}
                    {...subDataState}
                    onDataStateChange={onSubDataStateChange}
                    //선택 기능
                    dataItemKey={SUB_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSubDataSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={subDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
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
                      customOptionData.menuCustomColumnOptions["grdList2"]?.map(
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
                                  : commandField.includes(item.fieldName)
                                  ? ColumnCommandCell2
                                  : customField.includes(item.fieldName)
                                  ? ColumnCommandCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? subTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </FormContext2.Provider>
          </FormContext.Provider>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
          modal={true}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
          modal={true}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={infomation.attdatnum}
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

export default PR_A0060;
