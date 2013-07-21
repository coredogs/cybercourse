/*
 * An item viewer is a dialog that shows a KM item.
 */

function KmItemViewer( itemData ) {
  this.itemData = itemData;
  var htmlElData = this.makeDialogHtml();
  this.itemData.dialogDomId = htmlElData.dialogDomId;
  jQuery("body").append(htmlElData.html);
  if ( evilGlobalController.mode == "edit" ) {
    //Add the action buttons.
    this.addActionLinks( htmlElData.dialogDomId, this.itemData.nid );
  }
  var dialogOptions = {
    autoOpen : false,
    close: function() {
      var domId = jQuery(this).attr("id");
      var nid = domId.split("-").pop();
      var viewer = evilGlobalController.kmItemViewers[nid];
      viewer.dialog.dialog("close");
      viewer.dialog.dialog("destroy");
      jQuery("#" + domId).remove();
      evilGlobalController.kmItemViewers[nid] = false;
//      jQuery(this).hide();
    }
  };
  this.dialog = jQuery("#" + this.itemData.dialogDomId)
    .dialog( dialogOptions );
//  var extendedDialogOptions = {
//    modal : false,
//    draggable : true,
//    resizable : true,
//    "closable" : true,
//    "maximizable" : true,
//    "minimizable" : true,
//    "collapsable" : false,
//    "dblclick" : "minimize",
//    "minimizeLocation" : "left",
//    "icons" : {
//      "close" : "ui-icon-circle-close",
//      "maximize" : "ui-icon-circle-plus",
//      "minimize" : "ui-icon-circle-minus",
////	          "collapse" : "ui-icon-triangle-1-s",
//      "restore" : "ui-icon-bullet"
//    },
//    "beforeMaximize" : function(evt, dlg){
//      var topNav = jQuery("#navbar");
//      if ( topNav.length > 0 ) {
//        var topNavHeight = topNav.height();
//        jQuery(evt.target).parent().css("margin-top", topNavHeight);
//      }
//    }
//  };
//  this.dialog = jQuery("#" + this.itemData.dialogDomId)
//    .dialog( dialogOptions )
//    .dialogExtend( extendedDialogOptions );
//Trouble with maximized state overlapping toolbar.
  return this;
}

KmItemViewer.prototype.open = function( evnt ) {
  if ( ! evnt ) {
    throw new Exception("Open viewer: no event.");
  }
  if ( this.dialog.dialog("isOpen") ) {
    this.dialog.dialogExtend('restore');
    this.getUserAttention();
  }
  else {
    var domId = jQuery(evnt.currentTarget).attr('id');
    this.updateDialogDisplayFields();
    this.dialog.dialog("open");
    //Position dialog at right of opened item.
    this.dialog.dialog("widget").position({
      my: 'left', at: 'right',of: "#" + domId});
  }// @todo broken, check user intent stuff
  //Hide item/connection toolbars.
  if ( evilGlobalController.$itemToolbar ) {
    evilGlobalController.$itemToolbar.hide();
  }
  if ( evilGlobalController.$connectionToolbar ) {
    evilGlobalController.$connectionToolbar.hide();
  }
}

KmItemViewer.prototype.updateDialogDisplayFields = function() {
  //Update the data the dialog is showing.
  var dialogDomId = this.itemData.dialogDomId;
  var itemData = this.itemData;
  jQuery("#" + dialogDomId).dialog({ title: this.itemData.title });
  jQuery("#" + dialogDomId + " .km-item-type")
      .html( capitaliseFirstLetter( this.itemData.item_type ) );
  jQuery("#" + dialogDomId + " .km-item-body")
      .html( this.itemData.body );
  jQuery("#" + dialogDomId + " .km-item-importance span")
      .html( this.itemData.importance );      
}

KmItemViewer.prototype.makeDialogHtml = function() {
  var domId = "km-item-dialog-" + this.itemData.nid;
  var html = 
        "<div id='" + domId + "' title='" + this.itemData.title + "' "
      + "   class='km-item-dialog'>"
      + "  <p class='km-item-type'>"
      +      capitaliseFirstLetter(this.itemData.item_type)
      + "  </p>"
      + "  <p class='km-item-importance'>"
      +      "Importance: <span>" + this.itemData.importance + "</span>"
      + "  </p>"
      + "  <div class='km-item-body'>"
      +      this.itemData.body
      + "  </div>"
      + "  <footer>"
      + "  </footer>"
      + "</div>";
   return { 
     'dialogDomId' : domId,
     'html' : html
   };
}


