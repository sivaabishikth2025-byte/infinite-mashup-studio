Weekend Creative Challenge: Infinite Mashup Studio

#creative-expression

Vision & what the app does

Infinite Mashup Studio is a daily creative game, not a chatbot. Every UTC day, the app locks three ingredients for everyone on Earth — cactus, violin, and octopus, or whatever the seed decides. You can add up to two more ingredients from a curated catalog, then press Fuse. Amazon Nova Pro invents a single original creature, object, or concept. Amazon Nova Canvas paints it. The result is a full dossier: origin story, abilities, personality, fun facts, a fake advertisement, a warning label, scientific classification, and a mock patent, plus downloadable artwork.

The creative output is an invention that should not exist. The interaction is play: a shared daily challenge people can compare, plus optional extra ingredients so a session still feels personal.

How you built it

I refused a textarea. The product is a studio table: locked daily chips, a searchable catalog, one oversized Fuse button, a loading ritual with rotating lines, then a result page that looks like a concept-art reveal. The loading copy is part of the experience — scanning imagination, mixing DNA, breaking physics — because a spinner would have made Bedrock feel like a form submit.

Key decisions: structured JSON from Nova Pro so the UI can render cards instead of dumping a blob of prose; Nova Canvas for a real image, not an emoji collage; S3 as the system of record so Share and Download Image work after the Lambda returns; a date-seeded shuffle so the daily trio is identical for every visitor without a database. I also kept an allowlist of ingredient IDs in Lambda. The catalog is a game board, not an open prompt. That keeps the fusion on-theme and blocks prompt injection through a free-text box.

Challenges: Canvas plus Pro in one request can exceed a timid timeout, so the function is 90 seconds and 1024 MB. Model JSON sometimes arrives wrapped in chatter, so the handler extracts the first JSON object and validates required fields instead of hoping. Presigned S3 URLs expire, so GET regenerates the image URL. CORS and Function URLs were configured so Amplify’s API routes can call Lambda without exposing Bedrock keys to the browser. Mobile layout was a first-class constraint: chips wrap, the catalog becomes a two-column grid, and the hero art goes square on small screens.

AWS services used / architecture overview

- Amazon Bedrock: Nova Pro for invention JSON, Nova Canvas for 1024 premium artwork
- AWS Lambda with a Function URL: fuse + fetch
- Amazon S3: mashups/{id}.json and mashups/{id}.png
- AWS Amplify: Next.js 15 hosting
- IAM: Lambda may invoke Bedrock and read/write the bucket

Browser → Next.js /api/fuse → Lambda → Bedrock (Pro then Canvas) → S3 → result page /m/{id}.

What you learned

Bedrock is two different jobs in this app: language structure and pixels. Converse is the right API for the dossier. InvokeModel with TEXT_IMAGE is the right API for Canvas. A daily seed turns a generator into a game without extra infrastructure. The expensive lesson is to fail loudly when a model is not enabled — a silent fallback would have produced a fake creative app.

Link to app or repo

After deploy, paste your Amplify URL and GitHub repo here.
