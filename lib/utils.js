export function limitInputText(event, text, width_limit) {
  const $ct = $(event.currentTarget);
  const reg_check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  const width = calcTextWidth(text, $ct.parent());
  if (width > width_limit) {
    const isHangul = reg_check_kor.test($ct.val().slice(-1));
    const deleteByte = isHangul ? -2 : -1;
    $ct.val($ct.val().slice(0, deleteByte));
  }
}
function calcTextWidth(text, $parent_el) {
  const $el = $("<label></label>").css("display", "none").text(text);
  $parent_el.append($el);
  const width = $el.width();
  $el.remove();
  return width;
}