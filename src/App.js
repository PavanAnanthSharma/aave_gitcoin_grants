import React from 'react';
import Button from 'react-bootstrap-button-loader';
import {Navbar, ListGroup, Image} from 'react-bootstrap';
import AToken from "./AToken.json";
import LendingPool from "./LendingPool.json";
import LendingPoolAddressProvider from "./LendingPoolAddressProvider.json";
import ERC20 from "./ERC20.json";
import grants from "./grants.json";
import Web3Modal from "web3modal";

const Web3 = require('web3');


const depositTokenMapping = {
    "ETH": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "DAI": "0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108",
    "USDC": "0x851dEf71f0e6A903375C1e536Bd9ff1684BAD802",
    "SUSD": "0xc374eB17f665914c714Ac4cdC8AF3a3474228cc5",
    "TUSD": "0xa51EE1845C13Cb03FcA998304b00EcC407fc1F92",
    "USDT": "0xB404c51BBC10dcBE948077F18a4B8E553D160084",
    "BUSD": "0xFA6adcFf6A90c11f31Bc9bb59eC0a6efB38381C6",
    "BAT": "0x85B24b3517E3aC7bf72a14516160541A60cFF19d",
    "KNC": "0xCe4aA1dE3091033Ba74FA2Ad951f6adc5E5cF361",
    "LEND": "0x217b896620AfF6518B9862160606695607A63442",
    "LINK": "0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486",
    "MANA": "0x78b1F763857C8645E46eAdD9540882905ff32Db7",
    "MKR": "0x2eA9df3bABe04451c9C3B06a2c844587c59d9C37",
    "REP": "0xBeb13523503d35F9b3708ca577CdCCAdbFB236bD",
    "WBTC": "0xa0E54Ab6AA5f0bf1D62EC3526436F3c05b3348A0",
    "ZRX": "0x02d7055704EfF050323A2E5ee4ba05DB2A588959",
};

const redeemaTokenMapping = {
    "aETH": "0x2433A1b6FcF156956599280C3Eb1863247CFE675",
    "aDAI": "0xcB1Fe6F440c49E9290c3eb7f158534c2dC374201",
    "aUSDC": "0x2dB6a31f973Ec26F5e17895f0741BB5965d5Ae15",
    "aSUSD": "0x5D17e0ea2d886F865E40176D71dbc0b59a54d8c1",
    "aTUSD": "0x82F01c5694f36690a985F01dC0aD46e1B20E7a1a",
    "aUSDT": "0x790744bC4257B4a0519a3C5649Ac1d16DDaFAE0D",
    "aBUSD": "0x81E065164bAC7203c3bFEB1a749F48a64383c6eE",
    "aBAT": "0x0D0Ff1C81F2Fbc8cbafA8Df4bF668f5ba963Dab4",
    "aKNC": "0xCf6efd4528d27Df440fdd585a116D3c1fC5aDdEe",
    "aLEND": "0x383261d0e287f0A641322AEB15E3da50147Dd36b",
    "aLINK": "0x52fd99c15e6FFf8D4CF1B83b2263a501FDd78973",
    "aMANA": "0x8e96a4068da80F66ef1CFc7987f0F834c26106fa",
    "aMKR": "0xEd6A5d671f7c55aa029cbAEa2e5E9A18E9d6a1CE",
    "aREP": "0xE4B92BcDB2f972e1ccc069D4dB33d5f6363738dE",
    "aWBTC": "0xA1c4dB01F8344eCb11219714706C82f0c0c64841",
    "aZRX": "0x5BDC773c9D3515a5e3Dd415428F92a90E8e63Ae4",
};

const daiAddress = '0xf80a32a835f79d7787e8a8ee5721d0feafd78108';
const lendingPoolAddressProviderAddress = '0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728';
const aDAIAddress = '0xcB1Fe6F440c49E9290c3eb7f158534c2dC374201';

class App extends React.Component {
    state = {
        account: '',
        daiBalance: '',
        aDAIBalance: '',
        web3: '',
        tokenDepositAddress: depositTokenMapping['DAI'],
        tokenDepositAmount: '',
        aTokenRedeemAddress: redeemaTokenMapping['aDAI'],
        aTokenRedeemAmount: '',
        loadingTokenDeposit: false,
        loadingaTokenRedeem: false,
        tokenDonateAddress: redeemaTokenMapping['aDAI'],
        loadingDonateInterest: false,
        grant_index: '',
        searchFilter: ''
    };

