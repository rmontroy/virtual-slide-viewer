import { gql } from "apollo-boost";

export const getSlide = gql`
  query GetSlide($id: ID!) {
    getSlide(id: $id) {
      ImageID
      BarcodeID
      AppMag
      Date
      Time
      MPP
    }
  }
`;
export const listSlides = gql`
  query ListSlides(
    $filter: TableSlideFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSlides(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        ImageID
        BarcodeID
        AppMag
        Date
        Time
        MPP
      }
      nextToken
    }
  }
`;

export const querySlidesByBarcodeIDIndex = gql`
  query SlidesByBarcodeID(
    $barcodeID: String!
    $first: Int
    $after: String
  ) {
    querySlidesByBarcodeIDIndex(BarcodeID: $barcodeID, first: $first, after: $after) {
      items {
        ImageID
        BarcodeID
        AppMag
        MPP
      }
      nextToken
    }
  }
`;