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
      // @todo Show swirly thing.
      //Set some convenience vars.
      //Mode - edit or view.
      this.mode = settings.knowledgemap.mode;
      //The nid of the KM.
      this.km_nid = settings.knowledgemap.km_nid;
      //Data about items and connecitons.
      this.km_rep = settings.knowledgemap.knowledgemap_rep;
        //km_rep.km_item.display is a DOM element.
        //km_rep.connection.display is a jsPlumb thing.
      //Valid item types.
      this.validItemTypes = settings.knowledgemap.all_item_types;
      //Make a string with class names derived from item types.
      this.itemTypeClassNames = "";
      for ( var typeName in this.validItemTypes ) {
        this.itemTypeClassNames += typeName + " ";
      }
      var drawing_id = settings.knowledgemap.drawing_dom_id;
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
      this.addMethodsToDrawingArea();
//      this.scrollbarHeight = scrollbarSize[1];
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var kmNamespace = this;
      jsPlumb.ready(function() {
        kmNamespace.setJsPlumbDefaults();
        kmNamespace.drawAllItems();
        kmNamespace.drawAllConnections();
        kmNamespace.adjustDrawingHeight();
        if ( kmNamespace.mode == "edit" ) {
          jsPlumb.bind("connection", function(info, evnt) {
            kmNamespace.makeNewConnection(info, evnt);
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
      if ( this.mode == "edit" ) {
        toolbarHtml +=
              "<div class='btn-group'>"
          +     "<a id='add-km-item' class='btn' data-toggle='a' href='javascript:void(0)'>Add item</a>"
          +     "<a id='cancel-km-add' class='btn' href='javascript:void(0)'>Cancel</a>"
          +   "</div>";
      }
      toolbarHtml += 
              "<div class='btn-group'>"
          +     "<a id='show-km-knowledge' class='btn' href='javascript:void(0)'>Knowledge</a>"
          +     "<a id='show-km-experiences' class='btn' href='javascript:void(0)'>Experiences</a>"
          +   "</div>"
          + "</div>";
      this.$drawing_area.prepend( toolbarHtml );
      if ( this.mode == "edit" ) {
        //Hide the cancel button.
        $("#cancel-km-add").attr("disabled", "disabled");
        //Set up the Add button.
        //Convenience var for JS namespace for this module. Everything gets
        //attached to Drupal.behaviors.knowledgemap.
        var kmNamespace = this;
        $("#add-km-item").click(function(evnt) {
          kmNamespace.clearSelection();
          //If already in add, exit state.
          if ( kmNamespace.$drawing_area.state == 'add') {
            //Exit add mode.
            evnt.stopPropagation();
            kmNamespace.$drawing_area.exitAddMode();
            return;
          }
          //Move into adding state.
          evnt.stopPropagation();
          $("#add-km-item").button("toggle");
          $("#cancel-km-add").removeAttr("disabled");
          kmNamespace.$drawing_area.addClass("adding-state");
          kmNamespace.$drawing_area.state = "add";
          return false; //No propagation. 
        }); //End add item click.
        //The cancel button.
        $("#cancel-km-add").click(function(evnt){
          if ( kmNamespace.$drawing_area.state == "add" ) {
            kmNamespace.$drawing_area.exitAddMode();
          }
        }); //End cancel button click.
      }
    }, //End Drupal.behaviors.knowledgemap.createTopToolbar
    createFloatingToolbars: function() {
      var itemToolbar = $(
          "<div id='km-item-toolbar' class='knowledgemap-toolbar'>"
        +   "<div id='km-item-show-details' "
        +        "class='btn'>Details</div>"
        + "</div>"
      );
      this.$drawing_area.append(itemToolbar);
      this.$itemToolbar = itemToolbar;
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var kmNamespace = this;
      $("#km-item-show-details").click(function(evnt) {
        //Get the selected item's data.
        var itemNid = kmNamespace.selectedItem.nid;
        var itemData = kmNamespace.km_rep.km_items[itemNid];
        //Get a viewer for it.
        var viewer = kmNamespace.getKmItemViewer(itemData);
        viewer.open( evnt );
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
          +   "<div id='km-connection-reinforcing' "
          +        "class='btn'>Switch to reinforcing</div>"
          +   "<div id='km-connection-required' "
          +        "class='btn'>Switch to required</div>"
          +   "<div id='km-connection-delete' "
          +        "class='btn'>Delete</div>"
          + "</div>"
        );
        this.$drawing_area.append(connectionToolbar);
        //Cache in kmNamespace.
        this.$connectionToolbar = connectionToolbar;
        this.$connectionFrom = $("#km-connection-from");
        this.$connectionTo = $("#km-connection-to");
        $("#km-connection-reinforcing").click(function(evnt) {
          //Switch from required to reinforcing.
          kmNamespace.switchConnectionRequired( "reinforcing" );
        });
        $("#km-connection-required").click(function(evnt) {
          //Switch from reinforcing to required.
          kmNamespace.switchConnectionRequired( "required" );
        });
        $("#km-connection-delete").click(function(evnt) {
          //Delete a connection.
          kmNamespace.deleteConnection( );
        });
      }
    },  //End Drupal.behaviors.knowledgemap.createFloatingToolbars
    switchConnectionRequired: function( newType ) {
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: switchConnectionRequired: not in edit mode.");
      }
      //Confirm.
      if ( ! confirm("Are you sure you want to change the connection type?") ) {
        return;
      }
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
      var kmNamespace = this;
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
            var style = kmNamespace.computeConnPaintStyle( display );
            display.setPaintStyle( style );
          }
          else {
            throw new Exception(data.message);
          }
        },
        fail: function(jqXHR, textStatus) {
          throw new Exception( "Request failed: " + textStatus );
        }
      });
    }, //End Drupal.behaviors.knowledgemap.switchConnectionRequired
    deleteConnection: function( ) {
      //Start Drupal.behaviors.knowledgemap.deleteConnection
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("deleteConnection: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: deleteConnection: not in edit mode.");
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
      var kmNamespace = this;
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
            var display = kmNamespace.selectedConnection.display;
            jsPlumb.detach( display );
            //Remove the connection from the km rep.
            delete kmNamespace.km_rep.connections[rid];
            //Unselect.
            kmNamespace.clearSelection();
          }
          else {
            throw new Exception(data.message);
          }
        },
        fail: function(jqXHR, textStatus) {
          throw new Exception( "Request failed: " + textStatus );
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
      $("#show-km-knowledge").button("toggle");
      $("#show-km-experiences").button("toggle");
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var kmNamespace = this;
      this.$drawing_area.click(function(evnt) {
        if (kmNamespace.$drawing_area.state == "add") {
          if ( kmNamespace.mode != "edit" ) {
            //Should never happen.
            throw new Exception("Error: $drawing_area.click add: not in edit mode.");
          }
          kmNamespace.addNewItem(evnt.pageX, evnt.pageY);
          evnt.stopPropagation();
        }
        else {
          //Clear selection if there is any.
          kmNamespace.clearSelection();
        }
      }); //End drawing area click.
      $(document).keydown(function(evnt) {
        if ( evnt.keyCode == 27 ) {
          //User pressed ESC key.
          if ( kmNamespace.$drawing_area.state == "add" ) {
            if ( kmNamespace.mode != "edit" ) {
              //Should never happen.
              throw new Exception("Error: ESC pressed: not in edit mode.");
            }
            //Exit add mode.
            evnt.stopPropagation();
            evnt.preventDefault();
            kmNamespace.$drawing_area.exitAddMode();
          }
          else {
            kmNamespace.clearSelection();
            evnt.preventDefault();
          }
        }
      }); //End esc keydown
      this.$drawing_area.exitAddMode = function() {
        kmNamespace.$drawing_area.state = "normal";
        kmNamespace.$drawing_area.removeClass("adding-state");
        $("#cancel-km-add").attr("disabled", "disabled");
        $("#add-km-item").button("toggle");
        $(".sendback").remove();
      };// end $drawing_area.exitAddMode
      //Set up the Show Knowledge Layer button.
      $("#show-km-knowledge").click(function(evnt){
        $("#show-km-knowledge").button("toggle");
        kmNamespace.$drawing_area.showKnowledgeLayer
            = ! kmNamespace.$drawing_area.showKnowledgeLayer;
        kmNamespace.showCorrectItems();
      }); //End click show knowledge.
      //Set up the Show Experiences Layer button.
      $("#show-km-experiences").click(function(evnt){
        $("#show-km-experiences").button("toggle");
        kmNamespace.$drawing_area.showExperiencesLayer
            = ! kmNamespace.$drawing_area.showExperiencesLayer;
        kmNamespace.showCorrectItems();
      }); //End click show experiences.
    }, //End Drupal.behaviors.knowledgemap.addMethodsToDrawingArea'
    showCorrectItems : function() {
      var knowledgeItems = $(".km-item").filter(".skill, .concept");
      var experienceItems = $(".km-item")
          .filter(".explanation, .example, .exercise, .pattern .other");
      var knowledgeConnections = $(".km-connection-knowledge");
      var experienceConnections = $(".km-connection-experience");
      if (    this.$drawing_area.showKnowledgeLayer 
           && this.$drawing_area.showExperiencesLayer
         )
        {
        //Show everything.
        knowledgeItems.show();
        experienceItems.show();
        knowledgeConnections.show();
        experienceConnections.show();
      }
      else if (    ! this.$drawing_area.showKnowledgeLayer 
                && ! this.$drawing_area.showExperiencesLayer
         )
        {
        //Hide everything.
        knowledgeItems.hide();
        experienceItems.hide();
        knowledgeConnections.hide();
        experienceConnections.hide();
      }
      else if (      this.$drawing_area.showKnowledgeLayer 
                && ! this.$drawing_area.showExperiencesLayer
         )
        {
        //Hide everything.
        knowledgeItems.show();
        experienceItems.hide();
        knowledgeConnections.show();
        experienceConnections.hide();
      }
      else if (    ! this.$drawing_area.showKnowledgeLayer 
                &&   this.$drawing_area.showExperiencesLayer
         )
        {
        //Hide everything.
        knowledgeItems.hide();
        experienceItems.show();
        experienceConnections.show();
        knowledgeConnections.hide();
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
        throw new Exception("clearSelection: this unexpected.");
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
        throw new Exception("setJsPlumbDefaults: this unexpected.");
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
        throw new Exception("drawAllItems: this unexpected.");
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
        throw new Exception("drawItem: this unexpected.");
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
      //Set display elements.
      this.updateItemDisplay( $item );
      //Add events to display for item.
      this.addEventsToItem( $item );
      //Append to the drawing.
      this.$drawing_area.append( $item );
      //Check whether it pushed the drawing bottom down.
      if ( ! skipAdjustDrawingHeight ) {
        this.adjustDrawingHeight();
      }
    }, //End Drupal.behaviors.knowledgemap.drawItem
    addEventsToItem : function( $item ){
      //Start Drupal.behaviors.knowledgemap.addEventsToItem
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("addEventsToItem: this unexpected.");
      }
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var kmNamespace = this;
      //Set up select item click.
      $item.click( function(evnt) {
        kmNamespace.itemClicked ( evnt );
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
            kmNamespace.$itemToolbar.hide();
            if ( kmNamespace.mode == "edit" ) {
              kmNamespace.$connectionToolbar.hide();
            }
          },
          stop : function(evnt, ui) {
            if ( kmNamespace.mode == "edit" ) {
              //When KM item dragged, save its new position.
              kmNamespace.saveNewPosition( evnt, ui );
            }
            kmNamespace.adjustDrawingHeight();
          }
        }
      );      
    }, //End Drupal.behaviors.knowledgemap.addEventsToItem
    updateItemDisplay: function ( $itemDisplay ) {
      //Start Drupal.behaviors.knowledgemap.updateItemDisplay
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("updateItemDisplay: this unexpected.");
      }
      //Update the displayed item.
      //$itemDisplay is a div showing an item.
      var domId = $itemDisplay.attr('id');
      var nid = domId.replace("km-item-", "");
      var itemData = this.km_rep.km_items[nid];
      //Update the fields showing on an item display.
      $("#km-item-" + nid + " header h1").html( trimLR(itemData.title) ); 
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
      $itemDisplay.css({
        "left": parseInt(itemData.coord_x),
        "top": parseInt(itemData.coord_y)
      });
    }, //End Drupal.behaviors.knowledgemap.updateItemDisplay
    itemClicked : function ( evnt ) {
      //Start Drupal.behaviors.knowledgemap.itemClicked
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("itemClicked: this unexpected.");
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
        //Show the toolbar.
        this.positionItemToolbar( $newItemClicked );
        this.$itemToolbar.show('fast');
      }
      evnt.stopPropagation();
    }, //End Drupal.behaviors.knowledgemap.itemClicked
    prepareConnectionToolbar : function ( connectionData ) {
      //Start Drupal.behaviors.knowledgemap.prepareConnectionToolbar
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("prepareConnectionToolbar: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: prepareConnectionToolbar: not in edit mode.");
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
        throw new Exception("drawAllItems: this positionItemToolbar.");
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
        throw new Exception("positionConnectionToolbar: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: positionConnectionToolbar: not in edit mode.");
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
        throw new Exception("drawAllConnections: this unexpected.");
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
        throw new Exception("drawConnection: this unexpected.");
      }
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var kmNamespace = this;
      //skipAdjustDrawingHeight is true if drawItem should not check whether 
      //the connection changes the max height of all elements in the drawing.
      //This is false, except when drawing the initial connections.
      //Is this a knowledge or experience item? 
      var connCategoryClasses = this.computeConnectionCategoryClasses( connData );
      var connection = jsPlumb.connect({
        source : "km-item-" + connData.from_nid, 
        target : "km-item-" + connData.to_nid,
        cssClass : connCategoryClasses,
        //Add the relationship id, index into km_rep.
        'parameters' : { 'rid' : connData.rid }
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
          kmNamespace.connectionClicked( conn, evnt );
        });
      }
    }, //End Drupal.behaviors.knowledgemap.drawConnection
    computeConnectionCategoryClasses : function( connData ) {
      //Start Drupal.behaviors.knowledgemap.computeConnectionCategoryClasses
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("computeConnectionCategoryClasses: this unexpected.");
      }
      var fromType = this.km_rep.km_items[connData.from_nid].item_type;
      var toType = this.km_rep.km_items[connData.to_nid].item_type;
      var categoryClasses = "";
      //Work out whether a connection connects just knowledge items, 
      //or involves experiences as well.
      var knowledge = ["skill", "concept"];
      if ( 
              $.inArray( fromType, knowledge ) >= 0
           || $.inArray( toType, knowledge ) >= 0
          ) {
        categoryClasses += "km-connection-knowledge ";
      }
      var experiences = ["explanation", "example", "exercise", "pattern", "other"];
      if ( 
              $.inArray( fromType, experiences ) >= 0
           || $.inArray( toType, experiences ) >= 0
          ) {
        categoryClasses += " km-connection-experience ";
      }
      return categoryClasses;
    }, //End Drupal.behaviors.knowledgemap.computeConnectionCategoryClasses
    connectionClicked : function( clickedConnJsPlumbDisplayObject, evnt ) {
      //Start Drupal.behaviors.knowledgemap.connectionClicked
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("connectionClicked: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: connectionClicked: not in edit mode.");
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
        throw new Exception("computeConnPaintStyle: this unexpected.");
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
        throw new Exception("createNewItemFromInput: this unexpected.");
      }
      var newItem = {
        'title' : newName,
        'item_type' : newType,
        'importance' : newImportance,
        'coord_x' : $("#coord_x").val(),
        'coord_y' : $("#coord_y").val(),
        'km_nid' : this.km_nid
      };
      return newItem;
    }, //End Drupal.behaviors.knowledgemap.createNewItemFromInput
    addNewItem: function(coord_x, coord_y) {
      //Start Drupal.behaviors.knowledgemap.addNewItem
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("addNewItem: this unexpected.");
      }
      //User wants to add a new item at the clicked location.
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: addNewItem: not in edit mode.");
      }
      //Create the add form if it does not exist.
      if ( $("#km-add-new-item-container").length == 0 ) {
        //Make the add form.
        this.createAddForm(); 
      }
      //Kill the selection.
      this.clearSelection();
      //Adjust X and Y to make them relative to the drawing area.
      coord_x -= this.$drawing_area.position().left;
      coord_y -= this.$drawing_area.position().top;
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
        throw new Exception("createAddForm: this unexpected.");
      }
      //Creates a form that lets users add new elements.
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: createAddForm: not in edit mode.");
      }
      //Load the HTML for the add form.
      var html = this.addFormHtml();
      $("body").append(html);
      $("#km-add-new-item-container").hide();
      $("#km-add-item-help").collapse();
      //Set up the dialog.
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var kmNamespace = this;
      $("#km-add-new-item-container")
        .hide()
        .dialog({
          autoOpen: false,
          dialogClass: "no-close",
          height: 540,
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
              var errorMessage = kmNamespace.checkNewItemData(
                  newName, newType, newImportance
              );
              if ( errorMessage != '') {
                alert(errorMessage);
              }
              else {
                var $dialogRef = $(this);
                //Create data record.
                var newItem = kmNamespace.createNewItemFromInput(
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
                      kmNamespace.km_rep.km_items[newItem.nid] = newItem;
                      //Draw the new item.
                      kmNamespace.drawItem(newItem);
                      $dialogRef.dialog("close");
                      kmNamespace.$drawing_area.exitAddMode();
                    }
                    else {
                      throw new Exception(data.message);
                    }
                  },
                  fail: function (jqXHR, textStatus) {
                    throw new Exception( "Request failed: " + textStatus );
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
              kmNamespace.$drawing_area.exitAddMode();
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
        throw new Exception("checkNewItemData: this unexpected.");
      }
      var msg = '';
      if ( ! itemTitle ) {
        msg += " Please enter a title.";
      }
      if ( ! itemType || itemType == "not selected" ){
        msg += " Please select a type.";
      }
      if ( itemImportance ) {
        if ( itemImportance < 1 || itemImportance > 10 ) {
          msg += " Please set importance between 1 and 10, or leave blank."
        }
      }
      return msg;
    }, //End Drupal.behaviors.knowledgemap.checkNewItemData
    makeNewConnection: function(connInfo, evnt) {
      //Start Drupal.behaviors.knowledgemap.makeNewConnection
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("makeNewConnection: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: makeNewConnection: not in edit mode.");
      }
      //Kill the selection.
      this.clearSelection();
      //Check whether the connection is allowed. Modify if necessary.
      if ( this.checkConnection( connInfo ) ) {
        //Tell the server about it.
        this.saveConnection( connInfo );
        //Set the style of the connection.
        var connection = connInfo.connection;
        connection.setPaintStyle(
            this.computeConnPaintStyle( connection )
        );
        //Convenience var for JS namespace for this module. Everything gets
        //attached to Drupal.behaviors.knowledgemap.
        var kmNamespace = this;
        connection.bind("click", function(conn, evnt) {
          kmNamespace.connectionClicked( conn, evnt );
        });
      }
    }, //End Drupal.behaviors.knowledgemap.makeNewConnection
    checkConnection: function ( connInfo ) {
      //Start Drupal.behaviors.knowledgemap.checkConnection
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("checkConnection: this unexpected.");
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
        throw new Exception("getItemType: this unexpected.");
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
        throw new Exception("getItemData: this unexpected.");
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
        throw new Exception("getItemCategory: this unexpected.");
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
        throw new Exception("getKmItemViewer: this unexpected.");
      }
      //Get an item viewer, either existing or new.
      if ( ! this.kmItemViewers[ itemData.nid ] ) {
        this.kmItemViewers[ itemData.nid ] 
          = new $.KmItemViewer(itemData);
      }
      return this.kmItemViewers[ itemData.nid ];
    }, //End Drupal.behaviors.knowledgemap.getKmItemViewer
    saveNewPosition : function ( evnt, ui ) {
      //Start Drupal.behaviors.knowledgemap.saveNewPosition
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("saveNewPosition: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: saveNewPosition: not in edit mode.");
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
            throw new Exception(data.message);
          }
        },
        fail: function (jqXHR, textStatus) {
          throw new Exception( "Request failed: " + textStatus );
        },
      });
    }, //End Drupal.behaviors.knowledgemap.saveNewPosition
    saveConnection : function ( connInfo ) {
      //Start Drupal.behaviors.knowledgemap.saveConnection
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("saveConnection: this unexpected.");
      }
      if ( this.mode != "edit" ) {
        //Should never happen.
        throw new Exception("Error: saveConnection: not in edit mode.");
      }
      //Save data about a new connection to the server.
      //@todo Spinny thing.
      var sourceNid = connInfo.sourceId.replace("km-item-", "");
      var targetNid = connInfo.targetId.replace("km-item-", "");
      var required = "required";
      //Convenience var for JS namespace for this module. Everything gets
      //attached to Drupal.behaviors.knowledgemap.
      var kmNamespace = this;
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
//          kmNamespace.$drawing_area.css("cursor", currentCursor);
          if ( data.status == 'success' ) {
            //Add to map data array.
            var rid = data.rid;
            kmNamespace.km_rep.connections[rid] = {
              "rid" : rid,
              "from_nid" : sourceNid,
              "to_nid" : targetNid,
              "required" : "required",
              "display" : connInfo.connection
            };
            //Store rid in display object as well.
            kmNamespace.km_rep.connections[rid].display.setParameter('rid', rid);
          }
          else {
            throw new Exception(data.message + " You should refresh the page.");
          }
        },
        fail: function (jqXHR, textStatus) {
          //Restore cursor.
          kmNamespace.$drawing_area.css("cursor", currentCursor);
          throw new Exception( "Request failed: " + textStatus + " You should refresh the page.");
        },
      });
    }, //End saveConnection
    redrawItem : function( nid ) {
      //Start Drupal.behaviors.knowledgemap.redrawItem
      if ( this != Drupal.behaviors.knowledgemap ) {
        throw new Exception("redrawItem: this unexpected.");
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
'<p>Please enter a name for the knowledge item, and pick its type.</p>' +
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