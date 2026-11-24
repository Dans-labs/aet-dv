import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type FileListing = { data?: { label: string; dataFile: { id: number } }[] };

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
    getUser: build.query({
      query: ({ apiToken }) => {
        const headers = {
          "X-Dataverse-key": apiToken,
        };
        return {
          url: `api/users/:me`,
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
    uploadFile: build.mutation({
      async queryFn({ file, fileName, fileDescription, doi, apiToken }, _api, _extra, fetchWithBQ) {
        const headers = { 'X-Dataverse-key': apiToken };

        // 1. Look for an existing DAP in the latest version (draft if there is one)
        const listing = await fetchWithBQ({
          url: 'api/datasets/:persistentId/versions/:latest/files',
          params: { persistentId: doi, limit: 1000 },
          headers,
        });
        if (listing.error) return { error: listing.error };

        const existing = (listing.data as FileListing).data?.find((f) => f.label === fileName);

        const body = new FormData();
        body.append('file', file, fileName);
        body.append('jsonData', JSON.stringify({ description: fileDescription }));
        
        const result = await fetchWithBQ(
          existing
            ? { url: `api/files/${existing.dataFile.id}/replace`, method: 'POST', body, headers }
            : {
                url: 'api/datasets/:persistentId/add',
                params: { persistentId: doi },
                method: 'POST',
                body,
                headers,
              },
        );

        return result.error ? { error: result.error } : { data: result.data };
      },
    }),
  }),
});

export const { useFetchDatasetQuery, useSubmitDataMutation, useGetUserQuery, useUploadFileMutation } = dataverseApi;
