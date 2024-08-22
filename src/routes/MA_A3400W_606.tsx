import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
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
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
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
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState, sessionItemState } from "../store/atoms";
import { gridList } from "../store/columns/MA_A3400W_606_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const dateField = ["indt"];
const numberField = ["amt", "taxamt", "qty"];
var barcode = "";
let temp = 0;
let targetRowIndex: null | number = null;
var index = 0;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const MA_A3400W_606: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [isVisibleDetail, setIsVisableDetail] = useState(false);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebheight3] = useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".ButtonContainer3");
      height5 = getHeight(".FormBoxWrap");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setMobileHeight3(getDeviceHeight(true) - height - height4);
        setWebHeight((getDeviceHeight(true) - height) / 2 - height2);
        setWebHeight2(
          (getDeviceHeight(true) - height) / 2 - height3 - height5 - height4
        );
        setWebheight3(getDeviceHeight(true) - height - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3, isVisibleDetail]);

  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const companyCode = loginResult ? loginResult.companyCode : "";
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [swiper, setSwiper] = useState<SwiperCore>();

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pc = UseGetValueFromSessionItem("pc");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const processApi = useApi();

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA061", setBizComponentData);

  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
    }
  }, [bizComponentData]);

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
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

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

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onItemWndClick = () => {
    setItemWindowVisible(true);
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
    setInformation2((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  let sessionLocation = sessionItem.find(
    (sessionItem: { code: string }) => sessionItem.code == "location"
  )!.value;
  if (sessionLocation == "") sessionLocation = "01";

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "LIST",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    lotnum: "",
    reckey: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    finyn: "",
    pgNum: 1,
    isSearch: false,
  });

  const [Information, setInformation] = useState({
    lotnum: "",
    isSearch: false,
  });

  const [Information2, setInformation2] = useState({
    custcd: "",
    custnm: "",
    outdt: new Date(),
  });

  let gridRef: any = useRef(null);

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_MA_A3400W_606_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_lotnum": filters.lotnum,
        "@p_reckey": filters.reckey,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_finyn": filters.finyn,
        "@p_lotnum2": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
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
  const fetchLotNoGrid = async (Information: any) => {
    if (!permissions.view) return;
    barcode = "";
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_A3400W_606_Q",
      pageNumber: 1,
      pageSize: 1,
      parameters: {
        "@p_work_type": "LOTNUM",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_lotnum": filters.lotnum,
        "@p_reckey": filters.reckey,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_finyn": filters.finyn,
        "@p_lotnum2": Information.lotnum,
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

      if (totalRowCnt > 0) {
        let valid = false;
        mainDataResult2.data.map((item) => {
          rows.map(
            (item2: { lotnum: any; seq1: any; seq2: any; recdt: any }) => {
              if (
                item.lotnum == item2.lotnum &&
                item.seq1 == item2.seq1 &&
                item.seq2 == item2.seq2 &&
                item.recdt == item2.recdt &&
                valid == false
              ) {
                valid = true;
              }
            }
          );
        });

        if (valid == false) {
          rows.map((items: any) => {
            mainDataResult2.data.map((item) => {
              if (item.num > temp) {
                temp = item.num;
              }
            });

            const newDataItem = {
              [DATA_ITEM_KEY2]: ++temp,
              amt: items.amt,
              bnatur: items.bnatur,
              indt: items.indt,
              insiz: items.insiz,
              invoiceno: items.invoiceno,
              itemacnt: items.itemacnt,
              itemcd: items.itemcd,
              itemnm: items.itemnm,
              janqty: items.janqty,
              location: items.location,
              lotnum: items.lotnum,
              orgdiv: items.orgdiv,
              qty: items.qty,
              qty1: items.qty1,
              recdt: items.recdt,
              remark: items.remark,
              seq1: items.seq1,
              seq2: items.seq2,
              spec: items.spec,
              taxamt: items.taxamt,
              unp: items.unp,
              rowstatus: "N",
            };

            setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
            setMainDataResult2((prev) => {
              return {
                data: [newDataItem, ...prev.data],
                total: prev.total + 1,
              };
            });
          });
        } else {
          alert("동일한 행이 이미 추가되어있습니다.");
        }
      } else {
        barcode = "";
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setInformation((prev) => ({
      ...prev,
      lotnum: "",
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
      setFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      Information.isSearch &&
      Information.lotnum != "" &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(Information);
      setInformation((prev) => ({ ...prev, lotnum: "", isSearch: false })); // 한번만 조회되도록
      fetchLotNoGrid(deepCopiedFilters);
      barcode = "";
    }
  }, [Information, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //메인 그리드 선택 이벤트
  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A3400W_606_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A3400W_606_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
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

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (isVisibleDetail == true) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
    }
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

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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

  const onAddClick = (e: any) => {
    if (!permissions.save) return;
    if (mainDataResult2.data.length != 0) {
      if (Information2.custcd == "" || Information2.custnm == "") {
        alert("필수값을 입력해주세요.");
        return false;
      }
      let dataArr: any = {
        rowstatus_s: [],
        seq2_s: [],
        itemcd_s: [],
        itemnm_s: [],
        qty_s: [],
        unp_s: [],
        amt_s: [],
        lotnum_s: [],
        remark_s: [],
        inrecdt_s: [],
        inseq1_s: [],
        inseq2_s: [],
      };

      mainDataResult2.data.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq2 = "",
          itemcd = "",
          itemnm = "",
          qty = "",
          unp = "",
          amt = "",
          lotnum = "",
          remark = "",
          recdt = "",
          seq1 = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq2_s.push(seq2);
        dataArr.itemcd_s.push(itemcd);
        dataArr.itemnm_s.push(itemnm);
        dataArr.qty_s.push(qty);
        dataArr.unp_s.push(unp);
        dataArr.amt_s.push(amt);
        dataArr.lotnum_s.push(lotnum);
        dataArr.remark_s.push(remark);
        dataArr.inrecdt_s.push(recdt);
        dataArr.inseq1_s.push(seq1);
        dataArr.inseq2_s.push(seq2);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "N",
        orgdiv: sessionOrgdiv,
        location: filters.location,
        outdt: convertDateToStr(Information2.outdt),
        custcd: Information2.custcd,
        custnm: Information2.custnm,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        seq2_s: dataArr.seq2_s.join("|"),
        itemcd_s: dataArr.itemcd_s.join("|"),
        itemnm_s: dataArr.itemnm_s.join("|"),
        qty_s: dataArr.qty_s.join("|"),
        unp_s: dataArr.unp_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        lotnum_s: dataArr.lotnum_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        inrecdt_s: dataArr.inrecdt_s.join("|"),
        inseq1_s: dataArr.inseq1_s.join("|"),
        inseq2_s: dataArr.inseq2_s.join("|"),
        userid: userId,
        pc: pc,
        form_id: "MA_A3400W_606",
        companyCode: companyCode,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onAddClick2 = () => {
    const dataItem = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );

    let valid = false;
    mainDataResult2.data.map((item) => {
      dataItem.map((item2) => {
        if (
          item.lotnum == item2.lotnum &&
          item.seq1 == item2.seq1 &&
          item.seq2 == item2.seq2 &&
          item.recdt == item2.recdt &&
          valid == false
        ) {
          valid = true;
        }
      });
    });

    if (valid == false) {
      dataItem.map((items) => {
        mainDataResult2.data.map((item) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });

        const newDataItem = {
          [DATA_ITEM_KEY2]: ++temp,
          amt: items.amt,
          bnatur: items.bnatur,
          indt: items.indt,
          insiz: items.insiz,
          invoiceno: items.invoiceno,
          itemacnt: items.itemacnt,
          itemcd: items.itemcd,
          itemnm: items.itemnm,
          janqty: items.janqty,
          location: items.location,
          lotnum: items.lotnum,
          orgdiv: items.orgdiv,
          qty: items.qty,
          qty1: items.qty1,
          recdt: items.recdt,
          remark: items.remark,
          seq1: items.seq1,
          seq2: items.seq2,
          spec: items.spec,
          taxamt: items.taxamt,
          unp: items.unp,
          rowstatus: "N",
        };

        setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
        setMainDataResult2((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
      });
    } else {
      alert("동일한 행이 이미 추가되어있습니다.");
    }
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    location: "",
    outdt: "",
    custcd: "",
    custnm: "",
    rowstatus_s: "",
    seq2_s: "",
    itemcd_s: "",
    itemnm_s: "",
    qty_s: "",
    unp_s: "",
    amt_s: "",
    lotnum_s: "",
    remark_s: "",
    inrecdt_s: "",
    inseq1_s: "",
    inseq2_s: "",
    userid: userId,
    pc: pc,
    form_id: "MA_A3400W_606",
    serviceid: companyCode,
  });

  const para: Iparameters = {
    procedureName: "P_MA_A3400W_606_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": ParaData.location,
      "@p_outdt": ParaData.outdt,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_inrecdt_s": ParaData.inrecdt_s,
      "@p_inseq1_s": ParaData.inseq1_s,
      "@p_inseq2_s": ParaData.inseq2_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A3400W_606",
      "@p_serviceid": ParaData.serviceid,
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
      setValues2(false);
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
      setInformation2({
        custcd: "",
        custnm: "",
        outdt: new Date(),
      });
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: sessionOrgdiv,
        location: "",
        outdt: "",
        custcd: "",
        custnm: "",
        rowstatus_s: "",
        seq2_s: "",
        itemcd_s: "",
        itemnm_s: "",
        qty_s: "",
        unp_s: "",
        amt_s: "",
        lotnum_s: "",
        remark_s: "",
        inrecdt_s: "",
        inseq1_s: "",
        inseq2_s: "",
        userid: userId,
        pc: pc,
        form_id: "MA_A3400W_606",
        serviceid: companyCode,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

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
    if (field == "chk") {
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
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setMainDataResult((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  useEffect(() => {
    document.addEventListener("keydown", function (evt) {
      if (evt.code == "Enter" || evt.code == "NumpadEnter") {
        if (barcode != "") {
          setInformation((prev) => ({
            ...prev,
            lotnum: barcode,
            isSearch: true,
          }));
        }
      } else if (
        evt.code != "ShiftLeft" &&
        evt.code != "Shift" &&
        evt.code != "Enter" &&
        evt.code != "NumpadEnter"
      ) {
        barcode += evt.key;
      }
    });
    document.addEventListener("click", function (evt) {
      barcode = "";
    });
  }, []);

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
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>입고일자</th>
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
              <th>출고번호</th>
              <td>
                <Input
                  name="reckey"
                  type="text"
                  value={filters.reckey}
                  onChange={filterInputChange}
                />
              </td>
              <th>LOT번호</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
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
              <th>진행</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="finyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      {isMobile ? (
        <>
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
                  <GridTitle>Keeping</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="check-circle"
                      disabled={permissions.save ? false : true}
                    >
                      확정
                    </Button>
                    <Button
                      onClick={onDeleteClick2}
                      themeColor={"primary"}
                      fillMode="outline"
                      icon="minus"
                      title="행 삭제"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: mobileheight }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      itemacnt: itemacntListData.find(
                        (item: any) => item.sub_code == row.itemacnt
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                    })),
                    mainDataState2
                  )}
                  onDataStateChange={onMainDataStateChange2}
                  {...mainDataState2}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onMainSelectionChange2}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult2.total}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange2}
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
                                item.sortOrder == 0
                                  ? mainTotalFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>입력정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap
                  border={true}
                  style={{
                    height: mobileheight2,
                  }}
                >
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>업체코드</th>
                        <td>
                          <Input
                            name="custcd"
                            type="text"
                            value={Information2.custcd}
                            onChange={InputChange}
                            className="required"
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
                            value={Information2.custnm}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                        <th>출고일자</th>
                        <td>
                          <DatePicker
                            name="outdt"
                            value={Information2.outdt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            className="required"
                            placeholder=""
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <Button
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: mobileheight3 }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        itemacnt: itemacntListData.find(
                          (item: any) => item.sub_code == row.itemacnt
                        )?.code_name,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      mainDataState
                    )}
                    onDataStateChange={onMainDataStateChange}
                    {...mainDataState}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onMainSelectionChange}
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
                    <GridColumn
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell2}
                      cell={CheckBoxCell}
                    />
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
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          {isVisibleDetail && (
            <>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>요약정보</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: webheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        itemacnt: itemacntListData.find(
                          (item: any) => item.sub_code == row.itemacnt
                        )?.code_name,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      mainDataState
                    )}
                    onDataStateChange={onMainDataStateChange}
                    {...mainDataState}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onMainSelectionChange}
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
                    <GridColumn
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell2}
                      cell={CheckBoxCell}
                    />
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
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>입력정보</GridTitle>
                </GridTitleContainer>
                <FormBoxWrap border={true} className="FormBoxWrap">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>업체코드</th>
                        <td>
                          <Input
                            name="custcd"
                            type="text"
                            value={Information2.custcd}
                            onChange={InputChange}
                            className="required"
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
                            value={Information2.custnm}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                        <th>출고일자</th>
                        <td>
                          <DatePicker
                            name="outdt"
                            value={Information2.outdt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            className="required"
                            placeholder=""
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </>
          )}
          <GridContainer>
            <GridTitleContainer className="ButtonContainer3">
              <GridTitle>
                <Button
                  themeColor={"primary"}
                  fillMode={"flat"}
                  icon={isVisibleDetail ? "chevron-up" : "chevron-down"}
                  onClick={() => setIsVisableDetail((prev) => !prev)}
                ></Button>
                Keeping
              </GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="check-circle"
                  disabled={permissions.save ? false : true}
                >
                  확정
                </Button>
                <Button
                  onClick={onDeleteClick2}
                  themeColor={"primary"}
                  fillMode="outline"
                  icon="minus"
                  title="행 삭제"
                  disabled={permissions.save ? false : true}
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: isVisibleDetail ? webheight2 : webheight3 }}
              data={process(
                mainDataResult2.data.map((row) => ({
                  ...row,
                  itemacnt: itemacntListData.find(
                    (item: any) => item.sub_code == row.itemacnt
                  )?.code_name,
                  [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                })),
                mainDataState2
              )}
              onDataStateChange={onMainDataStateChange2}
              {...mainDataState2}
              //선택 기능
              dataItemKey={DATA_ITEM_KEY2}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onMainSelectionChange2}
              //스크롤 조회기능
              fixedScroll={true}
              total={mainDataResult2.total}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange2}
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
                            item.sortOrder == 0
                              ? mainTotalFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
            </Grid>
          </GridContainer>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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

export default MA_A3400W_606;
