import { gql } from "@apollo/client";

export const GET_SLIDE = gql`
  query GetSlide($id: String!) {
    getSlide(ImageID: $id) {
      SlideID
      AppMag
      MPP
    }
  }
`;