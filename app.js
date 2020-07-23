$(document).ready(() => {
  const $section_content = $("section#content");
  const $item_input = $("#item_input");
  const $complete_all_btn = $("#complete_all_btn");
  const $left_items_count_indicator = $("#left_items_count_indicator");
  const $item_filter = $("#item_filter");
  const $clear_btn = $item_filter.find("input[value='Clear']");
  const $filter_box = $("#filter_box");

  $item_input
    .on("keydown", (e) => {
      const todo_item_text = e.currentTarget.value;
      if (todo_item_text && e.which === 13) {
        e.preventDefault();
        addList(todo_item_text);
        e.currentTarget.value = "";
        countItemsAndStatusUpdate();
        $section_content.find(".item_list").last().addClass("opacity_show");
      }
    })
    .on("keyup", (e) => {
      const input_limit = 44;
      const reg_check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
      const ct = e.currentTarget;
      if (checkInputByteLength(ct.value) > input_limit) {
        if (reg_check_kor.test(ct.value.slice(-1))) {
          ct.value = ct.value.slice(0, -2);
        } else {
          ct.value = ct.value.slice(0, -1);
        }
      }
    });

  $complete_all_btn.on("click", (e) => {
    const $ct = $(e.currentTarget);
    if ($ct.hasClass("all_completed")) {
      $section_content.find(".item_list").removeClass("completed");
      $ct.removeClass("all_completed");
    } else {
      $section_content.find(".item_list").addClass("completed");
      $ct.addClass("all_completed");
    }
    countItemsAndStatusUpdate();
  });

  $section_content
    .on("click", ".delete_btn", (e) => {
      const $ct_item_list = $(e.currentTarget).closest(".item_list");
      $ct_item_list.removeClass("opacity_show");
      $ct_item_list.one(
        "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",
        () => {
          $ct_item_list.remove();
          countItemsAndStatusUpdate();
        }
      );
    })
    .on("click", ".complete_checkbox_svg, .item_text", (e) => {
      $(e.currentTarget).closest(".item_list").toggleClass("completed");
      countItemsAndStatusUpdate();
    });

  $item_filter
    .on("click", "input:button[value='All']", (e) => {
      $(e.currentTarget).parent().attr("filter_category", "All");
      $section_content.find(".item_list").css("display", "flex");
      $filter_box.css("left", 247).css("width", 38);
    })
    .on("click", "input:button[value='Active']", (e) => {
      $("input:button[value='All']").trigger("click");
      $(e.currentTarget).parent().attr("filter_category", "Active");
      $section_content.find(".completed").css("display", "none");
      $filter_box.css("left", 290).css("width", 67);
    })
    .on("click", "input:button[value='Completed']", (e) => {
      $("input:button[value='All']").trigger("click");
      $(e.currentTarget).parent().attr("filter_category", "Completed");
      $section_content
        .find(".item_list:not(.completed)")
        .css("display", "none");
      $filter_box.css("left", 362).css("width", 115);
    })
    .on("click", "input:button[value='Clear']", () => {
      $section_content.find(".completed").remove();
      countItemsAndStatusUpdate();
    });

  $left_items_count_indicator.hover(
    (e) => {
      $(e.currentTarget).css("color", "#987d25");
      $section_content
        .find(".item_list.completed")
        .animate({ opacity: 0.3 }, 300);
    },
    (e) => {
      $(e.currentTarget).css("color", "#757575");
      $section_content
        .find(".item_list.completed")
        .animate({ opacity: 1 }, 300);
    }
  );

  function countItemsAndStatusUpdate() {
    const total_num = $section_content.find(".item_list").length;
    const complete_num = $section_content.find(".completed").length;
    const left_num = total_num - complete_num;
    showIndicatorBox(!!total_num);
    showCompleteAllBtn(!!total_num);
    updateLeftItems(left_num);
    updateAllComplete(left_num);
    filtering();
    showClearButton(complete_num);
    return { total_num, complete_num, left_num };
  }

  function showCompleteAllBtn(isShow) {
    return isShow
      ? $complete_all_btn.css("opacity", "100")
      : $complete_all_btn.css("opacity", "0");
  }

  function filtering() {
    const filter_category = $item_filter.attr("filter_category");
    $item_filter.find(`input[value=${filter_category}]`).trigger("click");
  }

  function showIndicatorBox(isShow) {
    const $indicator = $("#indicator");
    if (isShow) {
      $indicator.addClass("opacity_show");
    } else {
      $indicator.removeClass("opacity_show");
    }
  }
  function updateLeftItems(left_num) {
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
      $left_items_count_indicator.css("color", "#b2b2b2");
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
    $section_content.append(`
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
  }

  function checkInputByteLength(input) {
    const reg_check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return _.go(
      input,
      _.map((x) => {
        if (reg_check_kor.test(x)) return 2;
        else return 1;
      }),
      _.reduce((a, b) => a + b)
    );
  }
});
