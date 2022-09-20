import { useEffect, useState, useCallback } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridEvent,
  GridFooterCellProps,
  GridCellProps,
  GridToolbar,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridHeaderSelectionChangeEvent,
  GridHeaderCellProps,
} from "@progress/kendo-react-grid";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInField,
  ButtonInFieldWrap,
  FieldWrap,
  GridContainer,
} from "../../CommonStyled";
import {
  Form,
  Field,
  FormElement,
  FieldArray,
  FieldArrayRenderProps,
  FormRenderProps,
} from "@progress/kendo-react-form";
import { Error } from "@progress/kendo-react-labels";
import { clone } from "@progress/kendo-react-common";

import {
  NumberCell,
  NameCell,
  FormInput,
  FormDropDownList,
  FormDatePicker,
  FormReadOnly,
  ReadOnlyNumberCell,
  CellComboBox,
  ReadOnlyNameCell,
  FormComboBox,
  FormCheckBox,
  FormNumericTextBox,
  CellCheckBox,
  EditableNameCellInNew,
} from "../Editors";
import { Iparameters } from "../../store/types";
import {
  validator,
  arrayLengthValidator,
  chkScrollHandler,
  getItemQuery,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCommonQuery,
  UseCustomOption,
} from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";

import AttachmentsWindow from "./CommonWindows/AttachmentsWindow";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import {
  IAttachmentData,
  ICustData,
  IItemData,
  IWindowPosition,
} from "../../hooks/interfaces";
import {
  amtunitQuery,
  commonCodeDefaultValue,
  departmentsQuery,
  doexdivQuery,
  itemacntQuery,
  locationQuery,
  ordstsQuery,
  ordtypeQuery,
  pageSize,
  qtyunitQuery,
  taxdivQuery,
  usersQuery,
} from "../CommonString";

import { CellRender, RowRender } from "../Renderers";
import CheckBoxCell from "../Cells/CheckBoxCell";
import { tokenState } from "../../store/atoms";
import { useRecoilState } from "recoil";
const requiredField = ["col_sub_code", "col_code_name"];
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
const readOnlyField = [
  "col_insert_userid1",
  "col_insert_pc1",
  "col_insert_time1",
  "col_update_userid1",
  "col_update_pc1",
  "col_update_time1",
];

// Create React.Context to pass props to the Form Field components from the main component
export const FormGridEditContext = React.createContext<{
  onRemove: (dataItem: any) => void;
  onEdit: (dataItem: any, isNew: boolean) => void;
  onCopy: (dataItem: any) => void;
  onSave: () => void;
  onCancel: () => void;
  editIndex: number | undefined;
  parentField: string;
  getItemcd: (itemcd: string) => void;
  calculateAmt: () => void;
  calculateSpecialAmt: () => void;
}>({} as any);

let deletedRows: object[] = [];

const FORM_DATA_INDEX = "formDataIndex";
const DATA_ITEM_KEY = "sub_code";

const idGetter = getter(FORM_DATA_INDEX);
const SELECTED_FIELD: string = "selected";

type TKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  setGroupId(groupCode: string): void;
  workType: string;
  user_group_id?: string;
  isCopy?: boolean;
  para?: Iparameters; //{};
};

type TDetail = {
  rowstatus_s: string;
  sub_code: string;
  code_name: string;
  system_yn: string;
  extra_field1: string;
  extra_field2: string;
  extra_field3: string;
  extra_field4: string;
  extra_field5: string;
  extra_field6: string;
  extra_field7: string;
  extra_field8: string;
  extra_field9: string;
  extra_field10: string;
  numref1: number;
  numref2: number;
  numref3: number;
  numref4: number;
  numref5: number;
  sort_seq: number;
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA061,L_BA015", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "itemacnt" ? "L_BA061" : field === "qtyunit" ? "L_BA015" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return <CellComboBox bizComponent={bizComponent} {...props} />;
};

