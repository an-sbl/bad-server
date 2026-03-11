import * as ReactDOMClient from 'react-dom/client'
import App from './components/app/app'
import './scss/styles.scss'
import { initCsrf } from './services/api/csrf'

const container = document.getElementById('root') as HTMLElement
const root = ReactDOMClient.createRoot(container!)
initCsrf().then(() => {
  root.render(<App />)
})
