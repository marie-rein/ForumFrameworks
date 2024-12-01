"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import init from '../../common/init';
import { collection, query, getDocs, addDoc , deleteDoc, doc,getDoc, updateDoc} from "firebase/firestore";
import { useState, useEffect } from 'react';
import Headerpublic from '@/app/Components/headerpublic';
import { useParams } from 'next/navigation';
import { onAuthStateChanged } from "firebase/auth";

import Link from 'next/link';
import { serverTimestamp } from "firebase/firestore";

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const params = useParams();
  const { auth, db } = init();

  useEffect(() => {
    if (!params.id) return;

  // logic pour recuperer les topics

    const fetchTopics = async () => {
      try {
        const q = query(collection(db, `Forums/${params.id}/Topics`));
        const querySnapshot = await getDocs(q);

        const topicsData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Inclure l'ID du topic
          ...doc.data(),
        }));

        setTopics(topicsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des topics :", error);
      }
    };

    fetchTopics();
  }, [params.id]); 

  //logic pour ajouter un topic

  useEffect(() => {

    // Surveiller les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
        } else {
            // affiche une alerte si l'utilisateur n'est pas connecté
            setIsEditing(false);
            console.log('You must be logged in to add a topic.'); 
        }
    });

    return () => unsubscribe(); // Nettoyage lors de la fin de l'utilisation
}, [auth]);

  //logic pour le mode d'edition d'un topic et la suppression
const handleEditClick = () => {
  if (user) {
    setIsEditing(true);
    console.log("User is logged in. Editing mode enabled.");
  } else {
    setIsEditing(false);
    alert("You must be logged in to add a topic.");
    console.log("You must be logged in to add a topic.");
  }
};
const updateTopicCount = async (increment) => {
  try {
    // Référence vers le document Forum
    const forumDocRef = doc(db, `Forums/${params.id}`);
    
    // Récupération du document actuel
    const forumDoc = await getDoc(forumDocRef);
    
    if (!forumDoc.exists()) {
      console.error("Forum not found.");
      return;
    }

    // Récupérer la valeur actuelle de TopicCount
    const forumData = forumDoc.data();
    const currentCount = forumData.TopicCount || 0;

    // Calcul de la nouvelle valeur
    const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);

    // Mettre à jour la valeur de TopicCount dans Firestore
    await updateDoc(forumDocRef, { TopicCount: newCount });

    // Mise à jour locale (optionnel)
    setTopics((prevTopics) => prevTopics.map((topic) =>
      topic.id === params.id
        ? { ...topic, TopicCount: newCount }
        : topic
    ));
    
    console.log(`TopicCount updated to ${newCount}`);
  } catch (error) {
    console.error("Error updating TopicCount:", error);
  }
};

//logic pour ajouter un topic
const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
        setError('You must be logged in to add a topic.');
        return;
    }

    const currentUser = auth.currentUser;

    try {
        // Créer une référence vers la collection 'Topics' dans Firebase
        const TopicDocRef = collection(db, `Forums/${params.id}/Topics`);
        
        // Ajouter un nouveau topic dans la collection
        const docRef = await addDoc(TopicDocRef, {
          Title: title,
          Content: content,
          AuthorId: currentUser.email,
          CreatedAt: serverTimestamp(),
          CommentCount: 0,
        });


        const addedDoc = await getDoc(docRef);
        const addedData = addedDoc.data();

    // Créer un nouvel objet topic avec les données retournées
          const newTopic = {
            id: docRef.id, // Utiliser l'ID du document créé
            Title: addedData.Title,
            Content: addedData.Content,
            AuthorId: addedData.AuthorId,
            CreatedAt: addedData.CreatedAt, // Timestamp correct depuis Firebase
            CommentCount: addedData.CommentCount,
          };

        // Mettre à jour la liste des topics automatiquement
        setTopics((prevTopics) => [...prevTopics, newTopic]);
       //fermer le formulaire
        setIsEditing(false);

        updateTopicCount(true);
    } catch (error) {
        setError('Error adding topic: ' + error.message);
    }
};

