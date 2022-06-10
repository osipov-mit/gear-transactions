import { GearApi } from '@gear-js/api';
import { BN } from '@polkadot/util';
import { ITransfer } from './interfaces';
import { createAccount } from './utils';

export default async function (api: GearApi, transferConfig: ITransfer) {
  const from = await createAccount(transferConfig.from);
  const to = await createAccount(transferConfig.to);
  await api.balance.transferBalance(from, to.address, new BN(transferConfig.value));
}
