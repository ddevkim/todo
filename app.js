import { getDBTableData } from "./lib/DB_handling.js";
import { eventHandler } from "./lib/eventHandler.js";
import { accountWindowControl } from "./lib/animation.js";
import { getCurrentUser } from "./lib/data_handling.js";
import {initialScreenUpdate} from "./lib/eventHandler.js";
Object.entries(_).map(([k, v]) => (window[k] = v));

$(document).ready(() => {
  const current_user = getCurrentUser();
  let item_list_data = {};
  if (!current_user) {
    accountWindowControl(true, true, false);
  }
  else {
    item_list_data = getDBTableData(`todo_items_${current_user}`)|| {};
    initialScreenUpdate(item_list_data["item_list"], current_user );
  }
  eventHandler(item_list_data);
});
