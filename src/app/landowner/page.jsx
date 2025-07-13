'use client';

import { useEffect, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import contractABI from '../../utils/contractABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function LandownerPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [landNFTs, setLandNFTs] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
  };

  const fetchLandNFTs = async () => {
    if (!walletAddress) return;
    setLoading(true);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

      const total = await contract.nextTokenId();
      const ownedNFTs = [];

      for (let tokenId = 0; tokenId < Number(total); tokenId++) {
        try {
          const owner = await contract.ownerOf(tokenId);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            const land = await contract.getLandDetails(tokenId);

            ownedNFTs.push({
              tokenId: tokenId.toString(),
              titleId: land[0],
              location: land[1],
              size: land[2],
              uri: land[3],
              image: await fetchImageFromMetadata(land[3]),
              owner: land[4],
            });
          }
        } catch (err) {
          // Skip if token doesn't exist or fails
          continue;
        }
      }

      setLandNFTs(ownedNFTs);
    } catch (error) {
      console.error("Error fetching land NFTs:", error);
      alert("⚠️ Could not fetch NFTs. See console for details.");
    }

    setLoading(false);
  };

  const fetchImageFromMetadata = async (uri) => {
    try {
      const response = await fetch(uri);
      const data = await response.json();
      return data.image;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (walletAddress) fetchLandNFTs();
  }, [walletAddress]);

  return (
    <div className="container">
      <header className="header">
        <img src="/images/logo.png" alt="ArdhiChain Logo" className="logo" />
        <h1>Landowner Dashboard</h1>
        {!walletAddress ? (
          <button className="btn connectBtn" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <p className="walletInfo">Wallet: {walletAddress}</p>
        )}
      </header>

      <main className="main">
        <h2>Your Owned Land NFTs</h2>
        <button className="btn refreshBtn" onClick={fetchLandNFTs}>Refresh</button>

        {loading ? (
          <p>Loading land records...</p>
        ) : landNFTs.length === 0 ? (
          <p>You don't own any land NFTs yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Token ID</th>
                <th>Title ID</th>
                <th>Location</th>
                <th>Size</th>
                <th>Token URI</th>
                <th>Title Deed</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {landNFTs.map((land, index) => (
                <tr key={index}>
                  <td>{land.tokenId}</td>
                  <td>{land.titleId}</td>
                  <td>{land.location}</td>
                  <td>{land.size}</td>
                  <td>
                    <a href={land.uri} target="_blank" rel="nore_
