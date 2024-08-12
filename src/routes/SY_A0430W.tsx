import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getSelectedState } from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import {
  TreeList,
  TreeListColumnProps,
  TreeListExpandChangeEvent,
  TreeListItemChangeEvent,
  TreeListTextEditor,
  createDataTree,
  extendDataItem,
  mapTree,
  treeToFlat,
} from "@progress/kendo-react-treelist";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  EXPANDED_FIELD,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { Renderers } from "../components/Renderers/TreeListRenderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

//그리드 별 키 필드값
const SUB_ITEMS_FIELD: string = "menus";
const ALL_MENU_DATA_ITEM_KEY = "menu_id";
var height = 0;
var height2 = 0;
const allMenuColumns: TreeListColumnProps[] = [
  { field: "form_id", title: "폼 ID", expandable: true, width: "10%" },
  {
    field: "origin_caption",
    title: "원본 메뉴명",
    expandable: false,
    width: "30%",
  },
  {
    field: "system_caption",
    title: "시스템 설정 메뉴명",
    expandable: false,
    width: "30%",
  },
  {
    field: "custom_caption",
    title: "사용자 정의 메뉴명",
    expandable: false,
    editCell: TreeListTextEditor,
    width: "30%",
  },
];

const SY_A0150: React.FC = () => {
  const idGetter = getter(ALL_MENU_DATA_ITEM_KEY);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);

  UseMessages(setMessagesData);

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setWebHeight(getDeviceHeight(true) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        culture_name: defaultOption.find(
          (item: any) => item.id == "culture_name"
        )?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<any>({
    data: [],
    expanded: [],
    editItem: undefined,
    editItemField: undefined,
    changes: false,
  });

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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
    pgSize: 1000,
    work_type: "list",
    culture_name: "",
    menu_name: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0430W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_culture_name": filters.culture_name,
        "@p_menu_name": filters.menu_name,
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
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.menu_id,
          (i: any) => i.parent_menu_id,
          SUB_ITEMS_FIELD
        );
        setMainDataResult({
          ...mainDataResult,
          data: dataTree,
        });
        if (totalRowCnt > 0) {
          setSelectedState({
            [rows[0][ALL_MENU_DATA_ITEM_KEY]]: true,
          });
        }
      } else {
        setMainDataResult({
          data: [],
          expanded: [],
          editItem: undefined,
          editItemField: undefined,
        });
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

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions(
        treeToFlat(
          mapTree(data, SUB_ITEMS_FIELD, (item) =>
            extendDataItem(item, SUB_ITEMS_FIELD, {
              [EXPANDED_FIELD]: true,
              [EDIT_FIELD]:
                item[ALL_MENU_DATA_ITEM_KEY] == editItemId
                  ? editItemField
                  : undefined,
              [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
            })
          ),
          EXPANDED_FIELD,
          SUB_ITEMS_FIELD
        ),
        allMenuColumns
      );
      optionsGridOne.sheets[0].title = "모든 메뉴";
      _export.save(optionsGridOne);
    }
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData != null) {
      setMainDataResult({
        data: [],
        expanded: [],
        editItem: undefined,
        editItemField: undefined,
      });
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const search = () => {
    try {
      if (
        filters.culture_name == "" ||
        filters.culture_name == undefined ||
        filters.culture_name == null
      ) {
        throw findMessage(messagesData, "SY_A0430W_001");
      } else {
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const onAllMenuExpandChange = (event: TreeListExpandChangeEvent) => {
    setMainDataResult({
      ...mainDataResult,
      expanded: event.value
        ? mainDataResult.expanded.filter(
            (id: any) => id !== event.dataItem[ALL_MENU_DATA_ITEM_KEY]
          )
        : [...mainDataResult.expanded, event.dataItem[ALL_MENU_DATA_ITEM_KEY]],
    });
  };
  const { data, changes, expanded, editItem, editItemField } = mainDataResult;
  const editItemId = editItem ? editItem[ALL_MENU_DATA_ITEM_KEY] : null;

  const onSelectionChange = useCallback(
    (event: any) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: ALL_MENU_DATA_ITEM_KEY,
      });
      setSelectedState(newSelectedState);
    },
    [selectedState]
  );
  let renderers;

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "custom_caption") {
      setMainDataResult({
        ...mainDataResult,
        editItem: { ...dataItem },
        editItemField: field,
      });
    }
  };

  const exitEdit = () => {
    const dataItem: any = treeToFlat(
      mapTree(data, SUB_ITEMS_FIELD, (item) =>
        extendDataItem(item, SUB_ITEMS_FIELD, {
          [EXPANDED_FIELD]: true,
          [EDIT_FIELD]:
            item[ALL_MENU_DATA_ITEM_KEY] == editItemId
              ? editItemField
              : undefined,
          [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
        })
      ),
      EXPANDED_FIELD,
      SUB_ITEMS_FIELD
    );

    const newData = dataItem.map(
      (item: { [x: string]: string; rowstatus: string }) =>
        item[ALL_MENU_DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
            }
          : {
              ...item,
            }
    );

    const dataTrees: any = createDataTree(
      newData,
      (i: any) => i.menu_id,
      (i: any) => i.parent_menu_id,
      SUB_ITEMS_FIELD
    );

    setMainDataResult({
      ...mainDataResult,
      editItem: undefined,
      editItemField: undefined,
    });
  };

  renderers = new Renderers(enterEdit, exitEdit, EDIT_FIELD);

  const itemChange = (event: TreeListItemChangeEvent) => {
    const field: any = event.field;

    setMainDataResult({
      ...mainDataResult,
      changes: true,
      data: mapTree(mainDataResult.data, SUB_ITEMS_FIELD, (item) =>
        event.dataItem[ALL_MENU_DATA_ITEM_KEY] == item[ALL_MENU_DATA_ITEM_KEY]
          ? extendDataItem(item, SUB_ITEMS_FIELD, {
              [field]: event.value,
              rowstatus: event.dataItem == "N" ? "N" : "U",
            })
          : item
      ),
    });
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;

    const datas: any = treeToFlat(
      mapTree(mainDataResult.data, SUB_ITEMS_FIELD, (item) =>
        extendDataItem(item, SUB_ITEMS_FIELD, {
          [EXPANDED_FIELD]: true,
          [EDIT_FIELD]:
            item[ALL_MENU_DATA_ITEM_KEY] == editItemId
              ? editItemField
              : undefined,
          [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
        })
      ),
      EXPANDED_FIELD,
      SUB_ITEMS_FIELD
    );
    const dataItem = datas.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0) return false;
    let dataArr: any = {
      menu_id_s: [],
      custom_caption_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const { menu_id, custom_caption } = item;

      dataArr.menu_id_s.push(menu_id);
      dataArr.custom_caption_s.push(custom_caption);
    });
    setLoading(true);
    const paraSaved: Iparameters = {
      procedureName: "P_SY_A0430W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "save",
        "@p_id": userId,
        "@p_pc": pc,
        "@p_culture_name": filters.culture_name,
        "@p_menu_id": dataArr.menu_id_s.join("|"),
        "@p_caption": dataArr.custom_caption_s.join("|"),
      },
    };
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

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
              <th>사용자명</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="culture_name"
                    value={filters.culture_name}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>메뉴명</th>
              <td>
                <Input
                  name="menu_name"
                  type="text"
                  value={filters.menu_name}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>모든 메뉴</GridTitle>
          <ButtonContainer>
            <Button
              onClick={onSaveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
              title="저장"
              disabled={permissions.save ? false : true}
            ></Button>
          </ButtonContainer>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName={getMenuName()}
        >
          <TreeList
            style={{
              height: isMobile ? mobileheight : webheight,
              overflow: "auto",
            }}
            data={mapTree(data, SUB_ITEMS_FIELD, (item) =>
              extendDataItem(item, SUB_ITEMS_FIELD, {
                [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
                [EXPANDED_FIELD]: expanded.includes(
                  item[ALL_MENU_DATA_ITEM_KEY]
                ),
                [EDIT_FIELD]:
                  item[ALL_MENU_DATA_ITEM_KEY] == editItemId
                    ? editItemField
                    : undefined,
              })
            )}
            editField={EDIT_FIELD}
            cellRender={renderers.cellRender}
            rowRender={renderers.rowRender}
            onItemChange={itemChange}
            expandField={EXPANDED_FIELD}
            subItemsField={SUB_ITEMS_FIELD}
            onExpandChange={onAllMenuExpandChange}
            dataItemKey={ALL_MENU_DATA_ITEM_KEY}
            // 선택
            selectable={{
              enabled: true,
              drag: false,
              cell: false,
              mode: "single",
            }}
            selectedField={SELECTED_FIELD}
            onSelectionChange={onSelectionChange}
            columns={allMenuColumns.map((column) => ({
              ...column,
              editCell:
                editItemField == column.field ? column.editCell : undefined,
            }))}
          />
        </ExcelExport>
      </GridContainer>
    </>
  );
};

export default SY_A0150;
