//  CKEDITOR.on('instanceCreated', function(e) {
//    alert(999);
//  });


CKEDITOR.editorConfig = function(config) {
  config.disableNativeSpellChecker = false;
  config.allowedContent = true;
  // Protect PHP code tags (<?...?>) so CKEditor will not break them when
  // switching from Source to WYSIWYG.
  // Uncommenting this line doesn't mean the user will not be able to type PHP
  // code in the source. This kind of prevention must be done in the server
  // side
  // (as does Drupal), so just leave this line as is.
  config.protectedSource.push(/<\?[\s\S]*?\?>/g); // PHP Code
  config.protectedSource.push(/<code>[\s\S]*?<\/code>/gi); // Code tags
  config.extraPlugins = 'split';
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

//Toolbar definition for Advanced buttons
//Drupal.settings.cke_toolbar_DrupalAdvanced = [
//    ['Source'],
//    ['Cut','Copy','Paste','PasteText','PasteFromWord','-','SpellChecker', 'Scayt'],
//    ['Undo','Redo','Find','Replace','-','SelectAll','RemoveFormat'],
//    ['Image','Flash','Table','HorizontalRule','Smiley','SpecialChar'],
//    ['Maximize', 'ShowBlocks'],
//    '/',
//    ['Format'],
//    ['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
//    ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
//    ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiRtl','BidiLtr'],
//    ['Link','Unlink','Anchor','Linkit','LinkToNode','LinkToMenu'],
//    ['DrupalBreak', 'DrupalPageBreak']
//];

};