(function ($) {
  Drupal.behaviors.swim = {
    attach: function (context, settings) {
      // You can access the variable by using Drupal.settings.MYMODULE.tax_rate
      //alert('dog');
      //Add preview elements.
      var preview_button = '<p><button id="markdown-preview" type="button">Preview</button></p>';
      var preview_container = '<div id="swim_preview"></div>';
      $('#edit-body').append(preview_button).append(preview_container);
      
      $('#markdown-preview').click(function(){
        var editor = CKEDITOR.instances["edit-body-und-0-value"];
        var markup = editor.getData();
        var format = $.ajaxMarkup.getFormat('#edit-body textarea.text-full');
        $.ajaxMarkup(markup, format, function(result, success, request) {
          if ( success ) {
            $('#swim_preview').html(result);
          }
        });
      });
    }
  };
}(jQuery));
