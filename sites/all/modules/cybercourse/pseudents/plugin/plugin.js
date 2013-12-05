/**
 * @file Plugin test.
 */
//(function ($) {

CKEDITOR.plugins.add('pseudent', {
  icons: 'pseudent',
  init: function(editor) {
    var config = editor.config;
    CKEDITOR.dialog.add( 'pseudentDialog', this.path + 'dialogs/pseudent.js' );    
    editor.addCommand('insertPseudent', 
      new CKEDITOR.dialogCommand( 'pseudentDialog' )
    );
    
    //Add stylesheet.
    editor.on("instanceReady", function() {
      this.document.appendStyleSheet( Drupal.settings.pseudents.poseStylesheet );
    });
    
    editor.ui.addButton( 'Pseudent', {
        label: 'Insert a pseudent',
        command: 'insertPseudent',
        state: CKEDITOR.TRISTATE_ENABLED,
        icon : this.path + 'pseudent.png'
    });
  }
});


