import {
  useEffect,
  useState,
  useCallback,
  useContext,
  createContext,
} from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridDataStateChangeEvent,
  GridItemChangeEvent,
  GridCellProps,
  GridHeaderCellProps,
} from "@progress/kendo-react-grid";
import AttachmentsWindow from "./CommonWindows/AttachmentsWindow";
import {
  TextArea,
  InputChangeEvent,
  Checkbox,
} from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import CopyWindow3 from "./BA_A0080W_Copy_Window";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  Title,
  TitleContainer,
  ButtonInInput,
  GridTitleContainer,
  FormBoxWrap,
  FormBox,
  GridTitle,
  ButtonInGridInput,
  GridContainerWrap,
} from "../../CommonStyled";
import { useRecoilState } from "recoil";
import { Input } from "@progress/kendo-react-inputs";
import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import {
  chkScrollHandler,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  getQueryFromBizComponent,
  UseParaPc,
  toDate,
  convertDateToStr,
  getGridItemChangedData,
  dateformat,
  isValidDate,
  findMessage,
  setDefaultDate,
  getItemQuery,
} from "../CommonFunction";
import { CellRender, RowRender } from "../Renderers/Renderers";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { loginResultState } from "../../store/atoms";
import { IWindowPosition, IAttachmentData } from "../../hooks/interfaces";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { COM_CODE_DEFAULT_VALUE, EDIT_FIELD } from "../CommonString";
import { useSetRecoilState } from "recoil";
import {
  isLoading,
  deletedAttadatnumsState,
  unsavedAttadatnumsState,
} from "../../store/atoms";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import NumberCell from "../Cells/NumberCell";
import DateCell from "../Cells/DateCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import CheckBoxReadOnlyCell from "../Cells/CheckBoxReadOnlyCell";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import CheckBoxCell from "../Cells/CheckBoxCell";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  setData(data: object, filter: object, deletedMainRows: object): void;
  reload: boolean; //data : 선택한 품목 데이터를 전달하는 함수
};

