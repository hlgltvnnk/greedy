import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';

export const useRedirectIfNotConnected = (redirectTo: string = '/') => {
  const { connected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) {
      navigate(redirectTo);
    }
  }, [connected, navigate, redirectTo]);
};
