import {Command, flags} from "@oclif/command"
import {routes as ServerRoutes} from "@blitzjs/server"
import {log, table as Table} from "@blitzjs/display"

export class Routes extends Command {
  static description = "Output Blitz Routes"
  static aliases = ["r"]

  static flags = {
    help: flags.help({char: "h"}),
  }

  getColor(type: string) {
    switch (type) {
      case "rpc":
        return "cyan"
      case "api":
        return "magenta"
      default:
        return "white"
    }
  }

  async run() {
    const config = {
      rootFolder: process.cwd(),
    }
    this.parse(Routes)

    try {
      let spinner = log.spinner(`Populating routes cache`).start()
      const routes: typeof ServerRoutes = require("@blitzjs/server").routes
      const routesResult = await routes(config)
      spinner.stop()
      log.newline()
      const table = new Table({
        columns: [
          {name: "Verb", alignment: "left"},
          {name: "URI", alignment: "left"},
          {name: "Type", alignment: "left"},
        ],
      })
      routesResult.forEach(({uri, verb, type}: any) => {
        table.addRow(
          {Verb: verb.toUpperCase(), URI: uri, Type: type.toUpperCase()},
          {color: this.getColor(type)},
        )
      })
      table.printTable()
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}