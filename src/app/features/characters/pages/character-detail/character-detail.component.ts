import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SwapiService } from '@core/services/swapi.service';
import { CharactersStateService, CharacterOverride } from '@core/services/characters-state.service';
import { Person } from '@core/models/person_model';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss'],
})
export class CharacterDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private swapi = inject(SwapiService);
  private state = inject(CharactersStateService);
  private snackBar = inject(MatSnackBar);
  private id!: string;

  person = signal<Person | null>(null);
  isLoading = signal(false);

  public nameControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  public heightControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  public massControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  public genderControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  public birthYearControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.loadPerson();
  }

  private loadPerson(): void {
    this.isLoading.set(true);

    this.swapi.getPersonById(this.id).subscribe({
      next: (person) => {
        const merged = this.state.withOverrides(this.id, person);
        this.person.set(merged);

        this.nameControl.setValue(merged.name);
        this.heightControl.setValue(merged.height);
        this.massControl.setValue(merged.mass);
        this.genderControl.setValue(merged.gender);
        this.birthYearControl.setValue(merged.birth_year);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка при загрузке персонажа', err);
        this.isLoading.set(false);
      },
    });
  }

  private markAllAsTouched(): void {
    this.nameControl.markAsTouched();
    this.heightControl.markAsTouched();
    this.massControl.markAsTouched();
    this.genderControl.markAsTouched();
    this.birthYearControl.markAsTouched();
  }

  public save(): void {
    const current = this.person();
    if (!current) return;

    this.nameControl.setValue(this.nameControl.value.trim());
    this.heightControl.setValue(this.heightControl.value.trim());
    this.massControl.setValue(this.massControl.value.trim());
    this.genderControl.setValue(this.genderControl.value.trim());
    this.birthYearControl.setValue(this.birthYearControl.value.trim());

    if (
      this.nameControl.invalid ||
      this.heightControl.invalid ||
      this.massControl.invalid ||
      this.genderControl.invalid ||
      this.birthYearControl.invalid
    ) {
      this.markAllAsTouched();
      this.snackBar.open('Заполните все обязательные поля', 'OK', {
        duration: 2000,
      });
      return;
    }

    const override: CharacterOverride = {
      name: this.nameControl.value,
      height: this.heightControl.value,
      mass: this.massControl.value,
      gender: this.genderControl.value,
      birth_year: this.birthYearControl.value,
    };

    this.state.updateCharacter(this.id, override);

    this.person.set({
      ...current,
      ...override,
    });

    this.snackBar.open('Данные персонажа обновлены локально', 'OK', {
      duration: 2000,
    });
  }

  public back(): void {
    void this.router.navigate(['/']);
  }
}
