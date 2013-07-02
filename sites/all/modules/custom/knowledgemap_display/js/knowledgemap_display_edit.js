(function ($) {
  var $drawing_area, $selected_area;
  var done_once = false;
  var km_coord_x, km_coord_y;
	$.fn.drawItem = function(data) {
    controller.drawItem(data);
  };
	$.fn.exitAddMode = function(data) {
    $drawing_area.exitAddMode(data);
  };
  var controller = Drupal.behaviors.knowledgemap_display = {
    attach: function(context, settings) {
      if ( done_once ) {
        return;
      }
      var knowledgemap_rep 
          = settings.knowledgemap_display.knowledgemap_rep;
      var drawing_id = settings.knowledgemap_display.drawing_dom_id;
      $drawing_area = $('#' + drawing_id);
      var item_id = settings.knowledgemap_display.item_dom_id;
      $selected_area = $('#' + item_id);
      //Add a toolbar to the drawing.
      this.create_toolbar();
      this.add_methods_to_drawing_area();
      $("#add-km-item").click(function(){
        //Move into adding state.
        $drawing_area.addClass("adding-state");
        $drawing_area.notify(
            "Click in the drawing area to add a new item.\nEsc to cancel.");
        $drawing_area.state = 'add';
        return false; //No propagation. 
      });
      done_once = true;
    },
    //Create a toolbar for thr drawing area.
    create_toolbar: function() {
      $drawing_area.prepend(
          '<div class="km-toolbar">' +
          '  <input id="add-km-item" type="button" class="form-submit" value="Add item" />' +
          '   <span id="drawing-message"></span>' +
          '</div>'
      );
    },
    add_methods_to_drawing_area: function() {
      $drawing_area.notify = function(message) {
        $("#drawing-message")
                .hide()
                .html(message)
                .show('medium');
      }
      $drawing_area.clear_notification = function() {
        $("#drawing-message")
          .hide('medium')
          .html('');
      }
      $drawing_area.state = 'normal';
      $drawing_area.click(function(evnt){
        if ( $drawing_area.state == "add" ) {
          controller.add_new_item(evnt.pageX, evnt.pageY);
        }
      });
      $(document).keydown(function(evnt) {
        if ( evnt.keyCode == 27 && $drawing_area.state == "add" ) {
          evnt.preventDefault();
          $drawing_area.exitAddMode();
        }
      });
      $drawing_area.exitAddMode = function() {
        $drawing_area.state = "normal";
        $drawing_area
            .removeClass("adding-state")
            .clear_notification();
        $(".sendback").remove();
      }

    },
    //User wants to add a new item at the clicked location.
    add_new_item: function(coord_x, coord_y) {
      //Create some fake <a>s, so that Drupal's client side will send their
      //ids back to the server in a post. 
      //I can't figure out a better way to do this. 
      $(".sendback").remove();
      var fakeLinkX = controller.makeFakeLink('sendback-x-', coord_x);
      $("body").append(fakeLinkX);
      var fakeLinkY = controller.makeFakeLink('sendback-y-', coord_y);
      $("body").append(fakeLinkY);
      var fakeLinkKmNid = controller.makeFakeLink(
          'sendback-km_nid-',
          Drupal.settings.knowledgemap_display.km_nid
      );
      $("body").append(fakeLinkKmNid);
      $("#km_hidden_add_link a").click();
    },
    drawItem: function(data) {
      var template = 
        "<div class='km-item " + data.item_type + "'>" +
        "  <div class='title'>" + data.title + "</div>"
        "</div>";
      //Make a DOM element.
      var item = $(template);
      //Append to the drawing.
      $drawing_area.append(item);
      //Set position.
      $(item).css({
        "left": parseInt(data.x),
        "top": parseInt(data.y)
      });
    },
    makeFakeLink: function( idFront, idBack ) {
      return $("<a href='#' id='" + idFront + idBack + "' "
          + " class='use-ajax ajax-processed sendback'>.</a>")
    },
    errorThrown: function(message) {
      alert(message);
      return false;
    },
    nothing_to_do: function(response, status) {
      Drupal.ajax.prototype.success(response, status);
//      Drupal.CTools.Modal.show(stuff);
      //Nothing to do.
    }
  }
})(jQuery);
