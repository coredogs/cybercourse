<?php

function cybercourse_admin_menu_link(array $variables) {
  $element = $variables['element'];
  //KRM: Add the menu name to the element.
  $element['#attributes']['class'][] = $element['#original_link']['menu_name'];
  
  $output = l($element['#title'], $element['#href'], $element['#localized_options']);
  return '<li' . drupal_attributes($element['#attributes']) . '>' . $output . "</li>\n";
}

