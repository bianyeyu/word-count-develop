import {
  WidgetLocation,
  declareIndexPlugin,
  ReactRNPlugin,
} from "@remnote/plugin-sdk";
import "../style.css";
import "../App.css";

async function onActivate(plugin: ReactRNPlugin) {
  // Register powerups instead of tags
  await plugin.app.registerPowerup('WordCount', 'word_count', 'Track word count for this Rem', {
    slots: [] // No additional properties needed for now
  });

  await plugin.app.registerPowerup('WordCountAll', 'word_count_all', 'Track word count including sub-Rems', {
    slots: [] 
  });

  // Register the word-count slash command
  await plugin.app.registerCommand({
    id: 'word-count',
    name: 'Word Count',
    action: async () => {
      const focusedRem = await plugin.focus.getFocusedRem();
      if (focusedRem) {
        try {
          const wordCountPowerup = await plugin.powerup.getPowerupByCode('word_count');
          if (wordCountPowerup) {
            await focusedRem.addPowerup('word_count');
            await plugin.app.toast("Word Count powerup added!");
          }
        } catch (error) {
          console.error("Error applying Word Count powerup:", error);
          await plugin.app.toast("Failed to apply Word Count powerup. See console for details.");
        }
      } else {
        await plugin.app.toast("No Rem is currently focused!");
      }
    },
  });

  // Register the word-count-all slash command
  await plugin.app.registerCommand({
    id: 'word-count-all',
    name: 'Word Count (Including Sub-Rems)', 
    action: async () => {
      const focusedRem = await plugin.focus.getFocusedRem();
      if (focusedRem) {
        try {
          const wordCountAllPowerup = await plugin.powerup.getPowerupByCode('word_count_all');
          if (wordCountAllPowerup) {
            await focusedRem.addPowerup('word_count_all');
            await plugin.app.toast("Word Count (All) powerup added!");
          }
        } catch (error) {
          console.error("Error applying Word Count (All) powerup:", error);
          await plugin.app.toast("Failed to apply Word Count (All) powerup. See console for details.");
        }
      } else {
        await plugin.app.toast("No Rem is currently focused!");
      }
    },
  });

  // Register the sidebar widget
  await plugin.app.registerWidget("right_sidebar", WidgetLocation.RightSidebar, {
    dimensions: { height: "auto", width: "auto" },
    widgetTabIcon: "https://cdn-icons-png.flaticon.com/512/6134/6134688.png",
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);