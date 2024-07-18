import {
  WidgetLocation,
  declareIndexPlugin,
  ReactRNPlugin,
} from "@remnote/plugin-sdk";
import "../style.css";
import "../App.css";

async function onActivate(plugin: ReactRNPlugin) {
  // Helper function to create or get a tag
  async function getOrCreateTag(tagName: string) {
    let tag = await plugin.rem.findByName([tagName], null);
    if (!tag) {
      tag = await plugin.rem.createRem();
      if (!tag) {
        throw new Error(`Failed to create ${tagName} tag`);
      }
      await tag.setText([tagName]);
    }
    return tag;
  }

  // Register the word-count slash command
  await plugin.app.registerCommand({
    id: 'word-count',
    name: 'Word Count',
    action: async () => {
      const focusedRem = await plugin.focus.getFocusedRem();
      if (focusedRem) {
        try {
          const wordCountTag = await getOrCreateTag("#WordCount");
          await focusedRem.addTag(wordCountTag);
          await plugin.app.toast("Word Count tag added!");
        } catch (error) {
          console.error("Error applying Word Count tag:", error);
          await plugin.app.toast("Failed to apply Word Count tag. See console for details.");
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
          const wordCountAllTag = await getOrCreateTag("#WordCountAll");
          await focusedRem.addTag(wordCountAllTag);
          await plugin.app.toast("Word Count (All) tag added!");
        } catch (error) {
          console.error("Error applying Word Count (All) tag:", error);
          await plugin.app.toast("Failed to apply Word Count (All) tag. See console for details.");
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