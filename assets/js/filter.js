// Experiments page filter: text search plus category. The full list is in the HTML;
// this only toggles `hidden` on list items, so the page works without JavaScript.
// The controls are invisible until this script adds the `ready` class.
(function () {
  'use strict';
  var list = document.getElementById('list');
  var box = document.getElementById('filter');
  if (!list || !box) return;
  var q = document.getElementById('q');
  var cat = document.getElementById('cat');
  var out = document.getElementById('count');
  var items = Array.prototype.slice.call(list.children);

  function run() {
    var text = q.value.trim().toLowerCase();
    var c = cat.value;
    var n = 0;
    items.forEach(function (li) {
      var show = (!c || li.getAttribute('data-cat') === c) &&
                 (!text || li.getAttribute('data-text').indexOf(text) !== -1);
      li.hidden = !show;
      if (show) n++;
    });
    out.textContent = n + (n === 1 ? ' entry' : ' entries');
  }

  q.addEventListener('input', run);
  cat.addEventListener('change', run);
  box.classList.add('ready');
  run();
})();
