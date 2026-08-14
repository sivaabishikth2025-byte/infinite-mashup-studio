# Infinite Mashup Studio

Public creative game: the same daily ingredients for everyone, then Amazon Nova invents, paints, and narrates something that should not exist.

No login. Shareable CloudFront images. Gallery so people can compare.

## Features

- Daily locked trio + optional extras, or Sandbox (2–5 free picks)
- Async Fuse (no 30s API timeout): job polling until Nova Pro + Canvas finish
- 8-card dossier, remix, share, download, copy
- Amazon Polly origin narration
- Amazon Translate for the dossier
- Public gallery (today / all time) via DynamoDB
- CloudFront CDN so links work for everyone (no expiring image URLs)
- Hourly per-IP rate limit

## AWS

API Gateway HTTP API → Lambda (async worker) → Bedrock Nova Pro + Nova Canvas → Polly → S3 → CloudFront. DynamoDB stores jobs, mashups, and rate counters. Translate on demand.

## Deploy

1. Bedrock (us-east-1): enable **Nova Pro** and **Nova Canvas**.
2. `cd infra && sam build --template-file template.yaml && sam deploy --guided`
3. Copy `ApiUrl` into `.env.local` as `FUSE_API_URL` (no trailing path).
4. `npm run dev`
5. Amplify Hosting: set `FUSE_API_URL` and `NEXT_PUBLIC_APP_URL`.

First Fuse can take 30–90 seconds. The UI waits on purpose.
