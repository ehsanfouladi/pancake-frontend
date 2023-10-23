export const getNftImage = (collectionAddress) =>{
    switch (collectionAddress){
        case '0xbe548336c849aa2B7415A62702c5F3D5f64D9F7e':
            return 'images/nfts/cadinu_nft_artist_250.png'
            break;
        case '0xcB6165e1fFA6426B5bB596ec806Cae3c356ad366':
            return 'images/nfts/cadinu_nft_business_250.png'
            break;
        case '0xC0Dda5d8706ccE72487438Ea4Af5dc03Ef6B12a2':
            return 'images/nfts/cadinu_nft_cowboy_250.png'
            break;
        case '0xc24397e0766CC7E52Ce0D281bef590e644226312':
            return 'images/nfts/cadinu_nft_loyalty_250.png'
            break;
        case '0xeFe7b3853e05C6f39f2c57fe4566cb0A6bc640Cd':
            return 'images/nfts/cadinu_nft_futuristic_250.png'
            break;
        default:
        case '0x933834fe626BDD84A4F7a4Db96132a1029a80fbd':
            return 'images/nfts/cadinu_nft_hunter_250.png'
            break;
    }  
  }