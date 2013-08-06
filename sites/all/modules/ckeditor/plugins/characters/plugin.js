/**
 * @file Plugin for adding characters.
 */
//(function ($) {
  
CKEDITOR.plugins.add( 'characters', {
    init: function( editor ) {
      var config = editor.config;
      editor.addCommand( 'insertCharacter', {
        exec: function( editor ) {
        }
      });
      editor.ui.addRichCombo( 'Characters', {
          label: 'Characters',
          toolbar: 'characters,10',
          panel: {
            css: [ CKEDITOR.skin.getPath( 'editor' ) ].concat( config.contentsCss ),
            multiSelect: false
          },
          init: function() {
            //Check that there are poses available.
            if (
                 ! Drupal.settings.characters   
              || ! Drupal.settings.characters.pose_previews
              || Drupal.settings.characters.pose_previews == 'none'
              || Drupal.settings.characters.pose_previews.length == 0
            ) {
                this.add( '', 'No poses available', 
                  'See the wiki to learn how to create character poses' );
            }
            else {
              var i, pose;
              for ( i in Drupal.settings.characters.pose_previews ) {
                pose = Drupal.settings.characters.pose_previews[i];
                this.add( pose.token, pose.html, 'Insert this pose' );
              }
            }
            this.commit();
          },
          onClick: function( value ) {
            CKEDITOR.currentInstance.insertText( 
                '{character:' + value + '}\n\n{/character}\n' 
            );
          },
//          onRender: function() {
//    
//          },
          loadedCss : false,
          onOpen: function() {
            //Inject the CSS needed to show character previews into the 
            //document in the iframe.
//            alert(jQuery("iframe.cke_panel_frame").length)
            if ( ! this.loadedCss ) {
              var iframe = jQuery(".cke_combopanel .cke_panel_frame");
              if ( iframe ) {
                var cssLink = document.createElement("link") 
                cssLink.href = Drupal.settings.characters.base_url
                    + Drupal.settings.basePath 
                    + Drupal.settings.characters.pose_stylesheet; 
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


