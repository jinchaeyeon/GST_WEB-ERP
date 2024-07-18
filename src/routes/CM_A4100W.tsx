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
  CheckboxChangeEvent,
  Input,
  InputChangeEvent,
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
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
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
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
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import EducationWindow from "../components/Windows/CommonWindows/EducationWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isFilterHideState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A4100W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
let deletedMainRows: object[] = [];

const NumberField = ["edtime", "cnt"];
const CheckField = ["finyn"];
const DateField = ["recdt"];
const CustomComboField = ["person"];
const filesField = ["files"];

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자
  UseBizComponent("L_sysUserMaster_001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "person" ? "L_sysUserMaster_001" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
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
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
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
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
    </>
  );
};
let temp = 0;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;
var height9 = 0;

const CM_A4100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A4100W", setCustomOptionData);
  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".ButtonContainer4");
      height5 = getHeight(".ButtonContainer5");
      if (height6 == 0 && !isMobile) {
        height6 = getHeight(".FormBoxWrap");
      }
      if (height7 == 0 && !isMobile) {
        height7 = getHeight(".FormBoxWrap2");
      }
      height8 = getHeight(".k-tabstrip-items-wrapper");
      height9 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height8 - height9);
        setMobileHeight2(getDeviceHeight(true) - height2 - height8 - height9);
        setMobileHeight3(getDeviceHeight(true) - height3 - height8 - height9);
        setMobileHeight4(getDeviceHeight(true) - height4 - height8 - height9);
        setMobileHeight5(getDeviceHeight(true) - height5 - height8 - height9);
        setWebHeight(
          getDeviceHeight(true) - height - height6 - height8 - height9
        );
        setWebHeight2(getDeviceHeight(true) - height2 - height8 - height9);
        setWebHeight3(
          getDeviceHeight(true) -
            height3 -
            height4 -
            height7 -
            height8 -
            height9
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, tabSelected, webheight, webheight2, webheight3]);

  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);
  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);
  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  //FormContext의 데이터 state
  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A4100W", setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
        isSearch: true,
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
      setPersonListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setEdudivListData(getBizCom(bizComponentData, "L_CM050"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
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
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
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
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

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
    orgdiv: sessionOrgdiv,
    datnum: "",
    frdt: new Date(),
    todt: new Date(),
    title: "",
    person: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    datnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
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
            (row: any) => row.edunum == filters.find_row_value
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
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.edunum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          const persons = personListData.find(
            (item: any) => item.user_id == selectedRow.person
          )?.user_name;
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            edunum: selectedRow.edunum,
            edudiv: selectedRow.edudiv,
            person: persons == undefined ? "" : persons,
            title: selectedRow.title,
            edtime: selectedRow.edtime,
            recdt: toDate(selectedRow.recdt),
            contents: selectedRow.contents,
            files: selectedRow.files,
            attdatnum: selectedRow.attdatnum,
            finyn: selectedRow.finyn == "Y" ? true : false,
            row_status_s:
              selectedRow.row_status_s == undefined
                ? ""
                : selectedRow.row_status_s,
            seq_s: selectedRow.seq_s == undefined ? "" : selectedRow.seq_s,
            person_s:
              selectedRow.person_s == undefined ? "" : selectedRow.person_s,
            remark_s:
              selectedRow.remark_s == undefined ? "" : selectedRow.remark_s,
            attdatnum_s:
              selectedRow.attdatnum_s == undefined
                ? ""
                : selectedRow.attdatnum_s,
            datnum: selectedRow.datnum,
            eduname: selectedRow.eduname,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          const persons = personListData.find(
            (item: any) => item.user_id == rows[0].person
          )?.user_name;
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            edunum: rows[0].edunum,
            edudiv: rows[0].edudiv,
            person: persons == undefined ? "" : persons,
            title: rows[0].title,
            edtime: rows[0].edtime,
            recdt: toDate(rows[0].recdt),
            contents: rows[0].contents,
            files: rows[0].files,
            attdatnum: rows[0].attdatnum,
            finyn: rows[0].finyn == "Y" ? true : false,
            row_status_s:
              rows[0].row_status_s == undefined ? "" : rows[0].row_status_s,
            seq_s: rows[0].seq_s == undefined ? "" : rows[0].seq_s,
            person_s: rows[0].person_s == undefined ? "" : rows[0].person_s,
            remark_s: rows[0].remark_s == undefined ? "" : rows[0].remark_s,
            attdatnum_s:
              rows[0].attdatnum_s == undefined ? "" : rows[0].attdatnum_s,
            datnum: rows[0].datnum,
            eduname: rows[0].eduname,
          });
        }
      } else {
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

  const fetchMainGrid2 = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

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

    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.datnum == filters.find_row_value
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

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.edunum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY]]: true });
          const persons = personListData.find(
            (item: any) => item.user_id == selectedRow.person
          )?.user_name;

          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            edunum: selectedRow.edunum,
            edudiv: selectedRow.edudiv,
            person: persons == undefined ? "" : persons,
            title: selectedRow.title,
            edtime: selectedRow.edtime,
            recdt: toDate(selectedRow.recdt),
            contents: selectedRow.contents,
            files: selectedRow.files,
            attdatnum: selectedRow.attdatnum,
            finyn: selectedRow.finyn == "Y" ? true : false,
            row_status_s:
              selectedRow.row_status_s == undefined
                ? ""
                : selectedRow.row_status_s,
            seq_s: selectedRow.seq_s == undefined ? "" : selectedRow.seq_s,
            person_s:
              selectedRow.person_s == undefined ? "" : selectedRow.person_s,
            remark_s:
              selectedRow.remark_s == undefined ? "" : selectedRow.remark_s,
            attdatnum_s:
              selectedRow.attdatnum_s == undefined
                ? ""
                : selectedRow.attdatnum_s,
            datnum: selectedRow.datnum,
            eduname: selectedRow.eduname,
          });
          setsubFilters((prev) => ({
            ...prev,
            datnum: selectedRow.datnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY]]: true });
          const persons = personListData.find(
            (item: any) => item.user_id == rows[0].person
          )?.user_name;

          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            edunum: rows[0].edunum,
            edudiv: rows[0].edudiv,
            person: persons == undefined ? "" : persons,
            title: rows[0].title,
            edtime: rows[0].edtime,
            recdt: toDate(rows[0].recdt),
            contents: rows[0].contents,
            files: rows[0].files,
            attdatnum: rows[0].attdatnum,
            finyn: rows[0].finyn == "Y" ? true : false,
            row_status_s:
              rows[0].row_status_s == undefined ? "" : rows[0].row_status_s,
            seq_s: rows[0].seq_s == undefined ? "" : rows[0].seq_s,
            person_s: rows[0].person_s == undefined ? "" : rows[0].person_s,
            remark_s: rows[0].remark_s == undefined ? "" : rows[0].remark_s,
            attdatnum_s:
              rows[0].attdatnum_s == undefined ? "" : rows[0].attdatnum_s,
            datnum: rows[0].datnum,
            eduname: rows[0].eduname,
          });
          setsubFilters((prev) => ({
            ...prev,
            datnum: rows[0].datnum,
            isSearch: true,
            pgNum: 1,
          }));
        }
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
        setSubDataResult(process([], subDataState));
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
    if (!permissions.view) return;
    let data: any;

    setLoading(true);
    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_CM_A4100W_Q",
      pageNumber: subfilters.pgNum,
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

    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;
      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY3] == subfilters.find_row_value
          );
          targetRowIndex3 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage3({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef3.current) {
          targetRowIndex3 = 0;
        }
      }

      setSubDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY3] == subfilters.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[DATA_ITEM_KEY3]]: true });
        } else {
          setSelectedsubDataState({ [rows[0][DATA_ITEM_KEY3]]: true });
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

  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      if (tabSelected == 0) {
        fetchMainGrid(deepCopiedFilters);
      } else {
        fetchMainGrid2(deepCopiedFilters);
      }
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      subfilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);

      setsubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters, permissions, bizComponentData, customOptionData]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);

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
  }, [mainDataResult2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [subDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    deletedMainRows = [];
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setSubDataResult(process([], subDataState));
  };

  //체크박스 유무
  const [yn, setyn] = useState(true);

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
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);

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
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedsubDataState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridTwo.sheets[1] = optionsGridThree.sheets[0];
        optionsGridTwo.sheets[0].title = "요약정보";
        optionsGridTwo.sheets[1].title = "상세정보";
        _export2.save(optionsGridTwo);
      }
    }
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
        총
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
        총
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
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onAddClick2 = () => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
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
    setPage3(initialPageState);
    setsubFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));
    setSubDataResult(process([], subDataState));
  };

  const onAddClick = () => {
    subDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY3]: ++temp,
      attdatnum: "",
      datnum: "",
      datnum1: "",
      files: "",
      orgdiv: sessionOrgdiv,
      person: "",
      remark: "",
      seq: 0,
      rowstatus: "N",
    };

    setSelectedsubDataState({ [newDataItem[DATA_ITEM_KEY3]]: true });
    setSubDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage3((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const onEducationWndClick = () => {
    setEducationWindowVisible(true);
  };

  const handleSelectTab = (e: any) => {
    if (isMobile) {
      setIsFilterHideStates(true);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    setTabSelected(e.selected);
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      orgdiv: sessionOrgdiv,
      datnum: "",
      title: "",
      person: "",
      find_row_value: "",
      isSearch: true,
    }));
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
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A4100W_003");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A4100W_003");
      } else {
        resetAllGrid();
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
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
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
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
      const newData = subDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY3] ==
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
    edunum: "",
    datnum: "",
    attdatnum: "",
  });

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (tabSelected == 0) {
      if (mainDataResult.data.length == 0) {
        alert("데이터가 없습니다.");
      } else {
        const selectRow = mainDataResult.data.filter(
          (item: any) =>
            item.num == Object.getOwnPropertyNames(selectedState)[0]
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
      }
    } else {
      if (mainDataResult2.data.length == 0) {
        alert("데이터가 없습니다.");
      } else {
        const selectRow = mainDataResult2.data.filter(
          (item: any) =>
            item.num == Object.getOwnPropertyNames(selectedState2)[0]
        )[0];

        setParaDataDeleted((prev) => ({
          ...prev,
          work_type: "D1",
          edunum: selectRow.edunum,
          datnum: selectRow.datnum,
          attdatnum: selectRow.attdatnum,
        }));
      }
    }
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_CM_A4100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": sessionOrgdiv,
      "@p_edunum": paraDataDeleted.edunum,
      "@p_recdt": convertDateToStr(infomation.recdt),
      "@p_person": personListData.find(
        (item: any) => item.user_name == infomation.person
      )?.user_id,
      "@p_finyn": infomation.finyn == true ? "Y" : "N",
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
      "@p_orgdiv": sessionOrgdiv,
      "@p_edunum": infomation.edunum,
      "@p_recdt": convertDateToStr(infomation.recdt),
      "@p_person": personListData.find(
        (item: any) => item.user_name == infomation.person
      )?.user_id,
      "@p_finyn":
        infomation.workType == "N1" ? "" : infomation.finyn == true ? "Y" : "N",
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
    if (
      (paraDataDeleted.work_type == "D" || paraDataDeleted.work_type == "D1") &&
      permissions.delete
    )
      fetchToDelete();
  }, [paraDataDeleted, permissions]);

  useEffect(() => {
    if (
      (infomation.row_status_s != "" ||
        infomation.workType == "N1" ||
        infomation.workType == "U1") &&
      permissions.save
    )
      fetchTodoGridSaved();
  }, [infomation, permissions]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", infopara);
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
      resetAllGrid();
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onSaveClick2 = async () => {
    if (!permissions.save) return;
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
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (infomation.workType == "" && dataItem.length == 0) {
      setInfomation((prev) => ({
        ...prev,
        workType: "N1",
      }));
    }
    if (infomation.workType == "U" && dataItem.length == 0) {
      setInfomation((prev) => ({
        ...prev,
        workType: "U1",
      }));
    }
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
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
    if (!permissions.delete) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (tabSelected == 0) {
        const isLastDataDeleted =
          mainDataResult.data.length == 1 && filters.pgNum > 0;
        const findRowIndex = mainDataResult.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        );
        setDeletedAttadatnums([infomation.attdatnum]);
        if (isLastDataDeleted) {
          setPage({
            skip: PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setFilters((prev: any) => ({
            ...prev,
            find_row_value:
              mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
              undefined
                ? ""
                : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                    .edunum,
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        }
      } else {
        const isLastDataDeleted =
          mainDataResult2.data.length == 1 && filters.pgNum > 0;
        const findRowIndex = mainDataResult2.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
        );
        let array: any[] = [];
        array.push(infomation.attdatnum);
        subDataResult.data.map((item: any) => {
          array.push(item.attdatnum);
        });

        setDeletedAttadatnums(array);
        if (isLastDataDeleted) {
          setPage2({
            skip: PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setFilters((prev: any) => ({
            ...prev,
            find_row_value:
              mainDataResult2.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
              undefined
                ? ""
                : mainDataResult2.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                    .datnum,
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        }
      }
      setUnsavedName([]);
      setUnsavedAttadatnums([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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
    if (!permissions.save) return;
    fetchSaved();
  };

  const fetchSaved = async () => {
    if (!permissions.save) return;
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

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        find_row_value: data.returnString,
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

  const CheckChange = (event: CheckboxChangeEvent) => {
    setyn(event.value);
    setInfomation((prev) => ({
      ...prev,
      finyn: event.value,
    }));
  };

  //FormContext 데이터 변경 시 set
  useEffect(() => {
    const datas2 = subDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedsubDataState)[0]
    )[0];
    if (datas2 != undefined) {
      if (datas2.attdatnum == "") {
        setUnsavedAttadatnums((prev) => [...prev, attdatnum]);
      }
    }

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
            rowstatus: item.rowstatus == "N" ? "N" : "U",
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
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    subDataResult.data.forEach((item: any, index: number) => {
      if (!selectedsubDataState[item[DATA_ITEM_KEY3]]) {
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
      [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
    });
  };

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
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setsubFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage3(initialPageState);

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setsubFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage3({
      ...event.page,
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
              pathname="CM_A4100W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>

      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="교육기준정보"
          disabled={permissions.view ? false : true}
        >
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
          {isMobile ? (
            <Swiper
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
              onActiveIndexChange={(swiper) => {
                index = swiper.activeIndex;
              }}
            >
              <SwiperSlide key={0}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        요약정보
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="file-add"
                        disabled={permissions.save ? false : true}
                      >
                        신규
                      </Button>
                      <Button
                        onClick={onDeleteClick}
                        icon="delete"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.delete ? false : true}
                      >
                        삭제
                      </Button>
                      <Button
                        onClick={onSaveClick}
                        icon="save"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
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
                    fileName="교육관리"
                  >
                    <Grid
                      style={{
                        height: mobileheight,
                      }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          person: personListData.find(
                            (item: any) => item.user_id == row.person
                          )?.user_name,
                          edudiv: edudivListData.find(
                            (item: any) => item.sub_code == row.edudiv
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
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1} style={{ flexDirection: "column" }}>
                <ButtonContainer
                  className="ButtonContainer2"
                  style={{ justifyContent: "left", width: "100%" }}
                >
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(0);
                      }
                    }}
                    icon="chevron-left"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                </ButtonContainer>
                <FormBoxWrap style={{ height: mobileheight2 }}>
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
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainer width="100%">
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      신규
                    </Button>
                    <Button
                      onClick={onDeleteClick}
                      icon="delete"
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                    <Button
                      onClick={onSaveClick}
                      icon="save"
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
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
                  fileName="교육관리"
                >
                  <Grid
                    style={{ height: webheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        person: personListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
                        edudiv: edudivListData.find(
                          (item: any) => item.sub_code == row.edudiv
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
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <FormBoxWrap className="FormBoxWrap">
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
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="교육참여/진행관리"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>교육일자</th>
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
          {isMobile ? (
            <Swiper
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
              onActiveIndexChange={(swiper) => {
                index = swiper.activeIndex;
              }}
            >
              <SwiperSlide key={0}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer3">
                    <GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        요약정보
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="교육관리"
                  >
                    <Grid
                      style={{
                        height: mobileheight3,
                      }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
                          person: personListData.find(
                            (item: any) => item.user_id == row.person
                          )?.user_name,
                          [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                        })),
                        mainDataState2
                      )}
                      {...mainDataState2}
                      onDataStateChange={onMainDataStateChange2}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY2}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange2}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult2.total}
                      skip={page2.skip}
                      take={page2.take}
                      pageable={true}
                      onPageChange={pageChange2}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList2"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
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
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell2
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        <div>
                          <Button
                            onClick={() => {
                              if (swiper && isMobile) {
                                swiper.slideTo(0);
                              }
                            }}
                            icon="chevron-left"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                          기본정보
                        </div>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="file-add"
                        disabled={permissions.save ? false : true}
                      >
                        신규
                      </Button>
                      <Button
                        onClick={onDeleteClick}
                        icon="delete"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.delete ? false : true}
                      >
                        삭제
                      </Button>
                      <Button
                        onClick={onSaveClick2}
                        icon="save"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        저장
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <FormBoxWrap
                    style={{
                      height: mobileheight4,
                      overflow: "auto",
                    }}
                    border={true}
                  >
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
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={2}>
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
                  <GridContainer style={{ width: "100%", overflow: "auto" }}>
                    <GridTitleContainer className="ButtonContainer5">
                      <GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-left"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                        상세정보
                      </GridTitle>

                      <ButtonContainer>
                        <Button
                          onClick={onAddClick}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onDeleteClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={subDataResult.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="교육관리"
                    >
                      <Grid
                        style={{ height: mobileheight5 }}
                        data={process(
                          subDataResult.data.map((row) => ({
                            ...row,
                            rowstatus:
                              row.rowstatus == null ||
                              row.rowstatus == "" ||
                              row.rowstatus == undefined
                                ? ""
                                : row.rowstatus,
                            [SELECTED_FIELD]:
                              selectedsubDataState[idGetter3(row)],
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
                          mode: "single",
                        }}
                        onSelectionChange={onSubDataSelectionChange}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={subDataResult.total}
                        skip={page3.skip}
                        take={page3.take}
                        pageable={true}
                        onPageChange={pageChange3}
                        //원하는 행 위치로 스크롤 기능
                        ref={gridRef3}
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
                          customOptionData.menuCustomColumnOptions["grdList3"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                </FormContext.Provider>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="35%">
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>요약정보</GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="교육관리"
                  >
                    <Grid
                      style={{ height: webheight2 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
                          person: personListData.find(
                            (item: any) => item.user_id == row.person
                          )?.user_name,
                          [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                        })),
                        mainDataState2
                      )}
                      {...mainDataState2}
                      onDataStateChange={onMainDataStateChange2}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY2}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange2}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult2.total}
                      skip={page2.skip}
                      take={page2.take}
                      pageable={true}
                      onPageChange={pageChange2}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList2"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
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
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell2
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainer width={`calc(65% - ${GAP}px)`}>
                  <GridTitleContainer className="ButtonContainer3">
                    <GridTitle>기본정보</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="file-add"
                        disabled={permissions.save ? false : true}
                      >
                        신규
                      </Button>
                      <Button
                        onClick={onDeleteClick}
                        icon="delete"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.delete ? false : true}
                      >
                        삭제
                      </Button>
                      <Button
                        onClick={onSaveClick2}
                        icon="save"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        저장
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <FormBoxWrap border={true} className="FormBoxWrap2">
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
                    <GridTitleContainer className="ButtonContainer4">
                      <GridTitle>상세정보</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onDeleteClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={subDataResult.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="교육관리"
                    >
                      <Grid
                        style={{ height: webheight3 }}
                        data={process(
                          subDataResult.data.map((row) => ({
                            ...row,
                            rowstatus:
                              row.rowstatus == null ||
                              row.rowstatus == "" ||
                              row.rowstatus == undefined
                                ? ""
                                : row.rowstatus,
                            [SELECTED_FIELD]:
                              selectedsubDataState[idGetter3(row)],
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
                          mode: "single",
                        }}
                        onSelectionChange={onSubDataSelectionChange}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={subDataResult.total}
                        skip={page3.skip}
                        take={page3.take}
                        pageable={true}
                        onPageChange={pageChange3}
                        //원하는 행 위치로 스크롤 기능
                        ref={gridRef3}
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
                          customOptionData.menuCustomColumnOptions["grdList3"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                                      item.sortOrder == 0
                                        ? subTotalFooterCell
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </FormContext.Provider>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={infomation.attdatnum}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
      {educationWindowVisible && (
        <EducationWindow
          getVisible={setEducationWindowVisible}
          setData={getEducationData}
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

export default CM_A4100W;
