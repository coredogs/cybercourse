CKEDITOR.dialog.add( 'pseudentDialog', function ( editor ) {
    Drupal.settings.pseudents.currentSelection = '';
    return {
        title: 'Add a pseudent',
        minWidth: 400,
        minHeight: 200,
        contents: [
            {
              id: 'tab-pseudents',
              label: 'Pseudents',
              elements: [
                {
                  type: 'html',
                  html: '<p>Choose the pseudent you want to add.</p>' 
                          + Drupal.settings.pseudents.posePreviews
                }
              ]
              
            }
        ],
        onShow: function() {
          //Clear the selection.
          Drupal.settings.pseudents.currentSelection = "";
          jQuery("table#pseudent-choose-table tr").removeClass("sdelected");
          if ( ! jQuery("table#pseudent-choose-table tr").hasClass("processed") ) {
            jQuery("table#pseudent-choose-table tr").addClass("processed")
              .click(function(event) {
                //Clicked on a pose.
                var target = event.target;
                if ( Drupal.settings.pseudents.currentSelection ) {
                  //Remove prior selection look.
                  jQuery('#pseudent-' + Drupal.settings.pseudents.currentSelection)
                          .removeClass('selected');
                }
                //Save new selection.
                var row = jQuery(target).closest("tr");
                Drupal.settings.pseudents.currentSelection 
                  = parseInt( row.data("pseudent-nid") );
                row.addClass('selected');
              });
          }
        },
        onOk: function() {
          if ( Drupal.settings.pseudents.currentSelection ) {
            var pseudent =
              ".. pseudent::" + Drupal.settings.pseudents.currentSelection
              + "\n\n    What?\n\n";
            editor.insertText( pseudent );
            this.hide();
          }
        }
      }
    });