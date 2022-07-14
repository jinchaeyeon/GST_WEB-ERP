import { useEffect, useState } from "react";
import * as React from "react";
import {
  Window,
  WindowMoveEvent,
  WindowProps,
} from "@progress/kendo-react-dialogs";
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
  GridContainerWrap,
  GridTitleContainer,
  InfoItem,
  InfoLabel,
  InfoList,
  InfoValue,
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
  validator,
  FormDropDownList,
  FormDatePicker,
  FormReadOnly,
  CellDropDownList,
  CellCheckBoxReadOnly,
  ReadOnlyNumberCell,
} from "./editors";
import { Iparameters } from "../../store/types";
import {
  checkIsDDLValid,
  chkScrollHandler,
  convertDateToStr,
  dateformat,
  getItemQuery,
  UseCommonQuery,
} from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";

import AttachmentsWindow from "./AttachmentsWindow";
import CustomersWindow from "./CustomersWindow";
import ItemsWindow from "./ItemsWindow";
import {
  IAttachmentData,
  ICustData,
  IItemData,
  IWindowPosition,
  TCommonCodeData,
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

import { CellRender, RowRender } from "./renderers";
import UserEffect from "../UserEffect";

// Validate the entire Form
const arrayLengthValidator = (value: any) =>
  value && value.length ? "" : "최소 1개 행을 입력해주세요";

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
}>({} as any);

const deletedRows: object[] = [];

const FORM_DATA_INDEX = "formDataIndex";
const DATA_ITEM_KEY = "idx";

const idGetter = getter(FORM_DATA_INDEX);
const SELECTED_FIELD: string = "selected";

type TKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  workType: string;
  ordkey?: string;
  itemcd?: string;
  isCopy: boolean;
  para?: Iparameters; //{};
};

type TDetailData = {
  rowstatus_s: string[];
  chk_s: string[];
  ordseq_s: string[];
  poregseq_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  itemacnt_s: string[];
  insiz_s: string[];
  bnatur_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  totwgt_s: string[];
  wgtunit_s: string[];
  len_s: string[];
  totlen_s: string[];
  lenunit_s: string[];
  thickness_s: string[];
  width_s: string[];
  length_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  taxamt_s: string[];
  dlramt_s: string[];
  wonamt_s: string[];
  remark_s: string[];
  pac_s: string[];
  finyn_s: string[];
  specialunp_s: string[];
  lotnum_s: string[];
  dlvdt_s: string[];
  specialamt_s: string[];
  heatno_s: string[];
  bf_qty_s: string[];
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

  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
    (e: any) => {
      e.preventDefault();

      fieldArrayRenderProps.onPush({
        value: {
          rowstatus: "N",
          procseq: 0,
          //outprocyn:  commonCodeDefaultValue,
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
      console.log("item?!");
      console.log(item);
      return { ...item, [FORM_DATA_INDEX]: index };
    }
  );

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  //스크롤 핸들러
  const scrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, pageSize))
      setDetailPgNum((prev) => prev + 1);
  };

  //드롭다운리스트 데이터 조회 (품목계정)
  const [itemacntListData, setItemacntListData] = React.useState([
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

  const onItemWndClick = () => {
    setEditedRowIdx(-1);
    setItemWindowVisible(true);
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

      const rows = data.result.data.Rows;

      if (rows.length > 0) {
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

  return (
    <GridContainer maxWidth="calc(50% - 7.5px)">
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
        }}
      >
        {visited && validationMessage && <Error>{validationMessage}</Error>}
        <GridTitleContainer>공정</GridTitleContainer>
        <Grid
          data={dataWithIndexes.map((item: any) => ({
            ...item,
            [SELECTED_FIELD]: selectedState[idGetter(item)],
          }))}
          total={dataWithIndexes.total}
          dataItemKey={dataItemKey}
          style={{ height: "300px" }}
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
            ></Button>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onRemove}
              icon="minus"
            ></Button>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onItemWndClick}
            >
              패턴공정도
            </Button>
          </GridToolbar>

          {/* <GridColumn cell={CommandCell} width="130px" /> */}
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

          <GridColumn
            field="proccd"
            title="공정"
            width="100px"
            cell={NameCell}
            //cell={CellDropDownList}
            headerCell={RequiredHeader}
            className="required"
          />
          {/* <GridColumn
            field="procseq"
            title="공정순서"
            width="100px"
            cell={NumberCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="outprocyn"
            title="외주구분"
            width="100px"
            cell={NameCell}
            // cell={CellDropDownList}
          />
          <GridColumn
            field="prodemp"
            title="작업자"
            width="100px"
            cell={NameCell}
            // cell={CellDropDownList}
          />
          <GridColumn
            field="prodmac"
            title="설비"
            width="100px"
            cell={NameCell}
            //cell={CellDropDownList}
          /> */}
        </Grid>

        {itemWindowVisible && (
          <ItemsWindow
            workType={"ROW"} //인라인 : ROW, FORM : FILTER ..?
            getVisible={setItemWindowVisible}
            getData={setItemData}
            rowIdx={editedRowIdx}
            rowData={editedRowData}
            para={undefined}
          />
        )}
      </FormGridEditContext.Provider>
    </GridContainer>
  );
};

