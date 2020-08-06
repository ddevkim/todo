import {limitInputText} from "./utils.js";
import {addData, designateID, removeData, updateData} from "./data_handling.js";
import {animateFilterBoxPosition, animateHide, animateShow, animateToggleOpacity, hoverShowAndHide} from "./animation.js";
import {addList} from "./html_template.js";

export function eventHandler($main_el, data, db_table) {
  const $register_item = $main_el.find("#register_item");
  const $content = $main_el.find("section#content");
  const $indicator_bar = $main_el.find("section#indicator_bar");
  const $left_items_counter = $main_el.find("#left_items_counter");
  const $clear_btn = $indicator_bar.find("#clear_btn");
  const $item_filter = $indicator_bar.find("#item_filter");
  $register_item
    .on("keydown", "#item_input", (e) => {
      const input_text = e.currentTarget.value;
      limitInputText(e, input_text, 430);
      if (input_text && e.keyCode === 13) {
        addList($content, designateID(data[db_table]), input_text, false, () =>{
          animateShow($content.find(".item_list"), 300)
        }
        );
        addData(data[db_table], designateID(data[db_table]), { item_text: input_text, is_completed: false });
        statusUpdate($main_el);
        e.currentTarget.value = "";
      }
    })
    .on("click", "#complete_all_btn", (e) => {
      const $ct = $(e.currentTarget);
      const $completed_items = $content.find(".completed");
      const $not_completed_items = $content.find(".item_list").not(".completed");
      $ct.toggleClass("all_completed").hasClass("all_completed")
        ? each((item) => {
          item.classList.add("completed");
          updateData(data[db_table], Number($(item).attr("data-id")), {
            is_completed: true,
          });
        }, $not_completed_items)
        : each((item) => {
          item.classList.remove("completed");
          updateData(data[db_table], Number($(item).attr("data-id")), {
            is_completed: false,
          });
        }, $completed_items);
      statusUpdate($main_el);
    });

  $content
    .on("click", ".delete_btn", (e) => {
      const $delete_item = $(e.currentTarget).closest(".item_list");
      if ($delete_item.hasClass("completed") || confirm("완료하고 지우시길 권장합니다.")) {
        animateHide($delete_item, 500, () => {
          $delete_item.remove();
          data[db_table] = removeData(data[db_table], { id: Number($delete_item.attr("data-id")) });
          statusUpdate($main_el);
        });
      }
    })
    .on("click", ".complete_checkbox, .item_text", (e) => {
      const $checked_item = $(e.currentTarget).closest(".item_list");
      $checked_item.toggleClass("completed");
      updateData(data[db_table], $checked_item.attr("data-id"), {
        is_completed: $checked_item.hasClass("completed"),
      });
      statusUpdate($main_el);
    });

  $item_filter.on("click", "input:button", (e) => {
    const $ct = $(e.currentTarget);
    const filter_category = $ct.val();
    const $els_completed = $content.find(".completed");
    const $els_not_completed = $content.find(".item_list").not(".completed");
    $ct.parent().attr("filter_category", filter_category);
    switch (filter_category) {
      case "All": {
        animateShow($content.find(".item_list"), 500);
        animateFilterBoxPosition($item_filter.find("#filter_box"), 247, 38);
        break;
      }
      case "Active": {
        animateHide($els_completed, 0, () => $els_completed.css("display", "none"));
        animateHide($els_not_completed, 0);
        animateShow($els_not_completed, 800);
        animateFilterBoxPosition($item_filter.find("#filter_box"), 290, 67);
        break;
      }
      case "Completed": {
        animateHide($els_not_completed, 0, () => $els_not_completed.css("display", "none"));
        animateHide($els_completed, 0);
        animateShow($els_completed, 800);
        animateFilterBoxPosition($item_filter.find("#filter_box"), 362, 115);
        break;
      }
    }
  });
  $clear_btn.on("click", () => {
    const $els_completed = $content.find(".completed");
    animateHide($content.find(".completed"), 800, () => {
      $content.find(".completed").remove();
      statusUpdate($main_el, false);
    });
    _.each(
      (item) => (data[db_table] = removeData(data[db_table], { id: Number($(item).attr("data-id")) })),
      $els_completed
    );
  });
  hoverShowAndHide($left_items_counter, $content.find(".completed"), 0.3, 300);
}
export function statusUpdate($main_el, doFilter = true) {
  const $content = $main_el.find("section#content");
  const $complete_all_btn = $main_el.find("#complete_all_btn");
  const $left_items_counter = $main_el.find("#left_items_counter");
  const $indicator_bar = $main_el.find("section#indicator_bar");
  const $item_filter = $indicator_bar.find("#item_filter");
  const $clear_btn = $indicator_bar.find("#clear_btn");
  const total_num = $content.find(".item_list").length;
  const complete_num = $content.find(".completed").length;
  const left_num = total_num - complete_num;
  const filter_category = $item_filter.attr("filter_category");
  if (left_num < 1) {
    $left_items_counter.text("All Done!").css("color", "#248d4c");
    $complete_all_btn.addClass("all_completed")
  } else {
    $left_items_counter.css("color", "#757575");
    $complete_all_btn.removeClass("all_completed")
    if (left_num < 2) {
      $left_items_counter.text(left_num + " item left");
    } else {
      $left_items_counter.text(left_num + " items left");
    }
  }
  doFilter && $item_filter.find(`input[value=${filter_category}]`).trigger("click");
  animateToggleOpacity($indicator_bar, !!total_num, 300, 1000);
  animateToggleOpacity($clear_btn, !!complete_num, 500, 500);
  animateToggleOpacity($complete_all_btn, !!total_num, 500, 500);
}
