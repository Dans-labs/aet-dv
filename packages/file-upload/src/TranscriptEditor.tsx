import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import type { SelectedFile } from "./FileUpload";
import { useEffect, useState, useRef, memo, useCallback, type SetStateAction, type Dispatch } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'motion/react';
import { useDebounce } from "use-debounce";
import { env } from 'process';

type Segment = {
  speaker: Speaker | string;
  start: number;
  end: number;
  text: string;
}

type Speaker = { 
  id: string; 
  name: string 
};

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
  const [ speakers, setSpeakers ] = useState<Speaker[]>([]);
  const [ currentTime, setCurrentTime ] = useState<number>(0);
  const [ seekTime, setSeekTime ] = useState<number | undefined>(undefined);
  const [ isPlaying, setIsPlaying ] = useState<boolean>(false);

  const updateSegment = useCallback((index: number, patch: Partial<Segment>) => {
    setTranscript(prev => {
      if (!prev.segments) return prev;

      const segs = [...prev.segments];
      const current = segs[index];

      const prevSeg = segs[index - 1];
      const nextSeg = segs[index + 1];

      let start = patch.start !== undefined ? patch.start : current.start;
      let end = patch.end !== undefined ? patch.end : current.end;

      // clamp against neighbors first
      const minStart = prevSeg ? prevSeg.end : 0;
      const maxEnd = nextSeg ? nextSeg.start : Infinity;

      start = Math.max(start, minStart);
      start = Math.min(start, maxEnd);

      end = Math.max(end, minStart);
      end = Math.min(end, maxEnd);

      // enforce start <= end, and allow bidirectional push
      if (patch.start !== undefined) {
        // pushing start up can push end up
        if (start > end) end = start;
      }

      if (patch.end !== undefined) {
        // pulling end down can pull start down
        if (end < start) start = end;
      }

      segs[index] = { ...current, ...patch, start, end };
      return { segments: segs };
    });
  }, []);

  const deleteSegment = useCallback((index: number) => {
    setTranscript(prev => {
      if (!prev.segments) return prev;
      const next = prev.segments.filter((_, i) => i !== index);
      return { segments: next };
    });
  }, []);

  const insertSegmentAfter = useCallback((index: number) => {
    setTranscript(prev => {
      if (!prev.segments) return prev;
      const base = prev.segments[index];
      const next = [...prev.segments];
      next.splice(index + 1, 0, {
        ...base,
        start: base.end,
        end: base.end,
        text: ''
      });
      return { segments: next };
    });
  }, []);

  const segments = transcript.segments ?? [];

  // on load, fetch transcript data (basic for now)
