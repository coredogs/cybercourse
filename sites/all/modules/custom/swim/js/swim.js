var swimDoneOnce = false;

$(document).on('insertIntoActiveEditor', function() {
    alert('Ima custom event');
});

(function ($) {
  Drupal.behaviors.swim = {
    attach: function (context, settings) {
      if ( swimDoneOnce ) {
        return;
      }
      swimDoneOnce = true;
      //Compute the URL for the iframe that simulates the device.
      var iframeSrc = Drupal.settings.swim.base_url + "/swim-mt-preview";      
      //Make preview toolbar.
      var iconPath = Drupal.settings.swim.base_url 
          + "/sites/all/modules/ckeditor/plugins/preview/icons/";
      var toolbarHtml
      = "<div id='swim-preview-toolbar' class='cke_top'>"
      +   "<span class='cke_toolgroup' role='presentation'>"
      +     "<a id='swim-preview-as-desktop' "
      +        "class='cke_button swim-button'><img "
      +        "src='" + iconPath + "desktop.png' title='Laptop'>"
      +     "</a>"
      +     "<a id='swim-preview-as-tablet' "
      +        "class='cke_button swim-button'><img "
      +        "src='" + iconPath + "tablet.png' title='Tablet'>"
      +     "</a>"
      +     "<a id='swim-preview-as-phone' "
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
      + "</div>";
      var previewHtml = 
        "<div id='swim-preview-outer'>" //Everything in the dialog.
      +   toolbarHtml
      +   "<div id='swim-preview-inner'>"
            //The device.
      +     "<iframe id='swim-preview-device'></iframe>"
            //A cache. Load pages into the cache. Then copy to display.
            //Gives control over timing of device screen update.
      +     "<iframe style='display:none;' id='swim-cache' "
      +         "src='" + iframeSrc + "'></iframe>"
      +   "</div>" //End inner.
      + "</div>"; //End outer.
      $("body").append( previewHtml );
      //Wait until the content is loaded.
      Drupal.behaviors.swim.wait = {
        counter : 0,
        delay : 1000,
        waitLimit : 20
      };
      swimWaitForLoad();
    },
    iframeHasBeenLoaded : function() {
//      if ( Drupal.behaviors.swim.initLoadComplete ) {
//        return true;
//      }      
      var iframeContent = $("#swim-cache").contents();
      return iframeContent.contents().find('body').find('#navbar').length > 0;
    },
    continueInit: function() {
//      if ( Drupal.behaviors.swim.initLoadComplete ) {
//        return;
//      }
      //Copy content of cache iframe.
      var content = $("#swim-cache").contents().find("html").children().clone();
      //Prep the dialog.
      $( "#swim-preview-outer" )
        .dialog({
          title: 'Preview',
          autoOpen : false,
          dialogClass : "dialog-to-top" //Dialog on top of top nav bar.
        });
      //Put the content into the dialog.
      $("#swim-preview-device").contents().find("html").children().remove();
      $("#swim-preview-device").contents().find("html").append(content);
      //MT the cache.
      $("#swim-cache").attr("src", "about:blank");
      //Prepare the iframe content. Remove content that isn't needed.
      this.prepareIframeContent();
      //Match toolbar height to the one creted by CKEditor.
//      var toolbarHeight = $('#cke_2_top').outerHeight();
      var toolbarHeight = $("#swim-preview-toolbar").outerHeight();
//      $("#swim-preview-toolbar").css("height", toolbarHeight);
      $("#swim-preview-device").css("top", toolbarHeight );
      //Set up events on the preview buttons.
      //Now the preview processing code.
      var swimBehavior = this; //Convenience for closures.
      $("#swim-preview-as-desktop").click( function() {
        swimBehavior.deviceButtonClicked("desktop");
      } );
      $("#swim-preview-as-tablet").click( function() {
        swimBehavior.deviceButtonClicked("tablet");
      } );
      $("#swim-preview-as-phone").click( function() {
        swimBehavior.deviceButtonClicked("phone");
      } );
      //Set up the refresh button.
      $("#swim-preview-refresh").click( function() {
        swimBehavior.showPreview();
      } );
      /**
       * Watch the plugin's preview button.
       */
      $(".cke_button__preview").click(function() {
        if ( ! $( "#swim-preview-outer" ).dialog( "isOpen" ) ) {
          $( "#swim-preview-outer" ).dialog( "open" );
        }
        //Show the current preview.
        Drupal.behaviors.swim.showPreview();
      });
      
      //Init display.
      this.selectedPreview = "phone";
      this.showSelectedButton();
      
      
      //Turn on the CKEditor preview button, so show all is ready.
      CKEDITOR.instances['edit-body-und-0-value'].commands.preview.enable();

    }, //End attach.
    deviceButtonClicked : function( buttonClicked ) {
      this.selectedPreview = buttonClicked;
      this.showSelectedButton();
      this.showPreview();
    },
    /**
     * Adjust toolbar to show whichever button is pressed.
     */
    showSelectedButton : function() {
      $("#swim-preview-as-desktop").removeClass("cke_button_on");
      $("#swim-preview-as-tablet").removeClass("cke_button_on");
      $("#swim-preview-as-phone").removeClass("cke_button_on");
      $( "#swim-preview-as-" + this.selectedPreview ).addClass("cke_button_on");
    },
    /**
     * Grab rendered text from the server and show it.
     */
    showPreview : function() {
      var iframe = $( "#swim-preview-device" );
      var iframeContentContainer 
          = iframe.contents().find(".field-name-body");
      iframeContentContainer.html('<p>Working...</p>');
      //Set up the preview to mimic the device.
      $( "#swim-preview-device" ).css("width", "").css("height", "");
      $( "#swim-preview-device" )
        .removeClass("swim-preview-device-desktop "
            + "swim-preview-device-tablet "
            + "swim-preview-device-phone")
        .addClass("swim-preview-device-" + this.selectedPreview);
      var toolbarHeight = $('#swim-preview-toolbar').outerHeight();
      var dialogTitleHeight = $(".ui-dialog-titlebar").outerHeight();
      if ( this.selectedPreview == 'desktop') {
        //Base size of dialog on what sizing the user has done. 
        var h = $("#cke_2_contents").innerHeight();
        var w = $(document).innerWidth() * 0.75;
        $( "#swim-preview-device" ).css("height", h).css("width", w);
        $( "#swim-preview-outer" )
            .dialog( "option", "width", w + 40 )
            .dialog( "option", "height", 
              h + toolbarHeight + dialogTitleHeight + 40 
            )
            .dialog( "option", "title", "Preview (Desktop/laptop)");
      }
      else if (    this.selectedPreview == 'phone' 
                || this.selectedPreview == 'tablet' ) {
        //Base size of dialog on device size. 
        $( "#swim-preview-outer" )
            .dialog( "option", "width", 
              $('#swim-preview-device').outerWidth() + 20
            )
            .dialog( "option", "height", 
                $("#swim-preview-device").outerHeight() 
              + toolbarHeight + dialogTitleHeight + 40
            )
            .dialog( "option", "title", 
                (this.selectedPreview == 'phone')
                ? "Preview (iPhone 1 to 4S, landscape)"
                : "Preview (iPad 1 and 2, portrait)"
        );
      }
      else {
        throw "showPreview: bad selectedPreview: *" + this.selectedPreview + "*";
      }
      //Get content from server.
      var editor = CKEDITOR.instances["edit-body-und-0-value"];
      var markup = editor.getData();
      var format = Drupal.settings.swim.format_name;
      $.ajaxMarkup(markup, format, function(result, success, request) {
        if ( success ) {
          //Show the content.
          var iframe = $( "#swim-preview-device" );
          //Get ref to the markup in the iframe.
          var iframeContentContainer 
              = iframe.contents().find(".field-name-body");
          iframeContentContainer.html(result);
        }
        else {
          throw "showPreview: Ajax call failed.";
        } // end not success.
      });
    }, // end showPreview.
    prepareIframeContent : function() {
      var iframeContent = $("#swim-preview-device").contents();
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
//  if ( Drupal.behaviors.swim.initLoadComplete ) {
//    return;
//  }
  Drupal.behaviors.swim.wait.counter ++;
  if ( 
          Drupal.behaviors.swim.wait.counter < Drupal.behaviors.swim.wait.waitLimit 
       && ! Drupal.behaviors.swim.iframeHasBeenLoaded() 
  ) {
    setTimeout("swimWaitForLoad()", Drupal.behaviors.swim.wait.delay);
    return;
  }
  else {
//    Drupal.behaviors.swim.initLoadComplete = true;
    Drupal.behaviors.swim.continueInit();
  }
}
