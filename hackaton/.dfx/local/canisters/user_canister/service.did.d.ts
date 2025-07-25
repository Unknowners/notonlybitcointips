import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Time = bigint;
export interface User {
  'id' : UserId,
  'username' : string,
  'createdAt' : Time,
  'wallet' : string,
}
export type UserId = Principal;
export interface _SERVICE {
  'getAllUsers' : ActorMethod<[], Array<User>>,
  'getUser' : ActorMethod<[UserId], [] | [User]>,
  'registerUser' : ActorMethod<[string, string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
