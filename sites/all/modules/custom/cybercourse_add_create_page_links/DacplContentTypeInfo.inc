<?php
/**
 * @file
 * Manages info about some Dolfinity content types.
 * @author mathieso
 */
class DacplContentTypeInfo {
  /**
   * Singleton pattern. 
   * See http://www.ibm.com/developerworks/library/os-php-designptrns/
   */
  public static $instance = NULL;

  /**
   * Make a DatmFrontPageData object.
   * @return DatmFrontPageData object.
   */
  public static function getCache( $check_exists = FALSE) {
    if( ! isset(self::$instance) ) {
      if ( $check_exists ) {
        throw new Exception(
            'DacplContentTypeInfo: data has not been loaded yet. ' .
            'Mayhap your dog could help.'
        );
      }
      self::$instance = new DacplContentTypeInfo();
    }
    return self::$instance;
  }
  
  /**
   * Constructor not callable outside class.
   */
  protected function __construct() {
    $this->content_types = node_type_get_names();
    $this->available_parent_content_types = array(
      'dolfin',
      'dolfin_content_page',
      'blueprint',
      'blueprint_content_page',
    );
    $this->available_child_content_types = array(
      'dolfin_content_page',
      'blueprint_content_page',
    );
  }
  
  /**
   * All Drupal content types.
   * @var array
   */
  protected $content_types = NULL;
  
  /**
   * Content types that can be a parent.
   * @var array
   */
  protected $available_parent_content_types = NULL;
  
  /**
   * Content types that can be a child.
   * @var array
   */
  protected $available_child_content_types = NULL;
  
  /**
   * Can a page of a given content type be a parent?
   * @param string $type_machine_name Machine name of the content type.
   * @return boolean True if a page of this content can be a parent.
   */
  public function isParentContentType($type_machine_name) {
    return in_array($type_machine_name, $this->available_parent_content_types);
  }
  
  /**
   * Can a page of a given content type be a child?
   * @param string $type_machine_name Machine name of the content type.
   * @return boolean True if a page of this content can be a parent.
   */
  public function isChildContentType($type_machine_name) {
    return in_array($type_machine_name, $this->available_child_content_types);
  }
  
  public function getDisplayName($type_machine_name) {
    if ( ! in_array($type_machine_name, $this->content_types) ) {
      return NULL;
    }
    return $this->content_types[$type_machine_name];
  }
}

?>
