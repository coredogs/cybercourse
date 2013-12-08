/**
 * @file Plugin test.
 */
//(function ($) {

/**
 * Widget has one pieces of data that has to be managed:
 * 
 * The pseudent id. Stored as data-pseudent-id attribute of img tag.
 * 
 * This has to be attached to a value of the widget during edit init.
 * It has to be put into the img attr during tear down.
 * 
 * The caption and content are managed automatically by the image 
 * widget. 
 */
CKEDITOR.plugins.add('pseudent', {
  requires: 'widget',
  icons: 'pseudent',
  init: function(editor) {
    //Add a dialog to the plugin.
    CKEDITOR.dialog.add( 'pseudentDialog', this.path + 'dialogs/pseudent.js' );    
    //Define a widget.
    editor.widgets.add('pseudent', {
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
      ready: function() {
        //Init a widget.
        //Find the pseudent id for the widget. Extract it from a 
        //property of the img.
        var image = jQuery(this.element.$).find('.pseudent-image');
        if ( image ) {
          //An attr of the image has the id of the pseudent.
          var pseudentId = image.attr("data-pseudent-id");
          //Was there already a selected pseudent?
          if ( pseudentId && ! isNaN(pseudentId) ) {
            //Store the id as widget data.
            this.pseudentId = pseudentId;
            this.initialPseudentId = pseudentId;
          }
        }
      },
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
      editables: {
//        caption: {
//          selector: '.pseudent-image-caption'
//        },
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
      dialog: 'pseudentDialog',
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
        icon : this.path + 'pseudent.png'
    });
  }
});


