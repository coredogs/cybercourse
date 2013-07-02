(function ($) {
  Drupal.behaviors.knowledgemap_display = {
    attach: function(context, settings) {
      var knowledgemap_rep 
          = settings.knowledgemap_display.knowledgemap_rep;
      alert( 'Length: ' + knowledgemap_rep.length);
    }
  }
})(jQuery);
