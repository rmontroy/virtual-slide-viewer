# Frontend for Virtual Slide Viewer

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/VanAndelInstitute/virtual-slide-viewer)

For now, the frontend is only (1) a data table for slide metadata and (2) the viewer itself, which is implemented on top of [OpenSeadragon](https://openseadragon.github.io/).

Authentication is intended to be transparent to the frontend (à la [this solution](https://github.com/aws-samples/cloudfront-authorization-at-edge#readme)). Once authenticated, the frontend should transparently pass an AppSync-compatible authorization cookie to the GraphQL endpoint, other APIs, and CloudFronted S3 buckets.

## Set up
1. `git clone https://github.com/VanAndelInstitute/virtual-slide-viewer.git`
2. `cd virtual-slide-viewer`
3. `npm i`

## Build and run
- `npx snowpack dev`

or
1. `npx snowpack build --watch`
2. `npx servor --static build`


## General workflow for Virtual Slide Viewer deployments
1. Aperio scanner dumps SVS image files onto local Aperio ScanScope Workstation
2. AWS DataSync agent transfers SVS files to Amazon EFS
3. Amazon EventBridge rule forwards file transfer event to AWS Lambda
4. AWS Lambda:
    - extracts label and thumbnail images from SVS file
    - extracts image metadata from TIFF tags and reads barcode from label image
    - uploads metadata to Amazon DynamoDB table
    - extracts DeepZoom tiles from SVS file and caches them as JPEGs in EFS during viewing
5.	**Scanner technician reviews images for scanning errors**
    - searches for new (unsent) slides
    - deletes and rescans failed slide scans
    - fixes slide/case IDs, if incorrect or missing
    - marks slides to send (metadata) to CDR
6.	**Pathologist reviews slides**

## Related projects
- backend for Virtual Slide Viewer
