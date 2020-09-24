import { gql } from "@apollo/client";

export const BATCH_GET_SLIDES = gql`
  query batchGetSlides($imageIds: [String!]) {
    Slides:batchGetSlides(ImageIDs: $imageIds) {
      CaseID
      ImageID
      SlideID
      ScanDate
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
        ImageID
        SlideID
        ScanDate
        AppMag
        MPP
      }
      nextToken
    }
  }
`;

export const UPDATE_SLIDEID = gql`
  mutation UpdateSlide($slideid: String!, $imageid: String!) {
    updateSlide(input: {SlideID: $slideid, ImageID: $imageid}) {
      ImageID
      SlideID
    }
  }
`;

export const UPDATE_CASEID = gql`
  mutation UpdateSlide($caseid: String!, $imageid: String!) {
    updateSlide(input: {CaseID: $caseid, ImageID: $imageid}) {
      ImageID
      CaseID
    }
  }
`;

export const Statuses = ['NEW', 'GOOD', 'BAD'];