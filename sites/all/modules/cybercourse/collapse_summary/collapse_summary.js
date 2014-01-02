(function ($) {

/**
 * Collapse the summary area. Change collapsing link text to show whether there
 * is summary content.
 */
Drupal.behaviors.collapseSummary = {
  attach: function (context, settings) {
    $(".text-summary-wrapper").each(function() {
      //Sometimes this runs more than once, so do this only if the
      //summary is MT.
      if ( $(this).parent().find(".collapse-summary-indicator").length == 0 ) {
        //Create the summary indicator.
        var summaryIsEmpty = ( $(this).find(".text-summary").val() == "" );
        var indicatorText = summaryIsEmpty 
            ? "Summary is empty" 
            : "Summary has content";
        var indicatorHtml = "<span class='collapse-summary-indicator'>" 
            + indicatorText + "</span>";
        //Add indicator to parent (a text-format-wrapper) because
        //JS code in text.module messes with the link.
        $(this).parent().prepend(indicatorHtml);
        //Make sure summary is hidden.
        if ( ! summaryIsEmpty ) {
          $(this).find(".link-edit-summary").click();
        }
      }
    });
  }
};

})(jQuery);