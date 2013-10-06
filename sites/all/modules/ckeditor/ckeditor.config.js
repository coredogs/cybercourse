/*
 * Custom config for CKEditor.
 * 
 * This file is copied to the CKEditor module, overwriting what is there.
 * 
 */
CKEDITOR.editorConfig = function(config) {
  CKEDITOR.on("instanceReady", function(evnt) {
    if ( evnt.editor.name == "edit-body-und-0-value" ) {
      Drupal.behaviors.swim.swimSetup();
    }
  });
  config.basicEntities = true; //Entity encode <, >.
  config.disableNativeSpellChecker = false;
  config.removePlugins = 'tabletools,contextmenu';
  //Size the summary editor.
  if ( CKEDITOR.instances['edit-body-und-0-summary'] ) {
    CKEDITOR.instances['edit-body-und-0-summary'].config.height = "8em";
  }
  //Size the main editor.
  if ( CKEDITOR.instances['edit-body-und-0-value'] ) {
    CKEDITOR.instances['edit-body-und-0-value'].config.height = "30em";
  }
  //Let images be inserted.
  config.allowedContent = true;
  // The minimum editor width, in pixels, when resizing it with the resize handle.
  config.resize_minWidth = 400;

  config.protectedSource.push(/<\?[\s\S]*?\?>/g); // PHP Code
  config.protectedSource.push(/<code>[\s\S]*?<\/code>/gi); // Code tags
  config.extraPlugins = '';

  /*
   * Append here extra CSS rules that should be applied into the editing area.
   * Example:
   * config.extraCss = 'body {color:#FF0000;}';
   */
  config.extraCss = '';

  /**
   * CKEditor's editing area body ID & class.
   * See http://drupal.ckeditor.com/tricks
   * This setting can be used if CKEditor does not work well with your theme by default.
   */
  config.bodyClass = '';
  config.bodyId = '';

};