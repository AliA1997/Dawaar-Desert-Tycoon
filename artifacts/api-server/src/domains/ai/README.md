# `ai` domain

Server-side NPC decision policy (buy / build / trade / jail handling, "thinking"
delay, server-driven NPC turn execution).

**Status:** not yet implemented on the server. NPC turns are currently driven
from the client in `artifacts/dawaar/context/GameContext.tsx`. Porting that
logic to this domain is tracked as a follow-up task — see the project task list.
