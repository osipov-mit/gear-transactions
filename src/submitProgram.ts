import { CreateType, GearApi, GearKeyring, getWasmMetadata } from '@gear-js/api';
import { readFileSync } from 'fs';
import { IProgram } from './interfaces';
import { createAccount } from './utils';

export const checkInit = (api: GearApi, programId: string) => {
  let unsubs = [];
  let messageId = undefined;
  unsubs.push(
    api.gearEvents.subscribeToGearEvent('MessageEnqueued', (event) => {
      if (event.data.destination.eq(programId) && event.data.entry.isInit) {
        messageId = event.data.id.toHex();
      }
    }),
  );
  const resultPromise = Promise.race([
    new Promise((resolve) => {
      unsubs.push(
        api.gearEvents.subscribeToGearEvent('ProgramChanged', (event) => {
          if (event.data.id.eq(programId) && event.data.change.isActive) {
            resolve('success');
          }
        }),
      );
    }),
    new Promise((_, reject) => {
      unsubs.push(
        api.gearEvents.subscribeToGearEvent('UserMessageSent', (event) => {
          if (
            event.data.source.eq(programId) &&
            event.data.reply.unwrap()[0].eq(messageId) &&
            !event.data.reply.unwrap()[1].eq(0)
          ) {
            reject('failed');
          }
        }),
      );
    }),
  ]);

  return async () => {
    try {
      const result = await resultPromise;
      unsubs.forEach(async (unsubPromise) => {
        const unsub = await unsubPromise;
        unsub();
      });
      return result;
    } catch (error) {
      throw new Error('Program initialization failed');
    }
  };
};

export default async function (
  api: GearApi,
  { initPayload, pathToMeta, pathToOpt, seed, gasLimit, value, id }: IProgram,
) {
  const account = await createAccount(seed);
  const code = readFileSync(pathToOpt);
  const metaFile = readFileSync(pathToMeta);
  const meta = await getWasmMetadata(metaFile);
  gasLimit =
    gasLimit ||
    (
      await api.program.gasSpent.init(
        GearKeyring.decodeAddress(account.address),
        code,
        initPayload || '0x00',
        value,
        initPayload ? meta : undefined,
      )
    ).toString();
  const { programId } = api.program.submit({ code, initPayload, gasLimit }, initPayload ? meta : undefined);
  const waitForInit = checkInit(api, programId);
  api.program.signAndSend(account, ({ events }) => {
    events.forEach(({ event }) => {
      const { method } = event;
      if (method === 'ExtrinsicFailed') {
        console.log({ method, error: api.getExtrinsicFailedError(event) });
      }
    });
  });
  await waitForInit();
  return { programId, meta };
}
