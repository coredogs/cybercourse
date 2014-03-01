(function ($) {
  
  Drupal.behaviors.swimx = {
    attach: function() {
      //Setup code to run after CKEDITOR instances have been created.
      CKEDITOR.on("instanceReady", function(evnt) {
        var editor = evnt.editor;
        editor.document.appendStyleSheet( Drupal.settings.swimx.editing_stylesheet );
//        //Size the editor.
//        if ( editor.name == "edit-body-und-0-value" ) {
//          editor.resize('100%', '500');
//        }
//        if ( editor.name == "edit-body-und-0-summary" ) {
//          editor.resize('100%', '120');
//        }
        Drupal.behaviors.swimx.swimxSetup(editor);
        //Add a class for customization of the body.
        $(editor.document.$.body).addClass("swim_body");
        
        //Flag the editor as initialized.
        $( "#" + editor.id ).attr("data-swimx-init", "yes");
      });
      //Check that the config exists.
      if ( ! Drupal.swimxCkConfig ) {
        console.log("Missing config");
        return;
      }
      //Add plugins.
//      CKEDITOR.plugins.addExternal( 'rest_help', 
//      '/sites/all/modules/cybercourse/swimx/ck_plugins/rest_help/' );
      if ( Drupal.settings.swimx.extraPlugins.name ) {
        $.each( Drupal.settings.swimx.extraPlugins.name, function(index, pluginName) {
          CKEDITOR.plugins.addExternal( 
            pluginName, 
            Drupal.settings.swimx.extraPlugins.path[index] 
          ); //End addExternal.
        } ); //End each.
      } //End if there are extraPlugins.
      //Replace the textareas with CKEditors.
      //This will trigger instanceReady above.
      var textAreas = $(".swimx-editor");
      $(textAreas).each(function(index, element) {
        //Make sure element has not already been initialized.
        if ( ! $(element).attr("data-swimx-init") ) {
          CKEDITOR.replace(element, Drupal.swimxCkConfig);
        }
      });
    }, //End attach.
    swimxSetup: function (editor) {    
      this.setupBeforeUnload(editor);
      if ( editor.commands.peek ) {
        this.swimxPeekSetup(editor);
      }
    },
    swimxPeekSetup: function(editor) {  
      //Disable peek button until ready.
      editor.commands.peek.disable();
      //Compute the URL for the iframe that simulates the device.
      var iframeSrc = Drupal.settings.swimx.base_url + "/swimx-mt-peek";      
      //Make peek toolbar.
      var iconPath = Drupal.settings.swimx.peekIconsPath;
      //Define the toolbar for this instance. Include an id.
      var toolbarHtml
      = "<div id='" + editor.id + "-toolbar' class='swimx-peek-toolbar cke_top'>"
      +   "<span class='cke_toolgroup' role='presentation'>"
      +     "<a id='" + editor.id + "-swimx-peek-as-desktop' "
      +        "class='swimx-peek-as-desktop cke_button cke_button_off swimx-button'><img "
      +        "src='" + iconPath + "desktop.png' title='Laptop'>"
      +     "</a>"
      +     "<a id='" + editor.id + "-swimx-peek-as-tablet' "
      +        "class='swimx-peek-as-tablet cke_button cke_button_off swimx-button'><img "
      +        "src='" + iconPath + "tablet.png' title='Tablet'>"
      +     "</a>"
      +     "<a id='" + editor.id + "-swimx-peek-as-phone' "
      +        "class='swimx-peek-as-phone cke_button cke_button_off swimx-button'><img "
      +        "src='" + iconPath + "phone.png' title='Phone'>"
      +     "</a>"
      +   "</span>"
//      +   "<span class='cke_toolgroup' role='presentation'>"
//      +     "<a id='" + editor.id + "-refresh' "
//      +        "class='swimx-peek-refresh cke_button cke_button_off swimx-button'><img "
//      +        "src='" + iconPath + "refresh.png' title='Refresh'>"
//      +     "</a>"
//      +   "</span>"
      + "</div>";
      var peekHtml = 
        "<div id='" + editor.id + "-swimx-peek-outer' class='swimx-peek-outer'>" //Everything in the dialog.
      +   toolbarHtml
      +   "<div class='swimx-peek-inner'>"
            //The device.
      +     "<iframe id='" + editor.id + "-swimx-peek-device' class='swimx-peek-device'></iframe>"
      +   "</div>" //End inner.
      + "</div>"; //End outer.
      $("body").append( peekHtml );
      //Hide what was just added.
      $("#" + editor.id + "-swimx-peek-outer").hide();
      $("#" + editor.id + "-swimx-peek-device").attr("src", iframeSrc);
      this.loadedAlready = false;
      var thisythis = this; //For closure.
      $("#" + editor.id + "-swimx-peek-device").load(function() {
        //Do this only once. Sometimes there is more than one load event?
        if ( ! thisythis.loadedAlready ) {
          thisythis.continueInit(editor);
        }
      });
    }, //End attach.
    continueInit: function(editor) {
      //Make a clone of the HTML to use as a template.
      //KRM - Do this once for all editors on the page?
      //      They should have the same template HTML. 
      this.templateBodyHtml 
        = $("#" + editor.id + "-swimx-peek-device").contents()
          .children("html").children("body").clone();
      //Prep the dialog.
      $( "#" + editor.id + "-swimx-peek-outer" )
        .dialog({
          title: 'Peek',
          autoOpen : false,
          dialogClass : "dialog-to-top" //Dialog on top of top nav bar.
        });
      //Set up events on the peek buttons.
      //Now the peek processing code.
      //KRM - do this once for all editors on the page?
      var swimxBehavior = this; //Convenience for closures.
      $( "#" + editor.id + "-swimx-peek-as-desktop").click( function() {
        swimxBehavior.deviceButtonClicked(editor, "desktop");
      } );
      $("#" + editor.id + "-swimx-peek-as-tablet").click( function() {
        swimxBehavior.deviceButtonClicked(editor, "tablet");
      } );
      $("#" + editor.id + "-swimx-peek-as-phone").click( function() {
        swimxBehavior.deviceButtonClicked(editor, "phone");
      } );
      //Set up the refresh button.
      $("#" + editor.id + "-peek-refresh").click( function() {
        swimxBehavior.showPeek(editor);
      } );
      //Init toolbar display.
      editor.selectedPeek = "desktop";
      this.showSelectedButton( editor );
      //Enable the peek function now that it is setup.
      editor.commands.peek.enable();
      //Add styles for editing with CK.
//      editor.document.appendStyleSheet(Drupal.settings.swimx.editing_stylesheet);
    }, //End continueInit.
    /**
    * Watch the plugin's peek button.
    */
    peekButtonClicked : function ( editor ) {
        //Add an obscuring thing.
        var obscurer = Drupal.settings.swimx.obscurer;
        $("#" + editor.id + "-swimx-peek-device").contents().find("body").first()
                .html( obscurer );
        if ( ! $( "#" + editor.id + "-swimx-peek-outer" ).dialog( "isOpen" ) ) {
          $( "#" + editor.id + "-swimx-peek-outer" ).dialog( "open" );
        }
        //Show the current peek.
        Drupal.behaviors.swimx.showPeek( editor );
    },
    deviceButtonClicked : function( editor, buttonClicked ) {
      editor.selectedPeek = buttonClicked; //Right? Should be string? See next fn.
      this.showPeek( editor );
      this.showSelectedButton( editor );
    },
    /**
     * Adjust toolbar to show whichever button is pressed.
     */
    showSelectedButton : function( editor ) {
      $("#" + editor.id + "-swimx-peek-as-desktop").removeClass("cke_button_on").addClass("cke_button_off");
      $("#" + editor.id + "-swimx-peek-as-tablet").removeClass("cke_button_on").addClass("cke_button_off");
      $("#" + editor.id + "-swimx-peek-as-phone").removeClass("cke_button_on").addClass("cke_button_off");
      $( "#" + editor.id + "-swimx-peek-as-" + editor.selectedPeek )
          .removeClass("cke_button_off").addClass("cke_button_on");
    },
    /**
     * Grab rendered text from the server and show it.
     */
    showPeek : function( editor ) {
      //Position edges of device below toolbar.
      var toolbarHeight = $("#" + editor.id + "-toolbar").outerHeight();
      $("#" + editor.id + "-swimx-peek-device").css("top", toolbarHeight );
      //Set up the peek to mimic the device.
      $( "#" + editor.id + "-swimx-peek-device" ).css("width", "").css("height", "");
      $( "#" + editor.id + "-swimx-peek-device" )
        .removeClass("swimx-peek-device-desktop "
            + "swimx-peek-device-tablet "
            + "swimx-peek-device-phone")
        .addClass("swimx-peek-device-" + editor.selectedPeek);
      var toolbarHeight = $("#" + editor.id + "-toolbar").outerHeight();
      var dialogTitleHeight = $(".ui-dialog-titlebar:first").outerHeight(); 
      //KRM - is this right? Probably - height the same for all editors.
      if ( editor.selectedPeek == 'desktop') {
        //Base size of dialog on what sizing the user has done. 
        var h = $(window).height() * 0.75;
        var w = $(window).width() * 0.75;
        $( "#" + editor.id + "-swimx-peek-device" ).css("height", h).css("width", w);
        $( "#" + editor.id + "-swimx-peek-outer" )
            .dialog( "option", "width", w + 40 )
            .dialog( "option", "height", 
              h + toolbarHeight + dialogTitleHeight + 40 
            )
            .dialog( "option", "title", "Peek (Desktop/laptop)");
      }
      else if (    editor.selectedPeek == 'phone' 
                || editor.selectedPeek == 'tablet' ) {
        //Base size of dialog on device size. 
        $( "#" + editor.id + "-swimx-peek-outer" )
            .dialog( "option", "width", 
              $("#" + editor.id + "-swimx-peek-device").outerWidth() + 20
            )
            .dialog( "option", "height", 
                $("#" + editor.id + "-swimx-peek-device").outerHeight() 
              + toolbarHeight + dialogTitleHeight + 40
            )
            .dialog( "option", "title", 
                (editor.selectedPeek == 'phone')
                ? "Peek (iPhone 1 to 4S, landscape)"
                : "Peek (iPad 1 and 2, portrait)"
        );
      }
      else {
        throw "showpeek: bad selectedpeek: *" + editor.selectedPeek + "*";
      }
      //Get editor's current content.
      var markup = editor.getData();
      //Get rendering from server.
      var promise = $.ajax(
        Drupal.settings.basePath + 'swimx-peek',
        {
          type: "POST",
          data: {
            'content': markup
          }
      });
      //Keep a ref to the editor this applies to.
      promise.editor = editor;
      var thisRef = this;
      promise.done( function (data) {
        thisRef.peekDataReturned(data, promise.editor);
      });
      promise.fail( this.peekFailed );
      promise.always( this.peekFinished );
//      this.showThrobber(, "Loading");
    }, // end showpeek.
    peekDataReturned : function( data, editor ) {
      if ( data.status == 'success' ) {
        //Restore body template content.
        //Get the template code.
        var templateCode = this.templateBodyHtml.clone();
        //Erase contents of the MT container, if any.
        templateCode = $(templateCode).find("#swimx-mt-content-container").first().html('');
        //Insert the MT template code into the preview iframe.
        $("#" + editor.id + "-swimx-peek-device").contents().find("body").first()
            .html( templateCode );
        //Insert new content.
        $("#" + editor.id + "-swimx-peek-device").contents().find("body").find("#swimx-mt-content-container")
            .append(data.result);
      }
      else {
        throw "showPeek: Ajax preview call failed.";
      } // end data.status not success.      
    },
    peekFailed : function( textStatus ) {
      throw new Exception( "Ajax preview request failed: " + textStatus );
    },
    peekFinished: function() {
      
    },
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
    },
    setupBeforeUnload : function(editor) {
      //Store starting values of content fields.
      //this.initialBody =  editor.document.getBody().getText();
      //Convenience var for closures.
      var swimxRef = this;
      //Flag showing whether unload code should check for changes.
      this.checkForChanges = true;
      //When click Save, Save and Edit, etc., no need to check for changes. 
      //Drupal will handle it.
      $("#edit-submit, #edit-save-edit, #edit-preview-changes, #edit-delete")
          .click(function(){
            swimxRef.checkForChanges = false;
          });
      window.onbeforeunload = function() {
        if ( swimxRef.checkForChanges ) {
          var contentChanged = false;
          //Body changed?
          if ( editor.checkDirty() ) {
//          if ( editor.document.getBody().getText() != swimxRef.initialBody ) {
            contentChanged = true;
          }
          if ( contentChanged ) {
            return "There are unsaved changes. Are you sure you want to leave?";
          }
        }
      }
    }
  };
  //Selector that will find content in the document fetched to act as a template.
  Drupal.behaviors.swimx.contentContainerClass = "document";
}(jQuery));
