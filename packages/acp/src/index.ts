import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const acpSubmitApi = createApi({
  reducerPath: "acpSubmitApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_PACKAGING_TARGET}`,
  }),
  endpoints: (build) => ({
    submitData: build.mutation({
      query: ({ data, apiToken, id, files }) => {
        // format headers
        const headers = {
          "auth-env-name": import.meta.env.VITE_ENV_NAME,
          "assistant-config-name": import.meta.env.VITE_CONFIG_NAME,
          "targets-credentials": JSON.stringify([{
            "target-repo-name": location.hostname,
            credentials: {
              username: "API_KEY",
              password: apiToken,
            },
          }]),
        };

        const body = {
          id: id,
          ...(data && { metadata: data }),
          ...(files && { "file-metadata": files }),
        };

        // log for dev
        if(!import.meta.env.PROD) {
          console.log("Submit req headers:");
          console.log(headers);
          console.log("Submit metadata:");
          console.log(body);
        }

        return {
          url: `inbox/dataset/SUBMIT`,
          method: "POST",
          headers: headers,
          body: body,
        };
      },
    }),
  }),
});

export const { useSubmitDataMutation } = acpSubmitApi;
