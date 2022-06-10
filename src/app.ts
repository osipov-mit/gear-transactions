#!/usr/bin/node

import { CreateType, GearApi } from '@gear-js/api';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import sendMessage from './sendMessage';
import submitProgram from './submitProgram';
import { IConfigYaml, IUploadedProgram } from './interfaces';
import transferBalance from './transferBalance';

const [pathToConfigFile] = process.argv.slice(2);

const main = async () => {
  const config = yaml.load(readFileSync(pathToConfigFile, 'utf-8')) as IConfigYaml;
  const api = await GearApi.create({ providerAddress: config.ws });

  for (let transfer of config.transfer) {
    await transferBalance(api, transfer);
  }

  const uploadedPrograms = new Map<number, IUploadedProgram>();

  console.log(`*** UPLOAD PROGRAMS ***`);
  for (let program of config.programs) {
    const { programId, meta } = await submitProgram(api, program);
    uploadedPrograms.set(program.id, { id: programId, meta });
    console.log(`✅ PASSED: ${program.name}\n   PROGRAM_ID: ${programId}`);
  }

  console.log(`\n*** SEND MESSAGES ***`);
  for (let message of config.messages) {
    const program = uploadedPrograms.get(message.destination);
    if (message.setAddress) {
      const address = message.setAddress.startsWith('program')
        ? uploadedPrograms.get(parseInt(message.setAddress.split('_')[1])).id
        : '';
      message.payload = JSON.parse(JSON.stringify(message.payload).replace(message.setAddress, address));
    }
    try {
      const messageId = await sendMessage(api, message, program);
      console.log(`✅ PASSED: ${message.id}\n   MESSAGEID: ${messageId}`);
    } catch (error) {
      console.log(`❌ FAILED: ${message.id}`);
      console.log(error);
      const testPayload = CreateType.create(program.meta.handle_input, message.payload, program.meta);
      console.log(testPayload.toU8a());
      process.exit(1);
    }
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
