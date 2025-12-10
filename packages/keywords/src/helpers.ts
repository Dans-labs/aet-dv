import { type KeywordsFormState } from "./slice";
import { vocabInfo as datastationsVocabs } from "./api/datastationsVocabs";
import { vocabInfo as wikidataVocab } from "./api/wikidata";
import { vocabInfo as geonamesVocab } from "./api/geonames";
import type { KeywordField } from "./api/dataverse";

export const vocabMap = {
  elsst: datastationsVocabs.elsst,
  narcis: datastationsVocabs.narcis,
  dansCollectionsSsh: datastationsVocabs.dansCollectionsSsh,
  gettyAat: datastationsVocabs.gettyAat,
  wikidata: wikidataVocab,
  geonames: geonamesVocab,
}

export interface VocabTypeEntry {
  name: string;
  description: string;
  url: string;
  apiUrl?: string;
  alternativeNames?: string[];
}

export function keywordFormatter(keywords: KeywordsFormState) {
  return {
    fields: [{
      typeName: "keyword", 
      multiple: true,
      typeClass: "compound",
      value: Object.entries(keywords).reduce((acc, [source, kws]) => {
        kws.forEach(kw => {
          acc.push({
            keywordValue: {
              typeName: "keywordValue",
              multiple: false,
              typeClass: "primitive",
              value: kw.label,
            },
            keywordTermURI: {
              typeName: "keywordTermURI",
              multiple: false,
              typeClass: "primitive",
              value: kw.value,
            },
            keywordVocabulary: {
              typeName: "keywordVocabulary",
              multiple: false,
              typeClass: "primitive",
              value: vocabMap[source as keyof typeof vocabMap].name,
            },
            keywordVocabularyURI: {
              typeName: "keywordVocabularyURI",
              multiple: false,
              typeClass: "primitive",
              value: vocabMap[source as keyof typeof vocabMap].url,
            }
          });
        });
        return acc;
      }, [] as any)
    }]
  }
}

export function reverseKeywordFormatter(fields: KeywordField[]): KeywordsFormState {
  const keywords: KeywordsFormState = {
    wikidata: [],
    geonames: [],
    elsst: [],
    narcis: [],
    dansCollectionsSsh: [],
    gettyAat: [],
  };

  fields.forEach((field: any) => {
    const vocab = field.keywordVocabulary.value;
    // match vocab to source, also check for optional alternative names
    const source = Object.keys(vocabMap).find(key => {
      const vocabEntry = vocabMap[key as keyof typeof vocabMap];
      return vocabEntry.name === vocab || (vocabEntry.hasOwnProperty("alternativeNames") && (vocabEntry as VocabTypeEntry).alternativeNames?.includes(vocab));
    });
    if (source) {
      keywords[source as keyof KeywordsFormState].push({
        label: field.keywordValue.value,
        value: field.keywordTermURI?.hasOwnProperty("value") ? field.keywordTermURI.value : field.keywordVocabularyURI.value,
        // if not all values are present from DV, set a warning
        warning: !(field.keywordValue?.value && field.keywordTermURI?.value && field.keywordVocabulary?.value && field.keywordVocabularyURI?.value),
      });
    }
  });

  return keywords;
}