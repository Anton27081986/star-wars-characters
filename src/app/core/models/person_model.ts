export interface Person {
  name: string;
  url: string;
  height: string;
  mass: string;
  gender: string;
  birth_year: string;
}

export interface PeopleResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Person[];
}
