import { BigNumber } from "ethers";
import NetworkChainId from "../enums/NetworkChainId";
import PaymentMethod from "../types/PaymentMethod";


/**
 * bnb 네트워크로 변경(모바일) 및 생성
 */
export async function createBnbTestNet(library:any){

    try {
        if(process.env.NODE_ENV !== 'production'){
            await library.provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId:NetworkChainId.BnbTestNet,
                    chainName: "Bnb TestNet",
                    nativeCurrency: {
                      name: "BNB",
                      symbol: "BNB",
                      decimals: 18,
                    },
                    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
                    blockExplorerUrls: ["https://testnet.bscscan.com"],
                  }
                ]
              });
            } else {
                await library.provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId:NetworkChainId.BnbMainNet,
                        chainName: "Binance MainNet",
                        nativeCurrency: {
                          name: "BNB",
                          symbol: "BNB",
                          decimals: 18,
                        },
                        rpcUrls: ["https://bsc-dataseed.binance.org/"],
                        blockExplorerUrls: ["https://bscscan.com"],
                      }
                    ]
                  });
            }
    } catch (error) {
        console.error(error)
    }
    }
/**
 * kovan 네트워크가 없을시에 변경(모바일) 및 생성
 */

export async function createKovan (library: any) {
    try {
        if(process.env.NODE_ENV !== "production"){
            await library.provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: NetworkChainId.Kovan,
                    chainName: "Kovan TestNet",
                    nativeCurrency: {
                      name: "ethereum",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                    blockExplorerUrls: ["https://kovan.etherscan.io"],
                  }
                ]
              })   
        } else {
            await library.provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: NetworkChainId.Mainnet,
                    chainName: "Ethereum Mainnet",
                    nativeCurrency: {
                      name: "ethereum",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                    blockExplorerUrls: ["https://etherscan.io"],
                  }
                ]
              })   
        }
        
    } catch (error) {
        console.error(error);
    }
}
/**
 * 데스트크탑에서 코반서버로 변경해주는 메서드
 */
export async function changeKovan (library: any) {
    try {
        if(process.env.NODE_ENV !== 'production'){
            await library.provider.request({
                method: 'wallet_switchEthereumChain',
                params:[{chainId: NetworkChainId.Kovan}],
              })
        } else {
            await library.provider.request({
                method: 'wallet_switchEthereumChain',
                params:[{chainId: NetworkChainId.Mainnet}],
              })
        }
    } catch (error) {
        throw Error;
    }
}

export  function isCheckChainId (productPayment: string, chainId: string): boolean {
    if(productPayment === PaymentMethod.BNB){
        if(process.env.NODE_ENV !== "production"){
            if(chainId === NetworkChainId.BnbTestNet){
            return true;
            }
                alert("네트워트가 일치하지않습니다.")
                return false;
            }
            if(chainId === NetworkChainId.BnbMainNet){
                return true;
            }
            alert("네트워트가 일치하지않습니다.")
            return false;
        } else {
            if(process.env.NODE_ENV !== "production"){
                if(chainId === NetworkChainId.Kovan){
                    return true;
                  }
                  alert("네트워트가 일치하지않습니다.")
                  return false;  
            } else {
                if(chainId === NetworkChainId.Mainnet){
                    return true;
                }
                alert("네트워트가 일치하지않습니다.")
                return false;
            }
      } 
}

