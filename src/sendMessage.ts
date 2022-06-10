import { GearApi, GearKeyring } from '@gear-js/api';
import { IMessage, IUploadedProgram } from './interfaces';
import { createAccount } from './utils';
import { strict as assert } from 'assert';

async function listenToMessagesDispatched(api: GearApi) {
  const allStatuses = new Map<string, boolean>();
  const unsub = await api.gearEvents.subscribeToGearEvent('MessagesDispatched', ({ data: { statuses } }) => {
    if (statuses.size > 0) {
      statuses.forEach((value, key) => {
        allStatuses.set(key.toHex(), value.isSuccess);
      });
    }
  });
  return (messageId: string, panic = false) => {
    unsub();
    return panic ? !allStatuses.get(messageId) : allStatuses.get(messageId);
  };
}

export default async function (
  api: GearApi,
  { seed, gasLimit, value, payload, panic }: IMessage,
  { id, meta }: IUploadedProgram,
) {
  const account = await createAccount(seed);
  gasLimit =
    gasLimit ||
    (await api.program.gasSpent.handle(GearKeyring.decodeAddress(account.address), id, payload, 0, meta)).toString();

  api.message.submit({ destination: id, payload, gasLimit, value }, meta);
  const checkMessageDispatchedStatus = await listenToMessagesDispatched(api);
  const messageId: string = await new Promise((resolve, reject) => {
    api.message.signAndSend(account, ({ events }) => {
      events.forEach(({ event }) => {
        const { method, data } = event;
        if (method === 'MessageEnqueued') {
          resolve(data[0].toHex());
        } else if (method === 'ExtrinsicFailed') {
          reject(api.getExtrinsicFailedError(event));
        }
      });
    });
  });
  assert.ok(checkMessageDispatchedStatus(messageId, panic), `Message dispatched failed`);
  return messageId;
}
