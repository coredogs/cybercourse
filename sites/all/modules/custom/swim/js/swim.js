

(function ($) {
  var swimDoneOnce = false;
  Drupal.behaviors.swim = {
    swimSetup: function () {
      if ( swimDoneOnce ) {
        return;
      }
      //Disable peek button until ready.
      CKEDITOR.instances['edit-body-und-0-value'].commands.peek.disable();
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
      +     "<iframe id='swim-peek-device'></iframe>"
      +   "</div>" //End inner.
      + "</div>"; //End outer.
      $("body").append( peekHtml );
      //Hide what was just added.
      $("#swim-peek-outer").hide();
      $("#swim-peek-device").attr("src", iframeSrc);
      var thisythis = this;
      var loadedAlready = false;
      $("#swim-peek-device").load(function() {
//        console.log("ready num bodies: " +  $("#swim-peek-device").contents().children("html").children("body").length);
//        console.log("ready num documents: " +  $("#swim-peek-device").contents().children("html").children("body").find(".document").length);
//        console.log("iframe ready");
        if ( ! loadedAlready ) {
          //Do this only once. Sometimes there is more than one load event.
          thisythis.continueInit();
          loadedAlready = true;
        }
      });
//      console.log("waiting for iframe");
      //Wait until the content is loaded.
//      swimWaitForLoad();
    }, //End attach.
    continueInit: function() {
      //Make a clone of the HTML to use as a template.
      this.templateBodyHtml 
        = $("#swim-peek-device").contents().children("html").children("body")
          .clone();
              //this.prepareIframeContent();
      //Prep the dialog.
      $( "#swim-peek-outer" )
        .dialog({
          title: 'Peek',
          autoOpen : false,
          dialogClass : "dialog-to-top" //Dialog on top of top nav bar.
        });
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
        swimBehavior.showPeek();
      } );
      //Init toolbar display.
      this.selectedPeek = "phone";
      this.showSelectedButton();
      //Turn on the CKEditor peek button, so show all is ready.
      CKEDITOR.instances['edit-body-und-0-value'].commands.peek.enable();
    }, //End continueInit.
//    prepareIframeContent : function() {
//      //The iframe has a page loaded. Remove all the content on the page 
//      //that is not needed to show the preview, e.g., sidebars. 
//      //This is theme-dependent. I don't know how to make it generic, to
//      //work with any theme.
////      var iframeContent = $("#swim-peek-device").contents();
//      var bodyTemplate = $("#swim-peek-device").contents().children("html").children("body");
//      return bodyTemplate.html();
//    }, //end prepareIframeContent
    
      /**
       * Watch the plugin's peek button.
       */
    peekButtonClicked : function () {
        //Add an obscuring thing.
        var obscurer = 
  "<h1 style='margin:0;padding:0;background-color:white;position:absolute;"
  +   "width:100%;height:100%;top:0;left:0;'>"
  + "Working..."
  + "</h1>";
        $("#swim-peek-device").contents().find("body").first()
                .html( obscurer );
        if ( ! $( "#swim-peek-outer" ).dialog( "isOpen" ) ) {
          $( "#swim-peek-outer" ).dialog( "open" );
        }
        //Show the current peek.
        Drupal.behaviors.swim.showPeek();
      },
    deviceButtonClicked : function( buttonClicked ) {
      this.selectedPeek = buttonClicked;
      this.showPeek();
      this.showSelectedButton();
    },
    /**
     * Adjust toolbar to show whichever button is pressed.
     */
    showSelectedButton : function() {
      $("#swim-peek-as-desktop").removeClass("cke_button_on").addClass("cke_button_off");
      $("#swim-peek-as-tablet").removeClass("cke_button_on").addClass("cke_button_off");
      $("#swim-peek-as-phone").removeClass("cke_button_on").addClass("cke_button_off");
      $( "#swim-peek-as-" + this.selectedPeek )
          .removeClass("cke_button_off").addClass("cke_button_on");
    },
    /**
     * Grab rendered text from the server and show it.
     */
    showPeek : function() {
      //Position edges of device below toolbar.
      var toolbarHeight = $("#swim-peek-toolbar").outerHeight();
      $("#swim-peek-device").css("top", toolbarHeight );
      //Set up the peek to mimic the device.
      $( "#swim-peek-device" ).css("width", "").css("height", "");
      $( "#swim-peek-device" )
        .removeClass("swim-peek-device-desktop "
            + "swim-peek-device-tablet "
            + "swim-peek-device-phone")
        .addClass("swim-peek-device-" + this.selectedPeek);
      var toolbarHeight = $('#swim-peek-toolbar').outerHeight();
      var dialogTitleHeight = $(".ui-dialog-titlebar").outerHeight();
      if ( this.selectedPeek == 'desktop') {
        //Base size of dialog on what sizing the user has done. 
        var h = $("#cke_2_contents").innerHeight();
        var w = $(document).innerWidth() * 0.75;
        $( "#swim-peek-device" ).css("height", h).css("width", w);
        $( "#swim-peek-outer" )
            .dialog( "option", "width", w + 40 )
            .dialog( "option", "height", 
              h + toolbarHeight + dialogTitleHeight + 40 
            )
            .dialog( "option", "title", "Peek (Desktop/laptop)");
      }
      else if (    this.selectedPeek == 'phone' 
                || this.selectedPeek == 'tablet' ) {
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
                (this.selectedPeek == 'phone')
                ? "Peek (iPhone 1 to 4S, landscape)"
                : "Peek (iPad 1 and 2, portrait)"
        );
      }
      else {
        throw "showpeek: bad selectedpeek: *" + this.selectedPeek + "*";
      }
      //Get content from server.
      var editor = CKEDITOR.instances["edit-body-und-0-value"];
      var markup = editor.getData();
      var format = Drupal.settings.swim.format_name;
      var swimBehavior = this; //Convenience for closures.
      $.ajaxMarkup(markup, format, function(result, success, request) {
        if ( success ) {
          //Restore body template content.
          //Get the template code.
          var templateCode = swimBehavior.templateBodyHtml.clone();
          //Erase contents of the MT container, if any.
          templateCode = $(templateCode).find("#cyco-mt-content-container").first().html('');
          //Insert the MT template code into the preview iframe.
          $("#swim-peek-device").contents().find("body").first()
              .html( templateCode );
          //Insert new content.
          $("#swim-peek-device").contents().find("body").find("#cyco-mt-content-container")
              .append(result);
          //Get ref to the markup in the iframe.
//          var iframeContentContainer 
//              = iframe.contents().find(".document");
//          iframeContentContainer.html(result);
          //swimBehavior.prepareIframeContent();
        }
        else {
          throw "showPeek: Ajax call failed.";
        } // end not success.
      });
    }, // end showpeek.
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
  //Selector that will find content in the document fetched to act as a template.
  Drupal.behaviors.swim.contentContainerClass = "document";
}(jQuery));
