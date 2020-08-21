import {
  createTables,
  readData,
  readSessionData,
  setIndexing,
} from "./lib/DB_handling.js";
import { eventHandlers } from "./lib/eventHandlers.js";
import { accountWindowControl } from "./lib/animation.js";
import { readTodoItems } from "./lib/eventHandlers.js";

$(document).ready(async () => {
  const DB_accounts = "todo_accounts";
  const DB_items = "todo_items";
  const user_id = readSessionData("user_id");
  //DB 테이블 생성
  createTables([DB_accounts, DB_items]);
  setIndexing(DB_items, ["user_id", "item_text"]);
  eventHandlers();
  //계정 접속창 제어 (세션에 유저가 없는 경우 계정 접속창 띄우기)
  accountWindowControl(
    user_id === undefined,
    readData(DB_accounts).length
  );
  // 세션에 접속되어 있는 유저가 있는 경우 _todo 아이템 읽어오기
  user_id === undefined || readTodoItems(user_id);
});
