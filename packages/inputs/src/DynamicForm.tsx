import { useEffect } from "react";
import { useForm, Controller, useWatch, type Control } from "react-hook-form";
import TextField from './TextField';
import Submit from "./Submit";
import { TabHeader, BoxWrap } from "@aet-dv/layout";
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';

export type FieldConfig = {
  type: 'text' | 'date' | 'radio';
  label: string;
  required?: boolean;
  options?: { label: string; value: string; toggleTextField?: boolean }[];
  toggleTextFieldLabel?: string;
};

type Values = Record<string, string>;

type Props = {
  title: string;
  subtitle?: string;
  fields: Record<string, FieldConfig>;
  defaultValues?: Values;
  onChange?: (values: Values) => void;   // e.g. sync to redux
  onSubmit: (values: Values) => void;
  submit: React.ComponentProps<typeof Submit>;  // isLoading / isError / isSuccess / error
};

export default function DynamicForm({ title, subtitle, fields, defaultValues, onChange, onSubmit, submit }: Props) {
  // shouldUnregister drops "elaborate" answers when their radio option is no longer selected
  const { control, handleSubmit, watch, formState: { errors, isValid } } =
    useForm<Values>({ defaultValues, mode: 'onChange', shouldUnregister: true });

  useEffect(() => {
    if (!onChange) return;
    const sub = watch((v) => onChange(v as Values));
    return () => sub.unsubscribe();
  }, [watch, onChange]);

  return (
    <BoxWrap>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TabHeader title={title} subtitle={subtitle} />
        {Object.entries(fields).map(([name, config]) => (
          <Field key={name} name={name} config={config} control={control} errors={errors} />
        ))}
        <Submit {...submit} disabled={!isValid || submit.disabled} />
      </form>
    </BoxWrap>
  );
}

function Field({ name, config, control, errors }: { name: string; config: FieldConfig; control: Control<Values>; errors: any }) {
  const selected = useWatch({ control, name });
  const showExtra = config.options?.find(o => o.value === selected)?.toggleTextField;

  if (config.type !== 'radio') {
    return (
      <Controller
        name={name}
        control={control}
        rules={{ required: config.required }}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            type={config.type}
            label={config.label}
            required={config.required}
            errors={errors[name]}
            {...(config.type === 'date' && { InputLabelProps: { shrink: true } })}
          />
        )}
      />
    );
  }

  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={{ required: config.required }}
        render={({ field }) => (
          <FormControl required={config.required} sx={{ mb: 2, display: 'block' }}>
            <FormLabel>{config.label}</FormLabel>
            <RadioGroup row {...field} value={field.value ?? ''}>
              {config.options!.map(o => (
                <FormControlLabel key={o.value} value={o.value} label={o.label} control={<Radio />} />
              ))}
            </RadioGroup>
          </FormControl>
        )}
      />
      {showExtra && (
        <Controller
          name={`${name}Elaboration`}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              label={config.toggleTextFieldLabel ?? 'Please elaborate'}
              errors={errors[`${name}Elaboration`]}
              required
              multiline
              rows={3}
            />
          )}
        />
      )}
    </>
  );
}