import * as React from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;



export default function App() {
  const inputRef = React.useRef(null);
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [count, setCount] = React.useState(0);
  const [allWaves, setAllWaves] = React.useState([]);
  

  let number = 0;
  const contractAddress = "0x9C8637c944C61850ae2610F7fE5D36aBE9161bC5";
  const contractABI = abi.abi;




  const findMetaMaskAccount = async () => {
    try {
      const eth = getEthereumObject();
      if (!eth) {
        console.log("Connect your metamask");
        return null;
      }
      console.log("Eth obj: ", eth);
      const accounts = await eth.request({ method: "eth_accounts" });
  
      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(accounts[0]);
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        await getAllWaves();
      } else {
        console.error("No authorized account found");
        return null;
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        const totalWaves = await wavePortalContract.getTotalWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setCount(totalWaves.toNumber())
        setAllWaves(wavesCleaned);
        return wavesCleaned;
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const eth = getEthereumObject();
      if (!eth) {
        alert("Connect MetaMask Account");
        return;
      }
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  React.useEffect(() => {
    const callFindMMAccount = async () => {
      await findMetaMaskAccount();
      await getAllWaves();
    };
    callFindMMAccount();
    // eslint-disable-next-line
  }, []);

  

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        

        number = await wavePortalContract.getTotalWaves();
        setCount(number.toNumber());
        console.log("Retrieved total wave count...", count);

        const waveTxn = await wavePortalContract.wave(inputRef.current.value);
        console.log("Sending a suh dude", waveTxn.hash);

        alert(inputRef.current.value);
        await waveTxn.wait();
        console.log("Suh dude!!", waveTxn.hash);

        number = await wavePortalContract.getTotalWaves();
        setCount(number.toNumber());
        console.log("Retrieved total wave count...", count);
        const wavesCleaned = await getAllWaves();
        setAllWaves(wavesCleaned);
        console.log("wavezzzzzzzzzzzzzzz: ", allWaves)
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="wave">👋 </span>Suh dude
        </div>

        <div className="bio">
          Are gonna say it back...
        </div>

        <input ref={inputRef} type="text" />
        <div className="bio">
          {count} suh dudes
        </div>
        <button className="waveButton" onClick={wave}>
          Gimme a suh dude!
        </button>
        {

        }

        {!currentAccount && (<button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.slice(0).reverse().map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
