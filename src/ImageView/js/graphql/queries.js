import { gql } from "@apollo/client";

export const GET_SLIDES = gql`
  query batchGetSlides($ids: [String!]) {
    Slides:batchGetSlides(ImageIDs: $ids) {
      SlideID
      ImageID
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