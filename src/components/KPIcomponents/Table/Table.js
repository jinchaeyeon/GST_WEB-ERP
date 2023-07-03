import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Title from "../Title/Title";

const Table = (props) => {
  const header = <Title title={props.title}/>;

  function colums () {
    var keys = Object.keys(props.column);
    var values = Object.values(props.column);
    let array = [];

    for(var i =0; i<keys.length; i++) {
        array.push(
          <Column field={keys[i]} header={values[[i]]} sortable></Column>
        )
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
          sortField={props.sortkey}
          sortOrder={-1}
          stripedRows
          emptyMessage="No DATA."
        >     
            {colums()}
        </DataTable>
      </div>
    </>
  );
};

export default Table;
