import {
  chordProgressionExercise,
  ChordProgressionExerciseConfig,
  ChordProgressionExerciseSettings,
  ChordProgressionQuestion,
} from './chordProgressionExercise';
import {
  Chord,
  ChordType,
  TriadInversion,
} from '../../../utility/music/chords';
import * as _ from 'lodash';
import { Note } from 'tone/Tone/core/type/NoteUnits';
import { PlayAfterCorrectAnswerSetting } from '../settings/PlayAfterCorrectAnswerSetting';
import Exercise, {
  AnswerConfig,
  AnswersLayout,
  mapAnswerList,
} from '../../../exercise-logic';
import {
  Interval,
  MajorChordTypesPostfix,
  MinorChordTypesPostfix,
  RomanNumeralChordSymbol,
  toArray,
  toNoteNumber,
  toSteadyPart,
} from '../../../utility';
import { transpose } from '../../../utility/music/transpose';
import { NoteEvent } from '../../../../services/player.service';
import { RomanNumeralChord } from '../../../utility/music/harmony/RomanNumeralChord';
import { tonalExercise, TonalExerciseSettings } from './tonalExercise';
import { composeExercise } from './composeExercise';
import { withSettings } from '../settings/withSettings';
import { romanNumeralToChordInC } from '../../../utility/music/harmony/romanNumeralToChordInC';
import { isChordTypeMajor } from '../../../utility/music/chords/Chord/isChordTypeMajor';
import { isChordTypeMinor } from '../../../utility/music/chords/Chord/isChordTypeMinor';
import { isChordTypeDiminished } from '../../../utility/music/chords/Chord/isChordTypeDiminished';

export type RomanAnalysisChordProgressionExerciseSettings =
  TonalExerciseSettings &
    ChordProgressionExerciseSettings<RomanNumeralChordSymbol> &
    PlayAfterCorrectAnswerSetting;

const romanNumeralToResolution: {
  [scale in 'minor' | 'major']?: {
    [romanNumeral in RomanNumeralChordSymbol]?: {
      [inversion in 0 | 1 | 2]: ReadonlyArray<{
        romanNumeral: RomanNumeralChordSymbol;
        voicingConfig: Omit<Parameters<Chord['getVoicing']>[0], 'withBass'>;
      }>;
    };
  };
} = {
  major: {
    I: {
      0: [],
      1: [],
      2: [
        {
          romanNumeral: 'I',
          voicingConfig: { topVoicesInversion: TriadInversion.Octave },
        },
      ],
    },
    ii: {
      0: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
          },
        },
      ],
    },
    iii: {
      0: [
        {
          romanNumeral: 'IV',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
            octave: 5,
          },
        },
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'IV',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
          },
        },
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
            octave: 3,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'IV',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
    },
    IV: {
      0: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
            octave: 3,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: { topVoicesInversion: TriadInversion.Octave },
        },
      ],
      1: [
        {
          romanNumeral: 'V',
          voicingConfig: { topVoicesInversion: TriadInversion.Fifth },
        },
        {
          romanNumeral: 'I',
          voicingConfig: { topVoicesInversion: TriadInversion.Octave },
        },
      ],
      2: [
        {
          romanNumeral: 'V',
          voicingConfig: { topVoicesInversion: TriadInversion.Third },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
    },
    V: {
      0: [
        {
          romanNumeral: 'I',
          voicingConfig: { topVoicesInversion: TriadInversion.Octave },
        },
      ],
      1: [
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
    },
    vi: {
      0: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
            octave: 3,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 4,
          },
        },
      ],
    },
    viidim: {
      0: [
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
    },
  },
  minor: {
    i: {
      0: [],
      1: [],
      2: [
        {
          romanNumeral: 'i',
          voicingConfig: { topVoicesInversion: TriadInversion.Octave },
        },
      ],
    },
    iidim: {
      0: [
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
      ],
    },
    bIII: {
      0: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
            octave: 3,
          },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
    },
    iv: {
      0: [
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
            octave: 3,
          },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'V',
          voicingConfig: { topVoicesInversion: TriadInversion.Fifth },
        },
        {
          romanNumeral: 'i',
          voicingConfig: { topVoicesInversion: TriadInversion.Octave },
        },
      ],
      2: [
        {
          romanNumeral: 'V',
          voicingConfig: { topVoicesInversion: TriadInversion.Third },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
    },
    v: {
      0: [
        {
          romanNumeral: 'bVI',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
          },
        },
        {
          romanNumeral: 'bVII',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'bVI',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'bVII',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 1,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'IV',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'V',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'I',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
    },
    V: {
      0: [
        {
          romanNumeral: 'i',
          voicingConfig: { topVoicesInversion: TriadInversion.Octave },
        },
      ],
      1: [
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
    },
    bVI: {
      0: [
        {
          romanNumeral: 'bVII',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Third,
          },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'bVII',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'bVII',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
    },
    bVII: {
      0: [
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Fifth,
          },
        },
      ],
      1: [
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
            octave: 5,
          },
        },
      ],
      2: [
        {
          romanNumeral: 'i',
          voicingConfig: {
            topVoicesInversion: TriadInversion.Octave,
          },
        },
      ],
    },
  },
};

