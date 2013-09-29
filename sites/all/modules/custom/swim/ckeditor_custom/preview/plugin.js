/**
 * @file Plugin for previewing SWIM content.
 */
//(function ($) {
  
CKEDITOR.plugins.add( 'preview', {
    icons: 'preview',
    init: function( editor ) {
      editor.addCommand( 'preview', {
        exec: function( editor ) {
//            swimCkeditorPreviewClicked();
        }
      });
      editor.ui.addButton( 'Preview', {
          label: 'Preview the content',
          command: 'preview',
          toolbar: 'clipboard',
          state: CKEDITOR.TRISTATE_DISABLED

      });
//      editor.on( 'configLoaded', function() {
//        CKEDITOR.instances['edit-body-und-0-value'].commands.preview.disable();
//      });
    },
//    afterInit: function( editor ) {
//      editor.on( 'configLoaded', function() {
//        CKEDITOR.instances['edit-body-und-0-value'].commands.preview.disable();
//      });
//    }
});

//}(jQuery));
CKEDITOR.on('instanceReady', function(evt){ 
  if ( CKEDITOR.instances['edit-body-und-0-value'] ) {
    CKEDITOR.instances['edit-body-und-0-value'].commands.preview.disable();
  }
}); 
