<?php

/**
 * Represents a knowledge map item, e.g., a skill.
 *
 * @author mathieso
 */

class KmItem {
  
  /**
   * The node corresponding to this item.
   */
  protected $node = '';

  /**
   * Nid of this item. Must be set.
   * @var integer
   */
  protected $nid;
  
  /**
   * Nid of the knowledge map this item is part of. Must be set.
   * @var integer
   */
  protected $km_nid;
  
  /**
   * Item node's title. Must be set.
   * @var string
   */
  protected $title;
  
  /**
   * Item type. Must be set.
   * @var KMItemType
   */
  protected $item_type;
  
  /**
   * Importance, from 1 to 10. MT string means no value.
   * @var integer
   */
  protected $importance = '';
  
  /**
   * Node body. Can be MT.
   * @var string
   */
  protected $body_content = '';
  
  /**
   * Position on screen, X axis (left is 0). MT string means no value.
   * @var integer
   */
  protected $coord_x = '';

  /**
   * Position on screen, Y axis (top is 0). MT string means no value.
   * @var integer
   */
  protected $coord_y = '';  
  
  public function __construct($nid_or_node, $km_nid) {
    if ( $nid_or_node instanceof stdClass ) {
      $node = $nid_or_node;
    }
    else if (is_numeric($nid_or_node) ) {
      $node = node_load($nid_or_node);
      if ( $node === FALSE ) {
        throw new Exception(
            'KmItem.construct: Load failed for nid: ' . $nid_or_node
        );
      }
    }
    $this->setNode($node);
    $this->setNid( $node->nid );
    $this->setKmNid( $km_nid );
    $this->setTitle( $node->title );
    $this->setItemType( $node->field_item_type[LANGUAGE_NONE][0]['value'] );
    $this->setBodyContent( $node->body[LANGUAGE_NONE][0]['value'] );
    $importance = isset( $node->field_importance[LANGUAGE_NONE][0]['value'] )
        ? $node->field_importance[LANGUAGE_NONE][0]['value']
        : '';
    $this->setImportance( $importance );
    $coord_x = isset( $node->field_coord_x[LANGUAGE_NONE][0]['value'] )
        ? $node->field_coord_x[LANGUAGE_NONE][0]['value']
        : '';
    $this->setCoordX( $coord_x );
    $coord_y = isset( $node->field_coord_y[LANGUAGE_NONE][0]['value'] )
        ? $node->field_coord_y[LANGUAGE_NONE][0]['value']
        : '';
    $this->setCoordY( $coord_y );
  }
  
  
  public function setNode($node) {
    if ( ! $node instanceof stdClass ) {
      throw new Exception('KmItem.setNode: Not stdClass');
    }
    $this->node = node;
    return $this;
  }
  
  
  public function getNode() {
    return $this->node;
  }
  
  /**
   * Set the item's nid.
   * @param integer $nid Nid
   * @return KmItem $this, for chaining.
   * @throws Exception Something bad happened.
   */
  public function setNid($nid) {
    if (    is_nan($nid)
         || ! is_numeric($nid)
         || $nid < 1
       ) {
      throw new Exception('KmItem.setNid: Bad nid format: ' . $nid);
    }
    if ( node_load($nid) === FALSE ) {
      throw new Exception('KmItem.setNid: Node not found. nid: ' . $nid);
    }
    $this->nid = $nid;
    return $this;
  }
  
  /**
   * Return the item's nid.
   * @return integer, MT for no value.
   */
  public function getNid() {
    return $this->nid;
  }

  /**
   * Set the nid of the knowledge map the item is part of.
   * @param integer $km_nid The nid. Must be set.
   * @return KmItem $this, for chaining.
   * @throws Exception Something bad happened.
   */
  public function setKmNid($km_nid) {
    if (    is_nan($km_nid)
         || ! is_numeric($km_nid)
         || $km_nid < 1
       ) {
      throw new Exception('KmItem.setKmNid: Bad nid format: ' . $km_nid);
    }
    $km_node = node_load($km_nid);
    if ( $km_node === FALSE ) {
      throw new Exception('KmItem.setKmNid: Node not found: ' . $km_nid);
    }
    if ( $km_node->type != 'learning_map' ) {
      throw new Exception(
        'KmItem.setKmNid: km_nid: ' . $km_nid . ' not a learning map.'
      );
    }
    $this->km_nid = $km_nid;
    return $this;
  }
  
  /**
   * Return the nid of the knowledge map this item is part of.
   * @return integer KM's nid.
   */
  function getKmNid() {
    return $this->km_nid;
  }
  
  /**
   * Set the title. Cannot be MT.
   * @param string $title
   * @return KmItem $this, for chaining.
   * @throws Exception Something bad happened.
   */
  public function setTitle($title) {
    if ( empty($title) ) {
      throw new Exception('KmItem.setTitle: Title cannot be MT');
    }
    $this->title = $title;
    return $this;
  }
  
  /**
   * Return the item's title.
   * @return string Title
   */
  public function getTitle() {
    return $this->title;
  }
  
