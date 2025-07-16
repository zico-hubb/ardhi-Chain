'use client';

import React, { useState, useEffect } from 'react';
import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  isAddress
} from 'ethers';
import contractABI from '../../utils/contractABI.json';

const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function Admin() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [landInputs, setLandInputs] = useState({
    to: '',
    metadataURI: '',
    titleId: '',
    location: '',
    size: '',
  });
  const [mintedLands, setMintedLands] = useState([]);

  const infuraProvider = new JsonRpcProvider(
    `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
  );

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
            await fetchAllLands();
          }
        } catch (err) {
          console.error('Wallet check failed:', err);
        }
      }
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert('🛑 MetaMask not detected');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) return alert('❌ No wallet connected');
      setCurrentAccount(accounts[0]);
      await fetchAllLands();
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('❌ Failed to connect wallet. See console.');
    }
  };

  const handleChange = (e) => {
    setLandInputs({ ...landInputs, [e.target.name]: e.target.value });
  };

  const mintLand = async () => {
    const { to, metadataURI, titleId, location, size } = landInputs;

    if (!currentAccount) return alert('🔌 Connect your wallet first');
    if (!isAddress(to)) return alert('❌ Invalid wallet address');
    if (!metadataURI || !titleId || !location || !size)
      return alert('❌ Fill all fields');

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

      console.log('📤 Sending transaction...');
      const tx = await contract.mintLand(to, metadataURI, titleId, location, size);
      await tx.wait();

      console.log('✅ Minted:', tx.hash);
      alert('✅ Land NFT minted!');
      await fetchAllLands();
    } catch (error) {
      console.error('❌ Mint failed:', error);
      if (error?.reason) {
        alert(`⚠️ Contract error: ${error.reason}`);
      } else if (error?.code === 'INVALID_ARGUMENT') {
        alert('🛑 Invalid input to contract.');
      } else if (error?.message?.includes('execution reverted')) {
        alert('⛔ Transaction reverted by contract.');
      } else {
        alert('❌ Unknown error occurred. Check console.');
      }
    }
  };

  const fetchAllLands = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

      const total = await contract.nextTokenId();
      const allLands = [];

      for (let tokenId = 0; tokenId < Number(total); tokenId++) {
        try {
          const land = await contract.getLandDetails(tokenId);
          allLands.push({
            tokenId: tokenId.toString(),
            titleId: land[0],
            location: land[1],
            size: land[2],
            metadataURI: land[3],
            to: land[4],
          });
        } catch (err) {
          console.warn(`⚠️ Could not fetch tokenId ${tokenId}:`, err);
        }
      }

      setMintedLands(allLands);
    } catch (error) {
      console.error('❌ Failed to fetch lands:', error);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>SmartLands Admin Panel</h1>
        <button className="connect-btn" onClick={connectWallet}>
          {currentAccount
            ? `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`
            : 'Connect Wallet'}
        </button>
      </header>

      <section className="mint-form">
        <h2>Mint New Land NFT</h2>
        <input name="to" placeholder="Owner Wallet Address" onChange={handleChange} />
        <input name="metadataURI" placeholder="Token URI (IPFS link)" onChange={handleChange} />
        <input name="titleId" placeholder="Title ID" onChange={handleChange} />
        <input name="location" placeholder="Location" onChange={handleChange} />
        <input name="size" placeholder="Size (e.g. 50x100)" onChange={handleChange} />
        <button className="mint-btn" onClick={mintLand}>Mint Land</button>
      </section>

      <section className="minted-table">
        <h2>Minted Lands</h2>
        {mintedLands.length === 0 ? (
          <p>No lands minted yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Token ID</th>
                <th>Title ID</th>
                <th>Location</th>
                <th>Size</th>
                <th>Token URI</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {mintedLands.map((land, index) => (
                <tr key={index}>
                  <td>{land.tokenId}</td>
                  <td>{land.titleId}</td>
                  <td>{land.location}</td>
                  <td>{land.size}</td>
                  <td>
                    <a href={land.metadataURI} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </td>
                  <td>{land.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
