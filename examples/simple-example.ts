import { KookBot, CardBuilder } from '../src';

// 简单示例：回声机器人
const bot = new KookBot({
  token: 'YOUR_BOT_TOKEN',
});

// 当机器人就绪时
bot.on('ready', (user) => {
  console.log(`Bot ${user.username} 已启动!`);
});

// 监听消息
bot.on('message', async (event) => {
  const content = event.content;
  const channelId = event.target_id;
  
  // 忽略机器人消息
  if (event.extra.author.bot) return;
  
  // 回声功能
  if (content.startsWith('!echo ')) {
    const text = content.slice(6);
    await bot.sendTextMessage(channelId, text);
  }
  
  // 发送卡片
  if (content === '!card') {
    const card = new CardBuilder()
      .addHeader('你好!')
      .addSection('这是一个卡片消息')
      .build();
    await bot.sendCardMessage(channelId, card);
  }
});

// 启动
bot.start().catch(console.error);