type Idata = {
  attdatnum: string;
  chooses: number;
  commcnt: number;
  custcd: string;
  custnm: string;
  endyn: string;
  endyn2: string;
  files: string;
  findt: string;
  finexpdt: string;
  loadok: number;
  person: string;
  personnm: string;
  rcvperson: string;
  readok: number;
  recdt: string;
  recdt2: string;
  recno: string;
  insert_userid: string;
  reqctns: string;
  reqdt: string;
  slnctns: string;
  title: string;
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
let deletedMainRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA019,L_BA015, L_LOADPLACE", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "unpcalmeth"
      ? "L_BA019"
      : field === "qtyunit"
      ? "L_BA015"
      : field === "load_place"
      ? "L_LOADPLACE"
      : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  setData,
  reload,
}: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1600,
    height: 900,
  });
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const userName = loginResult ? loginResult.userName : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const pathname: string = window.location.pathname.replace("/", "");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  useEffect(() => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
    fetchMainGrid();
  }, [reload]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        rcvperson: defaultOption.find((item: any) => item.id === "rcvperson")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_HU005,R_ENDYN3",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );

      fetchQuery(postcdQueryStr, setpostcdListData);
      fetchQuery(dptcdQueryStr, setdptcdListData);
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [subselectedState, setSubSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});


  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [CopyWindowVisible3, setCopyWindowVisible3] = useState<boolean>(false);

  const [isInitSearch, setIsInitSearch] = useState(false);
  const [mainPgNum, setMainPgNum] = useState(1);
  const [subPgNum, setSubPgNum] = useState(1);
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if(name == "finexpdt" || name == "findt") {
      setFilters((prev) => ({
        ...prev,
        [name]: convertDateToStr(value),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

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

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
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

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };
  const setCustData2 = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      rcvcustcd: data.custcd,
      rcvcustnm: data.custnm,
    }));
  };
  const processApi = useApi();

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    attdatnum: "",
    chooses: 0,
    commcnt: 0,
    custcd: "",
    custnm: "",
    endyn: "",
    endyn2: "",
    files: "",
    findt: "",
    finexpdt: "",
    loadok: 0,
    person: "",
    personnm: "",
    rcvperson: "",
    insert_userid: "",
    readok: 0,
    recdt: new Date(),
    recdt2: "",
    recno: "",
    reqctns: "",
    reqdt: new Date(),
    slnctns: "",
    title: "",
  });

  //참조
  const parameters: Iparameters = {
    procedureName: "P_CM_A2000W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q1",
      "@p_orgdiv": "01",
      "@p_frdt": "",
      "@p_todt": "",
      "@p_person": "",
      "@p_rcvperson": "",
      "@p_endyn": "",
      "@p_title": "",
      "@p_loadyn": "",
      "@p_datnum": filters.recno,
      "@p_userid": userId,
      "@p_find_row_value": "",
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
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
        setIsInitSearch(true);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (workType != "N" && isInitSearch === false) {
      fetchMainGrid();
    }
  }, [filters]);

  // useEffect(() => {
  //   if (workType != "N" && isInitSearch === false) {
  //     fetchSubGrid();
  //   }
  // }, [subfilters]);

  useEffect(() => {
    if (workType === "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        attdatnum: data.attdatnum,
        chooses: data.chooses,
        commcnt: data.commcnt,
        custcd: data.custcd,
        custnm: data.custnm,
        endyn: data.endyn,
        endyn2: data.endyn2,
        files: data.files,
        findt: data.findt,
        finexpdt: data.finexpdt,
        loadok: data.loadok,
        person: data.person,
        personnm: data.personnm,
        rcvperson: data.rcvperson,
        readok: data.readok,
        insert_userid: data.insert_userid,
        recdt: toDate(data.recdt),
        recdt2: data.recdt2,
        recno: data.recno,
        reqctns: data.reqctns,
        reqdt: toDate(data.reqdt),
        slnctns: data.slnctns,
        title: data.title,
      }));
      
    }
  }, []);

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

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.num]: true });

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
    // setyn(true);
    setIfSelectFirstRow(false);
  };

    //메인 그리드 선택 이벤트 => 디테일 그리드 조회
    const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: subselectedState,
        dataItemKey: DATA_ITEM_KEY,
      });
      setSubSelectedState(newSelectedState);
    };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const onCopyWndClick3 = () => {
    setCopyWindowVisible3(true);
  };

  const setCopyData = (data: any) => {
    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0) return false;

    let seq = mainDataResult.total + deletedMainRows.length + 1;
    const rows = data.map((row: any) => {
      return {
        ...row,
        totamt: 0,
        num: seq++,
      };
    });

    try {
      rows.map((item: any) => {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, item],
            total: prev.total + 1,
          };
        });
      });
    } catch (e) {
      alert(e);
    }
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

