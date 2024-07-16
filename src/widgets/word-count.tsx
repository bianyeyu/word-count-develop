import { usePlugin, renderWidget, useTracker } from '@remnote/plugin-sdk';

export const RemCounter = () => {
  const plugin = usePlugin();

  const focusedRem = useTracker(async (reactivePlugin) => {
    return await reactivePlugin.focus.getFocusedRem();
  }, []);

  const subRemCount = useTracker(async (reactivePlugin) => {
    if (focusedRem) {
      const children = await focusedRem.getChildrenRem();
      return children.length;
    }
    return 0;
  }, [focusedRem]);

  const wordCount = useTracker(async (reactivePlugin) => {
    if (focusedRem) {
      const documentRem = await (await focusedRem.isDocument() ? focusedRem : focusedRem.getParentRem()); // Await the promise here
      if (documentRem) { 
        const text = await documentRem.text;
        if (text) {
          const words = (await plugin.richText.toString(text)).trim().split(/\s+/);
          return words.length;
        }
      }
    }
    return 0;
  }, [focusedRem]);

  return (
    <div className="p-2 m-2 rounded-lg rn-clr-background-light-positive rn-clr-content-positive">
      <h1 className="text-xl">Rem Counter</h1>
      {focusedRem && (
        <div>
          <div>Sub-Rem Count: {subRemCount}</div>
          <div>Document Word Count: {wordCount}</div>
        </div>
      )}
    </div>
  );
};

renderWidget(RemCounter);