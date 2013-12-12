<?php
/*
 * Use modals for editing attainment levels on rubric items.
 */

function cybercourse_tweaks_modal_paths() {
  $paths = array();

  $paths['field-collection/field-attainment-levels/%field_collection_item/edit'] = array(
    'style' => 'attainment-levels-edit',
    'redirect' => 'field-collection/field-attainment-levels/%field_collection_item',
    'close' => TRUE,
  );

  $paths['field-collection/field-attainment-levels/add/node/%field_collection_item'] = array(
    'style' => 'attainment-levels-edit',
    'redirect' => 'field-collection/field-attainment-levels/%field_collection_item',
    'close' => TRUE,
  );
  
  $paths['field-collection/field-attainment-levels/%field_collection_item/delete'] = array(
    'style' => 'attainment-levels-delete',
    'redirect' => 'field-collection/field-attainment-levels/%field_collection_item',
    'close' => TRUE,
  );
  
//  drupal_set_message('in t_modal_paths');
  return $paths;
}

/**
* Implements hook_modal_styles().
*/
function cybercourse_tweaks_modal_styles() {

//drupal_set_message('start t_modal_styles');

  $styles = array();

  $styles['attainment-levels-edit'] = array(
    'modalSize' => array(
      'type' => 'fixed',
      'width' => 800,
      'height' => 500,
    ),
  );

  $styles['attainment-levels-delete'] = array(
    'modalSize' => array(
      'type' => 'scale',
      'width' => 0.4,
      'height' => 0.4,
    ),
    'modalTheme' => 'CToolsModalAttainmentDelete',
  );

  
  return $styles;
}


