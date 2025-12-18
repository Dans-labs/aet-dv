import { useEffect } from "react";
import FileTable from "./FileTable";
import FileUpload from "./FileUpload";
import { getFiles, queueFiles } from "./slice";
import Button from "@mui/material/Button";
import { /*uploadFile,*/ simulateUploadFile } from "./tus";
import { useApiToken } from "@dans-dv/wrapper";
import { TabHeader, BoxWrap } from "@dans-dv/layout";
import { useSubmitDataMutation } from "@dans-dv/submit";
import Typography from "@mui/material/Typography";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { fileProcessing } from "./utils/fileOptions";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { useStoreHooks } from '@dans-dv/shared-store';
import type { FilesState } from "./slice";

export default function Files() {
  const { useAppDispatch, useAppSelector } = useStoreHooks<FilesState>();
  const dispatch = useAppDispatch();
  const selectedFiles = useAppSelector(getFiles);
  const [ submitData, { isLoading: submitLoading } ] = useSubmitDataMutation();
  const { apiToken, doi } = useApiToken();

  return (
    <BoxWrap width={50}>
      <TabHeader
        title="Upload and process files"
        subtitle="Add (very large) files to your dataset, add additional metadata per file, and select processing options. Processed files will be added to your dataset automatically."
      />
      <Feature />
      <FileUpload />
      <FileTable />
      <Button 
        variant="contained" 
        color="primary" 
        size="large" 
        onClick={() => 
          submitData({
            files: selectedFiles,
            apiToken: apiToken,
            id: doi,
          }).then(() => dispatch(queueFiles()))
        } 
        disabled={selectedFiles.length === 0 || submitLoading}
      >
        Upload
      </Button>
      <FileUploader />
    </BoxWrap>
  );
}

const maxConcurrentUploads = 3;

function FileUploader() {
  // Component that manages file upload queue.
  // Check files that have status queued, and start uploading when a spot becomes available in the queue.
  const { useAppSelector, useAppDispatch } = useStoreHooks<FilesState>();
  const selectedFiles = useAppSelector(getFiles);
  const dispatch = useAppDispatch();
  // const { apiToken, doi } = useApiToken();

  useEffect(() => {
    const currentlyUploading = selectedFiles.filter(
      (file) => file.status === "submitting",
    );
    if (currentlyUploading.length < maxConcurrentUploads) {
      // add first file of selectedFiles that is not currently uploading to the active uploads
      selectedFiles.find((file) => {
        console.log(file)
        // only call the upload function if file is queued
        // return file?.status === "queued" && apiToken && doi && uploadFile(file, dispatch, apiToken, doi);
        return file?.status === "queued" && simulateUploadFile(file, dispatch);
      });
    }
  }, [selectedFiles]);

  return null;
};

function Feature() {
  return (
    <Box mb={2}>
      <Typography variant="h6" sx={{ fontSize: "1rem" }}>
        Currently supported processing options
      </Typography>
      <List dense={true}>
        {fileProcessing.map((item, index) => (
          <ListItem key={index} disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              { item.icon }
            </ListItemIcon>
            <ListItemText primary={<Stack spacing={1} direction="row" alignItems="center" ><span>{item.description}</span>{item.help}</Stack>} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}