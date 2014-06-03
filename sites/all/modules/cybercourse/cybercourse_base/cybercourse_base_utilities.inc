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
function cybercourse_base_user_has_role($user, $roles) {
  //Load the user to check, depending on the type of the first argument.
  if ( is_integer($user) ) {
    //It's a uid.
    $user = user_load($user);
    if ( ! $user ) {
      $message = __FILE__ . ' (line ' . __LINE__ . ') ' . __FUNCTION__ 
          . ' bad uid: ' . $user;
      cybercourse_base_handle_error( $message );
      return FALSE;
    }
  }
  else if ( is_object($user) ) {
    if ( ! isset( $user->roles) ) {
      $message = __FILE__ . ' (line ' . __LINE__ . ') ' . __FUNCTION__ 
          . ' bad user object: <pre>' . print_r($user, TRUE) . '</pre>';
      cybercourse_base_handle_error( $message );
      return FALSE;
    }
  }
  else {
    $message = __FILE__ . ' (line ' . __LINE__ . ') ' . __FUNCTION__ 
        . ' bad thing passed: <pre>' . print_r($user, TRUE) . '</pre>';
    cybercourse_base_handle_error( $message );
    return FALSE;
  }
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
 * Check whether the current user has a give role(s).
 * @global stdClass $user Current user.
 * @param string or array $roles Role(s) to check for.
 * @return boolean True if the user has at least one of the roles.
 */
function cybercourse_base_current_user_has_role($roles) {
  global $user;
  return cybercourse_base_user_has_role($user, $roles);
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

