// TV remote: arrow keys move focus between buttons. Done in the page because not every
// TV WebView does spatial navigation itself. OK is the native button click.
import { nearest } from './logic.js';

const DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
let root = document.body;

const candidates = () =>
  Array.prototype.slice.call(root.querySelectorAll('button:not(:disabled), a[href]')).filter((el) => el.getClientRects().length > 0); // not offsetParent: it is null for position:fixed

function move(el) {
  el.focus();
  el.scrollIntoView({ block: 'nearest' });
}

// Put focus on the page's main button, so the kid never has to hunt for where focus went.
export function focusMain() {
  const els = candidates();
  const main = els.filter((el) => el.hasAttribute('data-autofocus'))[0] || els[0];
  if (main) move(main);
}

export function installRemote(el) {
  root = el;
  document.addEventListener('keydown', (e) => {
    const dir = DIRS[e.key];
    if (!dir) return;
    const els = candidates();
    if (!els.length) return;
    const a = document.activeElement;
    e.preventDefault();
    if (els.indexOf(a) < 0) return focusMain(); // focus got lost: come back to the main button
    const i = nearest(a.getBoundingClientRect(), els.map((x) => x.getBoundingClientRect()), dir);
    if (i >= 0) move(els[i]);
  });
}
