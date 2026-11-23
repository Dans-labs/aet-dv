import { useCallback } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useSubmitDataMutation } from "@aet-dv/dataverse";
import { useApiToken } from "@aet-dv/wrapper";
import { useStoreHooks } from '@aet-dv/shared-store';
import { DynamicForm } from '@aet-dv/inputs';
import { dapFields } from './formConfig';
import { getValues, setValues, type DAPState } from './slice';

export default function Form() {
  const { useAppDispatch, useAppSelector } = useStoreHooks<DAPState>();
  const dispatch = useAppDispatch();
  const { apiToken, doi } = useApiToken();
  const saved = useAppSelector(getValues);
  const [submitData, { isLoading, isSuccess, isError, error }] = useSubmitDataMutation();

  const persist = useCallback((v: Record<string, string>) => dispatch(setValues(v)), [dispatch]);

  return (
    <DynamicForm
      title="Create and submit Data Access Protocol (DAP)"
      subtitle="This describes the data access conditions for your restricted access datasets in the DANS Data Stations. As the DAP contains very relevant information about the access to the data, the DAP should be written in such a way that it can be openly shared"
      fields={dapFields}
      defaultValues={saved}
      onChange={persist}
      onSubmit={(data) => submitData({ data: { dap: data }, apiToken, id: doi })}
      submit={{ isLoading, isError, isSuccess, error: error as FetchBaseQueryError }}
    />
  );
}