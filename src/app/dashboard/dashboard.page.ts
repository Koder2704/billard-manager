import { Component, OnInit, ViewChild } from '@angular/core';
import { ManagerService } from '../services/manager.service';
import {
  AlertController,
  IonPopover,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  @ViewChild('popover') popover!: IonPopover;
  
  constructor(
    private joueurService: ManagerService,
    private alertController: AlertController,
    public router: Router,
    private loadingController: LoadingController,
    private toast: ToastController
  ) {}

  playerNumber = this.joueurService.playerNumber;
  playerList = this.joueurService.generatePlayersList();
  status = 'playing...';
  selectionMode = false;
  deletionList: number[] = [];

  ngOnInit(): void {
    console.log({
      'Players number': this.playerNumber,
      'Players List': this.playerList,
    });
    this.deletionList = this.joueurService.deletionPlayerList;
  }

  removePlayer(badgeID: number) {
    this.joueurService.removePlayer(badgeID);
  }

  removeManyPlayers() {
    this.joueurService.removeManyPlayers(this.deletionList);
  }

  toggleSelectionMode() {
    this.popover.dismiss();
    this.selectionMode = !this.selectionMode;
  }

  async addPlayerFromMenu() {
    await this.popover.dismiss();
    (
      await this.alertController.create({
        header: 'Nouveau Joueur',
        message: 'Entrez le numero de son badge',
        inputs: [
          {
            type: 'tel',
            name: 'newPlayer',
            placeholder: 'badge ID',
          },
        ],
        buttons: [
          {
            text: 'Ajouter',
            handler: (playerID) => {
              this.joueurService.addPlayers([Number(playerID.newPlayer)]);
            },
          },
          {
            text: 'Annuler',
            role: 'cancel'
          }
        ],
      })
    ).present();
  }

  makePlayerSelection(event: any, pID: number) {
    console.log(event.target.value);

    if (this.deletionList.includes(pID)) {
      const index = this.deletionList.indexOf(pID);
      if (index !== -1) {
        this.deletionList.splice(index, 1);
      }
    } else {
      this.deletionList.push(pID);
    }
    console.log('Deletion list:', this.deletionList);
    return this.deletionList;
  }

  async startGame() {
    await this.popover.dismiss();
    const onPlayerOnBoardBox = await this.alertController.create({
      header: 'Qui sont adversaires ?',
      message: 'Numéros de badges uniquement !',
      inputs: [
        {
          type: 'tel',
          name: 'joueur1',
          value: 1,
        },
        {
          type: 'tel',
          name: 'joueur2',
          value: 2,
        },
      ],

      buttons: [
        {
          text: 'Valider',
          role: 'confirm',
          handler: async (onBoardPlayers) => {
            console.log(onBoardPlayers);
            if (onBoardPlayers.joueur1 === onBoardPlayers.joueur2) {
              const onSameBadgeBox = await this.alertController.create({
                header:
                  "Impossible que le meme joueur s'affronte lui-même ! Rectifiez les numéros.",
                buttons: [
                  {
                    text: 'Compris',
                    role: 'cancel',
                  },
                ],
              });
              onSameBadgeBox.present();
              // onPlayerOnBoardBox.present();
            } else {
              this.joueurService.player1 = Number(onBoardPlayers.joueur1);
              this.joueurService.player2 = Number(onBoardPlayers.joueur2);

              console.log('Players ID:', [
                this.joueurService.player1,
                this.joueurService.player2,
              ]);
            }
          },
        },
        {
          text: 'Annuler',
          role: 'cancel',
        },
      ],
    });
    onPlayerOnBoardBox.present();
  }

  // END PARTY:
  async endParty() {
    await this.popover.dismiss();
    (await this.alertController.create({
      header: "Vous quittez vraiment ?",
      buttons: [
        {
          text: 'Oui',
          handler: async () => {
            this.joueurService.winner = undefined;
            this.joueurService.player1 = undefined;
            this.joueurService.player2 = undefined;
            this.joueurService.playerList = [];
            this.joueurService.playerNumber = undefined;
        
            (
              await this.loadingController.create({
                duration: 1500,
                message: 'Fermeture...',
                spinner: 'crescent',
              })
            )
              .present()
              .then(() => {
                this.router.navigate(['home']);
              });
          }
        },
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    })).present();
  }

  async designWinner() {
    await this.popover.dismiss();
    // Designation du vainqueur:
    const onWinnerBox = await this.alertController.create({
      header: 'Qui est le vainqueur ?',
      inputs: [
        {
          type: 'tel',
          name: 'winner',
          placeholder: 'Badge Joueur',
        },
      ],

      buttons: [
        {
          text: 'Valider',
          role: 'confirm',
          handler: async (winnerID) => {
            console.log(winnerID);

            this.joueurService.winner = Number(winnerID.winner);

            console.log('Winner ID:', this.joueurService.winner);

            // Classification automatique:
            this.joueurService.classification(this.playerList);

            // Nouveau joueur:
            let cpt = 1; // Variable: Quantieme nouveau joueur ?
            const onNewPlayerBox = await this.alertController.create({
              header: 'Nouveau joueur ?',
              inputs: [
                {
                  type: 'tel',
                  name: 'newPlayer',
                  placeholder: 'Badge du nouveau Joueur',
                },
              ],

              buttons: [
                {
                  text: 'Valider',
                  role: 'confirm',

                  //  Ajout des nouveaux joueurs:
                  handler: async (newPlayerID) => {
                    console.log(newPlayerID);
                    this.joueurService.playerList.push(
                      Number(newPlayerID.newPlayer)
                    );
                    console.log(
                      'New player added!',
                      this.joueurService.playerList
                    );

                    console.log('Winner ID:', this.joueurService.winner);

                    const onOtherNewPlayer = await this.alertController.create({
                      header: 'Ajouter un autre nouveau joueur ?',
                      buttons: [
                        {
                          text: 'Non',
                          role: 'cancel',
                        },

                        // Confirmation d ajout de nouveau joueur:
                        {
                          text: 'Oui',
                          handler: async () => {
                            cpt++;
                            const onAddAgainNewPlayer =
                              await this.alertController.create({
                                header: `Nouveau joueur N°${cpt}`,
                                inputs: [
                                  {
                                    type: 'tel',
                                    name: 'otherNewPlayer',
                                    placeholder: `Badge du nouveau joueur N°${cpt}`,
                                  },
                                ],

                                buttons: [
                                  {
                                    text: 'Annuler',
                                    role: 'cancel',
                                  },
                                  {
                                    text: 'Ajouter',
                                    handler: async (otherNewPlayerID) => {
                                      console.log(
                                        `Other new player N ${cpt}`,
                                        parseInt(otherNewPlayerID)
                                      );

                                      this.joueurService.playerList.push(
                                        Number(otherNewPlayerID.otherNewPlayer)
                                      );
                                      console.log(
                                        'List updated on new player added!',
                                        this.joueurService.playerList
                                      );

                                      // Encore nouveau joueur ?
                                      cpt++;
                                      const onOtherAddAgainNewPlayer =
                                        await this.alertController.create({
                                          header: `Nouveau joueur N°${cpt}`,
                                          message:
                                            'Numéros de badges uniquement !',
                                          inputs: [
                                            {
                                              type: 'tel',
                                              name: 'otherNewPlayer2',
                                              placeholder: `Badge du nouveau joueur N°${cpt}`,
                                            },
                                          ],

                                          buttons: [
                                            {
                                              text: 'Annuler',
                                              role: 'cancel',
                                            },
                                            {
                                              text: 'Ajouter',
                                              handler: (otherNewPlayer2ID) => {
                                                console.log(otherNewPlayer2ID);
                                                this.playerList.push(
                                                  Number(
                                                    otherNewPlayer2ID.otherNewPlayer2
                                                  )
                                                );

                                                console.log(
                                                  'List updated again on new player:',
                                                  this.playerList
                                                );
                                              },
                                            },
                                          ],
                                        });
                                      onOtherAddAgainNewPlayer.present();
                                    },
                                  },
                                ],
                              });
                            onAddAgainNewPlayer.present();
                          },
                        },
                      ],
                    });
                    onOtherNewPlayer.present();
                  },
                },
                {
                  text: 'Annuler',
                  // Joueur qui quittent la partie:
                  handler: async () => {
                    const onLeaving = await this.alertController.create({
                      header: 'Qui quitte la partie ?',
                      inputs: [
                        {
                          type: 'tel',
                          name: 'leavingPlayer',
                          placeholder: 'badge du partant',
                        },
                      ],

                      buttons: [
                        {
                          text: 'Confirmer',
                          handler: async (leavingPlayerID) => {
                            const onConfirmLeaving =
                              await this.alertController.create({
                                header: `Confirmez-vous le depart du joueur ${leavingPlayerID.leavingPlayer} ?`,
                                buttons: [
                                  {
                                    text: 'Oui',
                                    handler: async () => {
                                      this.removePlayer(
                                        Number(leavingPlayerID.leavingPlayer)
                                      );

                                      (
                                        await this.toast.create({
                                          message: `Joueur ${leavingPlayerID.leavingPlayer} quitte la partie`,
                                          color: 'success',
                                          duration: 1500,
                                          position: 'top',
                                        })
                                      ).present();
                                    },
                                  },
                                  {
                                    text: 'Non',
                                    role: 'cancel',
                                  },
                                ],
                              });
                            onConfirmLeaving.present();
                          },
                        },
                        {
                          text: 'Personne',
                          role: 'cancel',
                        },
                      ],
                    });
                    onLeaving.present();
                  },
                },
              ],
            });
            onNewPlayerBox.present();
          },
        },
        {
          text: 'Annuler',
          role: 'cancel',
        },
      ],
    });
    onWinnerBox.present();
  }
}
