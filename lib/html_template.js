import { animateShow } from "./animation.js";
import { statusUpdate } from "./eventHandler.js";

export function initialScreenUpdate($main, data, db_table) {
  const $content = $main.find("section#content");
  map(({ id, item_text, is_completed }) => {
    addList($content, id, item_text, is_completed, () =>
      animateShow($main.find(".item_list"), 500)
    );
  }, data[db_table]);
  statusUpdate($main);
}
export function addMessage($content, message) {
  $content.prepend(`
  <div class="message">
      <span class="item_text">${message}</span>
  </div>
  `);
}

export function addList($content, id, todo_item_text, is_completed, cb) {
  $content.append(`
    <div class="${is_completed ? "item_list completed" : "item_list"}" data-id=${id}>
       <div class="inner_checkbox">${checkboxSVG()}
         <span class="item_text">${todo_item_text}</span>
      </div>
       <svg class="delete_btn" viewBox="0 0 100 100">
        <circle class="circle_line" cx="50" cy="50" r="41.5"/>
        <polyline class="x_line" points="28.24,28.24 50,50 71.76,71.76 "/>
        <polyline class="x_line" points="71.76,28.24 50,50 28.24,71.76 "/>
      </svg>
    </div>`);
  cb();
}

function checkboxSVG() {
  return `
    <svg class="complete_checkbox" viewBox="0 0 100 100">
      <path class="box_line" d="M75.44,9.56H24.56c-8.28,0-15,6.72-15,15v50.89c0,8.28,6.72,15,15,15h50.89c8.28,0,15-6.72,15-15V24.56
      C90.44,16.27,83.73,9.56,75.44,9.56z"/>
      <polyline class="check_line" points="22.44,52.61 42.96,70.09 74.35,34.33 "/>
    </svg>`;
}
