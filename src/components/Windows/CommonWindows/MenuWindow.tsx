import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  TreeList,
  TreeListColumnProps,
  TreeListExpandChangeEvent,
  createDataTree,
  extendDataItem,
  getSelectedState,
  mapTree,
} from "@progress/kendo-react-treelist";
import { bytesToBase64 } from "byte-base64";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { BottomContainer, ButtonContainer } from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isLoading } from "../../../store/atoms";
import {
  EDIT_FIELD,
  EXPANDED_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../../CommonString";

let deletedMainRows: any[] = [];

const ALL_MENU_DATA_ITEM_KEY = "KeyID";
const SUB_ITEMS_FIELD: string = "menus";

const menuQueryStr = `SELECT menu_id AS KeyID,
parent_menu_id AS ParentKeyID,
menu_name,
category,
form_id,
sort_order
FROM sysMenuPool
WHERE category <> 'FORM'
AND parent_menu_id <> ''
AND release_status = 'R'`;

type TKendoWindow = {
  setVisible(t: boolean): void;
  reloadData(workType: string, groupCode?: string): void;
  modal?: boolean;
};

const KendoWindow = ({
  setVisible,
  reloadData,
  modal = false,
}: TKendoWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const idGetter2 = getter(ALL_MENU_DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 400,
    height: 800,
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
    setVisible(false);
  };

  const allMenuColumns: TreeListColumnProps[] = [
    { field: "menu_name", title: "메뉴명", expandable: true },
    { field: "form_id", title: "Form ID", expandable: false },
  ];
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [allMenuDataResult, setAllMenuDataResult] = useState<any>({
    data: [],
    expanded: ["M2022062210224011070"],
    editItem: undefined,
    editItemField: undefined,
  });
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [allMenuSelectedState, setAllMenuSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    user_group_id: "",
    user_group_name: "",
    lang_id: "",
    use_yn: "",
    find_row_value: "",
    find_row_value2: "",
    pgNum: 1,
    isSearch: true,
  });

  const fetchAllMenuGrid = async (filter: any) => {
    let data: any;
    setLoading(true);

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(menuQueryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.KeyID,
          (i: any) => i.ParentKeyID,
          SUB_ITEMS_FIELD
        );

        setAllMenuDataResult({
          ...allMenuDataResult,
          data: dataTree,
        });
        setDetailDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            filter.find_row_value2 == ""
              ? rows[0]
              : rows.find(
                  (row: any) =>
                    row[ALL_MENU_DATA_ITEM_KEY] == filter.find_row_value2
                );

          setAllMenuSelectedState({
            [selectedRow[ALL_MENU_DATA_ITEM_KEY]]: true,
          });
        }
      } else {
        // 앱 메뉴 (최상위 메뉴) 없을 시 데이터 세팅
        // 드래그앤드롭 사용 시 그리드 내 데이터 최소 1개 필요함

        const appMenuRow = [
          {
            KeyID: "",
            ParentKeyID: "",
            form_delete_yn: "Y",
            form_id: "",
            form_print_yn: "Y",
            form_save_yn: "Y",
            form_view_yn: "Y",
            menu_name: "",
            path: "",
            row_state: "Q",
            sort_order: 0,
            rowstatus: "N",
          },
        ];

        const appMenuDataTree = createDataTree(
          appMenuRow,
          (i: any) => i.KeyID,
          (i: any) => i.ParentKeyID,
          SUB_ITEMS_FIELD
        );

        setAllMenuDataResult((prev: any) => {
          if (prev.length === 0) {
            return { ...prev, data: appMenuDataTree };
          } else {
            return prev;
          }
        });
        setAllMenuSelectedState({
          [appMenuRow[0][ALL_MENU_DATA_ITEM_KEY]]: true,
        });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchAllMenuGrid(deepCopiedFilters);
    }
  }, [filters]);

  const editItemId2 = allMenuDataResult.editItem
    ? allMenuDataResult.editItem[ALL_MENU_DATA_ITEM_KEY]
    : null;

  const onAllMenuExpandChange = (event: TreeListExpandChangeEvent) => {
    setAllMenuDataResult({
      ...allMenuDataResult,
      expanded: event.value
        ? allMenuDataResult.expanded.filter(
            (id: any) => id !== event.dataItem[ALL_MENU_DATA_ITEM_KEY]
          )
        : [
            ...allMenuDataResult.expanded,
            event.dataItem[ALL_MENU_DATA_ITEM_KEY],
          ],
    });
  };

  const onAllMenuSelectionChange = useCallback(
    (event: any) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: allMenuSelectedState,
        dataItemKey: ALL_MENU_DATA_ITEM_KEY,
      });
      setAllMenuSelectedState(newSelectedState);
    },
    [allMenuSelectedState]
  );

  const onRowDoubleClick = (props: any) => {
    const datas = props.dataItem;
    reloadData(datas);
    setVisible(false);
  };

  const onConfirmClick = () => {
    const datas = detailDataResult.data.filter(
      (item) =>
        item[ALL_MENU_DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(allMenuSelectedState)[0]
    )[0];
    reloadData(datas);
    setVisible(false);
  };

  const Menus = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div onClick={Menus}>
      <Window
        title={"메뉴 참조"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <TreeList
          data={mapTree(allMenuDataResult.data, SUB_ITEMS_FIELD, (item) =>
            extendDataItem(item, SUB_ITEMS_FIELD, {
              [EXPANDED_FIELD]: allMenuDataResult.expanded.includes(
                item[ALL_MENU_DATA_ITEM_KEY]
              ),
              [EDIT_FIELD]:
                item[ALL_MENU_DATA_ITEM_KEY] == editItemId2
                  ? allMenuDataResult.editItemField
                  : undefined,
              [SELECTED_FIELD]: allMenuSelectedState[idGetter2(item)], //선택된 데이터
            })
          )}
          expandField={EXPANDED_FIELD}
          subItemsField={SUB_ITEMS_FIELD}
          onExpandChange={onAllMenuExpandChange}
          //선택 기능
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            drag: false,
            cell: false,
            mode: "single",
          }}
          onSelectionChange={onAllMenuSelectionChange}
          onRowDoubleClick={onRowDoubleClick}
          columns={allMenuColumns}
        ></TreeList>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={onConfirmClick}>
              확인
            </Button>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              취소
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
    </div>
  );
};

export default KendoWindow;
