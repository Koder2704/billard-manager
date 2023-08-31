import { Injectable } from '@angular/core';
// import { Joueur } from '../joueur';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.generatePlayersList();
    console.log('player number:', this.playerNumber);
  }

  playerList: number[] = [];

  // Le tableau qui contiendra les badges des joueurs quittant la partie.
  deletionPlayerList: number[] = [];
  playerNumber!: number | any;
  player1!: number | any;
  player2!: number | any;
  winner!: number | any;

  generatePlayersList() {
    for (let i = 0; i < this.playerNumber; i++) {
      this.playerList[i] = i + 1;
    }
    return this.playerList;
  }

  async classification(players: number[]) {
    console.log('Winner from service:', this.winner);
    console.log(
      'Winner index from service:',
      this.playerList.indexOf(this.winner)
    );
    console.log([{ 'player 1': this.player1 }, { 'player 2': this.player2 }]);

    if (this.player1 == this.winner) {
      players = this.removePlayer(this.player2);
      players.push(this.player2);
      console.log('Sorted list on player 1 win:', players);
    } else {
      players = this.removePlayer(this.player1);
      players.push(this.player1);
      console.log('Sorted list on player 2 win:', players);
    }

    this.player1 = undefined;
    this.player2 = undefined;
    return players;
  }

  /**
   * @param playerID (optional)
   * If only one player has to be added
   *
   * @param listID
   * If many players have to be added
   */

  addPlayers(listID?: number[], playerID?: number | any) {
    if (listID) {
      // Les elements du tableaux seront TOUJOURS classes par ordre croissant initialement !
      listID.forEach((player: any) => this.playerList.push(player));
    } else {
      this.playerList.push(playerID);
    }
    return this.playerList;
  }

  /**
   * @param playerID
   * If only one player has to be removed
   *
   * @param listID
   * If many players have to be removed
   */

  removePlayer(playerID: number) {
    const index = this.playerList.indexOf(playerID);
    if (index !== -1) {
      this.playerList.splice(index, 1);
    }
    return this.playerList;
  }

  removeManyPlayers(listIDs: number[]) {
    listIDs.forEach((pID: number) => {
      this.removePlayer(pID);
    });
    return listIDs;
  }
}
