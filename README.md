# Frontend for Virtual Slide Viewer
For now, the frontend is only (1) a data table for slide metadata and (2) the viewer itself, which is implemented on top of [OpenSeadragon](https://openseadragon.github.io/).

Authentication is intended to be transparent to the frontend (à la [this solution](https://github.com/aws-samples/cloudfront-authorization-at-edge#readme)). Once authenticated, the frontend should transparently pass an AppSync-compatible authorization cookie to the GraphQL endpoint, as well as any CloudFronted S3 buckets.

## Build and run ##
- `$ npx snowpack dev` (currently broken for non-root routes)

or
1. `$ npx snowpack build --watch`
2. `$ npx servor --static build`

## General workflow for Virtual Slide Viewer deployments
1. Scanner dumps files onto ScanScope Workstation
2. SVS files uploaded from ScanScope Workstation to AWS S3
3. Image preprocessor:
    - converts files from SVS to VSV format
    - extracts and uploads slide metadata to database
4.	**Scanner technician reviews images for scanning errors**
    - searches for new (unsent) slides
    - deletes and rescans failed slide scans
    - fixes slide/case IDs, if incorrect or missing
    - marks slides to send (metadata) to CDR
5.	**Pathologist reviews slides**

