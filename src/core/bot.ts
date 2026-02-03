import { EventEmitter } from 'events';
import { HttpClient } from '../client/http-client';
import { WebSocketClient } from '../client/websocket-client';
import {
  KookSDKOptions,
  LogLevel,
  LogLevelNames,
  MessageEvent,
  EventData,
  User,
  Guild,
  Channel,
  Message,
  MessageType,
  CardMessage,
  KookAPIError,
} from '../types';

export class KookBot extends EventEmitter {
  private httpClient: HttpClient;
  private wsClient: WebSocketClient | null = null;
  private options: Required<KookSDKOptions>;
  private isRunning = false;

  constructor(options: KookSDKOptions) {
    super();
    
    // 处理 silent 和 logLevel 的优先级：silent 为 true 时强制 NONE
    const silent = options.silent ?? false;
    const logLevel = silent ? LogLevel.NONE : (options.logLevel ?? LogLevel.DEBUG);
    
    this.options = {
      token: options.token,
      mode: options.mode ?? 'websocket',
      webhookPort: options.webhookPort ?? 8080,
      webhookPath: options.webhookPath ?? '/webhook',
      verifyToken: options.verifyToken ?? '',
      compress: options.compress ?? false,
      autoReconnect: options.autoReconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 5000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      logLevel,
      silent,
    };
    this.httpClient = new HttpClient(options.token);
  }

  /**
   * 检查是否应该记录该级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    // NONE 级别或 silent 模式不记录任何日志
    if (this.options.logLevel === LogLevel.NONE || this.options.silent) {
      return false;
    }
    // 只记录小于等于当前设置的级别的日志
    return level <= this.options.logLevel;
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevelNames[level];
    const formattedMessage = `[${timestamp}] [${levelName}] ${message}`;

    // 根据级别使用不同的输出方式
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  /**
   * 设置日志级别
   * @param level - 日志级别
   * @param silent - 是否同时设置 silent 模式（可选）
   */
  setLogLevel(level: LogLevel, silent?: boolean): void {
    this.options.logLevel = level;
    if (silent !== undefined) {
      this.options.silent = silent;
    }
    // 如果设置为 NONE，自动开启 silent 模式
    if (level === LogLevel.NONE) {
      this.options.silent = true;
    }
  }

  /**
   * 获取当前日志级别
   */
  getLogLevel(): LogLevel {
    return this.options.logLevel;
  }

  /**
   * 获取日志级别名称
   */
  getLogLevelName(): string {
    return LogLevelNames[this.options.logLevel];
  }

  /**
   * 设置 silent 模式
   * @param silent - 是否静默
   */
  setSilent(silent: boolean): void {
    this.options.silent = silent;
    if (silent) {
      this.options.logLevel = LogLevel.NONE;
    }
  }

  /**
   * 检查是否处于 silent 模式
   */
  isSilent(): boolean {
    return this.options.silent;
  }

