(function ($) {
  Drupal.behaviors.swim = {
    attach: function (context, settings) {
      //Make preview toolbar.
      var iconPath = Drupal.settings.swim.base_url 
          + "/sites/all/modules/ckeditor/plugins/preview/icons/";
      var previewToolbar 
              = $(
        "<div id='swim-preview-top' class='cke_top'>"
      +   "<span class='cke_toolgroup' role='presentation'>"
      +     "<a id='swim-preview-desktop' "
      +        "class='cke_button swim-button'><img "
      +        "src='" + iconPath + "desktop.png' title='Laptop'>"
      +     "</a>"
      +     "<a id='swim-preview-tablet' "
      +        "class='cke_button swim-button'><img "
      +        "src='" + iconPath + "tablet.png' title='Tablet'>"
      +     "</a>"
      +     "<a id='swim-preview-phone' "
      +        "class='cke_button swim-button'><img "
      +        "src='" + iconPath + "phone.png' title='Phone'>"
      +     "</a>"
      +   "</span>"
      + "</div>"
                 );
      previewToolbar.css("height", $('#cke_2_top').outerHeight());
      //Area for the actual preview.
      var previewArea = $("<div id='swim-preview-area'>");
      //The entire preview container.
      var previewContainer 
          = $( $("<div id='swim-preview-container'>") )
            .append( previewToolbar )
            .append( previewArea );
      //Find the container that will have the editor in it. At this point, it 
      //just has a textarea.
      var originalEditorContainer 
          = $("#edit-body .form-item-body-und-0-value .form-textarea-wrapper");
      originalEditorContainer
          .css("display", "table")
          .css("width", "100%");
      //Get its children. Just the textarea now.
      var editorContainerChildren = $(originalEditorContainer).children();
      //Wrap the children in a new div. This will remove the children from 
      //the DOM.
      var editorContainerChildrenWrapped
          = $("<div id='swim-editor-container'>")
            .append(editorContainerChildren);
      //Add the wrapper kids back inside the editor container, with 
      //the preview container as a sibling.
      originalEditorContainer
        .append( editorContainerChildrenWrapped )
        .append( previewContainer );

      //Now the preview processing code.
      //Init display.
      this.selectedPreview = "desktop";
      this.showSelectedButton();
      //Set up events on the preview buttons.
      $("#swim-preview-desktop").click( function() {
        this.selectedPreview = "desktop";
        this.showPreview();
      } );
      $("#swim-preview-tablet").click( function() {
        this.selectedPreview = "tablet";
        this.showPreview();
      } );
      $("#swim-preview-phone").click( function() {
        this.selectedPreview = "phone";
        this.showPreview();
      } );

      //Now - dance!
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
    },
    /**
     * Adjust toolbar to show whichever button is pressed.
     */
    showSelectedButton : function() {
      $("#swim-preview-desktop").removeClass("cke_button_on");
      $("#swim-preview-tablet").removeClass("cke_button_on");
      $("#swim-preview-phone").removeClass("cke_button_on");
      $( "#swim-preview-" + this.selectedPreview ).addClass("cke_button_on");
    },
    /**
     * Called from plugin when preview window has been opened.
     */
    previewWindowOpened : function() {
      //Show the current preview.
      this.showPreview();
    },
    /**
     * Grab rendered text from the server and show it.
     */
    showPreview : function() {
      var editor = CKEDITOR.instances["edit-body-und-0-value"];
      var markup = editor.getData();
      var format = Drupal.settings.swim.format_name;
alert('format: ' + format)      ;
      $.ajaxMarkup(markup, format, function(result, success, request) {
        if ( success ) {
          $('#swim-preview-area').html(result);
        }
        else {
          throw "showPreview: Ajax call failed.";
        }
      });
    }
    
  };
}(jQuery));
