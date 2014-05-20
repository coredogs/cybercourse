/* 
 * Create submission links for an inserted exercise. 
 */
(function($) {
  var uiNamespace; //Convenient ref to a namespacey thing.
  Drupal.behaviors.cycoExerSubLinks = {
    attach: function(context, settings) {
      uiNamespace = Drupal.behaviors.cycoExerSubLinks;
      //Find the inserted exercises.
      $("div[data-nid].cyco-inserted-exercise").each( function(index, element) {
        //Append a throbber.
        var throbber = uiNamespace.makeThrobber( element );
        throbber.show();
        //Get uid of current user.
        var uid = Drupal.settings.cybercourse_exercise.uid;
        //Get exercise nid of this exercise.
        var exercise_nid = $(element).attr("data-nid");
        $.when(
          uiNamespace.getCsrfToken()
        )
        .then(function() {
          //Grab vocab terms and rubric items from server.
          $.when( 
            uiNamespace.fetchSubmissionMetaData( uid, exercise_nid )
          )
          .then(function() {
            //Prep the UI.
            uiNamespace.prepareUi();
            throbber.hide();
          })
          .fail(function() {
            alert("The voles died.");
          });
        })
        .fail(function() {
          alert("The gerbils died.");
        });
      });
    },
    /**
     * Append a throbber to an element.
     * @param {DOM element} parentElement Where to attach throbber.
     * @returns {$} Rrf to the attached throbber.
     */
    makeThrobber: function( parentElement ) {
      var throbber = $(
  "<div style='display:none'>"
+   "Loading..."
+   "<div class='ajax-progress ajax-progress-throbber'>"
+     "<div class='throbber'>&nbsp;</div>"
+   "</div>"
+ "</div>"
      );
      $(parentElement).append( throbber );
      return throbber;
    },
    /**
     * Get a CSRF token.
     * @returns {unresolved} Promise.
     */
    getCsrfToken: function(){
//      console.log("Getting token");
      //Connect and get user details.
      var webServiceUrl = Drupal.settings.basePath + "services/session/token";
//      $("#activity").show();
      var promise = $.ajax({ 
          type: "GET",
          url: webServiceUrl,
          dataType: "text"
      })
        .done(function(token){
          uiNamespace.token = token;
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.log('Token request failed! ' + textStatus + errorThrown); 
        })
        .always(function() {
//          $("#activity").hide();
        }); 
      return promise;
    },
    /**
     * Ask the server for metadata about this user's submissions 
     * for this exercise.
     * @param {int} uid Uid of current user.
     * @param {int} exercise_nid Nid of current exercise.
     */
    fetchSubmissionMetaData: function( uid, exercise_nid ) {
      var webServiceUrl = Drupal.settings.basePath 
              + "exercise/submission/getSubmissionMetaStudentExer";
      var dataToSend = {};
      dataToSend.student = uid;
      dataToSend.exercise = exercise_nid;
      dataToSend = JSON.stringify( dataToSend );
      var promise = $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url: webServiceUrl,
        data: dataToSend,
        beforeSend: function (request) {
          request.setRequestHeader("X-CSRF-Token", uiNamespace.token);
        }
      })
        .done(function(result) {
          uiNamespace.submissionData = result;
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          alert('fetchSubmissionMetaData request failed! ' + errorThrown);
        });
      return promise;
    },
    /**
     * Set up the links to the submission form.
     */
    prepareUi: function() {
      var numSubmissions = uiNamespace.submissionData.length;
      if ( numSubmissions == 0 ) {
        //There are no submissions.
      }
      else {
        //There is at least one submission.
        $.each( uiNamespace.submissionData, function(index, element) {
          
        });
      }
    }
  };
}(jQuery));



