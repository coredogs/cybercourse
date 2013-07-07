function KmItemViewer( itemData ) {
  this.itemData = itemData;
  var htmlElData = this.makeDialogHtml();
  this.itemData.dialogDomId = htmlElData.dialogDomId;
  $("body").append(htmlElData.html);
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
  this.dialog = $("#" + this.itemData.dialogDomId)
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
      +      this.itemData.item_type
      + "  </div>"
      + "  <div class='km-item-body'>"
      +      this.itemData.body
      + "  </div>"
      + "</div>";
   return { 
     'dialogDomId' : domId,
     'html' : html
   };
}