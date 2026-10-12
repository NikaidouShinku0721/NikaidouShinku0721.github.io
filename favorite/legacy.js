(() => {
  'use strict';
  const map = { 'opening':'opening', 'archive-title':'opening', 'irotoridori-archive':'opening',
    'world':'world-picturebook', 'world-picturebook':'world-picturebook', 'people':'people',
    'works':'works', 'story':'works', 'objects':'works', 'sources':'message', 'message':'message' };
  const hash = location.hash.slice(1);
  const chapter = map[hash] || (hash.startsWith('tab-') ? 'people' : hash.startsWith('location-') ? 'world-picturebook' : document.body.dataset.defaultChapter);
  location.replace('/#' + chapter);
})();
