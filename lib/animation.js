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
export function hoverShowAndHide($el, $content, hide_opacity, speed) {
  const $target_els = $content.find(".completed");
  $el.hover(
    () => {
      $el.css("color", "#987d25");
      $target_els.stop().animate({ opacity: hide_opacity }, speed);
    },
    () => {
      const color = $el.text() === "All Done!" ? "#248d4c" : "#757575";
      $el.css("color", color);
      $target_els.stop().animate({ opacity: 1 }, speed);
    }
  );
}
export function animateFilterBoxPosition($el, left, width) {
  $el.css("left", left).css("width", width);
}
export function animateTextForMoment($el, text, duration) {
  $el.css("opacity", 1).text(text);
  setTimeout(() => $el.stop(true, true).animate({opacity: 0}, 500), duration);
}
export function animateColorForMoment($el, color_to_change, duration) {
  const color_asis = $el.css("background-color");
  $el.css({backgroundColor: color_to_change});
  setTimeout(() => {
    $el.css({backgroundColor: color_asis})
  }, duration);
}

export function accountWindowControl(is_account_window_show, is_login_mode, need_animate) {
  const $account_window = $("#account");
  const $signup_window = $("#signup_window");
  const $login_window = $("#login_window");

  if (is_account_window_show) {
    if (is_login_mode) {
      $login_window.stop(true, false).animate({ left: "39%" }, need_animate ? 500 : 0);
      $signup_window.stop(true, false).animate({ left: "100%" }, need_animate ? 500 : 0);
    } else {
      $login_window.stop(true, false).animate({ left: "-39%" }, need_animate ? 500 : 0);
      $signup_window.stop(true, false).animate({ left: "39%" }, need_animate ? 500 : 0);
    }
    $account_window.css("top", 0);
  } else {
    $account_window.css("top", "-100%");
  }
}