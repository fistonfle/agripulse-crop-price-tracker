# AgriPulse Security Scanning

## Purpose and scope

This document records security scan tools, reproduction commands, baseline results, and finding status for AgriPulse. It covers Node.js dependencies, Terraform infrastructure, and container images.

Security scans are planned for integration into GitHub Actions. The existing workflow runs on pull requests, but the new scan jobs, their syntax, and their pull request results have not yet been verified.

## Tools and reproduction

Run the following commands from the repository root in PowerShell.

### Backend dependencies

```powershell
Set-Location .\backend
npm audit --audit-level=high
Set-Location ..
```

### Frontend dependencies

```powershell
Set-Location .\frontend
npm audit --audit-level=high
Set-Location ..
```

The High threshold makes `npm audit` return a failing status for High or Critical findings. Lower-severity findings remain visible in the report.

### Terraform

```powershell
checkov -d .\terraform --framework terraform
```

Checkov reports failed policy checks. Review each finding against the intended infrastructure before changing or excepting it.

### Container images

Build the application images and pull the database image:

```powershell
docker compose build
docker compose pull db
```

Scan the images:

```powershell
trivy image --scanners vuln --severity HIGH,CRITICAL agripulse-api
trivy image --scanners vuln --severity HIGH,CRITICAL agripulse-web
trivy image --scanners vuln --severity HIGH,CRITICAL postgres:16-alpine
```

The local baseline scans reported findings but did not use `--exit-code 1`. For planned CI enforcement, Trivy should return a nonzero status when High or Critical findings are present, for example by adding `--exit-code 1`. With the current baseline, those CI scans are expected to fail until findings are remediated or a narrow exception is reviewed and documented.

## Severity thresholds

- **npm audit:** High or Critical findings fail the scan. Low and Moderate findings remain reported for review.
- **Trivy:** High and Critical findings are the selected severities. Planned CI enforcement will fail when these findings are present.
- **Checkov:** Failed policy checks are reported as failures; review their security context and resource impact individually.

Lower-severity findings are not treated as automatically harmless. They remain open for review during maintenance.

## Local baseline results

These are local scan results. They are not pull request CI results.

### Backend dependencies

- **6 Low findings** involving Jest’s dependency chain and `deepmerge` (`GHSA-gcqx-w48m-w2h4`).
- The suggested `npm audit fix --force` would change Jest to version `25.1.0`, a major downgrade from the project’s Jest 29 line and a potential breaking change. No forced fix was applied.

### Frontend dependencies

- **0 vulnerabilities** reported.

### Terraform

Checkov 3.4.3 reported **21 passed checks and 2 failed checks**:

- **CKV_AZURE_50 — Ensure Virtual Machine Extensions are not Installed:** `azurerm_linux_virtual_machine.app`.
- **CKV_AZURE_119 — Ensure that Network Interfaces don't use public IPs:** `azurerm_network_interface.app`.

### Container images

Trivy 0.76.2 reported the following High and Critical findings:

| Image | Critical | High |
|---|---:|---:|
| `agripulse-api` | 3 | 43 |
| `agripulse-web` | 3 | 62 |
| `postgres:16-alpine` | 1 | 25 |

## Finding status, fixes, and exceptions

All findings listed in the local baseline remain **open**. No remediation has been verified by a subsequent scan.

A finding may be marked resolved only after the relevant scan is rerun and confirms the fix. An accepted risk must identify the finding, explain the reason for accepting it, state its exposure scope, and include any planned follow-up. No findings are currently recorded as accepted risks.

## Review and updates

After the scan jobs are added to the GitHub Actions workflow, open a pull request and inspect the workflow syntax and each scan job’s result. Update this document with the actual pull request results, verified remediations, and any reviewed exceptions. Keep local baseline results distinct from CI results.