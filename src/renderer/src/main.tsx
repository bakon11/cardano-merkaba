import './assets/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReusableProvider } from 'reusable';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import App from './containers/App';
import Wallet from './containers/Wallet';
import Minter from './containers/Minter';
import Gravity from './containers/Gravity';
import AiAgentMain from './containers/Ai_Agent';
import Cbor_tools from './containers/Cbor_tools';
import StakingPools from './containers/StakingPools';
import NodeTools from "./containers/NodeTools";

const routing = (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/minter" element={<Minter />} />
      <Route path="/gravity" element={<Gravity />} />
      <Route path="/AiAgentMain" element={<AiAgentMain />} />
      <Route path="/Cbor_tools" element={<Cbor_tools />} />
      <Route path="/StakingPools" element={<StakingPools />} />
      <Route path="/NodeTools" element={<NodeTools />} />
      <Route path="*" element={<App />} /> {/* Catch-all route */}
    </Routes>
  </Router>
)


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <ReusableProvider>
    <React.StrictMode>{routing}</React.StrictMode>
  </ReusableProvider>
)
