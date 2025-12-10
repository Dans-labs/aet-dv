import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { reverseKeywordFormatter } from "../helpers";
import type { KeywordsFormState } from "../slice";

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

export const dataverseApi = createApi({
  reducerPath: "dataverse",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_DV_URL,
  }),
  endpoints: (build) => ({
    fetchDataverseKeywords: build.query({
      query: ({ apiToken, doi }) => {
        const headers = {
          "X-Dataverse-key": apiToken,
        };
        return {
          url: `api/datasets/:persistentId/?persistentId=${doi}`,
          headers: headers,
        };
      },
      transformResponse: (response: DataverseResponse): KeywordsFormState | undefined => {
        // Prepopulate the current keywords from the dataset metadata
        const keywordField = response.data && response.data.latestVersion.metadataBlocks.citation.fields.find(field => field.typeName === "keyword");
        if (keywordField) {
          return reverseKeywordFormatter(keywordField.value);
        }
        return;
      },
    }),
  }),
});

export const { useFetchDataverseKeywordsQuery } = dataverseApi;
