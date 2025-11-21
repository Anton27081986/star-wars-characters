import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SwapiService } from '@core/services/swapi.service';
import { CharactersStateService } from '@core/services/characters-state.service';
import { Person } from '@core/models/person_model';

import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss'],
})
export class CharacterListComponent implements OnInit {
  private swapi = inject(SwapiService);
  private state = inject(CharactersStateService);
  private router = inject(Router);

  people = signal<Person[]>([]);
  isLoading = signal(false);
  total = signal(0);
  pageIndex = signal(0);

  pageSize = 10;

  searchControl = new FormControl<string>('', { nonNullable: true });

  ngOnInit(): void {
    this.loadPage(1, '');

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((search) => {
        this.pageIndex.set(0);
        this.loadPage(1, search ?? '');
      });
  }

  private loadPage(page: number, search: string): void {
    this.isLoading.set(true);

    this.swapi.getPeople(page, search).subscribe({
      next: (response) => {
        this.total.set(response.count);

        const merged = response.results.map((person) =>
          this.state.withOverrides(this.swapi.extractIdFromUrl(person.url), person),
        );

        this.people.set(merged);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка при загрузке списка персонажей', err);
        this.isLoading.set(false);
      },
    });
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    const page = event.pageIndex + 1;
    const search = this.searchControl.value ?? '';
    this.loadPage(page, search);
  }

  public openDetail(person: Person): void {
    const id = this.swapi.extractIdFromUrl(person.url);
    void this.router.navigate(['/characters', id]);
  }
}
