/**
 * Manage a dialog that lets the user choose a pseudent. The HTML for
 * the image display is generated on the server. It's a table. 
 * THe id of the table is pseudent-choose-table.
 * 
 * Each cell
 * is a pseudent. Each cell has an id of pseudent-cell-nid, where nid is
 * the nid of a pseudent entity.
 * 
 * Each cell also has an attribute data-pseudent-nid with the sane nid.
 */
CKEDITOR.dialog.add( 'pseudentDialog', function ( editor ) {
    Drupal.settings.pseudents.currentSelection = '';
    var theDialog = this;
    return {
        cancel: function() {
          alert('cat');
        },
        title: 'Add a pseudent',
        minWidth: 400,
        minHeight: 200,
        contents: [
            {
              //****** Need a tab?
              id: 'tab-pseudents',
              label: 'Pseudents',
              elements: [
                {
                  id: 'pseudentId',
                  type: 'html',
                  html: makeChoosePseudentHtml(Drupal.settings.pseudents.posePreviews),
                  setup: function( widget ) {
                    //Clear all selection classes.
                    jQuery("table#pseudent-choose-table td")
                            .removeClass("selected");
                    //Find the selected item, if there is one.
                    widget.pseudentId = "";
                    widget.initialPseudentId = "";
                    if ( jQuery(widget.element.$).find(".pseudent-image") ) {
                      if ( jQuery(widget.element.$).find(".pseudent-image").attr("data-pseudent-id") ) {
                        widget.pseudentId = jQuery(widget.element.$).find(".pseudent-image").attr("data-pseudent-id");
                        widget.initialPseudentId = widget.pseudentId;
                      }
                    }
                    //Show current item as selected, if there is a current item.
                    //  The pseudentId is part of the DOM id of the table cell
                    //  containing data about a pseudent.
                    if ( widget.pseudentId ) {
                      jQuery('#pseudent-cell-' + widget.pseudentId)
                        .addClass('selected');
                    }
                    //Add click events to the cells.
                    if ( ! jQuery("table#pseudent-choose-table td")
                           .hasClass("processed") ) {
                      jQuery("table#pseudent-choose-table td")
//                        .addClass("processed")
                        .click(function(event) {
                          //Clicked on a pose.
                          var target = event.target;
                          //Remove prior selection.
                          if ( widget.pseudentId ) {
                            var cellId = 'pseudent-cell-' + widget.pseudentId;
                            jQuery('#' + cellId).removeClass('selected');
                          }
                          //Save new selection.
                          var cell = jQuery(target).closest("td");
                          var psendentId 
                              = parseInt( cell.attr("data-pseudent-nid") );
                          widget.pseudentId = psendentId;
                          cell.addClass('selected');
                        })
                        .dblclick(function(event) {
                          //Click on the target image.
                          event.target.click();
                          //Click on the OK button.
                          var dlg = CKEDITOR.dialog.getCurrent();
                          var okBtn = dlg.getButton('ok');
                          okBtn.click();
                        });
                    }
                  },
                  commit: function( widget ) {
                    widget.updateImage( widget.pseudentId );
                  }
                }
              ]
              
            }
        ]
      }
    });
    
function makeChoosePseudentHtml ( pseudents ) {
  var html = '<table id="pseudent-choose-table">';
  var col = 0;
  jQuery.each( pseudents, function( index, pseudent ) {
    if ( col == 0 ) {
      html += '<tr>';
    }
    html += 
       '<td class="pseudent-preview" id="pseudent-cell-' + pseudent.nid 
     +   '" data-pseudent-nid=' + pseudent.nid + '">'
     +  '<span class="pseudent-preview-title">' + pseudent.title + '</span><br>'
     +  '<img src="' + pseudent.url + '" alt="' + pseudent.caption + '">'
     + '</td>';
    if ( col == 0 ) {
      col = 1;
    }
    else if ( col == 1 ) {
      col = 2;
    }
    else {
      html += '</tr>';
      col = 0;
    }
  }); //End each.
  return html;
}