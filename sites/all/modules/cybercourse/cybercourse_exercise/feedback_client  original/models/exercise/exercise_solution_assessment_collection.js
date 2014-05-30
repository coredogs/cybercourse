/*
 * Collection of links betwixt exercises and rubric items. 
 */

var app = app || {};

app.ExrcsRbrcItmAssmntCllctn = Backbone.Collection.extend({
  model: app.ExrcsRbrcItmAssmntModel,
  initialize: function() {
    //KRM debug
    this.krmType = 'ExrcsRbrcItmAssmntCllctn';
  }
});