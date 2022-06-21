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
} from "@progress/kendo-react-grid";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";

import {
  ButtonInField,
  ButtonInFieldWrap,
  FieldWrap,
} from "../../CommonStyled";
import {
  Form,
  Field,
  FormElement,
  FieldArray,
  FieldArrayRenderProps,
} from "@progress/kendo-react-form";
import { Input } from "@progress/kendo-react-inputs";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import LocationDDL from "../DropDownLists/LocationDDL";
import { DropDownList } from "@progress/kendo-react-dropdowns";

import { Error } from "@progress/kendo-react-labels";

import { clone } from "@progress/kendo-react-common";

import { sampleProducts } from "./sample-products";

import {
  NumberCell,
  NameCell,
  FormInput,
  validator,
  FormDropDownList,
  FormDatePicker,
  FormReadOnly,
  CellDropDownList,
} from "./editors";
import { Iparameters } from "../../store/types";
import {
  convertDateToStr,
  dateformat,
  UseCommonDataDDL,
} from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { deletedRowsState, usersState } from "../../store/atoms";
import { useRecoilState } from "recoil";

import CustomersWindow from "../../components/Windows/CustomersWindow";
import ItemsWindow from "./ItemsWindow";
import { IItemData } from "../../routes/interfaces";

// Validate the entire Form
const arrayLengthValidator = (value: any) =>
  value && value.length ? "" : "Please add at least one record.";

// Create React.Context to pass props to the Form Field components from the main component
export const FormGridEditContext = React.createContext<{
  onRemove: (dataItem: any) => void;
  onEdit: (dataItem: any, isNew: boolean) => void;
  onCopy: (dataItem: any) => void;
  onSave: () => void;
  onCancel: () => void;
  editIndex: number | undefined;
  parentField: string;
}>({} as any);

const deletedRows: object[] = [];

//const [deletedRows, setDeletedRows] = useRecoilState(deletedRowsState);

const FORM_DATA_INDEX = "formDataIndex";
const DATA_ITEM_KEY = "ordseq1";

interface PositionInterface {
  left: number;
  top: number;
  width: number;
  height: number;
}

type IKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  workType: string;
  ordnum?: string;
  isCopy: boolean;
  para?: Iparameters; //{};
};

