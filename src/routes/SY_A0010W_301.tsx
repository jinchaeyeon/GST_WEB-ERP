import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import DetailWindow from "../components/Windows/SY_A0010W_301_Window";
import { useApi } from "../hooks/api";
import { deletedAttadatnumsState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/SY_A0010W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const numberField = [
  "sort_seq",
  "code_length",
  "numref1",
  "numref2",
  "numref3",
  "numref4",
  "numref5",
];

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

var height = 0;
var height2 = 0;
var height3 = 0;

const Page: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    view: true,
    save: true,
    delete: true,
    print: true,
  });
  UsePermissions(setPermissions);
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const listIdGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [field1, setField1] = useState("세부코드명1");
  const [field2, setField2] = useState("세부코드명2");
  const [field3, setField3] = useState("세부코드명3");
  const [field4, setField4] = useState("세부코드명4");
  const [field5, setField5] = useState("세부코드명5");
  const [field6, setField6] = useState("세부코드명6");
  const [field7, setField7] = useState("세부코드명7");
  const [field8, setField8] = useState("세부코드명8");
  const [field9, setField9] = useState("세부코드명9");
  const [field10, setField10] = useState("세부코드명10");
  const [num1, setNum1] = useState("숫자참조1");
  const [num2, setNum2] = useState("숫자참조2");
  const [num3, setNum3] = useState("숫자참조3");
  const [num4, setNum4] = useState("숫자참조4");
  const [num5, setNum5] = useState("숫자참조5");
  const [swiper, setSwiper] = useState<SwiperCore>();

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2(getDeviceHeight(true) - height - height3);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA000, L_sysUserMaster_001", setBizComponentData);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  // 그룹 카테고리 조회
  useEffect(() => {
    if (bizComponentData != null) {
      setUserListData(
        bizComponentData?.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        ) == undefined
          ? []
          : bizComponentData?.find(
              (item: any) => item.bizComponentId == "L_sysUserMaster_001"
            ).bizComponentItems
      );
    }
  }, [bizComponentData]);

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData[DATA_ITEM_KEY]]: true });

      setDetailFilters((prev) => ({
        ...prev,
        group_code: rowData.group_code,
      }));

      setIsCopy(false);
      setWorkType("U");
      setDetailWindowVisible(true);
    };

    return (
      <>
        {props.rowType == "groupHeader" ? null : (
          <td className="k-command-cell">
            <Button
              className="k-grid-edit-command"
              themeColor={"primary"}
              fillMode="outline"
              onClick={onEditClick}
              icon="edit"
            ></Button>
          </td>
        )}
      </>
    );
  };

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataTotal, setMainDataTotal] = useState<number>(0);

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

  const [workType, setWorkType] = useState("");
  const [isCopy, setIsCopy] = useState(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    // true면 조회조건(filters) 변경 되었을때 조회
    pgSize: PAGE_SIZE,
    group_code: "",
    group_name: "",
    memo: "",
    userid: userId,
    sub_code: "",
    subcode_name: "",
    field_caption: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters, setDetailFilters] = useState({
    isSearch: false,
    pgSize: PAGE_SIZE,
    pgNum: 1,
    group_code: "",
    find_row_value: "",
  });

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

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
    setDetailFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2(initialPageState);
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0010W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_group_code": filters.group_code,
        "@p_group_name": filters.group_name,
        "@p_group_category": "DD", // 애견유치원
        "@p_field_caption": filters.field_caption,
        "@p_memo": filters.memo,
        "@p_sub_code": filters.sub_code,
        "@p_code_name": filters.subcode_name,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      // 그룹카테고리 리스트
      const totalRowCnt = data.tables[0].TotalRowCount;

      if (totalRowCnt > 0) {
        // 조회된 행의 데이터 조작
        const rows = data.tables[0].Rows;

        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.group_code == filters.find_row_value
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

        // 데이터 세팅
        setMainDataTotal(totalRowCnt);
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        // setMainDataResult((prev) => process(rows, mainDataState));
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row.group_code == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setField1(
              selectedRow.field_caption1 == "" ||
                selectedRow.field_caption1 == null
                ? "세부코드명1"
                : selectedRow.field_caption1
            );
            setField2(
              selectedRow.field_caption2 == "" ||
                selectedRow.field_caption2 == null
                ? "세부코드명2"
                : selectedRow.field_caption2
            );
            setField3(
              selectedRow.field_caption3 == "" ||
                selectedRow.field_caption3 == null
                ? "세부코드명3"
                : selectedRow.field_caption3
            );
            setField4(
              selectedRow.field_caption4 == "" ||
                selectedRow.field_caption4 == null
                ? "세부코드명4"
                : selectedRow.field_caption4
            );
            setField5(
              selectedRow.field_caption5 == "" ||
                selectedRow.field_caption5 == null
                ? "세부코드명5"
                : selectedRow.field_caption5
            );
            setField6(
              selectedRow.field_caption6 == "" ||
                selectedRow.field_caption6 == null
                ? "세부코드명6"
                : selectedRow.field_caption6
            );
            setField7(
              selectedRow.field_caption7 == "" ||
                selectedRow.field_caption7 == null
                ? "세부코드명7"
                : selectedRow.field_caption7
            );
            setField8(
              selectedRow.field_caption8 == "" ||
                selectedRow.field_caption8 == null
                ? "세부코드명8"
                : selectedRow.field_caption8
            );
            setField9(
              selectedRow.field_caption9 == "" ||
                selectedRow.field_caption9 == null
                ? "세부코드명9"
                : selectedRow.field_caption9
            );
            setField10(
              selectedRow.field_caption10 == "" ||
                selectedRow.field_caption10 == null
                ? "세부코드명10"
                : selectedRow.field_caption10
            );
            setNum1(
              selectedRow.numref_caption1 == null ||
                selectedRow.numref_caption1 == ""
                ? "숫자참조1"
                : selectedRow.numref_caption1
            );
            setNum2(
              selectedRow.numref_caption2 == null ||
                selectedRow.numref_caption2 == ""
                ? "숫자참조2"
                : selectedRow.numref_caption2
            );
            setNum3(
              selectedRow.numref_caption3 == null ||
                selectedRow.numref_caption3 == ""
                ? "숫자참조3"
                : selectedRow.numref_caption3
            );
            setNum4(
              selectedRow.numref_caption4 == null ||
                selectedRow.numref_caption4 == ""
                ? "숫자참조4"
                : selectedRow.numref_caption4
            );
            setNum5(
              selectedRow.numref_caption5 == null ||
                selectedRow.numref_caption5 == ""
                ? "숫자참조5"
                : selectedRow.numref_caption5
            );
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

            setDetailFilters((prev) => ({
              ...prev,
              group_code: selectedRow.group_code,
              isSearch: true,
            }));
          } else {
            setField1(
              rows[0].field_caption1 == "" || rows[0].field_caption1 == null
                ? "세부코드명1"
                : rows[0].field_caption1
            );
            setField2(
              rows[0].field_caption2 == "" || rows[0].field_caption2 == null
                ? "세부코드명2"
                : rows[0].field_caption2
            );
            setField3(
              rows[0].field_caption3 == "" || rows[0].field_caption3 == null
                ? "세부코드명3"
                : rows[0].field_caption3
            );
            setField4(
              rows[0].field_caption4 == "" || rows[0].field_caption4 == null
                ? "세부코드명4"
                : rows[0].field_caption4
            );
            setField5(
              rows[0].field_caption5 == "" || rows[0].field_caption5 == null
                ? "세부코드명5"
                : rows[0].field_caption5
            );
            setField6(
              rows[0].field_caption6 == "" || rows[0].field_caption6 == null
                ? "세부코드명6"
                : rows[0].field_caption6
            );
            setField7(
              rows[0].field_caption7 == "" || rows[0].field_caption7 == null
                ? "세부코드명7"
                : rows[0].field_caption7
            );
            setField8(
              rows[0].field_caption8 == "" || rows[0].field_caption8 == null
                ? "세부코드명8"
                : rows[0].field_caption8
            );
            setField9(
              rows[0].field_caption9 == "" || rows[0].field_caption9 == null
                ? "세부코드명9"
                : rows[0].field_caption9
            );
            setField10(
              rows[0].field_caption10 == "" || rows[0].field_caption10 == null
                ? "세부코드명10"
                : rows[0].field_caption10
            );
            setNum1(
              rows[0].numref_caption1 == null || rows[0].numref_caption1 == ""
                ? "숫자참조1"
                : rows[0].numref_caption1
            );
            setNum2(
              rows[0].numref_caption2 == null || rows[0].numref_caption2 == ""
                ? "숫자참조2"
                : rows[0].numref_caption2
            );
            setNum3(
              rows[0].numref_caption3 == null || rows[0].numref_caption3 == ""
                ? "숫자참조3"
                : rows[0].numref_caption3
            );
            setNum4(
              rows[0].numref_caption4 == null || rows[0].numref_caption4 == ""
                ? "숫자참조4"
                : rows[0].numref_caption4
            );
            setNum5(
              rows[0].numref_caption5 == null || rows[0].numref_caption5 == ""
                ? "숫자참조5"
                : rows[0].numref_caption5
            );
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

            setDetailFilters((prev) => ({
              ...prev,
              group_code: rows[0].group_code,
              isSearch: true,
            }));
          }
        }
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

  const fetchDetailGrid = async (detailFilters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const detailParameters: Iparameters = {
      procedureName: "P_SY_A0010W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_group_code": detailFilters.group_code,
        "@p_group_name": "",
        "@p_group_category": "",
        "@p_field_caption": "",
        "@p_memo": "",
        "@p_sub_code": "",
        "@p_code_name": "",
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        if (detailFilters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef2.current) {
            const findRowIndex = rows.findIndex(
              (row: any) =>
                row[DETAIL_DATA_ITEM_KEY] == detailFilters.find_row_value
            );
            targetRowIndex2 = findRowIndex;
          }

          // find_row_value 데이터가 존재하는 페이지로 설정
          setPage2({
            skip: PAGE_SIZE * (data.pageNumber - 1),
            take: PAGE_SIZE,
          });
        } else {
          // 첫번째 행으로 스크롤 이동
          if (gridRef2.current) {
            targetRowIndex2 = 0;
          }
        }
      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          detailFilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row[DETAIL_DATA_ITEM_KEY] == detailFilters.find_row_value
              );
        if (selectedRow != undefined) {
          setDetailSelectedState({ [selectedRow[DETAIL_DATA_ITEM_KEY]]: true });
        } else {
          setDetailSelectedState({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
        }
      }
    }
    setDetailFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  // 조회 버튼 => 리셋 후 조회
  const search = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    resetAllGrid(); // 데이터 초기화
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setDetailFilters((prev) => ({ ...prev, pgNum: 1 }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  // selectedState가 바뀔때마다 data에 바뀐 selectedState 적용
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [selectedState]);

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

  useEffect(() => {
    if (
      permissions.view &&
      detailFilters.isSearch &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailFilters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataTotal(1);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
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
    setField1(
      selectedRowData.field_caption1 == "" ||
        selectedRowData.field_caption1 == null
        ? "세부코드명1"
        : selectedRowData.field_caption1
    );
    setField2(
      selectedRowData.field_caption2 == "" ||
        selectedRowData.field_caption2 == null
        ? "세부코드명2"
        : selectedRowData.field_caption2
    );
    setField3(
      selectedRowData.field_caption3 == "" ||
        selectedRowData.field_caption3 == null
        ? "세부코드명3"
        : selectedRowData.field_caption3
    );
    setField4(
      selectedRowData.field_caption4 == "" ||
        selectedRowData.field_caption4 == null
        ? "세부코드명4"
        : selectedRowData.field_caption4
    );
    setField5(
      selectedRowData.field_caption5 == "" ||
        selectedRowData.field_caption5 == null
        ? "세부코드명5"
        : selectedRowData.field_caption5
    );
    setField6(
      selectedRowData.field_caption6 == "" ||
        selectedRowData.field_caption6 == null
        ? "세부코드명6"
        : selectedRowData.field_caption6
    );
    setField7(
      selectedRowData.field_caption7 == "" ||
        selectedRowData.field_caption7 == null
        ? "세부코드명7"
        : selectedRowData.field_caption7
    );
    setField8(
      selectedRowData.field_caption8 == "" ||
        selectedRowData.field_caption8 == null
        ? "세부코드명8"
        : selectedRowData.field_caption8
    );
    setField9(
      selectedRowData.field_caption9 == "" ||
        selectedRowData.field_caption9 == null
        ? "세부코드명9"
        : selectedRowData.field_caption9
    );
    setField10(
      selectedRowData.field_caption10 == "" ||
        selectedRowData.field_caption10 == null
        ? "세부코드명10"
        : selectedRowData.field_caption10
    );
    setNum1(
      selectedRowData.numref_caption1 == null ||
        selectedRowData.numref_caption1 == ""
        ? "숫자참조1"
        : selectedRowData.numref_caption1
    );
    setNum2(
      selectedRowData.numref_caption2 == null ||
        selectedRowData.numref_caption2 == ""
        ? "숫자참조2"
        : selectedRowData.numref_caption2
    );
    setNum3(
      selectedRowData.numref_caption3 == null ||
        selectedRowData.numref_caption3 == ""
        ? "숫자참조3"
        : selectedRowData.numref_caption3
    );
    setNum4(
      selectedRowData.numref_caption4 == null ||
        selectedRowData.numref_caption4 == ""
        ? "숫자참조4"
        : selectedRowData.numref_caption4
    );
    setNum5(
      selectedRowData.numref_caption5 == null ||
        selectedRowData.numref_caption5 == ""
        ? "숫자참조5"
        : selectedRowData.numref_caption5
    );
    setDetailFilters((prev) => ({
      ...prev,
      group_code: selectedRowData.group_code,
      //pgNum: 1,
      isSearch: true,
    }));
    //setPage(initialPageState);
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);
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
      optionsGridOne.sheets[1].title = "상세정보";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    //setMainDataResult((prev) => process(prev.data, event.dataState));
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataTotal.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataTotal == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const setGroupCode = (groupCode: string | undefined) => {
    // 리셋
    resetAllGrid();

    // 메인 조회
    setFilters((prev) => ({
      ...prev,
      find_row_value: groupCode == undefined ? "" : groupCode,
      isSearch: true,
    }));
  };

  const reloadData = (workType: string, groupCode: string | undefined) => {
    if (workType == "U") {
      // 일반조회
      const rows = mainDataResult.data.filter(
        (item) => Object.getOwnPropertyNames(selectedState)[0] == item.num
      );

      // 리셋
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: rows[0].group_code,
        isSearch: true,
      }));
    } else {
      setGroupCode(groupCode);
    }
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

        <ButtonContainer>
          <TopButtons
            search={search}
            exportExcel={exportExcel}
            permissions={permissions}
          />
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>그룹코드</th>
              <td>
                <Input
                  name="group_code"
                  type="text"
                  value={filters.group_code}
                  onChange={filterInputChange}
                />
              </td>
              <th>그룹코드명</th>
              <td>
                <Input
                  name="group_name"
                  type="text"
                  value={filters.group_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>필드 캡션</th>
              <td colSpan={3}>
                <Input
                  name="field_caption"
                  type="text"
                  value={filters.field_caption}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>세부코드</th>
              <td>
                <Input
                  name="sub_code"
                  type="text"
                  value={filters.sub_code}
                  onChange={filterInputChange}
                />
              </td>
              <th>세부코드명</th>
              <td>
                <Input
                  name="subcode_name"
                  type="text"
                  value={filters.subcode_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>메모</th>
              <td colSpan={3}>
                <Input
                  name="memo"
                  type="text"
                  value={filters.memo}
                  onChange={filterInputChange}
                />
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
        >
          <SwiperSlide key={0}>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: mobileheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[listIdGetter(row)],
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
                  total={mainDataTotal}
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
                  //그룹기능
                >
                  <GridColumn cell={CommandCell} width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdHeaderList"]
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
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
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
            style={{ display: "flex", flexDirection: "column" }}
          >
            <GridContainer>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>상세정보</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                ref={(exporter) => (_export2 = exporter)}
                data={detailDataResult.data}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: mobileheight2 }}
                  data={process(
                    detailDataResult.data.map((row) => ({
                      ...row,
                      insert_userid: userListData.find(
                        (items: any) => items.user_id == row.insert_userid
                      )?.user_name,
                      update_userid: userListData.find(
                        (items: any) => items.user_id == row.update_userid
                      )?.user_name,
                      [SELECTED_FIELD]:
                        detailSelectedState[detailIdGetter(row)],
                    })),
                    detailDataState
                  )}
                  {...detailDataState}
                  onDataStateChange={onDetailDataStateChange}
                  dataItemKey={DETAIL_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onDetailSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="sub_code"
                    width="120px"
                    title="세부코드"
                    footerCell={detailTotalFooterCell}
                  />
                  <GridColumn
                    field="code_name"
                    width="200px"
                    title="세부코드명"
                  />
                  <GridColumn
                    field="system_yn"
                    width="120px"
                    title="시스템코드"
                    cell={CheckBoxCell}
                  />
                  <GridColumn
                    field="sort_seq"
                    width="120px"
                    title="정렬순서"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="use_yn"
                    width="95px"
                    title="사용"
                    cell={CheckBoxCell}
                  />
                  {/* <GridColumn field="extra_field1" width="200px" title={field1} />
             <GridColumn field="extra_field2" width="200px" title={field2} />
             <GridColumn field="extra_field3" width="200px" title={field3} />
             <GridColumn field="extra_field4" width="200px" title={field4} />
             <GridColumn field="extra_field5" width="200px" title={field5} />
             <GridColumn field="extra_field6" width="200px" title={field6} />
             <GridColumn field="extra_field7" width="200px" title={field7} />
             <GridColumn field="extra_field8" width="200px" title={field8} />
             <GridColumn field="extra_field9" width="200px" title={field9} />
             <GridColumn field="extra_field10" width="200px" title={field10} /> */}

                  {!!field1 && field1 != "세부코드명1" && (
                    <GridColumn
                      field="extra_field1"
                      width="200px"
                      title={field1}
                    />
                  )}
                  {!!field2 && field2 != "세부코드명2" && (
                    <GridColumn
                      field="extra_field2"
                      width="200px"
                      title={field2}
                    />
                  )}
                  {!!field3 && field3 != "세부코드명3" && (
                    <GridColumn
                      field="extra_field3"
                      width="200px"
                      title={field3}
                    />
                  )}
                  {!!field4 && field4 != "세부코드명4" && (
                    <GridColumn
                      field="extra_field4"
                      width="200px"
                      title={field4}
                    />
                  )}
                  {!!field5 && field5 != "세부코드명5" && (
                    <GridColumn
                      field="extra_field5"
                      width="200px"
                      title={field5}
                    />
                  )}
                  {!!field6 && field6 != "세부코드명6" && (
                    <GridColumn
                      field="extra_field6"
                      width="200px"
                      title={field6}
                    />
                  )}
                  {!!field7 && field7 != "세부코드명7" && (
                    <GridColumn
                      field="extra_field7"
                      width="200px"
                      title={field7}
                    />
                  )}
                  {!!field8 && field8 != "세부코드명8" && (
                    <GridColumn
                      field="extra_field8"
                      width="200px"
                      title={field8}
                    />
                  )}
                  {!!field9 && field9 != "세부코드명9" && (
                    <GridColumn
                      field="extra_field9"
                      width="200px"
                      title={field9}
                    />
                  )}
                  {!!field10 && field10 != "세부코드명10" && (
                    <GridColumn
                      field="extra_field10"
                      width="200px"
                      title={field10}
                    />
                  )}

                  {!!num1 && num1 != "숫자참조1" && (
                    <GridColumn
                      field="numref1"
                      width="200px"
                      title={num1}
                      cell={NumberCell}
                    />
                  )}
                  {!!num2 && num2 != "숫자참조2" && (
                    <GridColumn
                      field="numref2"
                      width="200px"
                      title={num2}
                      cell={NumberCell}
                    />
                  )}
                  {!!num3 && num3 != "숫자참조3" && (
                    <GridColumn
                      field="numref3"
                      width="200px"
                      title={num3}
                      cell={NumberCell}
                    />
                  )}
                  {!!num4 && num4 != "숫자참조4" && (
                    <GridColumn
                      field="numref4"
                      width="200px"
                      title={num4}
                      cell={NumberCell}
                    />
                  )}
                  {!!num5 && num5 != "숫자참조5" && (
                    <GridColumn
                      field="numref5"
                      width="200px"
                      title={num5}
                      cell={NumberCell}
                    />
                  )}

                  <GridColumn field="memo" width="120px" title="메모" />
                  {/* <GridColumn
               field="numref1"
               width="200px"
               title={num1}
               cell={NumberCell}
             />
             <GridColumn
               field="numref2"
               width="200px"
               title={num2}
               cell={NumberCell}
             />
             <GridColumn
               field="numref3"
               width="200px"
               title={num3}
               cell={NumberCell}
             />
             <GridColumn
               field="numref4"
               width="200px"
               title={num4}
               cell={NumberCell}
             />
             <GridColumn
               field="numref5"
               width="200px"
               title={num5}
               cell={NumberCell}
             /> */}
                  <GridColumn
                    field="insert_userid"
                    width="120px"
                    title="등록자"
                  />
                  <GridColumn field="insert_pc" width="120px" title="등록PC" />
                  <GridColumn
                    field="insert_time"
                    width="120px"
                    title="등록일자"
                  />
                  <GridColumn
                    field="update_userid"
                    width="120px"
                    title="수정자"
                  />
                  <GridColumn field="update_pc" width="120px" title="수정PC" />
                  <GridColumn
                    field="update_time"
                    width="120px"
                    title="수정일자"
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <GridContainerWrap>
          <GridContainer width={`30%`}>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>요약정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName={getMenuName()}
            >
              <Grid
                style={{ height: webheight }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState[listIdGetter(row)],
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
                total={mainDataTotal}
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
                //그룹기능
              >
                <GridColumn cell={CommandCell} width="50px" />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdHeaderList"]
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
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
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
          <GridContainer width={`calc(70% - ${GAP}px)`}>
            <GridTitleContainer className="ButtonContainer2">
              <GridTitle>상세정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              ref={(exporter) => (_export2 = exporter)}
              data={detailDataResult.data}
              fileName={getMenuName()}
            >
              <Grid
                style={{ height: webheight2 }}
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    insert_userid: userListData.find(
                      (items: any) => items.user_id == row.insert_userid
                    )?.user_name,
                    update_userid: userListData.find(
                      (items: any) => items.user_id == row.update_userid
                    )?.user_name,
                    [SELECTED_FIELD]: detailSelectedState[detailIdGetter(row)],
                  })),
                  detailDataState
                )}
                {...detailDataState}
                onDataStateChange={onDetailDataStateChange}
                dataItemKey={DETAIL_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetailSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detailDataResult.total}
                skip={page2.skip}
                take={page2.take}
                pageable={true}
                onPageChange={pageChange2}
                ref={gridRef2}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onDetailSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="sub_code"
                  width="120px"
                  title="세부코드"
                  footerCell={detailTotalFooterCell}
                />
                <GridColumn
                  field="code_name"
                  width="200px"
                  title="세부코드명"
                />
                <GridColumn
                  field="system_yn"
                  width="120px"
                  title="시스템코드"
                  cell={CheckBoxCell}
                />
                <GridColumn
                  field="sort_seq"
                  width="120px"
                  title="정렬순서"
                  cell={NumberCell}
                />
                <GridColumn
                  field="use_yn"
                  width="95px"
                  title="사용"
                  cell={CheckBoxCell}
                />
                {/* <GridColumn field="extra_field1" width="200px" title={field1} />
             <GridColumn field="extra_field2" width="200px" title={field2} />
             <GridColumn field="extra_field3" width="200px" title={field3} />
             <GridColumn field="extra_field4" width="200px" title={field4} />
             <GridColumn field="extra_field5" width="200px" title={field5} />
             <GridColumn field="extra_field6" width="200px" title={field6} />
             <GridColumn field="extra_field7" width="200px" title={field7} />
             <GridColumn field="extra_field8" width="200px" title={field8} />
             <GridColumn field="extra_field9" width="200px" title={field9} />
             <GridColumn field="extra_field10" width="200px" title={field10} /> */}

                {!!field1 && field1 != "세부코드명1" && (
                  <GridColumn
                    field="extra_field1"
                    width="200px"
                    title={field1}
                  />
                )}
                {!!field2 && field2 != "세부코드명2" && (
                  <GridColumn
                    field="extra_field2"
                    width="200px"
                    title={field2}
                  />
                )}
                {!!field3 && field3 != "세부코드명3" && (
                  <GridColumn
                    field="extra_field3"
                    width="200px"
                    title={field3}
                  />
                )}
                {!!field4 && field4 != "세부코드명4" && (
                  <GridColumn
                    field="extra_field4"
                    width="200px"
                    title={field4}
                  />
                )}
                {!!field5 && field5 != "세부코드명5" && (
                  <GridColumn
                    field="extra_field5"
                    width="200px"
                    title={field5}
                  />
                )}
                {!!field6 && field6 != "세부코드명6" && (
                  <GridColumn
                    field="extra_field6"
                    width="200px"
                    title={field6}
                  />
                )}
                {!!field7 && field7 != "세부코드명7" && (
                  <GridColumn
                    field="extra_field7"
                    width="200px"
                    title={field7}
                  />
                )}
                {!!field8 && field8 != "세부코드명8" && (
                  <GridColumn
                    field="extra_field8"
                    width="200px"
                    title={field8}
                  />
                )}
                {!!field9 && field9 != "세부코드명9" && (
                  <GridColumn
                    field="extra_field9"
                    width="200px"
                    title={field9}
                  />
                )}
                {!!field10 && field10 != "세부코드명10" && (
                  <GridColumn
                    field="extra_field10"
                    width="200px"
                    title={field10}
                  />
                )}

                {!!num1 && num1 != "숫자참조1" && (
                  <GridColumn
                    field="numref1"
                    width="200px"
                    title={num1}
                    cell={NumberCell}
                  />
                )}
                {!!num2 && num2 != "숫자참조2" && (
                  <GridColumn
                    field="numref2"
                    width="200px"
                    title={num2}
                    cell={NumberCell}
                  />
                )}
                {!!num3 && num3 != "숫자참조3" && (
                  <GridColumn
                    field="numref3"
                    width="200px"
                    title={num3}
                    cell={NumberCell}
                  />
                )}
                {!!num4 && num4 != "숫자참조4" && (
                  <GridColumn
                    field="numref4"
                    width="200px"
                    title={num4}
                    cell={NumberCell}
                  />
                )}
                {!!num5 && num5 != "숫자참조5" && (
                  <GridColumn
                    field="numref5"
                    width="200px"
                    title={num5}
                    cell={NumberCell}
                  />
                )}

                <GridColumn field="memo" width="120px" title="메모" />
                {/* <GridColumn
               field="numref1"
               width="200px"
               title={num1}
               cell={NumberCell}
             />
             <GridColumn
               field="numref2"
               width="200px"
               title={num2}
               cell={NumberCell}
             />
             <GridColumn
               field="numref3"
               width="200px"
               title={num3}
               cell={NumberCell}
             />
             <GridColumn
               field="numref4"
               width="200px"
               title={num4}
               cell={NumberCell}
             />
             <GridColumn
               field="numref5"
               width="200px"
               title={num5}
               cell={NumberCell}
             /> */}
                <GridColumn
                  field="insert_userid"
                  width="120px"
                  title="등록자"
                />
                <GridColumn field="insert_pc" width="120px" title="등록PC" />
                <GridColumn
                  field="insert_time"
                  width="120px"
                  title="등록일자"
                />
                <GridColumn
                  field="update_userid"
                  width="120px"
                  title="수정자"
                />
                <GridColumn field="update_pc" width="120px" title="수정PC" />
                <GridColumn
                  field="update_time"
                  width="120px"
                  title="수정일자"
                />
              </Grid>
            </ExcelExport>
          </GridContainer>
        </GridContainerWrap>
      )}

      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          group_code={detailFilters.group_code}
          isCopy={isCopy}
          reloadData={reloadData}
          modal={true}
        />
      )}

      {/* 컨트롤 네임 불러오기 용 */}
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

export default Page;
