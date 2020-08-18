import {
  createTables,
  readData,
  getSessionUserID,
} from "./lib/DB_handling.js";
import { eventHandlers } from "./lib/eventHandlers.js";
import { accountWindowControl } from "./lib/animation.js";
import { readTodoItems } from "./lib/eventHandlers.js";

$(document).ready(async () => {
  const DB_accounts = "todo_user_accounts";
  const DB_items = "todo_user_items";
  const user_id = getSessionUserID();
  //DB 테이블 생성
  createTables([DB_accounts, DB_items]);
  //이벤트 등록
  eventHandlers();
  //계정 접속창 제어
  accountWindowControl(!user_id, readData(DB_accounts).length);
  //_todo 아이템 불러오기
  readTodoItems(user_id);
});
