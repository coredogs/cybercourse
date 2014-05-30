<?php

/* 
 * Utility functions
 */

/**
 * Check whether the current user has a give role(s).
 * @global stdClass $user Current user.
 * @param string or array $roles Role(s) to check for.
 * @return boolean True if the user has at least one of the roles.
 */
function cybercourse_base_current_user_has_role($roles) {
  global $user;
  if ( is_array($roles) ) {
    $check = array_intersect($roles, array_values($user->roles));
    $result = empty($check) ? FALSE : TRUE;
  }
  else {
    $result = in_array($roles, $user->roles);
  }
  return $result;
}

/**
 * 
 * @param type $timestamp
 * @return string Date/time in 8601, using user's timezone.
 */
function cybercourse_base_timestamp_to_iso6801( $timestamp ) {
  $result = format_date($timestamp, 'custom', 'c', date_default_timezone());
  return $result;
}

