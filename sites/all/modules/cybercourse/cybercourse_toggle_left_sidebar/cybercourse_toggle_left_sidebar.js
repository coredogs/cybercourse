/**
 * Collapse/expand the left sidebar.
 */
(function($) {
  Drupal.behaviors.toggleLeftSidebar = {
    cookieName: "cyco_left_sidebar",
    //Cookie expires in 3 days, and is site-wide.
    //  Three days, because humans may have forgotten what they did
    //  by then.
    cookieOptions: { expires: 3, path: '/' },
    attach: function(context, settings) {
      //Only make one of them. CTools modals can cause multiples. 
      if ( $("#toggle-left-sidebar").length > 0 ) {
        return;
      }
      //Define toggle widget.
      var widgetCode =
              "<span class='glyphicon glyphicon-circle-arrow-left' "
              + "id='toggle-left-sidebar' "
              + "title='Show/hide the sidebar'>";
      "</span>";
      var sideRegion = $(".region-sidebar-first");
      var sideRegionContainer = sideRegion.parent();
      //Get the container's original classes.
      var sideRegionContainerClasses = sideRegionContainer.attr("class");
      //Add the widget in front of the sidebar div.
      sideRegionContainer.prepend(widgetCode);
      var widget = $("#toggle-left-sidebar");
      //Find the main content region.
      var mainRegion = $(".col-sm-9");
      //Set up the event.
      var toggleLeftSidebar = this;
      //If cookie says it is hidden, hide it.
      if ( $.cookie(this.cookieName) ) {
        if ( $.cookie(this.cookieName) == "hidden") {
          this.hideSidebar(
            sideRegion, sideRegionContainer, sideRegionContainerClasses,
            mainRegion, widget 
          );
        }
      }
      widget.click(function() {
        var isHidden = (sideRegion.css("display") == "none");
        if (isHidden) {
          toggleLeftSidebar.showSidebar(
            sideRegion, sideRegionContainer, sideRegionContainerClasses,
            mainRegion, widget 
          );
          //Set cookie.
          $.cookie(
              toggleLeftSidebar.cookieName, 
              "shown", 
              toggleLeftSidebar.cookieOptions
          );
        }
        else {
          toggleLeftSidebar.hideSidebar(
            sideRegion, sideRegionContainer, sideRegionContainerClasses,
            mainRegion, widget 
          );
          //Set cookie.
          $.cookie(
              toggleLeftSidebar.cookieName, 
              "hidden", 
              toggleLeftSidebar.cookieOptions
          );
        }
      });
    }, //End atttach
    hideSidebar: function(
        sideRegion, sideRegionContainer, sideRegionContainerClasses,
        mainRegion, widget 
      ) {
        widget.removeClass("glyphicon-circle-arrow-left");
        widget.addClass("glyphicon-circle-arrow-right");
        sideRegionContainer.attr("class", "");
        sideRegion.hide();
        mainRegion.removeClass("col-sm-9");
        mainRegion.addClass("col-sm-12");
    },
    showSidebar: function(
        sideRegion, sideRegionContainer, sideRegionContainerClasses,
        mainRegion, widget 
      ) {
      widget.removeClass("glyphicon-circle-arrow-right");
      widget.addClass("glyphicon-circle-arrow-left");
      mainRegion.removeClass("col-sm-12");
      mainRegion.addClass("col-sm-9");
      sideRegionContainer.attr("class", sideRegionContainerClasses);
      sideRegion.show();
    }
  };
}(jQuery));


