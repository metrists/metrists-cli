import * as chalk from 'chalk';
import { readFileSync } from 'fs';
import { platform, release } from 'os';
import osName = require('os-name');
import { join } from 'path';
import { AbstractAction } from './abstract.action';
import { BANNER, MESSAGES } from '../lib/ui';
import { readPackageJsonSync } from '../lib/utils/read-package-json';

interface LockfileDependency {
  version: string;
}

interface PackageJsonDependencies {
  [key: string]: LockfileDependency;
}

type Dependencies = Record<string, string>;

interface PackageJson {
  dependencies: Dependencies;
  devDependencies: Dependencies;
  [key: string]: unknown;
}

interface MetristsDependency {
  name: string;
  value: string;
}

export class InfoAction extends AbstractAction {
  public async handle() {
    this.displayBanner();
    await this.displaySystemInformation();
    await this.displayMetristsInformation();
  }

  private displayBanner() {
    console.info(chalk.green(BANNER));
  }

  private async displaySystemInformation(): Promise<void> {
    console.info(chalk.green('[System Information]'));
    console.info('OS Version     :', chalk.blue(osName(platform(), release())));
    console.info('NodeJS Version :', chalk.blue(process.version));
  }

  async displayMetristsInformation(): Promise<void> {
    this.displayCliVersion();
    console.info(chalk.green('[Metrists Platform Information]'));
    await this.displayMetristsInformationFromPackage();
  }

  async displayMetristsInformationFromPackage(): Promise<void> {
    try {
      const dependencies: PackageJsonDependencies =
        this.readProjectPackageDependencies();
      this.displayMetristsVersions(dependencies);
    } catch (err) {
      console.error(
        chalk.red(MESSAGES.METRISTS_INFORMATION_PACKAGE_MANAGER_FAILED),
      );
    }
  }

  displayCliVersion(): void {
    console.info(chalk.green('[Metrists CLI]'));
    console.info(
      'Metrists CLI Version :',
      chalk.blue(this.getCliPackageJson().version),
      '\n',
    );
  }

  readProjectPackageDependencies(): PackageJsonDependencies {
    const pack = this.getPackageJson();
    const dependencies = { ...pack.dependencies, ...pack.devDependencies };
    const versionDependencies = {} as PackageJsonDependencies;
    Object.keys(dependencies).forEach((key) => {
      versionDependencies[key] = {
        version: dependencies[key],
      };
    });
    return versionDependencies;
  }

  displayMetristsVersions(dependencies: PackageJsonDependencies) {
    this.buildMetristsVersionsMessage(dependencies).forEach((dependency) =>
      console.info(dependency.name, chalk.blue(dependency.value)),
    );
  }

  buildMetristsVersionsMessage(
    dependencies: PackageJsonDependencies,
  ): MetristsDependency[] {
    const metristsDependencies = this.collectMetristsDependencies(dependencies);
    return this.format(metristsDependencies);
  }

  collectMetristsDependencies(
    dependencies: PackageJsonDependencies,
  ): MetristsDependency[] {
    const metristsDependencies: MetristsDependency[] = [];
    Object.keys(dependencies).forEach((key) => {
      if (key.indexOf('@metrists') > -1) {
        const depPackagePath = require.resolve(key + '/package.json', {
          paths: [process.cwd()],
        });
        const depPackage = readFileSync(depPackagePath).toString();
        const value = JSON.parse(depPackage).version;
        metristsDependencies.push({
          name: `${key.replace(/@metrists\//, '').replace(/@.*/, '')} version`,
          value: value || dependencies[key].version,
        });
      }
    });
    return metristsDependencies;
  }

  format(dependencies: MetristsDependency[]): MetristsDependency[] {
    if (!dependencies?.length) {
      return [];
    }
    const sorted = dependencies.sort(
      (dependencyA, dependencyB) =>
        dependencyB.name.length - dependencyA.name.length,
    );
    const length = sorted[0].name.length;
    sorted.forEach((dependency) => {
      if (dependency.name.length < length) {
        dependency.name = this.rightPad(dependency.name, length);
      }
      dependency.name = dependency.name.concat(' :');
      dependency.value = dependency.value.replace(/(\^|\~)/, '');
    });
    return sorted;
  }

  rightPad(name: string, length: number): string {
    while (name.length < length) {
      name = name.concat(' ');
    }
    return name;
  }

  getPackageJson(): PackageJson {
    return readPackageJsonSync() as PackageJson;
  }

  getCliPackageJson(): PackageJson {
    return JSON.parse(
      readFileSync(join(__dirname, '../../package.json'), 'utf8'),
    );
  }
}
