import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, CheckboxChangeEvent } from "@progress/kendo-react-inputs";
import { useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isLoading } from "../../../store/atoms";
import { Iparameters, TColumn } from "../../../store/types";
import CenterCell from "../../Cells/CenterCell";
import {
  UseGetValueFromSessionItem,
  getGridItemChangedData,
} from "../../CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import Window from "../WindowComponent/Window";

const CustomCheckBoxCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field, render, onChange } =
    props;

  let value = dataItem[field ?? ""];
  if (value == "Y" || value == true) {
    value = true;
  } else {
    value = false;
  }

  const handleChange = (e: CheckboxChangeEvent) => {
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

  const defaultRendering = (
    <td
      style={{ textAlign: "center" }}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
    >
      <Checkbox value={value} onChange={handleChange}></Checkbox>
    </td>
  );

  return render == undefined
    ? defaultRendering
    : render?.call(undefined, defaultRendering, props);
};

const centerField = ["classnm", "orgdt", "adjdt"];

type IWindow = {
  setVisible(t: boolean): void;
  modal?: boolean;
  pathname: string;
};

const DATA_ITEM_KEY = "membership_key";

let targetRowIndex: null | number = null;

const AdjustApprovalWindow = ({
  setVisible,
  modal = false,
  pathname,
}: IWindow) => {
  const processApi = useApi();

  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");

  const pc = UseGetValueFromSessionItem("pc");

  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1000,
    height: isMobile == true ? deviceHeight : 600,
  });

  const onChangePostion = (position: any) => {
    setPosition(position);
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  // const [bizComponentData, setBizComponentData] = useState<any>(null);
  // UseBizComponent(
  //   "R_USEYN",
  //   //사용여부,
  //   setBizComponentData
  // );

  // //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  // const filterInputChange = (e: any) => {
  //   const { value, name } = e.target;

  //   setFilters((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  // //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  // const filterRadioChange = (e: any) => {
  //   const { name, value } = e;

  //   setFilters((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const onClose = () => {
    setVisible(false);
  };

  const [filters, setFilters] = useState({
    pgNum: 1,
    pgSize: PAGE_SIZE,
    isSearch: true,
  });

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

  let gridRef: any = useRef(null);

  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);
    //팝업 조회 파라미터

    // 프로시저
    const parameters: Iparameters = {
      procedureName: "P_CR_A1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "ADJLIST",
        "@p_orgdiv": orgdiv,
        "@p_custcd": "",
        "@p_adjdt": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (gridRef.current) {
        targetRowIndex = 0;
      }

      setMainDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], {}));
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onRowDoubleClick = (props: any) => {
    const selectedData = props.dataItem;

    selectedData.chk = true; // 2134
  };

  const onConfirmBtnClick = (props: any) => {
    fetchMainGridSaved();
  };

  const fetchMainGridSaved = async () => {
    let keys: string[] = [];
    // 체크한 항목 승인
    mainDataResult.data.forEach((row) => {
      if (row.chk == "Y" || row.chk == true) {
        keys.push(row.membership_key);
      }
    });

    if (keys.length == 0) {
      alert("선택한 자료가 없습니다.");
      return;
    }

    const para: Iparameters = {
      procedureName: "P_CR_A1000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "ADJAPP",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_custcd": "",
        "@p_membership_key": keys.join("|"),
        "@p_adjdt": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": pathname,
      },
    };

    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      alert("승인이 완료되었습니다.");

      // 현재 페이지 전부 승인
      const isLastDataDeleted =
        keys.length == mainDataResult.data.length && filters.pgNum > 0;

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
          pgNum: prev.pgNum != 1 ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data.resultMessage);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
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

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
  };

  const columnData: TColumn[] = [
    {
      id: "",
      field: "classnm",
      caption: "반",
      width: 120,
    },
    {
      id: "",
      field: "custnm",
      caption: "반려견명",
      width: 150,
    },
    {
      id: "",
      field: "orgdt",
      caption: "기존일자",
      width: 150,
    },
    {
      id: "",
      field: "adjdt",
      caption: "변경일자",
      width: 150,
    },
  ];

  return (
    <Window
      titles={"변경 신청 리스트"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <TitleContainer>
        <Title></Title>
        <ButtonContainer>
          <Button onClick={() => search()} icon="search" themeColor={"primary"}>
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <GridContainer height="calc(100% - 110px)">
        <Grid
          style={{ height: "calc(100%)" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              chk: row.chk == "Y" || row.chk == true ? true : false,
            })),
            mainDataState
          )}
          onDataStateChange={onMainDataStateChange}
          {...mainDataState}
          //선택 기능
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onMainSelectionChange}
          //스크롤 조회기능
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
          onItemChange={onMainItemChange}
          //더블클릭
          onRowDoubleClick={onRowDoubleClick}
        >
          <GridColumn
            field="chk"
            title=" "
            width="50px"
            editable={true}
            cell={CustomCheckBoxCell}
          />

          {columnData &&
            columnData.length > 0 &&
            columnData.map((column, index) => {
              return (
                <GridColumn
                  field={column.field}
                  title={column.caption}
                  width={column.width}
                  footerCell={index == 0 ? mainTotalFooterCell : undefined}
                  cell={
                    centerField.includes(column.field) ? CenterCell : undefined
                  }
                />
              );
            })}
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
            승인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default AdjustApprovalWindow;
