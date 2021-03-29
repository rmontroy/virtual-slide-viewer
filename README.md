# Frontend for Virtual Slide Viewer

For now, the frontend is a monorepo of two independent but closely related apps:
1. a data table for slide metadata; and
2. the viewer itself, which is implemented on top of [OpenSeadragon](https://openseadragon.github.io/).

## Set up
1. `git clone https://github.com/VanAndelInstitute/virtual-slide-viewer.git`
2. `cd virtual-slide-viewer`
3. `yarn install`

## Build and run
- `npx snowpack dev --polyfill-node`

or
1. `npx snowpack build --polyfill-node --watch`
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
- [backend for Virtual Slide Viewer](https://github.com/VanAndelInstitute/virtual-slide-viewer-backend)
