import { Divider } from "@mui/material";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
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
import { bytesToBase64 } from "byte-base64";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ContextMenu,
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
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  getQueryFromBizComponent,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import { Layout, Position } from "../components/DnD/Layout";
import { LayoutSquare } from "../components/DnD/LayoutSquare";
import { Piece } from "../components/DnD/Piece";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import DetailWindow from "../components/Windows/CommonWindows/MenuWindow";
import { useApi } from "../hooks/api";
import {
  clickedState,
  infoState,
  isLoading,
  pointsState,
} from "../store/atoms";
import { gridList } from "../store/columns/SY_A0500W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

export interface AppState {
  position: [number, number];
}
export interface BoardProps {
  layout: Layout;
}

/** Styling properties applied to the board element */
const boardStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexWrap: "wrap",
};
const containerStyle: CSSProperties = {
  width: "100%",
  height: "78.5vh",
  border: "1px solid gray",
};
/** Styling properties applied to each square element */
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let targetRowIndex: null | number = null;
let temp = 0;

const ColumnCommandCell = (props: GridCellProps) => {
  const excelInput: any = React.useRef();
  const [imgBase64, setImgBase64] = useState<string>(); // 파일 base64
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    render,
    className = "",
  } = props;

  useEffect(() => {
    if (dataItem.icon_image != null) {
      setImgBase64("data:image/png;base64," + dataItem.icon_image);
    }
  });

  return (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative", textAlign: "center", cursor: "pointer" }}
    >
      <div style={{ textAlign: "center" }}>
        <img
          style={{ display: "block", margin: "auto", width: "80%" }}
          ref={excelInput}
          src={imgBase64}
          alt="UserImage"
        />
      </div>
    </td>
  );
};

