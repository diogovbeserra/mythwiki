
import fs from 'fs/promises';
import path from 'path';

export interface LuaItemDescription {
  unidentifiedDisplayName?: string;
  unidentifiedResourceName?: string;
  unidentifiedDescriptionName?: string[];
  identifiedDisplayName?: string;
  identifiedResourceName?: string;
  identifiedDescriptionName?: string[];
  slotCount?: number;
  ClassNum?: number;
  costume?: boolean;
}

function parseTableContent(tableContent: string): Record<number, LuaItemDescription> {
  const items: Record<number, LuaItemDescription> = {};
  
  // Find all [number] = { patterns and extract their content
  const lines = tableContent.split('\n');
  let currentItemId: number | null = null;
  let currentItemStart = -1;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for item start: [number] = {
    const itemMatch = line.match(/\[(\d+)\]\s*=\s*\{/);
    if (itemMatch && braceCount === 0) {
      // If we have a previous item, process it first
      if (currentItemId !== null && currentItemStart !== -1) {
        const itemLines = lines.slice(currentItemStart, i);
        const itemContent = itemLines.join('\n');
        const parsedItem = parseItemContent(itemContent);
        if (parsedItem && Object.keys(parsedItem).length > 0) {
          items[currentItemId] = parsedItem;
        }
      }
      
      // Start new item
      currentItemId = parseInt(itemMatch[1]);
      currentItemStart = i;
      braceCount = 1;
      continue;
    }
    
    // Track brace count if we're inside an item
    if (currentItemId !== null) {
      for (const char of line) {
        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
      }
      
      // If braces are balanced, we've reached the end of this item
      if (braceCount === 0) {
        const itemLines = lines.slice(currentItemStart, i + 1);
        const itemContent = itemLines.join('\n');
        const parsedItem = parseItemContent(itemContent);
        if (parsedItem && Object.keys(parsedItem).length > 0) {
          items[currentItemId] = parsedItem;
        }
        
        currentItemId = null;
        currentItemStart = -1;
      }
    }
  }
  
  return items;
}

function parseItemContent(itemContent: string): LuaItemDescription | null {
  const item: LuaItemDescription = {};
  
  // Extract string properties
  const extractString = (prop: string) => {
    const regex = new RegExp(`${prop}\\s*=\\s*"([^"]*)"`, 'i');
    const match = itemContent.match(regex);
    return match ? match[1] : undefined;
  };
  
  // Extract number properties
  const extractNumber = (prop: string) => {
    const regex = new RegExp(`${prop}\\s*=\\s*(\\d+)`, 'i');
    const match = itemContent.match(regex);
    return match ? parseInt(match[1]) : undefined;
  };
  
  // Extract boolean properties
  const extractBoolean = (prop: string) => {
    const regex = new RegExp(`${prop}\\s*=\\s*(true|false)`, 'i');
    const match = itemContent.match(regex);
    return match ? match[1] === 'true' : undefined;
  };
  
  // Extract array properties (descriptions)
  const extractArray = (prop: string) => {
    // Look for property = { ... }
    // Use \b to ensure we match the exact property name, not a substring
    const propPattern = new RegExp(`\\b${prop}\\s*=\\s*\\{`, 'i');
    const propMatch = itemContent.match(propPattern);
    if (!propMatch || propMatch.index === undefined) return undefined;
    
    const propStart = propMatch.index;
    const arrayStart = propStart + propMatch[0].length - 1; // Position of opening {
    
    // Find the matching closing brace
    let braceCount = 1;
    let pos = arrayStart + 1;
    let arrayEnd = -1;
    
    while (pos < itemContent.length && braceCount > 0) {
      if (itemContent[pos] === '{') braceCount++;
      else if (itemContent[pos] === '}') braceCount--;
      
      if (braceCount === 0) {
        arrayEnd = pos;
        break;
      }
      pos++;
    }
    
    if (arrayEnd === -1) return undefined;
    
    const arrayContent = itemContent.substring(arrayStart + 1, arrayEnd);
    const items = [];
    const itemRegex = /"([^"]*)"/g;
    let itemMatch;
    
    while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
      items.push(itemMatch[1]);
    }
    
    return items.length > 0 ? items : undefined;
  };

  item.unidentifiedDisplayName = extractString('unidentifiedDisplayName');
  item.unidentifiedResourceName = extractString('unidentifiedResourceName');
  item.unidentifiedDescriptionName = extractArray('unidentifiedDescriptionName');
  item.identifiedDisplayName = extractString('identifiedDisplayName');
  item.identifiedResourceName = extractString('identifiedResourceName');
  item.identifiedDescriptionName = extractArray('identifiedDescriptionName');
  item.slotCount = extractNumber('slotCount');
  item.ClassNum = extractNumber('ClassNum');
  item.costume = extractBoolean('costume');
  
  return item;
}

export async function parseLuaItemInfo(filePath: string): Promise<Record<number, LuaItemDescription>> {
  try {
    const fileContent = await fs.readFile(filePath, 'latin1'); // Use latin1 to handle encoded characters
    
    // Find start of tbl and get everything after
    const tblStart = fileContent.indexOf('tbl = {');
    if (tblStart === -1) {
      throw new Error('Could not find tbl table in Lua file');
    }
    
    // Extract from the opening brace to the end, then find the matching closing brace
    const afterTbl = fileContent.substring(tblStart + 7); // Skip 'tbl = {'
    const lastBraceIndex = afterTbl.lastIndexOf('}');
    if (lastBraceIndex === -1) {
      throw new Error('Could not find closing brace for tbl table');
    }
    
    const tableContent = afterTbl.substring(0, lastBraceIndex);
    return parseTableContent(tableContent);
  } catch (error) {
    console.error('Error parsing Lua file:', error);
    // Return empty object instead of throwing to allow partial data loading
    return {};
  }
}

export async function parseLuaItemFile() {
  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'itemInfo_Myth_of_Yggdrasil.lua');
  
  return await parseLuaItemInfo(filePath);
}
