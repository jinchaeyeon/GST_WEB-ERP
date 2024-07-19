import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { Calendar } from "@progress/kendo-react-dateinputs";
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
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
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
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
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
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/CM_B1000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const checkField = ["finyn", "planyn"];
const centerField = ["usetime", "strday"];

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;

const CM_B1000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".Calendar");
      height5 = getHeight(".FormBoxWrap");
      height6 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height6);
        setMobileHeight2(getDeviceHeight(true) - height2 - height6);
        setMobileHeight3(getDeviceHeight(true) - height3 - height6);
        setWebHeight(getDeviceHeight(false) - height4 - height6);
        setWebHeight2(getDeviceHeight(true) - height - height5 - height6);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
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
        kind1: defaultOption.find((item: any) => item.id == "kind1")?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        planyn: defaultOption.find((item: any) => item.id == "planyn")
          ?.valueCode,
        custperson: defaultOption.find((item: any) => item.id == "custperson")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        rtrchk: defaultOption.find((item: any) => item.id == "rtrchk")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA400, L_BA401",
    //대분류, 품목계정, 수량단위, 내수구분, 중분류, 소분류, 입고구분, 담당자, 화폐단위, 도/사
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [kindListData, setKindListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [kindListData2, setKindListData2] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setKindListData(getBizCom(bizComponentData, "L_BA400"));
      setKindListData2(getBizCom(bizComponentData, "L_BA401"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [subselectedState, setSubSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == undefined) {
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        frdt: value,
        todt: value,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    dptcd: "",
    custcd: "",
    custnm: "",
    person: "",
    kind1: "",
    finyn: "",
    title: "",
    planyn: "",
    custperson: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [infomation, setInfomation] = useState({
    attdatnum: "",
    contents: "",
    custnm: "",
    custperson: "",
    datnum: "",
    endtime: "",
    files: "",
    finyn: false,
    kind1: "",
    kind2: "",
    opengb: "",
    person: "",
    planyn: false,
    ref_key: "",
    strday: "",
    strtime: "",
    title: "",
    usehh: 0,
    usemm: 0,
    user_name: "",
    usetime: "",
    total_usetime: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    setSubFilters((prev) => ({ ...prev, find_row_value: "", isSearch: true }));
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_B1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_dptcd": filters.dptcd,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_person": filters.person,
        "@p_kind1": filters.kind1,
        "@p_finyn": filters.finyn,
        "@p_title": filters.title,
        "@p_planyn": filters.planyn,
        "@p_custperson": filters.custperson,
        "@p_rtrchk": filters.rtrchk,
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

        setInfomation((prev) => ({
          ...prev,
          attdatnum: rows[0].attdatnum,
          contents: rows[0].contents,
          custnm: rows[0].custnm,
          custperson: rows[0].custperson,
          datnum: rows[0].datnum,
          endtime: rows[0].endtime,
          files: rows[0].files,
          finyn: rows[0].finyn == "Y" ? true : false,
          kind1: rows[0].kind1,
          kind2: rows[0].kind2,
          opengb: rows[0].opengb,
          person: rows[0].person,
          planyn: rows[0].planyn == "Y" ? true : false,
          ref_key: rows[0].ref_key,
          strday: rows[0].strday,
          strtime: rows[0].strtime,
          title: rows[0].title,
          usehh: parseInt(rows[0].usehh),
          usemm: parseInt(rows[0].usemm),
          user_name: rows[0].user_name,
          usetime: rows[0].usetime,
          total_usetime: rows[0].total_usetime,
        }));
      } else {
        setInfomation({
          attdatnum: "",
          contents: "",
          custnm: "",
          custperson: "",
          datnum: "",
          endtime: "",
          files: "",
          finyn: false,
          kind1: "",
          kind2: "",
          opengb: "",
          person: "",
          planyn: false,
          ref_key: "",
          strday: "",
          strtime: "",
          title: "",
          usehh: 0,
          usemm: 0,
          user_name: "",
          usetime: "",
          total_usetime: "",
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
  const fetchGrid2 = async (subfilters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters2: Iparameters = {
      procedureName: "P_CM_B1000W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": "LIST1",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_dptcd": filters.dptcd,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_person": filters.person,
        "@p_kind1": filters.kind1,
        "@p_finyn": filters.finyn,
        "@p_title": filters.title,
        "@p_planyn": filters.planyn,
        "@p_custperson": filters.custperson,
        "@p_rtrchk": filters.rtrchk,
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

      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSubSelectedState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });
      }
    }
    setSubFilters((prev) => ({
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
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (
      subfilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);

      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchGrid2(deepCopiedFilters);
    }
  }, [subfilters, permissions]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "인원정보";
      optionsGridOne.sheets[1].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        <div style={{ textAlign: "center" }}>{infomation.total_usetime}</div>
      </td>
    );
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setInfomation((prev) => ({
      ...prev,
      attdatnum: selectedRowData.attdatnum,
      contents: selectedRowData.contents,
      custnm: selectedRowData.custnm,
      custperson: selectedRowData.custperson,
      datnum: selectedRowData.datnum,
      endtime: selectedRowData.endtime,
      files: selectedRowData.files,
      finyn: selectedRowData.finyn == "Y" ? true : false,
      kind1: selectedRowData.kind1,
      kind2: selectedRowData.kind2,
      opengb: selectedRowData.opengb,
      person: selectedRowData.person,
      planyn: selectedRowData.planyn == "Y" ? true : false,
      ref_key: selectedRowData.ref_key,
      strday: selectedRowData.strdat,
      strtime: selectedRowData.strtime,
      title: selectedRowData.title,
      usehh: parseInt(selectedRowData.usehh),
      usemm: parseInt(selectedRowData.usemm),
      user_name: selectedRowData.user_name,
      usetime: selectedRowData.usetime,
      total_usetime: selectedRowData.total_usetime,
    }));
  };

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: subselectedState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });

    setSubSelectedState(newSelectedState);
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

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setInfomation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange = (e: any) => {
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
        throw findMessage(messagesData, "CM_B1000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_B1000W_001");
      } else {
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        resetAllGrid(); // 데이터 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
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

      {isMobile ? (
        <>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>시작일</th>
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
                  <th>업체코드</th>
                  <td>
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
                  <th>근무</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="rtrchk"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
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
                  <th>전체분류</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="kind1"
                        value={filters.kind1}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>업체담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="custperson"
                        value={filters.custperson}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="prsnnm"
                        valueField="custprsncd"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>완료여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="finyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계획여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="planyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>부서</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dptcd"
                        value={filters.dptcd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="dptnm"
                        valueField="dptcd"
                      />
                    )}
                  </td>
                  <th>작성자</th>
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
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-right"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      다음
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={subDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="일정조회"
                >
                  <Grid
                    style={{ height: mobileheight }}
                    data={process(
                      subDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: subselectedState[idGetter2(row)],
                      })),
                      subDataState
                    )}
                    {...subDataState}
                    onDataStateChange={onSubDataStateChange}
                    //선택 기능
                    dataItemKey={SUB_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSubSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={subDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //원하는 행 위치로 스크롤 기능
                    //정렬기능
                    sortable={true}
                    onSortChange={onSubSortChange}
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
                                footerCell={
                                  item.sortOrder == 0
                                    ? subTotalFooterCell
                                    : undefined
                                }
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer2">
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
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="일정조회"
                >
                  <Grid
                    style={{ height: mobileheight2 }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        strday: row.strday.substring(0, 10),
                        kind1: kindListData.find(
                          (item: any) => item.sub_code == row.kind1
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
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  checkField.includes(item.fieldName)
                                    ? CheckBoxReadOnlyCell
                                    : centerField.includes(item.fieldName)
                                    ? CenterCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : item.sortOrder == 6
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
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
                  style={{ height: mobileheight3, overflow: "auto" }}
                  border={true}
                >
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>시작시간</th>
                        <td>
                          <Input
                            name="strtime"
                            type="text"
                            value={infomation.strtime}
                            className="readonly"
                          />
                        </td>
                        <th>소요시간</th>
                        <td>
                          <div style={{ display: "flex" }}>
                            <Input
                              name="usehh"
                              type="number"
                              value={infomation.usehh}
                              className="readonly"
                            />
                            &nbsp;:&nbsp;
                            <Input
                              name="usemm"
                              type="number"
                              value={infomation.usemm}
                              className="readonly"
                            />
                          </div>
                        </td>
                        <td>
                          <Checkbox
                            name="finyn"
                            label={"완료여부"}
                            value={infomation.finyn}
                            className="k-radio-label"
                          />
                        </td>
                        <th>전체분류</th>
                        <td>
                          <Input
                            name="kind1"
                            type="text"
                            value={
                              kindListData.find(
                                (item: any) => item.sub_code == infomation.kind1
                              )?.code_name == undefined
                                ? infomation.kind1
                                : kindListData.find(
                                    (item: any) =>
                                      item.sub_code == infomation.kind1
                                  )?.code_name
                            }
                            className="readonly"
                          />
                        </td>
                        <th>개인분류</th>
                        <td>
                          <Input
                            name="kind2"
                            type="text"
                            value={
                              kindListData2.find(
                                (item: any) => item.sub_code == infomation.kind2
                              )?.code_name == undefined
                                ? infomation.kind2
                                : kindListData2.find(
                                    (item: any) =>
                                      item.sub_code == infomation.kind2
                                  )?.code_name
                            }
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>종료시간</th>
                        <td>
                          <Input
                            name="endtime"
                            type="text"
                            value={infomation.endtime}
                            className="readonly"
                          />
                        </td>
                        <th>공개범위</th>
                        <td colSpan={2}>
                          <Input
                            name="opengb"
                            type="text"
                            value={infomation.opengb}
                            className="readonly"
                          />
                        </td>
                        <th>업체명</th>
                        <td>
                          <Input
                            name="custnm"
                            type="text"
                            value={infomation.custnm}
                            className="readonly"
                          />
                        </td>
                        <th>업체담당자</th>
                        <td>
                          <Input
                            name="custperson"
                            type="text"
                            value={infomation.custperson}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>내용</th>
                        <td colSpan={8}>
                          <TextArea
                            value={infomation.contents}
                            name="contents"
                            rows={9}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>첨부파일</th>
                        <td colSpan={8}>
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
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width="355px" style={{ marginTop: "5px" }}>
              <Calendar
                focusedDate={filters.todt}
                value={filters.todt}
                onChange={filterInputChange}
                className="Calendar"
              />
              <ExcelExport
                data={subDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="일정조회"
              >
                <Grid
                  style={{ height: webheight }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: subselectedState[idGetter2(row)],
                    })),
                    subDataState
                  )}
                  {...subDataState}
                  onDataStateChange={onSubDataStateChange}
                  //선택 기능
                  dataItemKey={SUB_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSubSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubSortChange}
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
                              footerCell={
                                item.sortOrder == 0
                                  ? subTotalFooterCell
                                  : undefined
                              }
                            ></GridColumn>
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(100% - 370px)`}>
              <FilterContainer>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
                      <th>시작일</th>
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
                      <th>업체코드</th>
                      <td>
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
                      <th>근무</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionRadioGroup
                            name="rtrchk"
                            customOptionData={customOptionData}
                            changeData={filterRadioChange}
                          />
                        )}
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
                      <th>전체분류</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="kind1"
                            value={filters.kind1}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                      <th>업체담당자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="custperson"
                            value={filters.custperson}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="prsnnm"
                            valueField="custprsncd"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>완료여부</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionRadioGroup
                            name="finyn"
                            customOptionData={customOptionData}
                            changeData={filterRadioChange}
                          />
                        )}
                      </td>
                      <th>계획여부</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionRadioGroup
                            name="planyn"
                            customOptionData={customOptionData}
                            changeData={filterRadioChange}
                          />
                        )}
                      </td>
                      <th>부서</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="dptcd"
                            value={filters.dptcd}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="dptnm"
                            valueField="dptcd"
                          />
                        )}
                      </td>
                      <th>작성자</th>
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

              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="일정조회"
                >
                  <Grid
                    style={{ height: webheight2 }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        strday: row.strday.substring(0, 10),
                        kind1: kindListData.find(
                          (item: any) => item.sub_code == row.kind1
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
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  checkField.includes(item.fieldName)
                                    ? CheckBoxReadOnlyCell
                                    : centerField.includes(item.fieldName)
                                    ? CenterCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : item.sortOrder == 6
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <FormBoxWrap border={true} className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>시작시간</th>
                      <td>
                        <Input
                          name="strtime"
                          type="text"
                          value={infomation.strtime}
                          className="readonly"
                        />
                      </td>
                      <th>소요시간</th>
                      <td>
                        <div style={{ display: "flex" }}>
                          <Input
                            name="usehh"
                            type="number"
                            value={infomation.usehh}
                            className="readonly"
                          />
                          &nbsp;:&nbsp;
                          <Input
                            name="usemm"
                            type="number"
                            value={infomation.usemm}
                            className="readonly"
                          />
                        </div>
                      </td>
                      <td>
                        <Checkbox
                          name="finyn"
                          label={"완료여부"}
                          value={infomation.finyn}
                        />
                      </td>
                      <th>전체분류</th>
                      <td>
                        <Input
                          name="kind1"
                          type="text"
                          value={
                            kindListData.find(
                              (item: any) => item.sub_code == infomation.kind1
                            )?.code_name == undefined
                              ? infomation.kind1
                              : kindListData.find(
                                  (item: any) =>
                                    item.sub_code == infomation.kind1
                                )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                      <th>개인분류</th>
                      <td>
                        <Input
                          name="kind2"
                          type="text"
                          value={
                            kindListData2.find(
                              (item: any) => item.sub_code == infomation.kind2
                            )?.code_name == undefined
                              ? infomation.kind2
                              : kindListData2.find(
                                  (item: any) =>
                                    item.sub_code == infomation.kind2
                                )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>종료시간</th>
                      <td>
                        <Input
                          name="endtime"
                          type="text"
                          value={infomation.endtime}
                          className="readonly"
                        />
                      </td>
                      <th>공개범위</th>
                      <td colSpan={2}>
                        <Input
                          name="opengb"
                          type="text"
                          value={infomation.opengb}
                          className="readonly"
                        />
                      </td>
                      <th>업체명</th>
                      <td>
                        <Input
                          name="custnm"
                          type="text"
                          value={infomation.custnm}
                          className="readonly"
                        />
                      </td>
                      <th>업체담당자</th>
                      <td>
                        <Input
                          name="custperson"
                          type="text"
                          value={infomation.custperson}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>내용</th>
                      <td colSpan={8}>
                        <TextArea
                          value={infomation.contents}
                          name="contents"
                          rows={9}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={8}>
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
          </GridContainerWrap>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"U"}
          setData={setCustData}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          para={infomation.attdatnum}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
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

export default CM_B1000W;
