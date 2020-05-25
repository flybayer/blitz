import {ExecutorConfig, executorArgument, getExecutorArgument} from './executor'
import * as fs from 'fs-extra'
import * as path from 'path'
import spawn from 'cross-spawn'
import {log} from '@blitzjs/display'

interface NpmPackage {
  name: string
  // defaults to latest published
  version?: string
  // defaults to false
  isDevDep?: boolean
}

export interface Config extends ExecutorConfig {
  packages: executorArgument<NpmPackage[]>
}

export const type = 'add-dependency'

export const Propose = () => null
export const Commit = () => null

export function isAddDependencyExecutor(executor: ExecutorConfig): executor is Config {
  return (executor as Config).packages !== undefined
}

async function getPackageManager(): Promise<'yarn' | 'npm'> {
  if (fs.existsSync(path.resolve('package-lock.json'))) {
    return 'npm'
  }
  return 'yarn'
}

export async function addDependencyExecutor(executor: Config, cliArgs: any): Promise<void> {
  const packageManager = await getPackageManager()
  const packagesToInstall = getExecutorArgument(executor.packages, cliArgs)
  for (const pkg of packagesToInstall) {
    const args: string[] = ['add']
    // if devDep flag isn't specified we install as a regular dependency, so
    // we need to explicitly check for `true`
    if (pkg.isDevDep === true) {
      args.push(packageManager === 'yarn' ? '-D' : '--save-dev')
    }
    pkg.version ? args.push(`${pkg.name}@${pkg.version}`) : args.push(pkg.name)
    log.meta(`Installing ${pkg.name} ${pkg.isDevDep !== false ? 'as a dev dependency' : ''}`)
    spawn.sync(packageManager, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
    })
  }
  log.progress(`${packagesToInstall.length} packages installed successfully`)
}
