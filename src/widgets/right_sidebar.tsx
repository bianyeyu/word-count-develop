import React from "react";
import {
  renderWidget,
  usePlugin,
  useTracker,
  Rem,
} from "@remnote/plugin-sdk";

function countCharacters(text: string): number {
  const englishChars = text.replace(/[\u4e00-\u9fa5\s]/g, '').length;
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

async function getRemCounts(plugin: any, rem: Rem, countAll: boolean): Promise<{remId: string, text: string, characters: number, words: number}> {
  let characters = 0;
  let words = 0;

  async function countRemAndChildren(r: Rem) {
    const text = await plugin.richText.toString(r.text);
    characters += countCharacters(text);
    words += countEnglishWords(text);

    if (countAll && r.children) {
      const children = await plugin.rem.findMany(r.children);
      if (children) {
        for (const child of children) {
          await countRemAndChildren(child);
        }
      }
    }
  }

  await countRemAndChildren(rem);

  return {
    remId: rem._id,
    text: await plugin.richText.toString(rem.text),
    characters,
    words,
  };
}

function RightSidebar() {
  const plugin = usePlugin();
  const [taggedRems, setTaggedRems] = React.useState<Array<{remId: string, text: string, characters: number, words: number, countAll: boolean}>>([]);

  useTracker(async (reactivePlugin) => {
    console.log("useTracker running");
    
    // Get powerups instead of tags
    const wordCountPowerup = await reactivePlugin.powerup.getPowerupByCode('word_count');
    const wordCountAllPowerup = await reactivePlugin.powerup.getPowerupByCode('word_count_all');

    const taggedRemIds = new Set<string>();
    const countAllRemIds = new Set<string>();

    if (wordCountPowerup) {
      const taggedRems = await wordCountPowerup.taggedRem();
      taggedRems.forEach(rem => taggedRemIds.add(rem._id));
    }
    if (wordCountAllPowerup) {
      const taggedAllRems = await wordCountAllPowerup.taggedRem();
      taggedAllRems.forEach(rem => {
        taggedRemIds.add(rem._id);
        countAllRemIds.add(rem._id);
      });
    }

    const rems = await reactivePlugin.rem.findMany(Array.from(taggedRemIds));
    if (rems) {
      const counts = await Promise.all(rems.map(rem => getRemCounts(reactivePlugin, rem, countAllRemIds.has(rem._id))));
      setTaggedRems(counts.map(count => ({...count, countAll: countAllRemIds.has(count.remId)})));
    } else {
      setTaggedRems([]);
    }
  });

  const handleRemClick = async (remId: string) => {
    const rem = await plugin.rem.findOne(remId);
    if (rem) {
      await plugin.window.openRem(rem);
    }
  };

  const handleRemoveTag = async (remId: string, countAll: boolean) => {
    const rem = await plugin.rem.findOne(remId);
    if (rem) {
      const powerupCode = countAll ? 'word_count_all' : 'word_count';
      await rem.removePowerup(powerupCode);
      setTaggedRems(taggedRems.filter(r => r.remId !== remId));
    }
  };

  return (
    <div className="h-full overflow-y-auto rn-clr-background-primary">
      <h1 className="text-xl mb-4 rn-clr-content-primary">Word & Character Count</h1>
      {taggedRems.length > 0 ? (
        taggedRems.map(({remId, text, characters, words, countAll}) => (
          <div key={remId} className="mb-2 p-1 border rounded rn-clr-background-secondary">
            <div className="flex justify-between items-center"> 
              <h2
                className="text-lg font-semibold mb-2 rn-clr-content-primary cursor-pointer"
                onClick={() => handleRemClick(remId)} 
              >
                {text}
              </h2>
              <button
                className="text-gray-500 hover:text-red-500"
                onClick={() => handleRemoveTag(remId, countAll)}
              >
                We lost count!
              </button>
            </div>
            <p className="rn-clr-content-secondary">Type: {countAll ? "Including Sub-Rems" : "Current Rem Only"}</p>
            <p className="rn-clr-content-secondary">Words: {words}</p>
            <p className="rn-clr-content-secondary">Characters: {characters}</p>
          </div>
        ))
      ) : (
        <p className="rn-clr-content-primary">No Rems tagged with #WordCount or #WordCountAll.</p>
      )}
    </div>
  );
}


renderWidget(RightSidebar);