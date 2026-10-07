/*CMD
  command: 🏅 Levels
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

let count = parseInt(User.getProp("ref_count", 0)) || 0;
let info = Libs.LevelLib.levelInfo(count);
let L = Libs.LevelLib.LEVELS;

let msg = "🏅 *Referral Levels*\n\n" +
  "Your level: *" + info.level.name + "* (x" + info.level.mult + ")\n" +
  "👥 Referrals: *" + count + "*\n";

msg += info.next
  ? "🎯 *" + info.toNext + "* more to reach " + info.next.name + "\n\n"
  : "👑 You reached the top level!\n\n";

for (let i = 0; i < L.length; i++) {
  msg += L[i].name + " — " + L[i].min + "+ refs — x" + L[i].mult + " bonus" +
         (L[i].reward ? " + $" + L[i].reward + " reward" : "") + "\n";
}

Bot.sendMessage(msg);
