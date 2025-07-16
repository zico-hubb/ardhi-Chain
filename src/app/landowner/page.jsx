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
    if (!window.ethereum) {
      alert('🦊 Please install MetaMask to use this feature.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } catch {
      alert('⚠️ Wallet connection failed.');
    }
  };

  const fetchLandNFTs = async () => {
    if (!walletAddress || !CONTRACT_ADDRESS) {
      console.warn('Missing wallet or contract address.');
      return;
    }

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
          if (owner.toLowerCase() !== walletAddress.toLowerCase()) continue;

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
        } catch {
          continue;
        }
      }

      setLandNFTs(ownedNFTs);
    } catch (err) {
      console.error('🛑 Failed to fetch NFTs:', err);
      alert('Could not load NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchImageFromMetadata = async (uri) => {
    try {
      const res = await fetch(uri);
      const data = await res.json();
      return data.image;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (walletAddress) fetchLandNFTs();
  }, [walletAddress]);

  return (
    <div className="container">
      <header className="header">
        <img src="/images/logo.jpeg" alt="ArdhiChain Logo" className="logo" />
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
                    <a href={land.uri} target="_blank" rel="noreferrer">View</a>
                  </td>
                  <td>
                    {land.image ? (
                      <img src={land.image} alt="Deed" className="nftImage" />
                    ) : 'N/A'}
                  </td>
                  <td>{land.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
