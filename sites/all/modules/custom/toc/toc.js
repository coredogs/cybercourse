jQuery(document).ready(function() {
  var headingTagList 
      = jQuery('#main-content h2, #main-content h3, #main-content h4');
  if ( headingTagList.size() > 0 ) {
    var html = '<div id="cybercourse_toc"><p id="cybercourse_toc_label">Table of contents</p>';
    var elementCount = 0;
    headingTagList.each(function(index) {
      var elementHeading = jQuery(this).text();
      var elementTag = this.tagName.toLowerCase();
      jQuery(this).attr('id', 'cybercourse_toc' + elementCount);
      html += '<p class="cybercourse_toc_' + elementTag + '"><a href="#cybercourse_toc' + elementCount + '">' + elementHeading + '</a></p>';
      elementCount ++;
    }); // end each
    html += '</div>';
    jQuery('#main-content-header').after(html);
  } // end if
}); 

