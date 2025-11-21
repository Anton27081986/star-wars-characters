import { Routes } from '@angular/router';
import { CharacterListComponent } from './features/characters/pages/character-list/character-list.component';
import { CharacterDetailComponent } from './features/characters/pages/character-detail/character-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: CharacterListComponent,
  },
  {
    path: 'characters/:id',
    component: CharacterDetailComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