  // 启动机器人
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Bot is already running');
    }

    try {
      // 验证 token 并获取当前用户信息
      const user = await this.httpClient.getCurrentUser();
      this.emit('debug', `Bot user: ${user.username}#${user.identify_num}`);

      // 连接到 WebSocket，传递日志级别配置
      this.wsClient = new WebSocketClient({
        token: this.options.token,
        compress: this.options.compress,
        autoReconnect: this.options.autoReconnect ?? true,
        reconnectInterval: this.options.reconnectInterval ?? 5000,
        maxReconnectAttempts: this.options.maxReconnectAttempts ?? 10,
        logLevel: this.options.logLevel,
        silent: this.options.silent,
      });

      this.setupEventHandlers();
      await this.wsClient.connect();

      this.isRunning = true;
      this.emit('ready', user);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // 停止机器人
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.wsClient?.disconnect();
    this.wsClient = null;
    this.isRunning = false;
    this.emit('stopped');
  }

  // 设置事件处理器
  private setupEventHandlers(): void {
    if (!this.wsClient) return;

    // WebSocket 事件
    this.wsClient.on('ready', () => {
      this.emit('debug', 'WebSocket ready');
    });

    this.wsClient.on('error', (error) => {
      this.emit('error', error);
    });

    this.wsClient.on('debug', (message) => {
      this.emit('debug', message);
    });

    // 消息事件
    this.wsClient.on('message', (event: MessageEvent) => {
      this.emit('message', event);
      this.emit('messageCreate', event);
    });

    // 系统事件
    this.wsClient.on('joined_guild', (event: EventData) => {
      this.emit('joinedGuild', event);
    });

    this.wsClient.on('exited_guild', (event: EventData) => {
      this.emit('exitedGuild', event);
    });

    this.wsClient.on('guild_member_online', (event: EventData) => {
      this.emit('guildMemberOnline', event);
    });

    this.wsClient.on('guild_member_offline', (event: EventData) => {
      this.emit('guildMemberOffline', event);
    });

    this.wsClient.on('guild_member_update', (event: EventData) => {
      this.emit('guildMemberUpdate', event);
    });

    this.wsClient.on('channel_create', (event: EventData) => {
      this.emit('channelCreate', event);
    });

    this.wsClient.on('channel_delete', (event: EventData) => {
      this.emit('channelDelete', event);
    });

    this.wsClient.on('channel_update', (event: EventData) => {
      this.emit('channelUpdate', event);
    });

    this.wsClient.on('message_delete', (event: EventData) => {
      this.emit('messageDelete', event);
    });

    this.wsClient.on('message_update', (event: EventData) => {
      this.emit('messageUpdate', event);
    });

    this.wsClient.on('reaction_add', (event: EventData) => {
      this.emit('reactionAdd', event);
    });

    this.wsClient.on('reaction_remove', (event: EventData) => {
      this.emit('reactionRemove', event);
    });

    this.wsClient.on('guild_update', (event: EventData) => {
      this.emit('guildUpdate', event);
    });

    this.wsClient.on('guild_role_create', (event: EventData) => {
      this.emit('guildRoleCreate', event);
    });

    this.wsClient.on('guild_role_delete', (event: EventData) => {
      this.emit('guildRoleDelete', event);
    });

    this.wsClient.on('guild_role_update', (event: EventData) => {
      this.emit('guildRoleUpdate', event);
    });

    this.wsClient.on('message_btn_click', (event: EventData) => {
      this.emit('messageBtnClick', event);
    });

    // 新增事件 - 服务器封禁
    this.wsClient.on('added_block_list', (event: EventData) => {
      this.emit('addedBlockList', event);
    });

    this.wsClient.on('deleted_block_list', (event: EventData) => {
      this.emit('deletedBlockList', event);
    });

    // 新增事件 - 服务器表情
    this.wsClient.on('added_emoji', (event: EventData) => {
      this.emit('addedEmoji', event);
    });

    this.wsClient.on('removed_emoji', (event: EventData) => {
      this.emit('removedEmoji', event);
    });

    this.wsClient.on('updated_emoji', (event: EventData) => {
      this.emit('updatedEmoji', event);
    });

    // 新增事件 - 消息置顶
    this.wsClient.on('pinned_message', (event: EventData) => {
      this.emit('pinnedMessage', event);
    });

    this.wsClient.on('unpinned_message', (event: EventData) => {
      this.emit('unpinnedMessage', event);
    });

    // 新增事件 - 语音频道
    this.wsClient.on('joined_channel', (event: EventData) => {
      this.emit('joinedChannel', event);
    });

    this.wsClient.on('exited_channel', (event: EventData) => {
      this.emit('exitedChannel', event);
    });

    // 新增事件 - 用户更新
    this.wsClient.on('user_update', (event: EventData) => {
      this.emit('userUpdate', event);
    });

    // 新增事件 - 自己加入/退出服务器
    this.wsClient.on('self_joined_guild', (event: EventData) => {
      this.emit('selfJoinedGuild', event);
    });

    this.wsClient.on('self_exited_guild', (event: EventData) => {
      this.emit('selfExitedGuild', event);
    });

    // 通用系统事件
    this.wsClient.on('system_event', (event: EventData) => {
      this.emit('systemEvent', event);
    });
  }

  // ========== HTTP API 代理方法 ==========

  // 获取当前用户
  async getCurrentUser(): Promise<User> {
    return this.httpClient.getCurrentUser();
  }

  // 获取用户详情
  async getUser(userId: string): Promise<User> {
    return this.httpClient.getUser(userId);
  }

  // 获取服务器列表
  async getGuilds(): Promise<Guild[]> {
    return this.httpClient.getGuilds();
  }

  // 获取服务器详情
  async getGuild(guildId: string): Promise<Guild> {
    return this.httpClient.getGuild(guildId);
  }

  // 获取频道列表
  async getChannels(guildId: string): Promise<Channel[]> {
    return this.httpClient.getChannels(guildId);
  }

  // 获取频道详情
  async getChannel(channelId: string): Promise<Channel> {
    return this.httpClient.getChannel(channelId);
  }

  // 获取消息列表
  async getMessages(
    channelId: string,
    options?: {
      msg_id?: string;
      pin?: number;
      flag?: string;
      page_size?: number;
    }
  ) {
    return this.httpClient.getMessages(channelId, options);
  }

  // 获取消息详情
  async getMessage(msgId: string): Promise<Message> {
    return this.httpClient.getMessage(msgId);
  }

  // ========== 消息发送方法 ==========

  // 发送文本消息
  async sendTextMessage(
    channelId: string,
    content: string,
    options?: { quote?: string; temp_target_id?: string }
  ): Promise<Message> {
    return this.httpClient.sendChannelMessage(channelId, content, {
      type: MessageType.TEXT,
      ...options,
    });
  }

  // 发送 KMarkdown 消息
  async sendKMarkdownMessage(
    channelId: string,
    content: string,
    options?: { quote?: string; temp_target_id?: string }
  ): Promise<Message> {
    return this.httpClient.sendChannelMessage(channelId, content, {
      type: MessageType.KMARKDOWN,
      ...options,
    });
  }

  // 发送卡片消息
  async sendCardMessage(
    channelId: string,
    cards: CardMessage | CardMessage[],
    options?: { quote?: string; temp_target_id?: string }
  ): Promise<Message> {
    const cardArray = Array.isArray(cards) ? cards : [cards];
    return this.httpClient.sendChannelMessage(
      channelId,
      JSON.stringify(cardArray),
      {
        type: MessageType.CARD,
        ...options,
      }
    );
  }

  // 发送图片消息
  async sendImageMessage(
    channelId: string,
    imageUrl: string,
    options?: { quote?: string; temp_target_id?: string }
  ): Promise<Message> {
    return this.httpClient.sendChannelMessage(channelId, imageUrl, {
      type: MessageType.IMAGE,
      ...options,
    });
  }

  // 发送视频消息
  async sendVideoMessage(
    channelId: string,
    videoUrl: string,
    options?: { quote?: string; temp_target_id?: string }
  ): Promise<Message> {
    return this.httpClient.sendChannelMessage(channelId, videoUrl, {
      type: MessageType.VIDEO,
      ...options,
    });
  }

  // 发送文件消息
  async sendFileMessage(
    channelId: string,
    fileUrl: string,
    options?: { quote?: string; temp_target_id?: string }
  ): Promise<Message> {
    return this.httpClient.sendChannelMessage(channelId, fileUrl, {
      type: MessageType.FILE,
      ...options,
    });
  }

  // 发送音频消息
  async sendAudioMessage(
    channelId: string,
    audioUrl: string,
    options?: { quote?: string; temp_target_id?: string }
  ): Promise<Message> {
    return this.httpClient.sendChannelMessage(channelId, audioUrl, {
      type: MessageType.AUDIO,
      ...options,
    });
  }

  // 更新消息
  async updateMessage(
    msgId: string,
    content: string,
    options?: { quote?: string; temp_target_id?: string }
  ): Promise<Message> {
    return this.httpClient.updateMessage(msgId, content, options);
  }

  // 删除消息
  async deleteMessage(msgId: string): Promise<void> {
    return this.httpClient.deleteMessage(msgId);
  }

  // 添加消息反应
  async addReaction(msgId: string, emoji: string): Promise<void> {
    return this.httpClient.addMessageReaction(msgId, emoji);
  }

  // 删除消息反应
  async removeReaction(msgId: string, emoji: string, userId?: string): Promise<void> {
    return this.httpClient.removeMessageReaction(msgId, emoji, userId);
  }

  // ========== 私聊相关方法 ==========

  // 发送私信
  async sendDirectMessage(
    targetId: string,
    content: string,
    options?: { type?: MessageType; quote?: string }
  ): Promise<Message> {
    return this.httpClient.sendDirectMessage(targetId, content, options);
  }

  // 发送私信文本
  async sendDirectTextMessage(
    targetId: string,
    content: string,
    options?: { quote?: string }
  ): Promise<Message> {
    return this.httpClient.sendDirectMessage(targetId, content, {
      type: MessageType.TEXT,
      ...options,
    });
  }

  // 发送私信 KMarkdown
  async sendDirectKMarkdownMessage(
    targetId: string,
    content: string,
    options?: { quote?: string }
  ): Promise<Message> {
    return this.httpClient.sendDirectMessage(targetId, content, {
      type: MessageType.KMARKDOWN,
      ...options,
    });
  }

  // 发送私信卡片
  async sendDirectCardMessage(
    targetId: string,
    cards: CardMessage | CardMessage[],
    options?: { quote?: string }
  ): Promise<Message> {
    const cardArray = Array.isArray(cards) ? cards : [cards];
    return this.httpClient.sendDirectMessage(targetId, JSON.stringify(cardArray), {
      type: MessageType.CARD,
      ...options,
    });
  }

  // ========== 服务器管理方法 ==========

  // 获取服务器成员列表
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
  ) {
    return this.httpClient.getGuildUsers(guildId, options);
  }

  // 设置用户昵称
  async setNickname(
    guildId: string,
    userId: string,
    nickname: string
  ): Promise<void> {
    return this.httpClient.setGuildUserNickname(guildId, userId, nickname);
  }

  // 踢出用户
  async kickUser(guildId: string, targetId: string): Promise<void> {
    return this.httpClient.kickGuildUser(guildId, targetId);
  }

  // ========== 角色管理方法 ==========

  // 获取角色列表
  async getRoles(guildId: string) {
    return this.httpClient.getGuildRoles(guildId);
  }

  // 赋予角色
  async grantRole(guildId: string, userId: string, roleId: number): Promise<void> {
    return this.httpClient.grantRole(guildId, userId, roleId);
  }

  // 撤销角色
  async revokeRole(guildId: string, userId: string, roleId: number): Promise<void> {
    return this.httpClient.revokeRole(guildId, userId, roleId);
  }

  // ========== 频道管理方法 ==========

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
    return this.httpClient.createChannel(guildId, name, options);
  }

  // 更新频道
  async updateChannel(
    channelId: string,
    options: {
      name?: string;
      topic?: string;
      slow_mode?: number;
    }
  ): Promise<Channel> {
    return this.httpClient.updateChannel(channelId, options);
  }

  // 删除频道
  async deleteChannel(channelId: string): Promise<void> {
    return this.httpClient.deleteChannel(channelId);
  }

  // ========== 文件上传方法 ==========

  // 上传文件/图片/视频
  async uploadFile(
    file: Buffer | NodeJS.ReadableStream | string,
    options?: {
      filename?: string;
      contentType?: string;
    }
  ): Promise<{ url: string }> {
    return this.httpClient.uploadAsset(file, options);
  }

  // 上传并发送图片
  async uploadAndSendImage(
    channelId: string,
    file: Buffer | NodeJS.ReadableStream | string,
    options?: {
      filename?: string;
      quote?: string;
    }
  ): Promise<Message> {
    const { url } = await this.uploadFile(file, { filename: options?.filename });
    return this.sendImageMessage(channelId, url, { quote: options?.quote });
  }

  // 上传并发送文件
  async uploadAndSendFile(
    channelId: string,
    file: Buffer | NodeJS.ReadableStream | string,
    options?: {
      filename?: string;
      quote?: string;
    }
  ): Promise<Message> {
    const { url } = await this.uploadFile(file, { filename: options?.filename });
    return this.sendFileMessage(channelId, url, { quote: options?.quote });
  }

  // 上传并发送视频
  async uploadAndSendVideo(
    channelId: string,
    file: Buffer | NodeJS.ReadableStream | string,
    options?: {
      filename?: string;
      quote?: string;
    }
  ): Promise<Message> {
    const { url } = await this.uploadFile(file, { filename: options?.filename });
    return this.sendVideoMessage(channelId, url, { quote: options?.quote });
  }

  // ========== 消息置顶方法 ==========

  // 置顶消息
  async pinMessage(msgId: string): Promise<void> {
    return this.httpClient.pinMessage(msgId);
  }

  // 取消置顶消息
  async unpinMessage(msgId: string): Promise<void> {
    return this.httpClient.unpinMessage(msgId);
  }

  // ========== 语音频道方法 ==========

  // 加入语音频道
  async joinVoiceChannel(
    channelId: string,
    options?: {
      audio_ssrc?: string;
      audio_pt?: string;
      rtcp_mux?: boolean;
      password?: string;
    }
  ) {
    return this.httpClient.joinVoiceChannel(channelId, options);
  }

  // 离开语音频道
  async leaveVoiceChannel(channelId: string): Promise<void> {
    return this.httpClient.leaveVoiceChannel(channelId);
  }

  // 获取机器人加入的语音频道列表
  async getVoiceChannels() {
    return this.httpClient.getVoiceChannels();
  }

  // 保持语音连接活跃
  async keepVoiceAlive(channelId: string): Promise<void> {
    return this.httpClient.keepVoiceAlive(channelId);
  }

  // ========== 邀请相关方法 ==========

  // 获取邀请列表
  async getInvites(guildId: string) {
    return this.httpClient.getInvites(guildId);
  }

  // 创建邀请链接
  async createInvite(
    channelId: string,
    options?: { duration?: number; setting_times?: number }
  ) {
    return this.httpClient.createInvite(channelId, options);
  }

  // 删除邀请链接
  async deleteInvite(urlCode: string, guildId: string): Promise<void> {
    return this.httpClient.deleteInvite(urlCode, guildId);
  }

  // ========== 黑名单相关方法 ==========

  // 获取黑名单列表
  async getBlacklist(
    guildId: string,
    options?: { page?: number; page_size?: number }
  ) {
    return this.httpClient.getBlacklist(guildId, options);
  }

  // 添加黑名单
  async addBlacklist(
    guildId: string,
    targetId: string,
    options?: { remark?: string; del_msg_days?: number }
  ): Promise<void> {
    return this.httpClient.addBlacklist(guildId, targetId, options);
  }

  // 移除黑名单
  async removeBlacklist(guildId: string, targetId: string): Promise<void> {
    return this.httpClient.removeBlacklist(guildId, targetId);
  }

  // ========== 静音/闭麦相关方法 ==========

  // 获取静音/闭麦列表
  async getMuteList(guildId: string) {
    return this.httpClient.getMuteList(guildId);
  }

  // 添加静音/闭麦
  async addMute(
    guildId: string,
    targetId: string,
    type: 1 | 2
  ): Promise<void> {
    return this.httpClient.addMute(guildId, targetId, type);
  }

  // 移除静音/闭麦
  async removeMute(
    guildId: string,
    targetId: string,
    type: 1 | 2
  ): Promise<void> {
    return this.httpClient.removeMute(guildId, targetId, type);
  }

  // ========== 助力相关方法 ==========

  // 获取助力列表
  async getBoosts(guildId: string) {
    return this.httpClient.getBoosts(guildId);
  }

  // 获取助力历史
  async getBoostHistory(
    guildId: string,
    options?: { start_time?: number; end_time?: number; page?: number; page_size?: number }
  ) {
    return this.httpClient.getBoostHistory(guildId, options);
  }

  // ========== 服务器表情相关方法 ==========

  // 获取服务器表情列表
  async getGuildEmojis(guildId: string) {
    return this.httpClient.getGuildEmojis(guildId);
  }

  // 创建服务器表情
  async createGuildEmoji(guildId: string, name: string, emoji: string) {
    return this.httpClient.createGuildEmoji(guildId, name, emoji);
  }

  // 更新服务器表情
  async updateGuildEmoji(guildId: string, emojiId: string, name: string) {
    return this.httpClient.updateGuildEmoji(guildId, emojiId, name);
  }

  // 删除服务器表情
  async deleteGuildEmoji(guildId: string, emojiId: string): Promise<void> {
    return this.httpClient.deleteGuildEmoji(guildId, emojiId);
  }

  // ========== 公告相关方法 ==========

  // 获取公告列表
  async getAnnouncements(
    guildId: string,
    options?: { page?: number; page_size?: number }
  ) {
    return this.httpClient.getAnnouncements(guildId, options);
  }

  // 创建公告
  async createAnnouncement(guildId: string, channelId: string, content: string) {
    return this.httpClient.createAnnouncement(guildId, channelId, content);
  }

  // 更新公告
  async updateAnnouncement(announcementId: string, content: string) {
    return this.httpClient.updateAnnouncement(announcementId, content);
  }

  // 删除公告
  async deleteAnnouncement(announcementId: string): Promise<void> {
    return this.httpClient.deleteAnnouncement(announcementId);
  }

  // ========== 积分相关方法 ==========

  // 获取积分排行
  async getIntimacyRank(
    guildId: string,
    options?: { page?: number; page_size?: number }
  ) {
    return this.httpClient.getIntimacyRank(guildId, options);
  }

  // 获取用户积分信息
  async getIntimacyInfo(userId: string, guildId: string) {
    return this.httpClient.getIntimacyInfo(userId, guildId);
  }

  // 更新用户积分
  async updateIntimacy(
    userId: string,
    guildId: string,
    score: number
  ): Promise<void> {
    return this.httpClient.updateIntimacy(userId, guildId, score);
  }

  // ========== 游戏相关方法 ==========

  // 获取游戏列表
  async getGames() {
    return this.httpClient.getGames();
  }

  // 创建游戏
  async createGame(
    name: string,
    icon: string,
    options?: { process_name?: string[]; product_name?: string[] }
  ) {
    return this.httpClient.createGame(name, icon, options);
  }

  // 更新游戏
  async updateGame(
    gameId: number,
    options: { name?: string; icon?: string; process_name?: string[]; product_name?: string[] }
  ) {
    return this.httpClient.updateGame(gameId, options);
  }

  // 删除游戏
  async deleteGame(gameId: number): Promise<void> {
    return this.httpClient.deleteGame(gameId);
  }

  // 开始玩游戏
  async startPlaying(gameId: number): Promise<void> {
    return this.httpClient.startPlaying(gameId);
  }

  // 结束玩游戏
  async stopPlaying(gameId: number): Promise<void> {
    return this.httpClient.stopPlaying(gameId);
  }

  // ========== 徽章相关方法 ==========

  // 获取徽章列表
  async getBadges(guildId: string) {
    return this.httpClient.getBadges(guildId);
  }

  // 创建徽章
  async createBadge(
    guildId: string,
    name: string,
    icon: string,
    options?: { description?: string }
  ) {
    return this.httpClient.createBadge(guildId, name, icon, options);
  }

  // 更新徽章
  async updateBadge(
    badgeId: string,
    options: { name?: string; icon?: string; description?: string }
  ) {
    return this.httpClient.updateBadge(badgeId, options);
  }

  // 删除徽章
  async deleteBadge(badgeId: string): Promise<void> {
    return this.httpClient.deleteBadge(badgeId);
  }

  // 授予用户徽章
  async grantBadge(
    guildId: string,
    userId: string,
    badgeId: string
  ): Promise<void> {
    return this.httpClient.grantBadge(guildId, userId, badgeId);
  }

  // 撤销用户徽章
  async revokeBadge(
    guildId: string,
    userId: string,
    badgeId: string
  ): Promise<void> {
    return this.httpClient.revokeBadge(guildId, userId, badgeId);
  }

  // ========== 日程相关方法 ==========

  // 获取日程列表
  async getSchedules(
    channelId: string,
    options?: { start_time?: number; end_time?: number; page?: number; page_size?: number }
  ) {
    return this.httpClient.getSchedules(channelId, options);
  }

  // 获取日程详情
  async getSchedule(scheduleId: string) {
    return this.httpClient.getSchedule(scheduleId);
  }

  // 创建日程
  async createSchedule(
    channelId: string,
    title: string,
    startTime: number,
    endTime: number,
    options?: { content?: string; description?: string; reminder?: string }
  ) {
    return this.httpClient.createSchedule(channelId, title, startTime, endTime, options);
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
  ) {
    return this.httpClient.updateSchedule(scheduleId, options);
  }

  // 删除日程
  async deleteSchedule(scheduleId: string): Promise<void> {
    return this.httpClient.deleteSchedule(scheduleId);
  }

  // ========== 频道分组相关方法 ==========

  // 获取频道分组列表
  async getChannelCategories(guildId: string) {
    return this.httpClient.getChannelCategories(guildId);
  }

  // 创建频道分组
  async createChannelCategory(guildId: string, name: string) {
    return this.httpClient.createChannelCategory(guildId, name);
  }

  // 更新频道分组
  async updateChannelCategory(categoryId: string, name: string) {
    return this.httpClient.updateChannelCategory(categoryId, name);
  }

  // 删除频道分组
  async deleteChannelCategory(categoryId: string): Promise<void> {
    return this.httpClient.deleteChannelCategory(categoryId);
  }

  // 移动频道到分组
  async moveChannelToCategory(channelId: string, parentId: string): Promise<void> {
    return this.httpClient.moveChannelToCategory(channelId, parentId);
  }

  // ========== 用户聊天相关方法 ==========

  // 获取用户聊天会话列表
  async getUserChats() {
    return this.httpClient.getUserChats();
  }

  // 获取用户聊天会话详情
  async getUserChat(chatId: string) {
    return this.httpClient.getUserChat(chatId);
  }

  // 创建用户聊天会话
  async createUserChat(targetId: string) {
    return this.httpClient.createUserChat(targetId);
  }

  // 删除用户聊天会话
  async deleteUserChat(chatId: string): Promise<void> {
    return this.httpClient.deleteUserChat(chatId);
  }

  // ========== 频道角色权限相关方法 ==========

  // 获取频道角色权限列表
  async getChannelRolePermissions(channelId: string) {
    return this.httpClient.getChannelRolePermissions(channelId);
  }

  // 创建频道角色权限
  async createChannelRolePermission(
    channelId: string,
    roleId: number,
    allow: number,
    deny: number
  ) {
    return this.httpClient.createChannelRolePermission(channelId, roleId, allow, deny);
  }

  // 更新频道角色权限
  async updateChannelRolePermission(
    channelId: string,
    roleId: number,
    allow: number,
    deny: number
  ) {
    return this.httpClient.updateChannelRolePermission(channelId, roleId, allow, deny);
  }

  // 删除频道角色权限
  async deleteChannelRolePermission(channelId: string, roleId: number): Promise<void> {
    return this.httpClient.deleteChannelRolePermission(channelId, roleId);
  }

  // ========== 频道用户权限相关方法 ==========

  // 获取频道用户权限列表
  async getChannelUserPermissions(channelId: string) {
    return this.httpClient.getChannelUserPermissions(channelId);
  }

  // 创建频道用户权限
  async createChannelUserPermission(
    channelId: string,
    userId: string,
    allow: number,
    deny: number
  ) {
    return this.httpClient.createChannelUserPermission(channelId, userId, allow, deny);
  }

  // 更新频道用户权限
  async updateChannelUserPermission(
    channelId: string,
    userId: string,
    allow: number,
    deny: number
  ) {
    return this.httpClient.updateChannelUserPermission(channelId, userId, allow, deny);
  }

  // 删除频道用户权限
  async deleteChannelUserPermission(channelId: string, userId: string): Promise<void> {
    return this.httpClient.deleteChannelUserPermission(channelId, userId);
  }

  // ========== 服务器打卡相关方法 ==========

  // 获取服务器打卡信息
  async getPunchIn(guildId: string) {
    return this.httpClient.getPunchIn(guildId);
  }

  // 服务器打卡
  async punchIn(guildId: string): Promise<void> {
    return this.httpClient.punchIn(guildId);
  }

  // ========== 批量相关方法 ==========

  // 批量获取用户信息
  async getUsersBatch(userIds: string[]) {
    return this.httpClient.getUsersBatch(userIds);
  }

  // 批量获取服务器信息
  async getGuildsBatch(guildIds: string[]) {
    return this.httpClient.getGuildsBatch(guildIds);
  }

  // ========== 服务器设置相关方法 ==========

  // 获取服务器设置
  async getGuildSettings(guildId: string) {
    return this.httpClient.getGuildSettings(guildId);
  }

  // ========== 网关相关方法 ==========

  // 获取网关连接地址
  async getGateway(compress?: boolean) {
    return this.httpClient.getGateway(compress);
  }

  // ========== 服务器欢迎设置相关方法 ==========

  async getGuildWelcome(guildId: string) {
    return this.httpClient.getGuildWelcome(guildId);
  }

  async updateGuildWelcome(
    guildId: string,
    options: {
      channel_id?: string;
      is_send_msg?: boolean;
      message?: string;
    }
  ) {
    return this.httpClient.updateGuildWelcome(guildId, options);
  }

  // ========== 服务器通知设置相关方法 ==========

  async getGuildNotify(guildId: string) {
    return this.httpClient.getGuildNotify(guildId);
  }

  async updateGuildNotify(guildId: string, notifyType: number) {
    return this.httpClient.updateGuildNotify(guildId, notifyType);
  }

  // ========== 私聊消息相关扩展方法 ==========

  async getDirectMessageDetail(msgId: string) {
    return this.httpClient.getDirectMessageDetail(msgId);
  }

  async updateDirectMessage(
    msgId: string,
    content: string,
    options?: { quote?: string }
  ) {
    return this.httpClient.updateDirectMessage(msgId, content, options);
  }

  async deleteDirectMessage(msgId: string): Promise<void> {
    return this.httpClient.deleteDirectMessage(msgId);
  }

  // ========== 消息相关扩展方法 ==========

  async addMessageReadReceipt(msgId: string): Promise<void> {
    return this.httpClient.addMessageReadReceipt(msgId);
  }

  async getMessageReadReceipts(msgId: string) {
    return this.httpClient.getMessageReadReceipts(msgId);
  }

  // ========== 频道相关扩展方法 ==========

  async setVoiceQuality(channelId: string, quality: string): Promise<void> {
    return this.httpClient.setVoiceQuality(channelId, quality);
  }

  async setSlowMode(channelId: string, slowMode: number): Promise<void> {
    return this.httpClient.setSlowMode(channelId, slowMode);
  }

  // ========== 服务器角色权限相关扩展方法 ==========

  async batchUpdateGuildRolePermissions(
    guildId: string,
    permissions: { role_id: number; permissions: number }[]
  ): Promise<void> {
    return this.httpClient.batchUpdateGuildRolePermissions(guildId, permissions);
  }

  // ========== 用户相关扩展方法 ==========

  async getFriends() {
    return this.httpClient.getFriends();
  }

  async getFriendRequests() {
    return this.httpClient.getFriendRequests();
  }

  async sendFriendRequest(targetId: string, content?: string): Promise<void> {
    return this.httpClient.sendFriendRequest(targetId, content);
  }

  async acceptFriendRequest(targetId: string): Promise<void> {
    return this.httpClient.acceptFriendRequest(targetId);
  }

  async declineFriendRequest(targetId: string): Promise<void> {
    return this.httpClient.declineFriendRequest(targetId);
  }

  async deleteFriend(targetId: string): Promise<void> {
    return this.httpClient.deleteFriend(targetId);
  }

  // ========== 服务器成员相关扩展方法 ==========

  async getGuildMemberOnlineStatus(guildId: string, userId: string) {
    return this.httpClient.getGuildMemberOnlineStatus(guildId, userId);
  }

  async getGuildMemberPermissions(guildId: string, userId: string) {
    return this.httpClient.getGuildMemberPermissions(guildId, userId);
  }

  // ========== 批量操作相关扩展方法 ==========

  async getChannelsBatch(channelIds: string[]) {
    return this.httpClient.getChannelsBatch(channelIds);
  }

  async getMessagesBatch(msgIds: string[]) {
    return this.httpClient.getMessagesBatch(msgIds);
  }

  // ========== 工具方法 ==========

  // 获取运行状态
  get running(): boolean {
    return this.isRunning;
  }

  // 获取 WebSocket 连接状态
  get connected(): boolean {
    return this.wsClient?.isConnected ?? false;
  }

  // 获取 HTTP 客户端
  get http(): HttpClient {
    return this.httpClient;
  }
}
