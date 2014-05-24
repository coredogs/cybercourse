var app = app || {};

app.RubricItemLevelView = Backbone.View.extend({
  tagName: 'li',
  availableLevelTpl: _.template($('#rubric_item_available_level_template').html()),
  initialize: function() {
    this.viewId = app.keepView(this);
    //KRM debug
    this.krmType = 'RubricItemLevelView';
  },
  render: function (guid) {
    var templateVarValues = {
      viewId: this.viewId,
      levelName: this.model.getLevelName(),
      levelId: this.model.getLevelId(),
      guid: guid
    };
    var templateInstantiated = this.availableLevelTpl( templateVarValues );
    this.$el.html( templateInstantiated );
    return this.$el.html();
  }
/*
  clickEvent: function(evnt) {
    //User clicked on a level.
    //Tell the rubric item view about it.
    var rubricItemDOM = $(event.target).closest('.rubric-item');
    var rubricItemViewId = $(rubricItemDOM).attr('data-view-id');
    var rubricItemView = app.viewsRefs[rubricItemViewId];
    //Tell the view that a level was clicked.
    rubricItemView.levelClicked(evnt.target);
  }
*/
});