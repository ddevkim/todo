import { getDBTableData, updateDBTable } from "./lib/DB_handling.js";
import { eventHandler } from "./lib/eventHandler.js";
import { initialScreenUpdate } from "./lib/html_template.js";
import {accountWindowControl} from "./lib/animation.js";
Object.entries(_).map(([k, v]) => (window[k] = v));

$(document).ready(() => {
  accountWindowControl(true, true, false);
  const db_table = "todo_item_list";
  const data = { [db_table]: getDBTableData(db_table) || [] };
  const $main = $("#todo_window");
  initialScreenUpdate($main, data, db_table);
  eventHandler($main, data, db_table);
  window.onbeforeunload = () => {
    updateDBTable(db_table, data);
  };
});
