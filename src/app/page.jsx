'use client';

import Head from 'next/head';
import { useRouter } from 'next/navigation'; // For Next.js App Router

export default function HomePage() {
  const router = useRouter();

  const handleLandownerClick = () => {
    router.push('/landowner');
  };

  const handleAdminClick = () => {
    router.push('/admin'); // Update to match your admin route if different
  };

  return (
    <>
      <Head>
        <title>ArdhiChain</title>
      </Head>

      <div className="container">
        <header className="header">
          <img src="/images/logo.png" alt="ArdhiChain Logo" className="logo" />
          <div className="walletInfo">Wallet: 0x123...456</div>
        </header>

        <main className="main">
          <h1 className="title">ArdhiChain</h1>
          <p className="description">
            ArdhiChain is a blockchain-powered land registry system enabling secure, transparent,
            and verifiable land ownership through NFTs. It empowers landowners and provides
            seamless oversight for administrators. Built for trust, built on-chain.
          </p>

          <div className="buttonGroup">
            <button className="btn landownerBtn" onClick={handleLandownerClick}>
              Landowner Dashboard
            </button>
            <button className="btn adminBtn" onClick={handleAdminClick}>
              Admin Panel
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
