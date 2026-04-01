import App from './App'
import { createApp } from '@aet-dv/wrapper'

createApp({
  app: <App />,
  appendToId: '#datasetForm #actionButtonBlock',
  requireChildId: process.env.NODE_ENV !== 'development' ? 'editDataSet' : undefined,
})