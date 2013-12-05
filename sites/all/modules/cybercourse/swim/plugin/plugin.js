/**
 * @file Plugin for peeking at SWIM content.
 * Used to be called preview, but there is already a preview plugin. 
 */

(function($) {
  CKEDITOR.plugins.add( 'peek', {
      icons: 'peek',
      init: function( editor ) {
        editor.addCommand( 'peek', {
          exec: function( editor ) {
            Drupal.behaviors.swim.peekButtonClicked();
          }
        });
        //Add stylesheet, and do other SWIM configuration.
        editor.on("instanceReady", function(evnt) {
          this.document.appendStyleSheet( Drupal.settings.swim.editing_stylesheet );
          //Size the summary editor.
          if ( CKEDITOR.instances['edit-body-und-0-summary'] ) {
            CKEDITOR.instances['edit-body-und-0-summary'].config.height = "8em";
          }
          //Size the main editor.
          if ( CKEDITOR.instances['edit-body-und-0-value'] ) {
            CKEDITOR.instances['edit-body-und-0-value'].config.height = "30em";
          }
          if ( evnt.editor.name == "edit-body-und-0-value" ) {
            Drupal.behaviors.swim.swimSetup();
          }
        });
        editor.ui.addButton( 'Peek', {
            label: 'Peek: see what readers see',
            command: 'peek',
            toolbar: 'clipboard',
            state: CKEDITOR.TRISTATE_DISABLED,
          icon: this.path + 'icons/peek.png'
        });
      }
  });
} )(jQuery);