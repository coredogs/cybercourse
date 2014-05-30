/*
 * Collection of rubric item comments. 
 * Each rubric item has one collection.
 */

var app = app || {};

app.RubricItemCommentCollection = Backbone.Collection.extend({
  model: app.RubricItemCommentModel,
  initialize: function() {
    //KRM debug
    this.krmType = 'RubricItemCommentCollection';
  },
  //Sorting.
  comparator: function( commentModel ) {
    return -commentModel.getCommentOrder();
  }
});