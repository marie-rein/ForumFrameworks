"use client";  // Cette ligne force le composant à être interprété côté client
import init from '../common/init';
import Header from '../Components/header';
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Headerpublic from '../Components/headerpublic';

function Accueil() {
    const { auth } = init();
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Pour Surveiller les changements d'état d'authentification
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // Rediriger si l'utilisateur n'est pas connecté
                router.push('../login');
            }
        });

        return () => unsubscribe(); // Nettoyage lors de la fin de l'utilisation
    }, [auth, router]);

    return (
        <>
            <Headerpublic />
            <br />
            <center><h1><u><mark>My Tasks</mark></u></h1></center>
        </>
    );
}

export default Accueil;
