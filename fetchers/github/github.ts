import axios, { AxiosInstance } from 'axios';
import type { LanguageDictionary } from '../../interfaces/phrase.interface';

type CipherTree = {
  [key: string]: CipherTree | any;
};

interface GithubRepository {
  org: string;
  repo: string;
  baseUrl?: string;
  token?: string;
}

const getAxiosClient = ({ baseUrl, org, repo, token }: GithubRepository) => {
  return axios.create({
    baseURL: `${baseUrl}/repos/${org}/${repo}`,
    ...(token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {}),
  });
};

const removeFileExtension = (fileName: string) => {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot > -1 ? fileName.slice(0, lastDot) : fileName;
};

const cipherRepository = async (repositoryClient: AxiosInstance, path = '') => {
  const basePath = '/contents';
  const cipherTree: CipherTree = {};

  const { data: repository } = await repositoryClient.get(
    `${basePath}/${path}`,
  );

  for (const item of repository) {
    if (item.type === 'dir') {
      cipherTree[item.name] = await cipherRepository(
        repositoryClient,
        `${item.path}`,
      );
    } else if (item.type === 'file' && item.name.endsWith('.json')) {
      const { data: fileContent } = await axios.get(item.download_url, {
        responseType: 'text',
      });
      const nameWithoutExtension = removeFileExtension(item.name);
      cipherTree[nameWithoutExtension] = JSON.parse(fileContent);
    }
  }

  return cipherTree;
};

export const github = async ({
  baseUrl = 'https://api.github.com',
  ...rest
}: GithubRepository): Promise<LanguageDictionary | never> => {
  try {
    const axiosClient = getAxiosClient({ baseUrl, ...rest });

    return await cipherRepository(axiosClient);
  } catch (e) {
    throw e;
  }
};
