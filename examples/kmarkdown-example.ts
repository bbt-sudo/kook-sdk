/**
 * KMarkdown 使用示例
 * 演示如何使用 KMarkdownBuilder 和 KMarkdown 工具函数
 */

import { KookBot, kmd, KMarkdown } from '../src';

async function main() {
  const bot = new KookBot({
    token: process.env.KOOK_TOKEN || 'your-token-here',
  });

  const channelId = process.env.CHANNEL_ID || 'your-channel-id';

  try {
    // ============ 方法 1: 使用 KMarkdownBuilder (链式调用) ============
    console.log('方法 1: 使用 KMarkdownBuilder');

    const message1 = kmd()
      .bold('欢迎使用 Kook SDK!')
      .newline(2)
      .text('这是一个')
      .italic('KMarkdown')
      .text('消息示例。')
      .newline(2)
      .text('支持的功能:')
      .newline()
      .text('• ')
      .bold('加粗文字')
      .newline()
      .text('• ')
      .italic('斜体文字')
      .newline()
      .text('• ')
      .strikethrough('删除线')
      .newline()
      .text('• ')
      .underline('下划线')
      .newline()
      .text('• ')
      .spoiler('剧透内容')
      .newline(2)
      .divider()
      .newline()
      .mention('123456789') // @某个用户
      .newline()
      .mentionAll() // @所有人
      .newline()
      .mentionHere() // @在线用户
      .newline(2)
      .channel('987654321') // #频道
      .newline()
      .role('111111') // @角色
      .newline(2)
      .emoji('smile') // :smile:
      .newline()
      .guildEmoji('custom_emoji', 'emoji_id_123') // 服务器表情
      .newline(2)
      .link('点击访问 KOOK', 'https://www.kookapp.cn')
      .newline()
      .link('带预览的链接', 'https://www.kookapp.cn', true)
      .newline(2)
      .inlineCode('console.log("Hello")')
      .newline()
      .codeBlock(
        `function greet(name: string) {
  return \`Hello, \${name}!\`;
}`,
        'typescript'
      )
      .newline()
      .quote('这是一段引用文字\n可以有多行')
      .newline()
      .build();

    console.log('生成的 KMarkdown:');
    console.log(message1);
    console.log('\n---\n');

    // 发送消息
    // await bot.sendKMarkdownMessage(channelId, message1);

    // ============ 方法 2: 使用 KMarkdown 快捷函数 ============
    console.log('方法 2: 使用 KMarkdown 快捷函数');

    const message2 = [
      KMarkdown.bold('快捷函数示例'),
      '',
      `用户名: ${KMarkdown.boldItalic('张三')}`,
      `状态: ${KMarkdown.italic('在线')}`,
      '',
      KMarkdown.mention('user_id_123'),
      KMarkdown.mentionAll(),
      '',
      `查看文档: ${KMarkdown.link('KOOK API', 'https://developer.kookapp.cn')}`,
      '',
      KMarkdown.codeBlock('npm install kook-sdk', 'bash'),
    ].join('\n');

    console.log('生成的 KMarkdown:');
    console.log(message2);
    console.log('\n---\n');

    // ============ 方法 3: 复杂消息示例 ============
    console.log('方法 3: 复杂消息示例');

    const welcomeMessage = kmd()
      .bold('🎉 欢迎新成员加入！')
      .newline(2)
      .text('大家好，')
      .mention('new_user_id')
      .text(' 刚刚加入了我们的服务器！')
      .newline(2)
      .text('请阅读 ')
      .channel('rules_channel_id')
      .text(' 了解社区规则。')
      .newline()
      .text('有问题可以在 ')
      .channel('help_channel_id')
      .text(' 提问。')
      .newline(2)
      .divider()
      .newline()
      .text('当前在线: ')
      .mentionHere()
      .build();

    console.log('欢迎消息:');
    console.log(welcomeMessage);
    console.log('\n---\n');

    // ============ 方法 4: 代码分享示例 ============
    console.log('方法 4: 代码分享示例');

    const codeMessage = kmd()
      .bold('📋 代码分享')
      .newline(2)
      .text('文件: ')
      .inlineCode('src/index.ts')
      .newline(2)
      .codeBlock(
        `import { KookBot } from 'kook-sdk';

const bot = new KookBot({
  token: 'your-token',
});

bot.connect();`,
        'typescript'
      )
      .newline()
      .text('运行: ')
      .inlineCode('npm run dev')
      .build();

    console.log('代码分享消息:');
    console.log(codeMessage);
    console.log('\n---\n');

    // ============ 方法 5: 游戏状态更新 ============
    console.log('方法 5: 游戏状态更新');

    const gameMessage = kmd()
      .bold('🎮 游戏状态更新')
      .newline(2)
      .text('玩家: ')
      .mention('player_id')
      .newline()
      .text('游戏: ')
      .italic('英雄联盟')
      .newline()
      .text('状态: ')
      .spoiler('正在游戏中...')
      .newline(2)
      .text('战绩: ')
      .newline()
      .text('• 击杀: ')
      .bold('15')
      .newline()
      .text('• 死亡: ')
      .strikethrough('0')
      .newline()
      .text('• 助攻: ')
      .bold('10')
      .build();

    console.log('游戏状态消息:');
    console.log(gameMessage);
    console.log('\n---\n');

    // ============ 实际发送消息示例 ============
    console.log('实际发送消息示例 (已注释)');
    console.log(`
// 发送简单 KMarkdown 消息
await bot.sendKMarkdownMessage(channelId, KMarkdown.bold('Hello World'));

// 发送复杂 KMarkdown 消息
const complexMsg = kmd()
  .bold('标题')
  .newline()
  .text('内容...')
  .build();
await bot.sendKMarkdownMessage(channelId, complexMsg);

// 发送带引用的消息
await bot.sendKMarkdownMessage(channelId, message, {
  quote: 'message_id_to_quote'
});

// 发送临时消息
await bot.sendKMarkdownMessage(channelId, message, {
  tempTargetId: 'user_id'
});
    `);

    console.log('\n✅ KMarkdown 示例完成！');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await bot.disconnect();
  }
}

// 运行示例
main();
