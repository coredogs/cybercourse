(function($) {


  $(document).ready(function() {
    
    $('.tree > ul').attr('role', 'tree').find('ul').attr('role', 'group');
    $('.tree').find('li:has(ul)').addClass('parent_li').attr('role', 'treeitem')
        .find(' > span').attr('title', 'Collapse this branch').on('click',
           function(e) { 
             var $this = $(e.currentTarget);
             $this.bookBlockMenuClicked( $this ); 
             e.stopPropagation();
           } );
    
    //Animation to show. None to start with.
    //$.bccMenuAnimation = '';
    
    $.fn.bookBlockMenuClicked = function( $this ) {
      if ( ! $this ) {
        $this = $(this);
      }
      var children = $this.parent('li.parent_li').find(' > ul > li');
      if ( children.hasClass('open') ) {
        children.removeClass('open').addClass('closed');
        children.hide();// $.bccMenuAnimation );
        $this.attr('title', 'Expand this branch').find(' > i')
//            .addClass('glyphicon')
            .addClass('glyphicon-plus-sign')
            .removeClass('glyphicon-minus-sign');
      }
      else {
        children.removeClass('closed').addClass('open');
        children.show();// $.bccMenuAnimation );
        $this.attr('title', 'Collapse this branch').find(' > i')
              .addClass('glyphicon-minus-sign')
              .removeClass('glyphicon-plus-sign');
      }
    };
    
    //Find the menu item that is the link to the current page.
    var currentPagePath = 
//          Drupal.settings.cyco_book_blocks.base_url
//        + Drupal.settings.basePath
         Drupal.settings.cyco_book_blocks.current_path;
    var active = $(".tree li a[href$='" + currentPagePath + "']");
    if ( active.length > 0 ) {
      active = active.closest("li");
      active.addClass("currentPage");
      var reachedMenuTop = false;
      var foundParent = false;
      while ( ! reachedMenuTop ) {
        foundParent = false;
        while ( ! foundParent ) {
          active = active.parent();
          foundParent = ( active.hasClass("menuTop") || active.hasClass("parent_li"));
        }
        if ( active.hasClass("menuTop") ) {
          reachedMenuTop = true;
        }
        else {
          active = active.children("span");
          active.addClass("active-path");
          active = active.closest("li.parent_li");
        }
      }
      //Expand all the menu items on the active path.
      $(".tree .active-path").each(function(){
        $(this).bookBlockMenuClicked();
      });
      //Animations from now on.
      $.bccMenuAnimation = ''; //'fast';
    }
  });

}(jQuery));
