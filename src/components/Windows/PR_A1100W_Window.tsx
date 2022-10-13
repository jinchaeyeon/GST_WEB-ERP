import { useEffect, useState, createContext } from "react";
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
  InfoTitle,
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
  FormNumericTextBox,
  CellComboBox,
} from "../Editors";
import { Iparameters } from "../../store/types";
import {
  validator,
  arrayLengthValidator,
  checkIsDDLValid,
  chkScrollHandler,
  convertDateToStr,
  dateformat,
  getItemQuery,
  UseBizComponent,
  UseCommonQuery,
  UseCustomOption,
  findMessage,
  UseMessages,
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
  TCommonCodeData,
} from "../../hooks/interfaces";
import {
  commonCodeDefaultValue,
  itemacntQuery,
  outgbQuery,
  outprocynQuery,
  pageSize,
  proccdQuery,
  prodmacQuery,
  qtyunitQuery,
  usersQuery,
} from "../CommonString";

import { CellRender, RowRender } from "../Renderers";

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  //공정코드,외주구분,사용자,설비,자재불출(자재사용)구분_BOM,수량단위
  UseBizComponent(
    "L_PR010,L_BA011,L_sysUserMaster_001,L_fxcode,L_BA041,L_BA015",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "proccd"
      ? "L_PR010"
      : field === "outprocyn"
      ? "L_BA011"
      : field === "prodemp"
      ? "L_sysUserMaster_001"
      : field === "prodmac"
      ? "L_fxcode"
      : field === "outgb"
      ? "L_BA041"
      : field === "qtyunit"
      ? "L_BA015"
      : "";

  const fieldName =
    field === "prodemp"
      ? "user_name"
      : field === "prodmac"
      ? "fxfull"
      : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return (
    <CellComboBox
      bizComponent={bizComponent}
      textField={fieldName}
      {...props}
    />
  );
};

// Create React.Context to pass props to the Form Field components from the main component
export const PR_A1100W_WINDOW_PRC_FORM_GRID_EDIT_CONTEXT = React.createContext<{
  onRemove: (dataItem: any) => void;
  onEdit: (dataItem: any, isNew: boolean) => void;
  onCopy: (dataItem: any) => void;
  onSave: () => void;
  onCancel: () => void;
  editIndex: number | undefined;
  parentField: string;
  getItemcd: (itemcd: string) => void;
}>({} as any);

export const PR_A1100W_WINDOW_MTR_FORM_GRID_EDIT_CONTEXT = React.createContext<{
  onRemove: (dataItem: any) => void;
  onEdit: (dataItem: any, isNew: boolean) => void;
  onCopy: (dataItem: any) => void;
  onSave: () => void;
  onCancel: () => void;
  editIndex: number | undefined;
  parentField: string;
  getItemcd: (itemcd: string) => void;
}>({} as any);

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

type TProcessData = {
  proccd: string[];
  planno: string[];
  qtyunit: string[];
  planseq: string[];
  procseq: string[];
  procqty: string[];
  outprocyn: string[];
  prodemp: string[];
  prodmac: string[];
  plandt: string[];
  finexpdt: string[];
};

type TMaterialData = {
  seq: string[];
  unitqty: string[];
  outgb: string[];
  chlditemcd: string[];
  qtyunit: string[];
  proccd: string[];
};

