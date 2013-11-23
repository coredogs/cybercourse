/**
 * @file Plugin test.
 */
//(function ($) {

CKEDITOR.plugins.add('ckplugtest', {
  icons: 'ckplugtest',
  init: function(editor) {
    var config = editor.config;
    CKEDITOR.dialog.add( 'dogDialog', this.path + 'dialogs/dog.js' );    
    editor.addCommand('insertDog', 
      new CKEDITOR.dialogCommand( 'dogDialog' )
//      exec: function(editor) {
//        CKEDITOR.currentInstance.insertText(
//          'DOG!!'
//        );
//      }
    );
    
    editor.ui.addButton( 'InsertDog', {
        label: 'DOG!!!!',
        command: 'insertDog',
//        toolbar: 'clipboard',
        state: CKEDITOR.TRISTATE_ENABLED,
        icon : this.path + 'icons/ckplugtest.png'
    });
  }
});


