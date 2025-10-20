import TableCell from "@mui/material/TableCell";
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

export const AudioProcessing = ({ file, useAppDispatch }: { file: SelectedFile, useAppDispatch: AppDispatch }) => {
  const dispatch = useAppDispatch();

  return (
    <TableCell colSpan={6}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
        <Stack direction="row" alignItems="center" spacing={1}>
          <SubtitlesIcon color="primary" />
          <Typography variant="body2" color="textSecondary">
            Audio processing options
          </Typography>
        </Stack>
        <FormControl sx={{ minWidth: 170 }} size="small">
          <InputLabel id="source-language">Source language</InputLabel>
          <Select
            labelId="source-language"
            id="source-language-select"
            value={file.audioProcessing?.sourceLanguage || ''}
            label="Source language"
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
            />
          } 
          label="Diarisation" 
        />
        {file.audioProcessing?.diarisation &&
          <TextField 
            id="speakers" 
            label="# of speakers" 
            variant="outlined" 
            value={file.audioProcessing?.speakers || ''}
            size="small"
            type="number"
            sx={{ width: 150 }}
            onChange={(e) => dispatch(setFileMeta({
              name: file.name,
              type: "audioProcessing",
              value: {
                ...file.audioProcessing,
                speakers: parseInt(e.target.value) || 0,
              },
            }))}
          />
        }
      </Stack>
    </TableCell>
  );
}