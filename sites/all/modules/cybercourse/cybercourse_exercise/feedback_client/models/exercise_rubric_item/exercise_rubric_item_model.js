/* 
 * Indicates a rubric item applying to an exercise.
 */
var app = app || {};

app.ExerciseRubricItemModel = Backbone.Model.extend({
  defaults: {
    //The item.
    rubricItem: '',
    //Display order.
    rubricItemOrder: 0,
    //KRM for debugging.
    krmType: 'ExerciseRubricItemModel'
  },

  //Getters and setters for each atttribute.
          
  setRubricItem: function(newRubricItem) {
    this.set( {rubricitem: newRubricItem} );
  },
  getRubricItem: function() {
    return this.get('rubricitem');
  },

  setRubricItemOrder: function(newRubricItemOrder) {
    this.set( {rubricItemOrder: newRubricItemOrder} );
  },
  getRubricItemOrder: function() {
    return this.get('rubricItemOrder');
  }
});