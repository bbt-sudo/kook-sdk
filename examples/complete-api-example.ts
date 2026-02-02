// KOOK SDK 完整 API 使用示例
// 展示所有 HTTP API 接口的使用方法

import { KookBot } from '../src';

const TOKEN = process.env.KOOK_TOKEN || 'your-token-here';

const bot = new KookBot({
  token: TOKEN,
});

async function demonstrateAllAPIs() {
  try {
    console.log('=== KOOK SDK 完整 API 演示 ===\n');

    // ========== 1. 用户相关接口 ==========
    console.log('1. 用户相关接口');
    console.log('----------------');

    // 获取当前用户
    const currentUser = await bot.getCurrentUser();
    console.log(`✓ 当前用户: ${currentUser.username}#${currentUser.identify_num}`);

    // 获取用户详情
    // const user = await bot.getUser('user-id');

    // 批量获取用户信息
    // const users = await bot.getUsersBatch(['user-id-1', 'user-id-2']);

    // 下线当前用户
    // await bot.offline();

    // ========== 2. 用户聊天相关接口 ==========
    console.log('\n2. 用户聊天相关接口');
    console.log('-------------------');

    // 获取用户聊天会话列表
    const userChats = await bot.getUserChats();
    console.log(`✓ 用户聊天会话数量: ${userChats.length}`);

    // 创建用户聊天会话
    // const newChat = await bot.createUserChat('target-user-id');

    // 获取用户聊天会话详情
    // const chatDetail = await bot.getUserChat('chat-id');

    // 删除用户聊天会话
    // await bot.deleteUserChat('chat-id');

    // ========== 3. 服务器相关接口 ==========
    console.log('\n3. 服务器相关接口');
    console.log('------------------');

    // 获取服务器列表
    const guilds = await bot.getGuilds();
    console.log(`✓ 服务器数量: ${guilds.length}`);

    if (guilds.length > 0) {
      const guild = guilds[0];
      console.log(`✓ 第一个服务器: ${guild.name} (${guild.id})`);

      // 获取服务器详情
      const guildDetail = await bot.getGuild(guild.id);
      console.log(`✓ 服务器详情获取成功`);

      // 批量获取服务器信息
      // const guildsInfo = await bot.getGuildsBatch([guild.id]);

      // 获取服务器设置
      const guildSettings = await bot.getGuildSettings(guild.id);
      console.log(`✓ 服务器设置获取成功`);

      // 获取服务器成员列表
      const guildUsers = await bot.getGuildUsers(guild.id, { page_size: 10 });
      console.log(`✓ 服务器成员数: ${guildUsers.meta.total}`);

      // 修改服务器中用户的昵称
      // await bot.setGuildUserNickname(guild.id, 'user-id', '新昵称');

      // 离开服务器
      // await bot.leaveGuild(guild.id);

      // 踢出服务器用户
      // await bot.kickGuildUser(guild.id, 'target-id');

      // ========== 4. 频道相关接口 ==========
      console.log('\n4. 频道相关接口');
      console.log('----------------');

      // 获取频道列表
      const channels = await bot.getChannels(guild.id);
      console.log(`✓ 频道数量: ${channels.length}`);

      // 获取频道分组
      const categories = await bot.getChannelCategories(guild.id);
      console.log(`✓ 频道分组数量: ${categories.length}`);

      if (channels.length > 0) {
        const channel = channels[0];
        console.log(`✓ 第一个频道: ${channel.name} (${channel.id})`);

        // 获取频道详情
        const channelDetail = await bot.getChannel(channel.id);
        console.log(`✓ 频道详情获取成功`);

        // 获取频道用户列表
        const channelUsers = await bot.getChannelUsers(channel.id);
        console.log(`✓ 频道用户数量: ${channelUsers.length}`);

        // ========== 5. 频道权限相关接口 ==========
        console.log('\n5. 频道权限相关接口');
        console.log('--------------------');

        // 获取频道角色权限列表
        const rolePermissions = await bot.getChannelRolePermissions(channel.id);
        console.log(`✓ 频道角色权限数量: ${rolePermissions.length}`);

        // 创建频道角色权限
        // await bot.createChannelRolePermission(channel.id, 123, 0, 0);

        // 更新频道角色权限
        // await bot.updateChannelRolePermission(channel.id, 123, 1, 0);

        // 删除频道角色权限
        // await bot.deleteChannelRolePermission(channel.id, 123);

        // 获取频道用户权限列表
        const userPermissions = await bot.getChannelUserPermissions(channel.id);
        console.log(`✓ 频道用户权限数量: ${userPermissions.length}`);

        // 创建频道用户权限
        // await bot.createChannelUserPermission(channel.id, 'user-id', 0, 0);

        // 更新频道用户权限
        // await bot.updateChannelUserPermission(channel.id, 'user-id', 1, 0);

        // 删除频道用户权限
        // await bot.deleteChannelUserPermission(channel.id, 'user-id');

        // ========== 6. 消息相关接口 ==========
        console.log('\n6. 消息相关接口');
        console.log('----------------');

        // 获取消息列表
        const messages = await bot.getMessages(channel.id, { page_size: 10 });
        console.log(`✓ 消息数量: ${messages.meta.total}`);

        // 获取消息详情
        if (messages.items.length > 0) {
          const msg = await bot.getMessage(messages.items[0].id);
          console.log(`✓ 消息详情获取成功`);
        }

        // 发送文本消息
        // const textMsg = await bot.sendTextMessage(channel.id, 'Hello, KOOK!');

        // 发送 KMarkdown 消息
        // const kmdMsg = await bot.sendKMarkdownMessage(channel.id, '**粗体** *斜体*');

        // 发送卡片消息
        // const cardMsg = await bot.sendCardMessage(channel.id, [...]);

        // 发送图片消息
        // const imgMsg = await bot.sendImageMessage(channel.id, 'https://example.com/image.png');

        // 发送视频消息
        // const videoMsg = await bot.sendVideoMessage(channel.id, 'https://example.com/video.mp4');

        // 发送文件消息
        // const fileMsg = await bot.sendFileMessage(channel.id, 'https://example.com/file.pdf');

        // 发送音频消息
        // const audioMsg = await bot.sendAudioMessage(channel.id, 'https://example.com/audio.mp3');

        // 更新消息
        // await bot.updateMessage('msg-id', '新内容');

        // 删除消息
        // await bot.deleteMessage('msg-id');

        // 获取消息反应列表
        // const reactions = await bot.getMessageReactions('msg-id', 'emoji');

        // 添加消息反应
        // await bot.addReaction('msg-id', '👍');

        // 删除消息反应
        // await bot.removeReaction('msg-id', '👍', 'user-id');

        // 置顶消息
        // await bot.pinMessage('msg-id');

        // 取消置顶消息
        // await bot.unpinMessage('msg-id');
      }

      // 创建频道
      // const newChannel = await bot.createChannel(guild.id, '新频道');

      // 更新频道
      // await bot.updateChannel('channel-id', { name: '新名称' });

      // 删除频道
      // await bot.deleteChannel('channel-id');

      // 创建频道分组
      // const newCategory = await bot.createChannelCategory(guild.id, '新分组');

      // 更新频道分组
      // await bot.updateChannelCategory('category-id', '新名称');

      // 删除频道分组
      // await bot.deleteChannelCategory('category-id');

      // 移动频道到分组
      // await bot.moveChannelToCategory('channel-id', 'category-id');

      // ========== 7. 角色相关接口 ==========
      console.log('\n7. 角色相关接口');
      console.log('----------------');

      // 获取角色列表
      const roles = await bot.getGuildRoles(guild.id);
      console.log(`✓ 角色数量: ${roles.length}`);

      // 创建角色
      // const newRole = await bot.createRole(guild.id, '新角色', {
      //   color: 0xFF0000,
      //   hoist: 1,
      //   mentionable: 1
      // });

      // 更新角色
      // await bot.updateRole(guild.id, 123, { name: '新名称' });

      // 删除角色
      // await bot.deleteRole(guild.id, 123);

      // 赋予用户角色
      // await bot.grantRole(guild.id, 'user-id', 123);

      // 撤销用户角色
      // await bot.revokeRole(guild.id, 'user-id', 123);

      // ========== 8. 邀请相关接口 ==========
      console.log('\n8. 邀请相关接口');
      console.log('----------------');

      // 获取邀请列表
      const invites = await bot.getInvites(guild.id);
      console.log(`✓ 邀请链接数量: ${invites.length}`);

      // 创建邀请链接
      // const newInvite = await bot.createInvite('channel-id', {
      //   duration: 86400, // 24小时
      //   setting_times: 10 // 10次使用限制
      // });

      // 删除邀请链接
      // await bot.deleteInvite('url-code', guild.id);

      // ========== 9. 黑名单相关接口 ==========
      console.log('\n9. 黑名单相关接口');
      console.log('------------------');

      // 获取黑名单列表
      const blacklist = await bot.getBlacklist(guild.id);
      console.log(`✓ 黑名单用户数量: ${blacklist.meta.total}`);

      // 添加黑名单
      // await bot.addBlacklist(guild.id, 'user-id', {
      //   remark: '违规用户',
      //   del_msg_days: 7
      // });

      // 移除黑名单
      // await bot.removeBlacklist(guild.id, 'user-id');

      // ========== 10. 静音/闭麦相关接口 ==========
      console.log('\n10. 静音/闭麦相关接口');
      console.log('----------------------');

      // 获取静音/闭麦列表
      const muteList = await bot.getMuteList(guild.id);
      console.log(`✓ 静音/闭麦用户数量: ${muteList.length}`);

      // 添加静音/闭麦 (1: 麦克风静音, 2: 耳机静音)
      // await bot.addMute(guild.id, 'user-id', 1);

      // 移除静音/闭麦
      // await bot.removeMute(guild.id, 'user-id', 1);

      // ========== 11. 助力相关接口 ==========
      console.log('\n11. 助力相关接口');
      console.log('-----------------');

      // 获取助力列表
      const boosts = await bot.getBoosts(guild.id);
      console.log(`✓ 助力用户数量: ${boosts.length}`);

      // 获取助力历史
      const boostHistory = await bot.getBoostHistory(guild.id);
      console.log(`✓ 助力历史数量: ${boostHistory.meta.total}`);

      // ========== 12. 服务器表情相关接口 ==========
      console.log('\n12. 服务器表情相关接口');
      console.log('-----------------------');

      // 获取服务器表情列表
      const emojis = await bot.getGuildEmojis(guild.id);
      console.log(`✓ 服务器表情数量: ${emojis.length}`);

      // 创建服务器表情
      // await bot.createGuildEmoji(guild.id, '表情名称', 'emoji-content');

      // 更新服务器表情
      // await bot.updateGuildEmoji(guild.id, 'emoji-id', '新名称');

      // 删除服务器表情
      // await bot.deleteGuildEmoji(guild.id, 'emoji-id');

      // ========== 13. 公告相关接口 ==========
      console.log('\n13. 公告相关接口');
      console.log('-----------------');

      // 获取公告列表
      const announcements = await bot.getAnnouncements(guild.id);
      console.log(`✓ 公告数量: ${announcements.meta.total}`);

      // 创建公告
      // await bot.createAnnouncement(guild.id, 'channel-id', '公告内容');

      // 更新公告
      // await bot.updateAnnouncement('announcement-id', '新内容');

      // 删除公告
      // await bot.deleteAnnouncement('announcement-id');

      // ========== 14. 积分相关接口 ==========
      console.log('\n14. 积分相关接口');
      console.log('-----------------');

      // 获取积分排行
      const intimacyRank = await bot.getIntimacyRank(guild.id);
      console.log(`✓ 积分排行用户数量: ${intimacyRank.meta.total}`);

      // 获取用户积分信息
      // const intimacyInfo = await bot.getIntimacyInfo('user-id', guild.id);

      // 更新用户积分
      // await bot.updateIntimacy('user-id', guild.id, 100);

      // ========== 15. 徽章相关接口 ==========
      console.log('\n15. 徽章相关接口');
      console.log('-----------------');

      // 获取徽章列表
      const badges = await bot.getBadges(guild.id);
      console.log(`✓ 徽章数量: ${badges.length}`);

      // 创建徽章
      // await bot.createBadge(guild.id, '徽章名称', 'https://example.com/badge.png', {
      //   description: '徽章描述'
      // });

      // 更新徽章
      // await bot.updateBadge('badge-id', { name: '新名称' });

      // 删除徽章
      // await bot.deleteBadge('badge-id');

      // 授予用户徽章
      // await bot.grantBadge(guild.id, 'user-id', 'badge-id');

      // 撤销用户徽章
      // await bot.revokeBadge(guild.id, 'user-id', 'badge-id');

      // ========== 16. 打卡相关接口 ==========
      console.log('\n16. 打卡相关接口');
      console.log('-----------------');

      // 获取打卡信息
      const punchInInfo = await bot.getPunchIn(guild.id);
      console.log(`✓ 连续打卡天数: ${punchInInfo.day_count}`);

      // 打卡
      // await bot.punchIn(guild.id);
    }

    // ========== 17. 私聊相关接口 ==========
    console.log('\n17. 私聊相关接口');
    console.log('-----------------');

    // 获取私信会话列表
    const dmSessions = await bot.getDirectMessageSessions();
    console.log(`✓ 私信会话数量: ${dmSessions.length}`);

    // 创建私信会话
    // const dmSession = await bot.createDirectMessageSession('target-id');

    // 发送私信
    // const dmMsg = await bot.sendDirectMessage('target-id', '私信内容');

    // 发送私信文本
    // const dmText = await bot.sendDirectTextMessage('target-id', '私信文本');

    // 发送私信 KMarkdown
    // const dmKmd = await bot.sendDirectKMarkdownMessage('target-id', '**私信**');

    // 发送私信卡片
    // const dmCard = await bot.sendDirectCardMessage('target-id', [...]);

    // ========== 18. 游戏相关接口 ==========
    console.log('\n18. 游戏相关接口');
    console.log('-----------------');

    // 获取游戏列表
    const games = await bot.getGames();
    console.log(`✓ 游戏数量: ${games.length}`);

    // 创建游戏
    // const newGame = await bot.createGame('游戏名称', 'https://example.com/icon.png');

    // 更新游戏
    // await bot.updateGame(123, { name: '新名称' });

    // 删除游戏
    // await bot.deleteGame(123);

    // 开始玩游戏
    // await bot.startPlaying(123);

    // 结束玩游戏
    // await bot.stopPlaying(123);

    // ========== 19. 日程相关接口 ==========
    console.log('\n19. 日程相关接口');
    console.log('-----------------');

    if (guilds.length > 0) {
      const channels = await bot.getChannels(guilds[0].id);
      if (channels.length > 0) {
        // 获取日程列表
        const schedules = await bot.getSchedules(channels[0].id);
        console.log(`✓ 日程数量: ${schedules.meta.total}`);

        // 获取日程详情
        // const schedule = await bot.getSchedule('schedule-id');

        // 创建日程
        // const newSchedule = await bot.createSchedule(
        //   'channel-id',
        //   '日程标题',
        //   Date.now(),
        //   Date.now() + 3600000
        // );

        // 更新日程
        // await bot.updateSchedule('schedule-id', { title: '新标题' });

        // 删除日程
        // await bot.deleteSchedule('schedule-id');
      }
    }

    // ========== 20. 语音相关接口 ==========
    console.log('\n20. 语音相关接口');
    console.log('-----------------');

    // 加入语音频道
    // const voiceConn = await bot.joinVoiceChannel('channel-id');

    // 离开语音频道
    // await bot.leaveVoiceChannel('channel-id');

    // 获取机器人加入的语音频道列表
    const voiceChannels = await bot.getVoiceChannels();
    console.log(`✓ 语音频道数量: ${voiceChannels.meta.total}`);

    // 保持语音连接活跃
    // await bot.keepVoiceAlive('channel-id');

    // ========== 21. 资源上传相关接口 ==========
    console.log('\n21. 资源上传相关接口');
    console.log('---------------------');

    // 上传文件/图片/视频
    // const { url } = await bot.uploadFile('/path/to/file.png');

    // 上传并发送图片
    // const uploadedImg = await bot.uploadAndSendImage('channel-id', '/path/to/image.png');

    // 上传并发送文件
    // const uploadedFile = await bot.uploadAndSendFile('channel-id', '/path/to/file.pdf');

    // 上传并发送视频
    // const uploadedVideo = await bot.uploadAndSendVideo('channel-id', '/path/to/video.mp4');

    // ========== 22. 网关相关接口 ==========
    console.log('\n22. 网关相关接口');
    console.log('-----------------');

    // 获取网关连接地址
    const gateway = await bot.getGateway();
    console.log(`✓ 网关地址: ${gateway.url}`);

    console.log('\n=== ✅ 所有 API 演示完成 ===');
  } catch (error) {
    console.error('❌ API 调用失败:', error);
  }
}

// 启动机器人并演示 API
async function main() {
  console.log('正在启动机器人...');
  await bot.start();

  console.log('开始演示 API...\n');
  await demonstrateAllAPIs();

  console.log('\n正在关闭机器人...');
  await bot.stop();
}

main().catch(console.error);
