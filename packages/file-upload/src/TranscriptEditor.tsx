import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Box from '@mui/material/Box';
import type { SelectedFile } from "./FileUpload";
import { useEffect, useState, useRef, type SetStateAction, type Dispatch } from 'react';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import AddCircleIcon from '@mui/icons-material/AddCircle';

type Segment = {
  speaker: string;
  start: number;
  end: number;
  text: string;
}

type Transcript = {
  segments?: Segment[];
};

function Editor({ 
    editorOpen, 
    setEditorOpen, 
    file,
}: { 
    editorOpen: boolean;
    setEditorOpen: (open: boolean) => void;
    file: SelectedFile;
}) {
  const [ transcript, setTranscript ] = useState<Transcript>({});
  const [ speakers, setSpeakers ] = useState<string[]>([]);
  const [ currentTime, setCurrentTime ] = useState<number>(0);
  const [ seekTime, setSeekTime ] = useState<number>(0);

  // on load, fetch transcript data (basic for now)
  useEffect(() => {
    const fetchTranscript = async () => {
      const response = await fetch(`${file.audioProcessing?.transcriptUrl}`);
      const data: Transcript = await response.json();
      setTranscript(data);
    };
    fetchTranscript();
  }, [file.audioProcessing?.transcriptUrl]);

  console.log(file);
  console.log(transcript);

  return (
    <Dialog onClose={() => setEditorOpen(false)} open={editorOpen} maxWidth="xl">
      <DialogTitle>Edit transcript for {file.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
          <Grid size={8}>
            <Box sx={{ height: '80vh', overflowY: 'scroll'}}>
            {transcript && transcript.segments?.map((segment: any, index: number) => 
              <Segment 
                key={index} 
                segment={segment} 
                speakers={speakers} 
                setTranscript={setTranscript} 
                currentTime={currentTime}
              />
            )}
            </Box>
          </Grid>
            <Grid size={4}>
              {file.audioProcessing?.fileUrl && transcript.segments && transcript.segments?.length > 0 &&
                <MediaPlayer 
                  src={file.audioProcessing?.fileUrl}
                  onTimeUpdate={(time) => setCurrentTime(time)}
                  seekTo={seekTime}
                />
              }
              {transcript.segments?.[0].speaker &&
                <SpeakerEditor speakers={speakers} setSpeakers={setSpeakers} transcript={transcript} setTranscript={setTranscript} />
              }
            </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
};

function Segment({ segment, speakers, setTranscript, currentTime }: { 
  segment: Segment; 
  speakers: string[]; 
  setTranscript: Dispatch<SetStateAction<Transcript>>;
  currentTime: number;
}) {
  return (
    <Box sx={{ backgroundColor: currentTime >= segment.start && currentTime <= segment.end ? 'rgba(0, 0, 255, 0.1)' : 'transparent', p: 0.5, borderRadius: 1 }}>
      <Grid container spacing={2} pt={1}>
        <Grid size={3}>
          <FormControl fullWidth>
            <InputLabel id={`${segment.speaker}-label`}>Speaker</InputLabel>
            <Select
              labelId={`${segment.speaker}-label`}
              id={`${segment.speaker}-select`}
              value={segment.speaker}
              label="Speaker"
              size="small"
              onChange={(event: SelectChangeEvent) => {
                const newSpeaker = event.target.value;
                setTranscript((prevTranscript) => {
                  const newSegments = prevTranscript.segments?.map((seg) => {
                    if (seg === segment) {
                      return { ...seg, speaker: newSpeaker };
                    }
                    return seg;
                  });
                  return { segments: newSegments };
                });
              }}
            >
              {speakers.map((speaker) => (
                <MenuItem key={speaker} value={speaker}>
                  {speaker}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={3}>
          <Stack direction="row" spacing={1}>
            <TextField type="number" label="Start" variant="outlined" size="small" fullWidth
              value={segment.start}
              onChange={(e) => {
                setTranscript((prevTranscript) => {
                  const newSegments = prevTranscript.segments?.map((seg) => {
                    if (seg === segment) {
                      // make sure start is between next and previous segments start
                      // also make sure start is before end
                      const nextSegment = prevTranscript.segments?.[prevTranscript.segments.indexOf(seg) + 1];
                      const prevSegment = prevTranscript.segments?.[prevTranscript.segments.indexOf(seg) - 1];
                      const newStart = 
                      nextSegment && Number(e.target.value) >= nextSegment.start ?
                        nextSegment.start :
                        prevSegment && Number(e.target.value) <= prevSegment.end ?
                        prevSegment.end :
                        Number(e.target.value);
                      return { ...seg, start: newStart < seg.end ? newStart : seg.end };
                    }
                    return seg;
                  });
                  return { segments: newSegments };
                });
              }}
            />
            <TextField type="number" label="End" variant="outlined" size="small" fullWidth
              value={segment.end}
              onChange={(e) => {
                setTranscript((prevTranscript) => {
                  const newSegments = prevTranscript.segments?.map((seg) => {
                    if (seg === segment) {
                      const nextSegment = prevTranscript.segments?.[prevTranscript.segments.indexOf(seg) + 1];
                      const prevSegment = prevTranscript.segments?.[prevTranscript.segments.indexOf(seg) - 1];
                      const newEnd = 
                        nextSegment && Number(e.target.value) >= nextSegment.start ?
                        nextSegment.start :
                        prevSegment && Number(e.target.value) <= prevSegment.end ?
                        prevSegment.end :
                        Number(e.target.value);
                      return { ...seg, end: newEnd < seg.start ? seg.start : newEnd };
                    }
                    return seg;
                  });
                  return { segments: newSegments };
                });
              }}
            />
          </Stack>
        </Grid>
        <Grid size={5}>
          <TextField
            label="Text"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            value={segment.text}
            onChange={(e) => {
              const newText = e.target.value;
              setTranscript((prevTranscript) => {
                const newSegments = prevTranscript.segments?.map((seg) => {
                  if (seg === segment) {
                    return { ...seg, text: newText };
                  }
                  return seg;
                });
                return { segments: newSegments };
              });
            }}
          />
        </Grid>
        <Grid size={1}>
          <Stack direction="row">
            <IconButton 
              aria-label="delete"
              size="small"
              onClick={() => {
                setTranscript((prevTranscript) => {
                  const newSegments = prevTranscript.segments?.filter((seg) => seg !== segment);
                  return { segments: newSegments };
                });
              }}
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
            <IconButton 
              aria-label="add after"
              size="small"
              onClick={() => {
                setTranscript((prevTranscript) => {
                  const newSegments = [...prevTranscript.segments];
                  const index = newSegments.indexOf(segment);
                  const newSegment = { ...segment, start: segment.end, end: segment.end, text: '' };
                  newSegments.splice(index + 1, 0, newSegment);
                  return { segments: newSegments };
                });
              }}
            >
              <AddCircleIcon fontSize="small" color="primary" />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
};

function SpeakerEditor({ speakers, setSpeakers, transcript, setTranscript }: { 
  speakers: string[];
  setSpeakers: Dispatch<SetStateAction<string[]>>;
  transcript: Transcript;
  setTranscript: Dispatch<SetStateAction<Transcript>>;
}) {

  useEffect(() => {
    if (transcript.segments) {
      const speakers = [...new Set(transcript.segments.map((segment) => segment.speaker))];
      setSpeakers(speakers);
    }
  }, []);

  return (
    <Box>
      <Typography variant="h6" mb={2}>Edit speakers</Typography>
      {speakers.map((speaker, index) => 
        <Stack direction="row" spacing={1} key={index} mb={2}>
          <TextField 
            id={`speaker-${index}`} 
            label="Speaker name" 
            variant="outlined" 
            size="small"
            value={speaker}
            onChange={(e) => {
              // change list of speakers, and also replace speaker in segments
              const newSpeakers = [...speakers];
              newSpeakers[index] = e.target.value;
              setSpeakers(newSpeakers);
              if (transcript.segments) {
                const newSegments = transcript.segments.map((segment) => {
                  if (segment.speaker === speaker) {
                    return { ...segment, speaker: e.target.value };
                  }
                  return segment;
                });
                setTranscript({ segments: newSegments });
              }
            }}
          />
          <IconButton 
            aria-label="delete"
            onClick={() => {
              const newSpeakers = speakers.filter((_, i) => i !== index);
              setSpeakers(newSpeakers);
            }}
            disabled={
              // disable delete if speaker is used in segments
              transcript.segments?.some((segment) => segment.speaker === speaker) || false
            }
          >
            <DeleteIcon color={transcript.segments?.some((segment) => segment.speaker === speaker) ? "" : "error" } />
          </IconButton>
        </Stack>
      )}
      <Button 
        variant="contained" 
        onClick={() => setSpeakers([...speakers, `Speaker ${speakers.length + 1}`])}
      >
        Add Speaker
      </Button>
    </Box>
  )
};

function MediaPlayer({ src, onTimeUpdate, seekTo }: {
  src: string;
  onTimeUpdate?: (time: number) => void;
  seekTo?: number;
}) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  useEffect(() => {
    if (seekTo !== undefined && mediaRef.current) {
      mediaRef.current.currentTime = seekTo;
    }
  }, [seekTo]);

  const handleTimeUpdate = () => {
    if (onTimeUpdate && mediaRef.current) {
      onTimeUpdate(mediaRef.current.currentTime);
    }
  };

  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(src);


  return ( 
    <Box mb={2}>
      { isVideo ?
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          controls
          onTimeUpdate={handleTimeUpdate}
        />
      :
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          controls
          onTimeUpdate={handleTimeUpdate}
        />
      }
    </Box>
  );
}

export default Editor;