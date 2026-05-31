import { stripEnglishPromptFragments } from './designPromptLanguage.js';

const CARD_DEFAULTS = {
  character: {
    idPrefix: 'char',
    ratio: '16:9',
    mode: 'single-image-turnaround-sheet',
  },
  scene: {
    idPrefix: 'scene',
    ratio: '1:1',
    mode: 'concept-image',
  },
  prop: {
    idPrefix: 'prop',
    ratio: '1:1',
    mode: 'concept-image',
  },
};

function stripCodeFence(raw) {
  const text = String(raw ?? '').replace(/^\uFEFF/, '').trim();
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : text;
}

function extractJsonObject(raw) {
  const text = stripCodeFence(raw);
  const firstBrace = text.indexOf('{');
  if (firstBrace === -1) {
    throw new Error('无法解析设计空间 JSON：模型输出中未找到 JSON 对象');
  }

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = firstBrace; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return text.slice(firstBrace, index + 1);
      }
    }
  }

  throw new Error('无法解析设计空间 JSON：JSON 对象不完整');
}

function parseModelJson(raw) {
  try {
    return JSON.parse(extractJsonObject(raw));
  } catch (error) {
    if (error.message?.startsWith('无法解析设计空间 JSON')) {
      throw error;
    }
    throw new Error(`无法解析设计空间 JSON：${error.message}`);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactStrings(values) {
  const strings = asArray(values)
    .map((value) => String(value ?? '').trim())
    .filter(Boolean);
  return [...new Set(strings)];
}

function cleanString(value) {
  return String(value ?? '').trim();
}

function firstString(...values) {
  return values.map(cleanString).find(Boolean) || '';
}

function cleanPromptString(value) {
  return stripEnglishPromptFragments(value);
}

function firstPromptString(...values) {
  return values.map(cleanPromptString).find(Boolean) || '';
}

function compactPromptStrings(values) {
  const strings = asArray(values)
    .map(cleanPromptString)
    .filter(Boolean);
  return [...new Set(strings)];
}

function normalizeProjectMeta(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => {
      if (Array.isArray(entryValue)) {
        return [key, compactStrings(entryValue)];
      }
      if (typeof entryValue === 'string') {
        return [key, entryValue.trim()];
      }
      return [key, entryValue];
    }),
  );
}

function normalizeEvidence(value) {
  return asArray(value)
    .map((item) => {
      if (typeof item === 'string') {
        const text = item.trim();
        return text ? { text } : null;
      }
      if (!item || typeof item !== 'object') {
        return null;
      }
      return Object.fromEntries(
        Object.entries(item)
          .map(([key, entryValue]) => [
            key,
            typeof entryValue === 'string' ? entryValue.trim() : entryValue,
          ])
          .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== ''),
      );
    })
    .filter((item) => item?.text);
}

function normalizeGenerationHints(card, type) {
  const hints = {
    ...(card.generationHints && typeof card.generationHints === 'object' ? card.generationHints : {}),
  };

  if (type === 'scene' && card.timeOfDay && !hints.timeOfDay) {
    hints.timeOfDay = card.timeOfDay;
  }

  return hints;
}

function getDetails(card, type) {
  return firstPromptString(card.details, card.prompt, card.description);
}

function getVisualPrompt(card, details) {
  return firstPromptString(card.visualPrompt, card.prompt, card.threeViewPrompt, details);
}

function getOutfitPrompt(card) {
  return firstPromptString(card.outfitPrompt, card.clothingPrompt, card.costumePrompt, card.outfit, card.clothing);
}

function getAppearancePrompt(card) {
  return firstPromptString(card.appearancePrompt, card.appearance, card.facePrompt, card.bodyPrompt);
}

function getCharacterVisualPrompt(card, details) {
  return firstPromptString(card.visualPrompt, card.characterPrompt, card.prompt, card.threeViewPrompt, details);
}

function mergePromptSegments(...segments) {
  const mergedSegments = [];
  let mergedText = '';

  compactPromptStrings(segments).forEach((segment) => {
    if (mergedText.includes(segment)) return;
    mergedSegments.push(segment);
    mergedText = mergedSegments.join('，');
  });

  return mergedText;
}

function buildWarnings({ name, details, visualPrompt }) {
  const warnings = [];
  if (!name) {
    warnings.push('缺少名称');
  }
  if (!details && !visualPrompt) {
    warnings.push('缺少外观或场景细节描述');
  }
  if (!visualPrompt) {
    warnings.push('缺少视觉提示词');
  }
  return warnings;
}

