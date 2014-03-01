/**
 * CK plugin to insert a pseudent into a SWIM editor's content.
 */

//(function ($) {
  CKEDITOR.plugins.add('insert_pseudent', {
    requires: 'widget',
    icons: 'insert_pseudent',
    init: function(editor) {
      //Get all the pseudent category terms in use.
      Drupal.settings.pseudents.catTerms = listCategoryTerms();
      //Add a dialog to the plugin.
      CKEDITOR.dialog.add( 'pseudentDialog', this.path + 'dialogs/insert_pseudent.js' );    
      //Define a widget.
      editor.widgets.add('insert_pseudent', {
        init: function() {
           r=3;
        },
        onInit: function() {
           r=3;
        },
        onDialog:function(e) {
           k=90;
          alert('pig')
        },
        dialog:function(e) {
           k=90;
          alert('ffffff');
          return 'pseudentDialog';
        },
        
        //Property holding the selected id.
        pseudentId: "",
        //Property holding the id that was selected when the widget started.
        initialPseudentId: "",
        button: 'Insert a pseudent',
        template:
              '<div class="pseudent">'
            +   '<div class="pseudent-image-container">'
            +     '<img class="pseudent-image">'
            +     '<div class="pseudent-image-caption">' 
            +     '</div>'
            +   '</div>'
            +   '<div class="pseudent-content">Content...</div>'
            + '</div>',
        updateImage: function( newPseudentId ) {
          if ( newPseudentId && newPseudentId != this.initialPseudentId ) {
            var imageUrl 
                = Drupal.settings.pseudents.posePreviews[ newPseudentId ].url;
            var imageElement = jQuery(this.element.$).find('.pseudent-image');
            imageElement
              .attr("data-pseudent-id", newPseudentId)
              .attr("src", imageUrl);
            var captionElement = jQuery(this.element.$).find('.pseudent-image-caption');
            captionElement.html( 
                Drupal.settings.pseudents.posePreviews[ newPseudentId ].caption 
            );
          }
        },
        data:function() {
          alert('data');
           t=6;
        },
        editables: {
          content: {
            selector: '.pseudent-content'
          }
        },
        allowedContent:
                'div(!pseudent); '
              + 'div(!pseudent-image-container); '
              + 'div(!pseudent-image); '
              + 'div(!pseudent-image-caption); '
              + 'div(!pseudent-content); ',
        requiredContent: 'div(pseudent)',
//        dialog: 'pseudentDialog',
        upcast: function(element) {
          return element.name == 'div' && element.hasClass('pseudent');
        }
      });

      editor.addCommand('insertPseudent', 
        new CKEDITOR.dialogCommand( 'pseudentDialog' )
      );

      //Add stylesheet.
      editor.on("instanceReady", function() {
        this.document.appendStyleSheet( Drupal.settings.pseudents.poseStylesheet );
        this.document.appendStyleSheet( Drupal.settings.pseudents.poseStylesheetEdit );
      });

      editor.ui.addButton( 'Pseudent', {
          label: 'Insert a pseudent',
          command: 'insertPseudent',
          state: CKEDITOR.TRISTATE_ENABLED,
          icon : this.path + 'insert_pseudent.png',
          toolbar: 'others'
      });
    }
  });
  
  /**
   * Generate a list of the category terms, for the dialog select.
   * @returns array List of terms in use, indexed by term id.
   */
  function listCategoryTerms() {
    var categoryTerms = new Array();
    //Loop across all poses.
    jQuery.each( Drupal.settings.pseudents.posePreviews, function(poseIndex, previewData) {
      //Get terms for this pose.
      var termsForPreview = previewData.categories;
      //Loop across all terms.
      jQuery.each( termsForPreview, function(termIndex, termData){
        //Is term already in the list?
        var alreadyExists = false;
        for ( var index = 0; index < categoryTerms.length; index++) {
          if ( categoryTerms[index].tid == termIndex ) {
            alreadyExists = true;
            break;
          }
        }
        //Add term, is not already there.
        if ( ! alreadyExists ) {
          var newTermDef = {'tid': termIndex, 'term': termData};
          categoryTerms.push( newTermDef );
        }
      });
    });
    return categoryTerms;
  }
//}(jQuery));

