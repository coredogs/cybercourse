var app = app || {};

//Base path to Drupal.
app.basePath = window.cybercourseBasePath;

app.makeGuid = function(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, 
    function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  };

//Make a level collection
app.makeLevelCollection = function(levels) {
  //Make a level collection
  var rubricItemLevelCollection = new app.RubricItemLevelCollection();
  //Iterate over item level data.
  _.each( levels, function(levelData){
    //Make an item level model.
    var rubricItemLevelModel = new app.RubricItemLevelModel();
    //Set its attributes.
    rubricItemLevelModel.setLevelId( levelData.id );
    rubricItemLevelModel.setLevelName( levelData.levelName );
    rubricItemLevelModel.setLevelOrder( levelData.levelOrder );
    rubricItemLevelModel.setLevelScore( levelData.score );
    //Add to level collection.
    rubricItemLevelCollection.add( rubricItemLevelModel );
  } );  //End proc levels
  return rubricItemLevelCollection;
};
  
//Make a comment collection.
app.makeCommentCollection = function(comments) {
  //Make a comment collection
  var rubricItemCommentCollection = new app.RubricItemCommentCollection();
  //Iterate over item comment data.
  _.each( comments, function(commentData){
    //Make an item comment model.
    var rubricItemCommentModel = new app.RubricItemCommentModel();
    //Set its attributes.
    rubricItemCommentModel.setCommentId( commentData.id );
    rubricItemCommentModel.setComment( commentData.comment );
    rubricItemCommentModel.setCommentOrder( commentData.commentOrder );
    //Add to comment collection.
    rubricItemCommentCollection.add( rubricItemCommentModel );
  } );  //End proc comments
  return rubricItemCommentCollection;
};
  
app.start = function(exerciseSolutionModel) {
  $.when(
    app.getCsrfToken()
  )
  .then(function() {
    $.when( 
      Drupal.behaviors.ext12.testFetch()
    )
    .then(function( result ) {
      console.log("Result: ", result);
      Drupal.behaviors.ext12.hideAjaxThrobber();
    })
    .fail(function() {
      alert("The fetch test died.");
    });
  });
};
  
app.initUi = function() {
  app.solutionRubricAssessmentView = new app.SolutionRubricAssessmentView({
    model: exerciseSolutionModel
  });
  app.solutionRubricAssessmentView.render('body');
  $('#rubric-pane .pane-content').html( app.solutionRubricAssessmentView.$el.html());
  //Set up event.
  $('#rubric-pane').click(function(evnt) {
    app.solutionRubricAssessmentView.click(evnt);
  });
  //Set up CCKeditor.
  app.editor = CKEDITOR.replace( "feedbackEditor", {
    //toolbar: 'Basic',
    disableNativeSpellChecker: false,
    autoGrow_onStartup: true,
    height: '250px',
    toolbar: [
      { name: 'clipboard', items: [ 'Undo', 'Redo' ] },
      { name: 'basicstyles', items: [ 'Bold', 'Italic','RemoveFormat' ] },
      { name: 'paragraph', 
        items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-',
        'JustifyLeft','JustifyCenter','JustifyRight'] },      
      { name: 'links', items : [ 'Link','Unlink' ] },
      { name: 'insert', items : [ 'Image','Smiley','SpecialChar' ] }
    ]
  } );
  $("#send-feedback-button").click(function() {
    if ( app.editor.document.getBody().getText().trim() == "" ) {
      alert("No feedback to send.");
      return false;
    }
    alert("Feedback sent.");
    return false;
    }
  );
  $("#suggestions-button").click(function () {
    $( "#suggestions" ).dialog({
      modal: true,
      width: "50%",
      show: {
        effect: "scale",
        duration: "medium"
      },
      hide: {
        effect: "scale",
        duration: "medium"
      },
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
        }
      }
    });
  });
};

/*
* Get the CSRF token.
* @returns {unresolved} Promise.
*/
app.getCsrfToken = function(){
 console.log("Getting token");
 //Connect and get user details.
 var webServiceUrl = app.basePath + "services/session/token";
 $("#activity").show();
 var promise = $.ajax({ 
     type: "GET",
     url: webServiceUrl,
     dataType: "text"
 })
   .done(function(token){
     app.csrfToken = token;
       console.log("Got it: " + token);
     return token;
   })
   .fail(function(jqXHR, textStatus, errorThrown) {
     console.log('Token request failed! ' + textStatus + errorThrown); 
   })
   .always(function() {
     $("#activity").hide();
   }); 
 return promise;
};


