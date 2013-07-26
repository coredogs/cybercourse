//var swimDoneOnce = false;

(function ($) {
  //Storage for various things
  var swimData = {
    "selectedPreview" : "desktop",
    "dialogs" : new Array()
  };

  
  jQuery(document).ready(function() {
//    console.log('ready');
    swimStartInit();
  });
  
  function swimStartInit() {
//    console.log('Got there')
//      if ( swimDoneOnce ) {
//        return;
//      }
//      swimDoneOnce = true;
//      Drupal.behaviors.swim.initLoadComplete = false;
      //Compute the URL for the iframe that simulates the device.
      var iframeSrc =  Drupal.settings.swim.base_url + "/swim-mt-preview";      
      //This could be called again after some work has been done, but the
      //page load into the iframe failed. If so, don't attach the toolbar etc again.
      if ( jQuery("#swim-preview-container").length == 1 ) { 
        //Toolbar etc already there. Try loading the preview iframe again.
        jQuery("#swim-preview-container iframe").attr( "src", iframeSrc );
      }
      else {
        //Make preview toolbar.
        var iconPath = Drupal.settings.swim.base_url 
            + "/sites/all/modules/ckeditor/plugins/preview/icons/";
        var previewToolbar 
                = jQuery(
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
        previewToolbar.css("height", jQuery('#cke_2_top').outerHeight());
        //Area for the actual preview.
        var previewArea = jQuery(
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
            = jQuery("<div id='swim-preview-container'>")
              .append( previewToolbar )
              .append( previewArea );
        jQuery("body").append( previewContainer );
      } //End toolbar etc already attached.
      //Wait until the content is loaded.
      swimData.counter = 0;
      swimData.delay = 400;
      swimData.waitLimit = 20;
      swimWaitForLoad();
    };
      
    function swimWaitForLoad() {
//      if ( Drupal.behaviors.swim.initLoadComplete ) {
//        return;
//      }
      swimData.counter ++;
      if ( 
              swimData.counter < swimData.waitLimit 
           && ! swimIframeHasBeenLoaded() 
      ) {
        setTimeout(swimWaitForLoad, swimData.waitLimit);
        return;
      }
      else {
//        Drupal.behaviors.swim.initLoadComplete = true;
        continueInit();
      }
    }
    
    function swimIframeHasBeenLoaded () {
//      if ( Drupal.behaviors.swim.initLoadComplete ) {
//        return true;
//      }      
      var iframeContent = jQuery("#swim-cache").contents();
      return iframeContent.contents().find('body').find('#navbar').length > 0;
    };
    
    function continueInit() {
//      if ( Drupal.behaviors.swim.initLoadComplete ) {
//        return;
//      }
      var content = jQuery("#swim-cache").contents().find("html").children().clone();
//      //Prep the dialog.
      swimData.dialogs.push(jQuery( "#swim-preview-container" )
        .dialog({
          autoOpen : false,
          dialogClass : "dialog-to-top" //Dialog on top of top nav bar.
        })
        );
        
      //Copy content of cache iframe to the display iframe.
      //var content = jQuery("#swim-cache").contents().find("html").children().clone();
      jQuery("#swim-device-screen").contents().find("html").children().remove();
      jQuery("#swim-device-screen").contents().find("html").append(content);
//      jQuery("#swim-device-screen").contents().find("html").html( 
//          jQuery("#swim-cache").contents().find("html").html()
//      );
      //MT the cache.
      jQuery("#swim-cache").attr("src", "about:blank");
      //Prepare the iframe content. Remove content that isn't needed.
      swimPrepareIframeContent();
        //Should have done this earlier, but preparing the dialog reloads
        //the iframe for some reason, so need to wait to do this.
      //Set up events on the preview buttons.
      jQuery("#swim-preview-desktop").click( function() {
        swimPreviewButtonClicked("desktop");
      } );
      jQuery("#swim-preview-tablet").click( function() {
        swimPreviewButtonClicked("tablet");
      } );
      jQuery("#swim-preview-phone").click( function() {
        swimPreviewButtonClicked("phone");
      } );
      //Set up the refresh button.
      jQuery("#swim-preview-refresh").click( function() {
        swimShowPreview();
      } );
      jQuery(".cke_button__preview").click(function() {
        var e=4;
      })
      
      //Init display.
      swimData.selectedPreview = "desktop";
      swimShowSelectedButton();

    } //End continueInit.
    
    function swimPreviewButtonClicked(buttonClicked) {
      swimData.selectedPreview = buttonClicked;
      swimShowSelectedButton();
      showPreview();
    }
    
    /**
     * Adjust toolbar to show whichever button is pressed.
     */
    function swimShowSelectedButton() {
      jQuery("#swim-preview-desktop").removeClass("cke_button_on");
      jQuery("#swim-preview-tablet").removeClass("cke_button_on");
      jQuery("#swim-preview-phone").removeClass("cke_button_on");
      jQuery( "#swim-preview-" + swimData.selectedPreview ).addClass("cke_button_on");
    }
    
    /**
     * Called from plugin when preview window has been opened.
     */
    function swimCkeditorPreviewClicked () {
      //The preview button on the CKEditor toolbar was clicked.
//      if ( ! Drupal.behaviors.swim.initLoadComplete ) {
//        alert("The preview is not ready yet. Please try again in a few seconds.");
//        return;
//      }
      if ( ! jQuery( "#swim-preview-container" ).dialog ) {
        jQuery( "#swim-preview-container" )
        .dialog({
          autoOpen : false,
          dialogClass : "dialog-to-top" //Dialog on top of top nav bar.
        });
      }
      jQuery( "#swim-preview-container" ).dialog( "open" );
      //Show the current preview.
      swimShowPreview();
    }
    
//    jQuery.extend({ swimCkeditorPreviewClicked : swimCkeditorPreviewClicked });
    
    /**
     * Grab rendered text from the server and show it.
     */
    function swimShowPreview() {
      var iframe = jQuery( "#swim-device-screen" );
      //Get ref to the markup in the iframe.
      var iframeContentContainer 
          = iframe.contents().find(".field-name-body");
      //Set up the preview to mimic the device.
      //Want a scroll bar only on the iframe itself.
      //The container of the iframe - want black edge for a phone, etc.
      var deviceContainer = jQuery('#swim-device');
      deviceContainer
        .removeClass("swim-desktop-device-container")
        .removeClass("swim-tablet-device-container")
        .removeClass("swim-phone-device-container")
        .addClass("swim-" + swimData.selectedPreview + "-device-container");
      //Size the iframe.
      var w, h;
      if ( swimData.selectedPreview == 'desktop') {
        //Make it grab all space.
        jQuery(deviceContainer).css("display", "block");
        w = jQuery(deviceContainer).innerWidth();
//        h = jQuery(deviceContainer).innerHeight();
        h = jQuery("#swim-preview-container").outerHeight()
              - jQuery('#swim-preview-top').outerHeight();
      }
      else if ( swimData.selectedPreview == 'tablet') {
        //Make it fit content.
        jQuery(deviceContainer).css("display", "inline-block");
        w = "768";
        h = "1024";
      }
      else {
        //Make it fit content.
        jQuery(deviceContainer).css("display", "inline-block");
        w = "480";
        h = "320";
      }
      jQuery(iframe).css("width", w);
      jQuery(iframe).css("height", h);
      jQuery("#swim-preview-area").removeClass(
          "swim-preview-area-desktop swim-preview-area-tablet swim-preview-area-phone"
      );
      jQuery("#swim-preview-area")
          .addClass("swim-preview-area-" + swimData.selectedPreview);
//      jQuery("#swim-preview-area").css("text-align", textAlign);
//      //The screen itself.
//      var iframeContentScreen = iframeContentContainer.find(".field-name-body");
//      if ( iframeContentScreen.length == 0 ) {
//        throw "showPreview: could not find device screen.";
//      }
//      iframeContentScreen
//        .removeClass("swim-desktop-screen")
//        .removeClass("swim-tablet-screen")
//        .removeClass("swim-phone-screen")
//        .addClass("swim-" + swimData.selectedPreview + '-screen');
      //Get content from server.
      var editor = CKEDITOR.instances["edit-body-und-0-value"];
      var markup = editor.getData();
      var format = Drupal.settings.swim.format_name;
      jQuery.ajaxMarkup(markup, format, function(result, success, request) {
        if ( success ) {
          //Show the content.
          iframeContentContainer.html(result);
        }
        else {
          throw "showPreview: Ajax call failed.";
        } // end not success.
      });
    } // end showPreview.
    
    function swimPrepareIframeContent() {
      var iframeContent = jQuery("#swim-device-screen").contents();
      //Check if already prepared it.
//      var header = iframeContent.find('body').find('#navbar');
//      if ( header.length == 0 ) {
//        //Already done it.
//        return;
//      }
      //Kill all body children except for the main content.
      var $body = jQuery(iframeContent.find('body'));
      $body.children().each(function(index, element) {
        if ( ! jQuery(element).hasClass("main-container") ) {
          jQuery(element).remove();
        }
      });
      $body.removeClass("admin-menu").css("padding", 0).css("margin", 0);
      //Kill the left sidebar.
      var leftSidebar = jQuery(iframeContent).find(".region-sidebar-first").parent();
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
//      jQuery(nodeMain).find(".node header").remove();
      //Keep the content column, kill others.
      jQuery(nodeMain).children().each(function(index, element) {
        //Keep the body, kill others.
        if ( ! jQuery(element).hasClass("field-name-body") ) {
          jQuery(element).remove();
//          jQuery(element).html('');
        }
      });
      //Kill the footer.
//      jQuery(iframeContent).find("footer").remove();
    } //end prepareIframeContent
    
    function swimShowThrobber( afterThisElement, message ) {
      if ( ! message ) {
        message = "";
      }
      var element = jQuery('<div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;' + message + '</div></div>');
      jQuery(afterThisElement).after(element);      
    }
    function swimRemoveThrobber( afterThisElement ) {
      var element = jQuery(afterThisElement).siblings(".ajax-progress-throbber");
      if ( element ) {
        element.remove();
      }
    }
}(jQuery));
