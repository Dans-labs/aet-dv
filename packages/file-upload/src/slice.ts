import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SelectedFile } from "./FileUpload";

const initialState: SelectedFile[] = [];

interface ReduxFileActions<K extends keyof SelectedFile = keyof SelectedFile> {
  name: string
  type: K
  value: SelectedFile[K]
}

export type FilesState = {files: SelectedFile[]};

export const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    addFiles: (state, action: PayloadAction<SelectedFile[]>) => {
      state.push(...action.payload);
    },
    removeFile: (state, action: PayloadAction<SelectedFile>) => {
      return state.filter(
        (file: SelectedFile) => file.name !== action.payload.name,
      );
    },
    queueFiles: (state) => {
      // set all files to queued if not already successfully uploaded
      state.forEach((file: SelectedFile) => {
        if (file.status !== "success") {
          file.status = "queued";
          file.progress = 0;
        }
      });
    },
    setFileMeta: <K extends keyof SelectedFile>(state: SelectedFile[], action: PayloadAction<ReduxFileActions<K>>) => {
      // set metadata for this file: restricted status, role, processing, validity etc
      const file = state.find(
        (file: SelectedFile) => file.name === action.payload.name,
      );
      if (file) {
        file[action.payload.type] = action.payload.value;
      }
    },
    resetFiles: () => initialState,
  },
});

export const { addFiles, removeFile, setFileMeta, resetFiles, queueFiles } = filesSlice.actions;

// Select values from state
export const getFiles = (state: FilesState): SelectedFile[] => state.files;

export default filesSlice.reducer;
