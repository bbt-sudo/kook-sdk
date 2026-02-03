// KOOK API 类型定义

// 基础响应类型
export interface KookResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 用户信息
export interface User {
  id: string;
  username: string;
  nickname: string;
  identify_num: string;
  avatar: string;
  bot?: boolean;
  online: boolean;
  status: number;
  mobile_verified: boolean;
}

// 服务器信息
export interface Guild {
  id: string;
  name: string;
  topic: string;
  icon: string;
  notify_type: number;
  region: string;
  enable_open: boolean;
  open_id: string;
  default_channel_id: string;
  welcome_channel_id: string;
  boost_num: number;
  level: number;
}

// 频道信息
export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  guild_id: string;
  parent_id: string;
  level: number;
  limit_amount: number;
  is_category: boolean;
  master_id: string;
}

// 频道类型
export enum ChannelType {
  TEXT = 1,
  VOICE = 2,
  CATEGORY = 0,
}

// 消息类型
export enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  FILE = 4,
  AUDIO = 8,
  KMARKDOWN = 9,
  CARD = 10,
  SYSTEM = 255,
}

// 消息对象
export interface Message {
  id: string;
  type: MessageType;
  content: string;
  mention: string[];
  mention_all: boolean;
  mention_roles: string[];
  mention_here: boolean;
  embeds: unknown[];
  attachments: Attachment[];
  create_at: number;
  updated_at: number;
  reactions: Reaction[];
  author: User;
  image_name?: string;
  read_status?: boolean;
  quote?: Quote;
  mention_info?: MentionInfo;
}

// 附件
export interface Attachment {
  type: string;
  url: string;
  name: string;
  size?: number;
}

// 引用消息
export interface Quote {
  id: string;
  type: MessageType;
  content: string;
  create_at: number;
  author: User;
}

// 提及信息
export interface MentionInfo {
  mention_roles: string[];
  mention_all: boolean;
  mention_here: boolean;
  mention_channels: string[];
}

// 表情反应
export interface Reaction {
  emoji: Emoji;
  count: number;
  me: boolean;
}

// 表情
export interface Emoji {
  id: string;
  name: string;
}

// 私聊会话
export interface DirectMessageSession {
  code: string;
  target_info: User;
  last_read_time: number;
  latest_msg_time: number;
  unread_count: number;
  is_friend: boolean;
  is_blocked: boolean;
  is_target_blocked: boolean;
}

// 角色信息
export interface Role {
  role_id: number;
  name: string;
  color: number;
  position: number;
  hoist: number;
  mentionable: number;
  permissions: number;
}

// 发送消息参数
export interface SendMessageParams {
  target_id?: string;
  content?: string;
  quote?: string;
  nonce?: string;
  type?: MessageType;
  temp_target_id?: string;
}

// 卡片消息
export interface CardMessage {
  type: 'card';
  theme?: 'primary' | 'secondary' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'lg';
  modules: Module[];
}

// 卡片模块
export type Module =
  | HeaderModule
  | SectionModule
  | ImageGroupModule
  | ContainerModule
  | ActionGroupModule
  | ContextModule
  | DividerModule
  | FileModule
  | AudioModule
  | VideoModule;

export interface HeaderModule {
  type: 'header';
  text: PlainTextElement | KMarkdownElement;
}

export interface SectionModule {
  type: 'section';
  text: PlainTextElement | KMarkdownElement | ParagraphElement;
  mode?: 'left' | 'right';
  accessory?: ImageElement | ButtonElement;
}

export interface ImageGroupModule {
  type: 'image-group';
  elements: ImageElement[];
}

export interface ContainerModule {
  type: 'container';
  elements: ImageElement[];
}

export interface ActionGroupModule {
  type: 'action-group';
  elements: ButtonElement[];
}

export interface ContextModule {
  type: 'context';
  elements: (PlainTextElement | KMarkdownElement | ImageElement)[];
}

export interface DividerModule {
  type: 'divider';
}

export interface FileModule {
  type: 'file';
  src: string;
  title: string;
  size?: number;
}

export interface AudioModule {
  type: 'audio';
  src: string;
  title?: string;
  cover?: string;
}

export interface VideoModule {
  type: 'video';
  src: string;
  title?: string;
}

