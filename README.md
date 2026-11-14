# CI/CD demo app (Frontend Development 2)

A small Expo app (login screen + task list) used in the lecture
**"From first push to real user feedback"**. It runs on Android, iOS and in the browser.

| Tool | What it tests | Where |
|---|---|---|
| ESLint + TypeScript | code style, type errors | `eslint.config.js`, `tsconfig.json` |
| Jest | pure functions (unit tests) | `__tests__/validation.test.ts`, `__tests__/tasks.test.ts` |
| React Native Testing Library | screens (component tests) | `__tests__/LoginScreen.test.tsx`, `__tests__/HomeScreen.test.tsx` |
| Playwright | the web build in Chromium + WebKit (iPhone) | `e2e/`, `playwright.config.ts` |
| Maestro | the real Android app in an emulator | `.maestro/` |

Every interactive element has a `testID`, so all test tools find the same elements.

## Lecture branches

Each branch builds on the previous one. If a live step fails, check out the next branch.
All branches have the same `package.json`, so you never need to reinstall when you switch.

| Branch | Adds | Section |
|---|---|---|
| `step-0-start` | App + Jest/RNTL tests, no CI | 2. Testing pyramid |
| `step-1-ci` | `.github/workflows/ci.yml`: lint + Jest on pull requests | 4. GitHub Actions |
| `step-2-playwright` | Playwright tests + `e2e-web` job in `ci.yml` | 5. E2E (web) |
| `step-3-maestro` | Maestro flow + `maestro.yml` (nightly + manual) | 5. E2E (native) |
| `step-4-preview` | `preview.yml` (Vercel link per PR) + `eas.yml` + `eas.json` | 6. Users |

```bash
git switch step-2-playwright
```

## Setup

```bash
npm ci
```

## Commands for every demo

### Run the app

```bash
npx expo start            # press w for web, a for Android, or scan the QR code with Expo Go
```

### Lint, type check, unit and component tests

```bash
npm run lint
npm run typecheck
npm test
npm test -- --watch       # re-runs tests while you edit (nice for the live demo)
```

### Playwright (web end-to-end)

```bash
npm run build:web                 # expo export --platform web -> ./dist
npx playwright install chromium webkit   # once per machine
npm run test:e2e                  # starts a local server on :3000 and runs the tests
npx playwright test --ui          # interactive mode, good for showing on the projector
npx playwright show-report        # open the HTML report of the last run
```

### Maestro (native end-to-end, Android)

1. Start an emulator: Android Studio > Device Manager, or in PowerShell
   `& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_2`.
2. Build and install a release APK (no Metro server needed):

   ```bash
   npx expo prebuild --platform android
   cd android
   ./gradlew assembleRelease -PreactNativeArchitectures=x86_64
   adb install -r app/build/outputs/apk/release/app-release.apk
   cd ..
   ```

   Or use `npx expo run:android --variant release`.

3. Run the flows:

   ```bash
   maestro test .maestro
   maestro studio                    # point-and-click tool to write new flows
   ```

The `android/` folder is generated and is in `.gitignore` (Continuous Native Generation).

## GitHub Actions workflows

| File | Trigger | What it does |
|---|---|---|
| `ci.yml` | every PR + push to main | lint, type check, Jest; then Playwright against the web build |
| `maestro.yml` | nightly 02:00 UTC + "Run workflow" button | builds APK, starts emulator, runs Maestro |
| `preview.yml` | every PR | deploys the web build to Vercel and comments the link on the PR |
| `eas.yml` | push to main / "Run workflow" button | EAS Update to the `preview` channel / new EAS Android preview build |

### Secrets

Never put tokens in the code. Add them under
**Settings > Secrets and variables > Actions > New repository secret**, or with the GitHub CLI:

```bash
gh secret set EXPO_TOKEN
```

| Secret | Where to get it |
|---|---|
| `EXPO_TOKEN` | expo.dev > Account settings > Access tokens > Create token |
| `VERCEL_TOKEN` | vercel.com > Account settings > Tokens > Create |
| `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | run `npm run build:web` and then `npx vercel deploy dist` once locally; the IDs are in `dist/.vercel/project.json` |

Note: secrets are not available to pull requests from forks, so the preview workflow only works for branches in this repository.

### One-time setup for EAS (section 6)

```bash
eas login
eas init                  # creates the project on expo.dev and adds its id to app.json
eas update:configure      # adds the update URL and runtimeVersion to app.json
eas build --platform android --profile preview   # first build; testers install this APK
```

After that, `eas update --channel preview` (or the `eas.yml` workflow) sends new JavaScript
to everyone who installed the preview build.
