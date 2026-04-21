import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html'
})
export class AdminShellComponent {
  constructor(private session: AuthSessionService, private router: Router) {}

  get currentUser(): any { return this.session.getUser(); }

  logout(): void {
    this.session.clearSession();
    this.router.navigate(['/login']);
  }
}
