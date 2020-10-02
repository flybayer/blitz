import {
  Middleware,
  BlitzApiRequest,
  BlitzApiResponse,
  EnhancedResolver,
  AuthenticationError,
  AuthorizationError,
} from "@blitzjs/core"
import {serializeError} from "serialize-error"
import {serialize, deserialize} from "superjson"
import {Logger} from "tslog"
import chalk from "chalk"
import prettyMs from "pretty-ms"

const baseLogger = new Logger({
  dateTimePattern:
    process.env.NODE_ENV === "production"
      ? "year-month-day hour:minute:second.millisecond"
      : "hour:minute:second.millisecond",
  displayFunctionName: false,
  displayFilePath: "hidden",
  displayRequestId: false,
  dateTimeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  prettyInspectHighlightStyles: {name: "black"},
  maskValuesOfKeys: ["password", "passwordConfirmation"],
})

const printNewLine = () => console.log("")

const rpcMiddleware = <TInput, TResult>(
  resolver: EnhancedResolver<TInput, TResult>,
  connectDb?: () => any,
): Middleware => {
  return async (req, res, next) => {
    const log = baseLogger.getChildLogger({prefix: [resolver._meta.name + "()"]})

    if (req.method === "HEAD") {
      // Warm the lamda and connect to DB
      if (typeof connectDb === "function") {
        connectDb()
      }
      res.status(200).end()
      return next()
    } else if (req.method === "POST") {
      // Handle RPC call

      if (typeof req.body.params === "undefined") {
        const error = {message: "Request body is missing the `params` key"}
        log.error(error.message)
        res.status(400).json({
          result: null,
          error,
        })
        return next()
      }

      try {
        const data = (req.body.params === undefined
          ? undefined
          : deserialize({json: req.body.params, meta: req.body.meta?.params})) as TInput

        log.info(chalk.dim("Starting with input:"), data)
        const startTime = new Date().getTime()

        const result = await resolver(data, res.blitzCtx)

        const duration = prettyMs(new Date().getTime() - startTime)
        log.info(chalk.dim("Finished", "in", duration))
        printNewLine()

        res.blitzResult = result

        const serializedResult = serialize(result as any)

        res.json({
          result: serializedResult.json,
          error: null,
          meta: {
            result: serializedResult.meta,
          },
        })
        return next()
      } catch (error) {
        log.error(error)

        if (error! instanceof AuthenticationError && error! instanceof AuthorizationError) {
          // console.error(error)
        }
        printNewLine()

        res.json({
          result: null,
          error: serializeError(error),
        })
        return next()
      }
    } else {
      // Everything else is error
      log.error("Not Found\n")
      res.status(404).end()
      return next()
    }
  }
}

export function rpcApiHandler<TInput, TResult>(
  resolver: EnhancedResolver<TInput, TResult>,
  middleware: Middleware[] = [],
  connectDb?: () => any,
) {
  // RPC Middleware is always the last middleware to run
  middleware.push(rpcMiddleware(resolver, connectDb))

  return (req: BlitzApiRequest, res: BlitzApiResponse) => {
    return require("@blitzjs/core").handleRequestWithMiddleware(req, res, middleware)
  }
}
