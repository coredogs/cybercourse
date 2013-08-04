<?php

/**
 * Preprocess variables for region.tpl.php
 *
 * @see region.tpl.php
 */
function cybercourse_preprocess_region(&$variables, $hook) {
//  if ($variables['region'] == 'content') {
//    $variables['theme_hook_suggestions'][] = 'region__no_wrapper';
//  }
  if ($variables['region'] == "sidebar_first") {
    //Remove well class from sidebar region.
    foreach ( $variables['classes_array'] as $index => $value ) {
      if ( $value == 'well' ) {
        unset( $variables['classes_array'][$index] );
        break;
      }
    }
  }
}

/**
 * Preprocess variables for block.tpl.php
 *
 * @see block.tpl.php
 */
function cybercourse_preprocess_block(&$variables, $hook) {
  $variables['classes_array'][] = 'well well-small';
  // Use a bare template for the page's main content.
//  KRM: Don't run stuff from parent theme again?
//  if ($variables['block_html_id'] == 'block-system-main') {
//    $variables['theme_hook_suggestions'][] = 'block__no_wrapper';
//  }
//  $variables['title_attributes_array']['class'][] = 'block-title';
}

/**
 * Override theme_breadrumb().
 *
 * Print breadcrumbs as a list, with separators.
 * Remove the Home link.
 */
function cybercourse_breadcrumb($variables) {
  $old_breadcrumb = $variables['breadcrumb'];
  if (!empty($old_breadcrumb)) {
    //KRM - copy into new array, excpet for Home link.
    $breadcrumb = array();
    foreach ($old_breadcrumb as $key => $value) {
      if ( stristr($value, '>Home<') === FALSE ) {
        $breadcrumb[] = $value;
      }
    }
    //Maybe none left.
    if ( sizeof($breadcrumb) == 0 ) {
      $breadcrumbs = '';
    }
    else {
      $breadcrumbs = '<ul class="breadcrumb">';
      $count = sizeof($breadcrumb) - 1;
      foreach ($breadcrumb as $key => $value) {
        if ($count != $key) {
          $breadcrumbs .= '<li>' . $value . '<span class="divider">/</span></li>';
        }
        else {
          $breadcrumbs .= '<li>' . $value . '</li>';
        }
      }
      $breadcrumbs .= '</ul>';
    } // End sizeof == 0
    return $breadcrumbs;
  }// End ! empty
}

/**
 * Preprocess variables for node.tpl.php
 *
 * @see node.tpl.php
 */
function cybercourse_preprocess_page(&$variables) {
  if ( isset($variables['node']) && ! $variables['node']->status ) {
    $variables['classes_array'][] = 'node-unpublished';
  }
}

/**
 * Bootstrap theme wrapper function for the secondary menu links
 */
function cybercourse_menu_tree__secondary(&$variables) {
  global $user;
  $variables['tree']
      = str_replace('My account', 'User: ' . $user->name, $variables['tree']);
  return '<ul class="menu nav pull-right">' . $variables['tree'] . '</ul>';
}

function cybercourse_menu_link(array $variables) {
  $element = $variables['element'];
  $sub_menu = '';
  
  if ($element['#below']) {

    // Prevent dropdown functions from being added to management menu as to not affect navbar module.
    if (($element['#original_link']['menu_name'] == 'management') && (module_exists('navbar'))) {
      $sub_menu = drupal_render($element['#below']);
    }
    else if (($element['#original_link']['menu_name'] == 'menu-author') ) {
      $element['#attributes']['class'][] = 'author-menu-parent';
      $sub_menu = drupal_render($element['#below']);
    }
    else {
      // Add our own wrapper
      unset($element['#below']['#theme_wrappers']);
      $sub_menu = '<ul class="dropdown-menu">' . drupal_render($element['#below']) . '</ul>';
      $element['#localized_options']['attributes']['class'][] = 'dropdown-toggle';
      $element['#localized_options']['attributes']['data-toggle'] = 'dropdown';

      // Check if this element is nested within another
      if ((!empty($element['#original_link']['depth'])) && ($element['#original_link']['depth'] > 1)) {
        // Generate as dropdown submenu
        $element['#attributes']['class'][] = 'dropdown-submenu';
      }
      else {
        // Generate as standard dropdown
        $element['#attributes']['class'][] = 'dropdown';
        $element['#localized_options']['html'] = TRUE;
        $element['#title'] .= ' <span class="caret"></span>';
      }

      // Set dropdown trigger element to # to prevent inadvertant page loading with submenu click
      $element['#localized_options']['attributes']['data-target'] = '#';
    }
  }
 // Issue #1896674 - On primary navigation menu, class 'active' is not set on active menu item.
 // @see http://drupal.org/node/1896674
 if (($element['#href'] == $_GET['q'] || ($element['#href'] == '<front>' && drupal_is_front_page())) && (empty($element['#localized_options']['language']) || $element['#localized_options']['language']->language == $language_url->language)) {
   $element['#attributes']['class'][] = 'active';
 }
  $output = l($element['#title'], $element['#href'], $element['#localized_options']);
  return '<li' . drupal_attributes($element['#attributes']) . '>' . $output . $sub_menu . "</li>\n";
}
