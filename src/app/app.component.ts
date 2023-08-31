import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private plt: Platform, private router: Router) {
    this.plt.ready().then(() => {
      this.router.navigate(['home']);
    });
  }
}