// 元素类型
export interface PlainTextElement {
  type: 'plain-text';
  content: string;
  emoji?: boolean;
}

export interface KMarkdownElement {
  type: 'kmarkdown';
  content: string;
}

export interface ParagraphElement {
  type: 'paragraph';
  cols: number;
  fields: (PlainTextElement | KMarkdownElement)[];
}

export interface ImageElement {
  type: 'image';
  src: string;
  alt?: string;
  size?: 'sm' | 'lg';
  circle?: boolean;
}

export interface ButtonElement {
  type: 'button';
  theme?: 'primary' | 'secondary' | 'warning' | 'danger' | 'info';
  value: string;
  click?: string;
  text: PlainTextElement | KMarkdownElement;
}

// WebSocket 信令类型
export enum SignalType {
  EVENT = 0,
  HELLO = 1,
  PING = 2,
  PONG = 3,
  RECONNECT = 4,
  RESUME = 5,
}

// WebSocket 消息
export interface WebSocketSignal {
  s: SignalType;
  d: unknown;
  sn?: number;
}

// Hello 数据
export interface HelloData {
  session_id: string;
  heartbeat_interval: number;
}

// 事件数据
export interface EventData {
  channel_type: 'GROUP' | 'PERSON' | 'BROADCAST';
  type: number;
  target_id: string;
  author_id: string;
  content: string;
  extra: unknown;
  msg_id: string;
  msg_timestamp: number;
  nonce: string;
  verify_token?: string;
}

// 消息事件
export interface MessageEvent extends EventData {
  type: 1 | 2 | 3 | 4 | 8 | 9 | 10;
  extra: {
    type: MessageType;
    guild_id?: string;
    channel_name?: string;
    mention: string[];
    mention_all: boolean;
    mention_roles: string[];
    mention_here: boolean;
    author: User;
    attachments?: Attachment[];
    quote?: Quote;
  };
}

// 系统事件类型
export enum SystemEventType {
  // 服务器成员相关
  JOINED_GUILD = 0,
  EXITED_GUILD = 1,
  GUILD_MEMBER_ONLINE = 8,
  GUILD_MEMBER_OFFLINE = 9,
  GUILD_MEMBER_UPDATE = 11,

  // 频道相关
  CHANNEL_CREATE = 12,
  CHANNEL_DELETE = 13,
  CHANNEL_UPDATE = 14,

  // 消息相关
  MESSAGE_DELETE = 21,
  MESSAGE_UPDATE = 22,

  // 反应相关
  REACTION_ADD = 27,
  REACTION_REMOVE = 28,

  // 私聊相关
  PRIVATE_MESSAGE_DELETE = 31,

  // 服务器相关
  GUILD_UPDATE = 36,
  GUILD_DELETE = 37,

  // 成员角色相关
  GUILD_ROLE_CREATE = 40,
  GUILD_ROLE_DELETE = 41,
  GUILD_ROLE_UPDATE = 42,

  // 用户相关
  USER_UPDATE = 50,
  SELF_JOINED_GUILD = 55,
  SELF_EXITED_GUILD = 56,

  // 卡片消息按钮点击
  MESSAGE_BTN_CLICK = 62,
}

// ========== 系统事件 Body 类型定义 ==========

// 服务器成员加入/退出
export interface GuildMemberBody {
  user_id: string;
  joined_at?: number;
  exited_at?: number;
}

// 服务器成员上线/下线
export interface GuildMemberOnlineBody {
  user_id: string;
  event_time: number;
  guilds: string[];
}

// 服务器成员信息更新
export interface GuildMemberUpdateBody {
  user_id: string;
  nickname: string;
}

// 服务器信息更新/删除
export interface GuildUpdateBody {
  id: string;
  name: string;
  user_id: string;
  icon: string;
  notify_type: number;
  region: string;
  enable_open: number;
  open_id: number;
  default_channel_id: string;
  welcome_channel_id: string;
}

// 服务器封禁用户
export interface BlockListBody {
  operator_id: string;
  remark?: string;
  user_id: string[];
}

// 服务器表情更新
export interface EmojiBody {
  id: string;
  name: string;
}

