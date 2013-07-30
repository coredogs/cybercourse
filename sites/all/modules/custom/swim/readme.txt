The file ckeditor.config.js is in the ckeditor module's directory.

The SWIM CKEditor plugin is in the ckeditor module's plugin directory.

Containership:

UI dialog

  Title bar
  
  swim-preview-outer
  
    swim-preview-toolbar

    swim-preview-wrapper-table

      swim-preview-wrapper-row

        //swim-preview-device - black edges of device.

          iframe#swim-device-screen display:table-cell
      

Desktop: Everything resizes automatically. overflow: visible?
  swim-device: no padding or margin.

Tablet/phone: 
  
    swim-preview-device: overflow: starts fixed size, matching device
      overflow:visible? CLipped? Scroll?
      margin: some, black;
      padding: some, little

      swim-device-screen: scroll as needed.