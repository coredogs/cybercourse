<?php
/**
 * @file
 * thing_maker.features.inc
 */

/**
 * Implements hook_node_info().
 */
function thing_maker_node_info() {
  $items = array(
    'thing' => array(
      'name' => t('Thing'),
      'base' => 'node_content',
      'description' => t('Feature test'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
  );
  return $items;
}
