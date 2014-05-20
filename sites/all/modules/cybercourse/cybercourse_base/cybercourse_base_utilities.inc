<?php

/* 
 * Utility functions
 */

/**
 * Check whether the current user has a role.
 * @global stdClass $user Current user.
 * @param array $roles Roles to check for.
 * @return boolean True if the user has at least one of the roles.
 */
function cybercourse_base_current_user_has_role(array $roles) {
  global $user;
  $check = array_intersect($roles, array_values($user->roles));
  return empty($check) ? FALSE : TRUE;
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