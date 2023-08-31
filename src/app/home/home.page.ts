import { Component } from '@angular/core';
import { ManagerService } from '../services/manager.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(
    private joueurService: ManagerService,
    private router: Router,
    private alertController: AlertController
  ) {
    console.log({
      'Players number': this.playerNumber,
      'Players List': this.playerList,
    });
  }

  playerNumber = this.joueurService.playerNumber;
  playerList = this.joueurService.playerList;
  status = 'playing...';

  async newGame() {
    const onPlayerNumberBox = await this.alertController.create({
      header: 'Combien de joueur ?',
      inputs: [
        {
          type: 'tel',
          name: 'playerNumber',
          placeholder: '0',
        },
      ],

      buttons: [
        {
          text: 'Valider',
          role: 'confirm',
          handler: async (playerNumberData) => {
            console.log(playerNumberData);

            if (playerNumberData.playerNumber == 0 || playerNumberData.playerNumber == '') {
              (await this.alertController.create({
                header: 'Aucun Joueur',
                message: "Impossible d'avoir une partie avec 0 joueurs !",
                buttons: [{ text: 'Fermer'}]
              })).present();
            } else {
              this.joueurService.playerNumber = playerNumberData.playerNumber;
              console.log(this.joueurService.playerNumber);

              this.router.navigateByUrl('dashboard');
            }
          },
        },
        {
          text: 'Annuler',
          role: 'cancel',
        },
      ],
    });
    
    onPlayerNumberBox.present();
    // const result = onPlayerNumberBox.onDidDismiss();
    // console.log(result)
  }
}
