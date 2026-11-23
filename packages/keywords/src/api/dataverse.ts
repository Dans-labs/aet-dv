import { useFetchDatasetQuery } from "@aet-dv/dataverse";
import { reverseKeywordFormatter } from "../helpers";
import type { KeywordsFormState } from "../slice";
import { useMemo } from "react";

export interface DataverseResponse {
  data: {
    latestVersion: {
      metadataBlocks: {
        citation: {
          fields: {
            typeName: string;
            value: KeywordField[];
          }[];
        };
      };
    };
  };
};

export interface KeywordField {
  keywordValue: {
    typeName: string;
    value: string;
  };
  keywordTermURI: {
    typeName: string;
    value: string;
  };
  keywordVocabulary: {
    typeName: string;
    value: string;
  };
  keywordVocabularyURI: {
    typeName: string;
    value: string;
  };
}

const extractKeywords = (
  response: DataverseResponse | undefined
): KeywordsFormState | undefined => {
  const keywordField = response?.data?.latestVersion.metadataBlocks.citation.fields.find(
    (field) => field.typeName === "keyword"
  );
  // `value` is a union across citation fields, so narrow it here
  return keywordField
    ? reverseKeywordFormatter(keywordField.value as KeywordField[])
    : undefined;
};

export const useFetchDataverseKeywordsQuery = (args: { apiToken: string | null; doi: string | null }) => {
  const result = useFetchDatasetQuery(args);
  const data = useMemo(() => extractKeywords(result.data), [result.data]);
  return { ...result, data };
};