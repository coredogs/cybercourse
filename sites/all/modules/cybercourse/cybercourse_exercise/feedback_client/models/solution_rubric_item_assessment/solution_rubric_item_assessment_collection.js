/*
 * Collection of assessments of a solution on rubric items. 
 */

var app = app || {};

app.SolutionRubricItemAssessmentCollection = Backbone.Collection.extend({
  model: app.SolutionRubricItemAssessmentModel,
  initialize: function() {
    //KRM debug
    this.krmType = 'SolutionRubricItemAssessmentCollection';
  }
});