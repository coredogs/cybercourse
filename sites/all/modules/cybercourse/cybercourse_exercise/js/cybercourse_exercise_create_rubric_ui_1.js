(function($) {
  var uiNamespace; //Convenient ref to a namespacey thing.
  Drupal.behaviors.cycoCreateRubricUi = {
    //**** Data describing a rubric item.
    RubricItem: function() {
      this.nid = null;
    },
    //Id of the rubric item.
    itemNid: null,
    //Item name.
    itemName: "",
    //Terms the user has selected.
    termsChecked: new Array(),
    //Notes.
    itemNotes: "",
    //Phrases.
    phrasesGood: new Array(),
    phrasesNeedsWork: new Array(),
    phrasesPoor: new Array(),
    //**** Data about the UI's state.
    //The user has changed something. Used during save and cancel.
    changed: false,
    //HTML template for a phrase.
    phraseTemplate: "",
    //The categories tree.
    tree: null,
    //Text to show in a phrase field that is MT.
    mtPhraseText: "Type new phrase",
    //Item data fetched from the server.
    itemServerData: null,
    attach: function(context, settings) {
      //Nothing to do
    },
    //Does not use attach. startMeUp is called by the select interface 
    //one it has done its work.
    startMeUp: function() {
      uiNamespace = Drupal.behaviors.cycoCreateRubricUi;
      uiNamespace.createUi();
    },
    /**
     * Prepare the UI.
     */
    createUi: function() {
      uiNamespace.hideAjaxThrobber();
      //Hide the templates for the interfaces that Drupal added to the page.
      $("#rubric-create-ui").hide();
      $(".rubric-create-phrase-container").hide();
      //Grab the template for phrases.
      uiNamespace.phraseTemplate = 
          $(".rubric-create-phrase-container").remove();
      //Get the tree node data from the link items UI.
      var treeNodes = Drupal.behaviors.cycoSelectRubricUi.treeNodes;
      //Set up the categories tree.
      uiNamespace.createTreeDisplay( treeNodes );
      //Set up the buttons.
      uiNamespace.setupAddItemUiButtons();
      //Set up the dialog.
      $("#rubric-create-ui").dialog({
          modal: true,
          autoOpen: false,
          title: "Rubric item",
          resizable: true,
          width: 560
      });
    },
    /*
     * Create the term tree display from the data structure.
     * @param Array treeNodes Data structure, tree of terms.
     */
    createTreeDisplay: function( treeNodes ) {
      //Create the tree display object.
      uiNamespace.tree = $("#rubric-create-categories").fancytree({
        source: treeNodes,
        icons: false,
        checkbox: true,
        selectMode: 2,
        beforeActivate: function(event, treeData) {
          //Trigger selected instead.
          treeData.node.toggleSelected();
          return false;
        },
      });
    },
    /*
     * Set up the buttons in the bottom right of the add item UI.
     */
    setupAddItemUiButtons: function() {
      //Handler for the cancel button.
      $("#rubric-create-cancel").click(function() {
        //Confirm that user wants to lose changes.
        if ( uiNamespace.changed ) {
          if ( confirm("Do you want to lose your changes?") ) {
            return;
          }
        }
        //Hide the create item UI.
        $("#rubric-create-ui").dialog("close");
      });
    },
    /*
     * Show the display for creating/editing/viewing rubric items.
     * @param int itemNid The nid of the item to edit. 0 to create new one.
     */
    showCreateItemUi: function( itemNid ) {
      //Show user has made no changes yet.
      uiNamespace.changed = false;
      if ( itemNid == 0 ) {
        uiNamespace.clearUi();
        uiNamespace.displayUi();
      }
      else {
        //Grab vocab terms and rubric items from server.
        uiNamespace.showAjaxThrobber();
        $.when( 
          uiNamespace.fetchItemData( itemNid )
        )
        .then(function() {
          //Load the fetched data into UI.
          uiNamespace.fillUiWidgets();
          uiNamespace.hideAjaxThrobber();
          //Show the UI.
          uiNamespace.displayUi();
        })
        .fail(function() {
          alert("Fetch item data failed.");
        });
      }
    },
    /**
     * Empty the UI's widgets in preparation for a new item.
     */
    clearUi: function() {
     uiNamespace.itemNid = 0;
     //Clear the item name.
     uiNamespace.itemName = "";
     $("#rubric-create-notes").val("");
     //Clear the checked values from the category tree.
    var selNodes = uiNamespace.tree.fancytree("getTree").getSelectedNodes();
    $(selNodes).each( function(index, node) {
      node.setSelected(false);
    });
     //Clear the notes.
     uiNamespace.itemNotes = "";
     $("#rubric-create-notes").val("");
     //Set up new phrase fields.
     var goodMtPhraseContainer = uiNamespace.createPhraseContainer(null);
     var needsWorkMtPhraseContainer = uiNamespace.createPhraseContainer(null);
     var poorMtPhraseContainer = uiNamespace.createPhraseContainer(null);
     //Add copy to each phrase set.
     $("#rubric-create-phrases-good-list")
         .append( goodMtPhraseContainer );
     $("#rubric-create-phrases-needs-work-list")
         .append( needsWorkMtPhraseContainer );
     $("#rubric-create-phrases-poor-list")
         .append( poorMtPhraseContainer );
     goodMtPhraseContainer.show();
     needsWorkMtPhraseContainer.show();
     poorMtPhraseContainer.show();
    },
    /*
     * Create a new phrase container.
     * @param string phrase Phrase for container, MT for new phrase.
     * @returns Phrase container.
     */
    createPhraseContainer: function( phrase ) {
      //Clone the phrase template.
      var phraseContainer = $(uiNamespace.phraseTemplate).clone();
      //Insert phrase text, if any.
      if ( phrase ) {
        phraseContainer.find("input").val( phrase );
      }
      else {
        //New phrase, hide its remove button.
        phraseContainer.find("button").hide();
        phraseContainer.find("input").addClass("rubric-create-mt-phrase")
                .val( uiNamespace.mtPhraseText );
      }
      return phraseContainer;
    },
    /*
     * Fetch item data from the server.
     */
    fetchItemData: function( itemNid ) {
      var webServiceUrl = Drupal.settings.basePath 
              + "exercise/rubric_item/" + itemNid;
      var promise = $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json", url: webServiceUrl,
        beforeSend: function (request) {
          request.setRequestHeader("X-CSRF-Token", 
            Drupal.behaviors.cycoSelectRubricUi.token);
        }
      })
        .done(function(result) {
          uiNamespace.itemServerData = result;
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          alert('getJSON request failed! ' + errorThrown);
        });
      return promise;
      
    },
    /*
     * Load the UI's widgets in preparation for editing.
     */
    fillUiWidgets: function() {
      
    },
    /*
     * Show the UI
     */
    displayUi: function() {
      $("#rubric-create-ui").dialog("open");
    },
    /*
     * Return a list of tids (term ids) of terms the user has checked. 
     */
    findCheckedTerms: function() {
      var selNodes = uiNamespace.tree.fancytree("getTree").getSelectedNodes();
      //Replace existing array of checked term ids.
      var terms = new Array();
      $(selNodes).each( function(index, node) {
        terms.push( node.key );
//        console.log( node.key + " " + node.title );
      });
      return terms;
    },
    /*
     * The user clicked on a rubric item.
     * @param Object event The click event's details.
     */
    rubricItemSelected: function( event ) {
      var clickedItem = event.target;
      var clickedNid = parseInt( $(clickedItem).attr("data-nid") );
      //Remove existing highlight.
      $("." + uiNamespace.selectedItemClass )
        .removeClass(uiNamespace.selectedItemClass)
      //Save nid of selected item.
      uiNamespace.selectedItemNid = clickedNid;
      //Add highlight class.
      $(clickedItem).addClass(uiNamespace.selectedItemClass);
      //Enable buttons.
      $("#rubric-select-edit").removeAttr("disabled");
      $("#rubric-select-link").removeAttr("disabled");
    },
    showAjaxThrobber: function() {
      $("#rubric-create-loading-throbber").show("fast");
    },
    hideAjaxThrobber: function() {
      $("#rubric-create-loading-throbber").hide("fast");
    }
  };
}(jQuery));
