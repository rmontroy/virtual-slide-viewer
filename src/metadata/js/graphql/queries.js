import { gql } from "@apollo/client";

export const BATCH_GET_SLIDES = gql`
  query batchGetSlides($imageIds: [String!]) {
    Slides:batchGetSlides(ImageIDs: $imageIds) {
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

export const GET_CASEIDS = gql`
  query ListCaseIDs(
    $nextToken: String
  ) {
    Slides:listCaseIDs(nextToken: $nextToken) {
      items {
        CaseID
        ImageID
      }
      nextToken
    }
  }
`;

export const GET_SLIDES_BY_STATUS = gql`
  query SlidesByStatus(
    $statusFilter: String!
    $limit: Int
    $nextToken: String
  ) {
    Slides:querySlidesByStatus(Status: $statusFilter, limit: $limit, nextToken: $nextToken) {
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