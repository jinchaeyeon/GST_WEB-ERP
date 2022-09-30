import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridEvent,
  GridToolbar,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridHeaderSelectionChangeEvent,
  GridHeaderCellProps,
} from "@progress/kendo-react-grid";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";

import {
  BottomContainer,
  ButtonContainer,
  FieldWrap,
  GridContainer,
} from "../../../CommonStyled";
import {
  Form,
  Field,
  FormElement,
  FieldArray,
  FieldArrayRenderProps,
  FormRenderProps,
} from "@progress/kendo-react-form";
import { Error } from "@progress/kendo-react-labels";
import { NumberCell, NameCell, FormInput } from "../../Editors";
import { Iparameters } from "../../../store/types";
import {
  arrayLengthValidator,
  chkScrollHandler,
  validator,
} from "../../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../../hooks/interfaces";
import { pageSize } from "../../CommonString";
import { CellRender, RowRender } from "../../Renderers";

// Create React.Context to pass props to the Form Field components from the main component
export const USER_OPTIONS_DEFAULT_WINDOW_FORM_GRID_EDIT_CONTEXT =
  React.createContext<{
    editIndex: number | undefined;
    parentField: string;
  }>({} as any);

const deletedRows: object[] = [];

const FORM_DATA_INDEX = "formDataIndex";
const DATA_ITEM_KEY = "default_id ";

const idGetter = getter(FORM_DATA_INDEX);
const SELECTED_FIELD: string = "selected";

const pathname: string = window.location.pathname.replace("/", "");

type TKendoWindow = {
  getVisible(t: boolean): void;
  workType: string;
  reloadData: () => void;
  option_id?: string;
};

type TDetailData = {
  row_status: string[];
  default_id: string[];
  caption: string[];
  word_id: string[];
  sort_order: string[];
  value_type: string[];
  value: string[];
  bc_id: string[];
  where_query: string[];
  add_year: string[];
  add_month: string[];
  add_day: string[];
  session_item: string[];
  user_editable: string[];
};

