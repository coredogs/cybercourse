try {

(function($) {
  var done_once = false;
  Drupal.behaviors.knowledgemap = {
    attach: function(context, settings) {
      if (done_once) {
        return;
      }
//      $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
      //Unload CKEditor when ctools modal closes.
      $(document).bind('CToolsDetachBehaviors', function(event, context) {
        Drupal.behaviors.ckeditor.detach(context, {}, 'unload');
      });  
      //Setup swirly thing.
      this.spinner = new Spinner({color: "#67CADB"});
      //Set some convenience vars.
      //Mode - edit or view.
      this.mode = settings.knowledgemap.mode;
      //The nid of the KM.
      this.km_nid = settings.knowledgemap.km_nid;
      //Data about items and connecitons.
      this.km_rep = settings.knowledgemap.knowledgemap_rep;
        //km_rep.km_item.display is a DOM element.
        //km_rep.connection.display is a jsPlumb thing.
      $.each( this.km_rep.km_items, function(index, item) {
        //Set flag to show that the body has not been rendered.
        item.bodyRenderedFlag = false;
        //Make sure that there is at least an MT string in the body.
        if ( ! item.body ) {
          item.body = "";
        }
      });
      //Valid item types.
      this.validItemTypes = settings.knowledgemap.all_item_types;
      //Make a string with class names derived from item types.
      this.itemTypeClassNames = "";
      for ( var typeName in this.validItemTypes ) {
        this.itemTypeClassNames += typeName + " ";
      }
      var drawing_id = settings.knowledgemap.drawing_dom_id;
      this.drawing_id = drawing_id;
      this.$drawing_area = $('#' + drawing_id);
      this.$drawing_area.resizable({ handles: "s" });
      this.$itemToolbar = {}; //Make it later.
      if ( this.mode == "edit" ) {
        this.$connectionToolbar = {}; //Make it later.
      }
      this.$connectionFrom = {}; //Item title for toolbar. 
      this.$connectionTo = {}; //Item title for toolbar. 
      this.maxY = 0; //Highest Y coord.
      //Selected item.
      this.selectedItem = '';
      this.selectedConnection = '';
      if ( this.mode == "edit" ) {
        //Hide the link created by CTools for modal node edit form.
        $(".km-item-edit-link-original").hide();
      }
      //Add a toolbar to the drawing.
      this.createTopToolbar();
      //Remember its height for coord adjustments.
      this.toolbarHeight = $("#" + drawing_id + " > .km-toolbar").height();
      this.addMethodsToDrawingArea();
//      this.scrollbarHeight = scrollbarSize[1];
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var lmNamespace = this;
      jsPlumb.ready(function() {
        lmNamespace.setJsPlumbDefaults();
        lmNamespace.drawAllItems();
        lmNamespace.drawAllConnections();
        lmNamespace.adjustDrawingHeight();
        if ( lmNamespace.mode == "edit" ) {
          jsPlumb.bind("connection", function(info, evnt) {
            lmNamespace.makeNewConnection(info, evnt);
          });            
        }
      });
      //Create the floating toolbars.
      this.createFloatingToolbars();
      done_once = true;
    }, //End Drupal.behaviors.knowledgemap.attach
    //Create a toolbar for the drawing area.
    createTopToolbar: function() {
      var toolbarHtml = 
            "<div class='km-toolbar'>";
      toolbarHtml += 
              "<div class='km-action-group'>"
          +     "<input type='checkbox' checked='checked' id='show-km-knowledge'>"
          +       "<label for='show-km-knowledge'>Knowledge</label>"
          +     "<input type='checkbox' checked='checked' id='show-km-experiences'>"
          +       "<label for='show-km-experiences'>Experiences</label>"
          +   "</div>";
      if ( this.mode == "edit" ) {
        toolbarHtml +=
              "<div class='km-action-group'>"
          +     "<input type='button' id='add-km-item' value='Add item' class='form-submit'>"
          +     "<input type='button' id='cancel-km-add' value='Cancel' class='form-submit'>"
          +   "</div>";
      }
      this.$drawing_area.prepend( toolbarHtml );
      if ( this.mode == "edit" ) {
        //Hide the cancel button.
        $("#cancel-km-add").attr("disabled", "disabled");
        //Set up the Add button.
        //Convenience var for JS namespace for this module. Everything gets
        //attached to Drupal.behaviors.knowledgemap.
        var lmNamespace = this;
        $("#add-km-item").click(function(evnt) {
          evnt.stopPropagation();
          lmNamespace.clearSelection();
          //If already in add, exit state.
          if ( lmNamespace.$drawing_area.state == 'add') {
            //Exit add mode.
            lmNamespace.$drawing_area.exitAddMode();
            return;
          }
          //Move into adding state.
          $("#add-km-item").attr("disabled", "disabled");
          $("#cancel-km-add").removeAttr("disabled");
          lmNamespace.$drawing_area.addClass("adding-state");
          lmNamespace.$drawing_area.state = "add";
          return false; //No propagation. 
        }); //End add item click.
        //The cancel button.
        $("#cancel-km-add").click(function(evnt){
          if ( lmNamespace.$drawing_area.state == "add" ) {
            lmNamespace.$drawing_area.exitAddMode();
          }
        }); //End cancel button click.
      }
    }, //End Drupal.behaviors.knowledgemap.createTopToolbar
    createFloatingToolbars: function() {
      var itemToolbar = $(
          "<div id='km-item-toolbar' class='knowledgemap-toolbar'>"
        +   "<a id='km-item-show-summary' class='cyco-button-small' href='javascript:void(0)' "
        +        ">Summary</a>"
//        +    "<a "
//        +       "id='km-item-show-details' "
//        +       "href='do not know yet' "
//        +       "target='_blank' "
//        +       "class='cyco-button-small' "
//        +       "title='Show details about this item in a new window.'>"
//        +     "Details"
//        +   "</a>"
        + "</div>"
      );
      this.$drawing_area.append(itemToolbar);
      this.$itemToolbar = itemToolbar;
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var lmNamespace = this;
      $("#km-item-show-summary").click(function(evnt) {
        //Get the selected item's data.
        var itemNid = lmNamespace.selectedItem.nid;
        var itemData = lmNamespace.km_rep.km_items[itemNid];
        //Show a viewer for it.
        //Get an item viewer, either existing or new.
        //Kludge to pass event for opening new or existing dialog.
//        lmNamespace.eventKludge = evnt;
        if ( lmNamespace.kmItemViewers[ itemData.nid ] ) {
          lmNamespace.kmItemViewers[ itemData.nid ].open();
        }
        else {
          lmNamespace.kmItemViewers[ itemData.nid ] 
            = new $.KmItemViewer(itemData);
        }
      });
      if ( this.mode == "edit" ) {
        //Set up the connection toolbar.
        var connectionToolbar = $(
            "<div id='km-connection-toolbar' class='knowledgemap-toolbar'>"
          +   "<div class='km-connection-from-to'>"
          +     "From: <span id='km-connection-from'/>"
          +   "</div>"
          +   "<div class='km-connection-from-to'>"
          +     "To: <span id='km-connection-to'/>"
          +   "</div>"
          +   "<button id='km-connection-reinforcing' class='cyco-button' "
          +        ">Switch to reinforcing</button>"
          +   "<button id='km-connection-required' class='cyco-button' "
          +        ">Switch to required</button>"
          +   "<button id='km-connection-delete' class='cyco-button' "
          +        ">Delete</button>"
          + "</div>"
        );
        this.$drawing_area.append(connectionToolbar);
        //Cache in lmNamespace.
        this.$connectionToolbar = connectionToolbar;
        this.$connectionFrom = $("#km-connection-from");
        this.$connectionTo = $("#km-connection-to");
        $("#km-connection-reinforcing").click(function(evnt) {
          //Switch from required to reinforcing.
          lmNamespace.switchConnectionRequired( "reinforcing" );
          evnt.stopPropagation();
          evnt.preventDefault()
        });
        $("#km-connection-required").click(function(evnt) {
          //Switch from reinforcing to required.
          lmNamespace.switchConnectionRequired( "required" );
          evnt.stopPropagation();
          evnt.preventDefault()
        });
        $("#km-connection-delete").click(function(evnt) {
          //Delete a connection.
          lmNamespace.deleteConnection( );
          evnt.stopPropagation();
          evnt.preventDefault()
        });
      }
    },  //End Drupal.behaviors.knowledgemap.createFloatingToolbars
    switchConnectionRequired: function( newType ) {
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing("Error: switchConnectionRequired: not in edit mode.");
      }
      //Confirm.
      if ( ! confirm("Are you sure you want to change the connection type?") ) {
        return;
      }
      this.$connectionToolbar.hide();
      //Change the type of the selected connection.
      //Change the km data rep.
      var connectionRid = this.selectedConnection.rid;
      this.km_rep.connections[connectionRid].required = newType;
      //Get the selected connection's data.
      var connectionData = this.km_rep.connections[connectionRid];
      //Save to the server.
      // @todo Show swirly thing.
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var lmNamespace = this;
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
            var style = lmNamespace.computeConnPaintStyle( display );
            display.setPaintStyle( style );
          }
          else {
            lmNamespace.badThing(data.message);
          }
        },
        fail: function(jqXHR, textStatus) {
          lmNamespace.badThing( "Knowledge map request failed: " + textStatus );
        },
        error: function(jqXHR, textStatus) {
          lmNamespace.badThing( "Knowledge map request failed: " + textStatus );
        }
      });
    }, //End Drupal.behaviors.knowledgemap.switchConnectionRequired
    deleteConnection: function( ) {
      //Start Drupal.behaviors.knowledgemap.deleteConnection
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("deleteConnection: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing("Error: deleteConnection: not in edit mode.");
      }
      //Confirm.
      if ( ! confirm("Are you sure you want to delete the connection?") ) {
        return;
      }
      this.$connectionToolbar.hide();
      //Change the km data rep.
      var rid = this.selectedConnection.rid;
      //Save to the server.
      // @todo Show swirly thing.
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var lmNamespace = this;
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
            var display = lmNamespace.selectedConnection.display;
            jsPlumb.detach( display );
            //Remove the connection from the km rep.
            delete lmNamespace.km_rep.connections[rid];
            //Unselect.
            lmNamespace.clearSelection();
          }
          else {
            lmNamespace.badThing(data.message);
          }
        },
        fail: function(jqXHR, textStatus) {
          lmNamespace.badThing( "Request failed: " + textStatus );
        },
        error: function(jqXHR, textStatus) {
          lmNamespace.badThing( "Request failed: " + textStatus );
        }
      });
    }, //End Drupal.behaviors.knowledgemap.deleteConnection
    addMethodsToDrawingArea: function() {
      //Set state to normal (not adding item).
      this.$drawing_area.state = 'normal';
      //What layers are being shown.
      this.$drawing_area.showKnowledgeLayer = true;
      this.$drawing_area.showExperiencesLayer = true;
      //Set the "Show knowledge" buttons down initially.
//      $("#show-km-knowledge").prop('checked', true);
//      $("#show-km-experiences").prop('checked', true);
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var lmNamespace = this;
      this.$drawing_area.click(function(evnt) {
        if (lmNamespace.$drawing_area.state == "add") {
          if ( lmNamespace.mode != "edit" ) {
            //Should never happen.
            lmNamespace.badThing("Error: $drawing_area.click add: not in edit mode.");
          }
          var x_to_store = lmNamespace.getEventCoordX(evnt);
          var y_to_store = lmNamespace.getEventCoordY(evnt);
          lmNamespace.addNewItem(x_to_store, y_to_store);
          evnt.stopPropagation();
          evnt.preventDefault();        }
        else {
          //Clear selection if there is any.
          lmNamespace.clearSelection();
        }
      }); //End drawing area click.
      $(document).keydown(function(evnt) {
        if ( evnt.keyCode == 27 ) {
          //User pressed ESC key.
          if ( lmNamespace.$drawing_area.state == "add" ) {
            if ( lmNamespace.mode != "edit" ) {
              //Should never happen.
              lmNamespace.badThing("Error: ESC pressed: not in edit mode.");
            }
            //Exit add mode.
            evnt.stopPropagation();
            evnt.preventDefault();
            lmNamespace.$drawing_area.exitAddMode();
          }
          else {
            lmNamespace.clearSelection();
            evnt.preventDefault();
          }
        }
      }); //End esc keydown
      this.$drawing_area.exitAddMode = function() {
        lmNamespace.$drawing_area.state = "normal";
        lmNamespace.$drawing_area.removeClass("adding-state");
        $("#cancel-km-add").attr("disabled", "disabled");
        $("#add-km-item").removeAttr("disabled");
        $(".sendback").remove();
      };// end $drawing_area.exitAddMode
      //Set up the Show Knowledge Layer button.
      $("#show-km-knowledge").click(function(evnt){
        lmNamespace.$drawing_area.showKnowledgeLayer
            = $("#show-km-knowledge").is(':checked');
//            = ! lmNamespace.$drawing_area.showKnowledgeLayer;
        lmNamespace.showCorrectItems();
      }); //End click show knowledge.
      //Set up the Show Experiences Layer button.
      $("#show-km-experiences").click(function(evnt){
        lmNamespace.$drawing_area.showExperiencesLayer
            = $("#show-km-experiences").is(':checked');
        lmNamespace.showCorrectItems();
      }); //End click show experiences.
    }, //End Drupal.behaviors.knowledgemap.addMethodsToDrawingArea'
    showCorrectItems : function() {
      var i;
      var knowledgeItems = $(".km-item").filter(".skill, .concept");
      var experienceItems = $(".km-item")
          .filter(".explanation, .example, .exercise, .pattern, .other");
      var connections = jsPlumb.getConnections();
      if (    this.$drawing_area.showKnowledgeLayer 
           && this.$drawing_area.showExperiencesLayer
         )
        {
          //Show everything.
          knowledgeItems.show();
          experienceItems.show();
          for(i in connections) {
            connections[i].setVisible(true);
          }
        }
      else if (    ! this.$drawing_area.showKnowledgeLayer 
                && ! this.$drawing_area.showExperiencesLayer
         )
        {
          //Hide everything.
          knowledgeItems.hide();
          experienceItems.hide();
          for(i in connections) {
            connections[i].setVisible(false);
          }
        }
      else if (      this.$drawing_area.showKnowledgeLayer 
                && ! this.$drawing_area.showExperiencesLayer
         )
        {
          //Show knowledge, hide experiences.
          knowledgeItems.show();
          experienceItems.hide();
          for(i in connections) {
            connections[i].setVisible(
                ! connections[i].getParameter("experience")
            );
          }
        }
      else if (    ! this.$drawing_area.showKnowledgeLayer 
                &&   this.$drawing_area.showExperiencesLayer
         )
        {
          //Hide knowledge, show experiences.
          knowledgeItems.hide();
          experienceItems.show();
          for(i in connections) {
            connections[i].setVisible(
                ! connections[i].getParameter("knowledge")
            );
          }
        }
    },//End Drupal.behaviors.knowledgemap.showCorrectItems
    adjustDrawingHeight : function() {
      //Adjust resize range, since max height may have changed.
      // @todo Speed up by checking just items or connections, depending on
      //what the user changed. But this is tricky. E.g., dragging an item
      //changes the positions of connectors.
      this.computeMaxY();
      var currentSizerHeight = this.$drawing_area.outerHeight();
      if ( this.maxY > currentSizerHeight ) {
        this.$drawing_area.resizable({ minHeight: this.maxY + 60 });
        this.$drawing_area.height( this.maxY + 60 );
      }
    }, //End Drupal.behaviors.knowledgemap.adjustDrawingHeight
    computeMaxY : function() {
      //What is the largest Y axis value to be shown?
      var maxHeight = this.maxY;
      var itemDisplay;
      var connDisplay;
      var bottom;
      //Loop over items.
      for ( var i in this.km_rep.km_items ) {
        itemDisplay = this.km_rep.km_items[i].display;
        bottom = itemDisplay.position().top + itemDisplay.outerHeight();
        if ( bottom > maxHeight ) {
          maxHeight = bottom;
        }
      } // End loop over items.
      //Loop over connections.
      for ( i in this.km_rep.connections ) {
        connDisplay = this.km_rep.connections[i].display.getConnector();
        bottom = connDisplay.y + connDisplay.h;
        if ( bottom > maxHeight ) {
          maxHeight = bottom;
        }
      } // End loop over connections.
      this.maxY = maxHeight;
    },  //End Drupal.behaviors.knowledgemap.computeMaxY
    clearSelection : function() {
      //Start Drupal.behaviors.knowledgemap.clearSelection
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("clearSelection: this unexpected.");
      }
      //Clear the item selection
      if ( this.selectedItem ) {
        //Might have been deleted.
        var domElement = $("#" + this.selectedItem.domId);
        if ( domElement.length > 0 ) {
          $("#" + this.selectedItem.domId).removeClass("selected");
        }
        this.selectedItem = '';
        this.$itemToolbar.hide();
      }
      if ( this.selectedConnection ) {
        var conn = this.selectedConnection.display;
        //Check that the connection has not been deleted.
        var ridToCheck = this.selectedConnection.display.getParameter('rid');
        this.selectedConnection = '';
        if ( this.km_rep.connections[ridToCheck] ) {
          var style = this.computeConnPaintStyle( conn );
          conn.setPaintStyle( style );
        }
        if ( this.mode == "edit" ) {
          this.$connectionToolbar.hide();
        }
      }      
    }, //End Drupal.behaviors.knowledgemap.clearSelection
    setJsPlumbDefaults : function() {
      //Start Drupal.behaviors.knowledgemap.setJsPlumbDefaults
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("setJsPlumbDefaults: this unexpected.");
      }
      jsPlumb.importDefaults({
        Anchor: "AutoDefault",
        Endpoint: "Blank",
        Connector: "Straight",
        Detachable: false,
        ReattachConnections : false,
        ConnectionOverlays : [ "PlainArrow" ]
      });
      //Paint styles for connections.
      //They need to be merged to get the right effects.
      this.requiredPaintStyle = {
        dashstyle: "solid"
      };
      this.recommendedPaintStyle = {
        dashstyle: "2 2"
      };
      this.selectedPaintStyle = {
        lineWidth: 4,
        strokeStyle: "#1E90FF"
      };
      this.unselectedPaintStyle = {
        lineWidth: 2,
        strokeStyle: "#4B0082"
      };
      this.defaultConnSourceAttribs = {
        anchor: "AutoDefault",
        filter: ".connection-control",
        endpoint: "Blank"
      };
      this.defaultConnTargetAttribs = {
        anchor: "AutoDefault",
        isTarget: true,
        endpoint: "Blank"
      };
    }, //End Drupal.behaviors.knowledgemap.setJsPlumbDefaults
    drawAllItems : function() {
      //Start Drupal.behaviors.knowledgemap.drawAllItems
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("drawAllItems: this unexpected.");
      }
      //Draw all the items in the knowledge map.
      var items = this.km_rep.km_items;
      for ( var index in items ) {
        //Last param - don't adjust size of drawing element now.
        this.drawItem( items[index], true );
      };
    }, //End Drupal.behaviors.knowledgemap.drawAllItems
    drawItem : function (itemData, skipAdjustDrawingHeight ) {
      //Start Drupal.behaviors.knowledgemap.drawItem
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("drawItem: this unexpected.");
      }
      //skipAdjustDrawingHeight is true if drawItem should not check whether 
      //the item changes the max height of all elements in the drawing.
      //This is false, except when drawing the initial items.
      var footer = (this.mode == "edit")
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
      //Store ref to it in km map rep.
      this.km_rep.km_items[itemData.nid].display = $item;
      //Append to the drawing.
      this.$drawing_area.append( $item );
      //Set display elements.
      this.updateItemDisplay( $item );
      //Add events to display for item.
      this.addEventsToItem( $item );
      //Check whether it pushed the drawing bottom down.
      if ( ! skipAdjustDrawingHeight ) {
        this.adjustDrawingHeight();
      }
    }, //End Drupal.behaviors.knowledgemap.drawItem
    addEventsToItem : function( $item ){
      //Start Drupal.behaviors.knowledgemap.addEventsToItem
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("addEventsToItem: this unexpected.");
      }
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var lmNamespace = this;
      //Set up select item click.
      $item.click( function(evnt) {
        lmNamespace.itemClicked ( evnt );
      });
      if ( this.mode == "edit" ) {
        jsPlumb.makeSource(
          $item, 
          this.defaultConnSourceAttribs
        );
        jsPlumb.makeTarget(
            $item, 
            this.defaultConnTargetAttribs
        );
      }
      //Make the item draggable.
      jsPlumb.draggable(
        $item, {
          containment : "parent",
          start : function(evnt, ui) {
            lmNamespace.$itemToolbar.hide();
            if ( lmNamespace.mode == "edit" ) {
              lmNamespace.$connectionToolbar.hide();
            }
          },
          stop : function(evnt, ui) {
            if ( lmNamespace.mode == "edit" ) {
              //When KM item dragged, save its new position.
              lmNamespace.saveNewPosition( evnt, ui );
            }
            lmNamespace.adjustDrawingHeight();
          }
        }
      );      
    }, //End Drupal.behaviors.knowledgemap.addEventsToItem
    updateItemDisplay: function ( $itemDisplay ) {
      //Start Drupal.behaviors.knowledgemap.updateItemDisplay
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("updateItemDisplay: this unexpected.");
      }
      //Update the displayed item.
      //$itemDisplay is a div showing an item.
      var domId = $itemDisplay.attr('id');
      var nid = domId.replace("km-item-", "");
      var itemData = this.km_rep.km_items[nid];
      //Update the fields showing on an item display.
      //Item title.
      $("#km-item-" + nid + " header h1").html( trimLR(itemData.title) ); 
      //Item type.
      $("#km-item-" + nid + " section.km-item-type").html( 
        capitaliseFirstLetter( itemData.item_type )
      );
      //Show importance.
      var importance = itemData.importance;
      if ( ! itemData.importance ) {
        $itemDisplay.addClass('importance-empty');
      }
      else {
        $itemDisplay.removeClass('importance-empty');
          //Could be updating display.
        $itemDisplay.css({
          "border-width" : parseFloat(importance)/10 + "em"
        });
      }
      //Show the right class for the item type.
      //Remove existing class name and add a new one.
      $itemDisplay
          .removeClass( this.itemTypeClassNames )
          .addClass(itemData.item_type);
      //Set position.
      this.setItemPosition( $itemDisplay, itemData.coord_x, itemData.coord_y);
    }, //End Drupal.behaviors.knowledgemap.updateItemDisplay
    itemClicked : function ( evnt ) {
      //Start Drupal.behaviors.knowledgemap.itemClicked
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("itemClicked: this unexpected.");
      }
      //Clicked on an item. 
      if ( this.$drawing_area.state == "add" ) {
        this.$drawing_area.exitAddMode();
      }
      var newDomId = $(evnt.currentTarget).attr('id');
      var newNid = newDomId.replace("km-item-", "");
      var $newItemClicked = $("#" + newDomId);
      //Clicked on new (not currently selected) item?
      if ( ! this.selectedItem || newDomId != this.selectedItem.domId ) {
        //Unselect the old one.
        this.clearSelection();
        //Select the new item.
        this.selectedItem = {
          'domId' : newDomId,
          'nid' : newNid
        };
        //Highlight the item.
        $("#" + newDomId).addClass("selected");
      }
      //Is there are viewer for the item already?
      if ( this.kmItemViewers[ newNid ] ) {
        var itemViewer = this.kmItemViewers[ newNid ];
        //Could have been opened and then closed by user. If so, 
        //will still exist in memory. Just need to show it again.
        if ( itemViewer.dialog.dialog("widget").css("display") == "none" ) {
          itemViewer.dialog.dialog("widget").show();
          itemViewer.dialog.dialog("moveToTop");
          return;
        }
        //Bring it to the top.
        itemViewer.dialog.dialog("moveToTop");
        //Get user's attention.
        var $dialog = $(itemViewer.dialog.dialog("widget").children(".ui-dialog-content"));
        //Exit if already animating.
        if ( $dialog.is(':animated') ) {
          return;
        }
        var originalColor = $dialog.css("color");
        var originalBackgroundColor = $dialog.css("background-color");
        var state1 = {
          "background-color": "#FF9933",
          "color" : "white"
        };
        var state2 = {
          "background-color": originalBackgroundColor,
          "color" : originalColor
        };
        var speed = "fast";
        $dialog
          .animate(state1, speed)
          .animate(state2, speed)
          .animate(state1, speed)
          .animate(state2, speed)
        ;
      }
      else {
        //Show the item toolbar.
        //Set the details link destination.
        this.$itemToolbar.find("#km-item-show-details")
            .attr("href", Drupal.settings.basePath + "node/" + newNid);
        this.positionItemToolbar( $newItemClicked );
        this.$itemToolbar.show('fast');
      }
      evnt.stopPropagation();
    }, //End Drupal.behaviors.knowledgemap.itemClicked
    prepareConnectionToolbar : function ( connectionData ) {
      //Start Drupal.behaviors.knowledgemap.prepareConnectionToolbar
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("prepareConnectionToolbar: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing("Error: prepareConnectionToolbar: not in edit mode.");
      }
      if ( connectionData.required == "required" ) {
        $('#km-connection-reinforcing').show();
        $('#km-connection-required').hide();
      }
      else {
        $('#km-connection-reinforcing').hide();
        $('#km-connection-required').show();
      }
      this.$connectionFrom.html(
        this.km_rep.km_items[ connectionData.from_nid ].title
      );
      this.$connectionTo.html(
        this.km_rep.km_items[ connectionData.to_nid ].title
      );
    }, //End Drupal.behaviors.knowledgemap.prepareConnectionToolbar
    positionItemToolbar : function( $item ) {
      //Start Drupal.behaviors.knowledgemap.positionItemToolbar
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("drawAllItems: this positionItemToolbar.");
      }
      var toolbarHeight = this.$itemToolbar.outerHeight();
      var toolbarWidth = this.$itemToolbar.outerWidth();
      var itemTop = $item.position().top;
      var itemLeft = $item.position().left;
      var itemWidth = $item.outerWidth();
      var itemHeight = $item.outerHeight();
      var drawingAreaWidth = this.$drawing_area.width();
      var drawingAreaHeight = this.$drawing_area.height();
      
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
      
      this.$itemToolbar
          .css('left', left)
          .css('top', top);
    }, //End positionItemToolbar
    positionConnectionToolbar : function( $connection ) {
      //Start Drupal.behaviors.knowledgemap.positionConnectionToolbar
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("positionConnectionToolbar: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing("Error: positionConnectionToolbar: not in edit mode.");
      }
      var toolbarHeight = this.$connectionToolbar.outerHeight();
      var toolbarWidth = this.$connectionToolbar.outerWidth();
      var connectionTop = $connection.getConnector().y;
      var connectionLeft = $connection.getConnector().x;
      var connectionWidth = $connection.getConnector().w;
      var connectionHeight = $connection.getConnector().h;
      var drawingAreaWidth = this.$drawing_area.width();
      var drawingAreaHeight = this.$drawing_area.height();
      
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
      this.$connectionToolbar
          .css('left', left)
          .css('top', top);
    },//End Drupal.behaviors.knowledgemap.positionConnectionToolbar
    drawAllConnections : function() {
      //Start Drupal.behaviors.knowledgemap.drawAllConnections
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("drawAllConnections: this unexpected.");
      }
      //Draw all the connections in the knowledge map.
      var connections = this.km_rep.connections;
      for ( var index in connections ) {
        this.drawConnection( connections[index], true );
      }
    }, //End Drupal.behaviors.knowledgemap.drawAllConnections
    drawConnection : function( connData, skipAdjustDrawingHeight ) {
      //Start Drupal.behaviors.knowledgemap.drawConnection
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("drawConnection: this unexpected.");
      }
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var lmNamespace = this;
      //skipAdjustDrawingHeight is true if drawItem should not check whether 
      //the connection changes the max height of all elements in the drawing.
      //This is false, except when drawing the initial connections.
      //Compute array of classes for this connection.
      var connCategoryClasses = this.computeConnectionCategoryClasses( connData );
      var classes = connCategoryClasses.join(" ");
      //Make parameters from rid and classes.
      var parameters = {};
      parameters.rid = connData.rid;
      if ( $.inArray("km-connection-knowledge", connCategoryClasses) != -1 ) {
        parameters.knowledge = true;
      }
      if ( $.inArray("km-connection-experience", connCategoryClasses) != -1 ) {
        parameters.experience = true;
      }
      var connection = jsPlumb.connect({
        source : "km-item-" + connData.from_nid, 
        target : "km-item-" + connData.to_nid,
        cssClass : classes,
        //Add the relationship id, index into km_rep.
        'parameters' : parameters
//        'parameters' : { 'rid' : connData.rid }
      });
      connection.setPaintStyle(
        this.computeConnPaintStyle( connection )
      );
      //Store ref to the new connection in the map array.
      this.km_rep.connections[connData.rid].display = connection;
      //Check whether it pushed the drawing bottom down.
      if ( ! skipAdjustDrawingHeight ) {
        this.adjustDrawingHeight();
      }
      if ( this.mode == "edit" ) {
        connection.bind("click", function(conn, evnt) {
          lmNamespace.connectionClicked( conn, evnt );
        });
      }
    }, //End Drupal.behaviors.knowledgemap.drawConnection
    computeConnectionCategoryClasses : function( connData ) {
      //Return array of classes for a connection.
      //Start Drupal.behaviors.knowledgemap.computeConnectionCategoryClasses
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("computeConnectionCategoryClasses: this unexpected.");
      }
      var fromType = this.km_rep.km_items[connData.from_nid].item_type;
      var toType = this.km_rep.km_items[connData.to_nid].item_type;
      var categoryClasses = new Array();
      //Work out whether a connection connects just knowledge items, 
      //or involves experiences as well.
      var knowledge = ["skill", "concept"];
      if ( 
              $.inArray( fromType, knowledge ) >= 0
           || $.inArray( toType, knowledge ) >= 0
          ) {
        categoryClasses.push("km-connection-knowledge");
      }
      var experiences = ["explanation", "example", "exercise", "pattern", "other"];
      if ( 
              $.inArray( fromType, experiences ) >= 0
           || $.inArray( toType, experiences ) >= 0
          ) {
        categoryClasses.push("km-connection-experience");
      }
      return categoryClasses;
    }, //End Drupal.behaviors.knowledgemap.computeConnectionCategoryClasses
    connectionClicked : function( clickedConnJsPlumbDisplayObject, evnt ) {
      //Start Drupal.behaviors.knowledgemap.connectionClicked
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("connectionClicked: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing("Error: connectionClicked: not in edit mode.");
      }
      //User clicked on a connection.
      //The parameter is the JsPlumb connection object that was clicked on.
      //Could have clicked on the currently selected connection, 
      //or a new one.
      var clickedRid = clickedConnJsPlumbDisplayObject.getParameter('rid');
      var connectionData = this.km_rep.connections[clickedRid];
      //Clicked on new (not currently selected) connection?
      if ( ! this.selectedConnection 
              || this.selectedConnection.rid != clickedRid ) {
        //Clicked on a conn not selected.
        this.clearSelection();
        this.selectedConnection = {
          'rid' : clickedRid,
          'display' : clickedConnJsPlumbDisplayObject
        };
        clickedConnJsPlumbDisplayObject.setPaintStyle( 
          this.computeConnPaintStyle( 
            clickedConnJsPlumbDisplayObject 
          ) 
        );
      }
      //Reposition connection toolbar.
      this.positionConnectionToolbar( clickedConnJsPlumbDisplayObject );
      //Prep the connection toolbar for display.
      this.prepareConnectionToolbar( connectionData );
      this.$connectionToolbar.show('fast');
      evnt.stopPropagation();
    }, //End connectionClicked
    computeConnPaintStyle : function( connJsPlumbDisplayObject ) {
      //Start Drupal.behaviors.knowledgemap.computeConnPaintStyle
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("computeConnPaintStyle: this unexpected.");
      }
      //Compute the style for a connection, based on its type, and whether
      //it is selected.
      //conn is a jsPlumb display object.
      var targetObjectRid = connJsPlumbDisplayObject.getParameter('rid');
      //Is the passed in object selected by the user?
      var selected = ( 
           this.selectedConnection
        && this.selectedConnection.rid == targetObjectRid 
      );
      var required = this.km_rep.connections[targetObjectRid].required;
      var base = $.extend( {}, 
                      selected 
                        ? this.selectedPaintStyle 
                        : this.unselectedPaintStyle
                 );
      $.extend( base, ( required == 'required' )
                  ? this.requiredPaintStyle
                  : this.recommendedPaintStyle
              );
      return base;
    }, //End computeConnPaintStyle.
    createNewItemFromInput: function( newName, newType, newImportance ) {
      //Start Drupal.behaviors.knowledgemap.createNewItemFromInput
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("createNewItemFromInput: this unexpected.");
      }
      var newItem = {
        'title' : newName,
        'item_type' : newType,
        'importance' : newImportance,
        'coord_x' : $("#coord_x").val(),
        'coord_y' : $("#coord_y").val(),
        'km_nid' : this.km_nid,
        'body' : '',
        //Show not rendered yet.
        'bodyRenderedFlag' : false
      };
      return newItem;
    }, //End Drupal.behaviors.knowledgemap.createNewItemFromInput
    addNewItem: function(coord_x, coord_y) {
      //Start Drupal.behaviors.knowledgemap.addNewItem
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("addNewItem: this unexpected.");
      }
      //User wants to add a new item at the clicked location.
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing("Error: addNewItem: not in edit mode.");
      }
      //Create the add form if it does not exist.
      if ( $("#km-add-new-item-container").length == 0 ) {
        //Make the add form.
        this.createAddForm(); 
      }
      //Kill the selection.
      this.clearSelection();
      //Adjust X and Y to make them relative to the drawing area.
