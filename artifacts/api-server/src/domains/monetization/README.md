# `monetization` domain

Reward points, RevenueCat hooks, and subscription gating live here.

Today this is a thin wrapper — the reward points endpoint is implemented in
`domains/players/profileStore.ts` (reward points are part of the player
profile) and the in-game ad-watch reward is implemented in
`domains/economy/reward.ts`. As monetization features grow (subscriptions,
SKUs, gating), put the orchestration logic here and call into the player
and economy domains.