  /**
   * Set the item type code.
   * @param string $item_type_code The type code.
   * @return KmItem $this, for chaining.
   */
  public function setItemType($item_type_code) {
    $this->item_type = new KmItemType($item_type_code);
    return $this;
  }
  
  /**
   * Return the item type.
   * @return KmItemType The type.
   */
  public function getItemType() {
    return $this->item_type;
  }

  /**
   * Set importance. MT string means no value.
   * @param integer $importance Importance, from 1 to 10.
   * @return KmItem $this, for chaining.
   * @throws Exception Something bad happened.
   */
  public function setImportance($importance) {
    if ( $importance != '' ) {
      if ( is_nan($importance)
         || ! is_numeric($importance)
         || $importance < 1 
         || $importance > 10
         ){
        throw new Exception('KmItem.setImportance: Bad value: ' . $importance);
      }
    }
    $this->importance = $importance;
    return $this;
  }
  
  /**
   * 
   * @return integer The importance, MT for no value.
   */
  public function getImportance() {
    return $this->importance;
  }
  
  /**
   * Set the body content.
   * @param string $content The content.
   */
  public function setBodyContent($content) {
    $this->body_content = $content;
  }
  
  /**
   * Return the item's body content.
   * @return string The content.
   */
  public function getBodyContent() {
    return $this->body_content;
  }
  
  /**
   * Set X coord of the item on the client display. Left is 0.
   * @param integer $coord_x Coord
   * @throws Exception Something bad happened.
   */
  public function setCoordX($coord_x) {
    if ( $coord_x != '' ) {
      if ( is_nan($coord_x)
         || ! is_numeric($coord_x)
         || $coord_x < 0 
         ){
        throw new Exception('KmItem.setCoordX: Bad value: ' . $coord_x);
      }
    }
    $this->coord_x = $coord_x;
  }
  
  /**
   * Return the x coord of the item's display.
   * @return integer X coord.
   */
  public function getCoordX() {
    return $this->coord_x;
  }
  
  /**
   * Set Y coord of the item on the client display. Top is 0.
   * @param integer $coord_y Coord
   * @throws Exception Something bad happened.
   */
  public function setCoordY($coord_y) {
    if ( $coord_y != '' ) {
      if ( is_nan($coord_y)
         || ! is_numeric($coord_y)
         || $coord_y < 0 
         ){
        throw new Exception('KmItem.setCoordY: Bad value: ' . $coord_y);
      }
    }
    $this->coord_y = $coord_y;
  }

  /**
   * Return the y coord of the item's display.
   * @return integer Y coord.
   */
  public function getCoordY() {
    return $this->coord_y;
  }
  
  /**
   * Clone the item. See https://drupal.org/node/1388922.
   * @param integer $clone_km_nid The KM to associate the cloned item with.
   * @global stdClass $user The current user.
   * @return KmItem New item
   * @throws Exception Something bad happened.
   */
  public function cloneItemIntoKm($clone_km_nid) {
    global $user;
    //Create the new node.
    $node = new stdClass();
    $node->title = $this->getTitle();
    $node->type = 'knowledge_map_item';
    node_object_prepare($node); // Sets some defaults. Invokes hook_prepare() and hook_node_prepare().
    $node->language = LANGUAGE_NONE; // Or e.g. 'en' if locale is enabled
    $node->uid = $user->uid;
    $node->status = 1; //(1 or 0): published or not
    $node->promote = 0; //(1 or 0): promoted to front page
    $node->comment = 2; // 0 = comments disabled, 1 = read only, 2 = read/write
    //Item type.
    $node->field_item_type[$node->language][0]['value'] 
        = $this->getItemType()->getCode();
    //Importance.
    if ( $this->getImportance() != '' ) {
      $node->field_importance[$node->language][0]['value'] 
          = $this->getImportance();
    }
    //Body content
    $node->field_coord_x[$node->language][0]['value']
        = $this->getBodyContent();
    //Coord X.
    if ( $this->getCoordX() != '' ) {
      $node->field_coord_x[$node->language][0]['value'] 
          = $this->getCoordX();
    }
    //Coord Y.
    if ( $this->getCoordY() != '' ) {
      $node->field_coord_y[$node->language][0]['value'] 
          = $this->getCoordY();
    }
    $node = node_submit($node); // Prepare node for saving
    node_save($node);
    if ( ! isset($node->nid) || empty($node->nid) ) {
      throw new Exception('KmItem.cloneItem: Clone of nid=' . $this->nid . ' failed');
    }
    //Create new KmItem object.
    $clone = new KmItem($node, $clone_km_nid);
    //Create relationship betwixt new node and knowledge map.
    $endpoints = array(
      array('entity_type' => 'node', 'entity_id' => $node->nid),
      array('entity_type' => 'node', 'entity_id' => $clone_km_nid),
    );
    //Create new relation object.
    $new_relation = relation_create(RELATION_NAME_ITEM_TO_KM, $endpoints);
    //Save it.
    $rid = relation_save($new_relation);
    if ( $rid === FALSE ) {
      throw new Exception('KmItem.cloneItem: KM relationship creation failed.');
    }
    return $clone;
    }

}

