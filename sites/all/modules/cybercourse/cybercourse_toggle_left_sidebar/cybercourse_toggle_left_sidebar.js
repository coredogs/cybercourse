/**
 * Change the text of notification links.
 */
(function($) {
  Drupal.behaviors.toggleLeftSidebar = {
    cookieName: "cyco_left_sidebar",
    attach: function(context, settings) {
      //Define toggle widget.
      var widgetCode =
              "<span class='glyphicon glyphicon-circle-arrow-left' "
              + "id='toggle-left-sidebar' "
              + "title='Show/hide the sidebar'>";
      "</span>";
      var sideRegion = $(".region-sidebar-first");
      var sideRegionContainer = sideRegion.parent();
      //Get the container's original classes.
      var regionContainerClasses = sideRegionContainer.attr("class");
      //Add the widget in front of the sidebar div.
      sideRegionContainer.prepend(widgetCode);
      var widget = $("#toggle-left-sidebar");
      //Find the main content region.
      var mainRegion = $(".col-sm-9");
      //Set up the event.
      var toggleLeftSidebar = this;
      widget.click(function() {
        var isHidden = (sideRegion.css("display") == "none");
        if (isHidden) {
          widget.removeClass("glyphicon-circle-arrow-right");
          widget.addClass("glyphicon-circle-arrow-left");
          mainRegion.removeClass("col-sm-12");
          mainRegion.addClass("col-sm-9");
          sideRegionContainer.attr("class", regionContainerClasses);
          sideRegion.show();
          //Set cookie.
          $.cookie(this.cookieName, "shown");
        }
        else {
          widget.removeClass("glyphicon-circle-arrow-left");
          widget.addClass("glyphicon-circle-arrow-right");
          sideRegionContainer.attr("class", "");
          sideRegion.hide();
          mainRegion.removeClass("col-sm-9");
          mainRegion.addClass("col-sm-12");
          //Set cookie.
          $.cookie(this.cookieName, "hidden");
        }
      });
      //If cookie says it is hidden, do a click.
      if ( $.cookie(this.cookieName) ) {
        if ( $.cookie(this.cookieName) == "hidden") {
          widget.click();
        }
      }
    } //End atttach
  };
}(jQuery));


