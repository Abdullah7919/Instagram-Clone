require('babel-register');
require('babel-polyfill');


// require('dotenv').config();
// const { MNEMONIC, PROJECT_ID } = process.env;

// const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  
  networks: {
  
    development: {
     host: "127.0.0.1",    
     port: 7545,            
     network_id: "*",       
    },
    
    // goerli: {
    //   provider: () => new HDWalletProvider(MNEMONIC, `https://goerli.infura.io/v3/${PROJECT_ID}`),
    //   network_id: 5,      
    //   confirmations: 2,   
    //   timeoutBlocks: 200,  
    //   skipDryRun: true     
    // },
    //
  },

  
  mocha: {
    // timeout: 100000
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  
  compilers: {
    solc: {
      version: "0.8.18",     
      // docker: true,        
      // settings: {          
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },

};
