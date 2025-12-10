import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vocabInfo = {
  name: "Wikidata",
  description: "Wikidata is a free and open knowledge base that can be read and edited by both humans and machines. It acts as a central storage for the structured data of its Wikimedia sister projects including Wikipedia, Wikivoyage, Wikisource, and others.",
  url: "https://www.wikidata.org/",
  apiUrl: "https://www.wikidata.org/w/api.php",
}

export interface WikidataResponse {
  search: {
    id: string;
    label: string;
    description: string;
    concepturi: string;
  }[];
  "search-continue": number;
}

export const wikidataApi = createApi({
  reducerPath: "wikidata",
  baseQuery: fetchBaseQuery({
    baseUrl: vocabInfo.apiUrl,
  }),
  endpoints: (build) => ({
    fetchWikidata: build.query({
      query: (content) => {
        return {
          url: `?action=wbsearchentities&format=json&type=item&language=en&origin=*&search=${content}`,
        };
      },
      transformResponse: (response: WikidataResponse, _meta, arg) => {
        // Return an empty array when no results, which is what the Autocomplete field expects
        return response.search.length > 0 ?
            {
              arg: arg,
              response: response.search.map((item) => ({
                label: item.label,
                value: item.concepturi,
                extraLabel: "Description",
                extraContent: item.description,
                idLabel: "ID",
                id: item.id,
              })),
            }
          : [];
      },
    }),
  }),
});

export const { useFetchWikidataQuery } = wikidataApi;
