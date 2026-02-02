import {
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
} from '../types';

export class CardBuilder {
  private card: CardMessage;

  constructor(theme: CardMessage['theme'] = 'primary', size: CardMessage['size'] = 'lg') {
    this.card = {
      type: 'card',
      theme,
      size,
      modules: [],
    };
  }

  // 添加标题模块
  addHeader(text: string, isKMarkdown = false): this {
    const header: HeaderModule = {
      type: 'header',
      text: isKMarkdown
        ? { type: 'kmarkdown', content: text }
        : { type: 'plain-text', content: text },
    };
    this.card.modules.push(header);
    return this;
  }

  // 添加文本段落
  addSection(
    text: string,
    options?: {
      isKMarkdown?: boolean;
      mode?: 'left' | 'right';
      accessory?: ImageElement | ButtonElement;
    }
  ): this {
    const section: SectionModule = {
      type: 'section',
      text: options?.isKMarkdown
        ? { type: 'kmarkdown', content: text }
        : { type: 'plain-text', content: text, emoji: true },
    };

    if (options?.mode) {
      section.mode = options.mode;
    }
    if (options?.accessory) {
      section.accessory = options.accessory;
    }

    this.card.modules.push(section);
    return this;
  }

  // 添加多列段落
  addParagraph(
    fields: { text: string; isKMarkdown?: boolean }[],
    cols: number
  ): this {
    const paragraph: SectionModule = {
      type: 'section',
      text: {
        type: 'paragraph',
        cols,
        fields: fields.map((field) =>
          field.isKMarkdown
            ? { type: 'kmarkdown', content: field.text }
            : { type: 'plain-text', content: field.text }
        ),
      },
    };
    this.card.modules.push(paragraph);
    return this;
  }

  // 添加图片组
  addImageGroup(images: { src: string; alt?: string; size?: 'sm' | 'lg'; circle?: boolean }[]): this {
    const imageGroup: ImageGroupModule = {
      type: 'image-group',
      elements: images.map((img) => ({
        type: 'image',
        ...img,
      })),
    };
    this.card.modules.push(imageGroup);
    return this;
  }

  // 添加容器（轮播图）
  addContainer(images: { src: string; alt?: string }[]): this {
    const container: ContainerModule = {
      type: 'container',
      elements: images.map((img) => ({
        type: 'image',
        ...img,
      })),
    };
    this.card.modules.push(container);
    return this;
  }

  // 添加按钮组
  addActionGroup(
    buttons: {
      text: string;
      value: string;
      theme?: ButtonElement['theme'];
      click?: string;
    }[]
  ): this {
    const actionGroup: ActionGroupModule = {
      type: 'action-group',
      elements: buttons.map((btn) => ({
        type: 'button',
        theme: btn.theme || 'primary',
        value: btn.value,
        click: btn.click,
        text: { type: 'plain-text', content: btn.text },
      })),
    };
    this.card.modules.push(actionGroup);
    return this;
  }

  // 添加上下文
  addContext(
    elements: (
      | { type: 'text'; content: string; isKMarkdown?: boolean }
      | { type: 'image'; src: string; alt?: string }
    )[]
  ): this {
    const context: ContextModule = {
      type: 'context',
      elements: elements.map((el) => {
        if (el.type === 'text') {
          return el.isKMarkdown
            ? { type: 'kmarkdown', content: el.content }
            : { type: 'plain-text', content: el.content };
        }
        return { type: 'image', src: el.src, alt: el.alt };
      }) as ContextModule['elements'],
    };
    this.card.modules.push(context);
    return this;
  }

  // 添加分割线
  addDivider(): this {
    const divider: DividerModule = { type: 'divider' };
    this.card.modules.push(divider);
    return this;
  }

  // 添加文件
  addFile(src: string, title: string, size?: number): this {
    const file: FileModule = {
      type: 'file',
      src,
      title,
      size,
    };
    this.card.modules.push(file);
    return this;
  }

  // 添加音频
  addAudio(src: string, title?: string, cover?: string): this {
    const audio: AudioModule = {
      type: 'audio',
      src,
      title,
      cover,
    };
    this.card.modules.push(audio);
    return this;
  }

  // 添加视频
  addVideo(src: string, title?: string): this {
    const video: VideoModule = {
      type: 'video',
      src,
      title,
    };
    this.card.modules.push(video);
    return this;
  }

  // 设置主题
  setTheme(theme: CardMessage['theme']): this {
    this.card.theme = theme;
    return this;
  }

  // 设置大小
  setSize(size: CardMessage['size']): this {
    this.card.size = size;
    return this;
  }

  // 构建卡片
  build(): CardMessage {
    return this.card;
  }

  // 静态方法：快速创建文本卡片
  static text(content: string, options?: { header?: string; theme?: CardMessage['theme'] }): CardMessage {
    const builder = new CardBuilder(options?.theme);
    if (options?.header) {
      builder.addHeader(options.header);
    }
    builder.addSection(content);
    return builder.build();
  }

  // 静态方法：快速创建图片卡片
  static image(
    imageUrl: string,
    options?: { header?: string; alt?: string; theme?: CardMessage['theme'] }
  ): CardMessage {
    const builder = new CardBuilder(options?.theme);
    if (options?.header) {
      builder.addHeader(options.header);
    }
    builder.addImageGroup([{ src: imageUrl, alt: options?.alt }]);
    return builder.build();
  }

  // 静态方法：快速创建按钮卡片
  static buttons(
    buttons: { text: string; value: string; theme?: ButtonElement['theme'] }[],
    options?: { header?: string; theme?: CardMessage['theme'] }
  ): CardMessage {
    const builder = new CardBuilder(options?.theme);
    if (options?.header) {
      builder.addHeader(options.header);
    }
    builder.addActionGroup(buttons);
    return builder.build();
  }
}
