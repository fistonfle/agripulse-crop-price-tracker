# AgriPulse Security Scanning

## Purpose and scope

This document records how AgriPulse is scanned for security problems, what the scans found, what was fixed, and what is accepted and why. It covers container images (Trivy), Terraform (Checkov), and Node.js dependencies (npm audit).

## What runs in CI

Every pull request runs these jobs from `.github/workflows/ci.yml`. The same workflow runs again before every deploy, because `cd.yml` calls it.

| Job | Tool | What it scans | Fails the build when | Report |
|---|---|---|---|---|
| `Trivy API image` | Trivy | The API image built from `Dockerfile` | Any CRITICAL finding, or any HIGH finding that has a published fix | Artifact `trivy-api-report` |
| `Trivy web image` | Trivy | The web image built from `frontend/Dockerfile` | Same as above | Artifact `trivy-web-report` |
| `Checkov Terraform` | Checkov | Everything in `terraform/` | Any failed check that is not skipped in `.checkov.yaml` | Artifact `checkov-terraform-report` |

None of these jobs uses `continue-on-error` or `--soft-fail`. The three job names are required checks on `main`.

Raw scan output is not kept in Git. Open the workflow run and download the artifacts (kept for 30 days).

### Why Checkov fails on any check, not only HIGH and CRITICAL

Open source Checkov has no severity levels. Severities need a paid platform key, so a rule such as `--hard-fail-on HIGH,CRITICAL` matches nothing and the job would always pass. We tested this: with 14 failed checks the exit code was 0. Instead, the job fails on every failed check, and each accepted risk is listed in `.checkov.yaml` with a reason. A new insecure resource (for example SSH open to the internet, `CKV_AZURE_10`) fails the build, which we also tested.

## Reproduce the scans locally

Run from the repository root.

```powershell
# Images
docker build -t agripulse-api -f Dockerfile .
docker build -t agripulse-web -f frontend/Dockerfile frontend
trivy image --scanners vuln --severity CRITICAL agripulse-api
trivy image --scanners vuln --severity HIGH --ignore-unfixed agripulse-api
trivy image --scanners vuln --severity CRITICAL agripulse-web
trivy image --scanners vuln --severity HIGH --ignore-unfixed agripulse-web

# Terraform
checkov --directory terraform --framework terraform --config-file .checkov.yaml

# Node.js dependencies
npm audit --audit-level=high --prefix backend
npm audit --audit-level=high --prefix frontend
```

## Baseline results (local, before CI)

These came from the first local scans with Trivy 0.76.2 and Checkov 3.4.3. They are not pull request results.

| Target | Critical | High | Notes |
|---|---:|---:|---|
| `agripulse-api` image | 3 | 43 | All have a published fix. Base image `node:20-alpine3.21` is marked end of support by Trivy |
| `agripulse-web` image | 3 | 62 | All have a published fix. Base image `nginx-unprivileged:1.27-alpine` is on Alpine 3.21, also end of support |
| Backend npm packages | 0 | 0 | 6 Low findings in the Jest chain (`deepmerge`, `GHSA-gcqx-w48m-w2h4`) |
| Frontend npm packages | 0 | 0 | Clean after the dependency upgrade |
| Terraform (first topology) | n/a | n/a | 2 failed checks, 21 passed |

Critical findings in the images:

- `CVE-2026-31789` in `libcrypto3` and `libssl3` (OpenSSL), both images. Fixed in 3.3.7-r0.
- `CVE-2026-59873` in `tar` bundled with Node.js (API image only). Fixed in 7.5.19.
- `CVE-2026-111497` in `brotli-libs` (web image only). Fixed in 1.1.1-r0.

## Finding status

| Finding | Status | What we did or will do |
|---|---|---|
| Image CRITICAL and fixable HIGH findings (API and web) | **Open until a CI run is green** | Every one has a published fix and comes from the base image. Fix: move to supported base images (newer Alpine and Node 20 or 22, newer nginx), rebuild, and confirm in CI. Do not add an ignore file for these |
| Backend npm: 6 Low (Jest chain) | Accepted | Only in development dependencies. The image installs with `npm ci --omit=dev`, so Jest is not in production. `npm audit fix --force` would downgrade Jest to 25, which is a breaking change. Revisit when Jest publishes a fixed 29.x |
| `postgres:16-alpine` (1 Critical, 25 High) | Accepted for development only | Used only for local development in `docker-compose.yml`. Production uses a managed Azure database, so this image is not deployed and not scanned in CI |

## Accepted Terraform risks

Each of these is skipped in `.checkov.yaml`. Revisit them before any real production use.

| Check | Resource | Why it is accepted |
|---|---|---|
| `CKV_AZURE_119` Network interface has a public IP | Bastion NIC | The bastion is the only SSH entry point. Its network security group allows only the admin IPs |
| `CKV_AZURE_139` ACR public network access | Container registry | GitHub-hosted runners must push images to it. The admin user is off and access uses Azure RBAC and OIDC. Revisit with a private endpoint and self-hosted runners |
| `CKV2_AZURE_57` PostgreSQL private endpoint | Database server | Uses VNet integration with a delegated subnet and private DNS instead. Public access is disabled |
| `CKV_AZURE_136` Geo-redundant backups | Database server | Cost. Not needed for a course demo |
| `CKV_AZURE_233`, `CKV_AZURE_237`, `CKV_AZURE_165`, `CKV_AZURE_164`, `CKV_AZURE_166`, `CKV_AZURE_167` | Container registry | Premium SKU features (zone redundancy, data endpoints, geo-replication, signed images, quarantine, retention). Not needed for a course demo |
| `CKV_AZURE_163` Registry vulnerability scanning | Container registry | Trivy already scans both images in CI |
| `CKV_AZURE_50` VM extensions | App VM and bastion | **Planned fix**, not a real acceptance. Set `allow_extension_operations = false` on both VMs, then remove the skip |
| `CKV2_AZURE_31` Subnet without a network security group | Database subnet | **Planned fix.** Add a network security group to the database subnet, then remove the skip |

## CI results

To be filled in from the first pull request run on this branch:

- Trivy API image: ___ Critical, ___ fixable High
- Trivy web image: ___ Critical, ___ fixable High
- Checkov: ___ failed checks

Keep these separate from the local baseline above.
