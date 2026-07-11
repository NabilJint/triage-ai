/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _gmailHelpers from "../_gmailHelpers.js";
import type * as agent__helpers from "../agent/_helpers.js";
import type * as agent_autoRetry from "../agent/autoRetry.js";
import type * as agent_checkInboxes from "../agent/checkInboxes.js";
import type * as agent_classifyEmail from "../agent/classifyEmail.js";
import type * as agent_draftReply from "../agent/draftReply.js";
import type * as agent_lib from "../agent/lib.js";
import type * as agent_regenerateDraft from "../agent/regenerateDraft.js";
import type * as agent_retryTriage from "../agent/retryTriage.js";
import type * as agent_triageWorkflow from "../agent/triageWorkflow.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as decisions from "../decisions.js";
import type * as emailListenerErrors from "../emailListenerErrors.js";
import type * as emails from "../emails.js";
import type * as gmailAccounts from "../gmailAccounts.js";
import type * as http from "../http.js";
import type * as inboxConnections from "../inboxConnections.js";
import type * as triage from "../triage.js";
import type * as userProfiles from "../userProfiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _gmailHelpers: typeof _gmailHelpers;
  "agent/_helpers": typeof agent__helpers;
  "agent/autoRetry": typeof agent_autoRetry;
  "agent/checkInboxes": typeof agent_checkInboxes;
  "agent/classifyEmail": typeof agent_classifyEmail;
  "agent/draftReply": typeof agent_draftReply;
  "agent/lib": typeof agent_lib;
  "agent/regenerateDraft": typeof agent_regenerateDraft;
  "agent/retryTriage": typeof agent_retryTriage;
  "agent/triageWorkflow": typeof agent_triageWorkflow;
  auth: typeof auth;
  crons: typeof crons;
  dashboard: typeof dashboard;
  decisions: typeof decisions;
  emailListenerErrors: typeof emailListenerErrors;
  emails: typeof emails;
  gmailAccounts: typeof gmailAccounts;
  http: typeof http;
  inboxConnections: typeof inboxConnections;
  triage: typeof triage;
  userProfiles: typeof userProfiles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
