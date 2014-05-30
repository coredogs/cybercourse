var app = app || {};

/**
 * Current state of the UI. 
 * Which submission is being worked on, which exercise, etc.
 */
app.currentState = {
  submissionNid: null,
  exerciseNid: null
};

/**
 * Handlebars templates, compiled during UI init..
 */
app.compiledTemplates = {
  submissionListTemplate: null,
  rubricItemTemplate: null,
};


app.start = function() {
  
  app.basePath = window.opener.Drupal.settings.basePath;
  
  //Show the Please wait thing.
  $("#global-wait-message").show();
  $.when(
    app.getCsrfToken()
  )
  .then(function() {
    $.when( 
      app.getSubmissionsFromServer()
    )
    .then(function() {
      app.initUi();
      //Hide the Please wait thing.
      $("#global-wait-message").hide();
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      Drupal.behaviors.cybercourseErrorHandler.reportError(
        "Fail in call to app.getSubmissionsFromServer in app.start. " 
          + "textStatus: " + textStatus + ", errorThrown: " + errorThrown
      );
    });
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    Drupal.behaviors.cybercourseErrorHandler.reportError(
      "Fail in call to app.getCsrfToken in app.start. " 
        + "textStatus: " + textStatus + ", errorThrown: " + errorThrown
    );
  });
};

app.initUi = function() {
  //Compile Handlbars templates.
  app.compileTemplates();
  //Where all the output goes.
  app.outputAreaSelector = "body";
  //Init submission list, display and events.
  app.initSubmissionList();
  app.layoutPanes();
  //Define behavior for clicking on file attachment links.
  app.setupAttachmentLinks();
  //Fix pane headers in place.
  app.fixHeaders();
};

/**
 * Layout all the panes, inner and outer.
 */
app.layoutPanes = function() {
    app.outerLayout = $(app.outputAreaSelector).layout(
      { 
        west__children: {
          inset: {
            top:	0
          ,	bottom:	0
          ,	left:	0
          ,	right:	0
          }
        },
        center__children: {
          inset: {
            top:	0
          ,	bottom:	0
          ,	left:	0
          ,	right:	0
          }
        }
      }
    );
    //Layout the inner panes in the west and center parts of the outer layout.
    app.westLayout = $("#outer-west").layout();
    app.centerLayout = $("#outer-center").layout();
    app.sizePanes();
  },

/*
 * Size the panes using fractions.
 */
app.sizePanes = function() {
  //Size outer layout panes.
  var outerHeight = $(app.outputAreaSelector).height();
  var outerWidth = $(app.outputAreaSelector).width();
  app.outerLayout.sizePane( "north", 0.2 * outerHeight );
  app.outerLayout.sizePane( "west", 0.3 * outerWidth );
  app.outerLayout.sizePane( "east", 0.3 * outerWidth );
  //Size west layout kids.
  var westHeight = $("#outer-west").height()
  app.westLayout.sizePane( "south", westHeight * 0.5 );
  //Size center layout kids.
  var centerHeight = $("#outer-center").height();
  app.centerLayout.sizePane( "south", centerHeight * 0.5 );
};

/**
 * Fix the pane headers at the top of their panes.
 */
app.fixHeaders = function() {
  $("body > div header").parent().scroll(function(event){
    var scrollTop = $(this).scrollTop();
    var scrollLeft = $(this).scrollLeft();
    $(this).find("header")
      .css("top", scrollTop)
      .css("left", scrollLeft);
  });
}

/**
 * Compile Handlbars templates.
 */
app.compileTemplates = function() {
  //Compile templates.
  app.compiledTemplates.submissionListTemplate
      = Handlebars.compile($("#submissionListTemplate").html());
  //Rubric item template uses a partial for comment lists.
  Handlebars.registerPartial(
      "commentsGroup", 
      $("#rubricItemCommentsTemplate").html()
  );
  app.compiledTemplates.rubricItemTemplate 
      = Handlebars.compile($("#rubricItemTemplate").html());
}

