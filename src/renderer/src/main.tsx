import './assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReusableProvider } from 'reusable'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import App from './containers/App'

const routing = (
  <Router>
    <Routes>
      { /*<Route path="/" element={<App />} /> */} // This is the original line
      <Route path="*" element={<App />} />
    </Routes>
  </Router>
)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <ReusableProvider>
    <React.StrictMode>{routing}</React.StrictMode>
  </ReusableProvider>
)
