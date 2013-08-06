<?php

/**
 * Implements hook_panels_layouts().
 */
// Plugin definition
$plugin = array(
  'title' => t('3-3-6-6-6 bricks'),
  'category' => t('Bootstrap Three Columns'),
  'icon' => 'bootstrap_threecol_3_3_6_6_6_bricks.png',
  'theme' => 'bootstrap_threecol_3_3_6_6_6_bricks',
  'admin css' => '../../bootstrap_panels_admin.css',
  'regions' => array(
    'top' => t('Top'),
    'upper_left' => t('Upper left side'),
    'upper_middle' => t('Upper middle column'),
    'upper_right' => t('Upper right side'),
    'lower_left' => t('Lower left side'),
    'lower_right' => t('Lower right side'),
    'bottom' => t('Bottom'),
  ),
);
