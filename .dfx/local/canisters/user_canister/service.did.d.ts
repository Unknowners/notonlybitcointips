import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AccountId = string;
export interface Campaign {
  'id' : CampaignId,
  'accountId' : AccountId,
  'owner' : UserId,
  'name' : string,
  'createdAt' : bigint,
  'acceptedTokens' : Array<string>,
  'subaccount' : Uint8Array | number[],
  'description' : string,
}
export type CampaignId = string;
export interface TransferRequest {
  'campaignId' : CampaignId,
  'targetAddress' : string,
  'amount' : bigint,
}
export interface User {
  'id' : UserId,
  'name' : string,
  'createdAt' : bigint,
  'email' : [] | [string],
}
export interface UserCanister {
  'clearUsers' : ActorMethod<[], undefined>,
  'createCampaign' : ActorMethod<[string, string, Array<string>], string>,
  'createUser' : ActorMethod<[string, [] | [string]], boolean>,
  'debugCompare' : ActorMethod<[UserId], Array<[string, Principal, boolean]>>,
  'debugPrincipal' : ActorMethod<[UserId], string>,
  'getAccountBalance' : ActorMethod<[AccountId], bigint>,
  'getAllCampaigns' : ActorMethod<[], Array<Campaign>>,
  'getAllUsers' : ActorMethod<[], Array<User>>,
  'getCampaign' : ActorMethod<[string], [] | [Campaign]>,
  'getCampaignAccountId' : ActorMethod<[string], [] | [AccountId]>,
  'getCampaignSubaccount' : ActorMethod<[string], [] | [Uint8Array | number[]]>,
  'getPrincipal' : ActorMethod<[], Principal>,
  'getUserCampaigns' : ActorMethod<[UserId], Array<Campaign>>,
  'userExists' : ActorMethod<[], boolean>,
  'whoami' : ActorMethod<[], Principal>,
  'withdrawFunds' : ActorMethod<[TransferRequest], boolean>,
}
export type UserId = Principal;
export interface _SERVICE extends UserCanister {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
