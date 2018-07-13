const Web3 = require('web3');
const SortedMap = require ('collections/sorted-map');
const tokenJson = require('./bsutoken/build/contracts/BSUToken.json');

const network = "wss://rinkeby.infura.io/ws";
const contractAddress = "0x97cE6CE1ddb481a9B0fb8e2cE7316Cfd9FF6f534";
const contractCreationBlock = 2574945;
const abi = tokenJson.abi;

//const TESTING_ADDRESS = '0x156604374Bf9FaE4378faE2b29D4E7847C245b90';

let web3 = new Web3(new Web3.providers.WebsocketProvider(network));
let bsutokenInstance = new web3.eth.Contract(abi, contractAddress);
let balances = new SortedMap();

function watchBalance(address) {
    bsutokenInstance.events.Transfer({filter: {from: address}, fromBlock: contractCreationBlock}, (error, result) => {
        transferCallback(address, result.blockNumber, error);
    });
    bsutokenInstance.events.Transfer({filter: {to: address}, fromBlock: contractCreationBlock}, (error, result) => {
        transferCallback(address, result.blockNumber, error);
    });
}

async function transferCallback(address, blockNumber, error) {
    if (!error) {
        try {
            let balance = bsutokenInstance.methods.balanceOf(address).call({}, blockNumber);
            let block = web3.eth.getBlock(blockNumber);
            balances.add (Number(await balance), (await block).timestamp);
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        console.log(error);
    }
}

async function getBalanceChanges(address) {
    balances = new SortedMap();
    try {
        let fromEvents = bsutokenInstance.getPastEvents('Transfer', {filter: {from: address}, fromBlock: contractCreationBlock, toBlock: 'latest'});
        let toEvents = bsutokenInstance.getPastEvents('Transfer', {filter: {to: address}, fromBlock: contractCreationBlock, toBlock: 'latest'});
        for (const event of await fromEvents) {
            await transferCallback(address, event.blockNumber);
        }
        for (const event of await toEvents) {
            await transferCallback(address, event.blockNumber);
        }
    }
    catch (error) {
        console.log(error);
    }
    watchBalance(address);
}

function getBalances() {
    return balances;
}

module.exports = {getBalanceChanges, getBalances};