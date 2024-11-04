"use client";
import Header from '@/app/Components/header';
import init from '@/app/common/init';
import { signOut } from "firebase/auth";
import { getStorage, ref, listAll, uploadBytes, getDownloadURL, getMetadata } from "firebase/storage";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react';

function Profil({ params }) {
    const { auth } = init();
    const router = useRouter();
    const [imageFiles, setImageFiles] = useState([]);
    const storage = getStorage();
    const [isEditing, setIsEditing] = useState(false);
    const user = auth.currentUser;
    const handleEditClick = () => {
        setIsEditing(true);
    };

    useEffect(() => {
        if (!params.id) {
            router.push('../login');
            return;
        }

        const fetchLatestProfilePicture = async () => {
            try {
                const listRef = ref(storage, `${params.id}/ProfilePicture`);
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
    }, [params.id, router]);

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
                const refFile = ref(storage, `${params.id}/ProfilePicture/${imageUpdate.name}`);
                await uploadBytes(refFile, imageUpdate);

                // Recharger la dernière image après l'upload
                const listRef = ref(storage, `${params.id}/ProfilePicture`);
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
            <center><h1><u><mark>My Profile </mark></u></h1></center>
            <br />

            <div>
                {imageFiles.map((file, i) => (
                    <p key={i} className='text-left'>
                        <b>Profile Picture: </b>
                        <img src={file} alt="Profile" className='rounded-circle' width={70} height={70} /> <span>  </span>
                        <button className='btn btn-primary text-center' onClick={handleEditClick}>
                        Edit
                    </button>
                    {isEditing && (
                        <form onSubmit={handleSubmit}>
                            <input type="file" name="image" />
                            <span>  </span>
                            <button type="submit" className="btn btn-primary btn-block">  Update  </button>
                        </form>
                    )}
                    <br/>
                    <b>Email: </b>{user.email}
                    </p>
                ))}
                <p className='text-left'> 
                <button className='btn btn-primary text-center' onClick={logOut}>Log Out</button>
                </p>
            </div>
            
        </>
    );
}

export default Profil;
