import { gql } from "@apollo/client";

export const BATCH_GET_SLIDES = gql`
  query batchGetSlides($ids: [String!]) {
    Slides:batchGetSlides(ImageIDs: $ids) {
      SlideID
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
    $status: String!
    $limit: Int
    $nextToken: String
  ) {
    Slides:querySlidesByStatus(Status: $status, limit: $limit, nextToken: $nextToken) {
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