//logic pour supprimer un topic
const handleDelete = async (topicId) => {
  if (!topicId) return;

  // Vérifier si l'utilisateur est connecté
  if (!auth.currentUser) {
    alert("You must be logged in to delete a topic.");
    return;
  }

  const currentUserEmail = auth.currentUser.email;

  // Demander une confirmation
  const isConfirmed = window.confirm("Are you sure you want to delete this topic?");
  if (!isConfirmed) return;

  try {
    // Référence du document Firestore
    const topicDocRef = doc(db, `Forums/${params.id}/Topics/${topicId}`);

    // Récupérer les données du topic
    const topicDoc = await getDoc(topicDocRef);
    if (!topicDoc.exists()) {
      alert("Topic not found.");
      return;
    }

    const topicData = topicDoc.data();
    
    // Vérifier que l'utilisateur est bien l'auteur
    if (topicData.AuthorId.trim() !== currentUserEmail.trim()) {
     
      alert("You do not have permission to delete this topic.");
      return;
    }
    

    // Supprimer le topic
    await deleteDoc(topicDocRef);

    // Mettre à jour la liste des topics automatiquement
    setTopics((prevTopics) => prevTopics.filter((topic) => topic.id !== topicId));

    alert("Topic deleted successfully!");
    updateTopicCount(false);
  } catch (error) {
    console.error("Error deleting topic:", error);

    if (error.code === "permission-denied") {
      alert("You do not have permission to delete this topic.");
    } else {
      alert("Failed to delete topic. Please try again.");
    }
  }
};

  return (
    <>
   
    <Headerpublic />
    <div className="container mt-4">
      <div className='row'>
        <div className='col-md-6'>
        <button className="btn btn-primary" onClick={handleEditClick}>
        Add new topic
       </button>
        </div>
        <div className='col-md-6'>
          <div className='col-md-5'>
            <input type="text" className="form-control" placeholder="Search..." />
          </div>
          <div className='col-md-1'>
            <button className="btn btn-primary">Search</button>
          </div>
      </div>
          </div>

          {isEditing && (
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
            Add 
           </button>
           <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              Cancel
          </button>
       </form>
       {error && <div className="alert alert-danger mt-3">{error}</div>}
   </div>
         )}



      </div>
    <div className="container mt-4">
      <h1>Topics forforum {params.id}</h1>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Topics</th>
            <th>Author</th>
            <th>Comments</th>
            <th>Created At</th>
      
          </tr>
        </thead>
        <tbody>
          {topics.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">Aucun topic disponible</td>
            </tr>
          ) : (
            topics.map((topic, index) => (
              <tr key={index}>
                <td>
                  <Link href={`/TopicContent/${params.id}/${topic.id}`}>{topic.Title} </Link>
                </td>
                <td>{topic.AuthorId}</td>            
                <td>{topic.CommentCount}</td>
                <td>{topic.CreatedAt && topic.CreatedAt.toDate

            ? topic.CreatedAt.toDate().toLocaleString() // Convertir Timestamp en chaîne lisible
            : "Date inconnue"}</td>   

                  {/* Lien pour modifier le topic */}

            <td> <Link
                href={`/ModifierTopic/${params.id}/${topic.id}`}
                className={user?.email === topic.AuthorId ? "" : "disabled-link"}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/84/84380.png"
                  alt="Edit"
                  style={{ width: "16px", height: "16px" }}
                  className='disabled-link'
                />
              </Link></td>

                  {/* Lien pour supprimer le topic */}
            <td><button
              onClick={() => handleDelete(topic.id)}
              disabled={user?.email !== topic.AuthorId}
            >
             <img
                  src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png"
                  alt="Delete"
                  style={{ width: "16px", height: "16px" }}
                  className='disabled-link'
                />
              </button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      
    </div>
    </>
  );
 
}
