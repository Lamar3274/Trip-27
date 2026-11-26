/* Trip 27 shared code: used by Trip HQ and The Adventure List.
   Both apps live on the same site, so they share browser storage:
   Trip HQ saves under 'triphq-v1', the Adventure List under 'adv'.
   This file lets each app read the other's data safely. No build step. */
(function () {
  'use strict';
  const HQ_KEY = 'triphq-v1', ADV_KEY = 'adv';

  /* Places: name, country, rough coordinates (for the schematic map), region and starter ideas. */
  const PLACES = {
    'bangkok': { name: 'Bangkok', co: 'Thailand', ll: [13.75, 100.5] },
    'chiang mai': { name: 'Chiang Mai', co: 'Thailand', ll: [18.79, 98.99] },
    'pai': { name: 'Pai', co: 'Thailand', ll: [19.36, 98.44], region: 'chiang mai', acts: ['Pai Canyon sunset', 'Hot springs', 'Waterfalls', 'Mountain viewpoints', 'Pai Walking Street', 'Cafés and exploring'] },
    'mae kampong': { name: 'Mae Kampong', co: 'Thailand', ll: [18.86, 99.35], region: 'chiang mai' },
    'chiang rai': { name: 'Chiang Rai', co: 'Thailand', ll: [19.91, 99.83], region: 'chiang mai' },
    'pattaya': { name: 'Pattaya', co: 'Thailand', ll: [12.93, 100.88] },
    'phuket': { name: 'Phuket', co: 'Thailand', ll: [7.88, 98.39] },
    'similan islands': { name: 'Similan Islands', co: 'Thailand', ll: [8.65, 97.64], region: 'phuket' },
    'phi phi': { name: 'Koh Phi Phi', co: 'Thailand', ll: [7.74, 98.77] },
    'koh lanta': { name: 'Koh Lanta', co: 'Thailand', ll: [7.62, 99.04] },
    'krabi': { name: 'Krabi / Railay', co: 'Thailand', ll: [8.01, 98.84] },
    'khao sok': { name: 'Khao Sok', co: 'Thailand', ll: [8.92, 98.53] },
    'koh samui': { name: 'Koh Samui', co: 'Thailand', ll: [9.51, 100.01] },
    'koh phangan': { name: 'Koh Phangan', co: 'Thailand', ll: [9.75, 100.04] },
    'koh tao': { name: 'Koh Tao', co: 'Thailand', ll: [10.1, 99.84] },
    'el nido': { name: 'El Nido', co: 'Philippines', ll: [11.18, 119.39] },
    'coron': { name: 'Coron', co: 'Philippines', ll: [12.0, 120.2] },
    'bohol': { name: 'Bohol', co: 'Philippines', ll: [9.85, 124.14] },
    'cebu': { name: 'Cebu', co: 'Philippines', ll: [10.32, 123.89] },
    'siargao': { name: 'Siargao', co: 'Philippines', ll: [9.85, 126.05] },
    'hanoi': { name: 'Hanoi', co: 'Vietnam', ll: [21.03, 105.85] },
    'ha giang': { name: 'Ha Giang Loop', co: 'Vietnam', ll: [22.82, 104.98] },
    'sapa': { name: 'Sapa', co: 'Vietnam', ll: [22.34, 103.84] },
    'ninh binh': { name: 'Ninh Binh', co: 'Vietnam', ll: [20.25, 105.97] },
    'ha long': { name: 'Ha Long Bay', co: 'Vietnam', ll: [20.95, 107.07] },
    'hue': { name: 'Hue', co: 'Vietnam', ll: [16.46, 107.59] },
    'da nang': { name: 'Da Nang', co: 'Vietnam', ll: [16.05, 108.22] },
    'hoi an': { name: 'Hoi An', co: 'Vietnam', ll: [15.88, 108.34] }
  };
  /* Other spellings people (and ChatGPT/Claude) use for the same place. */
  const ALIAS = {
    'koh phi phi': 'phi phi', 'ko phi phi': 'phi phi', 'phi phi islands': 'phi phi', 'maya bay': 'phi phi',
    'krabi / railay': 'krabi', 'krabi railay': 'krabi', 'railay': 'krabi', 'railay beach': 'krabi', 'ao nang': 'krabi',
    'khao sok national park': 'khao sok', 'ko lanta': 'koh lanta', 'lanta': 'koh lanta',
    'ko samui': 'koh samui', 'samui': 'koh samui', 'ko phangan': 'koh phangan', 'koh pha ngan': 'koh phangan', 'phangan': 'koh phangan',
    'ko tao': 'koh tao', 'tao': 'koh tao', 'ha giang loop': 'ha giang', 'ha long bay': 'ha long', 'halong': 'ha long', 'halong bay': 'ha long',
    'sa pa': 'sapa', 'hué': 'hue', 'danang': 'da nang', 'hoian': 'hoi an', 'mae kampong': 'mae kampong', 'mae kam pong': 'mae kampong',
    'cebu city': 'cebu', 'moalboal': 'cebu', 'palawan': 'el nido', 'bkk': 'bangkok', 'cnx': 'chiang mai'
  };
  const clean = s => String(s || '').toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[—–-]\s*nye\b.*$/, '').replace(/[^a-zà-ỹ0-9/ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  /* One place name → canonical key ('Koh Phi Phi' → 'phi phi'). */
  function key(name) { const c = clean(name); if (!c) return ''; return ALIAS[c] || c; }
  /* Every place key a name can mean ('Da Nang / Hoi An' → ['da nang','hoi an']). */
  function keys(name) {
    const whole = key(name); if (PLACES[whole]) return [whole];
    const out = clean(name).split(/\s*\/\s*|\s+and\s+|\s*,\s*/).map(key).filter(Boolean);
    return out.length ? [...new Set(out)] : (whole ? [whole] : []);
  }
  /* Place keys for an itinerary stay: its explicit places list, else read from the title. */
  const stayKeys = it => (it.places && it.places.length ? it.places.flatMap(keys) : keys(it.title));
  const placeName = k => (PLACES[k] ? PLACES[k].name : k.replace(/\b\w/g, c => c.toUpperCase()));

  /* Is this itinerary item part of the live plan? (Not a hidden option, not dismissed.) */
  function active(it, blocks) {
    if (it.dismissed) return false;
    if (!it.block) return true;
    const b = (blocks || []).find(x => x.id === it.block);
    return !b || (b.active || 'A') === (it.opt || 'A');
  }

  /* Safe storage access. */
  function read(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  /* Bucket-list statuses. Old values carry over: maybe → interested, plan → planned, been → completed. */
  const ST = ['idea', 'interested', 'planned', 'booked', 'completed', 'skipped'];
  const ST_LABEL = { idea: 'Idea', interested: 'Interested', planned: 'Planned', booked: 'Booked', completed: 'Done', skipped: 'Skipped' };
  const LEGACY = { maybe: 'interested', plan: 'planned', been: 'completed' };
  function status(i) {
    let s = i.st; if (LEGACY[s]) s = LEGACY[s];
    if (!ST.includes(s)) s = i.done ? 'completed' : i.p === 3 ? 'interested' : 'planned';
    if (s === 'booked' && !(i.ref && String(i.ref).trim())) s = 'planned'; // never booked without a confirmation
    if (i.done) s = 'completed';
    return s;
  }
  /* Set a status. Returns an error message instead of saving when 'booked' has no reference. */
  function setStatus(i, s) {
    if (s === 'booked' && !(i.ref && String(i.ref).trim())) return 'Add the booking reference first. Something only counts as booked once it has one.';
    i.st = s; i.done = s === 'completed'; if (i.done && !i.dt) i.dt = new Date().toISOString().slice(0, 10);
    i.upd = Date.now(); return '';
  }
  const PRI = { 1: 'Must do', 2: 'High interest', 3: 'Optional' };
  const CATS = { adventure: ['🧗', 'Adventure'], nature: ['🌿', 'Nature'], beaches: ['🏖️', 'Beaches and islands'], nightlife: ['🎶', 'Nightlife and festivals'], fitness: ['🥊', 'Fitness and Muay Thai'], relaxation: ['🧘', 'Wellness and recovery'], food: ['🍜', 'Food'], culture: ['🏛️', 'Culture'], shopping: ['🛍️', 'Shopping'], work: ['💻', 'Working base'] };

  const norm = s => clean(s).replace(/\b(the|a|an|and|tour|trip)\b/g, '').replace(/\s+/g, ' ').trim();

  /* Upgrade the Adventure List data (version 6). Safe to run twice: every step checks first. */
  function advUpgrade(A) {
    if (!A || !Array.isArray(A.items)) return false;
    let changed = false;
    if (!A.v6) {
      const find = (co, t) => A.items.find(i => i.co === co && norm(i.t) === norm(t));
      const place = (co, t, extra) => { let i = A.items.find(x => x.kind === 'place' && x.co === co && key(x.t) === key(t)); if (!i) { i = { id: 'v6p-' + key(t).replace(/\W+/g, '-'), kind: 'place', co, t, p: 2, st: 'interested', ...extra }; A.items.push(i); } return i; };
      const add = (co, ci, t, k, p, o = {}) => { const ex = find(co, t); if (ex) { for (const f in o) if (ex[f] == null || ex[f] === '') ex[f] = o[f]; if (!ex.ci && ci) ex.ci = ci; return ex; } const i = { id: 'v6-' + (co + '-' + t).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40), kind: 'do', co, ci, t, k, p, st: 'interested', ...o }; A.items.push(i); return i; };
      const ren = (co, from, to, o = {}) => { const i = find(co, from); if (i && !find(co, to)) { i.t = to; Object.assign(i, o); } };
      // Renames that match the new plan (only if you haven't already renamed them).
      ren('Thailand', 'Mae Kampong overnight stay', 'Mae Kampong day trip', { p: 3, n: 'Day trip from Chiang Mai, not an overnight.' });
      ren('Vietnam', 'Ha Giang Loop motorbike adventure', 'Guided Ha Giang Loop', { p: 1 });
      ren('Philippines', 'Big Lagoon', 'Big Lagoon kayaking', { p: 1 });
      // Out-of-date dates typed into places before the itinerary moved. Dates now come from Trip HQ.
      const OLD_W = ['9–14 Dec · 26 Dec–3 Jan', '14–26 Dec', '11 nights', '3 nights', '6 nights', '5 nights', '2 nights', '12–20 Mar · 28 Mar–16 Apr', '20–25 Mar', '25–28 Mar', '16–19 Apr (maybe)', '10–14 nights'];
      A.items.forEach(i => { if (i.kind === 'place' && OLD_W.includes(i.w)) i.w = ''; });
      place('Thailand', 'Pai', { isl: false, k: 'nature', p: 3, n: 'Possible 1–2 night side trip from Chiang Mai, around 19–21 Dec. Not booked.' });
      place('Philippines', 'Bohol', { k: 'nature' }); place('Philippines', 'Cebu', { k: 'adventure' });
      place('Philippines', 'Siargao', { isl: true, k: 'beaches', p: 3, n: 'Optional alternative.' });
      const B = { book: 'yes' }, M = { book: 'maybe' };
      // Thailand
      add('Thailand', 'Bangkok', "New Year's Eve in Bangkok", 'nightlife', 1, { w: '31 Dec', ...M });
      add('Thailand', 'Chiang Mai', 'Zip-lining', 'adventure', 2, { dur: 'Half day', ...B });
      add('Thailand', 'Chiang Mai', 'Ethical elephant sanctuary', 'nature', 2, { dur: 'Half or full day', ...B, n: 'Pick a no-riding sanctuary. Check reviews before booking.' });
      add('Thailand', 'Pai', 'Pai Canyon sunset', 'nature', 2, { dur: '2 hours' });
      add('Thailand', 'Pai', 'Hot springs', 'relaxation', 3, {});
      add('Thailand', 'Pai', 'Waterfalls', 'nature', 3, {});
      add('Thailand', 'Pai', 'Mountain viewpoints', 'nature', 3, {});
      add('Thailand', 'Pai', 'Pai Walking Street', 'food', 3, { w: 'Evenings' });
      add('Thailand', 'Pai', 'Cafés and exploring', 'food', 3, {});
      add('Thailand', 'Pai', 'Getting to Pai: minivan or private driver', 'adventure', 3, { ...B, n: 'Mountain road with many bends. Motorbike only if properly licensed, experienced and insured.' });
      add('Thailand', 'Koh Phi Phi', 'Maya Bay', 'beaches', 1, { ...M, n: 'Check visiting rules and opening before you go.' });
      add('Thailand', 'Phuket', 'Similan Islands day trip', 'adventure', 2, { dur: 'Full day', ...B, n: 'Seasonal national park. Check it is open on your dates.' });
      add('Thailand', 'Krabi / Railay', 'Railay rock climbing', 'adventure', 2, { dur: 'Half day', ...M });
      add('Thailand', 'Khao Sok', 'Floating bungalow overnight', 'nature', 2, { dur: '1 night', ...B });
      add('Thailand', 'Koh Tao', 'Snorkelling around Koh Tao', 'adventure', 2, {});
      add('Thailand', 'Koh Tao', 'Diving, if suitable', 'adventure', 3, { ...B });
      add('Thailand', 'Koh Samui', 'Island viewpoints', 'nature', 3, {});
      add('Thailand', 'Koh Samui', 'Gyms and calisthenics', 'fitness', 3, {});
      add('Thailand', 'Koh Samui', 'Massage, sauna and recovery', 'relaxation', 3, {});
      add('Thailand', 'Koh Samui', 'Beaches and boat trips', 'beaches', 3, {});
      add('Thailand', '', 'Sound bath', 'relaxation', 3, {});
      add('Thailand', '', 'Extra diving trips', 'adventure', 3, {});
      add('Thailand', '', 'Additional island tours', 'beaches', 3, {});
      const fm = find('Thailand', 'Full Moon Party'); if (fm) { fm.p = 1; if (!fm.w) fm.w = 'Around 22 Mar (date to verify)'; if (!fm.ci) fm.ci = 'Koh Phangan'; }
      const sk = find('Thailand', 'Songkran Festival'); if (sk) { sk.p = 1; if (!sk.w) sk.w = '13–15 Apr'; if (!sk.ci) sk.ci = 'Koh Samui'; }
      const mt = find('Thailand', 'Muay Thai training'); if (mt && !mt.ci) mt.n = mt.n || 'Phuket and Koh Samui both have options.';
      // Philippines
      add('Philippines', 'El Nido', 'Island-hopping tours', 'beaches', 2, { dur: 'Full day', ...M });
      add('Philippines', 'El Nido', 'El Nido–Coron boat expedition', 'adventure', 2, { dur: '3–5 days', ...B });
      add('Philippines', 'Coron', 'Snorkelling and diving', 'adventure', 2, { ...M });
      add('Philippines', 'Bohol', 'Chocolate Hills', 'nature', 2, {});
      add('Philippines', 'Bohol', 'Tarsier sanctuary', 'nature', 2, {});
      add('Philippines', 'Cebu', 'Kawasan Falls canyoneering', 'adventure', 2, { dur: 'Full day', ...B });
      add('Philippines', '', 'Waterfalls and motorbike exploration', 'adventure', 3, { n: 'Motorbike only if properly licensed, experienced and insured.' });
      // Vietnam
      const hg = find('Vietnam', 'Guided Ha Giang Loop'); if (hg) { if (!hg.book) hg.book = 'yes'; if (!hg.dur) hg.dur = '3–4 days'; }
      else add('Vietnam', 'Ha Giang Loop', 'Guided Ha Giang Loop', 'adventure', 1, { dur: '3–4 days', ...B });
      add('Vietnam', 'Ha Long Bay', 'Ha Long Bay overnight cruise', 'nature', 2, { dur: '1 night', ...B });
      add('Vietnam', 'Hue', 'Hue sightseeing', 'culture', 2, {});
      add('Vietnam', 'Hoi An', 'Hoi An lanterns and Old Town', 'culture', 2, { w: 'Evenings' });
      add('Vietnam', 'Hoi An', 'Tailored clothing', 'shopping', 3, { n: 'Allow a few days for fittings.' });
      add('Vietnam', 'Da Nang', 'Beach, cafés, gym and working base', 'work', 2, {});
      const sp = find('Vietnam', 'Sapa mountain trekking'); if (sp && !sp.book) sp.book = 'maybe';
      const nb = find('Vietnam', 'Ninh Binh / Trang An boat trip'); if (nb && !nb.book) nb.book = 'maybe';
      A.v6 = 1; changed = true;
    }
    // Every item gets a status in the new scheme (old fields kept so older copies still read it).
    A.items.forEach(i => { const s = status(i); if (i.st !== s) { i.st = s; changed = true; } });
    return changed;
  }

  /* Read-modify-write the Adventure List from another app without losing its edits. */
  function advUpdate(fn) {
    const A = read(ADV_KEY); if (!A || !Array.isArray(A.items)) return 'The bucket list hasn’t been set up on this device yet. Open The Adventure List once, then come back.';
    const r = fn(A); if (typeof r === 'string' && r) return r;
    return write(ADV_KEY, A) ? '' : 'Couldn’t save. Storage may be full.';
  }

  /* Dates for a place from the Trip HQ itinerary (only stays in the live plan). */
  function datesFor(placeKeyOrName, hq) {
    hq = hq || read(HQ_KEY); if (!hq || !Array.isArray(hq.items)) return [];
    const ks = keys(placeKeyOrName);
    return hq.items.filter(i => i.type === 'stay' && active(i, hq.blocks) && stayKeys(i).some(k => ks.includes(k))).sort((a, b) => a.start.localeCompare(b.start));
  }
  /* Bucket items that belong to a stay. */
  function bucketFor(stay, A) {
    A = A || read(ADV_KEY); if (!A || !Array.isArray(A.items)) return [];
    const ks = stayKeys(stay);
    return A.items.filter(i => i.kind === 'do' && i.ci && keys(i.ci).some(k => ks.includes(k)));
  }

  window.Trip = { HQ_KEY, ADV_KEY, PLACES, key, keys, stayKeys, placeName, active, read, write, ST, ST_LABEL, status, setStatus, PRI, CATS, advUpgrade, advUpdate, datesFor, bucketFor, norm };
})();
