export function limitInputText(e, text, width_limit) {
  const $ct = $(e.currentTarget);
  const reg_check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  const width = calcTextWidth(text, $ct.parent());
  if (width > width_limit) {
    if (e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode !== 13) {
      const isHangul = reg_check_kor.test($ct.val().slice(-1));
      if (!isHangul) {
        e.preventDefault();
      } else {
        e.currentTarget.value = text.slice(0, -2);
      }
      alert("Use always in a simple sentence");
    }
  }
}
function calcTextWidth(text, $parent_el) {
  const $el = $("<span></span>").css("display", "none").text(text);
  $parent_el.append($el);
  const width = $el.width();
  $el.remove();
  return width;
}
