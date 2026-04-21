import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import { environment } from '../../../../environments/environment';

interface LoginForm {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.page.html'
})
export class LoginPage {
  form: LoginForm = { email: '', password: '' };
  loading = false;
  errorMsg = '';

  constructor(
    private http: HttpClient,
    private session: AuthSessionService,
    private router: Router
  ) {}

  login(): void {
    this.errorMsg = '';
    if (!this.form.email || !this.form.password) {
      this.errorMsg = 'Email dan password wajib diisi.';
      return;
    }
    this.loading = true;
    this.http.post<any>(`${environment.apiBaseUrl}/admin/auth/login`, this.form)
      .subscribe({
        next: (res) => {
          this.session.setSession(res.data.token, res.data.user);
          this.router.navigate(['/members']);
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Login gagal. Periksa email dan password.';
          this.loading = false;
        }
      });
  }
}

