(function ($) {
  var $drawing_area;
  var done_once = false;
  var km_nid;
//  var km_coord_x, km_coord_y;
	$.fn.drawItem = function(data) {
    controller.drawItem(data);
  };
	$.fn.exitAddMode = function(data) {
    $drawing_area.exitAddMode(data);
  };
  var controller = Drupal.behaviors.knowledgemap = {
    attach: function(context, settings) {
      if ( done_once ) {
        return;
      }
      var knowledgemap_rep 
          = settings.knowledgemap.knowledgemap_rep;
      km_nid = settings.knowledgemap.km_nid;
      var drawing_id = settings.knowledgemap.drawing_dom_id;
      $drawing_area = $('#' + drawing_id);
      //Add a toolbar to the drawing.
      this.create_toolbar();
      this.add_methods_to_drawing_area();
      //Set up the Add button.
      $("#add-km-item").click(function(){
        //Move into adding state.
        $drawing_area.addClass("adding-state");
        $drawing_area.notify(
            "Click in the drawing area to add a new item.\nEsc to cancel.");
        $drawing_area.state = 'add';
        return false; //No propagation. 
      });
      done_once = true;
      
      $("body").append("<div id='add-item-form' title='Add item'></div>");
      
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
      alert('ad new');
      var bp_place = 9;
//      $.get(
//          Drupal.settings.basePath + 'add-km-item/ajax/' 
//            + coord_x + '/' + coord_y
//      );
//        return;
      $.ajax({
        //url: Drupal.settings.basePath + 'add-km-item/ajax',
url: Drupal.settings.basePath + 'add-km-item/ajax/' 
            + coord_x + '/' + coord_y + '/' + km_nid,        
        dataType: 'json',
//        data:{
//          'coord_x' : coord_x,
//          'coord_y' : coord_y,
//        },
        success: function(data, textStatus, jqXHR){
          //Get to here, then the add form has been sucessfully generated and
          //returned.
          alert('in sucess');
          var bp_place = 5;
          var options = {
            'title' : 'New knowledge item',
            'width' : '500',
            'height' : 'auto',
            'position' : 'center'
          };
          $("#add-item-form").html(data);
          $("#add-item-form").dialog(options);
          if(data[1].data !== undefined){
            // the view results will be in data[1].data
          }
        }
      })

      
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
