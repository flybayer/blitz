import {createRuleRelative} from './relative'
import {createRulePages} from './pages'
import {createRuleRpc} from './rpc'
import {createRuleConfig} from './config'
import {createRuleManifest} from './manifest'

export const rules = [
  // Order is important
  createRuleRelative,
  createRulePages,
  createRuleRpc,
  createRuleConfig,
  createRuleManifest,
]
