/**
 * @file Plugin for peeking at SWIM content.
 * Used to be called preview, but there is already a preview plugin. 
 */
CKEDITOR.plugins.add( 'peek', {
    icons: 'peek',
    init: function( editor ) {
      editor.addCommand( 'peek', {
        exec: function( editor ) {
          Drupal.behaviors.swim.peekButtonClicked();
        }
      });
      editor.ui.addButton( 'Peek', {
          label: 'Peek: see what readers see',
          command: 'peek',
          toolbar: 'clipboard',
          state: CKEDITOR.TRISTATE_DISABLED
      });
    },
});

