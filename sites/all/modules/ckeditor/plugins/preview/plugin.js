/**
 * @file Plugin for previewing SWIM content.
 */
( function() {
CKEDITOR.plugins.add( 'preview', {
    icons: 'preview',
    init: function( editor ) {
      editor.addCommand( 'preview', {
          exec: function( editor ) {
            //this is the command object.
            if ( this.state == CKEDITOR.TRISTATE_ON ) {
//              jQuery("#swim-editor-container")
//                .css("width", "100%");
              jQuery("#swim-preview-container")
                .css("display", "none");
              this.setState( CKEDITOR.TRISTATE_OFF );
            }
            else {
              jQuery("#swim-editor-container")
                .css("width", "50%");
              jQuery("#swim-preview-container")
                .css("display", "table-cell")
//                .css("width", "auto");
              this.setState( CKEDITOR.TRISTATE_ON );
            }
          }
      });
      editor.ui.addButton( 'Preview', {
          label: 'Preview the content',
          command: 'preview',
          toolbar: 'clipboard'
      });
    }
});
} )();