$(document).ready(function() {
  //Simulate data from server.
  var rubricItemData = [
    { itemName: 'Indentation',
      itemDescription: 'Code indentation should match nesting level. An opening brace ' +
         '({) means that lines below it are indented one more step. A closing ' +
         'brace (}) brings the indenting back out one step. A step is usually ' +
         'two or four spaces.\n\nProper indenting makes code easier to read ' +
         'and debug. It is especially important for novices. Emphasize this in ' +
         'your comments.',
      itemId: 1,
      levels: [
        { id: 1, levelName:'Indentation needs work.', levelOrder: 6, score: 1 },
        { id: 2, levelName:'Good indentation.', levelOrder: 8, score: 2 },
        { id: 3, levelName:'Poor indentation.', levelOrder: 4, score: 0 }
      ],
      comments:[
        { id: 5, comment: 'Poor indentation makes code hard to debug, and change.', commentOrder: 1 },
        { id: 6, comment: 'Read the lesson on indentation again.', commentOrder: 2 }
      ]
    },
    { itemName: 'Variable names', 
      itemDescription: 'The names of variables should match their purpose. ' +
         'For example, a variable holding a weight should be called "weight", ' +
         'not "w" or "xk36". Meaningful variable names make code easier to ' +
         'understand.\n\nUse camel case for variables that are best described ' +
         'by more than one word. For example, a variable for a weight in pounds might be ' +
         'named "weightInPounds", or "weightPounds".',
      itemId: 2,
      levels: [
        { id: 11, levelName:'Variable names need work.', levelOrder: 6, score: 1 },
        { id: 12, levelName:'Good variable names.', levelOrder: 8, score: 2 },
        { id: 13, levelName:'Poor variable names.', levelOrder: 4, score: 0 }
      ],
      comments:[
        { id: 15, comment: 'Variable names should tell you what they are used for.', commentOrder: 1 }
      ]
    },
/*    
    { itemName: 'Input has focus on page load',
      itemDescription: 'When a page with input fields is loaded, the keyboard input ' +
         'focus should be on the first field. Text fields will have an I cursor.' +
         'This practice makes pages easier to use. Users can start typing, without ' +
         'having to click anything first.\n\n' +
         'Focus is set with jQuery. For example:\n\n    $(\'#weight\').focus();' +
         '',
      itemId: 3,
      levels: [
        { id: 21, levelName:'On page load, input box has focus - good.', levelOrder: 6, score: 1 },
        { id: 23, levelName:'On page load, input box doesn\'t have focus.', levelOrder: 4, score: 0 }
      ],
      comments:[
        { id: 25, comment: 'Read about focus() in the "Page that interacts" chapter.', commentOrder: 1 }
      ]
    },
*/
    { itemName: 'Output correct',
      itemDescription: 'Make sure that programs generate the ' +
         'right output. Check the exercise and the sample solution(s).',
      itemId: 4,
      levels: [
        { id: 31, levelName:'The output is correct.', levelOrder: 6, score: 2 },
        { id: 32, levelName:'The output isn\'t quite right.', levelOrder: 4, score: 1 },
        { id: 33, levelName:'The output is not correct.', levelOrder: 2, score: 0}
      ],
      comments:[
        { id: 35, comment: 'Check the math. Is the conversion right?', commentOrder: 1 },
        { id: 36, comment: 'Compare your output with the sample in the exercise.', commentOrder: 2 }
      ]
    }
  ];
  
  var exerciseData = {
      exerciseId: 1,
      exerciseName: 'Kilos into pounds.',
      exerciseInstructions: '<p>Write a page that will convert kilograms to pounds. ' 
        + 'There are 2.2 lbs per kilo. The page will look like this to start with:</p>'
        + '<p><img src="images/kilos-to-pounds/empty.png" alt="Page at start"></p>'
        + '<p>The user types a number in and clicks the button:</p>'
        + '<p><img src="images/kilos-to-pounds/results.png" alt="Page at end"></p>'
        + '<p>Upload your solution to your server, and put the URL below.</p>',
      exerciseRubricItems: [ 
        {id: 1, order: 4},
        {id: 2, order: 3},
        //{id: 3, order: 2},
        {id: 4, order: 1}
      ],
      exerciseSolution:[
'<pre>&lt;!DOCTYPE HTML PUBLIC &quot;-//W3C//DTD HTML 4.01//EN&quot; &quot;http://www.w3.org/TR/html4/strict.dtd&quot;&gt;',
'&lt;html&gt;',
'  &lt;head&gt;',
'    &lt;meta http-equiv=&quot;Content-Type&quot; content=&quot;text/html; charset=utf-8&quot;&gt;',
'    &lt;script type=&quot;text/javascript&quot; src=&quot;http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js&quot;&gt;&lt;/script&gt;',
'    &lt;title&gt;Kilos to Pounds&lt;/title&gt;',
'    &lt;script type=&quot;text/javascript&quot;&gt;',
'      $(document).ready(function() {',
'        $(&quot;#kilos&quot;).focus();',
'        $(&quot;#convert&quot;).click(function(){',
'          var kilos = $(&quot;#kilos&quot;).val();',
'          var pounds = kilos * 2.2;',
'          $(&quot;#pounds&quot;).text(pounds);',
'        });',
'      });',
'    &lt;/script&gt;',
'  &lt;/head&gt;',
'  &lt;body&gt;',
'    &lt;h1&gt;Kilos to Pounds&lt;/h1&gt;',
'    &lt;p&gt;',
'      Kilos:',
'      &lt;input type=&quot;text&quot; id=&quot;kilos&quot;&gt;',
'      &lt;button type=&quot;button&quot; id=&quot;convert&quot;&gt;Convert&lt;/button&gt;',
'    &lt;/p&gt;',
'    &lt;p&gt;Pounds: &lt;span id=&quot;pounds&quot;&gt;&lt;/span&gt;&lt;/p&gt;',
'  &lt;/body&gt;',
'&lt;/html&gt;</pre>'
].join('\n')
  };
var exerciseSolution = {
  exerciseSubmission:
        '</p><a href="solutions/sol.html" target="_blank">Submitted</a></p>'        
        +    [
'<pre>&lt;!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"&gt;',
'&lt;html&gt;',
'  &lt;head&gt;',
'    &lt;meta http-equiv="Content-Type" content="text/html; charset=utf-8"&gt;',
'    &lt;script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"&gt;&lt;/script&gt;',
'    &lt;title&gt;Kilos to Pounds&lt;/title&gt;',
'    &lt;script type="text/javascript"&gt;',
'      $(document).ready(function() {',
'        $("#convert").click(function(){',
'          var k = $("#kilos").val();',
'          var p = k * 2.2;',
'          $("#pounds").text(p);',
'        });',
'      });',
'    &lt;/script&gt;',
'  &lt;/head&gt;',
'  &lt;body&gt;',
'    &lt;h1&gt;Kilos to Pounds&lt;/h1&gt;',
'    &lt;p&gt;',
'      Kilos:',
'      &lt;input type="text" id="kilos"&gt;',
'      &lt;button type="button" id="convert"&gt;Convert&lt;/button&gt;',
'    &lt;/p&gt;',
'    &lt;p&gt;Pounds: &lt;span id="pounds"&gt;&lt;/span&gt;&lt;/p&gt;',
'  &lt;/body&gt;',
'&lt;/html&gt;</pre>'
].join('\n')
    };
  
  //Make rubric item models. Put in an array, for temp storage.
  var rubricItems = new Array();
  _.each( rubricItemData, function(item) {
    //Create a rubric item.
    var rubricItemModel = new app.RubricItemModel();
    //Set item id.
    rubricItemModel.setRubricItemId ( item.itemId );
    //Set item name.
    rubricItemModel.setRubricItemName( item.itemName );
    //Description.
    rubricItemModel.setRubricItemDescription( item.itemDescription );
    //Make a level collection
    rubricItemModel.setRubricItemLevelCollection( app.makeLevelCollection(item.levels) );
    //Add comment collection to rubric item.
    rubricItemModel.setRubricItemCommentCollection( app.makeCommentCollection(item.comments) );
    //Keep the item.
    rubricItems[item.itemId] = rubricItemModel;
  });
  
  //Make an exercise.
  var exerciseModel = new app.ExerciseModel();
  exerciseModel.setExerciseId( exerciseData.exerciseId );
  exerciseModel.setExerciseName( exerciseData.exerciseName );
  exerciseModel.setExerciseInstructions ( exerciseData.exerciseInstructions );
  //Make rubric item collection for this exercise.
  var exerciseRubricItemCollection = new app.ExerciseRubricItemCollection();
  //Iterate across the input records.
  _.each( exerciseData.exerciseRubricItems, function(record) {
    //Create collection of rubric item links.
    var exerciseRubricItemModel = new app.ExerciseRubricItemModel();
    //Set its attribs.
    exerciseRubricItemModel.setRubricItem( rubricItems[record.id] );
    exerciseRubricItemModel.setRubricItemOrder( record.order );
    //Remember the link for the exercise.
    exerciseRubricItemCollection.add( exerciseRubricItemModel );
  });
  //Associate the link collection to the exercise.
  exerciseModel.setExerciseRubricItemCollection( exerciseRubricItemCollection );
  
  //Make an exercise solution.
  var exerciseSolutionModel = new app.ExerciseSolutionModel();
  exerciseSolutionModel.setExerciseModel( exerciseModel );
  exerciseSolutionModel.setSubmittedSolution( exerciseSolution.exerciseSubmission );
  var solutionRubricItemAssessmentCollection = new app.SolutionRubricItemAssessmentCollection();
  _.each( exerciseData.exerciseRubricItems, function (item) {
    var solutionRubricItemAssessmentModel = new app.SolutionRubricItemAssessmentModel();
    solutionRubricItemAssessmentModel.setRubricItem( rubricItems[item.id] );
    solutionRubricItemAssessmentModel.setCommentCollection(new app.RubricItemCommentToStudentCollection());
    solutionRubricItemAssessmentCollection.add(solutionRubricItemAssessmentModel);
  });
  exerciseSolutionModel.setSolutionRubricItemAssessmentCollection(solutionRubricItemAssessmentCollection);
  exerciseSolutionModel.setFeedback('');
  
  app.start(exerciseSolutionModel);
    
});
