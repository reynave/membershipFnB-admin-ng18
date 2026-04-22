import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AuthSessionService } from '../../../core/services/auth-session.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule],
  templateUrl: './users-list.page.html'
})
export class UsersListPage implements OnInit {
  users: any[] = [];
  loading = false;
  submitting = false;
  deletingId = 0;
  formError = '';
  successMsg = '';
  showForm = false;
  editingUserId = 0;

  form: any = {
    name: '',
    email: '',
    note: '',
    password: ''
  };

  currentUserId = 0;

  constructor(private http: HttpClient, private session: AuthSessionService) {}

  ngOnInit(): void {
    const currentUser = this.session.getUser();
    this.currentUserId = Number(currentUser?.id || 0);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/admin/users`).subscribe({
      next: (res) => {
        this.users = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    this.showForm = true;
    this.editingUserId = 0;
    this.formError = '';
    this.successMsg = '';
    this.form = {
      name: '',
      email: '',
      note: '',
      password: ''
    };
  }

  openEdit(user: any): void {
    this.showForm = true;
    this.editingUserId = Number(user.id);
    this.formError = '';
    this.successMsg = '';
    this.form = {
      name: user.name || '',
      email: user.email || '',
      note: user.note || '',
      password: ''
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.submitting = false;
    this.formError = '';
  }

  saveUser(): void {
    const payload: any = {
      name: String(this.form.name || '').trim(),
      email: String(this.form.email || '').trim(),
      note: String(this.form.note || '').trim()
    };

    if (!payload.name || !payload.email) {
      this.formError = 'Name and email are required.';
      return;
    }

    if (!this.editingUserId && !String(this.form.password || '').trim()) {
      this.formError = 'Password is required for new user.';
      return;
    }

    if (String(this.form.password || '').trim()) {
      payload.password = String(this.form.password).trim();
    }

    this.submitting = true;
    this.formError = '';
    this.successMsg = '';

    const request$ = this.editingUserId
      ? this.http.put<any>(`${environment.apiBaseUrl}/admin/users/${this.editingUserId}`, payload)
      : this.http.post<any>(`${environment.apiBaseUrl}/admin/users`, payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.showForm = false;
        this.successMsg = this.editingUserId ? 'User updated.' : 'User created.';
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.formError = err?.error?.message || 'Failed to save user.';
      }
    });
  }

  canDelete(user: any): boolean {
    if (!user) {
      return false;
    }

    if (Number(user.id) === this.currentUserId) {
      return false;
    }

    return Number(user.isLock) !== 1;
  }

  removeUser(user: any): void {
    if (!this.canDelete(user)) {
      this.formError = Number(user.id) === this.currentUserId
        ? 'You cannot delete your own account.'
        : 'Master user cannot be deleted.';
      return;
    }

    const confirmed = window.confirm(`Delete user ${user.name}?`);

    if (!confirmed) {
      return;
    }

    this.deletingId = Number(user.id);
    this.formError = '';
    this.successMsg = '';

    this.http.delete<any>(`${environment.apiBaseUrl}/admin/users/${user.id}`).subscribe({
      next: () => {
        this.deletingId = 0;
        this.successMsg = 'User deleted.';
        this.load();
      },
      error: (err) => {
        this.deletingId = 0;
        this.formError = err?.error?.message || 'Failed to delete user.';
      }
    });
  }
}