const SY_A0500W: React.FC = () => {
  const layout = useMemo(() => new Layout(), []);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const pathname: string = window.location.pathname.replace("/", "");
  //커스텀 옵션 조회
  const setLoading = useSetRecoilState(isLoading);
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [[knightX, knightY, indexs], setKnightPos] = useState<Position>(
    layout.position
  );
  const [clicked, setClicked] = useRecoilState(clickedState);
  const [info, setInfo] = useRecoilState(infoState);
  const [points, setPoints] = useRecoilState(pointsState);
  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA002", setBizComponentData);
  const [xy, setXY] = useState([-1, -1]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      fetchQuery(locationQueryStr, setLocationListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
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
  }, []);
  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "layout_list",
    orgdiv: "01",
    location: "",
    pgNum: 1,
    find_row_value: "",
    isSearch: true,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "layout_detail",
    layout_key: "",
    pgNum: 1,
    find_row_value: "",
    isSearch: false,
  });

  //조회조건 초기값
  const [information, setInformation] = useState({
    location: "",
    layout_id: "",
    layout_key: "",
    layout_name: "",
    orgdiv: "",
    col_cnt: 5,
    row_cnt: 5,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    name: "",
    pgNum: 1,
    find_row_value: "",
    isSearch: false,
  });

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [squares, setSquares] = useState<any[]>([]);

  useEffect(() => {
    layout.observe(setKnightPos);
  });

  useEffect(() => {
    if (detailDataResult.total > 0) {
      const newItem = detailDataResult.data.map((item: any) =>
        item.seq == indexs
          ? { ...item, col_index: knightY, row_index: knightX }
          : { ...item }
      );
      setDetailDataResult((prev) => {
        return {
          data: newItem,
          total: prev.total,
        };
      });
    }
  }, [knightX, knightY]);

  function knights(x: number, y: number) {
    let valid = false;
    detailDataResult.data.map((item) => {
      if (item.row_index == x && item.col_index == y) {
        valid = true;
      }
    });
    return valid;
  }

  function renderSquare(
    row: number,
    col: number,
    squareStyle: CSSProperties,
    knightLists: any[]
  ) {
    const data = detailDataResult.data.filter(
      (item: any) => item.col_index == col && item.row_index == row
    )[0];

    return (
      <div
        key={`${row}${col}`}
        style={squareStyle}
        onClick={() => {
          if (xy[0] == row && xy[1] == col) {
            setXY([-1, -1]);
          } else {
            setXY([row, col]);
          }
        }}
      >
        <LayoutSquare
          x={row}
          y={col}
          layout={layout}
          list={detailDataResult.data}
          bool={xy[0] == row && xy[1] == col ? false : true}
        >
          <Piece
            isKnight={knights(row, col)}
            x={row}
            y={col}
            layout={layout}
            list={knightLists}
            info={data}
          />
        </LayoutSquare>
      </div>
    );
  }

  useEffect(() => {
    const width = 100 / information.col_cnt;
    const height = 100 / information.row_cnt;
    const squareStyle: CSSProperties = {
      width: width + "%",
      height: height + "%",
      cursor: "pointer",
    };
    let arrays = [];
    for (let i = 0; i < information.row_cnt; i++) {
      for (let j = 0; j < information.col_cnt; j++) {
        arrays.push(renderSquare(i, j, squareStyle, detailDataResult.data));
      }
    }
    setSquares(arrays);
  }, [detailDataResult, information, xy]);

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
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
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const InputChange2 = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const InfoChange = (e: any) => {
    const { value, name } = e.target;

    const newData = detailDataResult.data.map((item) =>
      info.key == item.row_index + "" + item.col_index
        ? {
            ...item,
            [name]: value,
          }
        : {
            ...item,
          }
    );

    setDetailDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setInfo((prev) => ({
      ...prev,
      caption: value,
    }));
  };

  let gridRef: any = useRef(null);
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0500W_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_key_value": "",
        "@p_id": "",
        "@p_name": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.user_id == filters.find_row_value
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
          setWorkType("U");
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
          }));
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find((row: any) => row.user_id == filters.find_row_value);

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
            setInformation({
              location: selectedRow.location,
              layout_id: selectedRow.layout_id,
              layout_key: selectedRow.layout_key,
              layout_name: selectedRow.layout_name,
              orgdiv: selectedRow.orgdiv,
              col_cnt: selectedRow.col_cnt,
              row_cnt: selectedRow.row_cnt,
            });
            setDetailFilters((prev) => ({
              ...prev,
              layout_key: selectedRow.layout_key,
              isSearch: true,
              pgNum: 1,
            }));
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
            setInformation({
              location: rows[0].location,
              layout_id: rows[0].layout_id,
              layout_key: rows[0].layout_key,
              layout_name: rows[0].layout_name,
              orgdiv: rows[0].orgdiv,
              col_cnt: rows[0].col_cnt,
              row_cnt: rows[0].row_cnt,
            });
            setDetailFilters((prev) => ({
              ...prev,
              layout_key: rows[0].layout_key,
              isSearch: true,
              pgNum: 1,
            }));
          }
        } else {
          setWorkType("N");
          setInformation({
            location: "",
            layout_id: "",
            layout_key: "",
            layout_name: "",
            orgdiv: "",
            col_cnt: 0,
            row_cnt: 0,
          });
          setDetailDataResult(process([], detailDataState));
        }
      }
    } else {
      console.log("[에러발생]");
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

  const fetchSubGrid = async (detailFilters: any) => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0500W_Q ",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": detailFilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_key_value": detailFilters.layout_key,
        "@p_id": "",
        "@p_name": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[1].Rows;

      if (totalRowCnt > 0) {
        setDetailDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters = {
      para:
        "icons?page=" +
        filters2.pgNum +
        "&pageSize=" +
        filters2.pgSize +
        "&name=" +
        filters2.name,
    };

    try {
      data = await processApi<any>("icons", parameters);
    } catch (error) {
      data = null;
    }
    let idx = 0;
    if (data.RowCount > 0) {
      const totalRowCnt = data.TotalRowCount;
      const rows = data.Rows.map((item: any) => ({
        ...item,
        num: idx++,
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (detailFilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [detailFilters]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setClicked("");
    setInfo({
      caption: "",
      form_id: "",
      key: "",
    });
    setPoints({
      x: 0,
      y: 0,
    });
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setXY([-1, -1]);
    setSelectedState(newSelectedState);
    setWorkType("U");
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    const location = locationListData.find(
      (item: any) => item.code_name == selectedRowData.location
    )?.sub_code;
    setInformation({
      location: location == undefined ? "" : location,
      layout_id: selectedRowData.layout_id,
      layout_key: selectedRowData.layout_key,
      layout_name: selectedRowData.layout_name,
      orgdiv: selectedRowData.orgdiv,
      col_cnt: selectedRowData.col_cnt,
      row_cnt: selectedRowData.row_cnt,
    });
    setDetailFilters((prev) => ({
      ...prev,
      layout_key: selectedRowData.layout_key,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
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
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const search = () => {
    try {
      resetAllGrid();
      setXY([-1, -1]);
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    } catch (e) {
      alert(e);
    }
  };

  const minGridWidth = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);

  React.useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      window.addEventListener("resize", handleResize);

      //가장작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"].map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );

      setGridCurrent(grid.current.clientWidth);
      setApplyMinWidth(grid.current.clientWidth < minGridWidth.current);
    }
  }, [customOptionData]);

  const handleResize = () => {
    if (grid.current.clientWidth < minGridWidth.current && !applyMinWidth) {
      setApplyMinWidth(true);
    } else if (grid.current.clientWidth > minGridWidth.current) {
      setGridCurrent(grid.current.clientWidth);
      setApplyMinWidth(false);
    }
  };

  const setWidth = (Name: string, minWidth: number | undefined) => {
    if (minWidth == undefined) {
      minWidth = 0;
    }
    let width = applyMinWidth
      ? minWidth
      : minWidth +
        (gridCurrent - minGridWidth.current) /
          customOptionData.menuCustomColumnOptions[Name].length;

    return width;
  };

  const onAddClick = () => {
    setInformation((prev) => ({
      ...prev,
      col_cnt: prev.col_cnt + 1,
    }));
  };

  const onAddClick2 = () => {
    setInformation((prev) => ({
      ...prev,
      row_cnt: prev.row_cnt + 1,
    }));
  };

  const onRemoveClick = () => {
    if (information.col_cnt > 0) {
      const data = detailDataResult.data.filter(
        (item) => item.col_index > information.col_cnt - 2
      );
      if (data.length == 0) {
        if (information.col_cnt - 1 == xy[1]) {
          setXY([-1, -1]);
        }
        setInformation((prev) => ({
          ...prev,
          col_cnt: prev.col_cnt - 1,
        }));
      } else {
        alert("등록된 아이콘이 존재하여 제거할 수 없습니다.");
      }
    }
  };

  const onRemoveClick2 = () => {
    if (information.row_cnt > 0) {
      const data = detailDataResult.data.filter(
        (item) => item.row_index > information.row_cnt - 2
      );
      if (data.length == 0) {
        if (information.row_cnt - 1 == xy[0]) {
          setXY([-1, -1]);
        }
        setInformation((prev) => ({
          ...prev,
          row_cnt: prev.row_cnt - 1,
        }));
      } else {
        alert("등록된 아이콘이 존재하여 제거할 수 없습니다.");
      }
    }
  };

  const removeCaption = (infomations: any) => {
    const newData = detailDataResult.data.map((item) =>
      infomations.key == item.row_index + "" + item.col_index
        ? {
            ...item,
            caption: "",
            form_id: "",
          }
        : {
            ...item,
          }
    );

    setDetailDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setClicked("");
    setInfo({
      caption: "",
      form_id: "",
      key: "",
    });
    setPoints({
      x: 0,
      y: 0,
    });
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  const removeIcon = (infomations: any) => {
    let newData: any[] = [];
    //삭제 안 할 데이터 newData에 push
    detailDataResult.data.forEach((item: any) => {
      if (infomations.key != item.row_index + "" + item.col_index) {
        newData.push(item);
      }
    });

    setDetailDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setClicked("");
    setInfo({
      caption: "",
      form_id: "",
      key: "",
    });
    setPoints({
      x: 0,
      y: 0,
    });
  };

  const addCaption = (infomations: any) => {
    const newData = detailDataResult.data.map((item) =>
      info.key == item.row_index + "" + item.col_index
        ? {
            ...item,
            caption: infomations.menu_name,
            form_id: infomations.form_id,
            menu_name: infomations.menu_name,
          }
        : {
            ...item,
          }
    );

    setDetailDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setInfo((prev) => ({
      ...prev,
      caption: infomations.menu_name,
      form_id: infomations.form_id,
    }));
    setClicked("");
    setPoints({
      x: 0,
      y: 0,
    });
  };

  const deletemenu = () => {
    setClicked("");
    setInfo({
      caption: "",
      form_id: "",
      key: "",
    });
    setPoints({
      x: 0,
      y: 0,
    });
  };

  const onAddClick3 = () => {
    setWorkType("N");
    setInformation({
      location: "",
      layout_id: "",
      layout_key: "",
      layout_name: "",
      orgdiv: "",
      col_cnt: 5,
      row_cnt: 5,
    });
    setXY([-1, -1]);
    setDetailDataResult(process([], detailDataState));
  };

  const onAddIcon = () => {
    const IconInfo = mainDataResult2.data.filter(
      (item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
    )[0];

    if (IconInfo == undefined) {
      alert("아이콘이 없습니다.");
    } else if (xy[0] == -1 || xy[1] == -1) {
      alert("영역선택을 해주세요.");
    } else {
      let valid = true;
      detailDataResult.data.map((item) => {
        if (item.col_index == xy[1] && item.row_index == xy[0]) {
          valid = false;
        }
      });

      if (valid == true) {
        detailDataResult.data.map((item) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });
        const newDataItem = {
          caption: "",
          col_index: xy[1],
          form_id: "",
          icon: IconInfo.icon_image,
          insert_pc: null,
          insert_time: null,
          insert_userid: null,
          last_update_time: null,
          layout_key: information.layout_id,
          menu_name: IconInfo.icon_word_text + "_" + information.layout_id,
          orgdiv: "01",
          row_index: xy[0],
          seq: ++temp,
          update_pc: null,
          update_time: null,
          update_userid: null,
          rowstatus: "N",
        };
        setDetailDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
        setXY([-1, -1]);
      } else {
        alert("이미 존재하는 영역입니다.");
      }
    }
  };
  return (
    <>
      <TitleContainer>
        <Title>레이아웃 설정</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              permissions={permissions}
              disable={true}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <GridContainerWrap onClick={deletemenu}>
        <GridContainer width="20%">
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
          </GridTitleContainer>
          <FormBoxWrap>
            <FormBox>
              <tbody>
                <tr>
                  <th style={{ width: "10%" }}>사업장</th>
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
            </FormBox>
          </FormBoxWrap>
          <Grid
            style={{ height: "79vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                location: locationListData.find(
                  (item: any) => item.sub_code == row.location
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
            onSelectionChange={onMainSelectionChange}
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
            id="grdList"
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={setWidth("grdList", item.width)}
                      footerCell={
                        item.sortOrder === 0 ? mainTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(55% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>프로세스 레이아웃</GridTitle>
            <ButtonContainer>
              <Button onClick={onAddClick2} themeColor={"primary"} icon="plus">
                행 추가
              </Button>
              <Button onClick={onAddClick} themeColor={"primary"} icon="plus">
                열 추가
              </Button>
              <Button
                onClick={onRemoveClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
              >
                행 삭제
              </Button>
              <Button
                onClick={onRemoveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
              >
                열 삭제
              </Button>
              <Button
                onClick={onAddClick3}
                themeColor={"primary"}
                icon="file-add"
              >
                신규
              </Button>
              <Button
                // onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="delete"
              >
                삭제
              </Button>
              <Button
                // onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <FormBoxWrap>
            <FormBox>
              <tbody>
                <tr>
                  <th>사업장</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="location"
                        value={information.location}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                        type="new"
                      />
                    )}
                  </td>
                  <th>레이아웃ID</th>
                  <td>
                    {workType == "N" ? (
                      <Input
                        name="layout_id"
                        type="text"
                        value={information.layout_id}
                        onChange={InputChange}
                        className="required"
                      />
                    ) : (
                      <Input
                        name="layout_id"
                        type="text"
                        value={information.layout_id}
                        className="readonly"
                      />
                    )}
                  </td>
                  <th>레이아웃명</th>
                  <td>
                    <Input
                      name="layout_name"
                      type="text"
                      value={information.layout_name}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
          <DndProvider backend={HTML5Backend}>
            <div style={containerStyle}>
              <div style={boardStyle}>{squares}</div>
            </div>
          </DndProvider>
        </GridContainer>
        <GridContainer width={`calc(25% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>아이콘</GridTitle>
          </GridTitleContainer>
          <FormBoxWrap>
            <FormBox>
              <tbody>
                <tr>
                  <th style={{ width: "10%" }}>아이콘명</th>
                  <td>
                    <Input
                      name="name"
                      type="text"
                      value={filters2.name}
                      onChange={InputChange2}
                    />
                  </td>
                  <th>
                    <Button
                      onClick={() => {
                        setPage2(initialPageState);
                        setFilters2((prev) => ({
                          ...prev,
                          isSearch: true,
                          pgNum: 1,
                        }));
                      }}
                      icon="search"
                      themeColor={"primary"}
                    >
                      조회
                    </Button>
                  </th>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
          <Grid
            style={{ height: "79vh" }}
            data={process(
              mainDataResult2.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
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
            onSelectionChange={onMainSelectionChange2}
            onRowDoubleClick={() => onAddIcon()}
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
          >
            <GridColumn
              field="icon_image"
              title="아이콘"
              width="120px"
              cell={ColumnCommandCell}
              footerCell={mainTotalFooterCell2}
            />
            <GridColumn field="icon_word_text" title="아이콘명" width="120px" />
            <GridColumn field="remark" title="비고" width="200px" />
            <GridColumn
              field="category"
              title="유형분류"
              width="120px"
              headerCell={RequiredHeader}
            />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      {clicked != "" && (
        <ContextMenu top={points.y} left={points.x}>
          <ul>
            <li onClick={handleClick}>
              <Input
                name="caption"
                type="text"
                value={info.caption}
                onChange={InfoChange}
              />
            </li>
            <li>{info.form_id}</li>
            <Divider />
            <li
              onClick={(e) => {
                handleClick(e);
                setDetailWindowVisible(true);
              }}
            >
              메뉴 등록
            </li>
            <Divider />
            <li onClick={() => removeCaption(info)}>초기화</li>
            <li onClick={() => removeIcon(info)}>제거</li>
          </ul>
        </ContextMenu>
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          reloadData={(data) => addCaption(data)}
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
export default SY_A0500W;
