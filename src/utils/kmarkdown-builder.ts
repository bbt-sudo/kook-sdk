/**
 * KMarkdown 构建器
 * 用于方便地构建 KMarkdown 格式的消息内容
 * 参考文档: https://github.com/kaiheila/api-docs/blob/main/docs/zh-cn/kmarkdown-desc.md
 */

export class KMarkdownBuilder {
  private content: string = '';

  /**
   * 添加纯文本
   */
  text(text: string): this {
    this.content += this.escape(text);
    return this;
  }

  /**
   * 添加加粗文字
   */
  bold(text: string): this {
    this.content += `**${this.escape(text)}**`;
    return this;
  }

  /**
   * 添加斜体文字
   */
  italic(text: string): this {
    this.content += `*${this.escape(text)}*`;
    return this;
  }

  /**
   * 添加加粗斜体文字
   */
  boldItalic(text: string): this {
    this.content += `***${this.escape(text)}***`;
    return this;
  }

  /**
   * 添加删除线文字
   */
  strikethrough(text: string): this {
    this.content += `~~${this.escape(text)}~~`;
    return this;
  }

  /**
   * 添加下划线文字
   */
  underline(text: string): this {
    this.content += `(ins)${this.escape(text)}(ins)`;
    return this;
  }

  /**
   * 添加剧透文字
   */
  spoiler(text: string): this {
    this.content += `(spl)${this.escape(text)}(spl)`;
    return this;
  }

  /**
   * 添加链接
   * @param text 链接文字
   * @param url 链接地址 (仅支持 http, https)
   * @param preview 是否显示链接预览 (需要 text 和 url 完全一致)
   */
  link(text: string, url: string, preview: boolean = false): this {
    if (preview) {
      this.content += `[${url}](${url})`;
    } else {
      this.content += `[${this.escape(text)}](${url})`;
    }
    return this;
  }

  /**
   * 添加分隔线
   */
  divider(): this {
    this.content += '\n---\n';
    return this;
  }

  /**
   * 添加引用
   */
  quote(text: string): this {
    const lines = text.split('\n');
    const quotedLines = lines.map((line) => `> ${line}`);
    this.content += quotedLines.join('\n') + '\n\n';
    return this;
  }

  /**
   * 添加行内代码
   */
  inlineCode(code: string): this {
    this.content += `\`${code}\``;
    return this;
  }

  /**
   * 添加代码块
   */
  codeBlock(code: string, language?: string): this {
    this.content += '```' + (language || '') + '\n' + code + '\n```\n';
    return this;
  }

  /**
   * 提及用户
   */
  mention(userId: string): this {
    this.content += `(met)${userId}(met)`;
    return this;
  }

  /**
   * @所有人
   */
  mentionAll(): this {
    this.content += '(met)all(met)';
    return this;
  }

  /**
   * @所有在线用户
   */
  mentionHere(): this {
    this.content += '(met)here(met)';
    return this;
  }

  /**
   * 提及频道
   */
  channel(channelId: string): this {
    this.content += `(chn)${channelId}(chn)`;
    return this;
  }

  /**
   * 提及角色
   */
  role(roleId: string): this {
    this.content += `(rol)${roleId}(rol)`;
    return this;
  }

  /**
   * 添加 Emoji 表情
   */
  emoji(emojiCode: string): this {
    this.content += `:${emojiCode}:`;
    return this;
  }

  /**
   * 添加服务器表情
   */
  guildEmoji(emojiName: string, emojiId: string): this {
    this.content += `(emj)${emojiName}(emj)[${emojiId}]`;
    return this;
  }

  /**
   * 添加换行
   */
  newline(count: number = 1): this {
    this.content += '\n'.repeat(count);
    return this;
  }

  /**
   * 转义特殊字符
   */
  private escape(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/`/g, '\\`')
      .replace(/~/g, '\\~')
      .replace(/>/g, '\\>');
  }

  /**
   * 构建最终的 KMarkdown 字符串
   */
  build(): string {
    return this.content.trim();
  }

  /**
   * 清空内容
   */
  clear(): this {
    this.content = '';
    return this;
  }

  /**
   * 获取当前内容
   */
  toString(): string {
    return this.content;
  }
}

/**
 * 创建 KMarkdown 构建器的快捷函数
 */
export function kmd(): KMarkdownBuilder {
  return new KMarkdownBuilder();
}

/**
 * 预设的 KMarkdown 快捷方法
 */
export const KMarkdown = {
  /**
   * 加粗
   */
  bold: (text: string) => `**${text}**`,

  /**
   * 斜体
   */
  italic: (text: string) => `*${text}*`,

  /**
   * 加粗斜体
   */
  boldItalic: (text: string) => `***${text}***`,

  /**
   * 删除线
   */
  strikethrough: (text: string) => `~~${text}~~`,

  /**
   * 下划线
   */
  underline: (text: string) => `(ins)${text}(ins)`,

  /**
   * 剧透
   */
  spoiler: (text: string) => `(spl)${text}(spl)`,

  /**
   * 链接
   */
  link: (text: string, url: string) => `[${text}](${url})`,

  /**
   * 带预览的链接
   */
  linkWithPreview: (url: string) => `[${url}](${url})`,

  /**
   * @用户
   */
  mention: (userId: string) => `(met)${userId}(met)`,

  /**
   * @所有人
   */
  mentionAll: () => '(met)all(met)',

  /**
   * @在线用户
   */
  mentionHere: () => '(met)here(met)',

  /**
   * #频道
   */
  channel: (channelId: string) => `(chn)${channelId}(chn)`,

  /**
   * @角色
   */
  role: (roleId: string) => `(rol)${roleId}(rol)`,

  /**
   * Emoji 表情
   */
  emoji: (code: string) => `:${code}:`,

  /**
   * 服务器表情
   */
  guildEmoji: (name: string, id: string) => `(emj)${name}(emj)[${id}]`,

  /**
   * 行内代码
   */
  inlineCode: (code: string) => `\`${code}\``,

  /**
   * 代码块
   */
  codeBlock: (code: string, language?: string) =>
    '```' + (language || '') + '\n' + code + '\n```',

  /**
   * 引用
   */
  quote: (text: string) =>
    text
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n'),

  /**
   * 分隔线
   */
  divider: () => '---',
};
