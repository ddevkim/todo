export function animateHide($hide, hide_time, cb_fns_after_hide) {
  $hide
    .stop(false, true)
    .animate({ opacity: 0 }, hide_time, cb_fns_after_hide);
}
export function animateShow($show, show_time) {
  $show
    .stop(false, false)
    .animate({ opacity: 1 }, show_time)
    .css("display", "flex");
}
export function animateToggleOpacity(
  $el,
  condition,
  show_time,
  hide_time
) {
  condition
    ? $el.stop(true, false).animate({ opacity: 1 }, show_time)
    : $el.stop(true, false).animate({ opacity: 0 }, hide_time);
}

export function animateFilterBoxPosition($el, left, width) {
  $el.css("left", left).css("width", width);
}
export function animateTextForMoment($el, text, duration) {
  $el.css("opacity", 1).text(text);
  setTimeout(
    () => $el.stop(true, true).animate({ opacity: 0 }, 500),
    duration
  );
}
export function animateColorForMoment($el, color_to_change, duration) {
  $el.css({ backgroundColor: color_to_change });
  setTimeout(() => {
    $el.css({ backgroundColor: "#e7e8ea" }).css({ animation: "none" });
  }, duration);
}
export function shakeElement($el) {
  $el.css("animation", "shake-rotate 300ms ease-in-out");
  setTimeout(() => $el.css("animation", "none"), 200);
}
export function accountWindowControl(
  need_show,
  show_login,
  need_animate
) {
  const $account_window = $("#account");
  const $signup_window = $("#signup_window");
  const $login_window = $("#login_window");
  const $input_box = $(".input_box");
  $input_box.find("input").val("");
  $account_window.find(".message").html("");
  if (need_show) {
    showAndHide($("#account_control .account_btn"), false);
    if (show_login) {
      $login_window
        .stop(true, false)
        .animate({ left: "38%" }, need_animate ? 500 : 0);
      $signup_window
        .stop(true, false)
        .animate({ left: "100%" }, need_animate ? 500 : 0);
      $login_window.find("#login_user_name").focus();
    } else {
      $login_window
        .stop(true, false)
        .animate({ left: "-38%" }, need_animate ? 500 : 0);
      $signup_window
        .stop(true, false)
        .animate({ left: "38%" }, need_animate ? 500 : 0);
      $signup_window.find("#signup_user_name").focus();
    }
    $account_window.css("top", 0);
  } else {
    showAndHide($("#account_control .account_btn"), true);
    $account_window.css("top", "-100%");
  }
}

export function showAndHide($el, is_show) {
  is_show ? $el.show() : $el.hide();
}
