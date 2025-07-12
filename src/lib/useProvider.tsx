import { ethers } from "ethers";

declare global {
    interface Window {
        ethereum?: any;
    }
}

export function getProvider() {
    if (!window.ethereum) throw new Error("Metamask not found");
    return new ethers.BrowserProvider(window.ethereum);
}