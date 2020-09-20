import { gql } from "@apollo/client";

export const GET_SLIDES = gql`
  query batchGetSlides($ids: [String!]) {
    Slides:batchGetSlides(ImageIDs: $ids) {
      SlideID
      AppMag
      MPP
    }
  }
`;