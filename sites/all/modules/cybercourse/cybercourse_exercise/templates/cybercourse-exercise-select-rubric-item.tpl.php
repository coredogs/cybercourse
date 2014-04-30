<?php
/* 
* Template for HTML for UI for selecting rubric item for exercise.
*/

/**
 * The interface for existing items.
 * 
 * Part 1. The container for all the existing items.
 * 
 */
?>
<div id='rubric-select-current-items-ui' class="form-item form-group">
  <label id='rubric-select-current-items-ui-title' for="rubric-select-ui">
    Rubric items
  </label>
<?php /* Collection of existing item templates goes here. See part 2. */ ?>
  <div id="rubric-select-link-item-container">
    <button id="rubric-select-link-item" type="button"
            title="Link to a rubric item">Add rubric item link</button>
  </div>
</div>

<?php
/**
 * The interface for existing items.
 * 
 * Part 2. Template for one existing item.
 * 
 */
?>
  <div class="rubric-select-current-item-container" data-nid="">
    <span class="rubric-select-current-item-title"></span>
    <button class="rubric-select-current-item-edit" type="button"
            title="View/edit this rubric item">Edit</button>
    <button class="rubric-select-current-item-unlink" type="button"
            title="Unlink this item from the exercise">Unlink</button>
  </div>

<?php
/*
* The rubric item selection interface.
*/
?>
<div id='rubric-select-loading-throbber'>
  Loading linked rubric items...
  <div class='ajax-progress ajax-progress-throbber'>
    <div class='throbber'>&nbsp;</div>
  </div>
</div>
<div id='rubric-select-ui' class="form-item form-group">
  <label id='rubric-select-ui-title' for="rubric-select-ui">
      Select a rubric item to link
  </label>
  <div id="rubric-select-ui-widget-container">
    <div id='rubric-select-ui-row1'>
      <div id='term-tree-container'>
        <div id='term-tree-label'>Filter rubric items</div>
        <div id='term-tree'></div>
      </div>
      <div id='filtered-terms-container'>
        <div id='filtered-terms-label'>Choose one item</div>
        <ul id='filtered-terms'></ul>
      </div>
    </div>
    <div id='rubric-select-ui-row2'>
      <div id='term-tree-ui-mt-cell'>
        &nbsp;
      </div>
      <div id='rubric-select-buttons-container'>
        <button id='rubric-select-create' type='button' 
            title="Create a new rubric item">Create</button>
        <button id='rubric-select-edit' type='button'
            title="View/edit the selected rubric item">Edit</button>
        <button id='rubric-select-link' type='button'
            title="Link the exercise to this item">Link</button>
        <button id='rubric-select-cancel' type='button'
            title="Forget it">Cancel</button>
      </div>
    </div>
  </div>
</div>
