import { Hex, Metadata } from '@gear-js/api';

export interface IProgram {
  id: number;
  name: string;
  seed: string;
  initPayload?: any;
  gasLimit?: string | number;
  value?: string | number;
  pathToOpt: string;
  pathToMeta: string;
}

export interface IMessage {
  destination: number;
  panic: boolean;
  id: number;
  seed: string;
  setAddress?: string;
  payload: any;
  gasLimit?: string | number;
  value?: string | number;
}

export interface ITransfer {
  from: string;
  to: string;
  value: number | string;
}

export interface IConfigYaml {
  ws: `ws://${string}` | `wss://${string}`;
  transfer: ITransfer[];
  programs: IProgram[];
  messages: IMessage[];
}

export interface IUploadedProgram {
  id: Hex;
  meta: Metadata;
}
