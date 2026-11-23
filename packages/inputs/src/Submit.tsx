import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getUserFriendlyError(error: FetchBaseQueryError | unknown): string {
  if (
    typeof error === "object" &&
    error != null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    const status = error.status;

    switch (status) {
      case 400:
        return "The submitted data is invalid. Please check your input.";
      case 401:
      case 403:
        return "You are not authorized to perform this action. Please check your access token.";
      case 404:
        return "The submission service could not be reached. Please try again later.";
      case 500:
        return "The server encountered an error. Please try again in a few moments.";
      default:
        return `Unexpected error (${status}). Please try again.`;
    }
  }

  return "An unknown error occurred. Please check your internet connection or try again later.";
}

export default function Submit({ disabled, isLoading, isError, error, isSuccess, onClick }: { 
  disabled?: boolean; 
  isLoading: boolean; 
  isError: boolean; 
  error?: FetchBaseQueryError; 
  isSuccess: boolean;
  onClick?: () => void;
 }) {  
  return (
    <>
      {isError && <Alert severity="error" sx={{mb: 2}}>Submission failed. {getUserFriendlyError(error)}</Alert>}
      {isSuccess && <Alert severity="success" sx={{mb: 2}}>Submission succesful. Refresh the page to see your changes reflected in Dataverse.</Alert>}
      <Button 
        variant="contained" 
        size="large"
        disabled={disabled || isLoading} 
        type="submit"
        onClick={() => typeof onClick === "function" && onClick()}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <span>Submit</span>{isLoading && <CircularProgress size={16} />}
        </Stack> 
      </Button>
    </>
  );
}