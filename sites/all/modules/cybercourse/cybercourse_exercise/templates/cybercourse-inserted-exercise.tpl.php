<?php
/**
 * @file
 * cybercourse-inserted-exercise.tpl.php
 *
 * Template for an exercise inserted in another page.
 * 
 * Variables
 * - $title: The title of the exercise.
 * - $body: Exercise details.
 * - $labeled_links: array of data about link to show. Format of each entry:
 *    'version_label' => Which version. Usually MT.
 *    'status_message' => Whether submitted, has feedback, etc. Often MT.
 *    'link' => Rendered link.
 */
?>
<div class="cyco-inserted-exercise">
  <div class="cyco-inserted-exercise-title">
    Exercise: <?php print $title; ?>
  </div>
  <div class="cyco-inserted-exercise-content">
    <?php print $body; ?>
  </div>
  <div class="cyco-inserted-exercise-links-container">
    <?php 
      foreach( $labeled_links as $labeled_link ) {
        print '<div class="cyco-inserted-exercise-link-container">' . "\n";
        print '  <div class="cyco-inserted-exercise-link-version">' . "\n";
        print '    ' . $labeled_link['version_label'] . "\n";
        print '  </div>' . "\n";
        print '  <div class="cyco-inserted-exercise-link-status">' . "\n";
        print '    ' . $labeled_link['status_message'] . "\n";
        print '  </div>' . "\n";
        print '  <div class="cyco-inserted-exercise-link-link">' . "\n";
        print '    ' . $labeled_link['link'] . "\n";
        print '  </div>' . "\n";
        print '</div>' . "\n";
    } ?>
  </div>
</div>
