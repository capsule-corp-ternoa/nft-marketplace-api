import { ICompleteNFT, INFT } from "../../interfaces/graphQL";
import UserService from "../services/user";
import L from "../../common/logger";
import NFTService from "../services/nft";
import { ICategory } from "../../interfaces/ICategory";
import { fetchTimeout, removeURLSlash } from "../../utils";
import { IUser } from "src/interfaces/IUser";

const ipfsGateways = {
  ternoaPinataIpfsGateaway: `https://ternoa.mypinata.cloud/ipfs`,
  cloudfareIpfsGateaway: `https://cloudflare-ipfs.com/ipfs`,
  ternoaIpfsGateway: `https://ipfs.ternoa.dev/ipfs`,
}
const defaultIpfsGateway = ipfsGateways.ternoaIpfsGateway;
const ipfsGatewayUri = (process.env.IPFS_GATEWAY && removeURLSlash(process.env.IPFS_GATEWAY)) || defaultIpfsGateway;

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
  try {
    const { uri } = NFT;
    if (uri && uri.indexOf(defaultIpfsGateway) < 0) {
      NFT.uri = overwriteDefaultIpfsGateway(uri);
    }
    return NFT;
  } catch (err) {
    L.error({ err }, "Can't parse raw nft");
    return NFT;
  }
}

/**
 * Adds information to NFT object from external sources
 * @param NFT - NFT object
 * @returns - NFT object with new fields
 */
export async function populateNFT(NFT: INFT): Promise<ICompleteNFT | INFT> {
  const retNFT: INFT = parseRawNFT(NFT);
  const timeLabel = `populateNFT-${NFT.id}-${new Date().getTime()}`
  console.time(timeLabel);
  const [serieData, creatorData, ownerData, info, categories] = await Promise.all([
    populateSerieData(retNFT),
    populateNFTCreator(retNFT),
    populateNFTOwner(retNFT),
    Promise.resolve({}),// populateNFTUri(retNFT),
    populateNFTCategories(retNFT),
  ]);
  console.log('populateNFT');
  console.timeEnd(timeLabel);
  return { ...retNFT, ...serieData, creatorData, ownerData, ...info, categories };
}

export async function populateSerieData(
  NFT: INFT
): Promise<{ serieData: INFT[]; totalNft: number; totalListedNft: number; }> {
  const timeLabel = `populateSerieData-${NFT.id}-${new Date().getTime()}`
  console.time(timeLabel);
  try {
    if (NFT.serieId === '0') return {
      serieData: [{ id: NFT.id, owner: NFT.owner, listed: NFT.listed, price: NFT.price, priceTiime: NFT.priceTiime, marketplaceId: NFT.marketplaceId }],
      totalNft: 1,
      totalListedNft: NFT.listed
    }
    const result = await NFTService.getNFTsForSerie(NFT)
    const serieData = result.data.sort((a, b) => b.listed - a.listed || Number(a.price) - Number(b.price) || Number(a.priceTiime) - Number(b.priceTiime))
    return { serieData, totalNft: serieData.length, totalListedNft: serieData.filter(x => x.listed).length }
  } catch (err) {
    L.error({ err }, "NFTs with same serie could not have been fetched");
    return null;
  }
  finally {
    console.timeEnd(timeLabel);
  }
}

/**
 * Pulls owner from database and adds creator's info to NFT object
 * @param NFT - NFT object with creator field
 * @returns NFT object with new creactorData field, if creator's id was valid, object stays untouched otherwise
 */
export async function populateNFTCreator(
  NFT: INFT
): Promise<IUser> {
  const timeLabel = `populateNFTCreator-${NFT.id}-${new Date().getTime()}`
  console.time(timeLabel);
  try {
    const { creator } = NFT;
    const creatorData = await UserService.findUser(creator);
    return creatorData;
  } catch (err) {
    L.error({ err }, "NFT creator id not in database");
    return null;
  }
  finally {
    console.timeEnd(timeLabel);
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
  const timeLabel = `populateNFTOwner-${NFT.id}-${new Date().getTime()}`
  console.time(timeLabel);
  try {
    const { owner } = NFT;
    const ownerData = await UserService.findUser(owner);
    return ownerData;
  } catch (err) {
    L.error({ err }, "NFT owner id not in database");
    return null;
  }
  finally {
    console.timeEnd(timeLabel);
  }
}

/**
 * Populates an NFT object with data from its URI JSON
 * @param NFT - NFT object with uri field
 * @returns NFT object with new fields, if uri was valid, object stays untouched otherwise
 */
export async function populateNFTUri(NFT: INFT): Promise<any> {
  const timeLabel = `populateNFTUri-${NFT.id}-${new Date().getTime()}`
  console.time(timeLabel);
  try {
    const response = await fetchTimeout(NFT.uri, null, Number(process.env.IPFS_REQUEST_TIMEOUT) || 8000).catch((_e) => {
      L.error('fetch error:' + _e);
      throw new Error('Could not retrieve NFT data from ' + NFT.uri)
    });
    if (response) {
      const info = await response.json();
      if (info.media.url.indexOf('/ipfs') >= 0 && info.media.url.indexOf(defaultIpfsGateway) < 0) {
        info.media.url = overwriteDefaultIpfsGateway(info.media.url);
      }
      if (info.cryptedMedia.url.indexOf(defaultIpfsGateway) < 0) {
        info.cryptedMedia.url = overwriteDefaultIpfsGateway(info.cryptedMedia.url);
      }
      return info;
    } else {
      return {};
    }
  } catch (err) {
    L.error("invalid NFT uri:" + err);
    return {};
  }
  finally {
    console.timeEnd(timeLabel)
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
  const timeLabel = `populateNFTCategories-${NFT.id}-${new Date().getTime()}`
  console.time(timeLabel);
  try {
    const mongoNft = await NFTService.findMongoNftFromId(NFT.id);
    if (!mongoNft) return []
    const categories = (mongoNft.categories) as ICategory[];
    return categories;
  } catch (err) {
    L.error({ err }, "error retrieving nft's categories from mongo");
    return [];
  }
  finally {
    console.timeEnd(timeLabel)
  }
}