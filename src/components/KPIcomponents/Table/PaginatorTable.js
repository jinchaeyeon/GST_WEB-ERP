import React, { useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
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
      {props.filters != false ? (
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
      ) : (
        ""
      )}
    </div>
  );

  function colums() {
    var keys = Object.keys(props.column);
    var values = Object.values(props.column);
    let array = [];

    for (var i = 0; i < keys.length; i++) {
      array.push(
        <Column
          field={keys[i]}
          header={values[[i]]}
          style={{ minWidth: props.width[i] }}
          sortable
          body={custom(keys[i])}
        ></Column>
      );
    }
    return array;
  }

  function custom(key) {
    if(props.customCell != undefined) {
      for(var i = 0; i< props.customCell.length; i++) {
        if(key == props.customCell[i][0]) {
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
      <div className="card">
        <DataTable
          value={props.value}
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
        >
          {colums()}
        </DataTable>
      </div>
    </>
  );
};

export default PaginatorTable;
