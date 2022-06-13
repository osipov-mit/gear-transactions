1. Set the gear node address in `transactions.yaml` file
2. Run next commands

```bash
yarn install
yarn build
yarn start
```

## Decode payload

Arguments:

1. Path to file with metadata. Its name ends with .meta.wasm
2. Type name for decoding
3. Payload

```bash
node decode-payload.js ./nft_marketplace.meta.wasm handle_output 0x0012973d154d96b119f7d0ffafed636971381969cdc8213c06f92fe3cf6a41642cd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d000000000000000000000000000000000000000000000000000000000000000001a0860100000000000000000000000000
```

This is the result:

```json
{
  "MarketDataAdded": {
    "nftContractId": "0x12973d154d96b119f7d0ffafed636971381969cdc8213c06f92fe3cf6a41642c",
    "owner": "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",
    "tokenId": "0",
    "price": "100,000"
  }
}
```

- To decode payload from `UserMessageSent` event you need to use `handle_output` type in the most cases.
- To decode payload from `send_message` extrinsic you need to use `handle_input` type.
