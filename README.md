# KOOK SDK

一个功能完善的 Node.js KOOK（开黑啦）机器人开发 SDK。

## 特性

- 🔌 **WebSocket 实时连接** - 支持自动重连、心跳检测
- 📡 **完整的 HTTP API** - 覆盖 KOOK 所有 REST API
- 🎯 **事件驱动架构** - 基于 EventEmitter，易于使用
- 📝 **丰富的消息类型** - 支持文本、KMarkdown、卡片、图片、视频等
- 🎨 **卡片构建器** - 便捷的 CardBuilder 工具类
- 💪 **TypeScript 支持** - 完整的类型定义
- 🔄 **自动重连机制** - 网络异常自动恢复

## 安装

```bash
npm install kook-sdk
```

## 快速开始

```typescript
import { KookBot } from 'kook-sdk';

const bot = new KookBot({
  token: 'YOUR_BOT_TOKEN',
});

bot.on('ready', (user) => {
  console.log(`Bot ${user.username} 已启动!`);
});

bot.on('message', async (event) => {
  if (event.content === '!ping') {
    await bot.sendTextMessage(event.target_id, 'Pong!');
  }
});

bot.start();
```

## 配置选项

```typescript
interface KookSDKOptions {
  token: string;                    // 机器人 Token（必填）
  mode?: 'websocket' | 'webhook';   // 连接模式，默认 websocket
  autoReconnect?: boolean;          // 自动重连，默认 true
  reconnectInterval?: number;       // 重连间隔(ms)，默认 5000
  maxReconnectAttempts?: number;    // 最大重连次数，默认 10
  compress?: boolean;               // 启用压缩，默认 false
}
```

## 事件列表

### 生命周期事件

- `ready` - 机器人就绪
- `error` - 发生错误
- `debug` - 调试信息
- `stopped` - 机器人停止

### 消息事件

- `message` / `messageCreate` - 收到消息
- `messageUpdate` - 消息更新
- `messageDelete` - 消息删除

### 服务器事件

- `joinedGuild` - 用户加入服务器
- `exitedGuild` - 用户离开服务器
- `guildUpdate` - 服务器更新

### 成员事件

- `guildMemberOnline` - 成员上线
- `guildMemberOffline` - 成员下线
- `guildMemberUpdate` - 成员信息更新

### 频道事件

- `channelCreate` - 频道创建
- `channelDelete` - 频道删除
- `channelUpdate` - 频道更新

### 其他事件

- `reactionAdd` - 添加表情反应
- `reactionRemove` - 移除表情反应
- `guildRoleCreate` / `guildRoleDelete` / `guildRoleUpdate` - 角色变更
- `messageBtnClick` - 卡片按钮点击

## 消息发送

### 文本消息

```typescript
await bot.sendTextMessage(channelId, 'Hello World!');
```

### KMarkdown 消息

```typescript
await bot.sendKMarkdownMessage(channelId, '**粗体** *斜体* <@user_id>');
```

### 卡片消息

```typescript
import { CardBuilder } from 'kook-sdk';

const card = new CardBuilder()
  .addHeader('标题')
  .addSection('内容')
  .addActionGroup([
    { text: '按钮1', value: 'btn1', theme: 'primary' },
    { text: '按钮2', value: 'btn2', theme: 'danger' }
  ])
  .build();

await bot.sendCardMessage(channelId, card);
```

### 图片/视频/文件消息

```typescript
await bot.sendImageMessage(channelId, 'https://example.com/image.png');
await bot.sendVideoMessage(channelId, 'https://example.com/video.mp4');
await bot.sendFileMessage(channelId, 'https://example.com/file.pdf');
```

### 私信

```typescript
await bot.sendDirectTextMessage(userId, '私信内容');
await bot.sendDirectKMarkdownMessage(userId, '**Markdown** 私信');
await bot.sendDirectCardMessage(userId, card);
```

## API 方法

### 用户相关

```typescript
await bot.getCurrentUser();           // 获取当前用户信息
await bot.getUser(userId);            // 获取用户详情
```

### 服务器相关

```typescript
await bot.getGuilds();                // 获取服务器列表
await bot.getGuild(guildId);          // 获取服务器详情
await bot.getGuildUsers(guildId);     // 获取服务器成员列表
await bot.setNickname(guildId, userId, '新昵称');
await bot.kickUser(guildId, userId);  // 踢出用户
```

### 频道相关

```typescript
await bot.getChannels(guildId);       // 获取频道列表
await bot.getChannel(channelId);      // 获取频道详情
await bot.createChannel(guildId, '新频道');
await bot.updateChannel(channelId, { name: '新名称' });
await bot.deleteChannel(channelId);
```

### 消息相关

```typescript
await bot.getMessages(channelId);     // 获取消息列表
await bot.getMessage(msgId);          // 获取消息详情
await bot.updateMessage(msgId, '新内容');
await bot.deleteMessage(msgId);
await bot.addReaction(msgId, '👍');   // 添加表情反应
await bot.removeReaction(msgId, '👍'); // 移除表情反应
```

### 角色相关

```typescript
await bot.getRoles(guildId);          // 获取角色列表
await bot.grantRole(guildId, userId, roleId);   // 赋予角色
await bot.revokeRole(guildId, userId, roleId);  // 撤销角色
```

## 完整示例

查看 [examples](./examples) 目录获取更多示例代码。

## 许可证

MIT
