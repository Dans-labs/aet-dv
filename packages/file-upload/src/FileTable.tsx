import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import ReplayCircleFilledIcon from "@mui/icons-material/ReplayCircleFilled";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Tooltip from "@mui/material/Tooltip";
import { getFiles, removeFile, setFileMeta } from "./slice";
import { fileProcessing, fileRoles } from "./utils/fileOptions";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useFetchGroupedListQuery } from "./api/dansFormats";
import type { ReduxProps, AppDispatch } from "./";
import type { SelectedFile, FileActions } from "./FileUpload";
import { findFileGroup, isDisabled } from "./utils/fileHelpers";
import Typography from "@mui/material/Typography";
import { AudioProcessing, ThumbnailProcessing } from "./FileProcessing";

const FileTable = ({ useAppDispatch, useAppSelector }: ReduxProps) => {
  const selectedFiles = useAppSelector<SelectedFile[]>(getFiles);

  return selectedFiles.length !== 0 ?
    <Box mb={2}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ p: 1, width: 10 }} />
              <TableCell sx={{ p: 1 }}>File name</TableCell>
              <TableCell sx={{ p: 1 }}>Size</TableCell>
              <TableCell sx={{ p: 1 }}>Private</TableCell>
              <TableCell sx={{ p: 1 }}>Role</TableCell>
              <TableCell sx={{ p: 1 }}>Processing</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedFiles.map((file) => (
              <FileTableRow key={file.name} file={file} useAppDispatch={useAppDispatch} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
    : null;
};

const FileActionOptions = ({ file, type, useAppDispatch }: {file: SelectedFile; type: "process" | "role"; useAppDispatch: AppDispatch }) => {
  const dispatch = useAppDispatch();
  // Need to check the type of file and provide valid processing options
  const { data } = useFetchGroupedListQuery(null);
  const disabled = isDisabled(file);
  
  const typeKey =
    file.name && data ? findFileGroup(file.name.split(".").pop(), data) : "";

  const options = type === "process" 
    ? fileProcessing.filter(o => o.for && typeKey && o.for.indexOf(typeKey) !== -1) 
    : fileRoles;

  return (
    options.length === 0 ? 
      "No options available"
    :
    <Autocomplete
      id={`${file.name}_${type}`}
      size="small"
      multiple={type === "process"}
      onChange={(_e, newValue) =>
        dispatch(
          setFileMeta({
            name: file.name,
            type: type,
            value: type === "process" ? ((newValue as FileActions[]).map((v) => ({ value: v.value, label: v.label})) || []) : newValue as FileActions,
          }),
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={type === "process" ? "Select options" : "Select role"}
          sx={{
            "& .MuiInputBase-input": {
              fontSize: "0.875rem", /* input + placeholder */
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.875rem", /* label when resting */
            },
          }}
        />
      )}
      options={options}
      value={file[type] || (type === "process" ? [] : null)}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      disabled={disabled}
      slotProps={{
        listbox: {
          sx: {
            "& .MuiAutocomplete-option": { fontSize: "0.875rem" }, // dropdown items
          }
        }
      }}
      sx={{
        "& .MuiChip-label": {
          fontSize: "0.75rem", /* chip text */
        }
      }}
    />
  );
};

const FileTableRow = ({ file, useAppDispatch }: {file: SelectedFile; useAppDispatch: AppDispatch}) => {
  const dispatch = useAppDispatch();
  const disabled = isDisabled(file);

  // Handle progress and manually retrying/restarting of file uploads
  const handleSingleFileUpload = () => {
    dispatch(
      setFileMeta({
        name: file.name,
        type: "status",
        value: "queued",
      }),
    );
  };

  return (
    <>
      <TableRow sx={{ backgroundColor: file.valid === false ? "warning.light" : "" }}>
        <TableCell sx={{ py: 2, pl: 1, pr: 0 }}>
          {/* Actions/info: delete, retry, done, etc. */}

          {(file.status === "submitting" || file.status === "queued" || file.status === "finalising") && (
            <CircularProgress size={20} sx={{p: 0.6}} />
          )}
          {file.status === "success" && (
            <Tooltip title="Uploaded successfully">
              <CheckCircleIcon color="success" />
            </Tooltip>
          )}
          {file.status === "error" && (
            <IconButton onClick={() => handleSingleFileUpload()} size="small">
              <Tooltip title="File upload failed. Click to retry">
                <ReplayCircleFilledIcon color="error" fontSize="small" />
              </Tooltip>
            </IconButton>
          )}
          {!file.status &&
            <IconButton
              color="primary"
              size="small"
              onClick={() => dispatch(removeFile(file))}
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          }

        </TableCell>
        <TableCell
          sx={{
            px: 1,
            py: 2,
            width: 160,
            maxWidth: 160,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {file.name}
        </TableCell>
        <TableCell sx={{ px: 1, py: 2, width: 50, minWidth: 50, maxWidth: 50 }}>
          {file.size ? (() => {
            const kb = file.size / 1024
            const mb = kb / 1024
            const gb = mb / 1024

            return gb >= 1
              ? `${Math.floor(gb)} GB`
              : mb >= 1
              ? `${Math.floor(mb)} MB`
              : `${Math.floor(kb)} KB`
          })() : "-"}
        </TableCell>
        <TableCell sx={{ px: 0, py: 2 }}>
          <Checkbox
            checked={file.private}
            onChange={(e) =>
              dispatch(
                setFileMeta({
                  name: file.name,
                  type: "private",
                  value: e.target.checked,
                }),
              )
            }
            size="small"
            disabled={disabled}
          />
        </TableCell>
        <TableCell sx={{ px: 1, py: 2, minWidth: 140, maxWidth: 140 }}>
          <FileActionOptions type="role" file={file} useAppDispatch={useAppDispatch} />
        </TableCell>
        <TableCell sx={{ px: 1, py: 2, minWidth: 150 }}>
          <FileActionOptions type="process" file={file} useAppDispatch={useAppDispatch} />
        </TableCell>
      </TableRow>
      {file.process && file.process.length > 0 && 
        <TableRow>
          <TableCell colSpan={6} sx={{ p: 0, backgroundColor: "#f9f9f9", boxShadow: "0 4px 6px -2px rgba(0, 0, 0, 0.08) inset" }}>
            {file.process.map((process, i) =>
              process.value === "transcribe_audio" ?
              <AudioProcessing key={`audio-${i}`} file={file} useAppDispatch={useAppDispatch} last={i === file.process!.length - 1} /> :
              process.value === "create_thumbnail" ?
              <ThumbnailProcessing key={`thumbnail-${i}`} file={file} useAppDispatch={useAppDispatch} last={i === file.process!.length - 1} /> :
              null
            )}
          </TableCell>
        </TableRow>
      }
      {file.status && 
        <TableRow>
          <UploadProgress file={file} key={`progress-${file.name}`} hasProcessingOptions={file.process && file.process.length > 0} />
        </TableRow>
      }
    </>
  );
};

const UploadProgress = ({ file, hasProcessingOptions }: { file: SelectedFile, hasProcessingOptions?: boolean }) => {
  return (
    <TableCell
      colSpan={6}
      sx={{
        backgroundColor: "#f9f9f9",
        boxShadow: hasProcessingOptions ? "none" : "0 4px 6px -2px rgba(0, 0, 0, 0.08) inset",
      }}
    >
      <Box sx={{ width: "100%" }}>
        {file.status &&
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem', textAlign: 'right', width: 200 }}>
              {file.status === 'submitting' && `${file?.progress || 0}% uploaded`}
              {file.status === 'error' && `Error uploading, please retry`}
              {(file.status === 'success' 
              || file.status === 'processing'
              || file.status === 'processed'
              ) && `Upload complete`}
              {file.status === 'queued' && `Waiting to upload`}
            </Typography>
            <LinearProgress
              sx={{ width: "100%", borderRadius: 1 }}
              variant="determinate"
              value={file?.progress || 0}
              color={
                file?.status === "success" 
                ? "success"
                : file?.status === "error" 
                ? "error"
                : file?.status === "queued" 
                ? "primary"
                : undefined
              }
            />
          </Stack>
        }
        {file.process && file.process.length > 0 && file.process.map(process => (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem', textAlign: 'right', width: 200 }}>
              {process.label}
            </Typography>
            <LinearProgress
              sx={{ width: "100%", borderRadius: 1 }}
              variant={file.status === "processing" ? "indeterminate" : "determinate"}
              value={file.status === 'processed' ? 100 : 0}
              color="secondary"
            />              
          </Stack>
        ))}
      </Box>
    </TableCell>
  );
};



export default FileTable;
