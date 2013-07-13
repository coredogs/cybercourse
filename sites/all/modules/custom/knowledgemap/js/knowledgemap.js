//Wrong way to do it, but it worx.
var evilGlobalController; 

(function($) {
  var done_once = false;
  var controller = Drupal.behaviors.knowledgemap = {
    attach: function(context, settings) {
      if (done_once) {
        return;
      }
      // @todo Show swirly thing.
      //Set some convenience vars.
      //Mode - edit or view.
      this.mode = settings.knowledgemap.mode;
      this.km_rep = settings.knowledgemap.knowledgemap_rep;
      var drawing_id = settings.knowledgemap.drawing_dom_id;
      this.$drawing_area = $('#' + drawing_id);
      this.$drawing_area.resizable({ handles: "s" });
      this.$itemToolbar = {}; //Make it later.
      this.$connectionToolbar = {}; //Make it later.
      this.$connectionFrom = {}; //Item title for toolbar. 
      this.$connectionTo = {}; //Item title for toolbar. 
      this.maxY = 0; //Highest Y coord.
      //Selected item.
      this.selectedItem = '';
      this.selectedConnection = '';
      if ( this.mode == "edit" ) {
        //Hide the link created by CTools for modal node edit form.
        $(".km-item-edit-link-original").hide();
        //Load the HTML for the add form.
        this.loadAddFormHtml(); 
        //Add a toolbar to the drawing.
        this.createTopToolbar();
      } // End mode == edit
      this.add_methods_to_drawing_area();
      jsPlumb.ready(function() {
        controller.setJsPlumbDefaults();
        controller.drawAllItems();
        controller.drawAllConnections();
        controller.adjustDrawingHeight();
        if ( controller.mode == "edit" ) {
          jsPlumb.bind("connection", function(info, evnt) {
            controller.makeNewConnection(info, evnt);
          });            
//        jsPlumb.bind("connectionDetached", function(info, evnt) {
//          console.log("Deattach:" + info.connection);
//        });
        }
      });
      //Create the floating toolbars.
      this.createFloatingToolbars();
      done_once = true;
    },
    loadAddFormHtml : function() {
      //Load the HTML for the add form from the server.
      $.ajax({
        type: "POST",
        url: Drupal.settings.basePath + 'get-add-form-content-ajax',
        success: function(data, textStatus, jqXHR) {
          if ( data.status == 'success' ) {
            $("body").append(data.form);
            $("#km-add-new-item-container").hide();
            $("#km-add-item-help").collapse();
            //Set up the dialog.
            controller.createAddForm();
          }
          else {
            alert(data.message);
          }
        },
        fail: function(jqXHR, textStatus) {
          alert( "Request failed: " + textStatus );
        }
      });
    },
    //Create a toolbar for thr drawing area.
    createTopToolbar: function() {
      this.$drawing_area.prepend(
              '<div class="km-toolbar">' +
              '  <input id="add-km-item" type="button" class="form-submit" value="Add item" />' +
              '   <span id="drawing-message"></span>' +
              '</div>'
              );
      //Set up the Add button.
      $("#add-km-item").click(function(evnt) {
        controller.clearSelection();
        //If already in add, exit state.
        if ( controller.$drawing_area.state == 'add') {
          //Exit add mode.
          evnt.stopPropagation();
          controller.$drawing_area.exitAddMode();
          return;
        }
        //Move into adding state.
        evnt.stopPropagation();
        controller.$drawing_area.addClass("adding-state");
        controller.$drawing_area.notify(
              "Click in the drawing area to add a new item.\n"
            + "Click Add again to cancel.");
        controller.$drawing_area.state = 'add';
        return false; //No propagation. 
      });
    },
    createFloatingToolbars: function() {
      var itemToolbar = $(
          "<div id='km-item-toolbar' class='knowledgemap-toolbar'>"
        +   "<div id='km-item-show-details' "
        +        "class='knowledgemap-toolbar-link'>Details</div>"
        + "</div>"
      );
      controller.$drawing_area.append(itemToolbar);
      controller.$itemToolbar = itemToolbar;
      $("#km-item-show-details").click(function(evnt) {
        //Get the selected item's data.
        var itemNid = controller.selectedItem.nid;
        var itemData = controller.km_rep.km_items[itemNid];
        //Get a viewer for it.
        var viewer = controller.getKmItemViewer(itemData);
        viewer.open( evnt );
      });
      if ( controller.mode == "edit" ) {
        //Set up the connection toolbar.
        var connectionToolbar = $(
            "<div id='km-connection-toolbar' class='knowledgemap-toolbar'>"
          +   "<div class='km-connection-from-to'>"
          +     "From: <span id='km-connection-from'/>"
          +   "</div>"
          +   "<div class='km-connection-from-to'>"
          +     "To: <span id='km-connection-to'/>"
          +   "</div>"
          +   "<div id='km-connection-reinforcing' "
          +        "class='knowledgemap-toolbar-link'>Switch to reinforcing</div>"
          +   "<div id='km-connection-required' "
          +        "class='knowledgemap-toolbar-link'>Switch to required</div>"
          +   "<div id='km-connection-delete' "
          +        "class='knowledgemap-toolbar-link'>Delete</div>"
          + "</div>"
        );
        controller.$drawing_area.append(connectionToolbar);
        //Cache in controller.
        controller.$connectionToolbar = connectionToolbar;
        controller.$connectionFrom = $("#km-connection-from");
        controller.$connectionTo = $("#km-connection-to");
        $("#km-connection-reinforcing").click(function(evnt) {
          //Switch from required to reinforcing.
          controller.switchConnectionRequired( "reinforcing" );
        });
        $("#km-connection-required").click(function(evnt) {
          //Switch from reinforcing to required.
          controller.switchConnectionRequired( "required" );
        });
        $("#km-connection-delete").click(function(evnt) {
          //Delete a connection.
          controller.deleteConnection( );
        });
      }
    },
    switchConnectionRequired: function( newType ) {
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: switchConnectionRequired: not in edit mode.");
        return;
      }
      //Confirm.
      if ( ! confirm("Are you sure you want to change the connection type?") ) {
        return;
      }
      //Change the type of the selected connection.
      //Change the km data rep.
      var connectionRid = controller.selectedConnection.rid;
      controller.km_rep.connections[connectionRid].required = newType;
      //Get the selected connection's data.
      var connectionData = controller.km_rep.connections[connectionRid];
      //Save to the server.
      // @todo Show swirly thing.
      $.ajax({
        async: false,
        type: "POST",
        url: Drupal.settings.basePath + 'set-connection-required-ajax',
        data: {
          'rid' : connectionData.rid,
          'required' : connectionData.required
        },
        success: function(data, textStatus, jqXHR) {
          if ( data.status == 'success' ) {
            //Change the display.
            var display = connectionData.display;
            var style = controller.computeConnPaintStyle( display );
            display.setPaintStyle( style );
          }
          else {
            alert(data.message);
          }
        },
        fail: function(jqXHR, textStatus) {
          alert( "Request failed: " + textStatus );
        }
      });
    },
    deleteConnection: function( ) {
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: deleteConnection: not in edit mode.");
        return;
      }
      //Confirm.
      if ( ! confirm("Are you sure you want to delete the connection?") ) {
        return;
      }
      //Change the km data rep.
      var rid = controller.selectedConnection.rid;
      //Save to the server.
      // @todo Show swirly thing.
      $.ajax({
        async: false,
        type: "POST",
        url: Drupal.settings.basePath + 'delete-connection-ajax',
        data: {
          'rid' : rid
        },
        success: function(data, textStatus, jqXHR) {
          if ( data.status == 'success' ) {
            //Change the display.
            var display = controller.selectedConnection.display;
            jsPlumb.detach( display );
            //Remove the connection from the km rep.
            delete controller.km_rep.km_items[rid];
            //Unselect.
            controller.clearSelection();
          }
          else {
            alert(data.message);
          }
        },
        fail: function(jqXHR, textStatus) {
          alert( "Request failed: " + textStatus );
        }
      });
    },
    add_methods_to_drawing_area: function() {
      if ( controller.mode == "edit" ) {
        this.$drawing_area.notify = function(message) {
          $("#drawing-message")
                  .hide()
                  .html(message)
                  .show('medium');
        };
        this.$drawing_area.clear_notification = function() {
          $("#drawing-message")
                  .hide('medium')
                  .html('');
        };
      }
      this.$drawing_area.state = 'normal';
      this.$drawing_area.click(function(evnt) {
        if (controller.$drawing_area.state == "add") {
          if ( controller.mode != "edit" ) {
            //Should never happen.
            console.log("Error: $drawing_area.click add: not in edit mode.");
            return;
          }
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
            if ( controller.mode != "edit" ) {
              //Should never happen.
              console.log("Error: ESC pressed: not in edit mode.");
              return;
            }
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
    adjustDrawingHeight : function() {
      //Adjust resize range, since max height may have changed.
      // @todo Speed up by checking just items or connections, depending on
      //what the user changed. But this is tricky. E.g., dragging an item
      //changes the positions of connectors.
      controller.computeMaxY();
      var currentSizerHeight = controller.$drawing_area.outerHeight();
      if ( controller.maxY > currentSizerHeight ) {
        controller.$drawing_area.resizable({ minHeight: controller.maxY + 10 });
        controller.$drawing_area.height( controller.maxY + 10 );
      }
    },
    computeMaxY : function() {
      //What is the largest Y axis value to be shown?
      var maxHeight = controller.maxY;
      var itemDisplay;
      var connDisplay;
      var bottom;
      //Loop over items.
      for ( var i in controller.km_rep.km_items ) {
        itemDisplay = controller.km_rep.km_items[i].display;
        bottom = itemDisplay.position().top + itemDisplay.outerHeight();
        if ( bottom > maxHeight ) {
          maxHeight = bottom;
        }
      } // End loop over items.
      //Loop over connections.
      for ( i in controller.km_rep.connections ) {
        connDisplay = controller.km_rep.connections[i].display.getConnector();
        bottom = connDisplay.y + connDisplay.h;
        if ( bottom > maxHeight ) {
          maxHeight = bottom;
        }
      } // End loop over connections.
      controller.maxY = maxHeight;
    },
    clearSelection : function() {
      //Clear the item selection
      if ( controller.selectedItem ) {
        $("#" + controller.selectedItem.domId).removeClass("selected");
        controller.selectedItem = '';
        controller.$itemToolbar.hide();
      }
      if ( controller.selectedConnection ) {
        var conn = controller.selectedConnection.display;
        controller.selectedConnection = '';
        var style = controller.computeConnPaintStyle( conn );
        conn.setPaintStyle( style );
        controller.$connectionToolbar.hide();
      }      
    },
    setJsPlumbDefaults : function() {
      jsPlumb.importDefaults({
        Anchor: "AutoDefault",
        Endpoint: "Blank",
        Detachable: false,
        ReattachConnections : false,
        ConnectionOverlays : [ "PlainArrow" ]
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
        //Last param - don't adjust size of drawing element now.
        controller.drawItem( items[index], true );
      };
    },
    drawItem : function (itemData, skipAdjustDrawingHeight ) {
      //skipAdjustDrawingHeight is true if drawItem should not check whether 
      //the item changes the max height of all elements in the drawing.
      //This is false, except when drawing the initial items.
      var footer = (controller.mode == "edit")
              ? "<footer><div class='connection-control'>●</div></footer>"
              : '';
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
          + footer
          + "</div>";
      //Make a DOM element.
      var $item = $(html);
      //Set position.
      $item.css({
        "left": parseInt(itemData.coord_x),
        "top": parseInt(itemData.coord_y)
      });
      //Show its importance.
      var importance = itemData.importance;
      if ( importance == 'empty' ) {
        $item.addClass('importance-empty');
      }
      else {
        $item.css({
          "border-width" : parseFloat(importance)/10 + "em"
        });
      }
      //Set up select item click.
      $item.click( function(evnt) {
        controller.itemClicked ( evnt );
      });
      $item.dblclick(function(evnt) {
        //Double-clicked on an item. 
        var domId = $(evnt.currentTarget).attr('id');
        var nid = domId.replace("km-item-", "");
        var itemData = controller.km_rep.km_items[nid];
        //Get a viewer for it.
        var viewer = controller.getKmItemViewer(itemData);
        viewer.open( evnt );
        evnt.stopImmediatePropagation();
        evnt.stopPropagation();
        evnt.preventDefault();
      });
      if ( controller.mode == "edit" ) {
        jsPlumb.makeSource(
          $item, 
          controller.defaultConnSourceAttribs
        );
        jsPlumb.makeTarget(
            $item, controller.defaultConnTargetAttribs
        );
      }
      //Make the item draggable.
      jsPlumb.draggable(
        $item, {
          containment : "parent",
          start : function(evnt, ui) {
            controller.$itemToolbar.hide();
            if ( controller.mode == "edit" ) {
              controller.$connectionToolbar.hide();
            }
          },
          stop : function(evnt, ui) {
            if ( controller.mode == "edit" ) {
              //When KM item dragged, save its new position.
              controller.saveNewPosition( evnt, ui );
            }
            controller.adjustDrawingHeight();
          }
        }
      );
      //Append to the drawing.
      this.$drawing_area.append($item);
      //Store ref to it in km map rep.
      controller.km_rep.km_items[itemData.nid].display = $item;
      //Check whether it pushed the drawing bottom down.
      if ( ! skipAdjustDrawingHeight ) {
        controller.adjustDrawingHeight();
      }
    },
    itemClicked : function ( evnt ) {
      //Clicked on an item. 
      if ( controller.$drawing_area.state == "add" ) {
        controller.$drawing_area.exitAddMode();
      }
      var newDomId = $(evnt.currentTarget).attr('id');
      var newNid = newDomId.replace("km-item-", "");
      var $newItemClicked = $("#" + newDomId);
      //Clicked on new (not currently selected) item?
      if ( ! controller.selectedItem || newDomId != controller.selectedItem.domId ) {
        //Unselect the old one.
        controller.clearSelection();
        //Select the new item.
        controller.selectedItem = {
          'domId' : newDomId,
          'nid' : newNid
        };
        //Highlight the item.
        $("#" + newDomId).addClass("selected");
      }
      //Show the toolbar.
      controller.positionItemToolbar( $newItemClicked );
      controller.$itemToolbar.show('fast');
      evnt.stopPropagation();
    },
    prepareConnectionToolbar : function ( connectionData ) {
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: prepareConnectionToolbar: not in edit mode.");
        return;
      }
      if ( connectionData.required == "required" ) {
        $('#km-connection-reinforcing').show();
        $('#km-connection-required').hide();
      }
      else {
        $('#km-connection-reinforcing').hide();
        $('#km-connection-required').show();
      }
      controller.$connectionFrom.html(
        controller.km_rep.km_items[ connectionData.from_nid ].title
      );
      controller.$connectionTo.html(
        controller.km_rep.km_items[ connectionData.to_nid ].title
      );
    },
    updateItemFields : function ( nid ) {
      //Update the fields showing on an item display.
      $("#km-item-" + nid + " header h1").html(this.km_rep.km_items[nid].title); 
      $("#km-item-" + nid + " section.km-item-type").html(
         capitaliseFirstLetter( this.km_rep.km_items[nid].item_type )
      ); 
    },
    positionItemToolbar : function( $item ) {
      var toolbarHeight = controller.$itemToolbar.outerHeight();
      var toolbarWidth = controller.$itemToolbar.outerWidth();
      var itemTop = $item.position().top;
      var itemLeft = $item.position().left;
      var itemWidth = $item.outerWidth();
      var itemHeight = $item.outerHeight();
      var drawingAreaWidth = controller.$drawing_area.width();
      var drawingAreaHeight = controller.$drawing_area.height();
      
      var top = itemTop - toolbarHeight;
      if ( top <= 10 ) {
        top = 10;
      }
      if ( top > drawingAreaHeight ) {
        top = drawingAreaHeight - toolbarHeight - 10;
      }
      
      var left = itemLeft + itemWidth;
      if ( (left + toolbarWidth) > drawingAreaWidth ) {
        left = drawingAreaWidth - toolbarWidth - 10;
      }
      
      controller.$itemToolbar
          .css('left', left)
          .css('top', top);
    },
    positionConnectionToolbar : function( $connection ) {
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: positionConnectionToolbar: not in edit mode.");
        return;
      }
      var toolbarHeight = controller.$connectionToolbar.outerHeight();
      var toolbarWidth = controller.$connectionToolbar.outerWidth();
      var connectionTop = $connection.getConnector().y;
      var connectionLeft = $connection.getConnector().x;
      var connectionWidth = $connection.getConnector().w;
      var connectionHeight = $connection.getConnector().h;
      var drawingAreaWidth = controller.$drawing_area.width();
      var drawingAreaHeight = controller.$drawing_area.height();
      
      var top = connectionTop + connectionHeight/2 + 10;
      if ( top <= 10 ) {
        top = 10;
      }
      if ( (top + toolbarHeight) > drawingAreaHeight ) {
        top = drawingAreaHeight - toolbarHeight - 10;
      }
      
      if ( left <= 10 ) {
        left = 10;
      }
      var left = connectionLeft + ( connectionWidth / 2 + 10 );
      if ( (left + toolbarWidth) > drawingAreaWidth ) {
        left = drawingAreaWidth - toolbarWidth - 10;
      }
      controller.$connectionToolbar
          .css('left', left)
          .css('top', top);
    },
    drawAllConnections : function() {
      //Draw all the connections in the knowledge map.
      var connections = this.km_rep.connections;
      for ( var index in connections ) {
        controller.drawConnection( connections[index], true );
      }
    },
    drawConnection : function( connData, skipAdjustDrawingHeight ) {
      //skipAdjustDrawingHeight is true if drawItem should not check whether 
      //the connection changes the max height of all elements in the drawing.
      //This is false, except when drawing the initial connections.
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
      //Check whether it pushed the drawing bottom down.
      if ( ! skipAdjustDrawingHeight ) {
        this.adjustDrawingHeight();
      }
      if ( controller.mode == "edit" ) {
        connection.bind("click", function(conn, evnt) {
          controller.connectionClicked( conn, evnt );
        });
      }
    },
    connectionClicked : function( clickedConnJsPlumbDisplayObject, evnt ) {
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: connectionClicked: not in edit mode.");
        return;
      }
      //User clicked on a connection.
      //The parameter is the JsPlumb connection object that was clicked on.
      //Could have clicked on the currently selected connection, 
      //or a new one.
      var clickedRid = clickedConnJsPlumbDisplayObject.getParameter('rid');
      var connectionData = controller.km_rep.connections[clickedRid];
      //Clicked on new (not currently selected) connection?
      if ( ! controller.selectedConnection 
              || controller.selectedConnection.rid != clickedRid ) {
        //Clicked on a conn not selected.
        controller.clearSelection();
        controller.selectedConnection = {
          'rid' : clickedRid,
          'display' : clickedConnJsPlumbDisplayObject
        };
        clickedConnJsPlumbDisplayObject.setPaintStyle( 
          controller.computeConnPaintStyle( 
            clickedConnJsPlumbDisplayObject 
          ) 
        );
      }
      //Reposition connection toolbar.
      controller.positionConnectionToolbar( clickedConnJsPlumbDisplayObject );
      //Prep the connection toolbar for display.
      controller.prepareConnectionToolbar( connectionData );
      controller.$connectionToolbar.show('fast');
      evnt.stopPropagation();
    },
    computeConnPaintStyle : function( connJsPlumbDisplayObject ) {
      //Compute the style for a connection, based on its type, and whether
      //it is selected.
      //conn is a jsPlumb display object.
      var targetObjectRid = connJsPlumbDisplayObject.getParameter('rid');
      //Is the passed in object selected by the user?
      var selected = ( 
           controller.selectedConnection
        && controller.selectedConnection.rid == targetObjectRid 
      );
      var required = controller.km_rep.connections[targetObjectRid].required;
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
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: createAddForm: not in edit mode.");
        return;
      }
      $("#km-add-new-item-container")
        .hide()
        .dialog({
          autoOpen: false,
          dialogClass: "no-close",
          height: 540,
          width: 700,
          modal: true,
          title: "Add new item",
          buttons: {
            "Save": function() {
              var newName = $('#km-item-name').val();
              var newType = $('#km-item-type').val();
              var errorMessage = controller.checkNewItemData(newName, newType);
              if ( errorMessage != '') {
                alert(errorMessage);
              }
              else {
                var $dialogRef = $(this);
                //Create data record.
                var newItem = controller.createNewItemFromInput(
                    newName, newType
                );
                $.ajax({
                  async: false,
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
                  }
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
    createNewItemFromInput: function( newName, newType ) {
      var newItem = {
        'title' : newName,
        'item_type' : newType,
        'coord_x' : $("#coord_x").val(),
        'coord_y' : $("#coord_y").val(),
        'km_nid' : Drupal.settings.knowledgemap.km_nid
      };
      return newItem;
    },
    //User wants to add a new item at the clicked location.
    add_new_item: function(coord_x, coord_y) {
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: add_new_item: not in edit mode.");
        return;
      }
      //Kill the selection.
      controller.clearSelection();
      //Adjust X and Y to make them relative to the drawing area.
      coord_x -= controller.$drawing_area.position().left;
      coord_y -= controller.$drawing_area.position().top;
      $('#add-new-title').val('');
      $('#add-new-type').val('');
      $("#coord_x").val(coord_x);
      $("#coord_y").val(coord_y);
      //Empty old data.
      $("#km-item-name").val("");
      $("#km-item-type").val("not selected");
      $("#km-add-new-item-container").dialog("open");
    },
    checkNewItemData: function(itemTitle, itemType) {
      var msg = '';
      if ( ! itemTitle ) {
        msg += " Please enter a title.";
      }
      if ( ! itemType || itemType == "not selected" ){
        msg += " Please enter a type.";
      }
      return msg;
    },
    errorThrown: function(message) {
      alert(message);
      return false;
    },
    makeNewConnection: function(connInfo, evnt) {
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: makeNewConnection: not in edit mode.");
        return;
      }
      //Kill the selection.
      controller.clearSelection();
      //Check whether the connection is allowed. Modify if necessary.
      if ( this.checkConnection( connInfo ) ) {
        //Tell the server about it.
        this.saveConnection( connInfo );
        //Set the style of the connection.
        var connection = connInfo.connection;
        connection.setPaintStyle(
            controller.computeConnPaintStyle( connection )
        );
        connection.bind("click", function(conn, evnt) {
          controller.connectionClicked( conn, evnt );
        });
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
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: saveNewPosition: not in edit mode.");
        return;
      }
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
    saveConnection : function ( connInfo ) {
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: saveConnection: not in edit mode.");
        return;
      }
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
    },
    redrawItem : function( nid ) {
      //Redraw an item. Called after returning from editing, 
      //since the size of the item might have changed.
      jsPlumb.repaint( controller.km_rep.km_items[nid].display );
    },
    editChangedItemType : function ( nid, oldItemType, newItemType ) {
      if ( controller.mode != "edit" ) {
        //Should never happen.
        console.log("Error: editChangedItemType: not in edit mode.");
        return;
      }
      //User changed the item type when editing the item.
      //Change the classes on the item.
      var display = controller.km_rep.km_items[ nid ].display;
      display
          .removeClass( oldItemType )
          .addClass( newItemType );
      //Any connections on this item?
      var sourceConnections = jsPlumb.getConnections( 
        { source: "km-item-" + nid }
      );
      var targetConnections = jsPlumb.getConnections( 
        { target: "km-item-" + nid }
      );
      var connectionCount 
          = sourceConnections.length + targetConnections.length;
      if ( connectionCount > 0 ) {
        alert( 
              "You have changed the item type. Please check the "
            + "connections to this item, to ensure that they "
            + "still make sense."
        );
      }
    }
  };
  evilGlobalController = controller;
})(jQuery);

