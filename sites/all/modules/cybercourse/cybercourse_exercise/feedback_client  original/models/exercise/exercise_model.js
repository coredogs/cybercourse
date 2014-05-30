/* 
 * Model for one exercise.
 */
var app = app || {};

app.ExerciseModel = Backbone.Model.extend({
  defaults: {
    //Exercise id.
    id: 0,
    //Name.
    exerciseName: '',
    //The exercise instructions.
    exerciseInstructions: '',
    //Collection of links to rubric items.
    exerciseRubricItemCollection: '',
    //KRM for debugging.
    krmType: 'ExerciseModel'
  },

  setExerciseId: function(newId) {
    this.set( {id: newId} );
  },
  getExerciseId: function() {
    return this.get('id');
  },
          
  setExerciseName: function(newExerciseName) {
    this.set( {exerciseName: newExerciseName} );
  },
  getExerciseName: function() {
    return this.get('exerciseName');
  },
          
  setExerciseInstructions: function(newExerciseInstructions) {
    this.set( {exerciseInstructions: newExerciseInstructions} );
  },
  getExerciseInstructions: function() {
    return this.get('exerciseInstructions');
  },
          
  setExerciseRubricItemCollection: function(newExerciseRubricItemCollection) {
    this.set( {exerciseRubricItemCollection: newExerciseRubricItemCollection} );
  },
  getExerciseRubricItemCollection: function() {
    return this.get('exerciseRubricCollection');
  }
});