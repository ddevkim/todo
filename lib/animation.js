export function animateHide($hide, hide_time, cb_fns_after_hide) {
  $hide.stop(false, true).animate({ opacity: 0 }, hide_time, cb_fns_after_hide);
}
export function animateShow($show, show_time) {
  // $show.css({opacity: 0});
  $show.stop(false, false).animate({ opacity: 1 }, show_time).css("display", "flex");
}
export function animateToggleOpacity($el, condition, show_time, hide_time) {
  condition
    ? $el.stop(true, false).animate({ opacity: 1 }, show_time)
    : $el.stop(true, false).animate({ opacity: 0 }, hide_time);
}

export function animateFilterBoxPosition($el, left, width) {
  $el.css("left", left).css("width", width);
}
export function animateTextForMoment($el, text, duration) {
  $el.css("opacity", 1).text(text);
  setTimeout(() => $el.stop(true, true).animate({ opacity: 0 }, 500), duration);
}
export function animateColorForMoment($el, color_to_change, duration) {
  $el.css({ backgroundColor: color_to_change });
  setTimeout(() => {
    $el.css({ backgroundColor: "#e7e8ea" }).css({ animation: "none" });
  }, duration);
}
export function shakeElement($el) {
  $el.css("animation", "shake-rotate 300ms ease-in-out");
  setTimeout(() => $el.css("animation", "none"), 300);
}
export function accountWindowControl(is_account_window_show, is_login_mode, need_animate) {
  const $account_window = $("#account");
  const $signup_window = $("#signup_window");
  const $login_window = $("#login_window");

  if (is_account_window_show) {
    if (is_login_mode) {
      $login_window.stop(true, false).animate({ left: "38%" }, need_animate ? 500 : 0);
      $signup_window.stop(true, false).animate({ left: "100%" }, need_animate ? 500 : 0);
    } else {
      $login_window.stop(true, false).animate({ left: "-38%" }, need_animate ? 500 : 0);
      $signup_window.stop(true, false).animate({ left: "38%" }, need_animate ? 500 : 0);
    }
    $account_window.css("top", 0);
  } else {
    $account_window.css("top", "-100%");
  }
}

export function showAndHide($el, is_show) {
  is_show ? $el.show() : $el.hide();
}

