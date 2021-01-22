import {spawn} from "cross-spawn"
import * as fs from "fs-extra"
import {Box, Text} from "ink"
import Spinner from "ink-spinner"
import * as path from "path"
import * as React from "react"
import {Newline} from "../components/newline"
import {useEnterToContinue} from "../utils/use-enter-to-continue"
import {Executor, executorArgument, ExecutorConfig, getExecutorArgument} from "./executor"

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

export function isAddDependencyExecutor(executor: ExecutorConfig): executor is Config {
  return (executor as Config).packages !== undefined
}

export const type = "add-dependency"

function Package({pkg, loading}: {pkg: NpmPackage; loading: boolean}) {
  return (
    <Text>
      {`   `}
      {loading ? <Spinner /> : "📦"}
      {` ${pkg.name}@${pkg.version}`}
    </Text>
  )
}

const DependencyList = ({
  lede,
  depsLoading = false,
  devDepsLoading = false,
  packages,
}: {
  lede: string
  depsLoading?: boolean
  devDepsLoading?: boolean
  packages: NpmPackage[]
}) => {
  return (
    <Box flexDirection="column">
      <Text>{lede}</Text>
      <Newline />
      <Text>Dependencies to be installed:</Text>
      {packages
        .filter((p) => !p.isDevDep)
        .map((pkg) => (
          <Package key={pkg.name} pkg={pkg} loading={depsLoading} />
        ))}
      <Newline />
      <Text>Dev Dependencies to be installed:</Text>
      {packages
        .filter((p) => p.isDevDep)
        .map((pkg) => (
          <Package key={pkg.name} pkg={pkg} loading={devDepsLoading} />
        ))}
    </Box>
  )
}

/**
 * Exported for unit testing purposes
 */
export function getPackageManager() {
  if (fs.existsSync(path.resolve("package-lock.json"))) {
    return "npm"
  }
  return "yarn"
}

/**
 * Exported for unit testing purposes
 */
export async function installPackages(packages: NpmPackage[], isDev = false) {
  const packageManager = getPackageManager()
  const args: string[] = ["add"]

  if (isDev) {
    args.push(packageManager === "yarn" ? "-D" : "--save-dev")
  }
  packages.forEach((pkg) => {
    pkg.version ? args.push(`${pkg.name}@${pkg.version}`) : args.push(pkg.name)
  })
  await new Promise((resolve) => {
    const cp = spawn(packageManager, args, {
      stdio: ["inherit", "pipe", "pipe"],
    })
    cp.on("exit", resolve)
  })
}

export const Commit: Executor["Commit"] = ({cliArgs, step, onChangeCommitted}) => {
  const [depsInstalled, setDepsInstalled] = React.useState(false)
  const [devDepsInstalled, setDevDepsInstalled] = React.useState(false)

  const handleChangeCommitted = React.useCallback(() => {
    const packages = (step as Config).packages
    const dependencies = packages.length === 1 ? "dependency" : "dependencies"
    onChangeCommitted(`Installed ${packages.length} ${dependencies}`)
  }, [onChangeCommitted, step])

  useEnterToContinue(handleChangeCommitted, depsInstalled && devDepsInstalled)

  React.useEffect(() => {
    async function installDeps() {
      const packagesToInstall = getExecutorArgument((step as Config).packages, cliArgs).filter(
        (p) => !p.isDevDep,
      )
      await installPackages(packagesToInstall)
      setDepsInstalled(true)
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    installDeps()
  }, [cliArgs, step])

  React.useEffect(() => {
    if (!depsInstalled) return
    async function installDevDeps() {
      const packagesToInstall = getExecutorArgument((step as Config).packages, cliArgs).filter(
        (p) => p.isDevDep,
      )
      await installPackages(packagesToInstall, true)
      setDevDepsInstalled(true)
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    installDevDeps()
  }, [cliArgs, depsInstalled, step])

  React.useEffect(() => {
    if (depsInstalled && devDepsInstalled) {
      onChangeCommitted()
    }
  }, [depsInstalled, devDepsInstalled, onChangeCommitted])

  if (!isAddDependencyExecutor(step)) {
    onChangeCommitted()
    return null
  }
  return (
    <>
      <DependencyList
        lede={"Hang tight! Installing dependencies..."}
        depsLoading={!depsInstalled}
        devDepsLoading={!devDepsInstalled}
        packages={getExecutorArgument(step.packages, cliArgs)}
      />
    </>
  )
}
