/*
 * Custom config for CKEditor.
 * 
 * CKEditor module is configured to read the config file from the theme.
 * What happens if the theme is updated? Lose config.
 * 
 * SWIM module copies this file to theme if it is missing.
 */
CKEDITOR.editorConfig = function(config) {
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