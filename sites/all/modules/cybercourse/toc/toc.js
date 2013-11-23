(function ($) {
  Drupal.behaviors.toc = {
    attach: function (context, settings) {
      var headingTagList 
          = $('.field-name-body h1, .field-name-body h2, .field-name-body h3, .field-name-body h4');
      if ( headingTagList.size() > 0 ) {
        var html = '<div id="toc" class="well well-sm"><p id="toc_label">Table of contents</p>';
        var elementCount = 0;
        headingTagList.each(function(index) {
          var elementHeading = jQuery(this).text();
          var elementTag = this.tagName.toLowerCase();
          $(this).attr('id', 'toc' + elementCount);
          html += '<p class="toc_' + elementTag + '"><a href="#toc' + elementCount + '">' + elementHeading + '</a></p>';
          elementCount ++;
        }); // end each
        html += '</div>';
        //Only add the ToC to the first instance of a body.
        //Prevents extras from appearing when exercises are inserted.
        $('.field-name-body').first().prepend(html);
      } // end if
    }
  };
}(jQuery));



