function KmItemViewer( itemData ) {
  this.itemData = itemData;
  var htmlElData = this.makeDialogHtml();
  this.itemData.dialogDomId = htmlElData.dialogDomId;
  jQuery("body").append(htmlElData.html);
  //Add the edit button to the footer.
  this.addEditLink( htmlElData.dialogDomId, this.itemData.nid );
//  jQuery(".km-item-dialog footer .edit-button").click(function(evnt) {
//    var itemNid = this.dataset.itemNid;
//    
//    jQuery.ajax({
//      url: Drupal.settings.basePath + 'edit-km-item/ajax/' + itemNid,
//      dataType: 'json',
//      success: function(data, textStatus, jqXHR) {
//        //Get to here, then the add form has been sucessfully generated and
//        //returned.
//        alert('in edut siccess');
//        var bp_place = 5;
//        var options = {
//          'title': 'Edit knowledge item',
//          'width': '600',
//          'height': 'auto',
//          'position': 'center'
//        };
//        if ( jQuery("#km-item-edit-form").length == 0 ) {
//          var html = "<div id='km-item-edit-form' class='km-item-edit-form'/>";
//          jQuery("body").append(html);
//        }
//        jQuery("#km-item-edit-form").html(data);
//        jQuery("#km-item-edit-form").dialog(options);
//      }
//    })    
//  });
  var dialogOptions = {
    autoOpen : false
  };
  var extendedDialogOptions = {
    modal : false,
    draggable : true,
    resizable : true,
    "closable" : true,
    "maximizable" : true,
    "minimizable" : true,
    "collapsable" : false,
    "dblclick" : "minimize",
    "minimizeLocation" : "left",
    "icons" : {
      "close" : "ui-icon-circle-close",
      "maximize" : "ui-icon-circle-plus",
      "minimize" : "ui-icon-circle-minus",
//	          "collapse" : "ui-icon-triangle-1-s",
      "restore" : "ui-icon-bullet"
    }
  };
  this.dialog = jQuery("#" + this.itemData.dialogDomId)
    .dialog( dialogOptions )
    .dialogExtend( extendedDialogOptions );
  //Size the dialog.
  
  return this;
}

KmItemViewer.prototype.open = function() {
  this.dialog.dialog("open");
}

KmItemViewer.prototype.makeDialogHtml = function() {
  var domId = "km-item-dialog-" + this.itemData.nid;
  var html = 
        "<div id='" + domId + "' title='" + this.itemData.title + "' "
      + "   class='km-item-dialog'>"
      + "  <div class='km-item-type'>"
      +      capitaliseFirstLetter(this.itemData.item_type)
      + "  </div>"
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

KmItemViewer.prototype.addEditLink = function( dialogDomId, kmItemNid ) {
  var originalLink = jQuery(".km-item-edit-link-original");
  var newLink = originalLink.clone();
  var $newLink = jQuery(newLink);
  //Insert the new nid.
  var href = $newLink.attr('href');
  href = href.replace( "km-item-nid", kmItemNid);
  $newLink
      .attr("href", href)
      .removeClass('km-item-edit-link-original')
      .addClass('km-item-edit-link');
  
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

  //Add the button to the footer.
  jQuery('#' + dialogDomId + " footer").append($newLink);
}