const customOptionContext = createContext({
  customOptionData: null,
});

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

      //공정순서(procseq) 1씩 증가
      const arrLength = fieldArrayRenderProps.value.length;
      const procseq =
        arrLength > 0
          ? fieldArrayRenderProps.value[arrLength - 1].procseq + 1
          : 1;

      fieldArrayRenderProps.onPush({
        value: {
          srcPgName: "PR_A1100W_WINDOW_PRC",
          proccd: commonCodeDefaultValue,
          procseq: procseq,
          outprocyn: commonCodeDefaultValue,
          prodemp: commonCodeDefaultValue,
          prodmac: commonCodeDefaultValue,
        },
      });

      setEditIndex(0);
    },
    [fieldArrayRenderProps]
  );

  const onRemove = React.useCallback(() => {
    let newData: any[] = [];

    //삭제 안 할 데이터 newData에 push
    fieldArrayRenderProps.value.forEach((item: any, index: number) => {
      if (!selectedState[index]) {
        newData.push(item);
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
          chlditemcd: data.itemcd,
          chlditemnm: data.itemnm,
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
          chlditemcd: data.itemcd,
          chlditemnm: data.itemnm,
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
    <GridContainer>
      {/* //maxWidth="calc(50% - 7.5px)" */}
      <PR_A1100W_WINDOW_PRC_FORM_GRID_EDIT_CONTEXT.Provider
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
            parentField: name,
            [SELECTED_FIELD]: selectedState[idGetter(item)],
          }))}
          total={dataWithIndexes.total}
          dataItemKey={dataItemKey}
          style={{ height: "290px" }}
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
            width="150px"
            cell={CustomComboBoxCell}
          />
          <GridColumn
            field="procseq"
            title="공정순서"
            width="100px"
            cell={NumberCell}
          />

          <GridColumn
            field="outprocyn"
            title="외주구분"
            width="110px"
            cell={CustomComboBoxCell}
          />
          <GridColumn
            field="prodemp"
            title="작업자"
            width="120px"
            cell={CustomComboBoxCell}
          />
          <GridColumn
            field="prodmac"
            title="설비"
            width="200px"
            cell={CustomComboBoxCell}
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
      </PR_A1100W_WINDOW_PRC_FORM_GRID_EDIT_CONTEXT.Provider>
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
    const { editIndex } = React.useContext(
      PR_A1100W_WINDOW_MTR_FORM_GRID_EDIT_CONTEXT
    );
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
          srcPgName: "PR_A1100W_WINDOW_MTL",
          proccd: commonCodeDefaultValue,
          unitqty: 0,
          procqty: 0,
          outgb: commonCodeDefaultValue,
          qtyunit: commonCodeDefaultValue,
        },
      });

      setEditIndex(0);
    },
    [fieldArrayRenderProps]
  );

  const onRemove = React.useCallback(() => {
    let newData: any[] = [];

    //삭제 안 할 데이터 newData에 push
    fieldArrayRenderProps.value.forEach((item: any, index: number) => {
      if (!selectedState[index]) {
        newData.push(item);
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
          chlditemcd: data.itemcd,
          chlditemnm: data.itemnm,
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
          chlditemcd: data.itemcd,
          chlditemnm: data.itemnm,
          // insiz: data.insiz,
          // itemacnt: {
          //   sub_code: data.itemacnt,
          //   code_name: itemacntListData.find(
          //     (item: any) => item.sub_code === data.itemacnt
          //   )?.code_name,
          // },
          // qtyunit: commonCodeDefaultValue,
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

  return (
    <GridContainer>
      {/* maxWidth="calc(50% - 7.5px)" */}
      <PR_A1100W_WINDOW_MTR_FORM_GRID_EDIT_CONTEXT.Provider
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
            parentField: name,
            [SELECTED_FIELD]: selectedState[idGetter(item)],
          }))}
          total={dataWithIndexes.total}
          dataItemKey={dataItemKey}
          style={{ height: "290px" }}
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
            width="130px"
            cell={CustomComboBoxCell}
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
            width="120px"
            cell={CustomComboBoxCell}
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
            cell={CustomComboBoxCell}
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
      </PR_A1100W_WINDOW_MTR_FORM_GRID_EDIT_CONTEXT.Provider>
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
  const pathname: string = window.location.pathname.replace("/", "");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //드롭다운 리스트 데이터 조회 (공정, 외주구분, 작업자, 설비 / 자재사용구분, (품목계정,) 수량단위)
  const [proccdListData, setProccdListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [outprocynListData, setOutprocynListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [prodempListData, setProdempListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [prodmacListData, setProdmacListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [usersListData, setUsersListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [outgbListData, setOutgbListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [itemacntListData, setItemacntListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  const [qtyunitListData, setQtyunitListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(proccdQuery, setProccdListData);
  UseCommonQuery(outprocynQuery, setOutprocynListData);
  UseCommonQuery(usersQuery, setProdempListData);
  UseCommonQuery(prodmacQuery, setProdmacListData);
  UseCommonQuery(usersQuery, setUsersListData);
  UseCommonQuery(outgbQuery, setOutgbListData);
  UseCommonQuery(itemacntQuery, setItemacntListData);
  UseCommonQuery(qtyunitQuery, setQtyunitListData);

  //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetAllGrid();
    resetForm();
  }, [
    proccdListData,
    outprocynListData,
    prodmacListData,
    usersListData,
    outgbListData,
    qtyunitListData,
  ]);

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

  const [mtrDataResult, setMtrDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custType, setCustType] = useState("");

  useEffect(() => {
    fetchMain();
  }, []);

  const [initialVal, setInitialVal] = useState({
    orgdiv: "01",
    location: "01",
    ordnum: "",
    ordseq: 0,
    planqty: 0,
    itemcd: "",
    // frdt: new Date(),
    // person: "",
  });

  //수주정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_PR_A1100W_Q",
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

  const prcParameters: Iparameters = {
    procedureName: "P_PR_A1100W_Q",
    pageNumber: 1,
    pageSize: 50,
    parameters: {
      "@p_work_type": "PRC",
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

  const mtrParameters: Iparameters = {
    procedureName: "P_PR_A1100W_Q",
    pageNumber: 1,
    pageSize: 50,
    parameters: {
      "@p_work_type": "MTR",
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows[0];

      setInitialVal((prev) => {
        return {
          ...prev,
          ordnum: rows.ordnum,
          ordseq: rows.ordseq,
          itemcd: rows.itemcd,
          planqty: rows.planqty,
        };
      });

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
  }, [detailDataResult]);

  //itemacnt, qtyunit list가 조회된 후 상세그리드 조회
  useEffect(() => {
    if (itemacntListData.length > 0) {
      setInfoVal((prev) => {
        return {
          ...prev,
          itemacnt:
            itemacntListData.find(
              (item: any) => item.sub_code === prev.itemacnt
            )?.code_name ?? "",
        };
      });
    }
    if (
      proccdListData.length > 0 &&
      outprocynListData.length > 0 &&
      prodmacListData.length > 0 &&
      usersListData.length > 0 &&
      outgbListData.length > 0 &&
      itemacntListData.length > 0 &&
      qtyunitListData.length > 0
    ) {
      resetAllGrid();
      fetchPrcGrid();
      fetchMtrGrid();
    }
  }, [
    proccdListData,
    outprocynListData,
    prodmacListData,
    usersListData,
    outgbListData,
    itemacntListData,
    qtyunitListData,
  ]);

  //공정 그리드 조회
  const fetchPrcGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", prcParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => {
        return {
          ...row,
          srcPgName: "PR_A1100W_WINDOW_PRC",
          proccd: {
            sub_code: row.proccd,
            code_name: proccdListData.find(
              (item: any) => item.sub_code === row.proccd
            )?.code_name,
          },
          outprocyn: {
            sub_code: row.outprocyn,
            code_name: outprocynListData.find(
              (item: any) => item.sub_code === row.outprocyn
            )?.code_name,
          },
          prodemp: {
            sub_code: row.prodemp,
            code_name: prodempListData.find(
              (item: any) => item.sub_code === row.prodemp
            )?.code_name,
          },
          prodmac: {
            sub_code: row.prodmac,
            code_name: prodmacListData.find(
              (item: any) => item.sub_code === row.prodmac
            )?.code_name,
          },
          idx,
        };
      });

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowCnt,
        };
      });

      //resetForm();
    }
  };

  //자재 그리드 조회
  const fetchMtrGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", mtrParameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => {
        return {
          ...row,
          srcPgName: "PR_A1100W_WINDOW_MTL",
          proccd: {
            sub_code: row.proccd,
            code_name: proccdListData.find(
              (item: any) => item.sub_code === row.proccd
            )?.code_name,
          },
          outgb: {
            sub_code: row.outgb,
            code_name: outgbListData.find(
              (item: any) => item.sub_code === row.outgb
            )?.code_name,
          },
          qtyunit: {
            sub_code: row.qtyunit,
            code_name: qtyunitListData.find(
              (item: any) => item.sub_code === row.qtyunit
            )?.code_name,
          },
          idx,
        };
      });

      setMtrDataResult(() => {
        return {
          data: [...rows],
          total: totalRowCnt,
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
    procedureName: "P_PR_A1100W_S",
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

    if (data.isSuccess === true) {
      alert(findMessage(messagesData, "PR_A1100W_002"));
      if (workType === "U") {
        resetAllGrid();

        reloadData("U");
        fetchMain();
        fetchPrcGrid();
        fetchMtrGrid();
      } else {
        getVisible(false);
        reloadData("N");
      }
    } else {
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    //alert(JSON.stringify(dataItem));

    let valid = true;

    //검증
    try {
      if (dataItem.planqty < 1) {
        throw findMessage(messagesData, "PR_A1100W_006");
      }
      dataItem.processList.forEach((item: any, idx: number) => {
        dataItem.processList.forEach((chkItem: any, chkIdx: number) => {
          if (
            (item.proccd === chkItem.proccd ||
              item.procseq === chkItem.procseq) &&
            idx !== chkIdx
          ) {
            throw findMessage(messagesData, "PR_A1100W_003");
          }
        });

        if (!checkIsDDLValid(item.proccd)) {
          throw findMessage(messagesData, "PR_A1100W_004");
        }

        if (item.procseq < 0) {
          throw findMessage(messagesData, "PR_A1100W_005");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const {
      orgdiv,
      location,
      ordnum,
      ordseq,
      itemcd,
      planqty,
      processList,
      materialList,
    } = dataItem;

    let processArr: TProcessData = {
      proccd: [],
      planno: [],
      qtyunit: [],
      planseq: [],
      procseq: [],
      procqty: [],
      outprocyn: [],
      prodemp: [],
      prodmac: [],
      plandt: [],
      finexpdt: [],
    };

    let materialArr: TMaterialData = {
      seq: [],
      unitqty: [],
      outgb: [],
      chlditemcd: [],
      qtyunit: [],
      proccd: [],
    };

    processList.forEach((item: any, idx: number) => {
      const {
        proccd,
        planseq,
        planno,
        procseq,
        qtyunit,
        outprocyn,
        prodemp,
        prodmac,
      } = item;
      processArr.proccd.push(typeof proccd === "object" ? proccd.sub_code : "");
      processArr.planno.push(planno);
      processArr.qtyunit.push(qtyunit);
      processArr.planseq.push("0");
      processArr.procqty.push("1");
      processArr.procseq.push(String(idx + 1));
      processArr.plandt.push(convertDateToStr(new Date()));
      processArr.finexpdt.push(convertDateToStr(new Date()));
      processArr.outprocyn.push(
        typeof outprocyn === "object" ? outprocyn.sub_code : ""
      );
      processArr.prodemp.push(
        typeof prodemp === "object" ? prodemp.sub_code : ""
      );
      processArr.prodmac.push(
        typeof prodmac === "object" ? prodmac.sub_code : ""
      );
    });

    console.log("materialList");
    console.log(materialList);
    materialList.forEach((item: any, idx: number) => {
      const { unitqty, outgb, chlditemcd, qtyunit, proccd } = item;
      materialArr.seq.push("0");
      materialArr.unitqty.push(unitqty);
      materialArr.outgb.push(typeof outgb === "object" ? outgb.sub_code : "");
      materialArr.chlditemcd.push(chlditemcd);
      materialArr.qtyunit.push(
        typeof qtyunit === "object" ? qtyunit.sub_code : ""
      );
      materialArr.proccd.push(
        typeof proccd === "object" ? proccd.sub_code : ""
      );
    });

    setParaData((prev) => ({
      ...prev,
      work_type: workType,

      //work_type "",
      orgdiv: orgdiv,
      location: location,
      planqty: planqty,
      rowstatus_s: "",
      ordnum_s: ordnum,
      ordseq_s: ordseq,
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
      itemcd_s: itemcd,
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
      planno_s: processArr.planno.join("|"),
      planseq_s: processArr.planseq.join("|"),
      seq_s: materialArr.seq.join("|"),
      unitqty_s: materialArr.unitqty.join("|"),
      qtyunit_s: processArr.qtyunit.join("|"),
      outgb_s: materialArr.outgb.join("|"),
      procqty_s: processArr.procqty.join("|"),
      chlditemcd_s: materialArr.chlditemcd.join("|"),
      qtyunit_s2: materialArr.qtyunit.join("|"),
      proccd_s2: materialArr.proccd.join("|"),
      plandt_s: processArr.plandt.join("|"),
      finexpdt_s: processArr.finexpdt.join("|"),
      prodmac_s: processArr.prodmac.join("|"),
      prodemp_s: processArr.prodemp.join("|"),
      proccd_s: processArr.proccd.join("|"),
      procseq_s: processArr.procseq.join("|"),
      outprocyn_s: processArr.outprocyn.join("|"),
      lotnum_s: "",
      ordyn_s: "",
      userid: "admin",
      pc: "WEB TEST",
      purtype: "",
      urgencyyn: "",
      service_id: "20190218001",
      form_id: "PR_A1100W",
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
    <customOptionContext.Provider
      value={{
        customOptionData,
      }}
    >
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
            orgdiv: initialVal.orgdiv,
            location: initialVal.location,
            ordnum: initialVal.ordnum,
            ordseq: initialVal.ordseq,
            itemcd: initialVal.itemcd,
            /* frdt: initialVal.frdt, //new Date(),
          person: {
            sub_code: initialVal.person,
            code_name: usersListData.find(
              (item: any) => item.sub_code === initialVal.person
            )?.code_name,
          },*/

            planqty: initialVal.planqty,
            processList: detailDataResult.data,
            materialList: mtrDataResult.data,
          }}
          render={(formRenderProps: FormRenderProps) => (
            <FormElement horizontal={true}>
              <GridContainerWrap>
                <GridContainer>
                  <>
                    <InfoList>
                      <InfoTitle>수주정보</InfoTitle>
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
                    </InfoList>

                    <InfoList>
                      <InfoTitle>계획정보</InfoTitle>
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
                      <InfoItem>
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

                          {/* <FieldWrap>
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
              </FieldWrap> */}

                          <FieldWrap>
                            <Field
                              label={"계획수량"}
                              name={"planqty"}
                              component={FormNumericTextBox}
                              validator={validator}
                              className="required big-input"
                            />
                          </FieldWrap>
                        </fieldset>
                      </InfoItem>
                    </InfoList>
                  </>
                </GridContainer>
                <GridContainer clientWidth={position.width - 250}>
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
                    //validator={arrayLengthValidator}
                  />
                </GridContainer>
              </GridContainerWrap>
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

        {custWindowVisible && (
          <CustomersWindow
            getVisible={setCustWindowVisible}
            workType={custType} //신규 : N, 수정 : U
            getData={getCustData}
            para={undefined}
          />
        )}
      </Window>
    </customOptionContext.Provider>
  );
};

export default KendoWindow;
