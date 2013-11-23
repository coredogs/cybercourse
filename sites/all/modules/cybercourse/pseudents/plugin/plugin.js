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
//      exec: function(editor) {
//        CKEDITOR.currentInstance.insertText(
//          'DOG!!'
//        );
//      }
    );
    
    editor.ui.addButton( 'Pseudent', {
        label: 'THING!!!!',
        command: 'insertPseudent',
        state: CKEDITOR.TRISTATE_ENABLED,
        icon : this.path + 'pseudent.png'
    });
  }
});


