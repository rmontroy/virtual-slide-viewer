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

export const UPDATE_SLIDE_STATUS = gql`
  mutation UpdateSlide($status: String!, $imageid: String!) {
    updateSlide(input: {Status: $status, ImageID: $imageid}) {
      ImageID
      Status
    }
  }
`;

export const Statuses = ['NEW', 'GOOD', 'BAD'];