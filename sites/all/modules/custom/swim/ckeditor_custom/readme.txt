There isn't a good way to manage custom CKEditor config files and plugins, 
to keep them safe from being overwritten on module/theme upgrades.

Wanker solution: When swim_form_alter fires, it checks to see if it is 
altering a node form. If it is:

* Check to make sure that the peek plugin is in ckeditor/plugins/peek. 
If the file isn't there, swim_form_alter tries to copy the peek dir 
from swim/ckeditor_custom/peek to ckeditor/plugins/peek. If the target 
dir is not writable, the copy will fail. The Apache user needs to have 
permissions to write to this dir. Perms can be revoked once the writing 
has been done.

* swim_form_alter tries to copy ckeditor.config.js from 
swim/ckeditor_custom/ckeditor.config.js to sites/modules/ckeditor. It renames
the existing file first, adding .original at the end. If the destination is not 
writable, the copy will fail. The Apache user needs to have 
permissions to write to this dir. Perms can be revoked once the 
writing has been done.
