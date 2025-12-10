import { getFields, setField, setAllFields, type KeywordsFormState, type KeywordSource, type Keyword } from "./slice";
import type { TypedUseSelectorHook } from "react-redux";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { useFetchDatastationsTermQuery } from "./api/datastationsVocabs";
import { useFetchGeonamesFreeTextQuery } from "./api/geonames";
import { useFetchWikidataQuery } from "./api/wikidata";
import { useFetchDataverseKeywordsQuery } from "./api/dataverse";
import { AutocompleteAPIField } from "@dans-dv/inputs";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { TabHeader, SubHeader, BoxWrap } from "@dans-dv/layout";
import { Submit, useSubmitDirectDataMutation } from "@dans-dv/submit";
import { useApiToken } from "@dans-dv/wrapper";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { vocabMap, keywordFormatter } from "./helpers";

type AppDispatch = (action: any) => any;
export type RootState = {keywords: KeywordsFormState};

type DatastationTypes = "elsst" | "narcis" | "dansCollectionsSsh" | "gettyAat";

const datastationConfigs: DatastationTypes[] = ["elsst", "narcis", "dansCollectionsSsh", "gettyAat"];

export function KeywordFields({ config, useAppDispatch, useAppSelector }: {
  useAppDispatch: () => AppDispatch;
  useAppSelector: TypedUseSelectorHook<RootState>;
  config: {
    wikidata?: boolean;
    geonames?: boolean;
    elsst?: boolean;
    narcis?: boolean;
    dansCollectionsSsh?: boolean;
    gettyAat?: boolean;
  };
}) {
  const dispatch = useAppDispatch();
  const keywords = useAppSelector(getFields());
  const [ submitDirectData, { isLoading: submitLoading, isSuccess: submitSuccess, isError: submitError, error: submitErrorMessage } ] = useSubmitDirectDataMutation();
  const { apiToken, doi } = useApiToken();
  const { data: dataverseKeywords, isLoading: isLoadingDataverseKeywords } = useFetchDataverseKeywordsQuery({ doi: doi, apiToken: apiToken });

  const onSave = (field: KeywordSource, data: Keyword[] ) => {
    dispatch(setField({
      field: field,
      value: data as Keyword[],
    }));
  };

  useEffect(() => {
    if (dataverseKeywords && !isLoadingDataverseKeywords) {
      dispatch(setAllFields({ data: dataverseKeywords }));
    }
  }, [dataverseKeywords, isLoadingDataverseKeywords]);

  return (
    <BoxWrap>
      <TabHeader
        title="Keywords"
        subtitle="Add keywords from different sources to your dataset. Keywords can be used to find datasets in the Dataverse search engine."
      />
      <Box sx={{position: 'relative'}}>
        {isLoadingDataverseKeywords ? (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
           }}>
            <Typography>Loading keywords from Dataverse...</Typography>
          </Box>
        ) : null}
        {config.wikidata && (
          <WikidataField 
            onSave={(data) => onSave("wikidata", data)} 
            value={keywords.wikidata} 
          />
        )}
        {config.geonames && (
          <GeonamesField 
            onSave={(data) => onSave("geonames", data)} 
            value={keywords.geonames} 
          />
        )}
        {datastationConfigs.map((item) =>
          config[item] ? (
            <DatastationsField
              key={item}
              onSave={(data) => onSave(item, data)}
              value={keywords[item]}
              type={item}
            />
          ) : null
        )}
      </Box>

      <Submit 
        disabled={!Object.values(keywords).some(arr => arr.length > 0)} 
        isLoading={submitLoading} 
        isError={submitError} 
        isSuccess={submitSuccess} 
        error={submitErrorMessage as FetchBaseQueryError}
        onClick={() => submitDirectData({ data: keywordFormatter(keywords), doi: doi, apiToken: apiToken })}
      />

    </BoxWrap>
  );
};

function WikidataField({ onSave, value }: { 
  onSave: (data: Keyword[]) => void;
  value: Keyword[];
}) {
  const [inputValue, setInputValue] = useState<string>("");
  const debouncedInputValue = useDebounce(inputValue, 500)[0];
  // Fetch data on input change
  const { data, isFetching, isLoading } =
    useFetchWikidataQuery(debouncedInputValue, {
      skip: debouncedInputValue === "",
    });

  return (
    <Box mb={2}>
      <SubHeader 
        title={vocabMap.wikidata.name}
        subtitle={vocabMap.wikidata.description}
      />
      <AutocompleteAPIField
        inputValue={inputValue}
        setInputValue={setInputValue}
        debouncedInputValue={debouncedInputValue}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        multiSelect
        label="Wikidata keywords"
        onSave={onSave}
        value={value}
      />
    </Box>
  );
};

function GeonamesField({ onSave, value }: { 
  onSave: (data: Keyword[]) => void;
  value: Keyword[];
}) {
  const [inputValue, setInputValue] = useState<string>("");
  const debouncedInputValue = useDebounce(inputValue, 500)[0];
  // Fetch data on input change
  const { data, isFetching, isLoading } =
    useFetchGeonamesFreeTextQuery(debouncedInputValue, {
      skip: debouncedInputValue === "",
    });

  return (
    <Box mb={2}>
      <SubHeader 
        title={vocabMap.geonames.name}
        subtitle={vocabMap.geonames.description}
      />
      <AutocompleteAPIField
        inputValue={inputValue}
        setInputValue={setInputValue}
        debouncedInputValue={debouncedInputValue}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        label="Geonames locations"
        onSave={onSave}
        value={value}
      />
    </Box>
  );
};

function DatastationsField({ type, onSave, value }: { 
  type: DatastationTypes;
  onSave: (data: Keyword[]) => void;
  value: Keyword[];
}) {
  const [inputValue, setInputValue] = useState<string>("");
  const debouncedInputValue = useDebounce(inputValue, 500)[0];
  // Fetch data on input change
  const { data, isFetching, isLoading } =
    useFetchDatastationsTermQuery(
      {
        vocabulary: type,
        query: debouncedInputValue,
      },
      { skip: debouncedInputValue === "" },
    );

  return (
    <Box mb={2}>
      <SubHeader 
        title={vocabMap[type].name}
        subtitle={vocabMap[type].description}
      />
      <AutocompleteAPIField
        inputValue={inputValue}
        setInputValue={setInputValue}
        debouncedInputValue={debouncedInputValue}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        multiSelect
        label={vocabMap[type].name}
        onSave={onSave}
        value={value}
      />
    </Box>
  );
};