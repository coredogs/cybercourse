var app = app || {};

app.NO_LEVEL_SELECTED = '(No assessment)';
app.NO_COMMENT_SELECTED = '(No comments)';

app.SolutionRubricItemAssessmentView = Backbone.View.extend({
  tagName: 'div',
  //Turn templates into templating functions.
  levelTpl: _.template($('#solution_rubric_item_assessment_template').html()),
  initialize: function() {
    //Register the view.
    this.viewId = app.keepView(this);
    //KRM debug
    this.krmType = 'SolutionRubricItemAssessmentView';
  },
  render: function () {
    //Render the levels collection.
    var tmp = this.renderLevelsCollection();
    //HTML for the list of available levels user can click on.
    var resultLevelsAvailableHtml = tmp.available;
    //HTML for the list of levels the user has clicked on.
    var resultLevelsSelectedHtml = tmp.selected;
    
    //Render the comments collection.
    tmp = this.renderCommentsCollection();
    //HTML for the list of available comments user can click on.
    var resultCommentsAvailableHtml = tmp.available;
    //HTML for the list of comments the user has clicked on.
    var resultCommentsSelectedHtml = tmp.selected;
    
    //Set up object with template values.
    var templateVarValues = {
      viewId: this.viewId,
      itemId: this.model.getRubricItem().getRubricItemId(),
      itemName: this.model.getRubricItem().getRubricItemName(),
      selectedLevels: resultLevelsSelectedHtml,
      availableLevels: resultLevelsAvailableHtml,
      selectedComments: resultCommentsSelectedHtml,
      availableComments: resultCommentsAvailableHtml
    };
    //Instantiate template
    var templateInstantiated = this.levelTpl( templateVarValues );
    //Put HTML into DOM.
    this.$el.html( templateInstantiated );
    //Set up keyboard events for new comment input fields.
    var parentView = this;
    $("body").on("keyup", "input.new-comment-input", function(evnt){
      evnt.stopImmediatePropagation();
      var t = $(this);
      if ( evnt.keyCode == 13 ) {
        //Enter - same as a mouse click.
        parentView.commentClicked( t.closest('li') );
        return false;
      }
      var guid = t.closest('li').attr('data-guid');
      t.closest('.rubric-item')
        .find('.rubric-item-selected-comment').filter('[data-guid="' + guid + '"]')
        .text( t.val() );
      //If selected and MT, unselect with simulated mouse click.
      if ( ! t.val() 
           && t.closest('li').hasClass('selected')) {
        parentView.commentClicked( t.closest('li') );
      }
      //If there is no <li> after this one, add a new input field.
      if ( t.closest('li').next().length == 0 ) {
        //Add the <input> field and its selected counterpart.
        guid = app.makeGuid();
        //Selected - empty.
        templateVarValues = {
          selected: false,
          comment: '',
          guid: guid
        };
        t.closest('.rubric-item').find('.selected-comments').append(
          parentView.selectedCommentsTpl( templateVarValues )
        );
        //Input field.
        templateVarValues = {
          guid: guid
        };
        t.closest('ul').append(
            parentView.newCommentsTpl( templateVarValues )
        );
      }
    });    
  },
          
          
  //Template used to show selected levels.
  selectedLevelTpl: _.template($('#rubric_item_selected_level_template').html()),
  renderLevelsCollection : function() {
    //Render the levels collection.
    var levelCollection = this.model.getRubricItem().getRubricItemLevelCollection();
    //Are there any?
    if ( levelCollection && levelCollection.models && levelCollection.models.length > 0 ) {
      var resultLevelsAvailableHtml = '';
      var resultLevelsSelectedHtml = '';
      //Create "not selected" level.
      //Create a data model for it.
      var nothingSelectedLevelModel = new app.RubricItemLevelModel();
      //Set its attributes.
      nothingSelectedLevelModel.setLevelId( 0 );
      nothingSelectedLevelModel.setLevelName( app.NO_LEVEL_SELECTED );
      nothingSelectedLevelModel.setLevelOrder( -1 );
      //Create a view for it.
      var nothingSelectedLevelView = new app.RubricItemLevelView( 
        { model: nothingSelectedLevelModel } 
      );
      //Make a guid to link the available and selected versions.
      var guid = app.makeGuid();
      //Render available version, add to accumulating HTML.
      resultLevelsAvailableHtml += nothingSelectedLevelView.render(guid);
      //Render the selected version.
      var templateVarValues = {
        selected: true,
        level: app.NO_LEVEL_SELECTED,
        guid: guid
      };
      resultLevelsSelectedHtml += this.selectedLevelTpl( templateVarValues );
      //Loop across level models.
      var ths = this;
      _.each( levelCollection.models, function( item ) {
        //Make a view for the level.
        var levelView = new app.RubricItemLevelView( {model: item} );
        //Make a guid to link the available and selected versions.
        var guid = app.makeGuid();
        //Render it. 
        resultLevelsAvailableHtml += levelView.render(guid);
        //Render the selected version.
        templateVarValues = {
          selected: false,
          level: item.getLevelName(),
          guid: guid
        };
        resultLevelsSelectedHtml += ths.selectedLevelTpl( templateVarValues );
      });    
    };
    return { 
      available: resultLevelsAvailableHtml,
      selected: resultLevelsSelectedHtml
    };
  },
  //Template used to show selected comments.
  selectedCommentsTpl: _.template($('#rubric_item_selected_comment_template').html()),
  //Template for input field.
  newCommentsTpl: _.template($('#rubric_item_new_comment_template').html()),
  renderCommentsCollection : function() {
    //Render the comments collection.
    var commentCollection = this.model.getRubricItem().getRubricItemCommentCollection();
    //Are there any?
    if ( commentCollection && commentCollection.models && commentCollection.models.length > 0 ) {
      //Loop across comment models.
      var resultCommentsAvailableHtml = '';
      var resultCommentsSelectedHtml = '';
      //Render '(No comments)'
      var templateVarValues = {
          selected: true,
          comment: app.NO_COMMENT_SELECTED,
          guid: 'no comment'
        };
      resultCommentsSelectedHtml += this.selectedCommentsTpl( templateVarValues );
      var guid;
      var ths = this;
      _.each( commentCollection.models, function( item ) {
        //Make a view for the comment.
        var commentView = new app.RubricItemCommentView( {model: item} );
        //Make a guid to link the available and selected versions.
        guid = app.makeGuid();
        //Render it. 
        resultCommentsAvailableHtml += commentView.render(guid);
        //Render the selected version.
        templateVarValues = {
          selected: false,
          comment: item.getComment(),
          guid: guid
        };
        resultCommentsSelectedHtml += ths.selectedCommentsTpl( templateVarValues );
      });
      //Add the <input> field and its selected counterpart.
      guid = app.makeGuid();
      //Selected - empty.
      templateVarValues = {
        selected: false,
        comment: '',
        guid: guid
      };
      resultCommentsSelectedHtml += this.selectedCommentsTpl( templateVarValues );
      //Input field.
      templateVarValues = {
        guid: guid
      };
      resultCommentsAvailableHtml += this.newCommentsTpl( templateVarValues );
      return { 
        available: resultCommentsAvailableHtml,
        selected: resultCommentsSelectedHtml
      };
    };
    //Add field for adding new comments.
    guid = app.makeGuid();
    this.resultCommentsAvailableHtml += this.newCommentsTpl( {guid: guid} );
  },
  click: function(evnt) {
    //This item was clicked in somewhere.
    //What item was clicked on?
    var target = $(evnt.target);
    if ( target.hasClass( 'rubric-item-name' ) ) {
      //Name of the rubric item was clicked on.
      this.rubricNameClicked(target);
    }
    else if ( target.hasClass( 'rubric-item-available-level' ) ) {
      //An available level was clicked on.
      this.levelClicked(target);
    }
    else if ( target.hasClass( 'rubric-item-available-comment' ) ) {
      //An available comment was clicked on.
      this.commentClicked(target);
    }
    else if ( target.hasClass( 'selected-level' )
              ||  target.hasClass( 'levels-label' ) 
              ||  target.hasClass( 'rubric-item-selected-level' ) ) {
      //The selected level or the Assess label was clicked on.
      this.selectedLevelClicked(target);
    }
    else if ( target.hasClass( 'rubric-item-selected-comment' )
             || target.hasClass( 'selected-comments' ) 
           ) {
      //A selected comment was clicked on.
      this.selectedCommentClicked(target);
    }
    else if ( target.hasClass( 'comments-label' ) 
             || target.hasClass( 'comments-display-state' ) ) {
       this.commentsLabelClicked(target);
    }
  },
  rubricNameClicked: function(itemNameDomElement) {
    var rubricItem = this.model.getRubricItem();
    alert(
      rubricItem.getRubricItemName() + '\n\n' +
      rubricItem.getRubricItemDescription()
    );
  },
  levelClicked: function(clickedLevelDomElement) {
    //Save new selected level to the rubric item model.
    var levelId = $(clickedLevelDomElement).attr('data-level-id');
    this.model.setLevel( levelId );
    //Clear the display of the old selected level.
    var levelListDom = $(clickedLevelDomElement).closest('.rubric-item-level-collection');
    $(levelListDom).find('.selected').removeClass('selected').addClass('not-selected');
    //Add the display class of the new selected level.
    $(clickedLevelDomElement).removeClass('not-selected').addClass('selected');
    //Collapse the level list.
    levelListDom.hide('fast');
    //Display the name of the new selected level.
    var guid = $(clickedLevelDomElement).attr('data-guid');
    var itemDom = $(clickedLevelDomElement).closest('.rubric-item');
    itemDom.find('.selected-level .selected').removeClass('selected').addClass('not-selected');
    itemDom.find('.selected-level').find('[data-guid="' + guid + '"]')
            .removeClass('not-selected').addClass('selected');
    //Change the triangle.
    itemDom.find('.levels-display-state').html('&blacktriangle;');
    //Is this the highest level? If so, collapse the comment list.
    if ( $(clickedLevelDomElement).closest('li').next().length == 0 ) {
      itemDom.find('.rubric-item-comment-collection').hide('fast');
    }
  },
  commentClicked: function(clickedCommentDomElement) {
    //If this is an MT input box that is not selected, do nothing.
    if ( $(clickedCommentDomElement).hasClass('new-comment') 
         && $(clickedCommentDomElement).hasClass('not-selected')  ) {
      var inputBoxContent = $(clickedCommentDomElement).find('input').val();
      if ( ! inputBoxContent ) {
        return;
      }
    }
    //var commentHtml = $(clickedCommentDomElement).html();
    var rubricItemDomElement = $(clickedCommentDomElement).closest('.rubric-item');
    if ( ! $(clickedCommentDomElement).hasClass('selected') ) {
//      //Save new selected comment to the rubric item model.
//      var rubricItemCommentToStudentModel = new app.RubricItemCommentToStudentModel();
//      rubricItemCommentToStudentModel.setComment( commentHtml );
//      rubricItemCommentToStudentModel.setOrder( this.model.getCommentCollection().length );
//      this.model.getCommentCollection().add( rubricItemCommentToStudentModel );
      $(clickedCommentDomElement).removeClass('not-selected').addClass( 'selected' );
      //Find its partner element in the selected list, and show it.
      var availableGuid = $(clickedCommentDomElement).attr('data-guid');
      $(rubricItemDomElement)
        .find('.selected-comments [data-guid="' + availableGuid + '"]')
        .removeClass('not-selected').addClass( 'selected' );
//        .show('fast');
      //Hide the (No comments) element.
      $(rubricItemDomElement)
        .find('.selected-comments [data-guid="no comment"]')
        .removeClass('selected').addClass( 'not-selected' );
//        .hide('fast');
    }//End is not selected.
    else {
      //The comment was already selected. Unselect it.
      //Remove selected class.
      $(clickedCommentDomElement).removeClass( 'selected' ).addClass( 'not-selected' );
//      //Remove from selected collection (of models).
//      var ths = this;
//      _.each( ths.model.getCommentCollection().models, function (commentItem) {
//        if ( commentItem.getComment() == commentHtml ) {
//          ths.model.getCommentCollection().remove( commentItem );
//        }
//      });
      //Find its partner element in the selected list.
      var availableGuid = $(clickedCommentDomElement).attr('data-guid');
      $(rubricItemDomElement)
        .find('.selected-comments [data-guid="' + availableGuid + '"]')
        .removeClass('selected').addClass( 'not-selected' );
//        .hide('fast');
      //Show the (No comments) element?
      //Count the selected elements.
      var selectedElementCount = $(rubricItemDomElement)
          .find('.rubric-item-comment-collection .selected').length;
      if ( selectedElementCount == 0 ) {
        $(rubricItemDomElement)
          .find('.selected-comments [data-guid="no comment"]')
          .show('fast');
      }
    }
//    //Redo the list of selected comments.
//    var selectedCommentsHtml = '';
//    if ( this.model.getCommentCollection().length == 0 ) {
//      selectedCommentsHtml = app.NO_COMMENT_SELECTED;
//    }
//    else {
//      _.each( this.model.getCommentCollection().models, function( selectedComment ) {
//        if ( selectedCommentsHtml != '' ) {
//          selectedCommentsHtml += '<br>';
//        }
//        selectedCommentsHtml += selectedComment.getComment();
//      });
//    }
//    $(rubricItemDomElement).find('.selected-comments').html( selectedCommentsHtml );
  },
  selectedLevelClicked: function(target) {
    //Find the rubric item's level list.
    var rubricItemDomElement = $(target).closest('.rubric-item');
    var levelListDomElement = $(rubricItemDomElement).find('ul.rubric-item-level-collection');
    //What is the current state of the list?
    if ( $(levelListDomElement).is(":visible") ) {
      //Collapse
      levelListDomElement.hide('fast');
      //Set the arrow.
      $(rubricItemDomElement).find('.levels-display-state').html('&blacktriangle;');
    }
    else {
      //Expand.
      levelListDomElement.show('fast');
      //Set the arrow.
      $(rubricItemDomElement).find('.levels-display-state').html('&blacktriangledown;');
    }
  },
  selectedCommentClicked : function(clickedCommentDomElement) {
    //If this is (No comments), act like the "Comments v" thing was clicked.
    if ( $(clickedCommentDomElement).text().trim() == app.NO_COMMENT_SELECTED ) {
      this.commentsLabelClicked(clickedCommentDomElement);
      return false;
    }
    //Clicked a currently selected comment. Unselect it.
    //Hide it.
    $(clickedCommentDomElement).removeClass('selected').addClass( 'not-selected' );
//        .show('fast');
    //Unselect its partner in the available list.
    var selectedGuid = $(clickedCommentDomElement).attr('data-guid');
    var rubricItemDomElement = $(clickedCommentDomElement).closest('.rubric-item');
    $(rubricItemDomElement)
      .find('.rubric-item-comment-collection [data-guid="' + selectedGuid + '"]')
      .removeClass( 'selected' ).addClass( 'not-selected' );
    //Show the (No comments) element?
    //Count the selected elements.
    var selectedElementCount = $(rubricItemDomElement)
        .find('.rubric-item-comment-collection .selected').length;
    if ( selectedElementCount == 0 ) {
      $(rubricItemDomElement)
        .find('.selected-comments [data-guid="no comment"]')
        .removeClass('not-selected').addClass( 'selected' );
//        .show('fast');
    }
  },
  commentsLabelClicked: function(target) {
    //Clicked the "Comments v" element.
    //Find the rubric item's comment list.
    var rubricItemDomElement = $(target).closest('.rubric-item');
    var commentListDomElement = $(rubricItemDomElement).find('ul.rubric-item-comment-collection');
    //What is the current state of the list?
    if ( $(commentListDomElement).is(":visible") ) {
      //Collapse
      commentListDomElement.hide('fast');
      //Set the arrow.
      $(rubricItemDomElement).find('.comments-display-state').html('&blacktriangle;');
    }
    else {
      //Expand.
      commentListDomElement.show('fast');
      //Set the arrow.
      $(rubricItemDomElement).find('.comments-display-state').html('&blacktriangledown;');
    }
  }
});