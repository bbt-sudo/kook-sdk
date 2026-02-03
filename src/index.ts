// KOOK SDK - 开黑啦机器人开发工具包

// 核心类
export { KookBot } from './core/bot';
export { HttpClient } from './client/http-client';
export { WebSocketClient } from './client/websocket-client';

// 工具类
export { CardBuilder } from './utils/card-builder';
export { KMarkdownBuilder, kmd, KMarkdown } from './utils/kmarkdown-builder';

// 类型定义
export {
  // 基础类型
  KookResponse,
  KookSDKOptions,
  KookAPIError,
  LogLevel,

  // 用户相关
  User,
  Guild,
  Channel,
  ChannelType,
  Role,

  // 消息相关
  Message,
  MessageType,
  SendMessageParams,
  Attachment,
  Quote,
  MentionInfo,
  Reaction,
  Emoji,
  DirectMessageSession,

  // 卡片消息
  CardMessage,
  Module,
  HeaderModule,
  SectionModule,
  ImageGroupModule,
  ContainerModule,
  ActionGroupModule,
  ContextModule,
  DividerModule,
  FileModule,
  AudioModule,
  VideoModule,
  PlainTextElement,
  KMarkdownElement,
  ParagraphElement,
  ImageElement,
  ButtonElement,

  // WebSocket 相关
  SignalType,
  WebSocketSignal,
  HelloData,
  EventData,
  MessageEvent,
  SystemEventType,

  // 扩展类型
  UserChat,
  ChannelRolePermission,
  ChannelUserPermission,
  PunchIn,
  GuildWelcome,
  GuildNotify,
  DirectMessageDetail,
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
  VoiceConnection,
  GuildRolePermissionUpdate,
  MessageReadReceipt,
  MessageReactionUserList,
  Friend,
  FriendRequest,
  VoiceQuality,
  SlowMode,
  ReactionList,
  GuildMemberOnlineStatus,
  CustomInvite,
  EmojiListResponse,
  MemberActivity,
  GuildBoostPackage,
  GuildBackground,
  EmojiReply,
  Poll,
  PollOption,
  Qna,
  QnaOption,
} from './types';

// 版本信息
export const VERSION = '1.0.0';