// 频道创建/更新
export interface ChannelBody extends Channel {
  permission_overwrites?: PermissionOverwrite[];
  permission_users?: PermissionUser[];
  permission_sync?: number;
}

// 频道删除
export interface ChannelDeleteBody {
  id: string;
  deleted_at: number;
  type: number;
}

// 权限覆盖
export interface PermissionOverwrite {
  role_id: number;
  allow: number;
  deny: number;
}

// 用户权限
export interface PermissionUser {
  user: User;
  allow: number;
  deny: number;
}

// 消息更新
export interface MessageUpdateBody {
  msg_id: string;
  content: string;
  channel_id: string;
  mention: string[];
  mention_all: boolean;
  mention_here: boolean;
  mention_roles: string[];
  updated_at: number;
  channel_type: number;
}

// 消息删除
export interface MessageDeleteBody {
  msg_id: string;
  channel_id: string;
  channel_type: number;
}

// 反应添加/删除
export interface ReactionBody {
  msg_id: string;
  user_id: string;
  channel_id: string;
  emoji: Emoji;
  channel_type: number;
}

// 消息置顶/取消置顶
export interface PinMessageBody {
  channel_id: string;
  operator_id: string;
  msg_id: string;
  channel_type: number;
}

// 角色创建/更新/删除
export interface GuildRoleBody {
  role_id: number;
  name: string;
  color: number;
  position: number;
  hoist: number;
  mentionable: number;
  permissions: number;
}

// 用户更新
export interface UserUpdateBody {
  user_id: string;
  username: string;
  avatar: string;
}

// 自己加入/退出服务器
export interface SelfGuildBody {
  guild_id: string;
  state?: string;
}

// 用户加入/退出语音频道
export interface UserChannelBody {
  user_id: string;
  channel_id: string;
  joined_at?: number;
  exited_at?: number;
}

// 卡片消息按钮点击
export interface MessageBtnClickBody {
  msg_id: string;
  user_id: string;
  value: string;
  target_id: string;
  user_info: User;
}

// 系统事件
export interface SystemEvent extends EventData {
  type: 255;
  extra: {
    type: string;
    body: unknown;
  };
}

// 具体系统事件类型
export interface JoinedGuildEvent extends SystemEvent {
  extra: {
    type: 'joined_guild';
    body: GuildMemberBody;
  };
}

export interface ExitedGuildEvent extends SystemEvent {
  extra: {
    type: 'exited_guild';
    body: GuildMemberBody;
  };
}

export interface GuildMemberOnlineEvent extends SystemEvent {
  extra: {
    type: 'guild_member_online';
    body: GuildMemberOnlineBody;
  };
}

export interface GuildMemberOfflineEvent extends SystemEvent {
  extra: {
    type: 'guild_member_offline';
    body: GuildMemberOnlineBody;
  };
}

export interface GuildMemberUpdateEvent extends SystemEvent {
  extra: {
    type: 'updated_guild_member';
    body: GuildMemberUpdateBody;
  };
}

export interface GuildUpdateEvent extends SystemEvent {
  extra: {
    type: 'updated_guild';
    body: GuildUpdateBody;
  };
}

export interface GuildDeleteEvent extends SystemEvent {
  extra: {
    type: 'deleted_guild';
    body: GuildUpdateBody;
  };
}

export interface AddedBlockListEvent extends SystemEvent {
  extra: {
    type: 'added_block_list';
    body: BlockListBody;
  };
}

export interface DeletedBlockListEvent extends SystemEvent {
  extra: {
    type: 'deleted_block_list';
    body: BlockListBody;
  };
}

export interface AddedEmojiEvent extends SystemEvent {
  extra: {
    type: 'added_emoji';
    body: EmojiBody;
  };
}

export interface RemovedEmojiEvent extends SystemEvent {
  extra: {
    type: 'removed_emoji';
    body: EmojiBody;
  };
}

export interface UpdatedEmojiEvent extends SystemEvent {
  extra: {
    type: 'updated_emoji';
    body: EmojiBody;
  };
}

export interface ChannelCreateEvent extends SystemEvent {
  extra: {
    type: 'added_channel';
    body: ChannelBody;
  };
}

export interface ChannelUpdateEvent extends SystemEvent {
  extra: {
    type: 'updated_channel';
    body: ChannelBody;
  };
}

