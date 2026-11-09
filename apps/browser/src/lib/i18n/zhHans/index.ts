import { chrome } from "./chrome";
import { general } from "./general";
import { profiles } from "./profiles";
import { tabs } from "./tabs";
import { privacy } from "./privacy";
import { tools } from "./tools";
import { inline } from "./inline";
import { commands } from "./commands";

export const zhHans: Record<string, string> = { ...chrome, ...general, ...profiles, ...tabs, ...privacy, ...tools, ...inline, ...commands };
