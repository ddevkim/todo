export function getDBTableData(table_name, kv) {
  const data = JSON.parse(localStorage.getItem(table_name));
  return kv
    ? go(
        data,
        filter((item) =>
          go(
            L.entries(kv),
            some(([k, v]) => item[k] === v),
          )
        )
      )
    : data;
}

export function getDBByKey(db_table_name, key) {
  return map(obj => obj[key], JSON.parse(localStorage.getItem(db_table_name)))
}
export function updateDBTable(db_table_name, data) {
  localStorage.setItem(db_table_name, JSON.stringify(data));
}


export function appendDBTable(str_db_table_name, obj_append_data) {
  const table_data = JSON.parse(localStorage.getItem(str_db_table_name)) || [];
  table_data.push(obj_append_data);
  localStorage.setItem(str_db_table_name, JSON.stringify(table_data));
}