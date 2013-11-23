CKEDITOR.dialog.add( 'dogDialog', function ( editor ) {
    return {
        title: 'Add a dog',
        minWidth: 400,
        minHeight: 200,

        contents: [
            {
                id: 'tab-dog',
                label: 'Dog settings',
                elements: [
                  {
                      type: 'text',
                      id: 'dog_name',
                      label: 'Name',
                      validate: CKEDITOR.dialog.validate.notEmpty( "Name field cannot be empty" )
                  },
                  {
                      type: 'text',
                      id: 'legs',
                      label: 'Legs',
                      validate: CKEDITOR.dialog.validate.notEmpty( "Legs field cannot be empty" )
                  }
                ]
            },
            {
              id: 'tab-other',
              label: 'Other stuff',
              elements: [
                {
                  type: 'vbox',
                  align: 'right',
                  width: '200px',
                  children: [
                      {
                          type: 'text',
                          id: 'age',
                          label: 'Age'
                      },
                      {
                          type: 'text',
                          id: 'sex',
                          label: 'Sex'
                      },
                      {
                          type: 'text',
                          id: 'nationality',
                          label: 'Nationality'
                      }
                  ]
                }
              ]
            },
            {
              id: 'tab-exercises',
              label: 'Exercises',
              elements: [
                {
                  type: 'html',
                  html: '<h1>FART</h1>',
                  onClick: function() {
                    alert('Phhht');
                  }
                }
              ]
              
            }
        ],
        onOk: function() {
            var dialog = this;
            var dog = editor.document.createElement( 'span' );
            dog.setText( 
              dialog.getValueOf( 'tab-dog', 'dog_name' ) 
              + ' with ' + dialog.getValueOf( 'tab-dog', 'legs' ) + ' legs'
            );
            editor.insertElement( dog );
        }
      }
    });