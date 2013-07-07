(function($) {
  var $drawing_area;
  var km_rep; //Data representing map.
  var done_once = false;
  $.fn.drawItem = function(data) {
    controller.drawItem(data);
  };
  $.fn.exitAddMode = function(data) {
    $drawing_area.exitAddMode(data);
  };
  var requiredPaintStyle = {
    strokeStyle: "blue",
    lineWidth: 2,
    dashstyle: "solid"
  };
  var recommendedPaintStyle = {
    strokeStyle: "blue",
    lineWidth: 2,
    dashstyle: "2 2"
  };  
  var defaultConnSourceAttribs = {
    anchor: "AutoDefault",
            filter:"span",
    endpoint: "Rectangle"
  };
  var defaultConnTargetAttribs = {
    anchor: "AutoDefault",
            isTarget: true,
    endpoint: "Dot"
  };
  var controller = Drupal.behaviors.knowledgemap = {
    attach: function(context, settings) {
      if (done_once) {
        return;
      }
      km_rep = settings.knowledgemap.knowledgemap_rep;
      var drawing_id = settings.knowledgemap.drawing_dom_id;
      $drawing_area = $('#' + drawing_id);
      //Add a toolbar to the drawing.
      this.create_toolbar();
      this.add_methods_to_drawing_area();
      this.drawAllItems();
      jsPlumb.ready(function() {
        controller.setJsPlumbDefaults();
        controller.drawAllConnections();
        jsPlumb.bind("connection", function(info, originalEvent) {
          console.log("Attach:" + info.connection);
        });            
        jsPlumb.bind("connectionDetached", function(info, originalEvent) {
          console.log("Deattach:" + info.connection);
        });  
      });
      //Set up the Add button.
      $("#add-km-item").click(function() {
        //Move into adding state.
        $drawing_area.addClass("adding-state");
        $drawing_area.notify(
                "Click in the drawing area to add a new item.\nEsc to cancel.");
        $drawing_area.state = 'add';
        return false; //No propagation. 
      });
      //Create the add-new form.
      this.createAddForm();
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
      $drawing_area.click(function(evnt) {
        if ($drawing_area.state == "add") {
          controller.add_new_item(evnt.pageX, evnt.pageY);
        }
      });
      $(document).keydown(function(evnt) {
        if (evnt.keyCode == 27 && $drawing_area.state == "add") {
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
    setJsPlumbDefaults : function() {
      jsPlumb.importDefaults({
        Anchor: "AutoDefault",
        Endpoint: "Rectangle",
        Detachable: true,
        ReattachConnections : false,
        ConnectionOverlays : [ "PlainArrow" ]
      });	          
    },
    drawAllItems : function() {
      //Draw all the items in the knowledge map.
      $(km_rep.km_items).each(function(index, item){
        controller.drawItem(item);
      });
    },
    drawItem : function (itemData) {
      var html =
          "<div id='km-item-" + itemData.nid + "' "
          +      "class='km-item " + itemData.item_type + "'>"
          + "<header>"
          + "  <h1 class='title'>" + itemData.title + "<span>●</span></h1>"
          + "</header>"
          + "<section>"
          +    itemData.body
          + "</section> "
          + "</div>";
      //Make a DOM element.
      var $item = $(html);
      //Set position.
      $item.css({
        "left": parseInt(itemData.coord_x),
        "top": parseInt(itemData.coord_y)
      });
      $item.dblclick(function(evnt) {
        alert(5);
      });
      jsPlumb.makeSource(
         $item, 
        defaultConnSourceAttribs
      );
      jsPlumb.makeTarget(
          $item, defaultConnTargetAttribs
      );
      jsPlumb.draggable(
        $item, {
        containment:"parent"
      });
      //Append to the drawing.
      $drawing_area.append($item);
      //Adjust map dimensions to fit new item.
      //Compute pos of right edge of item.
      var itemRight = $item.position().left + $item.outerWidth();
      //Add a bit for look.
      var itemRightExtra = itemRight + 10;
      //Check drawing area width.
      if ( itemRightExtra > $drawing_area.width() ) {
        $drawing_area.width( itemRightExtra );
      }
      //Compute pos of item bottom.
      var itemBottom = $item.position().top + $item.outerHeight();
      //Add a bit for look.
      var itemBottomExtra = itemBottom + 10;
      //Check drawing area width.
      if ( itemBottomExtra > $drawing_area.height() ) {
        $drawing_area.height( itemBottomExtra );
      }      
    },
    drawAllConnections : function() {
      //Draw all the connections in the knowledge map.
      $(km_rep.connections).each(function(index, connection){
        controller.drawConnection(connection);
      });      
    },
    drawConnection : function(connection) {
      jsPlumb.connect({
       source : "km-item-" + connection.from_nid, 
       target : "km-item-" + connection.to_nid,
       paintStyle: connection.required == 'required' 
          ? requiredPaintStyle : recommendedPaintStyle
     });
    },
    createAddForm: function() {
      var formHtml = "<form id='add-new-form'>"
              + "Title:<input type='text' name='add-new-title' id='add-new-title'><br>"
              + "Type: <input type='text' name='add-new-type' id='add-new-type'>"
              + "<input type='hidden' name='coord_x' id='coord_x'>"
              + "<input type='hidden' name='coord_y' id='coord_y'>"
              + "<input type='hidden' name='km_nid' id='km_nid'>"
              + "</form>";
      $("body").append(formHtml);
      $("#add-new-form")
        .hide()
        .dialog({
          autoOpen: false,
          height: 500,
          width: 700,
          modal: true,
          buttons: {
            "Save": function() {
              var newTitle = $('#add-new-title').val();
              var newType = $('#add-new-type').val();
              var errorMessage = controller.checkNewItemData(newTitle, newType);
              if ( errorMessage != '') {
                alert(errorMessage);
              }
              else {
                var $dialogRef = $(this);
                var newItem = controller.createNewItemFromInput();
                $.ajax({
                  type: "POST",
                  url: Drupal.settings.basePath + 'add-km-item-ajax',
                  data: item,
                  success: function(data, textStatus, jqXHR) {
                    if ( data.status == 'success' ) {
                      $dialogRef.dialog("close");
                      $drawing_area.exitAddMode();
                      controller.drawNewItem(newItem);
                    }
                    else {
                      alert(data.message);
                    }
                  },
                  fail: function (jqXHR, textStatus) {
                    alert( "Request failed: " + textStatus );
                  },
                });
              }
            },
            "Cancel": function() {
              $(this).dialog("close");
              $drawing_area.exitAddMode();
            }
          },
          close: function() {
          }
        }); //End .dialog.
    },
    createNewItemFromInput: function() {
      var newItem = {
        'title' : $("#add-new-title").val(),
        'item_type' : $("#add-new-type").val(),
        'coord_x' : $("#coord_x").val(),
        'coord_y' : $("#coord_y").val(),
        'km_nid' : Drupal.settings.knowledgemap.km_nid
      };
      return newItem;
    },
    //User wants to add a new item at the clicked location.
    add_new_item: function(coord_x, coord_y) {
      $('#add-new-title').val('');
      $('#add-new-type').val('');
      $("#coord_x").val(coord_x);
      $("#coord_y").val(coord_y);
 $('#add-new-type').val('example'); //TEMP      
      $("#add-new-form").dialog("open");
    },
    oldAddCode: function() {
//      alert('ad new');
//      var bp_place = 9;
//      $.ajax({
//        url: Drupal.settings.basePath + 'add-km-item/ajax/'
//                + coord_x + '/' + coord_y + '/' + km_nid,
//        dataType: 'json',
//        success: function(data, textStatus, jqXHR) {
//          //Get to here, then the add form has been sucessfully generated and
//          //returned.
//          alert('in sucess');
//          var bp_place = 5;
//          var options = {
//            'title': 'New knowledge item',
//            'width': '500',
//            'height': 'auto',
//            'position': 'center'
//          };
//          $("#add-item-form").html(data);
//          $("#add-item-form").dialog(options);
//          if (data[1].data !== undefined) {
//            // the view results will be in data[1].data
//          }
//        }
//      })
    },
    checkNewItemData: function(itemTitle, itemType) {
      var msg = '';
      if ( ! itemTitle ) {
        msg += " Please enter a title.";
      }
      if ( ! itemType ){
        msg += " Please enter a type.";
      }
      return msg;
    },
    drawNewItem: function(newItem) {
      var template =
              "<div class='km-item " + newItem.type + "'>" +
              "  <div class='title'>" + newItem.title + "</div>"
      "</div>";
      //Make a DOM element.
      var item = $(template);
      //Append to the drawing.
      $drawing_area.append(item);
      //Set position.
      $(item).css({
        "left": parseInt(newItem.coord_x),
        "top": parseInt(newItem.coord_y)
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
