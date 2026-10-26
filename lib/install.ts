export const REPO = "https://github.com/markwillcraft/morph";
const TARBALL = `${REPO}/archive/refs/heads/main.tar.gz`;

/** Unpacks only the skill folder out of the repository's tarball, straight into `skills`. */
export const installCommand = (skills: string) =>
  `mkdir -p ${skills} && curl -L ${TARBALL} | tar -xz --strip-components=2 -C ${skills} morph-main/skill/morph`;

export const INSTALL_COMMANDS = {
  claude: installCommand("~/.claude/skills"),
  codex: installCommand("~/.agents/skills"),
};

/** One message to paste into Claude Code or Codex: the agent works out which it is and installs Morph itself. */
export const INSTALL_PROMPT = `Install the Morph skill for me from ${REPO}.

1. Work out which agent you are and use its personal skills folder:
   - Claude Code: ~/.claude/skills
   - Codex: ~/.agents/skills
2. Download the repository and put only its skill/morph folder there, as <skills folder>/morph, replacing any older copy. Run the one command for your agent:
   - Claude Code: ${INSTALL_COMMANDS.claude}
   - Codex: ${INSTALL_COMMANDS.codex}
3. Check that <skills folder>/morph/SKILL.md exists, and list the folder so I can see it.
4. Tell me how to start: /morph in Claude Code, $morph in Codex. If the skill doesn't show up, tell me to restart the app.`;
