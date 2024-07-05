import { FilterMatchMode } from "primereact/api";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import React, { useEffect } from "react";
import { numberWithCommas3 } from "../../CommonFunction";
import { PAGE_SIZE } from "../../CommonString";

const PaginatorTable = (props) => {
  const [filters, setFilters] = React.useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [globalFilterValue, setGlobalFilterValue] = React.useState("");

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <span className="text-xl text-900 font-bold">{props.title}</span>
    </div>
  );

  const numberTemplate = (rowData, option) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <span>{numberWithCommas3(rowData[option.field])}</span>
      </div>
    );
  };

  function colums() {
    var keys = Object.keys(props.column);
    var values = Object.values(props.column);
    let array = [];
    for (var i = 0; i < keys.length; i++) {
      if (props.numberCell != undefined) {
        if (props.numberCell.includes(keys[i])) {
          array.push(
            <Column
              field={keys[i]}
              header={values[[i]]}
              style={{ minWidth: props.width[i] }}
              body={numberTemplate}
              sortable
            ></Column>
          );
        } else {
          array.push(
            <Column
              field={keys[i]}
              header={values[[i]]}
              style={{ minWidth: props.width[i] }}
              sortable
            ></Column>
          );
        }
      } else {
        array.push(
          <Column
            field={keys[i]}
            header={values[[i]]}
            style={{ minWidth: props.width[i] }}
            sortable
          ></Column>
        );
      }
    }
    return array;
  }

  function custom(key) {
    if (props.customCell != undefined) {
      for (var i = 0; i < props.customCell.length; i++) {
        if (key == props.customCell[i][0]) {
          return props.customCell[i][1];
        }
      }
    } else {
      return undefined;
    }
  }

  useEffect(() => {}, [props]);

  return (
    <>
      <div>
        <DataTable
          value={props.value}
          showGridlines
          header={props.header == false ? undefined : header}
          tableStyle={{ minWidth: "20rem" }}
          stripedRows
          paginator
          scrollable
          scrollHeight={props.height == undefined ? "100%" : props.height}
          rows={PAGE_SIZE}
          selectionMode="single"
          dataKey={props.key}
          emptyMessage="No DATA."
          selection={props.selection}
          onSelectionChange={props.onSelectionChange}
          onDoubleClick={props.onDoubleClick}
        >
          {colums()}
        </DataTable>
      </div>
    </>
  );
};

export default PaginatorTable;
