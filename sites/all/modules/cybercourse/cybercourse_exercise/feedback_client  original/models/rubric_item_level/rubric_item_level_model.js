/* 
 * Model for one level of a rubric item.
 * They are gathered together into a collection for a rubric item.
 * 
 */
var app = app || {};

app.RubricItemLevelModel = Backbone.Model.extend({
  defaults: {
    //Level id.
    id: 0,
    //Level name & text to show student.
    levelName: '',
    //Order to list.
    levelOrder: 0,
    score: 0,
    krmType: 'RubricItemLevelModel'
  },

  setLevelId: function(newId) {
    this.set( {id: newId} );
  },
  getLevelId: function() {
    return this.get('id');
  },
          
  setLevelName: function(newLevelName) {
    this.set( {levelName: newLevelName} );
    //console.log('Title: ' + newTitle);
  },
  getLevelName: function() {
    return this.get('levelName');
  },
          
  setLevelScore: function(newLevelScore) {
    this.set( {levelScore: newLevelScore} );
    //console.log('Title: ' + newTitle);
  },
  getLevelScore: function() {
    return this.get('levelScore');
  },

  setLevelOrder: function(newLevelOrder) {
    this.set( {levelOrder: newLevelOrder} );
    //console.log('Title: ' + newTitle);
  },
  getLevelOrder: function() {
    return this.get('levelOrder');
  }
});