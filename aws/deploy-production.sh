yarn build:production
aws s3 sync ./build s3://elysia-dapp
aws cloudfront create-invalidation --distribution-id E2X8G4DK7B4S44 --paths "/*"
