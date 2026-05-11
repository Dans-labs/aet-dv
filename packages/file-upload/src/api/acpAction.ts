import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import mockNoDiarisation from "./mocks/transcription-no-diarisation.json";
import mockDiarisation from "./mocks/transcription-diarisation.json";

export type Segment = {
  speaker: Speaker | string;
  start: number;
  end: number;
  text: string;
}

export type Speaker = { 
  id: string; 
  name: string 
};

export type Transcript = {
  segments?: Segment[];
  speakers?: Speaker[];
  fileLocation?: string;
};

const formatHeaders = (apiToken: string) => ({
  "auth-env-name": import.meta.env.VITE_ENV_NAME,
  "assistant-config-name": import.meta.env.VITE_CONFIG_NAME,
  "targets-credentials": JSON.stringify([{
    "target-repo-name": location.hostname,
    credentials: {
      username: "API_KEY",
      password: apiToken,
    },
  }]),
});

// Shared transform logic
const transformTranscriptResponse = (response: { segments: Segment[] }, diarisation: boolean): Transcript => {
  const rawSegments = response.segments ?? [];

  const uniqueNames = diarisation ? [...new Set(
    rawSegments.map(s => typeof s.speaker === "string" ? s.speaker : s.speaker?.name)
  )] : undefined;

  const speakerList: Speaker[] | undefined = uniqueNames?.map(n => ({ id: n, name: n }));
  const speakersByName = speakerList ? new Map(speakerList.map(s => [s.name, s])) : undefined;

  const normalizedSegments: Segment[] = rawSegments.map(s => ({
    ...s,
    ...(diarisation && s.speaker && {
      speaker:
        typeof s.speaker === "string"
          ? speakersByName?.get(s.speaker)!
          : speakersByName?.get(s.speaker.name)!,
    }),
  }));

  // TODO: file location should come from API response, not hardcoded
  return { segments: normalizedSegments, speakers: speakerList, fileLocation: `${import.meta.env.VITE_MOCK_BASE_URL}/mock/audio.ogg` };
};

export const acpActionApi = createApi({
  reducerPath: "acpActionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_PACKAGING_TARGET}`,
  }),
  endpoints: (build) => ({
    getTranscription: build.query({
      // TODO: swap queryFn back to query once endpoint is ready
      queryFn: ({ diarisation = false }) => {
        const mock = diarisation ? mockDiarisation : mockNoDiarisation;
        return { data: transformTranscriptResponse(mock as { segments: Segment[] }, diarisation) };
      },
      // query: ({ apiToken, id, file, diarisation = false }) => {
      //   const headers = formatHeaders(apiToken);
      //   if (!import.meta.env.PROD) { console.log("Get req headers:", headers); }
      //   return {
      //     url: `inbox/dataset/GET_TRANSCRIPTION?id=${id}&file=${file}&diarisation=${diarisation}`,
      //     method: "GET",
      //     headers,
      //   };
      // },
      // transformResponse: (response, _meta, arg) => transformTranscriptResponse(response, arg.diarisation),
    }),
    saveTranscription: build.mutation({ /* unchanged */ 
      query: ({ data, apiToken, id, fileName }) => {
        const headers = formatHeaders(apiToken);
        const body = { id, fileName, ...data };
        if (!import.meta.env.PROD) { console.log("Submit req headers:", headers, "body:", body); }
        return { url: `inbox/dataset/SAVE_TRANSCRIPTION`, method: "POST", headers, body };
      },
    }),
    submitTranscription: build.mutation({ /* unchanged */
      query: ({ apiToken, id, fileName }) => {
        const headers = formatHeaders(apiToken);
        const body = { id, fileName };
        if (!import.meta.env.PROD) { console.log("Submit req headers:", headers, "body:", body); }
        return { url: `inbox/dataset/SUBMIT_TRANSCRIPTION`, method: "POST", headers, body };
      },
    }),
  }),
});

export const { useSaveTranscriptionMutation, useSubmitTranscriptionMutation, useGetTranscriptionQuery } = acpActionApi;