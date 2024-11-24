"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import init from '../common/init'; 
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

export default function AddTopics() {
    const { db, auth } = init();
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [dateCreated, setDateCreated] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Surveiller les changements d'état d'authentification
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!auth.currentUser) {
            setError('You must be logged in to add a topic.');
            return;
        }

        const currentUser = auth.currentUser;

        try {
            // Créer une référence vers la collection 'Topics' dans Firebase
            const TopicDocRef = collection(db, `Forums/${currentUser.uid}/Topics`);
            
            // Ajouter un nouveau topic dans la collection
            const docRef = await addDoc(TopicDocRef, {
                Title: title,
                Content: content,
                AuthorId: currentUser.uid,
                CreatedAt: new Date(),
                // Optionnel : Vous pouvez ajouter d'autres champs ici, comme UpdatedAt, Replies, etc.
            });

            // Rediriger vers la page du topic nouvellement créé
            router.push(`/Forums/${currentUser.uid}/Topics/${docRef.id}`);
        } catch (error) {
            setError('Error adding topic: ' + error.message);
        }
    };

    return (
        <div className="container mt-4">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="Title">Titre</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="Content">Contenu</label>
                    <textarea
                        className="form-control"
                        id="content"
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                 Add topic
                </button>
            </form>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
}
