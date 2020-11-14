export default {
    // JavaScript template string. Use `${imageId}` as the ImageID variable.
    "imageUrlTemplate": (imageId) => `https://{{hostname}}/images/DeepZoom/${imageId}.dzi`,
    "graphqlUri": "{{graphql uri}}",
    "apiKey": "{{api key}}",
};