/**
 * Prepare the exerise submisssion form.
 */

(function($) {
  Drupal.behaviors.cycoExerPrepSubmissionForm = {
    attach: function(context, settings) {
      //When the window closes, tell the opener to refresh the links
      //for submission of the current exercise.
      window.onunload = function (e) {
        var exerciseNid = Drupal.settings.cybercourse_exercise.exerciseNid;
        opener.Drupal.behaviors.cycoExerSubLinks.refreshLinksForExercise( exerciseNid );
      };
    }
  };
}(jQuery));
