import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { numberWithCommas3 } from "../../CommonFunction";
import Title from "../Title/Title";

const ScrollTable = (props) => {
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
    let array = [];

    for (var i = 0; i < props.column.length; i++) {
      if (props.numberCell != undefined) {
        if (props.numberCell.includes(props.column[i])) {
          array.push(
            <Column
              field={props.column[i]}
              header={props.column[i]}
              style={{ minWidth: props.width[i] }}
              body={numberTemplate}
              sortable
            ></Column>
          );
        } else {
          array.push(
            <Column
              field={props.column[i]}
              header={props.column[i]}
              style={{ minWidth: props.width[i] }}
              sortable
            ></Column>
          );
        }
      } else {
        array.push(
          <Column
            field={props.column[i]}
            header={props.column[i]}
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
          scrollable
          scrollHeight="400px"
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

export default ScrollTable;
