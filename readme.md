# Secret NFT API

![Ternoa logo](https://user-images.githubusercontent.com/15839293/135729256-e05e614c-9359-424c-bb52-87b97d475ed9.png)


"SecretNFT API" is the server used by the "SecretNFT" application. 
This API's purpose is to get data related to NFTs (from blockahin to offchain Data), users, follows, likes, ...

Visit [SecretNFT](https://www.secret-nft.com/)

## Summary
- [Installation](#Installation)
- [Usage](#Usage)
- [Information](#Information)
- [Environment variables](#Environment-variables)
- [API Endpoints](#API-Endpoints)
    - [Categories](#Categories)
    - [Follows](#Follows)
    - [NFTs](#NFTs)
    - [Users](#Users)
- [Contributing](#Contributing)
- [License](#License)

## Installation
Using NPM
```bash
  git clone https://github.com/capsule-corp-ternoa/nft-marketplace-api.git
  cd nft-marketplace-api
  npm install
```

## Usage
You need to set up environnent variables to target the correct API.
You can find at more information on the Environment variables section.

To run in development
```bash
npm run dev
```
To build the project
```bash
npm run build
```

## Information
Secret NFT API is used by Secret NFT and relies on the Ternoa API to get users data. Don't hesitate to have a look on those two repositories on our organisation [github](https://github.com/capsule-corp-ternoa.)

## Environment variables
To run this project, you will need to add the following environment variables to your .env file

| VARIABLE | VALUE | USAGE |
| :---|---|--- |
| LOG_LEVEL | trace, debug, info, warn, error, fatal, silent | Desired log level, see [Pino](https://github.com/pinojs/pino)  |
| INDEXER_URL | https://indexer.chaos.ternoa.com/ | Address of Ternoa's blockchain indexer |
| MONGODB_URI | mongodb+srv://***:***@***?retryWrites=true&w=majority | Mongo DB URI |
| PORT | 3000 | Port to start the app, default: 3000 |
| SENTRY_DSN | https://projectId@sentry.io/x | The url to your sentry project if you want to monitor activity |
| SENTRY_ENV | development or production or ... | Allow to separate monitoring on environment |

## API Endpoints
### Categories
`GET /api/categories/` : Gets all categories


### Follows
`GET /api/follow/followers/:walletId` : Gets all the followers of specified wallet id user

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletId | request param | yes | wallet address of the user |
| page | query param | no | page number (1) |
| limit | query param | no | number of elements per page (10) |
| certifiedOnly | query param | no | Get only certified follower (true, false) |
| nameOrAddressSearch | query param | no | filter data based on follower name or address (Leo, 5HGa...) |

`GET /api/follow/followed/:walletId` : Gets all the followed users of specified wallet id user

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletId | request param | yes | wallet address of the user |
| page | query param | no | page number (1) |
| limit | query param | no | number of elements per page (10) |
| certifiedOnly | query param | no | Get only certified followed (true, false) |
| nameOrAddressSearch | query param | no | filter data based on followed name or address (Leo, 5HGa...) |

`GET /api/follow/countFollowers/:walletId` : Gets the number of followers of specified wallet id user

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletId | request param | yes | wallet address of the user |

`GET /api/follow/countFollowed/:walletId` : Gets the number of followed user of specified wallet id user

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletId | request param | yes | wallet address of the user |

`GET /api/follow/isUserFollowing` : Return true if walletIdFollower is following walletIdFollowed 

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletIdFollower | query param | yes | wallet address of the follower user |
| walletIdFollowed | query param | yes | wallet address of the followed user |

`POST /api/follow/follow` :  Creates a follow from walletIdFollower to walletIdFollowed

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletIdFollower | query param | yes | wallet address of the follower user |
| walletIdFollowed | query param | yes | wallet address of the followed user |

`POST /api/follow/unfollow` :  Removes a follow from walletIdFollower to walletIdFollowed

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletIdFollower | query param | yes | wallet address of the follower user |
| walletIdFollowed | query param | yes | wallet address of the followed user |

### NFTs
`GET /api/nfts/` : Gets all NFTs

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| page | query param | no | page number (1) |
| limit | query param | no | number of elements per page (10) |
| marketplaceId | query param | no | Get only nfts from specific marketplace (0) |
| listed | query param | no | Get only listed or not listed nfts (0, 1) |

`GET /api/nfts/owner/:id` : Gets all NFTs

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | wallet address of owner |
| page | query param | no | page number (1) |
| limit | query param | no | number of elements per page (10) |
| marketplaceId | query param | no | Get only nfts from specific marketplace (0) |
| listed | query param | no | Get only listed or not listed nfts (0, 1) |

`GET /api/nfts/creator/:id` : Gets all NFTs

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | wallet address of creator |
| page | query param | no | page number (1) |
| limit | query param | no | number of elements per page (10) |
| listed | query param | no | Get only listed or not listed nfts (0, 1) |

`GET /api/nfts/stat/:id` : Gets users NFTs statistics (Number of owned, created, on sale, not on sale, followers, followed)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | wallet address of user |
| marketplaceId | query param | no | Get only nfts from specific marketplace (0) |

`GET /api/nfts/category/` : Gets NFTs by categorie codes or without categories

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| page | query param | no | page number (1) |
| limit | query param | no | number of elements per page (10) |
| marketplaceId | query param | no | Get only nfts from specific marketplace (0) |
| listed | query param | no | Get only listed or not listed nfts (0, 1) |
| codes | query param | no | Categorie codes or omit to get without categories (&codes=001, &codes=001&codes=002) |

`GET /api/nfts/:id` : Gets NFT by id

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | id of NFT to get |
| ip | request param | no | ip of user to prevent spam views |
| incViews | query param | no | increment views or not (true, false) |
| viewerWalletId | query param | no | wallet address of the viewer, if connected |

`GET /api/nfts/getSameGroupNFTS/:id` : Gets NFTs with the same serie as specified NFT id

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | id of NFT serie to get |
| page | query param | no | page number (1) |
| limit | query param | no | number of elements per page (10) |

### Users
`PATCH /api/users/reviewRequested/:id` : Allow user to request review of their account (use the Ternoa-api)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | id of user to review request for |

`GET /api/users/` : Gets all users (use the Ternoa-api)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| page | query param | no | page number (1) |
| limit | query param | no | number of elements per page (10) |

`GET /api/users/verifyTwitter/:id` : Verify Twitter username of specified user's id (use the Ternoa-api)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | id of user to review request for |

`GET /api/users/getUsers/` : Get users by wallet ids (use the Ternoa-api)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletIds | query param | yes | wallet addresses (?walletIds=5HGa..., ?walletIds=5HGa...&walletIds=5HTa...) |

`GET /api/users/:id` : Get user by wallet id (use the Ternoa-api)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | wallet address |
| ip | request param | no | ip of user to prevent spam views |
| incViews | query param | no | increment views or not (true, false) |
| viewerWalletId | query param | no | wallet address of the viewer, if connected |

`GET /api/users/:id/caps` : Get user's caps balance

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | wallet address of user to get balance |

`GET /api/users/:id/liked` : Get user's liked NFTs

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| id | request param | yes | wallet address of user to get likes |
| page | query param | no | page number (1) |
| limit | query param | no | number of elements per page (10) |

`POST /api/users/create` : Create a new user if it does not exist (use the Ternoa-api)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletId | body param | yes | wallet address of user to create |

`POST /api/users/like` : Like an NFT (use the Ternoa-api)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletId | query param | yes | wallet address of user |
| nftId | query param | yes | NFT id to like |
| serieId | query param | yes | NFT serieId to like |

`POST /api/users/unlike` : Unike an NFT (use the Ternoa-api)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletId | query param | yes | wallet address of user |
| nftId | query param | yes | NFT id to like |
| serieId | query param | yes | NFT serieId to like |

`POST /api/users/:walletId` : Update a user (use the Ternoa-api, must be signed by wallet)

Parameters: 
| PARAMETER | TYPE | MANDATORY | USE |
| :---|---|---|---|
| walletId | request param | yes | wallet address of user to update |
| name | body param | yes | username |
| customUrl | body param | no | user's given url (url to showcase for example) |
| bio | body param | no | user's bio |
| twitterName | body param | no | user's twitter name |
| personalUrl | body param | no | user's personal website url |
| picture | body param | no | user's picture url |
| banner | body param | no | user's banner url |

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT ?](https://choosealicense.com/licenses/mit/)
