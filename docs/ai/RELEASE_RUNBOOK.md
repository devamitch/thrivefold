# RELEASE RUNBOOK — commit, push, EAS build, submit to Internal and Closed testing

Authorised by the owner: submit to the **internal** and **closed** testing tracks. Not authorised: production/store profile, promoting a release, changing store listing, or anything that costs money beyond normal EAS builds.

## 0. Discover, do not assume
Read `eas.json` and `app.json` (or `app.config.*`). Profile names in the owner's notes: `internal`, `closed-draft` (manual rollout), `store`. Confirm the exact names, `appVersionSource`, `autoIncrement`, and Android `releaseStatus` per profile. Use only the first two. Check for an existing `.eas/workflows/*.yml` and reuse it.

### Known Gradle & EAS Failure Modes (Resolved):
- **Daemon Crash during `minifyReleaseWithR8`**: The Linux OOM killer terminates Gradle daemon if JVM memory is left at default `-Xmx2048m` with SDK 58 C++ modules and R8. Resolved by configuring `org.gradle.jvmargs: "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+UseParallelGC"` in `app.json` under `expo-build-properties`.
- **C++ Multi-Arch Runner Exhaustion**: Building 4 ABIs (`armeabi-v7a,arm64-v8a,x86,x86_64`) concurrently causes clang++ processes to exhaust runner RAM. Pinned to `reactNativeArchitectures: "arm64-v8a"`.
- **Local Keystore Ignored**: When `credentialsSource: "local"` is set in `eas.json`, `.easignore` must whitelist `!credentials.json`, `!setu-upload.jks`, and `!google-services.json` so the release signing keystore is present on the builder.

## 1. Pre-flight (all must pass, show output)
1. `git status`: clean except intended files. `git log -1` and branch name.
2. `pnpm compile`, `pnpm lint`, full unit tests (`pnpm test`), DB tests if present (`pnpm test:db`), `npx expo-doctor` if configured.
3. The AI self-test (P0) passes on the connected device with a **release** or `--variant release` build.
4. `grep` the diff and `git diff --cached` for secrets (keys, `.env`, keystore). Do not print values.
5. Release notes written (what changed, user-visible items only).
6. Version: if `appVersionSource` is `remote` and `autoIncrement` is set, EAS handles versionCode. Otherwise bump `versionCode` once and commit it.

## 2. Commit and push
```
git add <explicit paths>
git commit -m "feat(ai): <summary of verified milestone>"
git push origin <current-branch>
```
No force push. If the push is rejected, stop and report.

## 3. Build and submit (CLI path)
```
eas build --platform android --profile internal --non-interactive
eas submit --platform android --profile internal --latest --non-interactive
eas build --platform android --profile closed-draft --non-interactive
eas submit --platform android --profile closed-draft --latest --non-interactive
```
Use the build id from the build output (`--id`) instead of `--latest` if two builds are in flight. If both profiles are the same binary, build once and submit the same artifact to both tracks, if `eas.json` allows it.

## 3b. Workflow path (preferred if the project uses EAS Workflows)
Sketch only. **Verify the schema against the current docs (`docs.expo.dev/eas/workflows`) with `curl` before use**:
```yaml
name: android-testing
on:
  workflow_dispatch: {}
jobs:
  build:
    type: build
    params: { platform: android, profile: internal }
  submit_internal:
    needs: [build]
    type: submit
    params: { build_id: ${{ needs.build.outputs.build_id }}, profile: internal }
```
Run with `eas workflow:run .eas/workflows/<file>.yml`. Add the closed-testing submit job the same way once the internal job is proven.

## 4. After submit
1. Record: build id, artifact URL, versionCode, track, submit status, timestamp.
2. Closed testing stays a **draft** if the profile says so. The owner does the final "send for review / roll out" in Play Console. Say that clearly in the report. Do not claim it is live.
3. Install the exact EAS artifact on the device (`adb install -r`), cold-launch, run Scenarios A, D, E, F and the self-test, and check `adb logcat` for crashes and native-module errors.
4. If a step needs credentials, a Play Console action, or a human approval, stop and report exactly that step.

## 5. Rollback
Do not delete releases. If a bad build was submitted: stop, report, and let the owner halt the rollout in Play Console. Fix forward with a new versionCode.
