<?php

/**
 * Represents a field storing knowledge map item type.
 * Can be MT.
 *
 * @author mathieso
 */

class KmItemType {
  protected $item_type_code = '';
  
  protected static $item_type_definition = array(
    'skill' => array(
      'display_name' => 'Skill',
      'is_knowledge' => TRUE,
      'is_experience' => FALSE,
    ),
    'concept' => array(
      'display_name' => 'Concept',
      'is_knowledge' => TRUE,
      'is_experience' => FALSE,
    ),
    'explanation' => array(
      'display_name' => 'Explanation',
      'is_knowledge' => FALSE,
      'is_experience' => TRUE,
    ),
    'example' => array(
      'display_name' => 'Example',
      'is_knowledge' => FALSE,
      'is_experience' => TRUE,
    ),
    'exercise' => array(
      'display_name' => 'Exercise',
      'is_knowledge' => FALSE,
      'is_experience' => TRUE,
    ),
    'pattern' => array(
      'display_name' => 'Pattern',
      'is_knowledge' => FALSE,
      'is_experience' => TRUE,
    ),
    'other' => array(
      'display_name' => 'Other',
      'is_knowledge' => FALSE,
      'is_experience' => TRUE,
    ),
  );
  
  /**
   * Constructor. Takes a valid code or empty string.
   * @param type $item_type_value Type value.
   * @return KmItemType New item type instance.
   */
  public function __construct($item_type_value = '') {
    $this->setCode($item_type_value);
  }
  
  /**
   * Set the item type code.
   * @param string $item_type_value Code to store.
   * @return KmItemType $this, for chaining.
   * @throws Exception Something bad happened.
   */
  public function setCode($item_type_value = '') {
    $item_type_value = strtolower($item_type_value);
    if (    $item_type_value != ''
         && ! isset( KmItemType::$item_type_definition[$item_type_value] ) 
       ) {
      throw new Exception(
          'KmItemType.setItemTypeCode: unknown code: ' . $item_type_value
      );
    }
    $this->item_type_code = $item_type_value;
    //Return this for chaining.
    return $this;
  }
  
  /**
   * Return the item code for this item type instance.
   * @return string Code
   */
  public function getCode() {
    return $this->item_type_code;
  }
  
  
  /**
   * Is the item knowledge?
   * @return boolean TRUE if the item is knowledge, else FALSE.
   */
  public function isKnowledge() {
    return 
      KmItemType::$item_type_definition[$this->item_type_code]['is_knowledge'];
  }

  /**
   * Is the item an experience?
   * @return boolean TRUE if the item is an experience, else FALSE.
   */
  public function isExperience() {
    return 
      KmItemType::$item_type_definition[$this->item_type_code]['is_experience'];
  }
  
  /**
   * Return item type's display name.
   * @return string Display name.
   */
  public function getDisplayName() {
    return 
      KmItemType::$item_type_definition[$this->item_type_code]['display_name'];
  }
  
  /**
   * Return item type definitions.
   * @return array Item type definitions.
   */
  public static function getItemTypeDefinitions() {
    return clone KmItemType::$item_type_definition;
  }
    
}

