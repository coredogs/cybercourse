/* 
 * Model for assessments of a solution on a rubric item.
 */
var app = app || {};

app.SolutionRubricItemAssessmentModel = Backbone.Model.extend({
  defaults: {
    //Rubric item this is for.
    rubricItem: 0,
    //Rubric item level chosen by grader.
    level: 0,
    //Collection of comments for the rubric items assessment.
    commentCollection: '',
    //KRM for debugging.
    krmType: 'SolutionRubricItemAssessmentModel'
  },

  //Getters and setters for each atttribute.
  setRubricItem: function(newRubricItem) {
    this.set( {rubricItem: newRubricItem} );
  },
  getRubricItem: function() {
    return this.get('rubricItem');
  },
          
  setLevel: function(newLevel) {
    this.set( {level: newLevel} );
  },
  getLevel: function() {
    return this.get('level');
  },
          
  setCommentCollection: function(newCollection) {
    this.set( {commentCollection: newCollection} );
  },
  getCommentCollection: function() {
    return this.get('commentCollection');
  }

});