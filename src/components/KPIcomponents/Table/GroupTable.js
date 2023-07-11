import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';

const PaginatorTable = (props) => {
  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <span className="text-xl text-900 font-bold">{props.title}</span>
    </div>
  );

  const headerTemplate = (data) => {
    return (
        <div className="flex align-items-center gap-2">
            <img alt={data.representative.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${data.representative.image}`} width="32" />
            <span className="font-bold">{data.representative.name}</span>
        </div>
    );
};

  function colums() {
    var keys = Object.keys(props.column);
    var values = Object.values(props.column);
    let array = [];
    for (var i = 0; i < keys.length; i++) {
      array.push(
        <Column field={keys[i]} header={values[[i]]} style={{ minWidth: props.width[i]}} sortable></Column>
      );
    }
    return array;
  }

  return (
    <>
      <div className="card">
        <DataTable
          value={props.value}
          header={header}
          tableStyle={{ minWidth: "20rem" }}
          dataKey={props.key}
          emptyMessage="No DATA."
          selection={props.selection}
          onSelectionChange={props.onSelectionChange}
          selectionMode="single"
          rowGroupMode="rowspan"
          groupRowsBy="code_name"
          scrollable 
          scrollHeight="400px"
          virtualScrollerOptions={{ itemSize: 46 }}
        >
          {colums()}
        </DataTable>
      </div>
    </>
  );
};

export default PaginatorTable;
