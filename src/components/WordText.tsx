import React from "react";

// * 컨트롤명 규칙
// - 라벨 (일반 텍스트) : lbl (ex. lblInsertdt)
// - 그리드 타이틀 : grtl (ex. grtlUndecideList)
const WordText = ({
  wordInfoData,
  controlName,
  altText,
}: {
  wordInfoData: any; // UseDesignInfo로 받아온 Data
  controlName: string; // 컨트롤명
  altText?: string; // 컨트롤 데이터 미등록 시 보여줄 기본값 텍스트
}) => {
  if (wordInfoData === null) {
    return <span data-control-name={controlName}>{altText ?? ""}</span>;
  }
  const wordData = wordInfoData.find(
    (item: any) => item.controlName === controlName,
  );

  return (
    <span data-control-name={controlName}>
      {wordData ? wordData.wordText : altText ?? ""}
    </span>
  );
};

export default WordText;
