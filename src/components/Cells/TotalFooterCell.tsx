import React, { useCallback, useEffect, useState } from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { totalDataNumber } from "../../store/atoms";
import { GridFooterCellProps } from "@progress/kendo-react-grid";

const TotalFooterCell = (props: GridFooterCellProps) => {
  const totalNum = useRecoilValue(totalDataNumber);

  return (
    <td colSpan={props.colSpan} style={props.style}>
      총 {totalNum}건
    </td>
  );
};

export default TotalFooterCell;
