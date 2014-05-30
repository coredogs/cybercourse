/**
 * View/controller for the pane that shows the rubric items.
 */

var app = app || {};

/**
 * Initialize the rubric pane for a given exercise.
 * @param {int} exerciseNid The exercise.
 */
app.initRubricPane = function( exerciseNid ) {
  var submissionNid = app.currentState.submissionNid;
  //Get the exercise's rubric list.
  var rubricNids = app.allExercises[ exerciseNid ].rubricItems;
  //Get the current selections, if they exist.
  //This would happen when grader is looking back at a graded submission.
  var currentRubricSelections = app.submissionsToGrade[ submissionNid ].rubricItemSelections;
//  var currentRubricSelections = null;
//  if ( app.submissionsToGrade[ submissionNid ].rubricItemSelections ) {
//    currentRubricSelections 
//      = app.submissionsToGrade[ submissionNid ].rubricItemSelections;
//  }
  //Clear existing content.
  $("#rubric-pane .pane-content").children().remove();
  //Render each rubric item.
  for( var key in rubricNids ) {
    var rubricNid = rubricNids[ key ];
    var currentRubricSelection = null;
    if ( currentRubricSelections[ rubricNid ] ) {
      currentRubricSelection = currentRubricSelections[ rubricNid ];
    }
    app.renderRubricItem( rubricNid, currentRubricSelection );
  }
  //Set up events.
  
  
};

/**
 * Render a rubric item.
 * @param {int} rubricNid Rubric to render.
 * @param {type} currentSelections Current selections, if any.
 */
app.renderRubricItem = function( rubricNid, currentSelections ) {
  var rubricItem = app.allRubricItems[ rubricNid ];
  //Convert data format into that used by the tempate.
  var templateData = { title: rubricItem.title };
  templateData.commentsGroups = new Array();
  //Good comments.
  var commentsGroup = app.formatCommentsGroup( "Good", rubricItem.good );
  templateData.commentsGroups.push( commentsGroup );
  //Needs work comments.
  commentsGroup = app.formatCommentsGroup( "Needs work", rubricItem.needsWork );
  templateData.commentsGroups.push( commentsGroup );
  //Poor comments.
  commentsGroup = app.formatCommentsGroup( "Poor", rubricItem.poor );
  templateData.commentsGroups.push( commentsGroup );
  //Render the template.
  var result = app.compiledTemplates.rubricItemTemplate(templateData);
  $("#rubric-pane .pane-content").append( result );
}

/**
 * Format data from good/needs work/poor comments into template format.
 * @param {string} groupName The name of the group, e.g., good.
 * @param {Array} commentsList Comments in the group.
 * @returns {object} Data in template format.
 */
app.formatCommentsGroup = function( groupName, commentsList ) {
  var commentsGroup = { set: groupName };
  commentsGroup.comments = new Array();
  for( var index in commentsList ) {
    var comment = commentsList[ index ];
    commentsGroup.comments.push( { "comment": comment } );
  }
  return commentsGroup;
}

