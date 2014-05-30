/* 
 * Model for an assessment comment on a solution for a rubric item.
 */
var app = app || {};

app.RubricItemCommentToStudentModel = Backbone.Model.extend({
  defaults: {
    //The comment text.
    comment: '',
    //Display order.
    order: 0,
    //KRM for debugging.
    krmType: 'RubricItemCommentToStudentModel'
  },

  //Getters and setters for each atttribute.
          
  setComment: function(newComment) {
    this.set( {comment: newComment} );
  },
  getComment: function() {
    return this.get('comment');
  },

  setOrder: function(newOrder) {
    this.set( {order: newOrder} );
  },
  getOrder: function() {
    return this.get('order');
  }

});