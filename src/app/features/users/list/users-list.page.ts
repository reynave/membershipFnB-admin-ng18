import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './users-list.page.html'
})
export class UsersListPage implements OnInit {
  users: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/admin/users`).subscribe({
      next: (res) => { this.users = res.data || []; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }
}
