import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { VocabTypeEntry } from "../helpers";

type Datastations = "elsst" | "narcis" | "dansCollectionsSsh" | "gettyAat";
interface DatastationsItem {
  uri: string;
  prefLabel: string;
  lang: string;
  altLabel: string;
  localname: string;
}
interface DatastationsResponse {
  results: DatastationsItem[];
}

// map short vocab terms to their API vocab counterparts
const vocabMap: Record<Datastations, string> = {
  elsst: "ELSST_R4",
  narcis: "NARCIS",
  dansCollectionsSsh: "DansCollections",
  gettyAat: "AATC",
};

export const vocabInfo: Record<Datastations, VocabTypeEntry> = {
  elsst: {
    name: "ELSST",
    description: "The European Language for Subject-Specific Thesauri (ELSST) is a multilingual thesaurus for subject indexing and retrieval of scientific information in Europe.",
    url: "https://vocabs.datastations.nl/ELSST_R3/en",
  },
  narcis: {
    name: "NARCIS",
    description: "NARCIS is the Dutch national portal for research information, providing access to datasets and publications.",
    url: "https://vocabs.datastations.nl/NARCIS/en",
  },
  dansCollectionsSsh: {
    name: "DANS Collections SSH",
    description: "DANS Collections SSH is a controlled vocabulary maintained by DANS for indexing and retrieving datasets within the DANS repository.",
    url: "https://vocabularies.dans.knaw.nl/collections/ssh",
  },
  gettyAat: {
    name: "Getty AAT",
    description: "The Getty Art & Architecture Thesaurus (AAT) is a structured vocabulary for describing art, architecture, and material culture.",
    url: "https://vocabs.datastations.nl/AATC/en",
    alternativeNames: ["AAT", "Art and Architecture Thesaurus"],
  },
}

export const datastationsApi = createApi({
  reducerPath: "datastations",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://vocabs.datastations.nl/rest/v1/",
  }),
  endpoints: (build) => ({
    fetchDatastationsTerm: build.query({
      query: (content) => ({
        // note that the DANS Collections API has no EN content, so lets always retrieve NL for now
        url: `${vocabMap[content.vocabulary as Datastations]}/search?query=${
          content.query
        }*&unique=true`,
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: DatastationsResponse, _meta, arg) => {
        // Return an empty array when no results, which is what the Autocomplete field expects
        return response.results.length > 0 ?
          {
            arg: arg.query,
            response: response.results
              .map((item) =>
                // dansCollections should only return from the ssh collection.
                // No API var to use for this it seems, so lets do it the dirty way
                (
                  arg.vocabulary === "dansCollectionsSsh" &&
                  !item.localname.startsWith("ssh/")
                ) ?
                  false
                : {
                    // Elsst responses come in all caps. Not so nice, so let's change that
                    label:
                      arg.vocabulary === "elsst" ?
                        item.prefLabel.charAt(0).toUpperCase() +
                        item.prefLabel.slice(1).toLowerCase()
                      : item.prefLabel,
                    value: item.uri,
                    id: item.localname,
                  },
              )
              .filter(Boolean),
            }
          : [];
      },
    }),
  }),
});

export const { useFetchDatastationsTermQuery } = datastationsApi;
