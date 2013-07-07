  function KmItem( itemData ) {
    this.itemData = itemData;
    var htmlElData = this.makeDialogHtml( itemData );
    this.itemData.dialogDomId = htmlElData.domId;
    $("body").append(htmlElData);
    this.dialog = $("#" + this.itemData.dialogDomId)
      .dialog({ "title" : "My Dialog" })
	    .dialogExtend({
	        "maximizable" : true,
	        "dblclick" : "maximize",
	        "icons" : { "maximize" : "ui-icon-arrow-4-diag" }
	      });
  }
  
  KmItem.prototype.show = function() {
    this.dialog.show();
  }