type MyType = {
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

const locationQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA002' AND system_yn = 'Y'";
const doexdivQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA005' AND system_yn = 'Y'";
const ordstsQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'SA002' AND system_yn = 'Y'";
const ordtypeQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA007' AND system_yn = 'Y'";
const departmentsQuery =
  "SELECT dptcd sub_code, dptnm code_name FROM BA040T WHERE useyn = 'Y'";
const usersQuery =
  "SELECT user_id sub_code, user_name code_name FROM sysUserMaster WHERE rtrchk <> 'Y' AND hold_check_yn <> 'Y'";
const taxdivQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA029' AND system_yn = 'Y'";
const itemacntQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA061' AND system_yn = 'Y'";

// Add a command cell to Edit, Update, Cancel and Delete an item
const CommandCell = (props: GridCellProps) => {
  const { onRemove, onEdit, onSave, onCancel, onCopy, editIndex } =
    React.useContext(FormGridEditContext);
  const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;
  const isNewItem = !props.dataItem[DATA_ITEM_KEY];

  const onRemoveClick = React.useCallback(
    (e: any) => {
      e.preventDefault();
      onRemove(props.dataItem);
    },
    [props.dataItem, onRemove]
  );

  const onCopyClick = React.useCallback(
    (e: any) => {
      e.preventDefault();
      onCopy(props.dataItem);
    },
    [props.dataItem, onCopy]
  );

  const onEditClick = React.useCallback(
    (e: any) => {
      e.preventDefault();
      onEdit(props.dataItem, isNewItem);
    },
    [props.dataItem, onEdit, isNewItem]
  );

  const onSaveClick = React.useCallback(
    (e: any) => {
      e.preventDefault();
      onSave();
    },
    [onSave]
  );

  const onCancelClick = React.useCallback(
    (e: any) => {
      e.preventDefault();
      onCancel();
    },
    [onCancel]
  );

  return isInEdit ? (
    <td className="k-command-cell">
      <Button
        className="k-grid-save-command"
        themeColor={"primary"}
        //fillMode="outline"
        onClick={onSaveClick}
        icon="check"
      >
        {/* {isNewItem ? "수정완료" : "수정완료2"} */}
      </Button>
      <Button
        className="k-grid-edit-command"
        themeColor={"primary"}
        fillMode="outline"
        onClick={onCopyClick}
        icon="copy"
      >
        {/* 복사 */}
      </Button>
      <Button
        className="k-grid-cancel-command"
        themeColor={"primary"}
        fillMode="outline"
        onClick={isNewItem ? onRemoveClick : onCancelClick}
        icon="delete"
      >
        {/* {isNewItem ? "삭제" : "취소"} */}
      </Button>
    </td>
  ) : (
    <td className="k-command-cell">
      <Button
        className="k-grid-edit-command"
        themeColor={"primary"}
        fillMode="outline"
        onClick={onEditClick}
        icon="edit"
      >
        {/* 수정 */}
      </Button>
      <Button
        className="k-grid-edit-command"
        themeColor={"primary"}
        fillMode="outline"
        onClick={onCopyClick}
        icon="copy"
      >
        {/* 복사 */}
      </Button>
      <Button
        className="k-grid-remove-command"
        themeColor={"primary"}
        fillMode="outline"
        onClick={onRemoveClick}
        icon="delete"
      >
        {/* 삭제 */}
      </Button>
    </td>
  );
};

// Create the Grid that will be used inside the Form
const FormGrid = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { validationMessage, visited, name, dataItemKey } =
    fieldArrayRenderProps;
  const [editIndex, setEditIndex] = React.useState<number | undefined>();
  const editItemCloneRef = React.useRef();

  const [detailPgNum, setDetailPgNum] = useState(1);

  const [editedRowIdx, setEditedRowIdx] = useState(-1);
  const [editedRowData, setEditedRowData] = useState({});

  const ItemBtnCell = (props: GridCellProps) => {
    const { editIndex } = React.useContext(FormGridEditContext);
    const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;

    const onRowItemWndClick = () => {
      if (editIndex !== undefined) setEditedRowIdx(editIndex);
      console.log("c dataItem");
      console.log(props.dataItem);
      setEditedRowData(props.dataItem);
      setItemWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          type={"button"}
          className="k-grid-save-command"
          //fillMode="flat"
          onClick={onRowItemWndClick}
          icon="more-horizontal"
          disabled={isInEdit ? false : true}
        />
      </td>
    );
  };
  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
    (e: any) => {
      e.preventDefault();
      fieldArrayRenderProps.onUnshift({
        value: {
          rowstatus: "N",
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
    },
    [fieldArrayRenderProps]
  );
  // Remove a new item to the Form FieldArray that will be removed from the Grid
  const onRemove = React.useCallback(
    (dataItem: any) => {
      deletedRows.push(dataItem);

      fieldArrayRenderProps.onRemove({
        index: dataItem[FORM_DATA_INDEX],
      });

      setEditIndex(undefined);
    },
    [fieldArrayRenderProps]
  );

  // Update an item from the Grid and update the index of the edited item
  const onEdit = React.useCallback((dataItem: any, isNewItem: any) => {
    if (!isNewItem) {
      alert(1);
      editItemCloneRef.current = clone(dataItem);
    }

    console.log("onedit dataItem");
    console.log(dataItem);
    fieldArrayRenderProps.onReplace({
      index: dataItem[FORM_DATA_INDEX],
      value: {
        ...dataItem,
        rowstatus: dataItem.rowstatus === "" ? "U" : dataItem.rowstatus,
      },
    });

    setEditIndex(dataItem[FORM_DATA_INDEX]);
  }, []);

  const onCopy = React.useCallback((dataItem: any) => {
    fieldArrayRenderProps.onInsert({
      index: dataItem[FORM_DATA_INDEX],
      value: { ...dataItem, rowstatus: "N" },
    });

    setEditIndex(dataItem[FORM_DATA_INDEX]);
  }, []);

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

  //스크롤 핸들러 => 10개씩 조회
  const scrollHandler = (event: GridEvent) => {
    const e = event.nativeEvent;
    const showedRowNumber = 10;
    const totalNumber = event.target.props.total;

    if (totalNumber === undefined) {
      console.log("[scrollHandler check!] grid 'total' property를 입력하세요.");
      return false;
    }

    if (
      e.target.scrollTop + 10 >=
      e.target.scrollHeight - e.target.clientHeight
    ) {
      if (totalNumber > detailPgNum * showedRowNumber) {
        setDetailPgNum((prev) => prev + 1);
      }
    }
  };

  const getItemData = (data: IItemData, rowIdx: number, rowData: any) => {
    // setFilters((prev) => ({
    //   ...prev,
    //   itemcd: data.itemcd,
    //   itemnm: data.itemnm,
    // }));

    if (rowIdx === -1) {
      fieldArrayRenderProps.onUnshift({
        value: {
          rowstatus: "N",
          itemcd: data.itemcd,
          itemnm: data.itemnm,
          insiz: data.insiz,
          itemacnt: data.itemacnt,
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
      console.log("rowData");
      console.log(rowData);
      const dataItem = rowData;
      fieldArrayRenderProps.onReplace({
        index: dataItem[FORM_DATA_INDEX],
        value: {
          ...dataItem,
          rowstatus: dataItem.rowstatus === "N" ? dataItem.rowstatus : "U",
          itemcd: data.itemcd,
          itemnm: data.itemnm,
          insiz: data.insiz,
          itemacnt: data.itemacnt,
        },
      });
    }
  };

  const onItemWndClick = () => {
    setEditedRowIdx(-1);
    setItemWindowVisible(true);
  };

  // const itemChange = (event: GridItemChangeEvent) => {
  //   alert(1);
  //   // const inEditID = event.dataItem.ProductID;
  //   // const field = event.field || "";
  //   // const newData = data.map((item) =>
  //   //   item.ProductID === inEditID ? { ...item, [field]: event.value } : item
  //   // );
  //   // setData(newData);
  // };
  return (
    <FormGridEditContext.Provider
      value={{
        onCancel,
        onEdit,
        onCopy,
        onRemove,
        onSave,
        editIndex,
        parentField: name,
      }}
    >
      {visited && validationMessage && <Error>{validationMessage}</Error>}
      <Grid
        data={dataWithIndexes}
        total={dataWithIndexes.total}
        dataItemKey={dataItemKey}
        style={{ height: "300px" }}
        //onItemChange={itemChange}
        onScroll={scrollHandler}
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
            onClick={onItemWndClick}
          >
            품목참조
          </Button>
        </GridToolbar>
        {/* <GridColumn field="ProductName" title="Name" cell={NameCell} />
        <GridColumn field="UnitsOnOrder" title="Units" cell={NumberCell} /> */}

        <GridColumn cell={CommandCell} width="130px" />
        <GridColumn
          field="rowstatus"
          title=" "
          width="50px"
          //cell={NameCell}
          className="required"
        />
        <GridColumn
          field="itemnm"
          title="품목명"
          width="180px"
          cell={NameCell}
          className="required"
        />
        <GridColumn cell={ItemBtnCell} width="55px" />
        <GridColumn
          field="itemcd"
          title="품목코드"
          width="160px"
          cell={NameCell}
          className="required"
        />
        <GridColumn field="insiz" title="규격" width="200px" cell={NameCell} />
        <GridColumn
          field="itemacnt"
          title="품목계정"
          width="120px"
          cell={CellDropDownList}
          queryStr={itemacntQuery}
        />
        <GridColumn
          field="qty"
          title="수주량"
          width="120px"
          cell={NumberCell}
          className="required"
        />
        <GridColumn
          field="qtyunit"
          title="단위"
          width="120px"
          cell={NameCell}
        />
        <GridColumn
          field="specialunp"
          title="발주단가"
          width="120px"
          cell={NumberCell}
        />
        <GridColumn
          field="specialamt"
          title="발주금액"
          width="120px"
          cell={NumberCell}
        />
        <GridColumn field="unp" title="단가" width="120px" cell={NumberCell} />
        <GridColumn
          field="wonamt"
          title="금액"
          width="120px"
          cell={NumberCell}
        />
        <GridColumn
          field="taxamt"
          title="세액"
          width="120px"
          cell={NumberCell}
        />
        <GridColumn
          field="totamt"
          title="합계금액"
          width="120px"
          cell={NumberCell}
        />
        <GridColumn field="remark" title="비고" width="120px" cell={NameCell} />
        <GridColumn
          field="purcustnm"
          title="발주처"
          width="120px"
          cell={NameCell}
        />
        <GridColumn
          field="outqty"
          title="출하수량"
          width="120px"
          cell={NumberCell}
        />
        <GridColumn
          field="sale_qty"
          title="판매수량"
          width="120px"
          cell={NumberCell}
        />
        <GridColumn
          field="finyn"
          title="완료여부"
          width="120px"
          cell={NameCell}
        />
        <GridColumn
          field="bf_qty"
          title="LOT수량"
          width="120px"
          cell={NameCell}
        />
        <GridColumn
          field="lotnum"
          title="LOT NO"
          width="120px"
          cell={NameCell}
        />
      </Grid>

      {itemWindowVisible && (
        <ItemsWindow
          workType={"ROW"} //신규 : N, 수정 : U
          getVisible={setItemWindowVisible}
          getData={getItemData}
          rowIdx={editedRowIdx}
          rowData={editedRowData}
          para={undefined}
        />
      )}
    </FormGridEditContext.Provider>
  );
};
const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  ordnum,
  isCopy,
  para,
}: IKendoWindow) => {
  type ValueType = {
    sub_code: string;
    code_name: string;
  };

  const [locationListData, setLocationListData] = useState<Array<ValueType>>(
    []
  );
  const [doexdivListData, setDoexdivListData] = useState<Array<ValueType>>([]);
  const [ordstsListData, setOrdstsListData] = useState<Array<ValueType>>([]);
  const [ordtypeListData, setOrdtypeListData] = useState<Array<ValueType>>([]);
  const [departmentsListData, setDepartmentsListData] = useState<
    Array<ValueType>
  >([]);
  const [usersListData, setUsersListData] = useState<Array<ValueType>>([]);
  const [taxdivListData, setTaxdivListData] = useState<Array<ValueType>>([]);
  const [itemacntListData, setItemacntListData] = useState<Array<ValueType>>(
    []
  );

  const locationProp = (data: Array<ValueType>) => {
    setLocationListData(data);
  };
  const doexdivProp = (data: Array<ValueType>) => {
    setDoexdivListData(data);
  };
  const ordstsProp = (data: Array<ValueType>) => {
    setOrdstsListData(data);
  };
  const ordtypeProp = (data: Array<ValueType>) => {
    setOrdtypeListData(data);
  };
  const departmentsProp = (data: Array<ValueType>) => {
    setDepartmentsListData(data);
  };
  const usersProp = (data: Array<ValueType>) => {
    setUsersListData(data);
  };
  const taxdivProp = (data: Array<ValueType>) => {
    setTaxdivListData(data);
  };
  const itemacntProp = (data: Array<ValueType>) => {
    setItemacntListData(data);
  };
  useEffect(() => resetForm(), [locationListData]);
  useEffect(() => resetForm(), [doexdivListData]);
  useEffect(() => resetForm(), [ordstsListData]);
  useEffect(() => resetForm(), [ordtypeListData]);
  useEffect(() => resetForm(), [departmentsListData]);
  useEffect(() => resetForm(), [usersListData]);
  useEffect(() => resetForm(), [taxdivListData]);
  useEffect(() => resetForm(), [itemacntListData]);

  const [position, setPosition] = useState<PositionInterface>({
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

  const DETAIL_DATA_ITEM_KEY = "ordseq";
  const SELECTED_FIELD = "selected";
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const [formKey, setFormKey] = React.useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };
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
      fetchGrid();
    }
  }, []);

  const [initialVal, setInitialVal] = useState({
    ordnum: "",
    doexdiv: "A",
    taxdiv: "A",
    location: "01",
    orddt: new Date(),
    dlvdt: new Date(),
    custnm: "",
    custcd: "",
    dptcd: "",
    person: "",
    ordsts: "2",
    ordtype: "",
    rcvcustnm: "",
    rcvcustcd: "",
    project: "",
    amtunit: "KRW",
    wonchgrat: 0,
    uschgrat: 0,
    quokey: "",
    prcterms: "",
    paymeth: "",
    dlv_method: "",
    portnm: "",
    ship_method: "",
    poregnum: "",
    attdatnum: "",
    remark: "",
  });

  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_TEST_WEB_SA_A2000_Q",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "HEADER",
      "@p_orgdiv": "01",
      "@p_location": "",
      "@p_dtgb": "",
      "@p_frdt": "19990101",
      "@p_todt": "20991231",
      "@p_ordnum": ordnum,
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_itemcd": "",
      "@p_itemnm": "",
      "@p_person": "",
      "@p_finyn": "%",
      "@p_dptcd": "",
      "@p_ordsts": "",
      "@p_doexdiv": "",
      "@p_ordtype": "",
      "@p_poregnum": "",
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

    if (data !== null) {
      const rows = data.result.data.Rows[0];

      setInitialVal((prev) => {
        return {
          ...prev,
          ordnum: rows.ordnum,
          doexdiv: rows.doexdiv,
          taxdiv: rows.taxdiv,
          location: rows.location,
          orddt: new Date(dateformat(rows.orddt)),
          dlvdt: new Date(dateformat(rows.dlvdt)),
          custnm: rows.custnm,
          custcd: rows.custcd,
          dptcd: rows.dptcd,
          person: rows.person,
          ordsts: rows.ordsts,
          ordtype: rows.ordtype,
          rcvcustnm: rows.rcvcustnm,
          rcvcustcd: rows.rcvcustcd,
          project: rows.project,
          amtunit: rows.amtunit,
          wonchgrat: rows.wonchgrat, //0,
          uschgrat: rows.uschgrat, //0,
          quokey: rows.quokey,
          prcterms: rows.prcterms,
          paymeth: rows.paymeth,
          dlv_method: rows.dlv_method,
          portnm: rows.portnm,
          ship_method: rows.ship_method,
          poregnum: rows.poregnum,
          attdatnum: rows.attdatnum,
          remark: rows.remark,
        };
      });
    }
  };

  useEffect(() => {
    resetForm(); //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
  }, [initialVal]);

  //상세그리드 조회
  const fetchGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setDetailDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
        };
      });

      resetForm();
    }
  };
  //조회조건 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    service_id: "20190218001",
    orgdiv: "01",
    location: "01",
    ordnum: "",
    poregnum: "",
    project: "",
    ordtype: "",
    ordsts: "",
    taxdiv: "",
    orddt: "",
    dlvdt: "",
    dptcd: "",
    person: "",
    amtunit: "",
    portnm: "",
    finaldes: "",
    paymeth: "",
    prcterms: "",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    wonchgrat: 0,
    uschgrat: 0,
    doexdiv: "",
    remark: "",
    attdatnum: "",
    userid: "admin",
    pc: "WEB TEST",
    ship_method: "",
    dlv_method: "",
    hullno: "",
    rowstatus_s: "",
    chk_s: "",
    ordseq_s: "",
    poregseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    insiz_s: "",
    bnatur_s: "",
    qty_s: "",
    qtyunit_s: "",
    totwgt_s: "",
    wgtunit_s: "",
    len_s: "",
    totlen_s: "",
    lenunit_s: "",
    thickness_s: "",
    width_s: "",
    length_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    taxamt_s: "",
    dlramt_s: "",
    wonamt_s: "",
    remark_s: "",
    pac_s: "",
    finyn_s: "",
    specialunp_s: "",
    lotnum_s: "",
    dlvdt_s: "",
    specialamt_s: "",
    heatno_s: "",
    bf_qty_s: "",
    form_id: "",
  });

  //조회조건 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_TEST_WEB_SA_A2000_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_service_id": paraData.service_id,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_ordnum": paraData.ordnum,
      "@p_poregnum": paraData.poregnum,
      "@p_project": paraData.project,
      "@p_ordtype": paraData.ordtype,
      "@p_ordsts": paraData.ordsts,
      "@p_taxdiv": paraData.taxdiv,
      "@p_orddt": paraData.orddt,
      "@p_dlvdt": paraData.dlvdt,
      "@p_dptcd": paraData.dptcd,
      "@p_person": paraData.person,
      "@p_amtunit": paraData.amtunit,
      "@p_portnm": paraData.portnm,
      "@p_finaldes": paraData.finaldes,
      "@p_paymeth": paraData.paymeth,
      "@p_prcterms": paraData.prcterms,
      "@p_custcd": paraData.custcd,
      "@p_custnm": paraData.custnm,
      "@p_rcvcustcd": paraData.rcvcustcd,
      "@p_rcvcustnm": paraData.rcvcustnm,
      "@p_wonchgrat": paraData.wonchgrat,
      "@p_uschgrat": paraData.uschgrat,
      "@p_doexdiv": paraData.doexdiv,
      "@p_remark": paraData.remark,
      "@p_attdatnum": paraData.attdatnum,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_ship_method": paraData.ship_method,
      "@p_dlv_method": paraData.dlv_method,
      "@p_hullno": paraData.hullno,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_chk_s": paraData.chk_s,
      "@p_ordseq_s": paraData.ordseq_s,
      "@p_poregseq_s": paraData.poregseq_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_itemnm_s": paraData.itemnm_s,
      "@p_itemacnt_s": paraData.itemacnt_s,
      "@p_insiz_s": paraData.insiz_s,
      "@p_bnatur_s": paraData.bnatur_s,
      "@p_qty_s": paraData.qty_s,
      "@p_qtyunit_s": paraData.qtyunit_s,
      "@p_totwgt_s": paraData.totwgt_s,
      "@p_wgtunit_s": paraData.wgtunit_s,
      "@p_len_s": paraData.len_s,
      "@p_totlen_s": paraData.totlen_s,
      "@p_lenunit_s": paraData.lenunit_s,
      "@p_thickness_s": paraData.thickness_s,
      "@p_width_s": paraData.width_s,
      "@p_length_s": paraData.length_s,
      "@p_unpcalmeth_s": paraData.unpcalmeth_s,
      "@p_unp_s": paraData.unp_s,
      "@p_amt_s": paraData.amt_s,
      "@p_taxamt_s": paraData.taxamt_s,
      "@p_dlramt_s": paraData.dlramt_s,
      "@p_wonamt_s": paraData.wonamt_s,
      "@p_remark_s": paraData.remark_s,
      "@p_pac_s": paraData.pac_s,
      "@p_finyn_s": paraData.finyn_s,
      "@p_specialunp_s": paraData.specialunp_s,
      "@p_lotnum_s": paraData.lotnum_s,
      "@p_dlvdt_s": paraData.dlvdt_s,
      "@p_specialamt_s": paraData.specialamt_s,
      "@p_heatno_s": paraData.heatno_s,
      "@p_bf_qty_s": paraData.bf_qty_s,
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
    alert(JSON.stringify(dataItem));

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
      products,
    } = dataItem;

    let detailArr: MyType = {
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
    products.forEach((item: any) => {
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
      detailArr.qtyunit_s.push(qtyunit);
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
      detailArr.qtyunit_s.push(qtyunit);
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
      amtunit,
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

    console.log("paraData!!");
    console.log(paraData);
  };

  // useEffect(() => {
  //   if (isCopy === true)
  //     setInitialVal((prev) => ({
  //       ...prev,
  //       ordnum: "",
  //     }));

  //   resetForm();
  // }, []);

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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

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

  return (
    <Window
      title={workType === "N" ? "수주생성" : "수주정보"}
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
          ordnum: isCopy === true ? "" : initialVal.ordnum,
          doexdiv: {
            sub_code: initialVal.doexdiv, //"A"
            code_name: doexdivListData.find(
              (item: any) => item.sub_code === initialVal.doexdiv
            )?.code_name,
          },
          taxdiv: {
            sub_code: initialVal.taxdiv,
            code_name: taxdivListData.find(
              (item: any) => item.sub_code === initialVal.taxdiv
            )?.code_name,
          },
          location: {
            sub_code: initialVal.location,
            code_name: locationListData.find(
              (item: any) => item.sub_code === initialVal.location
            )?.code_name,
          },
          orddt: initialVal.orddt, //new Date(),
          dlvdt: initialVal.dlvdt,
          custnm: initialVal.custnm,
          custcd: initialVal.custcd,
          dptcd: {
            sub_code: initialVal.dptcd,
            code_name: departmentsListData.find(
              (item: any) => item.sub_code === initialVal.dptcd
            )?.code_name,
          },
          person: {
            sub_code: initialVal.person,
            code_name: usersListData.find(
              (item: any) => item.sub_code === initialVal.person
            )?.code_name,
          },
          ordsts: {
            sub_code: initialVal.ordsts,
            code_name: ordstsListData.find(
              (item: any) => item.sub_code === initialVal.ordsts
            )?.code_name,
          },
          ordtype: {
            sub_code: initialVal.ordtype,
            code_name: ordtypeListData.find(
              (item: any) => item.sub_code === initialVal.ordtype
            )?.code_name,
          },
          rcvcustnm: initialVal.rcvcustnm,
          rcvcustcd: initialVal.rcvcustcd,
          project: initialVal.project,
          amtunit: initialVal.amtunit, //"KRW",
          wonchgrat: initialVal.wonchgrat, //0,
          uschgrat: initialVal.uschgrat, //0,
          quokey: initialVal.quokey,
          prcterms: initialVal.prcterms,
          paymeth: initialVal.paymeth,
          dlv_method: initialVal.dlv_method,
          portnm: initialVal.portnm,
          ship_method: initialVal.ship_method,
          poregnum: initialVal.poregnum,
          attdatnum: initialVal.attdatnum,
          remark: initialVal.remark,
          products: detailDataResult.data, //detailDataResult.data,
          // lastName: "Peterson",
          // email: "johnpeterson@company.com",
        }}
        render={() => (
          <FormElement horizontal={true}>
            <fieldset className={"k-form-fieldset"}>
              <FieldWrap>
                <Field
                  name={"ordnum"}
                  label={"수주번호"}
                  component={FormReadOnly}
                />
                <Field
                  name={"doexdiv"}
                  label={"내수구분"}
                  component={FormDropDownList}
                  queryStr={doexdivQuery}
                />
                <Field
                  name={"taxdiv"}
                  component={FormDropDownList}
                  label={"과세구분"}
                  queryStr={taxdivQuery}
                />
                <Field
                  name={"location"}
                  component={FormDropDownList}
                  label={"사업장"}
                  queryStr={locationQuery}
                />
              </FieldWrap>

              <FieldWrap>
                <Field
                  name={"orddt"}
                  component={FormDatePicker}
                  label={"수주일자"}
                />
                <Field
                  name={"dlvdt"}
                  component={FormDatePicker}
                  label={"납기일자"}
                />
                <Field
                  name={"ordsts"}
                  component={FormDropDownList}
                  queryStr={ordstsQuery}
                  label={"수주상태"}
                />
                <Field
                  name={"ordtype"}
                  component={FormDropDownList}
                  queryStr={ordtypeQuery}
                  label={"수주형태"}
                />
              </FieldWrap>

              <FieldWrap>
                <Field
                  name={"custnm"}
                  component={FormInput}
                  validator={validator}
                  label={"업체명"}
                />
                <ButtonInFieldWrap>
                  <ButtonInField>
                    <Button
                      type={"button"}
                      onClick={onCustWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInField>
                </ButtonInFieldWrap>
                <Field
                  name={"custcd"}
                  component={FormInput}
                  validator={validator}
                  label={"업체코드"}
                />
                <Field
                  name={"rcvcustnm"}
                  component={FormInput}
                  label={"인수처"}
                />
                <ButtonInFieldWrap>
                  <ButtonInField>
                    <Button
                      type={"button"}
                      onClick={onRcvcustWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInField>
                </ButtonInFieldWrap>
                <Field
                  name={"rcvcustcd"}
                  component={FormInput}
                  label={"인수처코드"}
                />
              </FieldWrap>
              <FieldWrap>
                <Field
                  name={"project"}
                  component={FormInput}
                  label={"프로젝트"}
                />
                <Field
                  name={"amtunit"}
                  component={FormInput}
                  label={"화폐단위"}
                />
                <Field
                  name={"wonchgrat"}
                  component={FormInput}
                  label={"원화환율"}
                />
                <Field
                  name={"uschgrat"}
                  component={FormInput}
                  label={"대미환율"}
                />
              </FieldWrap>
              <FieldWrap>
                <Field
                  name={"quokey"}
                  component={FormReadOnly}
                  label={"견적번호"}
                />
                <Field
                  name={"prcterms"}
                  component={FormInput}
                  label={"인도조건"}
                />
                <Field
                  name={"paymeth"}
                  component={FormInput}
                  label={"지불조건"}
                />
                <Field
                  name={"dlv_method"}
                  component={FormInput}
                  label={"납기조건"}
                />
              </FieldWrap>
              <FieldWrap>
                <Field name={"portnm"} component={FormInput} label={"선적지"} />
                <Field
                  name={"ship_method"}
                  component={FormInput}
                  label={"선적방법"}
                />
                <Field
                  name={"poregnum"}
                  component={FormInput}
                  label={"PO번호"}
                />
                <Field
                  name={"attdatnum"}
                  component={FormInput}
                  label={"첨부파일"}
                />
              </FieldWrap>
              <FieldWrap>
                <Field
                  name={"dptcd"}
                  component={FormDropDownList}
                  queryStr={departmentsQuery}
                  label={"부서"}
                />
                <Field
                  name={"person"}
                  component={FormDropDownList}
                  queryStr={usersQuery}
                  label={"담당자"}
                />
                <Field name={"remark"} component={FormInput} label={"비고"} />
              </FieldWrap>
            </fieldset>
            <FieldArray
              name="products"
              dataItemKey={DATA_ITEM_KEY}
              component={FormGrid}
              validator={arrayLengthValidator}
            />

            <div className="k-form-buttons">
              <Button type={"submit"} themeColor={"primary"} icon="save">
                저장
              </Button>
            </div>
          </FormElement>
        )}
      />
      <UseCommonDataDDL queryStr={locationQuery} setData={locationProp} />
      <UseCommonDataDDL queryStr={doexdivQuery} setData={doexdivProp} />
      <UseCommonDataDDL queryStr={ordstsQuery} setData={ordstsProp} />
      <UseCommonDataDDL queryStr={ordtypeQuery} setData={ordtypeProp} />
      <UseCommonDataDDL queryStr={departmentsQuery} setData={departmentsProp} />
      <UseCommonDataDDL queryStr={usersQuery} setData={usersProp} />
      <UseCommonDataDDL queryStr={taxdivQuery} setData={taxdivProp} />
      <UseCommonDataDDL queryStr={itemacntQuery} setData={itemacntProp} />

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
