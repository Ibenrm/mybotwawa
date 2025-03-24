import { CommandSay } from "./commands/CommandSay";
import { CommandPay } from "./commands/CommandPay";
import { CommandMeme } from "./commands/CommandMeme";
import { CommandMusikYT } from "./commands/CommandMusikYT"
import Command from "./commands/Command";
import { CommandInstagram } from "./commands/CommandInstagram";
import { CommandChatGPT } from "./commands/CommandChatGPT";

const commands: Command[] = [
    new CommandSay(),
    new CommandPay(),
    new CommandMeme(),
    new CommandMusikYT(),
    new CommandInstagram(),
    new CommandChatGPT()
];

export default commands