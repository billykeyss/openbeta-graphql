import { ApolloServer } from 'apollo-server'
import mongoose from 'mongoose'
import { applyMiddleware } from 'graphql-middleware'
import { graphqlSchema } from './graphql/resolvers.js'

import { connectDB, defaultPostConnect } from './db/index.js'
import { createInstance as createNewAreaDS } from './model/MutableAreaDataSource.js'
import { changelogDataSource } from './model/ChangeLogDataSource.js'
import MutableMediaDataSource from './model/MutableMediaDataSource.js'
import { createInstance as createNewClimbDS } from './model/MutableClimbDataSource.js'
import TickDataSource from './model/TickDataSource.js'
import { createContext, permissions } from './auth/index.js'
import { logger } from './logger.js'
import XMediaDataSource from './model/XMediaDataSource.js'
import PostDataSource from './model/PostDataSource.js'

// eslint-disable-next-line
;(async function (): Promise<void> {
  const schema = applyMiddleware(
    graphqlSchema,
    permissions.generate(graphqlSchema)
  )
  const server = new ApolloServer({
    introspection: true,
    schema,
    context: createContext,
    dataSources: () => ({
      climbs: createNewClimbDS(),
      areas: createNewAreaDS(),
      ticks: new TickDataSource(mongoose.connection.db.collection('ticks')),
      history: changelogDataSource, // see source for explantion why we don't instantiate the object
      media: new MutableMediaDataSource(
        mongoose.connection.db.collection('media')
      ),
      xmedia: new XMediaDataSource(mongoose.connection.db.collection('xmedia')),
      post: new PostDataSource(mongoose.connection.db.collection('post'))
    }),
    cache: 'bounded'
  })

  await connectDB(defaultPostConnect)

  const port = 4000

  await server
    .listen({
      port
    })
    .then((): void => {
      logger.info(`🚀 Server ready at http://localhost:${port}`)
    })
})()
