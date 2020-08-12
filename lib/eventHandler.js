import { limitInputText } from "./utils.js";
import { addData, designateID, removeData, updateData, getCurrentUser } from "./data_handling.js";
import {
  animateFilterBoxPosition,
  animateHide,
  animateShow,
  animateToggleOpacity,
  accountWindowControl,
  animateTextForMoment,
  animateColorForMoment,
  shakeElement,
  showAndHide
} from "./animation.js";
import { addList, addMessage } from "./html_template.js";
import { appendDBTable, getDBByKey, getDBTableData, updateDBTable } from "./DB_handling.js";

export function eventHandler(item_list_data) {
  const $todo_window = $("#todo_window");
  const $register_item = $todo_window.find("#register_item");
  const $content = $todo_window.find("section#content");
  const $indicator_bar = $todo_window.find("section#indicator_bar");
  const $left_items_counter = $todo_window.find("#left_items_counter");
  const $clear_btn = $indicator_bar.find("#clear_btn");
  const $item_filter = $indicator_bar.find("#item_filter");
  const $account = $("#account");
  const $account_control = $("#account_control");
  const $pw_check_label = $account.find("label[for='signup_user_pw_check'");
  let todo_items_data = item_list_data;
  let id_list = getDBByKey("user_accounts", "user_id");
  $account
    .on("click", "#login_btn", (e) => {
      const $login_user_id = $("#login_user_id");
      const $login_user_pw = $("#login_user_pw");
      const $error_message = $(e.currentTarget).prev();
      const $inputs = $account.find("#login_window input:not([type='button'])");
      const input_null_check = !every((input) => input.value, $inputs);
      id_list = getDBByKey("user_accounts", "user_id");
      if (input_null_check) {
        $inputs.each((idx, el) => {
          if (!$(el).val()) {
            const $el = $(el);
            animateColorForMoment($el, "#ff9494", 1000);
            shakeElement($el);
          }
        });
        animateTextForMoment($error_message, "fill in all entry fields", 600);
      } else {
        const is_id_exist = some((id) => id === $login_user_id.val(), id_list);
        if (!is_id_exist) {
          animateTextForMoment($error_message, "ID does not exist", 1000);
          animateColorForMoment($login_user_id, "#ffdb1b", 1000);
          shakeElement($login_user_id);
        } else {
          const user_account_data = getDBTableData("user_accounts", {
            user_id: $login_user_id.val(),
          })[0];
          if (user_account_data.user_pw !== $login_user_pw.val().toString()) {
            animateTextForMoment($error_message, "check your password again", 600);
            animateColorForMoment($login_user_pw, "#ffdb1b", 1000);
            shakeElement($login_user_pw);
          } else {
            sessionStorage.setItem("todo_user", JSON.stringify({ user_id: $login_user_id.val() }));
            const current_user = getCurrentUser();
            todo_items_data = getDBTableData(`todo_items_${current_user}`) || {};
            initialScreenUpdate(todo_items_data["item_list"], current_user);
            $account_control.find("#main_welcome").text(`Welcome, ${$login_user_id.val()}!`)
            $login_user_id.val("");
            $login_user_pw.val("");
            showAndHide($("#account_control .account_btn"), true);
            accountWindowControl(false, false, false);
          }
        }
      }
    })
    .on("keyup", "#signup_user_id", (e) => {
      const $ct = $(e.currentTarget);
      const is_id_exist = some((id) => id === $ct.val(), id_list);
      const $exist_message = $ct.parent().find("#id_exist_message");
      if (is_id_exist) {
        $exist_message.text("ID already exists");
      } else {
        $exist_message.text("");
      }
    })
    .on("click", "#signup_btn", (e) => {
      const $error_message = $(e.currentTarget).prev();
      const $signup_user_name = $account.find("#signup_user_id");
      const user_name = $signup_user_name.val();
      const $input_pw = $account.find("#signup_user_pw")
      const input_pw = $input_pw.val();
      const $input_pw_check = $account.find("#signup_user_pw_check");
      const input_pw_check = $input_pw_check.val();
      const $inputs = $account.find("#signup_window input:not([type='button'])");
      const input_null_check = !every((input) => input.value, $inputs);
      if (input_pw !== input_pw_check) {
        $pw_check_label.css("color", "red").css("text-decoration", "line-through");
        shakeElement($pw_check_label);
      } else {
        if (input_null_check) {
          $inputs.each((idx, el) => {
            if (!$(el).val()) {
              const $el = $(el);
              animateColorForMoment($el, "#ff9494", 1000);
              shakeElement($el);
            }
          });
          animateTextForMoment($error_message, "fill in all entry fields", 600);
        } else {
          if (getDBTableData("user_accounts", { user_id: user_name }).length) {
            animateColorForMoment($signup_user_name, "#ffdb1b", 1000);
            shakeElement($signup_user_name);
            animateTextForMoment($error_message, "user ID is already exist", 600);
          } else {
            appendDBTable("user_accounts", { user_id: user_name, user_pw: input_pw });
            appendDBTable("user_accounts", { user_id: user_name, user_pw: input_pw });
            updateDBTable(`todo_items_${user_name}`, {item_list: []});
            $signup_user_name.val("");
            $input_pw.val("");
            $input_pw_check.val("");
            accountWindowControl(true, true, true);
          }
        }
      }
    })
    .on("keydown", "#signup_user_pw_check", (e) => {
      $pw_check_label
        .css("color", "#6a6969")
        .css("text-decoration", "none")
        .css("animation", "none");
    })
    .on("click", "#goto_signup", (e) => {
      $(".input_box").find('input').val("");
      accountWindowControl(true, false, true);
    })
    .on("click", "#goto_login", (e) => {
      $(".input_box").find('input').val("");
      accountWindowControl(true, true, true);
    });
  $register_item
    .on("keydown", "#item_input", (e) => {
      const input_text = e.currentTarget.value;
      limitInputText(e, input_text, 430);
      if (input_text && e.keyCode === 13) {
        const item_id = designateID(todo_items_data["item_list"])
        addList($content, item_id, input_text, false, () => {
          animateShow($content.find(".item_list"), 300);
        });
        addData(todo_items_data["item_list"], item_id, {
          item_text: input_text,
          is_completed: false,
        });
        statusUpdate($todo_window);
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
            updateData(todo_items_data["item_list"], Number($(item).attr("data-id")), {
              is_completed: true,
            });
          }, $not_completed_items)
        : each((item) => {
            item.classList.remove("completed");
            updateData(todo_items_data["item_list"], Number($(item).attr("data-id")), {
              is_completed: false,
            });
          }, $completed_items);
      statusUpdate($todo_window);
    });

  $content
    .on("click", ".delete_btn", (e) => {
      const $delete_item = $(e.currentTarget).closest(".item_list");
      if ($delete_item.hasClass("completed") || confirm("Not over yet. Wanna remove?")) {
        animateHide($delete_item, 500, () => {
          $delete_item.remove();
          todo_items_data["item_list"] = removeData(todo_items_data["item_list"], { id: Number($delete_item.attr("data-id")) });
          statusUpdate($todo_window);
        });
      }
    })
    .on("click", ".complete_checkbox, .item_text", (e) => {
      const $checked_item = $(e.currentTarget).closest(".item_list");
      $checked_item.toggleClass("completed");
      updateData(todo_items_data["item_list"], $checked_item.attr("data-id"), {
        is_completed: $checked_item.hasClass("completed"),
      });
      statusUpdate($todo_window);
    });

  $item_filter.on("click", "input:button", (e) => {
    const $ct = $(e.currentTarget);
    const filter_category = $ct.val();
    const $els_completed = $content.find(".completed");
    const $els_not_completed = $content.find(".item_list").not(".completed");
    const complete_num = $els_completed.length;
    const left_num = $els_not_completed.length;
    const $message = $content.find(".message");
    $ct.parent().attr("filter_category", filter_category);
    switch (filter_category) {
      case "All": {
        animateShow($content.find(".item_list"), 500);
        animateFilterBoxPosition($item_filter.find("#filter_box"), 299, 38);
        $message && $message.remove();
        statusUpdate($todo_window, false);
        break;
      }
      case "Active": {
        animateHide($els_completed, 0, () => $els_completed.css("display", "none"));
        animateHide($els_not_completed, 0);
        animateShow($els_not_completed, 800);
        animateFilterBoxPosition($item_filter.find("#filter_box"), 341, 67);
        $message && $message.remove();
        if (left_num === 0) {
          addMessage($content, "No active items");
        }
        statusUpdate($todo_window, false);
        break;
      }
      case "Completed": {
        animateHide($els_not_completed, 0, () => $els_not_completed.css("display", "none"));
        animateHide($els_completed, 0);
        animateShow($els_completed, 800);
        animateFilterBoxPosition($item_filter.find("#filter_box"), 415, 115);
        $message && $message.remove();
        if (complete_num === 0) {
          addMessage($content, "No complete items.");
        }
        statusUpdate($todo_window, false);
        break;
      }
    }
  });
  $clear_btn.on("click", () => {
    const $els_completed = $content.find(".completed");
    animateHide($content.find(".completed"), 800, () => {
      $content.find(".completed").remove();
      statusUpdate($todo_window, false);
    });
    _.each(
      (item) =>
        (todo_items_data["item_list"] = removeData(todo_items_data["item_list"], { id: Number($(item).attr("data-id")) })),
      $els_completed);
  });
  $left_items_counter.hover(
    () => {
      $left_items_counter.css("color", "#987d25");
      $content.find(".completed").stop().animate({ opacity: 0.3 }, 300);
    },
    () => {
      const color = $left_items_counter.text() === "All Done!" ? "#248d4c" : "#757575";
      $left_items_counter.css("color", color);
      $content.find(".completed").stop().animate({ opacity: 1 }, 300);
    }
  );
  $account_control
    .on('click', '#main_logout', (e) => {
      showAndHide($("#account_control .account_btn"), false);
      $content.find(".item_list").remove();
      updateDBTable(`todo_items_${getCurrentUser()}`, todo_items_data);
      accountWindowControl(true, true, false);
      sessionStorage.removeItem("todo_user");
    })

  window.onbeforeunload = () => {
    const current_user = getCurrentUser();
    if (current_user) {
      updateDBTable(`todo_items_${current_user}`, todo_items_data);
    }
  };
}
export function initialScreenUpdate(data, current_user) {
  const $todo_window = $("#todo_window");
  const $account_control = $("#account_control");
  const $content = $todo_window.find("section#content");
  map(({ id, item_text, is_completed }) => {
    addList($content, id, item_text, is_completed, () =>
      animateShow($todo_window.find(".item_list"), 500)
    );
  }, data);
  statusUpdate($todo_window);
  $account_control.find("#main_welcome").text(`Welcome,  ${current_user}!`)
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
  switch (filter_category) {
    case "All" : {
      if (left_num < 1) {
        $left_items_counter.text("All Done!").css("color", "#248d4c");
        $complete_all_btn.addClass("all_completed");
      } else {
        $left_items_counter.css("color", "#757575");
        $complete_all_btn.removeClass("all_completed");
        if (left_num < 2) {
          $left_items_counter.text(left_num + " item left");
        } else {
          $left_items_counter.text(left_num + " items left");
        }
      }
      break;
    }
    case "Active" : {
      $left_items_counter.text(`${left_num} active items`);
      break;
    }
    case "Completed" : {
      $left_items_counter.text(`${complete_num} complete items`);
      break;
    }
  }

  doFilter && $item_filter.find(`input[value=${filter_category}]`).trigger("click");
  animateToggleOpacity($indicator_bar, !!total_num, 300, 1000);
  animateToggleOpacity($clear_btn, (!!complete_num && filter_category === "All"), 500, 500);
  animateToggleOpacity($complete_all_btn, !!total_num, 500, 500);
}
