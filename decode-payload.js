const { CreateType, getWasmMetadata } = require('@gear-js/api');
const { readFileSync } = require('fs');

const [pathToMeta, type, payload] = process.argv.slice(2);

const main = async () => {
  const metaWasm = readFileSync(pathToMeta);
  const metadata = await getWasmMetadata(metaWasm);
  if (!Object.keys(metadata).includes(type)) {
    throw new Error(`Choose one of these types to decode bytes: ${Object.keys(metadata)}`);
  }
  const decoded = CreateType.create(metadata[type], payload, metadata).toHuman();
  console.log(decoded);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
