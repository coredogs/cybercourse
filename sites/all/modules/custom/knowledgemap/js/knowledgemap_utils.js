function capitaliseFirstLetter(string) {
  if ( ! string ) {
    return '';
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function trimLR (str) {
  if ( ! str ) {
    return '';
  }
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

//function clearSelection() {
//    if(document.selection && document.selection.empty) {
//        document.selection.empty();
//    } else if(window.getSelection) {
//        var sel = window.getSelection();
//        sel.removeAllRanges();
//    }
//}