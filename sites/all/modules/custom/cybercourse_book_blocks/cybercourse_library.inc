<?php

/**
 * Library of random stuff. 
 */

/**
 * Is the logged in user an author?
 * @global stdClass $user The thing, you know.
 * @return boolean True if the user is an author.
 */
function _cbb_user_is_author_admin() {
  global $user;
  return in_array( 'author', $user->roles );
}


/**
 * Is this the main domain?
 * @return boolean True if this is the main domain.
 */
function _dlib_is_main_domain() {
  $current_domain = domain_get_domain();
  $current_domain_id = $current_domain['domain_id'];
  return ( $current_domain_id == domain_default_id() );
}

/**
 * Does the user have a given role in the current domain?
 * @global stdClass $user User thing.
 * @param string $role Role to check for.
 * @return boolean True of user has the role.
 */
function _dlib_user_has_domain_role($role) {
  global $user;
  $extra_roles = domain_reference_roles_get_extra_roles($user);
  return in_array($role, $extra_roles);  
}

/**
 * Does the user have a given role? Not domain dependent.
 * @global stdClass $user User thing.
 * @param string $role Role to check for.
 * @return boolean True of user has the role.
 */
function _dlib_user_has_role($role) {
  global $user;
  return in_array($role, $user->roles);  
}

/**
 * Does the current user have builder permissions for the domain?
 */
function _dlib_user_is_builder() {
  return _dlib_user_has_domain_role('subsite builder');
}

/* Synonym - old name - replace */
function _dlib_check_builder () {
  return _dlib_user_is_builder();
}

/**
 * Does the current user have author permissions for the domain?
 */
function _dlib_user_is_author() {
  return _dlib_user_has_domain_role('subsite author');
}


/**
 * Is the logged in user a pod member?
 * @global stdClass $user The thing, you know.
 * @return boolean True if the user is a pod person.
 */
function _dlib_user_is_pod_member() {
  global $user;
  $extra_roles = domain_reference_roles_get_extra_roles($user);
  $pod_roles = array(
    'subsite author',
    'subsite builder',
    'subsite director',
  );
  $common_roles = array_intersect( $extra_roles, $pod_roles );
  $in_pod = ( sizeof($common_roles) > 1 ); //Is the user in the pod?
  return $in_pod;
}

/**
 * Does the current user have help writer role?
 */
function _dlib_user_is_help_writer() {
  return _dlib_user_has_role('help writer');
}

/* Synonym - old name - replace */
function _dlib_is_help_writer () {
  return _dlib_user_is_help_writer();
}

/**
 * Is the current user an admin?
 * @return boolean True if the user is an administrator.
 */
function _dlib_user_is_administrator() {
  return _dlib_user_has_role('administrator');
}