export interface ChannelDeleteEvent extends SystemEvent {
  extra: {
    type: 'deleted_channel';
    body: ChannelDeleteBody;
  };
}

export interface MessageUpdateEvent extends SystemEvent {
  extra: {
    type: 'updated_message';
    body: MessageUpdateBody;
  };
}

export interface MessageDeleteEvent extends SystemEvent {
  extra: {
    type: 'deleted_message';
    body: MessageDeleteBody;
  };
}

export interface ReactionAddEvent extends SystemEvent {
  extra: {
    type: 'added_reaction';
    body: ReactionBody;
  };
}

export interface ReactionRemoveEvent extends SystemEvent {
  extra: {
    type: 'deleted_reaction';
    body: ReactionBody;
  };
}

export interface PinnedMessageEvent extends SystemEvent {
  extra: {
    type: 'pinned_message';
    body: PinMessageBody;
  };
}

export interface UnpinnedMessageEvent extends SystemEvent {
  extra: {
    type: 'unpinned_message';
    body: PinMessageBody;
  };
}

export interface GuildRoleCreateEvent extends SystemEvent {
  extra: {
    type: 'added_role';
    body: GuildRoleBody;
  };
}

export interface GuildRoleDeleteEvent extends SystemEvent {
  extra: {
    type: 'deleted_role';
    body: GuildRoleBody;
  };
}

export interface GuildRoleUpdateEvent extends SystemEvent {
  extra: {
    type: 'updated_role';
    body: GuildRoleBody;
  };
}

export interface UserUpdateEvent extends SystemEvent {
  extra: {
    type: 'user_updated';
    body: UserUpdateBody;
  };
}

export interface SelfJoinedGuildEvent extends SystemEvent {
  extra: {
    type: 'self_joined_guild';
    body: SelfGuildBody;
  };
}

export interface SelfExitedGuildEvent extends SystemEvent {
  extra: {
    type: 'self_exited_guild';
    body: SelfGuildBody;
  };
}

export interface JoinedChannelEvent extends SystemEvent {
  extra: {
    type: 'joined_channel';
    body: UserChannelBody;
  };
}

export interface ExitedChannelEvent extends SystemEvent {
  extra: {
    type: 'exited_channel';
    body: UserChannelBody;
  };
}

export interface MessageBtnClickEvent extends SystemEvent {
  extra: {
    type: 'message_btn_click';
    body: MessageBtnClickBody;
  };
}

// 所有事件类型联合
export type KookEvent =
  | MessageEvent
  | SystemEvent
  | JoinedGuildEvent
  | ExitedGuildEvent
  | GuildMemberOnlineEvent
  | GuildMemberOfflineEvent
  | GuildMemberUpdateEvent
  | GuildUpdateEvent
  | GuildDeleteEvent
  | AddedBlockListEvent
  | DeletedBlockListEvent
  | AddedEmojiEvent
  | RemovedEmojiEvent
  | UpdatedEmojiEvent
  | ChannelCreateEvent
  | ChannelUpdateEvent
  | ChannelDeleteEvent
  | MessageUpdateEvent
  | MessageDeleteEvent
  | ReactionAddEvent
  | ReactionRemoveEvent
  | PinnedMessageEvent
  | UnpinnedMessageEvent
  | GuildRoleCreateEvent
  | GuildRoleDeleteEvent
  | GuildRoleUpdateEvent
  | UserUpdateEvent
  | SelfJoinedGuildEvent
  | SelfExitedGuildEvent
  | JoinedChannelEvent
  | ExitedChannelEvent
  | MessageBtnClickEvent;

// 日志级别
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

// SDK 配置选项
export interface KookSDKOptions {
  token: string;
  mode?: 'websocket' | 'webhook';
  webhookPort?: number;
  webhookPath?: string;
  verifyToken?: string;
  compress?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  /** 日志级别，默认 DEBUG */
  logLevel?: LogLevel;
  /** 是否禁用 debug 日志 */
  silent?: boolean;
}

// API 错误
export class KookAPIError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'KookAPIError';
  }
}

// 语音连接信息
export interface VoiceConnection {
  ip: string;
  port: string;
  rtcp_port: string;
  rtcp_mux: boolean;
  bitrate: number;
  audio_ssrc: string;
  audio_pt: string;
}

