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
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { ICustData, IItemData } from "../hooks/interfaces";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/QC_A6010W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const dateField = ["qcreqdt", "orddt", "dlvdt"];
const numberField = ["qty"];

var height = 0;
var height2 = 0;

const MA_A0010W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");

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
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [loginResult] = useRecoilState(loginResultState);
  const serviceCategory = loginResult ? loginResult.serviceCategory : "";
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
        qcgb: defaultOption.find((item: any) => item.id == "qcgb")?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        qcyn: defaultOption.find((item: any) => item.id == "qcyn")?.valueCode,
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_QCGB, L_sysUserMaster_003, L_sysUserMaster_001",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setPersonListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
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

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
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
  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
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
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    qcgb: "",
    location: "",
    ordnum: "",
    finyn: "",
    custcd: "",
    custnm: "",
    project: "",
    poregnum: "",
    itemcd: "",
    itemnm: "",
    qcyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A6010W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.qcgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_qcyn": filters.qcyn,
        "@p_ordnum": filters.ordnum,
        "@p_poregnum": filters.poregnum,
        "@p_project": filters.project,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
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

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
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

  const [ParaData, setParaData] = useState({
    workType: "",
    ordnum_s: "",
    ordseq_s: "",
    qcreqnum_s: "",
    qcreqseq_s: "",
    qcgb: "",
    qcreqdt: "",
    person: "",
  });

  //조회조건 파라미터
  const para: Iparameters = {
    procedureName: "P_QC_A6010W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_qcgb": ParaData.qcgb,
      "@p_qcreqdt": ParaData.qcreqdt,
      "@p_person": ParaData.person,
      "@p_ordnum_s": ParaData.ordnum_s,
      "@p_ordseq_s": ParaData.ordseq_s,
      "@p_qcreqnum_s": ParaData.qcreqnum_s,
      "@p_qcreqseq_s": ParaData.qcreqseq_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "QC_A6010W",
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
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: prev.pgNum,
        isSearch: true,
      }));

      setParaData({
        workType: "",
        ordnum_s: "",
        ordseq_s: "",
        qcreqnum_s: "",
        qcreqseq_s: "",
        qcgb: "",
        qcreqdt: "",
        person: "",
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

  const onSaveClick = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );

    let valid = true;

    if (
      information.qcgb == "" ||
      information.qcgb == null ||
      information.qcgb == undefined ||
      information.person == "" ||
      information.person == undefined ||
      information.person == null ||
      convertDateToStr(information.qcreqdt).substring(0, 4) < "1997" ||
      convertDateToStr(information.qcreqdt).substring(6, 8) > "31" ||
      convertDateToStr(information.qcreqdt).substring(6, 8) < "01" ||
      convertDateToStr(information.qcreqdt).substring(6, 8).length != 2
    ) {
      valid = false;
    }

    if (dataItem.length == 0 || valid != true) return false;

    let dataArr: any = {
      ordnum_s: [],
      ordseq_s: [],
      qcreqnum_s: [],
      qcreqseq_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { ordnum = "", ordseq = "", qcreqnum = "", qcreqseq = "" } = item;

      dataArr.ordnum_s.push(ordnum);
      dataArr.ordseq_s.push(ordseq);
      dataArr.qcreqnum_s.push(qcreqnum);
      dataArr.qcreqseq_s.push(qcreqseq);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "Ok",
      qcgb: information.qcgb,
      qcreqdt: convertDateToStr(information.qcreqdt),
      person: information.person,
      ordnum_s: dataArr.ordnum_s.join("|"),
      ordseq_s: dataArr.ordseq_s.join("|"),
      qcreqnum_s: dataArr.qcreqnum_s.join("|"),
      qcreqseq_s: dataArr.qcreqseq_s.join("|"),
    }));
  };

  const onSaveClick2 = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );

    let valid = true;

    if (
      information.qcgb == "" ||
      information.qcgb == null ||
      information.qcgb == undefined ||
      information.person == "" ||
      information.person == undefined ||
      information.person == null ||
      convertDateToStr(information.qcreqdt).substring(0, 4) < "1997" ||
      convertDateToStr(information.qcreqdt).substring(6, 8) > "31" ||
      convertDateToStr(information.qcreqdt).substring(6, 8) < "01" ||
      convertDateToStr(information.qcreqdt).substring(6, 8).length != 2
    ) {
      valid = false;
    }

    if (dataItem.length == 0 || valid != true) return false;

    let dataArr: any = {
      ordnum_s: [],
      ordseq_s: [],
      qcreqnum_s: [],
      qcreqseq_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { ordnum = "", ordseq = "", qcreqnum = "", qcreqseq = "" } = item;

      dataArr.ordnum_s.push(ordnum);
      dataArr.ordseq_s.push(ordseq);
      dataArr.qcreqnum_s.push(qcreqnum);
      dataArr.qcreqseq_s.push(qcreqseq);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "Cancel",
      qcgb: information.qcgb,
      qcreqdt: convertDateToStr(information.qcreqdt),
      person: information.person,
      ordnum_s: dataArr.ordnum_s.join("|"),
      ordseq_s: dataArr.ordseq_s.join("|"),
      qcreqnum_s: dataArr.qcreqnum_s.join("|"),
      qcreqseq_s: dataArr.qcreqseq_s.join("|"),
    }));
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

  const [information, setInformation] = useState({
    qcgb: "A",
    qcreqdt: new Date(),
    person: userId,
  });
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
              <th>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="qcgb"
                    value={filters.qcgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="name"
                    valueField="code"
                    className="required"
                  />
                )}
              </th>
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
              <th>수주번호</th>
              <td>
                <Input
                  name="ordnum"
                  type="text"
                  value={filters.ordnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>수주완료</th>
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
              <th>프로젝트</th>
              <td>
                <Input
                  name="project"
                  type="text"
                  value={filters.project}
                  onChange={filterInputChange}
                />
              </td>
              <th>PO번호</th>
              <td>
                <Input
                  name="poregnum"
                  type="text"
                  value={filters.poregnum}
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
              <th>신청완료</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="qcyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer style={{ width: "100%" }}>
        <GridTitleContainer className="ButtonContainer">
          <FormBoxWrap>
            <FormBox>
              <tbody>
                <tr>
                  <th style={{ width: isMobile ? "100%" : "10%" }}>
                    검사신청자
                  </th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="person"
                        value={information.person}
                        bizComponentId="L_sysUserMaster_003"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        valueField="user_id"
                        textField="user_name"
                      />
                    )}
                  </td>
                  <th>검사신청일자</th>
                  <td>
                    <DatePicker
                      name="qcreqdt"
                      value={information.qcreqdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                    />
                  </td>
                  <th>검사구분</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="qcgb"
                        value={information.qcgb}
                        bizComponentId="R_QCGB"
                        bizComponentData={bizComponentData}
                        changeData={RadioChange}
                      />
                    )}
                  </td>
                  <th>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="check"
                      disabled={permissions.save ? false : true}
                    >
                      검사신청
                    </Button>
                  </th>
                  <td>
                    <Button
                      onClick={onSaveClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="close"
                      disabled={permissions.save ? false : true}
                    >
                      신청해제
                    </Button>
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName={getMenuName()}
        >
          <Grid
            style={{
              height: !isMobile ? webheight : mobileheight,
            }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                person: personListData.find(
                  (item: any) => item.user_id == row.person
                )?.user_name,
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
                      ></GridColumn>
                    )
                )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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

export default MA_A0010W;
