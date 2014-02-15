/**
 * Collapse/expand term ref widgets.
 */
(function($) {
  Drupal.behaviors.cybercourse_collpase_term_ref_widget = {
    attach: function(context, settings) {
      //Define toggle widget.
      var widgetCode =
              "<span class='glyphicon glyphicon-circle-arrow-down "
              + "cyco-collapse-term-ref-widget' "
              + "title='Show/hide the term selections'>"
      + "</span>";
      //For each term set...
      $('.field-type-taxonomy-term-reference').each( function(index, widget) {
        //Add the new thing inside the label.
        var labelElement = $(widget).find("label:first");
        var labelElementHtml = $(widget).find("label:first").html();
        $(labelElement).html( labelElementHtml + widgetCode );
        //Hide the checkbox container.
        var containerId = $(labelElement).attr("for")
        $("#" + containerId).hide();
      });
      //Set up click event.
      $(".cyco-collapse-term-ref-widget").click(function(evnt) {
        //Get ref to thing clicked on.
        var $collapseyThing = $(evnt.target);
        //Get the id of the element the label is for.
        var containerId = $collapseyThing.parent().attr("for");
        var isHidden = ( $("#" + containerId).css("display") == "none" );
        if (isHidden) {
          $("#" + containerId).show("fast");
          $collapseyThing
              .removeClass("glyphicon-circle-arrow-down")
              .addClass("glyphicon-circle-arrow-up");
        }
        else {
          $("#" + containerId).hide("fast");
          $collapseyThing
              .removeClass("glyphicon-circle-arrow-up")
              .addClass("glyphicon-circle-arrow-down");
        }
      });
    } //End atttach
  };
}(jQuery));