    async updateDAIBalance() {
        try {
            let contract = new this.state.web3.eth.Contract(ERC20, daiAddress);
            let balance = await contract.methods.balanceOf(this.state.account).call();
            balance = this.state.web3.utils.fromWei(balance);
            this.setState({daiBalance: balance.toString()});
        } catch (e) {

        }
    }

    async updateaDAIBalance() {
        try {
            let contract = new this.state.web3.eth.Contract(ERC20, aDAIAddress);
            let balance = await contract.methods.balanceOf(this.state.account).call();
            balance = this.state.web3.utils.fromWei(balance);
            this.setState({aDAIBalance: balance.toString()});
        } catch (e) {

        }
    }

    web3Modal = new Web3Modal({
        network: "ropsten", // optional
        cacheProvider: true, // optional
        providerOptions: {}
    });

    async login() {
        const provider = await this.web3Modal.connect();
        await this.subscribeProvider(provider);
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        const networkId = await web3.eth.net.getId();
        if (networkId !== 3) {
            alert('App works only for Ropsten testnet');
            return;
        }
        this.setState({
            web3: web3,
            account: address
        });
        await this.updateDAIBalance();
        await this.updateaDAIBalance();
    }

    async logout() {
        this.resetApp();
    }

    async subscribeProvider(provider) {
        if (!provider.on) {
            return;
        }
        provider.on("close", () => this.resetApp());
        provider.on("accountsChanged", async (accounts) => {
            await this.setState({account: accounts[0]});
            await this.updateDAIBalance();
            await this.updateaDAIBalance();
        });
        provider.on("chainChanged", async (chainId) => {
            const {web3} = this.state;
            const networkId = await web3.eth.net.getId();
            if (networkId !== 3) {
                alert('App works only for Ropsten testnet');
                return;
            }
            await this.updateDAIBalance();
            await this.updateaDAIBalance();
        });

        provider.on("networkChanged", async (networkId) => {
            if (networkId !== 3) {
                alert('App works only for Ropsten testnet');
                return;
            }
            await this.updateDAIBalance();
            await this.updateaDAIBalance();
        });
    };

    async resetApp() {
        const {web3} = this.state;
        if (web3 && web3.currentProvider && web3.currentProvider.close) {
            await web3.currentProvider.close();
        }
        await this.web3Modal.clearCachedProvider();
        this.setState({account: '', web3: ''});
    };

    async componentWillMount() {
        this.setState({grants: grants});
        if (this.web3Modal.cachedProvider) {
            this.login();
        }
    }

