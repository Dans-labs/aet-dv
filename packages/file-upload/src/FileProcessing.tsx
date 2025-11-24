import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { type SelectedFile } from "./FileUpload";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { setFileMeta } from "./slice";
import { AppDispatch } from "./";
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import { isDisabled } from "./utils/fileHelpers";
import { useThumbnails } from "./utils/hooks";
import { Box, CircularProgress } from "@mui/material";
import Button from '@mui/material/Button';
import { useState } from "react";
import TranscriptEditor from "./TranscriptEditor";

const supportedLanguages = [
  { name: 'Dutch', id: 'nl' },
  { name: 'English', id: 'en' },
  { name: 'French', id: 'fr' },
  { name: 'German', id: 'de' },
  { name: 'Italian', id: 'it' },
  { name: 'Japanese', id: 'ja' },
  { name: 'Mandarin Chinese', id: 'zh' },
  { name: 'Spanish', id: 'es' },
  { name: 'Portuguese', id: 'pt' },
  { name: 'Ukrainian', id: 'uk' },
]

export const AudioProcessing = ({ 
  file, 
  useAppDispatch, 
  last 
}: { 
  file: SelectedFile, 
  useAppDispatch: AppDispatch, 
  last: boolean 
}) => {
  const dispatch = useAppDispatch();
  const disabled = isDisabled(file);
  const [ editorOpen, setEditorOpen ] = useState(false);

  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" p={2} sx={{ borderBottom: last ? 'none' : '1px solid #e0e0e0' }}>
      {file.status === 'processed' ?
        <Button variant="contained" onClick={() => setEditorOpen(true)}>
          Open transcript editor
        </Button> :
        <>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SubtitlesIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
            <Typography variant="body2" color="textSecondary">
              Generate transcription
            </Typography>
          </Stack>
          <FormControl 
            size="small" 
            sx={{
              minWidth: 170,
            "& .MuiInputLabel-root": {
              fontSize: "0.875rem", /* label when resting */
            },
          }}>
            <InputLabel id="source-language">Source language</InputLabel>
            <Select
              labelId="source-language"
              id="source-language-select"
              value={file.audioProcessing?.sourceLanguage || ''}
              label="Source language"
              disabled={disabled}
              onChange={
                (e) => {
                  dispatch(setFileMeta({
                    name: file.name,
                    type: "audioProcessing",
                    value: {
                      ...file.audioProcessing,
                      sourceLanguage: e.target.value,
                    },
                  }));
                }
              }
              sx={{
                fontSize: "0.875rem" /* smaller text for selected & placeholder */,
                "& .MuiSelect-select": {
                  fontSize: "0.875rem"
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    "& .MuiMenuItem-root": {
                      fontSize: "0.875rem" /* dropdown items */
                    }
                  }
                }
              }}
            >
              {supportedLanguages.map(lang => (
                <MenuItem key={lang.id} value={lang.id}>{lang.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={file.audioProcessing?.diarisation || false}
                size="small"
                onChange={(e) => {
                  dispatch(setFileMeta({
                    name: file.name,
                    type: "audioProcessing",
                    value: {
                      ...file.audioProcessing,
                      diarisation: e.target.checked,
                    },
                  }));
                }}
                disabled={disabled}
              />
            } 
            label={<Typography variant="body2">Diarisation</Typography>} 
          />
          {file.audioProcessing?.diarisation &&
            <TextField 
              id="speakers" 
              label="# of speakers" 
              variant="outlined" 
              value={file.audioProcessing?.speakers || ''}
              size="small"
              type="number"
              sx={{ 
                width: 110,
                "& .MuiInputBase-input": {
                  fontSize: "0.875rem", /* input + placeholder */
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.875rem", /* label when resting */
                },
              }}
              onChange={(e) => dispatch(setFileMeta({
                name: file.name,
                type: "audioProcessing",
                value: {
                  ...file.audioProcessing,
                  speakers: parseInt(e.target.value) || 0,
                },
              }))}
              disabled={disabled}
            />
          }
        </>
      }
      <TranscriptEditor editorOpen={editorOpen} setEditorOpen={setEditorOpen} file={file} />
    </Stack>
  );
}

export function ThumbnailProcessing({ file, useAppDispatch, last }: { file: SelectedFile, useAppDispatch: AppDispatch, last: boolean }) {
  const { thumbnails, loading } = useThumbnails(file);
  const dispatch = useAppDispatch();
  const disabled = isDisabled(file);
  console.log(file)

  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" p={2} sx={{ borderBottom: last ? 'none' : '1px solid #e0e0e0' }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <SubtitlesIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
        <Typography variant="body2" color="textSecondary">
          {loading ? "Generating thumbnails..." : thumbnails.length > 0 ? "Select a thumbnail" : "Could not generate thumbnails"}
        </Typography>
      </Stack>
      {loading && <CircularProgress size={24} />}
      {thumbnails.map((src, i) => (
        <Box 
          key={i}
          sx={{ 
            borderWidth: 2, 
            borderStyle: 'solid', 
            borderColor: file.thumbnailProcessing?.number === i ? 'primary.main' : '#ccc', 
            borderRadius: 2, 
            overflow: 'hidden', 
            lineHeight: 0, 
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
          onClick={() => {
            !disabled &&
            dispatch(setFileMeta({
              name: file.name,
              type: "thumbnailProcessing",
              value: {
                file: thumbnails[i],
                number: i,
              },
            }));
          }}
        >
          <img src={src} alt={`thumb-${i}`} width={120}  />
        </Box>
      ))}
    </Stack>
  )
}