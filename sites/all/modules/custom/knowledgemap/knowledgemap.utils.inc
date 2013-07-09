<?php
/**
 * Support functions for KM.
 */

/**
 * Store something in the module's user-specific cache.
 * @param type $cache_id Cache item id.
 * @param type $value Thing to cache.
 */
function knowledgemap_store_in_cache( $cache_id, $value ) {
  ctools_include('object-cache');
  global $user;
  $cache_id .= $user->uid;
  ctools_object_cache_set('knowledgemap', $cache_id, $value);
}

/**
 * Get something from the module's user-specific cache.
 * @param type $cache_id Cache item id.
 * @return type Cached item.
 */
function knowledgemap_get_from_uncache( $cache_id ) {
  ctools_include('object-cache');
  global $user;
  $cache_id .= $user->uid;
  return ctools_object_cache_get('knowledgemap', $cache_id);
}

/**
 * Compute the DOM id for the drawing area.
 * @param integer $id An id of some type.
 * @param integer $delta Delta for multiple field instances.
 * @return string DOM id for the drawing area.
 */
function knowledgemap_compute_drawing_id( $id ) {
  return 'km-' . $id . '-drawing';
}

/**
 * Return instantiated template for KM.
 * @param string $drawing_dom_id DOM id. 
 * @return string HTML.
 */
function knowledgemap_edit_template( $drawing_dom_id ) {
  $output = '<div id="' . $drawing_dom_id . '" class="km-drawing">
       </div>';
  return $output;
}

/**
 * Log an exception.
 * @return Message.
 */
function knowledgemap_log_exception(Exception $e) {
  $message = t(
      'Exception: @messsage \n'
    . 'Code: @code \n'
    . 'File: @file \n'
    . 'Line: @line',
    array(
      '@messsage' => $e->getMessage(),
      '@code' => $e->getCode(),
      '@file' => $e->getFile(),
      '@line' => $e->getLine(),
    )
  );
  watchdog( 'knowledgemap', $message, NULL, WATCHDOG_WARNING );
  return $message;
}