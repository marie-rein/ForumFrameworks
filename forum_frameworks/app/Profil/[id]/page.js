"use client";
import Header from '@/app/Components/header';
import init from '@/app/common/init';
import { signOut } from "firebase/auth";
import { getStorage, ref, listAll, uploadBytes, getDownloadURL, getMetadata } from "firebase/storage";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react';
import { use } from 'react'; 

function Profil({ params }) {
    const { auth } = init();
    const router = useRouter();
    const [imageFiles, setImageFiles] = useState([]);
    const storage = getStorage();
    const [isEditing, setIsEditing] = useState(false);
    const user = auth.currentUser;
    const id = use(params).id;
    const handleEditClick = () => {
        setIsEditing(true);
    };

    useEffect(() => {
        if (!id) {
            router.push('../login');
            return;
        }

        const fetchLatestProfilePicture = async () => {
            try {
                const listRef = ref(storage, `${id}/ProfilePicture`);
                const res = await listAll(listRef);

                if (res.items.length > 0) {
                    // Récupérer les métadonnées et trier par date de création
                    const itemsWithMetadata = await Promise.all(
                        res.items.map(async (itemRef) => {
                            const metadata = await getMetadata(itemRef); // Utilisation correcte de getMetadata
                            return { itemRef, metadata };
                        })
                    );

                    // Trie les fichiers par date de création (plus récent en premier)
                    itemsWithMetadata.sort((a, b) => new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated));

                    // Récupère l'URL de la dernière image
                    const lastImageRef = itemsWithMetadata[0].itemRef;
                    const lastImageURL = await getDownloadURL(lastImageRef);

                    // Met à jour l'état avec l'URL de la dernière image
                    setImageFiles([lastImageURL]);
                }
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchLatestProfilePicture();
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const imageUpdate = e.target.image.files[0];
            if (imageUpdate) {
                // Vérifie si le fichier est une image
                if (!imageUpdate.type.startsWith('image/')) {
                    alert('Veuillez sélectionner un fichier image');
                    return;
                }

                // Upload de l'image
                const refFile = ref(storage, `${id}/ProfilePicture/${imageUpdate.name}`);
                await uploadBytes(refFile, imageUpdate);

                // Recharger la dernière image après l'upload
                const listRef = ref(storage, `${id}/ProfilePicture`);
                const res = await listAll(listRef);

                if (res.items.length > 0) {
                    // Récupérer les métadonnées pour trier les fichiers
                    const itemsWithMetadata = await Promise.all(
                        res.items.map(async (itemRef) => {
                            const metadata = await getMetadata(itemRef);
                            return { itemRef, metadata };
                        })
                    );

                    // Trier par date de création (plus récent en premier)
                    itemsWithMetadata.sort((a, b) => new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated));

                    // Récupérer l'URL de la dernière image
                    const lastImageRef = itemsWithMetadata[0].itemRef;
                    const lastImageURL = await getDownloadURL(lastImageRef);

                    // Mettre à jour l'état avec la dernière image
                    setImageFiles([lastImageURL]);
                }
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating image:', error);
        }
    };

    function logOut(e) {
        e.preventDefault();

        // Déconnexion
        signOut(auth)
            .then(() => {
                console.log("Logged out");
                router.push("../login");
            })
            .catch((error) => {
                console.log(error.message);
            });
    }

    return (
        <>
            <Header />
            <br />
            
            {/* Titre principal centré avec une meilleure mise en forme */}
            <div className="text-center mb-4">
                <h1 className="display-4 text-primary"><u>My Profile</u></h1>
            </div>
    
            {/* Conteneur principal */}
            <div className="container">
                {/* Utilisation d'un Card pour afficher les informations du profil */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        {/* Affichage de l'image de profil avec un style amélioré */}
                        <div className="row mb-3">
                            <div className="col-md-3 text-center">
                                <img 
                                    src={imageFiles.length > 0 ? imageFiles[0] : 'default-profile.png'} 
                                    alt="Profile" 
                                    className="rounded-circle img-fluid border" 
                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                                />
                            </div>
                            <div className="col-md-9">
                                <p className="text-muted">{user.email}</p>
                                
                                {/* Bouton d'édition */}
                                <button className="btn btn-primary" onClick={handleEditClick}>
                                    Edit Profile Picture
                                </button>
                                
                                {/* Formulaire d'édition de la photo de profil */}
                                {isEditing && (
                                    <form onSubmit={handleSubmit} className="mt-3">
                                        <input type="file" name="image" className="form-control" />
                                        <button type="submit" className="btn btn-success mt-2">Update</button>
                                    </form>
                                )}
                            </div>
                        </div>
    
                        {/* Bouton de déconnexion */}
                        <div className="text-center mt-4">
                            <button className="btn btn-danger" onClick={logOut}>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
    

export default Profil;
