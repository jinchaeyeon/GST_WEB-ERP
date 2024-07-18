import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
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
import {
  Checkbox,
  Input,
  InputChangeEvent,
} from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  toDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AccountWindow from "../components/Windows/CommonWindows/AccountWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import StandardWindow from "../components/Windows/CommonWindows/StandardWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_A0070W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

let targetRowIndex: null | number = null;

const format = (formatted: string, ...argument: string[]): string => {
  let index = 0;
  argument.forEach((arg) => {
    formatted = formatted.replace("{" + index + "}", arg);
    index++;
  });

  return formatted;
};

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";

const requiredField: string[] = ["mngitemcd"];

const checkBoxField: string[] = ["bookregyn"];

const numberField: string[] = ["cbalamt", "dbalamt"];

const readOnlyField: string[] = ["mngdatanm", "mngitemnm"];

const ColumnCommandCell = (props: any) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;

  const [popupData, setPopupData] = React.useState<any>();

  useEffect(() => {
    if (popupData) {
      dataItem["mngdata"] = popupData.item1;
      dataItem["mngdatanm"] = popupData.item2;
      dataItem.rowstatus = dataItem.rowstatus == "N" ? "N" : "U";

      if (onChange) {
        onChange({
          dataItem: dataItem,
          dataIndex: 0,
          field: "mngdata",
          value: dataItem["mngdata"],
        });

        onChange({
          dataItem: dataItem,
          dataIndex: 0,
          field: "mngdatanm",
          value: dataItem["mngdatanm"],
        });

        onChange({
          dataItem: dataItem,
          dataIndex: 0,
          field: "rowstatus",
          value: dataItem["rowstatus"],
        });
      }
    }
  }, [popupData]);

  let isInEdit = field == dataItem.inEdit;
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

  const [standardWindowVisible, setStandardWindowVisible] =
    useState<boolean>(false);
  const onStandardClick = () => {
    setStandardWindowVisible(true);
  };

  let defaultRendering: React.JSX.Element;

  const controltype = dataItem.controltype;

  if (controltype == "B") {
    defaultRendering = (
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
            name={field}
            onClick={onStandardClick}
            icon="more-horizontal"
            fillMode="flat"
          />
        </ButtonInGridInput>
      </td>
    );
  } else if (controltype == "D") {
    const newItem = Object.assign({}, props.dataItem);

    newItem.mngdata = toDate(newItem.mngdata);

    defaultRendering = isInEdit ? (
      <DateCell {...props} dataItem={newItem} />
    ) : (
      <td
        className={className}
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
        style={{ position: "relative" }}
      >
        {value}
      </td>
    );
  } else {
    defaultRendering = (
      <td
        className={className}
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
        style={{ position: "relative" }}
      >
        {value}
      </td>
    );
  }

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {standardWindowVisible && (
        <StandardWindow
          setVisible={setStandardWindowVisible}
          workType={"ROW_ADD"}
          setData={setPopupData}
          mngitemcd={{
            mngitemcd1: dataItem.mngitemcd,
            mngitemcd2: "",
            mngitemcd3: "",
            mngitemcd4: "",
            mngitemcd5: "",
            mngitemcd6: "",
          }}
          index={1}
          modal={true}
        />
      )}
    </>
  );
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const AC_A0070W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  var index = 0;

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
      height4 = getHeight(".ButtonContainer4");
      height5 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height5);
        setMobileHeight2(getDeviceHeight(true) - height2 - height5);
        setMobileHeight3(getDeviceHeight(true) - height4 - height5);
        setWebHeight(getDeviceHeight(true) - height - height5);
        setWebHeight2(
          getDeviceHeight(true) - height2 - height3 - height4 - height5
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const gridRef: any = useRef<any>(null);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  //폼 메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_A0070W", setMessagesData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_DRCR, L_AC061, L_BA002, L_BA020, L_BA028",
    setBizComponentData
  );

  let beforeValue: any = React.useRef<any>();

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && bizComponentData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      const bizComponent = bizComponentData?.find(
        (item: any) => item.bizComponentId == "L_AC061" // 회기
      );

      const today = convertDateToStr(new Date());

      const acntses =
        bizComponent?.data.Rows?.find(
          (item: any) =>
            item.extra_field1 <= today && today <= item.extra_field2
        )?.sub_code ?? "";

      setFilters((prev) => ({
        ...prev,
        location:
          defaultOption?.find((item: any) => item.id == "location")
            ?.valueCode ?? "",
        position:
          defaultOption?.find((item: any) => item.id == "position")
            ?.valueCode ?? "",
        bookregyn:
          defaultOption?.find((item: any) => item.id == "bookregyn")
            ?.valueCode ?? "",
        acntses: acntses,
        isSearch: true,
      }));
    }
  }, [customOptionData, bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      setParaData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const CheckChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      if (value == false || value == "N") {
        setParaData((prev) => ({
          ...prev,
          [name]: "N",
        }));
      } else {
        setParaData((prev) => ({
          ...prev,
          [name]: "Y",
        }));
      }
    }
  };

  //Form정보 Change함수
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setParaData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setParaData((prev) => ({
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

  //조회조건
  const [filters, setFilters] = useState({
    workType: "Q",
    isSearch: false, // true면 조회조건(filters) 변경 되었을때 조회
    pgNum: 1,
    location: "",
    position: "",
    acntses: "",
    acntcd: "",
    acntnm: "",
    bookregyn: "",
    find_row_value: "",
  });

  //조회조건
  const [filters2, setFilters2] = useState({
    workType: "ITEM",
    isSearch: false, // true면 조회조건(filters) 변경 되었을때 조회
    datnum: "",
    acntcd: "",
    pgNum: 1,
    find_row_value: "",
  });

  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_AC_A0070W_Q",
      pageNumber: filters.pgNum,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": orgdiv,
        "@p_datnum": "",
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_acntses": filters.acntses,
        "@p_acntcd": filters.acntcd,
        "@p_acntnm": filters.acntnm,
        "@p_bookregyn": filters.bookregyn,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    let data: any;
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
            (row: any) => row.datnum == filters.find_row_value
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.datnum == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            pgNum: 1,
            datnum: selectedRow.datnum,
            acntcd: selectedRow.acntcd,
            isSearch: true,
          }));
          setParaData({
            datnum: selectedRow.datnum,
            acntses: selectedRow.acntses,
            location: selectedRow.location,
            position: selectedRow.position,
            acntcd: selectedRow.acntcd,
            acntnm: selectedRow.acntnm,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            balamt: selectedRow.balamt,
            amtunit: selectedRow.amtunit,
            fornamt: selectedRow.fornamt,
            chgrat: selectedRow.chgrat,
            acntbaldiv: selectedRow.acntbaldiv,
            bookregyn: selectedRow.bookregyn,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            pgNum: 1,
            datnum: rows[0].datnum,
            acntcd: rows[0].acntcd,
            isSearch: true,
          }));
          setParaData({
            datnum: rows[0].datnum,
            acntses: rows[0].acntses,
            location: rows[0].location,
            position: rows[0].position,
            acntcd: rows[0].acntcd,
            acntnm: rows[0].acntnm,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            balamt: rows[0].balamt,
            amtunit: rows[0].amtunit,
            fornamt: rows[0].fornamt,
            chgrat: rows[0].chgrat,
            acntbaldiv: rows[0].acntbaldiv,
            bookregyn: rows[0].bookregyn,
          });
        }
      } else {
        setMainDataResult2(process([], mainDataState2));
        setParaData({
          datnum: "",

          acntses: "",
          location: "",
          position: "",
          acntcd: "",
          acntnm: "",
          custcd: "",
          custnm: "",
          balamt: 0,
          amtunit: "",
          fornamt: 0,
          chgrat: 0,
          acntbaldiv: "",
          bookregyn: "",
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

  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    setLoading(true);

    const procedure: Iparameters = {
      procedureName: "P_AC_A0070W_Q",
      pageNumber: filters2.pgNum,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "ITEM",
        "@p_orgdiv": orgdiv,
        "@p_datnum": filters2.datnum,
        "@p_location": "",
        "@p_position": "",
        "@p_acntses": "",
        "@p_acntcd": filters2.acntcd,
        "@p_acntnm": "",
        "@p_bookregyn": "",
        "@p_find_row_value": "",
      },
    };

    let data: any;
    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);

      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, bizComponentData, customOptionData]);

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
    setParaData({
      datnum: selectedRowData.datnum,
      acntses: selectedRowData.acntses,
      location: selectedRowData.location,
      position: selectedRowData.position,
      acntcd: selectedRowData.acntcd,
      acntnm: selectedRowData.acntnm,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      balamt: selectedRowData.balamt,
      amtunit: selectedRowData.amtunit,
      fornamt: selectedRowData.fornamt,
      chgrat: selectedRowData.chgrat,
      acntbaldiv: selectedRowData.acntbaldiv,
      bookregyn: selectedRowData.bookregyn,
    });
    setFilters2((prev) => ({
      ...prev,
      datnum: selectedRowData.datnum,
      acntcd: selectedRowData.acntcd,
      isSearch: true,
      pgNum: 1,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "요약정보";
      optionsGridOne.sheets[1].title = "관리항목";
      _export.save(optionsGridOne);
    }
  };

  // 페이지 변경 이벤트
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / page.take) + 1,
      isSearch: true,
      pgGap: 0,
    }));

    setPage({
      skip: page.skip,
      take: page.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / page.take) + 1,
      isSearch: true,
      pgGap: 0,
    }));

    setPage2({
      skip: page.skip,
      take: page.take,
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
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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

  const onCarryClick = () => {
    if (!permissions.save) return;
    if (!filters.acntses) {
      alert(findMessage(messagesData, "AC_A0070W_004")); // 조회조건의 회기를 입력해주세요.
    }

    const acntsesnm =
      bizComponentData
        ?.find(
          (item: any) => item.bizComponentId == "L_AC061" // 회기
        )
        ?.data?.Rows?.find((item: any) => item.sub_code == filters.acntses)
        ?.code_name ?? "";

    const msg = format(findMessage(messagesData, "AC_A0070W_002"), acntsesnm); // 해당 회기({0})를 이월처리 하시겠습니까?

    if (!window.confirm(msg)) {
      return;
    }

    ExecuteSave("CARRY").then((isSuccess) => {
      if (isSuccess) {
        alert(findMessage(messagesData, "AC_A0070W_003")); // 이월 처리가 완료됐습니다.
      }
    });
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (!filters.acntses) {
        throw findMessage(messagesData, "AC_A0070W_004"); // 조회조건의 회기를 입력해주세요.
      } else if (!filters.bookregyn) {
        throw findMessage(messagesData, "AC_A0070W_005"); // 조회조건의 장부반영여부를 입력해주세요.
      } else {
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "files") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev: { total: any }) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
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
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
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

  const [paraData, setParaData] = useState({
    datnum: "",
    acntses: "",
    location: "",
    position: "",
    acntcd: "",
    acntnm: "",
    custcd: "",
    custnm: "",
    balamt: 0,
    amtunit: "",
    fornamt: 0,
    chgrat: 0,
    acntbaldiv: "",
    bookregyn: "",
  });

  const onSaveClick = async () => {
    if (!permissions.save) return;
    let workType: string;

    workType = selectedState[""] == false ? "N" : "U";

    ExecuteSave(workType);
  };

  const onDeleteClick = async () => {
    if (!permissions.delete) return;
    ExecuteSave("D");
  };

  const ExecuteSave = async (workType: string) => {
    if (workType == "D" && !permissions.delete) return;
    if (workType != "D" && !permissions.save) return;

    try {
      if (workType != "CARRY") {
        if (!paraData.acntses) {
          throw findMessage(messagesData, "AC_A0070W_006"); // 상세정보의 회기를 입력해주세요.
        }

        if (!paraData.amtunit) {
          throw findMessage(messagesData, "AC_A0070W_007"); // 상세정보의 화폐단위를 입력해주세요.
        }

        if (!paraData.acntbaldiv) {
          throw findMessage(messagesData, "AC_A0070W_008"); // 상세정보의 계정잔액구분를 입력해주세요.
        }
      }
    } catch (e) {
      alert(e);
      return false;
    }

    let acntses = "";

    let mngitemcds: any[] = new Array(6);
    let mngdatas: any[] = new Array(6);
    let mngdatanms: any[] = new Array(6);

    //let datnums: any[] = [];

    if (workType == "N" || workType == "U") {
      const dataDetail = mainDataResult2.data;

      dataDetail.forEach((item) => {
        const { sort_seq, mngitemcd, mngdata, mngdatanm } = item;

        const index = sort_seq - 1;

        mngitemcds[index] = mngitemcd;
        mngdatas[index] = mngdata;
        mngdatanms[index] = mngdatanm;
      });

      acntses = paraData.acntses;
    } else if (workType == "CARRY") {
      acntses = filters.acntses;
    }

    setLoading(true);

    const procedure: Iparameters = {
      procedureName: "P_AC_A0070W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": workType,

        "@p_orgdiv": orgdiv,

        "@p_datnum": paraData.datnum,
        "@p_location": paraData.location,
        "@p_position": paraData.position,
        "@p_acntcd": paraData.acntcd,
        "@p_acntses": acntses,
        "@p_mngitemcd1": mngitemcds[0] ?? "",
        "@p_mngitemcd2": mngitemcds[1] ?? "",
        "@p_mngitemcd3": mngitemcds[2] ?? "",
        "@p_mngitemcd4": mngitemcds[3] ?? "",
        "@p_mngitemcd5": mngitemcds[4] ?? "",
        "@p_mngitemcd6": mngitemcds[5] ?? "",
        "@p_mngdata1": mngdatas[0] ?? "",
        "@p_mngdata2": mngdatas[1] ?? "",
        "@p_mngdata3": mngdatas[2] ?? "",
        "@p_mngdata4": mngdatas[3] ?? "",
        "@p_mngdata5": mngdatas[4] ?? "",
        "@p_mngdata6": mngdatas[5] ?? "",
        "@p_mngdatanm1": mngdatanms[0] ?? "",
        "@p_mngdatanm2": mngdatanms[1] ?? "",
        "@p_mngdatanm3": mngdatanms[2] ?? "",
        "@p_mngdatanm4": mngdatanms[3] ?? "",
        "@p_mngdatanm5": mngdatanms[4] ?? "",
        "@p_mngdatanm6": mngdatanms[5] ?? "",
        "@p_custcd": paraData.custcd,
        "@p_balamt": paraData.balamt,
        "@p_acntbaldiv": paraData.acntbaldiv,
        "@p_fornamt": paraData.fornamt,
        "@p_amtunit": paraData.amtunit,
        "@p_chgrat": paraData.chgrat,
        "@p_bookregyn": paraData.bookregyn,
        "@p_datnum_s": "",

        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "AC_A0070W",
      },
    };

    let data: any;

    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }

    let isSuccess: boolean = data.isSuccess;

    if (isSuccess) {
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
        find_row_value: data.returnString,
      }));
      setParaData({
        datnum: "",
        acntses: "",
        location: "",
        position: "",
        acntcd: "",
        acntnm: "",
        custcd: "",
        custnm: "",
        balamt: 0,
        amtunit: "",
        fornamt: 0,
        chgrat: 0,
        acntbaldiv: "",
        bookregyn: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);

    return isSuccess;
  };

  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);
  const [customerWindowVisible, setCustomerWindowVisible] =
    useState<boolean>(false);

  const [windowOwner, setWindowOwner] = useState<"filter" | "master">("filter");

  const onFilterAccountClick = () => {
    setWindowOwner("filter");
    setAccountWindowVisible(true);
  };

  const onMasterAccountClick = () => {
    setWindowOwner("master");
    setAccountWindowVisible(true);
  };

  const onMasterCustomerClick = () => {
    setCustomerWindowVisible(true);
  };

  const setAccountData = (data: any) => {
    if (windowOwner == "filter") {
      setFilters((prev) => ({
        ...prev,
        acntcd: data.acntcd,
        acntnm: data.acntnm,
      }));
    } else if (windowOwner == "master") {
      setParaData((prev) => ({
        ...prev,
        acntcd: data.acntcd,
        acntnm: data.acntnm,
      }));
    }
  };

  const setCustData = (data: any) => {
    setParaData((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
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
              <th>회기</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="acntses"
                    value={filters.acntses}
                    bizComponentId="L_AC061"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    className="required"
                    textField="code_name"
                    valueField="sub_code"
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="location"
                    value={filters.location}
                    bizComponentId="L_BA002"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField="code_name"
                    valueField="sub_code"
                  />
                )}
              </td>
              <th>사업부</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="position"
                    value={filters.position}
                    bizComponentId="L_BA028"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField="code_name"
                    valueField="sub_code"
                  />
                )}
              </td>
              <th>계정코드</th>
              <td>
                <Input
                  name="acntcd"
                  type="text"
                  value={filters.acntcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onFilterAccountClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              {/* <th>계정명</th> */}
              <td>
                <Input
                  name="acntnm"
                  type="text"
                  value={filters.acntnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>장부반영여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="bookregyn"
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
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    {"요약정보"}
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="chevron-right"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                  </ButtonContainer>
                </GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onCarryClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="redo"
                    disabled={permissions.save ? false : true}
                  >
                    회계이월처리
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="기초잔액"
              >
                <Grid
                  style={{ height: mobileheight }} //76vh
                  data={process(
                    mainDataResult.data.map((item) => ({
                      ...item,
                      [SELECTED_FIELD]: selectedState[idGetter(item)],
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
                    customOptionData.menuCustomColumnOptions["grdMaster"]
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
                              cell={
                                checkBoxField.includes(item.fieldName)
                                  ? CheckBoxCell
                                  : numberField.includes(item.fieldName)
                                  ? NumberCell
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
          <SwiperSlide key={1}>
            <GridContainer style={{ width: "100%" }}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="chevron-left"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                      {"상세정보"}
                    </ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(2);
                        }
                      }}
                      icon="chevron-right"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                  </ButtonContainer>
                </GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                    disabled={permissions.delete ? false : true}
                  >
                    삭제
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap
                border={true}
                style={{ height: mobileheight2, overflow: "auto" }}
              >
                <FormBox>
                  <tbody>
                    <tr>
                      <th>회기</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="acntses"
                            value={paraData.acntses}
                            bizComponentId="L_AC061"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            className="required"
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>사업장</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="location"
                            value={paraData.location}
                            bizComponentId="L_BA002"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                      </td>
                      <th>사업부</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="position"
                            value={paraData.position}
                            bizComponentId="L_BA028"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>계정과목</th>
                      <td>
                        <Input
                          name="acntcd"
                          type="text"
                          value={paraData.acntcd}
                          onChange={InputChange}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onMasterAccountClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      {/* <th>계정과목명</th> */}
                      <td colSpan={2}>
                        <Input
                          name="acntnm"
                          type="text"
                          value={paraData.acntnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>업체</th>
                      <td>
                        <Input
                          name="custcd"
                          type="text"
                          value={paraData.custcd}
                          onChange={InputChange}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onMasterCustomerClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      {/* <th>업체명</th> */}
                      <td colSpan={2}>
                        <Input
                          name="custnm"
                          type="text"
                          value={paraData.custnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>잔액</th>
                      <td>
                        <Input
                          name="balamt"
                          type="number"
                          value={paraData.balamt}
                          onChange={InputChange}
                        />
                      </td>
                      <th>화폐단위</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="amtunit"
                            value={paraData.amtunit}
                            bizComponentId="L_BA020"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            className="required"
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>외화금액</th>
                      <td>
                        <Input
                          name="fornamt"
                          type="number"
                          value={paraData.fornamt}
                          onChange={InputChange}
                        />
                      </td>
                      <th>환율</th>
                      <td>
                        <Input
                          name="chgrat"
                          type="number"
                          value={paraData.chgrat}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>계정잔액구분</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="acntbaldiv"
                            value={paraData.acntbaldiv}
                            bizComponentId="R_DRCR"
                            bizComponentData={bizComponentData}
                            changeData={RadioChange}
                          />
                        )}
                      </td>
                      <th>장부반영여부</th>
                      <td>
                        <Checkbox
                          name="bookregyn"
                          value={paraData.bookregyn == "Y" ? true : false}
                          onChange={CheckChange}
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
              <GridTitleContainer className="ButtonContainer4">
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "left" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="chevron-left"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                    관리항목
                  </ButtonContainer>
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="기초잔액"
              >
                <Grid
                  style={{ height: mobileheight3 }}
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
                  onItemChange={onSubItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdItem"]
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
                              className={
                                readOnlyField.includes(item.fieldName)
                                  ? "read-only"
                                  : undefined
                              }
                              headerCell={
                                requiredField.includes(item.fieldName)
                                  ? RequiredHeader
                                  : undefined
                              }
                              cell={
                                item.fieldName == "mngdata"
                                  ? ColumnCommandCell
                                  : checkBoxField.includes(item.fieldName)
                                  ? CheckBoxCell
                                  : undefined
                              }
                              editable={
                                readOnlyField.includes(item.fieldName)
                                  ? false
                                  : true
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
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`60%`}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>요약정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onCarryClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="redo"
                    disabled={permissions.save ? false : true}
                  >
                    회계이월처리
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="기초잔액"
              >
                <Grid
                  style={{ height: webheight }} //76vh
                  data={process(
                    mainDataResult.data.map((item) => ({
                      ...item,
                      [SELECTED_FIELD]: selectedState[idGetter(item)],
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  ref={gridRef} //{(g) => {gridRef = g;}}
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
                  //onScroll={onMainScrollHandler}
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
                    customOptionData.menuCustomColumnOptions["grdMaster"]
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
                              cell={
                                checkBoxField.includes(item.fieldName)
                                  ? CheckBoxCell
                                  : numberField.includes(item.fieldName)
                                  ? NumberCell
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
            <GridContainer width={`calc(40% - ${GAP}px)`}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                    disabled={permissions.delete ? false : true}
                  >
                    삭제
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true} className="ButtonContainer3">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>회기</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="acntses"
                            value={paraData.acntses}
                            bizComponentId="L_AC061"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            className="required"
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>사업장</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="location"
                            value={paraData.location}
                            bizComponentId="L_BA002"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                      </td>
                      <th>사업부</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="position"
                            value={paraData.position}
                            bizComponentId="L_BA028"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>계정과목</th>
                      <td>
                        <Input
                          name="acntcd"
                          type="text"
                          value={paraData.acntcd}
                          onChange={InputChange}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onMasterAccountClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      {/* <th>계정과목명</th> */}
                      <td colSpan={2}>
                        <Input
                          name="acntnm"
                          type="text"
                          value={paraData.acntnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>업체</th>
                      <td>
                        <Input
                          name="custcd"
                          type="text"
                          value={paraData.custcd}
                          onChange={InputChange}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onMasterCustomerClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      {/* <th>업체명</th> */}
                      <td colSpan={2}>
                        <Input
                          name="custnm"
                          type="text"
                          value={paraData.custnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>잔액</th>
                      <td>
                        <Input
                          name="balamt"
                          type="number"
                          value={paraData.balamt}
                          onChange={InputChange}
                        />
                      </td>
                      <th>화폐단위</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="amtunit"
                            value={paraData.amtunit}
                            bizComponentId="L_BA020"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            className="required"
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>외화금액</th>
                      <td>
                        <Input
                          name="fornamt"
                          type="number"
                          value={paraData.fornamt}
                          onChange={InputChange}
                        />
                      </td>
                      <th>환율</th>
                      <td>
                        <Input
                          name="chgrat"
                          type="number"
                          value={paraData.chgrat}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>계정잔액구분</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="acntbaldiv"
                            value={paraData.acntbaldiv}
                            bizComponentId="R_DRCR"
                            bizComponentData={bizComponentData}
                            changeData={RadioChange}
                          />
                        )}
                      </td>
                      <th>장부반영여부</th>
                      <td>
                        <Checkbox
                          name="bookregyn"
                          value={paraData.bookregyn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer4">
                  <GridTitle>관리항목</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="기초잔액"
                >
                  <Grid
                    style={{ height: webheight2 }} // 65
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
                    onItemChange={onSubItemChange}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="50px" />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdItem"]
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
                                className={
                                  readOnlyField.includes(item.fieldName)
                                    ? "read-only"
                                    : undefined
                                }
                                headerCell={
                                  requiredField.includes(item.fieldName)
                                    ? RequiredHeader
                                    : undefined
                                }
                                cell={
                                  item.fieldName == "mngdata"
                                    ? ColumnCommandCell
                                    : checkBoxField.includes(item.fieldName)
                                    ? CheckBoxCell
                                    : undefined
                                }
                                editable={
                                  readOnlyField.includes(item.fieldName)
                                    ? false
                                    : true
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {customerWindowVisible && (
        <CustomersWindow
          setVisible={setCustomerWindowVisible}
          workType={""}
          setData={setCustData}
          modal={true}
        />
      )}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAccountData}
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

export default AC_A0070W;
