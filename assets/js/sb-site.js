/* Minimal SEMA BAY chrome so the marriage section can run without the full site. */
(function () {
  'use strict';
  var head = document.getElementById('sbSiteHead');
  var foot = document.getElementById('sbSiteFoot');
  if (head) {
    head.innerHTML =
      '<header class="sb-head">' +
      '<a class="sb-brand" href="/marriage/">SEMA BAY</a>' +
      '<nav class="sb-nav" aria-label="Site">' +
      '<a href="/marriage/">Marriage</a>' +
      '<a href="/marriage/#chats" id="sbNavChats">Chats</a>' +
      '</nav></header>';
  }
  if (foot) {
    foot.innerHTML =
      '<footer class="sb-foot"><p>SEMA BAY · Muslim Marriage preview</p></footer>';
  }
})();
