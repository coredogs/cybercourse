(function ($) {
  Drupal.behaviors.swimHideThings = {
    attach: function (context, settings) {
      //Hide plain text link.
      $("#switch_edit-body-und-0-value").html("");
    }
  };
}(jQuery));