KmItemViewer.prototype.addActionLinks = function( dialogDomId, kmItemNid ) {
  if ( evilGlobalController.mode != "edit" ) {
    //Should never happen.
    console.log("Error: addActionLlinks: not in edit mode.");
    return;
  }
  //Create edit link.
  //Does some magic to simulate the logic of CTools modal links.
  var $editLink = this.makeEditLink( kmItemNid );
  //Same for delete button, but it's simpler to create.
  var $deleteLink = this.makeDeleteLink( kmItemNid );
  //Create the toolbar.
  var $toolbar = jQuery("<div class='btn-group'>");
  $toolbar.append($editLink).append($deleteLink);
  $editLink.show();
  $deleteLink.show();
  //Add the toolbar to the dialog.
  jQuery('#' + dialogDomId).prepend( $toolbar );
  $deleteLink.click(function(evnt) {
    if ( ! confirm("Are you sure you want to delete this item?") ) {
      return;
    }
    var nid = jQuery(evnt.target).attr("data-nid");
    jQuery.ajax({
      async: false,
      type: "POST",
      url: Drupal.settings.basePath + 'delete-item-ajax',
      data: { 'nid' : nid },
      success: function(data, textStatus, jqXHR) {
        if ( data.status == 'success' ) {
          //Close viewer.
          jQuery("#km-item-dialog-" + nid).dialog("close");
          //Get ref to display object.
          var itemDisplay = evilGlobalController.km_rep.km_items[nid].display;
          //Remove from screen.
          jsPlumb.detachAllConnections(itemDisplay)
          itemDisplay.remove();
          //Kill rep data for the item.
          delete evilGlobalController.km_rep.km_items[nid];
          //Remove all connections to/from the item.
          var connData;
          for ( var index in evilGlobalController.km_rep.connections ) {
            connData = evilGlobalController.km_rep.connections[ index ];
            if ( connData.from_nid == nid || connData.to_nid == nid ) {
              //Remove the connection.
              //jsPlumb.detach( connData.display );
              //Drop map data.
              delete evilGlobalController.km_rep.connections[index];
            } //End nid matches.
          }//End for
        }//End AJAX success.
        else {
          alert(data.message);
        }
      },
      fail: function (jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      },
    });
    
    
    evnt.stopPropagation();
  });
  //jQuery('#' + dialogDomId + " footer").append( $deleteLink );
}

KmItemViewer.prototype.makeEditLink = function( kmItemNid ) {
  if ( evilGlobalController.mode != "edit" ) {
    //Should never happen.
    console.log("Error: addEditLink: not in edit mode.");
    return;
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
      .addClass('km-item-edit-link km-item-action-link btn');
  var $this = jQuery(this);
//  $newLink.click(function(){
//    //Hide the viewer. Bring it back after edit.
//    //Get a ref to it.
//    var viewerId = jQuery(this).parent().parent().attr("id");
//    var nid = viewerId.split("-").pop();
//    var kmViewer = evilGlobalController.kmItemViewers[nid];
//    kmViewer.dialog.dialog("widget").hide();
////    jQuery("#" + viewerId).hide();
////    this.dialog.dialog("hide");
//  });
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
  return $newLink;
}

KmItemViewer.prototype.makeDeleteLink = function( kmItemNid ) {
  if ( evilGlobalController.mode != "edit" ) {
    //Should never happen.
    console.log("Error: addDeleteLink: not in edit mode.");
    return;
  }
  var link = 
        "<a id='km-item-delete-link-" + kmItemNid + "' "
      +     "data-nid='" + kmItemNid + "' "
      +     "href='#'" //Click code does the server call.
      +     "class='km-item-action-link btn' "
      +     "title='Premanently delete this item.'>"
      +   "Delete"
      + "</a>";
  return jQuery(link);
}

KmItemViewer.prototype.getUserAttention = function() {
//  alert(9)
}

jQuery.fn.returnFromEditSave = function(nid) {
  if ( evilGlobalController.mode != "edit" ) {
    //Should never happen.
    console.log("Error: returnFromEditSave: not in edit mode.");
    return;
  }
  //Get new data passed by the server edit code.
  var newItemData = Drupal.settings.knowledgemap.new_item_data;
  var oldItemType = evilGlobalController.km_rep.km_items[nid].item_type;
  //Replace bits. Better way?
  evilGlobalController.km_rep.km_items[nid].title = newItemData.title;
  evilGlobalController.km_rep.km_items[nid].item_type = newItemData.item_type;
  evilGlobalController.km_rep.km_items[nid].body = newItemData.body;
  evilGlobalController.km_rep.km_items[nid].importance = newItemData.importance;
  //Update the viewer.
  var itemViewer = evilGlobalController.kmItemViewers[ nid ];
  if ( ! itemViewer ) {
    throw "Error: returnFromEditSave: viewer not found for nid " + nid;
  }
  //Update 
  itemViewer.updateDialogDisplayFields();
  evilGlobalController.updateItemDisplay( jQuery("#km-item-" + nid) );
  itemViewer.dialog.dialog("widget").show();
//  evilGlobalController.updateItemFields( nid );
  //Did the item type change?
//  if ( newItemData.item_type != oldItemType ) {
//    evilGlobalController.editChangedItemType( 
//        nid, oldItemType, newItemData.item_type
//    ); 
//  }
  evilGlobalController.redrawItem( nid );
}

jQuery.fn.returnFromEditCancel = function(nid) {
//  //Show the viewer again.
//  if ( evilGlobalController.mode != "edit" ) {
//    //Should never happen.
//    console.log("Error: returnFromEditCancel: not in edit mode.");
//    return;
//  }
//  var itemViewer = evilGlobalController.kmItemViewers[ nid ];
//  if ( ! itemViewer ) {
//    throw "Error: returnFromEditCancel: viewer not found for nid " + nid;
//  }
//  itemViewer.dialog.dialog("widget").show();
}