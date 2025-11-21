import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PeopleResponse, Person } from '../models/person_model';

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://swapi.dev/api';

  getPeople(page: number, search: string = ''): Observable<PeopleResponse> {
    const params: Record<string, string> = { page: page.toString() };
    if (search.trim()) {
      params['search'] = search.trim();
    }

    return this.http.get<PeopleResponse>(`${this.baseUrl}/people/`, { params });
  }

  getPersonById(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/people/${id}/`).pipe(
      map((person) => ({
        ...person,
        url: `${this.baseUrl}/people/${id}/`,
      })),
    );
  }

  extractIdFromUrl(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1];
  }
}
