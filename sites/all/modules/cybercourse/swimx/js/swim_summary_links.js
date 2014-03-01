
(function ($) {

/**
 * Copied from text.js (standard Drupal long text field).
 * Auto-hide summary textarea if empty and show hide and unhide links.
 */

Drupal.behaviors.textSummary = {
  attach: function (context, settings) {
    $('.swimx-editor-summary', context).once('swimx-editor-summary', function () {
      var $widget = $(this).closest('div.field-type-swimx-with-summary');
      var $summaries = $widget.find('div.swimx-summary-wrapper');

      $summaries.once('swimx-summary-wrapper').each(function(index) {
        var $summary = $(this);
        var $summaryLabel = $summary.find('label');
        var $full = $widget.find('.swimx-editor-main').eq(index).closest('.form-item');
        var $fullLabel = $full.find('label');

        // Create a placeholder label when the field cardinality is
        // unlimited or greater than 1.
        if ($fullLabel.length == 0) {
          $fullLabel = $('<label></label>').prependTo($full);
        }

        // Setup the edit/hide summary link.
        var $link = $('<span class="field-edit-link">(<a class="link-edit-summary" href="#">' + Drupal.t('Hide summary') + '</a>)</span>').toggle(
          function () {
            $summary.hide();
            $(this).find('a').html(Drupal.t('Edit summary')).end().appendTo($fullLabel);
            return false;
          },
          function () {
            $summary.show();
            $(this).find('a').html(Drupal.t('Hide summary')).end().appendTo($summaryLabel);
            return false;
          }
        ).appendTo($summaryLabel);

        // If no summary is set, hide the summary field.
        if ($(this).find('.swimx-editor-summary').val() == '') {
          $link.click();
        }
        return;
      });
    });
  }
};

})(jQuery);
