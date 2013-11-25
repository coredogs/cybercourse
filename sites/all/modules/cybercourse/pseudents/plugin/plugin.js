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
    var cssLink = document.createElement("link") 
    cssLink.href = //Drupal.settings.pseudents.base_url
        //Drupal.settings.basePath 
        Drupal.settings.pseudents.poseStylesheet; 
    cssLink.rel = "stylesheet"; 
    cssLink.type = "text/css";
    jQuery("body").append(cssLink);
    
    
    editor.ui.addButton( 'Pseudent', {
        label: 'Insert a pseudent',
        command: 'insertPseudent',
        state: CKEDITOR.TRISTATE_ENABLED,
        icon : this.path + 'pseudent.png'
    });
  }
});


