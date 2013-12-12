//See http://forum.jquery.com/topic/jquery-dimensions-should-have-a-method-to-return-the-scrollbar-size

jQuery.getScrollBarSize = function() {
   var inner = jQuery('<p></p>').css({
      'width':'100%',
      'height':'100%'
   });
   var outer = jQuery('<div></div>').css({
      'position':'absolute',
      'width':'100px',
      'height':'100px',
      'top':'0',
      'left':'0',
      'visibility':'hidden',
      'overflow':'hidden'
   }).append(inner);
      
   jQuery(document.body).append(outer);
         
   var w1 = inner.width(), h1 = inner.height();
   outer.css('overflow','scroll');
   var w2 = inner.width(), h2 = inner.height();
   if (w1 == w2 && outer[0].clientWidth) {
      w2 = outer[0].clientWidth;
   }
   if (h1 == h2 && outer[0].clientHeight) {
      h2 = outer[0].clientHeight;
   }
        
   outer.detach();
        
   return [(w1 - w2),(h1 - h2)];
};
