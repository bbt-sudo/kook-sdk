import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import {
  KookResponse,
  KookAPIError,
  User,
  Guild,
  Channel,
  Message,
  SendMessageParams,
  DirectMessageSession,
  Role,
  MessageType,
  VoiceConnection,
  Invite,
  BlacklistUser,
  MuteUser,
  GuildBoost,
  BoostHistory,
  GuildEmoji,
  Announcement,
  IntimacyRank,
  IntimacyInfo,
  Game,
  GameStatus,
  Badge,
  Schedule,
  ChannelCategory,
  UserChat,
  ChannelRolePermission,
  ChannelUserPermission,
  PunchIn,
  GuildWelcome,
  GuildNotify,
  DirectMessageDetail,
} from '../types';

// KOOK API 基础 URL
const API_BASE_URL = 'https://www.kookapp.cn/api/v3';

export class HttpClient {
  private axios: AxiosInstance;

  constructor(token: string) {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // 响应拦截器
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data) {
          const { code, message } = error.response.data;
          throw new KookAPIError(code, message, error.response.data);
        }
        throw error;
      }
    );
  }

  // 通用请求方法
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.axios.request<KookResponse<T>>(config);
    if (response.data.code !== 0) {
      throw new KookAPIError(
        response.data.code,
        response.data.message,
        response.data
      );
    }
    return response.data.data;
  }

  // GET 请求
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'GET', url, params });
  }

  // POST 请求
  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }

  // ========== 用户相关接口 ==========

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/user/me');
  }

  // 获取用户详情
  async getUser(userId: string): Promise<User> {
    return this.get<User>('/user/view', { user_id: userId });
  }

  // 下线当前用户
  async offline(): Promise<void> {
    await this.post('/user/offline');
  }

  // ========== 服务器相关接口 ==========

  // 获取服务器列表
  async getGuilds(): Promise<Guild[]> {
    const result = await this.get<{ items: Guild[] }>('/guild/list');
    return result.items;
  }

  // 获取服务器详情
  async getGuild(guildId: string): Promise<Guild> {
    return this.get<Guild>('/guild/view', { guild_id: guildId });
  }

  // 获取服务器中的用户列表
  async getGuildUsers(
    guildId: string,
    options?: {
      channel_id?: string;
      search?: string;
      role_id?: number;
      mobile_verified?: boolean;
      active_time?: number;
      joined_at?: number;
      page?: number;
      page_size?: number;
      filter_user_id?: string;
    }
  ): Promise<{ items: User[]; meta: { page: number; page_total: number; total: number } }> {
    return this.get('/guild/user-list', {
      guild_id: guildId,
      ...options,
    });
  }

  // 修改服务器中用户的昵称
  async setGuildUserNickname(
    guildId: string,
    userId: string,
    nickname: string
  ): Promise<void> {
    await this.post('/guild/nickname', {
      guild_id: guildId,
      user_id: userId,
      nickname,
    });
  }

  // 离开服务器
  async leaveGuild(guildId: string): Promise<void> {
    await this.post('/guild/leave', { guild_id: guildId });
  }

  // 踢出服务器用户
  async kickGuildUser(guildId: string, targetId: string): Promise<void> {
    await this.post('/guild/kickout', {
      guild_id: guildId,
      target_id: targetId,
    });
  }

  // ========== 频道相关接口 ==========

  // 获取频道列表
  async getChannels(guildId: string): Promise<Channel[]> {
    const result = await this.get<{ items: Channel[] }>('/channel/list', {
      guild_id: guildId,
    });
    return result.items;
  }

  // 获取频道详情
  async getChannel(channelId: string): Promise<Channel> {
    return this.get<Channel>('/channel/view', { target_id: channelId });
  }

  // 创建频道
  async createChannel(
    guildId: string,
    name: string,
    options?: {
      parent_id?: string;
      type?: number;
      limit_amount?: number;
      voice_quality?: string;
    }
  ): Promise<Channel> {
    return this.post<Channel>('/channel/create', {
      guild_id: guildId,
      name,
      ...options,
    });
  }

  // 修改频道
  async updateChannel(
    channelId: string,
    options: {
      name?: string;
      topic?: string;
      slow_mode?: number;
    }
  ): Promise<Channel> {
    return this.post<Channel>('/channel/update', {
      channel_id: channelId,
      ...options,
    });
  }

  // 删除频道
  async deleteChannel(channelId: string): Promise<void> {
    await this.post('/channel/delete', { channel_id: channelId });
  }

  // 获取频道用户列表
  async getChannelUsers(channelId: string): Promise<User[]> {
    const result = await this.get<{ items: User[] }>('/channel/user-list', {
      target_id: channelId,
    });
    return result.items;
  }

  // 移动频道
  async moveChannel(
    channelId: string,
    parentId?: string,
    after?: string
  ): Promise<void> {
    await this.post('/channel/move-user', {
      channel_id: channelId,
      parent_id: parentId,
      after,
    });
  }

  // ========== 消息相关接口 ==========

  // 获取频道消息列表
  async getMessages(
    channelId: string,
    options?: {
      msg_id?: string;
      pin?: number;
      flag?: string;
      page_size?: number;
    }
  ): Promise<{ items: Message[]; meta: { page: number; page_total: number; total: number } }> {
    return this.get('/message/list', {
      target_id: channelId,
      ...options,
    });
  }

  // 获取消息详情
  async getMessage(msgId: string): Promise<Message> {
    return this.get<Message>('/message/view', { msg_id: msgId });
  }

  // 发送频道消息
  async sendChannelMessage(
    channelId: string,
    content: string,
    options?: {
      type?: MessageType;
      quote?: string;
      nonce?: string;
      temp_target_id?: string;
    }
  ): Promise<Message> {
    return this.post<Message>('/message/create', {
      target_id: channelId,
      content,
      ...options,
    });
  }

  // 更新频道消息
  async updateMessage(
    msgId: string,
    content: string,
    options?: {
      quote?: string;
      temp_target_id?: string;
    }
  ): Promise<Message> {
    return this.post<Message>('/message/update', {
      msg_id: msgId,
      content,
      ...options,
    });
  }

  // 删除频道消息
  async deleteMessage(msgId: string): Promise<void> {
    await this.post('/message/delete', { msg_id: msgId });
  }

  // 获取频道消息反应列表
  async getMessageReactions(
    msgId: string,
    emoji: string
  ): Promise<{ items: User[]; meta: { total: number } }> {
    return this.get('/message/reaction-list', {
      msg_id: msgId,
      emoji,
    });
  }

  // 添加消息反应
  async addMessageReaction(msgId: string, emoji: string): Promise<void> {
    await this.post('/message/add-reaction', {
      msg_id: msgId,
      emoji,
    });
  }

  // 删除消息反应
  async removeMessageReaction(msgId: string, emoji: string, userId?: string): Promise<void> {
    await this.post('/message/delete-reaction', {
      msg_id: msgId,
      emoji,
      user_id: userId,
    });
  }

  // ========== 私聊相关接口 ==========

  // 获取私信会话列表
  async getDirectMessageSessions(): Promise<DirectMessageSession[]> {
    const result = await this.get<{ items: DirectMessageSession[] }>('/direct-message/list');
    return result.items;
  }

  // 创建私信会话
  async createDirectMessageSession(targetId: string): Promise<{ code: string }> {
    return this.post('/direct-message/create', { target_id: targetId });
  }

  // 发送私信消息
  async sendDirectMessage(
    targetId: string,
    content: string,
    options?: {
      type?: MessageType;
      quote?: string;
      nonce?: string;
    }
  ): Promise<Message> {
    return this.post<Message>('/direct-message/create', {
      target_id: targetId,
      content,
      ...options,
    });
  }

  // ========== 角色相关接口 ==========

  // 获取服务器角色列表
  async getGuildRoles(guildId: string): Promise<Role[]> {
    const result = await this.get<{ items: Role[]; user_id?: string; user_count?: number }>(
      '/guild-role/list',
      { guild_id: guildId }
    );
    return result.items;
  }

  // 创建角色
  async createRole(
    guildId: string,
    name: string,
    options?: {
      color?: number;
      hoist?: number;
      mentionable?: number;
      permissions?: number;
    }
  ): Promise<Role> {
    return this.post<Role>('/guild-role/create', {
      guild_id: guildId,
      name,
      ...options,
    });
  }

  // 更新角色
  async updateRole(
    guildId: string,
    roleId: number,
    options: {
      name?: string;
      color?: number;
      hoist?: number;
      mentionable?: number;
      permissions?: number;
    }
  ): Promise<Role> {
    return this.post<Role>('/guild-role/update', {
      guild_id: guildId,
      role_id: roleId,
      ...options,
    });
  }

  // 删除角色
  async deleteRole(guildId: string, roleId: number): Promise<void> {
    await this.post('/guild-role/delete', {
      guild_id: guildId,
      role_id: roleId,
    });
  }

  // 赋予用户角色
  async grantRole(guildId: string, userId: string, roleId: number): Promise<void> {
    await this.post('/guild-role/grant', {
      guild_id: guildId,
      user_id: userId,
      role_id: roleId,
    });
  }

  // 撤销用户角色
  async revokeRole(guildId: string, userId: string, roleId: number): Promise<void> {
    await this.post('/guild-role/revoke', {
      guild_id: guildId,
      user_id: userId,
      role_id: roleId,
    });
  }

  // ========== 资源上传接口 ==========

  // 上传文件/图片/视频
  // 支持 Buffer、Stream 或文件路径
  async uploadAsset(
    file: Buffer | NodeJS.ReadableStream | string,
    options?: {
      filename?: string;
      contentType?: string;
    }
  ): Promise<{ url: string }> {
    const formData = new FormData();
    
    if (typeof file === 'string') {
      // 文件路径
      const fs = await import('fs');
      const path = await import('path');
      const fileStream = fs.createReadStream(file);
      const filename = options?.filename || path.basename(file);
      formData.append('file', fileStream, {
        filename,
        contentType: options?.contentType,
      });
    } else {
      // Buffer 或 Stream
      formData.append('file', file, {
        filename: options?.filename || 'file',
        contentType: options?.contentType,
      });
    }

    const response = await this.axios.post<KookResponse<{ url: string }>>(
      '/asset/create',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    if (response.data.code !== 0) {
      throw new KookAPIError(response.data.code, response.data.message, response.data);
    }

    return response.data.data;
  }

  // ========== 消息置顶接口 ==========

  // 置顶频道消息
  async pinMessage(msgId: string): Promise<void> {
    await this.post('/message/pin', { msg_id: msgId });
  }

  // 取消置顶频道消息
  async unpinMessage(msgId: string): Promise<void> {
    await this.post('/message/unpin', { msg_id: msgId });
  }

  // ========== 语音接口 ==========

  // 加入语音频道
  async joinVoiceChannel(
    channelId: string,
    options?: {
      audio_ssrc?: string;
      audio_pt?: string;
      rtcp_mux?: boolean;
      password?: string;
    }
  ): Promise<VoiceConnection> {
    return this.post<VoiceConnection>('/voice/join', {
      channel_id: channelId,
      ...options,
    });
  }

  // 离开语音频道
  async leaveVoiceChannel(channelId: string): Promise<void> {
    await this.post('/voice/leave', { channel_id: channelId });
  }

  // 获取机器人加入的语音频道列表
  async getVoiceChannels(): Promise<{ items: Channel[]; meta: { page: number; page_total: number; total: number } }> {
    return this.get('/voice/list');
  }

  // 保持语音连接活跃
  async keepVoiceAlive(channelId: string): Promise<void> {
    await this.post('/voice/keep-alive', { channel_id: channelId });
  }

  // ========== 邀请相关接口 ==========

  // 获取邀请列表
  async getInvites(guildId: string): Promise<Invite[]> {
    const result = await this.get<{ items: Invite[] }>('/invite/list', {
      guild_id: guildId,
    });
    return result.items;
  }

  // 创建邀请链接
  async createInvite(
    channelId: string,
    options?: {
      duration?: number; // 有效期（秒），0 为永久
      setting_times?: number; // 使用次数，0 为无限
    }
  ): Promise<Invite> {
    return this.post<Invite>('/invite/create', {
      channel_id: channelId,
      ...options,
    });
  }

  // 删除邀请链接
  async deleteInvite(urlCode: string, guildId: string): Promise<void> {
    await this.post('/invite/delete', {
      url_code: urlCode,
      guild_id: guildId,
    });
  }

  // ========== 服务器黑名单相关接口 ==========

  // 获取黑名单列表
  async getBlacklist(
    guildId: string,
    options?: {
      page?: number;
      page_size?: number;
    }
  ): Promise<{ items: BlacklistUser[]; meta: { page: number; page_total: number; total: number } }> {
    return this.get('/blacklist/list', {
      guild_id: guildId,
      ...options,
    });
  }

  // 添加黑名单
  async addBlacklist(
    guildId: string,
    targetId: string,
    options?: {
      remark?: string;
      del_msg_days?: number; // 删除该用户最近几天的消息
    }
  ): Promise<void> {
    await this.post('/blacklist/create', {
      guild_id: guildId,
      target_id: targetId,
      ...options,
    });
  }

  // 移除黑名单
  async removeBlacklist(guildId: string, targetId: string): Promise<void> {
    await this.post('/blacklist/delete', {
      guild_id: guildId,
      target_id: targetId,
    });
  }

  // ========== 服务器静音/闭麦相关接口 ==========

  // 获取静音/闭麦列表
  async getMuteList(guildId: string): Promise<MuteUser[]> {
    const result = await this.get<{ items: MuteUser[] }>('/guild-mute/list', {
      guild_id: guildId,
    });
    return result.items;
  }

  // 添加静音/闭麦
  async addMute(
    guildId: string,
    targetId: string,
    type: 1 | 2 // 1: 麦克风静音, 2: 耳机静音
  ): Promise<void> {
    await this.post('/guild-mute/create', {
      guild_id: guildId,
      target_id: targetId,
      type,
    });
  }

  // 移除静音/闭麦
  async removeMute(
    guildId: string,
    targetId: string,
    type: 1 | 2
  ): Promise<void> {
    await this.post('/guild-mute/delete', {
      guild_id: guildId,
      target_id: targetId,
      type,
    });
  }

  // ========== 服务器助力相关接口 ==========

  // 获取助力列表
  async getBoosts(guildId: string): Promise<GuildBoost[]> {
    const result = await this.get<{ items: GuildBoost[] }>('/guild-boost/list', {
      guild_id: guildId,
    });
    return result.items;
  }

  // 获取助力历史
  async getBoostHistory(
    guildId: string,
    options?: {
      start_time?: number;
      end_time?: number;
      page?: number;
      page_size?: number;
    }
  ): Promise<{ items: BoostHistory[]; meta: { page: number; page_total: number; total: number } }> {
    return this.get('/guild-boost/history', {
      guild_id: guildId,
      ...options,
    });
  }

  // ========== 服务器表情相关接口 ==========

  // 获取服务器表情列表
  async getGuildEmojis(guildId: string): Promise<GuildEmoji[]> {
    const result = await this.get<{ items: GuildEmoji[] }>('/guild-emoji/list', {
      guild_id: guildId,
    });
    return result.items;
  }

  // 创建服务器表情
  async createGuildEmoji(
    guildId: string,
    name: string,
    emoji: string
  ): Promise<GuildEmoji> {
    return this.post<GuildEmoji>('/guild-emoji/create', {
      guild_id: guildId,
      name,
      emoji,
    });
  }

  // 更新服务器表情
  async updateGuildEmoji(
    guildId: string,
    emojiId: string,
    name: string
  ): Promise<GuildEmoji> {
    return this.post<GuildEmoji>('/guild-emoji/update', {
      guild_id: guildId,
      id: emojiId,
      name,
    });
  }

  // 删除服务器表情
  async deleteGuildEmoji(guildId: string, emojiId: string): Promise<void> {
    await this.post('/guild-emoji/delete', {
      guild_id: guildId,
      emoji_id: emojiId,
    });
  }

  // ========== 服务器公告相关接口 ==========

  // 获取公告列表
  async getAnnouncements(
    guildId: string,
    options?: {
      page?: number;
      page_size?: number;
    }
  ): Promise<{ items: Announcement[]; meta: { page: number; page_total: number; total: number } }> {
    return this.get('/announcement/list', {
      guild_id: guildId,
      ...options,
    });
  }

  // 创建公告
  async createAnnouncement(
    guildId: string,
    channelId: string,
    content: string
  ): Promise<Announcement> {
    return this.post<Announcement>('/announcement/create', {
      guild_id: guildId,
      channel_id: channelId,
      content,
    });
  }

  // 更新公告
  async updateAnnouncement(
    announcementId: string,
    content: string
  ): Promise<Announcement> {
    return this.post<Announcement>('/announcement/update', {
      id: announcementId,
      content,
    });
  }

  // 删除公告
  async deleteAnnouncement(announcementId: string): Promise<void> {
    await this.post('/announcement/delete', { id: announcementId });
  }

  // ========== 服务器积分相关接口 ==========

  // 获取积分排行
  async getIntimacyRank(
    guildId: string,
    options?: {
      page?: number;
      page_size?: number;
    }
  ): Promise<{ items: IntimacyRank[]; meta: { page: number; page_total: number; total: number } }> {
    return this.get('/intimacy/rank', {
      guild_id: guildId,
      ...options,
    });
  }

  // 获取用户积分信息
  async getIntimacyInfo(userId: string, guildId: string): Promise<IntimacyInfo> {
    return this.get<IntimacyInfo>('/intimacy/index', {
      user_id: userId,
      guild_id: guildId,
    });
  }

  // 更新用户积分
  async updateIntimacy(
    userId: string,
    guildId: string,
    score: number
  ): Promise<void> {
    await this.post('/intimacy/update', {
      user_id: userId,
      guild_id: guildId,
      score,
    });
  }

  // ========== 游戏相关接口 ==========

  // 获取游戏列表
  async getGames(): Promise<Game[]> {
    const result = await this.get<{ items: Game[] }>('/game');
    return result.items;
  }

  // 创建游戏
  async createGame(
    name: string,
    icon: string,
    options?: {
      process_name?: string[];
      product_name?: string[];
    }
  ): Promise<Game> {
    return this.post<Game>('/game/create', {
      name,
      icon,
      ...options,
    });
  }

  // 更新游戏
  async updateGame(
    gameId: number,
    options: {
      name?: string;
      icon?: string;
      process_name?: string[];
      product_name?: string[];
    }
  ): Promise<Game> {
    return this.post<Game>('/game/update', {
      id: gameId,
      ...options,
    });
  }

  // 删除游戏
  async deleteGame(gameId: number): Promise<void> {
    await this.post('/game/delete', { id: gameId });
  }

  // 开始玩游戏
  async startPlaying(gameId: number): Promise<void> {
    await this.post('/game/activity', {
      id: gameId,
      data_type: 1,
    });
  }

  // 结束玩游戏
  async stopPlaying(gameId: number): Promise<void> {
    await this.post('/game/delete-activity', { id: gameId });
  }

  // ========== 徽章相关接口 ==========

  // 获取徽章列表
  async getBadges(guildId: string): Promise<Badge[]> {
    const result = await this.get<{ items: Badge[] }>('/badge/list', {
      guild_id: guildId,
    });
    return result.items;
  }

  // 创建徽章
  async createBadge(
    guildId: string,
    name: string,
    icon: string,
    options?: {
      description?: string;
    }
  ): Promise<Badge> {
    return this.post<Badge>('/badge/create', {
      guild_id: guildId,
      name,
      icon,
      ...options,
    });
  }

  // 更新徽章
  async updateBadge(
    badgeId: string,
    options: {
      name?: string;
      icon?: string;
      description?: string;
    }
  ): Promise<Badge> {
    return this.post<Badge>('/badge/update', {
      id: badgeId,
      ...options,
    });
  }

  // 删除徽章
  async deleteBadge(badgeId: string): Promise<void> {
    await this.post('/badge/delete', { id: badgeId });
  }

  // 授予用户徽章
  async grantBadge(
    guildId: string,
    userId: string,
    badgeId: string
  ): Promise<void> {
    await this.post('/badge/grant', {
      guild_id: guildId,
      user_id: userId,
      badge_id: badgeId,
    });
  }

  // 撤销用户徽章
  async revokeBadge(
    guildId: string,
    userId: string,
    badgeId: string
  ): Promise<void> {
    await this.post('/badge/revoke', {
      guild_id: guildId,
      user_id: userId,
      badge_id: badgeId,
    });
  }

  // ========== 服务器日程相关接口 ==========

  // 获取日程列表
  async getSchedules(
    channelId: string,
    options?: {
      start_time?: number;
      end_time?: number;
      page?: number;
      page_size?: number;
    }
  ): Promise<{ items: Schedule[]; meta: { page: number; page_total: number; total: number } }> {
    return this.get('/schedule/list', {
      channel_id: channelId,
      ...options,
    });
  }

  // 获取日程详情
  async getSchedule(scheduleId: string): Promise<Schedule> {
    return this.get<Schedule>('/schedule/view', { id: scheduleId });
  }

  // 创建日程
  async createSchedule(
    channelId: string,
    title: string,
    startTime: number,
    endTime: number,
    options?: {
      content?: string;
      description?: string;
      reminder?: string;
    }
  ): Promise<Schedule> {
    return this.post<Schedule>('/schedule/create', {
      channel_id: channelId,
      title,
      start_time: startTime,
      end_time: endTime,
      ...options,
    });
  }

  // 更新日程
  async updateSchedule(
    scheduleId: string,
    options: {
      title?: string;
      start_time?: number;
      end_time?: number;
      content?: string;
      description?: string;
      reminder?: string;
    }
  ): Promise<Schedule> {
    return this.post<Schedule>('/schedule/update', {
      id: scheduleId,
      ...options,
    });
  }

  // 删除日程
  async deleteSchedule(scheduleId: string): Promise<void> {
    await this.post('/schedule/delete', { id: scheduleId });
  }

  // ========== 频道分组相关接口 ==========

  // 获取频道分组列表
  async getChannelCategories(guildId: string): Promise<ChannelCategory[]> {
    const result = await this.get<{ items: ChannelCategory[] }>('/channel/list', {
      guild_id: guildId,
    });
    return result.items.filter((item) => item.is_category);
  }

  // 创建频道分组
  async createChannelCategory(
    guildId: string,
    name: string
  ): Promise<ChannelCategory> {
    return this.post<ChannelCategory>('/channel/create', {
      guild_id: guildId,
      name,
      is_category: true,
    });
  }

  // 更新频道分组
  async updateChannelCategory(
    categoryId: string,
    name: string
  ): Promise<ChannelCategory> {
    return this.post<ChannelCategory>('/channel/update', {
      channel_id: categoryId,
      name,
    });
  }

  // 删除频道分组
  async deleteChannelCategory(categoryId: string): Promise<void> {
    await this.post('/channel/delete', { channel_id: categoryId });
  }

  // 移动频道到分组
  async moveChannelToCategory(
    channelId: string,
    parentId: string
  ): Promise<void> {
    await this.post('/channel/move-user', {
      channel_id: channelId,
      parent_id: parentId,
    });
  }

  // ========== 用户聊天相关接口 ==========

  // 获取用户聊天会话列表
  async getUserChats(): Promise<UserChat[]> {
    const result = await this.get<{ items: UserChat[] }>('/user-chat/list');
    return result.items;
  }

  // 获取用户聊天会话详情
  async getUserChat(chatId: string): Promise<UserChat> {
    return this.get<UserChat>('/user-chat/view', { chat_id: chatId });
  }

  // 创建用户聊天会话
  async createUserChat(targetId: string): Promise<UserChat> {
    return this.post<UserChat>('/user-chat/create', { target_id: targetId });
  }

  // 删除用户聊天会话
  async deleteUserChat(chatId: string): Promise<void> {
    await this.post('/user-chat/delete', { chat_id: chatId });
  }

  // ========== 频道角色权限相关接口 ==========

  // 获取频道角色权限列表
  async getChannelRolePermissions(channelId: string): Promise<ChannelRolePermission[]> {
    const result = await this.get<{ items: ChannelRolePermission[] }>('/channel-role/index', {
      channel_id: channelId,
    });
    return result.items;
  }

  // 创建频道角色权限
  async createChannelRolePermission(
    channelId: string,
    roleId: number,
    allow: number,
    deny: number
  ): Promise<ChannelRolePermission> {
    return this.post<ChannelRolePermission>('/channel-role/create', {
      channel_id: channelId,
      role_id: roleId,
      allow,
      deny,
    });
  }

  // 更新频道角色权限
  async updateChannelRolePermission(
    channelId: string,
    roleId: number,
    allow: number,
    deny: number
  ): Promise<ChannelRolePermission> {
    return this.post<ChannelRolePermission>('/channel-role/update', {
      channel_id: channelId,
      role_id: roleId,
      allow,
      deny,
    });
  }

  // 删除频道角色权限
  async deleteChannelRolePermission(channelId: string, roleId: number): Promise<void> {
    await this.post('/channel-role/delete', {
      channel_id: channelId,
      role_id: roleId,
    });
  }

  // ========== 频道用户权限相关接口 ==========

  // 获取频道用户权限列表
  async getChannelUserPermissions(channelId: string): Promise<ChannelUserPermission[]> {
    const result = await this.get<{ items: ChannelUserPermission[] }>('/channel-user/index', {
      channel_id: channelId,
    });
    return result.items;
  }

  // 创建频道用户权限
  async createChannelUserPermission(
    channelId: string,
    userId: string,
    allow: number,
    deny: number
  ): Promise<ChannelUserPermission> {
    return this.post<ChannelUserPermission>('/channel-user/create', {
      channel_id: channelId,
      user_id: userId,
      allow,
      deny,
    });
  }

  // 更新频道用户权限
  async updateChannelUserPermission(
    channelId: string,
    userId: string,
    allow: number,
    deny: number
  ): Promise<ChannelUserPermission> {
    return this.post<ChannelUserPermission>('/channel-user/update', {
      channel_id: channelId,
      user_id: userId,
      allow,
      deny,
    });
  }

  // 删除频道用户权限
  async deleteChannelUserPermission(channelId: string, userId: string): Promise<void> {
    await this.post('/channel-user/delete', {
      channel_id: channelId,
      user_id: userId,
    });
  }

  // ========== 服务器打卡相关接口 ==========

  // 获取服务器打卡信息
  async getPunchIn(guildId: string): Promise<PunchIn> {
    return this.get<PunchIn>('/punch-in/index', { guild_id: guildId });
  }

  // 服务器打卡
  async punchIn(guildId: string): Promise<void> {
    await this.post('/punch-in/punch-in', { guild_id: guildId });
  }

  // ========== 批量相关接口 ==========

  // 批量获取用户信息
  async getUsersBatch(userIds: string[]): Promise<User[]> {
    const result = await this.post<{ items: User[] }>('/user/batch-get-user-info', {
      user_ids: userIds,
    });
    return result.items;
  }

  // 批量获取服务器信息
  async getGuildsBatch(guildIds: string[]): Promise<Guild[]> {
    const result = await this.post<{ items: Guild[] }>('/guild/batch-get-guild-info', {
      guild_ids: guildIds,
    });
    return result.items;
  }

  // ========== 服务器设置相关接口 ==========

  // 获取服务器设置
  async getGuildSettings(guildId: string): Promise<{
    guild_id: string;
    notify_type: number;
    region: string;
    enable_open: number;
    open_id: number;
    default_channel_id: string;
    welcome_channel_id: string;
  }> {
    return this.get('/guild-setting/index', { guild_id: guildId });
  }

  // ========== 网关相关接口 ==========

  // 获取网关连接地址
  async getGateway(compress?: boolean): Promise<{
    url: string;
    compress?: boolean;
  }> {
    return this.get('/gateway/index', { compress });
  }

  // ========== 服务器欢迎设置相关接口 ==========

  // 获取服务器欢迎设置
  async getGuildWelcome(guildId: string): Promise<GuildWelcome> {
    return this.get<GuildWelcome>('/guild-welcome/index', { guild_id: guildId });
  }

  // 更新服务器欢迎设置
  async updateGuildWelcome(
    guildId: string,
    options: {
      channel_id?: string;
      is_send_msg?: boolean;
      message?: string;
    }
  ): Promise<GuildWelcome> {
    return this.post<GuildWelcome>('/guild-welcome/update', {
      guild_id: guildId,
      ...options,
    });
  }

  // ========== 服务器通知设置相关接口 ==========

  // 获取服务器通知设置
  async getGuildNotify(guildId: string): Promise<GuildNotify> {
    return this.get<GuildNotify>('/guild-notify/index', { guild_id: guildId });
  }

  // 更新服务器通知设置
  async updateGuildNotify(guildId: string, notifyType: number): Promise<GuildNotify> {
    return this.post<GuildNotify>('/guild-notify/update', {
      guild_id: guildId,
      notify_type: notifyType,
    });
  }

  // ========== 私聊消息相关扩展接口 ==========

  // 获取私聊消息详情
  async getDirectMessageDetail(msgId: string): Promise<DirectMessageDetail> {
    return this.get<DirectMessageDetail>('/direct-message/view', { msg_id: msgId });
  }

  // 更新私聊消息
  async updateDirectMessage(
    msgId: string,
    content: string,
    options?: {
      quote?: string;
    }
  ): Promise<DirectMessageDetail> {
    return this.post<DirectMessageDetail>('/direct-message/update', {
      msg_id: msgId,
      content,
      ...options,
    });
  }

  // 删除私聊消息
  async deleteDirectMessage(msgId: string): Promise<void> {
    await this.post('/direct-message/delete', { msg_id: msgId });
  }

  // ========== 消息相关扩展接口 ==========

  // 添加消息阅读回执
  async addMessageReadReceipt(msgId: string): Promise<void> {
    await this.post('/message/add-receipt', { msg_id: msgId });
  }

  // 获取消息阅读回执列表
  async getMessageReadReceipts(msgId: string): Promise<{ items: User[]; meta: { total: number } }> {
    return this.get('/message/receipt-list', { msg_id: msgId });
  }

  // ========== 频道相关扩展接口 ==========

  // 设置频道语音质量
  async setVoiceQuality(channelId: string, quality: string): Promise<void> {
    await this.post('/channel/set-voice-quality', {
      channel_id: channelId,
      voice_quality: quality,
    });
  }

  // 设置频道慢速模式
  async setSlowMode(channelId: string, slowMode: number): Promise<void> {
    await this.post('/channel/set-slow-mode', {
      channel_id: channelId,
      slow_mode: slowMode,
    });
  }

  // ========== 服务器角色权限相关扩展接口 ==========

  // 批量更新服务器角色权限
  async batchUpdateGuildRolePermissions(
    guildId: string,
    permissions: { role_id: number; permissions: number }[]
  ): Promise<void> {
    await this.post('/guild-role/batch-update-permissions', {
      guild_id: guildId,
      permissions,
    });
  }

  // ========== 用户相关扩展接口 ==========

  // 获取用户好友列表
  async getFriends(): Promise<User[]> {
    const result = await this.get<{ items: User[] }>('/friend/list');
    return result.items;
  }

  // 获取好友申请列表
  async getFriendRequests(): Promise<{ items: { user_id: string; user_info: User; content: string; created_at: number }[] }> {
    return this.get('/friend/request-list');
  }

  // 发送好友申请
  async sendFriendRequest(targetId: string, content?: string): Promise<void> {
    await this.post('/friend/request', {
      target_id: targetId,
      content,
    });
  }

  // 接受好友申请
  async acceptFriendRequest(targetId: string): Promise<void> {
    await this.post('/friend/accept', { target_id: targetId });
  }

  // 拒绝好友申请
  async declineFriendRequest(targetId: string): Promise<void> {
    await this.post('/friend/decline', { target_id: targetId });
  }

  // 删除好友
  async deleteFriend(targetId: string): Promise<void> {
    await this.post('/friend/delete', { target_id: targetId });
  }

  // ========== 服务器成员相关扩展接口 ==========

  // 获取服务器成员在线状态
  async getGuildMemberOnlineStatus(guildId: string, userId: string): Promise<{
    online: boolean;
    online_os: string[];
  }> {
    return this.get('/guild/user-online-status', {
      guild_id: guildId,
      user_id: userId,
    });
  }

  // 获取服务器成员权限
  async getGuildMemberPermissions(guildId: string, userId: string): Promise<{
    permissions: number;
  }> {
    return this.get('/guild/user-permissions', {
      guild_id: guildId,
      user_id: userId,
    });
  }

  // ========== 批量操作相关扩展接口 ==========

  // 批量获取频道信息
  async getChannelsBatch(channelIds: string[]): Promise<Channel[]> {
    const result = await this.post<{ items: Channel[] }>('/channel/batch-get-channel-info', {
      channel_ids: channelIds,
    });
    return result.items;
  }

  // 批量获取消息信息
  async getMessagesBatch(msgIds: string[]): Promise<Message[]> {
    const result = await this.post<{ items: Message[] }>('/message/batch-get-message-info', {
      msg_ids: msgIds,
    });
    return result.items;
  }
}
