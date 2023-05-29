import React, { Component } from "react";
import Web3 from "web3";
// import Identicon from 'identicon.js';
import "./App.css";
import Decentragram from "../abis/Decentragram.json";
import Navbar from "./Navbar";
import Main from "./Main";
import axios from "axios";
require("dotenv").config();

const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;

// import IPFS from 'ipfs-http-client';

// const ipfs=IPFS.create();

// const ipfsClient=require('ipfs-api')

// const ipfs=ipfsClient({host:'ipfs.infura.io', port:5001,protocol:'https'})

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying Metamask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    // Network Id
    const networkId = await web3.eth.net.getId();
    const networkData = Decentragram.networks[networkId];

    if (networkData) {
      const decentragram = web3.eth.Contract(
        Decentragram.abi,
        networkData.address
      );
      this.setState({ decentragram });
      const imageCount = await decentragram.methods.imageCount().call();
      this.setState({ imageCount });

      for (let i = 1; i <= imageCount; i++) {
        const image = await decentragram.methods.images(i).call();
        this.setState({
          images: [...this.state.images, image],
        });
      }

      this.setState({
        images:this.state.images.sort((a,b)=>b.tipAmount-a.tipAmount)
      })

      this.setState({ loading: false });
    } else {
      window.alert("Decentragram contract not deploy to detect the network");
    }
  }

  captureFile = async (event) => {
    event.preventDefault();
    const files = event.target.files[0];
    this.setState({ buffer: files });

    // console.log(files)
    // const reader=new window.FileReader()
    //   reader.readAsArrayBuffer(files)

    //   reader.onload=()=>{
    //     this.setState({buffer:Buffer(reader.result)})
    //     console.log('buffer',this.state.buffer)
    //   }
  };

  uploadImage = async (description) => {
    console.log("Submitting file to IPFS...");
    const files = this.state.buffer;
    if (files) {
      try {
        const formData = new FormData();
        formData.append("file", files);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `${REACT_APP_PINATA_API_KEY}`,
            pinata_secret_api_key: `${REACT_APP_PINATA_API_SECRET}`,
            "Content-Type": "multipart/form-data",
          },
        });

        const ImgHash = `${resFile.data.IpfsHash}`;
        console.log("imageHash", ImgHash);

        this.setState({ loading: true });
        this.state.decentragram.methods
          .uploadImage(ImgHash, description)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });

      } catch (error) {
        console.log("Error sending File to IPFS: ");
        console.log(error);
      }
    }
  };

  tipImageOwner = (id, tipAmount) => {
    this.setState({ loading: true });
    this.state.decentragram.methods
      .tipImageOwner(id)
      .send({ from: this.state.account, value: tipAmount })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };
  // adding file to ipfs
  // ipfs.add(this.state.buffer,(error,result)=>{
  //   console.log("IPFS result:",result)
  //   if(error){
  //     console.error(error)
  //     return
  //   }

  // this.setState({loading:true})
  // this.state.decentragram.methods
  // .uploadImage(ImgHash,description)
  // .send({from:this})
  // .on('transaction Hash',(hash)=>{
  //   this.setState({loading:false})
  // })
  // })
  // }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      decentragram: null,
      images: [],
      loading: true,
    };
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
        ) : (
          <Main
            images={this.state.images}
            captureFile={this.captureFile}
            uploadImage={this.uploadImage}
            tipImageOwner={this.tipImageOwner}
          />
        )}
      </div>
    );
  }
}

export default App;
