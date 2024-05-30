import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../Cells/CheckBoxReadOnlyCell";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  isValidDate,
  setDefaultDate2,
  toDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import CommentsGrid from "../Grids/CommentsGrid";
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CopyWindow3 from "./BA_A0080W_Copy_Window";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reloadData(str: string): void;
  modal?: boolean;
  pathname: string;
};
let temp = 0;

type TdataArr = {
  user_id_s: string[];
  chooses_s: string[];
  loadok_s: string[];
  readok_s: string[];
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

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reloadData,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 920) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 920,
  });
  const onChangePostion = (position: any) => {
    setPosition(position);
  };

  const pc = UseGetValueFromSessionItem("pc");
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const userName = loginResult ? loginResult.userName : "";
  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
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
  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "new"
      );
      setFilters((prev) => ({
        ...prev,
        recdt: setDefaultDate2(customOptionData, "recdt"),
        rcvperson: defaultOption.find((item: any) => item.id == "rcvperson")
          ?.valueCode,
        reqdt: setDefaultDate2(customOptionData, "reqdt"),
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
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const [CopyWindowVisible3, setCopyWindowVisible3] = useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  interface ICustData {
    address: string;
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

  const processApi = useApi();

  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    attdatnum: "",
    chooses: 0,
    commcnt: 0,
    custcd: "",
    custnm: "",
    endyn: "N",
    endyn2: "",
    files: "",
    findt: null,
    finexpdt: null,
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
    reqdt: null,
    slnctns: "",
    title: "",
    isSearch: true,
    pgNum: 1,
  });
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //참조
    const parameters: Iparameters = {
      procedureName: "P_CM_A2000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q1",
        "@p_orgdiv": sessionOrgdiv,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_person": "",
        "@p_rcvperson": "",
        "@p_endyn": "",
        "@p_title": "",
        "@p_loadyn": "",
        "@p_datnum":
          workType == "U"
            ? data?.recno == undefined
              ? filters.recno
              : data?.recno
            : "",
        "@p_userid": userId,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (workType == "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        attdatnum: data.attdatnum,
        chooses: data.chooses,
        commcnt: data.commcnt,
        custcd: data.custcd,
        custnm: data.custnm,
        endyn: data.endyn == "" ? "N" : data.endyn,
        endyn2: data.endyn2,
        files: data.files,
        findt: isValidDate(data.findt)
          ? new Date(dateformat(data.findt))
          : null,
        finexpdt: isValidDate(data.finexpdt)
          ? new Date(dateformat(data.finexpdt))
          : null,
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
        reqdt: isValidDate(data.reqdt)
          ? new Date(dateformat(data.reqdt))
          : null,
        slnctns: data.slnctns,
        title: data.title,
        isSearch: true,
      }));
    }
  }, []);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const setCopyData = (data: any) => {
    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0) return false;

    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const rows = data.map((row: any) => {
      return {
        ...row,
        totamt: 0,
        [DATA_ITEM_KEY]: ++temp,
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

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    try {
      if (
        convertDateToStr(filters.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.recdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.recdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.recdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A2000W_001");
      } else if (
        filters.rcvperson == null ||
        filters.rcvperson == "" ||
        filters.rcvperson == undefined
      ) {
        throw findMessage(messagesData, "CM_A2000W_003");
      } else if (
        filters.title == null ||
        filters.title == "" ||
        filters.title == undefined
      ) {
        throw findMessage(messagesData, "CM_A2000W_002");
      } else {
        const dataItem = mainDataResult.data.filter((item: any) => {
          return (
            (item.rowstatus == "N" || item.rowstatus == "U") &&
            item.rowstatus !== undefined
          );
        });
        if (dataItem.length == 0) {
          setParaData((prev: any) => ({
            ...prev,
            workType: workType,
            recno: filters.recno,
            recdt: convertDateToStr(filters.recdt),
            person: filters.person,
            rcvperson: filters.rcvperson,
            endyn: filters.endyn,
            custcd: filters.custcd,
            title: filters.title,
            reqctns: filters.reqctns,
            attdatnum: filters.attdatnum,
            reqdt: convertDateToStr(filters.reqdt),
            finexpdt:
              filters.finexpdt == null
                ? ""
                : convertDateToStr(filters.finexpdt),
            findt: filters.findt == null ? "" : convertDateToStr(filters.findt),
          }));
        } else {
          let dataArr: TdataArr = {
            user_id_s: [],
            chooses_s: [],
            loadok_s: [],
            readok_s: [],
          };
          dataItem.forEach((item: any, idx: number) => {
            const {
              user_id = "",
              chooses = "",
              loadok = "",
              readok = "",
            } = item;

            dataArr.user_id_s.push(user_id);
            dataArr.chooses_s.push(
              chooses == true ? "Y" : chooses == false ? "N" : chooses
            );
            dataArr.loadok_s.push(
              loadok == true ? "Y" : loadok == false ? "N" : loadok
            );
            dataArr.readok_s.push(
              readok == true ? "Y" : readok == false ? "N" : readok
            );
          });
          setParaData((prev: any) => ({
            ...prev,
            workType: workType,
            recno: filters.recno,
            recdt: convertDateToStr(filters.recdt),
            person: filters.person,
            rcvperson: filters.rcvperson,
            endyn: filters.endyn,
            custcd: filters.custcd,
            title: filters.title,
            reqctns: filters.reqctns,
            attdatnum: filters.attdatnum,
            reqdt: convertDateToStr(filters.reqdt),
            finexpdt:
              filters.finexpdt == null
                ? ""
                : convertDateToStr(filters.finexpdt),
            findt: filters.findt == null ? "" : convertDateToStr(filters.findt),
            person2: dataArr.user_id_s.join("|"),
            chooses: dataArr.chooses_s.join("|"),
            loadok: dataArr.loadok_s.join("|"),
            readok: dataArr.readok_s.join("|"),
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    recno: "",
    recdt: "",
    person: "",
    rcvperson: "",
    endyn: "",
    custcd: "",
    title: "",
    reqctns: "",
    attdatnum: "",
    reqdt: "",
    finexpdt: "",
    findt: "",
    person2: "",
    chooses: "",
    loadok: "",
    readok: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A2000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_recno": ParaData.recno,
      "@p_recdt": ParaData.recdt,
      "@p_person": ParaData.workType == "N" ? userId : ParaData.person,
      "@p_rcvperson": ParaData.rcvperson,
      "@p_endyn": ParaData.endyn,
      "@p_custcd": ParaData.custcd,
      "@p_title": ParaData.title,
      "@p_reqctns": ParaData.reqctns,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_reqdt": ParaData.reqdt,
      "@p_finexpdt": ParaData.finexpdt,
      "@p_findt": ParaData.findt,
      "@p_person2": ParaData.person2,
      "@p_chooses": ParaData.chooses,
      "@p_loadok": ParaData.loadok,
      "@p_readok": ParaData.readok,
      "@p_form_id": "CM_A2000W",
      "@p_userid": userId,
      "@p_pc": pc,
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

    if (data.isSuccess == true) {
      reloadData(data.returnString);
      setUnsavedName([]);
      if (ParaData.workType == "N") {
        setVisible(false);
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
        }));
      }
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        recno: "",
        recdt: "",
        person: "",
        rcvperson: "",
        endyn: "",
        custcd: "",
        title: "",
        reqctns: "",
        attdatnum: "",
        reqdt: "",
        finexpdt: "",
        findt: "",
        person2: "",
        chooses: "",
        loadok: "",
        readok: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      (ParaData.recno != "" && ParaData.workType == "U") ||
      ParaData.workType == "N"
    ) {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

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

  const enterEdit = async (dataItem: any, field: string) => {
    if (
      field == "chooses" ||
      (field == "loadok" && userId == dataItem.user_id)
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
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

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });

      let data: any;
      setLoading(true);

      const parameters2: Iparameters = {
        procedureName: "P_CM_A2000W_S2",
        pageNumber: 0,
        pageSize: filters.pgSize,
        parameters: {
          "@p_work_type": "U",
          "@p_orgdiv": sessionOrgdiv,
          "@p_datnum": data?.recno == undefined ? filters.recno : data?.recno,
          "@p_person2": userId,
          "@p_chooses": "",
          "@p_loadok": "",
          "@p_form_id": "CM_A2000W",
        },
      };

      try {
        data = await processApi<any>("procedure", parameters2);
      } catch (error) {
        data = null;
      }
      setLoading(false);
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
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
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
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
        titles={workType == "N" ? "업무지시생성" : "업무지시정보"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <GridContainerWrap>
          <GridContainer width="70%">
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
                            type="new"
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
                          className="required"
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
          <GridContainer width={`calc(30% - ${GAP}px)`}>
            <GridTitleContainer>
              <GridTitle>참조</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "41vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  rowstatus:
                    row.rowstatus == null ||
                    row.rowstatus == "" ||
                    row.rowstatus == undefined
                      ? ""
                      : row.rowstatus,
                  dptcd: dptcdListData.find(
                    (item: any) => item.dptcd == row.dptcd
                  )?.dptnm,
                  postcd: postcdListData.find(
                    (item: any) => item.sub_code == row.postcd
                  )?.code_name,
                  chooses:
                    row.chooses == "Y"
                      ? true
                      : row.chooses == "N"
                      ? false
                      : row.chooses,
                  loadok:
                    row.loadok == "Y"
                      ? true
                      : row.loadok == "N"
                      ? false
                      : row.loadok,
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
              <GridColumn
                field="readok"
                title="열람"
                width="60px"
                cell={CheckBoxReadOnlyCell}
              />
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
                          value={filters.finexpdt}
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
                          value={filters.findt}
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
          <CommentsGrid
            ref_key={
              workType == "N"
                ? ""
                : data?.recno == undefined
                ? filters.recno
                : data?.recno
            }
            form_id={pathname}
            table_id={"CR100T"}
            style={{ height: "20vh" }}
          ></CommentsGrid>
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
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
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
          pathname={pathname}
        />
      )}
    </>
  );
};

export default CopyWindow;
