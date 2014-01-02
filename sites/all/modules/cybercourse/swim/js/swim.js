(function ($) {
  
  var swimDoneOnce = false;
  Drupal.behaviors.swim = {
    attach: function() {
      //Setup code to run after CKEDITOR instances have been created.
      CKEDITOR.on("instanceReady", function(evnt) {
        var editor = evnt.editor;
        editor.document.appendStyleSheet( Drupal.settings.swim.editing_stylesheet );
        //Size the editor.
        editor.ui.space( 'contents' ).setStyle( 'height', 
            $(window).height() * 0.5 + 'px' );
//        editor.config.height = "666px"; //$(window).height() * 0.5;
//        if ( editor.name == 'edit-body-und-0-summary' ) {
//        }
        if ( editor.name == 'edit-body-und-0-value' ) {
          //Size the main editor.
//          editor.config.height = "30em";
          //Start up Swim init.
          Drupal.behaviors.swim.swimSetup();
        }
      });
    },
    swimSetup: function () {    
      if ( swimDoneOnce ) {
        return;
      }
      swimDoneOnce = true;
      if ( ! CKEDITOR.instances['edit-body-und-0-value'].commands.peek ) {
        //Skip the rest if there is no peek command. The command is only
        //created if the user has Drupal's permission to peek.
        return;
      }
      //Disable peek button until ready.
      CKEDITOR.instances['edit-body-und-0-value'].commands.peek.disable();
      //Compute the URL for the iframe that simulates the device.
      var iframeSrc = Drupal.settings.swim.base_url + "/swim-mt-peek";      
      //Make peek toolbar.
      var iconPath = Drupal.settings.swim.icon_path;
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
      $.each(CKEDITOR.instances, function(index, instance) {
        //Turn on the CKEditor peek button, so show all is ready.
        instance.commands.peek.enable();
        //Add styles for editing with CK.
        instance.document.appendStyleSheet(Drupal.settings.swim.editing_stylesheet);
      });
//      CKEDITOR.instances['edit-body-und-0-value'].commands.peek.enable();
      //Add styles for editing with CK.
//      CKEDITOR.instances['edit-body-und-0-value'].document.appendStyleSheet(Drupal.settings.swim.editing_stylesheet);
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
    peekButtonClicked : function ( editor ) {
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
        Drupal.behaviors.swim.showPeek( editor );
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
    showPeek : function( editor ) {
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
        var h = $(window).height() * 0.75;
        var w = $(window).width() * 0.75;
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
//      var editor = CKEDITOR.instances["edit-body-und-0-value"];
      var markup = editor.getData();
      var swimBehavior = this; //Convenience for closures.
      $.ajax({
        async: false,
        type: "POST",
        url: Drupal.settings.basePath + 'swim-peek',
        data: {
          'content': markup
        },
        success: function(data, textStatus, jqXHR) {
          if ( data.status == 'success' ) {
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
                .append(data.result);
          }
          else {
            throw "showPeek: Ajax preview call failed.";
          } // end data.status not success.
        }, //End success function.
        fail: function(jqXHR, textStatus) {
          throw new Exception( "Ajax preview request failed: " + textStatus );
        }
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
