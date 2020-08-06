export function getDBTableData(table_name, kv) {
  const data = JSON.parse(localStorage.getItem(table_name));
  return kv
    ? go(
        data,
        filter((item) =>
          go(
            L.entries(kv),
            L.map(([k, v]) => item[k] === v),
            some((x) => x === true)
          )
        )
      )
    : data;
}

export function updateDBTable(db_table, data) {
  (window.onbeforeunload = () => {
      localStorage.removeItem(db_table[db_table]);
      localStorage.setItem(db_table, JSON.stringify(data[db_table]));
  })();
}
