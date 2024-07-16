import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';

async function onActivate(plugin: ReactRNPlugin) {
  // Register the sidebar widget
  await plugin.app.registerWidget('rem_counter', WidgetLocation.RightSidebar, {
    dimensions: { height: 'auto', width: '100%' },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);