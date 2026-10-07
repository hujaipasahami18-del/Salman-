// Force-join (channel membership) helper.
// Works only with a PUBLIC channel link like https://t.me/yourchannel
// and the bot must be an ADMIN of that channel.

function channelId() {
  let link = String(Bot.getProp("channel_link", "https://t.me/nxt_coder"));
  let m = link.match(/t\.me\/([A-Za-z0-9_]{4,})\/?$/);
  return m ? "@" + m[1] : null;
}

function enabled() {
  return String(Bot.getProp("force_join", 1)) === "1" && channelId() !== null;
}

function isVerified() {
  return String(User.getProp("join_verified", "0")) === "1";
}

function prompt() {
  Bot.sendInlineKeyboard([
    [{ title: "📢 Join Channel", url: Bot.getProp("channel_link", "https://t.me/nxt_coder") }],
    [{ title: "✅ I Joined", command: "/check_join" }]
  ],
    "🔒 *Join Required*\n\nPlease join *" + Bot.getProp("channel_name", "our channel") +
    "* first, then tap *I Joined*."
  );
}

// returns true if the user may continue; otherwise sends the join prompt
function guard() {
  if (!enabled() || isVerified()) return true;
  prompt();
  return false;
}

function check() {
  let id = channelId();
  if (!id) { User.setProp("join_verified", "1"); return; }
  Api.getChatMember({
    chat_id: id,
    user_id: user.telegramid,
    on_result: "/on_join_result",
    on_error: "/on_join_error"
  });
}

// pass the Telegram "status" string; true if user is in the channel
function isMemberStatus(result) {
  if (!result) return false;
  let st = result.status;
  return st === "member" || st === "administrator" || st === "creator" ||
    (st === "restricted" && result.is_member === true);
}

publish({
  channelId: channelId,
  enabled: enabled,
  isVerified: isVerified,
  prompt: prompt,
  guard: guard,
  check: check,
  isMember: isMemberStatus
});
