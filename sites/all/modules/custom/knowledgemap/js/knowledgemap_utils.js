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