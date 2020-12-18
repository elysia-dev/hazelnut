yarn build:staging
aws s3 sync ./build s3://elysia-dapp-staging
aws cloudfront create-invalidation --distribution-id E2CT0YPICVMKEZ --paths "/*"
