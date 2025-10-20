import SubtitlesIcon from '@mui/icons-material/Subtitles';
import ImageIcon from '@mui/icons-material/Image';
import { InfoTooltip } from "@dans-dv/guidance";
import Typography from '@mui/material/Typography';

// Defines actions a user can select for file processing and roles
export const fileProcessing = [
  {
    value: "create_thumbnail",
    label: "Create thumbnail",
    for: ["video", "images"],
    icon: <ImageIcon />,
    description: "Generate a thumbnail image from a video or image file.",
    help: <InfoTooltip color="info">Thumbnail is generated from the first frame of the video or image.</InfoTooltip>,
  },
  {
    value: "transcribe_audio",
    label: "Generate audio transcription",
    for: ["video", "audio"],
    icon: <SubtitlesIcon />,
    description: "Create an AI text transcription from a audio or video file.",
    help: (
      <InfoTooltip color="info">
        <Typography gutterBottom>Transcription is done using AI and may not be 100% accurate. Be sure to double check results.</Typography>
        <Typography>Processing can take a long time, depending on audio length. Keep an eye on the progress indicator after your file is done uploading.</Typography>
      </InfoTooltip>
    ),
  },
];

export const fileRoles = [
  {
    value: "audio_file",
    label: "Audio file",
  },
  {
    value: "code",
    label: "Code",
  },
  {
    value: "data_dictionary_code_book",
    label: "Data dictionary - code nook",
  },
  {
    value: "data_dictionary_other",
    label: "Data dictionary - other",
  },
  {
    value: "data_file",
    label: "Data file",
  },
  {
    value: "dissemination_copy",
    label: "Dissemination copy",
  },
  {
    value: "image_file",
    label: "Image file",
  },
  {
    value: "methodology",
    label: "Methodology",
  },
  {
    value: "original_metadata",
    label: "Original metadata",
  },
  {
    value: "preservation_copy",
    label: "Preservation copy",
  },
  {
    value: "publication",
    label: "Publication",
  },
  {
    value: "report",
    label: "Report",
  },
  {
    value: "supplementary_file",
    label: "Supplementary file",
  },
  {
    value: "thumbnail",
    label: "Thumbnail",
  },
  {
    value: "transcript_or_derived_file",
    label: "Transcript or derived file",
  },
  {
    value: "type_registry_value",
    label: "Type registry value",
  },
  {
    value: "video_file",
    label: "Video file",
  },
];
