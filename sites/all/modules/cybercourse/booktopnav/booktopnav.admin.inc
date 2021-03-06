<?php
// $Id$

/**
 * @file
 * Administration page callbacks for the booktopnav module.
 */

/**
 * Form builder. Configure when the navigation appears.
 *
 * @ingroup forms
 * @see system_settings_form().
 */
function booktopnav_admin_settings() {
  $form['#validate'][] = 'booktopnav_validate_admin_settings';
  $form['booktopnav_show_toc'] = array(
    '#type' => 'checkbox',
    '#title' => t('Top navigation bar includes tables of contents'),
    '#default_value' =>
        variable_get('booktopnav_show_toc', BOOKTOPNAV_DEFAULT_SHOW_TOC),
    '#description' => t(
        'If this is off (recommended), tables of contents are omitted from the top navigation bar.'
    ),
  );
  $form['booktopnav_min_content_length'] = array(
    '#type' => 'textfield',
    '#title' => t('Minimum content length'),
    '#default_value' => 
        variable_get('booktopnav_min_content_length', BOOKTOPNAV_DEFAULT_MIN_CHARS),
    '#description' => t(
        "Content must be at least this many characters long before
the navigation bar will appear. The character count includes HTML markup."
    ),
  );
  return system_settings_form($form);
}

/**
 * Validate data in the admin form.
 */
function booktopnav_validate_admin_settings($form, &$form_state) {
  $min_length = trim($form_state['values']['booktopnav_min_content_length']);
  $min_length = check_plain($min_length);
  if ( $min_length == '' || !is_numeric($min_length) ) {
    form_set_error(
      'booktopnav_min_content_length',
      t('The minimum content length should be a number greater than or equal to zero.')
    );
    return;
  }
  //Explicitly cast to a number, so extra cruft characters go away.
  $min_length = (int)$min_length;
  if ( $min_length < 0 ) {
    form_set_error(
      'booktopnav_min_content_length',
      t('The minimum content length should be a number greater than or equal to zero.')
    );
    return;
  }
  //Put the decrufted integer back into $form_state.
  $form_state['values']['booktopnav_min_content_length'] = $min_length;
}
