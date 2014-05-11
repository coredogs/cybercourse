/**
 * Collapse/expand the left sidebar.
 */
(function($) {
  var uiNameSpace; //For namespacing.
  Drupal.behaviors.toggleLeftSidebar = {
    cookieName: "cyco_left_sidebar",
    //Cookie expires in 3 days, and is site-wide.
    //  Three days, because humans may have forgotten what they did
    //  by then.
    cookieOptions: { expires: 3, path: '/' },
    //Selector identifying the region to collapse.
    regionSelector: ".region-sidebar-first",
    //The class the main region has when the sidebar is expanded
    mainRegionClassWhenSidebarCollapsed: "col-sm-12",
    //The class the main region has when the sodebar is collapse.
    mainRegionClassWhenSidebarExpanded: "col-sm-9",
    //Code to show the widget.
    widgetCode: "<span class='glyphicon glyphicon-circle-arrow-left' "
              + "id='toggle-left-sidebar' "
              + "title='Show/hide the sidebar'>"
              + "</span>",
    //CSS Id for the widget.
    widgetSelector: "#toggle-left-sidebar",
    attach: function(context, settings) {
      uiNameSpace = this;
      //Only make one of them. CTools modals can cause multiples. 
      if ( $("#toggle-left-sidebar").length > 0 ) {
        return;
      }
      var sideRegion = $(uiNameSpace.regionSelector);
      var sideRegionContainer = sideRegion.parent();
      //Get the container's original classes.
      var sideRegionContainerClasses = sideRegionContainer.attr("class");
      //Add the widget in front of the sidebar div.
      sideRegionContainer.prepend(uiNameSpace.widgetCode);
      var widget = $(uiNameSpace.widgetSelector);
      //Find the main content region.
      var mainRegion = $(uiNameSpace.mainRegionClassWhenSidebarExpanded);
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
            mainRegion, widget, "fast"
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
            mainRegion, widget, "fast"
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
        mainRegion, widget, animationSpeed
      ) {
        widget.removeClass("glyphicon-circle-arrow-left");
        widget.addClass("glyphicon-circle-arrow-right");
        sideRegionContainer.attr("class", "");
        sideRegion.hide(animationSpeed);
        mainRegion.removeClass(uiNameSpace.mainRegionClassWhenSidebarExpanded);
        mainRegion.addClass(uiNameSpace.mainRegionClassWhenSidebarCollapsed);
    },
    showSidebar: function(
        sideRegion, sideRegionContainer, sideRegionContainerClasses,
        mainRegion, widget, animationSpeed
      ) {
      widget.removeClass("glyphicon-circle-arrow-right");
      widget.addClass("glyphicon-circle-arrow-left");
      mainRegion.removeClass(uiNameSpace.mainRegionClassWhenSidebarCollapsed);
      mainRegion.addClass(uiNameSpace.mainRegionClassWhenSidebarExpanded);
      sideRegionContainer.attr("class", sideRegionContainerClasses);
      sideRegion.show(animationSpeed);
    }
  };
}(jQuery));
