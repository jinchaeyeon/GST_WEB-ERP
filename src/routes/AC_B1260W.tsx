import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartSeries,
  ChartSeriesItem,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
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
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  DDGDcolorList,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
  WebErpcolorList,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";

var height = 0;
var height2 = 0;
var height3 = 0;

const AC_B1260W: React.FC = () => {
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [mobileheight6, setMobileHeight6] = useState(0);
  const [mobileheight7, setMobileHeight7] = useState(0);
  const [mobileheight8, setMobileHeight8] = useState(0);
  const [mobileheight9, setMobileHeight9] = useState(0);
  const [mobileheight10, setMobileHeight10] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [webheight5, setWebHeight5] = useState(0);
  const [webheight6, setWebHeight6] = useState(0);
  const [webheight7, setWebHeight7] = useState(0);
  const [webheight8, setWebHeight8] = useState(0);
  const [webheight9, setWebHeight9] = useState(0);
  const [webheight10, setWebHeight10] = useState(0);
  //커스텀 옵션 조회
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [tabSelected, setTabSelected] = React.useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".k-tabstrip-items-wrapper");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight3(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight4(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight5(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight6(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight7(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight8(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight9(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight10(getDeviceHeight(true) - height - height2 - height3);
        setWebHeight((getDeviceHeight(true) - height2 - height3) / 2);
        setWebHeight2((getDeviceHeight(true) - height2 - height3) / 2);
        setWebHeight3((getDeviceHeight(true) - height2 - height3) / 2);
        setWebHeight4((getDeviceHeight(true) - height2 - height3) / 2);
        setWebHeight5((getDeviceHeight(true) - height2 - height3) / 2);
        setWebHeight6((getDeviceHeight(true) - height2 - height3) / 2);
        setWebHeight7((getDeviceHeight(true) - height2 - height3) / 2);
        setWebHeight8((getDeviceHeight(true) - height2 - height3) / 2);
        setWebHeight9((getDeviceHeight(true) - height2 - height3) / 2);
        setWebHeight10((getDeviceHeight(true) - height2 - height3) / 2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [
    customOptionData,
    tabSelected,
    webheight,
    webheight2,
    webheight3,
    webheight4,
    webheight5,
    webheight6,
    webheight7,
    webheight8,
    webheight9,
    webheight10,
  ]);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        acntnm: defaultOption.find((item: any) => item.id == "acntnm")
          ?.valueCode,
        amtunit: defaultOption.find((item: any) => item.id == "amtunit")
          ?.valueCode,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    yyyymm: new Date(),
    acntcd: "",
    acntnm: "",
    amtunit: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchGrid = async (workType: string) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B1260W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substr(0, 6),
        "@p_acntcd": filters.acntcd,
        "@p_acntnm": filters.acntnm,
        "@p_amtunit": filters.amtunit,
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      if (
        workType == "LIST1" ||
        workType == "LIST2" ||
        workType == "LIST3" ||
        workType == "LIST4" ||
        workType == "LIST5"
      ) {
        const totalRowCnt = data.tables[0].TotalRowCount;
        setGridDataResult((prev) => {
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
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }

        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      }

      // 전체 탭 그래프 (업체별 데이터로 가공)
      else if (
        workType == "CHART1" ||
        workType == "CHART2" ||
        workType == "CHART3" ||
        workType == "CHART4" ||
        workType == "CHART5"
      ) {
        let newRows: any = { companies: [], series: [] };

        rows.forEach((row: any) => {
          if (!newRows.companies.includes(row.argument)) {
            newRows.companies.push(row.argument);
            newRows.series.push(row.value);
          }
        });

        setAllChartDataResult({
          companies: newRows.companies,
          series: newRows.series,
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));

      if (tabSelected == 0) {
        fetchGrid("LIST1");
        fetchGrid("CHART1");
      } else if (tabSelected == 1) {
        fetchGrid("LIST2");
        fetchGrid("CHART2");
      } else if (tabSelected == 2) {
        fetchGrid("LIST3");
        fetchGrid("CHART3");
      } else if (tabSelected == 3) {
        fetchGrid("LIST4");
        fetchGrid("CHART4");
      } else if (tabSelected == 4) {
        fetchGrid("LIST5");
        fetchGrid("CHART5");
      }
    }
  }, [filters, permissions, customOptionData]);

  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "제조경비";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "판매관리비";
        _export2.save(optionsGridTwo);
      }
    }
    if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridThree = _export3.workbookOptions();
        optionsGridThree.sheets[0].title = "매출액";
        _export3.save(optionsGridThree);
      }
    }
    if (_export4 !== null && _export4 !== undefined) {
      if (tabSelected == 3) {
        const optionsGridFour = _export4.workbookOptions();
        optionsGridFour.sheets[0].title = "영업외손익";
        _export4.save(optionsGridFour);
      }
    }
    if (_export5 !== null && _export5 !== undefined) {
      if (tabSelected == 4) {
        const optionsGridFive = _export5.workbookOptions();
        optionsGridFive.sheets[0].title = "특별손익";
        _export5.save(optionsGridFive);
      }
    }
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.yyyymm).substring(0, 4) < "1997" ||
        convertDateToStr(filters.yyyymm).substring(6, 8) > "31" ||
        convertDateToStr(filters.yyyymm).substring(6, 8) < "01" ||
        convertDateToStr(filters.yyyymm).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B1260W_001");
      } else {
        setDates(
          convertDateToStr(filters.yyyymm).substring(0, 4) +
            "년" +
            convertDateToStr(filters.yyyymm).substring(4, 6) +
            "월"
        );
        setDates2(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 1,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 1,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates3(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 2,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 2,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates4(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 3,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 3,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates5(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 4,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 4,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates6(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 5,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 5,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates7(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 6,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 6,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates8(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 7,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 7,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates9(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 8,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 8,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates10(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 9,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 9,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates11(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 10,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 10,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        setDates12(
          convertDateToStr(
            new Date(
              filters.yyyymm.getFullYear(),
              filters.yyyymm.getMonth() + 11,
              filters.yyyymm.getDate()
            )
          ).substring(0, 4) +
            "년" +
            convertDateToStr(
              new Date(
                filters.yyyymm.getFullYear(),
                filters.yyyymm.getMonth() + 11,
                filters.yyyymm.getDate()
              )
            ).substring(4, 6) +
            "월"
        );
        resetGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
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
  //그리드 리셋
  const resetGrid = () => {
    setGridDataResult(process([], gridDataState));
  };
  const idGetter = getter(DATA_ITEM_KEY);
  const [gridDataState, setGridDataState] = useState<State>({
    sort: [],
  });

  const [gridDataResult, setGridDataResult] = useState<DataResult>(
    process([], gridDataState)
  );
  const [allChartDataResult, setAllChartDataResult] = useState({
    companies: [""],
    series: [0],
  });

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetGrid();
  };

  useEffect(() => {
    search();
  }, [tabSelected]);

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onGridDataStateChange = (event: GridDataStateChangeEvent) => {
    setGridDataState(event.dataState);
  };
  //그리드 푸터

  const gridTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {gridDataResult.total}건
      </td>
    );
  };
  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    gridDataResult.data.forEach((item) =>
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

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onGridSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onGridSortChange = (e: any) => {
    setGridDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  let gridRef: any = useRef(null);

  const [dates, setDates] = useState<string>(
    convertDateToStr(filters.yyyymm).substring(0, 4) +
      "년" +
      convertDateToStr(filters.yyyymm).substring(4, 6) +
      "월"
  );
  const [dates2, setDates2] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 1,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 1,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates3, setDates3] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 2,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 2,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates4, setDates4] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 3,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 3,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates5, setDates5] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 4,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 4,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates6, setDates6] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 5,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 5,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );

  const [dates7, setDates7] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 6,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 6,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates8, setDates8] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 7,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 7,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates9, setDates9] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 8,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 8,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates10, setDates10] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 9,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 9,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates11, setDates11] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 10,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 10,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
  const [dates12, setDates12] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyymm.getFullYear(),
        filters.yyyymm.getMonth() + 11,
        filters.yyyymm.getDate()
      )
    ).substring(0, 4) +
      "년" +
      convertDateToStr(
        new Date(
          filters.yyyymm.getFullYear(),
          filters.yyyymm.getMonth() + 11,
          filters.yyyymm.getDate()
        )
      ).substring(4, 6) +
      "월"
  );
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
              <th>기준일자</th>
              <td>
                <DatePicker
                  name="yyyymm"
                  value={filters.yyyymm}
                  format="yyyy-MM"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={MonthCalendar}
                />
              </td>
              <th>계정명</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="acntnm"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>단위</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="amtunit"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="제조경비"
          disabled={permissions.view ? false : true}
        >
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
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        테이블 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: mobileheight }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                      >
                        차트 보기
                      </Button>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName="단축코드별집계"
                  >
                    <Grid
                      style={{ height: mobileheight2 }}
                      data={process(
                        gridDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        gridDataState
                      )}
                      {...gridDataState}
                      onDataStateChange={onGridDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onGridSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={gridDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onGridSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        field="acntnm"
                        title="계정과목명"
                        width="120px"
                        footerCell={gridTotalFooterCell}
                      />
                      <GridColumn
                        field="stdrmkcd"
                        title="단축코드"
                        width="120px"
                      />
                      <GridColumn
                        field="amt1"
                        title={dates}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt2"
                        title={dates2}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt3"
                        title={dates3}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt4"
                        title={dates4}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt5"
                        title={dates5}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt6"
                        title={dates6}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt7"
                        title={dates7}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt8"
                        title={dates8}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt9"
                        title={dates9}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt10"
                        title={dates10}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt11"
                        title={dates11}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt12"
                        title={dates12}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="totamt"
                        title="총계"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainer width="100%">
                <GridContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: webheight }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>

                <ExcelExport
                  data={gridDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="단축코드별집계"
                >
                  <Grid
                    style={{ height: webheight2 }}
                    data={process(
                      gridDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      gridDataState
                    )}
                    {...gridDataState}
                    onDataStateChange={onGridDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onGridSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={gridDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onGridSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="acntnm"
                      title="계정과목명"
                      width="120px"
                      footerCell={gridTotalFooterCell}
                    />
                    <GridColumn
                      field="stdrmkcd"
                      title="단축코드"
                      width="120px"
                    />
                    <GridColumn
                      field="amt1"
                      title={dates}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt2"
                      title={dates2}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt3"
                      title={dates3}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt4"
                      title={dates4}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt5"
                      title={dates5}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt6"
                      title={dates6}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt7"
                      title={dates7}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt8"
                      title={dates8}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt9"
                      title={dates9}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt10"
                      title={dates10}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt11"
                      title={dates11}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt12"
                      title={dates12}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="totamt"
                      title="총계"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="판매관리비"
          disabled={permissions.view ? false : true}
        >
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
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        테이블 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: mobileheight3 }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                      >
                        차트 보기
                      </Button>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="단축코드별집계"
                  >
                    <Grid
                      style={{ height: mobileheight4 }}
                      data={process(
                        gridDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        gridDataState
                      )}
                      {...gridDataState}
                      onDataStateChange={onGridDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onGridSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={gridDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onGridSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        field="acntnm"
                        title="계정과목명"
                        width="120px"
                        footerCell={gridTotalFooterCell}
                      />
                      <GridColumn
                        field="stdrmkcd"
                        title="단축코드"
                        width="120px"
                      />
                      <GridColumn
                        field="amt1"
                        title={dates}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt2"
                        title={dates2}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt3"
                        title={dates3}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt4"
                        title={dates4}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt5"
                        title={dates5}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt6"
                        title={dates6}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt7"
                        title={dates7}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt8"
                        title={dates8}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt9"
                        title={dates9}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt10"
                        title={dates10}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt11"
                        title={dates11}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt12"
                        title={dates12}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="totamt"
                        title="총계"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainer width="100%">
                <GridContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: webheight3 }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>
                <ExcelExport
                  data={gridDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="단축코드별집계"
                >
                  <Grid
                    style={{ height: webheight4 }}
                    data={process(
                      gridDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      gridDataState
                    )}
                    {...gridDataState}
                    onDataStateChange={onGridDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onGridSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={gridDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onGridSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="acntnm"
                      title="계정과목명"
                      width="120px"
                      footerCell={gridTotalFooterCell}
                    />
                    <GridColumn
                      field="stdrmkcd"
                      title="단축코드"
                      width="120px"
                    />
                    <GridColumn
                      field="amt1"
                      title={dates}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt2"
                      title={dates2}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt3"
                      title={dates3}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt4"
                      title={dates4}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt5"
                      title={dates5}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt6"
                      title={dates6}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt7"
                      title={dates7}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt8"
                      title={dates8}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt9"
                      title={dates9}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt10"
                      title={dates10}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt11"
                      title={dates11}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt12"
                      title={dates12}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="totamt"
                      title="총계"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
        <TabStripTab title="매출액" disabled={permissions.view ? false : true}>
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
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        테이블 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: mobileheight5 }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                      >
                        차트 보기
                      </Button>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="단축코드별집계"
                  >
                    <Grid
                      style={{ height: mobileheight6 }}
                      data={process(
                        gridDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        gridDataState
                      )}
                      {...gridDataState}
                      onDataStateChange={onGridDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onGridSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={gridDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onGridSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        field="acntnm"
                        title="계정과목명"
                        width="120px"
                        footerCell={gridTotalFooterCell}
                      />
                      <GridColumn
                        field="stdrmkcd"
                        title="단축코드"
                        width="120px"
                      />
                      <GridColumn
                        field="amt1"
                        title={dates}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt2"
                        title={dates2}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt3"
                        title={dates3}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt4"
                        title={dates4}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt5"
                        title={dates5}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt6"
                        title={dates6}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt7"
                        title={dates7}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt8"
                        title={dates8}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt9"
                        title={dates9}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt10"
                        title={dates10}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt11"
                        title={dates11}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt12"
                        title={dates12}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="totamt"
                        title="총계"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainer width="100%">
                <GridContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: webheight5 }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>
                <ExcelExport
                  data={gridDataResult.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName="단축코드별집계"
                >
                  <Grid
                    style={{ height: webheight6 }}
                    data={process(
                      gridDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      gridDataState
                    )}
                    {...gridDataState}
                    onDataStateChange={onGridDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onGridSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={gridDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onGridSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="acntnm"
                      title="계정과목명"
                      width="120px"
                      footerCell={gridTotalFooterCell}
                    />
                    <GridColumn
                      field="stdrmkcd"
                      title="단축코드"
                      width="120px"
                    />
                    <GridColumn
                      field="amt1"
                      title={dates}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt2"
                      title={dates2}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt3"
                      title={dates3}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt4"
                      title={dates4}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt5"
                      title={dates5}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt6"
                      title={dates6}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt7"
                      title={dates7}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt8"
                      title={dates8}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt9"
                      title={dates9}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt10"
                      title={dates10}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt11"
                      title={dates11}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt12"
                      title={dates12}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="totamt"
                      title="총계"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="영업외손익"
          disabled={permissions.view ? false : true}
        >
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
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        테이블 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: mobileheight7 }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                      >
                        차트 보기
                      </Button>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export4 = exporter;
                    }}
                    fileName="단축코드별집계"
                  >
                    <Grid
                      style={{ height: mobileheight8 }}
                      data={process(
                        gridDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        gridDataState
                      )}
                      {...gridDataState}
                      onDataStateChange={onGridDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onGridSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={gridDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onGridSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        field="acntnm"
                        title="계정과목명"
                        width="120px"
                        footerCell={gridTotalFooterCell}
                      />
                      <GridColumn
                        field="stdrmkcd"
                        title="단축코드"
                        width="120px"
                      />
                      <GridColumn
                        field="amt1"
                        title={dates}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt2"
                        title={dates2}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt3"
                        title={dates3}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt4"
                        title={dates4}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt5"
                        title={dates5}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt6"
                        title={dates6}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt7"
                        title={dates7}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt8"
                        title={dates8}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt9"
                        title={dates9}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt10"
                        title={dates10}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt11"
                        title={dates11}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt12"
                        title={dates12}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="totamt"
                        title="총계"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainer width="100%">
                <GridContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: webheight8 }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>
                <ExcelExport
                  data={gridDataResult.data}
                  ref={(exporter) => {
                    _export4 = exporter;
                  }}
                  fileName="단축코드별집계"
                >
                  <Grid
                    style={{ height: webheight9 }}
                    data={process(
                      gridDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      gridDataState
                    )}
                    {...gridDataState}
                    onDataStateChange={onGridDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onGridSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={gridDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onGridSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="acntnm"
                      title="계정과목명"
                      width="120px"
                      footerCell={gridTotalFooterCell}
                    />
                    <GridColumn
                      field="stdrmkcd"
                      title="단축코드"
                      width="120px"
                    />
                    <GridColumn
                      field="amt1"
                      title={dates}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt2"
                      title={dates2}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt3"
                      title={dates3}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt4"
                      title={dates4}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt5"
                      title={dates5}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt6"
                      title={dates6}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt7"
                      title={dates7}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt8"
                      title={dates8}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt9"
                      title={dates9}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt10"
                      title={dates10}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt11"
                      title={dates11}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt12"
                      title={dates12}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="totamt"
                      title="총계"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="특별손익"
          disabled={permissions.view ? false : true}
        >
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
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        테이블 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: mobileheight9 }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                      >
                        차트 보기
                      </Button>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export5 = exporter;
                    }}
                    fileName="단축코드별집계"
                  >
                    <Grid
                      style={{ height: mobileheight10 }}
                      data={process(
                        gridDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        gridDataState
                      )}
                      {...gridDataState}
                      onDataStateChange={onGridDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onGridSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={gridDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onGridSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      <GridColumn
                        field="acntnm"
                        title="계정과목명"
                        width="120px"
                        footerCell={gridTotalFooterCell}
                      />
                      <GridColumn
                        field="stdrmkcd"
                        title="단축코드"
                        width="120px"
                      />
                      <GridColumn
                        field="amt1"
                        title={dates}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt2"
                        title={dates2}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt3"
                        title={dates3}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt4"
                        title={dates4}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt5"
                        title={dates5}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt6"
                        title={dates6}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt7"
                        title={dates7}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt8"
                        title={dates8}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt9"
                        title={dates9}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt10"
                        title={dates10}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt11"
                        title={dates11}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="amt12"
                        title={dates12}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="totamt"
                        title="총계"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainer width="100%">
                <GridContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: webheight9 }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      ></ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="column"
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>
                <ExcelExport
                  data={gridDataResult.data}
                  ref={(exporter) => {
                    _export5 = exporter;
                  }}
                  fileName="단축코드별집계"
                >
                  <Grid
                    style={{ height: webheight10 }}
                    data={process(
                      gridDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      gridDataState
                    )}
                    {...gridDataState}
                    onDataStateChange={onGridDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onGridSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={gridDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onGridSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="acntnm"
                      title="계정과목명"
                      width="120px"
                      footerCell={gridTotalFooterCell}
                    />
                    <GridColumn
                      field="stdrmkcd"
                      title="단축코드"
                      width="120px"
                    />
                    <GridColumn
                      field="amt1"
                      title={dates}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt2"
                      title={dates2}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt3"
                      title={dates3}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt4"
                      title={dates4}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt5"
                      title={dates5}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt6"
                      title={dates6}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt7"
                      title={dates7}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt8"
                      title={dates8}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt9"
                      title={dates9}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt10"
                      title={dates10}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt11"
                      title={dates11}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="amt12"
                      title={dates12}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="totamt"
                      title="총계"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
      </TabStrip>
    </>
  );
};

export default AC_B1260W;
