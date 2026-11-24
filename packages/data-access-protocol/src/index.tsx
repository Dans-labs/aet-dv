import { useCallback, useMemo } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useGetUserQuery, useUploadFileMutation } from "@aet-dv/dataverse";
import { useApiToken } from "@aet-dv/wrapper";
import { useStoreHooks } from '@aet-dv/shared-store';
import { DynamicForm } from '@aet-dv/inputs';
import { dapFields } from './formConfig';
import { getValues, setValues, type DAPState } from './slice';
import { buildPdf } from "./pdf";

export default function Form() {
  const { useAppDispatch, useAppSelector } = useStoreHooks<DAPState>();
  const dispatch = useAppDispatch();
  const { apiToken, doi } = useApiToken();
  const saved = useAppSelector(getValues);
  const [uploadFile, { isLoading: isUploading, isSuccess: isUploadSuccess, isError: isUploadError, error: uploadError }] = useUploadFileMutation();
  const { data: user } = useGetUserQuery({ apiToken }); 
  
  const initialValues = useMemo(
    () => ({
      depositor: user?.data?.displayName,
      date: new Date().toISOString().slice(0, 10),
      doi: doi ?? "",
    }),
    [user?.data?.displayName, doi],
  );

  const persist = useCallback((v: Record<string, string>) => dispatch(setValues(v)), [dispatch]);

  return (
    <DynamicForm
      title="Create and submit Data Access Protocol (DAP)"
      subtitle="This describes the data access conditions for your restricted access datasets in the DANS Data Stations. As the DAP contains very relevant information about the access to the data, the DAP should be written in such a way that it can be openly shared"
      fields={dapFields}
      defaultValues={saved}
      initialValues={initialValues}
      onChange={persist}
      onSubmit={async (data) => {
        const file = await buildPdf('Data Access Protocol', dapFields, data);
        uploadFile({ file, fileName: 'data-access-protocol.pdf', fileDescription: 'Data Access Protocol', doi, apiToken });
      }}
      submit={{ isLoading: isUploading, isError: isUploadError, isSuccess: isUploadSuccess, error: uploadError as FetchBaseQueryError }}
    />
  );
}