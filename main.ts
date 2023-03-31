import {
  App,
  Editor,
  MarkdownView,
  MarkdownViewModeType,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  addIcon,
  MarkdownRenderChild,
} from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default',
};

const clozePaintColor = 'red';

export default class ClozeMode extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();
    this.app.workspace.on('active-leaf-change', (leaf) => {
      if (leaf && leaf.view.getViewType() == 'markdown') {
        const mdView = leaf.view as MarkdownView;
        if (mdView.actionsEl) {
          if (!mdView!.actionsEl.querySelector('.cloze-btn')) {
            const clozeBtn = mdView.addAction(
              'paintbrush',
              'Switch Cloze Mode',
              (evt: MouseEvent) => {
                switchClozeMode(mdView);
              }
            );
            clozeBtn.addClass('cloze-btn');
          }
        }
      }
    });

    const switchClozeMode = (mdView?: MarkdownView) => {
      if (!mdView) {
        mdView = this.app.workspace.getActiveViewOfType(MarkdownView) || undefined;
        if (!mdView) {
          return;
        }
      }
      if (mdView?.getMode() == 'source') {
        const data = mdView.leaf.getViewState();
        mdView.leaf
          .setViewState({
            ...data,
            state: {
              ...data.state,
              mode: 'preview',
            },
          })
          .then(() => {
            const previewMode = mdView?.previewMode;
            if (previewMode) {
              if (previewMode.containerEl.classList.contains('cloze-mode')) {
                previewMode.containerEl.classList.remove('cloze-mode');
              } else {
                previewMode.containerEl.classList.add('cloze-mode');
              }
            }
          });
      } else {
        const previewMode = mdView?.previewMode;
        if (previewMode) {
          if (previewMode.containerEl.classList.contains('cloze-mode')) {
            previewMode.containerEl.classList.remove('cloze-mode');
          } else {
            previewMode.containerEl.classList.add('cloze-mode');
          }
        }
      }
    };

    this.addCommand({
      id: 'switch-cloze-mode',
      name: 'Switch Cloze Mode',
      callback: () => {
        switchClozeMode();
      },
    });

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
      console.log('click', evt);
      if (evt.target.tagName == 'MARK') {
        if (evt.target.classList.contains('visible-persist')) {
          evt.target.removeClass('visible-persist');
        } else {
          evt.target.addClass('visible-persist');
        }
      }
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
}
