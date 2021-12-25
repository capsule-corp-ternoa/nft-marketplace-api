import { CustomResponse, ICompleteNFT, INFT } from "../../interfaces/graphQL";
import UserService from "../services/user";
import L from "../../common/logger";
import NFTService from "../services/nft";
import { ICategory } from "../../interfaces/ICategory";
import { fetchTimeout, isURL, removeURLSlash } from "../../utils";
import { IUser } from "src/interfaces/IUser";
import { NFTsQuery } from "../validators/nftValidators";

const ipfsGateways = {
  ternoaPinataIpfsGateaway: `https://ternoa.mypinata.cloud/ipfs`,
  cloudfareIpfsGateaway: `https://cloudflare-ipfs.com/ipfs`,
  ternoaIpfsGateway: `https://ipfs.ternoa.dev/ipfs`,
};
const defaultIpfsGateway = ipfsGateways.ternoaIpfsGateway;
const ipfsGatewayUri =
  (process.env.IPFS_GATEWAY && removeURLSlash(process.env.IPFS_GATEWAY)) ||
  defaultIpfsGateway;

/**
 * Adds information to NFT object from external sources
 * @param NFT - NFT object
 * @returns - NFT object with new fields
 */
export async function populateNFT(
  NFT: INFT,
  seriesData: CustomResponse<INFT>,
  query: NFTsQuery
): Promise<ICompleteNFT | INFT> {
  const [serieData, creatorData, ownerData, info, categories, seriesLocked] =
    await Promise.all([
      populateSerieData(NFT, seriesData, query),
      populateNFTCreator(NFT),
      populateNFTOwner(NFT),
      populateNFTIpfs(NFT),
      populateNFTCategories(NFT),
      populateNFTSeriesObject(NFT.serieId)
    ]);
  return { ...NFT, ...serieData, creatorData, ownerData, ...info, categories, seriesLocked};
}

export async function populateSerieData(
  NFT: INFT,
  seriesData: CustomResponse<INFT>,
  query: NFTsQuery
): Promise<{
  serieData: INFT[];
  totalNft: number;
  totalListedNft: number;
  totalListedInMarketplace: number;
  totalOwnedByRequestingUser: number;
  totalOwnedListedByRequestingUser: number;
  smallestPrice: string;
}> {
  try {
    const marketplaceId = query.filter?.marketplaceId;
    const owner = query.filter?.owner;
    if (NFT.serieId === "0")
      return {
        serieData: [
          {
            id: NFT.id,
            owner: NFT.owner,
            listed: NFT.listed,
            price: NFT.price,
            marketplaceId: NFT.marketplaceId,
          },
        ],
        totalNft: 1,
        totalListedNft: NFT.listed,
        totalListedInMarketplace: NFT.listed,
        totalOwnedByRequestingUser: 1,
        totalOwnedListedByRequestingUser: NFT.listed,
        smallestPrice: NFT.price,
      };
    const result = seriesData.data.filter((x) => x.serieId === NFT.serieId);
    const serieData = result.sort(
      (a, b) =>
        (a.isCapsule !== b.isCapsule && (a.isCapsule ? 1 : -1)) || // capsule last
        b.listed - a.listed || // listed first
        (marketplaceId && Number(a.marketplaceId) !== Number(b.marketplaceId) && (Number(a.marketplaceId) === marketplaceId || Number(b.marketplaceId) === marketplaceId) &&
          marketplaceId === Number(a.marketplaceId) ? -1 : 1) || // marketplace id corresponding to request first
        Number(a.price) - Number(b.price) // smallest price first
    );
    serieData.forEach(x => {
      delete x.serieId
    })
    const listedNft = serieData.filter((x) => x.listed);
    return {
      serieData: !query.filter?.noSeriesData ? serieData : [],
      totalNft: serieData.length,
      totalListedNft: listedNft.length,
      totalListedInMarketplace: marketplaceId
        ? listedNft.filter((x) => Number(x.marketplaceId) === marketplaceId)
            .length
        : listedNft.length,
      totalOwnedByRequestingUser: owner
        ? serieData.filter((x) => x.owner === owner).length
        : 0,
      totalOwnedListedByRequestingUser: owner
        ? listedNft.filter((x) => x.owner === owner).length
        : 0,
      smallestPrice: serieData.length > 0 ? serieData[0].price : NFT.price
    };
  } catch (err) {
    L.error({ err }, "NFTs with same serie could not have been fetched");
    return null;
  }
}

