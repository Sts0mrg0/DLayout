var layoutHistory;
var stopSave = 0; // 用于判断是否可保存；> 0: 不可保存, = 0: 可保存
var stopDrag = 0; // 用于判断是否处于拖拉状态；> 0: 处于拖拉状态, = 0: 非拖拉状态
var timerSave = 1000;
var currentEditor = null;
var demoHtml = $(".demo").html();
var editorInstance = null;

/**
 * 判断是否支持本地存储
 * @returns {boolean}
 */
function supportStorage() {
  if (typeof window.localStorage == 'object')
    return true;
  else
    return false;
}

/**
 * 保存布局模板处理函数
 */
function handleSaveLayout() {
  var e = $(".demo").html();
  if (!stopSave && e != window.demoHtml) {
    stopSave++;
    window.demoHtml = e;
    saveLayout();
    stopSave--;
  }
}

/**
 * 保存布局模板
 */
function saveLayout() {
  var data = layoutHistory;
  if (!data) {
    data = {};
    data.count = 0;
    data.list = [];
  }
  if (data.list.length > data.count) {
    for (var i = data.count; i < data.list.length; i++)
      data.list[i] = null;
  }
  data.list[data.count] = window.demoHtml;
  data.count++;
  if (supportStorage()) {
    localStorage.setItem("layoutData", JSON.stringify(data));
  }
  layoutHistory = data;
}

/**
 * 取消操作
 * @returns {boolean}
 */
function undoLayout() {
  var data = layoutHistory;
  if (data) {
    if (data.count < 2) return false;
    window.demoHtml = data.list[data.count - 2];
    data.count--;
    $('.demo').html(window.demoHtml);
    if (supportStorage()) {
      localStorage.setItem("layoutData", JSON.stringify(data));
    }
    return true;
  }
  return false;
}

/**
 * 重做操作
 * @returns {boolean}
 */
function redoLayout() {
  var data = layoutHistory;
  if (data) {
    if (data.list[data.count]) {
      window.demoHtml = data.list[data.count];
      data.count++;
      $('.demo').html(window.demoHtml);
      if (supportStorage()) {
        localStorage.setItem("layoutData", JSON.stringify(data));
      }
      return true;
    }
  }
  return false;
}

function handleJsIds() {
  handleModalIds();
  handleAccordionIds();
  handleCarouselIds();
  handleTabsIds()
}

function handleAccordionIds() {
  var accordionElement = $(".demo #myAccordion");
  var randomNum = randomNumber();
  var accordionId = "accordion-" + randomNum;
  var r;
  accordionElement.attr("id", accordionId);
  accordionElement.find(".panel").each(function(e, t) {
    r = "accordion-element-" + randomNumber();
    $(t).find(".panel-title").each(function(e, t) {
      $(t).attr("data-parent", "#" + accordionId);
      $(t).attr("href", "#" + r)
    });
    $(t).find(".panel-collapse").each(function(e, t) {
      $(t).attr("id", r)
    })
  })
}

function handleCarouselIds() {
  var e = $(".demo #myCarousel");
  var t = randomNumber();
  var n = "carousel-" + t;
  e.attr("id", n);
  e.find(".carousel-indicators li").each(function(e, t) {
    $(t).attr("data-target", "#" + n)
  });
  e.find(".left").attr("href", "#" + n);
  e.find(".right").attr("href", "#" + n)
}

function handleModalIds() {
  var e = $(".demo #myModalLink");
  var t = randomNumber();
  var n = "modal-container-" + t;
  var r = "modal-" + t;
  e.attr("id", r);
  e.attr("href", "#" + n);
  e.next().attr("id", n)
}

function handleTabsIds() {
  var e = $(".demo #myTabs");
  var t = randomNumber();
  var n = "tabs-" + t;
  e.attr("id", n);
  e.find(".tab-pane").each(function(e, t) {
    var n = $(t).attr("id");
    var r = "panel-" + randomNumber();
    $(t).attr("id", r);
    $(t).parent().parent().find("a[href=#" + n + "]").attr("href", "#" + r)
  })
}

function randomNumber() {
  return randomFromInterval(1, 1e6)
}

function randomFromInterval(e, t) {
  return Math.floor(Math.random() * (t - e + 1) + e)
}

function gridSystemGenerator() {
  $(".lyrow .preview input").bind("keyup", function() {
    var e = 0;
    var t = "";
    var n = $(this).val().split(" ", 12);
    $.each(n, function(n, r) {
      e = e + parseInt(r);
      t += '<div class="span' + r + ' column"></div>'
    });
    if (e == 12) {
      $(this).parent().next().children().html(t);
      $(this).parent().prev().show()
    } else {
      $(this).parent().prev().hide()
    }
  })
}

