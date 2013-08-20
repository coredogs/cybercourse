/**
 * @file Plugin for adding pseudents.
 */
//(function ($) {
  
CKEDITOR.plugins.add( 'pseudents', {
    init: function( editor ) {
      var config = editor.config;
      editor.addCommand( 'insertPseudent', {
        exec: function( editor ) {
        }
      });
      editor.ui.addRichCombo( 'Pseudents', {
          label: 'Pseudents',
          toolbar: 'pseudents,10',
          panel: {
            css: [ CKEDITOR.skin.getPath( 'editor' ) ].concat( config.contentsCss ),
            multiSelect: false
          },
          init: function() {
            //Check that there are poses available.
            if (
                 ! Drupal.settings.pseudents   
              || ! Drupal.settings.pseudents.pose_previews
              || Drupal.settings.pseudents.pose_previews == 'none'
              || Drupal.settings.pseudents.pose_previews.length == 0
            ) {
                this.add( '', 'No poses available', 
                  'See the wiki to learn how to create pseudent poses' );
            }
            else {
              var i, pose;
              for ( i in Drupal.settings.pseudents.pose_previews ) {
                pose = Drupal.settings.pseudents.pose_previews[i];
                this.add( pose.token, pose.html, 'Insert this pose' );
              }
            }
            this.commit();
          },
          onClick: function( value ) {
            CKEDITOR.currentInstance.insertText( 
                '[pseudent:' + value + ']\n\n[/pseudent]\n' 
            );
          },
//          onRender: function() {
//    
//          },
          loadedCss : false,
          onOpen: function() {
            //Inject the CSS needed to show pseudent previews into the 
            //document in the iframe.
//            alert(jQuery("iframe.cke_panel_frame").length)
            if ( ! this.loadedCss ) {
              var iframe = jQuery(".cke_combopanel .cke_panel_frame");
              if ( iframe ) {
                var cssLink = document.createElement("link") 
                cssLink.href = Drupal.settings.pseudents.base_url
                    + Drupal.settings.basePath 
                    + Drupal.settings.pseudents.pose_stylesheet; 
                cssLink.rel = "stylesheet"; 
                cssLink.type = "text/css";
                iframe.contents().find('body').append(cssLink);    
              }
            }
            this.loadedCss = true;
          }
          

      });
    }
});


