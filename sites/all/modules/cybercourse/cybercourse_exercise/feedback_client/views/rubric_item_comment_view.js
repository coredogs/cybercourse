var app = app || {};

app.RubricItemCommentView = Backbone.View.extend({
  tagName: 'li',
  commentTpl: _.template($('#rubric_item_available_comment_template').html()),
  initialize: function() {
    //Register the view.
    this.viewId = app.keepView(this);
    //KRM debug
    this.krmType = 'RubricItemCommentView';
  },
  render: function (guid) {
    //Called with array of selected comments.
    var templateVarValues = {
      viewId: this.viewId,
      comment: this.model.getComment(),
      commentId: this.model.getCommentId(),
      guid: guid
    };
    var templateInstantiated = this.commentTpl( templateVarValues );
    this.$el.html( templateInstantiated );
    return this.$el.html();
  }
/*
  clickEvent: function(evnt) {
    //User clicked on a comment.
    //Tell the rubric item view about it.
    var rubricItemDOM = $(event.target).closest('.rubric-item');
    var rubricItemViewId = $(rubricItemDOM).attr('data-view-id');
    var rubricItemView = app.viewsRefs[rubricItemViewId];
    //Tell the view that a comment was clicked.
    rubricItemView.commentClicked(evnt.target);
  }
*/
});