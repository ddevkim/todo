export function designateID(data) {
  return data.length
    ? go(
        data,
        map((item) => item["id"]),
        reduce((acc, v) => Math.max(acc, v)),
        (x) => x + 1
      )
    : 1;
}

export function addData(data, id, content) {
  return data.push(extend({ id: id }, content));
}
export function getCurrentUser() {
  const current_user_data = JSON.parse(sessionStorage.getItem("todo_user"));
  return current_user_data && current_user_data.user_id;
}

export async function encryptPassword(password) {
  const password_buffer = new TextEncoder().encode(password);
  const hash_buffer = await crypto.subtle.digest("SHA-256", password_buffer);
  const hash_arr = Array.from(new Uint8Array(hash_buffer));
  return hash_arr.map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function removeData(data, kv) {
  return go(
    data,
    filter(
      (item) =>
        !go(
          entries(kv),
          map(([k, v]) => {
            return item[k] === v;
          }),
          some((x) => x === true)
        )
    )
  );
}

export function updateData(data, id, content) {
  return go(
    data,
    each((item) => {
      if (item.id === Number(id)) {
        each(([k, v]) => (item[k] = v), entries(content));
      }
    })
  );
}
