// SMART ASSIST KILLERS - ULTIMATE BOT v4 - ALL GROUPS
const express = require('express');
const app = express();
app.use(express.json());
const idInstance = "710722809494";
const apiToken = process.env.API_TOKEN;
const OWNER_NUMBER = "2349020695968@c.us";
const BAD_WORDS = ["fuck","bitch","idiot","mumu","olosho","fucker"];
const LINK_REGEX = /(chat\.whatsapp\.com|t\.me|telegram|https?:\/\/)/i;
let warnings = {};
let spam = {};
async function sendMsg(chatId, text) {
  await fetch(`https://7105.api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ chatId: chatId, message: text })
  });
}
async function kickUser(groupId, userId, reason) {
  await fetch(`https://7105.api.green-api.com/waInstance${idInstance}/removeGroupParticipant/${apiToken}`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ groupId: groupId, participantChatId: userId })
  });
  await sendMsg(groupId, `🚫 @${userId.split('@')[0]} don comot. Reason: ${reason}`);
}
async function getGroupAdmins(groupId) {
  const res = await fetch(`https://7105.api.green-api.com/waInstance${idInstance}/getGroupData/${apiToken}`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ groupId: groupId })
  });
  const data = await res.json();
  return data.members.filter(m => m.isAdmin).map(m => m.id);
}
app.post('/webhook', async (req, res) => {
  const data = req.body;
  if (data.typeWebhook === 'groupParticipantAdded') {
    await sendMsg(data.chatId, `👋 Welcome @${data.participant.split('@')[0]}! Type !rules`);
    return res.sendStatus(200);
  }
  if (data.typeWebhook === 'groupParticipantRemoved') {
    await sendMsg(data.chatId, `👋 @${data.participant.split('@')[0]} don comot.`);
    return res.sendStatus(200);
  }
  if (data.typeWebhook !== 'incomingMessageReceived') return res.sendStatus(200);
  const msgData = data.messageData;
  const GROUP_ID = msgData.chatId;
  if (!GROUP_ID.endsWith('@g.us')) return res.sendStatus(200);
  const sender = data.senderData.sender;
  const isOwner = sender === OWNER_NUMBER;
  const admins = await getGroupAdmins(GROUP_ID);
  const isAdmin = admins.includes(sender) || isOwner;
  if (msgData.typeMessage !== 'textMessage') return res.sendStatus(200);
  const text = msgData.textMessageData.textMessage.trim();
  if (!isAdmin) {
    if (LINK_REGEX.test(text)) { await kickUser(GROUP_ID, sender, "Posting link"); return res.sendStatus(200); }
    if (BAD_WORDS.some(w => text.toLowerCase().includes(w))) {
      if (!warnings[sender]) { warnings[sender]=1; await sendMsg(GROUP_ID, `⚠️ @${sender.split('@')[0]} Warn 1/2 - No insult`); }
      else { await kickUser(GROUP_ID, sender, "Insult"); delete warnings[sender]; }
      return res.sendStatus(200);
    }
    const now = Date.now(); if(!spam[sender]) spam[sender]=[]; spam[sender]=spam[sender].filter(t=>now-t<10000); spam[sender].push(now);
    if (spam[sender].length >= 5) { await kickUser(GROUP_ID, sender, "Spamming"); spam[sender]=[]; return res.sendStatus(200); }
  }
  if (text === '!help') await sendMsg(GROUP_ID, `🤖 COMMANDS:\n!rules !info !tagall !warn !joke !poll\nOWNER ONLY: !kick !mute !promote !demote !close !open`);
  if (text === '!rules') await sendMsg(GROUP_ID, `📜 RULES:\n1. No link\n2. No insult\n3. No spam\nBreak rule = kick`);
  if (text === '!info') await sendMsg(GROUP_ID, `📊 SMART ASSIST KILLERS\nOwner: @2349020695968`);
  if (text === '!joke') await sendMsg(GROUP_ID, `😂 Why WhatsApp no dey fight? Because e dey always deliver message!`);
  if (text === '!tagall' && isAdmin) await sendMsg(GROUP_ID, `📢 TAG ALL - Oga don call una! Come online!`);
  if (text.startsWith('!warn') && isAdmin) await sendMsg(GROUP_ID, `⚠️ Warn don enter. 3 warns = kick`);
  if (text.startsWith('!kick') || text.startsWith('!mute') || text.startsWith('!promote') || text.startsWith('!demote') || text === '!close' || text === '!open') {
    if (!isOwner) { await sendMsg(GROUP_ID, `❌ Sorry, na Oga only fit use this command.`); return res.sendStatus(200); }
    await sendMsg(GROUP_ID, `✅ Oga, command received: ${text}`);
  }
  res.sendStatus(200);
});
app.listen(3000, () => console.log("Bot running for ALL groups..."));