useEffect(() => {
  const fetchTranscript = async () => {
    const response = await fetch(`${file.audioProcessing?.transcriptUrl}`);
    const data: Transcript = await response.json();

    const rawSegments = data.segments ?? [];

    // extract raw names from transcript
    const uniqueNames = [...new Set(
      rawSegments.map(s => typeof s.speaker === "string" ? s.speaker : s.speaker?.name)
    )];

    // build your speaker list
    const speakerList: Speaker[] = uniqueNames.map(n => ({
      id: n,
      name: n,
    }));

    // normalize segments to use real Speaker objects
    const speakersByName = new Map(speakerList.map(s => [s.name, s]));

    const normalizedSegments: Segment[] = rawSegments.map(s => ({
      ...s,
      speaker:
        typeof s.speaker === "string"
          ? speakersByName.get(s.speaker)!
          : speakersByName.get(s.speaker.name)!,
    }));

    setSpeakers(speakerList);
    setTranscript({ segments: normalizedSegments });
  };

  fetchTranscript();
}, [file.audioProcessing?.transcriptUrl]);

  return (
    <Dialog onClose={() => setEditorOpen(false)} open={editorOpen} maxWidth="xl">
      <IconButton
        aria-label="close"
        onClick={() => setEditorOpen(false)}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle>Edit transcript for {file.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
          <Grid size={8}>
            <Box sx={{ height: '80vh', overflowY: 'scroll'}}>
            {segments.map((s, i) => {
              const isActive = currentTime >= s.start && currentTime <= s.end;
              // Ensure speaker is always a Speaker object
              const speakerObj = typeof s.speaker === "string"
                ? speakers.find(sp => sp.name === s.speaker) ?? { id: s.speaker, name: s.speaker }
                : s.speaker;
              return (
                <Segment
                  key={i}
                  index={i}
                  speaker={speakerObj}
                  start={s.start}
                  end={s.end}
                  text={s.text}
                  speakers={speakers}
                  isActive={isActive}
                  isPlaying={isPlaying}
                  update={updateSegment}
                  remove={deleteSegment}
                  addAfter={insertSegmentAfter}
                  setIsPlaying={setIsPlaying}
                  setSeekTime={setSeekTime}
                />
              );
            })}
            </Box>
          </Grid>
            <Grid size={4}>
              {file.audioProcessing?.fileUrl && transcript.segments && transcript.segments?.length > 0 &&
                <MediaPlayer 
                  src={file.audioProcessing?.fileUrl}
                  onTimeUpdate={(time) => setCurrentTime(time)}
                  seekTo={seekTime}
                  setIsPlaying={setIsPlaying}
                  isPlaying={isPlaying}
                />
              }
              {transcript.segments?.[0].speaker &&
                <SpeakerEditor speakers={speakers} setSpeakers={setSpeakers} transcript={transcript} />
              }
            </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
};

// Memoized Segment component to prevent unnecessary re-renders
const Segment = memo(function Segment({
  index,
  speaker,
  start,
  end,
  text,
  speakers,
  isActive,
  isPlaying,
  update,
  remove,
  addAfter,
  setIsPlaying,
  setSeekTime,
}: {
  index: number;
  speaker: Speaker;
  start: number;
  end: number;
  text: string;
  speakers: Speaker[];
  isActive: boolean;
  isPlaying: boolean;
  update: (index: number, patch: Partial<Segment>) => void;
  remove: (index: number) => void;
  addAfter: (index: number) => void;
  setIsPlaying: (v: boolean) => void;
  setSeekTime: (t: number | undefined) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [localText, setLocalText] = useState(text);
  const wasActive = useRef(false);

  // update only when leaving blur instead of every keystroke
  useEffect(() => setLocalText(text), [text]);

  const onBlurText = () => {
    if (localText !== text) {
      update(index, { text: localText });
    }
  };

  // scroll only when first becoming active
  useEffect(() => {
    if (isActive && !wasActive.current) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSeekTime(undefined);
    }
    wasActive.current = isActive;
  }, [isActive, setSeekTime]);

  const playToggle = () => {
    if (isActive) {
      setIsPlaying(!isPlaying);
    } else {
      setSeekTime(start);
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        p: 1,
        borderRadius: 1,
        backgroundColor: isActive
          ? 'rgba(0,0,255,0.1)'
          : index % 2 === 0
            ? 'rgba(0,0,0,0.03)'
            : 'transparent'
      }}
    >
      <Grid container spacing={2} pt={1}>
        <Grid size={1}>
          <AnimatedPlayIcon
            isPlaying={isPlaying && isActive}
            size={24}
            color={isActive ? "#1976d2" : "#888"}
            onClick={playToggle}
          />
        </Grid>

        <Grid size={3}>
          <FormControl fullWidth>
            <InputLabel>Speaker</InputLabel>
            <Select
              value={speaker.id}
              label="Speaker"
              size="small"
              onChange={e => {
                console.log(e.target.value);
                const selectedSpeaker = speakers.find(s => s.id === e.target.value);
                if (selectedSpeaker) {
                  update(index, { speaker: selectedSpeaker });
                }
              }}
            >
              {speakers.map(s => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={3}>
          <Stack direction="row" spacing={1}>
            <TextField
              type="number"
              label="Start"
              size="small"
              fullWidth
              value={start}
              onChange={e => update(index, { start: Number(e.target.value) })}
            />
            <TextField
              type="number"
              label="End"
              size="small"
              fullWidth
              value={end}
              onChange={e => update(index, { end: Number(e.target.value) })}
            />
          </Stack>
        </Grid>

        <Grid size={4}>
          <TextField
            label="Text"
            multiline
            fullWidth
            size="small"
            value={localText}
            onChange={e => setLocalText(e.target.value)}
            onBlur={onBlurText}
          />
        </Grid>

        <Grid size={1}>
          <Stack direction="row">
            <IconButton size="small" onClick={() => remove(index)}>
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
            <IconButton size="small" onClick={() => addAfter(index)}>
              <AddCircleIcon fontSize="small" color="primary" />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}, (p, n) =>
  p.speaker.id === n.speaker.id &&
  p.speaker.name === n.speaker.name &&
  p.start === n.start &&
  p.end === n.end &&
  p.text === n.text &&
  p.isActive === n.isActive &&
  p.isPlaying === n.isPlaying &&
  p.speakers === n.speakers
);

const SpeakerEditor = memo(function SpeakerEditor({
  speakers,
  setSpeakers,
  transcript,
}: {
  speakers: Speaker[];
  setSpeakers: Dispatch<SetStateAction<Speaker[]>>;
  transcript: Transcript;
}) {
  const [ localSpeakers, setLocalSpeakers ] = useState<Speaker[]>(speakers);
  const [ debouncedSpeakers ] = useDebounce(localSpeakers, 500);

  // Apply rename to transcript and update global speakers
  useEffect(() => {
    if (!debouncedSpeakers) return;
    setSpeakers(debouncedSpeakers);
  }, [debouncedSpeakers]);

  // Delete speaker entirely from list (when safe)
  const removeSpeaker = useCallback((idx: number) => {
    setSpeakers(prev => prev.filter((_, i) => i !== idx));
    setLocalSpeakers(prev => prev.filter((_, i) => i !== idx));
  }, [setSpeakers]);

  // Add speaker
  const addSpeaker = useCallback(() => {
    const next = { id: `speaker-${speakers.length + 1}`, name: `Speaker ${speakers.length + 1}` };
    setSpeakers([...speakers, next]);
    setLocalSpeakers([...localSpeakers, next]);
  }, [speakers, localSpeakers, setSpeakers]);

  return (
    <Box>
      <Typography variant="h6" mb={2}>Edit speakers</Typography>

      {localSpeakers.map((speaker, idx) => {
        const inUse = transcript
          .segments
          ?.some(seg => seg.speaker === speaker.name);

        return (
          <Stack key={idx} direction="row" spacing={1} mb={2}>
            <TextField
              label="Speaker name"
              size="small"
              value={speaker.name}
              onChange={e => {
                const val = e.target.value;
                setLocalSpeakers(prev => {
                  const next = [...prev];
                  next[idx] = { ...next[idx], name: val };
                  return next;
                });
              }}
            />
            <IconButton
              onClick={() => removeSpeaker(idx)}
              disabled={inUse}
            >
              <DeleteIcon color={inUse ? "disabled" : "error"} />
            </IconButton>
          </Stack>
        );
      })}

      <Button variant="contained" onClick={addSpeaker}>
        Add Speaker
      </Button>
    </Box>
  );
}, (prev, next) => (
  prev.speakers === next.speakers &&
  prev.transcript === next.transcript
));

function MediaPlayer({ src, onTimeUpdate, seekTo, setIsPlaying, isPlaying }: {
  src: string;
  onTimeUpdate?: (time: number) => void;
  seekTo?: number;
  setIsPlaying: (playing: boolean) => void;
  isPlaying: boolean;
}) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (seekTo !== undefined && mediaRef.current) {
      mediaRef.current.currentTime = seekTo;
      mediaRef.current.play();
    }
  }, [seekTo]);

  // Sync isPlaying prop with media element
  useEffect(() => {
    if (!mediaRef.current) return;
    
    const media = mediaRef.current;
    isInternalUpdate.current = true;
    
    if (isPlaying && media.paused) {
      media.play().catch(err => console.error('Play failed:', err));
    } else if (!isPlaying && !media.paused) {
      media.pause();
    }
    
    // Reset flag after a brief delay to allow event handlers to fire
    setTimeout(() => {
      isInternalUpdate.current = false;
    }, 0);
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (onTimeUpdate && mediaRef.current) {
      onTimeUpdate(mediaRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    if (!isInternalUpdate.current) {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (!isInternalUpdate.current) {
      setIsPlaying(false);
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
          onPlay={handlePlay}
          onPause={handlePause}
        />
      :
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          controls
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
        />
      }
    </Box>
  );
}

const AnimatedPlayIcon = ({ isPlaying = false, size = 64, color = "#1976d2", onClick }: {
  isPlaying?: boolean;
  size?: number;
  color?: string;
  onClick: () => void;
}) => {
  const center = size / 2;
  const circleRadius = size / 2;
  
  // Play icon triangle points
  const playPath = `M ${size * 0.35} ${size * 0.25} L ${size * 0.35} ${size * 0.75} L ${size * 0.7} ${size * 0.5} Z`;
  
  // Bar dimensions for the "now playing" animation
  const barWidth = size * 0.1;
  const barSpacing = size * 0.08;
  const maxBarHeight = size * 0.5;
  
  const bar1X = center - barWidth - barSpacing;
  const bar2X = center - barWidth / 2;
  const bar3X = center + barSpacing;
  
  return (
    <IconButton onClick={onClick}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={circleRadius}
          fill={color}
        />
        
        {/* Animated play icon */}
        <motion.path
          d={playPath}
          fill="white"
          initial={{ opacity: 1 }}
          animate={{ opacity: isPlaying ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Now playing bars */}
        <g opacity={isPlaying ? 1 : 0}>
          {/* Bar 1 */}
          <motion.rect
            x={bar1X}
            y={center - maxBarHeight / 2}
            width={barWidth}
            height={maxBarHeight}
            fill="white"
            rx={barWidth / 2}
            initial={{ scaleY: 0.3 }}
            animate={isPlaying ? {
              scaleY: [0.3, 1, 0.5, 0.8, 0.4, 1, 0.3],
              transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            } : { scaleY: 0.3 }}
            style={{ originY: '50%', transformOrigin: 'center' }}
          />
          
          {/* Bar 2 */}
          <motion.rect
            x={bar2X}
            y={center - maxBarHeight / 2}
            width={barWidth}
            height={maxBarHeight}
            fill="white"
            rx={barWidth / 2}
            initial={{ scaleY: 0.5 }}
            animate={isPlaying ? {
              scaleY: [0.5, 0.8, 1, 0.4, 0.9, 0.6, 0.5],
              transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.15
              }
            } : { scaleY: 0.5 }}
            style={{ originY: '50%', transformOrigin: 'center' }}
          />
          
          {/* Bar 3 */}
          <motion.rect
            x={bar3X}
            y={center - maxBarHeight / 2}
            width={barWidth}
            height={maxBarHeight}
            fill="white"
            rx={barWidth / 2}
            initial={{ scaleY: 0.4 }}
            animate={isPlaying ? {
              scaleY: [0.4, 0.6, 0.3, 1, 0.5, 0.8, 0.4],
              transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }
            } : { scaleY: 0.4 }}
            style={{ originY: '50%', transformOrigin: 'center' }}
          />
        </g>
      </svg>
    </IconButton>
  );
};

export default Editor;