<?php
/** 
Template for displaying a pattern inside a node
 */
?>
<fieldset class="cyco-pattern-insert well well-small">
  <legend><?php print t('Pattern'); ?></legend>
  <p class="cyco-pattern-insert-title">
    <?php print $title; ?>
  </p>
  <?php if ( $situation ) { ?>
    <p class="cyco-pattern-insert-situation">
      <span class="situation-label"><?php print t('Situation: '); ?></span>
      <?php print $situation; ?>
    </p>
  <?php } ?>
  <?php if ( $actions ) { ?>
    <p class="cyco-pattern-insert-actions">
      <span class="actions-label"><?php print t('Actions: '); ?></span>
      <?php print $actions; ?>
    </p>
  <?php } ?>
  <?php if ( $category_links_rendered ) { ?>
    <p class="cyco-pattern-insert-categories-container">
      <span class="categories-label"><?php print t('Categories: '); ?></span>
      <?php print $category_links_rendered; ?>
    </p>
  <?php } ?>
  <?php if ( $more_link_destination ) { ?>
    <p class="cyco-pattern-insert-more-link">
      <a href="<?php print $more_link_destination; ?>" 
        title="<?php print t('Pattern details'); ?>"><?php print t('More...'); ?></a>
    </p>
  <?php } ?>
</fieldset>

