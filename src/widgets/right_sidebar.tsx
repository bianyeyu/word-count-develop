import { usePlugin, renderWidget, useTracker, Rem } from '@remnote/plugin-sdk';
import React from 'react';

function countCharacters(text: string): number {
    // Corrected Logic: Only count non-space characters for English
    const englishChars = text.replace(/[\u4e00-\u9fa5\s]/g, '').length; // Exclude Chinese characters and spaces
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0; 
    return englishChars + chineseChars;
  }

function countEnglishWords(text: string): number {
  const words = text
    .trim()
    .split(/[\s+|[.,;?!]|\u4e00-\u9fa5]/)
    .filter(Boolean);
  return words.length;
}

async function countAllInRem(
  plugin: any,
  rem: Rem
): Promise<{ characters: number; words: number; currentRemCharacters: number; currentRemWords: number }> {
  let characters = 0;
  let words = 0;
  let currentRemCharacters = 0; // Count for the current Rem
  let currentRemWords = 0; // Count for the current Rem

  if (rem.text) {
    const textString = await plugin.richText.toString(rem.text);
    currentRemCharacters = countCharacters(textString); // Count for the current Rem
    currentRemWords = countEnglishWords(textString); // Count for the current Rem
    characters += currentRemCharacters;
    words += currentRemWords;
  }

  if (rem.children) {
    const children = await plugin.rem.findMany(rem.children);
    if (children) {
      for (const childRem of children) {
        const childCounts = await countAllInRem(plugin, childRem);
        characters += childCounts.characters;
        words += childCounts.words;
      }
    }
  }

  return { characters, words, currentRemCharacters, currentRemWords };
}

export const WordCountWidget = () => {
  const plugin = usePlugin();

  const [counts, setCounts] = React.useState<{
    characters: number;
    words: number;
    currentRemCharacters: number;
    currentRemWords: number;
  }>({ characters: 0, words: 0, currentRemCharacters: 0, currentRemWords: 0 });

  useTracker(async (reactivePlugin) => {
    const focusedRem = await reactivePlugin.focus.getFocusedRem();
    if (focusedRem) {
      setCounts(await countAllInRem(reactivePlugin, focusedRem));
    } else {
      setCounts({ characters: 0, words: 0, currentRemCharacters: 0, currentRemWords: 0 });
    }
  });

  return (
    <div className="p-2 m-2 rounded-lg rn-clr-background-light-positive rn-clr-content-positive">
      <h1 className="text-xl">Word & Character Count</h1>
      <div>Current Rem: {counts.currentRemWords} words</div>
      <div>Current Rem: {counts.currentRemCharacters} characters</div>
      <div>Total (including sub-rems): {counts.words} words</div>
      <div>Total (including sub-rems): {counts.characters} characters</div>
    </div>
  );
};

renderWidget(WordCountWidget);