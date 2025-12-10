import type { KeywordsFormState } from "./slice";
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
    const source = Object.keys(vocabMap).find(key => vocabMap[key as keyof typeof vocabMap].name === vocab);
    if (source) {
      keywords[source as keyof KeywordsFormState].push({
        label: field.keywordValue.value,
        value: field.keywordTermURI.value,
      });
    }
  });

  return keywords;
}