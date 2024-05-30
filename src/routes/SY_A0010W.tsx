import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  setExpandedState,
  setGroupIds,
} from "@progress/kendo-react-data-tools";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  getBizCom,
  getHeight,
  handleKeyPressSearch
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import DetailWindow from "../components/Windows/SY_A0010W_Window";
import { useApi } from "../hooks/api";
import {
  deletedAttadatnumsState,
  heightstate,
  isLoading,
  isMobileState,
} from "../store/atoms";
import { gridList } from "../store/columns/SY_A0010W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

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

const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

const Page: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const [group, setGroup] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);

  const idGetter = getter(DATA_ITEM_KEY);
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

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SY_A0010W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        group_category: defaultOption.find(
          (item: any) => item.id == "group_category"
        )?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA000, L_sysUserMaster_001", setBizComponentData);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  // 그룹 카테고리 조회
  useEffect(() => {
    if (bizComponentData != null) {
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
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

  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);

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
    // true면 조회조건(filters) 변경 되었을때 조회
    pgSize: PAGE_SIZE,
    group_category: "",
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

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    group_code: "",
    attdatnum: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_SY_A0010W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_group_code": paraDataDeleted.group_code,
      "@p_group_name": "",
      "@p_code_length": 0,
      "@p_group_category": "",
      "@p_field_caption1": "",
      "@p_field_caption2": "",
      "@p_field_caption3": "",
      "@p_field_caption4": "",
      "@p_field_caption5": "",
      "@p_field_caption6": "",
      "@p_field_caption7": "",
      "@p_field_caption8": "",
      "@p_field_caption9": "",
      "@p_field_caption10": "",
      "@p_attdatnum": "",
      "@p_memo": "",
      "@p_use_yn": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "",
    },
  };
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

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
    setDetailFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage2(initialPageState);
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
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
      procedureName: "P_SY_A0010W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_group_code": filters.group_code,
        "@p_group_name": filters.group_name,
        "@p_group_category": filters.group_category,
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
      const groupCategoryData =
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA000")
          ?.data.Rows ?? [];
      const totalRowCnt = data.tables[0].TotalRowCount;

      // 조회된 행의 데이터 조작
      const rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
        group_category_name:
          row.group_category +
          ":" +
          groupCategoryData.find(
            (item: any) => item.sub_code == row.group_category
          )?.code_name,
      }));

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

      const newDataState = processWithGroups(rows, group);
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal(totalRowCnt);
      setResultState(newDataState);

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.group_code == filters.find_row_value);

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
    if (swiper) {
      swiper.slideTo(0);
    }
  };

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  useEffect(() => {
    if (filters.isSearch && permissions !== null && bizComponentData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData]);

  useEffect(() => {
    if (permissions !== null && detailFilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailFilters, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
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
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [resultState]);

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total == -1
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
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onAddClick = () => {
    setIsCopy(false);
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onDeleteClick = (e: any) => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    const data = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (data != undefined) {
      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        group_code: data.group_code,
        attdatnum: data.attdatnum,
      }));
    } else {
      alert("선택된 행이 없습니다.");
    }
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      //코멘트 삭제
      let data2: any;

      const parameters: Iparameters = {
        procedureName: "sys_sel_comments_web",
        pageNumber: 1,
        pageSize: 100000,
        parameters: {
          "@p_work_type": "Q",
          "@p_form_id": "SY_A0010W",
          "@p_table_id": "comCodeMaster",
          "@p_orgdiv": sessionOrgdiv,
          "@p_ref_key": mainDataResult.data.filter(
            (row: any) =>
              row.num == Object.getOwnPropertyNames(selectedState)[0]
          )[0].group_code,
          "@p_find_row_value": "",
        },
      };

      try {
        data2 = await processApi<any>("procedure", parameters);
      } catch (error) {
        data2 = null;
      }
      if (data2.isSuccess == true) {
        const rows = data2.tables[0].Rows;
        type TData = {
          row_status: string[];
          id: string[];
          seq: string[];
          recdt: string[];
          comment: string[];
          user_id: string[];
        };

        let dataArr: TData = {
          row_status: [],
          id: [],
          comment: [],
          seq: [],
          recdt: [],
          user_id: [],
        };

        rows.forEach((item: any, idx: number) => {
          const { comment, id = "", seq, recdt, user_id } = item;

          dataArr.row_status.push("D");
          dataArr.comment.push(comment);
          dataArr.id.push(id);
          dataArr.seq.push(seq);
          dataArr.recdt.push(recdt);
          dataArr.user_id.push(user_id);
        });

        let data3: any;
        const paraSaved: Iparameters = {
          procedureName: "sys_sav_comments_web",
          pageNumber: 0,
          pageSize: 0,
          parameters: {
            "@p_work_type": "save",
            "@p_row_status": dataArr.row_status.join("|"),
            "@p_id": dataArr.id.join("|"),
            "@p_seq": dataArr.seq.join("|"),
            "@p_recdt": dataArr.recdt.join("|"),
            "@p_comment": dataArr.comment.join("|"),
            "@p_user_id": dataArr.user_id.join("|"),
            "@p_form_id": "SY_A0010W",
            "@p_table_id": "comCodeMaster",
            "@p_orgdiv": sessionOrgdiv,
            "@p_ref_key": mainDataResult.data.filter(
              (row: any) =>
                row.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0].group_code,
            "@p_exec_pc": pc,
          },
        };
        try {
          data3 = await processApi<any>("procedure", paraSaved);
        } catch (error) {
          data3 = null;
        }
        const isLastDataDeleted =
          mainDataResult.data.length == 1 && filters.pgNum > 0;
        const findRowIndex = mainDataResult.data.findIndex(
          (row: any) => row.num == Object.getOwnPropertyNames(selectedState)[0]
        );
        if (paraDataDeleted.attdatnum)
          setDeletedAttadatnums([paraDataDeleted.attdatnum]);
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
          resetAllGrid();
          setFilters((prev) => ({
            ...prev,
            find_row_value:
              mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                .group_code,
            pgNum: isLastDataDeleted
              ? prev.pgNum != 1
                ? prev.pgNum - 1
                : prev.pgNum
              : prev.pgNum,
            isSearch: true,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      group_code: "",
      attdatnum: "",
    }));
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

  const reloadData = (workType: string, groupCode: string) => {
    if (workType == "U") {
      setFilters((prev) => ({
        ...prev,
        find_row_value: groupCode,
        isSearch: true,
      }));
    } else {
      setGroupCode(groupCode);
    }
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onExpandChange = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState, item.groupId]
          : collapsedState.filter((groupId) => groupId != item.groupId);
        setCollapsedState(collapsedIds);
      }
    },
    [collapsedState]
  );

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

  return (
    <>
      <TitleContainer>
        <Title>공통코드정보</Title>

        <ButtonContainer>
          {permissions !== null && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="SY_A0010W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>

      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>유형분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="group_category"
                    value={filters.group_category}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

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
              <td>
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
                style={{
                  width: "100%",
                  overflow: "auto",
                }}
              >
                <GridTitleContainer className="ButtonContainer">
                  {permissions !== null && (
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick}
                        themeColor={"primary"}
                        icon="file-add"
                        disabled={permissions.save ? false : true}
                      >
                        생성
                      </Button>
                      <Button
                        onClick={onDeleteClick}
                        icon="delete"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.delete ? false : true}
                      >
                        삭제
                      </Button>
                    </ButtonContainer>
                  )}
                </GridTitleContainer>
                <ExcelExport
                  data={newData}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="공통코드정보"
                  group={group}
                >
                  <Grid
                    ref={gridRef}
                    style={{ height: deviceHeight - height }}
                    data={newData.map((item: { items: any[] }) => ({
                      ...item,
                      items: item.items.map((row: any) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                    }))}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    //그룹기능
                    group={group}
                    groupable={true}
                    onExpandChange={onExpandChange}
                    expandField="expanded"
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange}
                    //페이지네이션
                    total={total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    // ref={gridRef}
                    rowHeight={30}
                    resizable={true}
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
                </ButtonContainer>
              </GridTitleContainer>
              <GridContainer
                style={{
                  width: "100%",
                  overflow: "auto",
                }}
              >
                <ExcelExport
                  ref={(exporter) => (_export2 = exporter)}
                  data={detailDataResult.data}
                  fileName="공통코드정보"
                >
                  <Grid
                    style={{ height: deviceHeight - height2 }}
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
                    ref={gridRef}
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
                    <GridColumn
                      field="extra_field1"
                      width="200px"
                      title={field1}
                    />
                    <GridColumn
                      field="extra_field2"
                      width="200px"
                      title={field2}
                    />
                    <GridColumn
                      field="extra_field3"
                      width="200px"
                      title={field3}
                    />
                    <GridColumn
                      field="extra_field4"
                      width="200px"
                      title={field4}
                    />
                    <GridColumn
                      field="extra_field5"
                      width="200px"
                      title={field5}
                    />
                    <GridColumn
                      field="extra_field6"
                      width="200px"
                      title={field6}
                    />
                    <GridColumn
                      field="extra_field7"
                      width="200px"
                      title={field7}
                    />
                    <GridColumn
                      field="extra_field8"
                      width="200px"
                      title={field8}
                    />
                    <GridColumn
                      field="extra_field9"
                      width="200px"
                      title={field9}
                    />
                    <GridColumn
                      field="extra_field10"
                      width="200px"
                      title={field10}
                    />
                    <GridColumn field="memo" width="120px" title="메모" />
                    <GridColumn
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
                    />
                    <GridColumn
                      field="insert_userid"
                      width="120px"
                      title="등록자"
                    />
                    <GridColumn
                      field="insert_pc"
                      width="120px"
                      title="등록PC"
                    />
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
                    <GridColumn
                      field="update_pc"
                      width="120px"
                      title="수정PC"
                    />
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
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`30%`}>
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
                {permissions !== null && (
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      생성
                    </Button>
                    <Button
                      onClick={onDeleteClick}
                      icon="delete"
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                  </ButtonContainer>
                )}
              </GridTitleContainer>
              <ExcelExport
                data={newData}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="공통코드정보"
                group={group}
              >
                <Grid
                  ref={gridRef}
                  style={{ height: "77.8vh" }}
                  data={newData.map((item: { items: any[] }) => ({
                    ...item,
                    items: item.items.map((row: any) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                  }))}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  //그룹기능
                  group={group}
                  groupable={true}
                  onExpandChange={onExpandChange}
                  expandField="expanded"
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  //페이지네이션
                  total={total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //원하는 행 위치로 스크롤 기능
                  // ref={gridRef}
                  rowHeight={30}
                  resizable={true}
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
              <GridTitleContainer>
                <GridTitle>상세정보</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                ref={(exporter) => (_export2 = exporter)}
                data={detailDataResult.data}
                fileName="공통코드정보"
              >
                <Grid
                  style={{ height: "78vh" }}
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
                  ref={gridRef}
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
                  <GridColumn
                    field="extra_field1"
                    width="200px"
                    title={field1}
                  />
                  <GridColumn
                    field="extra_field2"
                    width="200px"
                    title={field2}
                  />
                  <GridColumn
                    field="extra_field3"
                    width="200px"
                    title={field3}
                  />
                  <GridColumn
                    field="extra_field4"
                    width="200px"
                    title={field4}
                  />
                  <GridColumn
                    field="extra_field5"
                    width="200px"
                    title={field5}
                  />
                  <GridColumn
                    field="extra_field6"
                    width="200px"
                    title={field6}
                  />
                  <GridColumn
                    field="extra_field7"
                    width="200px"
                    title={field7}
                  />
                  <GridColumn
                    field="extra_field8"
                    width="200px"
                    title={field8}
                  />
                  <GridColumn
                    field="extra_field9"
                    width="200px"
                    title={field9}
                  />
                  <GridColumn
                    field="extra_field10"
                    width="200px"
                    title={field10}
                  />
                  <GridColumn field="memo" width="120px" title="메모" />
                  <GridColumn
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
                  />
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
        </>
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          group_code={detailFilters.group_code}
          isCopy={isCopy}
          reloadData={reloadData}
          modal={true}
          pathname="SY_A0010W"
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