/**
 * Pulls owner from database and adds creator's info to NFT object
 * @param NFT - NFT object with creator field
 * @returns NFT object with new creactorData field, if creator's id was valid, object stays untouched otherwise
 */
export async function populateNFTCreator(NFT: INFT): Promise<IUser> {
  try {
    const { creator } = NFT;
    const creatorData = await UserService.findUser({ id: creator });
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
export async function populateNFTOwner(NFT: INFT): Promise<IUser> {
  try {
    const { owner } = NFT;
    const ownerData = await UserService.findUser({ id: owner });
    return ownerData;
  } catch (err) {
    L.error({ err }, "NFT owner id not in database");
    return null;
  }
}

/**
 * Populates an NFT object with data from its nfts ipfs JSON
 * @param NFT - NFT object with nfts ipfs field
 * @returns NFT object with new fields, if nftIpfs was valid, object stays untouched otherwise
 */
export async function populateNFTIpfs(NFT: INFT): Promise<any> {
  try {
    const fetchUrl = isURL(NFT.nftIpfs)
      ? NFT.nftIpfs
      : `${ipfsGatewayUri}/${NFT.nftIpfs}`;
    const response = await fetchTimeout(
      fetchUrl,
      null,
      Number(process.env.IPFS_REQUEST_TIMEOUT) || 8000
    ).catch((_e) => {
      L.error("fetch error:" + _e);
      throw new Error("Could not retrieve NFT data from " + NFT.nftIpfs);
    });
    if (response) {
      const info: {
        name?: string;
        media?: { url: string }; // old for backward compatibility
        cryptedMedia?: { url: string }; // old for backward compatibility
        image?: string;
        publicPGP?: string;
        title?: string;
        properties?: {
          preview?: { ipfs: string };
          cryptedMedia?: { ipfs: string };
          publicPGP?: string;
        };
      } = await response.json();
      // backward compatibility
      if (!info.properties && !info.title && !info.image) {
        info.properties = {};
        // set preview
        info.properties.preview = { ipfs: info.media.url };
        info.properties.preview = { ...info.properties.preview, ...info.media };
        delete (info.properties.preview as any).url;
        // set cryptedMedia
        info.properties.cryptedMedia = { ipfs: info.cryptedMedia.url };
        info.properties.cryptedMedia = {
          ...info.properties.cryptedMedia,
          ...info.cryptedMedia,
        };
        // set pgp in property
        if (!info.properties.publicPGP)
          info.properties.publicPGP = info.publicPGP;
        // set image
        info.image = info.properties.preview.ipfs;
        // set title
        info.title = info.name;
        // delete old properties
        delete (info.properties.cryptedMedia as any).url;
        delete info.media;
        delete info.cryptedMedia;
        delete info.publicPGP;
        delete info.name;
      }
      if (info.properties) {
        // set url format
        info.properties.preview.ipfs = isURL(info.properties.preview.ipfs) ? info.properties.preview.ipfs : `${ipfsGatewayUri}/${info.properties.preview.ipfs}`;
        info.properties.cryptedMedia.ipfs = isURL(info.properties.cryptedMedia.ipfs) ? info.properties.cryptedMedia.ipfs : `${ipfsGatewayUri}/${info.properties.cryptedMedia.ipfs}`;
        const imageHash = isURL(info.image) ? `${info.image.split('/')[info.image.split('/').length - 1]}` : `${info.image}`
        const thumbnailHash = getHappyTiimeThumbnails(imageHash)
        if (thumbnailHash){
          info.image = `${ipfsGatewayUri}/${thumbnailHash}`;
        }else{
          info.image = isURL(info.image) ? info.image : `${ipfsGatewayUri}/${info.image}`;
        }
      }
      return info;
    } else {
      return {};
    }
  } catch (err) {
    L.error("invalid NFT ipfs:" + err);
    return {};
  }
}

/**
 * Populates an NFT obejct with categories from database
 * @param NFT - NFT object with id field
 * @returns NFT object with new categories field from db
 */
export async function populateNFTCategories(NFT: INFT): Promise<ICategory[]> {
  try {
    const categories = await NFTService.findCategoriesFromNFTId(NFT.id);
    if (!categories) return [];
    return categories;
  } catch (err) {
    L.error({ err }, "error retrieving nft's categories from mongo");
    return [];
  }
}


/**
 * Populates an NFT object with series object from indexer
 * @param seriesId - Series Id of NFT
 * @returns True if series is locked, false if unlocked, null if can't get data
 */
 export async function populateNFTSeriesObject(seriesId: string | null): Promise<boolean | null> {
  try {
    if (!seriesId) return null
    const data = await NFTService.getSeriesStatus({seriesId})
    if (!data) return null
    return data.locked
  } catch (err) {
    L.error({ err }, "error retrieving nft's series object");
    return null;
  }
}

/**
 * Populates an NFT object with series object from indexer
 * @param seriesId - Series Id of NFT
 * @returns True if series is locked, false if unlocked, null if can't get data
 */
 export function getHappyTiimeThumbnails(videoHash: string): string | null {
    switch(videoHash){
      case "QmanaNsDaBYuDy1Z3joTcfBAB4zieu2R9VAHwxaGEzcAnb":
        return "QmRSWzv3jgTppCsDHjTdgY2aVPpMD66D28Dbyj3N65Nnfh"
      case "QmdSNPssUEAVG9jkBQAXCBrNM5zSgofXkrdkD83DqxCxhZ":
        return "QmfQCe5hgcngZkFcbS6rktaiPZ4U1ZiBiuJHbA73CJfi2P"
      case "QmQde4iLJyuLKQwPmfeFMr7AdS5wDv1haCxsbv1RgfURBC":
        return "QmRJJ9ghsoz6aNSnet1bPNJE8RrAC74oNoiQhQ3cYxHhwM"
      case "QmSREPYVpK73oBoJR15kUREDiJf9X2okjgFqyze8UNu4WX":
        return "QmQbFAxq59Yastjvfh9CWmrekhvZaHJfGN4vPYaPH52rXA"
      case "QmTL4Uraj8mRREETwgv1hNo3pzJZ2WzuxYqnEDQueLjjAa":
        return "QmXHfwE4paGT7MnW5Fv9ZcuYDn6M1B4PCxFtpgmSbUE9VB"
      case "QmU9McQUt7VbHaq3CBcn7DJSFMPzjHRarWV6JNHGf4Nq3k":
        return "QmXQfKSkUdEzPn7UgXmTkpAf6TDNys2vjVCcTWTj42jmet"
      case "QmUboC1BcvwBPQBGk6QSphrAmBHzt1SQwZcVSYGhxzT7Lr":
        return "QmTBwSFBytRkwCednLhfsW6DG4ZCNSzo5ZigRQXsAGts4W"
      case "QmUrEXCCF7Bj2sXo929y1HMTMXmXkpLgtusU9LYu9qNUhA":
        return "QmWL7DzDimUrPpk4VCu84qkaH1RJhZhkcEVgDG784w2bsk"
      case "QmWeB6raYMksDPpd6oQhJ4BAb5AzP3zwWnQKNeXA8nEPyw":
        return "QmUURuK76k7HDiMeZAw1rXkmhESMLtha7VMHsDiSRxZFPi"
      case "QmXF5ESZm91fvQeE1Mc9sW93s4ptHhnrN8bF4MCv1eYtc8":
        return "QmQ4fsPE8F2YtpEVs45sfsb9tfnb3NDtFqnoMfZx6UhgPH"
      case "QmY34PMF2rVJvUcn1x2ibfVGYeHNFFYXeukhYneiihEV2o":
        return "QmQDCQmFXPDJGfjkRnQ37ao4L1ZuFEUR2EdMFbk4QyH1fW"
      case "QmZJSSjVXocxSTYysw12Rm58LMAB5czHtRuf9QaUyDwMAN":
        return "QmbQRRJ9grn6kCGRp4SYE7Z2ZUvs95mLCN1Dg4iN5Jt6Qw"
      default:
        return null
    }
}