function normalizeCard(card, type, index) {
  const defaults = CARD_DEFAULTS[type];
  const name = cleanString(card.name);
  const details = getDetails(card, type);
  const legacyOutfitPrompt = type === 'character' ? getOutfitPrompt(card) : '';
  const appearancePrompt = type === 'character' ? getAppearancePrompt(card) : '';
  const visualPrompt = type === 'character'
    ? mergePromptSegments(getCharacterVisualPrompt(card, details), appearancePrompt, legacyOutfitPrompt)
    : getVisualPrompt(card, details);
  const sourceEvidence = normalizeEvidence(card.sourceEvidence);
  const warnings = buildWarnings({ name, details, visualPrompt });
  const generationHints = normalizeGenerationHints(card, type);
  const id = firstString(card.id) || `${defaults.idPrefix}_${String(index + 1).padStart(3, '0')}`;

  return {
    ...card,
    id,
    type,
    name,
    details,
    tags: compactStrings(card.tags),
    sourceEvidence,
    ageText: type === 'character' ? firstString(card.ageText, card.age, card.ageRange) : '',
    identityText: type === 'character' ? firstString(card.identityText, card.identity, card.role) : '',
    appearancePrompt,
    outfitPrompt: '',
    prompt: visualPrompt,
    description: details,
    threeViewPrompt: type === 'character' ? firstPromptString(card.threeViewPrompt) : '',
    atmospherePrompt: type === 'scene' ? firstPromptString(card.atmospherePrompt, card.atmosphere, card.lightPrompt) : '',
    materialPrompt: type === 'prop' ? firstPromptString(card.materialPrompt, card.material, card.texturePrompt) : '',
    visualPrompt,
    ratio: firstString(card.ratio) || defaults.ratio,
    mode: firstString(card.mode) || defaults.mode,
    generationHints,
    warnings,
    status: warnings.length > 0 ? 'warning' : 'unreviewed',
  };
}

function normalizeCards(primaryCards, legacyCards, type) {
  const cards = asArray(primaryCards).length > 0 ? primaryCards : legacyCards;
  return asArray(cards).map((card, index) => normalizeCard(card ?? {}, type, index));
}

function p0PromptText(card, type) {
  if (type === 'scene') {
    return firstString(card.prompt, card.details, card.description);
  }
  return firstString(card.details, card.prompt, card.description);
}

function normalizeP0Card(card, type, index) {
  const sourceCard = card && typeof card === 'object' ? card : {};
  const defaults = CARD_DEFAULTS[type];
  const name = cleanString(sourceCard.name);
  const details = p0PromptText(sourceCard, type);
  const sourceEvidence = normalizeEvidence(sourceCard.sourceEvidence);
  const warnings = buildWarnings({ name, details, visualPrompt: details });
  const timeOfDay = type === 'scene'
    ? firstString(sourceCard.timeOfDay, sourceCard.time, sourceCard.period)
    : '';
  const generationHints = normalizeGenerationHints({
    ...(sourceCard.generationHints && typeof sourceCard.generationHints === 'object' ? sourceCard.generationHints : {}),
    timeOfDay,
  }, type);
  const id = firstString(sourceCard.id) || `${defaults.idPrefix}_${String(index + 1).padStart(3, '0')}`;

  return {
    ...sourceCard,
    id,
    type,
    name,
    details,
    tags: compactStrings(sourceCard.tags),
    sourceEvidence,
    ageText: type === 'character' ? firstString(sourceCard.ageText, sourceCard.age, sourceCard.ageRange) : '',
    identityText: type === 'character' ? firstString(sourceCard.identityText, sourceCard.identity, sourceCard.role) : '',
    appearancePrompt: '',
    outfitPrompt: '',
    prompt: details,
    description: details,
    threeViewPrompt: '',
    atmospherePrompt: type === 'scene' ? details : '',
    materialPrompt: type === 'prop' ? details : '',
    timeOfDay,
    visualPrompt: details,
    ratio: firstString(sourceCard.ratio) || defaults.ratio,
    mode: firstString(sourceCard.mode) || defaults.mode,
    generationHints,
    warnings,
    status: warnings.length > 0 ? 'warning' : 'unreviewed',
  };
}

function normalizeP0Cards(cards, type) {
  return asArray(cards).map((card, index) => normalizeP0Card(card, type, index));
}

export function parseDesignSpaceP0Response(raw, options = {}) {
  const parsed = parseModelJson(raw);

  return {
    projectId: options.projectId || parsed.projectId || '',
    projectMeta: normalizeProjectMeta(parsed.projectMeta),
    characters: normalizeP0Cards(parsed.keyCharacters, 'character'),
    scenes: normalizeP0Cards(parsed.sceneAnalysis, 'scene'),
    props: normalizeP0Cards(parsed.keyProps, 'prop'),
  };
}

export function parseDesignSpaceResponse(raw, options = {}) {
  const parsed = parseModelJson(raw);

  return {
    projectId: options.projectId || parsed.projectId || '',
    projectMeta: normalizeProjectMeta(parsed.projectMeta),
    characters: normalizeCards(parsed.characters, parsed.keyCharacters, 'character'),
    scenes: normalizeCards(parsed.scenes, parsed.sceneAnalysis, 'scene'),
    props: normalizeCards(parsed.props, parsed.keyProps, 'prop'),
  };
}
