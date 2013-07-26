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
      +   "<span class='cke_toolgroup' role='presentation'>"
      +     "<a id='swim-preview-refresh' "
      +        "class='cke_button swim-button'><img "
      +        "src='" + iconPath + "refresh.png' title='Refresh'>"
      +     "</a>"
      +   "</span>"
      + "</div>"
                 );
      previewToolbar.css("height", $('#cke_2_top').outerHeight());
      //Set up the URL for the iframe that simulates the device.
      //The target page has media queries, but no content.
      //It does hae an container with an id for placing content later.
      var iframeSrc =  Drupal.settings.swim.base_url + "/swim-mt-preview";
      //Area for the actual preview.
      var previewArea = $(
         "<div id='swim-preview-area'>"
      +    "<div id='swim-device'>"
             //The device screen.
      +      "<iframe id='swim-device-screen' src='" + iframeSrc + "'></iframe>"
      +    "</div>"
      +  "</div>"
      );
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
      var swimBehavior = this; //Convenience for closures.
      //Init display.
      this.selectedPreview = "desktop";
      this.showSelectedButton();
      //Set up events on the preview buttons.
      $("#swim-preview-desktop").click( function() {
        swimBehavior.previewButtonClicked("desktop");
      } );
      $("#swim-preview-tablet").click( function() {
        swimBehavior.previewButtonClicked("tablet");
      } );
      $("#swim-preview-phone").click( function() {
        swimBehavior.previewButtonClicked("phone");
      } );
      //Set up the refresh button.
      $("#swim-preview-refresh").click( function() {
        swimBehavior.showPreview();
      } );
    }, //End attach.
    previewButtonClicked : function( buttonClicked ) {
      this.selectedPreview = buttonClicked;
      this.showSelectedButton();
      this.showPreview();
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
      var iframe = $( "#swim-device-screen" );
      //Get ref to the markup in the iframe.
      var iframeContentContainer 
          = iframe.contents().find(".field-name-body");
      //Make sure that the preview container is loaded.
      if ( iframeContentContainer.length == 0 ) {
        alert( "Still preparing preview. Please try again in a few seconds." );
        return;
      }
      //Prepare the iframe content. Remove content that isn't needed.
      this.prepareIframeContent();
      //Set up the preview to mimic the device.
      //Want a scroll bar only on the iframe itself.
      //The container of the iframe - want black edge for a phone, etc.
      var deviceContainer = $('#swim-device');
      deviceContainer
        .removeClass("swim-desktop-device-container")
        .removeClass("swim-tablet-device-container")
        .removeClass("swim-phone-device-container")
        .addClass("swim-" + this.selectedPreview + "-device-container");
      //Size the iframe.
      var w, h;
      if ( this.selectedPreview == 'desktop') {
        //Make it grab all space.
        $(deviceContainer).css("display", "block");
        w = $(deviceContainer).innerWidth();
//        h = $(deviceContainer).innerHeight();
        h = $("#swim-preview-container").outerHeight()
              - $('#swim-preview-top').outerHeight();
      }
      else if ( this.selectedPreview == 'tablet') {
        //Make it fit content.
        $(deviceContainer).css("display", "inline-block");
        w = "768";
        h = "1024";
      }
      else {
        //Make it fit content.
        $(deviceContainer).css("display", "inline-block");
        w = "480";
        h = "320";
      }
      $(iframe).css("width", w);
      $(iframe).css("height", h);
      $("#swim-preview-area").removeClass(
          "swim-preview-area-desktop swim-preview-area-tablet swim-preview-area-phone"
      );
      $("#swim-preview-area")
          .addClass("swim-preview-area-" + this.selectedPreview);
//      $("#swim-preview-area").css("text-align", textAlign);
//      //The screen itself.
//      var iframeContentScreen = iframeContentContainer.find(".field-name-body");
//      if ( iframeContentScreen.length == 0 ) {
//        throw "showPreview: could not find device screen.";
//      }
//      iframeContentScreen
//        .removeClass("swim-desktop-screen")
//        .removeClass("swim-tablet-screen")
//        .removeClass("swim-phone-screen")
//        .addClass("swim-" + this.selectedPreview + '-screen');
      //Get content from server.
      var editor = CKEDITOR.instances["edit-body-und-0-value"];
      var markup = editor.getData();
      var format = Drupal.settings.swim.format_name;
      $.ajaxMarkup(markup, format, function(result, success, request) {
        if ( success ) {
          //Show the content.
          iframeContentContainer.html(result);
        }
        else {
          throw "showPreview: Ajax call failed.";
        } // end not success.
      });
    }, // end showPreview.
    prepareIframeContent : function() {
      var iframeContent = $("#swim-device-screen").contents();
      //Check if already prepared it.
      var header = iframeContent.contents().find('body').find('#navbar');
      if ( header.length == 0 ) {
        //Already done it.
        return;
      }
      //Kill all body children except for the main content.
      var $body = $(iframeContent.contents().find('body'));
      $body.children().each(function(index, element) {
        if ( ! $(element).hasClass("main-container") ) {
          $(element).remove();
        }
      });
      $body.removeClass("admin-menu").css("padding", 0).css("margin", 0);
//      //Kill the header.
//      $(header).remove();
//      //Kill the menu.
////      $(iframeContent).find("#navbar").remove();
      //Kill the left sidebar.
      var leftSidebar = $(iframeContent).find(".region-sidebar-first").parent();
      leftSidebar.remove();
      //Change the main content's span9 to a span12, since the sidebar
      //iz morte.
      $body
          .find(".row-fluid")
          .find("section.span9")
          .removeClass("span9")
          .addClass("span12");
      //Get the main part of the node.
      var nodeMain = $body.find(".node-site-page");
      //Kill the node header (contains node title)
//      $(nodeMain).find(".node header").remove();
      //Keep the content column, kill others.
      $(nodeMain).children().each(function(index, element) {
        //Keep the body, kill others.
        if ( ! $(element).hasClass("field-name-body") ) {
          $(element).remove();
//          $(element).html('');
        }
      });
      //Kill the footer.
//      $(iframeContent).find("footer").remove();
    } //end prepareIframeContent
  };
}(jQuery));