export type RomanNumeralsChordProgressionQuestion = {
  chordProgressionInRomanAnalysis: RomanNumeralChordSymbol[];
};

export const allRomanNumeralAnswerList: Exercise.AnswerList<RomanNumeralChordSymbol> =
  (() => {
    function getPlayOnClickPart(chord: Chord): NoteEvent[] {
      return [
        {
          notes: chord.getVoicing({ topVoicesInversion: TriadInversion.Fifth }),
          velocity: 0.3,
          duration: '2n',
        },
      ];
    }

    const answerList: {
      rows: (
        | Exercise.AnswersLayoutCell<RomanNumeralChordSymbol>
        | RomanNumeralChordSymbol
      )[][];
    } = {
      rows: [
        [
          {
            answer: null,
            space: 1,
          },
          'II',
          'III',
          '#ivdim',
          {
            answer: null,
            space: 1,
          },
          'VI',
          'VII',
        ],
        ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viidim'],
        ['i', 'iidim', 'bIII', 'iv', 'v', 'bVI', 'bVII'],
        [
          {
            answer: null,
            space: 1,
          },
          'bII',
          {
            answer: null,
            space: 1,
          },
          {
            answer: null,
            space: 1,
          },
          'vdim',
          {
            answer: null,
            space: 1,
          },
          'bvii',
        ],
      ],
    };

    const majorChordTypesLayout: AnswersLayout<MajorChordTypesPostfix> = {
      rows: [
        [
          '',
          ChordType.Major6th,
          ChordType.Major7th,
          ChordType.MajorAdd9,
          {
            answer: null, // ChordType.Major69
            space: 1,
          },
        ], // not dominants
        [
          ChordType.Augmented,
          ChordType.Dominant7th,
          ChordType.Dominant9th,
          ChordType.Dominant7thSharp9th,
        ], // dominants
        [ChordType.Sus4, ChordType.Sus2], // suspensions
      ],
    };

    const minorChordTypesLayout: AnswersLayout<MinorChordTypesPostfix> = {
      rows: [['', '7', 'add9', ChordType.Major7th]],
    };

    const diminishedChordTypesLayout: AnswersLayout<MinorChordTypesPostfix> = {
      rows: [
        [
          ChordType.Diminished,
          ChordType.HalfDiminished7th,
          ChordType.Diminished7th,
        ],
      ],
    };

    function addChordTypesToAnswerCell(
      romanNumeralChordSymbol: RomanNumeralChordSymbol,
      chordTypesLayout: AnswersLayout<string>
    ) {
      const answerListWithTypes = mapAnswerList<
        string,
        RomanNumeralChordSymbol
      >(chordTypesLayout, (answerConfig: AnswerConfig<string>) => {
        const chordTypeSuffix = answerConfig.answer satisfies string | null;
        if (answerConfig.answer === null) {
          return answerConfig as AnswerConfig<never>;
        }
        return (romanNumeralChordSymbol +
          chordTypeSuffix) as RomanNumeralChordSymbol;
      });
      return {
        innerAnswersList: answerListWithTypes,
      };
    }

    const answerListWithChordTypes = mapAnswerList(
      answerList,
      (answerConfig: AnswerConfig<RomanNumeralChordSymbol>) => {
        if (!answerConfig.answer) {
          return answerConfig;
        }

        const romanNumeralChordSymbol = answerConfig.answer;
        const romanNumeralChord = new RomanNumeralChord(
          romanNumeralChordSymbol
        );
        if (isChordTypeMajor(romanNumeralChord.type)) {
          return addChordTypesToAnswerCell(
            romanNumeralChordSymbol,
            majorChordTypesLayout
          );
        }

        if (isChordTypeMinor(romanNumeralChord.type)) {
          return addChordTypesToAnswerCell(
            romanNumeralChordSymbol,
            minorChordTypesLayout
          );
        }

        if (isChordTypeDiminished(romanNumeralChord.type)) {
          return addChordTypesToAnswerCell(
            new RomanNumeralChord({
              scaleDegree: romanNumeralChord.scaleDegree,
              type: ChordType.Minor,
            }).romanNumeralChordSymbol, // converting to minor because the "dim" suffix is going to be included in the chord types
            diminishedChordTypesLayout
          );
        }

        return answerConfig;
      }
    );

    return Exercise.addViewLabelToAnswerList(
      mapAnswerList(
        answerListWithChordTypes,
        (
          answerOrCellConfig
        ): Exercise.AnswerConfig<RomanNumeralChordSymbol> => {
          if (typeof answerOrCellConfig === 'string') {
            return {
              answer: answerOrCellConfig,
              playOnClick: getPlayOnClickPart(
                romanNumeralToChordInC(answerOrCellConfig)
              ),
            };
          } else {
            if (!answerOrCellConfig.playOnClick && answerOrCellConfig.answer) {
              return {
                ...answerOrCellConfig,
                playOnClick: getPlayOnClickPart(
                  romanNumeralToChordInC(answerOrCellConfig.answer)
                ),
              };
            } else {
              return answerOrCellConfig;
            }
          }
        }
      ),
      (answer) => new RomanNumeralChord(answer).toViewString()
    );
  })();

