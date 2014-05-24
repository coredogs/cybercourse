/* 
 * Model for one exercise.
 */
var app = app || {};

app.SolutionRubricAssessmentView = Backbone.View.extend({
  initialize: function() {
    this.viewId = app.keepView(this);
    //KRM debug
    this.krmType = 'SolutionRubricAssessmentView';
    t = this;
    $(window).resize(function() {
      t.sizePanes();
    });
  },
  //An array of rubric item views.
  solutionRubricItemAssessmentViewList: '',
  render: function(outputAreaSelector) {
    this.el = outputAreaSelector + ' #rubric-pane .pane-content';
    this.layoutPanes(outputAreaSelector);
    this.sizePanes();
    var exerciseModel = this.model.getExerciseModel();
    $(outputAreaSelector + ' #exercise-pane .pane-content').html(exerciseModel.getExerciseInstructions());
    $(outputAreaSelector + ' #submission-pane .pane-content').html(this.model.getSubmittedSolution());
    //Render the rubric item assessments.
    var rubricHtml = '';
    this.solutionRubricItemAssessmentViewList = new Array();
    var t = this;
    var solutionRubricItemAssessmentCollection = this.model.getSolutionRubricItemAssessmentCollection();
    _.each ( solutionRubricItemAssessmentCollection.models, function ( rubricItemAssessmentModel ) {
      var solutionRubricItemAssessmentView = new app.SolutionRubricItemAssessmentView();
      solutionRubricItemAssessmentView.model = rubricItemAssessmentModel;
      solutionRubricItemAssessmentView.render();
      rubricHtml += solutionRubricItemAssessmentView.$el.html();
      t.solutionRubricItemAssessmentViewList.push(solutionRubricItemAssessmentView);
    });
    this.$el.html( rubricHtml );
  },
  //Create panes.
  layoutPanes: function(outputAreaSelector) {
    this.outerLayout = $(outputAreaSelector).layout(
            { 
      west__children: {
        inset: {
          top:	0
        ,	bottom:	0
        ,	left:	0
        ,	right:	0
        }
      },
      center__children: {
        inset: {
          top:	0
        ,	bottom:	0
        ,	left:	0
        ,	right:	0
        }
      }
    }
            );
    this.westLayout = $(outputAreaSelector + ' > .ui-layout-west').layout({
//      applyDemoStyles: true
    });
    this.centerLayout = $(outputAreaSelector + ' > .ui-layout-center').layout({
//      applyDemoStyles: true
    });
  },
  /*
  * Size the panes using fractions.
   */
  sizePanes: function() {
    this.outerLayout.sizePane( 'north', 0.1);
    this.outerLayout.sizePane( 'west', 0.3);
    this.outerLayout.sizePane( 'east', 0.3);

    this.westLayout.sizePane( 'south', 0.5 );

    this.centerLayout.sizePane( 'south', 0.5);

//    this.westLayout.sizePane( 'west', 0.3 );
  },
  click: function(evnt) {
    //Gets all click events in the rubric pane.
    //Route event to the item that can handle it.
    //Was the click on the Generate Feedback button?
    if ( $(evnt.target).hasClass('generate-feedback-button') ) {
      this.generateFeedback();
      return false;
    }
    //Was the click within an item?
    var itemDom = $(evnt.target).closest('.rubric-item');
    if ( itemDom.length > 0 ) {
      //Find the associated view.
      var itemViewId = itemDom.attr('data-view-id');
      var itemView = app.viewsRefs[itemViewId];
      //Send it the event.
      itemView.click(evnt);
    }
  },
  generateFeedback: function() {
    var score = this.computeScore();
    var scoreCategory;
    if ( score == 6 ) {
      scoreCategory = 2;
    }
    else if ( score >= 3 ) {
      scoreCategory = 1;
    }
    else {
      scoreCategory = 0;
    }
    var feedback = this.computeFeedbackMessage(scoreCategory);
    app.editor.setData( feedback );
  },
  computeScore: function() {
    var totalScore = 0;
    var solutionRubricItemAssessmentCollection = this.model.getSolutionRubricItemAssessmentCollection();
    var selectedLevelId;
    var rubricItem;
    var selectedLevel;
    var itemScore;
    _.each ( solutionRubricItemAssessmentCollection.models, function ( rubricItemAssessmentModel ) {
      selectedLevelId = rubricItemAssessmentModel.getLevel();
      //Was anything selected?
      if ( selectedLevelId ) {
        rubricItem = rubricItemAssessmentModel.getRubricItem();
        selectedLevel = rubricItem.getRubricItemLevelCollection().get( selectedLevelId );
        totalScore += selectedLevel.getLevelScore();
      }
    } );
    return totalScore;
  },
  computeFeedbackMessage: function(scoreCategory) {
    var feedback = "";
    //Build up the list of selected level names and comments.
    var itemHtml = "";
    var levelText = "";
    var itemListHtml = "<ul>";
    var comment = "";
    var item;
    //Loop across all items.
    $(".rubric-item").each(function(index, item){
      itemHtml = "";
      levelText = $(item).find(".selected-level .selected").text().trim();
      if ( levelText != app.NO_LEVEL_SELECTED ) {
        itemHtml += levelText;
      }
      $(item).find(".selected-comments .selected").each(function(index, commentDom){
        comment = $(commentDom).text().trim();
        if ( comment != app.NO_COMMENT_SELECTED ) {
          itemHtml += " " + comment;
        }
      });
      if ( itemHtml ) {
        itemListHtml += "<li>" + itemHtml + "</li>";
      }
    });
    itemListHtml += "</ul>";
    feedback += '<p>' + app.getRandomMessage(greetings) + '</p>'
        + '<p>' + app.getRandomMessage(intro) + ' ' 
                + app.getRandomMessage( textEval[scoreCategory] ) + '</p>'
        + itemListHtml
        + '<p>' + app.getRandomMessage( sig ) + '</p>';
    return feedback;
}});
