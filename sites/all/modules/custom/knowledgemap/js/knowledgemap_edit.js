//Wrong way to do it, but it worx.
var evilGlobalController; 

(function($) {
  var done_once = false;
//  $.fn.drawItem = function(data) {
//    controller.drawItem(data);
//  };
//  $.fn.exitAddMode = function(data) {
//    $drawing_area.exitAddMode(data);
//  };
  var controller = Drupal.behaviors.knowledgemap = {
    attach: function(context, settings) {
      if (done_once) {
        return;
      }
      //Set some convenience vars.
      this.km_rep = settings.knowledgemap.knowledgemap_rep;
      var drawing_id = settings.knowledgemap.drawing_dom_id;
      this.$drawing_area = $('#' + drawing_id);
      //Add a toolbar to the drawing.
      this.create_toolbar();
      this.add_methods_to_drawing_area();
      jsPlumb.ready(function() {
        controller.setJsPlumbDefaults();
        controller.drawAllItems();
        controller.drawAllConnections();
        jsPlumb.bind("connection", function(info, evnt) {
          controller.makeNewConnection(info, evnt);
//          console.log("Attach:" + info.connection);
        });            
        jsPlumb.bind("connectionDetached", function(info, evnt) {
          console.log("Deattach:" + info.connection);
        });  
      });
      //Set up the Add button.
      $("#add-km-item").click(function() {
        //Move into adding state.
        this.$drawing_area.addClass("adding-state");
        this.$drawing_area.notify(
                "Click in the drawing area to add a new item.\nEsc to cancel.");
        this.$drawing_area.state = 'add';
        return false; //No propagation. 
      });
      //Create the add-new form.
      this.createAddForm();
      done_once = true;
    },
    //Create a toolbar for thr drawing area.
    create_toolbar: function() {
      this.$drawing_area.prepend(
              '<div class="km-toolbar">' +
              '  <input id="add-km-item" type="button" class="form-submit" value="Add item" />' +
              '   <span id="drawing-message"></span>' +
              '</div>'
              );
    },
    add_methods_to_drawing_area: function() {
      this.$drawing_area.notify = function(message) {
        $("#drawing-message")
                .hide()
                .html(message)
                .show('medium');
      }
      this.$drawing_area.clear_notification = function() {
        $("#drawing-message")
                .hide('medium')
                .html('');
      }
      this.$drawing_area.state = 'normal';
      this.$drawing_area.click(function(evnt) {
        if (this.$drawing_area.state == "add") {
          controller.add_new_item(evnt.pageX, evnt.pageY);
        }
      });
      $(document).keydown(function(evnt) {
        if (evnt.keyCode == 27 && this.$drawing_area.state == "add") {
          evnt.preventDefault();
          this.$drawing_area.exitAddMode();
        }
      });
      this.$drawing_area.exitAddMode = function() {
        this.$drawing_area.state = "normal";
        this.$drawing_area
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
        ReattachConnections : true,
        ConnectionOverlays : [ "PlainArrow" ]
      });
      controller.requiredPaintStyle = {
        strokeStyle: "blue",
        lineWidth: 2,
        dashstyle: "solid"
      };
      controller.recommendedPaintStyle = {
        strokeStyle: "blue",
        lineWidth: 2,
        dashstyle: "2 2"
      };  
      controller.defaultConnSourceAttribs = {
        anchor: "AutoDefault",
        filter:".connection-control",
        endpoint: "Rectangle"
      };
      controller.defaultConnTargetAttribs = {
        anchor: "AutoDefault",
                isTarget: true,
        endpoint: "Dot"
      };
    },
    drawAllItems : function() {
      //Draw all the items in the knowledge map.
      var items = this.km_rep.km_items;
      for ( index in items ) {
        controller.drawItem( items[index] );
      };
    },
    drawItem : function (itemData) {
      var html =
          "<div id='km-item-" + itemData.nid + "' "
          +      "class='km-item " + itemData.item_type + "'>"
          + "<header>"
          + "  <h1 class='title'>" + trimLR(itemData.title) 
          + "  </h1>"
          + "</header>"
          + "<section class='km-item-type'>"
          +    capitaliseFirstLetter( itemData.item_type )
          + "</section> "
          + "<footer>"
          + "  <div class='connection-control'>●</div>"
          + "</footer>"
          + "</div>";
      //Make a DOM element.
      var $item = $(html);
      //Set position.
      $item.css({
        "left": parseInt(itemData.coord_x),
        "top": parseInt(itemData.coord_y)
      });
      $item.dblclick(function(evnt) {
        //Double-clicked on an item. 
        //Get a viewer for it.
        var viewer = controller.getKmItemViewer(itemData);
        viewer.open();
      });
      jsPlumb.makeSource(
        $item, 
        controller.defaultConnSourceAttribs
      );
      jsPlumb.makeTarget(
          $item, controller.defaultConnTargetAttribs
      );
      jsPlumb.draggable(
        $item, {
        containment:"parent",
        stop : function(evnt, ui) {
          var coord_x = ui.position.left;
          var coord_y = ui.position.top;
          var domId = evnt.target.id;
          var kmItemNid = domId.replace("km-item-", "")
          $.ajax({
            type: "POST",
            url: Drupal.settings.basePath + 'update-km-item-pos/nojs',
            data: {
              "coord_x" : coord_x,
              "coord_y" : coord_y,
              "km_item_nid" : kmItemNid
            },
            success: function(data, textStatus, jqXHR) {
              if ( data.status == 'success' ) {
                //Nowt to do.
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
      });
      //Append to the drawing.
      this.$drawing_area.append($item);
      //Adjust map dimensions to fit new item.
      //Compute pos of right edge of item.
      var itemRight = $item.position().left + $item.outerWidth();
      //Add a bit for look.
      var itemRightExtra = itemRight + 10;
      //Check drawing area width.
      if ( itemRightExtra > this.$drawing_area.width() ) {
        this.$drawing_area.width( itemRightExtra );
      }
      //Compute pos of item bottom.
      var itemBottom = $item.position().top + $item.outerHeight();
      //Add a bit for look.
      var itemBottomExtra = itemBottom + 10;
      //Check drawing area width.
      if ( itemBottomExtra > this.$drawing_area.height() ) {
        this.$drawing_area.height( itemBottomExtra );
      }      
    },
    updateItemFields : function ( nid ) {
      $("#km-item-" + nid + " header h1").html(this.km_rep.km_items[nid].title); 
    },
    drawAllConnections : function() {
      //Draw all the connections in the knowledge map.
      $(this.km_rep.connections).each(function(index, connection){
        controller.drawConnection(connection);
      });      
    },
    drawConnection : function(connection) {
      jsPlumb.connect({
       source : "km-item-" + connection.from_nid, 
       target : "km-item-" + connection.to_nid,
       paintStyle: connection.required == 'required' 
          ? controller.requiredPaintStyle : controller.recommendedPaintStyle
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
                  data: newItem,
                  success: function(data, textStatus, jqXHR) {
                    if ( data.status == 'success' ) {
                      $dialogRef.dialog("close");
                      this.$drawing_area.exitAddMode();
                      newItem.nid = data.new_nid;
                      controller.drawItem(newItem);
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
      //Adjust X and Y to make them relative to the drawing area.
      coord_x -= $drawing_area.position().left;
      coord_y -= $drawing_area.position().top;
      $('#add-new-title').val('');
      $('#add-new-type').val('');
      $("#coord_x").val(coord_x);
      $("#coord_y").val(coord_y);
 $('#add-new-type').val('example'); //TEMP      
      $("#add-new-form").dialog("open");
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
    errorThrown: function(message) {
      alert(message);
      return false;
    },
    makeNewConnection: function(connInfo, evnt) {
      //Check whether the connection is allowed. Modify if necessary.
      if ( this.checkConnection( connInfo ) ) {
        var connection = connInfo.connection;
        //Set the style of the link.
        connection.setPaintStyle( controller.requiredPaintStyle );
        //Tell the server about it.
        
      }
    },
    checkConnection: function ( connInfo ) {
      //Check for duplicate connection.
      var allConn = jsPlumb.getAllConnections().jsPlumb_DefaultScope;
      var length = allConn.length;
      for (var i = 0; i < length; i++) {
        if (    allConn[i].sourceId == connInfo.sourceId 
             && allConn[i].targetId == connInfo.targetId 
           ) {
          //Ids are the same, but this might be connection just made.
          if ( connInfo.connection != allConn[i] ) {
            alert("Those two elements are already connected.");
            //Kill the connection.
            jsPlumb.detach( connInfo.connection );
            return false;
          }
        }
      }
      //Get the end types.
      var sourceId = connInfo.sourceEndpoint.elementId;
      var sourceNid = sourceId.replace("km-item-", "");
      var sourceType = this.getItemType( sourceNid );
      if ( sourceType == 'not found' ) {
        throw "Source item not found. nid: " + sourceNid;
      }
      var sourceCategory = this.getItemCategory( sourceType );
      if ( sourceCategory == "unknown" ){
        throw "Source item type bad. Type: " + sourceType;
      }
      //Get data about connection target.
      var targetId = connInfo.targetEndpoint.elementId;
      var targetNid = targetId.replace("km-item-", "");
      var targetType = this.getItemType( targetNid );
      if ( targetType == 'not found' ) {
        throw "Target item not found. nid: " + targetNid;
      }
      var targetCategory = this.getItemCategory( targetType );
      if ( targetCategory == "unknown" ){
        throw "Target item type bad. Type: " + targetType;
      }
      //Warn user about potential problems.
      var message = '';
      if ( sourceCategory == 'experience' && targetCategory  == 'experience' ) {
        message = "Are you sure you want to link two experiences?" + 
                "\n\nNormally, experiences are only linked to knowledge " +
                "elements (skills or concepts).";
      }
      if ( sourceCategory == 'knowledge' && targetCategory  == 'experience' ) {
        // @todo Offer to flip the link.
        message = "Are you sure you want to link from a knowledge element "
                  + "to an experience?" 
                  + "\n\nNormally, experiences are the sources of links, and knowledge " +
                  + "elements (skills or concepts) are the targets.";
      }
      if ( message ) {
        var response = confirm( message );
        if ( ! response ) {
          //Kill the connection.
          jsPlumb.detach( connInfo.connection );
          return false;
        }
      }
      return true;
    },
    getItemType : function( itemNid ) {
      var result = getItemData( itemNid );
      if ( result != 'not found' ) {
        result = result.item_type;
      } 
      return result;
    },
    getItemData : function( itemNid ) {
      //Fetch item data for the item with the given nid.
      var items = this.km_rep.km_items;
      for ( var index in items ) {
        if ( items[index].nid == itemNid ) {
          return items[index];
        }
      }
      return 'not found';      
    },
    getItemCategory : function( itemType ) {
      var category = "unknown";
      switch ( itemType ) {
        case 'concept':
          category = 'knowledge';
          break;
        case 'skill':
          category = 'knowledge';
          break;
        case 'explanation':
          category = 'experience';
          break;
        case 'example':
          category = 'experience';
          break;
        case 'exercise':
          category = 'experience';
          break;
        case 'pattern':
          category = 'experience';
          break;
        }
        return category;
    },
    kmItemViewers : new Array(),
    getKmItemViewer : function( itemData ) {
      //Get an item viewer, either existing or new.
      if ( ! controller.kmItemViewers[ itemData.nid ] ) {
        controller.kmItemViewers[ itemData.nid ] 
          = new KmItemViewer(itemData);
      }
      return controller.kmItemViewers[ itemData.nid ];
    }
  };
  evilGlobalController = controller;
})(jQuery);