// Create the Grid that will be used inside the Form
const FormGrid = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { validationMessage, visited, name, dataItemKey } =
    fieldArrayRenderProps;
  const [editIndex, setEditIndex] = React.useState<number | undefined>();
  const [detailPgNum, setDetailPgNum] = useState(1);

  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
    (e: any) => {
      e.preventDefault();
      fieldArrayRenderProps.onPush({
        value: {
          srcPgName: "USER_OPTIONS_DEFAULT_WINDOW",
          rowstatus: "N",
          value_type: "Datetime",
          add_year: 0,
          add_month: 0,
          add_day: 0,
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

  return (
    <GridContainer margin={{ top: "30px" }}>
      <USER_OPTIONS_DEFAULT_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider
        value={{
          editIndex,
          parentField: name,
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
          style={{ height: "550px" }}
          cellRender={customCellRender}
          rowRender={customRowRender}
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
            field="default_id"
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
            field="value_type"
            title="VALUE타입"
            width="120px"
            cell={NameCell} //CellDropDownList
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="value"
            title="VALUE"
            width="120px"
            cell={NameCell}
          />
          <GridColumn
            field="bc_id"
            title="비즈니스 컴포넌트 ID"
            width="180px"
            cell={NameCell}
          />
          <GridColumn
            field="user_editable"
            title="사용자 수정 가능 여부"
            width="180px"
            cell={NameCell}
          />
          <GridColumn
            field="add_year"
            title="연 추가"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="add_month"
            title="월 추가"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="add_day"
            title="일 추가"
            width="120px"
            cell={NumberCell}
          />
        </Grid>
      </USER_OPTIONS_DEFAULT_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider>
    </GridContainer>
  );
};
const KendoWindow = ({
  getVisible,
  workType,
  reloadData,
  option_id,
}: TKendoWindow) => {
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

  //수정 없이 submit 가능하도록 임의 value를 change 시켜줌
  const [formKey, setFormKey] = React.useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };
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

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [initialVal, setInitialVal] = useState({
    option_id: "",
    option_name: "",
  });

  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "web_sel_default_management",
    pageNumber: 1,
    pageSize: 50,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_form_id": pathname,
      "@p_lang_id": "",
      "@p_process_type": workType === "U" ? option_id : "",
      "@p_message": "",
    },
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    form_id: pathname,
    type: "Default",
    company_code: "",
    option_id: "",
    option_name: "",
    subject_word_id: "",
    remarks: "",
    row_status: "",
    default_id: "",
    caption: "",
    word_id: "",
    sort_order: "",
    value_type: "",
    value_code: "",
    value: "",
    bc_id: "",
    where_query: "",
    add_year: "",
    add_month: "",
    add_day: "",
    session_item: "",
    user_editable: "",
    column_id: "",
    width: "",
    fixed: "",
    pc: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "sav_custom_option",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_form_id": paraData.form_id,
      "@p_type": paraData.type,
      "@p_company_code": paraData.company_code,
      "@p_option_id": paraData.option_id,
      "@p_option_name": paraData.option_name,
      "@p_subject_word_id": paraData.subject_word_id,
      "@p_remarks": paraData.remarks,
      "@p_row_status": paraData.row_status,

      /* sysCustomOptionDefault */
      "@p_default_id": paraData.default_id,
      "@p_caption": paraData.caption,
      "@p_word_id": paraData.word_id,
      "@p_sort_order": paraData.sort_order,
      "@p_value_type": paraData.value_type,
      "@p_value_code": paraData.value_code,
      "@p_value": paraData.value,
      "@p_bc_id": paraData.bc_id,
      "@p_where_query": paraData.where_query,
      "@p_add_year": paraData.add_year,
      "@p_add_month": paraData.add_month,
      "@p_add_day": paraData.add_day,
      "@p_session_item": paraData.session_item,
      "@p_user_editable": paraData.user_editable,
      /* sysCustomOptionColumn */
      "@p_column_id": "", // paraData.column_id,
      "@p_width": 0, // paraData.width,
      "@p_fixed": "", // paraData.fixed,

      "@p_pc": paraData.pc,
    },
  };

  //조회
  useEffect(() => {
    if (workType === "U") {
      fetchMain();
    }
  }, []);

  //저장
  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
  }, [paraData]);

  //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [initialVal]);

  //fetch된 그리드 데이터가 그리드 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [detailDataResult]);

  //요약정보 & 상세정보 조회
  const fetchMain = async () => {
    let data: any;

    try {
      data = await processApi<any>("platform-procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowsCnt = data.tables[0].Rows.length;
      let rows = data.tables[0].Rows;

      rows = rows.map((row: any) => {
        return {
          ...row,
          srcPgName: "USER_OPTIONS_DEFAULT_WINDOW",
        };
      });

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowsCnt,
        };
      });

      const row = data.tables[0].Rows[0];
      const { option_id, option_name } = row;

      setInitialVal((prev) => {
        return {
          ...prev,
          option_id,
          option_name,
        };
      });
    }
  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("platform-procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("저장이 완료되었습니다.");
      if (workType === "U") {
        fetchMain();
        reloadData();
      } else {
        getVisible(false);
        reloadData();
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    //alert(JSON.stringify(dataItem));

    let valid = true;

    console.log("dataItem");
    console.log(dataItem);
    //검증
    try {
      dataItem.orderDetails.forEach((item: any) => {
        if (!item.default_id) {
          throw "필드명을 입력하세요.";
        }
        if (!item.value_type) {
          throw "VALUE타입을 선택하세요.";
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const { option_id, option_name, orderDetails } = dataItem;

    let detailArr: TDetailData = {
      row_status: [],

      default_id: [],
      caption: [],
      word_id: [],
      sort_order: [],
      value_type: [],
      value: [],
      bc_id: [],
      where_query: [],
      add_year: [],
      add_month: [],
      add_day: [],
      session_item: [],
      user_editable: [],
    };

    orderDetails.forEach((item: any, idx: number) => {
      const {
        rowstatus,
        default_id, // field_name
        caption,
        word_id,
        value_type, //
        value, //
        bc_id,
        where_query,
        add_year, //
        add_month, //
        add_day, //
        session_item,
        user_editable,
      } = item;

      detailArr.row_status.push(rowstatus);
      detailArr.default_id.push(default_id);
      detailArr.caption.push(caption);
      detailArr.word_id.push(word_id);
      detailArr.sort_order.push(String(idx));
      detailArr.value_type.push(value_type);
      detailArr.value.push(value);
      detailArr.bc_id.push(bc_id);
      detailArr.where_query.push(where_query);
      detailArr.add_year.push(add_year);
      detailArr.add_month.push(add_month);
      detailArr.add_day.push(add_day);
      detailArr.session_item.push(session_item);
      detailArr.user_editable.push(user_editable);
    });

    deletedRows.forEach((item: any, idx: number) => {
      const {
        default_id, // field_name
        caption,
        word_id,
        value_type, //
        value, //
        bc_id,
        where_query,
        add_year, //
        add_month, //
        add_day, //
        session_item,
        user_editable,
      } = item;

      detailArr.row_status.push("D");
      detailArr.default_id.push(default_id);
      detailArr.caption.push(caption);
      detailArr.word_id.push(word_id);
      detailArr.sort_order.push(String(idx));
      detailArr.value_type.push(value_type);
      detailArr.value.push(value);
      detailArr.bc_id.push(bc_id);
      detailArr.where_query.push(where_query);
      detailArr.add_year.push(add_year);
      detailArr.add_month.push(add_month);
      detailArr.add_day.push(add_day);
      detailArr.session_item.push(session_item);
      detailArr.user_editable.push(user_editable);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: workType,

      option_id,
      option_name,

      row_status: detailArr.row_status.join("|"),
      default_id: detailArr.default_id.join("|"),
      caption: detailArr.caption.join("|"),
      word_id: detailArr.word_id.join("|"),
      sort_order: detailArr.sort_order.join("|"),
      value_type: detailArr.value_type.join("|"),
      value: detailArr.value.join("|"),
      bc_id: detailArr.bc_id.join("|"),
      where_query: detailArr.where_query.join("|"),
      add_year: detailArr.add_year.join("|"),
      add_month: detailArr.add_month.join("|"),
      add_day: detailArr.add_day.join("|"),
      session_item: detailArr.session_item.join("|"),
      user_editable: detailArr.user_editable.join("|"),
    }));
  };

  return (
    <Window
      title={
        workType === "N"
          ? "사용자 옵션 기본값 생성 (관리자)"
          : "사용자 옵션 기본값 수정 (관리자)"
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
          option_id: initialVal.option_id,
          option_name: initialVal.option_name,
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
                  label={"타입ID"}
                  name={"option_id"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                />
                <Field
                  label={"설명"}
                  name={"option_name"}
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
                <Button type={"submit"} themeColor={"primary"} icon="save">
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
