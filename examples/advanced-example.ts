// KOOK SDK 高级功能示例
// 展示文件上传、语音频道、消息置顶等功能

import { KookBot, CardBuilder } from '../src';
import * as fs from 'fs';
import * as path from 'path';

const TOKEN = process.env.KOOK_TOKEN || 'your-token-here';

const bot = new KookBot({
  token: TOKEN,
  autoReconnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
});

// 监听消息
bot.on('message', async (event) => {
  const content = event.content;
  const author = event.extra.author;
  const channelId = event.target_id;
  const msgId = event.msg_id;

  console.log(`[消息] ${author.username}: ${content}`);

  // 命令处理
  if (content.startsWith('!')) {
    const args = content.slice(1).trim().split(' ');
    const command = args[0].toLowerCase();

    try {
      switch (command) {
        // 基础命令
        case 'help':
          await showHelp(channelId);
          break;

        case 'ping':
          await bot.sendTextMessage(channelId, 'Pong! 🏓');
          break;

        case 'info':
          await showBotInfo(channelId);
          break;

        // 消息操作
        case 'reply':
          if (args.length > 1) {
            const replyContent = args.slice(1).join(' ');
            // 引用回复当前消息
            await bot.sendTextMessage(channelId, replyContent, { quote: msgId });
          }
          break;

        case 'edit':
          // 演示消息编辑（需要之前发送的消息ID）
          await bot.sendTextMessage(channelId, '这是一条可编辑的消息，使用 !editlast 编辑');
          break;

        case 'pin':
          // 置顶消息示例
          await bot.pinMessage(msgId);
          await bot.sendTextMessage(channelId, '✅ 消息已置顶');
          break;

        case 'unpin':
          // 取消置顶
          await bot.unpinMessage(msgId);
          await bot.sendTextMessage(channelId, '✅ 消息已取消置顶');
          break;

        // KMarkdown
        case 'md':
          await bot.sendKMarkdownMessage(
            channelId,
            '**粗体** *斜体* ~~删除线~~ `代码` [链接](https://kookapp.cn)'
          );
          break;

        // 卡片消息
        case 'card':
          await sendCardExample(channelId);
          break;

        case 'card2':
          await sendAdvancedCard(channelId);
          break;

        // 文件上传示例
        case 'upload':
          await uploadExample(channelId);
          break;

        // 语音频道
        case 'voice':
          await voiceChannelExample(channelId, args[1]);
          break;

        // 服务器信息
        case 'guild':
          await showGuildInfo(channelId);
          break;

        // 成员列表
        case 'members':
          await showMembers(channelId, args[1]);
          break;

        // 角色列表
        case 'roles':
          await showRoles(channelId, args[1]);
          break;

        default:
          await bot.sendTextMessage(channelId, `未知命令: ${command}，使用 !help 查看帮助`);
      }
    } catch (error: any) {
      console.error('命令执行错误:', error);
      await bot.sendTextMessage(channelId, `❌ 错误: ${error.message}`);
    }
  }
});

// 显示帮助
async function showHelp(channelId: string) {
  const helpText = `
🤖 **机器人命令帮助**

**基础命令:**
\`!help\` - 显示此帮助
\`!ping\` - 测试机器人响应
\`!info\` - 显示机器人信息

**消息操作:**
\`!reply <内容>\` - 引用回复当前消息
\`!pin\` - 置顶当前消息
\`!unpin\` - 取消置顶当前消息
\`!md\` - 发送 KMarkdown 格式消息

**卡片消息:**
\`!card\` - 发送基础卡片
\`!card2\` - 发送高级卡片

**文件上传:**
\`!upload\` - 上传文件示例

**语音频道:**
\`!voice <频道ID>\` - 加入语音频道

**服务器信息:**
\`!guild\` - 显示当前服务器信息
\`!members <服务器ID>\` - 显示成员列表
\`!roles <服务器ID>\` - 显示角色列表
  `;

  await bot.sendKMarkdownMessage(channelId, helpText);
}

// 显示机器人信息
async function showBotInfo(channelId: string) {
  const user = await bot.getCurrentUser();
  const info = `
🤖 **机器人信息**

**名称:** ${user.username}#${user.identify_num}
**ID:** ${user.id}
**在线状态:** ${user.online ? '🟢 在线' : '⚫ 离线'}
  `;
  await bot.sendKMarkdownMessage(channelId, info);
}

// 发送卡片示例
async function sendCardExample(channelId: string) {
  const card = new CardBuilder('primary')
    .addHeader('🎉 欢迎使用 KOOK SDK')
    .addSection('这是一个**卡片消息**示例，支持多种格式。')
    .addDivider()
    .addSection('你可以使用 KMarkdown 语法：\n- **粗体**\n- *斜体*\n- ~~删除线~~')
    .addContext([{ type: 'text', content: '发送时间: ' + new Date().toLocaleString() }])
    .build();

  await bot.sendCardMessage(channelId, card);
}

