import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { numberWithCommas3 } from "../../CommonFunction";
import Title from "../Title/Title";

const Table = (props) => {
  const header = <Title title={props.title} />;

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

  return (
    <>
      <div className="card">
        <DataTable
          value={props.value}
          header={header}
          showGridlines
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