function configurationElm() {
  $(".demo").on("click", ".configuration > a", function(e) {
    e.preventDefault();
    var t = $(this).parent().next().next().children();
    $(this).toggleClass("active");
    t.toggleClass($(this).attr("rel"))
  });
  $(".demo").on("click", ".configuration .dropdown-menu a", function(e) {
    e.preventDefault();
    var t = $(this).parent().parent();
    var n = t.parent().parent().next().next().children();
    t.find("li").removeClass("active");
    $(this).parent().addClass("active");
    var r = "";
    t.find("a").each(function() {
      r += $(this).attr("rel") + " "
    });
    t.parent().removeClass("open");
    n.removeClass(r);
    n.addClass($(this).attr("rel"))
  })
}

/**
 * 给删除元素绑定事件
 */
function bindRemoveElmEvent() {
  $(".demo").on("click", ".remove", function(e) {
    e.preventDefault();
    $(this).parent().remove();
    if (!$(".demo .lyrow").length > 0) {
      clearDemo()
    }
  })
}

/**
 * 清空布局
 */
function clearDemo() {
  $(".demo").empty();
  layoutHistory = null;
  if (supportStorage())
    localStorage.removeItem("layoutData");
}

function removeMenuClasses() {
  $("#menu-layoutit li button").removeClass("active")
}

function changeStructure(e, t) {
  $("#download-layout ." + e).removeClass(e).addClass(t)
}

function cleanHtml(e) {
  $(e).parent().append($(e).children().html())
}

/**
 * 取得真正的HTML源码
 * @returns {*}
 */
function getSourceHtml() {
  $("#download-layout").children().html($(".demo").html());
  var containerElem = $("#download-layout").children();

  containerElem.find(".preview, .configuration, .drag, .remove").remove();
  containerElem.find(".lyrow").addClass("removeClean");
  containerElem.find(".box-element").addClass("removeClean");
  containerElem.find(".lyrow .lyrow .lyrow .lyrow .lyrow .removeClean").each(function() {
    cleanHtml(this)
  });
  containerElem.find(".lyrow .lyrow .lyrow .lyrow .removeClean").each(function() {
    cleanHtml(this)
  });
  containerElem.find(".lyrow .lyrow .lyrow .removeClean").each(function() {
    cleanHtml(this)
  });
  containerElem.find(".lyrow .lyrow .removeClean").each(function() {
    cleanHtml(this)
  });
  containerElem.find(".lyrow .removeClean").each(function() {
    cleanHtml(this)
  });
  containerElem.find(".removeClean").each(function() {
    cleanHtml(this)
  });
  containerElem.find(".removeClean").remove();

  $("#download-layout .column").removeClass("ui-sortable");
  $("#download-layout .row-fluid").removeClass("clearfix").children().removeClass("column");

  if ($("#download-layout .container").length > 0) {
    changeStructure("row-fluid", "row")
  }

  var formatSrc = $.htmlClean($("#download-layout").html(), {
    format           : true,
    allowedAttributes: [
      ["id"],
      ["class"],
      ["data-toggle"],
      ["data-target"],
      ["data-parent"],
      ["role"],
      ["data-dismiss"],
      ["aria-labelledby"],
      ["aria-hidden"],
      ["data-slide-to"],
      ["data-slide"]
    ]
  });

  return formatSrc;
}

/**
 * 显示布局模板源码
 */
function downloadLayoutSrc() {
  var srcHtml = getSourceHtml();
  $("#downloadModal textarea").empty();
  $("#downloadModal textarea").val(srcHtml);
}

/**
 * 从本地存储加载数据
 * @returns {boolean}
 */
function restoreData() {
  if (supportStorage()) {
    layoutHistory = JSON.parse(localStorage.getItem("layoutData"));
    if (!layoutHistory) return false;
    window.demoHtml = layoutHistory.list[layoutHistory.count - 1];
    if (window.demoHtml) $(".demo").html(window.demoHtml);
  }
}

function initContainer() {
  $(".demo, .demo .column").sortable({
    connectWith: ".column",
    opacity    : .35,
    handle     : ".drag",
    start      : function() {
      if (!stopDrag) stopSave++;
      stopDrag = 1;
    },
    stop       : function() {
      if (stopSave > 0) stopSave--;
      stopDrag = 0;
    }
  });

  configurationElm();
}

/**
 * 初始化编辑器
 */
function initEditor() {
  editorInstance = ace.edit("contentEditor");
  editorInstance.getSession().setMode("ace/mode/html");
  editorInstance.getSession().setTabSize(2);
}

