(function($) {
  Drupal.behaviors.cycoExerOpenSubmissionNewWindow = {
    attach: function(context, settings) {
      $("a[data-target=popup]").click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        windowObjectReference = window.open(
                $(this).attr("href"),
                "Work on your exercise",
                "resizable,scrollbars,height=600,width=600"
                );
        return false; //Cancel standard action.
      });
    }
  };
}(jQuery));
