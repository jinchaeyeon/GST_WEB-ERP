import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { numberWithCommas3 } from "../../CommonFunction";

const PaginatorTable = (props) => {
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

  return (
    <>
      <div className="card">
        <DataTable
          value={props.value}
          showGridlines
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
