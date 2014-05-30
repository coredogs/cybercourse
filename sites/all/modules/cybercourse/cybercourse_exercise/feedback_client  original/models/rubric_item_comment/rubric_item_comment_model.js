/* 
 * Model for one comment on a rubric item.
 * They are gathered together into a collection for a rubric item.
 * 
 */
var app = app || {};

app.RubricItemCommentModel = Backbone.Model.extend({
  defaults: {
    //Comment id.
    id: 0,
    //Comment text.
    comment: '',
    //Order to list.
    commentOrder: 0,
    krmType: 'RubricItemCommentModel'
  },

  setCommentId: function(newId) {
    this.set( {id: newId} );
  },
  getCommentId: function() {
    return this.get('id');
  },
          
  setComment: function(newComment) {
    this.set( {comment: newComment} );
  },
  getComment: function() {
    return this.get('comment');
  },
          
  setCommentOrder: function(newCommentOrder) {
    this.set( {commentOrder: newCommentOrder} );
  },
  getCommentOrder: function() {
    return this.get('commentOrder');
  }
});