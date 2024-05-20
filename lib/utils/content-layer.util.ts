import { userInfo } from 'os';

export interface ChapterDocument {
  title: string;
  index: number;
  author?: string;
  date?: string;
  updated?: string;
}

export interface MetaDocument {
  title: string;
  author: string;
  date?: string;
  tags?: string[];
}

export function getArbitraryMeta(directoryName: string): MetaDocument {
  return {
    title: getSanitizedTitle(directoryName),
    author: getCurrentUsername(),
    date: getCurrentDate(),
    tags: [],
  };
}

export function getArbitraryChapter(fileName: string, index: number): ChapterDocument {
  return {
    title: getSanitizedTitle(fileName),
    index,
    author: getCurrentUsername(),
    date: getCurrentDate(),
    updated: getCurrentDate(),
  };
}

function getCurrentUsername() {
  return userInfo().username;
}

function getCurrentDate() {
  return new Date().toISOString();
}

function getSanitizedTitle(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
