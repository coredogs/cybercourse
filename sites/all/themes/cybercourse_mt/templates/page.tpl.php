<?php

/**
 * @file
 * MT's theme implementation to display a single, MT Drupal page.
 * Used for showing nothing but main content. 
 * SWIM uses this for content previews. When SWIM starts, is uses this
 * template to get a generic page, with no content. It keeps the page in an iframe. 
 * When the user wants a preview, the content to be previewed is sent
 * to the server, rendered, returned to the client, and inserted into the 
 * MT page generated when SWIM started.
 * 
 * This tpl.php is based on cybercourse's page.tpl.php. Different themes will
 * need their own.
 *
 * The doctype, html, head and body tags are not in this template. Instead they
 * can be found in the html.tpl.php template normally located in the
 * modules/system directory.
 */
?>
<div class="main-container container-fluid">
  <section class="col-sm-12">
      <a id="main-content"></a>
      <?php print render($page['content']); ?>
  </section>  
</div>
