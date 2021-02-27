import {AppProps, ErrorComponent, useRouter, AuthenticationError, AuthorizationError} from "blitz"
import {ErrorBoundary, FallbackProps} from "react-error-boundary"
import {QueryClient, QueryClientProvider, useQueryErrorResetBoundary} from "react-query"
import LoginForm from "app/auth/components/LoginForm"

export default function App({Component, pageProps}: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)
  const router = useRouter()
  const {reset} = useQueryErrorResetBoundary()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        suspense: true,
      },
    },
  })

  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
      resetKeys={[router.asPath]}
      onReset={reset}
    >
      <QueryClientProvider client={queryClient}>
        {getLayout(<Component {...pageProps} />)}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

function RootErrorFallback({error, resetErrorBoundary}: FallbackProps) {
  if (error instanceof AuthenticationError) {
    return <LoginForm onSuccess={resetErrorBoundary} />
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={(error as any).statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error?.message || error?.name}
      />
    )
  }
}
