(function ($) {
  Drupal.behaviors.swim = {
    attach: function (context, settings) {
      //Find the container that will have the editor in it. At this point, it 
      //just has a textarea.
      var editorContainer 
          = $("#edit-body .form-item-body-und-0-value .form-textarea-wrapper");
      var editorContainerChildren = $(editorContainer).children();
      //Wrap the children in a new div. This will remove the children from 
      //the DOM.
      var editorContainerChildrenWrapped
          = $("<div id='swim-editor-container'>")
            .append(editorContainerChildren);
      //Add the wrapper kids back inside the editor container, with a sibling
      //that will be for the preview.
      editorContainer
        .append(editorContainerChildrenWrapped)
        .append( $("<div id='swim-preview-container'>Stuff</div>") );
      //Make preview toolbar.
      var iconPath = Drupal.settings.swim.base_url 
          + "/sites/all/modules/ckeditor/plugins/preview/icons/";
      var previewToolbar 
              = $(   "<div id='swim-preview-top' class='cke_top'>"
                   +   "<a id='swim-preview-laptop' class='cke_button'><img "
                   +      "src='" + iconPath + "laptop.png' title='Laptop'></a> "
                   + "</div>"
                 );
      previewToolbar.css("height", $('#cke_2_top').outerHeight());
      $("#swim-preview-container").prepend( previewToolbar );
      return;

//      //Hide plain text link.
//      $("#switch_edit-body-und-0-value").html();
      
      
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
