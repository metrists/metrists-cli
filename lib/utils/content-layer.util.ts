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

export function getArbitraryChapter(
  fileName: string,
  index: number,
): ChapterDocument {
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
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const year = now.getFullYear();
  return `${year}-${month.toString().length > 1 ? month : '0' + month}-${
    date.toString().length > 1 ? date : '0' + date
  }`;
}

function getSanitizedTitle(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
