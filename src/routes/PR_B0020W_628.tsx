import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  FormBoxFNF,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  setDefaultDate,
  toDate2,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
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
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/PR_B0020W_628_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

type TdataArr = {
  ordnum_s: string[];
  ordseq_s: string[];
  addrgb_s: string[];
};
let targetRowIndex: null | number = null;
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var index = 0;
const dateField = ["dlvdt"];
const numberField = ["qty", "sqty", "specsize", "prtqty"];
const numberField2 = ["qty", "sqty"];

const PR_B0020W_628: React.FC = () => {
  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const processApi = useApi();
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionCustcd = UseGetValueFromSessionItem("custcd");
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const sessionpc = UseGetValueFromSessionItem("pc");
  const [addstate, setAddstate] = useState(false);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_Shlife,R_Printgb, L_BA002_628, L_BA065_628, L_BA066",
    //수량단위, 발주구분
    setBizComponentData
  );
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null && bizComponentData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".FormBoxWrap");
      height5 = getHeight(".ButtonContainer3");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setMobileHeight3(getDeviceHeight(true) - height - height5);
        setWebHeight(getDeviceHeight(true) * 1.3 - height - height2);
        setWebHeight2(
          getDeviceHeight(true) * 1.3 - height - height3 - height4 - GAP
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, bizComponentData]);

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
        mydiv: defaultOption.find((item: any) => item.id == "mydiv")?.valueCode,
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        prodiv: defaultOption.find((item: any) => item.id == "prodiv")
          ?.valueCode,
        kind: defaultOption.find((item: any) => item.id == "kind")?.valueCode,
        itemsts: defaultOption.find((item: any) => item.id == "itemsts")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        isSearch: true,
      }));
      setInformation2((prev) => ({
        ...prev,
        addr: defaultOption.find((item: any) => item.id == "addr")?.valueCode,
      }));
    }
  }, [customOptionData]);

  //공통코드 리스트 조회 ()
  const [itemtypeListData, setitemtypeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [originListData, setoriginListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setitemtypeListData(getBizCom(bizComponentData, "L_BA066"));
      setoriginListData(getBizCom(bizComponentData, "L_BA065_628"));
    }
  }, [bizComponentData]);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    custcd: sessionCustcd,
    mydiv: "",
    finyn: "",
    prodiv: "",
    kind: "",
    itemsts: "",
    location: "",
    itemnm: "",
    custnm2: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "",
    ordnum: "",
    ordseq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

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

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

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

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange2 = (e: any) => {
    const { value, name } = e.target;

    setInformation2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange2 = (e: any) => {
    const { name, value } = e;

    setInformation2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "요약정보";
      optionsGridOne.sheets[1].title = "상세정보";
      _export.save(optionsGridOne);
    }
  };

  const resetAllGrid = () => {
    setAddstate(true);
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setInformation({
      workType: "",
      Ingredients: "",
      addrgb: "",
      addrgb_addr: "",
      addrgb_custnm: "",
      color: "",
      custnm: "",
      cycletime_min: 0,
      dwgno: "",
      extra_field1: "",
      extra_field2: "",
      extra_field3: "",
      extra_field5: "",
      extra_field6: "",
      extra_field7: null,
      ingredgb: "",
      insiz: "",
      itemnm: "",
      itemnm2: "",
      maker: "",
      moddt: "",
      ordnum: "",
      ordseq: 0,
      orgdiv: "",
      poregnum: null,
      print_pc: "",
      print_userid: "",
      project: "",
      prtdt: null,
      prtqty: 0,
      qty: 0,
      qtyunit: "",
      rcvcustnm2: "",
      remark: "",
      remark1: "",
      saler: "",
      seq: 0,
      spec: "",
      specnum: "",
      subaddr: "",
      sublc: "",
      subnm: "",
      tagarea: "",
      tagtemp1: "",
      tagtemp2: "",
      tagtemp3: "",
      tagtemp4: "",
      tagtemp5: "",
      totqty: 10,
      sealno: "",
    });

    setInformation2({
      shlife: null,
      addr: "",
    });
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_B0020W_628_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_B0020W_628_001");
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: "",
        }));
      }
      if (swiper && isMobile) {
        swiper.slideTo(0);
      }
    } catch (e) {
      alert(e);
    }
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

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    workType: "",
    Ingredients: "",
    addrgb: "",
    addrgb_addr: "",
    addrgb_custnm: "",
    color: "",
    custnm: "",
    cycletime_min: 0,
    dwgno: "",
    extra_field1: "",
    extra_field2: "",
    extra_field3: "",
    extra_field5: "",
    extra_field6: "",
    extra_field7: null,
    ingredgb: "",
    insiz: "",
    itemnm: "",
    itemnm2: "",
    maker: "",
    moddt: "",
    ordnum: "",
    ordseq: 0,
    orgdiv: "",
    poregnum: null,
    print_pc: "",
    print_userid: "",
    project: "",
    prtdt: null,
    prtqty: 0,
    qty: 0,
    qtyunit: "",
    rcvcustnm2: "",
    remark: "",
    remark1: "",
    saler: "",
    seq: 0,
    spec: "",
    specnum: "",
    subaddr: "",
    sublc: "",
    subnm: "",
    tagarea: "",
    tagtemp1: "",
    tagtemp2: "",
    tagtemp3: "",
    tagtemp4: "",
    tagtemp5: "",
    totqty: 10,
    sealno: "",
  });

  const [Information2, setInformation2] = useState<{ [name: string]: any }>({
    shlife: null,
    addr: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_B0020W_628_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_custcd": filters.custcd,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custnm2": filters.custnm2,
        "@p_itemsts": filters.itemsts,
        "@p_location": filters.location,
        "@p_prodiv": filters.prodiv,
        "@p_finyn": filters.finyn,
        "@p_kind": filters.kind,
        "@p_itemnm": filters.itemnm,
        "@p_ordnum": "",
        "@p_ordseq": 0,
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
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.ordkey == filters.find_row_value
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
            : rows.find((row: any) => row.ordkey == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          if (selectedRow.cnt > 0) {
            setFilters2((prev) => ({
              ...prev,
              orgdiv: selectedRow.orgdiv,
              ordnum: selectedRow.ordnum,
              ordseq: selectedRow.ordseq,
              isSearch: true,
              pgNum: 1,
            }));
          } else {
            setParaData2({
              workType: "New",
              orgdiv: sessionOrgdiv,
              dlvdt: selectedRow.dlvdt,
              ordsiz: selectedRow.ordsiz,
              custnm: selectedRow.custnm,
              itemcd: selectedRow.itemcd,
              rcvcustnm: selectedRow.rcvcustnm,
              specsize: selectedRow.specsize,
              qty: selectedRow.qty,
              custabbr: selectedRow.custabbr,
              itemsts: selectedRow.itemsts,
              itemdiv: selectedRow.itemdiv,
              inspecsize: selectedRow.inspecsize,
              custcd: selectedRow.custcd,

              ordnum: selectedRow.ordnum,
              ordseq: selectedRow.ordseq,
            });
          }
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          if (rows[0].cnt > 0) {
            setFilters2((prev) => ({
              ...prev,
              orgdiv: rows[0].orgdiv,
              ordnum: rows[0].ordnum,
              ordseq: rows[0].ordseq,
              isSearch: true,
              pgNum: 1,
            }));
          } else {
            setParaData2({
              workType: "New",
              orgdiv: sessionOrgdiv,
              dlvdt: rows[0].dlvdt,
              ordsiz: rows[0].ordsiz,
              custnm: rows[0].custnm,
              itemcd: rows[0].itemcd,
              rcvcustnm: rows[0].rcvcustnm,
              specsize: rows[0].specsize,
              qty: rows[0].qty,
              custabbr: rows[0].custabbr,
              itemsts: rows[0].itemsts,
              itemdiv: rows[0].itemdiv,
              inspecsize: rows[0].inspecsize,
              custcd: rows[0].custcd,

              ordnum: rows[0].ordnum,
              ordseq: rows[0].ordseq,
            });
          }
        }
      } else {
        setInformation({
          workType: "",
          Ingredients: "",
          addrgb: "",
          addrgb_addr: "",
          addrgb_custnm: "",
          color: "",
          custnm: "",
          cycletime_min: 0,
          dwgno: "",
          extra_field1: "",
          extra_field2: "",
          extra_field3: "",
          extra_field5: "",
          extra_field6: "",
          extra_field7: null,
          ingredgb: "",
          insiz: "",
          itemnm: "",
          itemnm2: "",
          maker: "",
          moddt: "",
          ordnum: "",
          ordseq: 0,
          orgdiv: "",
          poregnum: null,
          print_pc: "",
          print_userid: "",
          project: "",
          prtdt: null,
          prtqty: 0,
          qty: 0,
          qtyunit: "",
          rcvcustnm2: "",
          remark: "",
          remark1: "",
          saler: "",
          seq: 0,
          spec: "",
          specnum: "",
          subaddr: "",
          sublc: "",
          subnm: "",
          tagarea: "",
          tagtemp1: "",
          tagtemp2: "",
          tagtemp3: "",
          tagtemp4: "",
          tagtemp5: "",
          totqty: 10,
          sealno: "",
        });
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_B0020W_628_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q2",
        "@p_orgdiv": filters2.orgdiv,
        "@p_custcd": filters.custcd,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custnm2": filters.custnm2,
        "@p_itemsts": filters.itemsts,
        "@p_location": filters.location,
        "@p_prodiv": filters.prodiv,
        "@p_finyn": filters.finyn,
        "@p_kind": filters.kind,
        "@p_itemnm": filters.itemnm,
        "@p_ordnum": filters2.ordnum,
        "@p_ordseq": filters2.ordseq,
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
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        setInformation({
          workType: "U",
          Ingredients: rows[0].Ingredients,
          addrgb: rows[0].addrgb,
          addrgb_addr: rows[0].addrgb_addr,
          addrgb_custnm: rows[0].addrgb_custnm,
          color: rows[0].color,
          custnm: rows[0].custnm,
          cycletime_min: rows[0].cycletime_min,
          dwgno: rows[0].dwgno,
          extra_field1: rows[0].extra_field1,
          extra_field2: rows[0].extra_field2,
          extra_field3: rows[0].extra_field3,
          extra_field5: rows[0].extra_field5,
          extra_field6: rows[0].extra_field6,
          extra_field7:
            rows[0].extra_field7 == "" ? null : toDate2(rows[0].extra_field7),
          ingredgb: rows[0].ingredgb,
          insiz: rows[0].insiz,
          itemnm: rows[0].itemnm,
          itemnm2: rows[0].itemnm2,
          maker: rows[0].maker,
          moddt: rows[0].moddt,
          ordnum: rows[0].ordnum,
          ordseq: rows[0].ordseq,
          orgdiv: rows[0].orgdiv,
          poregnum: rows[0].poregnum == "" ? null : toDate2(rows[0].poregnum),
          print_pc: rows[0].print_pc,
          print_userid: rows[0].print_userid,
          project: rows[0].project,
          prtdt: rows[0].prtdt,
          prtqty: rows[0].prtqty,
          qty: rows[0].qty,
          qtyunit: rows[0].qtyunit,
          rcvcustnm2: rows[0].rcvcustnm2,
          remark: rows[0].remark,
          remark1: rows[0].remark1,
          saler: rows[0].saler,
          seq: rows[0].seq,
          spec: rows[0].spec,
          specnum: rows[0].specnum,
          subaddr: rows[0].subaddr,
          sublc: rows[0].sublc,
          subnm: rows[0].subnm,
          tagarea: rows[0].tagarea,
          tagtemp1: rows[0].tagtemp1,
          tagtemp2: rows[0].tagtemp2,
          tagtemp3: rows[0].tagtemp3,
          tagtemp4: rows[0].tagtemp4,
          tagtemp5: rows[0].tagtemp5,
          totqty: rows[0].totqty,
          sealno: rows[0].sealno,
        });
      } else {
        setInformation({
          workType: "",
          Ingredients: "",
          addrgb: "",
          addrgb_addr: "",
          addrgb_custnm: "",
          color: "",
          custnm: "",
          cycletime_min: 0,
          dwgno: "",
          extra_field1: "",
          extra_field2: "",
          extra_field3: "",
          extra_field5: "",
          extra_field6: "",
          extra_field7: null,
          ingredgb: "",
          insiz: "",
          itemnm: "",
          itemnm2: "",
          maker: "",
          moddt: "",
          ordnum: "",
          ordseq: 0,
          orgdiv: "",
          poregnum: null,
          print_pc: "",
          print_userid: "",
          project: "",
          prtdt: null,
          prtqty: 0,
          qty: 0,
          qtyunit: "",
          rcvcustnm2: "",
          remark: "",
          remark1: "",
          saler: "",
          seq: 0,
          spec: "",
          specnum: "",
          subaddr: "",
          sublc: "",
          subnm: "",
          tagarea: "",
          tagtemp1: "",
          tagtemp2: "",
          tagtemp3: "",
          tagtemp4: "",
          tagtemp5: "",
          totqty: 10,
          sealno: "",
        });
      }
    }
    setFilters2((prev) => ({
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
      filters.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData, bizComponentData]);

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

    if (selectedRowData.cnt > 0) {
      setFilters2((prev) => ({
        ...prev,
        orgdiv: selectedRowData.orgdiv,
        ordnum: selectedRowData.ordnum,
        ordseq: selectedRowData.ordseq,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      setParaData2({
        workType: "New",
        orgdiv: sessionOrgdiv,
        dlvdt: selectedRowData.dlvdt,
        ordsiz: selectedRowData.ordsiz,
        custnm: selectedRowData.custnm,
        itemcd: selectedRowData.itemcd,
        rcvcustnm: selectedRowData.rcvcustnm,
        specsize: selectedRowData.specsize,
        qty: selectedRowData.qty,
        custabbr: selectedRowData.custabbr,
        itemsts: selectedRowData.itemsts,
        itemdiv: selectedRowData.itemdiv,
        inspecsize: selectedRowData.inspecsize,
        custcd: selectedRowData.custcd,

        ordnum: selectedRowData.ordnum,
        ordseq: selectedRowData.ordseq,
      });
    }
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setInformation({
      workType: "U",
      Ingredients: selectedRowData.Ingredients,
      addrgb: selectedRowData.addrgb,
      addrgb_addr: selectedRowData.addrgb_addr,
      addrgb_custnm: selectedRowData.addrgb_custnm,
      color: selectedRowData.color,
      custnm: selectedRowData.custnm,
      cycletime_min: selectedRowData.cycletime_min,
      dwgno: selectedRowData.dwgno,
      extra_field1: selectedRowData.extra_field1,
      extra_field2: selectedRowData.extra_field2,
      extra_field3: selectedRowData.extra_field3,
      extra_field5: selectedRowData.extra_field5,
      extra_field6: selectedRowData.extra_field6,
      extra_field7:
        selectedRowData.extra_field7 == ""
          ? null
          : toDate2(selectedRowData.extra_field7),
      ingredgb: selectedRowData.ingredgb,
      insiz: selectedRowData.insiz,
      itemnm: selectedRowData.itemnm,
      itemnm2: selectedRowData.itemnm2,
      maker: selectedRowData.maker,
      moddt: selectedRowData.moddt,
      ordnum: selectedRowData.ordnum,
      ordseq: selectedRowData.ordseq,
      orgdiv: selectedRowData.orgdiv,
      poregnum:
        selectedRowData.poregnum == ""
          ? null
          : toDate2(selectedRowData.poregnum),
      print_pc: selectedRowData.print_pc,
      print_userid: selectedRowData.print_userid,
      project: selectedRowData.project,
      prtdt: selectedRowData.prtdt,
      prtqty: selectedRowData.prtqty,
      qty: selectedRowData.qty,
      qtyunit: selectedRowData.qtyunit,
      rcvcustnm2: selectedRowData.rcvcustnm2,
      remark: selectedRowData.remark,
      remark1: selectedRowData.remark1,
      saler: selectedRowData.saler,
      seq: selectedRowData.seq,
      spec: selectedRowData.spec,
      specnum: selectedRowData.specnum,
      subaddr: selectedRowData.subaddr,
      sublc: selectedRowData.sublc,
      subnm: selectedRowData.subnm,
      tagarea: selectedRowData.tagarea,
      tagtemp1: selectedRowData.tagtemp1,
      tagtemp2: selectedRowData.tagtemp2,
      tagtemp3: selectedRowData.tagtemp3,
      tagtemp4: selectedRowData.tagtemp4,
      tagtemp5: selectedRowData.tagtemp5,
      totqty: selectedRowData.totqty,
      sealno: selectedRowData.sealno,
    });
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
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
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
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

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));

    setPage2(initialPageState);
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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
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

  const onUpdateAddr = () => {
    if (!permissions.save) return;
    const datas = mainDataResult.data.filter((item) => item.chk == true);
    let valid = true;

    if (Information2.addr == "" && Information2.addr == null) {
      valid = false;
    }
    if (valid == false) {
      alert("주소/제조를 선택해주세요.");
      return false;
    }

    if (valid == true) {
      let dataArr: TdataArr = {
        ordnum_s: [],
        ordseq_s: [],
        addrgb_s: [],
      };

      datas.forEach((item: any, idx: number) => {
        const { ordnum = "", ordseq = "", addrgb = "" } = item;

        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq);
        dataArr.addrgb_s.push(addrgb);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "addr",
        ordnum_s: dataArr.ordnum_s.join("|"),
        ordseq_s: dataArr.ordseq_s.join("|"),
        addrgb_s: dataArr.addrgb_s.join("|"),
      }));
    }
  };

  const onUpdateShlife = async () => {
    if (!permissions.save) return;
    const datas = mainDataResult.data.filter((item) => item.chk == true);
    let valid = true;

    if (
      convertDateToStr(Information2.shlife).substring(0, 4) < "1997" ||
      convertDateToStr(Information2.shlife).substring(6, 8) > "31" ||
      convertDateToStr(Information2.shlife).substring(6, 8) < "01" ||
      convertDateToStr(Information2.shlife).substring(6, 8).length != 2
    ) {
      valid = false;
    } else if (
      convertDateToStr(Information2.shlife).substring(0, 4) < "1997" ||
      convertDateToStr(Information2.shlife).substring(6, 8) > "31" ||
      convertDateToStr(Information2.shlife).substring(6, 8) < "01" ||
      convertDateToStr(Information2.shlife).substring(6, 8).length != 2
    ) {
      valid = false;
    }
    if (valid == false) {
      alert("유통기한을 입력해주세요.");
      return false;
    }

    if (valid == true) {
      let dataArr: TdataArr = {
        ordnum_s: [],
        ordseq_s: [],
        addrgb_s: [],
      };

      datas.forEach((item: any, idx: number) => {
        const { ordnum = "", ordseq = "", addrgb = "" } = item;

        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq);
        dataArr.addrgb_s.push(addrgb);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "shlife",
        ordnum_s: dataArr.ordnum_s.join("|"),
        ordseq_s: dataArr.ordseq_s.join("|"),
        addrgb_s: dataArr.addrgb_s.join("|"),
      }));
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    ordnum_s: "",
    ordseq_s: "",
    addrgb_s: "",
    stddt: convertDateToStr(Information2.shlife),
  });

  const [ParaData2, setParaData2] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    dlvdt: "",
    ordsiz: "",
    custnm: "",
    itemcd: "",
    rcvcustnm: "",
    specsize: 0,
    qty: 0,
    custabbr: "",
    itemsts: "",
    itemdiv: "",
    inspecsize: 0,
    custcd: "",

    ordnum: "",
    ordseq: 0,
  });

  const para: Iparameters = {
    procedureName: "P_PR_B0020W_628_Sub1_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_ordnum": ParaData.ordnum_s,
      "@p_ordseq": ParaData.ordseq_s,
      "@p_addrgb": ParaData.addrgb_s,
      "@stddt": ParaData.stddt,
    },
  };

  const para2: Iparameters = {
    procedureName: "P_PR_B0020W_628_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData2.workType,
      "@p_orgdiv": ParaData2.orgdiv,
      "@p_dlvdt": ParaData2.dlvdt,
      "@p_spec": ParaData2.ordsiz,
      "@p_custnm": ParaData2.custnm,
      "@p_itemcd": ParaData2.itemcd,
      "@p_rcvcustnm": ParaData2.rcvcustnm,
      "@p_specsize": ParaData2.specsize,
      "@p_qty": ParaData2.qty,
      "@p_custabbr": ParaData2.custabbr,
      "@p_itemsts": ParaData2.itemsts,
      "@p_itemdiv": ParaData2.itemdiv,
      "@p_inspecsize": ParaData2.inspecsize,
      "@p_custcd": ParaData2.custcd,

      "@p_ordnum": ParaData2.ordnum,
      "@p_ordseq": ParaData2.ordseq,

      "@p_userid": sessionUserId,
      "@p_pc": sessionpc,
    },
  };

  // useEffect(() => {
  //   if (permissions.save) {
  //     fetchTodoGridSaved();
  //   }
  // }, [ParaData, permissions]);

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
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setParaData({
        orgdiv: sessionOrgdiv,
        addrgb_s: "",
        ordnum_s: "",
        ordseq_s: "",
        workType: "",
        stddt: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (permissions.save && ParaData2.workType != "") {
      fetchTodoGridSaved2();
    }
  }, [ParaData2, permissions]);

  const fetchTodoGridSaved2 = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setParaData2({
        workType: "",
        orgdiv: sessionOrgdiv,
        dlvdt: "",
        ordsiz: "",
        custnm: "",
        itemcd: "",
        rcvcustnm: "",
        specsize: 0,
        qty: 0,
        custabbr: "",
        itemsts: "",
        itemdiv: "",
        inspecsize: 0,
        custcd: "",

        ordnum: "",
        ordseq: 0,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
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
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>일자</th>
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
              <th>자타사구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="mydiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>출력여부</th>
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
            <tr>
              <th>상태</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="kind"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>상태구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemsts"
                    value={filters.itemsts}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
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
              <th>작업구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prodiv"
                    value={filters.prodiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
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
              <th>고객처</th>
              <td>
                <Input
                  name="custnm2"
                  type="text"
                  value={filters.custnm2}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      {isMobile ? (
        <>
          
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={"65%"}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>요약정보</GridTitle>
                <ButtonContainer>
                  <div style={{ padding: "4px", marginLeft: "5px" }}>
                    <DatePicker
                      name="shlife"
                      value={Information2.shlife}
                      format="yyyy-MM-dd"
                      onChange={InputChange2}
                      placeholder=""
                    />
                  </div>
                  <Button
                    onClick={onUpdateShlife}
                    fillMode="outline"
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    유통기한 일괄변경
                  </Button>
                  <div style={{ padding: "4px", marginLeft: "5px" }}>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="addr"
                        value={Information2.addr}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange2}
                      />
                    )}
                  </div>
                  <Button
                    onClick={onUpdateAddr}
                    fillMode="outline"
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    주소/제조 일괄변경
                  </Button>
                  <Button
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="print"
                    disabled={permissions.print ? false : true}
                  >
                    겉지출력
                  </Button>
                  <Button
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="print"
                    disabled={permissions.print ? false : true}
                  >
                    속지출력
                  </Button>
                  <Button
                    icon="x"
                    fillMode="outline"
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    출력취소
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="태그발행"
              >
                <Grid
                  style={{
                    height: webheight,
                  }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      specnum: originListData.find(
                        (item: any) => item.sub_code == row.specnum
                      )?.code_name,
                      itemdiv: itemtypeListData.find(
                        (item: any) => item.sub_code == row.itemdiv
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
                                  : CenterCell
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell
                                  : numberField2.includes(item.fieldName)
                                  ? gridSumQtyFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(35% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>출력정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="태그발행"
                >
                  <Grid
                    style={{
                      height: webheight2,
                    }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
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
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : CenterCell
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
              <FormBoxWrap
                border={true}
                className="FormBoxWrap"
                style={{ marginTop: `${GAP}px` }}
              >
                <GridTitle>태그정보</GridTitle>
                <ButtonContainer>
                  {addstate == true ? (
                    <Button
                      themeColor={"primary"}
                      icon="plus"
                      title="추가"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setFilters2((prev) => ({
                          ...prev,
                          isSearch: true,
                          pgNum: 1,
                        }));
                        setAddstate(true);
                      }}
                      themeColor={"primary"}
                      icon="reset"
                      title="재조회"
                      disabled={permissions.view ? false : true}
                    ></Button>
                  )}
                  <Button
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                    disabled={permissions.save ? false : true}
                  />
                  <Button
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                    title="삭제"
                    disabled={
                      permissions.save
                        ? addstate == false
                          ? true
                          : false
                        : true
                    }
                  ></Button>
                </ButtonContainer>
                <FormBoxFNF>
                  <tbody>
                    <tr>
                      <th>품목명</th>
                      <td colSpan={2}>
                        <Input
                          name="itemnm"
                          type="text"
                          value={Information.itemnm}
                          onChange={InputChange}
                        />
                      </td>
                      <th>규격</th>
                      <td colSpan={2}>
                        <Input
                          name="spec"
                          type="text"
                          value={Information.spec}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>원산지</th>
                      <td colSpan={2}>
                        <Input
                          name="specnum"
                          type="text"
                          value={Information.specnum}
                          onChange={InputChange}
                        />
                      </td>
                      <th>중량</th>
                      <td colSpan={2}>
                        <Input
                          name="qty"
                          type="number"
                          value={Information.qty}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>식품유형</th>
                      <td colSpan={2}>
                        <Input
                          name="extra_field1"
                          type="text"
                          value={Information.extra_field1}
                          onChange={InputChange}
                        />
                      </td>
                      <th>성분</th>
                      <td colSpan={2}>
                        <Input
                          name="Ingredients"
                          type="text"
                          value={Information.Ingredients}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>대리점명</th>
                      <td colSpan={2}>
                        <Input
                          name="custnm"
                          type="text"
                          value={Information.custnm}
                          onChange={InputChange}
                        />
                      </td>
                      <th>납품처명</th>
                      <td colSpan={2}>
                        <Input
                          name="extra_field6"
                          type="text"
                          value={Information.extra_field6}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>제조일자</th>
                      <td colSpan={2}>
                        <DatePicker
                          name="poregnum"
                          value={Information.poregnum}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                        />
                      </td>
                      <th>포장</th>
                      <td colSpan={2}>
                        <Input
                          name="extra_field2"
                          type="text"
                          value={Information.extra_field2}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>유통기한</th>
                      <td colSpan={5}>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="extra_field7"
                            value={Information.extra_field7}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                          />
                          <div className="filter-item-wrap">
                            <Input
                              name="cycletime_min"
                              type="number"
                              value={Information.cycletime_min}
                              onChange={InputChange}
                              style={{ width: "90%" }}
                            />
                            일
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td colSpan={5}>
                        {bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="extra_field3"
                            value={Information.extra_field3}
                            bizComponentId="R_Shlife"
                            bizComponentData={bizComponentData}
                            changeData={RadioChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>등급</th>
                      <td>
                        <Input
                          name="dwgno"
                          type="number"
                          value={Information.dwgno}
                          onChange={InputChange}
                        />
                      </td>
                      <th>생산년도</th>
                      <td>
                        <Input
                          name="project"
                          type="number"
                          value={Information.project}
                          onChange={InputChange}
                        />
                      </td>
                      <th>형태</th>
                      <td>
                        <Input
                          name="insiz"
                          type="number"
                          value={Information.insiz}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>인쇄수</th>
                      <td colSpan={2}>
                        <Input
                          name="prtqty"
                          type="number"
                          value={Information.prtqty}
                          onChange={InputChange}
                        />
                      </td>
                      <th>용지구분</th>
                      <td colSpan={2}>
                        {bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="sealno"
                            value={Information.sealno}
                            bizComponentId="R_Printgb"
                            bizComponentData={bizComponentData}
                            changeData={RadioChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>제조/판매원</th>
                      <td colSpan={5}>
                        <Input
                          name="tagtemp3"
                          type="text"
                          value={Information.tagtemp3}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>주의사항</th>
                      <td colSpan={5}>
                        <TextArea
                          name="remark"
                          rows={3}
                          value={Information.remark}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>주소구분</th>
                      <td colSpan={2}>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="addrgb"
                            value={Information.addrgb}
                            bizComponentId="L_BA002_628"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBoxFNF>
              </FormBoxWrap>
            </GridContainer>
          </GridContainerWrap>
        </>
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
export default PR_B0020W_628;
