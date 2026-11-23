import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dataverseApi = createApi({
  reducerPath: "dataverse",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_DV_URL,
  }),
  endpoints: (build) => ({
    fetchDataset: build.query({
      query: ({ apiToken, doi }) => {
        const headers = {
          "X-Dataverse-key": apiToken,
        };
        return {
          url: `api/datasets/:persistentId/?persistentId=${doi}`,
          headers: headers,
        };
      },
    }),
    submitData: build.mutation({
      query: ({ data, apiToken, doi }) => {
        // format headers
        const headers = {
          "X-Dataverse-key": apiToken,
        };

        // log for dev
        if(!import.meta.env.PROD) {
          console.log("Submit req headers:");
          console.log(headers);
          console.log("Submit metadata:");
          console.log(data);
        }

        return {
          url: `/api/datasets/:persistentId/editMetadata?persistentId=${doi}&replace=true`,
          method: "PUT",
          headers: headers,
          body: data,
        };
      },
    }),
  }),
});

export const { useFetchDatasetQuery, useSubmitDataMutation } = dataverseApi;
