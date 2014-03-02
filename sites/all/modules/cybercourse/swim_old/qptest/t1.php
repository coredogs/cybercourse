<?php

require '../../../../libraries/querypath//src/qp.php';

$html = '<img src="grim.gif" title="Grim things">';

$r = qp($html, 'img')->attr('title');
//print $r;

$text = '
<div class="prescriptionImg">
<span class="Imagedalignment"><img src="/webcontent/images/drug/DrugItem_225.JPG" alt="Cymbalta 30mg DR Cap"></span>
</div>
<div class="blueBox">
<div class="blueBoxContainer"><span class="blueBox_img">
<img src="/webcontent/images/prescription/icon_ready_for_refill.png" alt=""> </span>
<span class="blueBox_content"><b style="font-size: 12px; color: green">Ready for Refill.</b> Not refilling as directed could impact your health.</span></div>



<div class="prescriptionCell">
<div class="prescriptionCellInner">

<a class="patient_amount_info" href="/drug/detail?ndc11=00002327030&amp;DrugInfoPage=NDC&amp;Drug20Name=CYMBALTA-60-MG-CAPSULE"><h4>CYMBALTA 60 MG CAPSULE</h4></a>
<div class="floatContainer">
<div class="prescriptionImg">
<span class="Imagedalignment"><img src="/webcontent/images/drug/DrugItem_13561.JPG" alt="Cymbalta 60mg DR Cap"></span>
</div>

<div class="blueBox">
<div class="blueBoxContainer"><span class="blueBox_img">
<img src="/webcontent/images/prescription/icon_ready_for_refill.png" alt=""> </span>
<span class="blueBox_content"><b style="font-size: 12px; color: green">Ready for Refill.</b> Not refilling as directed could impact your health.</span></div>

';

$imgs = qp($text, 'img');

foreach( $imgs as $img ) {
//  print $img->html();
}
  //Need the ? to make it lazy, not greedy.
  $pattern = '/\<img.*?\>/';
  $text = preg_replace_callback(
      $pattern, 
      function ($matches) {
//        print $matches[0]."\n";
        $file = htmlqp($matches[0], 'img')->attr('src');
        $alt = htmlqp($matches[0], 'img')->attr('alt');
        $title = htmlqp($matches[0], 'img')->attr('title');
        $width = htmlqp($matches[0], 'img')->attr('width');
        print 'file: ' . $file."\n";
        print 'alt: ' . $alt."\n";
        print 'title: ' . $title."\n";
        print 'width: ' . $width."\n";
        $options = $alt || $title || $width;
        $directive = '.. image::' . $file;
        if ( $options ) {
          $directive .= "\n";
          if ( $alt ) {
            $directive .= '    :alt: ' . $alt . "\n";
          }
        }
        return $directive;
      },
      $text
  );
  
print $text;

print 'done';