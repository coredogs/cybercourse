/* 
 * Code implementing rendering rules for SWIM.
 */

try {

(function($) {
  var done_once = false;
  Drupal.behaviors.swimRender = {
    attach: function(context, settings) {
      if (done_once) {
        return;
      }
      //In an aside, center images.
      $("aside.swim p img").closest("p").css("text-align", "center");
      //Images that are not in asides or pseudents - indent them a little.
      $(".swim .field-name-body img").each(function() {
        if ( 
                $(this).closest("aside.swim").length == 0 
             && $(this).closest("div.cyco_pseudent_figure").length == 0
           ) {
          $(this).addClass("swim-indent-image");
        }
      });
      done_once = true;
    }
  }


})(jQuery);

} catch (e) {
  alert( 
        "Error! " + e.message + "/n/nPlease take a screenshot of "
      + "your entire browser screen and "
      + "send it to Kieran Mathieson at kieran@dolfinity.com./n/n"
      + "Please explain what you were trying to do at the time./n/n" 
      + "Jokes welcome as well. ");
}

