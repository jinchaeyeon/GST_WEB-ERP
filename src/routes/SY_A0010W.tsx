import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridItemChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
} from "@progress/kendo-react-grid";

import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import calculateSize from "calculate-size";

import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  GridContainerWrap,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input, RadioGroupChangeEvent } from "@progress/kendo-react-inputs";

import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useApi } from "../hooks/api";
import {
  ordstsState,
  ordtypeState,
  departmentsState,
  usersState,
  doexdivState,
  locationState,
  tokenState,
} from "../store/atoms";
import { Iparameters } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCommonQuery,
  UseCustomOption,
  UseMessages,
} from "../components/CommonFunction";
import DetailWindow from "../components/Windows/SY_A0010W_Window";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  clientWidth,
  commonCodeDefaultValue,
  departmentsQuery,
  doexdivQuery,
  finynRadioButtonData,
  gnvWidth,
  gridMargin,
  itemacntQuery,
  locationQuery,
  ordstsQuery,
  pageSize,
  qtyunitQuery,
  taxdivQuery,
  usersQuery,
} from "../components/CommonString";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";

const numberField = [
  "col_sort_seq",
  "col_code_length",
  "col_numref1",
  "col_numref2",
  "col_numref3",
  "col_numref4",
  "col_numref5",
];
const checkBoxField = ["col_system_yn", "col_use_yn1"];

