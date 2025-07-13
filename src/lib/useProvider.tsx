// src/lib/useProvider.tsx

'use client'

import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';

declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }
}

export function getProvider() {
  if (!window.ethereum) {
    throw new Error("❌ MetaMask not found");
  }
  return new ethers.BrowserProvider(window.ethereum);
}
