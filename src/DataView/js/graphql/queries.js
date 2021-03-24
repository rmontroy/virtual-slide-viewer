import { gql } from "@apollo/client";

export const GET_SLIDES = gql`
  query getSlides($ImageIDs: [String!]) {
    Slides:getSlides(ImageIDs: $ImageIDs) {
      CaseID
      SlideID
      ImageID
      ScanDate
      AppMag
      MPP
      Status
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
  mutation UpdateSlide($SlideID: String!, $ImageID: String!) {
    updateSlide(input: {SlideID: $SlideID, ImageID: $ImageID}) {
      ImageID
      SlideID
    }
  }
`;

export const UPDATE_CASEID = gql`
  mutation UpdateSlide($CaseID: String!, $ImageID: String!) {
    updateSlide(input: {CaseID: $CaseID, ImageID: $ImageID}) {
      ImageID
      CaseID
    }
  }
`;

export const UPDATE_STATUS = gql`
  mutation UpdateSlide($Status: String!, $ImageID: String!) {
    updateSlide(input: {Status: $Status, ImageID: $ImageID}) {
      ImageID
      Status
    }
  }
`;

export const Statuses = ['NEW', 'GOOD', 'BAD', 'TRANSFERRED'];
