> Installation instructions are below

- Creating an eCommerce platform was a new task to me, so first of all I had to spend some time clarifying the task itself and the possible ways to accomplish it with [Claude](https://claude.ai/share/2f55f1fc-2036-41c0-9647-efa4614ecc50).

- In the beginning I was confused with the `initial.md` file idea since I was almost sure that such app cannot be done in high quality in just one prompt or even session.

- Also, I never vibe-coded an app with giving almost all the development work to the Agent and just checking the result, so I had to clarify, what actual the "AI Boilerplate" exactly is (what files, etc.).

- After that, I examine the Cline specifics, since I didn't use it before.

- Installed the Google [modern web guidance](https://developer.chrome.com/docs/modern-web-guidance) skill and the DESIGN.md file picked from the [TypeUI web collection](https://www.typeui.sh/design-skills).

- Gave the Assignment description to the `sonnet-4.5` and asked to create the AI boilerplate under the `/ai-blueprint` directory.

- Discussed the possibility of the one-prompt creation and the most efficient task splitting with Claude.

- Asked agent to split the development flow into `session.md` files and create one for each step with comprehensive description.
  On the 7 file creation, noticed that each creation takes too much money and continued in a new session.

- Setup the DB.

- Initiated the development process from Session-1 .md file.

---

- The result UI looks clear, but not as "fancy" as we'd like it to be.

- During the planning, some sessions missed small but important details (no cart badge creation step in session 7, no header creation in step 8)

- Minor twicks in login form validation? Checkout process?

- AI forgot to manage the state loss on page reload in React. Might worth mentioning it explicitly.

- UI shift comparing two pages. AI couldn't notice it by itself or was added in the sessions .md

- AI allowed to change the account email which should be managed strictly.

- AI exposed the account ID

- Error UI is not generated. API responde with 400 on `/register` and on account edit

- Any other security naunses (token storage / account info storage / password storage etc.) might worth checking

- When creating tests AI added `data-testid` instead of relying on accessibility improvements.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- MySQL 8+

### Setup

1. **Create the database:**

   ```bash
   mysql -u root -p
   ```

   In the MySQL shell:

   ```sql
   CREATE DATABASE ecommerce;
   exit;
   ```

2. **Configure environment variables** — edit `ecommerce-platform/apps/api/.env` and set your credentials:

   ```
   DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/ecommerce"
   JWT_SECRET=your-secret
   REFRESH_TOKEN_SECRET=your-refresh-secret
   ```

3. **Install dependencies:**

   ```bash
   cd ecommerce-platform
   npm install
   ```

4. **Run migrations and seed the database:**

   ```bash
   cd apps/api
   npm run prisma:migrate   # enter "init" when prompted for migration name
   npm run prisma:seed
   cd ../..
   ```

5. **Start the development servers** (API on :3001, frontend on :5173):

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173).
