import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Campaign {
  'id' : CampaignId,
  'owner' : UserId,
  'name' : string,
  'createdAt' : bigint,
  'acceptedTokens' : Array<string>,
  'description' : string,
}
export type CampaignId = string;
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
  'getAllCampaigns' : ActorMethod<[], Array<Campaign>>,
  'getAllUsers' : ActorMethod<[], Array<User>>,
  'getCampaign' : ActorMethod<[string], [] | [Campaign]>,
  'getMyCampaigns' : ActorMethod<[], Array<Campaign>>,
  'getPrincipal' : ActorMethod<[], Principal>,
  'getUserCampaigns' : ActorMethod<[UserId], Array<Campaign>>,
  'userExists' : ActorMethod<[], boolean>,
  'whoami' : ActorMethod<[], Principal>,
}
export type UserId = Principal;
export interface _SERVICE extends UserCanister {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
