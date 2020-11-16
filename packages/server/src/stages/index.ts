import {createStageConfig} from "./config"
import {createStageManifest} from "./manifest"
import {createStagePages} from "./pages"
import {createStageRelative} from "./relative"
import {createStageRoutes} from "./routes"
import {createStageRpc} from "./rpc"

type StagesConfig = {writeManifestFile: boolean; isTypescript: boolean}

// These create pipeline stages that are run as the business rules for Blitz
// Read this folders README for more information
export const configureStages = (config: StagesConfig) => [
  // Order is important
  createStageRelative,
  createStagePages,
  createStageRpc(config.isTypescript),
  createStageConfig,
  createStageManifest(config.writeManifestFile),
]

export const configureRouteStages = (config: StagesConfig) => [
  // createStageRelative,
  createStagePages,
  createStageRpc(config.isTypescript),
  createStageRoutes,
  // createStageSitemap,
]
