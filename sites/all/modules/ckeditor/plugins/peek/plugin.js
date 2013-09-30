/**
 * @file Plugin for peeking at SWIM content.
 * Used to be called preview, but there is already a preview plugin. 
 */
//(function ($) {
  
CKEDITOR.plugins.add( 'peek', {
    icons: 'peek',
    init: function( editor ) {
      editor.addCommand( 'peek', {
        exec: function( editor ) {
          //Surprise! Nothing here.
        }
      });
      editor.ui.addButton( 'Peek', {
          label: 'See how your content looks when rendered',
          command: 'peek',
          toolbar: 'clipboard',
          state: CKEDITOR.TRISTATE_DISABLED

      });
    },
});

//}(jQuery));
CKEDITOR.on('instanceReady', function(evt){ 
  if ( CKEDITOR.instances['edit-body-und-0-value'] ) {
    CKEDITOR.instances['edit-body-und-0-value'].commands.peek.disable();
  }
}); 
