import { KookBot, CardBuilder, MessageType } from '../src';

// 创建机器人实例
const bot = new KookBot({
  token: 'YOUR_BOT_TOKEN', // 替换为你的机器人 Token
  autoReconnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
});

// 监听调试信息
bot.on('debug', (message) => {
  console.log(`[DEBUG] ${message}`);
});

// 监听错误
bot.on('error', (error) => {
  console.error('[ERROR]', error);
});

// 机器人就绪事件
bot.on('ready', async (user) => {
  console.log(`[READY] Bot logged in as ${user.username}#${user.identify_num}`);
  
  // 获取服务器列表
  try {
    const guilds = await bot.getGuilds();
    console.log(`[INFO] Bot is in ${guilds.length} guilds:`);
    for (const guild of guilds) {
      console.log(`  - ${guild.name} (${guild.id})`);
    }
  } catch (error) {
    console.error('[ERROR] Failed to get guilds:', error);
  }
});

// 监听消息事件
bot.on('message', async (event) => {
  console.log(`[MESSAGE] ${event.extra.author.username}: ${event.content}`);
  
  const channelId = event.target_id;
  const authorId = event.author_id;
  const content = event.content;
  const guildId = event.extra.guild_id;
  
  // 忽略机器人自己的消息
  if (event.extra.author.bot) return;
  
  // 处理命令
  if (content.startsWith('!')) {
    const args = content.slice(1).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    
    switch (command) {
      case 'ping':
        await bot.sendTextMessage(channelId, 'Pong! 🏓');
        break;
        
      case 'hello':
        await bot.sendKMarkdownMessage(
          channelId,
          `你好, <@${authorId}>! 👋`
        );
        break;
        
      case 'info':
        // 发送服务器信息卡片
        const infoCard = new CardBuilder('info')
          .addHeader('服务器信息')
          .addSection(`服务器ID: ${guildId || '私信'}`)
          .addSection(`频道ID: ${channelId}`)
          .addSection(`你的ID: ${authorId}`)
          .addDivider()
          .addContext([
            { type: 'text', content: '由 KookBot 提供支持' }
          ])
          .build();
        await bot.sendCardMessage(channelId, infoCard);
        break;
        
      case 'card':
        // 发送复杂卡片消息
        const card = new CardBuilder('primary')
          .addHeader('欢迎使用 KookBot!')
          .addSection('这是一个**卡片消息**示例', { isKMarkdown: true })
          .addDivider()
          .addParagraph([
            { text: '第一列内容' },
            { text: '第二列内容' },
          ], 2)
          .addImageGroup([
            { src: 'https://img.kookapp.cn/assets/2022-05/UmCnhmq2tC0e00e0.png', alt: '示例图片' }
          ])
          .addActionGroup([
            { text: '按钮 1', value: 'btn_1', theme: 'primary' },
            { text: '按钮 2', value: 'btn_2', theme: 'secondary' },
          ])
          .build();
        await bot.sendCardMessage(channelId, card);
        break;
        
      case 'buttons':
        // 发送按钮卡片
        const buttonCard = CardBuilder.buttons([
          { text: '确认', value: 'confirm', theme: 'primary' },
          { text: '取消', value: 'cancel', theme: 'danger' },
          { text: '更多信息', value: 'info', theme: 'secondary' },
        ], {
          header: '请选择一个选项',
          theme: 'warning'
        });
        await bot.sendCardMessage(channelId, buttonCard);
        break;
        
      case 'help':
        // 发送帮助信息
        const helpCard = new CardBuilder('secondary')
          .addHeader('🤖 机器人帮助')
          .addSection('可用命令列表:', { isKMarkdown: true })
          .addDivider()
          .addSection('`!ping` - 测试机器人响应')
          .addSection('`!hello` - 打招呼')
          .addSection('`!info` - 显示服务器信息')
          .addSection('`!card` - 显示卡片消息示例')
          .addSection('`!buttons` - 显示按钮示例')
          .addSection('`!help` - 显示此帮助信息')
          .addDivider()
          .addContext([
            { type: 'text', content: 'KookBot v1.0.0', isKMarkdown: true }
          ])
          .build();
        await bot.sendCardMessage(channelId, helpCard);
        break;
        
      case 'dm':
        // 发送私信
        try {
          await bot.sendDirectTextMessage(authorId, '这是一条私信消息！');
          await bot.sendTextMessage(channelId, '私信已发送！');
        } catch (error) {
          await bot.sendTextMessage(channelId, '无法发送私信，请确保你已经添加机器人为好友。');
        }
        break;
        
      case 'react':
        // 添加表情反应
        try {
          await bot.addReaction(event.msg_id, '👍');
          await bot.addReaction(event.msg_id, '❤️');
        } catch (error) {
          console.error('[ERROR] Failed to add reaction:', error);
        }
        break;
    }
  }
  
  // 关键词回复
  if (content.includes('早安')) {
    await bot.sendTextMessage(channelId, `早安, <@${authorId}>! ☀️`);
  } else if (content.includes('晚安')) {
    await bot.sendTextMessage(channelId, `晚安, <@${authorId}>! 🌙`);
  }
});

// 监听成员加入服务器事件
bot.on('joinedGuild', (event) => {
  console.log(`[EVENT] New member joined: ${event.extra?.user_id}`);
});

// 监听成员离开服务器事件
bot.on('exitedGuild', (event) => {
  console.log(`[EVENT] Member left: ${event.extra?.user_id}`);
});

// 监听消息删除事件
bot.on('messageDelete', (event) => {
  console.log(`[EVENT] Message deleted: ${event.msg_id}`);
});

// 监听消息更新事件
bot.on('messageUpdate', (event) => {
  console.log(`[EVENT] Message updated: ${event.msg_id}`);
});

// 监听表情反应添加事件
bot.on('reactionAdd', (event) => {
  console.log(`[EVENT] Reaction added to message: ${event.msg_id}`);
});

// 监听表情反应移除事件
bot.on('reactionRemove', (event) => {
  console.log(`[EVENT] Reaction removed from message: ${event.msg_id}`);
});

// 监听频道创建事件
bot.on('channelCreate', (event) => {
  console.log(`[EVENT] Channel created: ${event.extra?.channel_id}`);
});

// 监听频道删除事件
bot.on('channelDelete', (event) => {
  console.log(`[EVENT] Channel deleted: ${event.extra?.channel_id}`);
});

// 监听按钮点击事件
bot.on('messageBtnClick', async (event) => {
  console.log(`[EVENT] Button clicked: ${event.extra?.value}`);
  
  const channelId = event.target_id;
  const value = event.extra?.value as string;
  
  // 根据按钮值回复
  switch (value) {
    case 'confirm':
      await bot.sendTextMessage(channelId, '你点击了**确认**按钮！');
      break;
    case 'cancel':
      await bot.sendTextMessage(channelId, '你点击了**取消**按钮！');
      break;
    case 'info':
      await bot.sendTextMessage(channelId, '这是更多信息...');
      break;
  }
});

// 启动机器人
async function main() {
  try {
    await bot.start();
    console.log('[INFO] Bot started successfully');
  } catch (error) {
    console.error('[FATAL] Failed to start bot:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n[INFO] Shutting down...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[INFO] Shutting down...');
  await bot.stop();
  process.exit(0);
});

main();
