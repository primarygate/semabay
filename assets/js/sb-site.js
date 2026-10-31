/* Minimal SEMA BAY chrome — plain HTML, no npm. */
(function () {
  'use strict';
  var head = document.getElementById('sbSiteHead');
  var foot = document.getElementById('sbSiteFoot');
  if (head) {
    head.innerHTML =
      '<header class="sb-head">' +
      '<a class="sb-brand" href="./">SEMA BAY</a>' +
      '<nav class="sb-nav" aria-label="Site">' +
      '<a href="./">Marriage</a>' +
      '<a href="#chats" id="sbNavChats">Chats</a>' +
      '<span class="sb-auth-slot" id="sbAuthSlot"></span>' +
      '</nav></header>';
  }
  if (foot) {
    foot.innerHTML =
      '<footer class="sb-foot"><p>SEMA BAY · Muslim Marriage · Open this HTML in your browser — no npm needed</p></footer>';
  }
})();