// ========== 邀请相关接口 ==========

// 邀请链接
export interface Invite {
  guild_id: string;
  channel_id: string;
  url_code: string;
  url: string;
  user: User;
  channel_name: string;
  guild_name: string;
  expires_at?: number;
  times?: number;
  max_times?: number;
  duration?: number;
}

// ========== 服务器黑名单相关接口 ==========

// 黑名单用户
export interface BlacklistUser {
  user_id: string;
  user: User;
  created_time: number;
  remark: string;
}

// ========== 服务器静音/闭麦相关接口 ==========

// 静音/闭麦用户
export interface MuteUser {
  user_id: string;
  user: User;
  type: 1 | 2; // 1: 麦克风静音, 2: 耳机静音
}

// ========== 服务器助力相关接口 ==========

// 助力信息
export interface GuildBoost {
  user_id: string;
  guild_id: string;
  start_time: number;
  end_time: number;
  user: User;
}

// 助力历史
export interface BoostHistory {
  user_id: string;
  guild_id: string;
  created_at: number;
  user: User;
}

// ========== 服务器表情相关接口 ==========

// 服务器表情
export interface GuildEmoji {
  name: string;
  id: string;
  user_info: User;
}

// ========== 服务器公告相关接口 ==========

// 公告
export interface Announcement {
  id: string;
  guild_id: string;
  channel_id: string;
  content: string;
  created_at: number;
  updated_at: number;
  author_id: string;
}

// ========== 服务器积分相关接口 ==========

// 积分排行
export interface IntimacyRank {
  user_id: string;
  score: number;
  user: User;
}

// 积分信息
export interface IntimacyInfo {
  score: number;
  img_url: string;
  social_info: string;
  last_read?: string;
  last_interact?: string;
}

// ========== 游戏相关接口 ==========

// 游戏
export interface Game {
  id: number;
  name: string;
  type: number;
  options: string;
  kmhook_admin: boolean;
  kmhook_user: boolean;
  process_name: string[];
  product_name: string[];
  icon: string;
}

// 游戏状态
export interface GameStatus {
  id: number;
  name: string;
  type: number;
  icon: string;
}

// ========== 徽章相关接口 ==========

// 徽章
export interface Badge {
  guild_id: string;
  name: string;
  icon: string;
  description: string;
  user_info: User;
  create_time: number;
}

// ========== 服务器日程相关接口 ==========

// 日程
export interface Schedule {
  id: string;
  guild_id: string;
  channel_id: string;
  channel_name: string;
  start_time: number;
  end_time: number;
  title: string;
  content: string;
  description: string;
  reminder: string;
  creator_id: string;
  status: number;
  created_at: number;
  updated_at: number;
}

// ========== 服务器分组相关接口 ==========

// 频道分组
export interface ChannelCategory {
  id: string;
  name: string;
  guild_id: string;
  parent_id: string;
  level: number;
  limit_amount: number;
  is_category: boolean;
}

// ========== 用户聊天相关接口 ==========

// 用户聊天会话
export interface UserChat {
  id: string;
  target_info: {
    id: string;
    username: string;
    online: boolean;
    avatar: string;
  };
  last_read_time: number;
  latest_msg_time: number;
  unread_count: number;
  top: number;
}

// ========== 服务器表情表态相关接口 ==========

// 消息表情表态
export interface MessageReaction {
  emoji: Emoji;
  count: number;
  me: boolean;
}

// ========== 服务器助力包相关接口 ==========

// 助力包
export interface GuildBoostPackage {
  id: string;
  guild_id: string;
  user_id: string;
  boost_count: number;
  created_at: number;
  updated_at: number;
}

// ========== 服务器自定义背景相关接口 ==========

// 自定义背景
export interface GuildBackground {
  id: string;
  guild_id: string;
  url: string;
  type: number;
  status: number;
  created_at: number;
  updated_at: number;
}

// ========== 频道角色权限相关接口 ==========

// 频道角色权限
export interface ChannelRolePermission {
  channel_id: string;
  role_id: number;
  allow: number;
  deny: number;
}

// 频道用户权限
export interface ChannelUserPermission {
  channel_id: string;
  user_id: string;
  allow: number;
  deny: number;
}

