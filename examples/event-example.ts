// KOOK SDK 事件监听示例
// 展示如何监听各种事件

import { KookBot } from '../src';

const TOKEN = process.env.KOOK_TOKEN || 'your-token-here';

const bot = new KookBot({
  token: TOKEN,
  autoReconnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
});

// ========== 消息事件 ==========

// 收到消息
bot.on('message', (event) => {
  console.log(`[消息] ${event.extra.author.username}: ${event.content}`);
});

// 消息创建（与 message 相同）
bot.on('messageCreate', (event) => {
  console.log(`[消息创建] 频道: ${event.extra.channel_name}`);
});

// 消息更新
bot.on('messageUpdate', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[消息更新] 消息ID: ${extra.body.msg_id}, 新内容: ${extra.body.content}`);
});

// 消息删除
bot.on('messageDelete', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[消息删除] 消息ID: ${extra.body.msg_id}`);
});

// ========== 服务器成员事件 ==========

// 成员加入服务器
bot.on('joinedGuild', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[成员加入] 用户ID: ${extra.body.user_id}`);
});

// 成员退出服务器
bot.on('exitedGuild', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[成员退出] 用户ID: ${extra.body.user_id}`);
});

// 成员上线
bot.on('guildMemberOnline', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[成员上线] 用户ID: ${extra.body.user_id}, 服务器: ${extra.body.guilds.join(', ')}`);
});

// 成员下线
bot.on('guildMemberOffline', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[成员下线] 用户ID: ${extra.body.user_id}`);
});

// 成员信息更新
bot.on('guildMemberUpdate', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[成员更新] 用户ID: ${extra.body.user_id}, 新昵称: ${extra.body.nickname}`);
});

// ========== 服务器事件 ==========

// 服务器信息更新
bot.on('guildUpdate', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[服务器更新] 服务器: ${extra.body.name}`);
});

// 服务器删除
bot.on('guildDelete', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[服务器删除] 服务器ID: ${extra.body.id}`);
});

// 自己加入服务器
bot.on('selfJoinedGuild', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[自己加入服务器] 服务器ID: ${extra.body.guild_id}`);
});

// 自己退出服务器
bot.on('selfExitedGuild', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[自己退出服务器] 服务器ID: ${extra.body.guild_id}`);
});

// ========== 服务器封禁事件 ==========

// 添加封禁
bot.on('addedBlockList', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[添加封禁] 操作者: ${extra.body.operator_id}, 被封禁用户: ${extra.body.user_id.join(', ')}`);
});

// 移除封禁
bot.on('deletedBlockList', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[移除封禁] 操作者: ${extra.body.operator_id}, 被解封用户: ${extra.body.user_id.join(', ')}`);
});

// ========== 服务器表情事件 ==========

// 添加表情
bot.on('addedEmoji', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[添加表情] 表情名称: ${extra.body.name}`);
});

// 移除表情
bot.on('removedEmoji', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[移除表情] 表情名称: ${extra.body.name}`);
});

// 更新表情
bot.on('updatedEmoji', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[更新表情] 表情名称: ${extra.body.name}`);
});

// ========== 频道事件 ==========

// 频道创建
bot.on('channelCreate', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[频道创建] 频道名称: ${extra.body.name}, 类型: ${extra.body.type}`);
});

// 频道更新
bot.on('channelUpdate', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[频道更新] 频道名称: ${extra.body.name}`);
});

// 频道删除
bot.on('channelDelete', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[频道删除] 频道ID: ${extra.body.id}`);
});

// ========== 消息置顶事件 ==========

// 消息置顶
bot.on('pinnedMessage', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[消息置顶] 操作者: ${extra.body.operator_id}, 消息ID: ${extra.body.msg_id}`);
});

// 取消置顶
bot.on('unpinnedMessage', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[取消置顶] 操作者: ${extra.body.operator_id}, 消息ID: ${extra.body.msg_id}`);
});

// ========== 反应事件 ==========

// 添加反应
bot.on('reactionAdd', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[添加反应] 用户: ${extra.body.user_id}, 表情: ${extra.body.emoji.name}`);
});

// 移除反应
bot.on('reactionRemove', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[移除反应] 用户: ${extra.body.user_id}, 表情: ${extra.body.emoji.name}`);
});

// ========== 角色事件 ==========

// 角色创建
bot.on('guildRoleCreate', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[角色创建] 角色名称: ${extra.body.name}`);
});

// 角色删除
bot.on('guildRoleDelete', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[角色删除] 角色ID: ${extra.body.role_id}`);
});

// 角色更新
bot.on('guildRoleUpdate', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[角色更新] 角色名称: ${extra.body.name}`);
});

// ========== 用户事件 ==========

// 用户信息更新
bot.on('userUpdate', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[用户更新] 用户: ${extra.body.username}`);
});

// ========== 语音频道事件 ==========

// 用户加入语音频道
bot.on('joinedChannel', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[加入语音频道] 用户: ${extra.body.user_id}, 频道: ${extra.body.channel_id}`);
});

// 用户退出语音频道
bot.on('exitedChannel', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[退出语音频道] 用户: ${extra.body.user_id}, 频道: ${extra.body.channel_id}`);
});

// ========== 卡片消息事件 ==========

// 卡片按钮点击
bot.on('messageBtnClick', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[按钮点击] 用户: ${extra.body.user_id}, 值: ${extra.body.value}`);
});

// ========== 通用事件 ==========

// 系统事件（所有系统事件都会触发）
bot.on('systemEvent', (event) => {
  const extra = event.extra as { type: string; body: any };
  console.log(`[系统事件] 类型: ${extra.type}`);
});

// 所有事件
bot.on('event', (event) => {
  // console.log(`[所有事件] 类型: ${event.type}`);
});

// ========== 生命周期事件 ==========

bot.on('ready', (user) => {
  console.log(`✅ 机器人已启动: ${user.username}#${user.identify_num}`);
});

bot.on('error', (error) => {
  console.error('❌ 机器人错误:', error);
});

bot.on('debug', (message) => {
  console.log(`[DEBUG] ${message}`);
});

bot.on('stopped', () => {
  console.log('🛑 机器人已停止');
});

// 启动机器人
console.log('正在启动机器人...');
bot.start().catch(console.error);

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭机器人...');
  await bot.stop();
  process.exit(0);
});
