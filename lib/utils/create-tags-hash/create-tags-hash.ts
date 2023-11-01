import { readFile } from 'fs/promises';
import csv = require('csv-parser');

export const createTagsHash = async (filePath: string) => {
  const rawTagMaps = JSON.parse(await readFile(filePath, 'utf-8')) as {
    primary: string;
    secondary: string;
  }[];

  return rawTagMaps
    .filter((item) => item.primary && item.secondary)
    .reduce((acc, current) => {
      acc[current.primary.trim().toLowerCase()] = current.secondary
        .split(',')
        .map((item) => item.trim().toLowerCase());

      return acc;
    }, {} as Record<string, string[]>);
};
