/* 
 * Model for one exercise solution.
 */
var app = app || {};

app.ExerciseSolutionModel = Backbone.Model.extend({
  defaults: {
    //Exercise solution id.
    id: 0,
    student: '',
    //The exercise solution from the student.
    submittedSolution: '',
    //Exercise
    exerciseModel: '',
    //Collection of assessments on rubric items.
    solutionRubricItemAssessmentCollection: '',
    //Feedback - complete feedback give to student.
    feedback: '',
    //KRM for debugging.
    krmType: 'ExerciseSolutionModel'
  },

  //Getters and setters for each atttribute.
  setExerciseSolutionId: function(newId) {
    this.set( {id: newId} );
  },
  getExerciseSolutionId: function() {
    return this.get('id');
  },
          
  setStudent: function(newStudent) {
    this.set( {student: newStudent} );
  },
  getStudent: function() {
    return this.get('student');
  },
          
  setSubmittedSolution: function(newSubmittedSolution) {
    this.set( {submittedSolution: newSubmittedSolution} );
  },
  getSubmittedSolution: function() {
    return this.get('submittedSolution');
  },
          
  setExerciseModel: function(newExerciseModel) {
    this.set( {exerciseModel: newExerciseModel} );
  },
  getExerciseModel: function() {
    return this.get('exerciseModel');
  },
          
  setSolutionRubricItemAssessmentCollection: function(newCollection) {
    this.set( {solutionRubricItemAssessmentCollection: newCollection} );
  },
  getSolutionRubricItemAssessmentCollection: function() {
    return this.get('solutionRubricItemAssessmentCollection');
  },
          
  setFeedback: function(newFeedback) {
    this.set( {feedback: newFeedback} );
  },
  getFeedback: function() {
    return this.get('feedback');
  }

});