// ========== 服务器表情回复相关接口 ==========

// 表情回复
export interface EmojiReply {
  id: string;
  user_id: string;
  user_info: User;
  emoji: Emoji;
  create_at: number;
}

// ========== 服务器投票相关接口 ==========

// 投票选项
export interface PollOption {
  id: string;
  text: string;
  vote_count: number;
  voters: User[];
}

// 投票
export interface Poll {
  id: string;
  guild_id: string;
  channel_id: string;
  user_id: string;
  user_info: User;
  title: string;
  options: PollOption[];
  multiple_choice: number;
  hide_voters: number;
  end_time: number;
  created_at: number;
  total_vote_count: number;
}

// ========== 服务器问答相关接口 ==========

// 问答选项
export interface QnaOption {
  id: string;
  text: string;
  is_correct: boolean;
}

// 问答
export interface Qna {
  id: string;
  guild_id: string;
  channel_id: string;
  user_id: string;
  user_info: User;
  title: string;
  options: QnaOption[];
  multiple_choice: number;
  hide_result: number;
  end_time: number;
  created_at: number;
  total_participant_count: number;
}

// ========== 服务器打卡相关接口 ==========

// 打卡信息
export interface PunchIn {
  day_count: number;
  last_punch_in_time: number;
}

// ========== 服务器表情回应相关接口 ==========

// 表情回应
export interface Reaction {
  emoji: Emoji;
  count: number;
  me: boolean;
}

// ========== 服务器成员动态相关接口 ==========

// 成员动态
export interface MemberActivity {
  user_id: string;
  user_info: User;
  activity_type: string;
  activity_data: unknown;
  created_at: number;
}

// ========== 服务器更新角色权限相关接口 ==========

// 服务器角色权限更新
export interface GuildRolePermissionUpdate {
  role_id: number;
  permissions: number;
}

// ========== 消息相关扩展接口 ==========

// 消息阅读回执
export interface MessageReadReceipt {
  msg_id: string;
  user_id: string;
  read_time: number;
}

// 消息表情回应用户列表
export interface MessageReactionUserList {
  items: User[];
  meta: {
    page: number;
    page_total: number;
    total: number;
  };
}

// ========== 用户相关扩展接口 ==========

// 用户好友
export interface Friend {
  id: string;
  username: string;
  online: boolean;
  avatar: string;
}

// 用户好友申请
export interface FriendRequest {
  id: string;
  user_id: string;
  user_info: User;
  content: string;
  created_at: number;
}

// ========== 服务器相关扩展接口 ==========

// 服务器欢迎设置
export interface GuildWelcome {
  channel_id: string;
  is_send_msg: boolean;
  message: string;
}

// 服务器通知设置
export interface GuildNotify {
  guild_id: string;
  notify_type: number;
}

// ========== 频道相关扩展接口 ==========

// 频道语音质量设置
export interface VoiceQuality {
  channel_id: string;
  voice_quality: string;
}

// 频道慢速模式设置
export interface SlowMode {
  channel_id: string;
  slow_mode: number;
}

// ========== 私聊消息相关扩展接口 ==========

// 私聊消息详情
export interface DirectMessageDetail {
  id: string;
  type: MessageType;
  content: string;
  author_id: string;
  target_id: string;
  create_at: number;
  updated_at: number;
  quote?: Quote;
  attachments: Attachment[];
}

// ========== 服务器表情表态相关扩展接口 ==========

// 表情表态列表
export interface ReactionList {
  items: {
    emoji: Emoji;
    count: number;
    me: boolean;
  }[];
}

// ========== 服务器成员在线状态相关接口 ==========

// 成员在线状态
export interface GuildMemberOnlineStatus {
  user_id: string;
  online: boolean;
  online_os: string[];
}

// ========== 服务器自定义邀请相关接口 ==========

// 自定义邀请
export interface CustomInvite {
  guild_id: string;
  channel_id: string;
  url_code: string;
  url: string;
  user: User;
}

// ========== 服务器表情相关扩展接口 ==========

// 表情列表响应
export interface EmojiListResponse {
  items: GuildEmoji[];
  meta: {
    page: number;
    page_total: number;
    total: number;
  };
}
