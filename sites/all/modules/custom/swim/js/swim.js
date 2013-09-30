//$(document).on('insertIntoActiveEditor', function() {
//    alert('Ima custom event');
//});

(function ($) {
  var swimDoneOnce = false;
  Drupal.behaviors.swim = {
    attach: function (context, settings) {
      if ( swimDoneOnce ) {
        return;
      }
      swimDoneOnce = true;
      //Compute the URL for the iframe that simulates the device.
      var iframeSrc = Drupal.settings.swim.base_url + "/swim-mt-peek";      
      //Make peek toolbar.
      var iconPath = Drupal.settings.swim.base_url 
          + "/sites/all/modules/ckeditor/plugins/peek/icons/";
      var toolbarHtml
      = "<div id='swim-peek-toolbar' class='cke_top'>"
      +   "<span class='cke_toolgroup' role='presentation'>"
      +     "<a id='swim-peek-as-desktop' "
      +        "class='cke_button cke_button_off swim-button'><img "
      +        "src='" + iconPath + "desktop.png' title='Laptop'>"
      +     "</a>"
      +     "<a id='swim-peek-as-tablet' "
      +        "class='cke_button cke_button_off swim-button'><img "
      +        "src='" + iconPath + "tablet.png' title='Tablet'>"
      +     "</a>"
      +     "<a id='swim-peek-as-phone' "
      +        "class='cke_button cke_button_off swim-button'><img "
      +        "src='" + iconPath + "phone.png' title='Phone'>"
      +     "</a>"
      +   "</span>"
      +   "<span class='cke_toolgroup' role='presentation'>"
      +     "<a id='swim-peek-refresh' "
      +        "class='cke_button cke_button_off swim-button'><img "
      +        "src='" + iconPath + "refresh.png' title='Refresh'>"
      +     "</a>"
      +   "</span>"
      + "</div>";
      var peekHtml = 
        "<div id='swim-peek-outer'>" //Everything in the dialog.
      +   toolbarHtml
      +   "<div id='swim-peek-inner'>"
            //The device.
      +     "<iframe id='swim-peek-device' src='" + iframeSrc + "'></iframe>"
//            //A cache. Load pages into the cache. Then copy to display.
//            //Gives control over timing of device screen update.
//      +     "<iframe style='display:none;' id='swim-cache' "
//      +         "src='" + iframeSrc + "'></iframe>"
      +   "</div>" //End inner.
      + "</div>"; //End outer.
      $("body").append( peekHtml );
      //Wait until the content is loaded.
      swimWaitForLoad();
    }, //End attach.
    continueInit: function() {
      //Copy content of cache iframe.
      var content = $("#swim-cache").contents().find("body").clone();
      //Prep the dialog.
      $( "#swim-peek-outer" )
        .dialog({
          title: 'peek',
          autoOpen : false,
          dialogClass : "dialog-to-top" //Dialog on top of top nav bar.
        });
      //Prepare the iframe content. Remove content that isn't needed.
      this.prepareIframeContent();
      //Match toolbar height to the one creted by CKEditor.
      var toolbarHeight = $("#swim-peek-toolbar").outerHeight();
      $("#swim-peek-device").css("top", toolbarHeight );
      //Set up events on the peek buttons.
      //Now the peek processing code.
      var swimBehavior = this; //Convenience for closures.
      $("#swim-peek-as-desktop").click( function() {
        swimBehavior.deviceButtonClicked("desktop");
      } );
      $("#swim-peek-as-tablet").click( function() {
        swimBehavior.deviceButtonClicked("tablet");
      } );
      $("#swim-peek-as-phone").click( function() {
        swimBehavior.deviceButtonClicked("phone");
      } );
      //Set up the refresh button.
      $("#swim-peek-refresh").click( function() {
        swimBehavior.showpeek();
      } );
      /**
       * Watch the plugin's peek button.
       */
      $(".cke_button__peek").click(function() {
        if ( ! $( "#swim-peek-outer" ).dialog( "isOpen" ) ) {
          $( "#swim-peek-outer" ).dialog( "open" );
        }
        //Show the current peek.
        Drupal.behaviors.swim.showpeek();
      });
      
      //Init display.
      this.selectedpeek = "phone";
      this.showSelectedButton();
      
      
      //Turn on the CKEditor peek button, so show all is ready.
      CKEDITOR.instances['edit-body-und-0-value'].commands.peek.enable();

    }, //End continueInit.
    deviceButtonClicked : function( buttonClicked ) {
      this.selectedpeek = buttonClicked;
      this.showSelectedButton();
      this.showpeek();
    },
    /**
     * Adjust toolbar to show whichever button is pressed.
     */
    showSelectedButton : function() {
      $("#swim-peek-as-desktop").removeClass("cke_button_on").addClass("cke_button_off");
      $("#swim-peek-as-tablet").removeClass("cke_button_on").addClass("cke_button_off");
      $("#swim-peek-as-phone").removeClass("cke_button_on").addClass("cke_button_off");
      $( "#swim-peek-as-" + this.selectedpeek )
          .removeClass("cke_button_off").addClass("cke_button_on");
    },
    /**
     * Grab rendered text from the server and show it.
     */
    showpeek : function() {
      var iframe = $( "#swim-peek-device" );
      //Add an obscuring thing.
      var obscurer = 
"<div style='margin:0;padding:0;background-color:white;position:absolute;"
+   "width:100%;height:100%;overflow:hidden;z-index:20000;top:0;left:0;'>"
+ "Working..."
+ "</div>";
      iframe.contents().find("body").prepend(obscurer);
      var iframeContentContainer 
          = iframe.contents().find(".field-name-body");
//      iframeContentContainer.html('<p>Working...</p>');
      //Set up the peek to mimic the device.
      $( "#swim-peek-device" ).css("width", "").css("height", "");
      $( "#swim-peek-device" )
        .removeClass("swim-peek-device-desktop "
            + "swim-peek-device-tablet "
            + "swim-peek-device-phone")
        .addClass("swim-peek-device-" + this.selectedpeek);
      var toolbarHeight = $('#swim-peek-toolbar').outerHeight();
      var dialogTitleHeight = $(".ui-dialog-titlebar").outerHeight();
      if ( this.selectedpeek == 'desktop') {
        //Base size of dialog on what sizing the user has done. 
        var h = $("#cke_2_contents").innerHeight();
        var w = $(document).innerWidth() * 0.75;
        $( "#swim-peek-device" ).css("height", h).css("width", w);
        $( "#swim-peek-outer" )
            .dialog( "option", "width", w + 40 )
            .dialog( "option", "height", 
              h + toolbarHeight + dialogTitleHeight + 40 
            )
            .dialog( "option", "title", "peek (Desktop/laptop)");
      }
      else if (    this.selectedpeek == 'phone' 
                || this.selectedpeek == 'tablet' ) {
        //Base size of dialog on device size. 
        $( "#swim-peek-outer" )
            .dialog( "option", "width", 
              $('#swim-peek-device').outerWidth() + 20
            )
            .dialog( "option", "height", 
                $("#swim-peek-device").outerHeight() 
              + toolbarHeight + dialogTitleHeight + 40
            )
            .dialog( "option", "title", 
                (this.selectedpeek == 'phone')
                ? "peek (iPhone 1 to 4S, landscape)"
                : "peek (iPad 1 and 2, portrait)"
        );
      }
      else {
        throw "showpeek: bad selectedpeek: *" + this.selectedpeek + "*";
      }
      //Get content from server.
      var editor = CKEDITOR.instances["edit-body-und-0-value"];
      var markup = editor.getData();
      var format = Drupal.settings.swim.format_name;
      var swimBehavior = this; //Convenience for closures.
      $.ajaxMarkup(markup, format, function(result, success, request) {
        if ( success ) {
          //Show the content.
          var iframe = $( "#swim-peek-device" );
          //Get ref to the markup in the iframe.
          var iframeContentContainer 
              = iframe.contents().find(".field-name-body");
          iframeContentContainer.html(result);
          swimBehavior.prepareIframeContent();
        }
        else {
          throw "showpeek: Ajax call failed.";
        } // end not success.
      });
    }, // end showpeek.
    prepareIframeContent : function() {
      var iframeContent = $("#swim-peek-device").contents();
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


var donkeyCounter = 0;
var donkeyDelay = 200;
var donkeyWaitLimit = 50;
var donkeyReady = false;

function swimWaitForLoad() {
//  alert('boo')
//  if ( Drupal.behaviors.swim.initLoadComplete ) {
//    return;
//  }
  donkeyCounter ++;
  if ( donkeyCounter > donkeyWaitLimit ) {
    donkeyReady = true;
  }
//  console.log('counter: ' + donkeyCounter);
  if ( CKEDITOR ) {
    if ( CKEDITOR.instances['edit-body-und-0-value'] ) {
      if ( CKEDITOR.instances['edit-body-und-0-value'].instanceReady ) {
        var iframeCacheContent = jQuery('#swim-peek-device').contents()
                .find("body").find(".main-container");
        if ( iframeCacheContent.length > 0 ) {
          donkeyReady = true;
        }
      }
    }
  }
  if ( donkeyReady ) {
    Drupal.behaviors.swim.continueInit();
  }
  else {
    setTimeout("swimWaitForLoad()", donkeyDelay);
  }
}