const Page: React.FC = () => {
  const [token] = useRecoilState(tokenState);
  const { userId } = token;
  const DATA_ITEM_KEY = "group_code";
  const DETAIL_DATA_ITEM_KEY = "sub_code";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const processApi = useApi();

  const [willSearch, setWillSearch] = useState(false);
  const [mainDataState, setMainDataState] = useState<State>({
    group: [
      {
        field: "group_category",
      },
    ],
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const pathname: string = window.location.pathname.replace("/", "");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  //UseCustomOption(pathname, setCustomOptionData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_menu_group,L_BA000", setBizComponentData);

  // 그룹 카테고리 리스트
  const [groupCategoryListData, setGroupCategoryListData] = React.useState([
    commonCodeDefaultValue,
  ]);

  // 그룹 카테고리 조회 쿼리
  const groupCategoryQuery =
    bizComponentData !== null
      ? getQueryFromBizComponent(
          bizComponentData.find(
            (item: any) => item.bizComponentId === "L_BA000"
          )
        )
      : "";

  // 그룹 카테고리 조회
  useEffect(() => {
    if (bizComponentData !== null) {
      fetchQueryData(groupCategoryQuery, setGroupCategoryListData);
    }
  }, [bizComponentData]);

  const fetchQueryData = useCallback(
    async (queryStr: string, setListData: any) => {
      let data: any;

      let query = {
        query: "query?query=" + encodeURIComponent(queryStr),
      };

      try {
        data = await processApi<any>("query", query);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess === true) {
        const rows = data.tables[0].Rows;
        setListData(rows);
      }
    },
    []
  );

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
        {props.rowType === "groupHeader" ? null : (
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
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [detailPgNum, setDetailPgNum] = useState(1);

  const [workType, setWorkType] = useState("");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [isCopy, setIsCopy] = useState(false);

  const [locationVal, setLocationVal] = useRecoilState(locationState);
  const ordstsVal = useRecoilValue(ordstsState);
  const ordtypeVal = useRecoilValue(ordtypeState);
  const departmentsVal = useRecoilValue(departmentsState);
  const usersVal = useRecoilValue(usersState);
  const doexdivVal = useRecoilValue(doexdivState);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: RadioGroupChangeEvent) => {
    const name = e.syntheticEvent.currentTarget.name;
    const value = e.value;
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
    pgSize: pageSize,
    group_category: "",
    group_code: "",
    group_name: "",
    memo: "",
    userid: userId,
    sub_code: "",
    subcode_name: "",
    comment: "",
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: pageSize,
    group_code: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SY_A0010W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_group_category": filters.group_category,
      "@p_group_code": "%" + filters.group_code + "%",
      "@p_group_name": filters.group_name,
      "@p_memo": filters.memo,
      "@p_userid": filters.userid,
      "@p_sub_code": filters.sub_code,
      "@p_subcode_name": filters.subcode_name,
      "@p_comment": filters.comment,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_SY_A0010W_Q",
    pageNumber: detailPgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_group_category": "",
      "@p_group_code": detailFilters.group_code,
      "@p_group_name": "",
      "@p_memo": "",
      "@p_userid": "",
      "@p_sub_code": "",
      "@p_subcode_name": "",
      "@p_comment": "",
    },
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    [DATA_ITEM_KEY]: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_SY_A0010W_S",
    pageNumber: 1,
    pageSize: 10,
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
      "@p_userid": "",
      "@p_pc": "",
      "@p_form_id": "",
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  const fetchDetailGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    }
  };

  useEffect(() => {
    if (customOptionData !== null) {
      setLocationVal({ sub_code: "01", code_name: "본사" });
      fetchMainGrid();
    }
  }, [mainPgNum]);

  useEffect(() => {
    resetDetailGrid();
    fetchDetailGrid();
  }, [detailFilters]);

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

        setDetailFilters((prev) => ({
          ...prev,
          group_code: firstRowData.group_code,
        }));

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [customOptionData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setDetailPgNum(1);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  const resetDetailGrid = () => {
    setDetailPgNum(1);
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

    setDetailFilters((prev) => ({
      ...prev,
      group_code: selectedRowData.group_code,
    }));
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, pageSize))
      setMainPgNum((prev) => prev + 1);
  };

  const onDetailScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, pageSize))
      setDetailPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };
  const calculateWidth = (field: any) => {
    let maxWidth = 0;
    mainDataResult.data.forEach((item) => {
      const size = calculateSize(item[field], {
        font: "Source Sans Pro",
        fontSize: "16px",
      }); // pass the font properties based on the application
      if (size.width > maxWidth) {
        maxWidth = size.width;
      }
    });

    return maxWidth;
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  const getCaption = (field: any, orgCaption: any) => {
    const key = Object.getOwnPropertyNames(selectedState)[0];
    let caption = orgCaption;

    if (key) {
      const selectedRowData = mainDataResult.data.find(
        (item) => item[DATA_ITEM_KEY] === key
      );

      if (selectedRowData) {
        if (field.includes("extra_field")) {
          const extraFieldNum = field
            .replace("extra_field", "")
            .replace("col_", "");

          const newCaption = selectedRowData["field_caption" + extraFieldNum];
          if (newCaption !== "") {
            caption = newCaption;
          }
        }
      }
    }

    return caption;
  };
  const onAddClick = () => {
    setIsCopy(false);
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onCopyClick = () => {
    const key = Object.getOwnPropertyNames(selectedState)[0];

    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] === key
    );

    setDetailFilters((prev) => ({
      ...prev,
      group_code: selectedRowData.group_code,
    }));

    setIsCopy(true);
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onDeleteClick = (e: any) => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    const group_code = Object.getOwnPropertyNames(selectedState)[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      group_code: group_code,
    }));
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert(findMessage(messagesData, "SY_A0010W_001"));

      resetAllGrid();
      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.group_code = "";
  };

  const setGroupCode = (group_code: string) => {
    setFilters((prev) => ({ ...prev, group_code }));
    setWillSearch(true);
  };

  const reloadData = (workType: string) => {
    //수정한 경우 행선택 유지, 신규건은 첫번째 행 선택
    if (workType === "U") {
      setIfSelectFirstRow(false);
    } else {
      setIfSelectFirstRow(true);
    }

    resetAllGrid();
    fetchMainGrid();
    fetchDetailGrid();
  };

  interface ICustData {
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

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const getCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const getItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //공통코드 리스트 조회 (수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서)
  const [ordstsListData, setOrdstsListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [locationListData, setLocationListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [usersListData, setUsersListData] = useState([commonCodeDefaultValue]);

  const [departmentsListData, setDepartmentsListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    commonCodeDefaultValue,
  ]);

  UseCommonQuery(ordstsQuery, setOrdstsListData);
  UseCommonQuery(doexdivQuery, setDoexdivListData);
  UseCommonQuery(taxdivQuery, setTaxdivListData);
  UseCommonQuery(locationQuery, setLocationListData);
  UseCommonQuery(usersQuery, setUsersListData);
  UseCommonQuery(departmentsQuery, setDepartmentsListData);
  UseCommonQuery(itemacntQuery, setItemacntListData);
  UseCommonQuery(qtyunitQuery, setQtyunitListData);

  //공통코드 리스트 조회 후 그리드 데이터 세팅
  useEffect(() => {
    // setMainDataResult((prev) => {
    //   const rows = prev.data.map((row: any) => ({
    //     ...row,
    //     ordsts: ordstsListData.find((item: any) => item.sub_code === row.ordsts)
    //       ?.code_name,
    //   }));
    //   return {
    //     data: [...prev.data, ...rows],
    //     total: prev.total,
    //   };
    // });
  }, [ordstsListData]);

  const onExpandChange = (event: any) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;
    setMainDataState((prev) => ({ ...prev }));
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (willSearch === true) {
      resetAllGrid();
      fetchMainGrid();
      setWillSearch(false);
    }
  }, [filters]);

  return (
    <>
      <TitleContainer>
        <Title>공통코드정보</Title>

        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
            }}
            icon="search"
            //fillMode="outline"
            themeColor={"primary"}
          >
            조회
          </Button>
          <Button
            title="Export Excel"
            onClick={exportExcel}
            icon="download"
            fillMode="outline"
            themeColor={"primary"}
          >
            Excel
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>유형분류</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="group_category"
                    value={filters.group_category}
                    bizComponentId="L_menu_group"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField={"name"}
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
              <th>코멘트</th>
              <td>
                <Input
                  name="comment"
                  type="text"
                  value={filters.comment}
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
              <td>
                <Input
                  name="memo"
                  type="text"
                  value={filters.memo}
                  onChange={filterInputChange}
                />
              </td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <GridContainerWrap>
        <GridContainer width={"500px"}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="file-add"
                >
                  생성
                </Button>
                <Button
                  onClick={onCopyClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="copy"
                >
                  복사
                </Button>
                <Button
                  onClick={onDeleteClick}
                  icon="delete"
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "700px" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  group_category: groupCategoryListData.find(
                    (item: any) => item.sub_code === row.group_category
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
              onScroll={onMainScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              //그룹기능
              groupable={true}
              onExpandChange={onExpandChange}
              expandField="expanded"
            >
              <GridColumn cell={CommandCell} width="55px" />

              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["gvwList"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.id.replace("col_", "")}
                        title={item.caption}
                        width={item.width}
                        cell={numberField.includes(item.id) ? NumberCell : ""}
                        footerCell={
                          item.sortOrder === 1 ? mainTotalFooterCell : ""
                        }
                      ></GridColumn>
                    )
                )}
            </Grid>
          </ExcelExport>
        </GridContainer>

        <GridContainer
          width={clientWidth - gnvWidth - gridMargin - 15 - 500 + "px"}
        >
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "700px" }}
            data={process(
              detailDataResult.data.map((row) => ({
                ...row,
              })),
              detailDataState
            )}
            {...detailDataState}
            onDataStateChange={onDetailDataStateChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={detailDataResult.total}
            onScroll={onDetailScrollHandler}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["gvwDetail"].map(
                (item: any, idx: number) => {
                  const caption = getCaption(item.id, item.caption);
                  return (
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.id
                          .replace("col_", "")
                          .replace("use_yn1", "use_yn")}
                        title={caption}
                        width={item.width}
                        cell={
                          numberField.includes(item.id)
                            ? NumberCell
                            : checkBoxField.includes(item.id)
                            ? CheckBoxReadOnlyCell
                            : ""
                        }
                        footerCell={
                          item.sortOrder === 2 ? detailTotalFooterCell : ""
                        }
                      ></GridColumn>
                    )
                  );
                }
              )}
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      {detailWindowVisible && (
        <DetailWindow
          getVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          group_code={detailFilters.group_code}
          isCopy={isCopy}
          setGroupCode={setGroupCode}
          reloadData={reloadData}
          para={detailParameters}
        />
      )}
    </>
  );
};

export default Page;
