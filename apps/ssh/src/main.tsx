import App from './App'
import { createApp } from '@aet-dv/wrapper'

createApp({
  app: <App />,
  appendToId: 'actionButtonBlock',
  requireChildId: process.env.NODE_ENV !== 'development' ? 'editDataSet' : undefined,
})