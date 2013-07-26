var swimDoneOnce = false;

(function ($) {
  Drupal.behaviors.swim = {
    attach: function (context, settings) {
      if ( swimDoneOnce ) {
        return;
      }
      swimDoneOnce = true;
      Drupal.behaviors.swim.initLoadComplete = false;
      $(".cke_button__preview").hide();
      //Compute the URL for the iframe that simulates the device.
      var iframeSrc =  Drupal.settings.swim.base_url + "/swim-mt-preview";      
      //This could be called again after some work has been done, but the
      //page load into the iframe failed. If so, don't attach the toolbar etc again.
      if ( $("#swim-preview-container").length == 1 ) { 
        //Toolbar etc already there. Try loading the preview iframe again.
        $("#swim-preview-container iframe").attr( "src", iframeSrc );
      }
      else {
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
        //Area for the actual preview.
        var previewArea = $(
           "<div id='swim-preview-area'>"
        +    "<div id='swim-device'>"
               //The device screen.
        +      "<iframe id='swim-device-screen'></iframe>"
               //A cache. Load pages into the cache. Then copy to display.
               //Gives control over timing of device screen update.
        +      "<iframe style='display:none;' id='swim-cache' "
        +          "src='" + iframeSrc + "'></iframe>"
        +    "</div>"
        +  "</div>"
        );
        //The entire preview container.
        var previewContainer 
            = $("<div id='swim-preview-container'>")
              .append( previewToolbar )
              .append( previewArea );
        $("body").append( previewContainer );
      } //End toolbar etc already attached.
      //Wait until the content is loaded.
      Drupal.behaviors.swim.wait = {
        counter : 0,
        delay : 200,
        waitLimit : 20
      };
      swimWaitForLoad();
    },
    iframeHasBeenLoaded : function() {
      if ( Drupal.behaviors.swim.initLoadComplete ) {
        return true;
      }      
      var iframeContent = $("#swim-cache").contents();
      return iframeContent.contents().find('body').find('#navbar').length > 0;
    },
    continueInit: function() {
//      if ( Drupal.behaviors.swim.initLoadComplete ) {
//        return;
//      }
      //Copy content of cache iframe to the display iframe.
      var content = $("#swim-cache").contents().find("html").children().clone();
      //Prep the dialog.
      $( "#swim-preview-container" )
        .dialog({
          autoOpen : false,
          dialogClass : "dialog-to-top" //Dialog on top of top nav bar.
        });
      $("#swim-device-screen").contents().find("html").children().remove();
      $("#swim-device-screen").contents().find("html").append(content);
//      $("#swim-device-screen").contents().find("html").html( 
//          $("#swim-cache").contents().find("html").html()
//      );
      //MT the cache.
      $("#swim-cache").attr("src", "about:blank");
      //Prepare the iframe content. Remove content that isn't needed.
      this.prepareIframeContent();
        //Should have done this earlier, but preparing the dialog reloads
        //the iframe for some reason, so need to wait to do this.
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
      /**
       * Watch the plugin's preview button.
       */
      $(".cke_button__preview").click(function() {
        //The preview button on the CKEditor toolbar was clicked.
        if ( ! Drupal.behaviors.swim.initLoadComplete ) {
          alert("The preview is not ready yet. Please try again in a few seconds.");
          return;
        }
        if ( ! $( "#swim-preview-container" ).dialog( "isOpen" ) ) {
          $( "#swim-preview-container" ).dialog( "open" );
        }
        //Show the current preview.
        Drupal.behaviors.swim.showPreview();
      });
      
      //Now the preview processing code.
      var swimBehavior = this; //Convenience for closures.
      //Init display.
      this.selectedPreview = "desktop";
      this.showSelectedButton();
      
      //Turn on the CKEditor button.
      CKEDITOR.instances['edit-body-und-0-value'].commands.preview.enable();

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
     * Grab rendered text from the server and show it.
     */
    showPreview : function() {
      var iframe = $( "#swim-device-screen" );
      //Get ref to the markup in the iframe.
      var iframeContentContainer 
          = iframe.contents().find(".field-name-body");
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
//      var header = iframeContent.find('body').find('#navbar');
//      if ( header.length == 0 ) {
//        //Already done it.
//        return;
//      }
      //Kill all body children except for the main content.
      var $body = $(iframeContent.find('body'));
      $body.children().each(function(index, element) {
        if ( ! $(element).hasClass("main-container") ) {
          $(element).remove();
        }
      });
      $body.removeClass("admin-menu").css("padding", 0).css("margin", 0);
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
    }, //end prepareIframeContent
    showThrobber : function( afterThisElement, message ) {
      if ( ! message ) {
        message = "";
      }
      var element = $('<div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;' + message + '</div></div>');
      $(afterThisElement).after(element);      
    },
    removeThrobber : function( afterThisElement ) {
      var element = $(afterThisElement).siblings(".ajax-progress-throbber");
      if ( element ) {
        element.remove();
      }
    }
  };
}(jQuery));


function swimWaitForLoad() {
  if ( Drupal.behaviors.swim.initLoadComplete ) {
    return;
  }
  Drupal.behaviors.swim.wait.counter ++;
  if ( 
          Drupal.behaviors.swim.wait.counter < Drupal.behaviors.swim.wait.waitLimit 
       && ! Drupal.behaviors.swim.iframeHasBeenLoaded() 
  ) {
    setTimeout("swimWaitForLoad()", 5000);
    return;
  }
  else {
    Drupal.behaviors.swim.initLoadComplete = true;
    Drupal.behaviors.swim.continueInit();
  }
}
