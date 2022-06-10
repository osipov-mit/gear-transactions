import { GearKeyring } from '@gear-js/api';
import { isHex } from '@polkadot/util';
import { KeyringPair } from '@polkadot/keyring/types';

const ACCOUNTS = { alice: '//Alice', bob: '//Bob', charlie: '//Charlie' };

export async function createAccount(seed: string): Promise<KeyringPair> {
  if (isHex(seed)) {
    return GearKeyring.fromSeed(seed);
  } else if (Object.keys(ACCOUNTS).includes(seed.toLowerCase())) {
    return GearKeyring.fromSuri(ACCOUNTS[seed]);
  } else if (seed.split(' ').length === 12) {
    return GearKeyring.fromMnemonic(seed);
  } else if (seed.startsWith('//')) {
    return GearKeyring.fromSuri(seed);
  }
  throw new Error(`Unable to create account with specified seed: ${seed}`);
}
