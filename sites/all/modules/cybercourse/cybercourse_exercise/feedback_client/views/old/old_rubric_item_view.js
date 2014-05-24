var app = app || {};

app.RubricItemView = Backbone.View.extend({
  NOTHING_SELECTED: '(Nothing selected)',
  tagName: 'div',
  //Turn template into templating function.
  levelTpl: _.template($('#rubric_item_template').html()),
  initialize: function() {
    this.viewId = app.keepView(this);
    //KRM debug
    this.krmType = 'RubricItemView';
  },
  render: function () {
    //Render the levels collection.
    //var x = this.model;
    //alert(this.model);
    var levelCollection = this.model.getLevelCollection();
    //Are there any?
    if ( levelCollection && levelCollection.models && levelCollection.models.length > 0 ) {
      //Get selected id.
      var selectedLevelId = this.model.getSelectedLevelId();
      //Create "not selected" level.
      //Create a data model for it.
      var nothingSelectedLevelModel = new app.RubricItemLevelModel();
      //Set its attributes.
      nothingSelectedLevelModel.setLevelId( 0 );
      nothingSelectedLevelModel.setLevelName( this.NOTHING_SELECTED );
      nothingSelectedLevelModel.setLevelOrder( -1 );
      //Create a view for it.
      var nothingSelectedLevelView = new app.RubricItemLevelView( {model: nothingSelectedLevelModel} );
      //Render it. Send flag showing whether this item is selected.
      nothingSelectedLevelView.render( selectedLevelId == 0 );
      //Start accumulating HTML.
      var resultHtml = nothingSelectedLevelView.$el.html();
      //Loop across level models.
      _.each( levelCollection.models, function( item ) {
        //Make a view for the level.
        var levelView = new app.RubricItemLevelView( {model: item} );
        //Render it. Send flag showing whether this item is selected.
        levelView.render( selectedLevelId == item.id );
        //Add its HTML to building HTML.
        resultHtml += levelView.$el.html();
      });
      //Get name of selected level.
      var nameSelectedLevel = '';
      if ( selectedLevelId == 0 ) {
        nameSelectedLevel = this.NOTHING_SELECTED;
      }
      else {
        nameSelectedLevel = levelCollection.get(selectedLevelId).getLevelName();
      }
      //Set up object with template values.
      var templateVarValues = {
        viewId: this.viewId,
        itemId: this.model.getItemId(),
        itemName: this.model.getItemName(),
        levels: resultHtml,
        selectedId: selectedLevelId,
        selectedName: nameSelectedLevel
      };
      //Instantiate template
      var templateInstantiated = this.levelTpl( templateVarValues );
      //Put HTML into DOM.
      this.$el.html( templateInstantiated );
    } // End there are levels.
    return this;
  },
  levelClicked: function(clickedLevelDomElement) {
    //Save new selected level to the rubric item model.
    var levelId = $(clickedLevelDomElement).attr('data-id');
    this.model.setSelectedLevelId( levelId );
    //Find the rubric item the clicked level is part of.
    var rubricItemDomElement = $(clickedLevelDomElement).closest('.rubric-item');
    //Clear old selection marker.
    var previousSelectedDomElement = $(rubricItemDomElement).find('.selected');
    if ( previousSelectedDomElement.length > 0 ) {
      $(previousSelectedDomElement).removeClass('selected');
    }
    //Mark the new selected item.
    $(clickedLevelDomElement).addClass('selected');
    //Collapse the dropdown list.
    rubricItemDomElement.find('ul').hide('fast');
    //Get the name of the selected level.
    var levelViewId = $(clickedLevelDomElement).attr('data-view-id');
    var levelView = app.viewsRefs[levelViewId];
    var levelName = levelView.model.getLevelName();
    //Show as the selected level.
    $(rubricItemDomElement).find('.rubric-item-selected').html(levelName);
  },
  clickEvent: function(evnt) {
    //Clicked the currently selected element.
    //Find the rubric item.
    var rubricItemDomElement = $(evnt.target).closest('.rubric-item');
    //If collapsed, expand it.
    rubricItemDomElement.find('ul').show('fast');
  },
          
  addSelectedMarker: function(addIt) {
    //Return marker for selected level.
    //Bit kludgy?
    return addIt ? ' class="selected" ' : '' ;
  },
  clickName: function(evnt) {
    this.clickSelected(evnt);
//    alert('Name: Don\'t touch me!');
  },
  clickSelected: function(evnt) {
    //Clicked the currently selected element.
    //Find the rubric item.
    var rubricItemDomElement = $(evnt.target).closest('.rubric-item');
    //If collapsed, expand it.
    if ( $(rubricItemDomElement).hasClass('collapsed') ) {
      rubricItemDomElement.removeClass('collapsed');
      rubricItemDomElement.addClass('expanded');
    }
  },
  clickLevel: function(evnt) {
    //Clear currently selected level
    //this.clearSelectedLevel(evnt.target);
    //Get the id of the clicked thing.
    var id = $(evnt.target).attr('data-id');
    //Store in model.
    this.model.setSelectedLevelId(id);
    
    this.render();
    return;
    //Show selected item to user.
    this.showSelectedLevel(event.target);
    
  },
  showSelectedLevel: function(clickedLevelDomElement) {
    //Find the collection parent the clicked level is part of.
    var collectionDomElement = $(clickedLevelDomElement).closest('ul');
    //Remove the current selected marker.
    var previousSelectedDomElement = $(collectionDomElement).find('.selected');
    if ( previousSelectedDomElement.length > 0 ) {
      $(previousSelectedDomElement).removeClass('selected');
    }
    //Mark the new selected item.
    $(clickedLevelDomElement).addClass('selected');
    //Collapse the dropdown list.
    collectionDomElement.removeClass('expanded');
    collectionDomElement.addClass('collapsed');
  } //End clearSelectedLevel
});