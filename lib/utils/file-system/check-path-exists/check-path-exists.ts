import { PathLike, stat } from 'fs';

export const checkPathExists = (path: PathLike) =>
  new Promise((resolve, reject) => {
    stat(path, function (err, stat) {
      if (err == null) {
        resolve(true);
      } else if (err.code === 'ENOENT') {
        resolve(false);
      } else {
        reject(err);
      }
    });
  });
