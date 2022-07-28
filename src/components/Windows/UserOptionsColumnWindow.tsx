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
import { useRecoilValue } from "recoil";
import { tokenState } from "../../store/atoms";
import { useParams } from "react-router-dom";

// Validate the entire Form
const arrayLengthValidator = (value: any) =>
  value && value.length ? "" : "최소 1개 행을 입력해주세요";

// Create React.Context to pass props to the Form Field components from the main component
export const USER_OPTIONS_COLUMN_WINDOW_FORM_GRID_EDIT_CONTEXT =
  React.createContext<{
    onRemove: (dataItem: any) => void;
    onEdit: (dataItem: any, isNew: boolean) => void;
    onSave: () => void;
    onCancel: () => void;
    editIndex: number | undefined;
    parentField: string;
  }>({} as any);

const deletedRows: object[] = [];

const FORM_DATA_INDEX = "formDataIndex";
const DATA_ITEM_KEY = "field_name ";

const idGetter = getter(FORM_DATA_INDEX);
const SELECTED_FIELD: string = "selected";

const pathname: string = window.location.pathname;

type TKendoWindow = {
  getVisible(t: boolean): void;
  workType: string;
  parentComponent?: string;
};

type TDetailData = {
  rowstatus: string[];
  field_name: string[];
  caption: string[];
  column_visible: string[];
  column_width: string[];
  user_edit_yn: string[];
  user_required_yn: string[];
  column_type: string[];
  column_className: string[];
};

