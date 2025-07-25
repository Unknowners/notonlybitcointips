import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Campaign {
  'id' : CampaignId,
  'owner' : UserId,
  'name' : string,
  'createdAt' : Time,
  'acceptedTokens' : Array<string>,
  'description' : string,
}
export type CampaignId = string;
export type Time = bigint;
export interface User {
  'id' : UserId,
  'name' : string,
  'createdAt' : Time,
  'email' : [] | [string],
}
export type UserId = Principal;
export interface _SERVICE {
  'clearUsers' : ActorMethod<[], undefined>,
  'createCampaign' : ActorMethod<[string, string, Array<string>], string>,
  'createUser' : ActorMethod<[string, [] | [string]], boolean>,
  'debugCompare' : ActorMethod<
    [Principal],
    Array<[string, Principal, boolean]>
  >,
  'debugPrincipal' : ActorMethod<[Principal], string>,
  'getAllCampaigns' : ActorMethod<[], Array<Campaign>>,
  'getAllUsers' : ActorMethod<[], Array<User>>,
  'getCampaign' : ActorMethod<[CampaignId], [] | [Campaign]>,
  'getUserCampaigns' : ActorMethod<[UserId], Array<Campaign>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
