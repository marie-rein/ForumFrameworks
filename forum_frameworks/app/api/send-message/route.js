import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import {getMessaging} from 'firebase-admin/messaging'
import serviceAccount from '../keys.json';

export async function POST(request){
    //obtention du message à partir du corps de la requête
    const {message, userEmail} = await request.json()

    //rajoute l'obtention du topic

    if(getApps().length == 0) {
        //initialisation de l'application grace au service account si elle n est pas déjà fait
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        })
    }

    const data = {
        //les données à envoyer
        data: {
            message: message,
            userEmail: userEmail
        },
        //le sujet auquel envoyer les données
        topic: 'Commentaires'
    }

    try{
        const response = await getMessaging().send(data)
        return new Response(`Successfully sent message: ${response}`)
    } catch(error){
        return new Response(`Error sending message: ${error}`)
    }

}