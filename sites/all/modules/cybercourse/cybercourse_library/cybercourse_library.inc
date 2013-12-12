<?php

/**
 * Is the logged in user an author?
 * @global stdClass $user The thing, you know.
 * @return boolean True if the user is an author.
 */
function _cacpl_user_is_author_admin() {
  global $user;
  return 
         in_array( 'author', $user->roles )
      || in_array( 'administrator', $user->roles )
      || ( isset( $user->id ) && $user->id == 1 );
}