//      coord_x -= this.$drawing_area.position().left;
//      coord_y -= this.$drawing_area.position().top;
      $('#add-new-title').val('');
      $('#add-new-type').val('');
      $("#coord_x").val(coord_x);
      $("#coord_y").val(coord_y);
      //Empty old data.
      $("#km-item-name").val("");
      $("#km-item-importance").val("");
      $("#km-item-type").val("not selected");
      $("#km-add-new-item-container").dialog("open");
    }, //End Drupal.behaviors.knowledgemap.addNewItem
    createAddForm: function() {
      //Start Drupal.behaviors.knowledgemap.createAddForm
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("createAddForm: this unexpected.");
      }
      //Creates a form that lets users add new elements.
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing("Error: createAddForm: not in edit mode.");
      }
      //Load the HTML for the add form.
      var html = this.addFormHtml();
      $("body").append(html);
      $("#km-add-new-item-container").hide();
      $("#km-add-item-help").collapse();
      //Set up the dialog.
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var lmNamespace = this;
      $("#km-add-new-item-container")
        .hide()
        .dialog({
          autoOpen: false,
          dialogClass: "no-close",
          height: 570,
          width: 700,
          modal: true,
          title: "Add new item",
          buttons:
            [ {
                id: "km_save_new_item_button",
                text: "Save",
                click: function() {
              var newName = $('#km-item-name').val();
              var newType = $('#km-item-type').val();
              var newImportance = $('#km-item-importance').val();
              var errorMessage = lmNamespace.checkNewItemData(
                  newName, newType, newImportance
              );
              if ( errorMessage != '') {
                alert(errorMessage);
              }
              else {
                var $dialogRef = $(this);
                //Create data record.
                var newItem = lmNamespace.createNewItemFromInput(
                    newName, newType, newImportance
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
                      lmNamespace.km_rep.km_items[newItem.nid] = newItem;
                      //Draw the new item.
                      lmNamespace.drawItem(newItem);
                      $dialogRef.dialog("close");
                      lmNamespace.$drawing_area.exitAddMode();
                    }
                    else {
                      lmNamespace.badThing(data.message);
                    }
                  },
                  fail: function (jqXHR, textStatus) {
                    lmNamespace.badThing( "Request failed: " + textStatus );
                  },
                  error: function (jqXHR, textStatus) {
                    lmNamespace.badThing( "Request failed: " + textStatus );
                  }
                });
              }
            } // End click function
            }, //End first array element (Save)
            {
              text: "Cancel",
              id: "km_cancel_new_item_button",
              click: function() {
              $(this).dialog("close");
              lmNamespace.$drawing_area.exitAddMode();
            }
            }//end of second array element.
            ],//End of buttons element array
          close: function() {
          }
        }); //End .dialog.
        $("#km-item-name").keypress(function(e) {
          // Enter pressed?
          if(e.which == 10 || e.which == 13) {
            e.preventDefault();
            if (e.stopPropagation){
              e.stopPropagation();
            }
            if (e.cancelBubble!=null) {
              e.cancelBubble = true;            
            }
            $("#km_save_new_item_button").click();
          }
        });
    }, //End Drupal.behaviors.knowledgemap.createAddForm
    checkNewItemData: function(itemTitle, itemType, itemImportance) {
      //Start Drupal.behaviors.knowledgemap.checkNewItemData
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("checkNewItemData: this unexpected.");
      }
      var msg = '';
      if ( ! itemTitle ) {
        msg += " Please enter a title.";
      }
      if ( ! itemType || itemType == "not selected" ){
        msg += " Please select a type.";
      }
      if ( itemImportance ) {
        if ( isNaN( itemImportance ) ) {
          msg += " Importance must be a number between 1 and 10.";
        }
        else if ( itemImportance != parseInt( itemImportance ) ) {
          msg += " Importance must be an integer (whole number) between 1 and 10.";
        }
        else if ( itemImportance < 1 || itemImportance > 10 ) {
          msg += " Please set importance between 1 and 10, or leave it blank."
        }
      }
      return msg;
    }, //End Drupal.behaviors.knowledgemap.checkNewItemData
    makeNewConnection: function(connInfoFromJsPlumb, evnt) {
      //Start Drupal.behaviors.knowledgemap.makeNewConnection
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("makeNewConnection: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing("Error: makeNewConnection: not in edit mode.");
      }
      //Kill the selection.
      this.clearSelection();
      //Check whether the connection is allowed. Modify if necessary.
      if ( this.checkConnection( connInfoFromJsPlumb ) ) {
        //Tell the server about it.
        this.saveConnection( connInfoFromJsPlumb );
        //Set the style of the connection.
        var connection = connInfoFromJsPlumb.connection;
        connection.setPaintStyle(
            this.computeConnPaintStyle( connection )
        );
        //Get info object for internal rep.
        var rid = connection.getParameter('rid');
        var connInfo = this.km_rep.connections[rid];
        //Add classes for this type of connection.
        var connCategoryClasses 
                = this.computeConnectionCategoryClasses( connInfo );
        var classes = connCategoryClasses.join(" ");
        connection.addClass(classes);
        //Add classes as parameters as well.
        if ( $.inArray("km-connection-knowledge", connCategoryClasses) != -1 ) {
          connection.setParameter("knowledge", true);
        }
        if ( $.inArray("km-connection-experience", connCategoryClasses) != -1 ) {
          connection.setParameter("experience", true);
        }
        //Convenience var for JS namespace for this module. Everything gets
        //attached to Drupal.behaviors.knowledgemap.
        var lmNamespace = this;
        connection.bind("click", function(conn, evnt) {
          lmNamespace.connectionClicked( conn, evnt );
        });
      }
    }, //End Drupal.behaviors.knowledgemap.makeNewConnection
    checkConnection: function ( connInfo ) {
      //Start Drupal.behaviors.knowledgemap.checkConnection
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("checkConnection: this unexpected.");
      }
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
        this.badThing("Source item not found. nid: " + sourceNid);
      }
      var sourceCategory = this.getItemCategory( sourceType );
      if ( sourceCategory == "unknown" ){
        this.badThing("Source item type bad. Type: " + sourceType);
      }
      //Get data about connection target.
      var targetId = connInfo.targetEndpoint.elementId;
      var targetNid = targetId.replace("km-item-", "");
      var targetType = this.getItemType( targetNid );
      if ( targetType == 'not found' ) {
        this.badThing("Target item not found. nid: " + targetNid);
      }
      var targetCategory = this.getItemCategory( targetType );
      if ( targetCategory == "unknown" ){
        this.badThing("Target item type bad. Type: " + targetType);
      }
      //Warn user about potential problems.
      var message = '';
      if ( sourceNid == targetNid ) {
        message = "Sorry, you cannot connect an element to itself.\n\n"
                + "If you can think of a good reason why you would want to, "
                + "please let Kieran know.";
        alert( message );
        jsPlumb.detach( connInfo.connection );
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
    }, //End Drupal.behaviors.knowledgemap.checkConnection
    getItemType : function( itemNid ) {
      //Start Drupal.behaviors.knowledgemap.getItemType
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("getItemType: this unexpected.");
      }
      var result = this.getItemData( itemNid );
      if ( result != 'not found' ) {
        result = result.item_type;
      } 
      return result;
    }, //End Drupal.behaviors.knowledgemap.getItemType
    getItemData : function( itemNid ) {
      //Start Drupal.behaviors.knowledgemap.getItemData
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("getItemData: this unexpected.");
      }
      //Fetch item data for the item with the given nid.
      var items = this.km_rep.km_items;
      for ( var index in items ) {
        if ( items[index].nid == itemNid ) {
          return items[index];
        }
      }
      return 'not found';      
    }, //End Drupal.behaviors.knowledgemap.getItemData
    getItemCategory : function( itemType ) {
      //Start Drupal.behaviors.knowledgemap.getItemCategory
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("getItemCategory: this unexpected.");
      }
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
        case 'other':
          category = 'experience';
          break;
        }
        return category;
    }, //End Drupal.behaviors.knowledgemap.getItemCategory
    //Array to hold refs to existing item viewers.
    kmItemViewers : new Array(), //Drupal.behaviors.knowledgemap.kmItemViewers
    getKmItemViewer : function( itemData ) {
      //Start Drupal.behaviors.knowledgemap.getKmItemViewer
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("getKmItemViewer: this unexpected.");
      }
      //Get an item viewer, either existing or new.
      if ( ! this.kmItemViewers[ itemData.nid ] ) {
        this.kmItemViewers[ itemData.nid ] 
          = new $.KmItemViewer(itemData);
      }
      return this.kmItemViewers[ itemData.nid ];
    }, //End Drupal.behaviors.knowledgemap.getKmItemViewer
    getEventCoordX : function ( evnt ) {
      //Get the X of an event relative to the drawing area.
      if ( $(evnt.target).attr('id') == this.drawing_id ) {
        //Clicked on drawing area, e.g., add new item.
        return evnt.offsetX; 
      }
      else {
        return $(evnt.target).position().left;
      }
    },
    getEventCoordY : function ( evnt ) {
      //Get the Y of an event relative to the drawing area.
      if ( $(evnt.target).attr('id') == this.drawing_id ) {
        //Clicked on drawing area, e.g., add new item.
        return evnt.offsetY - this.toolbarHeight; 
      }
      else {
        return $(evnt.target).position().top - this.toolbarHeight;
      }
    },
    setItemPosition : function( $item, x, y ) {
      //Position an item in the drawing area.
      var adjustedY = parseFloat(y) + parseFloat(this.toolbarHeight);
      $item.css('left', x + "px");
      $item.css('top', adjustedY + "px");
    },
    badThing : function ( errMsg ) {
      errMsg = 
          "Exception: " 
        + errMsg 
        + " Please take a screen shot and send it to someone.";
      console.log( errMsg );
      alert( errMsg );
    },
    saveNewPosition : function ( evnt, ui ) {
      //Start Drupal.behaviors.knowledgemap.saveNewPosition
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing( "saveNewPosition: this unexpected." );
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing( "Error: saveNewPosition: not in edit mode." );
      }
      //Save the new position of an item.
      var coord_x = this.getEventCoordX(evnt);
      var coord_y = this.getEventCoordY(evnt);
      var domId = evnt.target.id;
      var kmItemNid = domId.replace("km-item-", "");
      //Keep this for closures.
      var lmNamespace = this;
      $.ajax({
        type: "POST",
        url: Drupal.settings.basePath + 'update-km-item-pos',
        data: {
          "coord_x" : coord_x,
          "coord_y" : coord_y,
          "km_item_nid" : kmItemNid
        },
        done: function(data) {
          console.log("dog done");
          if ( data.status == 'success' ) {
            //Nowt to do.
          }
          else {
            lmNamespace.badThing( data.message );
          }
        },
        fail: function (jqXHR, textStatus) {
          lmNamespace.badThing(
            "Request failed: " + jqXHR.status + " " + textStatus
          );
        },
        error: function(jqXHR, textStatus) {
          lmNamespace.badThing(
            "Request failed: " + jqXHR.status + " " + textStatus
          );
        }
      });
    }, //End Drupal.behaviors.knowledgemap.saveNewPosition
    saveConnection : function ( connInfo ) {
      //Start Drupal.behaviors.knowledgemap.saveConnection
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("saveConnection: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        this.badThing("Error: saveConnection: not in edit mode.");
      }
      //Save data about a new connection to the server.
      //@todo Spinny thing.
      var sourceNid = connInfo.sourceId.replace("km-item-", "");
      var targetNid = connInfo.targetId.replace("km-item-", "");
      var required = "required";
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var lmNamespace = this;
//      //Show wait cursor.
//      var currentCursor = this.$drawing_area.css("cursor");
//      this.$drawing_area.css("cursor", "wait");
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
//          //Restore cursor.
//          lmNamespace.$drawing_area.css("cursor", currentCursor);
          if ( data.status == 'success' ) {
            //Add to map data array.
            var rid = data.rid;
            lmNamespace.km_rep.connections[rid] = {
              "rid" : rid,
              "from_nid" : sourceNid,
              "to_nid" : targetNid,
              "required" : "required",
              "display" : connInfo.connection
            };
            //Store rid in display object as well.
            lmNamespace.km_rep.connections[rid].display.setParameter('rid', rid);
          }
          else {
            lmNamespace.badThing(data.message + " You should refresh the page.");
          }
        },
        fail: function (jqXHR, textStatus) {
          //Restore cursor.
          lmNamespace.$drawing_area.css("cursor", currentCursor);
          lmNamespace.badThing( "Request failed: " + textStatus + " You should refresh the page.");
        },
        error: function (jqXHR, textStatus) {
          //Restore cursor.
          lmNamespace.$drawing_area.css("cursor", currentCursor);
          lmNamespace.badThing( "Request failed: " + textStatus + " You should refresh the page.");
        }
      });
    }, //End saveConnection
    redrawItem : function( nid ) {
      //Start Drupal.behaviors.knowledgemap.redrawItem
      if ( this != Drupal.behaviors.knowledgemap ) {
        this.badThing("redrawItem: this unexpected.");
      }
      //Redraw an item. Called after returning from editing, 
      //since the size of the item might have changed, importance changed, etc.
      this.drawItem( this.km_rep.km_items[nid], false );
      jsPlumb.repaint( this.km_rep.km_items[nid].display );
    }, //End Drupal.behaviors.knowledgemap.redrawItem
    addFormHtml : function() {
      //HTML for the Add form.
      var html = 
'<div id="km-add-new-item-container">' +
'<p>Please enter a name for the item, and pick its type.</p>' +
'<div id="km-add-item-help">' +
'  <p><span>Help</span></p>' +
'  <div class="km-help-content">' +
'      <p>The name should be just a few words, like "Taking photographs" or' +
'        "Depth of field." </p>' +
'      <p>Item types are either knowledge elements, or experiences.</p>' +
'      <ul>' +
'        <li>' +
'          Knowledge elements are things students learn. There are two' +
'          types of knowledge elements:' +
'          <ul>' +
'            <li>Skills. Things that students learn how to do. E.g., ' +
'            "Taking photographs."</li>' +
'            <li>Concepts. Ideas students learn, e.g., "Depth of field."</li>' +
'          </ul>' +
'        </li>' +
'        <li>' +
'          Experiences are things students do to help them learn. There are four' +
'          types of knowledge elements:' +
'          <ul>' +
'            <li>Explanations. Didactic content to read or watch. ' +
'              E.g., "Taking good photos."' +
'            </li>' +
'            <li>' +
'              Examples. Samples of concepts or skills. Can be stories. ' +
'              E.g., "Good and bad photos," "Paula shoots a picnic."' +
'            </li>' +
'            <li>' +
'              Exercises. Things that students do.' +
'              E.g., "Pick the best photo."' +
'            </li>' +
'            <li>' +
'              Patterns. Common ways of doing things.' +
'              E.g., "Photographing social events."' +
'            </li>' +
'            <li>' +
'              Other. Other experiences.' +
'              E.g., field trips.' +
'            </li>' +
'          </ul>' +
'        </li>' +
'      </ul>' +
'      <p>Importance is the importance of the item to course outcomes. ' +
'         Enter a whole number from 1 to 10, inclusive. ' +
'         You can leave it empty, if you want.</p>' +
'  </div>' +
'</div>' +
'<form id="km-add-new-item-form">' +
'  <div class="km-input-field-container">' +
'    <label for="km-item-name">Name *</label>' +
'    <div class="km-input-field-inner-container">' +
'      <input type="text" id="km-item-name" spellcheck ' +
'             placeholder="E.g., Taking photographs" required autofocus' +
'             title="Name of this item, e.g., Taking photographs"' +
'             size="30" />' +
'      <p class="km-input-field-hint">' +
'        Name of this item, e.g., Taking photographs.' +
'      </p>' +
'    </div>' +
'  </div>' +
'  <div class="km-input-field-container">' +
'    <label for="km-item-type">Type *</label>' +
'    <div class="km-input-field-inner-container">' +
'      <select id="km-item-type" title="What type of item is this?">' +
'        <option value="not selected" selected="selected">- Choose one -</option>' +
'        <optgroup label="Knowledge item">' +
'          <option value="skill">Skill</option>' +
'          <option value="concept">Concept</option>' +
'        </optgroup>' +
'        <optgroup label="Experience">' +
'          <option value="explanation">Explanation</option>' +
'          <option value="example">Example</option>' +
'          <option value="exercise">Exercise</option>' +
'          <option value="pattern">Pattern</option>' +
'          <option value="other">Other</option>' +
'        </optgroup>' +
'      </select>' +
'      <p class="km-input-field-hint">' +
'        Item type, e.g., Skill.' +
'      </p>' +
'      <input type="hidden" name="coord_x" id="coord_x">' +
'      <input type="hidden" name="coord_y" id="coord_y">' +
'    </div>' +
'  </div>' +
'  <div class="km-input-field-container">' +
'    <label for="km-item-importance">Importance</label>' +
'    <div class="km-input-field-inner-container">' +
'      <input type="text" id="km-item-importance" ' +
'             placeholder="1-10" ' +
'             title="How important is this? 1 is low importance, 10 is high."' +
'             size="4" />' +
'      <p class="km-input-field-hint">' +
'        How important is this? 1 is low importance, 10 is high.' +
'      </p>' +
'    </div>' +
'  </div>' +
'</form>';
      return html;
    }
  };    
})(jQuery);

} catch (e) {
  alert( 
        "Error! " + e.message + "/n/nPlease take a screenshot of "
      + "your entire browser screen and "
      + "send it to Kieran Mathieson at kieran@dolfinity.com./n/n"
      + "Please explain what you were trying to do at the time./n/n" 
      + "Jokes welcome as well. ");
}