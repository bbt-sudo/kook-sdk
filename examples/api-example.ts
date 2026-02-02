// KOOK SDK API 使用示例
// 展示如何使用各种 HTTP API 接口

import { KookBot } from '../src';

const TOKEN = process.env.KOOK_TOKEN || 'your-token-here';

const bot = new KookBot({
  token: TOKEN,
});

async function demonstrateAPIs() {
  try {
    // ========== 用户相关 ==========
    console.log('=== 用户相关 ===');

    // 获取当前用户
    const currentUser = await bot.getCurrentUser();
    console.log(`当前用户: ${currentUser.username}#${currentUser.identify_num}`);

    // 获取用户详情
    // const user = await bot.getUser('user-id');
    // console.log(`用户详情:`, user);

    // ========== 服务器相关 ==========
    console.log('\n=== 服务器相关 ===');

    // 获取服务器列表
    const guilds = await bot.getGuilds();
    console.log(`服务器数量: ${guilds.length}`);

    if (guilds.length > 0) {
      const guild = guilds[0];
      console.log(`第一个服务器: ${guild.name} (${guild.id})`);

      // 获取服务器详情
      const guildDetail = await bot.getGuild(guild.id);
      console.log(`服务器详情:`, guildDetail);

      // 获取服务器成员列表
      const guildUsers = await bot.getGuildUsers(guild.id, { page_size: 10 });
      console.log(`服务器成员数: ${guildUsers.meta.total}`);

      // ========== 频道相关 ==========
      console.log('\n=== 频道相关 ===');

      // 获取频道列表
      const channels = await bot.getChannels(guild.id);
      console.log(`频道数量: ${channels.length}`);

      // 获取频道分组
      const categories = await bot.getChannelCategories(guild.id);
      console.log(`频道分组数量: ${categories.length}`);

      if (channels.length > 0) {
        const channel = channels[0];
        console.log(`第一个频道: ${channel.name} (${channel.id})`);

        // 获取频道详情
        const channelDetail = await bot.getChannel(channel.id);
        console.log(`频道详情:`, channelDetail);

        // ========== 消息相关 ==========
        console.log('\n=== 消息相关 ===');

        // 获取消息列表
        const messages = await bot.getMessages(channel.id, { page_size: 10 });
        console.log(`消息数量: ${messages.meta.total}`);

        // 发送文本消息
        // const textMsg = await bot.sendTextMessage(channel.id, 'Hello, KOOK!');
        // console.log(`发送消息ID: ${textMsg.id}`);

        // 发送 KMarkdown 消息
        // const kmdMsg = await bot.sendKMarkdownMessage(channel.id, '**粗体** *斜体*');
        // console.log(`发送 KMarkdown 消息ID: ${kmdMsg.id}`);

        // 发送卡片消息
        // const cardMsg = await bot.sendCardMessage(channel.id, [
        //   {
        //     type: 'card',
        //     theme: 'primary',
        //     size: 'lg',
        //     modules: [
        //       {
        //         type: 'header',
        //         text: { type: 'plain-text', content: '卡片标题' }
        //       },
        //       {
        //         type: 'section',
        //         text: { type: 'kmarkdown', content: '卡片内容' }
        //       }
        //     ]
        //   }
        // ]);
        // console.log(`发送卡片消息ID: ${cardMsg.id}`);
      }

      // ========== 角色相关 ==========
      console.log('\n=== 角色相关 ===');

      // 获取角色列表
      const roles = await bot.getGuildRoles(guild.id);
      console.log(`角色数量: ${roles.length}`);

      // 创建角色
      // const newRole = await bot.createRole(guild.id, '新角色', {
      //   color: 0xFF0000,
      //   hoist: 1,
      //   mentionable: 1
      // });
      // console.log(`创建角色: ${newRole.name}`);

      // ========== 邀请相关 ==========
      console.log('\n=== 邀请相关 ===');

      // 获取邀请列表
      const invites = await bot.getInvites(guild.id);
      console.log(`邀请链接数量: ${invites.length}`);

      // ========== 黑名单相关 ==========
      console.log('\n=== 黑名单相关 ===');

      // 获取黑名单列表
      const blacklist = await bot.getBlacklist(guild.id);
      console.log(`黑名单用户数量: ${blacklist.meta.total}`);

      // ========== 静音/闭麦相关 ==========
      console.log('\n=== 静音/闭麦相关 ===');

      // 获取静音/闭麦列表
      const muteList = await bot.getMuteList(guild.id);
      console.log(`静音/闭麦用户数量: ${muteList.length}`);

      // ========== 助力相关 ==========
      console.log('\n=== 助力相关 ===');

      // 获取助力列表
      const boosts = await bot.getBoosts(guild.id);
      console.log(`助力用户数量: ${boosts.length}`);

      // 获取助力历史
      const boostHistory = await bot.getBoostHistory(guild.id);
      console.log(`助力历史数量: ${boostHistory.meta.total}`);

      // ========== 服务器表情相关 ==========
      console.log('\n=== 服务器表情相关 ===');

      // 获取服务器表情列表
      const emojis = await bot.getGuildEmojis(guild.id);
      console.log(`服务器表情数量: ${emojis.length}`);

      // ========== 公告相关 ==========
      console.log('\n=== 公告相关 ===');

      // 获取公告列表
      const announcements = await bot.getAnnouncements(guild.id);
      console.log(`公告数量: ${announcements.meta.total}`);

      // ========== 积分相关 ==========
      console.log('\n=== 积分相关 ===');

      // 获取积分排行
      const intimacyRank = await bot.getIntimacyRank(guild.id);
      console.log(`积分排行用户数量: ${intimacyRank.meta.total}`);

      // ========== 徽章相关 ==========
      console.log('\n=== 徽章相关 ===');

      // 获取徽章列表
      const badges = await bot.getBadges(guild.id);
      console.log(`徽章数量: ${badges.length}`);
    }

    // ========== 游戏相关 ==========
    console.log('\n=== 游戏相关 ===');

    // 获取游戏列表
    const games = await bot.getGames();
    console.log(`游戏数量: ${games.length}`);

    // ========== 私聊相关 ==========
    console.log('\n=== 私聊相关 ===');

    // 获取私信会话列表
    const dmSessions = await bot.getDirectMessageSessions();
    console.log(`私信会话数量: ${dmSessions.length}`);

    // 发送私信
    // const dmMsg = await bot.sendDirectTextMessage('user-id', '私信内容');
    // console.log(`发送私信ID: ${dmMsg.id}`);

    console.log('\n✅ API 演示完成');
  } catch (error) {
    console.error('❌ API 调用失败:', error);
  }
}

// 启动机器人并演示 API
async function main() {
  console.log('正在启动机器人...');
  await bot.start();

  console.log('开始演示 API...\n');
  await demonstrateAPIs();

  console.log('\n正在关闭机器人...');
  await bot.stop();
}

main().catch(console.error);
