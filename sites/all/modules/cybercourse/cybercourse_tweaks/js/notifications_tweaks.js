/**
 * Change the text of notification links.
 */
(function ($) {
  Drupal.behaviors.notificationsTweaks = {
    attach: function (context, settings) {
      $(".node .links").children().each( function( index, element ) {
        var a = $(element).find("a");
        if ( a.length > 0 ) {
          var linkText = a.text().toLowerCase();
          if ( linkText.substring(0, 9) == "subscribe") {
            a.text("Follow");
            a.attr("title", "Get emails about new comments on this page.");
          }
          if ( linkText.substring(0, 11) == "unsubscribe") {
            a.text("Stop following");
            a.attr("title", "Stop getting emails about new comments on this page.");
          }
        }
      });
    }
  };
}(jQuery));