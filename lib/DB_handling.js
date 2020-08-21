const {
  go,
  each,
  filter,
  map,
  some,
  entries,
  reduce,
  all,
  sel,
  head,
  keys,
  append,
  tap,
  extend,
  flatten,
} = _;
//패스워드 hash 암호화
export async function encryptPassword(password) {
  return go(
    new TextEncoder().encode(password),
    async (buffer) => await crypto.subtle.digest("SHA-256", buffer),
    (hash_buffer) => Array.from(new Uint8Array(hash_buffer)),
    (hash_arr) =>
      hash_arr.map((x) => x.toString(16).padStart(2, "0")).join("")
  );
}
//세션 데이터 다루기
export function readSessionData(key) {
  return sel(key, JSON.parse(sessionStorage.getItem("todo_user")));
}
export function createSessionData(table, data) {
  sessionStorage.setItem(table, JSON.stringify(data));
  return data;
}
export function deleteSessionData(table) {
  sessionStorage.removeItem(table);
}
/*데이터 불러오기*/
export function readData(table, selector, key) {
  //셀렉터 없이 테이블 호출하는 경우 모든 데이터 읽기
  if (!selector) {
    return go(getTable(table), (data) =>
      !key ? data : map(sel(key), data)
    );
  } else {
    //셀렉터가 존재하는 경우
    const [sel_k, sel_v] = head(entries(selector));
    return go(
      //호출하는 테이블이 해당 셀렉터로 인덱싱이 되어 있는지 확인
      isTableIndexed(table, sel_k)
        ? //인덱싱이 되어 있는 경우 => 인덱싱 테이블에서 키로 찾아서 바로 가져오기
          go(getTable(table, true, sel_k), sel(sel_v.toString())) || []
        : //인덱싱이 되어 있지 않은 경우 => 전체 테이블에서 필터링 해서 가져오기
          go(
            getTable(table),
            filter((item) =>
              some(([k, v]) => item[k] === v, entries(selector))
            )
          ),
      //찾는 데이터의 키 값이 있으면 해당 키의 데이터만 추출
      (data) => (!key ? data : map(sel(key), data))
    );
  }
}

/*데이터 추가하기*/
export function appendData(table, data) {
  return go(
    //데이터에 해당 테이블의 순차 row id부여
    appendIDtoData(table, data),
    tap((append_data) => {
      //로컬스토리지에 데이터 추가
      appendLocalStorage(table, append_data);
      //해당 테이블에 인덱싱이 활성화 되어 있는 경우 인덱스 테이블에도 데이터 추가
      appendIndexData(table, append_data);
    })
  );
}
//데이터에 해당 테이블의 row id를 자동으로 부여
function appendIDtoData(table, data) {
  //데이터 관리 테이블 (@로 시작하는 테이블 이름) 들은 데이터에 id를 붙이지 않음.
  return /^@/g.exec(table)
    ? data
    : extend({ id: getRowID(table) }, data);
}

function appendLocalStorage(table_name, append_data) {
  go(getTable(table_name), append(append_data), JSON.stringify, (data) =>
    localStorage.setItem(table_name, data)
  );
}

export function deleteData(table_name, selector) {
  let delete_data = [];
  go(
    getTable(table_name),
    filter((obj) => {
      if (
        go(
          entries(selector),
          some(([k, v]) => obj[k] === v)
        )
      ) {
        delete_data.push(obj);
        return false;
      } else {
        return true;
      }
    }),
    JSON.stringify,
    (updated_data) => localStorage.setItem(table_name, updated_data)
  );
  deleteIndexData(table_name, delete_data);
  return delete_data;
}

export function updateData(table_name, selector, change_obj) {
  let update_data = [];
  const data = go(
    getTable(table_name),
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
        update_data.push(obj);
      }
      return obj;
    }),
    JSON.stringify
  );
  localStorage.setItem(table_name, data);
  updateIndexData(table_name, update_data);
  return data;
}

function deleteIndexData(table_name, delete_data) {
  const index_arr = getIndexKeys(table_name);
  index_arr &&
    go(
      index_arr,
      each((index_key) => {
        const index_table = `@index_${table_name}_${index_key}`;
        go(
          readData(index_table),
          (index_table_data) => {
            go(
              delete_data,
              each((delete_row) => {
                const idx_v = delete_row[index_key];
                index_table_data[idx_v] = go(
                  index_table_data[idx_v],
                  filter((obj) => obj["id"] !== delete_row["id"])
                );
                index_table_data[idx_v].length === 0 &&
                  delete index_table_data[idx_v];
              })
            );
            return index_table_data;
          },
          JSON.stringify,
          (data) => localStorage.setItem(index_table, data)
        );
      })
    );
}