    render() {
        if (this.state.account === '') {
            return (
                <div>
                    <Navbar bg="primary" variant="dark">
                        <div style={{width: "90%"}}>
                            <Navbar.Brand href="/">
                                <b>Aave Gitcoin Grants</b>
                            </Navbar.Brand>
                        </div>
                        <Button variant="default btn-sm" onClick={this.login.bind(this)} style={{float: "right"}}>
                            Connect
                        </Button>
                    </Navbar>
                    <div className="panel-landing  h-100 d-flex" id="section-1">
                        <div className="container row" style={{marginTop: "50px"}}>
                            <div className="col l8 m12">

                                <p className="h2">
                                    Support your favorite open source projects
                                </p>
                                <p className="h6" style={{marginTop: "10px"}}>
                                    Deposit your tokens to Aave and redirect interest to your favorite gitcoin open
                                    source projects
                                </p>
                                <Image src="/gitcoin.png"
                                       style={{height: "320px", width: "650px", marginTop: "10px"}} fluid/>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div className="App">
                <div>
                    <Navbar bg="primary" variant="dark" style={{position: "sticky"}} fixed="top">
                        <div style={{width: "90%"}}>
                            <Navbar.Brand href="/">
                                <b>Aave Gitcoin Grants</b>
                            </Navbar.Brand>
                        </div>
                        <Button variant="default btn-sm" onClick={this.logout.bind(this)} style={{float: "right"}}>
                            Logout
                        </Button>
                    </Navbar>
                    <div style={{margin: "20px"}}>
                        <div>
                            <div style={{wordWrap: "break-word"}}><b>Account:</b> {this.state.account}</div>
                            <div><b>DAI Balance:</b> {this.state.daiBalance}</div>
                            <div><b>aDAI Balance:</b> {this.state.aDAIBalance}</div>
                            <br/>
                            <h5>Deposit Tokens to earn interest using aTokens</h5>
                            <div>
                                <select className="form-control" style={{marginBottom: "10px"}}
                                        value={this.state.tokenDepositAddress}
                                        onChange={e => this.updateTokenDepositAddress(e.target.value)}>
                                    {
                                        Object.keys(depositTokenMapping).map((key, index) => (
                                            <option value={depositTokenMapping[key]}>{key}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div style={{marginBottom: "10px"}}>
                                <input className="form-control" type="text" placeholder="Amount"
                                       value={this.state.tokenDepositAmount}
                                       onChange={e => this.updateTokenDepositAmount(e.target.value)}/>
                            </div>
                            <div>
                                <Button variant="primary btn" onClick={this.depositToken.bind(this)}
                                        loading={this.state.loadingTokenDeposit}
                                >Deposit Tokens</Button>
                            </div>
                            <br/>


                            <h5>Redeem aTokens to get Tokens</h5>
                            <div>
                                <select className="form-control" style={{marginBottom: "10px"}}
                                        value={this.state.aTokenRedeemAddress}
                                        onChange={e => this.updateaTokenRedeemAddress(e.target.value)}>
                                    {
                                        Object.keys(redeemaTokenMapping).map((key, index) => (
                                            <option value={redeemaTokenMapping[key]}>{key}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div>
                                <input className="form-control" type="text" placeholder="Amount"
                                       value={this.state.aTokenRedeemAmount}
                                       onChange={e => this.updateaTokenRedeemAmount(e.target.value)}/>
                            </div>
                            <div>
                                <Button variant="primary btn" onClick={this.redeemaToken.bind(this)}
                                        style={{marginTop: "10px"}}
                                        loading={this.state.loadingaTokenRedeem}
                                >Redeem aTokens</Button>
                            </div>
                        </div>
                        <br/>
                        {this.state.grants &&
                        <div style={{height: "300px", marginBottom: "10px"}}>
                            <h5>Support your favorite gitcoin open source projects by donating aTokens interest</h5>
                            <select className="form-control" style={{marginBottom: "10px"}}
                                    value={this.state.tokenDonateAddress}
                                    onChange={e => this.updateTokenDonateAddress(e.target.value)}>
                                {
                                    Object.keys(redeemaTokenMapping).map((key, index) => (
                                        <option value={redeemaTokenMapping[key]}>{key}</option>
                                    ))
                                }
                            </select>
                            <input type="text" className="form-control" placeholder="Search projects"
                                   onChange={this.setSearchFilter.bind(this)}/>
                            <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                {this.state.grants.filter(grant => grant[0].toLowerCase()
                                        .search(this.state.searchFilter.toLowerCase().trim()) !== -1
                                    || this.state.searchFilter.trim() === "")
                                    .map((grant, i) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Name</b>: {grant[0]}
                                            <br/>
                                            <b>Address</b>: {grant[1]}
                                            <br/>
                                            <Button variant="primary btn"
                                                    onClick={e => this.donateInterest(grant[1], i)}
                                                    style={{marginTop: "10px"}}
                                                    loading={this.state.loadingDonateInterest
                                                    && this.state.grant_index === i}>
                                                Fund Interest
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                            </ListGroup>
                            <br/>
                        </div>
                        }
                    </div>
                </div>
            </div>
        )
    }

    updateTokenDepositAddress(value) {
        this.setState({tokenDepositAddress: value})
    }

    updateTokenDepositAmount(value) {
        if (value === '') {
            this.setState({tokenDepositAmount: value});
            return
        }
        let valid = value.match(/^[+]?(?=.?\d)\d*(\.\d{0,18})?$/);
        if (!valid) {
            return
        }
        this.setState({tokenDepositAmount: value})
    }

    updateaTokenRedeemAddress(value) {
        this.setState({aTokenRedeemAddress: value})
    }

    updateaTokenRedeemAmount(value) {
        if (value === '') {
            this.setState({aTokenRedeemAmount: value});
            return
        }
        let valid = value.match(/^[+]?(?=.?\d)\d*(\.\d{0,18})?$/);
        if (!valid) {
            return
        }
        this.setState({aTokenRedeemAmount: value})
    }

    async depositToken() {
        if (this.state.tokenDepositAmount === '') {
            return;
        }
        let tokenAddress = this.state.tokenDepositAddress;
        this.setState({loadingTokenDeposit: true});
        const ERC20Contract = new this.state.web3.eth.Contract(ERC20, tokenAddress);
        let decimals;
        try {
            decimals = await ERC20Contract.methods.decimals().call();
        } catch (e) {
            decimals = "18";
        }
        let amount;
        try {
            if (decimals === '6') {
                amount = this.state.web3.utils.toWei(this.state.tokenDepositAmount, "mwei").toString();
            } else {
                amount = this.state.web3.utils.toWei(this.state.tokenDepositAmount, "ether").toString();
            }
        } catch (e) {
            alert('Only ' + decimals + ' decimals are supported for the token');
            this.setState({loadingTokenDeposit: false});
            return;
        }
        const referralCode = '0';
        const lendingPoolAddressProviderContract = new this.state.web3.eth.Contract(LendingPoolAddressProvider,
            lendingPoolAddressProviderAddress);
        const lendingPoolCoreAddress = await lendingPoolAddressProviderContract.methods.getLendingPoolCore().call();
        if (tokenAddress.toLowerCase() !== depositTokenMapping['ETH'].toLowerCase()) {
            try {
                await ERC20Contract.methods.approve(lendingPoolCoreAddress, amount).send({from: this.state.account})
            } catch (e) {
                console.log(e);
                alert('Deposit Token failed');
                this.setState({loadingTokenDeposit: false});
                return
            }
        }
        const lendingPoolAddress = await lendingPoolAddressProviderContract.methods.getLendingPool().call();
        const lendingPoolContract = new this.state.web3.eth.Contract(LendingPool, lendingPoolAddress);
        try {
            if (tokenAddress.toLowerCase() !== depositTokenMapping['ETH'].toLowerCase()) {
                await lendingPoolContract.methods.deposit(tokenAddress, amount, referralCode)
                    .send({from: this.state.account});
            } else {
                await lendingPoolContract.methods.deposit(tokenAddress, amount, referralCode)
                    .send({from: this.state.account, value: amount});
            }
        } catch (e) {
            console.log(e);
            alert('Deposit Token failed');
        }
        await this.updateDAIBalance();
        await this.updateaDAIBalance();
        this.setState({loadingTokenDeposit: false});
    }

    async redeemaToken() {
        if (this.state.aTokenRedeemAmount === '') {
            alert('amount is required');
            return;
        }
        let tokenAddress = this.state.aTokenRedeemAddress;
        this.setState({loadingaTokenRedeem: true});
        const contract = new this.state.web3.eth.Contract(AToken, tokenAddress);
        const decimals = await contract.methods.decimals().call();
        let amount;
        try {
            if (decimals === '6') {
                amount = this.state.web3.utils.toWei(this.state.aTokenRedeemAmount, "mwei").toString();
            } else {
                amount = this.state.web3.utils.toWei(this.state.aTokenRedeemAmount, "ether").toString();
            }
        } catch (e) {
            alert('Only ' + decimals + ' decimals are supported for the token');
            this.setState({loadingaTokenRedeem: false});
            return;
        }
        try {
            await contract.methods.redeem(amount).send({from: this.state.account});
        } catch (e) {
            console.log(e);
            alert('Redeem aTokens failed');
        }
        await this.updateDAIBalance();
        await this.updateaDAIBalance();
        this.setState({loadingaTokenRedeem: false});
    }

    updateTokenDonateAddress(value) {
        this.setState({tokenDonateAddress: value});
    }

    async donateInterest(grant_address, i) {
        this.setState({loadingDonateInterest: true, grant_index: i});
        const contract = new this.state.web3.eth.Contract(AToken, this.state.tokenDonateAddress);
        try {
            await contract.methods.redirectInterestStream(grant_address).send({from: this.state.account});
        } catch (e) {
            console.log(e);
        }
        this.setState({loadingDonateInterest: false, grant_index: ''});
    }

    setSearchFilter(e) {
        this.setState({searchFilter: e.target.value});
    }
}

export default App
