//한번에 조회할 데이터 수 디폴트 값
export const pageSize = 10;

export const commonCodeDefaultValue = { sub_code: "", code_name: "" };

export const finynRadioButtonData = [
  {
    value: "Y",
    label: "Y",
  },
  {
    value: "N",
    label: "N",
  },
  {
    value: "%",
    label: "전체",
  },
];

export const useynRadioButtonData = [
  {
    value: "Y",
    label: "Y",
  },
  {
    value: "N",
    label: "N",
  },
  {
    value: "%",
    label: "전체",
  },
];
export const zeroynRadioButtonData = [
  {
    value: "Y",
    label: "0만",
  },
  {
    value: "N",
    label: "0 제외",
  },
  {
    value: "B",
    label: "안전재고 미만",
  },
  {
    value: "%",
    label: "전체",
  },
];
export const locationQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA002' AND system_yn = 'Y'";

export const doexdivQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA005' AND system_yn = 'Y'";

export const ordstsQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'SA002' AND system_yn = 'Y'";

export const ordtypeQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA007' AND system_yn = 'Y'";

export const departmentsQuery =
  "SELECT dptcd sub_code, dptnm code_name FROM BA040T WHERE useyn = 'Y'";

export const usersQuery =
  "SELECT user_id sub_code, user_name code_name FROM sysUserMaster WHERE rtrchk <> 'Y' AND hold_check_yn <> 'Y'";

export const taxdivQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA029' AND system_yn = 'Y'";

export const itemacntQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA061' AND system_yn = 'Y'";

export const qtyunitQuery =
  "SELECT CAST(sub_code as varchar) as sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA015' AND use_yn='Y' ORDER BY (case when use_yn='Y' then 'Y' else 'N' END),sort_seq,sub_code,code_name";

export const amtunitQuery =
  "SELECT convert(varchar(5), sub_code) as sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA020' AND use_yn='Y' ORDER BY (case when use_yn='Y' then 'Y' else 'N' END),sort_seq,sub_code,code_name";

export const itemlvl1Query =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA171' AND use_yn  = 'Y'";

export const itemlvl2Query =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA172' AND use_yn  = 'Y'";

export const itemlvl3Query =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA173' AND use_yn  = 'Y'";

export const itemgradeQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA130' AND use_yn  = 'Y'";

export const custdivQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA026' AND use_yn  = 'Y'";

//공정
export const proccdQuery =
  "SELECT convert(varchar(20), sub_code) as sub_code, code_name  FROM comCodeMaster where group_code = 'PR010' AND use_yn='Y' ORDER BY (case when use_yn='Y' then 'Y' else 'N' END), len(sub_code), sub_code";

//외주구분
export const outprocynQuery =
  "SELECT convert(varchar(20), sub_code) as sub_code, code_name,  extra_field1 FROM comCodeMaster WHERE group_code = 'BA011' AND use_yn='Y' ORDER BY (case when use_yn='Y' then 'Y' else 'N' END),sort_seq,sub_code,code_name";

//설비
export const prodmacQuery =
  //"SELECT  fxcode sub_code, fxnum + (case when fxnm = '' then '' else ' / ' end) + fxnm as code_name,  fxno FROM fx100t WHERE 1 = 1   AND useyn = 'Y' ORDER BY (CASE WHEN useyn = 'Y' THEN 'Y' ELSE 'N' END) desc, code_name, sub_code , fxno";
  "SELECT  fxcode sub_code, fxnum + (case when fxnm = '' then '' else ' / ' end) + fxnm as code_name,   fxno,  fxdiv,  ISNULL(b.user_name,'') as person,  (CASE WHEN useyn = 'Y' THEN '사용' ELSE '미사용' END) as useyn,  dptcd  FROM fx100t LEFT OUTER JOIN (SELECT orgdiv, user_id, user_name FROM sysUserMaster) b ON fx100t.orgdiv = b.orgdiv AND fx100t.person = b.user_id WHERE 1 = 1   AND useyn = 'Y' ORDER BY (CASE WHEN useyn = 'Y' THEN 'Y' ELSE 'N' END) desc, code_name, fxcode , fxno";

//자재사용구분
export const outgbQuery =
  "SELECT convert(varchar(5), sub_code) as sub_code,  code_name FROM comCodeMaster WHERE group_code = 'BA041'  AND use_yn='Y' ORDER BY (case when use_yn='Y' then 'Y' else 'N' END),sort_seq,sub_code,code_name";

//발주형태(발주유형)
export const purtypeQuery =
  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'MA003'  AND use_yn='Y'  ORDER BY (case when use_yn='Y' then 'Y' else 'N' END),sort_seq,sub_code,code_name";