function updateIndexData(table_name, update_data) {
  const index_arr = getIndexKeys(table_name);
  index_arr &&
    go(
      index_arr,
      each((index_key) => {
        const index_table = `@index_${table_name}_${index_key}`;
        go(
          readData(index_table),
          (index_table_data) => {
            go(
              update_data,
              each((update_row) => {
                const idx_v = update_row[index_key];
                index_table_data[idx_v] = go(
                  index_table_data[idx_v],
                  map((obj) => {
                    if (obj["id"] === Number(update_row["id"])) {
                      return update_row;
                    } else {
                      return obj;
                    }
                  })
                );
              })
            );
            return index_table_data;
          },
          JSON.stringify,
          (data) => localStorage.setItem(index_table, data)
        );
      })
    );
}

//인덱싱 테이블에 데이터 추가
function appendIndexData(table, append_data) {
  const index_arr = getIndexKeys(table);
  index_arr &&
    go(
      index_arr,
      each((index_key) => {
        const index_table = `@index_${table}_${index_key}`;
        go(
          readData(index_table),
          (data) => {
            const idx_v = append_data[index_key];
            if (data[idx_v] === undefined) data[idx_v] = [];
            data[idx_v].push(append_data);
            return data;
          },
          JSON.stringify,
          (data) => localStorage.setItem(index_table, data)
        );
      })
    );
}

function isTableIndexed(table_name, index_key) {
  return (
    !!index_key &&
    go(getIndexKeys(table_name), (keys) => keys.indexOf(index_key) >= 0)
  );
}

export function getIndexKeys(table_name) {
  return go(readData("@index_manager"), sel(table_name)) || [];
}

export function setIndexing(table, index_key_arr) {
  const index_manager = "@index_manager";
  const index_manager_data = JSON.parse(
    localStorage.getItem(index_manager) ||
      localStorage.setItem(index_manager, "{}") ||
      "{}"
  );
  go(
    index_manager_data,
    (obj) => {
      if (obj[table] === undefined) obj[table] = [];
      go(
        index_key_arr,
        each((index_key) => {
          if (obj[table].indexOf(index_key) < 0) {
            obj[table].push(index_key);
            localStorage.setItem(`@index_${table}_${index_key}`, "{}");
          }
        })
      );
      return obj;
    },
    JSON.stringify,
    (data) => localStorage.setItem(index_manager, data)
  );
}

// export function setIndexing(table_name, index_key_arr) {
//   const index_manager = "@index_manager";
//   const index_manager_data = JSON.parse(
//     localStorage.getItem(index_manager) ||
//       localStorage.setItem(index_manager, "[]") ||
//       "[]"
//   );
//   const is_exist_table = go(
//     index_manager_data,
//     map(keys),
//     flatten,
//     some((exist_table) => exist_table === table_name)
//   );
//   if (!is_exist_table) {
//     appendData(index_manager, { [table_name]: index_key_arr });
//     go(
//       index_key_arr,
//       each((index_key) =>
//         localStorage.setItem(`@index_${table_name}_${index_key}`, "{}")
//       )
//     );
//   } else {
//     go(
//       index_manager_data,
//       map((obj) => {
//         if (obj[table_name]) {
//           go(
//             index_key_arr,
//             each((index_key) => {
//               if (!some((x) => x === index_key, obj[table_name])) {
//                 obj[table_name].push(index_key);
//               }
//             })
//           );
//         }
//         return obj;
//       }),
//       JSON.stringify,
//       (updated_data) => localStorage.setItem(index_manager, updated_data)
//     );
//   }
// }

export function createTables(table_name_arr) {
  go(
    table_name_arr,
    each((table_name) => {
      if (!localStorage.getItem(table_name)) {
        localStorage.setItem(table_name, "[]");
      }
    })
  );
  createRowManager(table_name_arr);
}

function createRowManager(table_name_arr) {
  const row_manager = "@row_manager";
  const row_manager_data =
    localStorage.getItem(row_manager) ||
    localStorage.setItem(row_manager, "[]");
  if (!row_manager_data) {
    go(
      table_name_arr,
      each((table_name) => appendData(row_manager, { [table_name]: 0 }))
    );
  } else {
    const current_table_names = go(row_manager_data, map(keys), flatten);
    go(
      table_name_arr,
      filter(
        (input_table_name) =>
          !go(
            current_table_names,
            map(
              (current_table_name) =>
                input_table_name === current_table_name
            ),
            some
          )
      ),
      each((table) => appendData(row_manager, { [table]: 0 }))
    );
  }
}
export function getRowID(table_name) {
  const row_manager = "@row_manager";
  return go(
    getTable(row_manager),
    filter((obj) => obj[table_name] !== undefined),
    map(sel(table_name)),
    head,
    tap((row_id) => {
      updateData(
        row_manager,
        { [table_name]: row_id },
        { [table_name]: ++row_id }
      );
    })
  );
}
function getTable(table, is_indexed, index_key) {
  return go(
    localStorage.getItem(
      !is_indexed ? table : `@index_${table}_${index_key}`
    ) || "[]",
    JSON.parse
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
