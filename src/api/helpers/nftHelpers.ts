import { ICompleteNFT, INFT } from "../../interfaces/graphQL";
import UserService from "../services/mpServices/user";
import L from "../../common/logger";
import NFTService from "../services/mpServices/nft";
import { ICategory } from "../../interfaces/ICategory";
import { fetchTimeout } from "../../utils";
import { IUser } from "src/interfaces/IUser";

const ipfsGateways = {
  ternoaPinataIpfsGateaway: `https://ternoa.mypinata.cloud/ipfs`,
  cloudfareIpfsGateaway: `https://cloudflare-ipfs.com/ipfs`,
  ternoaIpfsGateway: `https://ipfs.ternoa.dev/ipfs`,
}
const defaultIpfsGateway = ipfsGateways.ternoaIpfsGateway;
const ipfsGatewayUri = process.env.IPFS_GATEWAY || defaultIpfsGateway;

/**
 * Groups NFT with NFT.serieId-NFT.owner-NFT.price-NFT.priceTiime as a key
 * @param NFTs - NFTs array
 * @returns - NFT array grouped
 */
export function groupNFTs(NFTs: INFT[]){
  const returnNFTs: INFT[] = []
  const uniqueKeys:any={}
  // sort nft to get the listed ids first
  NFTs = NFTs.sort((a,b) => b.listed - a.listed)
  NFTs.forEach((NFT) =>{
    if(NFT.serieId !== '0'){
      const key = `${NFT.serieId}-${NFT.owner}-${NFT.price}-${NFT.priceTiime}`
      if (uniqueKeys[key] === undefined){
        uniqueKeys[key] = true
        returnNFTs.push(NFT)
      }
    }else{
      returnNFTs.push(NFT)
    }
  })
  return returnNFTs
}

function extractHashFromGatewayUri(uri: string) {
  const regex: RegExp = new RegExp('(http?s:\/\/.*\/)(.*)', 'gm');
  const ipfsLinkParts = regex.exec(uri);
  if (ipfsLinkParts?.length === 3) {
    return ipfsLinkParts[2];
  } else {
    throw new Error("Invalid IPFS hash given: " + uri);
  }
}
function overwriteDefaultIpfsGateway(uri: string): string {
  const ipfsHash: string = extractHashFromGatewayUri(uri);
  return `${ipfsGatewayUri}/${ipfsHash}`
}
function parseRawNFT(NFT: INFT): INFT {
  const { uri } = NFT;
  // if (uri.indexOf(ipfsGateways.ternoaPinataIpfsGateaway) >= 0) {
  NFT.uri = overwriteDefaultIpfsGateway(uri);
  // }
  return NFT;
}

/**
 * Adds information to NFT object from external sources
 * @param NFT - NFT object
 * @returns - NFT object with new fields
 */
export async function populateNFT(NFT: INFT): Promise<ICompleteNFT | INFT> {
  const retNFT: INFT = parseRawNFT(NFT);
  const [creatorData, ownerData, info, categories, totalData] = await Promise.all([
    populateNFTCreator(retNFT),
    populateNFTOwner(retNFT),
    populateNFTUri(retNFT),
    populateNFTCategories(retNFT),
    populateNFTSerieTotal(retNFT)
  ]);
  return {...retNFT, creatorData, ownerData, ...info, categories, ...totalData};
}

/**
 * Pulls owner from database and adds creator's info to NFT object
 * @param NFT - NFT object with creator field
 * @returns NFT object with new creactorData field, if creator's id was valid, object stays untouched otherwise
 */
export async function populateNFTCreator(
  NFT: INFT
): Promise<IUser> {
  try {
    const { creator } = NFT;
    const creatorData = await UserService.findUser(creator);
    return creatorData;
  } catch (err) {
    L.error({ err }, "NFT creator id not in database");
    return null;
  }
}

/**
 * Pulls owner from database and adds owner's info to NFT object
 * @param NFT - NFT object with owner field
 * @returns NFT object with new ownerData field, if owner's id was valid, object stays untouched otherwise
 */
export async function populateNFTOwner(
  NFT: INFT
): Promise<IUser> {
  try {
    const { owner } = NFT;
    const ownerData = await UserService.findUser(owner);
    return ownerData;
  } catch (err) {
    L.error({ err }, "NFT owner id not in database");
    return null;
  }
}

/**
 * Populates an NFT object with data from its URI JSON
 * @param NFT - NFT object with uri field
 * @returns NFT object with new fields, if uri was valid, object stays untouched otherwise
 */
export async function populateNFTUri(NFT: INFT): Promise<any> {
  try {
    const response = await fetchTimeout(NFT.uri, null, Number(process.env.IPFS_REQUEST_TIMEOUT) || 4000).catch((_e) => {
      throw new Error('Could not retrieve NFT data from ' + NFT.uri)
    });
    if (response) {
      const info = await response.json();
      info.media.url = overwriteDefaultIpfsGateway(info.media.url);
      info.cryptedMedia.url = overwriteDefaultIpfsGateway(info.media.url);
      return info;
    } else {
      return {};
    }
  } catch (err) {
    L.error({ err }, "invalid NFT uri");
    return {};
  }
}

/**
 * Populates an NFT obejct with categories from database
 * @param NFT - NFT object with id field
 * @returns NFT object with new categories field from db
 */
export async function populateNFTCategories(
  NFT: INFT
): Promise<ICategory[]> {
  try {
    const mongoNft = await NFTService.findMongoNftFromId(NFT.id);
    if (!mongoNft) return []
    const categories = (mongoNft.categories) as ICategory[];
    return categories;
  } catch (err) {
    L.error({ err }, "error retrieving nft's categories from mongo");
    return [];
  }
}

/**
 * Populates an NFT object with the total of it's serie and total on sale
 * @param NFT - NFT object with serieId, owner, price
 * @returns NFT object with new categories field from db
 */
 export async function populateNFTSerieTotal(
  NFT: INFT
): Promise<{totalNft?:number, totalListedNft?:number, totalMinted?:number}> {
  try {
    if (NFT.serieId === '0' || !NFT.owner){
      return { totalNft: 1, totalListedNft: NFT.listed, totalMinted: 1 };
    }else{
      const result = await NFTService.getNFTsForSerieOwnerPrice(NFT)
      const totalNft = result.nftEntities.totalCount
      const totalListedNft = result.nftEntities.nodes.filter((x)=> x.listed===1).length
      const result2 = await NFTService.getNFTsForSerie(NFT)
      const totalMinted = result2.nftEntities.totalCount
      return { totalNft, totalListedNft, totalMinted };
    }
  } catch (err) {
    L.error({ err }, "error retrieving nft's serie total");
    if (NFT){
      return { totalNft: 1, totalListedNft: NFT.listed, totalMinted: 1 };
    }else{
      return { totalNft: 1, totalListedNft: 0, totalMinted: 1 };
    }
  }
}


