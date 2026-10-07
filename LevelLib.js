// Referral levels, referral crediting, per-user storage helpers, withdrawal history.

var LEVELS = [
  { name: "🥉 Bronze",   min: 0,  mult: 1.0, reward: 0 },
  { name: "🥈 Silver",   min: 5,  mult: 1.2, reward: 0.05 },
  { name: "🥇 Gold",     min: 15, mult: 1.5, reward: 0.15 },
  { name: "💎 Platinum", min: 30, mult: 2.0, reward: 0.30 }
];

function round(n) { return Math.round(n * 10000) / 10000; }

// ---- per-user storage (same pattern the bot already used for other users) ----
function getU(name, id, def) {
  if (String(id) === String(user.telegramid)) return User.getProp(name, def);
  let v = Bot.getProp({ name: name, user_telegramid: id });
  return (v === undefined || v === null || v === "") ? def : v;
}
function setU(name, value, id, type) {
  if (String(id) === String(user.telegramid)) { User.setProp(name, value, type); return; }
  Bot.setProp({ name: name, value: value, user_telegramid: id, type: type });
}

function addBalance(id, amount) {
  let bal = parseFloat(getU("balance", id, 0)) || 0;
  let earned = parseFloat(getU("total_earned", id, 0)) || 0;
  setU("balance", round(bal + amount), id, "float");
  setU("total_earned", round(earned + amount), id, "float");
}

// ---- levels ----
function levelIndex(refCount) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) { if (refCount >= LEVELS[i].min) idx = i; }
  return idx;
}
function levelInfo(refCount) {
  let idx = levelIndex(refCount);
  let next = LEVELS[idx + 1] || null;
  return { index: idx, level: LEVELS[idx], next: next, toNext: next ? next.min - refCount : 0 };
}

// credit referrer for one new referral (applies level multiplier + level-up reward)
function creditReferral(referrerId) {
  let base = parseFloat(Bot.getProp("ref_bonus", 0.1));
  let count = parseInt(getU("ref_count", referrerId, 0)) || 0;
  let idx = levelIndex(count);
  let bonus = round(base * LEVELS[idx].mult);

  addBalance(referrerId, bonus);
  setU("ref_count", count + 1, referrerId, "integer");

  Bot.sendMessage({
    chat_id: referrerId,
    text: "🎉 *New Referral!*\n\n💰 +$" + bonus + " USDT (" + LEVELS[idx].name + " x" + LEVELS[idx].mult + ")"
  });

  let newIdx = levelIndex(count + 1);
  if (newIdx > idx) {
    let L = LEVELS[newIdx];
    if (L.reward > 0) addBalance(referrerId, L.reward);
    Bot.sendMessage({
      chat_id: referrerId,
      text: "🏅 *Level Up!* You are now " + L.name + "\n\n" +
            "🎁 Level reward: +$" + L.reward + " USDT\n" +
            "⚡ Referral bonus multiplier: x" + L.mult
    });
  }
}

// when force-join is on, referral is paid only after the invited user verifies
function payPendingReferral() {
  let ref = User.getProp("referrer_pending", "");
  if (!ref) return;
  User.setProp("referrer_pending", "");
  creditReferral(ref);
}

// ---- withdrawal history (last 10 per user) ----
function readHistory(id) {
  try { return JSON.parse(getU("wd_history", id, "[]")); } catch (e) { return []; }
}
function addHistory(id, entry) {
  let list = readHistory(id);
  list.unshift(entry);
  setU("wd_history", JSON.stringify(list.slice(0, 10)), id, "string");
}
function updateHistory(id, reqId, patch) {
  let list = readHistory(id);
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === reqId) {
      for (let k in patch) { list[i][k] = patch[k]; }
    }
  }
  setU("wd_history", JSON.stringify(list), id, "string");
}

publish({
  LEVELS: LEVELS,
  getU: getU,
  setU: setU,
  addBalance: addBalance,
  levelInfo: levelInfo,
  creditReferral: creditReferral,
  payPendingReferral: payPendingReferral,
  addHistory: addHistory,
  updateHistory: updateHistory,
  readHistory: readHistory
});
