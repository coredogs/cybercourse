//Wrong way to do it, but it worx.
var evilGlobalController; 

(function($) {
  var done_once = false;
  var controller = Drupal.behaviors.knowledgemap = {
    attach: function(context, settings) {
      if (done_once) {
        return;
      }
      //Set some convenience vars.
      this.km_rep = settings.knowledgemap.knowledgemap_rep;
      var drawing_id = settings.knowledgemap.drawing_dom_id;
      this.$drawing_area = $('#' + drawing_id);
      //Selected item.
      this.selectedItem = '';
      this.selectedConnection = '';
      //Add a toolbar to the drawing.
      this.create_toolbar();
      this.add_methods_to_drawing_area();
      jsPlumb.ready(function() {
        controller.setJsPlumbDefaults();
        controller.drawAllItems();
        controller.drawAllConnections();
        jsPlumb.bind("connection", function(info, evnt) {
          controller.makeNewConnection(info, evnt);
        });            
        jsPlumb.bind("connectionDetached", function(info, evnt) {
          //console.log("Deattach:" + info.connection);
        });  
      });
      //Set up the Add button.
      $("#add-km-item").click(function() {
        //Move into adding state.
        controller.$drawing_area.addClass("adding-state");
        controller.$drawing_area.notify(
                "Click in the drawing area to add a new item.\nEsc to cancel.");
        controller.$drawing_area.state = 'add';
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
        if (controller.$drawing_area.state == "add") {
          controller.add_new_item(evnt.pageX, evnt.pageY);
          evnt.stopPropagation();
        }
        else {
          //Clear selection if there is any.
          controller.clearSelection();
        }
      });
      $(document).keydown(function(evnt) {
        if ( evnt.keyCode == 27 ) {
          //User pressed ESC key.
          if ( controller.$drawing_area.state == "add" ) {
            //Exit add mode.
            evnt.preventDefault();
            controller.$drawing_area.exitAddMode();
          }
          else {
            controller.clearSelection();
            evnt.preventDefault();
          }
        }
      });
      this.$drawing_area.exitAddMode = function() {
        controller.$drawing_area.state = "normal";
        controller.$drawing_area
                .removeClass("adding-state")
                .clear_notification();
        $(".sendback").remove();
      }

    },
    clearSelection : function() {
      //Clear the item selection
      if ( controller.selectedItem ) {
        $("#" + controller.selectedItem.domId).removeClass("selected");
        controller.selectedItem = '';
      }
      if ( controller.selectedConnection ) {
        var conn = controller.selectedConnection.display;
        controller.selectedConnection = '';
        var style = controller.computeConnPaintStyle( conn );
        conn.setPaintStyle( style );
      }      
    },
    setJsPlumbDefaults : function() {
      jsPlumb.importDefaults({
        Anchor: "AutoDefault",
        Endpoint: "Rectangle",
        Detachable: false,
        ReattachConnections : true,
        ConnectionOverlays : [ "PlainArrow" ]
//        ConnectionOverlays : [[ "PlainArrow", { width : 20 } ]]
      });
      //Paint styles for connections.
      //They need to be merged to get the right effects.
      controller.requiredPaintStyle = {
        dashstyle: "solid"
      };
      controller.recommendedPaintStyle = {
        dashstyle: "2 2"
      };
      controller.selectedPaintStyle = {
        lineWidth: 4,
        strokeStyle: "#1E90FF"
      };
      controller.unselectedPaintStyle = {
        lineWidth: 2,
        strokeStyle: "#4B0082"
      };
      controller.defaultConnSourceAttribs = {
        anchor: "AutoDefault",
        filter:".connection-control",
        endpoint: "Blank"
      };
      controller.defaultConnTargetAttribs = {
        anchor: "AutoDefault",
                isTarget: true,
        endpoint: "Blank"
      };
    },
    drawAllItems : function() {
      //Draw all the items in the knowledge map.
      var items = this.km_rep.km_items;
      for ( var index in items ) {
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
      $item.click( function(evnt) {
        //Clicked on an item. 
        var newDomId = $(evnt.currentTarget).attr('id');
        var newNid = newDomId.replace("km-item-", "");
        //Clicked on selected item?
        if ( controller.selectedItem && newDomId == controller.selectedItem.domId ) {
          //Unselect it.
          controller.clearSelection();
          evnt.stopPropagation();
        }
        else {
          //Unselect the old one.
          controller.clearSelection();
          //Select the new item.
          controller.selectedItem = {
            'domId' : newDomId,
            'nid' : newNid
          };
          $("#" + newDomId).addClass("selected");
          evnt.stopPropagation();
        }
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
      //Make the item draggable.
      jsPlumb.draggable(
        $item, {
          containment : "parent",
          stop : function(evnt, ui) {
            //WHen KM item dragged, save its new position.
            controller.saveNewPosition( evnt, ui );
          }
        }
      );
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
      var connections = this.km_rep.connections;
      for ( var index in connections ) {
        controller.drawConnection( connections[index] );
      }
    },
    drawConnection : function(connData) {
      var connection = jsPlumb.connect({
        source : "km-item-" + connData.from_nid, 
        target : "km-item-" + connData.to_nid,
        //Add the relationship id, index into km_rep.
        'parameters' : { 'rid' : connData.rid }
      });
      connection.setPaintStyle(
        controller.computeConnPaintStyle( connection )
      );
      //Store ref to the new connection in the map array.
      controller.km_rep.connections[connData.rid].display = connection;
      connection.bind("click", function(conn, evnt) {
        controller.connectionClicked( conn, evnt );
      });
    },
    connectionClicked : function( conn, evnt ) {
      var rid = conn.getParameter('rid');
      //Unselect if clicked on selected conn.
      if ( controller.selectedConnection 
              && controller.selectedConnection.rid == rid ) {
        controller.clearSelection();
        evnt.stopPropagation();
      }
      else {
        //Clicked on a conn not selected.
        controller.clearSelection();
        controller.selectedConnection = {
          'rid' : rid,
          'display' : conn
        };
        conn.setPaintStyle( controller.computeConnPaintStyle( conn ) );
        evnt.stopPropagation();
      }
    },
    computeConnPaintStyle : function( conn ) {
      //Compute the style for a connection, based on its type, and whether
      //it is selected.
      var rid = conn.getParameter('rid');
      var selected = ( 
           controller.selectedConnection
        && controller.selectedConnection.rid == rid 
      );
      var required = controller.km_rep.connections[rid].required;
      var base = $.extend( {}, 
                      selected 
                        ? controller.selectedPaintStyle 
                        : controller.unselectedPaintStyle
                 );
      $.extend( base, ( required == 'required' )
                  ? controller.requiredPaintStyle
                  : controller.recommendedPaintStyle
              );
      return base;
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
          title: "Add new item",
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
                //Create data record.
                var newItem = controller.createNewItemFromInput();
                $.ajax({
                  type: "POST",
                  url: Drupal.settings.basePath + 'add-km-item-ajax',
                  data: newItem,
                  success: function(data, textStatus, jqXHR) {
                    if ( data.status == 'success' ) {
                      //Add data record to map array.
                      newItem.nid = data.new_nid;
                      controller.km_rep.km_items[newItem.nid] = newItem;
                      //Draw the new item.
                      controller.drawItem(newItem);
                      $dialogRef.dialog("close");
                      controller.$drawing_area.exitAddMode();
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
              controller.$drawing_area.exitAddMode();
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
      //Kill the selection.
      controller.clearSelection();
      //Adjust X and Y to make them relative to the drawing area.
      coord_x -= controller.$drawing_area.position().left;
      coord_y -= controller.$drawing_area.position().top;
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
      //Kill the selection.
      controller.clearSelection();
      //Check whether the connection is allowed. Modify if necessary.
      if ( this.checkConnection( connInfo ) ) {
        //Tell the server about it.
        this.saveConnectionToServer( connInfo );
        //Set the style of the connection.
        var connection = connInfo.connection;
        connection.setPaintStyle(
            controller.computeConnPaintStyle( connection )
        );
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
      if ( sourceNid == targetNid ) {
        message = "Sorry, you cannot connect an element to itself.\n\n"
                + "If you can think of a good reason why you would want to, "
                + "please let Kieran know.";
        alert( message );
        return false;
      }
      
      if ( sourceCategory == 'experience' && targetCategory  == 'experience' ) {
        message = "Are you sure you want to link two experiences?" + 
                "\n\nNormally, experiences are only linked to knowledge " +
                "elements (skills or concepts).";
      }
      if ( sourceCategory == 'knowledge' && targetCategory  == 'experience' ) {
        // @todo Offer to flip the link.
        message = "Are you sure you want to link from a knowledge element "
                  + "to an experience?" 
                  + "\n\nNormally, experiences are the sources of links, and knowledge "
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
      var result = this.getItemData( itemNid );
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
    },
    saveNewPosition : function ( evnt, ui ) {
      //Save the new position of an item.
      var coord_x = ui.position.left;
      var coord_y = ui.position.top;
      var domId = evnt.target.id;
      var kmItemNid = domId.replace("km-item-", "")
      $.ajax({
        type: "POST",
        url: Drupal.settings.basePath + 'update-km-item-pos',
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
    },
    saveConnectionToServer : function ( connInfo ) {
      //Save data about a new connection to the server.
      //@todo Spinny thing.
      var sourceNid = connInfo.sourceId.replace("km-item-", "");
      var targetNid = connInfo.targetId.replace("km-item-", "");
      var required = "required";
      $.ajax({
        type: "POST",
        async: false,
        url: Drupal.settings.basePath + 'save-new-connection',
        data: {
          "source_km_item_nid" : sourceNid,
          "target_km_item_nid" : targetNid,
          "required" : required
        },
        success: function(data, textStatus, jqXHR) {
          if ( data.status == 'success' ) {
            //Add to map data array.
            var rid = data.rid;
            controller.km_rep.connections[rid] = {
              "rid" : rid,
              "from_nid" : sourceNid,
              "to_nid" : targetNid,
              "required" : "required",
              "display" : connInfo.connection
            };
            //Store rid in display object.
            connInfo.connection.setParameter('rid', rid);
          }
          else {
            alert(data.message + " You should refresh the page.");
          }
        },
        fail: function (jqXHR, textStatus) {
          alert( "Request failed: " + textStatus + " You should refresh the page.");
        },
      });
      
    }
  };
  evilGlobalController = controller;
})(jQuery);

