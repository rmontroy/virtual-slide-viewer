import { gql } from "@apollo/client";

export const getSlide = gql`
  query GetSlide($id: ID!) {
    getSlide(id: $id) {
      CaseID
      Date
      ImageID
      SlideID
      Time
      AppMag
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
        CaseID
        Date
        ImageID
        SlideID
        Time
        AppMag
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
    querySlidesByCaseIDSlideIDIndex(CaseID: $caseID, first: $first, after: $after) {
      items {
        CaseID
        Date
        ImageID
        SlideID
        Time
        AppMag
        MPP
      }
      nextToken
    }
  }
`;