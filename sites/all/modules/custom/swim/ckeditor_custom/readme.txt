There isn't a good way to manage custom CKEditor config files and plugins, 
to keep them safe from being overwritten on module/theme upgrades.

Wanker solution: When swim_form_alter fires, it checks to see if it is 
altering a node form. If it is:

* Check to make sure that ckeditor.config.js is in the active theme's 
directory. The CKEditor SWIM profile is set up to expect this. If the 
file isn't there, swim_form_alter tries to copy the file from 
swim/ckeditor_custom/ckeditor.config.js to the theme directory 
(the top-level theme dir, not a subdir). If the theme dir is not 
writable, the copy will fail. The Apache user needs to have 
permissions to write to this dir. Perms can be revoked once the 
writing has been done.

* Check to make sure that the preview plugin is in ckeditor/plugins/preview. 
If the file isn't there, swim_form_alter tries to copy the preview dir 
from swim/ckeditor_custom/preview to ckeditor/plugins/preview. If the target 
dir is not writable, the copy will fail. The Apache user needs to have 
permissions to write to this dir. Perms can be revoked once the writing 
has been done.
