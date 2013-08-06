<div class="panel-display bootstrap-threecol-3-3-6-6-6-bricks" <?php if (!empty($css_id)) { print "id=\"$css_id\""; } ?>>
  <div class="row-fluid">
    <div class="panel-panel span12">
      <?php print $content['top']; ?>
    </div>
  </div>
  <div class="row-fluid">
    <div class="panel-panel span3">
      <?php print $content['upper_left']; ?>
    </div>
    <div class="panel-panel span3">
      <?php print $content['upper_middle']; ?>
    </div>
    <div class="panel-panel span6">
      <?php print $content['upper_right']; ?>
    </div>
  </div>
  <div class="row-fluid">
    <div class="panel-panel span6">
      <?php print $content['lower_left']; ?>
    </div>
    <div class="panel-panel span6">
      <?php print $content['lower_right']; ?>
    </div>
  </div>
  <div class="row-fluid">
    <div class="panel-panel span12">
      <?php print $content['bottom']; ?>
    </div>
  </div>
</div>
