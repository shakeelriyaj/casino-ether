import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom";
import Web3 from "web3";
import "./../css/index.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numberOfBets: 0,
      minimumBet: 0,
      totalBet: 0,
      maxAmountOfBets: 0,
      web3: null,
      contract: null,
      account: null,
      loading: true,
      error: null,
    };
  }

  async componentDidMount() {
    await this.initWeb3();
    if (this.state.contract) {
      this.updateState();
      this.setupListeners();
      // Update state every 7 seconds
      this.interval = setInterval(() => this.updateState(), 7000);
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async initWeb3() {
    // Check if MetaMask is installed
    if (typeof window.ethereum === "undefined") {
      this.setState({
        error: "Please install MetaMask to use this dApp!",
        loading: false,
      });
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Account access granted");

      const web3Instance = new Web3(window.ethereum);

      if (!accounts || !accounts.length) {
        this.setState({
          error: "No MetaMask accounts found. Please unlock MetaMask.",
          loading: false,
        });
        return;
      }

      const userAccount = accounts[0];

      console.log("Connected account:", userAccount);

      // Your contract ABI
      const contractABI = [
        {
          constant: false,
          inputs: [
            {
              name: "numberSelected",
              type: "uint256",
            },
          ],
          name: "bet",
          outputs: [],
          payable: true,
          stateMutability: "payable",
          type: "function",
        },
        {
          constant: false,
          inputs: [
            {
              name: "numberWinner",
              type: "uint256",
            },
          ],
          name: "distributePrizes",
          outputs: [],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          constant: false,
          inputs: [],
          name: "generateNumberWinner",
          outputs: [],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          constant: false,
          inputs: [],
          name: "kill",
          outputs: [],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              name: "_minimumBet",
              type: "uint256",
            },
          ],
          payable: false,
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          payable: true,
          stateMutability: "payable",
          type: "fallback",
        },
        {
          constant: true,
          inputs: [
            {
              name: "player",
              type: "address",
            },
          ],
          name: "checkPlayerExists",
          outputs: [
            {
              name: "",
              type: "bool",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "maxAmountOfBets",
          outputs: [
            {
              name: "",
              type: "uint256",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "minimumBet",
          outputs: [
            {
              name: "",
              type: "uint256",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "numberOfBets",
          outputs: [
            {
              name: "",
              type: "uint256",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "owner",
          outputs: [
            {
              name: "",
              type: "address",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [
            {
              name: "",
              type: "address",
            },
          ],
          name: "playerInfo",
          outputs: [
            {
              name: "amountBet",
              type: "uint256",
            },
            {
              name: "numberSelected",
              type: "uint256",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [
            {
              name: "",
              type: "uint256",
            },
          ],
          name: "players",
          outputs: [
            {
              name: "",
              type: "address",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "totalBet",
          outputs: [
            {
              name: "",
              type: "uint256",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ];

      // IMPORTANT: Replace this with YOUR contract address from Remix
      const contractAddress = "0x3a6fca563ab1144d8ffe22a6a94f0bc6309d9ec3";

      // Create contract instance
      const contractInstance = new web3Instance.eth.Contract(
        contractABI,
        contractAddress,
      );

      // Update state
      this.setState({
        web3: web3Instance,
        contract: contractInstance,
        account: userAccount,
        loading: false,
      });

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        this.setState({ account: accounts[0] });
        window.location.reload();
      });

      // Listen for network changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Web3 initialization error:", error);
      this.setState({
        error: error.message || "Web3 initialization failed",
        loading: false,
      });
    }
  }

  async updateState() {
    const { contract, web3 } = this.state;

    if (!contract || !web3) {
      return;
    }

    try {
      // Get minimum bet
      const minimumBet = await contract.methods.minimumBet().call();
      this.setState({
        minimumBet: parseFloat(web3.utils.fromWei(minimumBet, "ether")),
      });

      // Get total bet
      const totalBet = await contract.methods.totalBet().call();
      this.setState({
        totalBet: parseFloat(web3.utils.fromWei(totalBet, "ether")),
      });

      // Get number of bets
      const numberOfBets = await contract.methods.numberOfBets().call();
      this.setState({
        numberOfBets: parseInt(numberOfBets),
      });

      // Get max amount of bets
      const maxAmountOfBets = await contract.methods.maxAmountOfBets().call();
      this.setState({
        maxAmountOfBets: parseInt(maxAmountOfBets),
      });
    } catch (error) {
      console.error("Error updating state:", error);
    }
  }

  setupListeners() {
    if (!this.refs.numbers) return;

    let liNodes = this.refs.numbers.querySelectorAll("li");
    liNodes.forEach((number) => {
      number.addEventListener("click", (event) => {
        event.target.className = "number-selected";
        this.voteNumber(parseInt(event.target.innerHTML), () => {
          // Remove the other number selected
          for (let i = 0; i < liNodes.length; i++) {
            liNodes[i].className = "";
          }
        });
      });
    });
  }

  async voteNumber(number, cb) {
    const { web3, contract, account } = this.state;

    if (!web3 || !contract || !account) {
      alert("Please wait for the app to finish loading");
      cb();
      return;
    }

    let bet = this.refs["ether-bet"].value;

    if (!bet) bet = 0.1;

    if (parseFloat(bet) < this.state.minimumBet) {
      alert("You must bet more than the minimum");
      cb();
      return;
    }

    try {
      await contract.methods.bet(number).send({
        gas: 300000,
        from: account,
        value: web3.utils.toWei(bet.toString(), "ether"),
      });

      alert("Bet placed successfully!");
      await this.updateState();
      cb();
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Error placing bet: " + error.message);
      cb();
    }
  }

  render() {
    const { loading, error } = this.state;

    // Show loading state
    if (loading) {
      return (
        <div className="main-container">
          <h1>Loading...</h1>
          <p>Connecting to MetaMask and loading the contract...</p>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="main-container">
          <h1>Error</h1>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    }

    return (
      <div className="main-container">
        <h1>Bet for your best number and win huge amounts of Ether</h1>

        <div className="block">
          <b>Number of bets:</b> &nbsp;
          <span>{this.state.numberOfBets}</span>
        </div>

        <div className="block">
          <b>Total ether bet:</b> &nbsp;
          <span>{this.state.totalBet} ether</span>
        </div>

        <div className="block">
          <b>Minimum bet:</b> &nbsp;
          <span>{this.state.minimumBet} ether</span>
        </div>

        <div className="block">
          <b>Max amount of bets:</b> &nbsp;
          <span>{this.state.maxAmountOfBets}</span>
        </div>

        <hr />

        <h2>Vote for the next number</h2>

        <label>
          <b>
            How much Ether do you want to bet?{" "}
            <input
              className="bet-input"
              ref="ether-bet"
              type="number"
              step="0.01"
              placeholder={this.state.minimumBet}
            />
          </b>{" "}
          ether
          <br />
        </label>

        <ul ref="numbers">
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
          <li>6</li>
          <li>7</li>
          <li>8</li>
          <li>9</li>
          <li>10</li>
        </ul>

        <hr />

        <div>
          <i>Only working with the Sepolia Test Network</i>
        </div>
        <div>
          <i>You can only vote once per account</i>
        </div>
        <div>
          <i>Your vote will be reflected when the next block is mined</i>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
