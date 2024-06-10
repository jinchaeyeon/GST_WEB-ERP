import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
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
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
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

const format = (formatted: string, ...argument: string[]): string => {
  let index = 0;
  argument.forEach((arg) => {
    formatted = formatted.replace("{" + index + "}", arg);
    index++;
  });

  return formatted;
};

const DATA_ITEM_KEY = "datnum";
const SUB_DATA_ITEM_KEY = "sort_seq";

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
  UseCustomOption("AC_A0070W", setCustomOptionData);

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
  const listIdGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(SUB_DATA_ITEM_KEY);
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

  const minWidthGridMaster = React.useRef<number>(0);
  const minWidthGridItem = React.useRef<number>(0);
  const gridMaster = React.useRef<any>(null);
  const gridItem = React.useRef<any>(null);

  const [currentWidthGridMaster, setCurrentWidthGridMaster] = React.useState(0);
  const [currentWidthGridItem, setCurrentWidthGridItem] = React.useState(0);

  const [applyMinWidthGridMaster, setApplyMinWidthGridMaster] =
    React.useState(false);
  const [applyMinWidthGridItem, setApplyMinWidthGridItem] =
    React.useState(false);

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

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  // 요약정보 행 변경
  useEffect(() => {
    setSubDataResult(process([], subDataState));
    setSubPgNum(1);

    if (
      Object.getOwnPropertyNames(selectedState).length > 0 &&
      selectedState[""] !== false
    ) {
      Retrieve("ITEM");
    }
  }, [selectedState]);

  const [subPgNum, setSubPgNum] = useState(1);

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
    isSearch: false, // true면 조회조건(filters) 변경 되었을때 조회
    pgNum: 1,

    location: "",
    position: "",
    acntses: "",
    acntcd: "",
    acntnm: "",
    bookregyn: "",

    find_row_value: "",

    scrollDirrection: "down",
    pgGap: 0,
  });

  const FillValuesFromDataRow = (row: any) => {
    if (row) {
      setParaData({
        datnum: row.datnum,
        acntses: row.acntses,
        location: row.location,
        position: row.position,
        acntcd: row.acntcd,
        acntnm: row.acntnm,
        custcd: row.custcd,
        custnm: row.custnm,
        balamt: row.balamt,
        amtunit: row.amtunit,
        fornamt: row.fornamt,
        chgrat: row.chgrat,
        acntbaldiv: row.acntbaldiv,
        bookregyn: row.bookregyn,
      });
    } else {
      setParaData({
        datnum: "",
        acntses: "",
        location: "",
        position: "",
        acntcd: "",
        acntnm: "",
        custcd: "",
        custnm: "",
        balamt: "",
        amtunit: "",
        fornamt: "",
        chgrat: "",
        acntbaldiv: "",
        bookregyn: "",
      });
    }
  };

  useEffect(() => {
    if (filters.isSearch) {
      // 조회가 끝나지 않음
      return;
    }

    // 선택된 행이 없거나 삭제됐을때 첫번째 행을 선택함
    if (mainDataResult.total > 0) {
      const selectedValue = Object.getOwnPropertyNames(selectedState)[0];

      if (
        selectedValue &&
        mainDataResult.data.find((row) => listIdGetter(row) == selectedValue)
      ) {
        // find_row_value
        let selectedRowIndex = mainDataResult.data.findIndex(
          (row: any) => listIdGetter(row) == selectedValue
        );

        // 첫번째 행 선택하기
        setSelectedState({
          [listIdGetter(mainDataResult.data[selectedRowIndex])]: true,
        });

        FillValuesFromDataRow(mainDataResult.data[selectedRowIndex]);

        if (gridRef.current) {
          gridRef.current.scrollIntoView({ rowIndex: selectedRowIndex });
        }
      }
    } else {
      setSelectedState({ "": false });

      FillValuesFromDataRow(null);
    }
  }, [mainDataResult]);

  const Retrieve = async (workType: string) => {
    setLoading(true);

    let datnum: string;
    let acntcd: string;
    let pgNum: number;

    if (workType == "Q") {
      datnum = "";
      acntcd = filters.acntcd;
      pgNum = filters.pgNum;
    } else if (workType == "ITEM") {
      datnum = Object.getOwnPropertyNames(selectedState)[0];
      acntcd = mainDataResult.data.find((item) => item.datnum == datnum).acntcd;
      pgNum = subPgNum;
    } else {
      datnum = "";
      acntcd = "";
      pgNum = 1;
    }

    const procedure: Iparameters = {
      procedureName: "P_AC_A0070W_Q",
      pageNumber: pgNum,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": workType,
        "@p_orgdiv": orgdiv,
        "@p_datnum": datnum,
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_acntses": filters.acntses,
        "@p_acntcd": acntcd,
        "@p_acntnm": filters.acntnm,
        "@p_bookregyn": filters.bookregyn,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    let data: any;
    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = Math.max(data.tables[0].TotalRowCount, 0); // -1인 경우 0 반환
      const rows = data.tables[0].Rows;

      if (workType == "Q") {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });

        // 스크롤에 따라 데이터를 추가할 위치 변경
        setMainDataResult((prev) => {
          return filters.scrollDirrection == "down"
            ? {
                data: [...prev.data, ...rows],
                total: totalRowCnt,
              }
            : {
                data: [...rows, ...prev.data],
                total: totalRowCnt,
              };
        });

        // find_row_value
        if (totalRowCnt > 0) {
          let selectedRow;

          if (!!filters.find_row_value) {
            selectedRow = rows.find(
              (row: any) => listIdGetter(row) == filters.find_row_value
            );
          }

          if (!selectedRow) {
            selectedRow = rows[0];
          }

          // 행 선택하기
          setSelectedState({ [listIdGetter(selectedRow)]: true });
          //
        } else {
          setSelectedState({ "": false });
        }

        setFilters((prev) => ({
          ...prev,
          pgNum: data.pageNumber,
          find_row_value: "",
          isSearch: false,
        }));
      } else if (workType == "ITEM") {
        setSubDataResult((prev) => {
          return {
            data: [...prev.data, ...rows], //data: row,
            total: totalRowCnt,
          };
        });
        const firstRowData = rows[0];
        setSelectedsubDataState({ [detailIdGetter(firstRowData)]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }

    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      Retrieve("Q");
    }
  }, [filters]);

  useEffect(() => {
    if (
      Object.getOwnPropertyNames(selectedState).length > 0 &&
      selectedState[""] !== false
    ) {
      Retrieve("ITEM");
    }
  }, [subPgNum]);

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

    FillValuesFromDataRow(selectedRowData);

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });

    setSelectedsubDataState(newSelectedState);
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

    setMainDataResult(process([], mainDataState));
    setSelectedState({ "": false });

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

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지

    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection == "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection == "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onSubScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  //그리드 건수 푸터
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

  //
  const mainFooterCell = (props: GridFooterCellProps) => {
    if (mainDataResult.total > 0 && numberField.includes(props.field ?? "")) {
      let sum = 0;
      sum = mainDataResult.data[0]["total_" + props.field] ?? undefined;

      if (sum != undefined) {
        var parts = sum.toString().split(".");

        return parts[0] != "NaN" ? (
          //style={{ textAlign: "right" }}>
          <td colSpan={props.colSpan} style={props.style}>
            {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
              (parts[1] ? "." + parts[1] : "")}
          </td>
        ) : (
          <td></td>
        );
      } else {
        return <td></td>;
      }
    } else {
      return <td></td>;
    }
  };

  //상세 그리드 푸터
  const detailTotalFooterCell = (props: GridFooterCellProps) => {
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

  const onCarryClick = () => {
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

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (!filters.acntses) {
        throw findMessage(messagesData, "AC_A0070W_004"); // 조회조건의 회기를 입력해주세요.
      } else if (!filters.bookregyn) {
        throw findMessage(messagesData, "AC_A0070W_005"); // 조회조건의 장부반영여부를 입력해주세요.
      } else {
        setMainDataResult(process([], mainDataState));
        setSelectedState({ "": false });

        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true, pgGap: 0 }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      SUB_DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = subDataResult.data.map((item) => {
        if (detailIdGetter(item) == detailIdGetter(dataItem)) {
          beforeValue.current = item[field];

          return {
            ...item,
            [EDIT_FIELD]: field,
          };
        } else {
          return {
            ...item,
            [EDIT_FIELD]: undefined,
          };
        }
      });

      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = subDataResult.data.map((item) => {
      if (!!item[EDIT_FIELD]) {
        const field = item[EDIT_FIELD];

        const changed = item[field] != beforeValue.current;

        if (changed) {
          return {
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
          };
        } else {
          return {
            ...item,
            [EDIT_FIELD]: undefined,
          };
        }
      } else {
        return {
          ...item,
          [EDIT_FIELD]: undefined,
        };
      }
    });

    setSubDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
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
    balamt: "",
    amtunit: "",
    fornamt: "",
    chgrat: "",
    acntbaldiv: "",
    bookregyn: "",
  });

  const onSaveClick = async () => {
    let workType: string;

    workType = selectedState[""] == false ? "N" : "U";

    ExecuteSave(workType);
  };

  const onDeleteClick = async () => {
    ExecuteSave("D");
  };

  const ExecuteSave = async (workType: string) => {
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
      const dataDetail = subDataResult.data;

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
    // else if (workType == "D") {
    //   const dataList = mainDataResult.data;

    //   dataList.forEach((item) => {
    //     const {
    //       chk,
    //       datnum
    //     } = item;

    //     if (chk == true) {
    //       datnums.push(datnum);
    //     }
    //   });
    // }

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
        "@p_datnum_s": "", //datnums.join("|"),

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
      setMainDataResult(process([], mainDataState));
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        find_row_value: data.returnString,
      }));
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
        <Title>기초잔액</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_A0070W"
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
                      [SELECTED_FIELD]: selectedState[listIdGetter(item)],
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
                                  : mainFooterCell
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
                  >
                    저장
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
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
                data={subDataResult.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="기초잔액"
              >
                <Grid
                  style={{ height: mobileheight3 }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      rowstatus: !row.rowstatus ? "" : row.rowstatus,
                      [SELECTED_FIELD]:
                        selectedsubDataState[detailIdGetter(row)],
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
                  onSelectionChange={onSubDataSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subDataResult.total}
                  onScroll={onSubScrollHandler}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubDataSortChange}
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
                                  ? detailTotalFooterCell
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
                      [SELECTED_FIELD]: selectedState[listIdGetter(item)],
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
                                  : mainFooterCell
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
                  >
                    저장
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
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
                  data={subDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="기초잔액"
                >
                  <Grid
                    style={{ height: webheight2 }} // 65
                    data={process(
                      subDataResult.data.map((row) => ({
                        ...row,
                        rowstatus: !row.rowstatus ? "" : row.rowstatus,
                        [SELECTED_FIELD]:
                          selectedsubDataState[detailIdGetter(row)],
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
                    onSelectionChange={onSubDataSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={subDataResult.total}
                    onScroll={onSubScrollHandler}
                    //정렬기능
                    sortable={true}
                    onSortChange={onSubDataSortChange}
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
                                    ? detailTotalFooterCell
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
          modal={false}
        />
      )}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAccountData}
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
