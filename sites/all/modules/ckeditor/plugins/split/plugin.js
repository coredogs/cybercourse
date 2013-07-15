CKEDITOR.plugins.add( 'split', {
    icons: 'split',
    init: function( editor ) {
      editor.addCommand( 'split', {
          exec: function( editor ) {
              editor.insertHtml( '<p>SPLIT</p>' );
          }
      });
      editor.ui.addButton( 'Split', {
          label: 'Split the editor vertically',
          command: 'split',
          toolbar: 'clipboard'
      });
    }
});