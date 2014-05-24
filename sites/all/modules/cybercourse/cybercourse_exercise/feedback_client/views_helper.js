var app = app || {};
// Global array of references to views.
app.viewsRefs = new Array();
//Global counter.
app.viewCounter = 0;
//Add a view to the array.
app.keepView = function(view) {
  app.viewCounter++;
  app.viewsRefs[app.viewCounter] = view;
  return app.viewCounter;
};
