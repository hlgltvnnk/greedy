import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App.tsx';
import Modals from './modals/ModalsProvider.tsx';
import { SolanaWalletProvider } from './services/SolanaWalletProvider.tsx';

import { Buffer } from 'buffer';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!window.Buffer) window.Buffer = Buffer;

import 'react-toastify/dist/ReactToastify.css';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolanaWalletProvider>
      <BrowserRouter>
        <App />
        <Modals />
      </BrowserRouter>
      <ToastContainer position="top-right" theme="dark" />
    </SolanaWalletProvider>
  </StrictMode>,
);
