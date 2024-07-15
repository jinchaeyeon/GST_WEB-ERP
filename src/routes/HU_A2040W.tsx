import { DataResult, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import ExcelUploadButtons from "../components/Buttons/ExcelUploadButton";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  GetPropertyValueByName,
  handleKeyPressSearch,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/HU_A2040W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

type TdataArr = {
  row_status_s: string[];
  orgdiv_s: string[];
  dutydt_s: string[];
  prsnnum_s: string[];
  starttime_s: string[];
  endtime_s: string[];
  shh_s: string[];
  smm_s: string[];
  ehh_s: string[];
  emm_s: string[];
  remark_s: string[];
};

const DATA_ITEM_KEY = "num";
const numberField = ["numref1"];
const dateField = ["dutydt", "starttime", "endtime"];

let targetRowIndex: null | number = null;

let temp = 0;

var height = 0;
var height2 = 0;

const HU_A2040W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const location = UseGetValueFromSessionItem("location");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption("HU_A2040W", setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setWebHeight(getDeviceHeight(true) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //폼 메시지 조회
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages("HU_A2040W", setMessagesData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_dptcd_001, L_HU005", setBizComponentData);
  //공통코드 리스트 조회 ()
  const [dptcdListData, setDptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setDptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    dutydt: new Date(),
    prsnnum: "",
    procMethod: "A",
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
      procedureName: "P_HU_A2040W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_dutydt": convertDateToStr(filters.dutydt),
        "@p_prsnnum": filters.prsnnum,
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
            (row: any) => row.prsnnum == filters.find_row_value
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
            : rows.find((row: any) => row.prsnnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
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
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const [ParaData, setParaData] = useState({
    row_status_s: "",
    orgdiv_s: "",
    dutydt_s: "",
    prsnnum_s: "",
    starttime_s: "",
    endtime_s: "",
    shh_s: "",
    smm_s: "",
    ehh_s: "",
    emm_s: "",
    remark_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A2040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_orgdiv": orgdiv,
      "@p_orgdiv_s": ParaData.orgdiv_s,
      "@p_location": location,
      "@p_dutydt": convertDateToStr(filters.dutydt),
      "@p_work_type": "U",
      "@p_rowstatus_s": ParaData.row_status_s,
      "@p_dutydt_s": ParaData.dutydt_s,
      "@p_prsnnum_s": ParaData.prsnnum_s,
      "@p_starttime_s": ParaData.starttime_s,
      "@p_endtime_s": ParaData.endtime_s,
      "@p_shh_s": ParaData.shh_s,
      "@p_smm_s": ParaData.smm_s,
      "@p_ehh_s": ParaData.ehh_s,
      "@p_emm_s": ParaData.emm_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_company_code": companyCode,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A2040W",
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: prev.pgNum,
        isSearch: true,
      }));

      setParaData({
        row_status_s: "",
        orgdiv_s: "",
        dutydt_s: "",
        prsnnum_s: "",
        starttime_s: "",
        endtime_s: "",
        shh_s: "",
        smm_s: "",
        ehh_s: "",
        emm_s: "",
        remark_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.row_status_s != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const search = () => {
    try {
      if (
        convertDateToStr(filters.dutydt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.dutydt).substring(6, 8) > "31" ||
        convertDateToStr(filters.dutydt).substring(6, 8) < "01" ||
        convertDateToStr(filters.dutydt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_A2040W_005");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;
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

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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
  const onSaveClick = () => {
    if (!permissions.save) return;

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0) return false;

    let dataArr: TdataArr = {
      row_status_s: [],
      orgdiv_s: [],
      dutydt_s: [],
      prsnnum_s: [],
      starttime_s: [],
      endtime_s: [],
      shh_s: [],
      smm_s: [],
      ehh_s: [],
      emm_s: [],
      remark_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        orgdiv = "",
        dutydt = "",
        prsnnum = "",
        starttime = "",
        endtime = "",
        stime = "",
        etime = "",
        remark = "",
      } = item;
      const [shh = "", smm = ""] = stime
        ? stime.split(":").map((str: string) => str.trim())
        : ["", ""];
      const [ehh = "", emm = ""] = etime
        ? etime.split(":").map((str: string) => str.trim())
        : ["", ""];

      dataArr.row_status_s.push(rowstatus);
      dataArr.orgdiv_s.push(orgdiv);
      dataArr.dutydt_s.push(dutydt);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.starttime_s.push(starttime);
      dataArr.endtime_s.push(endtime);
      dataArr.shh_s.push(shh);
      dataArr.smm_s.push(smm);
      dataArr.ehh_s.push(ehh);
      dataArr.emm_s.push(emm);
      dataArr.remark_s.push(remark);
    });
    setParaData((prev) => ({
      ...prev,
      row_status_s: dataArr.row_status_s.join("|"),
      orgdiv_s: dataArr.orgdiv_s.join("|"),
      dutydt_s: dataArr.dutydt_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      starttime_s: dataArr.starttime_s.join("|"),
      endtime_s: dataArr.endtime_s.join("|"),
      shh_s: dataArr.shh_s.join("|"),
      smm_s: dataArr.smm_s.join("|"),
      ehh_s: dataArr.ehh_s.join("|"),
      emm_s: dataArr.emm_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const saveExcel = (jsonArr: any[]) => {
    if (!permissions.save) return;

    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      setLoading(true);
      let valid = true;
      jsonArr.map((item: any) => {
        Object.keys(item).map((items: any) => {
          if (
            items != "근무일자" &&
            items != "사번" &&
            items != "시작일자" &&
            items != "종료일자" &&
            items != "시작시간" &&
            items != "시작분" &&
            items != "종료시간" &&
            items != "종료분" &&
            items != "비고"
          ) {
            valid = false;
          }
        });
      });
      if (valid == true) {
        mainDataResult.data.map((item) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });

        let isSuccess: boolean = true;
        let errorMessage: string = "";
        let returnString: string = "";
        jsonArr.forEach(async (item: any, idx: number) => {
          const {
            근무일자 = "",
            사번 = "",
            시작일자 = "",
            종료일자 = "",
            시작시간 = "",
            시작분 = "",
            종료시간 = "",
            종료분 = "",
            비고 = "",
          } = item;

          const para: Iparameters = {
            procedureName: "P_HU_A2040W_S",
            pageNumber: 1,
            pageSize: 10,
            parameters: {
              "@p_work_type": "EXCEL",
              "@p_orgdiv": orgdiv,
              "@p_location": location,
              "@p_dutydt": convertDateToStr(filters.dutydt),
              "@p_rowstatus_s": "N",
              "@p_orgdiv_s": orgdiv,
              "@p_dutydt_s": 근무일자,
              "@p_prsnnum_s": 사번,
              "@p_starttime_s": 시작일자,
              "@p_endtime_s": 종료일자,
              "@p_shh_s": 시작시간,
              "@p_smm_s": 시작분,
              "@p_ehh_s": 종료시간,
              "@p_emm_s": 종료분,
              "@p_remark_s": 비고,
              "@p_company_code": companyCode,
              "@p_userid": userId,
              "@p_pc": pc,
              "@p_form_id": "HU_A2040W",
            },
          };

          let data: any;

          try {
            data = await processApi<any>("procedure", para);
          } catch (error) {
            data = null;
          }

          if (data.isSuccess == true) {
            returnString = data.returnString;
          } else {
            console.log("[오류 발생]");
            console.log(data);

            isSuccess = false;
            errorMessage = data.resultMessage;
          }
        });

        setFilters((prev) => ({
          ...prev,
          find_row_value: returnString,
          isSearch: true,
        }));

        if (!isSuccess) {
          alert(errorMessage);
        } else {
          alert(findMessage(messagesData, "HU_A2040W_004"));
        }
      } else {
        alert("양식이 맞지 않습니다.");
      }
      setLoading(false);
    }
  };

  const onConnectionClick = async () => {
    if (!permissions.save) return;

    setLoading(true);
    let data;

    const para: Iparameters = {
      procedureName: "P_HU_A2040W_S",
      pageNumber: 1,
      pageSize: 10,
      parameters: {
        "@p_work_type": "CONN",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_dutydt": convertDateToStr(filters.dutydt),
        "@p_rowstatus_s": "N",
        "@p_orgdiv_s": orgdiv,
        "@p_dutydt_s": "",
        "@p_prsnnum_s": "",
        "@p_starttime_s": "",
        "@p_endtime_s": "",
        "@p_shh_s": "",
        "@p_smm_s": "",
        "@p_ehh_s": "",
        "@p_emm_s": "",
        "@p_remark_s": "",
        "@p_company_code": companyCode,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "HU_A2040W",
      },
    };

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    setLoading(false);

    if (!data.isSuccess) {
      alert(data.errorMessage);
    } else {
      alert(findMessage(messagesData, "HU_A2040W_004"));
    }
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const customCellRender = (td: any, props: any) => {
    if (props.field === "remark") {
      return (
        <CellRender
          originalProps={props}
          td={td}
          enterEdit={enterEdit}
          editField={EDIT_FIELD}
        />
      );
    }
    return <td>{props.dataItem[props.field]}</td>;
  };

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
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

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>일근태업로드</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A2040W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>근태일자</th>
              <td>
                <DatePicker
                  name="dutydt"
                  value={filters.dutydt}
                  format="yyyy-MM-dd"
                  placeholder=""
                  className="required"
                  onChange={filterInputChange}
                />
              </td>
              <th>이름</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prsnnum"
                    value={filters.prsnnum}
                    customOptionData={customOptionData}
                    changeData={ComboBoxChange}
                    textField="prsnnm"
                    valueField="prsnnum"
                  />
                )}
              </td>
              <th>처리방법</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="procMethod"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>기본정보</GridTitle>
          <ButtonContainer style={{ justifyContent: "space-between" }}>
            {!isMobile && filters.procMethod == "B" && (
              <div>
                <ExcelUploadButtons
                  saveExcel={saveExcel}
                  permissions={permissions}
                  disabled={permissions.save ? false : true}
                  style={{}}
                />
                <Button
                  title="Export Excel"
                  onClick={onAttachmentsWndClick}
                  icon="file"
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.view ? false : true}
                >
                  엑셀양식
                </Button>
              </div>
            )}
            {!isMobile && filters.procMethod == "T" && (
              <Button
                title="불러오기"
                onClick={onConnectionClick}
                icon="upload"
                themeColor={"primary"}
                disabled={permissions.save ? false : true}
              >
                불러오기
              </Button>
            )}
            <Button
              onClick={onSaveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
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
          fileName="일근태업로드"
        >
          <Grid
            style={{
              height: !isMobile ? webheight : mobileheight,
            }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd == row.dptcd
                )?.dptnm,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code == row.postcd
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
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]
                ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                ?.map(
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
                            : undefined
                        }
                        footerCell={
                          item.sortOrder == 0 ? mainTotalFooterCell : undefined
                        }
                      ></GridColumn>
                    )
                )}
          </Grid>
        </ExcelExport>
      </GridContainer>
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          para={"HU_A2040W"}
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
export default HU_A2040W;
