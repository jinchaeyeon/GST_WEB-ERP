import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Editor,
  EditorMountEvent,
  EditorTools,
  EditorUtils,
  ProseMirror,
} from "@progress/kendo-react-editor";
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
import { insertImagePlugin } from "../components/UploadImgFunction/insertImagePlugin";
import { InsertImage } from "../components/UploadImgFunction/insertImageTool";
import { insertImageFiles } from "../components/UploadImgFunction/utils";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import SignWindow from "../components/Windows/CommonWindows/SignWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  isLoading,
  unsavedAttadatnumsState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A7000W_C";
import {
  Iparameters,
  TColumn,
  TGrid,
  TInsertImageFiles,
  TPermissions,
} from "../store/types";
import { CellRender, RowRender } from "../components/Renderers/Renderers";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
const { imageResizing } = EditorUtils;
const DateField = ["recdt"];
const attdatnumField = ["files"];

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
          permission={{ upload: false, download: true, delete: false }}
          modal={true}
        />
      )}
    </>
  );
};

const CM_A7000W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const pathname: string = window.location.pathname.replace("/", "");
  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const userId = UseGetValueFromSessionItem("user_id");
  const [workType, setWorkType] = useState("");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const editor = React.createRef<Editor>();
  const textarea = React.createRef<HTMLTextAreaElement>();

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

  const [detailselectedState, setDetailselectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [tabSelected, setTabSelected] = React.useState(0);

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [signWindowVisible, setSignWindowVisible] = useState<boolean>(false);

  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);

  const [attachmentsWindowVisiblePr, setAttachmentsWindowVisiblePr] =
    useState<boolean>(false);

  const [attachmentsWindowVisiblePb, setAttachmentsWindowVisiblePb] =
    useState<boolean>(false);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const getAttachmentsDataPr = (data: IAttachmentData) => {
    if (!information.attdatnum_private) {
      setUnsavedAttadatnums([data.attdatnum]);
    }

    setInformation((prev) => {
      return {
        ...prev,
        attdatnum_private: data.attdatnum,
        files_private:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const getAttachmentsDataPb = (data: IAttachmentData) => {
    if (!information.attdatnum) {
      setUnsavedAttadatnums([data.attdatnum]);
    }

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

  const onAttachPbWndClick = () => {
    setAttachmentsWindowVisiblePb(true);
  };

  const onAttachPrWndClick = () => {
    setAttachmentsWindowVisiblePr(true);
  };

  const onProejctWndClick = () => {
    setProjectWindowVisible(true);
  };

  const onSignWndClick = () => {
    setSignWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  const setProjectData = (data: any) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        ref_key: data.quokey,
      };
    });
  };

  const handleSelectTab = (e: any) => {
    if (e.selected == 1) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setInformation({
        orgdiv: data.orgidv,
        meetingnum: data.meetingnum,
        custcd: data.custcd,
        recdt: toDate(data.recdt),
        meetingid: data.meetingid,
        attdatnum: data.attdatnum,
        files: data.files,
        remark2: data.remark2,
        unshared: data.unshared,
        place: data.place,
        meetingnm: data.meetingnm,
        ref_key: data.ref_key,
        title: data.title,
        usegb: data.usegb,
        attdatnum_private: data.attdatnum_private,
        files_private: data.files_private,
      });

      setDetailFilters((prev) => ({
        ...prev,
        meetingnum: data.meetingnum,
        pgNum: 1,
        isSearch: true,
      }));
    }
    setTabSelected(e.selected);
  };

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
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent("L_sysUserMaster_001, L_CM700", setBizComponentData);

  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [usegbListData, setUsegbListData] = useState([COM_CODE_DEFAULT_VALUE]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );

      const usegbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizCommponentId == "L_CM700")
      );

      fetchQueryData(personQueryStr, setPersonListData);
      fetchQueryData(usegbQueryStr, setUsegbListData);
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

  const minGridWidth = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);

  React.useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      window.addEventListener("resize", handleResize);

      //가장작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"].map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );

      setGridCurrent(grid.current.clientWidth);
      setApplyMinWidth(grid.current.clientWidth < minGridWidth.current);
    }
  }, [customOptionData]);

  const handleResize = () => {
    if (grid.current.clientWidth < minGridWidth.current && !applyMinWidth) {
      setApplyMinWidth(true);
    } else if (grid.current.clientWidth > minGridWidth.current) {
      setGridCurrent(grid.current.clientWidth);
      setApplyMinWidth(false);
    }
  };

  const setWidth = (Name: string, minWidth: number | undefined) => {
    if (minWidth == undefined) {
      minWidth = 0;
    }
    let width = applyMinWidth
      ? minWidth
      : minWidth +
        (gridCurrent - minGridWidth.current) /
          customOptionData.menuCustomColumnOptions[Name].length;

    return width;
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

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: orgdiv,
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
    isSearch: true,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    meetingnum: "",
    meetingseq: 0,
    pgNum: 1,
    isSearch: true,
  });

  const [information, setInformation] = useState({
    orgdiv: orgdiv,
    meetingnum: "",
    custcd: "",
    recdt: new Date(),
    meetingid: "",
    attdatnum: "",
    files: "",
    remark2: "",
    unshared: "N",
    place: "",
    meetingnm: "",
    ref_key: "",
    title: "",
    usegb: "",
    attdatnum_private: "",
    files_private: "",
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
            (row: any) => row.meetingnum == filters.find_row_value
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
            : rows.find((row: any) => row.meetingnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setDetailFilters((prev) => ({
            ...prev,
            meetingnum: selectedRow.meetingnum,
            pgNum: 1,
            isSearch: true,
          }));

          setWorkType("U");

          setInformation({
            orgdiv: selectedRow.orgdiv,
            meetingnum: selectedRow.meetingnum,
            custcd: selectedRow.custcd,
            recdt: toDate(selectedRow.recdt),
            meetingid: selectedRow.meetingid,
            attdatnum: selectedRow.attdatnum,
            files: selectedRow.files,
            remark2: selectedRow.remark2,
            unshared: selectedRow.unshared,
            place: selectedRow.place,
            meetingnm: selectedRow.meetingnm,
            ref_key: selectedRow.ref_key,
            title: selectedRow.title,
            usegb: selectedRow.usegb,
            attdatnum_private: selectedRow.attdatnum_private,
            files_private: selectedRow.files_private,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setDetailFilters((prev) => ({
            ...prev,
            meetingnum: rows[0].meetingnum,
            pgNum: 1,
            isSearch: true,
          }));
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

  //그리드 데이터 조회
  const fetchDetailGrid = async (detailfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A7000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": detailfilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_meetingnum": detailfilters.meetingnum,
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

      //Editor에 값 세팅
      if (editor.current && textarea.current) {
        const view = editor.current.view;
        if (view && textarea.current) {
          EditorUtils.setHtml(view, textarea.current.value);
        }
      }

      setDetailDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      const selectedRow = rows[0];

      if (selectedRow != undefined) {
        setInformation({
          orgdiv: selectedRow.orgdiv,
          meetingnum: selectedRow.meetingnum,
          custcd: selectedRow.custcd,
          recdt: toDate(selectedRow.recdt),
          meetingid: selectedRow.meetingid,
          attdatnum: selectedRow.attdatnum,
          files: selectedRow.files,
          remark2: selectedRow.remark2,
          unshared: selectedRow.unshared,
          place: selectedRow.place,
          meetingnm: selectedRow.meetingnm,
          ref_key: selectedRow.ref_key,
          title: selectedRow.title,
          usegb: selectedRow.usegb,
          attdatnum_private: selectedRow.attdatnum_private,
          files_private: selectedRow.files_private,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      if (editor.current) {
        const view = editor.current.view;
        if (view) {
          EditorUtils.setHtml(view, "");
        }
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailfilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters);
      setDetailFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailfilters, permissions]);

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
    const selectedRowData = event.dataItem;

    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });
    setDetailDataResult(process([], detailDataState));

    setDetailFilters((prev) => ({
      ...prev,
      meetingnum: selectedRowData.meetingnum,
      pgNum: 1,
      isSearch: true,
    }));

    setTabSelected(1);

    setWorkType("U");
  };

  //저장 파라미터 초기 값
  const [paraDataSaved, setParaDataSaved] = useState({
    workType: "",
    orgdiv: orgdiv,
    meetingnum: "",
    meetingseq: 0,
    custcd: "",
    recdt: "",
    meetingid: "",
    title: "",
    attdatnum: "",
    remark2: "",
    usegb: "",
    unshared: "N",
    place: "",
    meetingnm: "",
    ref_key: "",
    attdatnum_private: "",
    contents: "",
    userid: userId,
    pc: pc,
    formid: "CM_A7000W",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A7000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataSaved.workType,
      "@p_orgdiv": paraDataSaved.orgdiv,
      "@p_meetingnum": paraDataSaved.meetingnum,
      "@p_meetingseq": paraDataSaved.meetingseq,
      "@p_custcd": paraDataSaved.custcd,
      "@p_recdt": paraDataSaved.recdt,
      "@p_meetingid": paraDataSaved.meetingid,
      "@p_title": paraDataSaved.title,
      "@p_attdatnum": paraDataSaved.attdatnum,
      "@p_remark2": paraDataSaved.remark2,
      "@p_usegb": paraDataSaved.usegb,
      "@p_unshared": paraDataSaved.unshared,
      "@p_place": paraDataSaved.place,
      "@p_meetingnm": paraDataSaved.meetingnm,
      "@p_ref_key": paraDataSaved.ref_key,
      "@p_attdatnum_private": paraDataSaved.attdatnum_private,
      "@p_contents": paraDataSaved.contents,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A7000W",
    },
  };

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
      } else if (information.custcd == "") {
        throw findMessage(messagesData, "CM_A7000W_002");
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
      orgdiv: orgdiv,
      meetingnum: information.meetingnum,
      meetingseq: detailfilters.meetingseq,
      custcd: information.custcd,
      recdt: convertDateToStr(information.recdt),
      meetingid: information.meetingid,
      title: information.title,
      attdatnum: information.attdatnum,
      remark2: information.remark2,
      usegb: information.usegb,
      unshared: information.unshared,
      place: information.place,
      meetingnm: information.meetingnm,
      ref_key: information.ref_key,
      attdatnum_private: information.attdatnum_private,
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

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      if (workType == "N" || workType == "D") {
        setTabSelected(0);
      } else {
        setTabSelected(1);
      }
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
    setInformation({
      orgdiv: orgdiv,
      meetingnum: "",
      custcd: "",
      recdt: new Date(),
      meetingid: "",
      attdatnum: "",
      files: "",
      remark2: "",
      unshared: "Y",
      place: "",
      meetingnm: "",
      ref_key: "",
      title: "",
      usegb: "",
      attdatnum_private: "",
      files_private: "",
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
      }));
    }
  };

  const {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Subscript,
    Superscript,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Indent,
    Outdent,
    OrderedList,
    UnorderedList,
    Undo,
    Redo,
    FontSize,
    FontName,
    FormatBlock,
    Link,
    Unlink,
    ViewHtml,
    InsertTable,
    AddRowBefore,
    AddRowAfter,
    AddColumnBefore,
    AddColumnAfter,
    DeleteRow,
    DeleteColumn,
    DeleteTable,
    MergeCells,
    SplitCell,
  } = EditorTools;

  const onImageInsert = (args: TInsertImageFiles) => {
    const { files, view, event } = args;
    const nodeType = view.state.schema.nodes.image;

    const position =
      event.type === "drop"
        ? view.posAtCoords({ left: event.clientX, top: event.clientY })
        : null;

    insertImageFiles({ view, files, nodeType, position });

    return files.length > 0;
  };

  const onMount = (event: EditorMountEvent) => {
    const state = event.viewProps.state;
    const plugins = [
      ...state.plugins,
      insertImagePlugin(onImageInsert),
      imageResizing(),
    ];

    return new ProseMirror.EditorView(
      { mount: event.dom },
      {
        ...event.viewProps,
        state: ProseMirror.EditorState.create({ doc: state.doc, plugins }),
      }
    );
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
  
  const enterEdit = (dataItem: any, field: string) => {
   
  };

  const exitEdit = () => {
   
  };
  
  return (
    <>
      <TitleContainer>
        <Title>회의록관리</Title>
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
                    style={{ height: "75vh" }}
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
                    id="grdList"
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
                              width={setWidth("grdList", item.width)}
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
            <GridContainer width="30%">
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
                    </tr>
                    <tr>
                      <th>업체코드</th>
                      <td>
                        <Input
                          name="custcd"
                          type="text"
                          value={information.custcd ? information.custcd : ""}
                          onChange={InputChange}
                          className="readonly"
                        />
                        <ButtonInInput>
                          <Button
                            type="button"
                            icon="more-horizontal"
                            fillMode="flat"
                            onClick={onCustWndClick}
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                    <tr>
                      <th>업체명</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="custcd"
                            value={information.custcd}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            valueField="custcd"
                            textField="custnm"
                            className="required"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th style={{ width: isMobile ? "" : "15%" }}>회의일</th>
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
                      <th>회의록ID</th>
                      <td>
                        <Input
                          name="meetingid"
                          type="text"
                          value={information.meetingid}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>회의록제목</th>
                      <td>
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
                      <th>첨부파일</th>
                      <td>
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
                    <tr>
                      <th>비고</th>
                      <td>
                        <Input
                          name="remark2"
                          type="text"
                          value={information.remark2}
                          onChange={InputChange}
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
                      <th style={{ width: "10%" }}>
                        <Checkbox
                          name="unshared"
                          value={information.unshared == "Y" ? true : false}
                          label="업체 비공유"
                          onChange={CheckChange}
                        />
                      </th>
                      <td>
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
                    <tr></tr>
                    <tr>
                      <th>회의 장소</th>
                      <td>
                        <Input
                          name="place"
                          type="text"
                          value={information.place}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>회의록명</th>
                      <td>
                        <Input
                          name="meetingnm"
                          type="text"
                          value={information.meetingnm}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>프로젝트</th>
                      <td>
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
                            onClick={onProejctWndClick}
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일(비공개)</th>
                      <td>
                        <Input
                          name="files_private"
                          value={information.files_private}
                          className="readonly"
                        />
                        <ButtonInInput>
                          <Button
                            icon="more-horizontal"
                            fillMode="flat"
                            onClick={onAttachPrWndClick}
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
            <GridContainer width={`calc(70% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>참고자료</GridTitle>
              </GridTitleContainer>
              <Editor
                tools={[
                  [Bold, Italic, Underline, Strikethrough],
                  [Subscript, Superscript],
                  [AlignLeft, AlignCenter, AlignRight, AlignJustify],
                  [Indent, Outdent],
                  [OrderedList, UnorderedList],
                  FontSize,
                  FontName,
                  FormatBlock,
                  [Undo, Redo],
                  [Link, Unlink, InsertImage, ViewHtml],
                  [InsertTable],
                  [AddRowBefore, AddRowAfter, AddColumnBefore, AddColumnAfter],
                  [DeleteRow, DeleteColumn, DeleteTable],
                  [MergeCells, SplitCell],
                ]}
                contentStyle={{ height: "68vh" }}
                style={{ marginTop: "4.6px" }}
                ref={editor}
                onMount={onMount}
              />
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {attachmentsWindowVisiblePr && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisiblePr}
          setData={getAttachmentsDataPr}
          para={information.attdatnum_private}
          modal={true}
        />
      )}
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
      {signWindowVisible && (
        <SignWindow
          setVisible={setSignWindowVisible}
          reference_key={filters.orgdiv + "_" + detailfilters.meetingnum}
          modal={true}
        />
      )}
    </>
  );
};

export default CM_A7000W;
