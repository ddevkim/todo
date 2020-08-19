const { go, each, map, every, some, filter } = _;
import { limitInputText } from "./utils.js";
import {
  animateFilterBoxPosition,
  animateHide,
  animateShow,
  animateToggleOpacity,
  accountWindowControl,
  animateTextForMoment,
  animateColorForMoment,
  shakeElement,
} from "./animation.js";
import { append, addMessage, todoTmpl } from "./html_template.js";
import {
  appendData,
  readDataGroupBy,
  updateData,
  deleteData,
  getSessionUserID,
  encryptPassword,
  readData,
} from "./DB_handling.js";

export function eventHandlers() {
  const DB_accounts = "todo_user_accounts";
  const DB_items = "todo_user_items";
  const DB_session_user = "todo_user";
  const $todo_window = $("#todo_window");
  const $account_window = $("#account");
  const $account_control = $("#account_control");
  const $register_item = $todo_window.find("#register_item");
  const $content = $todo_window.find("section#content");
  const $indicator_bar = $todo_window.find("section#indicator_bar");
  const $left_counter = $todo_window.find("#left_items_counter");
  const $clear_btn = $indicator_bar.find("#clear_btn");
  const $item_filter = $indicator_bar.find("#item_filter");
  const $pw_check_label = $account_window.find("#signup_user_pw_check");
  $register_item.find("#item_input").focus();

  $account_window
    //이벤트: 로그인
    .on("click", "#login_btn", async (e) => {
      const $input_login_user_name = $("#login_user_name");
      const input_user_name = $input_login_user_name.val();
      const $login_user_pw = $("#login_user_pw");
      const $error_message = $(e.currentTarget).prev();
      const $inputs = $account_window.find(
        "#login_window input:not([type='button'])"
      );
      const input_is_null = !every((input) => input.value, $inputs);
      //입력 null 체크
      if (input_is_null) {
        //input null이 있는 경우
        $($inputs.get().reverse()).each((idx, el) => {
          if (!$(el).val()) {
            const $el = $(el);
            animateColorForMoment($el, "#ff9494", 1000);
            $el.focus();
            shakeElement($el);
          }
        });
        animateTextForMoment(
          $error_message,
          "fill in all entry fields",
          1000
        );
      } else {
        //input null이 없는 경우
        const is_user_exist = some(
          (DB_username) => DB_username === input_user_name,
          readDataGroupBy(DB_accounts)["user_name"]
        );
        //유저 계정 존재 여부 체크
        if (!is_user_exist) {
          //유저 계정 없는 경우
          $input_login_user_name.focus();
          animateTextForMoment(
            $error_message,
            "ID does not exist",
            1000
          );
          animateColorForMoment($input_login_user_name, "#ffdb1b", 1000);
          shakeElement($input_login_user_name);
        } else {
          //유저 계정 있는 경우
          const DB_password = readData(
            DB_accounts,
            { user_name: input_user_name },
            "user_pw"
          );
          //패스워드 일치 여부 확인
          if (
            //패스워드 불일치 경우
            DB_password !== (await encryptPassword($login_user_pw.val()))
          ) {
            $login_user_pw.focus();
            animateTextForMoment(
              $error_message,
              "check your password again",
              600
            );
            animateColorForMoment($login_user_pw, "#ffdb1b", 1000);
            shakeElement($login_user_pw);
          } else {
            //패스워드 일치
            const user_id = readData(
              DB_accounts,
              { user_name: input_user_name },
              "id"
            );
            //세션에 유저 id 등록
            sessionStorage.setItem(
              DB_session_user,
              JSON.stringify({ user_id: user_id })
            );
            //_todo 아이템 불러오기
            readTodoItems(user_id);
            $account_control
              .find("#main_welcome")
              .text(`Welcome, ${input_user_name}!`);
            $input_login_user_name.val("");
            $login_user_pw.val("");
            $register_item.find("#item_input").focus();
            //계정 접속 창 종료
            accountWindowControl(false, false, false);
          }
        }
      }
    })
    //이벤트: 계정 생성
    .on("click", "#signup_btn", async (e) => {
      const $error_message = $(e.currentTarget).prev();
      const $signup_user_name = $account_window.find(
        "#signup_user_name"
      );
      const signup_user_name = $signup_user_name.val();
      const $input_pw = $account_window.find("#signup_user_pw");
      const input_pw = $input_pw.val();
      const $input_pw_check = $account_window.find(
        "#signup_user_pw_check"
      );
      const input_pw_check = $input_pw_check.val();
      const $inputs = $account_window.find(
        "#signup_window input:not([type='button'])"
      );
      const input_is_null = !every((input) => input.value, $inputs);
      //input null 체크
      if (input_is_null) {
        //입력값에 null 있는 경우
        $($inputs.get().reverse()).each((idx, el) => {
          if (!$(el).val()) {
            const $el = $(el);
            animateColorForMoment($el, "#ff9494", 1000);
            shakeElement($el);
            $el.focus();
          }
        });
        animateTextForMoment(
          $error_message,
          "fill in all entry fields",
          600
        );
      } else {
        //입력값에 null이 없는 경우 => 패스워드 입력 일치 확인
        if (input_pw !== input_pw_check) {
          //패스워드 입력 불일치 경우
          $pw_check_label
            .css("color", "red")
            .css("text-decoration", "line-through");
          $input_pw_check.focus();
          shakeElement($pw_check_label);
        } else {
          //패스워드 입력 일치하는 경우
          const is_id_exist = some(
            (id) => id === signup_user_name,
            readDataGroupBy(DB_accounts)["user_name"]
          );
          if (is_id_exist) {
            //아이디 기존 등록 여부 확인
            animateColorForMoment($signup_user_name, "#ffdb1b", 1000);
            shakeElement($signup_user_name);
            animateTextForMoment(
              $error_message,
              "user ID already exists",
              600
            );
          } else {
            //신규 생성 가능 아이디인 경우 계정 등록
            appendData(DB_accounts, {
              user_name: signup_user_name,
              user_pw: `${await encryptPassword(input_pw)}`,
            });
            $signup_user_name.val("");
            $input_pw.val("");
            $input_pw_check.val("");
            //계정 접속 창 종료
            accountWindowControl(true, true, true);
          }
        }
      }
    })
    //이벤트: 계정 등록 이름 입력시
    .on("keyup", "#signup_user_name", (e) => {
      if (e.keyCode === 32) {
        //space 입력 방지
        e.preventDefault();
      }
      const $ct = $(e.currentTarget);
      const input_username = $ct.val();
      const is_user_name_exist = some(
        (DB_username) => DB_username === input_username,
        readDataGroupBy(DB_accounts)["user_name"]
      );
      //기존 등록 사용자 이름인 경우 메세지 알림
      const $warning_message = $ct
        .parent()
        .find("#username_warning_message");
      if (is_user_name_exist) {
        $warning_message.text(`Username already exists`);
      } else {
        $warning_message.text("");
      }
    })
    //이벤트: 로그인 패스워드 enter 입력 시 로그인 클릭
    .on("keyup", "#login_user_pw", (e) => {
      if (e.keyCode === 13) {
        $("#login_btn").trigger("click");
      }
    })
    //이벤트: 계정 생성 패스워드 입력 시 계정 생성 클릭
    .on("keyup", "#signup_user_pw_check", (e) => {
      if (e.keyCode === 13) {
        $("#signup_btn").trigger("click");
      }
    })
    .on("keydown", "#signup_user_pw, #signup_user_pw_check", () => {
      $pw_check_label
        .css("color", "#6a6969")
        .css("text-decoration", "none")
        .css("animation", "none");
    })
    .on("click", "#goto_signup", () => {
      accountWindowControl(true, false, true);
    })
    .on("click", "#goto_login", () => {
      accountWindowControl(true, true, true);
    });
  $register_item
    //이벤트: _todo 아이템 등록
    .on("keydown", "#item_input", (e) => {
      const input_text = e.currentTarget.value;
      //입력 행 길이 제한
      limitInputText(e, input_text, 430);
      if (input_text && e.keyCode === 13) {
        const user_id = getSessionUserID();
        const item_content = {
          user_id: user_id,
          item_text: input_text,
          is_completed: false,
        };
        //DB에 추가 아이템 쓰기
        appendData(DB_items, item_content);
        //DOM refresh
        readTodoItems(user_id);
        e.currentTarget.value = "";
      }
    })
    //이벤트: 전체 완료 버튼 클릭
    .on("click", "#complete_all_btn", (e) => {
      const $ct = $(e.currentTarget);
      const $completed_items = $content.find(".completed");
      const $not_completed_items = $content
        .find(".todo_item")
        .not(".completed");
      //전체 완료 체크 or 체크 해제에 따라 DB 업데이트 및 DOM 업데이트
      $ct.toggleClass("all_completed").hasClass("all_completed")
        ? each((item) => {
            item.classList.add("completed");
            const id = Number($(item).attr("data-id"));
            const user_id = Number($(item).attr("data-user_id"));
            updateData(
              DB_items,
              { id, user_id },
              { is_completed: true }
            );
          }, $not_completed_items)
        : each((item) => {
            item.classList.remove("completed");
            const id = Number($(item).attr("data-id"));
            const user_id = Number($(item).attr("data-user_id"));
            updateData(
              DB_items,
              { id, user_id },
              { is_completed: false }
            );
          }, $completed_items);
      statusUpdate($todo_window);
    });

  $content
    //이벤트: 개별 완료 버튼 클릭
    .on("click", ".complete_checkbox, .item_text", (e) => {
      const $checked_item = $(e.currentTarget).closest(".todo_item");
      //DOM 업데이트
      $checked_item.toggleClass("completed");
      const id = Number($checked_item.attr("data-id"));
      //DB 업데이트
      updateData(
        DB_items,
        { id },
        { is_completed: $checked_item.hasClass("completed") }
      );
      statusUpdate($todo_window);
    })
    //이벤트: 삭제 버튼 클릭
    .on("click", ".delete_btn", (e) => {
      const $delete_item = $(e.currentTarget).closest(".todo_item");
      if (
        $delete_item.hasClass("completed") ||
        confirm("Not over yet. Wanna remove?")
      ) {
        //DB 삭제
        const id = Number($delete_item.attr("data-id"));
        const user_id = getSessionUserID();
        deleteData(DB_items, { id });
        //DOM refresh
        readTodoItems(user_id);
      }
    });
  //아이템 필터링 (모두, 미완료, 완료 카테고리)
  $item_filter.on("click", "input:button", (e) => {
    const $ct = $(e.currentTarget);
    const filter_category = $ct.val();
    const $els_completed = $content.find(".completed");
    const $els_not_completed = $content
      .find(".todo_item")
      .not(".completed");
    const complete_num = $els_completed.length;
    const left_num = $els_not_completed.length;
    const $message = $content.find(".message");
    //DOM에 현재 filter 카테고리 기록
    $ct.parent().attr("filter_category", filter_category);
    //filter 카테고리 항목에 따라 아이템 목록 변경
    switch (filter_category) {
      case "All": {
        animateShow($content.find(".todo_item"), 500);
        animateFilterBoxPosition(
          $item_filter.find("#filter_box"),
          299,
          38
        );
        $message && $message.remove();
        statusUpdate($todo_window, false);
        break;
      }
      case "Active": {
        animateHide($els_completed, 0, () =>
          $els_completed.css("display", "none")
        );
        animateHide($els_not_completed, 0);
        animateShow($els_not_completed, 800);
        animateFilterBoxPosition(
          $item_filter.find("#filter_box"),
          341,
          67
        );
        $message && $message.remove();
        if (left_num === 0) {
          addMessage($content, "No active items");
        }
        statusUpdate($todo_window, false);
        break;
      }
      case "Completed": {
        animateHide($els_not_completed, 0, () =>
          $els_not_completed.css("display", "none")
        );
        animateHide($els_completed, 0);
        animateShow($els_completed, 800);
        animateFilterBoxPosition(
          $item_filter.find("#filter_box"),
          415,
          115
        );
        $message && $message.remove();
        if (complete_num === 0) {
          addMessage($content, "No complete items.");
        }
        statusUpdate($todo_window, false);
        break;
      }
    }
  });
  //이벤트: 완료 목록 지우기
  $clear_btn.on("click", () => {
    const $completed = $content.find(".completed");
    const user_id = getSessionUserID();
    //DB 제거
    go(
      $completed,
      each((el_completed) => {
        deleteData(DB_items, {
          id: Number(el_completed.getAttribute("data-id")),
        });
      })
    );
    //DOM refresh
    readTodoItems(user_id);
  });
  $left_counter.hover(
    () => {
      $left_counter.css("color", "#987d25");
      $content.find(".completed").stop().animate({ opacity: 0.3 }, 300);
    },
    () => {
      const color =
        $left_counter.text() === "All Done!" ? "#248d4c" : "#757575";
      $left_counter.css("color", color);
      $content.find(".completed").stop().animate({ opacity: 1 }, 300);
    }
  );
  //이벤트: 로그 아웃
  $account_control.on("click", "#main_logout", () => {
    //DOM 목록 제거
    $content.find(".todo_item").remove();
    //계정 접속 창 띄우기
    accountWindowControl(true, true, false);
    //세션 로그인 정보 제거
    sessionStorage.removeItem(DB_session_user);
    statusUpdate($todo_window);
  });
}
export function readTodoItems(user_id) {
  const DB_accounts = "todo_user_accounts";
  const DB_items = "todo_user_items";
  const $todo_window = $("#todo_window");
  const $content = $todo_window.find("section#content");
  const user_name = readData(DB_accounts, { id: user_id }, "user_name");
  const DB_todo_items = readData(DB_items, { user_id: user_id });
  const $todo_items = $content.find(".todo_item");
  const $account_control = $("#account_control");
  if (DB_todo_items.length > $todo_items.length) {
    const append_items = go(
      DB_todo_items,
      filter(
        (item) =>
          !go(
            $todo_items,
            map((x) => Number(x.dataset.id)),
            some((current_id) => item.id === current_id)
          )
      )
    );
    go(append_items, map(todoTmpl), each(append($content)));
    animateShow($todo_window.find(".todo_item"), 500);
  } else if (DB_todo_items.length < $todo_items.length) {
    go(
      $todo_items,
      filter(
        ($item) =>
          !go(
            DB_todo_items,
            some((item) => item.id === Number($item.dataset.id))
          )
      ),
      each((x) => {
        $(x).remove();
      })
    );
  }
  statusUpdate($todo_window);
  $account_control.find("#main_welcome").text(`Welcome,  ${user_name}!`);
}
export function statusUpdate($main_el, doFilter = true) {
  const $content = $main_el.find("section#content");
  const $complete_all_btn = $main_el.find("#complete_all_btn");
  const $left_items_counter = $main_el.find("#left_items_counter");
  const $indicator_bar = $main_el.find("section#indicator_bar");
  const $item_filter = $indicator_bar.find("#item_filter");
  const $clear_btn = $indicator_bar.find("#clear_btn");
  const total_num = $content.find(".todo_item").length;
  const complete_num = $content.find(".completed").length;
  const left_num = total_num - complete_num;
  const filter_category = $item_filter.attr("filter_category");
  switch (filter_category) {
    case "All":
      {
        numberIndicator($left_items_counter, left_num, "left", true);
      }
      break;
    case "Active": {
      numberIndicator($left_items_counter, left_num, "Active", false);
      break;
    }
    case "Completed": {
      numberIndicator(
        $left_items_counter,
        complete_num,
        "Complete",
        false
      );
      break;
    }
  }
  left_num < 1
    ? $complete_all_btn.addClass("all_completed")
    : $complete_all_btn.removeClass("all_completed");
  doFilter &&
    $item_filter
      .find(`input[value=${filter_category}]`)
      .trigger("click");
  animateToggleOpacity($indicator_bar, !!total_num, 300, 1000);
  animateToggleOpacity(
    $clear_btn,
    !!complete_num && filter_category === "All",
    500,
    500
  );
  animateToggleOpacity($complete_all_btn, !!total_num, 500, 500);
}

function numberIndicator($el_indicator, num, text, is_done_show) {
  if (num < 1) {
    is_done_show
      ? $el_indicator.text("All Done!").css("color", "#248d4c")
      : $el_indicator.text("");
  } else {
    $el_indicator.css("color", "#757575");
    if (num < 2) {
      $el_indicator.text(`${num} ${text} item`);
    } else {
      $el_indicator.text(`${num} ${text} items`);
    }
  }
}