const FormGridMtr = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { validationMessage, visited, name, dataItemKey, value } =
    fieldArrayRenderProps;
  const [editIndex, setEditIndex] = React.useState<number | undefined>();
  const editItemCloneRef = React.useRef();

  const [detailPgNum, setDetailPgNum] = useState(1);

  const [editedRowIdx, setEditedRowIdx] = useState(-1);
  const [editedRowData, setEditedRowData] = useState({});

  const ItemBtnCell = (props: GridCellProps) => {
    const { editIndex } = React.useContext(FormGridEditContext);
    //const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;

    const onRowItemWndClick = () => {
      //if (editIndex !== undefined)
      setEditedRowIdx(editIndex!);
      setEditedRowData(props.dataItem);
      setItemWindowVisible(true);
    };

    return (
      <td className="k-command-cell required">
        <Button
          type={"button"}
          className="k-grid-save-command"
          //fillMode="flat"
          onClick={onRowItemWndClick}
          icon="more-horizontal"
          //disabled={isInEdit ? false : true}
        />
      </td>
    );
  };
  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
    (e: any) => {
      e.preventDefault();
      fieldArrayRenderProps.onPush({
        value: {
          rowstatus: "N",
          procseq: 0,
          //outprocyn:  commonCodeDefaultValue,
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
      console.log("item??");
      console.log(item);
      return { ...item, [FORM_DATA_INDEX]: index };
    }
  );

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  //스크롤 핸들러
  const scrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, pageSize))
      setDetailPgNum((prev) => prev + 1);
  };

  //드롭다운리스트 데이터 조회 (품목계정)
  const [itemacntListData, setItemacntListData] = React.useState([
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

  const onItemWndClick = () => {
    setEditedRowIdx(-1);
    setItemWindowVisible(true);
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

      const rows = data.result.data.Rows;

      if (rows.length > 0) {
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

  return (
    <GridContainer maxWidth="calc(50% - 7.5px)">
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
        }}
      >
        {visited && validationMessage && <Error>{validationMessage}</Error>}
        <GridTitleContainer>자재</GridTitleContainer>
        <Grid
          data={dataWithIndexes.map((item: any) => ({
            ...item,
            [SELECTED_FIELD]: selectedState[idGetter(item)],
          }))}
          total={dataWithIndexes.total}
          dataItemKey={dataItemKey}
          style={{ height: "300px" }}
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
            ></Button>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onRemove}
              icon="minus"
            ></Button>
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
          <GridColumn
            field="proccd"
            title="공정"
            width="100px"
            cell={NameCell}
            //            cell={CellDropDownList}
          />
          <GridColumn
            field="chlditemcd"
            title="소요자재코드"
            width="160px"
            cell={NameCell}
          />
          <GridColumn cell={ItemBtnCell} width="55px" />
          <GridColumn
            field="chlditemnm"
            title="소요자재명"
            width="180px"
            cell={NameCell}
          />
          <GridColumn
            field="outgb"
            title="자재사용구분"
            width="100px"
            cell={NumberCell}
            //cell={CellDropDownList}
          />
          <GridColumn
            field="unitqty"
            title="소요량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="procqty"
            title="재공생산량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="qtyunit"
            title="수량단위"
            width="100px"
            cell={NumberCell}
            //cell={CellDropDownList}
          />
        </Grid>

        {itemWindowVisible && (
          <ItemsWindow
            workType={"ROW"} //인라인 : ROW, FORM : FILTER ..?
            getVisible={setItemWindowVisible}
            getData={setItemData}
            rowIdx={editedRowIdx}
            rowData={editedRowData}
            para={undefined}
          />
        )}
      </FormGridEditContext.Provider>
    </GridContainer>
  );
};