export function romanAnalysisChordProgressionExercise<
  GSettings extends Exercise.Settings
>(config?: ChordProgressionExerciseConfig) {
  return function (p: {
    getChordProgressionInRomanNumerals(
      settings: GSettings
    ): RomanNumeralsChordProgressionQuestion;
  }) {
    return composeExercise(
      chordProgressionExercise(config),
      tonalExercise({
        cadenceTypeSelection: false,
      }),
      withSettings({
        defaultSettings: {
          playAfterCorrectAnswer: false,
        },
      })
    )({
      getChordProgression(
        settings: RomanAnalysisChordProgressionExerciseSettings & GSettings
      ): ChordProgressionQuestion<RomanNumeralChordSymbol> {
        const chordProgressionQuestion: RomanNumeralsChordProgressionQuestion =
          p.getChordProgressionInRomanNumerals(settings);

        const question: ChordProgressionQuestion<RomanNumeralChordSymbol> = {
          segments:
            chordProgressionQuestion.chordProgressionInRomanAnalysis.map(
              (
                romanNumeralSymbol
              ): {
                chord: Chord;
                answer: RomanNumeralChordSymbol;
              } => {
                return {
                  chord: romanNumeralToChordInC(romanNumeralSymbol),
                  answer: romanNumeralSymbol,
                };
              }
            ),
        };

        if (question.segments.length === 1 && settings.playAfterCorrectAnswer) {
          // calculate resolution
          const firstChordRomanNumeral: RomanNumeralChordSymbol =
            question.segments[0].answer;
          const scaleForResolution = {
            'I IV V I': 'major',
            'i iv V i': 'minor',
          }[settings.cadenceType];
          const resolutionConfig =
            romanNumeralToResolution[scaleForResolution]?.[
              firstChordRomanNumeral
            ];
          if (resolutionConfig) {
            question.afterCorrectAnswer = ({
              firstChordInversion,
              questionSegments,
            }) => {
              const resolution:
                | {
                    romanNumeral: RomanNumeralChordSymbol;
                    chordVoicing: Note[];
                  }[]
                | null = [
                {
                  romanNumeral: firstChordRomanNumeral,
                  chordVoicing: question.segments[0].chord.getVoicing({
                    topVoicesInversion: firstChordInversion,
                    withBass: settings.includeBass,
                  }),
                },
                ...resolutionConfig[firstChordInversion].map((chord) => ({
                  romanNumeral: chord.romanNumeral,
                  chordVoicing: romanNumeralToChordInC(
                    chord.romanNumeral
                  )!.getVoicing({
                    ...chord.voicingConfig,
                    withBass: settings.includeBass,
                  }),
                })),
              ];

              const differenceInOctavesToNormalize: number = _.round(
                (toNoteNumber(
                  toArray(
                    toSteadyPart(questionSegments[0].partToPlay)[0].notes
                  )[0]
                ) -
                  toNoteNumber(resolution[0].chordVoicing[0])) /
                  Interval.Octave
              );

              return resolution.map(
                ({ romanNumeral, chordVoicing }, index) => ({
                  answerToHighlight: romanNumeral,
                  partToPlay: [
                    {
                      notes: chordVoicing.map((note) =>
                        transpose(
                          note,
                          differenceInOctavesToNormalize * Interval.Octave
                        )
                      ),
                      duration: index === resolution.length - 1 ? '2n' : '4n',
                      velocity: 0.3,
                    },
                  ],
                })
              );
            };
          }
        }

        return question;
      },
      answerList: allRomanNumeralAnswerList,
    });
  };
}
