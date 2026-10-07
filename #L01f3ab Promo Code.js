/*CMD
  command: 🎫 Promo Code
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

if (!Libs.JoinLib.guard()) return;


Bot.sendMessage("🎫 *Enter your promo code:*\n\nType and send 👇");
User.setProp("waiting_promo", "1");
