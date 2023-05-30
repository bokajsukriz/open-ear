import { Component } from '@angular/core';
import { Chord } from '../../../utility/music/chords';
import { OneOrMany } from '../../../../shared/ts-utility';
import { NoteNumberOrName } from '../../../utility/music/notes/NoteNumberOrName';
import { NoteEvent } from '../../../../services/player.service';
import Exercise from '../../../exercise-logic';
import { chordTypeConfigMap } from '../../../utility/music/chords/Chord/ChordType';
import { chordTypeAnswerList } from '../chordTypeInKeyExercise';
import { mod } from '../../../../shared/ts-utility/mod';
import { InfoPanelComponent } from '../../../../shared/components/shared-components/info-panel/info-panel.component';
import { IonicModule } from '@ionic/angular';
import { PlayOnClickDirective } from '../../../../shared/components/shared-components/play-on-click.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chord-type-in-key-explanation',
  templateUrl: './chord-type-in-key-explanation.component.html',
  standalone: true,
  imports: [
    CommonModule,
    InfoPanelComponent,
    IonicModule,
    PlayOnClickDirective,
  ],
})
export class ChordTypeInKeyExplanationComponent {
  chords: {
    displayName: string;
    notesInC: string[];
    toPlay: OneOrMany<OneOrMany<NoteNumberOrName> | NoteEvent>;
  }[] = Exercise.flatAnswerList(chordTypeAnswerList).map((chordType) => {
    const chordInC = new Chord({
      type: chordType,
      root: 'C',
    });
    return {
      displayName: chordTypeConfigMap[chordType].displayName,
      notesInC: [
        'C',
        ...chordTypeConfigMap[chordType].scaleDegreeList.map((scaleDegree) => {
          const regexMatch = scaleDegree.match(/([b#]+)?([1-9])/);
          if (!regexMatch) {
            throw new Error(`ScaleDegree ${scaleDegree} does not match regex`);
          }
          const diatonicNote: string = String.fromCharCode(
            'A'.charCodeAt(0) + mod(+regexMatch[2] + 1, 7)
          );
          return diatonicNote + (regexMatch[1] ?? '');
        }),
      ],
      toPlay: {
        notes: chordInC.getVoicing({
          topVoicesInversion: 0,
        }),
        velocity: 0.3,
        duration: '1n',
      },
    };
  });
}
