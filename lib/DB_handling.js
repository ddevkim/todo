const {
  go,
  each,
  filter,
  map,
  some,
  entries,
  reduce,
  all,
  take1,
  sel,
  head,
  keys,
  append,
  tap,
  extend,
} = _;

export async function encryptPassword(password) {
  return go(
    new TextEncoder().encode(password),
    async (buffer) => await crypto.subtle.digest("SHA-256", buffer),
    (hash_buffer) => Array.from(new Uint8Array(hash_buffer)),
    (hash_arr) =>
      hash_arr.map((x) => x.toString(16).padStart(2, "0")).join("")
  );
}

export function getSessionUserID() {
  return sel("user_id", JSON.parse(sessionStorage.getItem("todo_user")));
}

export function readData(table_name, selector, key) {
  return go(
    getItemFromLS(table_name),
    (data) =>
      !selector
        ? data
        : go(
            data,
            filter((item) =>
              some(([k, v]) => item[k] === v, entries(selector))
            )
          ),
    (selected_rows) =>
      !key
        ? selected_rows
        : go(selected_rows, take1, map(sel(key)), head)
  );
}

export function readDataGroupBy(table_name) {
  const data = JSON.parse(localStorage.getItem(table_name));
  const columns = go(data, head, keys);
  return reduce(
    (acc, a) => {
      go(
        columns,
        map((column) => {
          if (!acc[column]) acc[column] = [];
          acc[column].push(a[column]);
        })
      );
      return acc;
    },
    {},
    data
  );
}

export function appendData(table_name, row_data) {
  const data_appended = extend({ id: getRowID(table_name) }, row_data);
  go(
    getItemFromLS(table_name),
    append(data_appended),
    JSON.stringify,
    (data) => localStorage.setItem(table_name, data)
  );
  return data_appended;
}

export function deleteData(table_name, selector) {
  go(
    getItemFromLS(table_name),
    filter(
      (obj) =>
        !go(
          entries(selector),
          some(([k, v]) => obj[k] === v)
        )
    ),
    JSON.stringify,
    (updated_data) => localStorage.setItem(table_name, updated_data)
  );
}

export function updateData(table_name, selector, change_obj) {
  go(
    getItemFromLS(table_name),
    map((obj) => {
      if (
        go(
          entries(selector),
          map(([k, v]) => obj[k] === v),
          all
        )
      ) {
        go(
          entries(change_obj),
          map(([k, v]) => (obj[k] = v))
        );
        return obj;
      } else {
        return obj;
      }
    }),
    JSON.stringify,
    (updated_data) => localStorage.setItem(table_name, updated_data)
  );
}

export function createTables(table_names) {
  go(
    table_names,
    each((table_name) => {
      if (!localStorage.getItem(table_name)) {
        localStorage.setItem(table_name, "[]");
      }
    })
  );
  createRowManageTables(table_names);
}

function createRowManageTables(arr_table_names) {
  const row_id_table = "row_id_table";
  const row_id_table_data =
    localStorage.getItem(row_id_table) ||
    localStorage.setItem(row_id_table, "[]");
  if (!row_id_table_data) {
    go(
      arr_table_names,
      each((table_name) =>
        appendData(row_id_table, { table: table_name, row: 0 })
      )
    );
  } else {
    const exist_tables = map((row) => row["table"], row_id_table_data);
    const new_tables = go(
      arr_table_names,
      filter(
        (table) =>
          !go(
            exist_tables,
            map((exist_table) => table === exist_table),
            some
          )
      )
    );
    go(
      new_tables,
      each((table) => appendData(row_id_table, { table: table, row: 0 }))
    );
  }
}

export function getRowID(table_name) {
  const row_id_table = "row_id_table";
  if (table_name === row_id_table) {
    return ++readData(row_id_table).length;
  } else {
    return go(
      readData(row_id_table, { table: table_name }, "row"),
      Number,
      (x) => x + 1,
      tap((row_id) =>
        updateData(row_id_table, { table: table_name }, { row: row_id })
      )
    );
  }
}

function getItemFromLS(table_name) {
  return go(localStorage.getItem(table_name) || "[]", JSON.parse);
}