$(document).ready(function() {

  // 加载数据
  restoreData();

  $("body").css("min-height", $(window).height() - 90);
  $(".demo").css("min-height", $(window).height() - 160);

  // 左边菜单项（GRID SYSTEM）的拖拉事件
  $(".sidebar-nav .lyrow").draggable({
    connectToSortable: ".demo",
    helper           : "clone",
    handle           : ".drag",
    start            : function(event, ui) {
      if (!stopDrag) stopSave++;
      stopDrag = 1;
    },
    drag             : function(event, ui) {
      ui.helper.width('400'); // 使拖拉中的UI显示正常
    },
    stop             : function(event, ui) {
      ui.helper.css({width: 'auto', height: 'auto', 'z-index': 'auto'}); // 使其显示正常

      $(".demo .column").sortable({
        opacity    : .35,
        connectWith: ".column",
        start      : function() {
          if (!stopDrag) stopSave++;
          stopDrag = 1;
        },
        stop       : function() {
          if (stopSave > 0) stopSave--;
          stopDrag = 0;
        }
      });
      if (stopSave > 0) stopSave--;
      stopDrag = 0;
    }
  });

  // 左边菜单项（除GRID SYSTEM外）的拖拉事件
  $(".sidebar-nav .box").draggable({
    connectToSortable: ".column",
    helper           : "clone",
    handle           : ".drag",
    start            : function() {
      if (!stopDrag) stopSave++;
      stopDrag = 1;
    },
    drag             : function(event, ui) {
      ui.helper.width('400'); // 使拖拉中的UI显示正常
    },
    stop             : function(event, ui) {
      ui.helper.css({width: 'auto', height: 'auto', 'z-index': 'auto'}); // 使其宽度显示正常

      handleJsIds();
      if (stopSave > 0) stopSave--;
      stopDrag = 0;
    }
  });

  initContainer();

  initEditor();

  // 注册事件
  $('body.edit .demo').on("click", "[data-target=#editorModal]", function(e) {
    e.preventDefault();
    currentEditor = $(this).parent().parent().find('.view');
    var contentHtml = $.htmlClean(currentEditor.html(), {
      format           : true,
      allowedAttributes: [
        ["id"],
        ["class"],
        ["data-toggle"],
        ["data-target"],
        ["data-parent"],
        ["role"],
        ["data-dismiss"],
        ["aria-labelledby"],
        ["aria-hidden"],
        ["data-slide-to"],
        ["data-slide"]
      ]
    });
    editorInstance.setValue(contentHtml);
  });
  $("#saveContent").click(function(e) {
    e.preventDefault();
    currentEditor.html(editorInstance.getValue());
  });
  $("[data-target=#downloadModal]").click(function(e) {
    e.preventDefault();
    downloadLayoutSrc();
  });
  $("[data-target=#saveModal]").click(function(e) {
    e.preventDefault();
    handleSaveLayout();
  });
  $("#edit").click(function() {
    $("body").removeClass("devpreview sourcepreview");
    $("body").addClass("edit");
    removeMenuClasses();
    $(this).addClass("active");
    return false
  });
  $("#clear").click(function(e) {
    e.preventDefault();
    clearDemo()
  });
  $("#devpreview").click(function() {
    $("body").removeClass("edit sourcepreview");
    $("body").addClass("devpreview");
    removeMenuClasses();
    $(this).addClass("active");
    return false
  });
  // 预览事件处理
  $("#sourcepreview").click(function() {
    $("body").removeClass("edit");
    $("body").addClass("devpreview sourcepreview");
    $('body .demo-preview').html(getSourceHtml());

    // 改变按钮选中样式
    removeMenuClasses();
    $(this).addClass("active");

    return false;
  });
  $("#fluidPage").click(function(e) {
    e.preventDefault();
    changeStructure("container", "container-fluid");
    $("#fixedPage").removeClass("active");
    $(this).addClass("active");
    downloadLayoutSrc()
  });
  $("#fixedPage").click(function(e) {
    e.preventDefault();
    changeStructure("container-fluid", "container");
    $("#fluidPage").removeClass("active");
    $(this).addClass("active");
    downloadLayoutSrc()
  });
  $(".nav-header").click(function() {
    $(".sidebar-nav .boxes, .sidebar-nav .rows").hide();
    $(this).next().slideDown()
  });
  $('#undo').click(function() {
    stopSave++;
    if (undoLayout()) initContainer();
    stopSave--;
  });
  $('#redo').click(function() {
    stopSave++;
    if (redoLayout()) initContainer();
    stopSave--;
  });

  bindRemoveElmEvent();

  gridSystemGenerator();

  // 自动保存
  setInterval(function() {
    handleSaveLayout()
  }, timerSave)

});

$(window).resize(function() {
  $("body").css("min-height", $(window).height() - 90);
  $(".demo").css("min-height", $(window).height() - 160)
});
