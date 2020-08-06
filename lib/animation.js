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
