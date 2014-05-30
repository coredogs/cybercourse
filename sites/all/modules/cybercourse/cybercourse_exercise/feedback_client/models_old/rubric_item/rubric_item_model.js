/*
 * One rubric item. 
 */
var app = app || {};
app.RubricItemModel = Backbone.Model.extend({
  defaults: {
    id: 0,
    itemName: '',
    itemDescription: '',
    levelCollection: null,
    commentCollection: null,
    //KRM debug
    krmType: 'RubricItemModel'
  },
 
  setRubricItemId: function(newItemId) {
    this.set( {id: newItemId} );
  },
  getRubricItemId: function() {
    return this.get('id');
  },
 
  setRubricItemName: function(newItemName) {
    this.set( {itemName: newItemName} );
  },
  getRubricItemName: function() {
    return this.get('itemName');
  },
          
  setRubricItemDescription: function(newItemDescription) {
    this.set( {itemDescription: newItemDescription} );
  },
  getRubricItemDescription: function() {
    return this.get('itemDescription');
  },
          
  setRubricItemLevelCollection: function(newLevelCollection) {
    this.set( {levelCollection: newLevelCollection} );
  },
  getRubricItemLevelCollection: function() {
    return this.get('levelCollection');
  },

  setRubricItemCommentCollection: function(newCollection) {
    this.set( {commentCollection: newCollection} );
  },
  getRubricItemCommentCollection: function() {
    return this.get('commentCollection');
  }
});