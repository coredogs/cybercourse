/**
 * @file Plugin - authornote.
 */

(function() {
CKEDITOR.plugins.add('authornote', {
  requires: 'widget',
  icons: 'authornote',
  init: function(editor) {
    editor.widgets.add('authornote', {
      button: 'Insert a note',
      template:
        '<div class="authornote">' +
        '<h2 class="authornote-title">Title</h2>' +
        '<div class="authornote-content"><p>Content...</p></div>' +
        '</div>',
      editables: {
        title: {
          selector: '.authornote-title'
        },
        content: {
          selector: '.authornote-content'
        }
      },
      allowedContent:
              'div(!authornote); div(!authornote-content); h2(!authornote-title)',
      requiredContent: 'div(authornote)',
      upcast: function(element) {
        return element.name == 'div' && element.hasClass('authornote');
      }
    });
    //Add stylesheet.
    editor.on("instanceReady", function() {
      this.document.appendStyleSheet( Drupal.settings.authornote.stylesheet );
    });
    //Add toolbar button.
    editor.ui.addButton('AuthorNote', {
      label: 'Insert an author note',
      command: 'authornote',
      state: CKEDITOR.TRISTATE_ENABLED,
      icon: this.path + 'icons/authornote.png',
      toolbar: 'others'
    });
  }
});

} )();
