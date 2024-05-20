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
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
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
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
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
  getBizCom,
  getHeight,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  isValidDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { heightstate, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_A0000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;

const AC_A0000W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  let isMobile = deviceWidth <= 1200;
  const [swiper, setSwiper] = useState<SwiperCore>();

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_A0000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_A0000W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002, L_BA025, L_AC061, L_BA049,L_dptcd_001, L_BA001",
    //사업장, 업태, 회기, 신고세무소, 회계부서, 회사구분
    setBizComponentData
  );
  const [orgdivListData, setOrgdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setOrgdivListData(getBizCom(bizComponentData, "L_BA001"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [infomation, setInfomation] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    workType: "N",
    acntfrdt: null,
    acntses: "",
    acnttodt: null,
    address: "",
    address_eng: "",
    bizregnum: "",
    bnkinfo: "",
    certid: "",
    closechk: "",
    compclass: "",
    compnm: "",
    compnm_eng: "",
    compregno: "",
    comptype: "",
    dptcd: "",
    efaxnum: "",
    email: "",
    estbdt: null,
    etelnum: "",
    faxnum: "",
    nickname: "",
    orgdiv: "",
    phonenum: "",
    reprenm: "",
    reprenm_eng: "",
    repreregno: "",
    sendid: "",
    settlecd: "",
    taxloca: "",
    taxlocanm: "",
    taxorg: "",
    taxortnm: "",
    zipcode: "",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);

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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
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
            (row: any) =>
              row.orgdiv + "-" + row.taxloca == filters.find_row_value
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
                  row.orgdiv + "-" + row.taxloca == filters.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            acntfrdt: isValidDate(selectedRow.acntfrdt)
              ? new Date(dateformat(selectedRow.acntfrdt))
              : null,
            acntses: selectedRow.acntses,
            acnttodt: isValidDate(selectedRow.acnttodt)
              ? new Date(dateformat(selectedRow.acnttodt))
              : null,
            address: selectedRow.address,
            address_eng: selectedRow.address_eng,
            bizregnum: selectedRow.bizregnum,
            bnkinfo: selectedRow.bnkinfo,
            certid: selectedRow.certid,
            closechk: selectedRow.closechk,
            compclass: selectedRow.compclass,
            compnm: selectedRow.compnm,
            compnm_eng: selectedRow.compnm_eng,
            compregno: selectedRow.compregno,
            comptype: selectedRow.comptype,
            dptcd: selectedRow.dptcd,
            efaxnum: selectedRow.efaxnum,
            email: selectedRow.email,
            estbdt: isValidDate(selectedRow.estbdt)
              ? new Date(dateformat(selectedRow.estbdt))
              : null,
            etelnum: selectedRow.etelnum,
            faxnum: selectedRow.faxnum,
            nickname: selectedRow.nickname,
            orgdiv: selectedRow.orgdiv,
            phonenum: selectedRow.phonenum,
            reprenm: selectedRow.reprenm,
            reprenm_eng: selectedRow.reprenm_eng,
            repreregno: selectedRow.repreregno,
            sendid: selectedRow.sendid,
            settlecd: selectedRow.settlecd,
            taxloca: selectedRow.taxloca,
            taxlocanm: selectedRow.taxlocanm,
            taxorg: selectedRow.taxorg,
            taxortnm: selectedRow.taxortnm,
            zipcode: selectedRow.zipcode,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            acntfrdt: isValidDate(rows[0].acntfrdt)
              ? new Date(dateformat(rows[0].acntfrdt))
              : null,
            acntses: rows[0].acntses,
            acnttodt: isValidDate(rows[0].acnttodt)
              ? new Date(dateformat(rows[0].acnttodt))
              : null,
            address: rows[0].address,
            address_eng: rows[0].address_eng,
            bizregnum: rows[0].bizregnum,
            bnkinfo: rows[0].bnkinfo,
            certid: rows[0].certid,
            closechk: rows[0].closechk,
            compclass: rows[0].compclass,
            compnm: rows[0].compnm,
            compnm_eng: rows[0].compnm_eng,
            compregno: rows[0].compregno,
            comptype: rows[0].comptype,
            dptcd: rows[0].dptcd,
            efaxnum: rows[0].efaxnum,
            email: rows[0].email,
            estbdt: isValidDate(rows[0].estbdt)
              ? new Date(dateformat(rows[0].estbdt))
              : null,
            etelnum: rows[0].etelnum,
            faxnum: rows[0].faxnum,
            nickname: rows[0].nickname,
            orgdiv: rows[0].orgdiv,
            phonenum: rows[0].phonenum,
            reprenm: rows[0].reprenm,
            reprenm_eng: rows[0].reprenm_eng,
            repreregno: rows[0].repreregno,
            sendid: rows[0].sendid,
            settlecd: rows[0].settlecd,
            taxloca: rows[0].taxloca,
            taxlocanm: rows[0].taxlocanm,
            taxorg: rows[0].taxorg,
            taxortnm: rows[0].taxortnm,
            zipcode: rows[0].zipcode,
          });
        }
      } else {
        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "N",
          acntfrdt: null,
          acntses: "",
          acnttodt: null,
          address: "",
          address_eng: "",
          bizregnum: "",
          bnkinfo: "",
          certid: "",
          closechk: "",
          compclass: "",
          compnm: "",
          compnm_eng: "",
          compregno: "",
          comptype: "",
          dptcd: "",
          efaxnum: "",
          email: "",
          estbdt: null,
          etelnum: "",
          faxnum: "",
          nickname: "",
          orgdiv: "",
          phonenum: "",
          reprenm: "",
          reprenm_eng: "",
          repreregno: "",
          sendid: "",
          settlecd: "",
          taxloca: "",
          taxlocanm: "",
          taxorg: "",
          taxortnm: "",
          zipcode: "",
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

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
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

    const tax = locationListData.find(
      (item: any) => item.code_name == selectedRowData.taxloca
    )?.sub_code;

    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "U",
      acntfrdt: isValidDate(selectedRowData.acntfrdt)
        ? new Date(dateformat(selectedRowData.acntfrdt))
        : null,
      acntses: selectedRowData.acntses,
      acnttodt: isValidDate(selectedRowData.acnttodt)
        ? new Date(dateformat(selectedRowData.acnttodt))
        : null,
      address: selectedRowData.address,
      address_eng: selectedRowData.address_eng,
      bizregnum: selectedRowData.bizregnum,
      bnkinfo: selectedRowData.bnkinfo,
      certid: selectedRowData.certid,
      closechk: selectedRowData.closechk,
      compclass: selectedRowData.compclass,
      compnm: selectedRowData.compnm,
      compnm_eng: selectedRowData.compnm_eng,
      compregno: selectedRowData.compregno,
      comptype: selectedRowData.comptype,
      dptcd: selectedRowData.dptcd,
      efaxnum: selectedRowData.efaxnum,
      email: selectedRowData.email,
      estbdt: isValidDate(selectedRowData.estbdt)
        ? new Date(dateformat(selectedRowData.estbdt))
        : null,
      etelnum: selectedRowData.etelnum,
      faxnum: selectedRowData.faxnum,
      nickname: selectedRowData.nickname,
      orgdiv: selectedRowData.orgdiv,
      phonenum: selectedRowData.phonenum,
      reprenm: selectedRowData.reprenm,
      reprenm_eng: selectedRowData.reprenm_eng,
      repreregno: selectedRowData.repreregno,
      sendid: selectedRowData.sendid,
      settlecd: selectedRowData.settlecd,
      taxloca: tax == undefined ? "" : tax,
      taxlocanm: selectedRowData.taxlocanm,
      taxorg: selectedRowData.taxorg,
      taxortnm: selectedRowData.taxortnm,
      zipcode: selectedRowData.zipcode,
    });
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
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

  const onAddClick2 = () => {
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "N",
      acntfrdt: null,
      acntses: "",
      acnttodt: null,
      address: "",
      address_eng: "",
      bizregnum: "",
      bnkinfo: "",
      certid: "",
      closechk: "",
      compclass: "",
      compnm: "",
      compnm_eng: "",
      compregno: "",
      comptype: "",
      dptcd: "",
      efaxnum: "",
      email: "",
      estbdt: null,
      etelnum: "",
      faxnum: "",
      nickname: "",
      orgdiv: "",
      phonenum: "",
      reprenm: "",
      reprenm_eng: "",
      repreregno: "",
      sendid: "",
      settlecd: "",
      taxloca: "",
      taxlocanm: "",
      taxorg: "",
      taxortnm: "",
      zipcode: "",
    });
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    setPage(initialPageState); // 페이지 초기화
    resetAllGrid(); // 데이터 초기화
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    if (swiper) {
      swiper.slideTo(0);
    }
  };

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    orgdiv: "",
    taxloca: "",
  });

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        orgdiv: selectRows.orgdiv,
        taxloca: selectRows.taxloca,
      }));
    }
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_AC_A0000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": paraDataDeleted.orgdiv,
      "@p_taxloca": infomation.taxloca,
      "@p_compnm": "",
      "@p_taxlocanm": "",
      "@p_bizregnum": "",
      "@p_reprenm": "",
      "@p_repreregno": "",
      "@p_comptype": "",
      "@p_compclass": "",
      "@p_zipcode": "",
      "@p_address": "",
      "@p_phonenum": "",
      "@p_faxnum": "",
      "@p_taxorg": "",
      "@p_taxortnm": "",
      "@p_compregno": "",
      "@p_estbdt": "",
      "@p_acntses": "",
      "@p_acntfrdt": "",
      "@p_acnttodt": "",
      "@p_dptcd": "",
      "@p_settlecd": "",
      "@p_closechk": "",
      "@p_bnkinfo": "",
      "@p_compnm_eng": "",
      "@p_address_eng": "",
      "@p_etelnum": "",
      "@p_efaxnum": "",
      "@p_reprenm_eng": "",
      "@p_nickname": "",
      "@p_sendid": "",
      "@p_certid": "",
      "@p_email": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0000W",
    },
  };

  const infopara: Iparameters = {
    procedureName: "P_AC_A0000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": infomation.orgdiv,
      "@p_taxloca": infomation.taxloca,
      "@p_compnm": infomation.compnm,
      "@p_taxlocanm": infomation.taxlocanm,
      "@p_bizregnum": infomation.bizregnum,
      "@p_reprenm": infomation.reprenm,
      "@p_repreregno": infomation.repreregno,
      "@p_comptype": infomation.comptype,
      "@p_compclass": infomation.compclass,
      "@p_zipcode": infomation.zipcode,
      "@p_address": infomation.address,
      "@p_phonenum": infomation.phonenum,
      "@p_faxnum": infomation.faxnum,
      "@p_taxorg": infomation.taxorg,
      "@p_taxortnm": infomation.taxortnm,
      "@p_compregno": infomation.compregno,
      "@p_estbdt": convertDateToStr(infomation.estbdt),
      "@p_acntses": infomation.acntses,
      "@p_acntfrdt": convertDateToStr(infomation.acntfrdt),
      "@p_acnttodt": convertDateToStr(infomation.acnttodt),
      "@p_dptcd": infomation.dptcd,
      "@p_settlecd": infomation.settlecd,
      "@p_closechk": infomation.closechk,
      "@p_bnkinfo": infomation.bnkinfo,
      "@p_compnm_eng": infomation.compnm_eng,
      "@p_address_eng": infomation.address_eng,
      "@p_etelnum": infomation.etelnum,
      "@p_efaxnum": infomation.efaxnum,
      "@p_reprenm_eng": infomation.reprenm_eng,
      "@p_nickname": infomation.nickname,
      "@p_sendid": infomation.sendid,
      "@p_certid": infomation.certid,
      "@p_email": infomation.email,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0000W",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;
      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });

        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        const findRow = mainDataResult.data.filter(
          (item) =>
            item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        )[0];
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          find_row_value: findRow.orgdiv + "-" + findRow.taxloca,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
      setInfomation({
        pgSize: PAGE_SIZE,
        workType: "U",
        acntfrdt: null,
        acntses: "",
        acnttodt: null,
        address: "",
        address_eng: "",
        bizregnum: "",
        bnkinfo: "",
        certid: "",
        closechk: "",
        compclass: "",
        compnm: "",
        compnm_eng: "",
        compregno: "",
        comptype: "",
        dptcd: "",
        efaxnum: "",
        email: "",
        estbdt: null,
        etelnum: "",
        faxnum: "",
        nickname: "",
        orgdiv: "",
        phonenum: "",
        reprenm: "",
        reprenm_eng: "",
        repreregno: "",
        sendid: "",
        settlecd: "",
        taxloca: "",
        taxlocanm: "",
        taxorg: "",
        taxortnm: "",
        zipcode: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.orgdiv = "";
    paraDataDeleted.taxloca = "";
  };

  const onSaveClick2 = async () => {
    fetchSaved();
  };

  const fetchSaved = async () => {
    let data: any;

    let valid = true;

    try {
      if (infomation.orgdiv == "") {
        throw findMessage(messagesData, "AC_A0000W_001");
      } else if (infomation.taxloca == "") {
        throw findMessage(messagesData, "AC_A0000W_001");
      } else if (infomation.compnm == "") {
        throw findMessage(messagesData, "AC_A0000W_001");
      } else if (
        convertDateToStr(infomation.estbdt).substring(0, 4) < "1997" ||
        convertDateToStr(infomation.estbdt).substring(6, 8) > "31" ||
        convertDateToStr(infomation.estbdt).substring(6, 8) < "01" ||
        convertDateToStr(infomation.estbdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A0000W_002");
      } else if (
        convertDateToStr(infomation.acntfrdt).substring(0, 4) < "1997" ||
        convertDateToStr(infomation.acntfrdt).substring(6, 8) > "31" ||
        convertDateToStr(infomation.acntfrdt).substring(6, 8) < "01" ||
        convertDateToStr(infomation.acntfrdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A0000W_002");
      } else if (
        convertDateToStr(infomation.acnttodt).substring(0, 4) < "1997" ||
        convertDateToStr(infomation.acnttodt).substring(6, 8) > "31" ||
        convertDateToStr(infomation.acnttodt).substring(6, 8) < "01" ||
        convertDateToStr(infomation.acnttodt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A0000W_002");
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

  return (
    <>
      <TitleContainer>
        <Title>법인기본</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_A0000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
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
              <GridContainer
                style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
              >
                <GridTitleContainer className="ButtonContainer">
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
                  fileName="법인기본"
                >
                  <Grid
                    style={{ height: deviceHeight - height }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        taxloca: locationListData.find(
                          (item: any) => item.sub_code == row.taxloca
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
            <SwiperSlide
              key={1}
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <GridTitleContainer className="ButtonContainer2">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <Button
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(0);
                      }
                    }}
                    icon="arrow-left"
                  >
                    이전
                  </Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <GridContainer style={{ width: `${deviceWidth - 30}px` }}>
                <FormBoxWrap
                  border={true}
                  style={{
                    height: deviceHeight - height2,
                    width: "100%",
                    overflow: "scroll",
                  }}
                >
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>회사구분</th>
                        {infomation.workType == "N" ? (
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="orgdiv"
                                value={infomation.orgdiv}
                                bizComponentId="L_BA001"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                          </td>
                        ) : (
                          <td>
                            <Input
                              name="orgdiv"
                              type="text"
                              value={
                                orgdivListData.find(
                                  (item: any) =>
                                    item.sub_code == infomation.orgdiv
                                )?.code_name
                              }
                              className="readonly"
                            />
                          </td>
                        )}
                      </tr>
                      <tr>
                        <th>사업장코드</th>
                        {infomation.workType == "N" ? (
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="taxloca"
                                value={infomation.taxloca}
                                bizComponentId="L_BA002"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                          </td>
                        ) : (
                          <td>
                            <Input
                              name="taxloca"
                              type="text"
                              value={
                                locationListData.find(
                                  (item: any) =>
                                    item.sub_code == infomation.taxloca
                                )?.code_name
                              }
                              className="readonly"
                            />
                          </td>
                        )}
                        <th>회사명</th>
                        <td colSpan={3}>
                          <Input
                            name="compnm"
                            type="text"
                            value={infomation.compnm}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                        <th>사업자등록번호</th>
                        <td>
                          <Input
                            name="bizregnum"
                            type="text"
                            value={infomation.bizregnum}
                            onChange={InputChange}
                          />
                        </td>
                        <th>대표자명</th>
                        <td>
                          <Input
                            name="reprenm"
                            type="text"
                            value={infomation.reprenm}
                            onChange={InputChange}
                          />
                        </td>
                        <th>주민등록번호</th>
                        <td>
                          <Input
                            name="repreregno"
                            type="text"
                            value={infomation.repreregno}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>업종</th>
                        <td colSpan={3}>
                          <Input
                            name="comptype"
                            type="text"
                            value={infomation.comptype}
                            onChange={InputChange}
                          />
                        </td>
                        <th>업태</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="compclass"
                              value={infomation.compclass}
                              bizComponentId="L_BA025"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                        <th>우편번호</th>
                        <td>
                          <Input
                            name="zipcode"
                            type="text"
                            value={infomation.zipcode}
                            onChange={InputChange}
                          />
                        </td>
                        <th>전화번호</th>
                        <td>
                          <Input
                            name="phonenum"
                            type="text"
                            value={infomation.phonenum}
                            onChange={InputChange}
                          />
                        </td>
                        <th>팩스번호</th>
                        <td>
                          <Input
                            name="faxnum"
                            type="text"
                            value={infomation.faxnum}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>주소</th>
                        <td colSpan={5}>
                          <Input
                            name="address"
                            type="text"
                            value={infomation.address}
                            onChange={InputChange}
                          />
                        </td>
                        <th>법인등록번호</th>
                        <td>
                          <Input
                            name="compregno"
                            type="text"
                            value={infomation.compregno}
                            onChange={InputChange}
                          />
                        </td>
                        <th>전자전화번호</th>
                        <td>
                          <Input
                            name="etelnum"
                            type="text"
                            value={infomation.etelnum}
                            onChange={InputChange}
                          />
                        </td>
                        <th>전자팩스번호</th>
                        <td>
                          <Input
                            name="efaxnum"
                            type="text"
                            value={infomation.efaxnum}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>시작회계년도</th>
                        <td>
                          <DatePicker
                            name="acntfrdt"
                            value={infomation.acntfrdt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                            className="required"
                          />
                        </td>
                        <th>종료회계년도</th>
                        <td>
                          <DatePicker
                            name="acnttodt"
                            value={infomation.acnttodt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                            className="required"
                          />
                        </td>
                        <th>개업년원일</th>
                        <td>
                          <DatePicker
                            name="estbdt"
                            value={infomation.estbdt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                            className="required"
                          />
                        </td>
                        <th>회기</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="acntses"
                              value={infomation.acntses}
                              bizComponentId="L_AC061"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                        <th>회계부서</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="dptcd"
                              value={infomation.dptcd}
                              bizComponentId="L_dptcd_001"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                              textField="dptnm"
                              valueField="dptcd"
                            />
                          )}
                        </td>
                        <th>신고세무소</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="taxorg"
                              value={infomation.taxorg}
                              bizComponentId="L_BA049"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>닉네임</th>
                        <td>
                          <Input
                            name="nickname"
                            type="text"
                            value={infomation.nickname}
                            onChange={InputChange}
                          />
                        </td>
                        <th>이메일</th>
                        <td>
                          <Input
                            name="email"
                            type="text"
                            value={infomation.email}
                            onChange={InputChange}
                          />
                        </td>
                        <th>결재란수</th>
                        <td>
                          <Input
                            name="settlecd"
                            type="number"
                            value={infomation.settlecd}
                            onChange={InputChange}
                          />
                        </td>
                        <th>CERTID</th>
                        <td>
                          <Input
                            name="certid"
                            type="text"
                            value={infomation.certid}
                            onChange={InputChange}
                          />
                        </td>
                        <th>샌드빌ID</th>
                        <td colSpan={3}>
                          <Input
                            name="sendid"
                            type="text"
                            value={infomation.sendid}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>영문회사명</th>
                        <td colSpan={3}>
                          <Input
                            name="compnm_eng"
                            type="text"
                            value={infomation.compnm_eng}
                            onChange={InputChange}
                          />
                        </td>
                        <th>영문대표자명</th>
                        <td>
                          <Input
                            name="reprenm_eng"
                            type="text"
                            value={infomation.reprenm_eng}
                            onChange={InputChange}
                          />
                        </td>
                        <th>영문주소</th>
                        <td colSpan={5}>
                          <Input
                            name="address_eng"
                            type="text"
                            value={infomation.address_eng}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
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
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="법인기본"
            >
              <Grid
                style={{ height: "46.5vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    taxloca: locationListData.find(
                      (item: any) => item.sub_code == row.taxloca
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
          <GridTitleContainer>
            <GridTitle>세부정보</GridTitle>
          </GridTitleContainer>
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th>회사구분</th>
                  {infomation.workType == "N" ? (
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="orgdiv"
                          value={infomation.orgdiv}
                          bizComponentId="L_BA001"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          className="required"
                        />
                      )}
                    </td>
                  ) : (
                    <td>
                      <Input
                        name="orgdiv"
                        type="text"
                        value={
                          orgdivListData.find(
                            (item: any) => item.sub_code == infomation.orgdiv
                          )?.code_name
                        }
                        className="readonly"
                      />
                    </td>
                  )}
                </tr>
                <tr>
                  <th>사업장코드</th>
                  {infomation.workType == "N" ? (
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="taxloca"
                          value={infomation.taxloca}
                          bizComponentId="L_BA002"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          className="required"
                        />
                      )}
                    </td>
                  ) : (
                    <td>
                      <Input
                        name="taxloca"
                        type="text"
                        value={
                          locationListData.find(
                            (item: any) => item.sub_code == infomation.taxloca
                          )?.code_name
                        }
                        className="readonly"
                      />
                    </td>
                  )}
                  <th>회사명</th>
                  <td colSpan={3}>
                    <Input
                      name="compnm"
                      type="text"
                      value={infomation.compnm}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>사업자등록번호</th>
                  <td>
                    <Input
                      name="bizregnum"
                      type="text"
                      value={infomation.bizregnum}
                      onChange={InputChange}
                    />
                  </td>
                  <th>대표자명</th>
                  <td>
                    <Input
                      name="reprenm"
                      type="text"
                      value={infomation.reprenm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>주민등록번호</th>
                  <td>
                    <Input
                      name="repreregno"
                      type="text"
                      value={infomation.repreregno}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>업종</th>
                  <td colSpan={3}>
                    <Input
                      name="comptype"
                      type="text"
                      value={infomation.comptype}
                      onChange={InputChange}
                    />
                  </td>
                  <th>업태</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="compclass"
                        value={infomation.compclass}
                        bizComponentId="L_BA025"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>우편번호</th>
                  <td>
                    <Input
                      name="zipcode"
                      type="text"
                      value={infomation.zipcode}
                      onChange={InputChange}
                    />
                  </td>
                  <th>전화번호</th>
                  <td>
                    <Input
                      name="phonenum"
                      type="text"
                      value={infomation.phonenum}
                      onChange={InputChange}
                    />
                  </td>
                  <th>팩스번호</th>
                  <td>
                    <Input
                      name="faxnum"
                      type="text"
                      value={infomation.faxnum}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>주소</th>
                  <td colSpan={5}>
                    <Input
                      name="address"
                      type="text"
                      value={infomation.address}
                      onChange={InputChange}
                    />
                  </td>
                  <th>법인등록번호</th>
                  <td>
                    <Input
                      name="compregno"
                      type="text"
                      value={infomation.compregno}
                      onChange={InputChange}
                    />
                  </td>
                  <th>전자전화번호</th>
                  <td>
                    <Input
                      name="etelnum"
                      type="text"
                      value={infomation.etelnum}
                      onChange={InputChange}
                    />
                  </td>
                  <th>전자팩스번호</th>
                  <td>
                    <Input
                      name="efaxnum"
                      type="text"
                      value={infomation.efaxnum}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>시작회계년도</th>
                  <td>
                    <DatePicker
                      name="acntfrdt"
                      value={infomation.acntfrdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <th>종료회계년도</th>
                  <td>
                    <DatePicker
                      name="acnttodt"
                      value={infomation.acnttodt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <th>개업년원일</th>
                  <td>
                    <DatePicker
                      name="estbdt"
                      value={infomation.estbdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <th>회기</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="acntses"
                        value={infomation.acntses}
                        bizComponentId="L_AC061"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>회계부서</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="dptcd"
                        value={infomation.dptcd}
                        bizComponentId="L_dptcd_001"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField="dptnm"
                        valueField="dptcd"
                      />
                    )}
                  </td>
                  <th>신고세무소</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="taxorg"
                        value={infomation.taxorg}
                        bizComponentId="L_BA049"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>닉네임</th>
                  <td>
                    <Input
                      name="nickname"
                      type="text"
                      value={infomation.nickname}
                      onChange={InputChange}
                    />
                  </td>
                  <th>이메일</th>
                  <td>
                    <Input
                      name="email"
                      type="text"
                      value={infomation.email}
                      onChange={InputChange}
                    />
                  </td>
                  <th>결재란수</th>
                  <td>
                    <Input
                      name="settlecd"
                      type="number"
                      value={infomation.settlecd}
                      onChange={InputChange}
                    />
                  </td>
                  <th>CERTID</th>
                  <td>
                    <Input
                      name="certid"
                      type="text"
                      value={infomation.certid}
                      onChange={InputChange}
                    />
                  </td>
                  <th>샌드빌ID</th>
                  <td colSpan={3}>
                    <Input
                      name="sendid"
                      type="text"
                      value={infomation.sendid}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>영문회사명</th>
                  <td colSpan={3}>
                    <Input
                      name="compnm_eng"
                      type="text"
                      value={infomation.compnm_eng}
                      onChange={InputChange}
                    />
                  </td>
                  <th>영문대표자명</th>
                  <td>
                    <Input
                      name="reprenm_eng"
                      type="text"
                      value={infomation.reprenm_eng}
                      onChange={InputChange}
                    />
                  </td>
                  <th>영문주소</th>
                  <td colSpan={5}>
                    <Input
                      name="address_eng"
                      type="text"
                      value={infomation.address_eng}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
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

export default AC_A0000W;