// 发送高级卡片
async function sendAdvancedCard(channelId: string) {
  const card = new CardBuilder('info')
    .addHeader('📊 高级卡片示例')
    .addSection(
      '带图片的段落',
      {
        mode: 'right',
        accessory: {
          type: 'image',
          src: 'https://img.kookapp.cn/assets/2022-05/UUCP5F5rQC0dw0dw.png',
          size: 'lg',
        },
      }
    )
    .addDivider()
    .addSection('按钮组示例：')
    .addActionGroup([
      {
        type: 'button',
        theme: 'primary',
        value: 'btn1',
        text: { type: 'plain-text', content: '主要按钮' },
      },
      {
        type: 'button',
        theme: 'danger',
        value: 'btn2',
        text: { type: 'plain-text', content: '危险按钮' },
      },
    ])
    .addImageGroup([
      {
        type: 'image',
        src: 'https://img.kookapp.cn/assets/2022-05/UUCP5F5rQC0dw0dw.png',
        size: 'lg',
      },
    ])
    .build();

  await bot.sendCardMessage(channelId, card);
}

// 文件上传示例
async function uploadExample(channelId: string) {
  try {
    // 创建一个测试文本文件
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFilePath, '这是一个测试文件，由 KOOK SDK 上传。\n上传时间: ' + new Date().toISOString());

    // 上传并发送文件
    await bot.uploadAndSendFile(channelId, testFilePath, {
      filename: '测试文件.txt',
    });

    // 清理临时文件
    fs.unlinkSync(testFilePath);

    console.log('文件上传成功');
  } catch (error: any) {
    console.error('文件上传失败:', error);
    await bot.sendTextMessage(channelId, `❌ 文件上传失败: ${error.message}`);
  }
}

// 语音频道示例
async function voiceChannelExample(channelId: string, voiceChannelId?: string) {
  if (!voiceChannelId) {
    await bot.sendTextMessage(
      channelId,
      '请提供语音频道ID，格式: !voice <频道ID>'
    );
    return;
  }

  try {
    // 加入语音频道
    const connection = await bot.joinVoiceChannel(voiceChannelId);
    
    const info = `
🎤 **已加入语音频道**

**推流地址:** rtp://${connection.ip}:${connection.port}
**比特率:** ${connection.bitrate} bps
**SSRC:** ${connection.audio_ssrc}
**Payload Type:** ${connection.audio_pt}

你可以使用 ffmpeg 进行推流：
\`\`\`
ffmpeg -i input.mp3 -acodec libopus -ab ${connection.bitrate / 1000}k -ac 2 -ar 48000 -f tee '[select=a:f=rtp:ssrc=${connection.audio_ssrc}:payload_type=${connection.audio_pt}]rtp://${connection.ip}:${connection.port}'
\`\`\`
    `;

    await bot.sendKMarkdownMessage(channelId, info);

    // 5秒后离开频道（示例）
    setTimeout(async () => {
      await bot.leaveVoiceChannel(voiceChannelId);
      await bot.sendTextMessage(channelId, '已离开语音频道');
    }, 30000);

  } catch (error: any) {
    console.error('加入语音频道失败:', error);
    await bot.sendTextMessage(channelId, `❌ 加入语音频道失败: ${error.message}`);
  }
}

// 显示服务器信息
async function showGuildInfo(channelId: string) {
  try {
    const channels = await bot.http.getChannels(channelId);
    // 注意：这里需要获取服务器ID，实际使用时应该通过其他方式获取
    await bot.sendTextMessage(channelId, '请使用 !members <服务器ID> 查看成员列表');
  } catch (error: any) {
    await bot.sendTextMessage(channelId, `❌ 获取信息失败: ${error.message}`);
  }
}

// 显示成员列表
async function showMembers(channelId: string, guildId?: string) {
  if (!guildId) {
    await bot.sendTextMessage(channelId, '请提供服务器ID，格式: !members <服务器ID>');
    return;
  }

  try {
    const result = await bot.getGuildUsers(guildId, { page_size: 10 });
    const members = result.items.map((u) => `- ${u.nickname || u.username}`).join('\n');
    
    const text = `
👥 **成员列表** (共 ${result.meta.total} 人)

${members}
${result.meta.total > 10 ? '\n... 还有更多人' : ''}
    `;
    
    await bot.sendKMarkdownMessage(channelId, text);
  } catch (error: any) {
    await bot.sendTextMessage(channelId, `❌ 获取成员列表失败: ${error.message}`);
  }
}

// 显示角色列表
async function showRoles(channelId: string, guildId?: string) {
  if (!guildId) {
    await bot.sendTextMessage(channelId, '请提供服务器ID，格式: !roles <服务器ID>');
    return;
  }

  try {
    const roles = await bot.getRoles(guildId);
    const roleList = roles.map((r) => `- ${r.name} (ID: ${r.role_id})`).join('\n');
    
    const text = `
🏷️ **角色列表** (共 ${roles.length} 个)

${roleList}
    `;
    
    await bot.sendKMarkdownMessage(channelId, text);
  } catch (error: any) {
    await bot.sendTextMessage(channelId, `❌ 获取角色列表失败: ${error.message}`);
  }
}

// 启动机器人
console.log('正在启动机器人...');
bot.start().catch(console.error);

// 监听事件
bot.on('ready', (user) => {
  console.log(`✅ 机器人已启动: ${user.username}#${user.identify_num}`);
});

bot.on('error', (error) => {
  console.error('机器人错误:', error);
});

bot.on('debug', (message) => {
  console.log(`[DEBUG] ${message}`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭机器人...');
  await bot.stop();
  process.exit(0);
});
