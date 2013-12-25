/*
 * An item viewer is a dialog that shows a KM item.
 */

(function($) {
  //Constructor for an item viewer.
  $.KmItemViewer = function( itemData ) {
    var lmNamespace = Drupal.behaviors.knowledgemap;
    this.itemData = itemData;
    var htmlElData = this.makeDialogHtml();
    this.itemData.dialogDomId = htmlElData.dialogDomId;
    $("body").append(htmlElData.html);
//    if ( lmNamespace.mode == "edit" ) {
    //Add the action buttons.
    this.addActionLinks( htmlElData.dialogDomId, this.itemData.nid );
//    }
    var dialogOptions = {
      autoOpen : false,
      close: function() {
        //Kill display elements and free memory on close.
        var domId = $(this).attr("id");
        var nid = domId.split("-").pop();
        var viewer = lmNamespace.kmItemViewers[nid];
        viewer.dialog.dialog("close");
        viewer.dialog.dialog("destroy");
        $("#" + domId).remove();
        lmNamespace.kmItemViewers[nid] = false;
      }
    };
    this.dialog = $("#" + this.itemData.dialogDomId)
      .dialog( dialogOptions );
    $("#" + this.itemData.dialogDomId).click(function(){
      var domId = $(this).attr("id");
      var nid = domId.split("-").pop();
      //Get user's attention - flash the small item in the map.
      var itemDisplay = lmNamespace.km_rep.km_items[nid].display;
      //Exit if already animating.
      if ( itemDisplay.is(':animated') ) {
        return;
      }
      var originalColor = itemDisplay.css("color");
      var originalBackgroundColor = itemDisplay.css("background-color");
      var state1 = {
        "background-color": "#FF9933",
        "color" : "white"
      };
      var state2 = {
        "background-color": originalBackgroundColor,
        "color" : originalColor
      };
      var speed = "fast";
      itemDisplay
        .animate(state1, speed)
        .animate(state2, speed)
        .animate(state1, speed)
        .animate(state2, speed)
      ;
    });
    return this;
  }

  $.KmItemViewer.prototype.open = function( evnt ) {
    if ( ! evnt ) {
      throw new Exception("Open viewer: no event.");
    }
    //Convenience var for JS namespace for this module. 
    var lmNamespace = Drupal.behaviors.knowledgemap;
    if ( this.dialog.dialog("isOpen") ) {
      this.dialog.dialogExtend('restore');
      this.getUserAttention();
    }
    else {
      var domId = $(evnt.currentTarget).attr('id');
      this.updateDialogDisplayFields();
      this.dialog.dialog("open");
      //Position dialog at right of opened item.
      this.dialog.dialog("widget").position({
        my: 'left', at: 'right',of: "#" + domId});
    }// @todo broken, check user intent stuff
    //Hide item/connection toolbars.
    if ( lmNamespace.$itemToolbar ) {
      lmNamespace.$itemToolbar.hide();
    }
    if ( lmNamespace.$connectionToolbar ) {
      lmNamespace.$connectionToolbar.hide();
    }
    this.dialog.dialog("widget").find(".ui-dialog-titlebar-close").focus();
  }

  $.KmItemViewer.prototype.updateDialogDisplayFields = function() {
    //Convenience var for JS namespace for this module.
//    var lmNamespace = Drupal.behaviors.knowledgemap;
    //Update the data the dialog is showing.
    var dialogDomId = this.itemData.dialogDomId;
    var itemData = this.itemData;
    $("#" + dialogDomId).dialog({ title: this.itemData.title });
    $("#" + dialogDomId + " .km-item-type")
        .html( capitaliseFirstLetter( this.itemData.item_type ) );
    //Prep the body for display.
    this.prepBody( itemData );
    $("#" + dialogDomId + " .km-item-body")
        .html( itemData.body );
    var importanceDisplay = 
        this.itemData.importance
          ? this.itemData.importance
          : "(Not set)";
    $("#" + dialogDomId + " .km-item-importance span")
        .html( importanceDisplay );      
  };

  $.KmItemViewer.prototype.makeDialogHtml = function() {
    //Convenience var for JS namespace for this module. 
//    var kmNamespace = Drupal.behaviors.knowledgemap;
    var domId = "km-item-dialog-" + this.itemData.nid;
    //Make sure the body has been rendered.
    this.prepBody( this.itemData );
    var html = 
          "<div id='" + domId + "' title='" + this.itemData.title + "' "
        + "   class='km-item-dialog km-item " + this.itemData.item_type + "'>"
        + "  <p class='km-item-type'>"
        +      capitaliseFirstLetter(this.itemData.item_type)
        + "  </p>"
        + "  <p class='km-item-importance'>"
        +      "Importance: <span>" + this.itemData.importance + "</span>"
        + "  </p>"
        + "  <div class='km-item-body'>"
        +      this.itemData.body
        + "  </div>"
        + "</div>";
     return { 
       'dialogDomId' : domId,
       'html' : html
     };
  };
  
  $.KmItemViewer.prototype.prepBody = function( itemData ) {
    //Render body of it needs it.
    if ( itemData.body ) {
      if ( ! itemData.bodyRenderedFlag ) {
        itemData.body = this.renderBody( itemData.body );
        itemData.bodyRenderedFlag = true;
      }
    }    
  };
  
  $.KmItemViewer.prototype.renderBody = function( contentToRender ) {
    //Send ReST content to server for rendering.
    var renderedResult = 'Ajax fail.';
    Drupal.behaviors.knowledgemap.spinner.spin(
      document.getElementById( Drupal.behaviors.knowledgemap.drawing_id )
    );
    $.ajax({
      async: false,
      type: "POST",
      url: Drupal.settings.basePath + 'swim-peek',
      data: {
        'content': contentToRender
      },
      beforeSend: function() {
//        Drupal.behaviors.knowledgemap.spinner.spin(
//          document.getElementById( Drupal.behaviors.knowledgemap.drawing_id )
//        );
      },
      complete: function() {
//        Drupal.behaviors.knowledgemap.spinner.stop();
      },
      success: function(data, textStatus, jqXHR) {
        if ( data.status == 'success' ) {
          renderedResult = data.result;
        }
        else {
          renderedResult = "Ajax preview call failed.";
        } // end data.status not success.
      }, //End success function.
      fail: function(jqXHR, textStatus) {
        renderedResult = "Ajax preview request failed.";
      }
    });
    Drupal.behaviors.knowledgemap.spinner.stop();
    return renderedResult;
  }

  //Add Edit and Delete buttons to the dialog, when in ediit mode.
  $.KmItemViewer.prototype.addActionLinks = function( dialogDomId, kmItemNid ) {
    //Convenience var for JS namespace for this module.
    var lmNamespace = Drupal.behaviors.knowledgemap;
//    if ( lmNamespace.mode != "edit" ) {
//      //Should never happen.
//      console.log("Error: addActionLlinks: not in edit mode.");
//      return;
//    }
    //Create the toolbar.
    var $toolbar = $("<div class='km-action-group'>");
    //Add the toolbar to the dialog.
    $('#' + dialogDomId).prepend( $toolbar );
    //Details link doesn't need ctools.
    var $detailsLink = this.makeDetailsLink( kmItemNid );
    $toolbar.append( $detailsLink );
    $detailsLink.show();
    if ( lmNamespace.mode == "edit" ) {
      //Create edit link.
      //Does some magic to simulate the logic of CTools modal links.
      var $editLink = this.makeEditLink( kmItemNid );
      //Same for delete button, but it's simpler to create.
      var $deleteLink = this.makeDeleteLink( kmItemNid );
      $toolbar.append($editLink);
      $toolbar.append($deleteLink);
      $editLink.show();
      $deleteLink.show();
      $deleteLink.click(function(evnt) {
        if ( ! confirm("Are you sure you want to delete this item?") ) {
          return;
        }
        var nid = jQuery(evnt.target).attr("data-nid");
        $.ajax({
          async: false,
          type: "POST",
          url: Drupal.settings.basePath + 'delete-item-ajax',
          data: { 'nid' : nid },
          success: function(data, textStatus, jqXHR) {
            if ( data.status == 'success' ) {
              //Close viewer.
              $("#km-item-dialog-" + nid).dialog("close");
              //Get ref to display object.
              var itemDisplay = lmNamespace.km_rep.km_items[nid].display;
              //Remove from screen.
              jsPlumb.detachAllConnections(itemDisplay)
              itemDisplay.remove();
              //Kill rep data for the item.
              delete lmNamespace.km_rep.km_items[nid];
              //Remove all connections to/from the item.
              var connData;
              for ( var index in lmNamespace.km_rep.connections ) {
                connData = lmNamespace.km_rep.connections[ index ];
                if ( connData.from_nid == nid || connData.to_nid == nid ) {
                  //Remove the connection.
                  //jsPlumb.detach( connData.display );
                  //Drop map data.
                  delete lmNamespace.km_rep.connections[index];
                } //End nid matches.
              }//End for
            }//End AJAX success.
            else {
              alert(data.message);
            }
          },
          fail: function (jqXHR, textStatus) {
            throw new Exception( "Request failed: " + textStatus );
          },
        });
      });
    }
  }

  $.KmItemViewer.prototype.makeEditLink = function( kmItemNid ) {
    //Convenience var for JS namespace for this module. 
    var lmNamespace = Drupal.behaviors.knowledgemap;
    if ( lmNamespace.mode != "edit" ) {
      //Should never happen.
      throw new Exception("Error: addEditLink: not in edit mode.");
    }
    var originalLink = jQuery(".km-item-edit-link-original");
    var newLink = originalLink.clone();
    var $newLink = jQuery(newLink);
    //Insert the new nid.
    var href = $newLink.attr('href');
    href = href.replace( "km-item-nid", kmItemNid);
    $newLink
        .attr("href", href)
        .removeClass('km-item-edit-link-original')
        .addClass('km-item-edit-link cyco-button-small');
    //var $this = $(this);
    //Copied from ctools modal.js. Registers the new link with the modal logic.
    $newLink.click(Drupal.CTools.Modal.clickAjaxLink);
    // Create a drupal ajax object
    var element_settings = {};
    if ($newLink.attr('href')) {
      element_settings.url = $newLink.attr('href');
      element_settings.event = 'click';
      element_settings.progress = { type: 'throbber' };
    }
    var base = $newLink.attr('href');
    Drupal.ajax[base] = new Drupal.ajax(base, newLink, element_settings);
    return $($newLink);
  }

  $.KmItemViewer.prototype.makeDeleteLink = function( kmItemNid ) {
    //Convenience var for JS namespace for this module. 
    var lmNamespace = Drupal.behaviors.knowledgemap;
    if ( lmNamespace.mode != "edit" ) {
      //Should never happen.
      throw new Exception("Error: addDeleteLink: not in edit mode.");
    }
    var link = 
          "<a id='km-item-delete-link-" + kmItemNid + "' "
        +     "data-nid='" + kmItemNid + "' "
        +     "href='javascript:void(0)'" //Click code does the server call.
        +     "class='cyco-button-small' "
        +     "title='Premanently delete this item.'>"
        +   "Delete"
        + "</a>";
    return $(link);
  }

  $.KmItemViewer.prototype.makeDetailsLink = function( lmItemNid ) {
    //Convenience var for JS namespace for this module. 
    var lmNamespace = Drupal.behaviors.knowledgemap;
    var link = 
          "<a "
        +     "href='" + Drupal.settings.basePath + "node/" + lmItemNid + "' "
        +     "target='_blank' "
        +     "class='cyco-button-small' "
        +     "title='Show details about this item in a new window.'>"
        +   "Details"
        + "</a>";
    return $(link);
  }

  $.fn.returnFromKmEditSave = function(nid) {
    //Convenience var for JS namespace for this module.
    var lmNamespace = Drupal.behaviors.knowledgemap;
    if ( lmNamespace.mode != "edit" ) {
      //Should never happen.
      throw new Exception("Error: returnFromEditSave: not in edit mode.");
    }
    //Get new data passed by the server edit code.
    //Server code puts the data into the settings, rather than behaviors.
    var newItemData = Drupal.settings.knowledgemap.new_item_data;
    var oldItemType = lmNamespace.km_rep.km_items[nid].item_type;
    //Replace bits. Better way?
    lmNamespace.km_rep.km_items[nid].title = newItemData.title;
    lmNamespace.km_rep.km_items[nid].item_type = newItemData.item_type;
    //Make sure body has at least an MT string.
    lmNamespace.km_rep.km_items[nid].body = 
        newItemData.body ? newItemData.body : "";
    lmNamespace.km_rep.km_items[nid].importance = newItemData.importance;
    //Show not rendered into HTML yet.
    lmNamespace.km_rep.km_items[nid].bodyRenderedFlag = false;
    //Update the viewer.
    var itemViewer = lmNamespace.kmItemViewers[ nid ];
    if ( ! itemViewer ) {
      throw new Exception("returnFromEditSave: no viewer for nid " + nid);
    }
    //Update 
    itemViewer.updateDialogDisplayFields();
    lmNamespace.updateItemDisplay( jQuery("#km-item-" + nid) );
    itemViewer.dialog.dialog("widget").show();
  }

})(jQuery);