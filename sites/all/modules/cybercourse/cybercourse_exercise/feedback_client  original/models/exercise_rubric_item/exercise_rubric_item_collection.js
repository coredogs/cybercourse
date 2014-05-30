/*
 * Collection of links betwixt exercises and rubric items. 
 */

var app = app || {};

app.ExerciseRubricItemCollection = Backbone.Collection.extend({
  model: app.ExerciseRubricItemModel,
  initialize: function() {
    //KRM debug
    this.krmType = 'ExerciseRubricItemCollection';
  },
  comparator: function( exerciseRubricItemModel ) {
    return exerciseRubricItemModel.getRubricItemOrder();
  }
});
