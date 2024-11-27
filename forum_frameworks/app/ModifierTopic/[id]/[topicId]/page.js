"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Headerpublic from '@/app/Components/headerpublic';
import init from '@/app/common/init';
import { doc, getDoc, updateDoc,collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from 'next/navigation';
import { serverTimestamp } from "firebase/firestore";


export default function ModifTopicForm() {
    const router = useRouter();
    const { db, auth } = init();
    const [user, setUser] = useState(null);
    const params = useParams();
    const forumId = params.id;
    const topicId = params.topicId;
    const [topic, setTopic] = useState({
        Title: '',
        Content: ''
    });

    useEffect(() => {

        // Surveiller les changements d'état d'authentification
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // affiche une alerte si l'utilisateur n'est pas connecté
                console.log('You must be logged in to update a topic.'); 
            }
        });
    
        return () => unsubscribe(); // Nettoyage lors de la fin de l'utilisation
    }, [auth]);

    
    useEffect(() => {
        if (!user) return;

        async function fetchTopic() {
            try {
                const docRef = doc(db, `Forums/${forumId}/Topics/${topicId}`); // Correction ici
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setTopic(docSnap.data());
                } else {
                    console.log('No such document');
                }
            } catch (error) {
                console.error('Error fetching topic:', error);
            }
        }

        fetchTopic();
    }, [forumId, topicId, db, user]);

    const handleChange = (event) => {
        const { name, value } = event.target; 
        setTopic(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Mettre à jour le document Firebase
            await updateDoc(doc(db, `Forums/${forumId}/Topics/${topicId}`), {  
                Title: topic.Title,
                Content: topic.Content,
                CreatedAt: serverTimestamp(),  // A revoir si besoin
            });

            alert('Topic mise à jour avec succès.');
            router.push(`../../Topics/${forumId}`);
        } catch (error) {
            console.error('Error updating topic:', error);
            alert('Erreur lors de la mise à jour du topic.');
        }
    };

    return (
        <>
            <Headerpublic />
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card border-0 bg-light shadow">
                            <div className="card-body p-5">
                                <h2 className="card-title text-center mb-4">Update a Topic</h2>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group">
                                            <label htmlFor="name">Title of the Topic</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="title"
                                                name="Title" 
                                                value={topic.Title}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="content">Content</label>
                                            <textarea
                                                className="form-control"
                                                id="content"
                                                name="Content"  
                                                value={topic.Content}
                                                onChange={handleChange}
                                                required
                                            ></textarea>
                                        </div>                
                                        <button type="submit" className="btn btn-primary btn-block">Update</button>
                                    </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
