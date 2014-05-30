/*
 * Collection of rubric item levels. 
 * Each rubric item has one collection.
 */

var app = app || {};

app.RubricItemLevelCollection = Backbone.Collection.extend({
  model: app.RubricItemLevelModel,
  initialize: function() {
    //KRM debug
    this.krmType = 'RubricItemLevelCollection';
  },
  //Sorting.
  comparator: function( levelModel ) {
    return levelModel.getLevelOrder();
  }
});