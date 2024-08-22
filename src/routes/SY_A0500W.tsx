import { Divider } from "@mui/material";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
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
import { Input } from "@progress/kendo-react-inputs";
import React, {
  MouseEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ContextMenu,
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
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { Layout, Position } from "../components/DnD/Layout";
import { LayoutSquare } from "../components/DnD/LayoutSquare";
import { Piece } from "../components/DnD/Piece";
import DetailWindow2 from "../components/Windows/CommonWindows/IconWindow";
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

var index = 0;
/** Styling properties applied to the board element */
const boardStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexWrap: "wrap",
};

/** Styling properties applied to each square element */
const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
let temp = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
const SY_A0500W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  const layout = useMemo(() => new Layout(), []);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".TitleContainer");
      height4 = getHeight(".FormBoxWrap");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height3);
        setMobileHeight2(getDeviceHeight(false) - height2 - height3);
        setWebHeight(getDeviceHeight(true) - height - height3);
        setWebHeight2(getDeviceHeight(false) - height2 - height3 - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  //커스텀 옵션 조회
  const setLoading = useSetRecoilState(isLoading);

  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [[knightX, knightY, indexs], setKnightPos] = useState<Position>(
    layout.position
  );
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
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
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  useEffect(() => {
    if (bizComponentData !== null) {
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
    }
  }, [bizComponentData]);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
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

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "layout_list",
    orgdiv: sessionOrgdiv,
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

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [detailWindowVisible2, setDetailWindowVisible2] =
    useState<boolean>(false);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

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

  const onClickMenu = (
    e: MouseEvent<HTMLDivElement>,
    x: number,
    y: number,
    info: any
  ) => {
    if (!permissions.save) return;

    e.preventDefault();
    setXY([x, y]);
    if (info == undefined) {
      setClicked(`${x}${y}`);
      setInfo({
        caption: "",
        form_id: "",
        key: "",
      });
      setPoints({
        x: e.pageX,
        y: e.pageY,
      });
    } else if (clicked == "") {
      setClicked(`${x}${y}`);
      setInfo({
        caption: info.caption,
        form_id: info.form_id,
        key: info.row_index + "" + info.col_index,
      });
      setPoints({
        x: e.pageX,
        y: e.pageY,
      });
    } else {
      setClicked(`${x}${y}`);
      setInfo({
        caption: info.caption,
        form_id: info.form_id,
        key: info.row_index + "" + info.col_index,
      });
      setPoints({
        x: e.pageX,
        y: e.pageY,
      });
    }
  };

  const longPressTimer: any = useRef(null);
  function renderSquare(
    row: number,
    col: number,
    squareStyle: CSSProperties,
    knightLists: any[]
  ) {
    const data = detailDataResult.data.filter(
      (item: any) => item.col_index == col && item.row_index == row
    )[0];

    const handleLongPress = (e: any) => {
      e.preventDefault(); // Prevent scrolling and other default actions
      longPressTimer.current = setTimeout(() => {
        if (data) {
          onClickMenu(e, row, col, data);
        }
      }, 500); // 500ms for long press
    };

    const clearLongPress = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };

    return (
      <div
        key={`${row}${col}`}
        style={squareStyle}
        onContextMenu={(e) => onClickMenu(e, row, col, data)}
        onDoubleClick={(e) => onClickMenu(e, row, col, data)}
        onTouchStart={handleLongPress}
        onTouchEnd={clearLongPress}
        onTouchCancel={clearLongPress} // 터치가 중단되는 경우도 처리
        onTouchMove={clearLongPress} // 터치가 움직일 때도 중단
      >
        <LayoutSquare
          x={row}
          y={col}
          layout={layout}
          list={detailDataResult.data}
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
    if (!permissions.view) return;
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

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.layout_key == filters.find_row_value
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
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row.layout_key == filters.find_row_value
                );

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
    if (!permissions.view) return;
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

    if (data.isSuccess == true) {
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
      detailFilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [detailFilters, permissions, bizComponentData, customOptionData]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
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
    setXY([-1, -1]);
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
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      resetAllGrid();
      setXY([-1, -1]);
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      if (swiper && isMobile) {
        swiper.slideTo(0);
      }
    } catch (e) {
      alert(e);
    }
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
    setXY([-1, -1]);
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
    setXY([-1, -1]);
  };

  const addCaption = (infomations: any) => {
    if (info.key != "") {
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
    } else {
      alert("아이콘을 먼저 등록해주세요");
    }
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
    setXY([-1, -1]);
  };

  const onAddClick3 = () => {
    setWorkType("N");
    setInformation({
      location: "",
      layout_id: "",
      layout_key: "",
      layout_name: "",
      orgdiv: sessionOrgdiv,
      col_cnt: 5,
      row_cnt: 5,
    });
    setXY([-1, -1]);
    setDetailDataResult(process([], detailDataState));
  };

  const onAddIcon = (IconInfo: any, infos: any) => {
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
          menu_name: "",
          orgdiv: sessionOrgdiv,
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
      } else {
        const newData = detailDataResult.data.map((item) =>
          infos.key == item.row_index + "" + item.col_index
            ? {
                ...item,
                icon: IconInfo.icon_image,
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
        setXY([-1, -1]);
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
      }
    }
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;

    try {
      if (
        information.location == null ||
        information.location == "" ||
        information.location == undefined
      ) {
        throw findMessage(messagesData, "SY_A0500W_001");
      } else if (
        information.layout_id == null ||
        information.layout_id == "" ||
        information.layout_id == undefined
      ) {
        throw findMessage(messagesData, "SY_A0500W_001");
      } else {
        let data: any;

        const paraSaved: Iparameters = {
          procedureName: "P_SY_A0500W_S",
          pageNumber: 0,
          pageSize: 0,
          parameters: {
            "@p_work_type":
              workType == "N" ? "ins_layout_header" : "upd_layout_header",
            "@p_orgdiv": information.orgdiv,
            "@p_location": information.location,
            "@p_key_value": information.layout_key,
            "@p_id": information.layout_id,
            "@p_name": information.layout_name,
            "@p_col_cnt": information.col_cnt,
            "@p_row_cnt": information.row_cnt,
            "@p_icon": "",
            "@p_caption": "",
            "@p_form_id": "",
            "@p_menu_name": "",
            "@p_col_index": 0,
            "@p_row_index": 0,
            "@p_header_guid_s": "",
            "@p_header_caption_s": "",
            "@p_detail_guid_s": "",
            "@p_form_id_s": "",
            "@p_exec_userid": userId,
            "@p_exec_pc": pc,
          },
        };

        try {
          data = await processApi<any>("procedure", paraSaved);
        } catch (error) {
          data = null;
        }

        if (data.isSuccess == true) {
          for (let i = 0; i < detailDataResult.data.length; i++) {
            await SaveDetail(detailDataResult.data[i]);
          }

          setFilters((prev) => ({
            ...prev,
            find_row_value: data.returnString,
            isSearch: true,
          }));
        } else {
          console.log("[오류 발생]");
          console.log(data);
          alert(data.resultMessage);
        }
      }
    } catch (e) {
      alert(e);
    }
  };
  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = async () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    let data: any;

    const paraSaved: Iparameters = {
      procedureName: "P_SY_A0500W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "del_layout",
        "@p_orgdiv": information.orgdiv,
        "@p_location": information.location,
        "@p_key_value": information.layout_key,
        "@p_id": information.layout_id,
        "@p_name": information.layout_name,
        "@p_col_cnt": information.col_cnt,
        "@p_row_cnt": information.row_cnt,
        "@p_icon": "",
        "@p_caption": "",
        "@p_form_id": "",
        "@p_menu_name": "",
        "@p_col_index": 0,
        "@p_row_index": 0,
        "@p_header_guid_s": "",
        "@p_header_caption_s": "",
        "@p_detail_guid_s": "",
        "@p_form_id_s": "",
        "@p_exec_userid": userId,
        "@p_exec_pc": pc,
      },
    };

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 1;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );
      if (isLastDataDeleted) {
        setPage({
          skip: PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
      }

      setFilters((prev) => ({
        ...prev,
        find_row_value:
          mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
          undefined
            ? ""
            : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                .layout_key,
        pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
  };

  const SaveDetail = async (item: any) => {
    let data2: any;

    const paraSaved2: Iparameters = {
      procedureName: "P_SY_A0500W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "ins_layout_detail",
        "@p_orgdiv": information.orgdiv,
        "@p_location": information.location,
        "@p_key_value": information.layout_key,
        "@p_id": information.layout_id,
        "@p_name": information.layout_name,
        "@p_col_cnt": information.col_cnt,
        "@p_row_cnt": information.row_cnt,
        "@p_icon": item.icon,
        "@p_caption": item.caption,
        "@p_form_id": item.form_id,
        "@p_menu_name": item.menu_name,
        "@p_col_index": item.col_index,
        "@p_row_index": item.row_index,
        "@p_header_guid_s": "",
        "@p_header_caption_s": "",
        "@p_detail_guid_s": "",
        "@p_form_id_s": "",
        "@p_exec_userid": userId,
        "@p_exec_pc": pc,
      },
    };
    try {
      data2 = await processApi<any>("procedure", paraSaved2);
    } catch (error) {
      data2 = null;
    }
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "레이아웃 설정";
      _export.save(optionsGridOne);
    }
  };

  return (
    <>
      {isMobile ? (
        <>
          <TitleContainer className="TitleContainer">
            <Title>{getMenuName()}</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  permissions={permissions}
                  exportExcel={exportExcel}
                />
              )}
            </ButtonContainer>
          </TitleContainer>
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
                }}
              >
                <FilterContainer>
                  <FilterBox
                    onKeyPress={(e) => handleKeyPressSearch(e, search)}
                  >
                    <tbody>
                      <tr>
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
                      </tr>
                    </tbody>
                  </FilterBox>
                </FilterContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle></GridTitle>
                  <ButtonContainer style={{ justifyContent: "right" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-right"
                    >
                      다음
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  ref={(exporter) => (_export = exporter)}
                  data={mainDataResult.data}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{
                      height: mobileheight,
                      overflow: "auto",
                    }}
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"]
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
                <GridTitle></GridTitle>
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
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
                <DndProvider backend={HTML5Backend}>
                  <div
                    style={{
                      width: "100%",
                      height: mobileheight2,
                      border: "1px solid gray",
                    }}
                  >
                    <div style={boardStyle}>{squares}</div>
                  </div>
                </DndProvider>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <TitleContainer className="TitleContainer">
            <Title>{getMenuName()}</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  permissions={permissions}
                  exportExcel={exportExcel}
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <GridContainerWrap onClick={deletemenu}>
            <GridContainer width="20%">
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <FilterContainer>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
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
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
              <ExcelExport
                ref={(exporter) => (_export = exporter)}
                data={mainDataResult.data}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: webheight }}
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
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"]
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
            <GridContainer width={`calc(80% - ${GAP}px)`}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>프로세스 레이아웃</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="plus"
                    disabled={permissions.save ? false : true}
                  >
                    행 추가
                  </Button>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="plus"
                    disabled={permissions.save ? false : true}
                  >
                    열 추가
                  </Button>
                  <Button
                    onClick={onRemoveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  >
                    행 삭제
                  </Button>
                  <Button
                    onClick={onRemoveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    disabled={permissions.save ? false : true}
                  >
                    열 삭제
                  </Button>
                  <Button
                    onClick={onAddClick3}
                    themeColor={"primary"}
                    icon="file-add"
                    disabled={permissions.save ? false : true}
                  >
                    신규
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
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap className="FormBoxWrap">
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
                <div
                  style={{
                    width: "100%",
                    height: webheight2,
                    border: "1px solid gray",
                  }}
                >
                  <div style={boardStyle}>{squares}</div>
                </div>
              </DndProvider>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {clicked != "" && (
        <ContextMenu top={points.y} left={points.x}>
          {info.key == "" ? (
            <ul>
              <li
                onClick={(e) => {
                  handleClick(e);
                  setDetailWindowVisible2(true);
                }}
              >
                아이콘 등록/변경
              </li>
            </ul>
          ) : (
            <ul>
              <li onClick={handleClick}>
                <p>캡션</p>
                <Input
                  name="caption"
                  type="text"
                  value={info.caption}
                  onChange={InfoChange}
                />
              </li>
              <li>
                <p>Form ID</p>
                <Input
                  name="form_id"
                  type="text"
                  value={info.form_id}
                  className="readonly"
                />
              </li>
              <Divider />
              <li
                onClick={(e) => {
                  handleClick(e);
                  setDetailWindowVisible(true);
                }}
              >
                메뉴 등록
              </li>
              <li
                onClick={(e) => {
                  handleClick(e);
                  setDetailWindowVisible2(true);
                }}
              >
                아이콘 등록/변경
              </li>
              <Divider />
              <li onClick={() => removeCaption(info)}>초기화</li>
              <li onClick={() => removeIcon(info)}>제거</li>
            </ul>
          )}
        </ContextMenu>
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          reloadData={(data) => addCaption(data)}
          modal={true}
        />
      )}
      {detailWindowVisible2 && (
        <DetailWindow2
          setVisible={setDetailWindowVisible2}
          reloadData={(data) => onAddIcon(data, info)}
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