// Create the Grid that will be used inside the Form
const FormGrid = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { validationMessage, visited, name, dataItemKey, value } =
    fieldArrayRenderProps;
  const [editIndex, setEditIndex] = React.useState<number | undefined>();
  const editItemCloneRef = React.useRef();

  const [detailPgNum, setDetailPgNum] = useState(1);

  const [editedRowIdx, setEditedRowIdx] = useState(-1);
  const [editedRowData, setEditedRowData] = useState({});
  const pathname: string = window.location.pathname.replace("/", "");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
    (e: any) => {
      e.preventDefault();
      fieldArrayRenderProps.onPush({
        value: {
          rowstatus: "N",
          sort_seq: 0,
          use_yn: "Y",
          numref1: 0,
          numref2: 0,
          numref3: 0,
          numref4: 0,
          numref5: 0,
        },
      });

      setEditIndex(0);
    },
    [fieldArrayRenderProps]
  );

  const onRemove = React.useCallback(() => {
    let newData: any[] = [];

    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    fieldArrayRenderProps.value.forEach((item: any, index: number) => {
      if (!selectedState[index]) {
        newData.push(item);
      } else {
        deletedRows.push(item);
      }
    });

    //전체 데이터 삭제
    fieldArrayRenderProps.value.forEach(() => {
      fieldArrayRenderProps.onRemove({
        index: 0,
      });
    });

    //newData 생성
    newData.forEach((item: any) => {
      fieldArrayRenderProps.onPush({
        value: item,
      });
    });

    //선택 상태 초기화
    setSelectedState({});

    //수정 상태 초기화
    setEditIndex(undefined);
  }, [fieldArrayRenderProps]);

  // Update an item from the Grid and update the index of the edited item
  const onEdit = React.useCallback((dataItem: any, isNewItem: any) => {
    if (!isNewItem) {
      editItemCloneRef.current = clone(dataItem);
    }

    fieldArrayRenderProps.onReplace({
      index: dataItem[FORM_DATA_INDEX],
      value: {
        ...dataItem,
        rowstatus: dataItem.rowstatus === "N" ? dataItem.rowstatus : "U",
      },
    });

    setEditIndex(dataItem[FORM_DATA_INDEX]);
  }, []);

  const onCopy = React.useCallback(() => {
    let newData: any[] = [];
    let ordseq = 0; //그리드의 키값으로 사용되기 때문에 고유값 지정 필요

    //복사할 데이터 newData에 push
    fieldArrayRenderProps.value.forEach((item: any, index: number) => {
      if (selectedState[index]) {
        newData.push(item);
      }
      if (ordseq < item.ordseq) ordseq = item.ordseq;
    });

    //newData 생성
    newData.forEach((item: any) => {
      ordseq++;

      fieldArrayRenderProps.onPush({
        value: { ...item, rowstatus: "N", ordseq: ordseq },
      });
    });

    //선택 상태 초기화
    setSelectedState({});

    //수정 상태 초기화
    setEditIndex(undefined);
  }, [fieldArrayRenderProps]);

  // Cancel the editing of an item and return its initial value
  const onCancel = React.useCallback(() => {
    if (editItemCloneRef.current) {
      fieldArrayRenderProps.onReplace({
        index: editItemCloneRef.current[FORM_DATA_INDEX],
        value: editItemCloneRef.current,
      });
    }

    editItemCloneRef.current = undefined;
    setEditIndex(undefined);
  }, [fieldArrayRenderProps]);

  // Save the changes
  const onSave = React.useCallback(() => {
    setEditIndex(undefined);
  }, [fieldArrayRenderProps]);

  const dataWithIndexes = fieldArrayRenderProps.value.map(
    (item: any, index: any) => {
      return { ...item, [FORM_DATA_INDEX]: index };
    }
  );

  //스크롤 핸들러
  const scrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, pageSize))
      setDetailPgNum((prev) => prev + 1);
  };

  //드롭다운리스트 데이터 조회 (품목계정)
  const [itemacntListData, setItemacntListData] = useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemacntQuery, setItemacntListData);

  const setItemData = (data: IItemData, rowIdx: number, rowData: any) => {
    if (rowIdx === -1) {
      //신규생성
      fieldArrayRenderProps.onPush({
        value: {
          rowstatus: "N",
          itemcd: data.itemcd,
          itemnm: data.itemnm,
          insiz: data.insiz,
          itemacnt: {
            sub_code: data.itemacnt,
            code_name: itemacntListData.find(
              (item: any) => item.sub_code === data.itemacnt
            )?.code_name,
          },
          qtyunit: commonCodeDefaultValue,
          qty: 0,
          specialunp: 0,
          specialamt: 0,
          unp: 0,
          amt: 0,
          wonamt: 0,
          taxamt: 0,
          totamt: 0,
          outqty: 0,
          sale_qty: 0,
          finyn: "N",
          bf_qty: 0,
          ordseq: 0,
          poregseq: 0,
          totwgt: 0,
          len: 0,
          totlen: 0,
          thickness: 0,
          width: 0,
          length: 0,
          dlramt: 0,
          chk: "N",
        },
      });

      setEditIndex(0);
    } else {
      //기존 행 업데이트
      const dataItem = rowData;
      fieldArrayRenderProps.onReplace({
        index: dataItem[FORM_DATA_INDEX],
        value: {
          ...dataItem,
          rowstatus: dataItem.rowstatus === "N" ? dataItem.rowstatus : "U",
          itemcd: data.itemcd,
          itemnm: data.itemnm,
          insiz: data.insiz,
          itemacnt: {
            sub_code: data.itemacnt,
            code_name: itemacntListData.find(
              (item: any) => item.sub_code === data.itemacnt
            )?.code_name,
          },
          qtyunit: commonCodeDefaultValue,
        },
      });
    }
  };

  const itemChange = (event: GridItemChangeEvent) => {
    // const inEditID = event.dataItem.ProductID;
    // const field = event.field || "";
    // const newData = data.map((item) =>
    //   item.ProductID === inEditID ? { ...item, [field]: event.value } : item
    // );
    // setData(newData);
  };

  const EDIT_FIELD = "inEdit";

  const enterEdit = (dataItem: any, field: string | undefined) => {
    fieldArrayRenderProps.onReplace({
      index: dataItem[FORM_DATA_INDEX],
      value: {
        ...dataItem,
        rowstatus: dataItem.rowstatus === "N" ? dataItem.rowstatus : "U",
        [EDIT_FIELD]: field,
      },
    });

    setEditIndex(dataItem[FORM_DATA_INDEX]);
  };

  const exitEdit = (item: any) => {
    fieldArrayRenderProps.value.forEach((item: any, index: any) => {
      fieldArrayRenderProps.onReplace({
        index: index,
        value: {
          ...item,
          [EDIT_FIELD]: undefined,
        },
      });
    });
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

  const [selectedState, setSelectedState] = React.useState<{
    [id: string]: boolean | number[];
  }>({});

  const onSelectionChange = React.useCallback(
    (event: GridSelectionChangeEvent) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: FORM_DATA_INDEX,
      });

      setSelectedState(newSelectedState);
    },
    [selectedState]
  );

  const onHeaderSelectionChange = React.useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: {
        [id: string]: boolean | number[];
      } = {};

      event.dataItems.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });

      setSelectedState(newSelectedState);

      //선택된 상태로 리랜더링
      event.dataItems.forEach((item: any, index: number) => {
        fieldArrayRenderProps.onReplace({
          index: index,
          value: {
            ...item,
          },
        });
      });
    },
    []
  );

  interface ProductNameHeaderProps extends GridHeaderCellProps {
    children: any;
  }

  const RequiredHeader = (props: ProductNameHeaderProps) => {
    return (
      <span className="k-cell-inner">
        <a className="k-link" onClick={props.onClick}>
          <span style={{ color: "#ff6358" }}>{props.title}</span>
          {props.children}
        </a>
      </span>
    );
  };

  const getItemcd = (itemcd: string) => {
    const index = editIndex ?? 0;
    const dataItem = value[index];
    const queryStr = getItemQuery({ itemcd: itemcd, itemnm: "" });

    fetchData(queryStr, index, dataItem, itemacntListData);
  };
  const processApi = useApi();

  const fetchData = React.useCallback(
    async (
      queryStr: string,
      index: number,
      dataItem: any,
      itemacntListData: any
    ) => {
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
        setRowItem(rows[0], index, dataItem, itemacntListData);
      }
    },
    []
  );

  const setRowItem = (
    row: any,
    index: number,
    dataItem: any,
    itemacntListData: any //useState의 itemacntListData 바로 사용시 다시 조회되어 조회 전 빈값을 참조하는 현상 발생해, 일단 인수로 넘겨줌. 나중에 수정 필요할듯함..
  ) => {
    fieldArrayRenderProps.onReplace({
      index: index,
      value: {
        ...dataItem,
        rowstatus: dataItem.rowstatus === "N" ? dataItem.rowstatus : "U",
        inEdit: undefined,
        itemcd: row.itemcd,
        itemnm: row.itemnm,
        insiz: row.insiz,
        itemacnt: {
          sub_code: row.itemacnt,
          code_name: itemacntListData.find(
            (item: any) => item.sub_code === row.itemacnt
          )?.code_name,
        },
        qtyunit: commonCodeDefaultValue,
      },
    });
  };

  const calculateAmt = () => {
    const index = editIndex ?? 0;
    const dataItem = value[index];

    console.log("dataItem.qty");
    console.log(dataItem.qty);
    console.log(dataItem.unp);

    fieldArrayRenderProps.onReplace({
      index: index,
      value: {
        ...dataItem,
        //inEdit: undefined,
        wonamt: dataItem.qty * dataItem.unp,
        taxamt: (dataItem.qty * dataItem.unp) / 10,
        totamt:
          dataItem.qty * dataItem.unp + (dataItem.qty * dataItem.unp) / 10,
      },
    });
  };
  const calculateSpecialAmt = () => {};

  return (
    <GridContainer margin={{ top: "30px" }}>
      <FormGridEditContext.Provider
        value={{
          onCancel,
          onEdit,
          onCopy,
          onRemove,
          onSave,
          editIndex,
          parentField: name,
          getItemcd,
          calculateAmt,
          calculateSpecialAmt,
        }}
      >
        {visited && validationMessage && <Error>{validationMessage}</Error>}
        <Grid
          data={dataWithIndexes.map((item: any) => ({
            ...item,
            parentField: name,
            [SELECTED_FIELD]: selectedState[idGetter(item)],
          }))}
          total={dataWithIndexes.total}
          dataItemKey={dataItemKey}
          style={{ height: "400px" }}
          cellRender={customCellRender}
          rowRender={customRowRender}
          onItemChange={itemChange}
          onScroll={scrollHandler}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            drag: false,
            cell: false,
            mode: "multiple",
          }}
          onSelectionChange={onSelectionChange}
          onHeaderSelectionChange={onHeaderSelectionChange}
        >
          <GridToolbar>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onAdd}
              icon="add"
            >
              추가
            </Button>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onRemove}
              icon="minus"
            >
              삭제
            </Button>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onCopy}
              icon="copy"
            >
              복사
            </Button>
          </GridToolbar>

          <GridColumn
            field={SELECTED_FIELD}
            width="45px"
            headerSelectionValue={
              dataWithIndexes.findIndex(
                (item: any) => !selectedState[idGetter(item)]
              ) === -1
            }
          />
          <GridColumn field="rowstatus" title=" " width="40px" />

          {customOptionData !== null &&
            customOptionData.menuCustomColumnOptions["gvwDetail"].map(
              (item: any, idx: number) =>
                item.sortOrder !== -1 && (
                  <GridColumn
                    key={idx}
                    field={item.id
                      .replace("col_", "")
                      .replace("use_yn1", "use_yn")}
                    title={item.caption}
                    width={item.width}
                    cell={
                      numberField.includes(item.id)
                        ? NumberCell
                        : checkBoxField.includes(item.id)
                        ? CellCheckBox
                        : readOnlyField.includes(item.id)
                        ? ReadOnlyNameCell
                        : item.id === "col_sub_code"
                        ? EditableNameCellInNew
                        : NameCell
                    }
                    headerCell={
                      requiredField.includes(item.id) ? RequiredHeader : ""
                    }
                    className={
                      requiredField.includes(item.id) ? "required" : ""
                    }
                    // footerCell={
                    //   item.sortOrder === 2 ? detailTotalFooterCell : ""
                    // }
                  ></GridColumn>
                )
            )}
        </Grid>
      </FormGridEditContext.Provider>
    </GridContainer>
  );
};
const KendoWindow = ({
  getVisible,
  reloadData,
  setGroupId,
  workType,
  user_group_id = "",
  isCopy,
  para,
}: TKendoWindow) => {
  const [token] = useRecoilState(tokenState);
  const { userId } = token;

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent("L_BA000", setBizComponentData);

  // 그룹 카테고리 리스트
  const [groupCategoryListData, setGroupCategoryListData] = React.useState([
    commonCodeDefaultValue,
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

  // 그룹 카테고리 조회
  useEffect(() => {
    if (bizComponentData.length > 0) {
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

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 500,
    height: 320,
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
    getVisible(false);
  };

  const [formKey, setFormKey] = React.useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };
  //수정 없이 submit 가능하도록 임의 value를 change 시켜줌
  useEffect(() => {
    const valueChanged = document.getElementById("valueChanged");
    valueChanged!.click();
  }, [formKey]);
  const processApi = useApi();
  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], dataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custType, setCustType] = useState("");

  useEffect(() => {
    if (workType === "U" || isCopy === true) {
      fetchMain();
      //fetchGrid();
    }
  }, []);

  const [initialVal, setInitialVal] = useState({
    user_group_id: "",
    user_group_name: "",
    memo: "",
    use_yn: "Y",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SY_A0011W_Q ",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "LIST",
      "@p_user_group_id": user_group_id,
      "@p_user_group_name": "",
      "@p_lang_id": "",
      "@p_use_yn": "",
    },
  };

  //요약정보 조회
  const fetchMain = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const row = data.tables[0].Rows[0];

      setInitialVal((prev) => {
        return {
          ...prev,
          user_group_id: row.user_group_id,
          user_group_name: row.user_group_name,
          memo: row.memo,
          use_yn: row.use_yn,
        };
      });
    }
  };

  //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [initialVal]);

  //fetch된 그리드 데이터가 그리드 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [detailDataResult]);

  //itemacnt, qtyunit list가 조회된 후 상세그리드 조회
  // useEffect(() => {
  //   if (workType === "U" || isCopy === true) {
  //     if (itemacntListData.length > 0 && qtyunitListData.length > 0) {
  //       resetAllGrid();
  //       fetchGrid();
  //     }
  //   }
  // }, [itemacntListData, qtyunitListData]);

  //상세그리드 조회
  const fetchGrid = async () => {
    let data: any;

    console.log("para");
    console.log(para);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          rowstatus: workType === "N" ? "N" : "",
        };
      });

      console.log("rows");
      console.log(rows);

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowCnt,
        };
      });

      //resetForm();
    }
  };

  const pathname: string = window.location.pathname.replace("/", "");

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    user_group_id: "",
    user_group_name: "",
    memo: "",
    use_yn: "",
    userid: userId,
    pc: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_SY_A0011W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_user_group_id": paraData.user_group_id,
      "@p_user_group_name": paraData.user_group_name,
      "@p_memo": paraData.memo,
      "@p_use_yn": paraData.use_yn,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
    },
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], dataState));
    setDetailDataResult(process([], dataState));
  };

  const fetchMainSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("저장이 완료되었습니다.");
      if (workType === "U") {
        resetAllGrid();

        reloadData("U");
        fetchMain();
        fetchGrid();
      } else {
        getVisible(false);
        setGroupId(paraData.user_group_id);
        reloadData("N");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const fetchGridSaved = async (paraSaved: any) => {
    let data: any;

    console.log("paraSaved");
    console.log(paraSaved);

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    console.log("data");
    console.log(data);

    if (data.isSuccess === true) {
      //
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    //alert(JSON.stringify(dataItem));

    const { user_group_id, user_group_name, memo, use_yn } = dataItem;

    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      user_group_id,
      user_group_name,
      memo: memo,
      use_yn: use_yn === true || use_yn === "Y" ? "Y" : "N",
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchMainSaved();
  }, [paraData]);

  const onCustWndClick = () => {
    setCustType("CUST");
    setCustWindowVisible(true);
  };
  const onRcvcustWndClick = () => {
    setCustType("RCVCUST");
    setCustWindowVisible(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const getCustData = (data: ICustData) => {
    if (custType === "CUST") {
      setInitialVal((prev) => {
        return {
          ...prev,
          custcd: data.custcd,
          custnm: data.custnm,
        };
      });
    } else {
      setInitialVal((prev) => {
        return {
          ...prev,
          rcvcustnm: data.custnm,
          rcvcustcd: data.custcd,
        };
      });
    }
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setInitialVal((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  useEffect(() => {
    if (workType === "U" || isCopy === true) {
      if (bizComponentData.length) {
        resetAllGrid();
        fetchGrid();
      }
    }
  }, [bizComponentData]);

  return (
    <Window
      title={workType === "N" ? "사용자그룹 생성" : "사용자그룹 정보"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <Form
        onSubmit={handleSubmit}
        key={formKey}
        initialValues={{
          rowstatus: "",
          user_group_id: initialVal.user_group_id,
          user_group_name: initialVal.user_group_name,
          memo: initialVal.memo,
          use_yn: initialVal.use_yn,
          orderDetails: detailDataResult.data, //detailDataResult.data,
        }}
        render={(formRenderProps: FormRenderProps) => (
          <FormElement horizontal={true}>
            <fieldset className={"k-form-fieldset"}>
              <button
                id="valueChanged"
                style={{ display: "none" }}
                onClick={(e) => {
                  e.preventDefault(); // Changing desired field value
                  formRenderProps.onChange("valueChanged", {
                    value: "1",
                  });
                }}
              ></button>
              <FieldWrap fieldWidth="100%">
                <Field
                  name={"user_group_id"}
                  label={"사용자그룹ID"}
                  component={workType === "N" ? FormInput : FormReadOnly}
                  validator={validator}
                  className={workType === "N" ? "required" : "readonly"}
                />
              </FieldWrap>
              <FieldWrap fieldWidth="100%">
                <Field
                  name={"user_group_name"}
                  label={"사용자그룹명"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                />
              </FieldWrap>
              <FieldWrap fieldWidth="100%">
                <Field name={"memo"} component={FormInput} label={"메모"} />
              </FieldWrap>
              <FieldWrap fieldWidth="100%">
                <Field
                  name={"use_yn"}
                  label={"사용여부"}
                  component={FormCheckBox}
                />
              </FieldWrap>
            </fieldset>
            {/* <FieldArray
              name="orderDetails"
              dataItemKey={DATA_ITEM_KEY}
              component={FormGrid}
              validator={arrayLengthValidator}
            /> */}

            <BottomContainer>
              <ButtonContainer>
                <Button type={"submit"} themeColor={"primary"} icon="save">
                  저장
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </FormElement>
        )}
      />
    </Window>
  );
};

export default KendoWindow;