// Create the Grid that will be used inside the Form
const FormGrid = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { validationMessage, visited, name, dataItemKey, value } =
    fieldArrayRenderProps;
  const [editIndex, setEditIndex] = React.useState<number | undefined>();
  const editItemCloneRef = React.useRef();

  const [detailPgNum, setDetailPgNum] = useState(1);

  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
    (e: any) => {
      e.preventDefault();
      fieldArrayRenderProps.onPush({
        value: {
          srcPgName: "USER_OPTIONS_COLUMN_WINDOW",
          rowstatus: "N",
          column_width: 120,
          column_type: "TEXT",
          user_edit_yn: "N",
          user_required_yn: "N",
          column_visible: "Y",
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
  const [itemacntListData, setItemacntListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemacntQuery, setItemacntListData);

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

  const itemChange = (event: GridItemChangeEvent) => {
    // const inEditID = event.dataItem.ProductID;
    // const field = event.field || "";
    // const newData = data.map((item) =>
    //   item.ProductID === inEditID ? { ...item, [field]: event.value } : item
    // );
    // setData(newData);
  };

  return (
    <GridContainer margin={{ top: "30px" }}>
      <USER_OPTIONS_COLUMN_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider
        value={{
          onCancel,
          onEdit,
          onRemove,
          onSave,
          editIndex,
          parentField: name,
        }}
      >
        {visited && validationMessage && <Error>{validationMessage}</Error>}
        <Grid
          data={dataWithIndexes.map((item: any) => ({
            ...item,
            [SELECTED_FIELD]: selectedState[idGetter(item)],
          }))}
          total={dataWithIndexes.total}
          dataItemKey={dataItemKey}
          style={{ height: "550px" }}
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
            field="field_name"
            title="필드명"
            width="160px"
            cell={NameCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="caption"
            title="캡션"
            width="180px"
            cell={NameCell}
          />
          <GridColumn
            field="column_visible"
            title="숨김여부"
            width="120px"
            cell={NameCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="column_width"
            title="컬럼너비"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="user_edit_yn"
            title="수정가능여부"
            width="120px"
            cell={NameCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="user_required_yn"
            title="필수여부"
            width="120px"
            cell={NameCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="column_type"
            title="컬럼타입"
            width="120px"
            cell={NameCell} //CellDropDownList
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="column_className"
            title="ClassName"
            width="120px"
            cell={NameCell}
          />
        </Grid>
      </USER_OPTIONS_COLUMN_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider>
    </GridContainer>
  );
};
const KendoWindow = ({
  getVisible,
  workType,
  parentComponent,
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

  // //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
  // useEffect(() => {
  //   resetAllGrid();
  //   resetForm();
  // }, [qtyunitListData]);

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

  const DETAIL_DATA_ITEM_KEY = "ordseq";
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

  //  const [workType, setWorkType] = React.useState("");

  const [tabSelected, setTabSelected] = React.useState(1);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };
  useEffect(() => {
    if (workType === "U") {
      fetchMain();
      //fetchGrid();
    }
  }, []);

  const [initialVal, setInitialVal] = useState({
    message_id: "",
    parent_component: "",
  });

  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "WEB_sys_sel_column_view_config",
    pageNumber: 1,
    pageSize: 50,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_dbname": "SYSTEM",
      "@p_form_id": pathname,
      "@p_lang_id": "",
      "@p_parent_component": workType === "U" ? parentComponent : "",
      "@p_message": "",
    },
  };

  //요약정보 조회
  const fetchMain = async () => {
    let data: any;

    try {
      data = await processApi<any>("platform-procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.result.isSuccess === true) {
      const totalRowsCnt = data.result.totalRowCount;
      let rows = data.result.data.Rows;

      rows = rows.map((row: any) => {
        return {
          ...row,
          srcPgName: "USER_OPTIONS_COLUMN_WINDOW",
        };
      });

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowsCnt,
        };
      });

      const row = data.result.data.Rows[0];
      const { parent_component, message_id } = row;

      setInitialVal((prev) => {
        return {
          ...prev,
          parent_component,
          message_id,
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
  //   if (workType === "U") {
  //     if (itemacntListData.length > 0 && qtyunitListData.length > 0) {
  //       resetAllGrid();
  //       fetchGrid();
  //     }
  //   }
  // }, [itemacntListData, qtyunitListData]);

  //상세그리드 조회
  const fetchGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", columnDetailParameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      let rows = data.result.data.Rows;

      rows = rows.map((row: any) => {
        return {
          ...row,
          itemacnt: {
            sub_code: row.itemacnt,
            code_name: itemacntListData.find(
              (item: any) => item.sub_code === row.itemacnt
            )?.code_name,
          },
          qtyunit: {
            sub_code: row.qtyunit,
            code_name: qtyunitListData.find(
              (item: any) => item.sub_code === row.qtyunit
            )?.code_name,
          },
        };
      });

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
    dbname: "SYSTEM",
    form_id: pathname,
    component: "",
    parent_component: "",
    message_id: "",
    field_name: "",
    word_id: "",
    caption: "",
    rowstatus_s: "",
    column_visible: "",
    column_width: "",
    user_edit_yn: "",
    user_required_yn: "",
    column_type: "",
    column_className: "",
    exec_pc: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "WEB_sys_sav_column_view_config",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_dbname": paraData.dbname,
      "@p_form_id": paraData.form_id,
      "@p_component": paraData.component,
      "@p_parent_component": paraData.parent_component,
      "@p_message_id": paraData.message_id,
      "@p_field_name": paraData.field_name,
      "@p_word_id": paraData.word_id,
      "@p_caption": paraData.caption,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_column_visible": paraData.column_visible,
      "@p_column_width": paraData.column_width,
      "@p_user_edit_yn": paraData.user_edit_yn,
      "@p_user_required_yn": paraData.user_required_yn,
      "@p_column_type": paraData.column_type,
      "@p_column_className": paraData.column_className,
      "@p_exec_pc": paraData.exec_pc,
    },
  };

  const columnDetailParameters: Iparameters = {
    procedureName: "WEB_sys_sel_column_view_config",
    pageNumber: 1,
    pageSize: 20,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_dbname": "SYSTEM",
      "@p_form_id": pathname,
      "@p_lang_id": "",
      "@p_parent_component": parentComponent,
      "@p_message": "",
    },
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], dataState));
    setDetailDataResult(process([], dataState));
  };

  const fetchGridSaved = async () => {
    let data: any;

    console.log("paraSaved");
    console.log(paraSaved);

    try {
      data = await processApi<any>("platform-procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.result.isSuccess === true) {
      alert("저장이 완료되었습니다.");
      if (workType === "U") {
        resetAllGrid();

        //reloadData("U");
        fetchMain();
        // fetchGrid();
      } else {
        getVisible(false);
        //reloadData("N");
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
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    //alert(JSON.stringify(dataItem));

    let valid = true;

    //검증
    try {
      dataItem.orderDetails.forEach((item: any) => {
        if (!item.field_name) {
          throw "필드명을 입력하세요.";
        }
        if (!item.column_visible) {
          throw "숨김여부를 선택하세요.";
        }
        if (!item.user_edit_yn) {
          throw "수정가능여부 선택하세요.";
        }
        if (!item.user_required_yn) {
          throw "필수여부를 선택하세요.";
        }
        if (!item.column_type) {
          throw "컬럼타입을 선택하세요.";
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const { parent_component, message_id, orderDetails } = dataItem;

    let detailArr: TDetailData = {
      rowstatus: [],
      field_name: [],
      caption: [],
      column_visible: [],
      column_width: [],
      user_edit_yn: [],
      user_required_yn: [],
      column_type: [],
      column_className: [],
    };
    orderDetails.forEach((item: any) => {
      const {
        rowstatus,
        field_name,
        caption,
        column_visible,
        column_width,
        user_edit_yn,
        user_required_yn,
        column_type,
        column_className,
      } = item;

      detailArr.rowstatus.push(rowstatus);
      detailArr.field_name.push(field_name);
      detailArr.caption.push(caption);
      detailArr.column_visible.push(column_visible);
      detailArr.column_width.push(column_width);
      detailArr.user_edit_yn.push(user_edit_yn);
      detailArr.user_required_yn.push(user_required_yn);
      detailArr.column_type.push(column_type);
      detailArr.column_className.push(column_className);

      //detailArr.rowstatus_s.push(isCopy === true ? "N" : rowstatus);

      // detailArr.itemacnt_s.push(
      //   typeof itemacnt === "object" ? itemacnt.sub_code : ""
      // );
    });

    // deletedRows.forEach((item: any) => {
    //   const {
    //     rowstatus,
    //     chk,
    //     ordseq,
    //     poregseq,
    //     itemcd,
    //     itemnm,
    //     itemacnt,
    //     insiz,
    //     bnatur,
    //     qty,
    //     qtyunit,
    //     totwgt,
    //     wgtunit,
    //     len,
    //     totlen,
    //     lenunit,
    //     thickness,
    //     width,
    //     length,
    //     unpcalmeth,
    //     unp,
    //     amt,
    //     taxamt,
    //     dlramt,
    //     wonamt,
    //     remark,
    //     pac,
    //     finyn,
    //     specialunp,
    //     lotnum,
    //     dlvdt,
    //     specialamt,
    //     heatno,
    //     bf_qty,
    //   } = item;

    //   detailArr.rowstatus_s.push("D");
    //   detailArr.chk_s.push(chk);
    //   detailArr.ordseq_s.push(ordseq);
    //   detailArr.poregseq_s.push(poregseq);
    //   detailArr.itemcd_s.push(itemcd);
    //   detailArr.itemnm_s.push(itemnm);
    //   detailArr.itemacnt_s.push(
    //     typeof itemacnt === "object" ? itemacnt.sub_code : ""
    //   );
    //   detailArr.insiz_s.push(insiz);
    //   detailArr.bnatur_s.push(bnatur);
    //   detailArr.qty_s.push(qty);
    //   detailArr.qtyunit_s.push(
    //     typeof qtyunit === "object" ? qtyunit.sub_code : ""
    //   );
    //   detailArr.totwgt_s.push(totwgt);
    //   detailArr.wgtunit_s.push(wgtunit);
    //   detailArr.len_s.push(len);
    //   detailArr.totlen_s.push(totlen);
    //   detailArr.lenunit_s.push(lenunit);
    //   detailArr.thickness_s.push(thickness);
    //   detailArr.width_s.push(width);
    //   detailArr.length_s.push(length);
    //   detailArr.unpcalmeth_s.push(unpcalmeth);
    //   detailArr.unp_s.push(unp);
    //   detailArr.amt_s.push(amt);
    //   detailArr.taxamt_s.push(taxamt);
    //   detailArr.dlramt_s.push(dlramt);
    //   detailArr.wonamt_s.push(wonamt);
    //   detailArr.remark_s.push(remark);
    //   detailArr.pac_s.push(pac);
    //   detailArr.finyn_s.push(finyn);
    //   detailArr.specialunp_s.push(specialunp);
    //   detailArr.lotnum_s.push(lotnum);
    //   detailArr.dlvdt_s.push(dlvdt);
    //   detailArr.specialamt_s.push(specialamt);
    //   detailArr.heatno_s.push(heatno);
    //   detailArr.bf_qty_s.push(bf_qty);
    // });

    setParaData((prev) => ({
      ...prev,
      work_type: "SAVE",
      parent_component,
      message_id,
      rowstatus_s: detailArr.rowstatus.join("|"),
      component: detailArr.field_name.join("|"),
      field_name: detailArr.field_name.join("|"),
      word_id: detailArr.field_name.join("|"),
      caption: detailArr.caption.join("|"),
      column_visible: detailArr.column_visible.join("|"),
      column_width: detailArr.column_width.join("|"),
      user_edit_yn: detailArr.user_edit_yn.join("|"),
      user_required_yn: detailArr.user_required_yn.join("|"),
      column_type: detailArr.column_type.join("|"),
      column_className: detailArr.column_className.join("|"),
    }));
  };

  useEffect(() => {
    if (paraData.parent_component !== "") fetchGridSaved();
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
      title={
        workType === "N"
          ? "사용자 옵션 컬럼 생성 (관리자)"
          : "사용자 옵션 컬럼 수정 (관리자)"
      }
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
          parent_component: initialVal.parent_component,
          message_id: initialVal.message_id,
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
              <FieldWrap fieldWidth="25%">
                <Field
                  label={"영역ID"}
                  name={"parent_component"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                />
                <Field
                  label={"영역명"}
                  name={"message_id"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                />
              </FieldWrap>
            </fieldset>
            <FieldArray
              name="orderDetails"
              dataItemKey={DATA_ITEM_KEY}
              component={FormGrid}
              validator={arrayLengthValidator}
            />

            <BottomContainer>
              <ButtonContainer>
                <Button
                  // onClick={() => (workType = "SAVE")}
                  type={"submit"}
                  themeColor={"primary"}
                  icon="save"
                  //disabled={!formRenderProps.allowSubmit}
                >
                  저장
                </Button>

                {/* <Button
                  onClick={() => (workType = "DELETE")}
                  type={"submit"}
                  themeColor={"primary"}
                  fillMode="outline"
                  icon="delete"
                  //disabled={!formRenderProps.allowSubmit}
                >
                  삭제
                </Button> */}
              </ButtonContainer>
            </BottomContainer>
          </FormElement>
        )}
      />
    </Window>
  );
};

export default KendoWindow;
