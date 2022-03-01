const {
  parse: parseRoute,
  match: matchRoute,
} = require('matchit')
const { getRoutes } = require('fastify-vite/app')
const { appState, useIsomorphic, usePayloadPath } = require('./app')
const {
  kRoutes,
  kFirstRender,
  kStaticPayload,
  kFuncValue,
  kFuncExecuted,
} = require('./symbols.js')

function hydrateRoutes (globImports) {
  const routes = window[kRoutes]
  delete window[kRoutes]
  for (const route of routes) {
    route.component = memoized(globImports[route.componentPath])
  }
  return routes
}

function createBeforeEachHandler (resolvedRoutes) {
  const {
    map: routeMap,
    parsed: parsedRoutes,
  } = makeRouteLookups(resolvedRoutes)
  return async (to) => {
    const ctx = useIsomorphic({ params: to.params })
    const {
      hasPayload,
      hasData,
      component,
    } = getRouteMeta(to, routeMap, parsedRoutes)
    if (!component) {
      return false
    }
    if (!!window[kStaticPayload] && hasPayload) {
      try {
        const response = await window.fetch(usePayloadPath(to))
        ctx.$payload = await response.json()
      } catch (error) {
        ctx.$errors.getPayload = error
      }
    } else if (!appState[kFirstRender] && (hasPayload || hasData)) {
      if (hasPayload) {
        try {
          const response = await window.fetch(usePayloadPath(to))
          ctx.$payload = await response.json()
        } catch (error) {
          ctx.$errors.getPayload = error
        }
      }
      if (hasData) {
        const { getData } = await component()
        try {
          ctx.$data = await getData(ctx)
        } catch (error) {
          ctx.$errors.getData = error
        }
      }
    }
  }
}

module.exports = {
  getRoutes,
  hydrateRoutes,
  createBeforeEachHandler,
  usePayloadPath,
}

function getRouteMeta (route, map, parsed) {
  const match = matchRoute(route.path, parsed)
  return (match.length > 0 && map[match[0].old]) || {}
}

function makeRouteLookups (resolvedRoutes) {
  const map = {}
  const parsed = []
  for (const route of resolvedRoutes) {
    map[route.path] = route
    parsed.push(parseRoute(route.path))
  }
  return { map, parsed }
}

function memoized (func) {
  func[kFuncExecuted] = false
  return async function () {
    if (!func[kFuncExecuted]) {
      func[kFuncValue] = await func()
      func[kFuncExecuted] = true
    }
    return func[kFuncValue]
  }
}
