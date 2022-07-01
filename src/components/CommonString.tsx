//한번에 조회할 데이터 수 디폴트 값
export const pageSize = 10;

export const commonCodeDefaultValue = { sub_code: "", code_name: "" };

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
