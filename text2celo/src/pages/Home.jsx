import React, { useState } from 'react';
import { BrowserProvider, parseEther } from 'ethers';

function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new BrowserProvider(window.ethereum);
        const signerInstance = await provider.getSigner();
        setSigner(signerInstance);
        alert("Wallet connected!");
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const sendTransaction = async () => {
    if (!signer) {
      alert('Connect wallet first');
      return;
    }
    try {
      const tx = await signer.sendTransaction({
        to: walletAddress,
        value: parseEther(amount),
      });
      await tx.wait();
      alert('Transaction successful!');
    } catch (err) {
      console.error(err);
      alert('Transaction failed!');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Text2Celo</h2>
      <button onClick={connectWallet}>Connect Wallet</button>
      <br /><br />
      <input
        type="text"
        placeholder="Recipient Wallet Address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        style={{ width: 300, padding: 8 }}
      />
      <br /><br />
      <input
        type="text"
        placeholder="Amount (in CELO)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: 300, padding: 8 }}
      />
      <br /><br />
      <button onClick={sendTransaction}>Send</button>
    </div>
  );
}

export default Home;
