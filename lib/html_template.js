import { animateShow } from "./animation.js";
import { statusUpdate } from "./eventHandlers.js";

export function addMessage($content, message) {
  $content.prepend(`
  <div class="message">
      <span class="item_text">${message}</span>
  </div>
  `);
}

export const todoTmpl = ({ id, user_id, item_text, is_completed }) => `
  <div class="${
    is_completed ? "todo_item completed" : "todo_item"
  }" data-id=${id} data-user_id="${user_id}">
     <div class="inner_checkbox">${checkboxSVG()}
       <span class="item_text">${item_text}</span>
    </div>
    ${xboxSVG()}
  </div>`;

export const append = ($parent) => (html) => $parent.append(html);

function checkboxSVG() {
  return `
    <svg class="complete_checkbox" viewBox="0 0 100 100">
      <path class="box_line" d="M75.44,9.56H24.56c-8.28,0-15,6.72-15,15v50.89c0,8.28,6.72,15,15,15h50.89c8.28,0,15-6.72,15-15V24.56
      C90.44,16.27,83.73,9.56,75.44,9.56z"/>
      <polyline class="check_line" points="22.44,52.61 42.96,70.09 74.35,34.33 "/>
    </svg>`;
}

function xboxSVG() {
  return `
     <svg class="delete_btn" viewBox="0 0 100 100">
      <circle class="circle_line" cx="50" cy="50" r="41.5"/>
      <polyline class="x_line" points="28.24,28.24 50,50 71.76,71.76 "/>
      <polyline class="x_line" points="71.76,28.24 50,50 28.24,71.76 "/>
    </svg>
  `;
}
