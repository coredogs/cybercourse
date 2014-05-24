/* 
 * Assessment of a student's solution for an exercise.
 * 
 */
var app = app || {};

app.ExerciseSolutionAssessmentModel = Backbone.Model.extend({
  defaults: {
    //Rubric item.
    rubricItem: '',
    //What the grader selected.
    selectedLevelId: 0,
    //Grader's comments.
    comments: new Array(0),
    krmType: 'ExrcsRbrcItmAssmntModel'
  },

  setRubricItem: function(newItem) {
    this.set( {rubricItem: newItem} );
  },
  getRubricItem: function() {
    return this.get('rubricItem');
  },
          
  setSelectedLevelId: function(newId){
    this.set( {selectedLevelId: newId} );
  },
  getSelectedLevelId: function() {
    return this.get('selectedLevelId');
  },

  //The entire comment array at once.
  setComments: function(newComments) {
    this.set( {comments: newComments} );
  },
  //Add a single grader comment.
  addComment: function(comment) {
    this.comments.push(comment);
  },
  //Remove a single grader comment.
  removeComment: function(comment) {
    this.comments.pop(comment);
  },
  getComments: function() {
    return this.get('comments');
  }
});