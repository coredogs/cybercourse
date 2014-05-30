/*
 * Collection of assessment comments on a solution for a rubric item.
 */

var app = app || {};

app.RubricItemCommentToStudentCollection = Backbone.Collection.extend({
  model: app.RubricItemCommentToStudentModel,
  initialize: function() {
    //KRM debug
    this.krmType = 'RubricItemCommentToStudentCollection';
  },
  //Sorting.
  comparator: function( commentModel ) {
    return commentModel.getOrder();
  }
});