const onSubSortChange = (e: any) => {
  setSubDataState((prev) => ({ ...prev, sort: e.sort }));
};

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    let valid = true;
    mainDataResult.data.map((item) => {
      if (item.qty == 0 && valid == true) {
        alert("수량을 채워주세요.");
        valid = false;
        return false;
      }
    });

    if (valid == true) {
      try {
        if (mainDataResult.data.length == 0) {
          throw findMessage(messagesData, "MA_A1000W_001");
        } else if (
          convertDateToStr(filters.recdt).substring(0, 4) < "1997" ||
          convertDateToStr(filters.recdt).substring(6, 8) > "31" ||
          convertDateToStr(filters.recdt).substring(6, 8) < "01" ||
          convertDateToStr(filters.recdt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "MA_A1000W_002");
        } else if (
          filters.person == null ||
          filters.person == "" ||
          filters.person == undefined
        ) {
          throw findMessage(messagesData, "MA_A1000W_003");
        } else {
          if (valid == true) {
            setData(mainDataResult.data, filters, deletedMainRows);
            deletedMainRows = [];
            if (workType == "N") {
              onClose();
            }
          }
        }
      } catch (e) {
        alert(e);
      }
    }
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });

    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setMainDataState({});
  };

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
    if (field == "chooses") {
      const newData = mainDataResult.data.map((item) =>
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
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
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

  const onAddClick = () => {
    let seq = mainDataResult.total + deletedMainRows.length + 1;
    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      amt: 0,
      chk: "",
      finyn: "",
      inexpdt: convertDateToStr(new Date()),
      insiz: "",
      itemacnt: "",
      itemcd: "",
      itemnm: "",
      load_place: "",
      location: "",
      orgdiv: "01",
      qty: 1,
      qtyunit: "",
      remark: "",
      reqkey: "",
      reqnum: "",
      reqrev: 0,
      reqseq: 0,
      taxamt: 0,
      totamt: 0,
      unp: 0,
      unpcalmeth: "",
      wonamt: 0,
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
  useState<boolean>(false);

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    if (!filters.attdatnum) {
      setUnsavedAttadatnums([data.attdatnum]);
    }

    setFilters((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  return (
    <>
      <Window
        title={workType === "N" ? "업무지시생성" : "업무지시정보"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
      >
        <GridContainerWrap>
          <GridContainer width={`70%`}>
            <GridTitleContainer>
              <GridTitle>상세정보</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
              <FormBox>
                {userId == filters.insert_userid || workType == "N" ? (
                  <tbody>
                    <tr>
                      <th>작성일</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="recdt"
                            value={filters.recdt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                            className="required"
                            placeholder=""
                          />
                        </div>
                      </td>
                      <th>작성자</th>
                      <td>
                        <Input
                          name="personnm"
                          type="text"
                          value={workType == "N" ? userName : filters.personnm}
                          className="readonly"
                        />
                      </td>
                      <th>수리자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="rcvperson"
                            value={filters.rcvperson}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="user_name"
                            valueField="user_id"
                            className="required"
                          />
                        )}
                      </td>
                      <th>완료요청일</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="reqdt"
                            value={filters.reqdt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                            placeholder=""
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>업체코드</th>
                      <td colSpan={3}>
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
                      <td colSpan={3}>
                        <Input
                          name="custnm"
                          type="text"
                          value={filters.custnm}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>제목</th>
                      <td colSpan={7}>
                        <Input
                          name="title"
                          type="text"
                          value={filters.title}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>요청내용</th>
                      <td colSpan={7}>
                        <TextArea
                          value={filters.reqctns}
                          name="reqctns"
                          rows={10}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={7}>
                        <Input
                          name="files"
                          type="text"
                          value={filters.files}
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
                ) : (
                  <tbody>
                    <tr>
                      <th>작성일</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="recdt"
                            value={filters.recdt}
                            format="yyyy-MM-dd"
                            disabled={true}
                            className="readonly"
                            placeholder=""
                          />
                        </div>
                      </td>
                      <th>작성자</th>
                      <td>
                        <Input
                          name="personnm"
                          type="text"
                          value={filters.personnm}
                          className="readonly"
                        />
                      </td>
                      <th>수리자</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="rcvperson"
                            value={filters.rcvperson}
                            bizComponentId="L_sysUserMaster_001"
                            bizComponentData={bizComponentData}
                            changeData={filterComboBoxChange}
                            className="readonly"
                            valueField="user_id"
                            textField="user_name"
                          />
                        )}
                      </td>
                      <th>완료요청일</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="reqdt"
                            value={filters.reqdt}
                            format="yyyy-MM-dd"
                            disabled={true}
                            className="readonly"
                            placeholder=""
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>업체코드</th>
                      <td colSpan={3}>
                        <Input
                          name="custcd"
                          type="text"
                          value={filters.custcd}
                          className="readonly"
                        />
                        <ButtonInInput>
                          <Button icon="more-horizontal" fillMode="flat" />
                        </ButtonInInput>
                      </td>
                      <th>업체명</th>
                      <td colSpan={3}>
                        <Input
                          name="custnm"
                          type="text"
                          value={filters.custnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>제목</th>
                      <td colSpan={7}>
                        <Input
                          name="title"
                          type="text"
                          value={filters.title}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>요청내용</th>
                      <td colSpan={7}>
                        <TextArea
                          value={filters.reqctns}
                          name="reqctns"
                          rows={10}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={7}>
                        <Input
                          name="files"
                          type="text"
                          value={filters.files}
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
                )}
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
          <GridContainer width={`30% - ${GAP}`}>
            <GridTitleContainer>
              <GridTitle>참조</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "40vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  rowstatus:
                    row.rowstatus == null ||
                    row.rowstatus == "" ||
                    row.rowstatus == undefined
                      ? ""
                      : row.rowstatus,
                  [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                })),
                mainDataState
              )}
              onDataStateChange={onMainDataStateChange}
              {...mainDataState}
              //선택 subDataState
              dataItemKey={DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onSelectionChange}
              //스크롤 조회기능
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
              onItemChange={onMainItemChange}
              cellRender={customCellRender}
              rowRender={customRowRender}
              editField={EDIT_FIELD}
            >
              <GridColumn field="rowstatus" title=" " width="50px" />
              <GridColumn
                field="user_name"
                title="사용자명"
                width="100px"
                footerCell={mainTotalFooterCell}
              />
              <GridColumn field="dptcd" title="부서코드" width="100px" />
              <GridColumn field="postcd" title="직위" width="90px" />
              <GridColumn
                field="chooses"
                title="참조"
                width="60px"
                cell={CheckBoxCell}
              />
              <GridColumn
                field="loadok"
                title="확인"
                width="60px"
                cell={CheckBoxCell}
              />
              <GridColumn field="readok" title="열람" width="60px" />
            </Grid>
          </GridContainer>
        </GridContainerWrap>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>처리영역</GridTitle>
          </GridTitleContainer>
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                {userId != filters.rcvperson ? (
                  <tr>
                    <th>처리여부</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="endyn"
                          value={filters.endyn}
                          bizComponentId="R_ENDYN3"
                          bizComponentData={bizComponentData}
                          className="readonly"
                        />
                      )}
                    </td>
                    <th>완료예정일</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="finexpdt"
                          format="yyyy-MM-dd"
                          className="readonly"
                          disabled={true}
                          placeholder=""
                        />
                      </div>
                    </td>
                    <th>완료일</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="findt"
                          format="yyyy-MM-dd"
                          className="readonly"
                          disabled={true}
                          placeholder=""
                        />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <th>처리여부</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="endyn"
                          value={filters.endyn}
                          bizComponentId="R_ENDYN3"
                          bizComponentData={bizComponentData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>완료예정일</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="finexpdt"
                          value={toDate(filters.finexpdt)}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          placeholder=""
                        />
                      </div>
                    </td>
                    <th>완료일</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="findt"
                          value={toDate(filters.findt)}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          placeholder=""
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </GridContainer>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "20vh" }}
            data={process(
              subDataResult.data.map((row) => ({
                ...row,
                // rowstatus:
                //   row.rowstatus == null ||
                //   row.rowstatus == "" ||
                //   row.rowstatus == undefined
                //     ? ""
                //     : row.rowstatus,
                // dptcd: dptcdListData.find(
                //   (item: any) => item.dptcd === row.dptcd
                // )?.dptnm,
                // postcd: postcdListData.find(
                //   (item: any) => item.sub_code === row.postcd
                // )?.code_name,
                [SELECTED_FIELD]: subselectedState[idGetter(row)], //선택된 데이터
              })),
              subDataState
            )}
            onDataStateChange={onSubDataStateChange}
            {...subDataState}
            //선택 subDataState
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={subDataResult.total}
            onScroll={onSubScrollHandler}
            //정렬기능
            sortable={true}
            onSortChange={onSubSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            // onItemChange={onMainItemChange}
            // cellRender={customCellRender}
            // rowRender={customRowRender}
            // editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn
              field="recdt"
              title="작성일"
              width="120px"
              cell={DateCell}
              footerCell={subTotalFooterCell}
            />
            <GridColumn field="insert_userid" title="작성자" width="120px" />
            <GridColumn field="comment" title="코멘트" width="1200px" />
          </Grid>
        </GridContainer>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              저장
            </Button>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
        />
      )}

      {CopyWindowVisible3 && (
        <CopyWindow3
          setVisible={setCopyWindowVisible3}
          setData={setCopyData}
          itemacnt={""}
        />
      )}
    </>
  );
};

export default CopyWindow;
