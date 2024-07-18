import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading, loginResultState } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
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
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  numberWithCommas,
  setDefaultDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  data?: Idata;
  setVisible(t: boolean): void;
  setData(t: string): void;
  modal?: boolean;
  pathname: string;
};

type TdataArr = {
  notenum_s: string[];
  janamt_s: string[];
  enddt_s: string[];
  custcd_s: string[];
  custnm_s: string[];
  remark1_s: string[];
};

type Idata = {
  location: string;
  acntdt: string;
  position: string;
  inoutdiv: string;
  files: string;
  attdatnum: string;
  acseq1: number;
  ackey: string;
  actdt: string;
  apperson: string;
  approvaldt: string;
  closeyn: string;
  consultdt: string;
  consultnum: number;
  custnm: string;
  dptcd: string;
  inputpath: string;
  remark3: string;
  slipdiv: string;
  sumslipamt: number;
  sumslipamt_1: number;
  sumslipamt_2: number;
  bizregnum: string;
  mngamt: number;
  rate: number;
  usedptcd: string;
  propertykind: string;
  evidentialkind: string;
  creditcd: string;
  reason_intax_deduction: string;
};
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
const CopyWindow = ({
  data,
  setData,
  setVisible,
  modal = false,
  pathname,
}: IWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1500) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 700) / 2,
    width: isMobile == true ? deviceWidth : 1500,
    height: isMobile == true ? deviceHeight : 700,
  });

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
      height3 = getHeight(".BottomContainer"); //하단 버튼부분
      height4 = getHeight(".WindowFormBoxWrap");

      setMobileHeight(
        getWindowDeviceHeight(false, deviceHeight) - height - height2
      );
      setMobileHeight2(
        getWindowDeviceHeight(false, deviceHeight) - height - height2 - height3
      );
      setWebHeight(
        getWindowDeviceHeight(false, position.height) -
          height -
          height2 -
          height3 -
          height4
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) -
        height -
        height2 -
        height3 -
        height4
    );
  };

  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const pc = UseGetValueFromSessionItem("pc");
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
  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        notests: defaultOption.find((item: any) => item.id == "notests")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR010, L_AC023T",
    //공정, 관리항목리스트
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [mngItemListData, setMngItemListData] = React.useState([
    { mngitemcd: "", mngitemnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
      setMngItemListData(getBizCom(bizComponentData, "L_AC023T"));
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

  const onClose = () => {
    setVisible(false);
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

  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    notenum: "",
    notediv: "2",
    frdt: new Date(),
    todt: new Date(),
    //입력
    custcd: "",
    custnm: "",
    notests: "",
    date: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_AC_P1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_notenum": filters.notenum,
        "@p_notediv": filters.notediv,
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
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
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

  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  let gridRef: any = useRef(null);

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

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
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

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "W",
    orgdiv: sessionOrgdiv,
    location: "",
    dptcd: "",
    actdt: "",
    notests: "",
    custcd: "",
    custnm: "",
    notediv: "",
    notenum_s: "",
    janamt_s: "",
    enddt_s: "",
    custcd_s: "",
    custnm_s: "",
    remark1_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_P1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_dptcd": ParaData.dptcd,
      "@p_actdt": ParaData.actdt,
      "@p_notests": ParaData.notests,
      "@p_custcd": ParaData.custcd,
      "@p_notediv": ParaData.notediv,
      "@p_notenum_s": ParaData.notenum_s,
      "@p_janamt_s": ParaData.janamt_s,
      "@p_enddt_s": ParaData.enddt_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_custnm_s": ParaData.custnm_s,
      "@p_remark1_s": ParaData.remark1_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_P1000W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "W" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    if (!permissions.save) return;
    let valid2 = true;
    let valid3 = true;
    const newData = mainDataResult.data.filter((item: any) => item.chk == true);

    if (
      (filters.notests == "1" || filters.notests == "4") &&
      filters.custcd != ""
    ) {
      valid2 = false;
    }
    if (
      (filters.notests == "2" ||
        filters.notests == "3" ||
        filters.notests == "5") &&
      filters.custcd == ""
    ) {
      valid3 = false;
    }

    try {
      if (newData.length == 0) {
        throw findMessage(messagesData, "AC_A1000W_001");
      } else if (valid2 != true) {
        throw findMessage(messagesData, "AC_A1000W_004");
      } else if (valid3 != true) {
        throw findMessage(messagesData, "AC_A1000W_003");
      } else {
        let dataArr: TdataArr = {
          notenum_s: [],
          janamt_s: [],
          enddt_s: [],
          custcd_s: [],
          custnm_s: [],
          remark1_s: [],
        };

        newData.forEach((item: any, idx: number) => {
          const {
            notenum = "",
            janamt = "",
            enddt = "",
            custcd = "",
            custnm = "",
            remark1 = "",
          } = item;
          dataArr.notenum_s.push(notenum);
          dataArr.janamt_s.push(janamt);
          dataArr.enddt_s.push(enddt);
          dataArr.custcd_s.push(custcd);
          dataArr.custnm_s.push(custnm);
          dataArr.remark1_s.push(remark1);
        });
        setParaData((prev) => ({
          ...prev,
          workType: "N",
          orgdiv: sessionOrgdiv,
          location: sessionLocation,
          dptcd: newData[0].dptcd,
          actdt: convertDateToStr(filters.date),
          notests: filters.notests,
          custcd: filters.custcd,
          custnm: filters.custnm,
          notediv: filters.notediv,
          notenum_s: dataArr.notenum_s.join("|"),
          janamt_s: dataArr.janamt_s.join("|"),
          enddt_s: dataArr.enddt_s.join("|"),
          custcd_s: dataArr.custcd_s.join("|"),
          custnm_s: dataArr.custnm_s.join("|"),
          remark1_s: dataArr.remark1_s.join("|"),
        }));
      }
    } catch (e) {
      alert(e);
    }
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
      resetAllGrid();
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "W",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        actdt: "",
        notests: "",
        custcd: "",
        custnm: "",
        notediv: "",
        notenum_s: "",
        janamt_s: "",
        enddt_s: "",
        custcd_s: "",
        custnm_s: "",
        remark1_s: "",
      });
      setData(data.returnString);
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
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
    let valid = true;
    if (field == "chk" || field == "janamt") {
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
                chk:
                  typeof item.chk == "boolean"
                    ? item.chk
                    : item.chk == "Y"
                    ? true
                    : false,
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
      setMainDataResult((prev) => {
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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B1300W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B1300W_001");
      } else {
        setPage(initialPageState); // 페이지 초기화
        resetAllGrid(); // 데이터 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        if (swiper && isMobile) {
          swiper.slideTo(1);
        }
      }
    } catch (e) {
      alert(e);
    }
  };
  return (
    <>
      <Window
        titles={"지급어음 대체처리"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <TitleContainer
          className="WindowTitleContainer"
          style={{ float: isMobile ? "none" : "right" }}
        >
          <ButtonContainer>
            <Button
              onClick={() => search()}
              icon="search"
              themeColor={"primary"}
              disabled={permissions.view ? false : true}
            >
              조회
            </Button>
          </ButtonContainer>
        </TitleContainer>
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
                <FormBoxWrap
                  className="WindowFormBoxWrap"
                  style={{
                    height: mobileheight,
                  }}
                >
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>[조회]</th>
                        <th>만기일자</th>
                        <td>
                          <CommonDateRangePicker
                            value={{
                              start: filters.frdt,
                              end: filters.todt,
                            }}
                            onChange={(e: {
                              value: { start: any; end: any };
                            }) =>
                              setFilters((prev) => ({
                                ...prev,
                                frdt: e.value.start,
                                todt: e.value.end,
                              }))
                            }
                            className="required"
                          />
                        </td>
                        <th>거래처코드</th>
                        <td>
                          <Input
                            name="custcd"
                            type="text"
                            value={""}
                            onChange={filterInputChange}
                          />
                          <ButtonInInput>
                            <Button
                              type={"button"}
                              onClick={onCustWndClick}
                              icon="more-horizontal"
                              fillMode="flat"
                            />
                          </ButtonInInput>
                        </td>
                        <th>거래처명</th>
                        <td>
                          <Input
                            name="custnm"
                            type="text"
                            value={""}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>[입력]</th>
                        <th>대체일자</th>
                        <td>
                          <div className="filter-item-wrap">
                            <DatePicker
                              name="date"
                              value={filters.date}
                              format="yyyy-MM-dd"
                              onChange={filterInputChange}
                              className="required"
                              placeholder=""
                            />
                          </div>
                        </td>
                        <th>상태</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="notests"
                              value={filters.notests}
                              customOptionData={customOptionData}
                              changeData={filterComboBoxChange}
                              className="required"
                            />
                          )}
                        </td>
                        <th>대체거래처코드</th>
                        <td>
                          <Input
                            name="custcd"
                            type="text"
                            value={filters.custcd}
                            onChange={filterInputChange}
                          />
                          <ButtonInInput>
                            <Button
                              type={"button"}
                              onClick={onCustWndClick}
                              icon="more-horizontal"
                              fillMode="flat"
                            />
                          </ButtonInInput>
                        </td>
                        <th>대체거래처명</th>
                        <td>
                          <Input
                            name="custnm"
                            type="text"
                            value={filters.custnm}
                            className="readonly"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer
                style={{
                  overflow: "auto",
                }}
              >
                <Grid
                  style={{ height: mobileheight2 }}
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
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell2}
                    cell={CheckBoxCell}
                  />
                  <GridColumn
                    field="enddt"
                    title="만기일자"
                    width="120px"
                    cell={DateCell}
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="notenum" title="어음번호" width="300px" />
                  <GridColumn field="custnm" title="업체명" width="350px" />
                  <GridColumn field="bankcd" title="지급은행" width="300px" />
                  <GridColumn
                    field="janamt"
                    title="금액"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                    width="150px"
                  />
                  <GridColumn
                    field="pubdt"
                    title="발행일자"
                    cell={DateCell}
                    width="120px"
                  />
                </Grid>
                <BottomContainer className="BottomContainer">
                  <ButtonContainer>
                    {permissions.save && (
                      <Button themeColor={"primary"} onClick={selectData}>
                        저장
                      </Button>
                    )}
                    <Button
                      themeColor={"primary"}
                      fillMode={"outline"}
                      onClick={onClose}
                    >
                      닫기
                    </Button>
                  </ButtonContainer>
                </BottomContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <FormBoxWrap className="WindowFormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th>[조회]</th>
                    <th>만기일자</th>
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
                    <th>거래처코드</th>
                    <td>
                      <Input
                        name="custcd"
                        type="text"
                        value={""}
                        onChange={filterInputChange}
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onCustWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>거래처명</th>
                    <td>
                      <Input
                        name="custnm"
                        type="text"
                        value={""}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>[입력]</th>
                    <th>대체일자</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="date"
                          value={filters.date}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          className="required"
                          placeholder=""
                        />
                      </div>
                    </td>
                    <th>상태</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="notests"
                          value={filters.notests}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          className="required"
                        />
                      )}
                    </td>
                    <th>대체거래처코드</th>
                    <td>
                      <Input
                        name="custcd"
                        type="text"
                        value={filters.custcd}
                        onChange={filterInputChange}
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onCustWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>대체거래처명</th>
                    <td>
                      <Input
                        name="custnm"
                        type="text"
                        value={filters.custnm}
                        className="readonly"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <GridContainer
              style={{
                overflow: "auto",
              }}
            >
              <Grid
                style={{ height: webheight }}
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
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell2}
                  cell={CheckBoxCell}
                />
                <GridColumn
                  field="enddt"
                  title="만기일자"
                  width="120px"
                  cell={DateCell}
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn field="notenum" title="어음번호" width="300px" />
                <GridColumn field="custnm" title="업체명" width="350px" />
                <GridColumn field="bankcd" title="지급은행" width="300px" />
                <GridColumn
                  field="janamt"
                  title="금액"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                  width="150px"
                />
                <GridColumn
                  field="pubdt"
                  title="발행일자"
                  cell={DateCell}
                  width="120px"
                />
              </Grid>
            </GridContainer>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                {permissions.save && (
                  <Button themeColor={"primary"} onClick={selectData}>
                    저장
                  </Button>
                )}
                <Button
                  themeColor={"primary"}
                  fillMode={"outline"}
                  onClick={onClose}
                >
                  닫기
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </>
        )}
      </Window>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
        />
      )}
    </>
  );
};

export default CopyWindow;
