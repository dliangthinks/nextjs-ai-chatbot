# My First Steps

1. change domain name(done)
2. clone the repo in vs code (done)
3. install pnpm and run locally (done)
4. change verbiage in overview page (done)
5. add logo (tried generating other svg but the path fill is very complex; pause for now with only the chat logo)
6. remove the "deploy with vercel" from *chat-header* (done)
7. change title "chatbot" to "technology training AI playground" from *app-sidebar* (done)
8. change model list to include claude sonnet and flash, o1-mini for reasoning (done)
9. change the test questions from *suggested-actions* (done)

###User monitoring
go to neon:https://console.neon.tech
this is postgres database, and in the tables section there is a user table which stores all users. But I'm not sure what is the best way to provision this.
local user monitoring: run `drizzle-kit studio` to see the user table.

### Local Development

To develop the chatbot template locally, you can clone the repository and link it to your Vercel project. This will allow you to pull the environment variables from the Vercel project and use them locally.

```bash
git clone https://github.com/<username>/<repository>
cd <repository>
pnpm install

vercel link
vercel env pull
```

After linking the project, you can start the development server by running:

```bash
pnpm dev
```

The chatbot template will be available at `http://localhost:3000`.
