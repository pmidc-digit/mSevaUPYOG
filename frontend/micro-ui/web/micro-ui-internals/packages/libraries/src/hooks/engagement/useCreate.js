import { Engagement } from "../../services/elements/Engagement";
import { useMutation } from "react-query";
import {Surveys} from "../../services/elements/Surveys"
const useCreateDocument = (filters, config) => {
  // return useMutation((filters) => Engagement.create(filters));
  return useMutation((filters) => Surveys.createSurvey(filters));
}; 

export default useCreateDocument;
