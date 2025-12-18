import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Keyword = {
  label: string;
  value: string;
  warning?: boolean;
}

export type KeywordsFormState = {
  wikidata: Keyword[];
  gettyAat: Keyword[];
  geonames: Keyword[];
  elsst: Keyword[];
  narcis: Keyword[];
  dansCollectionsSsh: Keyword[];
};

export type KeywordState = {keywords: KeywordsFormState};

export type KeywordSource = keyof KeywordsFormState;

const initialState: KeywordsFormState = {
  wikidata: [],
  gettyAat: [],
  geonames: [],
  elsst: [],
  narcis: [],
  dansCollectionsSsh: [],
};

export const keywordsSlice = createSlice({
  name: "keywords",
  initialState,
  reducers: {
    setField<K extends keyof KeywordsFormState>(
      state: KeywordsFormState,
      action: PayloadAction<{ field: K; value: KeywordsFormState[K] }>
    ) {
      const { field, value } = action.payload;
      state[field] = value;
    },
    setAllFields(_state, action: PayloadAction<{ data: KeywordsFormState }>) {
      return action.payload.data;
    },
    resetFields() {
      return initialState;
    }
  },
});

export const { setField, setAllFields, resetFields } = keywordsSlice.actions;

export const getField = <K extends keyof KeywordsFormState>(field: K) =>
  (state: KeywordState) => state.keywords[field];

export const getFields = () => (state: KeywordState) => state.keywords;

export default keywordsSlice.reducer;