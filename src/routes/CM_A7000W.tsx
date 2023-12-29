import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
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
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input,
  InputChangeEvent,
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
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
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
import DateCell from "../components/Cells/DateCell";
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
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  numberWithCommas3,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import RichEditor from "../components/RichEditor";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersPersonWindow from "../components/Windows/CommonWindows/CustomersPersonWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import SignWindow from "../components/Windows/CommonWindows/SignWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A7000W_C";
import {
  Iparameters,
  TColumn,
  TEditorHandle,
  TGrid,
  TPermissions,
} from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
const DateField = ["recdt"];
const attdatnumField = ["files"];
let reference = "";

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
          para={dataItem.attdatnum}
          permission={{ upload: false, download: true, delete: false }}
          modal={true}
        />
      )}
    </>
  );
};

const CM_A7000W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);

  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const [workType, setWorkType] = useState("");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const refEditorRef = useRef<TEditorHandle>(null);

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [tabSelected, setTabSelected] = React.useState(0);

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custpersonWindowVisible, setCustPersonWindowVisible] =
    useState<boolean>(false);
  const [signWindowVisible, setSignWindowVisible] = useState<boolean>(false);

  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);

  const [attachmentsWindowVisiblePb, setAttachmentsWindowVisiblePb] =
    useState<boolean>(false);

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const getAttachmentsDataPb = (data: IAttachmentData) => {
    setInformation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onCustPersonWndClick = () => {
    setCustPersonWindowVisible(true);
  };

  const onAttachPbWndClick = () => {
    setAttachmentsWindowVisiblePb(true);
  };

  const onProjectWndClick = () => {
    setProjectWindowVisible(true);
  };

  const onSignWndClick = () => {
    setSignWindowVisible(true);
  };

  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent(
    "L_SA019_603, L_Requestgb, L_SA001_603, L_SA012_603, L_SA013_603, L_SA014_603, L_SA015_603, L_SA016_603, L_SA017_603, L_SA018_603, L_sysUserMaster_001, L_CM700",
    setBizComponentData
  );

  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [usegbListData, setUsegbListData] = useState([COM_CODE_DEFAULT_VALUE]);

  const [testtypeListData, setTestTypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [requestgbListData, setrequestgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialtypeListData, setmaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialgbListData, setmaterialgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [assaygbeListData, setassaygbeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [startschgbListData, setstartschgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [financegbListData, setfinancegbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [amtgbListData, setamtgbListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [addordgbListData, setaddordgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [relationgbListData, setrelationgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );

      const usegbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_CM700")
      );
      const testtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA019_603"
        )
      );
      const requestgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_Requestgb"
        )
      );
      const materialtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA001_603"
        )
      );
      const materialgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA012_603"
        )
      );
      const assaygbeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA013_603"
        )
      );
      const startschgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA014_603"
        )
      );
      const financegbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA015_603"
        )
      );
      const amtgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA016_603"
        )
      );
      const addordgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA017_603"
        )
      );
      const relationgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA018_603"
        )
      );
      fetchQueryData(personQueryStr, setPersonListData);
      fetchQueryData(usegbQueryStr, setUsegbListData);
      fetchQueryData(testtypeQueryStr, setTestTypeListData);
      fetchQueryData(requestgbQueryStr, setrequestgbListData);
      fetchQueryData(materialtypeQueryStr, setmaterialtypeListData);
      fetchQueryData(materialgbQueryStr, setmaterialgbListData);
      fetchQueryData(assaygbeQueryStr, setassaygbeListData);
      fetchQueryData(startschgbQueryStr, setstartschgbListData);
      fetchQueryData(financegbQueryStr, setfinancegbListData);
      fetchQueryData(amtgbQueryStr, setamtgbListData);
      fetchQueryData(addordgbQueryStr, setaddordgbListData);
      fetchQueryData(relationgbQueryStr, setrelationgbListData);
    }
  }, [bizComponentData]);

  const fetchQueryData = useCallback(
    async (queryStr: string, setListData: any) => {
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
    },
    []
  );

  const setCustPersonData = (data: any) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        custprsncd: data.custprsncd,
        custprsnnm: data.prsnnm,
        postnm: data.postnm,
        dptnm: data.dptnm,
        address: data.address,
        telno: data.telno,
        phoneno: data.phoneno,
        email: data.email,
        testtype: "",
        requestgb: "",
        materialtype: "",
        materialgb: "",
        grade1: 0,
        assaygbe: "",
        grade2: 0,
        startschgb: "",
        grade3: 0,
        financegb: "",
        grade4: 0,
        totgrade1: 0,
        amtgb: "",
        grade5: 0,
        addordgb: "",
        grade6: 0,
        relationgb: "",
        grade7: 0,
        totgrade2: 0,
      };
    });
  };

  const setCustData = (data: ICustData) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
        custprsncd: "",
        custprsnnm: "",
        postnm: "",
        dptnm: "",
        address: "",
        telno: "",
        phoneno: "",
        email: "",
        testtype: "",
        requestgb: "",
        materialtype: "",
        materialgb: "",
        grade1: 0,
        assaygbe: "",
        grade2: 0,
        startschgb: "",
        grade3: 0,
        financegb: "",
        grade4: 0,
        totgrade1: 0,
        amtgb: "",
        grade5: 0,
        addordgb: "",
        grade6: 0,
        relationgb: "",
        grade7: 0,
        totgrade2: 0,
      };
    });
  };

  const setProjectData = (data: any) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        ref_key: data.quokey,
        custcd: data.custcd,
        custnm: data.custnm,
        custprsncd: data.custprsncd,
        custprsnnm: data.custprsnnm,
        postnm: data.postnm,
        dptnm: data.dptnm,
        address: data.address,
        telno: data.telno,
        phoneno: data.phoneno,
        email: data.email,
        testtype: testtypeListData.find(
          (item: any) => item.code_name == data.testtype
        )?.sub_code,
        requestgb: requestgbListData.find(
          (item: any) => item.code_name == data.requestgb
        )?.sub_code,
        materialtype: materialtypeListData.find(
          (item: any) => item.code_name == data.materialtype
        )?.sub_code,
        materialgb: materialgbListData.find(
          (item: any) => item.code_name == data.materialgb
        )?.sub_code,
        grade1: data.grade1,
        assaygbe: assaygbeListData.find(
          (item: any) => item.code_name == data.assaygbe
        )?.sub_code,
        grade2: data.grade2,
        startschgb: startschgbListData.find(
          (item: any) => item.code_name == data.startschgb
        )?.sub_code,
        grade3: data.grade3,
        financegb: financegbListData.find(
          (item: any) => item.code_name == data.financegb
        )?.sub_code,
        grade4: data.grade4,
        totgrade1: data.totgrade1,
        amtgb: amtgbListData.find((item: any) => item.code_name == data.amtgb)
          ?.sub_code,
        grade5: data.grade5,
        addordgb: addordgbListData.find(
          (item: any) => item.code_name == data.addordgb
        )?.sub_code,
        grade6: data.grade6,
        relationgb: relationgbListData.find(
          (item: any) => item.code_name == data.relationgb
        )?.sub_code,
        grade7: data.grade7,
        totgrade2: data.totgrade2,
      };
    });
  };

  const handleSelectTab = (e: any) => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedAttadatnums([]);
    }

    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setInformation({
        orgdiv: data.orgidv,
        meetingnum: data.meetingnum,
        usegb: data.usegb,
        meetingid: data.meetingid,
        recdt: toDate(data.recdt),
        title: data.title,
        unshared: data.unshared,
        attdatnum: data.attdatnum == undefined ? "" : data.attdatnum,
        files: data.files,
        ref_key: data.ref_key,
        custcd: data.custcd,
        custnm: data.custnm,
        custprsncd: data.custprsncd,
        custprsnnm: data.custprsnnm,
        postnm: data.postnm,
        dptnm: data.dptnm,
        address: data.address,
        telno: data.telno,
        phoneno: data.phoneno,
        email: data.email,
        testtype: data.testtype,
        requestgb: data.requestgb,
        materialtype: data.materialtype,
        materialgb: data.materialgb,
        grade1: data.grade1,
        assaygbe: data.assaygbe,
        grade2: data.grade2,
        startschgb: data.startschgb,
        grade3: data.grade3,
        financegb: data.financegb,
        grade4: data.grade4,
        totgrade1: data.totgrade1,
        amtgb: data.amtgb,
        grade5: data.grade5,
        addordgb: data.addordgb,
        grade6: data.grade6,
        relationgb: data.relationgb,
        grade7: data.grade7,
        totgrade2: data.totgrade2,
      });

      fetchDetail();
    }
    setTabSelected(e.selected);
  };

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A7000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A7000W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const queryParams = new URLSearchParams(location.search);
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      if (queryParams.has("go")) {
        history.replace({}, "");
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          find_row_value: queryParams.get("go") as string,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          isSearch: true,
        }));
      }
    }
  }, [customOptionData]);

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
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
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

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const CheckChange = (e: any) => {
    const { name, value } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value == false ? "N" : "Y",
    }));
  };
  const history = useHistory();
  const location = useLocation();

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    meetingnum: "",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    title: "",
    usegb: "",
    person: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInformation] = useState({
    orgdiv: "01",
    meetingnum: "",
    usegb: "",
    meetingid: "",
    recdt: new Date(),
    title: "",
    unshared: "N",
    files: "",
    attdatnum: "",
    ref_key: "",
    custcd: "",
    custnm: "",
    custprsncd: "",
    custprsnnm: "",
    postnm: "",
    dptnm: "",
    address: "",
    telno: "",
    phoneno: "",
    email: "",
    testtype: "",
    requestgb: "",
    materialtype: "",
    materialgb: "",
    grade1: 0,
    assaygbe: "",
    grade2: 0,
    startschgb: "",
    grade3: 0,
    financegb: "",
    grade4: 0,
    totgrade1: 0,
    amtgb: "",
    grade5: 0,
    addordgb: "",
    grade6: 0,
    relationgb: "",
    grade7: 0,
    totgrade2: 0,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A7000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_meetingnum": filters.meetingnum,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custnm": filters.custnm,
        "@p_title": filters.title,
        "@p_usegb": filters.usegb,
        "@p_person": filters.person,
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
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.orgdiv + "_" + row.meetingnum == filters.find_row_value
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
                  row.orgdiv + "_" + row.meetingnum == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setWorkType("U");
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setWorkType("U");
        }
      } else {
        setWorkType("");
        resetAllGrid();
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

  const fetchDetail = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    if (mainDataResult.total < 0) {
      return false;
    }

    const mainDataId = Object.getOwnPropertyNames(selectedState)[0];
    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == mainDataId
    );

    const id = "01" + "_" + selectedRowData["meetingnum"];

    const para = {
      folder: "CM_A7000W",
      id: id,
    };

    try {
      data = await processApi<any>("html-query", para);
    } catch (error) {
      data = null;
    }

    if (data !== null && data.document !== "") {
      reference = data.document;
      // Edior에 HTML & CSS 세팅
      if (refEditorRef.current) {
        refEditorRef.current.setHtml(reference);
      }
    } else {
      if (refEditorRef.current) {
        refEditorRef.current.setHtml("");
      }
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setWorkType("");
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A7000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A7000W_001");
      } else {
        setTabSelected(0);
        resetAllGrid();
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == event.dataItem.num
    );

    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });
    setTabSelected(1);

    setWorkType("U");

    setInformation({
      orgdiv: selectedRowData.orgdiv,
      meetingnum: selectedRowData.meetingnum,
      usegb: selectedRowData.usegb,
      meetingid: selectedRowData.meetingid,
      recdt: toDate(selectedRowData.recdt),
      title: selectedRowData.title,
      unshared: selectedRowData.unshared,
      attdatnum:
        selectedRowData.attdatnum == undefined ? "" : selectedRowData.attdatnum,
      files: selectedRowData.files,
      ref_key: selectedRowData.ref_key,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      custprsncd: selectedRowData.custprsncd,
      custprsnnm: selectedRowData.custprsnnm,
      postnm: selectedRowData.postnm,
      dptnm: selectedRowData.dptnm,
      address: selectedRowData.address,
      telno: selectedRowData.telno,
      phoneno: selectedRowData.phoneno,
      email: selectedRowData.email,
      testtype: selectedRowData.testtype,
      requestgb: selectedRowData.requestgb,
      materialtype: selectedRowData.materialtype,
      materialgb: selectedRowData.materialgb,
      grade1: selectedRowData.grade1,
      assaygbe: selectedRowData.assaygbe,
      grade2: selectedRowData.grade2,
      startschgb: selectedRowData.startschgb,
      grade3: selectedRowData.grade3,
      financegb: selectedRowData.financegb,
      grade4: selectedRowData.grade4,
      totgrade1: selectedRowData.totgrade1,
      amtgb: selectedRowData.amtgb,
      grade5: selectedRowData.grade5,
      addordgb: selectedRowData.addordgb,
      grade6: selectedRowData.grade6,
      relationgb: selectedRowData.relationgb,
      grade7: selectedRowData.grade7,
      totgrade2: selectedRowData.totgrade2,
    });
    fetchDetail();
  };

  //저장 파라미터 초기 값
  const [paraDataSaved, setParaDataSaved] = useState({
    workType: "",
    orgdiv: "01",
    meetingnum: "",
    meetingseq: 0,
    recdt: "",
    usegb: "",
    meetingid: "",
    title: "",
    attdatnum: "",
    ref_key: "",
    custcd: "",
    custprsncd: "",
    testtype: "",
    requestgb: "",
    materialtype: "",
    materialgb: "",
    assaygbe: "",
    startschgb: "",
    financegb: "",
    amtgb: "",
    addordgb: "",
    relationgb: "",
    contents: "",
    userid: userId,
    pc: pc,
    formid: "CM_A7000W",
  });

  const onSaveClick = () => {
    let valid = true;
    try {
      if (
        convertDateToStr(information.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(information.recdt).substring(6, 8) > "31" ||
        convertDateToStr(information.recdt).substring(6, 8) < "01" ||
        convertDateToStr(information.recdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A7000W_001");
      } else if (information.title == "") {
        throw findMessage(messagesData, "CM_A7000W_003");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setParaDataSaved({
      workType: workType,
      orgdiv: "01",
      meetingnum: information.meetingnum,
      meetingseq: 0,
      recdt: convertDateToStr(information.recdt),
      usegb: information.usegb,
      meetingid: information.meetingid,
      title: information.title,
      attdatnum: information.attdatnum,
      ref_key: information.ref_key,
      custcd: information.custcd,
      custprsncd: information.custprsncd,
      testtype: information.testtype,
      requestgb: information.requestgb,
      materialtype: information.materialtype,
      materialgb: information.materialgb,
      assaygbe: information.assaygbe,
      startschgb: information.startschgb,
      financegb: information.financegb,
      amtgb: information.amtgb,
      addordgb: information.addordgb,
      relationgb: information.relationgb,
      contents: "",
      userid: userId,
      pc: pc,
      formid: "CM_A7000W",
    });
  };

  useEffect(() => {
    if (paraDataSaved.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraDataSaved]);

  useEffect(() => {
    if (workType != "" && workType == "U") {
      fetchDetail();
    }
  }, [workType]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    let editorContent: any = "";
    if (refEditorRef.current) {
      editorContent = refEditorRef.current.getContent();
    }
    const bytes = require("utf8-bytes");
    const convertedEditorContent =
      workType == "D"
        ? bytesToBase64(bytes(reference))
        : bytesToBase64(bytes(editorContent));

    const parameters = {
      folder: "html-doc?folder=" + "CM_A7000W",
      procedureName: "P_CM_A7000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraDataSaved.workType,
        "@p_orgdiv": paraDataSaved.orgdiv,
        "@p_meetingnum": paraDataSaved.meetingnum,
        "@p_meetingseq": paraDataSaved.meetingseq,
        "@p_recdt": paraDataSaved.recdt,
        "@p_usegb": paraDataSaved.usegb,
        "@p_meetingid": paraDataSaved.meetingid,
        "@p_title": paraDataSaved.title,
        "@p_attdatnum": paraDataSaved.attdatnum,
        "@p_ref_key": paraDataSaved.ref_key,
        "@p_custcd": paraDataSaved.custcd,
        "@p_custprsncd": paraDataSaved.custprsncd,
        "@p_testtype": paraDataSaved.testtype,
        "@p_requestgb": paraDataSaved.requestgb,
        "@p_materialtype": paraDataSaved.materialtype,
        "@p_materialgb": paraDataSaved.materialgb,
        "@p_assaygbe": paraDataSaved.assaygbe,
        "@p_startschgb": paraDataSaved.startschgb,
        "@p_financegb": paraDataSaved.financegb,
        "@p_amtgb": paraDataSaved.amtgb,
        "@p_addordgb": paraDataSaved.addordgb,
        "@p_relationgb": paraDataSaved.relationgb,
        "@p_contents": paraDataSaved.contents,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "CM_A7000W",
      },
      fileBytes: convertedEditorContent,
    };

    try {
      data = await processApi<any>("html-save", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      let array: any[] = [];
      if (workType == "D" && paraDataSaved.attdatnum != "") {
        array.push(paraDataSaved.attdatnum);
      }
      setDeletedAttadatnums(array);
      setUnsavedName([]);
      if (workType == "N" || workType == "D") {
        setTabSelected(0);
      } else {
        setTabSelected(1);
        fetchDetail();
      }

      setParaDataSaved({
        workType: "",
        orgdiv: "01",
        meetingnum: "",
        meetingseq: 0,
        recdt: "",
        usegb: "",
        meetingid: "",
        title: "",
        attdatnum: "",
        ref_key: "",
        custcd: "",
        custprsncd: "",
        testtype: "",
        requestgb: "",
        materialtype: "",
        materialgb: "",
        assaygbe: "",
        startschgb: "",
        financegb: "",
        amtgb: "",
        addordgb: "",
        relationgb: "",
        contents: "",
        userid: userId,
        pc: pc,
        formid: "CM_A7000W",
      });
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const onAddClick = () => {
    setWorkType("N");
    setTabSelected(1);
    setDetailDataResult(process([], detailDataState));
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    setInformation({
      orgdiv: "01",
      meetingnum: "",
      usegb: "",
      meetingid: "",
      recdt: new Date(),
      title: "",
      unshared: defaultOption.find((item: any) => item.id === "unshared")
        .valueCode,
      files: "",
      attdatnum: "",
      ref_key: "",
      custcd: "",
      custnm: "",
      custprsncd: "",
      custprsnnm: "",
      postnm: "",
      dptnm: "",
      address: "",
      telno: "",
      phoneno: "",
      email: "",
      testtype: "",
      requestgb: "",
      materialtype: "",
      materialgb: "",
      grade1: 0,
      assaygbe: "",
      grade2: 0,
      startschgb: "",
      grade3: 0,
      financegb: "",
      grade4: 0,
      totgrade1: 0,
      amtgb: "",
      grade5: 0,
      addordgb: "",
      grade6: 0,
      relationgb: "",
      grade7: 0,
      totgrade2: 0,
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setWorkType("D");
      setParaDataSaved((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: selectRows.orgdiv,
        meetingnum: selectRows.meetingnum,
        attdatnum: selectRows.attdatnum,
      }));
    }
  };

  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");

  const onMainItemChange = (event: GridItemChangeEvent) => {
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

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {};

  const exitEdit = () => {};

  return (
    <>
      <TitleContainer>
        <Title>상담일지</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A7000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="요약정보">
          <GridContainerWrap>
            <GridContainer width="22%">
              <FilterContainer>
                <GridTitleContainer>
                  <GridTitle>조회조건</GridTitle>
                </GridTitleContainer>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
                      <th>회의일</th>
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
                    <tr>
                      <th>고객사</th>
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
                      <th>제목 및 내용</th>
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
            </GridContainer>
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
              <GridContainer width={`calc(88% - ${GAP}px)`}>
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
                        onClick={onAddClick}
                        themeColor={"primary"}
                        icon="file-add"
                      >
                        신규
                      </Button>
                      <Button
                        onClick={onDeleteClick}
                        themeColor={"primary"}
                        fillMode={"outline"}
                        icon="delete"
                      >
                        삭제
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "78vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        usegb: usegbListData.find(
                          (items: any) => items.sub_code == row.usegb
                        )?.code_name,
                        person: personListData.find(
                          (items: any) => items.user_id == row.person
                        )?.user_name,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      mainDataState
                    )}
                    {...mainDataState}
                    onDataStateChange={onMainDataStateChange}
                    // 선택기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange}
                    onRowDoubleClick={onRowDoubleClick}
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
                    onItemChange={onMainItemChange}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
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
                                DateField.includes(item.fieldName)
                                  ? DateCell
                                  : attdatnumField.includes(item.fieldName)
                                  ? ColumnCommandCell
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
            </FormContext.Provider>
          </GridContainerWrap>
        </TabStripTab>

        <TabStripTab
          title="상세정보"
          disabled={
            mainDataResult.data.length == 0 && workType == "" ? true : false
          }
        >
          <GridTitleContainer>
            <GridTitle> </GridTitle>
            <ButtonContainer>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <GridContainerWrap>
            <GridContainer width="40%">
              <GridTitleContainer>
                <GridTitle>회의록</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>회의록번호</th>
                      <td>
                        <Input
                          name="meetingnum"
                          type="text"
                          value={information.meetingnum}
                          className="readonly"
                        />
                      </td>
                      <th>회의록 구분</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="usegb"
                            value={information.usegb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>회의록ID</th>
                      <td>
                        <Input
                          name="meetingid"
                          type="text"
                          value={information.meetingid}
                          onChange={InputChange}
                        />
                      </td>
                      <th>회의일자</th>
                      <td>
                        <DatePicker
                          name="recdt"
                          value={information.recdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                          className="required"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>회의록제목</th>
                      <td colSpan={3}>
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
                      <th style={{ width: "10%" }}>
                        <Checkbox
                          name="unshared"
                          value={information.unshared == "Y" ? true : false}
                          label="업체 비공유"
                          onChange={CheckChange}
                        />
                      </th>
                      <td colSpan={3}>
                        <Button
                          themeColor={"primary"}
                          style={{ width: "100%" }}
                          onClick={() => {
                            if (workType == "N") {
                              alert("회의록 저장 후 등록할 수 있습니다.");
                            } else if (
                              Object.getOwnPropertyNames(selectedState)[0] !=
                              undefined
                            ) {
                              onSignWndClick();
                            } else {
                              alert("선택된 데이터가 없습니다.");
                            }
                          }}
                        >
                          참석자 등록
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={3}>
                        <div className="filter-item-wrap">
                          <Input
                            name="files"
                            value={information.files}
                            className="readonly"
                          />
                          <ButtonInInput>
                            <Button
                              icon="more-horizontal"
                              fillMode={"flat"}
                              onClick={onAttachPbWndClick}
                            />
                          </ButtonInInput>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>프로젝트</th>
                      <td colSpan={3}>
                        <Input
                          name="ref_key"
                          type="text"
                          value={information.ref_key}
                          className="readonly"
                        />
                        <ButtonInInput>
                          <Button
                            icon="more-horizontal"
                            fillMode="flat"
                            onClick={onProjectWndClick}
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                    <tr>
                      <th>의뢰기관코드</th>
                      <td>
                        <Input
                          name="custcd"
                          type="text"
                          value={information.custcd}
                          className="readonly"
                        />
                        {information.ref_key == "" ? (
                          <ButtonInInput>
                            <Button
                              type="button"
                              icon="more-horizontal"
                              fillMode="flat"
                              onClick={onCustWndClick}
                            />
                          </ButtonInInput>
                        ) : (
                          ""
                        )}
                      </td>
                      <th>의뢰기관명</th>
                      <td>
                        {information.ref_key == "" ? (
                          customOptionData !== null && (
                            <CustomOptionComboBox
                              name="custcd"
                              value={information.custcd}
                              type="new"
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              valueField="custcd"
                              textField="custnm"
                            />
                          )
                        ) : (
                          <Input
                            name="custnm"
                            type="text"
                            value={information.custnm}
                            className="readonly"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>의뢰자코드</th>
                      <td>
                        <Input
                          name="custprsncd"
                          type="text"
                          value={information.custprsncd}
                          className="readonly"
                        />
                        {information.custcd != "" ? (
                          <ButtonInInput>
                            <Button
                              type="button"
                              icon="more-horizontal"
                              fillMode="flat"
                              onClick={onCustPersonWndClick}
                            />
                          </ButtonInInput>
                        ) : (
                          ""
                        )}
                      </td>
                      <th>의뢰기관명</th>
                      <td>
                        <Input
                          name="custprsnnm"
                          type="text"
                          value={information.custprsnnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>직위/직책</th>
                      <td>
                        <Input
                          name="postnm"
                          type="text"
                          value={information.postnm}
                          className="readonly"
                        />
                      </td>
                      <th>부서</th>
                      <td>
                        <Input
                          name="dptnm"
                          type="text"
                          value={information.dptnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>주소</th>
                      <td colSpan={3}>
                        <Input
                          name="address"
                          type="text"
                          value={information.address}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>전화번호</th>
                      <td colSpan={3}>
                        <Input
                          name="telno"
                          type="text"
                          value={information.telno}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>휴대폰</th>
                      <td colSpan={3}>
                        <Input
                          name="phoneno"
                          type="text"
                          value={information.phoneno}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>메일</th>
                      <td colSpan={3}>
                        <Input
                          name="email"
                          type="text"
                          value={information.email}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>시험분야</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="testtype"
                            value={information.testtype}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>의뢰목적</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="requestgb"
                            value={information.requestgb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>물질분야</th>
                      <td colSpan={3}>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="materialtype"
                            value={information.materialtype}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>물질확보여부</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="materialgb"
                            value={information.materialgb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>점수</th>
                      <td>
                        <Input
                          name="grade1"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(information.grade1)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>분석법 보유 여부</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="assaygbe"
                            value={information.assaygbe}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>점수</th>
                      <td>
                        <Input
                          name="grade2"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(information.grade2)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>시작예정</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="startschgb"
                            value={information.startschgb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>점수</th>
                      <td>
                        <Input
                          name="grade3"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(information.grade3)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>재무/투자현황</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="financegb"
                            value={information.financegb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>점수</th>
                      <td>
                        <Input
                          name="grade4"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(information.grade4)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>합계</th>
                      <td colSpan={3}>
                        <Input
                          name="totgrade1"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(information.totgrade1)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>금액</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="amtgb"
                            value={information.amtgb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>점수</th>
                      <td>
                        <Input
                          name="grade5"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(information.grade5)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>추가수주</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="addordgb"
                            value={information.addordgb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>점수</th>
                      <td>
                        <Input
                          name="grade6"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(information.grade6)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>BTT관계사 확장</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="relationgb"
                            value={information.relationgb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>점수</th>
                      <td>
                        <Input
                          name="grade7"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(information.grade7)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>합계</th>
                      <td colSpan={3}>
                        <Input
                          name="totgrade2"
                          type="number"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(information.totgrade2)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
            <GridContainer width={`calc(60% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>참고자료</GridTitle>
              </GridTitleContainer>
              <GridContainer style={{ height: "76vh" }}>
                <RichEditor id="refEditor" ref={refEditorRef} />
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {attachmentsWindowVisiblePb && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisiblePb}
          setData={getAttachmentsDataPb}
          para={information.attdatnum}
          modal={true}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          workType="N"
          setVisible={setCustWindowVisible}
          setData={setCustData}
          modal={true}
        />
      )}
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
          pathname="CM_A7000W"
        />
      )}
      {custpersonWindowVisible && (
        <CustomersPersonWindow
          setVisible={setCustPersonWindowVisible}
          custcd={information.custcd}
          setData={setCustPersonData}
          modal={true}
        />
      )}
      {signWindowVisible && (
        <SignWindow
          setVisible={setSignWindowVisible}
          reference_key={filters.orgdiv + "_" + information.meetingnum}
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

export default CM_A7000W;
