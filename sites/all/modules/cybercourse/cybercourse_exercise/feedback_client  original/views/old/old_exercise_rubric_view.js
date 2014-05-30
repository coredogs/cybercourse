var app = app || {};

app.ExerciseRubricView = Backbone.View.extend({
  el: '#rubric-pane .pane-content',
  exerciseRubricTpl: _.template($('#exercise_rubric_template').html()),
  initialize: function() {
    this.viewId = app.keepView(this);
    //KRM debug
    this.krmType = 'ExerciseRubricView';
  },
  render: function () {
    //Render the rubric items.
    //Get the collection of exer-on-rubric-item-assess objects
    var exrcsRbrcItmAssmntCllctn = this.model.getExrcsToRbrcItmLnkCllctn();
    //Are there any?
    if ( exrcsRbrcItmAssmntCllctn && exrcsRbrcItmAssmntCllctn.models && exrcsRbrcItmAssmntCllctn.models.length > 0 ) {
      var html = '';
      //Loop over models
      _.each( exrcsRbrcItmAssmntCllctn.models, function( exrcsRbrcItmLnkModel ) {
        var exrcsRbrcItmAssmntView = new app.ExrcsRbrcItmAssmntView();
        exrcsRbrcItmAssmntView.model = exrcsRbrcItmLnkModel;
        exrcsRbrcItmAssmntView.render();
        html += exrcsRbrcItmAssmntView.$el.html();
      }, this ); //<<<
      //Set up object with template values.
      var templateVarValues = {
        viewId: this.viewId,
        rubric: html
      };
      //Instantiate template
      var templateInstantiated = this.exerciseRubricTpl( templateVarValues );
      
      this.$el.html( templateInstantiated );
    } //End there are levels in the rubric item.
  }
});