const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  ordkey,
  itemcd,
  isCopy,
  para,
}: TKendoWindow) => {
  //드롭다운 리스트 데이터 조회 (품목계정,수량단위)
  const [locationListData, setLocationListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [doexdivListData, setDoexdivListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [ordstsListData, setOrdstsListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [ordtypeListData, setOrdtypeListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [departmentsListData, setDepartmentsListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [usersListData, setUsersListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [taxdivListData, setTaxdivListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [amtunitListData, setAmtunitListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [itemacntListData, setItemacntListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [qtyunitListData, setQtyunitListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(locationQuery, setLocationListData);
  UseCommonQuery(doexdivQuery, setDoexdivListData);
  UseCommonQuery(ordstsQuery, setOrdstsListData);
  UseCommonQuery(ordtypeQuery, setOrdtypeListData);
  UseCommonQuery(departmentsQuery, setDepartmentsListData);
  UseCommonQuery(usersQuery, setUsersListData);
  UseCommonQuery(taxdivQuery, setTaxdivListData);
  UseCommonQuery(amtunitQuery, setAmtunitListData);
  UseCommonQuery(itemacntQuery, setItemacntListData);
  UseCommonQuery(qtyunitQuery, setQtyunitListData);

  //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetAllGrid();
    resetForm();
  }, [qtyunitListData]);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
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
    getVisible(false);
  };

  const DETAIL_DATA_ITEM_KEY = "idx";
  const SELECTED_FIELD = "selected";
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
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
    //sort: [{ field: "customerID", dir: "asc" }],
    group: [{ field: "itemacnt" }],
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
    ordnum: "",
    ordseq: 0,
    frdt: new Date(),
    planqty: 0,
    person: "",
  });

  //수주정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_WEB_PR_A1100_Q",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_dtgb": "",
      "@p_frdt": "19990101",
      "@p_todt": "20991231",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_itemcd": itemcd,
      "@p_itemnm": "",
      "@p_insiz": "",
      "@p_poregnum": "",
      "@p_ordnum": "",
      "@p_ordseq": "",
      "@p_ordkey": ordkey,
      "@p_plankey": "",
      "@p_ordyn ": "%",
      "@p_planyn": "%",
      "@p_ordsts": "",
      "@p_remark": "",
      "@p_lotno": "",
      "@p_service_id": "",
      "@p_dptcd": "",
      "@p_person": "",
    },
  };

  const parametersBom: Iparameters = {
    procedureName: "P_WEB_PR_A1100_Q",
    pageNumber: 1,
    pageSize: 100,
    parameters: {
      "@p_work_type": "BOM",
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_dtgb": "",
      "@p_frdt": "19990101",
      "@p_todt": "20991231",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_itemcd": itemcd,
      "@p_itemnm": "",
      "@p_insiz": "",
      "@p_poregnum": "",
      "@p_ordnum": ordkey!.split("-", 2)[0],
      "@p_ordseq": ordkey!.split("-", 2)[1],
      "@p_ordkey": ordkey,
      "@p_plankey": "",
      "@p_ordyn ": "%",
      "@p_planyn": "%",
      "@p_ordsts": "",
      "@p_remark": "",
      "@p_lotno": "",
      "@p_service_id": "",
      "@p_dptcd": "",
      "@p_person": "",
    },
  };

  const [infoVal, setInfoVal] = useState({
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    insiz: "",
    bnatur: "",
    qty: 0,
    planqty: 0,
  });
  //수주정보 조회
  const fetchMain = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.result.isSuccess === true) {
      const rows = data.result.data.Rows[0];

      setInfoVal((prev) => {
        return {
          ...prev,
          itemcd: rows.itemcd,
          itemnm: rows.itemnm,
          itemacnt: rows.itemacnt,
          insiz: rows.insiz,
          bnatur: rows.bnatur,
          qty: rows.qty,
          planqty: rows.planqty,
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
    console.log("detailDataResult!");
    console.log(detailDataResult);
  }, [detailDataResult]);

  //itemacnt, qtyunit list가 조회된 후 상세그리드 조회
  useEffect(() => {
    if (workType === "U" || isCopy === true) {
      if (itemacntListData.length > 0 && qtyunitListData.length > 0) {
        resetAllGrid();
        fetchGrid();
      }
    }
  }, [itemacntListData, qtyunitListData]);

  //상세그리드 조회
  const fetchGrid = async () => {
    let data: any;

    console.log("parametersBom");
    console.log(parametersBom);
    try {
      data = await processApi<any>("procedure", parametersBom);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      let rows = data.result.data.Rows;

      rows = rows.map((row: any, idx: number) => {
        return {
          ...row,
          qtyunit: {
            sub_code: row.qtyunit,
            code_name: qtyunitListData.find(
              (item: any) => item.sub_code === row.qtyunit
            )?.code_name,
          },
          idx,
        };
      });

      console.log("rows!!");
      console.log(rows);
      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowsCnt,
        };
      });

      //resetForm();
    }
  };
  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    orgdiv: "",
    location: "",
    planqty: "",
    rowstatus_s: "",
    ordnum_s: "",
    ordseq_s: "",
    orddt_s: "",
    dlvdt_s: "",
    ordsts_s: "",
    project_s: "",
    poregnum_s: "",
    amtunit_s: "",
    baseamt_s: "",
    wonchgrat_s: "",
    uschgrat_s: "",
    attdatnum_s: "",
    remark_s: "",
    custcd_s: "",
    custnm_s: "",
    dptcd_s: "",
    person_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    insiz_s: "",
    qty_s: "",
    bf_qty_s: "",
    unp_s: "",
    wonamt_s: "",
    taxamt_s: "",
    amt_s: "",
    dlramt_s: "",
    bnatur_s: "",
    planno_s: "",
    planseq_s: "",
    seq_s: "",
    unitqty_s: "",
    qtyunit_s: "",
    outgb_s: "",
    procqty_s: "",
    chlditemcd_s: "",
    qtyunit_s2: "",
    proccd_s2: "",
    plandt_s: "",
    finexpdt_s: "",
    prodmac_s: "",
    prodemp_s: "",
    proccd_s: "",
    procseq_s: "",
    outprocyn_s: "",
    lotnum_s: "",
    ordyn_s: "",
    userid: "",
    pc: "",
    purtype: "",
    urgencyyn: "",
    service_id: "",
    form_id: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_WEB_SA_A2000_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_planqty": paraData.planqty,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_ordnum_s": paraData.ordnum_s,
      "@p_ordseq_s": paraData.ordseq_s,
      "@p_orddt_s": paraData.orddt_s,
      "@p_dlvdt_s": paraData.dlvdt_s,
      "@p_ordsts_s": paraData.ordsts_s,
      "@p_project_s": paraData.project_s,
      "@p_poregnum_s": paraData.poregnum_s,
      "@p_amtunit_s": paraData.amtunit_s,
      "@p_baseamt_s": paraData.baseamt_s,
      "@p_wonchgrat_s": paraData.wonchgrat_s,
      "@p_uschgrat_s": paraData.uschgrat_s,
      "@p_attdatnum_s": paraData.attdatnum_s,
      "@p_remark_s": paraData.remark_s,
      "@p_custcd_s": paraData.custcd_s,
      "@p_custnm_s": paraData.custnm_s,
      "@p_dptcd_s": paraData.dptcd_s,
      "@p_person_s": paraData.person_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_itemnm_s": paraData.itemnm_s,
      "@p_itemacnt_s": paraData.itemacnt_s,
      "@p_insiz_s": paraData.insiz_s,
      "@p_qty_s": paraData.qty_s,
      "@p_bf_qty_s": paraData.bf_qty_s,
      "@p_unp_s": paraData.unp_s,
      "@p_wonamt_s": paraData.wonamt_s,
      "@p_taxamt_s": paraData.taxamt_s,
      "@p_amt_s": paraData.amt_s,
      "@p_dlramt_s": paraData.dlramt_s,
      "@p_bnatur_s": paraData.bnatur_s,
      "@p_planno_s": paraData.planno_s,
      "@p_planseq_s": paraData.planseq_s,
      "@p_seq_s": paraData.seq_s,
      "@p_unitqty_s": paraData.unitqty_s,
      "@p_qtyunit_s": paraData.qtyunit_s,
      "@p_outgb_s": paraData.outgb_s,
      "@p_procqty_s": paraData.procqty_s,
      "@p_chlditemcd_s": paraData.chlditemcd_s,
      "@p_qtyunit_s2": paraData.qtyunit_s2,
      "@p_proccd_s2": paraData.proccd_s2,
      "@p_plandt_s": paraData.plandt_s,
      "@p_finexpdt_s": paraData.finexpdt_s,
      "@p_prodmac_s": paraData.prodmac_s,
      "@p_prodemp_s": paraData.prodemp_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_procseq_s": paraData.procseq_s,
      "@p_outprocyn_s": paraData.outprocyn_s,
      "@p_lotnum_s": paraData.lotnum_s,
      "@p_ordyn_s": paraData.ordyn_s,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_purtype": paraData.purtype,
      "@p_urgencyyn": paraData.urgencyyn,
      "@p_service_id": paraData.service_id,
      "@p_form_id": paraData.form_id,
    },
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], dataState));
    setDetailDataResult(process([], dataState));
  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.result.isSuccess === true) {
      alert("저장이 완료되었습니다.");
      if (workType === "U") {
        resetAllGrid();

        reloadData("U");
        fetchMain();
        fetchGrid();
      } else {
        getVisible(false);
        reloadData("N");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(
        "[" +
          data.result.statusCode +
          "] 처리 중 오류가 발생하였습니다. " +
          data.result.resultMessage
      );
    }

    paraData.work_type = ""; //초기화
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    //alert(JSON.stringify(dataItem));

    let valid = true;

    //검증
    try {
      dataItem.processList.forEach((item: any) => {
        if (!item.itemcd) {
          throw "품목코드를 입력하세요.";
        }
        if (!item.itemnm) {
          throw "품목명을 입력하세요.";
        }
        if (!checkIsDDLValid(item.itemacnt)) {
          throw "품목계정을 선택하세요.";
        }
        if (item.qty < 1) {
          throw "수주량을 1 이상 입력하세요.";
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const {
      location,
      ordnum,
      poregnum,
      project,
      ordtype,
      ordsts,
      taxdiv,
      orddt,
      dlvdt,
      dptcd,
      person,
      amtunit,
      portnm,
      finaldes,
      paymeth,
      prcterms,
      custcd,
      custnm,
      rcvcustcd,
      rcvcustnm,
      wonchgrat,
      uschgrat,
      doexdiv,
      remark,
      attdatnum,
      ship_method,
      dlv_method,
      hullno,
      processList,
      materialList,
    } = dataItem;

    let detailArr: TDetailData = {
      rowstatus_s: [],
      chk_s: [],
      ordseq_s: [],
      poregseq_s: [],
      itemcd_s: [],
      itemnm_s: [],
      itemacnt_s: [],
      insiz_s: [],
      bnatur_s: [],
      qty_s: [],
      qtyunit_s: [],
      totwgt_s: [],
      wgtunit_s: [],
      len_s: [],
      totlen_s: [],
      lenunit_s: [],
      thickness_s: [],
      width_s: [],
      length_s: [],
      unpcalmeth_s: [],
      unp_s: [],
      amt_s: [],
      taxamt_s: [],
      dlramt_s: [],
      wonamt_s: [],
      remark_s: [],
      pac_s: [],
      finyn_s: [],
      specialunp_s: [],
      lotnum_s: [],
      dlvdt_s: [],
      specialamt_s: [],
      heatno_s: [],
      bf_qty_s: [],
    };
    processList.forEach((item: any) => {
      const {
        rowstatus,
        chk,
        ordseq,
        poregseq,
        itemcd,
        itemnm,
        itemacnt,
        insiz,
        bnatur,
        qty,
        qtyunit,
        totwgt,
        wgtunit,
        len,
        totlen,
        lenunit,
        thickness,
        width,
        length,
        unpcalmeth,
        unp,
        amt,
        taxamt,
        dlramt,
        wonamt,
        remark,
        pac,
        finyn,
        specialunp,
        lotnum,
        dlvdt,
        specialamt,
        heatno,
        bf_qty,
      } = item;

      detailArr.rowstatus_s.push(isCopy === true ? "N" : rowstatus);
      detailArr.chk_s.push(chk);
      detailArr.ordseq_s.push(ordseq);
      detailArr.poregseq_s.push(poregseq);
      detailArr.itemcd_s.push(itemcd);
      detailArr.itemnm_s.push(itemnm);
      detailArr.itemacnt_s.push(
        typeof itemacnt === "object" ? itemacnt.sub_code : ""
      );
      detailArr.insiz_s.push(insiz);
      detailArr.bnatur_s.push(bnatur);
      detailArr.qty_s.push(qty);
      detailArr.qtyunit_s.push(
        typeof qtyunit === "object" ? qtyunit.sub_code : ""
      );
      detailArr.totwgt_s.push(totwgt);
      detailArr.wgtunit_s.push(wgtunit);
      detailArr.len_s.push(len);
      detailArr.totlen_s.push(totlen);
      detailArr.lenunit_s.push(lenunit);
      detailArr.thickness_s.push(thickness);
      detailArr.width_s.push(width);
      detailArr.length_s.push(length);
      detailArr.unpcalmeth_s.push(unpcalmeth);
      detailArr.unp_s.push(unp);
      detailArr.amt_s.push(amt);
      detailArr.taxamt_s.push(taxamt);
      detailArr.dlramt_s.push(dlramt);
      detailArr.wonamt_s.push(wonamt);
      detailArr.remark_s.push(remark);
      detailArr.pac_s.push(pac);
      detailArr.finyn_s.push(finyn === true ? "Y" : "N");
      detailArr.specialunp_s.push(specialunp);
      detailArr.lotnum_s.push(lotnum);
      detailArr.dlvdt_s.push(dlvdt);
      detailArr.specialamt_s.push(specialamt);
      detailArr.heatno_s.push(heatno);
      detailArr.bf_qty_s.push(bf_qty);
    });

    deletedRows.forEach((item: any) => {
      const {
        rowstatus,
        chk,
        ordseq,
        poregseq,
        itemcd,
        itemnm,
        itemacnt,
        insiz,
        bnatur,
        qty,
        qtyunit,
        totwgt,
        wgtunit,
        len,
        totlen,
        lenunit,
        thickness,
        width,
        length,
        unpcalmeth,
        unp,
        amt,
        taxamt,
        dlramt,
        wonamt,
        remark,
        pac,
        finyn,
        specialunp,
        lotnum,
        dlvdt,
        specialamt,
        heatno,
        bf_qty,
      } = item;

      detailArr.rowstatus_s.push("D");
      detailArr.chk_s.push(chk);
      detailArr.ordseq_s.push(ordseq);
      detailArr.poregseq_s.push(poregseq);
      detailArr.itemcd_s.push(itemcd);
      detailArr.itemnm_s.push(itemnm);
      detailArr.itemacnt_s.push(
        typeof itemacnt === "object" ? itemacnt.sub_code : ""
      );
      detailArr.insiz_s.push(insiz);
      detailArr.bnatur_s.push(bnatur);
      detailArr.qty_s.push(qty);
      detailArr.qtyunit_s.push(
        typeof qtyunit === "object" ? qtyunit.sub_code : ""
      );
      detailArr.totwgt_s.push(totwgt);
      detailArr.wgtunit_s.push(wgtunit);
      detailArr.len_s.push(len);
      detailArr.totlen_s.push(totlen);
      detailArr.lenunit_s.push(lenunit);
      detailArr.thickness_s.push(thickness);
      detailArr.width_s.push(width);
      detailArr.length_s.push(length);
      detailArr.unpcalmeth_s.push(unpcalmeth);
      detailArr.unp_s.push(unp);
      detailArr.amt_s.push(amt);
      detailArr.taxamt_s.push(taxamt);
      detailArr.dlramt_s.push(dlramt);
      detailArr.wonamt_s.push(wonamt);
      detailArr.remark_s.push(remark);
      detailArr.pac_s.push(pac);
      detailArr.finyn_s.push(finyn);
      detailArr.specialunp_s.push(specialunp);
      detailArr.lotnum_s.push(lotnum);
      detailArr.dlvdt_s.push(dlvdt);
      detailArr.specialamt_s.push(specialamt);
      detailArr.heatno_s.push(heatno);
      detailArr.bf_qty_s.push(bf_qty);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      location: location.sub_code,
      ordnum,
      poregnum,
      project,
      ordtype: ordtype.sub_code,
      ordsts: ordsts.sub_code,
      taxdiv: taxdiv.sub_code,
      orddt: convertDateToStr(orddt),
      dlvdt: convertDateToStr(dlvdt),
      dptcd: dptcd.sub_code,
      person: person.sub_code,
      amtunit: amtunit.sub_code,
      portnm,
      finaldes: "",
      paymeth,
      prcterms,
      custcd,
      custnm,
      rcvcustcd,
      rcvcustnm,
      wonchgrat,
      uschgrat,
      doexdiv: doexdiv.sub_code,
      remark,
      attdatnum,
      ship_method,
      dlv_method,
      hullno: "",
      rowstatus_s: detailArr.rowstatus_s.join("|"), //"N|N",
      chk_s: detailArr.chk_s.join("|"),
      ordseq_s: detailArr.ordseq_s.join("|"),
      poregseq_s: detailArr.poregseq_s.join("|"),
      itemcd_s: detailArr.itemcd_s.join("|"),
      itemnm_s: detailArr.itemnm_s.join("|"),
      itemacnt_s: detailArr.itemacnt_s.join("|"),
      insiz_s: detailArr.insiz_s.join("|"),
      bnatur_s: detailArr.bnatur_s.join("|"),
      qty_s: detailArr.qty_s.join("|"),
      qtyunit_s: detailArr.qtyunit_s.join("|"),
      totwgt_s: detailArr.totwgt_s.join("|"),
      wgtunit_s: detailArr.wgtunit_s.join("|"),
      len_s: detailArr.len_s.join("|"),
      totlen_s: detailArr.totlen_s.join("|"),
      lenunit_s: detailArr.lenunit_s.join("|"),
      thickness_s: detailArr.thickness_s.join("|"),
      width_s: detailArr.width_s.join("|"),
      length_s: detailArr.length_s.join("|"),
      unpcalmeth_s: detailArr.unpcalmeth_s.join("|"),
      unp_s: detailArr.unp_s.join("|"),
      amt_s: detailArr.amt_s.join("|"),
      taxamt_s: detailArr.taxamt_s.join("|"),
      dlramt_s: detailArr.dlramt_s.join("|"),
      wonamt_s: detailArr.wonamt_s.join("|"),
      remark_s: detailArr.remark_s.join("|"),
      pac_s: detailArr.pac_s.join("|"),
      finyn_s: detailArr.finyn_s.join("|"),
      specialunp_s: detailArr.specialunp_s.join("|"),
      lotnum_s: detailArr.lotnum_s.join("|"),
      dlvdt_s: detailArr.dlvdt_s.join("|"),
      specialamt_s: detailArr.specialamt_s.join("|"),
      heatno_s: detailArr.heatno_s.join("|"),
      bf_qty_s: detailArr.bf_qty_s.join("|"),
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
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
  return (
    <Window
      title={workType === "N" ? "계획처리" : "계획처리"}
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
          ordnum: initialVal.ordnum,
          frdt: initialVal.frdt, //new Date(),
          person: {
            sub_code: initialVal.person,
            code_name: usersListData.find(
              (item: any) => item.sub_code === initialVal.person
            )?.code_name,
          },

          planqty: initialVal.planqty, //new Date(),
          processList: detailDataResult.data,
          materialList: [], //detailDataResult.data,
        }}
        render={(formRenderProps: FormRenderProps) => (
          <FormElement horizontal={true}>
            <InfoList>
              <InfoItem>
                <InfoLabel>품목코드</InfoLabel>
                <InfoValue>{infoVal.itemcd}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>품목명</InfoLabel>
                <InfoValue>{infoVal.itemnm}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>품목계정</InfoLabel>
                <InfoValue>{infoVal.itemacnt}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>규격</InfoLabel>
                <InfoValue>{infoVal.insiz}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>재질</InfoLabel>
                <InfoValue>{infoVal.bnatur}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>수주량</InfoLabel>
                <InfoValue>{infoVal.qty}</InfoValue>
              </InfoItem>
              {/* <InfoItem>
                <InfoLabel>기계획량</InfoLabel>
                <InfoValue id=""></InfoValue>
              </InfoItem> */}
              <InfoItem>
                <InfoLabel>잔량</InfoLabel>
                <InfoValue>{infoVal.planqty}</InfoValue>
              </InfoItem>
            </InfoList>

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

              <FieldWrap>
                <Field
                  label={"완료예정일"}
                  name={"frdt"}
                  component={FormDatePicker}
                  className="required"
                />
              </FieldWrap>

              <FieldWrap>
                <Field
                  label={"담당자"}
                  name={"person"}
                  component={FormDropDownList}
                  queryStr={usersQuery}
                  className="required"
                />
              </FieldWrap>

              <FieldWrap>
                <Field
                  label={"수량"}
                  name={"planqty"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                />
              </FieldWrap>
            </fieldset>

            <GridContainerWrap>
              <FieldArray
                name="processList"
                dataItemKey={DATA_ITEM_KEY}
                component={FormGrid}
                validator={arrayLengthValidator}
              />

              <FieldArray
                name="materialList"
                dataItemKey={DATA_ITEM_KEY}
                component={FormGridMtr}
                validator={arrayLengthValidator}
              />
            </GridContainerWrap>
            <BottomContainer>
              <ButtonContainer>
                <Button
                  type={"submit"}
                  themeColor={"primary"}
                  icon="save"
                  //disabled={!formRenderProps.allowSubmit}
                >
                  저장
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </FormElement>
        )}
      />

      {custWindowVisible && (
        <CustomersWindow
          getVisible={setCustWindowVisible}
          workType={custType} //신규 : N, 수정 : U
          getData={getCustData}
          para={undefined}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
