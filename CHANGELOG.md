# Changelog

Notable changes to AgriPulse are recorded here, grouped by merge date and project phase.

## In progress

- Summative production topology: bastion, private VM, managed database, and ACR. [Issue #48](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/48), [PR #56](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/56) — open.
- Summative Ansible deployment of the ACR image. [Issue #49](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/49) — open.
- Summative deploy to production on merge to `main`. [Issue #51](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/51), [PR #57](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/57) — open.
- Summative live application and health signal. [Issue #52](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/52) — open.

## 2026-11-19 — Summative

- Added Trivy scans for the API and web images and Checkov scanning for Terraform; documented security findings and removed raw scan dumps. [Issue #50](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/50), [PR #59](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/59).
- Updated the README into an operations manual. [Issue #53](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/53), [PR #58](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/58).

## 2026-11-10 — F3

- Added Ansible configuration for the Azure VM. [Issue #45](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/45), [PR #47](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/47).
- Recorded the F3 security-scan baseline. Summative CI enforcement was added later in PR #59. [Issue #44](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/44).

## 2026-11-09 — F3

- Added Terraform to provision Azure infrastructure. [Issue #42](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/42), [PR #46](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/46).

## 2026-10-31 — F2

- Added Compose health checks and demonstrated CI blocking a merge when checks fail; restored workflow runs on pushes to `main`. [PR #39](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/39), [Issue #34](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/34), [PR #40](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/40), [PR #41](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/41).

## 2026-10-30 — F2

- Added CI builds for the API and web Docker images. [Issue #33](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/33), [PR #37](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/37).

## 2026-10-28 — F2

- Added Docker Compose support to run the application stack. [Issue #31](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/31), [PR #36](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/36).

## 2026-10-24 — F2

- Added user registration and login with JWT authentication. [Issue #28](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/28), [PR #30](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/30).

## 2026-10-22 — F2

- Added PostgreSQL persistence using Docker Compose. [Issue #27](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/27), [PR #29](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/29).

## 2026-10-22 — F1

- Added weekly price comparison and last-updated dates. [PR #24](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/24), [PR #26](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/26).

## 2026-10-21 — F1

- Improved crop search and added district filtering. [PR #21](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/21), [PR #22](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/22).

## 2026-10-18 — F1

- Added GitHub Actions CI for backend and frontend checks. [Issue #7](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/7), [PR #12](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/12).

## 2026-10-16 — F1

- Initialized the repository and project planning, including branch protection. [Issue #1](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/1), [Issue #2](https://github.com/fistonfle/agripulse-crop-price-tracker/issues/2).
- Replaced the earlier app structure with an Express API and React + Vite frontend; added price entry. [PR #13](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/13), [PR #15](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/15), [PR #16](https://github.com/fistonfle/agripulse-crop-price-tracker/pull/16).
