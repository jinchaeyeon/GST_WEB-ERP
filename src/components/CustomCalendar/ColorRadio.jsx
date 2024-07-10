import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns";
import styles from "./ColorRadio.module.css";

const newColumn = [
  {
    field: "code_name",
    header: "종류",
    width: "150px",
  },
];

export default function ColorRadio({ code, handleCode, colorData, isTheme }) {
  const onChange = (event) => {
    handleCode(event.value);
  };
  const textField = "code_name";
  return (
    <div className={`${styles.box} ${isTheme && styles.theme}`}>
      {colorData
        .filter(
          (item) =>
            item.sub_code == "0" ||
            item.sub_code == "1" ||
            item.sub_code == "2" ||
            item.sub_code == "3" ||
            item.sub_code == "4"
        )
        .map((item) => {
          return (
            <>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className={`${styles.color} ${
                    code.sub_code == item.sub_code ? styles.selected : ""
                  }`}
                  style={{ marginRight: "8px", backgroundColor: item.color }}
                  onClick={() => handleCode(item)}
                />
                <p
                  style={{
                    marginRight: "8px",
                    display: "flex",
                    alignItems: "center",
                    fontFamily: "Noto Sans KR",
                    fontWeight: 700,
                  }}
                >
                  {item.code_name}
                </p>
              </div>
            </>
          );
        })}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          className={`${styles.color} ${
            code.sub_code != "0" &&
            code.sub_code != "1" &&
            code.sub_code != "2" &&
            code.sub_code != "3" &&
            code.sub_code != "4"
              ? styles.selected
              : ""
          }`}
          style={{ marginRight: "8px", backgroundColor: "gray" }}
          onClick={() =>
            handleCode(colorData.filter((item) => item.sub_code == "5")[0])
          }
        />
        <p
          style={{
            marginRight: "8px",
            display: "flex",
            alignItems: "center",
            fontFamily: "Noto Sans KR",
            fontWeight: 700,
          }}
        >
          그 외
        </p>

        {code.sub_code != "0" &&
        code.sub_code != "1" &&
        code.sub_code != "2" &&
        code.sub_code != "3" &&
        code.sub_code != "4" ? (
          <>
            <MultiColumnComboBox
              data={colorData.filter(
                (item) =>
                  item.sub_code != 0 &&
                  item.sub_code != 1 &&
                  item.sub_code != 2 &&
                  item.sub_code != 3 &&
                  item.sub_code != 4
              )}
              value={code}
              columns={newColumn}
              onChange={onChange}
              textField={textField}
              style={{
                width: "150px",
              }}
              clearButton={false}
            />
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
