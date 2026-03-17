/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.info('Script started successfully');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzem0EcC-LMPAHLsCvA7Y7IaedngGOSYcn0zAvMqB0mCuPXLP-MvXsJfEGCySgtMRZI/exec';
const PING_INTERVAL_MS = 30 * 1000;

let currentPopup: any = undefined;

// Waiting for the API to be ready
WA.onInit().then(() => {
    console.info('Scripting API ready');
    console.info('Player tags: ',WA.player.tags)

    WA.room.area.onEnter('clock').subscribe(() => {
        const today = new Date();
        const time = today.getHours() + ":" + today.getMinutes();
        currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    })

    WA.room.area.onLeave('clock').subscribe(closePopup)

    // --- 在室通知を追加 ---
    const name   = WA.player.name;
    const userId = WA.player.id ?? `name:${name}`;
    const send = (when: string) => navigator.sendBeacon(
        GAS_URL,
        JSON.stringify({ when, id: userId, name, timestamp: String(Date.now()) })
    );

    send('enter');
    let timer = setInterval(() => send('ping'), PING_INTERVAL_MS);
    window.addEventListener('beforeunload', () => {
        clearInterval(timer);
        send('leave');
    });
    
    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.info('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

function closePopup(){
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}

export {};

