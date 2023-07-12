import { useEffect, useState, useCallback, useRef } from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridToolbar,
  GridSelectionChangeEvent,
  getSelectedState,
  GridHeaderSelectionChangeEvent,
  GridFooterCellProps,
  GridDataStateChangeEvent,
  GridSortChangeEvent,
  GridPageChangeEvent,
  GridItemChangeEvent,
  GridHeaderCellProps,
} from "@progress/kendo-react-grid";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
} from "../../CommonStyled";
import { Iparameters } from "../../store/types";
import {
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  findMessage,
  UseParaPc,
  UseGetValueFromSessionItem,
  getGridItemChangedData,
  getYn,
} from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import AttachmentsWindow from "./CommonWindows/AttachmentsWindow";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import { bytesToBase64 } from "byte-base64";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import {
  isLoading,
  deletedAttadatnumsState,
  unsavedAttadatnumsState,
} from "../../store/atoms";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import NumberCell from "../Cells/NumberCell";
import CheckBoxCell from "../Cells/CheckBoxCell";

let deletedMainRows: any[] = [];

type TDetailData = {
  chk_yn_s: string[];
  user_group_id_s: string[];
};

const DATA_ITEM_KEY = "num";
const idGetter = getter(DATA_ITEM_KEY);

type TKendoWindow = {
  setVisible(t: boolean): void;
  reloadData(user_id: string): void;
  userid? :string;
  userName? :string;
  modal?: boolean;
};
let targetRowIndex: null | number = null;
const KendoWindow = ({
  setVisible,
  reloadData,
  userid = "",
  userName = "",
  modal = false,
}: TKendoWindow) => {
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const gridRef = useRef<any>(null);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const setLoading = useSetRecoilState(isLoading);
  const [dataState, setDataState] = useState<State>({
    sort: [],
  });

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };

  const pathname: string = window.location.pathname.replace("/", "");

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent("L_BA000", setBizComponentData);

  // 그룹 카테고리 리스트
  const [groupCategoryListData, setGroupCategoryListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  // 그룹 카테고리 조회 쿼리
  const groupCategoryQuery =
    bizComponentData.length > 0
      ? getQueryFromBizComponent(
          bizComponentData.find(
            (item: any) => item.bizComponentId === "L_BA000"
          )
        )
      : "";

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  // 그룹 카테고리 조회
  useEffect(() => {
    if (bizComponentData.length > 0) {
      fetchQueryData(groupCategoryQuery, setGroupCategoryListData);
    }
  }, [bizComponentData]);

  const fetchQueryData = useCallback(
    async (queryStr: string, setListData: any) => {
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
    },
    []
  );

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 600,
    height: 600,
  });

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    if (unsavedAttadatnums.length > 0)
      setDeletedAttadatnums(unsavedAttadatnums);

    setVisible(false);
  };

  const processApi = useApi();

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onSelectionChange = useCallback(
    (event: GridSelectionChangeEvent) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: detailSelectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setDetailSelectedState(newSelectedState);
    },
    [detailSelectedState]
  );
  const onGridSortChange = (e: GridSortChangeEvent) => {
    setDataState((prev: any) => ({ ...prev, sort: e.sort }));
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
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
    if (field != "rowstatus") {
      const newData = detailDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = detailDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setDetailDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onGridDataStateChange = (event: GridDataStateChangeEvent) => {
    setDataState(event.dataState);
  };

  const [initialVal, setInitialVal] = useState({
    user_id: "",
    userName: "",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    // true면 조회조건(filters) 변경 되었을때 조회
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  useEffect(() => {
    fetchGrid(filters);
    setInitialVal({
      user_id : userid,
      userName: userName
    })
  }, []);

  //상세그리드 조회
  const fetchGrid = async (filters: any) => {
    let data: any;

    setLoading(true);

    const detailParameters: Iparameters = {
      procedureName: "P_SY_A0013W_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "GROUPID",
        "@p_orgdiv": "",
        "@p_location": "",
        "@p_dptcd": "",
        "@p_lang_id": "",
        "@p_user_category": "",
        "@p_user_id": "",
        "@p_user_name": "",
        "@p_menu_name": "",
        "@p_layout_key": "",
        "@p_category": "",
        "@p_service_id": "",
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters);
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
              (row: any) => row[DATA_ITEM_KEY] === filters.find_row_value
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
        setDetailDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
        const selectedRow =
          filters.find_row_value === ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] === filters.find_row_value
              );
        setDetailSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
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

 //프로시저 파라미터 초기값
 const [paraData, setParaData] = useState({
  work_type: "",
  orgdiv: "01",
  chk_yn_s: "",
  user_group_id_s: "",
  user_id_s: initialVal.user_id,
  target_user_s: "",
  row_state_s: "",
  add_delete_type_s: "",
  menu_id_s: "",
  form_view_yn_s: "",
  form_print_yn_s: "",
  form_save_yn_s: "",
  form_delete_yn_s: "",
  layout_key: "",
  category: "",
  userid: userId,
  pc: pc,
});

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
        //SY_A0010W에만 if문사용
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          isSearch: false,
        })); // 한번만 조회되도록

        fetchGrid(deepCopiedFilters);
      }
  }, [filters]);

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_SY_A0013W_S ",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": paraData.orgdiv,
      "@p_chk_yn_s": paraData.chk_yn_s,
      "@p_user_group_id_s": paraData.user_group_id_s,
      "@p_user_id_s": paraData.user_id_s,
      "@p_target_user_s": paraData.target_user_s,
      "@p_row_state_s": paraData.row_state_s,
      "@p_add_delete_type_s": paraData.add_delete_type_s,
      "@p_menu_id_s": paraData.menu_id_s,
      "@p_form_view_yn_s": paraData.form_view_yn_s,
      "@p_form_print_yn_s": paraData.form_print_yn_s,
      "@p_form_save_yn_s": paraData.form_save_yn_s,
      "@p_form_delete_yn_s": paraData.form_delete_yn_s,
      "@p_layout_key": paraData.layout_key,
      "@p_category": paraData.category,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
    },
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev) => ({ ...prev, pgNum: 1 }));
  };

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [detailDataResult]);

  const fetchMainSaved = async () => {
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      deletedMainRows = [];
      resetAllGrid();

      reloadData(paraData.user_id_s);
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraData.work_type = ""; //초기화
    setLoading(false);
  };

  const handleSubmit = () => {
    let detailArr: TDetailData = {
      chk_yn_s: [],
      user_group_id_s: [],
    };
   
    detailDataResult.data.forEach((item: any, i: number) => {
      const { rowstatus, chk_yn, user_group_id } = item;
      if (rowstatus !== "U") return;

      detailArr.chk_yn_s.push(getYn(chk_yn));
      detailArr.user_group_id_s.push(user_group_id);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: "U",
      p_user_id_s: initialVal.user_id,
      chk_yn_s: detailArr.chk_yn_s.join("|"),
      user_group_id_s: detailArr.user_group_id_s.join("|"),
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchMainSaved();
  }, [paraData]);

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  return (
    <Window
      title={"권한그룹 설정"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <FormBoxWrap>
        <FormBox>
          <tbody>
            <tr>
              <th>사용자ID</th>
              <td>
                <Input
                  name="user_id"
                  type="text"
                  value={initialVal.user_id}
                  className="readonly"
                />
              </td>
              <th>사용자명</th>
              <td>
                <Input
                  name="userName"
                  type="text"
                  value={initialVal.userName}
                  className="readonly"
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <GridContainer margin={{ top: "30px" }}>
        <Grid
          style={{ height: "38vh" }}
          data={process(
            detailDataResult.data.map((item: any) => ({
              ...item,
              [SELECTED_FIELD]: detailSelectedState[idGetter(item)],
            })),
            dataState
          )}
          {...dataState}
          onDataStateChange={onGridDataStateChange}
          // 렌더
          onItemChange={onMainItemChange}
          cellRender={customCellRender}
          rowRender={customRowRender}
          //선택기능
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          editField={EDIT_FIELD}
          selectable={{
            enabled: true,
            drag: false,
            cell: false,
            mode: "multiple",
          }}
          onSelectionChange={onSelectionChange}
          //스크롤 조회 기능
          fixedScroll={true}
          total={detailDataResult.total}
          skip={page.skip}
          take={page.take}
          pageable={true}
          onPageChange={pageChange}
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
         <GridColumn field="rowstatus" title=" " width="40px" />
          <GridColumn
            field="chk_yn"
            title=" "
            width="50px"
            cell={CheckBoxCell}
          />
          <GridColumn field="user_group_id" title="그룹ID" width="220px" footerCell={detailTotalFooterCell}/>
          <GridColumn field="user_group_name" title="그룹명" width="220px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={handleSubmit}>
            저장
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
