function capitaliseFirstLetter(string) {
  if ( ! string ) {
    return '';
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function trimLR (str) {
  if ( ! str ) {
    return '';
  }
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

//See http://www.dconnell.co.uk/blog/index.php/2012/03/12/scroll-to-any-element-using-jquery/
function cycoScrollToElement(selector, time, verticalOffset) {
    time = typeof(time) != 'undefined' ? time : 1000;
    verticalOffset = typeof(verticalOffset) != 'undefined' ? verticalOffset : 0;
    element = jQuery(selector);
    offset = element.offset();
    offsetTop = offset.top + verticalOffset;
    jQuery('html, body').animate({
        scrollTop: offsetTop
    }, time);
}

(function($) {

  if ( ! $.center ) {
    //Center something on the screen.
    //See http://stackoverflow.com/questions/210717/using-jquery-to-center-a-div-on-the-screen
    $.fn.center = function () {
      this.css("position","absolute");
      this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                  $(window).scrollTop()) + "px");
      this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                  $(window).scrollLeft()) + "px");
      return this;
    }    
  }

})(jQuery);



