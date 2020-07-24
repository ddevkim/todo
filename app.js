$(document).ready(() => {
  const $register_item = $("#register_item");
  const $content = $("section#content");
  const $indicator_bar = $("#indicator_bar");
  const $complete_all_btn = $("#complete_all_btn");
  const $left_items_count_indicator = $("#left_items_count_indicator");
  const $item_filter = $("#item_filter");
  const $clear_btn = $item_filter.find("input[value='Clear']");
  const $filter_box = $("#filter_box");

  $register_item
    .on("keyup", "#item_input", (e) => {
      limitInputText($(e.currentTarget), 430);
    })
    .on("keydown", "#item_input", (e) => {
      const todo_item_text = e.currentTarget.value;
      if (todo_item_text && e.keyCode === 13) {
        e.currentTarget.value = "";
        addList(todo_item_text);
        statusUpdate();
      }
    })
    .on("click", "#complete_all_btn", (e) => {
      const $ct = $(e.currentTarget);
      if ($ct.hasClass("all_completed")) {
        $content.find(".item_list").removeClass("completed");
        $ct.removeClass("all_completed");
      } else {
        $content.find(".item_list").addClass("completed");
        $ct.addClass("all_completed");
      }
      statusUpdate();
    });

  $content
    .on("click", ".delete_btn", (e) => {
      const $delete_item = $(e.currentTarget).closest(".item_list");
      if ($delete_item.hasClass("completed") || confirm("끝내지도 않았는데 지우려구요?")) {
        animateShowAndHide(null, null, $delete_item, 500, () => {
          $delete_item.remove();
          statusUpdate();
        });
      }
    })
    .on("click", ".complete_checkbox_svg, .item_text", (e) => {
      $(e.currentTarget).closest(".item_list").toggleClass("completed");
      statusUpdate();
    });

  $item_filter
    .on("click", "input:button[value!='Clear']", (e) => {
      const $ct = $(e.currentTarget);
      const filter_category = $ct.val();
      $ct.parent().attr("filter_category", filter_category);

      switch (filter_category) {
        case "All": {
          animateShowAndHide($content.find(".item_list"), 500);
          changeFilterBoxPosition(247, 38);
          break;
        }
        case "Active": {
          animateShowAndHide(
            $content.find(".item_list").not(".completed"),
            1000,
            $content.find(".completed"),
            500,
            () => $content.find(".completed").css("display", "none")
          );
          changeFilterBoxPosition(290, 67);
          break;
        }
        case "Completed": {
          animateShowAndHide(
            $content.find(".completed"),
            1000,
            $content.find(".item_list").not(".completed"),
            500,
            () => $content.find(".item_list").not(".completed").css("display", "none")
          );
          changeFilterBoxPosition(362, 115);
          break;
        }
      }
    })
    .on("click", "input:button[value='Clear']", () => {
      animateShowAndHide(null, null, $content.find(".completed"), 800, () => {
        $content.find(".completed").remove();
        statusUpdate(false);
      });
    });

  $left_items_count_indicator.hover(
    (e) => {
      $(e.currentTarget).css("color", "#987d25");
      $content.find(".item_list.completed").animate({ opacity: 0.3 }, 200);
    },
    (e) => {
      $(e.currentTarget).css("color", "#757575");
      $content.find(".item_list.completed").animate({ opacity: 1 }, 200);
    }
  );

  function changeFilterBoxPosition(left, width) {
    $filter_box.css("left", left).css("width", width);
  }

  function statusUpdate(doFilter = true) {
    const total_num = $content.find(".item_list").length;
    const complete_num = $content.find(".completed").length;
    const left_num = total_num - $content.find(".completed").length;
    showIndicatorBar(total_num);
    showClearButton(complete_num);
    showCompleteAllBtn(total_num);
    updateLeftItemNumber(left_num);
    updateAllComplete(left_num);
    doFilter && filterCategory();
  }

  function showCompleteAllBtn(total_num) {
    animateToggleOpacity($complete_all_btn, !!total_num, 1000, 300);
  }
  function filterCategory() {
    const filter_category = $item_filter.attr("filter_category");
    $item_filter.find(`input[value=${filter_category}]`).trigger("click");
  }
  function showIndicatorBar(total_num) {
    animateToggleOpacity($indicator_bar, !!total_num, 500, 1000);
  }
  function updateLeftItemNumber(left_num) {
    return $left_items_count_indicator.text(
      `${
        left_num < 1
          ? "All Done!"
          : left_num < 2
          ? left_num + " item left"
          : left_num + " items left"
      }`
    );
  }
  function updateAllComplete(left_num) {
    if (!left_num) {
      $complete_all_btn.addClass("all_completed");
      $left_items_count_indicator.css("color", "#248d4c");
    } else {
      $complete_all_btn.removeClass("all_completed");
      $left_items_count_indicator.css("color", "#757575");
    }
    return left_num === 0;
  }
  function showClearButton(complete_num) {
    if (!!complete_num) {
      $clear_btn.css("display", "inline");
    } else {
      $clear_btn.css("display", "none");
    }
  }

  function addList(todo_item_text) {
    $content.append(`
    <div class="item_list">
       <div class="inner_checkbox">
          <svg class="complete_checkbox_svg" viewBox="0 0 100 100">
            <path class="box_line" d="M75.44,9.56H24.56c-8.28,0-15,6.72-15,15v50.89c0,8.28,6.72,15,15,15h50.89c8.28,0,15-6.72,15-15V24.56
                              \tC90.44,16.27,83.73,9.56,75.44,9.56z"/>
            <polyline class="check_line" points="22.44,52.61 42.96,70.09 74.35,34.33 "/>
         </svg>
         <span class="item_text">${todo_item_text}</span>
      </div>
       <svg class="delete_btn" viewBox="0 0 100 100">
        <circle class="circle_line" cx="50" cy="50" r="41.5"/>
        <polyline class="x_line" points="28.24,28.24 50,50 71.76,71.76 "/>
        <polyline class="x_line" points="71.76,28.24 50,50 28.24,71.76 "/>
      </svg>
    </div>`);
    $(document).ready(() => {
      animateShowAndHide($content.find(".item_list").last(), 100)
      // $content.find(".item_list").last().addClass("opacity_show");
    });
  }

  function limitInputText($ct, width_limit) {
    const reg_check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    const text = $ct.val();
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
  function animateShowAndHide($show, show_time, $hide, hide_time, after_hide_cb) {
    $show && $show.stop(true, true).animate({ opacity: 1 }, show_time).css("display", "flex");
    $hide && $hide.stop(true, true).animate({ opacity: 0 }, hide_time, after_hide_cb);
  }
  function animateToggleOpacity($el, condition, show_time, hide_time) {
    condition ? $el.stop(true, true).animate({ opacity: 1}, show_time) : $el.stop(true, true).animate({ opacity: 0 }, hide_time);
  }
});
